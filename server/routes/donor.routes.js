const express = require('express');
const { User, DonorProfile, Donation, Notification } = require('../models');
const { protect, authorize } = require('../middleware/auth');
const { asyncHandler } = require('../middleware/errorHandler');
const { donorProfileValidation, donorSearchValidation, paginationValidation } = require('../middleware/validators');
const { CAN_RECEIVE_FROM, BLOOD_GROUPS } = require('../config/constants');
const { syncDonorProfileStats } = require('../services/donorStatsService');

const router = express.Router();

// @route   POST /api/donors/profile
// @desc    Create or update donor profile
// @access  Private (Donor)
router.post('/profile', protect, authorize('donor'), donorProfileValidation, asyncHandler(async (req, res) => {
  const {
    bloodGroup,
    weight,
    height,
    hemoglobinLevel,
    medicalConditions,
    allergies,
    currentMedications,
    healthDeclaration,
    preferredDonationType,
    willingToTravel,
    maxTravelDistance,
    preferredDonationDays,
    preferredTimeSlots
  } = req.body;

  let donorProfile = await DonorProfile.findOne({ user: req.user.id });

  const profileData = {
    bloodGroup,
    weight,
    height,
    hemoglobinLevel,
    medicalConditions,
    allergies,
    currentMedications,
    healthDeclaration,
    preferredDonationType,
    willingToTravel,
    maxTravelDistance,
    preferredDonationDays,
    preferredTimeSlots
  };

  if (donorProfile) {
    // Update existing profile
    donorProfile = await DonorProfile.findOneAndUpdate(
      { user: req.user.id },
      profileData,
      { new: true, runValidators: true }
    );
  } else {
    // Create new profile
    donorProfile = await DonorProfile.create({
      user: req.user.id,
      ...profileData
    });
  }

  res.json({
    success: true,
    donorProfile
  });
}));

// @route   GET /api/donors/profile
// @desc    Get my donor profile
// @access  Private (Donor)
router.get('/profile', protect, authorize('donor'), asyncHandler(async (req, res) => {
  const donorSnapshot = await syncDonorProfileStats(req.user.id);
  const donorProfile = donorSnapshot?.donorProfile;

  if (!donorProfile) {
    return res.status(404).json({
      success: false,
      message: 'Donor profile not found. Please complete your profile.'
    });
  }

  res.json({
    success: true,
    donorProfile
  });
}));

// @route   GET /api/donors/search
// @desc    Search donors by blood group and location
// @access  Private
router.get('/search', protect, donorSearchValidation, paginationValidation, asyncHandler(async (req, res) => {
  const {
    bloodGroup,
    lat,
    lng,
    radius = 50,
    available = true,
    page = 1,
    limit = 20
  } = req.query;

  // Build query
  const query = {
    isAvailable: available === 'true' || available === true,
    isVerified: true
  };

  // Filter by blood group
  if (bloodGroup) {
    query.bloodGroup = bloodGroup;
  }

  // Get donor profiles
  let donorProfiles;
  let total;

  if (lat && lng) {
    // Geo-spatial search
    const userIds = await User.find({
      location: {
        $near: {
          $geometry: {
            type: 'Point',
            coordinates: [parseFloat(lng), parseFloat(lat)]
          },
          $maxDistance: parseFloat(radius) * 1000 // Convert km to meters
        }
      },
      role: 'donor',
      isActive: true,
      isBlocked: false
    }).select('_id');

    query.user = { $in: userIds.map(u => u._id) };

    donorProfiles = await DonorProfile.find(query)
      .populate('user', 'firstName lastName avatar address location phone')
      .skip((page - 1) * limit)
      .limit(parseInt(limit))
      .lean();

    // Calculate distances
    donorProfiles = donorProfiles.map(donor => {
      if (donor.user?.location?.coordinates) {
        const [donorLng, donorLat] = donor.user.location.coordinates;
        donor.distance = calculateDistance(lat, lng, donorLat, donorLng);
      }
      return donor;
    }).sort((a, b) => (a.distance || Infinity) - (b.distance || Infinity));

    total = await DonorProfile.countDocuments(query);
  } else {
    // Regular search
    donorProfiles = await DonorProfile.find(query)
      .populate('user', 'firstName lastName avatar address location phone')
      .skip((page - 1) * limit)
      .limit(parseInt(limit));

    total = await DonorProfile.countDocuments(query);
  }

  res.json({
    success: true,
    count: donorProfiles.length,
    total,
    page: parseInt(page),
    pages: Math.ceil(total / limit),
    donors: donorProfiles
  });
}));

// @route   GET /api/donors/compatible/:bloodGroup
// @desc    Find compatible donors for a blood group
// @access  Private
router.get('/compatible/:bloodGroup', protect, asyncHandler(async (req, res) => {
  const { bloodGroup } = req.params;
  const { lat, lng, radius = 50, limit = 50 } = req.query;

  if (!BLOOD_GROUPS.includes(bloodGroup)) {
    return res.status(400).json({
      success: false,
      message: 'Invalid blood group'
    });
  }

  // Get compatible blood groups
  const compatibleGroups = CAN_RECEIVE_FROM[bloodGroup] || [];

  const query = {
    bloodGroup: { $in: compatibleGroups },
    isAvailable: true,
    isVerified: true,
    nextEligibleDate: { $lte: new Date() }
  };

  let donors;

  if (lat && lng) {
    const userIds = await User.find({
      location: {
        $near: {
          $geometry: {
            type: 'Point',
            coordinates: [parseFloat(lng), parseFloat(lat)]
          },
          $maxDistance: parseFloat(radius) * 1000
        }
      },
      role: 'donor',
      isActive: true
    }).select('_id');

    query.user = { $in: userIds.map(u => u._id) };
  }

  donors = await DonorProfile.find(query)
    .populate('user', 'firstName lastName avatar address location phone')
    .limit(parseInt(limit));

  res.json({
    success: true,
    requestedBloodGroup: bloodGroup,
    compatibleGroups,
    count: donors.length,
    donors
  });
}));

// @route   PUT /api/donors/availability
// @desc    Toggle donor availability
// @access  Private (Donor)
router.put('/availability', protect, authorize('donor'), asyncHandler(async (req, res) => {
  const { isAvailable } = req.body;

  const donorProfile = await DonorProfile.findOneAndUpdate(
    { user: req.user.id },
    { isAvailable },
    { new: true }
  );

  if (!donorProfile) {
    return res.status(404).json({
      success: false,
      message: 'Donor profile not found'
    });
  }

  // Emit socket event
  if (req.io) {
    req.io.emit('donor_availability_changed', {
      donorId: donorProfile._id,
      bloodGroup: donorProfile.bloodGroup,
      isAvailable
    });
  }

  res.json({
    success: true,
    donorProfile
  });
}));

// @route   GET /api/donors/history
// @desc    Get donation history
// @access  Private (Donor)
router.get('/history', protect, authorize('donor'), asyncHandler(async (req, res) => {
  const { page = 1, limit = 10 } = req.query;
  const donorSnapshot = await syncDonorProfileStats(req.user.id);

  const donations = await Donation.find({ donor: req.user.id })
    .populate('hospital', 'name address')
    .sort({ donationDate: -1 })
    .skip((page - 1) * limit)
    .limit(parseInt(limit));

  const total = await Donation.countDocuments({ donor: req.user.id });

  res.json({
    success: true,
    count: donations.length,
    total,
    page: parseInt(page),
    pages: Math.ceil(total / limit),
    totalDonations: donorSnapshot?.stats?.totalDonations || 0,
    totalLivesSaved: donorSnapshot?.stats?.totalLivesSaved || 0,
    totalPoints: donorSnapshot?.stats?.points || 0,
    donations
  });
}));

// @route   GET /api/donors/stats
// @desc    Get donor statistics
// @access  Private (Donor)
router.get('/stats', protect, authorize('donor'), asyncHandler(async (req, res) => {
  const donorSnapshot = await syncDonorProfileStats(req.user.id);
  const donorProfile = donorSnapshot?.donorProfile;

  if (!donorProfile) {
    return res.status(404).json({
      success: false,
      message: 'Donor profile not found'
    });
  }

  res.json({
    success: true,
    stats: donorSnapshot.stats
  });
}));

// @route   GET /api/donors/check-eligibility
// @desc    Check donor eligibility for next donation
// @access  Private (Donor)
router.get('/check-eligibility', protect, authorize('donor'), asyncHandler(async (req, res) => {
  const donorSnapshot = await syncDonorProfileStats(req.user.id);
  const donorProfile = donorSnapshot?.donorProfile;

  if (!donorProfile) {
    return res.status(404).json({
      success: false,
      message: 'Donor profile not found'
    });
  }

  res.json({
    success: true,
    eligibility: {
      isEligible: donorSnapshot.stats.isEligible,
      daysUntilEligible: donorSnapshot.stats.daysUntilEligible,
      nextEligibleDate: donorSnapshot.stats.nextEligibleDate,
      bloodGroup: donorProfile.bloodGroup,
      isAvailable: donorProfile.isAvailable
    }
  });
}));

// @route   GET /api/donors/:id
// @desc    Get donor by ID (public info)
// @access  Private
router.get('/:id', protect, asyncHandler(async (req, res) => {
  const donorProfile = await DonorProfile.findById(req.params.id)
    .populate('user', 'firstName lastName avatar address');

  if (!donorProfile) {
    return res.status(404).json({
      success: false,
      message: 'Donor not found'
    });
  }

  res.json({
    success: true,
    donor: {
      id: donorProfile._id,
      bloodGroup: donorProfile.bloodGroup,
      isAvailable: donorProfile.isAvailable,
      totalDonations: donorProfile.totalDonations,
      rank: donorProfile.donorRank,
      badges: donorProfile.badges,
      user: {
        firstName: donorProfile.user.firstName,
        lastName: donorProfile.user.lastName,
        avatar: donorProfile.user.avatar,
        city: donorProfile.user.address?.city
      }
    }
  });
}));

// Helper function to calculate distance between two points
function calculateDistance(lat1, lon1, lat2, lon2) {
  const R = 6371; // Earth's radius in km
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLon = (lon2 - lon1) * Math.PI / 180;
  const a = 
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
    Math.sin(dLon / 2) * Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return Math.round(R * c * 10) / 10; // Round to 1 decimal
}

module.exports = router;
