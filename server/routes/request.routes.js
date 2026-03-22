const express = require('express');
const { BloodRequest, User, DonorProfile, Notification, Hospital } = require('../models');
const { protect, authorize } = require('../middleware/auth');
const { asyncHandler } = require('../middleware/errorHandler');
const { bloodRequestValidation, paginationValidation } = require('../middleware/validators');
const { CAN_RECEIVE_FROM, NOTIFICATION_TYPES } = require('../config/constants');
const { requestCreationRateLimiter } = require('../middleware/security');

const router = express.Router();

// @route   POST /api/requests
// @desc    Create a new blood request
// @access  Private (Receiver, Hospital)
router.post('/', protect, authorize('receiver', 'hospital', 'admin'), requestCreationRateLimiter, bloodRequestValidation, asyncHandler(async (req, res) => {
  const {
    patientInfo,
    bloodGroup,
    bloodComponent,
    unitsRequired,
    urgency,
    hospital,
    hospitalName,
    hospitalAddress,
    location,
    contactName,
    contactPhone,
    alternatePhone,
    requiredBy,
    medicalNotes,
    prescriptions,
    isEmergencyBroadcast,
    broadcastRadius
  } = req.body;

  const request = await BloodRequest.create({
    requester: req.user.id,
    patientInfo,
    bloodGroup,
    bloodComponent,
    unitsRequired,
    urgency,
    hospital,
    hospitalName,
    hospitalAddress,
    location,
    contactName,
    contactPhone,
    alternatePhone,
    requiredBy: new Date(requiredBy),
    medicalNotes,
    prescriptions,
    isEmergencyBroadcast,
    broadcastRadius,
    statusHistory: [{
      status: 'pending',
      changedBy: req.user.id,
      notes: 'Request created'
    }]
  });

  // If emergency broadcast, notify nearby compatible donors
  if (isEmergencyBroadcast || urgency === 'emergency' || urgency === 'critical') {
    await broadcastToNearbyDonors(request, req.io);
  }

  // Emit socket event for real-time updates
  if (req.io) {
    req.io.emit('new_blood_request', {
      requestId: request._id,
      bloodGroup,
      urgency,
      city: location?.city || hospitalAddress
    });
  }

  res.status(201).json({
    success: true,
    message: 'Blood request created successfully',
    request
  });
}));

// @route   GET /api/requests
// @desc    Get all requests (filtered by role)
// @access  Private
router.get('/', protect, paginationValidation, asyncHandler(async (req, res) => {
  const {
    page = 1,
    limit = 10,
    status,
    bloodGroup,
    urgency,
    hospital,
    sortBy = 'createdAt',
    sortOrder = 'desc'
  } = req.query;

  // Build query based on role
  let query = {};

  if (req.user.role === 'receiver') {
    query.requester = req.user.id;
  } else if (req.user.role === 'hospital') {
    const hospitalDoc = await Hospital.findOne({ user: req.user.id });
    if (hospitalDoc) {
      query.hospital = hospitalDoc._id;
    }
  } else if (req.user.role === 'donor') {
    // Donors see requests matching their blood group
    const donorProfile = await DonorProfile.findOne({ user: req.user.id });
    if (donorProfile) {
      const compatibleGroups = Object.entries(CAN_RECEIVE_FROM)
        .filter(([_, donors]) => donors.includes(donorProfile.bloodGroup))
        .map(([recipient]) => recipient);
      query.bloodGroup = { $in: compatibleGroups };
      query.status = { $in: ['pending', 'approved', 'in_progress'] };
    }
  }
  // Admin sees all

  // Apply filters
  if (status) query.status = status;
  if (bloodGroup) query.bloodGroup = bloodGroup;
  if (urgency) query.urgency = urgency;
  if (hospital && req.user.role === 'admin') query.hospital = hospital;

  const sort = { [sortBy]: sortOrder === 'desc' ? -1 : 1 };

  const requests = await BloodRequest.find(query)
    .populate('requester', 'firstName lastName phone')
    .populate('hospital', 'name address phone')
    .populate('matchedDonors.donor', 'firstName lastName phone')
    .sort(sort)
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

// @route   GET /api/requests/stats
// @desc    Get request statistics
// @access  Private
router.get('/stats', protect, asyncHandler(async (req, res) => {
  let matchQuery = {};

  if (req.user.role === 'receiver') {
    matchQuery.requester = req.user._id;
  } else if (req.user.role === 'hospital') {
    const hospitalDoc = await Hospital.findOne({ user: req.user.id });
    if (hospitalDoc) matchQuery.hospital = hospitalDoc._id;
  }

  const stats = await BloodRequest.aggregate([
    { $match: matchQuery },
    {
      $group: {
        _id: '$status',
        count: { $sum: 1 },
        totalUnits: { $sum: '$unitsRequired' }
      }
    }
  ]);

  const byUrgency = await BloodRequest.aggregate([
    { $match: matchQuery },
    {
      $group: {
        _id: '$urgency',
        count: { $sum: 1 }
      }
    }
  ]);

  const byBloodGroup = await BloodRequest.aggregate([
    { $match: matchQuery },
    {
      $group: {
        _id: '$bloodGroup',
        count: { $sum: 1 },
        totalUnits: { $sum: '$unitsRequired' }
      }
    }
  ]);

  // Monthly trend
  const monthlyTrend = await BloodRequest.aggregate([
    { $match: matchQuery },
    {
      $group: {
        _id: {
          year: { $year: '$createdAt' },
          month: { $month: '$createdAt' }
        },
        count: { $sum: 1 },
        fulfilled: {
          $sum: { $cond: [{ $eq: ['$status', 'fulfilled'] }, 1, 0] }
        }
      }
    },
    { $sort: { '_id.year': -1, '_id.month': -1 } },
    { $limit: 12 }
  ]);

  res.json({
    success: true,
    stats: {
      byStatus: stats,
      byUrgency,
      byBloodGroup,
      monthlyTrend
    }
  });
}));

// @route   GET /api/requests/emergency
// @desc    Get emergency requests
// @access  Private
router.get('/emergency', protect, asyncHandler(async (req, res) => {
  const requests = await BloodRequest.find({
    urgency: { $in: ['emergency', 'critical'] },
    status: { $in: ['pending', 'approved', 'in_progress'] }
  })
    .populate('requester', 'firstName lastName phone')
    .populate('hospital', 'name address phone')
    .sort({ priorityScore: -1, createdAt: -1 })
    .limit(20);

  res.json({
    success: true,
    count: requests.length,
    requests
  });
}));

// @route   GET /api/requests/:id
// @desc    Get request by ID
// @access  Private
router.get('/:id', protect, asyncHandler(async (req, res) => {
  const request = await BloodRequest.findById(req.params.id)
    .populate('requester', 'firstName lastName phone email')
    .populate('hospital', 'name address phone email')
    .populate('matchedDonors.donor', 'firstName lastName phone')
    .populate('approvedBy', 'firstName lastName')
    .populate('statusHistory.changedBy', 'firstName lastName');

  if (!request) {
    return res.status(404).json({
      success: false,
      message: 'Request not found'
    });
  }

  const access = await canUserAccessRequest(request, req.user);
  if (!access.allowed) {
    return res.status(403).json({
      success: false,
      message: access.message
    });
  }

  // Increment view count
  request.viewCount += 1;
  await request.save({ validateBeforeSave: false });

  res.json({
    success: true,
    request
  });
}));

// @route   PUT /api/requests/:id/status
// @desc    Update request status
// @access  Private (Hospital, Admin)
router.put('/:id/status', protect, authorize('hospital', 'admin'), asyncHandler(async (req, res) => {
  const { status, notes } = req.body;

  const request = await BloodRequest.findById(req.params.id);

  if (!request) {
    return res.status(404).json({
      success: false,
      message: 'Request not found'
    });
  }

  if (req.user.role === 'hospital') {
    const hospitalDoc = await Hospital.findOne({ user: req.user.id });
    if (!hospitalDoc || request.hospital?.toString() !== hospitalDoc._id.toString()) {
      return res.status(403).json({
        success: false,
        message: 'You can only update requests linked to your hospital'
      });
    }
  }

  const oldStatus = request.status;
  request.status = status;
  
  // Add to history
  request.statusHistory.push({
    status,
    changedBy: req.user.id,
    notes
  });

  // Update timestamps
  if (status === 'approved') {
    request.approvedAt = new Date();
    request.approvedBy = req.user.id;
  } else if (status === 'fulfilled') {
    request.fulfilledAt = new Date();
  } else if (status === 'cancelled') {
    request.cancelledAt = new Date();
    request.cancellationReason = notes;
  }

  await request.save();

  // Create notification for requester
  await Notification.create({
    recipient: request.requester,
    type: status === 'approved' ? NOTIFICATION_TYPES.REQUEST_APPROVED : 
          status === 'fulfilled' ? NOTIFICATION_TYPES.REQUEST_FULFILLED : 'account_update',
    title: `Request ${status.charAt(0).toUpperCase() + status.slice(1)}`,
    message: `Your blood request for ${request.bloodGroup} has been ${status}`,
    relatedTo: { model: 'BloodRequest', id: request._id },
    actionUrl: `/requests/${request._id}`
  });

  // Emit socket event
  if (req.io) {
    req.io.to(request.requester.toString()).emit('request_status_update', {
      requestId: request._id,
      oldStatus,
      newStatus: status
    });

    req.io.to(`request_${request._id}`).emit('request_updated', {
      requestId: request._id,
      type: 'status_changed',
      oldStatus,
      newStatus: status
    });
  }

  res.json({
    success: true,
    request
  });
}));

// @route   POST /api/requests/:id/respond
// @desc    Donor responds to a request
// @access  Private (Donor)
router.post('/:id/respond', protect, authorize('donor'), asyncHandler(async (req, res) => {
  const { accept } = req.body;

  const request = await BloodRequest.findById(req.params.id);

  if (!request) {
    return res.status(404).json({
      success: false,
      message: 'Request not found'
    });
  }

  if (!['pending', 'approved', 'in_progress', 'partially_fulfilled'].includes(request.status)) {
    return res.status(400).json({
      success: false,
      message: 'This request is no longer open for donor responses'
    });
  }

  const donorProfile = await DonorProfile.findOne({ user: req.user.id });

  if (!donorProfile) {
    return res.status(400).json({
      success: false,
      message: 'Please complete your donor profile first'
    });
  }

  // Check if donor can donate to this blood group
  const compatibleDonors = CAN_RECEIVE_FROM[request.bloodGroup] || [];
  if (!compatibleDonors.includes(donorProfile.bloodGroup)) {
    return res.status(400).json({
      success: false,
      message: 'Your blood group is not compatible with this request'
    });
  }

  // Check if already responded
  const existingResponse = request.matchedDonors.find(
    d => d.donor.toString() === req.user.id
  );

  if (existingResponse) {
    existingResponse.status = accept ? 'accepted' : 'declined';
    existingResponse.respondedAt = new Date();
  } else {
    request.matchedDonors.push({
      donor: req.user.id,
      donorProfile: donorProfile._id,
      status: accept ? 'accepted' : 'declined',
      notifiedAt: new Date(),
      respondedAt: new Date()
    });
  }

  request.responseCount += 1;
  await request.save();

  // Notify requester
  if (accept) {
    await Notification.create({
      recipient: request.requester,
      type: NOTIFICATION_TYPES.DONOR_MATCHED,
      title: 'Donor Accepted',
      message: `A donor has accepted your blood request for ${request.bloodGroup}`,
      relatedTo: { model: 'BloodRequest', id: request._id },
      actionUrl: `/requests/${request._id}`
    });

    // Socket notification
    if (req.io) {
      req.io.to(request.requester.toString()).emit('donor_response', {
        requestId: request._id,
        donorAccepted: true
      });

      req.io.to(`request_${request._id}`).emit('request_updated', {
        requestId: request._id,
        type: 'donor_response',
        donorAccepted: true
      });
    }
  }

  res.json({
    success: true,
    message: accept ? 'You have accepted the request' : 'You have declined the request'
  });
}));

// @route   DELETE /api/requests/:id
// @desc    Cancel/Delete a request
// @access  Private
router.delete('/:id', protect, asyncHandler(async (req, res) => {
  const request = await BloodRequest.findById(req.params.id);

  if (!request) {
    return res.status(404).json({
      success: false,
      message: 'Request not found'
    });
  }

  // Only requester or admin can delete
  if (request.requester.toString() !== req.user.id && req.user.role !== 'admin') {
    return res.status(403).json({
      success: false,
      message: 'Not authorized to delete this request'
    });
  }

  // Soft delete - mark as cancelled
  request.status = 'cancelled';
  request.cancelledAt = new Date();
  request.cancellationReason = req.body.reason || 'Cancelled by user';
  request.statusHistory.push({
    status: 'cancelled',
    changedBy: req.user.id,
    notes: req.body.reason
  });

  await request.save();

  if (req.io) {
    req.io.to(`request_${request._id}`).emit('request_updated', {
      requestId: request._id,
      type: 'cancelled',
      newStatus: request.status
    });
  }

  res.json({
    success: true,
    message: 'Request cancelled successfully'
  });
}));

// Helper function to broadcast to nearby donors
async function broadcastToNearbyDonors(request, io) {
  const compatibleGroups = CAN_RECEIVE_FROM[request.bloodGroup] || [];
  
  // Find eligible donors
  const eligibleDonors = await DonorProfile.find({
    bloodGroup: { $in: compatibleGroups },
    isAvailable: true,
    isVerified: true,
    nextEligibleDate: { $lte: new Date() }
  }).populate('user');

  // Filter by location if available
  let donorsToNotify = eligibleDonors;
  
  if (request.location?.coordinates && request.location.coordinates[0] !== 0) {
    const nearbyUsers = await User.find({
      location: {
        $near: {
          $geometry: {
            type: 'Point',
            coordinates: request.location.coordinates
          },
          $maxDistance: (request.broadcastRadius || 50) * 1000
        }
      },
      role: 'donor'
    }).select('_id');

    const nearbyUserIds = nearbyUsers.map(u => u._id.toString());
    donorsToNotify = eligibleDonors.filter(d => 
      nearbyUserIds.includes(d.user._id.toString())
    );
  }

  // Create notifications
  const notifications = donorsToNotify.map(donor => ({
    recipient: donor.user._id,
    type: NOTIFICATION_TYPES.EMERGENCY_ALERT,
    priority: 'urgent',
    title: `Emergency Blood Request - ${request.bloodGroup}`,
    message: `Urgent: ${request.unitsRequired} units of ${request.bloodGroup} needed at ${request.hospitalName || 'nearby hospital'}`,
    relatedTo: { model: 'BloodRequest', id: request._id },
    actionUrl: `/requests/${request._id}`
  }));

  await Notification.insertMany(notifications);

  // Update broadcast info
  request.broadcastSentAt = new Date();
  request.broadcastReach = donorsToNotify.length;
  await request.save({ validateBeforeSave: false });

  // Socket broadcast
  if (io) {
    donorsToNotify.forEach(donor => {
      io.to(donor.user._id.toString()).emit('emergency_alert', {
        requestId: request._id,
        bloodGroup: request.bloodGroup,
        urgency: request.urgency,
        message: `Emergency: ${request.bloodGroup} blood needed urgently!`
      });
    });
  }

  return donorsToNotify.length;
}

async function canUserAccessRequest(request, user) {
  if (user.role === 'admin') {
    return { allowed: true };
  }

  if (user.role === 'receiver' && request.requester.toString() === user.id) {
    return { allowed: true };
  }

  if (user.role === 'hospital') {
    const hospitalDoc = await Hospital.findOne({ user: user.id });
    const requestHospitalId = request?.hospital?._id
      ? request.hospital._id.toString()
      : request?.hospital?.toString?.();

    if (hospitalDoc && requestHospitalId === hospitalDoc._id.toString()) {
      return { allowed: true };
    }
    return { allowed: false, message: 'Not authorized to view this request' };
  }

  if (user.role === 'donor') {
    const donorProfile = await DonorProfile.findOne({ user: user.id }).select('bloodGroup');
    if (!donorProfile) {
      return { allowed: false, message: 'Complete donor profile to access request details' };
    }

    const compatibleDonors = CAN_RECEIVE_FROM[request.bloodGroup] || [];
    if (!compatibleDonors.includes(donorProfile.bloodGroup)) {
      return { allowed: false, message: 'Request is not compatible with your blood group' };
    }

    return { allowed: true };
  }

  return { allowed: false, message: 'Not authorized to view this request' };
}

module.exports = router;
