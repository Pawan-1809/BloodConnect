const authRoutes = require('./auth.routes');
const donorRoutes = require('./donor.routes');
const requestRoutes = require('./request.routes');
const hospitalRoutes = require('./hospital.routes');
const adminRoutes = require('./admin.routes');
const notificationRoutes = require('./notification.routes');
const scheduleRoutes = require('./schedule.routes');
const statsRoutes = require('./stats.routes');

module.exports = {
  authRoutes,
  donorRoutes,
  requestRoutes,
  hospitalRoutes,
  adminRoutes,
  notificationRoutes,
  scheduleRoutes,
  statsRoutes
};
