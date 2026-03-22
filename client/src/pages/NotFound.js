import React, { useMemo } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useAuth } from '../context/AuthContext';

const NotFound = () => {
  const location = useLocation();
  const { user } = useAuth();

  const suggestions = useMemo(() => {
    if (user?.role === 'donor') {
      return [
        { to: '/donor/dashboard', label: 'Donor Dashboard' },
        { to: '/donor/find-requests', label: 'Find Requests' },
        { to: '/schedules/my-appointments', label: 'My Appointments' }
      ];
    }

    if (user?.role === 'receiver') {
      return [
        { to: '/receiver/dashboard', label: 'Receiver Dashboard' },
        { to: '/receiver/my-requests', label: 'My Requests' },
        { to: '/hospitals', label: 'Hospitals' }
      ];
    }

    if (user?.role === 'hospital') {
      return [
        { to: '/hospital/dashboard', label: 'Hospital Dashboard' },
        { to: '/hospital/stock', label: 'Manage Stock' },
        { to: '/hospital/schedules', label: 'Hospital Schedules' }
      ];
    }

    if (user?.role === 'admin') {
      return [
        { to: '/admin/dashboard', label: 'Admin Dashboard' },
        { to: '/admin/hospitals', label: 'Hospitals' },
        { to: '/admin/announcements', label: 'Announcements' }
      ];
    }

    return [
      { to: '/', label: 'Home' },
      { to: '/hospitals', label: 'Find Hospitals' },
      { to: '/resources', label: 'Resources' }
    ];
  }, [user]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-primary-50/20 flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-3xl"
      >
        <div className="glass-card p-8 md:p-10 text-center">
          <div className="inline-flex items-center justify-center w-20 h-20 rounded-3xl bg-red-100 text-red-600 text-4xl font-bold">
            404
          </div>

          <h1 className="mt-6 text-3xl md:text-4xl font-bold text-gray-900">This route does not exist</h1>
          <p className="mt-4 text-gray-600 max-w-2xl mx-auto leading-relaxed">
            We could not find <span className="font-medium text-gray-900">{location.pathname}</span>. The link may be
            outdated, mistyped, or replaced by a newer page in the current app flow.
          </p>

          <div className="mt-8 grid gap-4 md:grid-cols-2 text-left">
            <div className="rounded-2xl border border-gray-100 bg-gray-50 p-5">
              <h2 className="text-lg font-semibold text-gray-900">What to do next</h2>
              <ul className="mt-3 space-y-2 text-sm text-gray-700">
                <li>Check the URL for typos if you typed it manually.</li>
                <li>Use the navigation below to jump back into a valid workflow.</li>
                <li>If this came from a broken in-app link, report it from the help or contact page.</li>
              </ul>
            </div>

            <div className="rounded-2xl border border-gray-100 bg-gray-50 p-5">
              <h2 className="text-lg font-semibold text-gray-900">Quick Recovery</h2>
              <div className="mt-3 flex flex-wrap gap-3">
                <button type="button" onClick={() => window.history.back()} className="btn-secondary">
                  Go Back
                </button>
                <Link to={user ? suggestions[0].to : '/'} className="btn-primary">
                  {user ? 'Open Dashboard' : 'Go Home'}
                </Link>
              </div>
            </div>
          </div>

          <div className="mt-8 pt-8 border-t border-gray-200">
            <p className="text-sm text-gray-500 mb-4">Useful destinations</p>
            <div className="flex flex-wrap justify-center gap-3">
              {suggestions.map((suggestion) => (
                <Link
                  key={suggestion.to}
                  to={suggestion.to}
                  className="px-4 py-2 rounded-xl bg-white border border-gray-200 text-sm font-medium text-primary-700 hover:bg-primary-50 transition-colors"
                >
                  {suggestion.label}
                </Link>
              ))}
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export default NotFound;
