import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

const HospitalsManagement = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [selectedHospital, setSelectedHospital] = useState(null);
  const [showApprovalModal, setShowApprovalModal] = useState(false);

  // Mock hospitals data
  const [hospitals] = useState([
    {
      id: 1,
      name: 'City General Hospital',
      type: 'General Hospital',
      email: 'admin@cityhospital.com',
      phone: '+1 234-567-8901',
      address: '123 Medical Center Drive, New York, NY 10001',
      status: 'verified',
      license: 'HOSP-2024-12345',
      totalDonations: 15420,
      rating: 4.8,
      activeRequests: 5,
      registeredDate: '2023-06-10',
      lastActive: '2024-12-08'
    },
    {
      id: 2,
      name: 'Metropolitan Blood Bank',
      type: 'Blood Bank',
      email: 'contact@metrobank.com',
      phone: '+1 234-567-8902',
      address: '456 Healthcare Blvd, Chicago, IL 60601',
      status: 'verified',
      license: 'BB-2024-67890',
      totalDonations: 8750,
      rating: 4.5,
      activeRequests: 8,
      registeredDate: '2023-08-15',
      lastActive: '2024-12-07'
    },
    {
      id: 3,
      name: 'Community Health Center',
      type: 'Medical Center',
      email: 'info@communityhealth.com',
      phone: '+1 234-567-8903',
      address: '789 Wellness Way, Los Angeles, CA 90001',
      status: 'pending',
      license: 'MED-2024-11111',
      totalDonations: 0,
      rating: 0,
      activeRequests: 0,
      registeredDate: '2024-12-01',
      lastActive: '2024-12-01'
    },
    {
      id: 4,
      name: 'Regional Medical Center',
      type: 'General Hospital',
      email: 'admin@regionalmed.com',
      phone: '+1 234-567-8904',
      address: '321 Hospital Road, Houston, TX 77001',
      status: 'suspended',
      license: 'HOSP-2023-54321',
      totalDonations: 4200,
      rating: 3.2,
      activeRequests: 0,
      registeredDate: '2023-03-20',
      lastActive: '2024-09-15'
    },
    {
      id: 5,
      name: 'University Hospital',
      type: 'Teaching Hospital',
      email: 'bloodbank@university.edu',
      phone: '+1 234-567-8905',
      address: '555 Academic Drive, Boston, MA 02101',
      status: 'verified',
      license: 'HOSP-2024-99999',
      totalDonations: 22100,
      rating: 4.9,
      activeRequests: 12,
      registeredDate: '2022-01-15',
      lastActive: '2024-12-08'
    }
  ]);

  const filteredHospitals = hospitals.filter(hospital => {
    const matchesSearch = hospital.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         hospital.email.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'all' || hospital.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const getStatusBadge = (status) => {
    const styles = {
      verified: 'bg-green-100 text-green-700',
      pending: 'bg-yellow-100 text-yellow-700',
      suspended: 'bg-red-100 text-red-700',
      rejected: 'bg-gray-100 text-gray-700'
    };
    return styles[status] || 'bg-gray-100 text-gray-700';
  };

  const stats = [
    { label: 'Total Hospitals', value: hospitals.length, icon: '🏥', color: 'bg-blue-500' },
    { label: 'Verified', value: hospitals.filter(h => h.status === 'verified').length, icon: '✓', color: 'bg-green-500' },
    { label: 'Pending Review', value: hospitals.filter(h => h.status === 'pending').length, icon: '⏳', color: 'bg-yellow-500' },
    { label: 'Suspended', value: hospitals.filter(h => h.status === 'suspended').length, icon: '⚠️', color: 'bg-red-500' }
  ];

  const handleApprove = (hospital) => {
    setSelectedHospital(hospital);
    setShowApprovalModal(true);
  };

  return (
    <div className="p-6 lg:p-8">
          {/* Header */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-8"
          >
            <div className="flex flex-col md:flex-row md:items-center md:justify-between">
              <div>
                <h1 className="text-3xl font-bold text-gray-800">Hospitals Management</h1>
                <p className="text-gray-600 mt-1">Verify and manage registered hospitals and blood banks</p>
              </div>
              <button className="mt-4 md:mt-0 btn-primary">
                + Register Hospital
              </button>
            </div>
          </motion.div>

          {/* Stats */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6"
          >
            {stats.map((stat, index) => (
              <div key={index} className="glass-card p-4">
                <div className="flex items-center space-x-4">
                  <div className={`w-12 h-12 ${stat.color} rounded-xl flex items-center justify-center text-white text-xl`}>
                    {stat.icon}
                  </div>
                  <div>
                    <p className="text-2xl font-bold text-gray-800">{stat.value}</p>
                    <p className="text-sm text-gray-500">{stat.label}</p>
                  </div>
                </div>
              </div>
            ))}
          </motion.div>

          {/* Filters */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="glass-card p-4 mb-6"
          >
            <div className="flex flex-col md:flex-row md:items-center space-y-4 md:space-y-0 md:space-x-4">
              {/* Search */}
              <div className="flex-1 relative">
                <input
                  type="text"
                  placeholder="Search hospitals..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="input-field pl-10"
                />
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">🔍</span>
              </div>

              {/* Status Filter */}
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="input-field md:w-40"
              >
                <option value="all">All Status</option>
                <option value="verified">Verified</option>
                <option value="pending">Pending</option>
                <option value="suspended">Suspended</option>
              </select>
            </div>
          </motion.div>

          {/* Hospitals Grid */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="grid md:grid-cols-2 lg:grid-cols-3 gap-6"
          >
            {filteredHospitals.map((hospital, index) => (
              <motion.div
                key={hospital.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05 }}
                className="glass-card p-6 hover:shadow-xl transition-all"
              >
                {/* Header */}
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center space-x-3">
                    <div className="w-12 h-12 bg-gradient-to-br from-purple-400 to-purple-600 rounded-xl flex items-center justify-center text-white text-xl">
                      🏥
                    </div>
                    <div>
                      <h3 className="font-semibold text-gray-800">{hospital.name}</h3>
                      <p className="text-sm text-gray-500">{hospital.type}</p>
                    </div>
                  </div>
                  <span className={`px-2 py-1 rounded-full text-xs font-medium capitalize ${getStatusBadge(hospital.status)}`}>
                    {hospital.status}
                  </span>
                </div>

                {/* Info */}
                <div className="space-y-2 text-sm">
                  <div className="flex items-center space-x-2 text-gray-600">
                    <span>📧</span>
                    <span className="truncate">{hospital.email}</span>
                  </div>
                  <div className="flex items-center space-x-2 text-gray-600">
                    <span>📍</span>
                    <span className="truncate">{hospital.address}</span>
                  </div>
                  <div className="flex items-center space-x-2 text-gray-600">
                    <span>📋</span>
                    <span>License: {hospital.license}</span>
                  </div>
                </div>

                {/* Stats */}
                <div className="flex justify-between mt-4 pt-4 border-t border-gray-100">
                  <div className="text-center">
                    <p className="text-lg font-bold text-gray-800">{hospital.totalDonations.toLocaleString()}</p>
                    <p className="text-xs text-gray-500">Donations</p>
                  </div>
                  <div className="text-center">
                    <p className="text-lg font-bold text-gray-800">{hospital.rating || '-'}</p>
                    <p className="text-xs text-gray-500">Rating</p>
                  </div>
                  <div className="text-center">
                    <p className="text-lg font-bold text-gray-800">{hospital.activeRequests}</p>
                    <p className="text-xs text-gray-500">Active</p>
                  </div>
                </div>

                {/* Actions */}
                <div className="flex space-x-2 mt-4">
                  <button
                    onClick={() => setSelectedHospital(hospital)}
                    className="flex-1 btn-secondary text-sm py-2"
                  >
                    View Details
                  </button>
                  {hospital.status === 'pending' && (
                    <button
                      onClick={() => handleApprove(hospital)}
                      className="flex-1 btn-primary text-sm py-2"
                    >
                      Review
                    </button>
                  )}
                  {hospital.status === 'verified' && (
                    <button className="px-4 py-2 border border-red-300 text-red-600 rounded-xl text-sm hover:bg-red-50">
                      Suspend
                    </button>
                  )}
                  {hospital.status === 'suspended' && (
                    <button className="px-4 py-2 border border-green-300 text-green-600 rounded-xl text-sm hover:bg-green-50">
                      Restore
                    </button>
                  )}
                </div>
              </motion.div>
            ))}
          </motion.div>

          {/* Hospital Detail Modal */}
          <AnimatePresence>
            {selectedHospital && !showApprovalModal && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
                onClick={() => setSelectedHospital(null)}
              >
                <motion.div
                  initial={{ scale: 0.9, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  exit={{ scale: 0.9, opacity: 0 }}
                  className="bg-white rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto"
                  onClick={(e) => e.stopPropagation()}
                >
                  <div className="p-6">
                    <div className="flex items-center justify-between mb-6">
                      <h3 className="text-xl font-semibold text-gray-800">Hospital Details</h3>
                      <button
                        onClick={() => setSelectedHospital(null)}
                        className="p-2 hover:bg-gray-100 rounded-lg"
                      >
                        ✕
                      </button>
                    </div>

                    {/* Hospital Header */}
                    <div className="flex items-center space-x-4 mb-6">
                      <div className="w-16 h-16 bg-gradient-to-br from-purple-400 to-purple-600 rounded-xl flex items-center justify-center text-white text-2xl">
                        🏥
                      </div>
                      <div>
                        <h4 className="text-xl font-semibold text-gray-800">{selectedHospital.name}</h4>
                        <p className="text-gray-500">{selectedHospital.type}</p>
                        <span className={`inline-block mt-1 px-3 py-1 rounded-full text-xs font-medium capitalize ${getStatusBadge(selectedHospital.status)}`}>
                          {selectedHospital.status}
                        </span>
                      </div>
                    </div>

                    {/* Stats Grid */}
                    <div className="grid grid-cols-3 gap-4 mb-6">
                      <div className="bg-gray-50 rounded-xl p-4 text-center">
                        <p className="text-2xl font-bold text-primary-600">{selectedHospital.totalDonations.toLocaleString()}</p>
                        <p className="text-sm text-gray-500">Total Donations</p>
                      </div>
                      <div className="bg-gray-50 rounded-xl p-4 text-center">
                        <p className="text-2xl font-bold text-yellow-600">{selectedHospital.rating || '-'} ★</p>
                        <p className="text-sm text-gray-500">Rating</p>
                      </div>
                      <div className="bg-gray-50 rounded-xl p-4 text-center">
                        <p className="text-2xl font-bold text-green-600">{selectedHospital.activeRequests}</p>
                        <p className="text-sm text-gray-500">Active Requests</p>
                      </div>
                    </div>

                    {/* Details */}
                    <div className="space-y-4">
                      <div className="flex justify-between py-3 border-b border-gray-100">
                        <span className="text-gray-500">Email</span>
                        <span className="text-gray-800">{selectedHospital.email}</span>
                      </div>
                      <div className="flex justify-between py-3 border-b border-gray-100">
                        <span className="text-gray-500">Phone</span>
                        <span className="text-gray-800">{selectedHospital.phone}</span>
                      </div>
                      <div className="flex justify-between py-3 border-b border-gray-100">
                        <span className="text-gray-500">Address</span>
                        <span className="text-gray-800 text-right max-w-xs">{selectedHospital.address}</span>
                      </div>
                      <div className="flex justify-between py-3 border-b border-gray-100">
                        <span className="text-gray-500">License Number</span>
                        <span className="text-gray-800 font-mono">{selectedHospital.license}</span>
                      </div>
                      <div className="flex justify-between py-3 border-b border-gray-100">
                        <span className="text-gray-500">Registered</span>
                        <span className="text-gray-800">{new Date(selectedHospital.registeredDate).toLocaleDateString()}</span>
                      </div>
                      <div className="flex justify-between py-3">
                        <span className="text-gray-500">Last Active</span>
                        <span className="text-gray-800">{new Date(selectedHospital.lastActive).toLocaleDateString()}</span>
                      </div>
                    </div>

                    {/* Actions */}
                    <div className="mt-6 flex space-x-3">
                      <button className="flex-1 btn-secondary">Contact Hospital</button>
                      <button className="flex-1 btn-primary">Edit Details</button>
                    </div>
                  </div>
                </motion.div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Approval Modal */}
          <AnimatePresence>
            {showApprovalModal && selectedHospital && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
                onClick={() => { setShowApprovalModal(false); setSelectedHospital(null); }}
              >
                <motion.div
                  initial={{ scale: 0.9, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  exit={{ scale: 0.9, opacity: 0 }}
                  className="bg-white rounded-2xl max-w-lg w-full"
                  onClick={(e) => e.stopPropagation()}
                >
                  <div className="p-6">
                    <div className="flex items-center justify-between mb-6">
                      <h3 className="text-xl font-semibold text-gray-800">Review Hospital Registration</h3>
                      <button
                        onClick={() => { setShowApprovalModal(false); setSelectedHospital(null); }}
                        className="p-2 hover:bg-gray-100 rounded-lg"
                      >
                        ✕
                      </button>
                    </div>

                    <div className="bg-yellow-50 rounded-xl p-4 mb-6">
                      <div className="flex items-start space-x-3">
                        <span className="text-2xl">⏳</span>
                        <div>
                          <p className="font-medium text-yellow-800">Pending Verification</p>
                          <p className="text-sm text-yellow-600 mt-1">
                            Please verify the license and documentation before approval.
                          </p>
                        </div>
                      </div>
                    </div>

                    <div className="space-y-4 mb-6">
                      <div>
                        <p className="text-sm text-gray-500">Hospital Name</p>
                        <p className="font-medium text-gray-800">{selectedHospital.name}</p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-500">License Number</p>
                        <p className="font-mono text-gray-800">{selectedHospital.license}</p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-500">Registration Date</p>
                        <p className="text-gray-800">{new Date(selectedHospital.registeredDate).toLocaleDateString()}</p>
                      </div>
                    </div>

                    {/* Verification Checklist */}
                    <div className="space-y-3 mb-6">
                      <p className="font-medium text-gray-800">Verification Checklist</p>
                      {[
                        'License documentation verified',
                        'Hospital address confirmed',
                        'Contact information validated',
                        'Terms and conditions accepted'
                      ].map((item, index) => (
                        <label key={index} className="flex items-center space-x-3">
                          <input type="checkbox" className="rounded text-primary-500" />
                          <span className="text-gray-600">{item}</span>
                        </label>
                      ))}
                    </div>

                    {/* Notes */}
                    <div className="mb-6">
                      <label className="block text-sm font-medium text-gray-700 mb-2">Review Notes</label>
                      <textarea
                        rows={3}
                        className="input-field"
                        placeholder="Add any notes about this review..."
                      />
                    </div>

                    {/* Actions */}
                    <div className="flex space-x-3">
                      <button
                        onClick={() => { setShowApprovalModal(false); setSelectedHospital(null); }}
                        className="flex-1 px-4 py-3 border border-red-300 text-red-600 rounded-xl font-medium hover:bg-red-50"
                      >
                        Reject
                      </button>
                      <button className="flex-1 btn-primary">
                        Approve Hospital
                      </button>
                    </div>
                  </div>
                </motion.div>
              </motion.div>
            )}
          </AnimatePresence>
    </div>
  );
};

export default HospitalsManagement;
