import React, { createContext, useContext, useEffect, useState, useCallback } from 'react';
import { io } from 'socket.io-client';
import { useAuth } from './AuthContext';
import toast from 'react-hot-toast';

const SocketContext = createContext(null);

export const useSocket = () => {
  const context = useContext(SocketContext);
  if (!context) {
    throw new Error('useSocket must be used within a SocketProvider');
  }
  return context;
};

export const SocketProvider = ({ children }) => {
  const [socket, setSocket] = useState(null);
  const [isConnected, setIsConnected] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const { token, user } = useAuth();

  // Initialize socket connection
  useEffect(() => {
    if (token && user) {
      const socketInstance = io(process.env.REACT_APP_SOCKET_URL || 'http://localhost:5000', {
        auth: { token },
        transports: ['websocket', 'polling'],
        reconnection: true,
        reconnectionAttempts: 5,
        reconnectionDelay: 1000
      });

      // Connection events
      socketInstance.on('connect', () => {
        console.log('🔌 Socket connected');
        setIsConnected(true);
      });

      socketInstance.on('disconnect', (reason) => {
        console.log('🔌 Socket disconnected:', reason);
        setIsConnected(false);
      });

      socketInstance.on('connect_error', (error) => {
        console.error('Socket connection error:', error);
        setIsConnected(false);
      });

      // Notification events
      socketInstance.on('notification', (data) => {
        setNotifications(prev => [data, ...prev]);
        setUnreadCount(prev => prev + 1);
        
        // Show toast for important notifications
        if (data.priority === 'urgent' || data.priority === 'high') {
          toast(data.message, {
            icon: '🔔',
            duration: 5000
          });
        }
      });

      // Emergency alert
      socketInstance.on('emergency_alert', (data) => {
        toast.error(data.message, {
          duration: 10000,
          icon: '🚨'
        });
      });

      // Request status update
      socketInstance.on('request_status_update', (data) => {
        toast.success(`Request status updated to: ${data.newStatus}`);
      });

      // Donor response notification
      socketInstance.on('donor_response', (data) => {
        if (data.donorAccepted) {
          toast.success('A donor has accepted your request!', {
            icon: '❤️',
            duration: 6000
          });
        }
      });

      // Eligibility restored
      socketInstance.on('eligibility_restored', (data) => {
        toast.success(data.message, {
          icon: '🎉',
          duration: 6000
        });
      });

      // Stock alert for hospitals
      socketInstance.on('stock_expiry_alert', (data) => {
        toast(`${data.count} blood unit(s) expiring soon!`, {
          icon: '⚠️',
          duration: 8000
        });
      });

      // Donation reminder
      socketInstance.on('donation_reminder', (data) => {
        toast(`Reminder: Donation appointment on ${new Date(data.date).toLocaleDateString()}`, {
          icon: '📅',
          duration: 8000
        });
      });

      // System announcement
      socketInstance.on('announcement', (data) => {
        toast(data.message, {
          icon: '📢',
          duration: 10000
        });
      });

      setSocket(socketInstance);

      return () => {
        socketInstance.disconnect();
        setSocket(null);
        setIsConnected(false);
      };
    }
  }, [token, user]);

  // Emit event helper
  const emit = useCallback((event, data) => {
    if (socket && isConnected) {
      socket.emit(event, data);
    }
  }, [socket, isConnected]);

  // Subscribe to room
  const joinRoom = useCallback((roomId) => {
    emit('join_room', roomId);
  }, [emit]);

  // Leave room
  const leaveRoom = useCallback((roomId) => {
    emit('leave_room', roomId);
  }, [emit]);

  // Subscribe to request updates
  const subscribeToRequest = useCallback((requestId) => {
    emit('subscribe_request', requestId);
  }, [emit]);

  // Unsubscribe from request updates
  const unsubscribeFromRequest = useCallback((requestId) => {
    emit('unsubscribe_request', requestId);
  }, [emit]);

  // Update location
  const updateLocation = useCallback((latitude, longitude) => {
    emit('update_location', { latitude, longitude });
  }, [emit]);

  // Toggle availability
  const emitAvailabilityChange = useCallback((bloodGroup, isAvailable) => {
    emit('availability_change', { bloodGroup, isAvailable });
  }, [emit]);

  // Clear notifications
  const clearNotifications = useCallback(() => {
    setNotifications([]);
    setUnreadCount(0);
  }, []);

  // Mark as read
  const markNotificationRead = useCallback(() => {
    setUnreadCount(0);
  }, []);

  const value = {
    socket,
    isConnected,
    notifications,
    unreadCount,
    emit,
    joinRoom,
    leaveRoom,
    subscribeToRequest,
    unsubscribeFromRequest,
    updateLocation,
    emitAvailabilityChange,
    clearNotifications,
    markNotificationRead,
    setNotifications,
    setUnreadCount
  };

  return (
    <SocketContext.Provider value={value}>
      {children}
    </SocketContext.Provider>
  );
};

export default SocketContext;
