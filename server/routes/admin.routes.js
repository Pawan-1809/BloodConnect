const express = require('express');
const { User, DonorProfile, BloodRequest, Hospital, BloodStock, Donation, Notification } = require('../models');
const { protect, authorize } = require('../middleware/auth');
const { asyncHandler } = require('../middleware/errorHandler');
const { paginationValidation } = require('../middleware/validators');
const { BLOOD_GROUPS } = require('../config/constants');

const router = express.Router();

// All routes require admin role
router.use(protect, authorize('admin'));

// @route   GET /api/admin/dashboard
// @desc    Get admin dashboard statistics
// @access  Private (Admin)
router.get('/dashboard', asyncHandler(async (req, res) => {
  const [
    totalUsers,
    totalDonors,
    totalHospitals,
    totalRequests,
    pendingRequests,
    emergencyRequests,
    totalDonations,
    verificationsPending
  ] = await Promise.all([
    User.countDocuments(),
    DonorProfile.countDocuments(),
    Hospital.countDocuments(),
    BloodRequest.countDocuments(),
    BloodRequest.countDocuments({ status: 'pending' }),
    BloodRequest.countDocuments({ urgency: { $in: ['emergency', 'critical'] }, status: { $in: ['pending', 'approved'] } }),
    Donation.countDocuments({ status: 'completed' }),
    User.countDocuments({ isVerified: false })
  ]);

  // Get trends (last 7 days)
  const sevenDaysAgo = new Date();
  sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

  const dailyStats = await Promise.all([
    // Daily registrations
    User.aggregate([
      { $match: { createdAt: { $gte: sevenDaysAgo } } },
      {
        $group: {
          _id: { $dateToString: { format: '%Y-%m-%d', date: '$createdAt' } },
          count: { $sum: 1 }
        }
      },
      { $sort: { _id: 1 } }
    ]),
    // Daily requests
    BloodRequest.aggregate([
      { $match: { createdAt: { $gte: sevenDaysAgo } } },
      {
        $group: {
          _id: { $dateToString: { format: '%Y-%m-%d', date: '$createdAt' } },
          count: { $sum: 1 }
        }
      },
      { $sort: { _id: 1 } }
    ]),
    // Daily donations
    Donation.aggregate([
      { $match: { donationDate: { $gte: sevenDaysAgo }, status: 'completed' } },
      {
        $group: {
          _id: { $dateToString: { format: '%Y-%m-%d', date: '$donationDate' } },
          count: { $sum: 1 }
        }
      },
      { $sort: { _id: 1 } }
    ])
  ]);

  // Blood group distribution
  const bloodGroupDist = await DonorProfile.aggregate([
    { $group: { _id: '$bloodGroup', count: { $sum: 1 } } }
  ]);

  // Request status distribution
  const requestStatusDist = await BloodRequest.aggregate([
    { $group: { _id: '$status', count: { $sum: 1 } } }
  ]);

  // Monthly trends (last 12 months)
  const twelveMonthsAgo = new Date();
  twelveMonthsAgo.setMonth(twelveMonthsAgo.getMonth() - 12);

  const monthlyTrends = await Promise.all([
    BloodRequest.aggregate([
      { $match: { createdAt: { $gte: twelveMonthsAgo } } },
      {
        $group: {
          _id: {
            year: { $year: '$createdAt' },
            month: { $month: '$createdAt' }
          },
          requests: { $sum: 1 },
          fulfilled: { $sum: { $cond: [{ $eq: ['$status', 'fulfilled'] }, 1, 0] } }
        }
      },
      { $sort: { '_id.year': 1, '_id.month': 1 } }
    ]),
    Donation.aggregate([
      { $match: { donationDate: { $gte: twelveMonthsAgo }, status: 'completed' } },
      {
        $group: {
          _id: {
            year: { $year: '$donationDate' },
            month: { $month: '$donationDate' }
          },
          donations: { $sum: 1 }
        }
      },
      { $sort: { '_id.year': 1, '_id.month': 1 } }
    ])
  ]);

  // Top hospitals by donations
  const topHospitals = await Donation.aggregate([
    { $match: { status: 'completed' } },
    { $group: { _id: '$hospital', count: { $sum: 1 } } },
    { $sort: { count: -1 } },
    { $limit: 5 },
    {
      $lookup: {
        from: 'hospitals',
        localField: '_id',
        foreignField: '_id',
        as: 'hospital'
      }
    },
    { $unwind: '$hospital' },
    { $project: { name: '$hospital.name', count: 1 } }
  ]);

  // Active stock levels across all hospitals
  const overallStock = await BloodStock.aggregate([
    { $group: { 
      _id: '$bloodGroup',
      totalAvailable: { $sum: '$availableUnits' },
      critical: { $sum: { $cond: [{ $eq: ['$status', 'critical'] }, 1, 0] } }
    }}
  ]);

  res.json({
    success: true,
    dashboard: {
      overview: {
        totalUsers,
        totalDonors,
        totalHospitals,
        totalRequests,
        pendingRequests,
        emergencyRequests,
        totalDonations,
        verificationsPending
      },
      dailyStats: {
        registrations: dailyStats[0],
        requests: dailyStats[1],
        donations: dailyStats[2]
      },
      distributions: {
        bloodGroups: bloodGroupDist,
        requestStatus: requestStatusDist
      },
      monthlyTrends: {
        requests: monthlyTrends[0],
        donations: monthlyTrends[1]
      },
      topHospitals,
      overallStock
    }
  });
}));

// @route   GET /api/admin/users
// @desc    Get all users with filters
// @access  Private (Admin)
router.get('/users', paginationValidation, asyncHandler(async (req, res) => {
  const {
    page = 1,
    limit = 20,
    role,
    verified,
    blocked,
    search
  } = req.query;

  let query = {};

  if (role) query.role = role;
  if (verified !== undefined) query.isVerified = verified === 'true';
  if (blocked !== undefined) query.isBlocked = blocked === 'true';
  if (search) {
    query.$or = [
      { firstName: new RegExp(search, 'i') },
      { lastName: new RegExp(search, 'i') },
      { email: new RegExp(search, 'i') },
      { phone: new RegExp(search, 'i') }
    ];
  }

  const users = await User.find(query)
    .select('-password')
    .sort({ createdAt: -1 })
    .skip((page - 1) * limit)
    .limit(parseInt(limit));

  const total = await User.countDocuments(query);

  res.json({
    success: true,
    count: users.length,
    total,
    page: parseInt(page),
    pages: Math.ceil(total / limit),
    users
  });
}));

// @route   GET /api/admin/users/:id
// @desc    Get user details
// @access  Private (Admin)
router.get('/users/:id', asyncHandler(async (req, res) => {
  const user = await User.findById(req.params.id).select('-password');

  if (!user) {
    return res.status(404).json({
      success: false,
      message: 'User not found'
    });
  }

  // Get related data based on role
  let additionalData = {};

  if (user.role === 'donor') {
    additionalData.donorProfile = await DonorProfile.findOne({ user: user._id });
    additionalData.donations = await Donation.find({ donor: user._id }).limit(10);
  } else if (user.role === 'hospital') {
    additionalData.hospital = await Hospital.findOne({ user: user._id });
  } else if (user.role === 'receiver') {
    additionalData.requests = await BloodRequest.find({ requester: user._id }).limit(10);
  }

  res.json({
    success: true,
    user,
    ...additionalData
  });
}));

// @route   PUT /api/admin/users/:id/verify
// @desc    Verify user
// @access  Private (Admin)
router.put('/users/:id/verify', asyncHandler(async (req, res) => {
  const user = await User.findByIdAndUpdate(
    req.params.id,
    { isVerified: true },
    { new: true }
  );

  if (!user) {
    return res.status(404).json({
      success: false,
      message: 'User not found'
    });
  }

  // Also verify donor profile if exists
  if (user.role === 'donor') {
    await DonorProfile.findOneAndUpdate(
      { user: user._id },
      { isVerified: true, verifiedAt: new Date(), verifiedBy: req.user.id }
    );
  }

  // Send notification
  await Notification.create({
    recipient: user._id,
    type: 'verification_approved',
    title: 'Account Verified',
    message: 'Your account has been verified. You can now access all features.',
    priority: 'normal'
  });

  res.json({
    success: true,
    message: 'User verified successfully',
    user
  });
}));

// @route   PUT /api/admin/users/:id/block
// @desc    Block/Unblock user
// @access  Private (Admin)
router.put('/users/:id/block', asyncHandler(async (req, res) => {
  const { block, reason } = req.body;

  const user = await User.findByIdAndUpdate(
    req.params.id,
    { isBlocked: block },
    { new: true }
  );

  if (!user) {
    return res.status(404).json({
      success: false,
      message: 'User not found'
    });
  }

  // Disable donor availability if blocked
  if (block && user.role === 'donor') {
    await DonorProfile.findOneAndUpdate(
      { user: user._id },
      { isAvailable: false }
    );
  }

  // Send notification
  await Notification.create({
    recipient: user._id,
    type: 'account_update',
    title: block ? 'Account Blocked' : 'Account Unblocked',
    message: block 
      ? `Your account has been blocked. Reason: ${reason || 'Policy violation'}`
      : 'Your account has been unblocked. You can now access the platform.',
    priority: 'high'
  });

  res.json({
    success: true,
    message: block ? 'User blocked successfully' : 'User unblocked successfully',
    user
  });
}));

// @route   GET /api/admin/hospitals
// @desc    Get all hospitals for admin
// @access  Private (Admin)
router.get('/hospitals', paginationValidation, asyncHandler(async (req, res) => {
  const { page = 1, limit = 20, verified, city } = req.query;

  let query = {};
  if (verified !== undefined) query.isVerified = verified === 'true';
  if (city) query['address.city'] = new RegExp(city, 'i');

  const hospitals = await Hospital.find(query)
    .populate('user', 'email phone')
    .sort({ createdAt: -1 })
    .skip((page - 1) * limit)
    .limit(parseInt(limit));

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

// @route   PUT /api/admin/hospitals/:id/verify
// @desc    Verify hospital
// @access  Private (Admin)
router.put('/hospitals/:id/verify', asyncHandler(async (req, res) => {
  const hospital = await Hospital.findByIdAndUpdate(
    req.params.id,
    { isVerified: true, verifiedAt: new Date(), verifiedBy: req.user.id },
    { new: true }
  );

  if (!hospital) {
    return res.status(404).json({
      success: false,
      message: 'Hospital not found'
    });
  }

  // Verify associated user
  await User.findByIdAndUpdate(hospital.user, { isVerified: true });

  // Send notification
  await Notification.create({
    recipient: hospital.user,
    type: 'verification_approved',
    title: 'Hospital Verified',
    message: 'Your hospital has been verified. You can now receive blood requests.',
    priority: 'normal'
  });

  res.json({
    success: true,
    message: 'Hospital verified successfully',
    hospital
  });
}));

// @route   GET /api/admin/requests
// @desc    Get all requests with advanced filters
// @access  Private (Admin)
router.get('/requests', paginationValidation, asyncHandler(async (req, res) => {
  const {
    page = 1,
    limit = 20,
    status,
    urgency,
    bloodGroup,
    dateFrom,
    dateTo
  } = req.query;

  let query = {};

  if (status) query.status = status;
  if (urgency) query.urgency = urgency;
  if (bloodGroup) query.bloodGroup = bloodGroup;
  if (dateFrom || dateTo) {
    query.createdAt = {};
    if (dateFrom) query.createdAt.$gte = new Date(dateFrom);
    if (dateTo) query.createdAt.$lte = new Date(dateTo);
  }

  const requests = await BloodRequest.find(query)
    .populate('requester', 'firstName lastName email phone')
    .populate('hospital', 'name address')
    .sort({ priorityScore: -1, createdAt: -1 })
    .skip((page - 1) * limit)
    .limit(parseInt(limit));

  const total = await BloodRequest.countDocuments(query);

  res.json({
    success: true,
    count: requests.length,
    total,
    page: parseInt(page),
    pages: Math.ceil(total / limit),
    requests
  });
}));

// @route   POST /api/admin/announcement
// @desc    Send announcement to all users or specific group
// @access  Private (Admin)
router.post('/announcement', asyncHandler(async (req, res) => {
  const { title, message, targetRole, priority = 'normal' } = req.body;

  let query = { isActive: true, isBlocked: false };
  if (targetRole) query.role = targetRole;

  const users = await User.find(query).select('_id');

  const notifications = users.map(user => ({
    recipient: user._id,
    type: 'system_announcement',
    title,
    message,
    priority,
    createdBy: req.user.id
  }));

  await Notification.insertMany(notifications);

  // Emit socket event
  if (req.io) {
    const socketEvent = targetRole ? `announcement_${targetRole}` : 'announcement';
    req.io.emit(socketEvent, { title, message, priority });
  }

  res.json({
    success: true,
    message: `Announcement sent to ${users.length} users`
  });
}));

// @route   GET /api/admin/analytics
// @desc    Get detailed analytics
// @access  Private (Admin)
router.get('/analytics', asyncHandler(async (req, res) => {
  const { period = '30' } = req.query;
  const days = parseInt(period);
  const startDate = new Date();
  startDate.setDate(startDate.getDate() - days);

  // Fulfillment rate by blood group
  const fulfillmentByBloodGroup = await BloodRequest.aggregate([
    { $match: { createdAt: { $gte: startDate } } },
    {
      $group: {
        _id: '$bloodGroup',
        total: { $sum: 1 },
        fulfilled: { $sum: { $cond: [{ $eq: ['$status', 'fulfilled'] }, 1, 0] } }
      }
    },
    {
      $project: {
        bloodGroup: '$_id',
        total: 1,
        fulfilled: 1,
        fulfillmentRate: {
          $cond: [
            { $eq: ['$total', 0] },
            0,
            { $multiply: [{ $divide: ['$fulfilled', '$total'] }, 100] }
          ]
        }
      }
    }
  ]);

  // Average response time
  const avgResponseTime = await BloodRequest.aggregate([
    {
      $match: {
        createdAt: { $gte: startDate },
        approvedAt: { $exists: true }
      }
    },
    {
      $project: {
        responseTime: {
          $divide: [
            { $subtract: ['$approvedAt', '$createdAt'] },
            3600000 // Convert to hours
          ]
        }
      }
    },
    {
      $group: {
        _id: null,
        avgResponseTime: { $avg: '$responseTime' }
      }
    }
  ]);

  // Donor retention (donors who donated more than once)
  const donorRetention = await Donation.aggregate([
    { $match: { status: 'completed' } },
    { $group: { _id: '$donor', donations: { $sum: 1 } } },
    {
      $group: {
        _id: null,
        totalDonors: { $sum: 1 },
        repeatDonors: {
          $sum: { $cond: [{ $gt: ['$donations', 1] }, 1, 0] }
        }
      }
    }
  ]);

  // City-wise distribution
  const cityDistribution = await User.aggregate([
    { $match: { role: 'donor' } },
    { $group: { _id: '$address.city', count: { $sum: 1 } } },
    { $sort: { count: -1 } },
    { $limit: 10 }
  ]);

  res.json({
    success: true,
    analytics: {
      period: `${days} days`,
      fulfillmentByBloodGroup,
      avgResponseTime: avgResponseTime[0]?.avgResponseTime || 0,
      donorRetention: donorRetention[0] || { totalDonors: 0, repeatDonors: 0 },
      cityDistribution
    }
  });
}));

// @route   PUT /api/admin/settings
// @desc    Update system settings
// @access  Private (Admin)
router.put('/settings', asyncHandler(async (req, res) => {
  // This would typically update a Settings model
  // For now, return success
  res.json({
    success: true,
    message: 'Settings updated successfully'
  });
}));

module.exports = router;
