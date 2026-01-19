import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useAuth } from '../../context/AuthContext';
import {
  HiHome,
  HiUser,
  HiClipboardList,
  HiSearch,
  HiPlus,
  HiHeart,
  HiCog,
  HiCollection,
  HiUserGroup,
  HiChartBar,
  HiOfficeBuilding,
  HiCalendar,
  HiDocumentReport,
  HiSpeakerphone,
  HiShieldCheck,
  HiLocationMarker,
  HiClock,
  HiBell,
  HiQuestionMarkCircle
} from 'react-icons/hi';
import { FaDroplet, FaTrophy, FaMedal } from 'react-icons/fa6';

const Sidebar = ({ isOpen = true, onClose }) => {
  const { user, donorProfile } = useAuth();
  const location = useLocation();

  // Sidebar items based on role
  const getSidebarItems = () => {
    switch (user?.role) {
      case 'donor':
        return [
          {
            title: 'Main',
            items: [
              { name: 'Dashboard', path: '/donor/dashboard', icon: HiHome },
              { name: 'My Profile', path: '/donor/profile', icon: HiUser },
              { name: 'Find Requests', path: '/donor/find-requests', icon: HiSearch }
            ]
          },
          {
            title: 'Activity',
            items: [
              { name: 'Donation History', path: '/donor/history', icon: HiClipboardList },
              { name: 'My Appointments', path: '/schedules/my-appointments', icon: HiCalendar },
              { name: 'Leaderboard', path: '/leaderboard', icon: FaTrophy }
            ]
          },
          {
            title: 'Discover',
            items: [
              { name: 'Nearby Hospitals', path: '/hospitals', icon: HiLocationMarker },
              { name: 'Blood Drives', path: '/schedules', icon: HiSpeakerphone },
              { name: 'Health Resources', path: '/resources', icon: HiQuestionMarkCircle }
            ]
          }
        ];

      case 'receiver':
        return [
          {
            title: 'Main',
            items: [
              { name: 'Dashboard', path: '/receiver/dashboard', icon: HiHome },
              { name: 'Create Request', path: '/receiver/create-request', icon: HiPlus }
            ]
          },
          {
            title: 'Requests',
            items: [
              { name: 'My Requests', path: '/receiver/my-requests', icon: HiClipboardList },
              { name: 'Find Donors', path: '/receiver/find-donors', icon: HiSearch }
            ]
          },
          {
            title: 'Discover',
            items: [
              { name: 'Nearby Hospitals', path: '/hospitals', icon: HiLocationMarker },
              { name: 'Blood Banks', path: '/blood-banks', icon: HiCollection }
            ]
          }
        ];

      case 'hospital':
        return [
          {
            title: 'Main',
            items: [
              { name: 'Dashboard', path: '/hospital/dashboard', icon: HiHome },
              { name: 'Hospital Profile', path: '/hospital/profile', icon: HiOfficeBuilding }
            ]
          },
          {
            title: 'Inventory',
            items: [
              { name: 'Blood Stock', path: '/hospital/stock', icon: HiCollection },
              { name: 'Add Stock', path: '/hospital/stock/add', icon: HiPlus },
              { name: 'Stock History', path: '/hospital/stock/history', icon: HiClock }
            ]
          },
          {
            title: 'Operations',
            items: [
              { name: 'Requests', path: '/hospital/requests', icon: HiClipboardList },
              { name: 'Donations', path: '/hospital/donations', icon: HiHeart },
              { name: 'Schedules', path: '/hospital/schedules', icon: HiCalendar },
              { name: 'Blood Drives', path: '/hospital/blood-drives', icon: HiSpeakerphone }
            ]
          },
          {
            title: 'Reports',
            items: [
              { name: 'Analytics', path: '/hospital/analytics', icon: HiChartBar },
              { name: 'Reports', path: '/hospital/reports', icon: HiDocumentReport }
            ]
          }
        ];

      case 'admin':
        return [
          {
            title: 'Overview',
            items: [
              { name: 'Dashboard', path: '/admin/dashboard', icon: HiHome },
              { name: 'Analytics', path: '/admin/analytics', icon: HiChartBar }
            ]
          },
          {
            title: 'Management',
            items: [
              { name: 'Users', path: '/admin/users', icon: HiUserGroup },
              { name: 'Hospitals', path: '/admin/hospitals', icon: HiOfficeBuilding },
              { name: 'Requests', path: '/admin/requests', icon: HiClipboardList }
            ]
          },
          {
            title: 'System',
            items: [
              { name: 'Verifications', path: '/admin/verifications', icon: HiShieldCheck },
              { name: 'Announcements', path: '/admin/announcements', icon: HiSpeakerphone },
              { name: 'Reports', path: '/admin/reports', icon: HiDocumentReport },
              { name: 'Settings', path: '/admin/settings', icon: HiCog }
            ]
          }
        ];

      default:
        return [];
    }
  };

  const sidebarItems = getSidebarItems();

  const isActive = (path) => location.pathname === path;

  return (
    <>
      {/* Overlay for mobile */}
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          className="fixed inset-0 bg-black/50 z-40 lg:hidden"
        />
      )}

      {/* Sidebar */}
      <motion.aside
        initial={false}
        animate={{ x: isOpen ? 0 : -300 }}
        transition={{ type: 'spring', damping: 25, stiffness: 200 }}
        className={`fixed left-0 top-16 h-[calc(100vh-4rem)] w-64 bg-white border-r border-gray-200 z-50 overflow-y-auto lg:translate-x-0 lg:relative lg:top-0 lg:z-0 ${
          isOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        {/* User Info Card */}
        {user && (
          <div className="p-4 border-b border-gray-100">
            <div className="flex items-center space-x-3">
              <div className="w-12 h-12 rounded-full bg-gradient-to-br from-primary-500 to-primary-700 flex items-center justify-center text-white font-bold text-lg">
                {user.firstName?.[0]?.toUpperCase()}
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-semibold text-gray-900 truncate">
                  {user.firstName} {user.lastName}
                </p>
                <p className="text-sm text-gray-500 capitalize">{user.role}</p>
              </div>
            </div>

            {/* Donor Stats Quick View */}
            {user.role === 'donor' && donorProfile && (
              <div className="mt-4 grid grid-cols-2 gap-2">
                <div className="bg-primary-50 rounded-lg p-2 text-center">
                  <FaDroplet className="h-4 w-4 text-primary-600 mx-auto mb-1" />
                  <p className="text-lg font-bold text-primary-700">{donorProfile.totalDonations || 0}</p>
                  <p className="text-xs text-gray-500">Donations</p>
                </div>
                <div className="bg-secondary-50 rounded-lg p-2 text-center">
                  <FaMedal className="h-4 w-4 text-secondary-600 mx-auto mb-1" />
                  <p className="text-lg font-bold text-secondary-700">{donorProfile.points || 0}</p>
                  <p className="text-xs text-gray-500">Points</p>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Navigation */}
        <nav className="p-4 pb-24 space-y-6">
          {sidebarItems.map((section, idx) => (
            <div key={idx}>
              <h3 className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">
                {section.title}
              </h3>
              <ul className="space-y-1">
                {section.items.map((item) => (
                  <li key={item.path}>
                    <Link
                      to={item.path}
                      onClick={onClose}
                      className={`flex items-center px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-200 group ${
                        isActive(item.path)
                          ? 'bg-primary-100 text-primary-700 shadow-sm'
                          : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'
                      }`}
                    >
                      <item.icon className={`h-5 w-5 mr-3 transition-colors ${
                        isActive(item.path) ? 'text-primary-600' : 'text-gray-400 group-hover:text-gray-600'
                      }`} />
                      {item.name}
                      {item.badge && (
                        <span className="ml-auto bg-primary-600 text-white text-xs font-bold px-2 py-0.5 rounded-full">
                          {item.badge}
                        </span>
                      )}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </nav>

        {/* Bottom Section */}
        <div className="absolute bottom-0 left-0 right-0 p-4 border-t border-gray-100 bg-white">
          <div className="flex items-center justify-between">
            <Link
              to="/settings"
              className="flex items-center text-sm text-gray-600 hover:text-gray-900 transition-colors"
            >
              <HiCog className="h-5 w-5 mr-2" />
              Settings
            </Link>
            <Link
              to="/notifications"
              className="p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors relative"
            >
              <HiBell className="h-5 w-5" />
            </Link>
          </div>
        </div>
      </motion.aside>
    </>
  );
};

export default Sidebar;
