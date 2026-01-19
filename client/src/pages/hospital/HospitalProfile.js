import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useForm } from 'react-hook-form';

const HospitalProfile = () => {
  const [activeTab, setActiveTab] = useState('info');
  const [isEditing, setIsEditing] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);

  // Mock hospital data
  const [hospitalData, setHospitalData] = useState({
    name: 'City General Hospital',
    type: 'General Hospital',
    license: 'HOSP-2024-12345',
    verified: true,
    rating: 4.8,
    totalDonations: 15420,
    address: {
      street: '123 Medical Center Drive',
      city: 'New York',
      state: 'NY',
      zip: '10001',
      country: 'United States'
    },
    contact: {
      phone: '+1 (212) 555-0123',
      emergency: '+1 (212) 555-0199',
      email: 'contact@citygeneralhospital.com',
      website: 'www.citygeneralhospital.com'
    },
    operatingHours: {
      monday: { open: '06:00', close: '22:00', closed: false },
      tuesday: { open: '06:00', close: '22:00', closed: false },
      wednesday: { open: '06:00', close: '22:00', closed: false },
      thursday: { open: '06:00', close: '22:00', closed: false },
      friday: { open: '06:00', close: '22:00', closed: false },
      saturday: { open: '08:00', close: '18:00', closed: false },
      sunday: { open: '08:00', close: '14:00', closed: false }
    },
    services: [
      'Whole Blood Donation',
      'Platelet Donation',
      'Plasma Donation',
      'Blood Testing',
      'Blood Storage',
      'Emergency Blood Supply',
      'Mobile Blood Drives'
    ],
    facilities: [
      'Modern Donation Center',
      'Waiting Lounge',
      'Refreshment Area',
      'Wheelchair Accessible',
      'Parking Available',
      'WiFi Available'
    ],
    description: 'City General Hospital is a leading healthcare facility with a state-of-the-art blood bank serving the greater New York area. Our dedicated team ensures a safe and comfortable donation experience for all donors.'
  });

  const { register, handleSubmit, formState: { errors } } = useForm({
    defaultValues: hospitalData
  });

  const onSubmit = (data) => {
    setHospitalData({ ...hospitalData, ...data });
    setIsEditing(false);
    setShowSuccess(true);
    setTimeout(() => setShowSuccess(false), 3000);
  };

  const tabs = [
    { id: 'info', label: 'Basic Info', icon: '🏥' },
    { id: 'contact', label: 'Contact', icon: '📞' },
    { id: 'hours', label: 'Operating Hours', icon: '🕐' },
    { id: 'services', label: 'Services', icon: '🩺' }
  ];

  const days = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'];

  return (
    <div className="p-6 lg:p-8">
          {/* Success Toast */}
          <AnimatePresence>
            {showSuccess && (
              <motion.div
                initial={{ opacity: 0, y: -50 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -50 }}
                className="fixed top-20 right-6 z-50 bg-green-500 text-white px-6 py-4 rounded-xl shadow-lg"
              >
                <div className="flex items-center space-x-3">
                  <span className="text-xl">✓</span>
                  <span>Profile updated successfully!</span>
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
            <div className="flex flex-col md:flex-row md:items-center md:justify-between">
              <div>
                <h1 className="text-3xl font-bold text-gray-800">Hospital Profile</h1>
                <p className="text-gray-600 mt-1">Manage your hospital's public profile and information</p>
              </div>
              <button
                onClick={() => setIsEditing(!isEditing)}
                className={`mt-4 md:mt-0 ${isEditing ? 'btn-secondary' : 'btn-primary'}`}
              >
                {isEditing ? 'Cancel Editing' : 'Edit Profile'}
              </button>
            </div>
          </motion.div>

          {/* Profile Header Card */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="glass-card p-6 mb-6"
          >
            <div className="flex flex-col md:flex-row md:items-center space-y-4 md:space-y-0 md:space-x-6">
              {/* Hospital Logo */}
              <div className="w-24 h-24 bg-gradient-to-br from-primary-400 to-primary-600 rounded-2xl flex items-center justify-center text-white text-3xl font-bold shadow-lg shadow-primary-500/30">
                🏥
              </div>
              
              {/* Hospital Info */}
              <div className="flex-1">
                <div className="flex items-center space-x-3">
                  <h2 className="text-2xl font-bold text-gray-800">{hospitalData.name}</h2>
                  {hospitalData.verified && (
                    <span className="bg-green-100 text-green-700 px-3 py-1 rounded-full text-sm font-medium flex items-center">
                      <svg className="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                      </svg>
                      Verified
                    </span>
                  )}
                </div>
                <p className="text-gray-500 mt-1">{hospitalData.type}</p>
                <p className="text-sm text-gray-400">License: {hospitalData.license}</p>
              </div>

              {/* Stats */}
              <div className="flex space-x-6">
                <div className="text-center">
                  <div className="text-3xl font-bold text-primary-600">{hospitalData.rating}</div>
                  <div className="text-sm text-gray-500">Rating</div>
                  <div className="flex text-yellow-400 text-sm mt-1">
                    {'★'.repeat(Math.floor(hospitalData.rating))}
                    {'☆'.repeat(5 - Math.floor(hospitalData.rating))}
                  </div>
                </div>
                <div className="text-center">
                  <div className="text-3xl font-bold text-secondary-600">{hospitalData.totalDonations.toLocaleString()}</div>
                  <div className="text-sm text-gray-500">Total Donations</div>
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
                className={`flex items-center space-x-2 px-4 py-2 rounded-xl font-medium whitespace-nowrap transition-all ${
                  activeTab === tab.id
                    ? 'bg-primary-500 text-white shadow-lg shadow-primary-500/30'
                    : 'bg-white text-gray-600 hover:bg-gray-100'
                }`}
              >
                <span>{tab.icon}</span>
                <span>{tab.label}</span>
              </button>
            ))}
          </motion.div>

          {/* Tab Content */}
          <form onSubmit={handleSubmit(onSubmit)}>
            <AnimatePresence mode="wait">
              {/* Basic Info */}
              {activeTab === 'info' && (
                <motion.div
                  key="info"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  className="glass-card p-6"
                >
                  <h3 className="text-xl font-semibold text-gray-800 mb-6">Basic Information</h3>
                  
                  <div className="grid md:grid-cols-2 gap-6">
                    {/* Hospital Name */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Hospital Name</label>
                      {isEditing ? (
                        <input
                          type="text"
                          {...register('name', { required: 'Hospital name is required' })}
                          className="input-field"
                        />
                      ) : (
                        <p className="text-gray-800 py-2">{hospitalData.name}</p>
                      )}
                    </div>

                    {/* Hospital Type */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Hospital Type</label>
                      {isEditing ? (
                        <select {...register('type')} className="input-field">
                          <option value="General Hospital">General Hospital</option>
                          <option value="Blood Bank">Blood Bank</option>
                          <option value="Medical Center">Medical Center</option>
                          <option value="Specialty Hospital">Specialty Hospital</option>
                        </select>
                      ) : (
                        <p className="text-gray-800 py-2">{hospitalData.type}</p>
                      )}
                    </div>

                    {/* Address */}
                    <div className="md:col-span-2">
                      <label className="block text-sm font-medium text-gray-700 mb-2">Street Address</label>
                      {isEditing ? (
                        <input
                          type="text"
                          {...register('address.street')}
                          className="input-field"
                        />
                      ) : (
                        <p className="text-gray-800 py-2">{hospitalData.address.street}</p>
                      )}
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">City</label>
                      {isEditing ? (
                        <input
                          type="text"
                          {...register('address.city')}
                          className="input-field"
                        />
                      ) : (
                        <p className="text-gray-800 py-2">{hospitalData.address.city}</p>
                      )}
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">State</label>
                      {isEditing ? (
                        <input
                          type="text"
                          {...register('address.state')}
                          className="input-field"
                        />
                      ) : (
                        <p className="text-gray-800 py-2">{hospitalData.address.state}</p>
                      )}
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">ZIP Code</label>
                      {isEditing ? (
                        <input
                          type="text"
                          {...register('address.zip')}
                          className="input-field"
                        />
                      ) : (
                        <p className="text-gray-800 py-2">{hospitalData.address.zip}</p>
                      )}
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Country</label>
                      {isEditing ? (
                        <input
                          type="text"
                          {...register('address.country')}
                          className="input-field"
                        />
                      ) : (
                        <p className="text-gray-800 py-2">{hospitalData.address.country}</p>
                      )}
                    </div>

                    {/* Description */}
                    <div className="md:col-span-2">
                      <label className="block text-sm font-medium text-gray-700 mb-2">Description</label>
                      {isEditing ? (
                        <textarea
                          {...register('description')}
                          rows={4}
                          className="input-field"
                        />
                      ) : (
                        <p className="text-gray-800 py-2">{hospitalData.description}</p>
                      )}
                    </div>
                  </div>
                </motion.div>
              )}

              {/* Contact Info */}
              {activeTab === 'contact' && (
                <motion.div
                  key="contact"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  className="glass-card p-6"
                >
                  <h3 className="text-xl font-semibold text-gray-800 mb-6">Contact Information</h3>
                  
                  <div className="grid md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Phone Number</label>
                      {isEditing ? (
                        <input
                          type="tel"
                          {...register('contact.phone')}
                          className="input-field"
                        />
                      ) : (
                        <div className="flex items-center space-x-3 py-2">
                          <span className="text-2xl">📞</span>
                          <span className="text-gray-800">{hospitalData.contact.phone}</span>
                        </div>
                      )}
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Emergency Hotline</label>
                      {isEditing ? (
                        <input
                          type="tel"
                          {...register('contact.emergency')}
                          className="input-field"
                        />
                      ) : (
                        <div className="flex items-center space-x-3 py-2">
                          <span className="text-2xl">🚨</span>
                          <span className="text-red-600 font-medium">{hospitalData.contact.emergency}</span>
                        </div>
                      )}
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Email Address</label>
                      {isEditing ? (
                        <input
                          type="email"
                          {...register('contact.email')}
                          className="input-field"
                        />
                      ) : (
                        <div className="flex items-center space-x-3 py-2">
                          <span className="text-2xl">✉️</span>
                          <span className="text-gray-800">{hospitalData.contact.email}</span>
                        </div>
                      )}
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Website</label>
                      {isEditing ? (
                        <input
                          type="url"
                          {...register('contact.website')}
                          className="input-field"
                        />
                      ) : (
                        <div className="flex items-center space-x-3 py-2">
                          <span className="text-2xl">🌐</span>
                          <a href={`https://${hospitalData.contact.website}`} className="text-primary-600 hover:underline" target="_blank" rel="noopener noreferrer">
                            {hospitalData.contact.website}
                          </a>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Map Placeholder */}
                  <div className="mt-6">
                    <label className="block text-sm font-medium text-gray-700 mb-2">Location</label>
                    <div className="h-64 bg-gray-200 rounded-xl flex items-center justify-center">
                      <div className="text-center text-gray-500">
                        <span className="text-4xl">🗺️</span>
                        <p className="mt-2">Map integration coming soon</p>
                      </div>
                    </div>
                  </div>
                </motion.div>
              )}

              {/* Operating Hours */}
              {activeTab === 'hours' && (
                <motion.div
                  key="hours"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  className="glass-card p-6"
                >
                  <h3 className="text-xl font-semibold text-gray-800 mb-6">Operating Hours</h3>
                  
                  <div className="space-y-4">
                    {days.map((day) => {
                      const hours = hospitalData.operatingHours[day];
                      return (
                        <div key={day} className="flex items-center justify-between py-3 border-b border-gray-100 last:border-0">
                          <span className="font-medium text-gray-800 capitalize w-28">{day}</span>
                          {isEditing ? (
                            <div className="flex items-center space-x-4">
                              <input
                                type="time"
                                defaultValue={hours.open}
                                className="input-field !w-32"
                              />
                              <span className="text-gray-500">to</span>
                              <input
                                type="time"
                                defaultValue={hours.close}
                                className="input-field !w-32"
                              />
                            </div>
                          ) : (
                            <span className={`${hours.closed ? 'text-red-500' : 'text-gray-600'}`}>
                              {hours.closed ? 'Closed' : `${hours.open} - ${hours.close}`}
                            </span>
                          )}
                        </div>
                      );
                    })}
                  </div>

                  <div className="mt-6 p-4 bg-blue-50 rounded-xl">
                    <div className="flex items-start space-x-3">
                      <span className="text-2xl">ℹ️</span>
                      <div>
                        <p className="font-medium text-blue-800">Blood Donation Hours</p>
                        <p className="text-sm text-blue-600 mt-1">
                          Walk-in donations accepted during all operating hours. For appointments, please schedule at least 24 hours in advance.
                        </p>
                      </div>
                    </div>
                  </div>
                </motion.div>
              )}

              {/* Services & Facilities */}
              {activeTab === 'services' && (
                <motion.div
                  key="services"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  className="space-y-6"
                >
                  {/* Services */}
                  <div className="glass-card p-6">
                    <h3 className="text-xl font-semibold text-gray-800 mb-6">Services Offered</h3>
                    
                    <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
                      {hospitalData.services.map((service, index) => (
                        <div key={index} className="flex items-center space-x-3 p-3 bg-green-50 rounded-xl">
                          <span className="w-8 h-8 bg-green-500 text-white rounded-lg flex items-center justify-center text-sm">✓</span>
                          <span className="text-gray-800">{service}</span>
                        </div>
                      ))}
                      {isEditing && (
                        <button type="button" className="flex items-center justify-center space-x-2 p-3 border-2 border-dashed border-gray-300 rounded-xl text-gray-500 hover:border-primary-400 hover:text-primary-500 transition-colors">
                          <span>+</span>
                          <span>Add Service</span>
                        </button>
                      )}
                    </div>
                  </div>

                  {/* Facilities */}
                  <div className="glass-card p-6">
                    <h3 className="text-xl font-semibold text-gray-800 mb-6">Facilities & Amenities</h3>
                    
                    <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
                      {hospitalData.facilities.map((facility, index) => (
                        <div key={index} className="flex items-center space-x-3 p-3 bg-blue-50 rounded-xl">
                          <span className="w-8 h-8 bg-blue-500 text-white rounded-lg flex items-center justify-center">
                            {facility.includes('Parking') ? '🅿️' : 
                             facility.includes('WiFi') ? '📶' : 
                             facility.includes('Wheelchair') ? '♿' : 
                             facility.includes('Waiting') ? '🛋️' : 
                             facility.includes('Refreshment') ? '☕' : '🏢'}
                          </span>
                          <span className="text-gray-800">{facility}</span>
                        </div>
                      ))}
                      {isEditing && (
                        <button type="button" className="flex items-center justify-center space-x-2 p-3 border-2 border-dashed border-gray-300 rounded-xl text-gray-500 hover:border-primary-400 hover:text-primary-500 transition-colors">
                          <span>+</span>
                          <span>Add Facility</span>
                        </button>
                      )}
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Save Button */}
            {isEditing && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
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
                <button type="submit" className="btn-primary">
                  Save Changes
                </button>
              </motion.div>
            )}
          </form>
    </div>
  );
};

export default HospitalProfile;
