import React, { useEffect, useMemo, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { notificationAPI } from '../../services/api';

const NOTIFICATION_LABELS = {
  emergency_alert: 'Emergency',
  donation_completed: 'Donation',
  donation_reminder: 'Reminder',
  eligibility_restored: 'Eligible',
  donor_matched: 'Request Update',
  badge_earned: 'Achievement',
  system_announcement: 'System'
};

const Notifications = () => {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');
  const [selectedNotification, setSelectedNotification] = useState(null);

  useEffect(() => {
    let isMounted = true;

    const fetchNotifications = async () => {
      setLoading(true);
      try {
        const response = await notificationAPI.getAll({ limit: 100 });

        if (!isMounted) {
          return;
        }

        setNotifications(response.data?.notifications || []);
      } catch (error) {
        console.error('Error fetching notifications:', error);
        if (isMounted) {
          setNotifications([]);
        }
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    };

    fetchNotifications();

    return () => {
      isMounted = false;
    };
  }, []);

  const filteredNotifications = useMemo(() => {
    if (filter === 'all') {
      return notifications;
    }

    if (filter === 'unread') {
      return notifications.filter((notification) => !notification.isRead);
    }

    return notifications.filter((notification) => notification.type === filter);
  }, [filter, notifications]);

  const unreadCount = notifications.filter((notification) => !notification.isRead).length;

  const getNotificationColor = (type) => {
    const colors = {
      emergency_alert: 'border-l-red-500 bg-red-50',
      donation_completed: 'border-l-green-500 bg-green-50',
      donation_reminder: 'border-l-blue-500 bg-blue-50',
      eligibility_restored: 'border-l-emerald-500 bg-emerald-50',
      donor_matched: 'border-l-purple-500 bg-purple-50',
      badge_earned: 'border-l-yellow-500 bg-yellow-50',
      system_announcement: 'border-l-gray-500 bg-gray-50'
    };
    return colors[type] || 'border-l-gray-500 bg-gray-50';
  };

  const markAsRead = async (id) => {
    try {
      const response = await notificationAPI.markAsRead(id);
      setNotifications((current) =>
        current.map((notification) =>
          notification._id === id ? (response.data?.notification || { ...notification, isRead: true }) : notification
        )
      );
    } catch (error) {
      console.error('Error marking notification as read:', error);
    }
  };

  const markAllAsRead = async () => {
    try {
      await notificationAPI.markAllAsRead();
      setNotifications((current) => current.map((notification) => ({ ...notification, isRead: true })));
    } catch (error) {
      console.error('Error marking all as read:', error);
    }
  };

  const deleteNotification = async (id) => {
    try {
      await notificationAPI.delete(id);
      setNotifications((current) => current.filter((notification) => notification._id !== id));
      setSelectedNotification(null);
    } catch (error) {
      console.error('Error deleting notification:', error);
    }
  };

  return (
    <div className="p-6 lg:p-8">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="flex flex-col md:flex-row md:items-center md:justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-800">Notifications</h1>
          <p className="text-gray-600 mt-1">Your live account notifications from the backend.</p>
        </div>
        <div className="flex items-center space-x-4 mt-4 md:mt-0">
          {unreadCount > 0 ? (
            <button onClick={markAllAsRead} className="text-primary-600 hover:text-primary-700 font-medium text-sm" type="button">
              Mark all as read
            </button>
          ) : null}
          <span className="px-3 py-1 bg-primary-100 text-primary-700 rounded-full text-sm font-medium">
            {unreadCount} unread
          </span>
        </div>
      </motion.div>

      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="flex flex-wrap gap-2 mb-6">
        {[
          { id: 'all', label: 'All' },
          { id: 'unread', label: 'Unread' },
          { id: 'emergency_alert', label: 'Emergency' },
          { id: 'donation_completed', label: 'Donations' },
          { id: 'donation_reminder', label: 'Reminders' },
          { id: 'badge_earned', label: 'Achievements' }
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setFilter(tab.id)}
            className={`px-4 py-2 rounded-lg font-medium transition-all ${
              filter === tab.id
                ? 'bg-primary-500 text-white shadow-lg shadow-primary-500/30'
                : 'bg-white text-gray-600 hover:bg-gray-50'
            }`}
            type="button"
          >
            {tab.label}
          </button>
        ))}
      </motion.div>

      {loading ? (
        <div className="glass-card p-10 text-center">
          <p className="text-gray-500">Loading notifications...</p>
        </div>
      ) : filteredNotifications.length === 0 ? (
        <div className="glass-card p-10 text-center">
          <p className="text-gray-500">No notifications found for this filter.</p>
        </div>
      ) : (
        <div className="space-y-4">
          {filteredNotifications.map((notification, index) => (
            <motion.div
              key={notification._id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.04 }}
              className={`border-l-4 rounded-xl p-4 ${getNotificationColor(notification.type)} ${notification.isRead ? 'opacity-80' : ''}`}
            >
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1">
                  <div className="flex items-center gap-3">
                    <h3 className="font-semibold text-gray-800">{notification.title}</h3>
                    <span className="text-xs uppercase tracking-wide text-gray-500">
                      {NOTIFICATION_LABELS[notification.type] || notification.type}
                    </span>
                  </div>
                  <p className="text-gray-600 mt-2">{notification.message}</p>
                  <p className="text-xs text-gray-400 mt-3">
                    {new Date(notification.createdAt).toLocaleString()}
                  </p>
                </div>
                <div className="flex gap-2">
                  {!notification.isRead ? (
                    <button onClick={() => markAsRead(notification._id)} className="text-primary-600 hover:text-primary-700 text-sm" type="button">
                      Mark Read
                    </button>
                  ) : null}
                  <button onClick={() => setSelectedNotification(notification)} className="text-gray-600 hover:text-gray-900 text-sm" type="button">
                    View
                  </button>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      )}

      <AnimatePresence>
        {selectedNotification ? (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4" onClick={() => setSelectedNotification(null)}>
            <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.9, opacity: 0 }} className="bg-white rounded-2xl shadow-xl max-w-lg w-full overflow-hidden" onClick={(event) => event.stopPropagation()}>
              <div className="bg-gradient-to-r from-primary-500 to-primary-600 px-6 py-4">
                <h3 className="text-xl font-semibold text-white">{selectedNotification.title}</h3>
              </div>
              <div className="p-6 space-y-4">
                <p className="text-gray-700">{selectedNotification.message}</p>
                <div className="text-sm text-gray-500">
                  <p>Type: {NOTIFICATION_LABELS[selectedNotification.type] || selectedNotification.type}</p>
                  <p>Created: {new Date(selectedNotification.createdAt).toLocaleString()}</p>
                  <p>Status: {selectedNotification.isRead ? 'Read' : 'Unread'}</p>
                </div>
              </div>
              <div className="px-6 py-4 bg-gray-50 flex justify-end gap-3">
                <button onClick={() => deleteNotification(selectedNotification._id)} className="btn-secondary text-red-600 border-red-200 hover:bg-red-50" type="button">
                  Delete
                </button>
                <button onClick={() => setSelectedNotification(null)} className="btn-primary" type="button">
                  Close
                </button>
              </div>
            </motion.div>
          </motion.div>
        ) : null}
      </AnimatePresence>
    </div>
  );
};

export default Notifications;
