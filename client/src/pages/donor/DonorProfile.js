import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useForm } from 'react-hook-form';
import { useAuth } from '../../context/AuthContext';
import { donorAPI } from '../../services/api';

const bloodTypes = ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'];

const DonorProfile = () => {
  const { user, updateProfile } = useAuth();
  const [activeTab, setActiveTab] = useState('personal');
  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(false);
  const [donorProfile, setDonorProfile] = useState(null);
  const [notification, setNotification] = useState(null);

  const { register, handleSubmit, setValue, formState: { errors } } = useForm();

  const fetchDonorProfile = useCallback(async () => {
    try {
      const response = await donorAPI.getProfile();
      setDonorProfile(response.data.data);
      // Pre-fill form with existing data
      const profile = response.data.data;
      if (profile) {
        Object.keys(profile).forEach(key => {
          setValue(key, profile[key]);
        });
      }
    } catch (error) {
      console.error('Error fetching profile:', error);
    }
  }, [setValue]);

  useEffect(() => {
    fetchDonorProfile();
  }, [fetchDonorProfile]);

  const onSubmit = async (data) => {
    setLoading(true);
    try {
      await donorAPI.updateProfile(data);
      await updateProfile(data);
      setIsEditing(false);
      setNotification({ type: 'success', message: 'Profile updated successfully!' });
      setTimeout(() => setNotification(null), 3000);
    } catch (error) {
      setNotification({ type: 'error', message: 'Failed to update profile' });
      setTimeout(() => setNotification(null), 3000);
    }
    setLoading(false);
  };

  const tabs = [
    { id: 'personal', label: 'Personal Info', icon: '👤' },
    { id: 'medical', label: 'Medical History', icon: '🏥' },
    { id: 'preferences', label: 'Preferences', icon: '⚙️' },
    { id: 'achievements', label: 'Achievements', icon: '🏆' },
  ];

  const achievements = [
    { id: 1, name: 'First Timer', description: 'Completed first donation', icon: '🎉', unlocked: true, date: '2024-01-15' },
    { id: 2, name: 'Guardian', description: '5 donations completed', icon: '🛡️', unlocked: true, date: '2024-06-20' },
    { id: 3, name: 'Champion', description: '10 donations completed', icon: '🏆', unlocked: false, progress: 6 },
    { id: 4, name: 'Super Hero', description: '25 donations completed', icon: '🦸', unlocked: false, progress: 6 },
    { id: 5, name: 'Legendary Hero', description: '50 donations completed', icon: '⭐', unlocked: false, progress: 6 },
    { id: 6, name: 'Emergency Responder', description: 'Responded to 5 emergency requests', icon: '🚨', unlocked: true, date: '2024-03-10' },
    { id: 7, name: 'Early Bird', description: 'Donated before 8 AM', icon: '🌅', unlocked: false, progress: 0 },
    { id: 8, name: 'Community Hero', description: 'Referred 3 new donors', icon: '👥', unlocked: false, progress: 1 },
  ];

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
            <h1 className="text-3xl font-bold text-gray-800">My Profile</h1>
            <p className="text-gray-600 mt-1">Manage your donor profile and preferences</p>
          </motion.div>

          {/* Profile Header Card */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="glass-card p-6 mb-6"
          >
            <div className="flex flex-col md:flex-row items-center md:items-start space-y-4 md:space-y-0 md:space-x-6">
              {/* Avatar */}
              <div className="relative">
                <div className="w-32 h-32 rounded-full bg-gradient-to-br from-primary-400 to-primary-600 flex items-center justify-center text-white text-4xl font-bold shadow-lg">
                  {user?.name?.charAt(0) || 'D'}
                </div>
                <button className="absolute bottom-0 right-0 w-10 h-10 bg-white rounded-full shadow-lg flex items-center justify-center hover:bg-gray-50 transition-colors">
                  <svg className="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                </button>
                <div className="absolute -top-2 -right-2 w-8 h-8 bg-green-500 rounded-full flex items-center justify-center">
                  <svg className="w-5 h-5 text-white" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                  </svg>
                </div>
              </div>

              {/* User Info */}
              <div className="flex-1 text-center md:text-left">
                <h2 className="text-2xl font-bold text-gray-800">{user?.name || 'John Doe'}</h2>
                <p className="text-gray-600">{user?.email || 'john@example.com'}</p>
                
                <div className="flex flex-wrap justify-center md:justify-start gap-3 mt-4">
                  <span className="px-4 py-2 bg-primary-100 text-primary-700 rounded-full text-sm font-semibold">
                    🩸 {donorProfile?.bloodGroup || 'O+'}
                  </span>
                  <span className="px-4 py-2 bg-green-100 text-green-700 rounded-full text-sm font-semibold">
                    ✓ Verified Donor
                  </span>
                  <span className="px-4 py-2 bg-yellow-100 text-yellow-700 rounded-full text-sm font-semibold">
                    🏆 Guardian Level
                  </span>
                </div>
              </div>

              {/* Stats */}
              <div className="flex space-x-6">
                <div className="text-center">
                  <div className="text-3xl font-bold text-primary-600">6</div>
                  <div className="text-sm text-gray-500">Donations</div>
                </div>
                <div className="text-center">
                  <div className="text-3xl font-bold text-green-600">18</div>
                  <div className="text-sm text-gray-500">Lives Saved</div>
                </div>
                <div className="text-center">
                  <div className="text-3xl font-bold text-yellow-600">600</div>
                  <div className="text-sm text-gray-500">Points</div>
                </div>
              </div>
            </div>
          </motion.div>

          {/* Tabs */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="flex space-x-2 mb-6 overflow-x-auto pb-2"
          >
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center space-x-2 px-6 py-3 rounded-xl font-medium transition-all whitespace-nowrap ${
                  activeTab === tab.id
                    ? 'bg-primary-500 text-white shadow-lg shadow-primary-500/30'
                    : 'bg-white text-gray-600 hover:bg-gray-50'
                }`}
              >
                <span>{tab.icon}</span>
                <span>{tab.label}</span>
              </button>
            ))}
          </motion.div>

          {/* Tab Content */}
          <AnimatePresence mode="wait">
            {activeTab === 'personal' && (
              <motion.div
                key="personal"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="glass-card p-6"
              >
                <div className="flex justify-between items-center mb-6">
                  <h3 className="text-xl font-semibold text-gray-800">Personal Information</h3>
                  <button
                    onClick={() => setIsEditing(!isEditing)}
                    className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                      isEditing
                        ? 'bg-gray-200 text-gray-700'
                        : 'bg-primary-500 text-white hover:bg-primary-600'
                    }`}
                  >
                    {isEditing ? 'Cancel' : 'Edit Profile'}
                  </button>
                </div>

                <form onSubmit={handleSubmit(onSubmit)}>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Full Name</label>
                      <input
                        type="text"
                        disabled={!isEditing}
                        className="input-field disabled:bg-gray-100"
                        {...register('name', { required: 'Name is required' })}
                        defaultValue={user?.name}
                      />
                      {errors.name && <p className="text-red-500 text-sm mt-1">{errors.name.message}</p>}
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Email</label>
                      <input
                        type="email"
                        disabled
                        className="input-field bg-gray-100"
                        value={user?.email}
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Phone Number</label>
                      <input
                        type="tel"
                        disabled={!isEditing}
                        className="input-field disabled:bg-gray-100"
                        {...register('phone', { required: 'Phone is required' })}
                        defaultValue={user?.phone || '+1 234-567-8900'}
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Date of Birth</label>
                      <input
                        type="date"
                        disabled={!isEditing}
                        className="input-field disabled:bg-gray-100"
                        {...register('dateOfBirth')}
                        defaultValue="1990-01-15"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Blood Group</label>
                      <select
                        disabled={!isEditing}
                        className="input-field disabled:bg-gray-100"
                        {...register('bloodGroup')}
                        defaultValue={donorProfile?.bloodGroup || 'O+'}
                      >
                        {bloodTypes.map(type => (
                          <option key={type} value={type}>{type}</option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Gender</label>
                      <select
                        disabled={!isEditing}
                        className="input-field disabled:bg-gray-100"
                        {...register('gender')}
                        defaultValue="male"
                      >
                        <option value="male">Male</option>
                        <option value="female">Female</option>
                        <option value="other">Other</option>
                      </select>
                    </div>

                    <div className="md:col-span-2">
                      <label className="block text-sm font-medium text-gray-700 mb-2">Address</label>
                      <textarea
                        disabled={!isEditing}
                        className="input-field disabled:bg-gray-100"
                        rows={3}
                        {...register('address')}
                        defaultValue="123 Main Street, City, State 12345"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">City</label>
                      <input
                        type="text"
                        disabled={!isEditing}
                        className="input-field disabled:bg-gray-100"
                        {...register('city')}
                        defaultValue="New York"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Emergency Contact</label>
                      <input
                        type="tel"
                        disabled={!isEditing}
                        className="input-field disabled:bg-gray-100"
                        {...register('emergencyContact')}
                        defaultValue="+1 987-654-3210"
                      />
                    </div>
                  </div>

                  {isEditing && (
                    <motion.div
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="mt-6 flex justify-end space-x-4"
                    >
                      <button
                        type="button"
                        onClick={() => setIsEditing(false)}
                        className="btn-secondary"
                      >
                        Cancel
                      </button>
                      <button
                        type="submit"
                        disabled={loading}
                        className="btn-primary"
                      >
                        {loading ? (
                          <span className="flex items-center space-x-2">
                            <svg className="animate-spin w-5 h-5" viewBox="0 0 24 24">
                              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                            </svg>
                            <span>Saving...</span>
                          </span>
                        ) : (
                          'Save Changes'
                        )}
                      </button>
                    </motion.div>
                  )}
                </form>
              </motion.div>
            )}

            {activeTab === 'medical' && (
              <motion.div
                key="medical"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="glass-card p-6"
              >
                <h3 className="text-xl font-semibold text-gray-800 mb-6">Medical History</h3>
                
                <div className="space-y-6">
                  {/* Health Conditions */}
                  <div className="p-4 bg-gray-50 rounded-xl">
                    <h4 className="font-medium text-gray-800 mb-4">Health Conditions</h4>
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                      {['None', 'Diabetes', 'Hypertension', 'Heart Disease', 'HIV/AIDS', 'Hepatitis', 'Cancer', 'Anemia', 'Other'].map((condition) => (
                        <label key={condition} className="flex items-center space-x-2 cursor-pointer">
                          <input
                            type="checkbox"
                            className="w-5 h-5 rounded text-primary-500 focus:ring-primary-500"
                            defaultChecked={condition === 'None'}
                          />
                          <span className="text-gray-700">{condition}</span>
                        </label>
                      ))}
                    </div>
                  </div>

                  {/* Recent Medications */}
                  <div className="p-4 bg-gray-50 rounded-xl">
                    <h4 className="font-medium text-gray-800 mb-4">Currently Taking Any Medications?</h4>
                    <div className="flex space-x-4 mb-4">
                      <label className="flex items-center space-x-2 cursor-pointer">
                        <input type="radio" name="medications" className="w-5 h-5 text-primary-500" />
                        <span>No</span>
                      </label>
                      <label className="flex items-center space-x-2 cursor-pointer">
                        <input type="radio" name="medications" className="w-5 h-5 text-primary-500" />
                        <span>Yes</span>
                      </label>
                    </div>
                    <textarea
                      className="input-field"
                      placeholder="If yes, please list the medications..."
                      rows={2}
                    />
                  </div>

                  {/* Recent Procedures */}
                  <div className="p-4 bg-gray-50 rounded-xl">
                    <h4 className="font-medium text-gray-800 mb-4">Recent Medical Procedures (Last 6 months)</h4>
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                      {['None', 'Surgery', 'Blood Transfusion', 'Dental Procedure', 'Tattoo/Piercing', 'Vaccination'].map((procedure) => (
                        <label key={procedure} className="flex items-center space-x-2 cursor-pointer">
                          <input
                            type="checkbox"
                            className="w-5 h-5 rounded text-primary-500 focus:ring-primary-500"
                            defaultChecked={procedure === 'None'}
                          />
                          <span className="text-gray-700">{procedure}</span>
                        </label>
                      ))}
                    </div>
                  </div>

                  {/* Weight and Health */}
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Weight (kg)</label>
                      <input type="number" className="input-field" defaultValue="70" />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Height (cm)</label>
                      <input type="number" className="input-field" defaultValue="175" />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Last Donation Date</label>
                      <input type="date" className="input-field" defaultValue="2024-06-20" />
                    </div>
                  </div>

                  <div className="flex justify-end">
                    <button className="btn-primary">Update Medical Info</button>
                  </div>
                </div>
              </motion.div>
            )}

            {activeTab === 'preferences' && (
              <motion.div
                key="preferences"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="glass-card p-6"
              >
                <h3 className="text-xl font-semibold text-gray-800 mb-6">Donation Preferences</h3>
                
                <div className="space-y-6">
                  {/* Notification Preferences */}
                  <div className="p-4 bg-gray-50 rounded-xl">
                    <h4 className="font-medium text-gray-800 mb-4">Notification Preferences</h4>
                    <div className="space-y-4">
                      {[
                        { id: 'emergency', label: 'Emergency blood requests', desc: 'Get notified for urgent requests in your area' },
                        { id: 'eligible', label: 'Eligibility reminders', desc: 'Remind me when I\'m eligible to donate again' },
                        { id: 'appointments', label: 'Appointment reminders', desc: 'Send reminders for scheduled appointments' },
                        { id: 'promotions', label: 'Events & promotions', desc: 'News about blood drives and community events' },
                      ].map((pref) => (
                        <div key={pref.id} className="flex items-center justify-between">
                          <div>
                            <p className="font-medium text-gray-800">{pref.label}</p>
                            <p className="text-sm text-gray-500">{pref.desc}</p>
                          </div>
                          <label className="relative inline-flex items-center cursor-pointer">
                            <input type="checkbox" className="sr-only peer" defaultChecked />
                            <div className="w-11 h-6 bg-gray-300 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary-500"></div>
                          </label>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Location Settings */}
                  <div className="p-4 bg-gray-50 rounded-xl">
                    <h4 className="font-medium text-gray-800 mb-4">Location Settings</h4>
                    <div className="space-y-4">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="font-medium text-gray-800">Share my location</p>
                          <p className="text-sm text-gray-500">Allow nearby hospitals to find you for emergency requests</p>
                        </div>
                        <label className="relative inline-flex items-center cursor-pointer">
                          <input type="checkbox" className="sr-only peer" defaultChecked />
                          <div className="w-11 h-6 bg-gray-300 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary-500"></div>
                        </label>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Maximum travel distance</label>
                        <select className="input-field">
                          <option value="5">5 km</option>
                          <option value="10" selected>10 km</option>
                          <option value="25">25 km</option>
                          <option value="50">50 km</option>
                          <option value="100">Any distance</option>
                        </select>
                      </div>
                    </div>
                  </div>

                  {/* Availability */}
                  <div className="p-4 bg-gray-50 rounded-xl">
                    <h4 className="font-medium text-gray-800 mb-4">Availability</h4>
                    <div className="space-y-4">
                      <div>
                        <p className="font-medium text-gray-700 mb-2">Preferred donation days</p>
                        <div className="flex flex-wrap gap-2">
                          {['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].map((day, index) => (
                            <button
                              key={day}
                              className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                                [0, 5, 6].includes(index)
                                  ? 'bg-primary-500 text-white'
                                  : 'bg-white text-gray-600 hover:bg-gray-100'
                              }`}
                            >
                              {day}
                            </button>
                          ))}
                        </div>
                      </div>
                      <div>
                        <p className="font-medium text-gray-700 mb-2">Preferred time slots</p>
                        <div className="flex flex-wrap gap-2">
                          {['Morning (8-12)', 'Afternoon (12-5)', 'Evening (5-8)'].map((time, index) => (
                            <button
                              key={time}
                              className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                                index === 0
                                  ? 'bg-primary-500 text-white'
                                  : 'bg-white text-gray-600 hover:bg-gray-100'
                              }`}
                            >
                              {time}
                            </button>
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="flex justify-end">
                    <button className="btn-primary">Save Preferences</button>
                  </div>
                </div>
              </motion.div>
            )}

            {activeTab === 'achievements' && (
              <motion.div
                key="achievements"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="glass-card p-6"
              >
                <div className="flex justify-between items-center mb-6">
                  <div>
                    <h3 className="text-xl font-semibold text-gray-800">Achievements & Badges</h3>
                    <p className="text-gray-500">Your donation milestones and recognition</p>
                  </div>
                  <div className="text-right">
                    <p className="text-3xl font-bold text-primary-600">3/8</p>
                    <p className="text-sm text-gray-500">Badges Unlocked</p>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                  {achievements.map((badge) => (
                    <motion.div
                      key={badge.id}
                      whileHover={{ scale: 1.02 }}
                      className={`p-4 rounded-xl border-2 transition-all ${
                        badge.unlocked
                          ? 'border-primary-200 bg-gradient-to-br from-primary-50 to-white'
                          : 'border-gray-200 bg-gray-50 opacity-60'
                      }`}
                    >
                      <div className="text-center">
                        <div className={`text-4xl mb-2 ${badge.unlocked ? '' : 'grayscale'}`}>
                          {badge.icon}
                        </div>
                        <h4 className="font-semibold text-gray-800">{badge.name}</h4>
                        <p className="text-xs text-gray-500 mt-1">{badge.description}</p>
                        
                        {badge.unlocked ? (
                          <p className="text-xs text-green-600 mt-2">
                            ✓ Unlocked on {badge.date}
                          </p>
                        ) : (
                          <div className="mt-2">
                            <div className="w-full bg-gray-200 rounded-full h-2">
                              <div
                                className="bg-primary-500 h-2 rounded-full"
                                style={{ width: `${(badge.progress / 10) * 100}%` }}
                              />
                            </div>
                            <p className="text-xs text-gray-500 mt-1">
                              {badge.progress}/{badge.name === 'Champion' ? 10 : badge.name === 'Super Hero' ? 25 : badge.name === 'Community Hero' ? 3 : 1} completed
                            </p>
                          </div>
                        )}
                      </div>
                    </motion.div>
                  ))}
                </div>

                {/* Points Summary */}
                <div className="mt-8 p-6 bg-gradient-to-r from-primary-500 to-primary-600 rounded-xl text-white">
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="text-lg font-semibold">Total Points Earned</h4>
                      <p className="text-primary-100">Keep donating to earn more!</p>
                    </div>
                    <div className="text-right">
                      <p className="text-4xl font-bold">600</p>
                      <p className="text-primary-100">points</p>
                    </div>
                  </div>
                  <div className="mt-4 flex items-center justify-between text-sm">
                    <span>400 more points to reach Champion level</span>
                    <button className="bg-white/20 hover:bg-white/30 px-4 py-2 rounded-lg transition-colors">
                      View Rewards →
                    </button>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
    </div>
  );
};

export default DonorProfile;
