import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { donorAPI } from '../../services/api';

const bloodTypes = ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'];

const FindDonors = () => {
  const [donors, setDonors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({
    bloodGroup: '',
    distance: 25,
    availability: 'all'
  });
  const [selectedDonor, setSelectedDonor] = useState(null);
  const [showContactModal, setShowContactModal] = useState(false);

  useEffect(() => {
    fetchDonors();
  }, [filters]);

  const fetchDonors = async () => {
    setLoading(true);
    try {
      const response = await donorAPI.searchDonors(filters);
      setDonors(response.data.data || mockDonors);
    } catch (error) {
      console.error('Error fetching donors:', error);
      setDonors(mockDonors);
    }
    setLoading(false);
  };

  // Mock data
  const mockDonors = [
    {
      id: 1,
      name: 'Michael Johnson',
      bloodGroup: 'O+',
      distance: 2.5,
      donations: 12,
      lastDonation: '2024-06-01',
      eligible: true,
      verified: true,
      rating: 4.9,
      responseTime: 'Usually responds within 1 hour',
      city: 'New York'
    },
    {
      id: 2,
      name: 'Sarah Williams',
      bloodGroup: 'O-',
      distance: 4.2,
      donations: 8,
      lastDonation: '2024-05-15',
      eligible: true,
      verified: true,
      rating: 4.8,
      responseTime: 'Usually responds within 2 hours',
      city: 'New York'
    },
    {
      id: 3,
      name: 'David Brown',
      bloodGroup: 'A+',
      distance: 6.8,
      donations: 5,
      lastDonation: '2024-07-20',
      eligible: false,
      verified: true,
      rating: 4.7,
      responseTime: 'Usually responds within 1 hour',
      city: 'Brooklyn'
    },
    {
      id: 4,
      name: 'Emily Davis',
      bloodGroup: 'B+',
      distance: 8.5,
      donations: 15,
      lastDonation: '2024-04-10',
      eligible: true,
      verified: true,
      rating: 5.0,
      responseTime: 'Usually responds within 30 minutes',
      city: 'Queens'
    },
    {
      id: 5,
      name: 'Robert Wilson',
      bloodGroup: 'AB+',
      distance: 10.2,
      donations: 3,
      lastDonation: '2024-06-25',
      eligible: true,
      verified: false,
      rating: 4.5,
      responseTime: 'Usually responds within 3 hours',
      city: 'Manhattan'
    },
    {
      id: 6,
      name: 'Jennifer Taylor',
      bloodGroup: 'A-',
      distance: 12.7,
      donations: 20,
      lastDonation: '2024-03-15',
      eligible: true,
      verified: true,
      rating: 4.9,
      responseTime: 'Usually responds within 1 hour',
      city: 'Bronx'
    },
  ];

  const filteredDonors = donors.filter(donor => {
    if (filters.bloodGroup && donor.bloodGroup !== filters.bloodGroup) return false;
    if (donor.distance > filters.distance) return false;
    if (filters.availability === 'eligible' && !donor.eligible) return false;
    return true;
  });

  const handleContact = (donor) => {
    setSelectedDonor(donor);
    setShowContactModal(true);
  };

  const sendRequest = async () => {
    try {
      // await donorAPI.contactDonor(selectedDonor.id);
      setShowContactModal(false);
      setSelectedDonor(null);
      // Show success notification
    } catch (error) {
      console.error('Error contacting donor:', error);
    }
  };

  const getBloodGroupColor = (bloodGroup) => {
    const colors = {
      'O+': 'from-red-500 to-red-600',
      'O-': 'from-red-600 to-red-700',
      'A+': 'from-blue-500 to-blue-600',
      'A-': 'from-blue-600 to-blue-700',
      'B+': 'from-green-500 to-green-600',
      'B-': 'from-green-600 to-green-700',
      'AB+': 'from-purple-500 to-purple-600',
      'AB-': 'from-purple-600 to-purple-700',
    };
    return colors[bloodGroup] || 'from-gray-500 to-gray-600';
  };

  return (
    <div className="p-6 lg:p-8">
          {/* Header */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-8"
          >
            <h1 className="text-3xl font-bold text-gray-800">Find Donors</h1>
            <p className="text-gray-600 mt-1">Search for blood donors in your area</p>
          </motion.div>

          {/* Filters */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="glass-card p-6 mb-6"
          >
            <div className="flex flex-col lg:flex-row lg:items-end gap-4">
              {/* Blood Group */}
              <div className="flex-1">
                <label className="block text-sm font-medium text-gray-700 mb-2">Blood Group</label>
                <select
                  value={filters.bloodGroup}
                  onChange={(e) => setFilters({ ...filters, bloodGroup: e.target.value })}
                  className="input-field"
                >
                  <option value="">All Blood Types</option>
                  {bloodTypes.map(type => (
                    <option key={type} value={type}>{type}</option>
                  ))}
                </select>
              </div>

              {/* Distance */}
              <div className="flex-1">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Maximum Distance: {filters.distance} km
                </label>
                <input
                  type="range"
                  min="5"
                  max="50"
                  value={filters.distance}
                  onChange={(e) => setFilters({ ...filters, distance: parseInt(e.target.value) })}
                  className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
                />
              </div>

              {/* Availability */}
              <div className="flex-1">
                <label className="block text-sm font-medium text-gray-700 mb-2">Availability</label>
                <select
                  value={filters.availability}
                  onChange={(e) => setFilters({ ...filters, availability: e.target.value })}
                  className="input-field"
                >
                  <option value="all">All Donors</option>
                  <option value="eligible">Eligible to Donate</option>
                </select>
              </div>

              {/* Search Button */}
              <button
                onClick={fetchDonors}
                className="btn-primary flex items-center space-x-2"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
                <span>Search</span>
              </button>
            </div>
          </motion.div>

          {/* Results Count */}
          <div className="flex justify-between items-center mb-4">
            <p className="text-gray-600">
              Found <span className="font-semibold text-gray-800">{filteredDonors.length}</span> donors
            </p>
            <div className="flex items-center space-x-2">
              <span className="text-sm text-gray-500">Sort by:</span>
              <select className="input-field w-auto text-sm py-2">
                <option>Distance</option>
                <option>Rating</option>
                <option>Donations</option>
              </select>
            </div>
          </div>

          {/* Donors Grid */}
          {loading ? (
            <div className="flex items-center justify-center py-20">
              <div className="text-center">
                <div className="animate-spin w-12 h-12 border-4 border-primary-500 border-t-transparent rounded-full mx-auto"></div>
                <p className="text-gray-500 mt-4">Searching donors...</p>
              </div>
            </div>
          ) : filteredDonors.length === 0 ? (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="text-center py-20 glass-card"
            >
              <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-10 h-10 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                </svg>
              </div>
              <h3 className="text-xl font-semibold text-gray-800 mb-2">No donors found</h3>
              <p className="text-gray-500">Try adjusting your search filters or increasing the distance.</p>
            </motion.div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredDonors.map((donor, index) => (
                <motion.div
                  key={donor.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.05 }}
                  className="glass-card overflow-hidden hover:shadow-lg transition-all"
                >
                  {/* Card Header */}
                  <div className={`bg-gradient-to-r ${getBloodGroupColor(donor.bloodGroup)} p-4`}>
                    <div className="flex justify-between items-start">
                      <div className="flex items-center space-x-3">
                        <div className="w-14 h-14 bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center text-white text-xl font-bold">
                          {donor.name.charAt(0)}
                        </div>
                        <div className="text-white">
                          <h3 className="font-semibold">{donor.name}</h3>
                          <p className="text-sm opacity-90">{donor.city}</p>
                        </div>
                      </div>
                      <div className="text-white text-center">
                        <div className="text-2xl font-bold">{donor.bloodGroup}</div>
                        {donor.verified && (
                          <span className="text-xs bg-white/20 px-2 py-0.5 rounded-full">✓ Verified</span>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Card Body */}
                  <div className="p-4 space-y-4">
                    {/* Stats */}
                    <div className="flex justify-between text-center">
                      <div>
                        <p className="text-2xl font-bold text-gray-800">{donor.donations}</p>
                        <p className="text-xs text-gray-500">Donations</p>
                      </div>
                      <div>
                        <p className="text-2xl font-bold text-gray-800">{donor.distance}</p>
                        <p className="text-xs text-gray-500">km away</p>
                      </div>
                      <div>
                        <p className="text-2xl font-bold text-yellow-500">⭐ {donor.rating}</p>
                        <p className="text-xs text-gray-500">Rating</p>
                      </div>
                    </div>

                    {/* Status */}
                    <div className="flex items-center justify-between">
                      <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                        donor.eligible
                          ? 'bg-green-100 text-green-700'
                          : 'bg-yellow-100 text-yellow-700'
                      }`}>
                        {donor.eligible ? '✓ Available to Donate' : '⏳ Not Eligible Yet'}
                      </span>
                    </div>

                    {/* Response Time */}
                    <p className="text-sm text-gray-500 flex items-center">
                      <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                      {donor.responseTime}
                    </p>

                    {/* Last Donation */}
                    <p className="text-sm text-gray-500">
                      Last donated: {new Date(donor.lastDonation).toLocaleDateString('en-US', {
                        month: 'short',
                        day: 'numeric',
                        year: 'numeric'
                      })}
                    </p>
                  </div>

                  {/* Card Footer */}
                  <div className="p-4 bg-gray-50 flex items-center justify-between">
                    <button
                      onClick={() => setSelectedDonor(donor)}
                      className="text-gray-600 hover:text-primary-600 font-medium text-sm"
                    >
                      View Profile
                    </button>
                    <button
                      onClick={() => handleContact(donor)}
                      disabled={!donor.eligible}
                      className={`px-4 py-2 rounded-lg font-medium text-sm transition-colors ${
                        donor.eligible
                          ? 'bg-primary-500 text-white hover:bg-primary-600'
                          : 'bg-gray-200 text-gray-400 cursor-not-allowed'
                      }`}
                    >
                      Contact Donor
                    </button>
                  </div>
                </motion.div>
              ))}
            </div>
          )}

          {/* Contact Modal */}
          <AnimatePresence>
            {showContactModal && selectedDonor && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
                onClick={() => setShowContactModal(false)}
              >
                <motion.div
                  initial={{ scale: 0.9, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  exit={{ scale: 0.9, opacity: 0 }}
                  className="bg-white rounded-2xl shadow-xl max-w-lg w-full overflow-hidden"
                  onClick={(e) => e.stopPropagation()}
                >
                  <div className={`bg-gradient-to-r ${getBloodGroupColor(selectedDonor.bloodGroup)} px-6 py-4`}>
                    <h3 className="text-xl font-semibold text-white">Contact Donor</h3>
                  </div>
                  
                  <div className="p-6 space-y-4">
                    <div className="flex items-center space-x-4">
                      <div className="w-16 h-16 bg-primary-100 rounded-full flex items-center justify-center text-primary-600 text-2xl font-bold">
                        {selectedDonor.name.charAt(0)}
                      </div>
                      <div>
                        <h4 className="font-semibold text-gray-800">{selectedDonor.name}</h4>
                        <p className="text-gray-500">{selectedDonor.bloodGroup} • {selectedDonor.city}</p>
                        <div className="flex items-center space-x-2 mt-1">
                          <span className="text-yellow-500">⭐ {selectedDonor.rating}</span>
                          <span className="text-gray-400">•</span>
                          <span className="text-gray-500">{selectedDonor.donations} donations</span>
                        </div>
                      </div>
                    </div>

                    <div className="p-4 bg-blue-50 rounded-xl border border-blue-200">
                      <p className="text-sm text-blue-800">
                        <strong>Note:</strong> Please provide accurate details about your blood requirement. 
                        The donor will review your request and respond accordingly.
                      </p>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Your Message
                      </label>
                      <textarea
                        className="input-field"
                        rows={4}
                        placeholder="Describe your blood requirement, urgency, hospital location, etc."
                        defaultValue={`Hi ${selectedDonor.name.split(' ')[0]},\n\nI am looking for ${selectedDonor.bloodGroup} blood. Please let me know if you are available to donate.\n\nThank you!`}
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Units Needed</label>
                        <select className="input-field">
                          <option>1 Unit</option>
                          <option>2 Units</option>
                          <option>3 Units</option>
                        </select>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Urgency</label>
                        <select className="input-field">
                          <option>Normal</option>
                          <option>Urgent</option>
                          <option>Critical</option>
                        </select>
                      </div>
                    </div>
                  </div>

                  <div className="px-6 py-4 bg-gray-50 flex justify-end space-x-3">
                    <button
                      onClick={() => setShowContactModal(false)}
                      className="btn-secondary"
                    >
                      Cancel
                    </button>
                    <button
                      onClick={sendRequest}
                      className="btn-primary"
                    >
                      Send Request
                    </button>
                  </div>
                </motion.div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Donor Profile Modal */}
          <AnimatePresence>
            {selectedDonor && !showContactModal && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
                onClick={() => setSelectedDonor(null)}
              >
                <motion.div
                  initial={{ scale: 0.9, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  exit={{ scale: 0.9, opacity: 0 }}
                  className="bg-white rounded-2xl shadow-xl max-w-lg w-full overflow-hidden"
                  onClick={(e) => e.stopPropagation()}
                >
                  <div className={`bg-gradient-to-r ${getBloodGroupColor(selectedDonor.bloodGroup)} px-6 py-6`}>
                    <div className="flex items-center space-x-4">
                      <div className="w-20 h-20 bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center text-white text-3xl font-bold">
                        {selectedDonor.name.charAt(0)}
                      </div>
                      <div className="text-white">
                        <h3 className="text-2xl font-bold">{selectedDonor.name}</h3>
                        <p className="opacity-90">{selectedDonor.city}</p>
                        {selectedDonor.verified && (
                          <span className="inline-flex items-center mt-2 text-sm bg-white/20 px-3 py-1 rounded-full">
                            ✓ Verified Donor
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                  
                  <div className="p-6 space-y-6">
                    {/* Stats */}
                    <div className="grid grid-cols-3 gap-4 text-center">
                      <div className="p-3 bg-gray-50 rounded-xl">
                        <p className="text-2xl font-bold text-primary-600">{selectedDonor.bloodGroup}</p>
                        <p className="text-xs text-gray-500">Blood Type</p>
                      </div>
                      <div className="p-3 bg-gray-50 rounded-xl">
                        <p className="text-2xl font-bold text-gray-800">{selectedDonor.donations}</p>
                        <p className="text-xs text-gray-500">Donations</p>
                      </div>
                      <div className="p-3 bg-gray-50 rounded-xl">
                        <p className="text-2xl font-bold text-yellow-500">⭐ {selectedDonor.rating}</p>
                        <p className="text-xs text-gray-500">Rating</p>
                      </div>
                    </div>

                    {/* Details */}
                    <div className="space-y-3">
                      <div className="flex items-center text-gray-600">
                        <svg className="w-5 h-5 mr-3 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                        </svg>
                        {selectedDonor.distance} km away
                      </div>
                      <div className="flex items-center text-gray-600">
                        <svg className="w-5 h-5 mr-3 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                        {selectedDonor.responseTime}
                      </div>
                      <div className="flex items-center text-gray-600">
                        <svg className="w-5 h-5 mr-3 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                        </svg>
                        Last donation: {new Date(selectedDonor.lastDonation).toLocaleDateString()}
                      </div>
                    </div>

                    {/* Availability Status */}
                    <div className={`p-4 rounded-xl ${
                      selectedDonor.eligible
                        ? 'bg-green-50 border border-green-200'
                        : 'bg-yellow-50 border border-yellow-200'
                    }`}>
                      <div className="flex items-center">
                        <span className={`text-2xl mr-3`}>
                          {selectedDonor.eligible ? '✓' : '⏳'}
                        </span>
                        <div>
                          <p className={`font-medium ${
                            selectedDonor.eligible ? 'text-green-800' : 'text-yellow-800'
                          }`}>
                            {selectedDonor.eligible ? 'Available to Donate' : 'Not Eligible Yet'}
                          </p>
                          <p className={`text-sm ${
                            selectedDonor.eligible ? 'text-green-600' : 'text-yellow-600'
                          }`}>
                            {selectedDonor.eligible
                              ? 'This donor is currently eligible and available for donation.'
                              : 'This donor recently donated and is in the recovery period.'}
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="px-6 py-4 bg-gray-50 flex justify-end space-x-3">
                    <button
                      onClick={() => setSelectedDonor(null)}
                      className="btn-secondary"
                    >
                      Close
                    </button>
                    <button
                      onClick={() => handleContact(selectedDonor)}
                      disabled={!selectedDonor.eligible}
                      className={`${
                        selectedDonor.eligible ? 'btn-primary' : 'bg-gray-200 text-gray-400 px-6 py-2 rounded-xl cursor-not-allowed'
                      }`}
                    >
                      Contact Donor
                    </button>
                  </div>
                </motion.div>
              </motion.div>
            )}
          </AnimatePresence>
    </div>
  );
};

export default FindDonors;
