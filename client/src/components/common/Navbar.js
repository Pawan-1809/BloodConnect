import React, { useState, useRef, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../../context/AuthContext';
import { useSocket } from '../../context/SocketContext';
import {
  HiMenu,
  HiX,
  HiBell,
  HiUser,
  HiLogout,
  HiCog,
  HiChevronDown,
  HiHome,
  HiSearch,
  HiPlus,
  HiHeart,
  HiCalendar,
  HiClipboardList,
  HiUserGroup,
  HiChartBar,
  HiOfficeBuilding,
  HiCollection
} from 'react-icons/hi';
import { FaDroplet } from 'react-icons/fa6';

const Navbar = () => {
  const { user, logout } = useAuth();
  const { unreadCount, notifications } = useSocket();
  const navigate = useNavigate();
  const location = useLocation();
  
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [isNotificationOpen, setIsNotificationOpen] = useState(false);
  
  const profileRef = useRef(null);
  const notificationRef = useRef(null);

  // Close dropdowns on outside click
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (profileRef.current && !profileRef.current.contains(event.target)) {
        setIsProfileOpen(false);
      }
      if (notificationRef.current && !notificationRef.current.contains(event.target)) {
        setIsNotificationOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Navigation items based on role
  const getNavItems = () => {
    if (!user) {
      return [
        { name: 'Home', path: '/', icon: HiHome },
        { name: 'Hospitals', path: '/hospitals', icon: HiOfficeBuilding },
        { name: 'Blood Drives', path: '/schedules', icon: HiCalendar }
      ];
    }

    const commonItems = [
      { name: 'Notifications', path: '/notifications', icon: HiBell, mobile: true }
    ];

    const roleItems = {
      donor: [
        { name: 'Dashboard', path: '/donor/dashboard', icon: HiHome },
        { name: 'Find Requests', path: '/donor/find-requests', icon: HiSearch },
        { name: 'My History', path: '/donor/history', icon: HiClipboardList },
        { name: 'Profile', path: '/donor/profile', icon: HiUser }
      ],
      receiver: [
        { name: 'Dashboard', path: '/receiver/dashboard', icon: HiHome },
        { name: 'Create Request', path: '/receiver/create-request', icon: HiPlus },
        { name: 'My Requests', path: '/receiver/my-requests', icon: HiClipboardList },
        { name: 'Find Donors', path: '/receiver/find-donors', icon: HiSearch }
      ],
      hospital: [
        { name: 'Dashboard', path: '/hospital/dashboard', icon: HiHome },
        { name: 'Blood Stock', path: '/hospital/stock', icon: HiCollection },
        { name: 'Requests', path: '/hospital/requests', icon: HiClipboardList },
        { name: 'Donations', path: '/hospital/donations', icon: HiHeart }
      ],
      admin: [
        { name: 'Dashboard', path: '/admin/dashboard', icon: HiHome },
        { name: 'Users', path: '/admin/users', icon: HiUserGroup },
        { name: 'Hospitals', path: '/admin/hospitals', icon: HiOfficeBuilding },
        { name: 'Analytics', path: '/admin/analytics', icon: HiChartBar }
      ]
    };

    return [...(roleItems[user.role] || []), ...commonItems];
  };

  const navItems = getNavItems();
  const getProfilePath = () => {
    if (!user) return '/settings';
    switch (user.role) {
      case 'donor':
        return '/donor/profile';
      case 'hospital':
        return '/hospital/profile';
      case 'receiver':
        return '/receiver/profile';
      case 'admin':
        return '/admin/profile';
      default:
        return '/settings';
    }
  };

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  const isActive = (path) => location.pathname === path;

  return (
    <nav className="bg-white/80 backdrop-blur-lg border-b border-gray-200 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          {/* Logo */}
          <div className="flex items-center">
            <Link to="/" className="flex items-center space-x-2">
              <motion.div
                whileHover={{ scale: 1.05, rotate: 5 }}
                className="relative"
              >
                <FaDroplet className="h-8 w-8 text-primary-600" />
                <span className="absolute -top-1 -right-1 w-3 h-3 bg-secondary-500 rounded-full animate-pulse" />
              </motion.div>
              <span className="text-xl font-bold bg-gradient-to-r from-primary-600 to-primary-800 bg-clip-text text-transparent">
                BloodConnect
              </span>
            </Link>
          </div>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-1">
            {navItems.filter(item => !item.mobile).map((item) => (
              <Link
                key={item.path}
                to={item.path}
                className={`flex items-center px-3 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
                  isActive(item.path)
                    ? 'bg-primary-100 text-primary-700'
                    : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'
                }`}
              >
                <item.icon className="h-5 w-5 mr-1.5" />
                {item.name}
              </Link>
            ))}
          </div>

          {/* Right Section */}
          <div className="flex items-center space-x-3">
            {user ? (
              <>
                {/* Notifications */}
                <div ref={notificationRef} className="relative">
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => setIsNotificationOpen(!isNotificationOpen)}
                    className="relative p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors"
                  >
                    <HiBell className="h-6 w-6" />
                    {unreadCount > 0 && (
                      <span className="absolute -top-1 -right-1 w-5 h-5 bg-primary-600 text-white text-xs font-bold rounded-full flex items-center justify-center">
                        {unreadCount > 9 ? '9+' : unreadCount}
                      </span>
                    )}
                  </motion.button>

                  {/* Notification Dropdown */}
                  <AnimatePresence>
                    {isNotificationOpen && (
                      <motion.div
                        initial={{ opacity: 0, y: 10, scale: 0.95 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: 10, scale: 0.95 }}
                        transition={{ duration: 0.2 }}
                        className="absolute right-0 mt-2 w-80 bg-white rounded-xl shadow-xl border border-gray-200 overflow-hidden"
                      >
                        <div className="p-4 border-b border-gray-100 flex justify-between items-center">
                          <h3 className="font-semibold text-gray-900">Notifications</h3>
                          <Link
                            to="/notifications"
                            className="text-sm text-primary-600 hover:text-primary-700"
                            onClick={() => setIsNotificationOpen(false)}
                          >
                            View All
                          </Link>
                        </div>
                        <div className="max-h-96 overflow-y-auto">
                          {notifications.length === 0 ? (
                            <div className="p-8 text-center text-gray-500">
                              <HiBell className="h-12 w-12 mx-auto mb-2 opacity-50" />
                              <p>No notifications yet</p>
                            </div>
                          ) : (
                            notifications.slice(0, 5).map((notif, index) => (
                              <div
                                key={index}
                                className={`p-4 border-b border-gray-50 hover:bg-gray-50 transition-colors cursor-pointer ${
                                  !notif.read ? 'bg-primary-50/50' : ''
                                }`}
                              >
                                <p className="text-sm text-gray-800 font-medium">{notif.title}</p>
                                <p className="text-xs text-gray-500 mt-1">{notif.message}</p>
                                <p className="text-xs text-gray-400 mt-2">
                                  {new Date(notif.createdAt).toLocaleString()}
                                </p>
                              </div>
                            ))
                          )}
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>

                {/* Profile Dropdown */}
                <div ref={profileRef} className="relative">
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => setIsProfileOpen(!isProfileOpen)}
                    className="flex items-center space-x-2 p-1.5 rounded-lg hover:bg-gray-100 transition-colors"
                  >
                    <div className="w-8 h-8 rounded-full bg-gradient-to-br from-primary-500 to-primary-700 flex items-center justify-center text-white font-semibold text-sm">
                      {user.firstName?.[0]?.toUpperCase() || user.email?.[0]?.toUpperCase()}
                    </div>
                    <div className="hidden lg:block text-left">
                      <p className="text-sm font-medium text-gray-900">
                        {user.firstName} {user.lastName}
                      </p>
                      <p className="text-xs text-gray-500 capitalize">{user.role}</p>
                    </div>
                    <HiChevronDown className={`h-4 w-4 text-gray-500 transition-transform ${isProfileOpen ? 'rotate-180' : ''}`} />
                  </motion.button>

                  {/* Profile Dropdown Menu */}
                  <AnimatePresence>
                    {isProfileOpen && (
                      <motion.div
                        initial={{ opacity: 0, y: 10, scale: 0.95 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: 10, scale: 0.95 }}
                        transition={{ duration: 0.2 }}
                        className="absolute right-0 mt-2 w-56 bg-white rounded-xl shadow-xl border border-gray-200 overflow-hidden"
                      >
                        <div className="p-4 border-b border-gray-100">
                          <p className="font-semibold text-gray-900">{user.firstName} {user.lastName}</p>
                          <p className="text-sm text-gray-500">{user.email}</p>
                        </div>
                        <div className="py-2">
                          <Link
                            to={getProfilePath()}
                            className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 transition-colors"
                            onClick={() => setIsProfileOpen(false)}
                          >
                            <HiUser className="h-5 w-5 mr-3 text-gray-400" />
                            My Profile
                          </Link>
                          <Link
                            to="/settings"
                            className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 transition-colors"
                            onClick={() => setIsProfileOpen(false)}
                          >
                            <HiCog className="h-5 w-5 mr-3 text-gray-400" />
                            Settings
                          </Link>
                          <hr className="my-2 border-gray-100" />
                          <button
                            onClick={handleLogout}
                            className="flex items-center w-full px-4 py-2 text-sm text-red-600 hover:bg-red-50 transition-colors"
                          >
                            <HiLogout className="h-5 w-5 mr-3" />
                            Sign Out
                          </button>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              </>
            ) : (
              /* Auth Buttons */
              <div className="flex items-center space-x-3">
                <Link
                  to="/login"
                  className="text-gray-700 hover:text-gray-900 font-medium text-sm transition-colors"
                >
                  Sign In
                </Link>
                <Link
                  to="/register"
                  className="bg-primary-600 hover:bg-primary-700 text-white px-4 py-2 rounded-lg font-medium text-sm transition-colors shadow-md shadow-primary-200"
                >
                  Get Started
                </Link>
              </div>
            )}

            {/* Mobile Menu Button */}
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="md:hidden p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors"
            >
              {isMobileMenuOpen ? <HiX className="h-6 w-6" /> : <HiMenu className="h-6 w-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.2 }}
            className="md:hidden bg-white border-t border-gray-200"
          >
            <div className="px-4 py-4 space-y-2">
              {navItems.map((item) => (
                <Link
                  key={item.path}
                  to={item.path}
                  onClick={() => setIsMobileMenuOpen(false)}
                  className={`flex items-center px-4 py-3 rounded-lg text-base font-medium transition-all duration-200 ${
                    isActive(item.path)
                      ? 'bg-primary-100 text-primary-700'
                      : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'
                  }`}
                >
                  <item.icon className="h-5 w-5 mr-3" />
                  {item.name}
                </Link>
              ))}
              
              {!user && (
                <div className="pt-4 border-t border-gray-100 space-y-2">
                  <Link
                    to="/login"
                    onClick={() => setIsMobileMenuOpen(false)}
                    className="block text-center py-3 text-gray-700 font-medium hover:text-gray-900 transition-colors"
                  >
                    Sign In
                  </Link>
                  <Link
                    to="/register"
                    onClick={() => setIsMobileMenuOpen(false)}
                    className="block text-center py-3 bg-primary-600 text-white rounded-lg font-medium hover:bg-primary-700 transition-colors"
                  >
                    Get Started
                  </Link>
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </nav>
  );
};

export default Navbar;
