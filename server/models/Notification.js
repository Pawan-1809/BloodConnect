const mongoose = require('mongoose');

const notificationSchema = new mongoose.Schema({
  // Recipient
  recipient: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  
  // Notification Type
  type: {
    type: String,
    enum: [
      'blood_request',
      'request_approved',
      'request_fulfilled',
      'request_cancelled',
      'donor_matched',
      'donation_reminder',
      'donation_scheduled',
      'donation_completed',
      'eligibility_restored',
      'emergency_alert',
      'stock_alert',
      'verification_approved',
      'verification_rejected',
      'account_update',
      'system_announcement',
      'badge_earned',
      'certificate_ready',
      'review_request',
      'message'
    ],
    required: true
  },
  
  // Priority
  priority: {
    type: String,
    enum: ['low', 'normal', 'high', 'urgent'],
    default: 'normal'
  },
  
  // Content
  title: {
    type: String,
    required: true
  },
  
  message: {
    type: String,
    required: true
  },
  
  // Rich Content
  data: {
    type: mongoose.Schema.Types.Mixed,
    default: {}
  },
  
  // Related Entities
  relatedTo: {
    model: { type: String, enum: ['BloodRequest', 'Donation', 'Hospital', 'User', 'Schedule'] },
    id: mongoose.Schema.Types.ObjectId
  },
  
  // Action Link
  actionUrl: String,
  actionText: String,
  
  // Icon
  icon: {
    type: String,
    default: 'bell'
  },
  
  // Status
  isRead: { type: Boolean, default: false },
  readAt: Date,
  
  isArchived: { type: Boolean, default: false },
  archivedAt: Date,
  
  // Delivery Status
  deliveryStatus: {
    inApp: { type: Boolean, default: true },
    email: { type: Boolean, default: false },
    sms: { type: Boolean, default: false },
    push: { type: Boolean, default: false }
  },
  
  emailSent: { type: Boolean, default: false },
  emailSentAt: Date,
  
  smsSent: { type: Boolean, default: false },
  smsSentAt: Date,
  
  pushSent: { type: Boolean, default: false },
  pushSentAt: Date,
  
  // Expiry
  expiresAt: Date,
  
  // Metadata
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }
}, {
  timestamps: true
});

// Indexes
notificationSchema.index({ recipient: 1, createdAt: -1 });
notificationSchema.index({ recipient: 1, isRead: 1 });
notificationSchema.index({ type: 1 });
notificationSchema.index({ createdAt: 1 }, { expireAfterSeconds: 2592000 }); // Auto-delete after 30 days

// Static method to create notification
notificationSchema.statics.createNotification = async function(data) {
  const notification = await this.create(data);
  return notification;
};

// Static method to mark as read
notificationSchema.statics.markAsRead = async function(notificationId, userId) {
  return await this.findOneAndUpdate(
    { _id: notificationId, recipient: userId },
    { isRead: true, readAt: new Date() },
    { new: true }
  );
};

// Static method to mark all as read
notificationSchema.statics.markAllAsRead = async function(userId) {
  return await this.updateMany(
    { recipient: userId, isRead: false },
    { isRead: true, readAt: new Date() }
  );
};

// Static method to get unread count
notificationSchema.statics.getUnreadCount = async function(userId) {
  return await this.countDocuments({ recipient: userId, isRead: false });
};

module.exports = mongoose.model('Notification', notificationSchema);
