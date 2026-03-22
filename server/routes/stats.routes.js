const express = require('express');
const {
  DonorProfile,
  BloodRequest,
  Hospital,
  Donation,
  Schedule
} = require('../models');
const { asyncHandler } = require('../middleware/errorHandler');

const router = express.Router();

const ACTIVE_REQUEST_STATUSES = ['pending', 'approved', 'in_progress', 'partially_fulfilled'];

const buildPublicStats = async () => {
  const now = new Date();
  const startOfToday = new Date(now);
  startOfToday.setHours(0, 0, 0, 0);

  const [
    completedDonations,
    verifiedHospitals,
    activeRequests,
    urgentRequests,
    upcomingDrives,
    donationsToday,
    availableDonorResult
  ] = await Promise.all([
    Donation.countDocuments({ status: 'completed' }),
    Hospital.countDocuments({ isVerified: true, isActive: true }),
    BloodRequest.countDocuments({ status: { $in: ACTIVE_REQUEST_STATUSES } }),
    BloodRequest.countDocuments({
      status: { $in: ACTIVE_REQUEST_STATUSES },
      urgency: { $in: ['critical', 'emergency'] }
    }),
    Schedule.countDocuments({
      isPublic: true,
      status: { $in: ['published', 'ongoing'] },
      date: { $gte: startOfToday }
    }),
    Donation.countDocuments({
      status: 'completed',
      donationDate: { $gte: startOfToday }
    }),
    DonorProfile.aggregate([
      { $match: { isAvailable: true, isVerified: true } },
      {
        $lookup: {
          from: 'users',
          localField: 'user',
          foreignField: '_id',
          as: 'user'
        }
      },
      { $unwind: '$user' },
      {
        $match: {
          'user.isActive': true,
          'user.isBlocked': false
        }
      },
      { $count: 'total' }
    ])
  ]);

  const availableDonors = availableDonorResult[0]?.total || 0;

  return {
    generatedAt: now.toISOString(),
    completedDonations,
    availableDonors,
    verifiedHospitals,
    activeRequests,
    urgentRequests,
    upcomingDrives,
    donationsToday,
    livesImpacted: completedDonations * 3
  };
};

// @route   GET /api/stats/global
// @desc    Public platform-wide stats for the landing page
// @access  Public
router.get('/global', asyncHandler(async (req, res) => {
  const stats = await buildPublicStats();

  res.json({
    success: true,
    stats
  });
}));

// @route   GET /api/stats/live
// @desc    Alias for public live stats summary
// @access  Public
router.get('/live', asyncHandler(async (req, res) => {
  const stats = await buildPublicStats();

  res.json({
    success: true,
    stats
  });
}));

module.exports = router;
