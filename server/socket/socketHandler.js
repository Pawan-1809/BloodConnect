const { Server } = require('socket.io');
const jwt = require('jsonwebtoken');
const { User } = require('../models');
const { getAllowedOrigins } = require('../config/origins');

let io;

const initializeSocket = (server) => {
  io = new Server(server, {
    cors: {
      origin: getAllowedOrigins(),
      methods: ['GET', 'POST'],
      credentials: true
    },
    pingTimeout: 60000,
    pingInterval: 25000
  });

  io.use(async (socket, next) => {
    try {
      const token = socket.handshake.auth.token || socket.handshake.query.token;

      if (!token) {
        return next(new Error('Authentication required'));
      }

      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      const user = await User.findById(decoded.id).select('-password');

      if (!user) {
        return next(new Error('User not found'));
      }

      if (user.isBlocked) {
        return next(new Error('User blocked'));
      }

      socket.user = user;
      next();
    } catch (error) {
      next(new Error('Invalid token'));
    }
  });

  io.on('connection', (socket) => {
    console.log(`User connected: ${socket.user.email} (${socket.user.role})`);

    socket.join(socket.user._id.toString());
    socket.join(`role_${socket.user.role}`);

    if (socket.user.address?.city) {
      socket.join(`city_${socket.user.address.city.toLowerCase()}`);
    }

    socket.on('update_location', async (data) => {
      try {
        const { latitude, longitude } = data;
        await User.findByIdAndUpdate(socket.user._id, {
          location: {
            type: 'Point',
            coordinates: [longitude, latitude]
          }
        });

        socket.emit('location_updated', { success: true });
      } catch (error) {
        socket.emit('error', { message: 'Failed to update location' });
      }
    });

    socket.on('typing', (data) => {
      socket.to(data.roomId).emit('user_typing', {
        userId: socket.user._id,
        userName: `${socket.user.firstName} ${socket.user.lastName}`
      });
    });

    socket.on('join_room', (roomId) => {
      socket.join(roomId);
      console.log(`User ${socket.user.email} joined room: ${roomId}`);
    });

    socket.on('leave_room', (roomId) => {
      socket.leave(roomId);
      console.log(`User ${socket.user.email} left room: ${roomId}`);
    });

    socket.on('availability_change', (data) => {
      if (socket.user.address?.city) {
        io.to(`city_${socket.user.address.city.toLowerCase()}`).emit(
          'donor_availability_update',
          {
            donorId: socket.user._id,
            bloodGroup: data.bloodGroup,
            isAvailable: data.isAvailable
          }
        );
      }
    });

    socket.on('emergency_broadcast', async (data) => {
      const { requestId, bloodGroup, city } = data;

      io.to('role_donor').emit('emergency_alert', {
        requestId,
        bloodGroup,
        message: `Emergency: ${bloodGroup} blood needed urgently!`,
        city
      });
    });

    socket.on('subscribe_request', (requestId) => {
      socket.join(`request_${requestId}`);
    });

    socket.on('unsubscribe_request', (requestId) => {
      socket.leave(`request_${requestId}`);
    });

    socket.on('subscribe_stock_updates', () => {
      if (socket.user.role === 'hospital' || socket.user.role === 'admin') {
        socket.join('stock_updates');
      }
    });

    socket.on('disconnect', (reason) => {
      console.log(`User disconnected: ${socket.user.email} (${reason})`);
    });

    socket.on('error', (error) => {
      console.error(`Socket error for ${socket.user.email}:`, error);
    });
  });

  return io;
};

const getIO = () => {
  if (!io) {
    throw new Error('Socket.io not initialized');
  }
  return io;
};

const emitToUser = (userId, event, data) => {
  if (io) {
    io.to(userId.toString()).emit(event, data);
  }
};

const emitToRole = (role, event, data) => {
  if (io) {
    io.to(`role_${role}`).emit(event, data);
  }
};

const emitToCity = (city, event, data) => {
  if (io) {
    io.to(`city_${city.toLowerCase()}`).emit(event, data);
  }
};

const broadcast = (event, data) => {
  if (io) {
    io.emit(event, data);
  }
};

const emitToRequest = (requestId, event, data) => {
  if (io) {
    io.to(`request_${requestId}`).emit(event, data);
  }
};

module.exports = {
  initializeSocket,
  getIO,
  emitToUser,
  emitToRole,
  emitToCity,
  broadcast,
  emitToRequest
};
