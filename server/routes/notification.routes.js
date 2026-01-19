const express = require('express');
const { Notification } = require('../models');
const { protect } = require('../middleware/auth');
const { asyncHandler } = require('../middleware/errorHandler');
const { paginationValidation } = require('../middleware/validators');

const router = express.Router();

// @route   GET /api/notifications
// @desc    Get user notifications
// @access  Private
router.get('/', protect, paginationValidation, asyncHandler(async (req, res) => {
  const { page = 1, limit = 20, unreadOnly = false } = req.query;

  let query = { recipient: req.user.id };
  if (unreadOnly === 'true') {
    query.isRead = false;
  }

  const notifications = await Notification.find(query)
    .sort({ createdAt: -1 })
    .skip((page - 1) * limit)
    .limit(parseInt(limit));

  const total = await Notification.countDocuments(query);
  const unreadCount = await Notification.countDocuments({
    recipient: req.user.id,
    isRead: false
  });

  res.json({
    success: true,
    count: notifications.length,
    total,
    unreadCount,
    page: parseInt(page),
    pages: Math.ceil(total / limit),
    notifications
  });
}));

// @route   GET /api/notifications/unread-count
// @desc    Get unread notification count
// @access  Private
router.get('/unread-count', protect, asyncHandler(async (req, res) => {
  const count = await Notification.getUnreadCount(req.user.id);

  res.json({
    success: true,
    unreadCount: count
  });
}));

// @route   PUT /api/notifications/:id/read
// @desc    Mark notification as read
// @access  Private
router.put('/:id/read', protect, asyncHandler(async (req, res) => {
  const notification = await Notification.markAsRead(req.params.id, req.user.id);

  if (!notification) {
    return res.status(404).json({
      success: false,
      message: 'Notification not found'
    });
  }

  res.json({
    success: true,
    notification
  });
}));

// @route   PUT /api/notifications/mark-all-read
// @desc    Mark all notifications as read
// @access  Private
router.put('/mark-all-read', protect, asyncHandler(async (req, res) => {
  await Notification.markAllAsRead(req.user.id);

  res.json({
    success: true,
    message: 'All notifications marked as read'
  });
}));

// @route   DELETE /api/notifications/:id
// @desc    Delete notification
// @access  Private
router.delete('/:id', protect, asyncHandler(async (req, res) => {
  const notification = await Notification.findOneAndDelete({
    _id: req.params.id,
    recipient: req.user.id
  });

  if (!notification) {
    return res.status(404).json({
      success: false,
      message: 'Notification not found'
    });
  }

  res.json({
    success: true,
    message: 'Notification deleted'
  });
}));

// @route   DELETE /api/notifications
// @desc    Delete all read notifications
// @access  Private
router.delete('/', protect, asyncHandler(async (req, res) => {
  await Notification.deleteMany({
    recipient: req.user.id,
    isRead: true
  });

  res.json({
    success: true,
    message: 'All read notifications deleted'
  });
}));

module.exports = router;
