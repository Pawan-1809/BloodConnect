const express = require('express');
const { Schedule, Hospital, Donation, DonorProfile, Notification, User } = require('../models');
const { protect, authorize } = require('../middleware/auth');
const { asyncHandler } = require('../middleware/errorHandler');
const { paginationValidation } = require('../middleware/validators');
const { NOTIFICATION_TYPES } = require('../config/constants');

const router = express.Router();

// @route   POST /api/schedules
// @desc    Create a new schedule/event
// @access  Private (Hospital, Admin)
router.post('/', protect, authorize('hospital', 'admin'), asyncHandler(async (req, res) => {
  const {
    type,
    title,
    description,
    venue,
    location,
    date,
    startTime,
    endTime,
    totalSlots,
    slotDuration,
    targetUnits,
    eligibleBloodGroups,
    requirements,
    bannerImage,
    contactPerson,
    isPublic
  } = req.body;

  // Get hospital if user is hospital
  let hospitalId = null;
  if (req.user.role === 'hospital') {
    const hospital = await Hospital.findOne({ user: req.user.id });
    if (hospital) hospitalId = hospital._id;
  }

  // Generate time slots if needed
  const slots = [];
  if (type === 'donation_appointment' && totalSlots && slotDuration) {
    const [startHour, startMin] = startTime.split(':').map(Number);
    const [endHour, endMin] = endTime.split(':').map(Number);
    const startMinutes = startHour * 60 + startMin;
    const endMinutes = endHour * 60 + endMin;
    
    for (let time = startMinutes; time < endMinutes; time += slotDuration) {
      const hour = Math.floor(time / 60);
      const min = time % 60;
      slots.push({
        time: `${hour.toString().padStart(2, '0')}:${min.toString().padStart(2, '0')}`,
        capacity: 2,
        booked: 0,
        participants: []
      });
    }
  }

  const schedule = await Schedule.create({
    type,
    title,
    description,
    organizer: req.user.id,
    hospital: hospitalId,
    venue,
    location,
    date: new Date(date),
    startTime,
    endTime,
    totalSlots: slots.length || totalSlots,
    availableSlots: slots.length || totalSlots,
    slotDuration,
    slots,
    targetUnits,
    eligibleBloodGroups,
    requirements,
    bannerImage,
    contactPerson,
    isPublic,
    status: 'published'
  });

  // Emit socket event
  if (req.io && isPublic) {
    req.io.emit('new_schedule', {
      scheduleId: schedule._id,
      type,
      title,
      date
    });
  }

  res.status(201).json({
    success: true,
    schedule
  });
}));

// @route   GET /api/schedules
// @desc    Get all schedules
// @access  Public
router.get('/', paginationValidation, asyncHandler(async (req, res) => {
  const {
    page = 1,
    limit = 20,
    type,
    upcoming = true,
    city,
    lat,
    lng,
    radius = 50
  } = req.query;

  let query = { status: { $in: ['published', 'ongoing'] } };

  if (type) query.type = type;
  if (upcoming === 'true') {
    query.date = { $gte: new Date() };
  }
  if (city) query['venue.city'] = new RegExp(city, 'i');

  let schedules;

  if (lat && lng) {
    schedules = await Schedule.find({
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
      .populate('hospital', 'name address')
      .sort({ date: 1 })
      .skip((page - 1) * limit)
      .limit(parseInt(limit));
  } else {
    schedules = await Schedule.find(query)
      .populate('hospital', 'name address')
      .sort({ date: 1 })
      .skip((page - 1) * limit)
      .limit(parseInt(limit));
  }

  const total = await Schedule.countDocuments(query);

  res.json({
    success: true,
    count: schedules.length,
    total,
    page: parseInt(page),
    pages: Math.ceil(total / limit),
    schedules
  });
}));

// @route   GET /api/schedules/my-schedules
// @desc    Get schedules for hospital
// @access  Private (Hospital)
router.get('/my-schedules', protect, authorize('hospital'), asyncHandler(async (req, res) => {
  const hospital = await Hospital.findOne({ user: req.user.id });

  if (!hospital) {
    return res.status(404).json({
      success: false,
      message: 'Hospital not found'
    });
  }

  const schedules = await Schedule.find({ hospital: hospital._id })
    .sort({ date: -1 });

  res.json({
    success: true,
    count: schedules.length,
    schedules
  });
}));

// @route   GET /api/schedules/my-appointments
// @desc    Get user's appointments (donor)
// @access  Private (Donor)
router.get('/my-appointments', protect, authorize('donor'), asyncHandler(async (req, res) => {
  const schedules = await Schedule.find({
    'slots.participants.user': req.user.id
  }).populate('hospital', 'name address phone');

  // Filter to get only user's bookings
  const appointments = schedules.map(schedule => {
    const userSlot = schedule.slots.find(slot =>
      slot.participants.some(p => p.user.toString() === req.user.id)
    );
    const userParticipant = userSlot?.participants.find(
      p => p.user.toString() === req.user.id
    );

    return {
      scheduleId: schedule._id,
      title: schedule.title,
      type: schedule.type,
      date: schedule.date,
      time: userSlot?.time,
      status: userParticipant?.status,
      hospital: schedule.hospital,
      venue: schedule.venue
    };
  });

  res.json({
    success: true,
    appointments
  });
}));

// @route   GET /api/schedules/:id
// @desc    Get schedule by ID
// @access  Public
router.get('/:id', asyncHandler(async (req, res) => {
  const schedule = await Schedule.findById(req.params.id)
    .populate('hospital', 'name address phone')
    .populate('organizer', 'firstName lastName');

  if (!schedule) {
    return res.status(404).json({
      success: false,
      message: 'Schedule not found'
    });
  }

  // Increment views
  schedule.views += 1;
  await schedule.save({ validateBeforeSave: false });

  res.json({
    success: true,
    schedule
  });
}));

// @route   POST /api/schedules/:id/book
// @desc    Book a slot
// @access  Private (Donor)
router.post('/:id/book', protect, authorize('donor'), asyncHandler(async (req, res) => {
  const { slotTime } = req.body;

  const schedule = await Schedule.findById(req.params.id);

  if (!schedule) {
    return res.status(404).json({
      success: false,
      message: 'Schedule not found'
    });
  }

  // Check if donor is eligible
  const donorProfile = await DonorProfile.findOne({ user: req.user.id });

  if (!donorProfile) {
    return res.status(400).json({
      success: false,
      message: 'Please complete your donor profile first'
    });
  }

  if (!donorProfile.isEligible()) {
    return res.status(400).json({
      success: false,
      message: 'You are not eligible to donate yet. Please check your next eligible date.'
    });
  }

  // Check if blood group is eligible for this event
  if (schedule.eligibleBloodGroups.length > 0 &&
      !schedule.eligibleBloodGroups.includes(donorProfile.bloodGroup)) {
    return res.status(400).json({
      success: false,
      message: 'Your blood group is not eligible for this event'
    });
  }

  // Check if already booked
  const alreadyBooked = schedule.slots.some(slot =>
    slot.participants.some(p => 
      p.user.toString() === req.user.id && p.status !== 'cancelled'
    )
  );

  if (alreadyBooked) {
    return res.status(400).json({
      success: false,
      message: 'You have already booked this event'
    });
  }

  // Find the slot
  const slotIndex = schedule.slots.findIndex(s => s.time === slotTime);

  if (slotIndex === -1) {
    return res.status(400).json({
      success: false,
      message: 'Invalid time slot'
    });
  }

  const slot = schedule.slots[slotIndex];

  // Check availability
  if (slot.booked >= slot.capacity) {
    return res.status(400).json({
      success: false,
      message: 'This slot is fully booked'
    });
  }

  // Book the slot
  slot.participants.push({
    user: req.user.id,
    status: 'confirmed'
  });
  slot.booked += 1;
  schedule.updateAvailableSlots();

  await schedule.save();

  // Create notification
  await Notification.create({
    recipient: req.user.id,
    type: NOTIFICATION_TYPES.DONATION_SCHEDULED,
    title: 'Appointment Confirmed',
    message: `Your donation appointment has been confirmed for ${schedule.date.toLocaleDateString()} at ${slotTime}`,
    relatedTo: { model: 'Schedule', id: schedule._id },
    actionUrl: `/schedules/${schedule._id}`
  });

  res.json({
    success: true,
    message: 'Slot booked successfully',
    booking: {
      date: schedule.date,
      time: slotTime,
      venue: schedule.venue
    }
  });
}));

// @route   PUT /api/schedules/:id/cancel-booking
// @desc    Cancel a booking
// @access  Private (Donor)
router.put('/:id/cancel-booking', protect, authorize('donor'), asyncHandler(async (req, res) => {
  const schedule = await Schedule.findById(req.params.id);

  if (!schedule) {
    return res.status(404).json({
      success: false,
      message: 'Schedule not found'
    });
  }

  // Find user's booking
  let found = false;
  for (const slot of schedule.slots) {
    const participantIndex = slot.participants.findIndex(
      p => p.user.toString() === req.user.id && p.status === 'confirmed'
    );

    if (participantIndex !== -1) {
      slot.participants[participantIndex].status = 'cancelled';
      slot.booked -= 1;
      found = true;
      break;
    }
  }

  if (!found) {
    return res.status(404).json({
      success: false,
      message: 'Booking not found'
    });
  }

  schedule.updateAvailableSlots();
  await schedule.save();

  res.json({
    success: true,
    message: 'Booking cancelled successfully'
  });
}));

// @route   PUT /api/schedules/:id
// @desc    Update schedule
// @access  Private (Hospital, Admin)
router.put('/:id', protect, authorize('hospital', 'admin'), asyncHandler(async (req, res) => {
  let schedule = await Schedule.findById(req.params.id);

  if (!schedule) {
    return res.status(404).json({
      success: false,
      message: 'Schedule not found'
    });
  }

  // Check ownership
  if (req.user.role === 'hospital') {
    const hospital = await Hospital.findOne({ user: req.user.id });
    if (!hospital || schedule.hospital?.toString() !== hospital._id.toString()) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to update this schedule'
      });
    }
  }

  schedule = await Schedule.findByIdAndUpdate(
    req.params.id,
    req.body,
    { new: true, runValidators: true }
  );

  res.json({
    success: true,
    schedule
  });
}));

// @route   DELETE /api/schedules/:id
// @desc    Cancel schedule
// @access  Private (Hospital, Admin)
router.delete('/:id', protect, authorize('hospital', 'admin'), asyncHandler(async (req, res) => {
  const schedule = await Schedule.findById(req.params.id);

  if (!schedule) {
    return res.status(404).json({
      success: false,
      message: 'Schedule not found'
    });
  }

  // Check ownership
  if (req.user.role === 'hospital') {
    const hospital = await Hospital.findOne({ user: req.user.id });
    if (!hospital || schedule.hospital?.toString() !== hospital._id.toString()) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to cancel this schedule'
      });
    }
  }

  schedule.status = 'cancelled';
  await schedule.save();

  // Notify all participants
  const participants = schedule.slots.flatMap(slot =>
    slot.participants.filter(p => p.status === 'confirmed').map(p => p.user)
  );

  const notifications = participants.map(userId => ({
    recipient: userId,
    type: 'account_update',
    title: 'Event Cancelled',
    message: `The event "${schedule.title}" scheduled for ${schedule.date.toLocaleDateString()} has been cancelled.`,
    priority: 'high'
  }));

  await Notification.insertMany(notifications);

  res.json({
    success: true,
    message: 'Schedule cancelled successfully'
  });
}));

module.exports = router;
