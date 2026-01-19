const express = require('express');
const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const { User, DonorProfile } = require('../models');
const { protect } = require('../middleware/auth');
const { asyncHandler } = require('../middleware/errorHandler');
const { registerValidation, loginValidation } = require('../middleware/validators');

const router = express.Router();

// Generate JWT Token
const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRE || '7d'
  });
};

// Send token response
const sendTokenResponse = (user, statusCode, res) => {
  const token = generateToken(user._id);

  const cookieOptions = {
    expires: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'strict'
  };

  res
    .status(statusCode)
    .cookie('token', token, cookieOptions)
    .json({
      success: true,
      token,
      user: {
        id: user._id,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        role: user.role,
        isVerified: user.isVerified,
        avatar: user.avatar
      }
    });
};

// @route   POST /api/auth/register
// @desc    Register a new user
// @access  Public
router.post('/register', registerValidation, asyncHandler(async (req, res) => {
  const { email, phone, password, firstName, lastName, role, bloodGroup, location, address, weight, height } = req.body;

  const normalizedEmail = (email || '').toString().trim().toLowerCase();

  // Check if user exists
  const existingUser = await User.findOne({
    $or: [{ email: normalizedEmail }, { phone }]
  });

  if (existingUser) {
    return res.status(400).json({
      success: false,
      message: existingUser.email === normalizedEmail ? 'Email already registered' : 'Phone number already registered'
    });
  }

  // Create user
  const user = await User.create({
    email: normalizedEmail,
    phone,
    password,
    firstName,
    lastName,
    role: role || 'donor',
    location,
    address
  });

  // If donor, create donor profile only when required fields are provided.
  // The signup UI may not collect full health info (e.g., weight) yet.
  if (role === 'donor' && bloodGroup && weight) {
    await DonorProfile.create({
      user: user._id,
      bloodGroup,
      weight,
      ...(height ? { height } : {})
    });
  }

  // Emit socket event for real-time updates
  if (req.io) {
    req.io.emit('new_user_registered', {
      role: user.role,
      city: address?.city
    });
  }

  sendTokenResponse(user, 201, res);
}));

// @route   POST /api/auth/login
// @desc    Login user
// @access  Public
router.post('/login', loginValidation, asyncHandler(async (req, res) => {
  const { email, password } = req.body;

  const normalizedEmail = (email || '').toString().trim().toLowerCase();

  // Find user with password
  const user = await User.findOne({ email: normalizedEmail }).select('+password');

  if (!user) {
    return res.status(401).json({
      success: false,
      message: 'Invalid credentials'
    });
  }

  // Check if user is blocked
  if (user.isBlocked) {
    return res.status(403).json({
      success: false,
      message: 'Your account has been blocked. Please contact support.'
    });
  }

  // Check password
  const isMatch = await user.comparePassword(password);

  if (!isMatch) {
    return res.status(401).json({
      success: false,
      message: 'Invalid credentials'
    });
  }

  // Update last login
  user.lastLogin = new Date();
  await user.save({ validateBeforeSave: false });

  sendTokenResponse(user, 200, res);
}));

// @route   GET /api/auth/me
// @desc    Get current logged in user
// @access  Private
router.get('/me', protect, asyncHandler(async (req, res) => {
  const user = await User.findById(req.user.id);

  // Get donor profile if donor
  let donorProfile = null;
  if (user.role === 'donor') {
    donorProfile = await DonorProfile.findOne({ user: user._id });
  }

  res.json({
    success: true,
    user,
    donorProfile
  });
}));

// @route   POST /api/auth/logout
// @desc    Logout user / clear cookie
// @access  Private
router.post('/logout', protect, asyncHandler(async (req, res) => {
  res.cookie('token', 'none', {
    expires: new Date(Date.now() + 10 * 1000),
    httpOnly: true
  });

  res.json({
    success: true,
    message: 'Logged out successfully'
  });
}));

// @route   PUT /api/auth/update-profile
// @desc    Update user profile
// @access  Private
router.put('/update-profile', protect, asyncHandler(async (req, res) => {
  const fieldsToUpdate = {
    firstName: req.body.firstName,
    lastName: req.body.lastName,
    phone: req.body.phone,
    address: req.body.address,
    location: req.body.location,
    avatar: req.body.avatar,
    notifications: req.body.notifications
  };

  // Remove undefined fields
  Object.keys(fieldsToUpdate).forEach(key => 
    fieldsToUpdate[key] === undefined && delete fieldsToUpdate[key]
  );

  const user = await User.findByIdAndUpdate(
    req.user.id,
    fieldsToUpdate,
    { new: true, runValidators: true }
  );

  res.json({
    success: true,
    user
  });
}));

// @route   PUT /api/auth/change-password
// @desc    Change password
// @access  Private
router.put('/change-password', protect, asyncHandler(async (req, res) => {
  const { currentPassword, newPassword } = req.body;

  const user = await User.findById(req.user.id).select('+password');

  // Check current password
  const isMatch = await user.comparePassword(currentPassword);
  if (!isMatch) {
    return res.status(400).json({
      success: false,
      message: 'Current password is incorrect'
    });
  }

  user.password = newPassword;
  await user.save();

  sendTokenResponse(user, 200, res);
}));

// @route   POST /api/auth/forgot-password
// @desc    Forgot password
// @access  Public
router.post('/forgot-password', asyncHandler(async (req, res) => {
  const user = await User.findOne({ email: req.body.email });

  if (!user) {
    return res.status(404).json({
      success: false,
      message: 'No user found with that email'
    });
  }

  // Generate reset token
  const resetToken = crypto.randomBytes(32).toString('hex');
  user.resetPasswordToken = crypto.createHash('sha256').update(resetToken).digest('hex');
  user.resetPasswordExpire = Date.now() + 10 * 60 * 1000; // 10 minutes

  await user.save({ validateBeforeSave: false });

  // In production, send email with reset token
  // For now, return success
  res.json({
    success: true,
    message: 'Password reset email sent',
    // Only in development:
    ...(process.env.NODE_ENV === 'development' && { resetToken })
  });
}));

// @route   PUT /api/auth/reset-password/:token
// @desc    Reset password
// @access  Public
router.put('/reset-password/:token', asyncHandler(async (req, res) => {
  const resetPasswordToken = crypto
    .createHash('sha256')
    .update(req.params.token)
    .digest('hex');

  const user = await User.findOne({
    resetPasswordToken,
    resetPasswordExpire: { $gt: Date.now() }
  });

  if (!user) {
    return res.status(400).json({
      success: false,
      message: 'Invalid or expired reset token'
    });
  }

  // Set new password
  user.password = req.body.password;
  user.resetPasswordToken = undefined;
  user.resetPasswordExpire = undefined;
  await user.save();

  sendTokenResponse(user, 200, res);
}));

// @route   POST /api/auth/verify-email
// @desc    Verify email (placeholder)
// @access  Private
router.post('/verify-email', protect, asyncHandler(async (req, res) => {
  // In production, send verification email and handle token
  const user = await User.findByIdAndUpdate(
    req.user.id,
    { isVerified: true },
    { new: true }
  );

  res.json({
    success: true,
    message: 'Email verified successfully',
    user
  });
}));

module.exports = router;
