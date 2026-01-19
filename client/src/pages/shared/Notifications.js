import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { notificationAPI } from '../../services/api';

const Notifications = () => {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');
  const [selectedNotification, setSelectedNotification] = useState(null);

  useEffect(() => {
    fetchNotifications();
  }, []);

  const fetchNotifications = async () => {
    setLoading(true);
    try {
      const response = await notificationAPI.getAll();
      setNotifications(response.data.data || mockNotifications);
    } catch (error) {
      console.error('Error fetching notifications:', error);
      setNotifications(mockNotifications);
    }
    setLoading(false);
  };

  // Mock data
  const mockNotifications = [
    {
      id: 1,
      type: 'emergency',
      title: '🚨 Emergency Blood Request',
      message: 'A+ blood urgently needed at City General Hospital. Can you help?',
      time: '10 minutes ago',
      read: false,
      actionUrl: '/donor/requests',
      data: { bloodGroup: 'A+', hospital: 'City General Hospital', urgency: 'critical' }
    },
    {
      id: 2,
      type: 'donation',
      title: '🎉 Donation Completed',
      message: 'Thank you for your donation! You have saved up to 3 lives.',
      time: '2 hours ago',
      read: false,
      actionUrl: '/donor/history',
      data: { points: 100, badge: 'Guardian' }
    },
    {
      id: 3,
      type: 'reminder',
      title: '📅 Appointment Reminder',
      message: 'You have a donation appointment tomorrow at 10:00 AM at Red Cross Blood Bank.',
      time: '5 hours ago',
      read: true,
      actionUrl: '/schedules',
      data: { date: '2024-08-15', time: '10:00 AM', location: 'Red Cross Blood Bank' }
    },
    {
      id: 4,
      type: 'eligible',
      title: '✅ You\'re Eligible to Donate!',
      message: '56 days have passed since your last donation. You are now eligible to donate again.',
      time: '1 day ago',
      read: true,
      actionUrl: '/donor/requests',
      data: {}
    },
    {
      id: 5,
      type: 'request_update',
      title: '📋 Request Update',
      message: 'A donor has responded to your blood request for O+ at Memorial Hospital.',
      time: '2 days ago',
      read: true,
      actionUrl: '/receiver/requests',
      data: { requestId: 123, donorName: 'John Doe' }
    },
    {
      id: 6,
      type: 'achievement',
      title: '🏆 New Badge Earned!',
      message: 'Congratulations! You\'ve earned the "Guardian" badge for completing 5 donations.',
      time: '3 days ago',
      read: true,
      actionUrl: '/donor/profile',
      data: { badge: 'Guardian', donations: 5 }
    },
    {
      id: 7,
      type: 'system',
      title: '🔔 System Update',
      message: 'We\'ve updated our app with new features. Check out what\'s new!',
      time: '1 week ago',
      read: true,
      actionUrl: null,
      data: {}
    },
  ];

  const getNotificationIcon = (type) => {
    const icons = {
      emergency: '🚨',
      donation: '🩸',
      reminder: '📅',
      eligible: '✅',
      request_update: '📋',
      achievement: '🏆',
      system: '🔔'
    };
    return icons[type] || '📢';
  };

  const getNotificationColor = (type) => {
    const colors = {
      emergency: 'border-l-red-500 bg-red-50',
      donation: 'border-l-green-500 bg-green-50',
      reminder: 'border-l-blue-500 bg-blue-50',
      eligible: 'border-l-emerald-500 bg-emerald-50',
      request_update: 'border-l-purple-500 bg-purple-50',
      achievement: 'border-l-yellow-500 bg-yellow-50',
      system: 'border-l-gray-500 bg-gray-50'
    };
    return colors[type] || 'border-l-gray-500 bg-gray-50';
  };

  const markAsRead = async (id) => {
    try {
      // await notificationAPI.markAsRead(id);
      setNotifications(notifications.map(n => 
        n.id === id ? { ...n, read: true } : n
      ));
    } catch (error) {
      console.error('Error marking notification as read:', error);
    }
  };

  const markAllAsRead = async () => {
    try {
      // await notificationAPI.markAllAsRead();
      setNotifications(notifications.map(n => ({ ...n, read: true })));
    } catch (error) {
      console.error('Error marking all as read:', error);
    }
  };

  const deleteNotification = async (id) => {
    try {
      // await notificationAPI.delete(id);
      setNotifications(notifications.filter(n => n.id !== id));
      setSelectedNotification(null);
    } catch (error) {
      console.error('Error deleting notification:', error);
    }
  };

  const filteredNotifications = filter === 'all' 
    ? notifications 
    : filter === 'unread' 
    ? notifications.filter(n => !n.read)
    : notifications.filter(n => n.type === filter);

  const unreadCount = notifications.filter(n => !n.read).length;

  return (
    <div className="p-6 lg:p-8">
          {/* Header */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex flex-col md:flex-row md:items-center md:justify-between mb-8"
          >
            <div>
              <h1 className="text-3xl font-bold text-gray-800">Notifications</h1>
              <p className="text-gray-600 mt-1">
                Stay updated with your blood donation activities
              </p>
            </div>
            <div className="flex items-center space-x-4 mt-4 md:mt-0">
              {unreadCount > 0 && (
                <button
                  onClick={markAllAsRead}
                  className="text-primary-600 hover:text-primary-700 font-medium text-sm"
                >
                  Mark all as read
                </button>
              )}
              <span className="px-3 py-1 bg-primary-100 text-primary-700 rounded-full text-sm font-medium">
                {unreadCount} unread
              </span>
            </div>
          </motion.div>

          {/* Filters */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="flex flex-wrap gap-2 mb-6"
          >
            {[
              { id: 'all', label: 'All' },
              { id: 'unread', label: 'Unread' },
              { id: 'emergency', label: '🚨 Emergency' },
              { id: 'donation', label: '🩸 Donations' },
              { id: 'reminder', label: '📅 Reminders' },
              { id: 'achievement', label: '🏆 Achievements' },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setFilter(tab.id)}
                className={`px-4 py-2 rounded-lg font-medium transition-all ${
                  filter === tab.id
                    ? 'bg-primary-500 text-white shadow-lg shadow-primary-500/30'
                    : 'bg-white text-gray-600 hover:bg-gray-50'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </motion.div>

          {/* Notifications List */}
          {loading ? (
            <div className="flex items-center justify-center py-20">
              <div className="animate-spin w-12 h-12 border-4 border-primary-500 border-t-transparent rounded-full"></div>
            </div>
          ) : filteredNotifications.length === 0 ? (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="text-center py-20 glass-card"
            >
              <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-10 h-10 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
                </svg>
              </div>
              <h3 className="text-xl font-semibold text-gray-800 mb-2">No notifications</h3>
              <p className="text-gray-500">You're all caught up!</p>
            </motion.div>
          ) : (
            <div className="space-y-3">
              {filteredNotifications.map((notification, index) => (
                <motion.div
                  key={notification.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.03 }}
                  onClick={() => {
                    if (!notification.read) markAsRead(notification.id);
                    setSelectedNotification(notification);
                  }}
                  className={`glass-card p-4 cursor-pointer border-l-4 transition-all hover:shadow-md ${
                    getNotificationColor(notification.type)
                  } ${!notification.read ? 'ring-2 ring-primary-200' : ''}`}
                >
                  <div className="flex items-start space-x-4">
                    <div className="text-3xl">
                      {getNotificationIcon(notification.type)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between">
                        <h3 className={`font-semibold ${!notification.read ? 'text-gray-900' : 'text-gray-700'}`}>
                          {notification.title}
                        </h3>
                        {!notification.read && (
                          <span className="w-3 h-3 bg-primary-500 rounded-full flex-shrink-0 ml-2 mt-1.5"></span>
                        )}
                      </div>
                      <p className="text-gray-600 mt-1 line-clamp-2">{notification.message}</p>
                      <p className="text-sm text-gray-400 mt-2">{notification.time}</p>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          )}

          {/* Notification Detail Modal */}
          <AnimatePresence>
            {selectedNotification && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
                onClick={() => setSelectedNotification(null)}
              >
                <motion.div
                  initial={{ scale: 0.9, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  exit={{ scale: 0.9, opacity: 0 }}
                  className="bg-white rounded-2xl shadow-xl max-w-lg w-full overflow-hidden"
                  onClick={(e) => e.stopPropagation()}
                >
                  <div className={`px-6 py-4 ${getNotificationColor(selectedNotification.type)} border-l-4`}>
                    <div className="flex items-center space-x-3">
                      <span className="text-3xl">{getNotificationIcon(selectedNotification.type)}</span>
                      <div>
                        <h3 className="text-lg font-semibold text-gray-800">{selectedNotification.title}</h3>
                        <p className="text-sm text-gray-500">{selectedNotification.time}</p>
                      </div>
                    </div>
                  </div>
                  
                  <div className="p-6">
                    <p className="text-gray-700">{selectedNotification.message}</p>
                    
                    {/* Additional Data */}
                    {selectedNotification.data && Object.keys(selectedNotification.data).length > 0 && (
                      <div className="mt-4 p-4 bg-gray-50 rounded-xl">
                        <h4 className="font-medium text-gray-700 mb-2">Details</h4>
                        <div className="space-y-1">
                          {Object.entries(selectedNotification.data).map(([key, value]) => (
                            <div key={key} className="flex justify-between text-sm">
                              <span className="text-gray-500 capitalize">{key.replace(/_/g, ' ')}</span>
                              <span className="font-medium text-gray-800">{value}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>

                  <div className="px-6 py-4 bg-gray-50 flex justify-between">
                    <button
                      onClick={() => deleteNotification(selectedNotification.id)}
                      className="text-red-600 hover:text-red-700 font-medium text-sm"
                    >
                      Delete
                    </button>
                    <div className="space-x-3">
                      <button
                        onClick={() => setSelectedNotification(null)}
                        className="btn-secondary"
                      >
                        Close
                      </button>
                      {selectedNotification.actionUrl && (
                        <a href={selectedNotification.actionUrl} className="btn-primary inline-block">
                          View Details
                        </a>
                      )}
                    </div>
                  </div>
                </motion.div>
              </motion.div>
            )}
          </AnimatePresence>
    </div>
  );
};

export default Notifications;
