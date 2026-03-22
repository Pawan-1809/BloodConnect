const mongoose = require('mongoose');

const bloodStockSchema = new mongoose.Schema({
  hospital: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Hospital',
    required: true
  },
  
  bloodGroup: {
    type: String,
    required: true,
    enum: ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-']
  },
  
  component: {
    type: String,
    enum: ['whole_blood', 'packed_red_cells', 'platelets', 'plasma', 'cryoprecipitate'],
    default: 'whole_blood'
  },
  
  // Stock Levels
  totalUnits: { type: Number, default: 0, min: 0 },
  availableUnits: { type: Number, default: 0, min: 0 },
  reservedUnits: { type: Number, default: 0, min: 0 },
  
  // Thresholds for Alerts
  minThreshold: { type: Number, default: 5 },
  criticalThreshold: { type: Number, default: 2 },
  maxCapacity: { type: Number, default: 100 },
  
  // Status
  status: {
    type: String,
    enum: ['adequate', 'low', 'critical', 'out_of_stock'],
    default: 'adequate'
  },
  
  // Individual Units Tracking
  units: [{
    // Keep unit IDs required, but do not create a global unique index on nested arrays.
    // A global unique index on units.unitId blocks initializing multiple stock docs with empty arrays.
    unitId: { type: String, required: true },
    bagNumber: String,
    
    // Donor Information
    donor: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    donorProfile: { type: mongoose.Schema.Types.ObjectId, ref: 'DonorProfile' },
    
    // Collection Details
    collectedAt: { type: Date, default: Date.now },
    collectionCenter: String,
    collectedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    
    // Processing
    processedAt: Date,
    processedBy: String,
    
    // Testing Results
    testResults: {
      hiv: { type: String, enum: ['negative', 'positive', 'pending'], default: 'pending' },
      hepatitisB: { type: String, enum: ['negative', 'positive', 'pending'], default: 'pending' },
      hepatitisC: { type: String, enum: ['negative', 'positive', 'pending'], default: 'pending' },
      syphilis: { type: String, enum: ['negative', 'positive', 'pending'], default: 'pending' },
      malaria: { type: String, enum: ['negative', 'positive', 'pending'], default: 'pending' },
      overallStatus: { type: String, enum: ['safe', 'unsafe', 'pending'], default: 'pending' }
    },
    testedAt: Date,
    testedBy: String,
    
    // Storage
    storageLocation: String,
    storageTemperature: Number,
    
    // Expiry
    expiryDate: {
      type: Date,
      required: true
    },
    
    // Status
    status: {
      type: String,
      enum: ['collected', 'testing', 'available', 'reserved', 'issued', 'expired', 'discarded'],
      default: 'collected'
    },
    
    // Issued To
    issuedTo: {
      request: { type: mongoose.Schema.Types.ObjectId, ref: 'BloodRequest' },
      patient: String,
      issuedAt: Date,
      issuedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' }
    },
    
    // Quality
    volume: { type: Number, default: 450 }, // ml
    quality: { type: String, enum: ['good', 'acceptable', 'poor'], default: 'good' },
    
    notes: String
  }],
  
  // Last Updated
  lastStockUpdate: { type: Date, default: Date.now },
  lastAudit: Date,
  
  // Monthly Statistics
  monthlyStats: [{
    month: Date,
    received: { type: Number, default: 0 },
    issued: { type: Number, default: 0 },
    expired: { type: Number, default: 0 },
    discarded: { type: Number, default: 0 }
  }]
}, {
  timestamps: true
});

// Compound index for hospital + blood group
bloodStockSchema.index({ hospital: 1, bloodGroup: 1, component: 1 }, { unique: true });
bloodStockSchema.index({ status: 1 });
bloodStockSchema.index({ 'units.expiryDate': 1 });
bloodStockSchema.index({ 'units.status': 1 });

// Update stock status based on available units
bloodStockSchema.methods.updateStockStatus = function() {
  const available = this.availableUnits;
  
  if (available === 0) {
    this.status = 'out_of_stock';
  } else if (available <= this.criticalThreshold) {
    this.status = 'critical';
  } else if (available <= this.minThreshold) {
    this.status = 'low';
  } else {
    this.status = 'adequate';
  }
  
  this.lastStockUpdate = new Date();
};

// Calculate available units from individual units
bloodStockSchema.methods.recalculateUnits = function() {
  this.totalUnits = this.units.filter(u => 
    ['available', 'reserved', 'testing'].includes(u.status)
  ).length;
  
  this.availableUnits = this.units.filter(u => u.status === 'available').length;
  this.reservedUnits = this.units.filter(u => u.status === 'reserved').length;
  
  this.updateStockStatus();
};

// Pre-save middleware
bloodStockSchema.pre('save', function(next) {
  this.recalculateUnits();
  next();
});

module.exports = mongoose.model('BloodStock', bloodStockSchema);
