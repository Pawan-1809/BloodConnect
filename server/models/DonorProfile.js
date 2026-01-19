const mongoose = require('mongoose');

const donorProfileSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    unique: true
  },
  
  // Blood Information
  bloodGroup: {
    type: String,
    required: [true, 'Blood group is required'],
    enum: ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-']
  },
  
  // Health Information
  weight: {
    type: Number,
    required: [true, 'Weight is required'],
    min: [45, 'Minimum weight should be 45 kg']
  },
  height: { type: Number }, // in cm
  hemoglobinLevel: { type: Number },
  
  // Medical History
  medicalConditions: [{
    condition: String,
    diagnosed: Date,
    status: { type: String, enum: ['active', 'resolved'] }
  }],
  
  allergies: [String],
  
  currentMedications: [{
    name: String,
    dosage: String,
    startDate: Date
  }],
  
  // Eligibility Questions
  healthDeclaration: {
    hasChronicDisease: { type: Boolean, default: false },
    hasTattooRecently: { type: Boolean, default: false }, // Within 6 months
    hasRecentSurgery: { type: Boolean, default: false }, // Within 6 months
    isPregnant: { type: Boolean, default: false },
    hasSTD: { type: Boolean, default: false },
    hasHepatitis: { type: Boolean, default: false },
    hasHIV: { type: Boolean, default: false },
    usesIntravenousDrugs: { type: Boolean, default: false }
  },
  
  // Donation Status
  isAvailable: { type: Boolean, default: true },
  availabilityAutoDisabled: { type: Boolean, default: false },
  
  lastDonationDate: { type: Date },
  nextEligibleDate: { type: Date },
  
  totalDonations: { type: Number, default: 0 },
  totalLivesSaved: { type: Number, default: 0 },
  
  // Donation Preferences
  preferredDonationType: {
    type: String,
    enum: ['whole_blood', 'platelets', 'plasma', 'double_red_cells'],
    default: 'whole_blood'
  },
  
  willingToTravel: { type: Boolean, default: false },
  maxTravelDistance: { type: Number, default: 10 }, // in km
  
  preferredDonationDays: [{
    type: String,
    enum: ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday']
  }],
  
  preferredTimeSlots: [{
    start: String, // e.g., "09:00"
    end: String    // e.g., "12:00"
  }],
  
  // Achievement & Badges
  badges: [{
    name: String,
    description: String,
    icon: String,
    earnedAt: { type: Date, default: Date.now }
  }],
  
  donorRank: {
    type: String,
    enum: ['bronze', 'silver', 'gold', 'platinum', 'hero'],
    default: 'bronze'
  },
  
  // Points System
  points: { type: Number, default: 0 },
  
  // Verification Status
  isVerified: { type: Boolean, default: false },
  verifiedAt: Date,
  verifiedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  
  // Notes from Admin/Hospital
  adminNotes: [{
    note: String,
    addedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    addedAt: { type: Date, default: Date.now }
  }]
}, {
  timestamps: true
});

// Indexes for efficient queries
donorProfileSchema.index({ bloodGroup: 1 });
donorProfileSchema.index({ isAvailable: 1 });
donorProfileSchema.index({ 'user': 1 });
donorProfileSchema.index({ nextEligibleDate: 1 });

// Calculate next eligible date (56 days after donation for whole blood)
donorProfileSchema.methods.calculateNextEligibleDate = function() {
  if (!this.lastDonationDate) {
    this.nextEligibleDate = new Date();
    return;
  }
  
  const daysGap = {
    'whole_blood': 56,
    'platelets': 7,
    'plasma': 28,
    'double_red_cells': 112
  };
  
  const gap = daysGap[this.preferredDonationType] || 56;
  this.nextEligibleDate = new Date(this.lastDonationDate.getTime() + gap * 24 * 60 * 60 * 1000);
};

// Check if donor is eligible
donorProfileSchema.methods.isEligible = function() {
  if (!this.isAvailable) return false;
  if (!this.nextEligibleDate) return true;
  return new Date() >= this.nextEligibleDate;
};

// Update donor rank based on donations
donorProfileSchema.methods.updateRank = function() {
  const donations = this.totalDonations;
  if (donations >= 50) this.donorRank = 'hero';
  else if (donations >= 25) this.donorRank = 'platinum';
  else if (donations >= 10) this.donorRank = 'gold';
  else if (donations >= 5) this.donorRank = 'silver';
  else this.donorRank = 'bronze';
};

// Pre-save middleware
donorProfileSchema.pre('save', function(next) {
  this.calculateNextEligibleDate();
  this.updateRank();
  next();
});

module.exports = mongoose.model('DonorProfile', donorProfileSchema);
