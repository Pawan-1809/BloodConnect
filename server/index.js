require('dotenv').config();

const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const compression = require('compression');
const http = require('http');
const path = require('path');
const fs = require('fs');

// Database
const connectDB = require('./config/database');

// Routes
const {
  authRoutes,
  donorRoutes,
  requestRoutes,
  hospitalRoutes,
  adminRoutes,
  notificationRoutes,
  scheduleRoutes
} = require('./routes');

// Middleware
const { errorHandler, notFound } = require('./middleware/errorHandler');
const {
  apiRateLimiter,
  authRateLimiter,
  sanitizeRequest,
  preventHttpParameterPollution
} = require('./middleware/security');

// Socket & Services
const { initializeSocket } = require('./socket/socketHandler');
const { startScheduledJobs } = require('./services/scheduledJobs');

// Initialize Express
const app = express();
const server = http.createServer(app);

// Respect reverse proxy headers in production deployments
app.set('trust proxy', 1);

// Disable ETag to avoid 304 responses for API endpoints
app.set('etag', false);

// Initialize Socket.io
const io = initializeSocket(server);

// Make io accessible in routes
app.use((req, res, next) => {
  req.io = io;
  next();
});

// Security Middleware
app.use(helmet({
  crossOriginResourcePolicy: { policy: 'cross-origin' }
}));

// CORS
app.use(cors({
  origin: process.env.CLIENT_URL || 'http://localhost:3000',
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

// Body Parser
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));
app.use(sanitizeRequest);
app.use(preventHttpParameterPollution(['sortBy', 'sortOrder', 'fields']));

// Compression
app.use(compression());

// Logging
if (process.env.NODE_ENV === 'development') {
  app.use(morgan('dev'));
} else {
  app.use(morgan('combined'));
}

// Static files
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Health check
app.get('/api/health', (req, res) => {
  res.json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    environment: process.env.NODE_ENV
  });
});

// Dev-only landing page (helps when opening backend port in browser)
if (process.env.NODE_ENV !== 'production') {
  app.get('/', (req, res) => {
    const clientUrl = process.env.CLIENT_URL || 'http://localhost:3000';
    res
      .status(200)
      .type('html')
      .send(
        `<!doctype html>
<html lang="en">
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <title>BloodConnect API</title>
    <style>body{font-family:system-ui,-apple-system,Segoe UI,Roboto,Inter,Arial,sans-serif;max-width:820px;margin:40px auto;padding:0 16px;line-height:1.5}code{background:#f3f4f6;padding:2px 6px;border-radius:6px}a{color:#dc2626;text-decoration:none}a:hover{text-decoration:underline}.card{background:#fff;border:1px solid #e5e7eb;border-radius:12px;padding:16px}</style>
  </head>
  <body>
    <h1>BloodConnect API is running</h1>
    <div class="card">
      <p>This port (<code>${PORT}</code>) serves the backend API.</p>
      <p>Open the frontend in your browser:</p>
      <p><a href="${clientUrl}" target="_blank" rel="noreferrer">${clientUrl}</a></p>
      <p>API documentation endpoint:</p>
      <p><a href="/api" target="_blank" rel="noreferrer">/api</a></p>
    </div>
  </body>
</html>`
      );
  });
}

// API Routes
// Prevent caching of API responses
app.use('/api', (req, res, next) => {
  res.setHeader('Cache-Control', 'no-store');
  res.setHeader('Pragma', 'no-cache');
  next();
});

app.use('/api', apiRateLimiter);

app.use('/api/auth', authRateLimiter, authRoutes);
app.use('/api/donors', donorRoutes);
app.use('/api/requests', requestRoutes);
app.use('/api/hospitals', hospitalRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/notifications', notificationRoutes);
app.use('/api/schedules', scheduleRoutes);

// API documentation endpoint
app.get('/api', (req, res) => {
  res.json({
    name: 'BloodConnect API',
    version: '1.0.0',
    description: 'Blood Donation Management Platform API',
    endpoints: {
      auth: {
        'POST /api/auth/register': 'Register new user',
        'POST /api/auth/login': 'Login user',
        'GET /api/auth/me': 'Get current user',
        'POST /api/auth/logout': 'Logout user',
        'PUT /api/auth/update-profile': 'Update profile',
        'PUT /api/auth/change-password': 'Change password',
        'POST /api/auth/forgot-password': 'Forgot password',
        'PUT /api/auth/reset-password/:token': 'Reset password'
      },
      donors: {
        'POST /api/donors/profile': 'Create/Update donor profile',
        'GET /api/donors/profile': 'Get my donor profile',
        'GET /api/donors/search': 'Search donors',
        'GET /api/donors/compatible/:bloodGroup': 'Find compatible donors',
        'PUT /api/donors/availability': 'Toggle availability',
        'GET /api/donors/history': 'Get donation history',
        'GET /api/donors/stats': 'Get donor statistics'
      },
      requests: {
        'POST /api/requests': 'Create blood request',
        'GET /api/requests': 'Get all requests',
        'GET /api/requests/stats': 'Get request statistics',
        'GET /api/requests/emergency': 'Get emergency requests',
        'GET /api/requests/:id': 'Get request by ID',
        'PUT /api/requests/:id/status': 'Update request status',
        'POST /api/requests/:id/respond': 'Respond to request'
      },
      hospitals: {
        'POST /api/hospitals/register': 'Register hospital',
        'GET /api/hospitals': 'Get all hospitals',
        'GET /api/hospitals/my-hospital': 'Get my hospital',
        'PUT /api/hospitals/my-hospital': 'Update my hospital',
        'GET /api/hospitals/:id/stock': 'Get hospital stock',
        'PUT /api/hospitals/stock': 'Update stock',
        'GET /api/hospitals/stock/overview': 'Get stock overview'
      },
      admin: {
        'GET /api/admin/dashboard': 'Get dashboard stats',
        'GET /api/admin/users': 'Get all users',
        'PUT /api/admin/users/:id/verify': 'Verify user',
        'PUT /api/admin/users/:id/block': 'Block/Unblock user',
        'GET /api/admin/analytics': 'Get analytics',
        'POST /api/admin/announcement': 'Send announcement'
      },
      notifications: {
        'GET /api/notifications': 'Get notifications',
        'GET /api/notifications/unread-count': 'Get unread count',
        'PUT /api/notifications/:id/read': 'Mark as read',
        'PUT /api/notifications/mark-all-read': 'Mark all as read'
      },
      schedules: {
        'POST /api/schedules': 'Create schedule/event',
        'GET /api/schedules': 'Get all schedules',
        'GET /api/schedules/:id': 'Get schedule by ID',
        'POST /api/schedules/:id/book': 'Book a slot',
        'PUT /api/schedules/:id/cancel-booking': 'Cancel booking'
      }
    }
  });
});

// Serve static files in production
if (process.env.NODE_ENV === 'production') {
  const clientBuildPath = path.join(__dirname, '../client/build');

  if (fs.existsSync(clientBuildPath)) {
    app.use(express.static(clientBuildPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(clientBuildPath, 'index.html'));
    });
  } else {
    console.warn('Client build folder not found. Running API-only mode.');
  }
}

// Error handling
app.use(notFound);
app.use(errorHandler);

// Start server
const PORT = process.env.PORT || 5000;

const startServer = async () => {
  try {
    // Connect to database
    await connectDB();
    
    // Start scheduled jobs
    startScheduledJobs();
    
    // Start server
    server.listen(PORT, () => {
      console.log(`
╔════════════════════════════════════════════════════════════╗
║                                                            ║
║   🩸 BloodConnect Server Running                           ║
║                                                            ║
║   Environment: ${process.env.NODE_ENV?.padEnd(40)}║
║   Port: ${PORT.toString().padEnd(47)}║
║   API: http://localhost:${PORT}/api                         ║
║                                                            ║
║   Socket.io: Enabled                                       ║
║   Scheduled Jobs: Active                                   ║
║                                                            ║
╚════════════════════════════════════════════════════════════╝
      `);
    });
  } catch (error) {
    console.error('❌ Failed to start server:', error);
    process.exit(1);
  }
};

// Handle unhandled promise rejections
process.on('unhandledRejection', (err) => {
  console.error('❌ Unhandled Promise Rejection:', err);
  server.close(() => process.exit(1));
});

// Handle uncaught exceptions
process.on('uncaughtException', (err) => {
  console.error('❌ Uncaught Exception:', err);
  process.exit(1);
});

startServer();

module.exports = { app, server, io };
