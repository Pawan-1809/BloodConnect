import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../../context/AuthContext';

const Settings = () => {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState('account');
  const [loading, setLoading] = useState(false);
  const [notification, setNotification] = useState(null);

  // Settings state
  const [settings, setSettings] = useState({
    // Notification Settings
    emailNotifications: true,
    pushNotifications: true,
    smsNotifications: false,
    emergencyAlerts: true,
    donationReminders: true,
    eligibilityAlerts: true,
    marketingEmails: false,
    
    // Privacy Settings
    showProfile: true,
    showLocation: true,
    showDonationHistory: false,
    shareStats: true,
    
    // Preferences
    language: 'en',
    theme: 'light',
    distanceUnit: 'km',
    dateFormat: 'MM/DD/YYYY',
    timezone: 'America/New_York',
    
    // Account Settings
    twoFactorEnabled: false,
  });

  const handleSettingChange = (key, value) => {
    setSettings(prev => ({ ...prev, [key]: value }));
  };

  const saveSettings = async () => {
    setLoading(true);
    try {
      // await settingsAPI.update(settings);
      showNotification('success', 'Settings saved successfully!');
    } catch (error) {
      showNotification('error', 'Failed to save settings');
    }
    setLoading(false);
  };

  const showNotification = (type, message) => {
    setNotification({ type, message });
    setTimeout(() => setNotification(null), 3000);
  };

  const tabs = [
    { id: 'account', label: 'Account', icon: '👤' },
    { id: 'notifications', label: 'Notifications', icon: '🔔' },
    { id: 'privacy', label: 'Privacy', icon: '🔒' },
    { id: 'preferences', label: 'Preferences', icon: '⚙️' },
    { id: 'security', label: 'Security', icon: '🛡️' },
  ];

  const Toggle = ({ enabled, onChange }) => (
    <button
      onClick={() => onChange(!enabled)}
      className={`relative w-12 h-6 rounded-full transition-colors ${
        enabled ? 'bg-primary-500' : 'bg-gray-300'
      }`}
    >
      <span
        className={`absolute top-1 w-4 h-4 bg-white rounded-full transition-transform ${
          enabled ? 'translate-x-7' : 'translate-x-1'
        }`}
      />
    </button>
  );

  return (
    <div className="p-6 lg:p-8">
          {/* Notification Toast */}
          <AnimatePresence>
            {notification && (
              <motion.div
                initial={{ opacity: 0, y: -50 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -50 }}
                className={`fixed top-20 right-6 z-50 px-6 py-4 rounded-xl shadow-lg ${
                  notification.type === 'success' ? 'bg-green-500' : 'bg-red-500'
                } text-white`}
              >
                <div className="flex items-center space-x-3">
                  <span className="text-xl">{notification.type === 'success' ? '✓' : '✕'}</span>
                  <span>{notification.message}</span>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Header */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-8"
          >
            <h1 className="text-3xl font-bold text-gray-800">Settings</h1>
            <p className="text-gray-600 mt-1">Manage your account settings and preferences</p>
          </motion.div>

          <div className="flex flex-col lg:flex-row gap-6">
            {/* Sidebar Tabs */}
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.1 }}
              className="lg:w-64"
            >
              <div className="glass-card p-2">
                {tabs.map((tab) => (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`w-full flex items-center space-x-3 px-4 py-3 rounded-xl transition-all ${
                      activeTab === tab.id
                        ? 'bg-primary-500 text-white shadow-lg shadow-primary-500/30'
                        : 'text-gray-600 hover:bg-gray-100'
                    }`}
                  >
                    <span className="text-xl">{tab.icon}</span>
                    <span className="font-medium">{tab.label}</span>
                  </button>
                ))}
              </div>
            </motion.div>

            {/* Content */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.2 }}
              className="flex-1"
            >
              <AnimatePresence mode="wait">
                {/* Account Settings */}
                {activeTab === 'account' && (
                  <motion.div
                    key="account"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -20 }}
                    className="glass-card p-6"
                  >
                    <h2 className="text-xl font-semibold text-gray-800 mb-6">Account Settings</h2>
                    
                    <div className="space-y-6">
                      {/* Profile Photo */}
                      <div className="flex items-center space-x-6">
                        <div className="w-20 h-20 bg-gradient-to-br from-primary-400 to-primary-600 rounded-full flex items-center justify-center text-white text-2xl font-bold">
                          {user?.name?.charAt(0) || 'U'}
                        </div>
                        <div>
                          <button className="btn-secondary text-sm">Change Photo</button>
                          <p className="text-xs text-gray-500 mt-2">JPG, PNG or GIF. Max 2MB.</p>
                        </div>
                      </div>

                      {/* Name */}
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Full Name</label>
                        <input
                          type="text"
                          className="input-field"
                          defaultValue={user?.name || ''}
                          placeholder="Enter your name"
                        />
                      </div>

                      {/* Email */}
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Email Address</label>
                        <input
                          type="email"
                          className="input-field bg-gray-100"
                          value={user?.email || ''}
                          disabled
                        />
                        <p className="text-xs text-gray-500 mt-1">Contact support to change your email.</p>
                      </div>

                      {/* Phone */}
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Phone Number</label>
                        <input
                          type="tel"
                          className="input-field"
                          defaultValue={user?.phone || ''}
                          placeholder="+1 234-567-8900"
                        />
                      </div>

                      {/* Delete Account */}
                      <div className="pt-6 border-t border-gray-200">
                        <h3 className="text-red-600 font-medium mb-2">Danger Zone</h3>
                        <p className="text-sm text-gray-500 mb-4">
                          Once you delete your account, there is no going back. Please be certain.
                        </p>
                        <button className="px-4 py-2 border-2 border-red-500 text-red-500 rounded-xl font-medium hover:bg-red-50 transition-colors">
                          Delete Account
                        </button>
                      </div>
                    </div>
                  </motion.div>
                )}

                {/* Notification Settings */}
                {activeTab === 'notifications' && (
                  <motion.div
                    key="notifications"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -20 }}
                    className="glass-card p-6"
                  >
                    <h2 className="text-xl font-semibold text-gray-800 mb-6">Notification Settings</h2>
                    
                    <div className="space-y-6">
                      {/* Communication Channels */}
                      <div>
                        <h3 className="font-medium text-gray-800 mb-4">Communication Channels</h3>
                        <div className="space-y-4">
                          {[
                            { key: 'emailNotifications', label: 'Email Notifications', desc: 'Receive updates via email' },
                            { key: 'pushNotifications', label: 'Push Notifications', desc: 'Get notified on your device' },
                            { key: 'smsNotifications', label: 'SMS Notifications', desc: 'Receive text messages for critical alerts' },
                          ].map((item) => (
                            <div key={item.key} className="flex items-center justify-between py-3">
                              <div>
                                <p className="font-medium text-gray-800">{item.label}</p>
                                <p className="text-sm text-gray-500">{item.desc}</p>
                              </div>
                              <Toggle
                                enabled={settings[item.key]}
                                onChange={(val) => handleSettingChange(item.key, val)}
                              />
                            </div>
                          ))}
                        </div>
                      </div>

                      {/* Notification Types */}
                      <div className="pt-6 border-t border-gray-200">
                        <h3 className="font-medium text-gray-800 mb-4">Notification Types</h3>
                        <div className="space-y-4">
                          {[
                            { key: 'emergencyAlerts', label: 'Emergency Blood Requests', desc: 'Get alerted for urgent requests matching your blood type' },
                            { key: 'donationReminders', label: 'Donation Reminders', desc: 'Reminders for upcoming appointments' },
                            { key: 'eligibilityAlerts', label: 'Eligibility Alerts', desc: 'Know when you\'re eligible to donate again' },
                            { key: 'marketingEmails', label: 'Marketing & Events', desc: 'News about blood drives and community events' },
                          ].map((item) => (
                            <div key={item.key} className="flex items-center justify-between py-3">
                              <div>
                                <p className="font-medium text-gray-800">{item.label}</p>
                                <p className="text-sm text-gray-500">{item.desc}</p>
                              </div>
                              <Toggle
                                enabled={settings[item.key]}
                                onChange={(val) => handleSettingChange(item.key, val)}
                              />
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  </motion.div>
                )}

                {/* Privacy Settings */}
                {activeTab === 'privacy' && (
                  <motion.div
                    key="privacy"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -20 }}
                    className="glass-card p-6"
                  >
                    <h2 className="text-xl font-semibold text-gray-800 mb-6">Privacy Settings</h2>
                    
                    <div className="space-y-6">
                      <div className="space-y-4">
                        {[
                          { key: 'showProfile', label: 'Public Profile', desc: 'Allow others to see your profile' },
                          { key: 'showLocation', label: 'Share Location', desc: 'Allow hospitals to see your location for emergency requests' },
                          { key: 'showDonationHistory', label: 'Show Donation History', desc: 'Display your donation count on your profile' },
                          { key: 'shareStats', label: 'Share Statistics', desc: 'Include your data in anonymous platform statistics' },
                        ].map((item) => (
                          <div key={item.key} className="flex items-center justify-between py-3 border-b border-gray-100 last:border-0">
                            <div>
                              <p className="font-medium text-gray-800">{item.label}</p>
                              <p className="text-sm text-gray-500">{item.desc}</p>
                            </div>
                            <Toggle
                              enabled={settings[item.key]}
                              onChange={(val) => handleSettingChange(item.key, val)}
                            />
                          </div>
                        ))}
                      </div>

                      {/* Data Export */}
                      <div className="pt-6 border-t border-gray-200">
                        <h3 className="font-medium text-gray-800 mb-2">Your Data</h3>
                        <p className="text-sm text-gray-500 mb-4">
                          Download a copy of all your data or request account deletion.
                        </p>
                        <div className="flex space-x-4">
                          <button className="btn-secondary">Download My Data</button>
                          <button className="text-gray-500 hover:text-gray-700">View Privacy Policy</button>
                        </div>
                      </div>
                    </div>
                  </motion.div>
                )}

                {/* Preferences */}
                {activeTab === 'preferences' && (
                  <motion.div
                    key="preferences"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -20 }}
                    className="glass-card p-6"
                  >
                    <h2 className="text-xl font-semibold text-gray-800 mb-6">Preferences</h2>
                    
                    <div className="space-y-6">
                      {/* Language */}
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Language</label>
                        <select
                          value={settings.language}
                          onChange={(e) => handleSettingChange('language', e.target.value)}
                          className="input-field"
                        >
                          <option value="en">English</option>
                          <option value="es">Español</option>
                          <option value="fr">Français</option>
                          <option value="de">Deutsch</option>
                          <option value="hi">हिंदी</option>
                        </select>
                      </div>

                      {/* Theme */}
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Theme</label>
                        <div className="flex space-x-4">
                          {['light', 'dark', 'system'].map((theme) => (
                            <button
                              key={theme}
                              onClick={() => handleSettingChange('theme', theme)}
                              className={`px-6 py-3 rounded-xl border-2 transition-all ${
                                settings.theme === theme
                                  ? 'border-primary-500 bg-primary-50'
                                  : 'border-gray-200 hover:border-gray-300'
                              }`}
                            >
                              <span className="capitalize">{theme}</span>
                            </button>
                          ))}
                        </div>
                      </div>

                      {/* Distance Unit */}
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Distance Unit</label>
                        <select
                          value={settings.distanceUnit}
                          onChange={(e) => handleSettingChange('distanceUnit', e.target.value)}
                          className="input-field"
                        >
                          <option value="km">Kilometers (km)</option>
                          <option value="mi">Miles (mi)</option>
                        </select>
                      </div>

                      {/* Date Format */}
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Date Format</label>
                        <select
                          value={settings.dateFormat}
                          onChange={(e) => handleSettingChange('dateFormat', e.target.value)}
                          className="input-field"
                        >
                          <option value="MM/DD/YYYY">MM/DD/YYYY</option>
                          <option value="DD/MM/YYYY">DD/MM/YYYY</option>
                          <option value="YYYY-MM-DD">YYYY-MM-DD</option>
                        </select>
                      </div>

                      {/* Timezone */}
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Timezone</label>
                        <select
                          value={settings.timezone}
                          onChange={(e) => handleSettingChange('timezone', e.target.value)}
                          className="input-field"
                        >
                          <option value="America/New_York">Eastern Time (ET)</option>
                          <option value="America/Chicago">Central Time (CT)</option>
                          <option value="America/Denver">Mountain Time (MT)</option>
                          <option value="America/Los_Angeles">Pacific Time (PT)</option>
                          <option value="UTC">UTC</option>
                        </select>
                      </div>
                    </div>
                  </motion.div>
                )}

                {/* Security Settings */}
                {activeTab === 'security' && (
                  <motion.div
                    key="security"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -20 }}
                    className="glass-card p-6"
                  >
                    <h2 className="text-xl font-semibold text-gray-800 mb-6">Security Settings</h2>
                    
                    <div className="space-y-6">
                      {/* Change Password */}
                      <div className="p-4 bg-gray-50 rounded-xl">
                        <h3 className="font-medium text-gray-800 mb-4">Change Password</h3>
                        <div className="space-y-4">
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">Current Password</label>
                            <input type="password" className="input-field" placeholder="••••••••" />
                          </div>
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">New Password</label>
                            <input type="password" className="input-field" placeholder="••••••••" />
                          </div>
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">Confirm New Password</label>
                            <input type="password" className="input-field" placeholder="••••••••" />
                          </div>
                          <button className="btn-primary">Update Password</button>
                        </div>
                      </div>

                      {/* Two-Factor Authentication */}
                      <div className="p-4 border border-gray-200 rounded-xl">
                        <div className="flex items-center justify-between">
                          <div>
                            <h3 className="font-medium text-gray-800">Two-Factor Authentication</h3>
                            <p className="text-sm text-gray-500 mt-1">
                              Add an extra layer of security to your account
                            </p>
                          </div>
                          <Toggle
                            enabled={settings.twoFactorEnabled}
                            onChange={(val) => handleSettingChange('twoFactorEnabled', val)}
                          />
                        </div>
                      </div>

                      {/* Active Sessions */}
                      <div className="p-4 border border-gray-200 rounded-xl">
                        <h3 className="font-medium text-gray-800 mb-4">Active Sessions</h3>
                        <div className="space-y-3">
                          {[
                            { device: 'Windows PC', location: 'New York, US', current: true },
                            { device: 'iPhone 13', location: 'New York, US', current: false },
                          ].map((session, index) => (
                            <div key={index} className="flex items-center justify-between py-2">
                              <div className="flex items-center space-x-3">
                                <div className="w-10 h-10 bg-gray-100 rounded-lg flex items-center justify-center">
                                  {session.device.includes('iPhone') ? '📱' : '💻'}
                                </div>
                                <div>
                                  <p className="font-medium text-gray-800">
                                    {session.device}
                                    {session.current && (
                                      <span className="ml-2 text-xs bg-green-100 text-green-700 px-2 py-0.5 rounded-full">
                                        Current
                                      </span>
                                    )}
                                  </p>
                                  <p className="text-sm text-gray-500">{session.location}</p>
                                </div>
                              </div>
                              {!session.current && (
                                <button className="text-red-600 hover:text-red-700 text-sm font-medium">
                                  Revoke
                                </button>
                              )}
                            </div>
                          ))}
                        </div>
                        <button className="text-red-600 hover:text-red-700 text-sm font-medium mt-4">
                          Sign out of all other sessions
                        </button>
                      </div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Save Button */}
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.3 }}
                className="mt-6 flex justify-end"
              >
                <button
                  onClick={saveSettings}
                  disabled={loading}
                  className="btn-primary min-w-[150px]"
                >
                  {loading ? (
                    <span className="flex items-center justify-center">
                      <svg className="animate-spin w-5 h-5 mr-2" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                      </svg>
                      Saving...
                    </span>
                  ) : (
                    'Save Changes'
                  )}
                </button>
              </motion.div>
            </motion.div>
          </div>
    </div>
  );
};

export default Settings;
