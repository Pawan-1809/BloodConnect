const express = require('express');
const { Hospital, BloodStock, User, BloodRequest, Donation, Notification, DonorProfile } = require('../models');
const { protect, authorize } = require('../middleware/auth');
const { asyncHandler } = require('../middleware/errorHandler');
const { hospitalValidation, paginationValidation } = require('../middleware/validators');
const { BLOOD_GROUPS, NOTIFICATION_TYPES } = require('../config/constants');

const router = express.Router();

// @route   POST /api/hospitals/register
// @desc    Register hospital profile
// @access  Private (Hospital)
router.post('/register', protect, authorize('hospital'), hospitalValidation, asyncHandler(async (req, res) => {
  const existingHospital = await Hospital.findOne({ user: req.user.id });

  if (existingHospital) {
    return res.status(400).json({
      success: false,
      message: 'Hospital profile already exists'
    });
  }

  const hospital = await Hospital.create({
    user: req.user.id,
    ...req.body
  });

  // Initialize blood stock for all blood groups
  const stockPromises = BLOOD_GROUPS.map(bloodGroup => 
    BloodStock.create({
      hospital: hospital._id,
      bloodGroup,
      component: 'whole_blood'
    })
  );

  await Promise.all(stockPromises);

  res.status(201).json({
    success: true,
    message: 'Hospital registered successfully',
    hospital
  });
}));

// @route   GET /api/hospitals
// @desc    Get all hospitals
// @access  Public
router.get('/', paginationValidation, asyncHandler(async (req, res) => {
  const {
    page = 1,
    limit = 20,
    city,
    type,
    hasBloodBank,
    verified,
    lat,
    lng,
    radius = 50
  } = req.query;

  let query = { isActive: true };

  if (city) query['address.city'] = new RegExp(city, 'i');
  if (type) query.type = type;
  if (hasBloodBank === 'true') query.hasBloodBank = true;
  if (verified === 'true') query.isVerified = true;

  let hospitals;

  if (lat && lng) {
    hospitals = await Hospital.find({
      ...query,
      location: {
        $near: {
          $geometry: {
            type: 'Point',
            coordinates: [parseFloat(lng), parseFloat(lat)]
          },
          $maxDistance: parseFloat(radius) * 1000
        }
      }
    })
      .skip((page - 1) * limit)
      .limit(parseInt(limit));
  } else {
    hospitals = await Hospital.find(query)
      .skip((page - 1) * limit)
      .limit(parseInt(limit));
  }

  const total = await Hospital.countDocuments(query);

  res.json({
    success: true,
    count: hospitals.length,
    total,
    page: parseInt(page),
    pages: Math.ceil(total / limit),
    hospitals
  });
}));

// @route   GET /api/hospitals/my-hospital
// @desc    Get my hospital profile
// @access  Private (Hospital)
router.get('/my-hospital', protect, authorize('hospital'), asyncHandler(async (req, res) => {
  const hospital = await Hospital.findOne({ user: req.user.id });

  if (!hospital) {
    return res.status(404).json({
      success: false,
      message: 'Hospital profile not found. Please complete registration.'
    });
  }

  res.json({
    success: true,
    hospital
  });
}));

// @route   PUT /api/hospitals/my-hospital
// @desc    Update my hospital profile
// @access  Private (Hospital)
router.put('/my-hospital', protect, authorize('hospital'), asyncHandler(async (req, res) => {
  let hospital = await Hospital.findOne({ user: req.user.id });

  if (!hospital) {
    return res.status(404).json({
      success: false,
      message: 'Hospital profile not found'
    });
  }

  const allowedUpdates = [
    'name', 'phone', 'emergencyPhone', 'website', 'address', 'location',
    'operatingHours', 'is24Hours', 'facilities', 'servicesOffered',
    'bloodBankIncharge', 'images', 'logo'
  ];

  const updates = {};
  allowedUpdates.forEach(field => {
    if (req.body[field] !== undefined) {
      updates[field] = req.body[field];
    }
  });

  hospital = await Hospital.findByIdAndUpdate(
    hospital._id,
    updates,
    { new: true, runValidators: true }
  );

  res.json({
    success: true,
    hospital
  });
}));

// @route   GET /api/hospitals/:id/stock
// @desc    Get hospital blood stock
// @access  Public
router.get('/:id/stock', asyncHandler(async (req, res) => {
  const stocks = await BloodStock.find({ hospital: req.params.id })
    .select('bloodGroup component totalUnits availableUnits status');

  const hospital = await Hospital.findById(req.params.id)
    .select('name address');

  if (!hospital) {
    return res.status(404).json({
      success: false,
      message: 'Hospital not found'
    });
  }

  res.json({
    success: true,
    hospital: {
      id: hospital._id,
      name: hospital.name,
      address: hospital.address
    },
    stocks
  });
}));

// @route   PUT /api/hospitals/stock
// @desc    Update blood stock
// @access  Private (Hospital)
router.put('/stock', protect, authorize('hospital'), asyncHandler(async (req, res) => {
  const { bloodGroup, component = 'whole_blood', action, units, unitDetails } = req.body;

  const hospital = await Hospital.findOne({ user: req.user.id });

  if (!hospital) {
    return res.status(404).json({
      success: false,
      message: 'Hospital not found'
    });
  }

  let stock = await BloodStock.findOne({
    hospital: hospital._id,
    bloodGroup,
    component
  });

  if (!stock) {
    stock = await BloodStock.create({
      hospital: hospital._id,
      bloodGroup,
      component
    });
  }

  // Handle different actions
  if (action === 'add' && unitDetails) {
    // Add new unit
    stock.units.push(unitDetails);
  } else if (action === 'issue' && unitDetails?.unitId) {
    // Issue unit
    const unitIndex = stock.units.findIndex(u => u.unitId === unitDetails.unitId);
    if (unitIndex !== -1) {
      stock.units[unitIndex].status = 'issued';
      stock.units[unitIndex].issuedTo = unitDetails.issuedTo;
    }
  } else if (action === 'update_threshold') {
    stock.minThreshold = units?.min || stock.minThreshold;
    stock.criticalThreshold = units?.critical || stock.criticalThreshold;
  }

  await stock.save();

  // Check for low stock alert
  if (stock.status === 'critical' || stock.status === 'low') {
    // Emit socket alert
    if (req.io) {
      req.io.emit('stock_alert', {
        hospitalId: hospital._id,
        hospitalName: hospital.name,
        bloodGroup,
        status: stock.status,
        availableUnits: stock.availableUnits
      });
    }
  }

  res.json({
    success: true,
    stock
  });
}));

// @route   GET /api/hospitals/stock/overview
// @desc    Get stock overview for my hospital
// @access  Private (Hospital)
router.get('/stock/overview', protect, authorize('hospital'), asyncHandler(async (req, res) => {
  const hospital = await Hospital.findOne({ user: req.user.id });

  if (!hospital) {
    return res.status(404).json({
      success: false,
      message: 'Hospital not found'
    });
  }

  const stocks = await BloodStock.find({ hospital: hospital._id });

  // Calculate totals
  const overview = {
    totalUnits: 0,
    availableUnits: 0,
    reservedUnits: 0,
    criticalCount: 0,
    lowCount: 0,
    byBloodGroup: {}
  };

  stocks.forEach(stock => {
    overview.totalUnits += stock.totalUnits;
    overview.availableUnits += stock.availableUnits;
    overview.reservedUnits += stock.reservedUnits;
    
    if (stock.status === 'critical') overview.criticalCount++;
    if (stock.status === 'low') overview.lowCount++;

    overview.byBloodGroup[stock.bloodGroup] = {
      available: stock.availableUnits,
      reserved: stock.reservedUnits,
      status: stock.status
    };
  });

  // Get expiring soon units
  const threeDaysFromNow = new Date();
  threeDaysFromNow.setDate(threeDaysFromNow.getDate() + 3);

  const expiringSoon = await BloodStock.aggregate([
    { $match: { hospital: hospital._id } },
    { $unwind: '$units' },
    {
      $match: {
        'units.expiryDate': { $lte: threeDaysFromNow },
        'units.status': 'available'
      }
    },
    {
      $group: {
        _id: '$bloodGroup',
        count: { $sum: 1 }
      }
    }
  ]);

  res.json({
    success: true,
    overview,
    expiringSoon,
    stocks
  });
}));

// @route   GET /api/hospitals/requests
// @desc    Get requests assigned to my hospital
// @access  Private (Hospital)
router.get('/requests', protect, authorize('hospital'), paginationValidation, asyncHandler(async (req, res) => {
  const { page = 1, limit = 10, status, urgency } = req.query;

  const hospital = await Hospital.findOne({ user: req.user.id }).select('_id');

  if (!hospital) {
    return res.status(404).json({
      success: false,
      message: 'Hospital not found'
    });
  }

  const query = { hospital: hospital._id };
  if (status) query.status = status;
  if (urgency) query.urgency = urgency;

  const requests = await BloodRequest.find(query)
    .populate('requester', 'firstName lastName phone')
    .sort({ createdAt: -1 })
    .skip((page - 1) * limit)
    .limit(parseInt(limit, 10));

  const total = await BloodRequest.countDocuments(query);

  res.json({
    success: true,
    count: requests.length,
    total,
    page: parseInt(page, 10),
    pages: Math.ceil(total / limit),
    requests
  });
}));

// @route   GET /api/hospitals/donations
// @desc    Get donations recorded for my hospital
// @access  Private (Hospital)
router.get('/donations', protect, authorize('hospital'), paginationValidation, asyncHandler(async (req, res) => {
  const { page = 1, limit = 10, status } = req.query;

  const hospital = await Hospital.findOne({ user: req.user.id }).select('_id');

  if (!hospital) {
    return res.status(404).json({
      success: false,
      message: 'Hospital not found'
    });
  }

  const query = { hospital: hospital._id };
  if (status) query.status = status;

  const donations = await Donation.find(query)
    .populate('donor', 'firstName lastName phone')
    .sort({ donationDate: -1 })
    .skip((page - 1) * limit)
    .limit(parseInt(limit, 10));

  const total = await Donation.countDocuments(query);

  res.json({
    success: true,
    count: donations.length,
    total,
    page: parseInt(page, 10),
    pages: Math.ceil(total / limit),
    donations
  });
}));

// @route   POST /api/hospitals/donations
// @desc    Record a donation for my hospital
// @access  Private (Hospital)
router.post('/donations', protect, authorize('hospital'), asyncHandler(async (req, res) => {
  const hospital = await Hospital.findOne({ user: req.user.id }).select('_id name');

  if (!hospital) {
    return res.status(404).json({
      success: false,
      message: 'Hospital not found'
    });
  }

  const {
    donorEmail,
    donorPhone,
    bloodGroup,
    donationType = 'whole_blood',
    donationDate,
    hemoglobin,
    bloodPressure,
    notes,
    status = 'scheduled'
  } = req.body;

  const donor = await User.findOne({
    role: 'donor',
    $or: [{ email: donorEmail?.toLowerCase?.() || donorEmail }, { phone: donorPhone }]
  });

  if (!donor) {
    return res.status(404).json({
      success: false,
      message: 'Registered donor not found. Use the donor email or phone from an existing account.'
    });
  }

  const donorProfile = await DonorProfile.findOne({ user: donor._id }).select('_id');
  if (!donorProfile) {
    return res.status(400).json({
      success: false,
      message: 'This donor has not completed their donor profile yet.'
    });
  }

  const [systolic, diastolic] = String(bloodPressure || '')
    .split('/')
    .map((value) => Number(value?.trim?.() || value));

  const normalizedStatus = ['scheduled', 'screening', 'completed', 'deferred', 'cancelled'].includes(status)
    ? status
    : 'scheduled';
  const donationId = `DON${Date.now()}${Math.random().toString(36).slice(2, 6).toUpperCase()}`;

  const donation = await Donation.create({
    donationId,
    donor: donor._id,
    donorProfile: donorProfile._id,
    hospital: hospital._id,
    bloodGroup,
    donationType,
    donationDate: donationDate ? new Date(donationDate) : new Date(),
    status: normalizedStatus,
    preScreening: {
      hemoglobin: hemoglobin ? Number(hemoglobin) : undefined,
      bloodPressure: Number.isFinite(systolic) && Number.isFinite(diastolic)
        ? { systolic, diastolic }
        : undefined,
      screenedAt: new Date()
    },
    collection: {
      bagNumber: `BAG-${Date.now()}-${Math.random().toString(36).slice(2, 8).toUpperCase()}`
    },
    conductedBy: req.user.id,
    notes,
    statusHistory: [{
      status: normalizedStatus,
      changedBy: req.user.id,
      notes: 'Donation recorded by hospital'
    }]
  });

  const populatedDonation = await Donation.findById(donation._id)
    .populate('donor', 'firstName lastName email phone');

  res.status(201).json({
    success: true,
    donation: populatedDonation
  });
}));

// @route   PUT /api/hospitals/donations/:id
// @desc    Update donation status/details for my hospital
// @access  Private (Hospital)
router.put('/donations/:id', protect, authorize('hospital'), asyncHandler(async (req, res) => {
  const hospital = await Hospital.findOne({ user: req.user.id }).select('_id');

  if (!hospital) {
    return res.status(404).json({
      success: false,
      message: 'Hospital not found'
    });
  }

  const donation = await Donation.findOne({ _id: req.params.id, hospital: hospital._id });

  if (!donation) {
    return res.status(404).json({
      success: false,
      message: 'Donation not found'
    });
  }

  const { status, notes } = req.body;
  const allowedStatuses = ['scheduled', 'screening', 'completed', 'deferred', 'cancelled'];

  if (status && !allowedStatuses.includes(status)) {
    return res.status(400).json({
      success: false,
      message: 'Invalid donation status'
    });
  }

  if (status) {
    donation.status = status;
    donation.statusHistory.push({
      status,
      changedBy: req.user.id,
      notes: notes || `Donation marked ${status}`
    });
  }

  if (notes !== undefined) {
    donation.notes = notes;
  }

  await donation.save();

  const populatedDonation = await Donation.findById(donation._id)
    .populate('donor', 'firstName lastName email phone');

  res.json({
    success: true,
    donation: populatedDonation
  });
}));

// @route   GET /api/hospitals/:id
// @desc    Get hospital by ID
// @access  Public
router.get('/:id', asyncHandler(async (req, res) => {
  const hospital = await Hospital.findById(req.params.id)
    .populate('reviews.user', 'firstName lastName');

  if (!hospital) {
    return res.status(404).json({
      success: false,
      message: 'Hospital not found'
    });
  }

  res.json({
    success: true,
    hospital
  });
}));

// @route   POST /api/hospitals/:id/review
// @desc    Add review for hospital
// @access  Private
router.post('/:id/review', protect, asyncHandler(async (req, res) => {
  const { rating, comment } = req.body;

  const hospital = await Hospital.findById(req.params.id);

  if (!hospital) {
    return res.status(404).json({
      success: false,
      message: 'Hospital not found'
    });
  }

  // Check if user already reviewed
  const existingReview = hospital.reviews.find(
    r => r.user.toString() === req.user.id
  );

  if (existingReview) {
    existingReview.rating = rating;
    existingReview.comment = comment;
  } else {
    hospital.reviews.push({
      user: req.user.id,
      rating,
      comment
    });
  }

  hospital.calculateRating();
  await hospital.save();

  res.json({
    success: true,
    message: 'Review added successfully',
    rating: hospital.rating,
    totalReviews: hospital.totalReviews
  });
}));

// @route   GET /api/hospitals/dashboard/stats
// @desc    Get hospital dashboard statistics
// @access  Private (Hospital)
router.get('/dashboard/stats', protect, authorize('hospital'), asyncHandler(async (req, res) => {
  const hospital = await Hospital.findOne({ user: req.user.id });

  if (!hospital) {
    return res.status(404).json({
      success: false,
      message: 'Hospital not found'
    });
  }

  // Get various stats
  const [
    pendingRequests,
    todayDonations,
    monthlyDonations,
    stockStatus
  ] = await Promise.all([
    BloodRequest.countDocuments({
      hospital: hospital._id,
      status: 'pending'
    }),
    Donation.countDocuments({
      hospital: hospital._id,
      donationDate: {
        $gte: new Date().setHours(0, 0, 0, 0),
        $lt: new Date().setHours(23, 59, 59, 999)
      },
      status: 'completed'
    }),
    Donation.aggregate([
      {
        $match: {
          hospital: hospital._id,
          status: 'completed',
          donationDate: {
            $gte: new Date(new Date().setMonth(new Date().getMonth() - 6))
          }
        }
      },
      {
        $group: {
          _id: {
            year: { $year: '$donationDate' },
            month: { $month: '$donationDate' }
          },
          count: { $sum: 1 }
        }
      },
      { $sort: { '_id.year': 1, '_id.month': 1 } }
    ]),
    BloodStock.find({ hospital: hospital._id })
      .select('bloodGroup availableUnits status')
  ]);

  // Request fulfillment rate
  const fulfillmentStats = await BloodRequest.aggregate([
    { $match: { hospital: hospital._id } },
    {
      $group: {
        _id: null,
        total: { $sum: 1 },
        fulfilled: {
          $sum: { $cond: [{ $eq: ['$status', 'fulfilled'] }, 1, 0] }
        }
      }
    }
  ]);

  const fulfillmentRate = fulfillmentStats[0]
    ? Math.round((fulfillmentStats[0].fulfilled / fulfillmentStats[0].total) * 100)
    : 0;

  res.json({
    success: true,
    stats: {
      pendingRequests,
      todayDonations,
      monthlyDonations,
      stockStatus,
      fulfillmentRate,
      hospitalRating: hospital.rating,
      totalReviews: hospital.totalReviews
    }
  });
}));

module.exports = router;
