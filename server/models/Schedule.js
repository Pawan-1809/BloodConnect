const mongoose = require('mongoose');

const scheduleSchema = new mongoose.Schema({
  // Type
  type: {
    type: String,
    enum: ['donation_appointment', 'blood_drive', 'camp', 'mobile_collection'],
    required: true
  },
  
  // Title & Description
  title: {
    type: String,
    required: true
  },
  description: String,
  
  // Organizer
  organizer: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  
  hospital: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Hospital'
  },
  
  // Location
  venue: {
    name: String,
    address: String,
    city: String,
    state: String
  },
  
  location: {
    type: { type: String, enum: ['Point'], default: 'Point' },
    coordinates: { type: [Number], default: [0, 0] }
  },
  
  // Timing
  date: {
    type: Date,
    required: true
  },
  
  startTime: {
    type: String,
    required: true
  },
  
  endTime: {
    type: String,
    required: true
  },
  
  duration: Number, // in minutes
  
  // Recurring
  isRecurring: { type: Boolean, default: false },
  recurringPattern: {
    type: String,
    enum: ['daily', 'weekly', 'bi-weekly', 'monthly']
  },
  recurringEndDate: Date,
  
  // Slots (for appointments)
  totalSlots: { type: Number, default: 50 },
  availableSlots: { type: Number, default: 50 },
  slotDuration: { type: Number, default: 30 }, // minutes
  
  slots: [{
    time: String,
    capacity: { type: Number, default: 2 },
    booked: { type: Number, default: 0 },
    participants: [{
      user: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
      bookedAt: { type: Date, default: Date.now },
      status: {
        type: String,
        enum: ['confirmed', 'cancelled', 'completed', 'no_show'],
        default: 'confirmed'
      }
    }]
  }],
  
  // Participants (for blood drives/camps)
  registeredDonors: [{
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    registeredAt: { type: Date, default: Date.now },
    status: {
      type: String,
      enum: ['registered', 'confirmed', 'cancelled', 'attended', 'no_show'],
      default: 'registered'
    },
    checkInTime: Date,
    donation: { type: mongoose.Schema.Types.ObjectId, ref: 'Donation' }
  }],
  
  // Target
  targetUnits: { type: Number, default: 100 },
  collectedUnits: { type: Number, default: 0 },
  
  // Status
  status: {
    type: String,
    enum: ['draft', 'published', 'ongoing', 'completed', 'cancelled'],
    default: 'draft'
  },
  
  // Visibility
  isPublic: { type: Boolean, default: true },
  
  // Eligibility
  eligibleBloodGroups: {
    type: [String],
    default: ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-']
  },
  
  // Requirements
  requirements: [String],
  
  // Images
  bannerImage: String,
  images: [String],
  
  // Contact
  contactPerson: {
    name: String,
    phone: String,
    email: String
  },
  
  // Notifications
  remindersSent: {
    oneDay: { type: Boolean, default: false },
    oneHour: { type: Boolean, default: false }
  },
  
  // Analytics
  views: { type: Number, default: 0 },
  shares: { type: Number, default: 0 },
  
  // Notes
  notes: String,
  adminNotes: String
}, {
  timestamps: true
});

// Indexes
scheduleSchema.index({ date: 1 });
scheduleSchema.index({ status: 1 });
scheduleSchema.index({ hospital: 1 });
scheduleSchema.index({ location: '2dsphere' });
scheduleSchema.index({ type: 1 });

// Update available slots
scheduleSchema.methods.updateAvailableSlots = function() {
  let booked = 0;
  this.slots.forEach(slot => {
    booked += slot.booked;
  });
  this.availableSlots = this.totalSlots - booked;
};

module.exports = mongoose.model('Schedule', scheduleSchema);
