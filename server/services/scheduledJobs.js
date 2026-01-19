const cron = require('node-cron');
const { DonorProfile, BloodStock, Schedule, Notification, User } = require('../models');
const { sendEmail } = require('./emailService');
const { emitToUser, emitToRole } = require('../socket/socketHandler');
const { NOTIFICATION_TYPES } = require('../config/constants');

// Check and update donor eligibility (runs every day at midnight)
const checkDonorEligibility = cron.schedule('0 0 * * *', async () => {
  console.log('⏰ Running donor eligibility check...');
  
  try {
    const today = new Date();
    
    // Find donors who became eligible today
    const newlyEligible = await DonorProfile.find({
      nextEligibleDate: {
        $gte: new Date(today.setHours(0, 0, 0, 0)),
        $lt: new Date(today.setHours(23, 59, 59, 999))
      },
      availabilityAutoDisabled: true
    }).populate('user');

    for (const donor of newlyEligible) {
      // Update donor availability
      donor.isAvailable = true;
      donor.availabilityAutoDisabled = false;
      await donor.save();

      // Create notification
      await Notification.create({
        recipient: donor.user._id,
        type: NOTIFICATION_TYPES.ELIGIBILITY_RESTORED,
        title: 'You Can Donate Again!',
        message: 'The waiting period since your last donation has passed. You\'re now eligible to donate blood again!',
        priority: 'normal',
        actionUrl: '/schedules'
      });

      // Send socket notification
      emitToUser(donor.user._id, 'eligibility_restored', {
        message: 'You are now eligible to donate blood!'
      });

      // Send email
      if (donor.user.notifications?.email) {
        await sendEmail(donor.user.email, 'eligibilityRestored', donor.user);
      }
    }

    console.log(`✅ Updated eligibility for ${newlyEligible.length} donors`);
  } catch (error) {
    console.error('❌ Error in eligibility check:', error);
  }
}, { scheduled: false });

// Check for expiring blood units (runs every day at 6 AM)
const checkExpiringStock = cron.schedule('0 6 * * *', async () => {
  console.log('⏰ Checking for expiring blood stock...');
  
  try {
    const threeDaysFromNow = new Date();
    threeDaysFromNow.setDate(threeDaysFromNow.getDate() + 3);

    const expiringStocks = await BloodStock.aggregate([
      { $unwind: '$units' },
      {
        $match: {
          'units.status': 'available',
          'units.expiryDate': { $lte: threeDaysFromNow }
        }
      },
      {
        $group: {
          _id: '$hospital',
          expiringUnits: {
            $push: {
              bloodGroup: '$bloodGroup',
              expiryDate: '$units.expiryDate',
              bagNumber: '$units.bagNumber'
            }
          },
          count: { $sum: 1 }
        }
      },
      {
        $lookup: {
          from: 'hospitals',
          localField: '_id',
          foreignField: '_id',
          as: 'hospital'
        }
      },
      { $unwind: '$hospital' }
    ]);

    for (const stock of expiringStocks) {
      // Create notification for hospital
      await Notification.create({
        recipient: stock.hospital.user,
        type: NOTIFICATION_TYPES.STOCK_ALERT,
        title: 'Blood Units Expiring Soon',
        message: `${stock.count} blood unit(s) will expire within 3 days. Please review and take action.`,
        priority: 'high',
        data: { expiringUnits: stock.expiringUnits },
        actionUrl: '/hospital/stock'
      });

      // Send socket notification
      emitToUser(stock.hospital.user, 'stock_expiry_alert', {
        count: stock.count,
        expiringUnits: stock.expiringUnits
      });
    }

    console.log(`✅ Sent expiry alerts to ${expiringStocks.length} hospitals`);
  } catch (error) {
    console.error('❌ Error in stock expiry check:', error);
  }
}, { scheduled: false });

// Send donation reminders (runs every day at 8 AM)
const sendDonationReminders = cron.schedule('0 8 * * *', async () => {
  console.log('⏰ Sending donation reminders...');
  
  try {
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    const tomorrowStart = new Date(tomorrow.setHours(0, 0, 0, 0));
    const tomorrowEnd = new Date(tomorrow.setHours(23, 59, 59, 999));

    // Find schedules for tomorrow
    const schedules = await Schedule.find({
      date: { $gte: tomorrowStart, $lte: tomorrowEnd },
      status: 'published',
      'remindersSent.oneDay': false
    });

    for (const schedule of schedules) {
      // Get confirmed participants
      const participants = schedule.slots.flatMap(slot =>
        slot.participants
          .filter(p => p.status === 'confirmed')
          .map(p => ({ ...p.toObject(), time: slot.time }))
      );

      for (const participant of participants) {
        const user = await User.findById(participant.user);
        if (!user) continue;

        // Create notification
        await Notification.create({
          recipient: user._id,
          type: NOTIFICATION_TYPES.DONATION_REMINDER,
          title: 'Donation Reminder - Tomorrow',
          message: `Reminder: Your blood donation appointment is scheduled for tomorrow at ${participant.time}`,
          priority: 'normal',
          relatedTo: { model: 'Schedule', id: schedule._id },
          actionUrl: `/schedules/${schedule._id}`
        });

        // Send socket notification
        emitToUser(user._id, 'donation_reminder', {
          scheduleId: schedule._id,
          date: schedule.date,
          time: participant.time
        });

        // Send email
        if (user.notifications?.email) {
          await sendEmail(user.email, 'donationReminder', {
            ...user.toObject(),
            schedule: {
              date: schedule.date,
              time: participant.time,
              venue: schedule.venue
            }
          });
        }
      }

      // Mark reminder as sent
      schedule.remindersSent.oneDay = true;
      await schedule.save();
    }

    console.log(`✅ Sent reminders for ${schedules.length} schedules`);
  } catch (error) {
    console.error('❌ Error sending donation reminders:', error);
  }
}, { scheduled: false });

// Update stock status (runs every hour)
const updateStockStatus = cron.schedule('0 * * * *', async () => {
  console.log('⏰ Updating stock status...');
  
  try {
    const stocks = await BloodStock.find({});
    let criticalAlerts = [];

    for (const stock of stocks) {
      const previousStatus = stock.status;
      stock.recalculateUnits();
      await stock.save();

      // Check if status changed to critical
      if (stock.status === 'critical' && previousStatus !== 'critical') {
        criticalAlerts.push({
          hospitalId: stock.hospital,
          bloodGroup: stock.bloodGroup,
          availableUnits: stock.availableUnits
        });
      }
    }

    // Send alerts for critical stocks
    if (criticalAlerts.length > 0) {
      emitToRole('admin', 'critical_stock_alert', { stocks: criticalAlerts });
    }

    console.log(`✅ Updated ${stocks.length} stock records`);
  } catch (error) {
    console.error('❌ Error updating stock status:', error);
  }
}, { scheduled: false });

// Mark expired blood units (runs every day at 1 AM)
const markExpiredUnits = cron.schedule('0 1 * * *', async () => {
  console.log('⏰ Marking expired blood units...');
  
  try {
    const today = new Date();
    
    const result = await BloodStock.updateMany(
      { 'units.expiryDate': { $lt: today }, 'units.status': 'available' },
      { $set: { 'units.$[elem].status': 'expired' } },
      { arrayFilters: [{ 'elem.expiryDate': { $lt: today }, 'elem.status': 'available' }] }
    );

    console.log(`✅ Marked ${result.modifiedCount} stocks with expired units`);
  } catch (error) {
    console.error('❌ Error marking expired units:', error);
  }
}, { scheduled: false });

// Start all scheduled jobs
const startScheduledJobs = () => {
  console.log('🚀 Starting scheduled jobs...');
  
  checkDonorEligibility.start();
  checkExpiringStock.start();
  sendDonationReminders.start();
  updateStockStatus.start();
  markExpiredUnits.start();
  
  console.log('✅ All scheduled jobs started');
};

// Stop all scheduled jobs
const stopScheduledJobs = () => {
  checkDonorEligibility.stop();
  checkExpiringStock.stop();
  sendDonationReminders.stop();
  updateStockStatus.stop();
  markExpiredUnits.stop();
  
  console.log('⏹️ All scheduled jobs stopped');
};

module.exports = {
  startScheduledJobs,
  stopScheduledJobs
};
