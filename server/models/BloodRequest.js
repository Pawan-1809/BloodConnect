const mongoose = require('mongoose');

const bloodRequestSchema = new mongoose.Schema({
  // Requester Info
  requester: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  
  // Patient Information (if different from requester)
  patientInfo: {
    name: { type: String, required: true },
    age: { type: Number, required: true },
    gender: { type: String, enum: ['male', 'female', 'other'] },
    condition: String,
    hospitalAdmissionId: String
  },
  
  // Blood Requirements
  bloodGroup: {
    type: String,
    required: [true, 'Blood group is required'],
    enum: ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-']
  },
  
  bloodComponent: {
    type: String,
    enum: ['whole_blood', 'packed_red_cells', 'platelets', 'plasma', 'cryoprecipitate'],
    default: 'whole_blood'
  },
  
  unitsRequired: {
    type: Number,
    required: [true, 'Number of units is required'],
    min: 1,
    max: 20
  },
  
  unitsFulfilled: {
    type: Number,
    default: 0
  },
  
  // Urgency Level
  urgency: {
    type: String,
    enum: ['normal', 'urgent', 'critical', 'emergency'],
    default: 'normal'
  },
  
  priorityScore: {
    type: Number,
    default: 0  // Calculated based on urgency, time, etc.
  },
  
  // Hospital/Location
  hospital: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Hospital'
  },
  
  hospitalName: String,
  hospitalAddress: String,
  
  location: {
    type: { type: String, enum: ['Point'], default: 'Point' },
    coordinates: { type: [Number], default: [0, 0] }
  },
  
  // Contact Information
  contactName: { type: String, required: true },
  contactPhone: { type: String, required: true },
  alternatePhone: String,
  
  // Request Status
  status: {
    type: String,
    enum: ['pending', 'approved', 'in_progress', 'partially_fulfilled', 'fulfilled', 'cancelled', 'expired'],
    default: 'pending'
  },
  
  // Timeline
  requiredBy: {
    type: Date,
    required: [true, 'Required date is needed']
  },
  
  approvedAt: Date,
  approvedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  
  fulfilledAt: Date,
  cancelledAt: Date,
  cancellationReason: String,
  
  // Matched Donors
  matchedDonors: [{
    donor: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    donorProfile: { type: mongoose.Schema.Types.ObjectId, ref: 'DonorProfile' },
    status: {
      type: String,
      enum: ['pending', 'accepted', 'declined', 'donated', 'no_response'],
      default: 'pending'
    },
    notifiedAt: Date,
    respondedAt: Date,
    donatedAt: Date,
    unitsProvided: { type: Number, default: 0 }
  }],
  
  // Emergency Broadcast
  isEmergencyBroadcast: { type: Boolean, default: false },
  broadcastRadius: { type: Number, default: 50 }, // km
  broadcastSentAt: Date,
  broadcastReach: { type: Number, default: 0 }, // Number of donors notified
  
  // Additional Notes
  medicalNotes: String,
  adminNotes: String,
  
  // Documents
  prescriptions: [{
    url: String,
    uploadedAt: { type: Date, default: Date.now }
  }],
  
  // Tracking
  statusHistory: [{
    status: String,
    changedAt: { type: Date, default: Date.now },
    changedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    notes: String
  }],
  
  // Analytics
  viewCount: { type: Number, default: 0 },
  responseCount: { type: Number, default: 0 }
}, {
  timestamps: true
});

// Indexes
bloodRequestSchema.index({ status: 1 });
bloodRequestSchema.index({ bloodGroup: 1 });
bloodRequestSchema.index({ urgency: 1 });
bloodRequestSchema.index({ requiredBy: 1 });
bloodRequestSchema.index({ location: '2dsphere' });
bloodRequestSchema.index({ createdAt: -1 });
bloodRequestSchema.index({ hospital: 1 });

// Calculate priority score
bloodRequestSchema.methods.calculatePriority = function() {
  let score = 0;
  
  // Urgency weight
  const urgencyScores = { 'emergency': 100, 'critical': 75, 'urgent': 50, 'normal': 25 };
  score += urgencyScores[this.urgency] || 25;
  
  // Time sensitivity
  const hoursUntilRequired = (this.requiredBy - new Date()) / (1000 * 60 * 60);
  if (hoursUntilRequired <= 6) score += 50;
  else if (hoursUntilRequired <= 24) score += 30;
  else if (hoursUntilRequired <= 48) score += 15;
  
  // Units needed
  if (this.unitsRequired >= 5) score += 20;
  else if (this.unitsRequired >= 3) score += 10;
  
  this.priorityScore = score;
  return score;
};

// Add status to history
bloodRequestSchema.methods.addStatusHistory = function(status, userId, notes = '') {
  this.statusHistory.push({
    status,
    changedBy: userId,
    notes,
    changedAt: new Date()
  });
};

// Pre-save
bloodRequestSchema.pre('save', function(next) {
  this.calculatePriority();
  next();
});

module.exports = mongoose.model('BloodRequest', bloodRequestSchema);
