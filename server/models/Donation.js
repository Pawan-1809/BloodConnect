const mongoose = require('mongoose');

const donationSchema = new mongoose.Schema({
  // Donation ID
  donationId: {
    type: String,
    required: true,
    unique: true
  },
  
  // Donor Information
  donor: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  donorProfile: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'DonorProfile',
    required: true
  },
  
  // Blood Details
  bloodGroup: {
    type: String,
    required: true,
    enum: ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-']
  },
  
  donationType: {
    type: String,
    enum: ['whole_blood', 'platelets', 'plasma', 'double_red_cells'],
    default: 'whole_blood'
  },
  
  // Linked Request (if any)
  request: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'BloodRequest'
  },
  
  // Collection Details
  hospital: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Hospital',
    required: true
  },
  
  collectionCenter: String,
  
  // Scheduling
  scheduledDate: Date,
  scheduledTime: String,
  
  // Actual Donation
  donationDate: {
    type: Date,
    required: true
  },
  
  startTime: Date,
  endTime: Date,
  duration: Number, // in minutes
  
  // Pre-Donation Screening
  preScreening: {
    bloodPressure: {
      systolic: Number,
      diastolic: Number
    },
    pulse: Number,
    temperature: Number, // in Celsius
    hemoglobin: Number, // g/dL
    weight: Number,
    
    screenedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    screenedAt: Date,
    
    isEligible: { type: Boolean, default: true },
    deferralReason: String
  },
  
  // Collection Details
  collection: {
    bagNumber: { type: String, required: true },
    volumeCollected: { type: Number, default: 450 }, // ml
    anticoagulant: String,
    
    collectedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    
    complications: [{
      type: { type: String, enum: ['vasovagal', 'hematoma', 'nerve_injury', 'other'] },
      description: String,
      severity: { type: String, enum: ['mild', 'moderate', 'severe'] },
      treatment: String
    }],
    
    successfulCollection: { type: Boolean, default: true }
  },
  
  // Post-Donation
  postDonation: {
    restTime: Number, // minutes
    refreshmentsProvided: { type: Boolean, default: true },
    adverseReactions: String,
    donorCondition: { type: String, enum: ['good', 'fair', 'needs_attention'], default: 'good' }
  },
  
  // Status
  status: {
    type: String,
    enum: ['scheduled', 'checked_in', 'screening', 'donating', 'completed', 'deferred', 'cancelled', 'no_show'],
    default: 'scheduled'
  },
  
  // Staff
  conductedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  supervisedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  
  // Certificate
  certificateGenerated: { type: Boolean, default: false },
  certificateUrl: String,
  
  // Points & Rewards
  pointsAwarded: { type: Number, default: 10 },
  badgeAwarded: String,
  
  // Feedback
  donorFeedback: {
    rating: { type: Number, min: 1, max: 5 },
    experience: String,
    suggestions: String,
    wouldDonateAgain: Boolean,
    submittedAt: Date
  },
  
  // Notes
  notes: String,
  
  // Tracking
  statusHistory: [{
    status: String,
    changedAt: { type: Date, default: Date.now },
    changedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    notes: String
  }]
}, {
  timestamps: true
});

// Indexes
donationSchema.index({ donor: 1 });
donationSchema.index({ hospital: 1 });
donationSchema.index({ donationDate: -1 });
donationSchema.index({ status: 1 });
donationSchema.index({ bloodGroup: 1 });
donationSchema.index({ 'collection.bagNumber': 1 });

// Generate donation ID
donationSchema.pre('save', function(next) {
  if (!this.donationId) {
    const date = new Date();
    const year = date.getFullYear().toString().slice(-2);
    const month = (date.getMonth() + 1).toString().padStart(2, '0');
    const random = Math.random().toString(36).substring(2, 8).toUpperCase();
    this.donationId = `DON${year}${month}${random}`;
  }
  next();
});

module.exports = mongoose.model('Donation', donationSchema);
