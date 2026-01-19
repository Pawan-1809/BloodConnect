// Blood Types Configuration
const BLOOD_GROUPS = ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'];

// Compatibility Chart (who can donate to whom)
const BLOOD_COMPATIBILITY = {
  'O-': ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'], // Universal donor
  'O+': ['A+', 'B+', 'AB+', 'O+'],
  'A-': ['A+', 'A-', 'AB+', 'AB-'],
  'A+': ['A+', 'AB+'],
  'B-': ['B+', 'B-', 'AB+', 'AB-'],
  'B+': ['B+', 'AB+'],
  'AB-': ['AB+', 'AB-'],
  'AB+': ['AB+'] // Universal recipient
};

// Who can receive from whom
const CAN_RECEIVE_FROM = {
  'O-': ['O-'],
  'O+': ['O-', 'O+'],
  'A-': ['O-', 'A-'],
  'A+': ['O-', 'O+', 'A-', 'A+'],
  'B-': ['O-', 'B-'],
  'B+': ['O-', 'O+', 'B-', 'B+'],
  'AB-': ['O-', 'A-', 'B-', 'AB-'],
  'AB+': ['O-', 'O+', 'A-', 'A+', 'B-', 'B+', 'AB-', 'AB+'] // Can receive from all
};

// Donation Types
const DONATION_TYPES = {
  WHOLE_BLOOD: {
    name: 'whole_blood',
    label: 'Whole Blood',
    waitDays: 56,
    duration: 10, // minutes
    volume: 450 // ml
  },
  PLATELETS: {
    name: 'platelets',
    label: 'Platelets',
    waitDays: 7,
    duration: 90,
    volume: 200
  },
  PLASMA: {
    name: 'plasma',
    label: 'Plasma',
    waitDays: 28,
    duration: 45,
    volume: 300
  },
  DOUBLE_RED_CELLS: {
    name: 'double_red_cells',
    label: 'Double Red Cells',
    waitDays: 112,
    duration: 30,
    volume: 360
  }
};

// Blood Component Shelf Life
const COMPONENT_SHELF_LIFE = {
  whole_blood: 35, // days
  packed_red_cells: 42,
  platelets: 5,
  plasma: 365,
  cryoprecipitate: 365
};

// Eligibility Rules
const ELIGIBILITY_RULES = {
  minAge: 18,
  maxAge: 65,
  minWeight: 45, // kg
  minHemoglobin: {
    male: 13.0, // g/dL
    female: 12.5
  },
  maxBloodPressure: {
    systolic: 180,
    diastolic: 100
  },
  minBloodPressure: {
    systolic: 90,
    diastolic: 60
  },
  maxPulse: 100,
  minPulse: 50,
  maxTemperature: 37.5 // Celsius
};

// Request Urgency Levels
const URGENCY_LEVELS = {
  NORMAL: {
    name: 'normal',
    label: 'Normal',
    color: '#22c55e',
    maxResponseTime: 72 // hours
  },
  URGENT: {
    name: 'urgent',
    label: 'Urgent',
    color: '#f59e0b',
    maxResponseTime: 24
  },
  CRITICAL: {
    name: 'critical',
    label: 'Critical',
    color: '#ef4444',
    maxResponseTime: 12
  },
  EMERGENCY: {
    name: 'emergency',
    label: 'Emergency',
    color: '#dc2626',
    maxResponseTime: 4
  }
};

// User Roles
const USER_ROLES = {
  DONOR: 'donor',
  RECEIVER: 'receiver',
  HOSPITAL: 'hospital',
  ADMIN: 'admin'
};

// Notification Types
const NOTIFICATION_TYPES = {
  BLOOD_REQUEST: 'blood_request',
  REQUEST_APPROVED: 'request_approved',
  REQUEST_FULFILLED: 'request_fulfilled',
  DONOR_MATCHED: 'donor_matched',
  DONATION_REMINDER: 'donation_reminder',
  DONATION_SCHEDULED: 'donation_scheduled',
  DONATION_COMPLETED: 'donation_completed',
  ELIGIBILITY_RESTORED: 'eligibility_restored',
  EMERGENCY_ALERT: 'emergency_alert',
  STOCK_ALERT: 'stock_alert'
};

// Points System
const POINTS_CONFIG = {
  DONATION_COMPLETE: 100,
  EMERGENCY_DONATION: 150,
  REFERRAL: 50,
  PROFILE_COMPLETE: 25,
  FIRST_DONATION: 50,
  MILESTONE_5: 200,
  MILESTONE_10: 500,
  MILESTONE_25: 1000,
  MILESTONE_50: 2500
};

// Badge Thresholds
const BADGES = {
  FIRST_DONATION: { name: 'First Donation', icon: '🩸', threshold: 1 },
  REGULAR_DONOR: { name: 'Regular Donor', icon: '⭐', threshold: 5 },
  HERO: { name: 'Hero', icon: '🦸', threshold: 10 },
  LIFESAVER: { name: 'Lifesaver', icon: '❤️', threshold: 25 },
  CHAMPION: { name: 'Champion', icon: '🏆', threshold: 50 },
  LEGEND: { name: 'Legend', icon: '👑', threshold: 100 }
};

module.exports = {
  BLOOD_GROUPS,
  BLOOD_COMPATIBILITY,
  CAN_RECEIVE_FROM,
  DONATION_TYPES,
  COMPONENT_SHELF_LIFE,
  ELIGIBILITY_RULES,
  URGENCY_LEVELS,
  USER_ROLES,
  NOTIFICATION_TYPES,
  POINTS_CONFIG,
  BADGES
};
