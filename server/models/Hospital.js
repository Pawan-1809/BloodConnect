const mongoose = require('mongoose');

const hospitalSchema = new mongoose.Schema({
  // Basic Information
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    unique: true
  },
  
  name: {
    type: String,
    required: [true, 'Hospital name is required'],
    trim: true
  },
  
  type: {
    type: String,
    enum: ['hospital', 'blood_bank', 'clinic', 'donation_center'],
    default: 'hospital'
  },
  
  registrationNumber: {
    type: String,
    required: true,
    unique: true
  },
  
  licenseNumber: String,
  accreditation: [String], // e.g., ['NABH', 'JCI']
  
  // Contact Information
  email: { type: String, required: true },
  phone: { type: String, required: true },
  emergencyPhone: String,
  fax: String,
  website: String,
  
  // Address & Location
  address: {
    street: { type: String, required: true },
    city: { type: String, required: true },
    state: { type: String, required: true },
    country: { type: String, required: true },
    zipCode: { type: String, required: true }
  },
  
  location: {
    type: { type: String, enum: ['Point'], default: 'Point' },
    coordinates: { type: [Number], default: [0, 0] }
  },
  
  // Operating Hours
  operatingHours: {
    monday: { open: String, close: String, isOpen: { type: Boolean, default: true } },
    tuesday: { open: String, close: String, isOpen: { type: Boolean, default: true } },
    wednesday: { open: String, close: String, isOpen: { type: Boolean, default: true } },
    thursday: { open: String, close: String, isOpen: { type: Boolean, default: true } },
    friday: { open: String, close: String, isOpen: { type: Boolean, default: true } },
    saturday: { open: String, close: String, isOpen: { type: Boolean, default: true } },
    sunday: { open: String, close: String, isOpen: { type: Boolean, default: false } }
  },
  
  is24Hours: { type: Boolean, default: false },
  
  // Facilities
  facilities: [{
    name: String,
    available: { type: Boolean, default: true }
  }],
  
  hasEmergencyServices: { type: Boolean, default: true },
  hasBloodBank: { type: Boolean, default: false },
  hasDonationCenter: { type: Boolean, default: false },
  
  // Capacity
  totalBeds: Number,
  icuBeds: Number,
  bloodStorageCapacity: Number, // in units
  
  // Staff
  bloodBankIncharge: {
    name: String,
    phone: String,
    email: String
  },
  
  // Services Offered
  servicesOffered: [{
    type: String,
    enum: [
      'whole_blood_collection',
      'apheresis',
      'platelet_donation',
      'plasma_donation',
      'blood_testing',
      'blood_processing',
      'blood_storage',
      'blood_transfusion',
      'cross_matching'
    ]
  }],
  
  // Pricing (if applicable)
  bloodPricing: [{
    bloodGroup: String,
    component: String,
    price: Number,
    currency: { type: String, default: 'INR' }
  }],
  
  // Verification
  isVerified: { type: Boolean, default: false },
  verifiedAt: Date,
  verifiedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  
  documents: [{
    type: { type: String, enum: ['license', 'registration', 'accreditation', 'other'] },
    url: String,
    verified: { type: Boolean, default: false },
    uploadedAt: { type: Date, default: Date.now }
  }],
  
  // Status
  isActive: { type: Boolean, default: true },
  
  // Ratings & Reviews
  rating: { type: Number, default: 0, min: 0, max: 5 },
  totalReviews: { type: Number, default: 0 },
  
  reviews: [{
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    rating: { type: Number, min: 1, max: 5 },
    comment: String,
    createdAt: { type: Date, default: Date.now }
  }],
  
  // Statistics
  stats: {
    totalDonationsReceived: { type: Number, default: 0 },
    totalRequestsFulfilled: { type: Number, default: 0 },
    totalLivesSaved: { type: Number, default: 0 },
    avgResponseTime: { type: Number, default: 0 } // in minutes
  },
  
  // Images
  images: [{
    url: String,
    caption: String
  }],
  
  logo: String,
  
  // Notes
  adminNotes: String
}, {
  timestamps: true
});

// Indexes
hospitalSchema.index({ location: '2dsphere' });
hospitalSchema.index({ type: 1 });
hospitalSchema.index({ isVerified: 1 });
hospitalSchema.index({ 'address.city': 1 });
hospitalSchema.index({ name: 'text' });

// Calculate average rating
hospitalSchema.methods.calculateRating = function() {
  if (this.reviews.length === 0) {
    this.rating = 0;
    return;
  }
  const sum = this.reviews.reduce((acc, review) => acc + review.rating, 0);
  this.rating = Math.round((sum / this.reviews.length) * 10) / 10;
  this.totalReviews = this.reviews.length;
};

module.exports = mongoose.model('Hospital', hospitalSchema);
