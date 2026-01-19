const { validationResult, body, param, query } = require('express-validator');
const { BLOOD_GROUPS } = require('../config/constants');

// Handle validation errors
const validate = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      success: false,
      errors: errors.array().map(err => ({
        field: err.path,
        message: err.msg
      }))
    });
  }
  next();
};

// User Registration Validation
const registerValidation = [
  body('email')
    .isEmail()
    .normalizeEmail()
    .withMessage('Please provide a valid email'),
  body('phone')
    .matches(/^[+]?[0-9]{10,15}$/)
    .withMessage('Please provide a valid phone number'),
  body('password')
    .isLength({ min: 6 })
    .withMessage('Password must be at least 6 characters')
    .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/)
    .withMessage('Password must contain at least one uppercase, one lowercase, and one number'),
  body('firstName')
    .trim()
    .isLength({ min: 2 })
    .withMessage('First name must be at least 2 characters'),
  body('lastName')
    .trim()
    .isLength({ min: 2 })
    .withMessage('Last name must be at least 2 characters'),
  body('role')
    .optional()
    .isIn(['donor', 'receiver', 'hospital'])
    .withMessage('Invalid role'),
  validate
];

// Login Validation
const loginValidation = [
  body('email')
    .isEmail()
    .normalizeEmail()
    .withMessage('Please provide a valid email'),
  body('password')
    .notEmpty()
    .withMessage('Password is required'),
  validate
];

// Donor Profile Validation
const donorProfileValidation = [
  body('bloodGroup')
    .isIn(BLOOD_GROUPS)
    .withMessage('Invalid blood group'),
  body('weight')
    .isFloat({ min: 45 })
    .withMessage('Weight must be at least 45 kg'),
  body('height')
    .optional()
    .isFloat({ min: 100, max: 250 })
    .withMessage('Height must be between 100 and 250 cm'),
  validate
];

// Blood Request Validation
const bloodRequestValidation = [
  body('patientInfo.name')
    .trim()
    .isLength({ min: 2 })
    .withMessage('Patient name is required'),
  body('patientInfo.age')
    .isInt({ min: 0, max: 150 })
    .withMessage('Valid patient age is required'),
  body('bloodGroup')
    .isIn(BLOOD_GROUPS)
    .withMessage('Invalid blood group'),
  body('unitsRequired')
    .isInt({ min: 1, max: 20 })
    .withMessage('Units required must be between 1 and 20'),
  body('urgency')
    .optional()
    .isIn(['normal', 'urgent', 'critical', 'emergency'])
    .withMessage('Invalid urgency level'),
  body('requiredBy')
    .isISO8601()
    .withMessage('Valid required date is needed'),
  body('contactPhone')
    .matches(/^[+]?[0-9]{10,15}$/)
    .withMessage('Valid contact phone is required'),
  validate
];

// Hospital Registration Validation
const hospitalValidation = [
  body('name')
    .trim()
    .isLength({ min: 3 })
    .withMessage('Hospital name must be at least 3 characters'),
  body('registrationNumber')
    .trim()
    .notEmpty()
    .withMessage('Registration number is required'),
  body('email')
    .isEmail()
    .withMessage('Valid email is required'),
  body('phone')
    .matches(/^[+]?[0-9]{10,15}$/)
    .withMessage('Valid phone number is required'),
  body('address.street')
    .trim()
    .notEmpty()
    .withMessage('Street address is required'),
  body('address.city')
    .trim()
    .notEmpty()
    .withMessage('City is required'),
  body('address.state')
    .trim()
    .notEmpty()
    .withMessage('State is required'),
  body('address.country')
    .trim()
    .notEmpty()
    .withMessage('Country is required'),
  body('address.zipCode')
    .trim()
    .notEmpty()
    .withMessage('ZIP code is required'),
  validate
];

// Pagination Validation
const paginationValidation = [
  query('page')
    .optional()
    .isInt({ min: 1 })
    .withMessage('Page must be a positive integer'),
  query('limit')
    .optional()
    .isInt({ min: 1, max: 100 })
    .withMessage('Limit must be between 1 and 100'),
  validate
];

// ID Param Validation
const idParamValidation = [
  param('id')
    .isMongoId()
    .withMessage('Invalid ID format'),
  validate
];

// Location Validation
const locationValidation = [
  body('location.coordinates')
    .optional()
    .isArray({ min: 2, max: 2 })
    .withMessage('Coordinates must be [longitude, latitude]'),
  body('location.coordinates.*')
    .optional()
    .isFloat()
    .withMessage('Coordinates must be numbers'),
  validate
];

// Search Validation
const donorSearchValidation = [
  query('bloodGroup')
    .optional()
    .isIn(BLOOD_GROUPS)
    .withMessage('Invalid blood group'),
  query('lat')
    .optional()
    .isFloat({ min: -90, max: 90 })
    .withMessage('Latitude must be between -90 and 90'),
  query('lng')
    .optional()
    .isFloat({ min: -180, max: 180 })
    .withMessage('Longitude must be between -180 and 180'),
  query('radius')
    .optional()
    .isFloat({ min: 1, max: 500 })
    .withMessage('Radius must be between 1 and 500 km'),
  validate
];

module.exports = {
  validate,
  registerValidation,
  loginValidation,
  donorProfileValidation,
  bloodRequestValidation,
  hospitalValidation,
  paginationValidation,
  idParamValidation,
  locationValidation,
  donorSearchValidation
};
