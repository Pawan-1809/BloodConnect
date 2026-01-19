import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { donationAPI } from '../../services/api';

const ManageDonations = () => {
  const [donations, setDonations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');
  const [showAddModal, setShowAddModal] = useState(false);
  const [selectedDonation, setSelectedDonation] = useState(null);
  const [notification, setNotification] = useState(null);

  const bloodTypes = ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'];

  useEffect(() => {
    fetchDonations();
  }, []);

  const fetchDonations = async () => {
    setLoading(true);
    try {
      const response = await donationAPI.getAll();
      setDonations(response.data.data || mockDonations);
    } catch (error) {
      console.error('Error fetching donations:', error);
      setDonations(mockDonations);
    }
    setLoading(false);
  };

  // Mock data
  const mockDonations = [
    {
      id: 1,
      donor: { name: 'Michael Johnson', email: 'michael@email.com', phone: '+1 234-567-8901' },
      bloodGroup: 'O+',
      units: 1,
      type: 'whole_blood',
      status: 'completed',
      date: '2024-08-14T10:30:00',
      notes: 'Regular donation',
      hemoglobin: 14.5,
      bloodPressure: '120/80'
    },
    {
      id: 2,
      donor: { name: 'Sarah Williams', email: 'sarah@email.com', phone: '+1 234-567-8902' },
      bloodGroup: 'A-',
      units: 1,
      type: 'platelets',
      status: 'processing',
      date: '2024-08-14T09:00:00',
      notes: 'First-time platelet donor',
      hemoglobin: 13.8,
      bloodPressure: '118/76'
    },
    {
      id: 3,
      donor: { name: 'David Brown', email: 'david@email.com', phone: '+1 234-567-8903' },
      bloodGroup: 'B+',
      units: 1,
      type: 'whole_blood',
      status: 'completed',
      date: '2024-08-13T14:00:00',
      notes: '',
      hemoglobin: 15.2,
      bloodPressure: '125/82'
    },
    {
      id: 4,
      donor: { name: 'Emily Davis', email: 'emily@email.com', phone: '+1 234-567-8904' },
      bloodGroup: 'AB+',
      units: 1,
      type: 'plasma',
      status: 'completed',
      date: '2024-08-13T11:30:00',
      notes: 'Plasma donation for burn patient',
      hemoglobin: 14.0,
      bloodPressure: '115/75'
    },
    {
      id: 5,
      donor: { name: 'Robert Wilson', email: 'robert@email.com', phone: '+1 234-567-8905' },
      bloodGroup: 'O-',
      units: 2,
      type: 'whole_blood',
      status: 'rejected',
      date: '2024-08-12T16:00:00',
      notes: 'Low hemoglobin level',
      hemoglobin: 11.5,
      bloodPressure: '130/85'
    },
    {
      id: 6,
      donor: { name: 'Jennifer Taylor', email: 'jennifer@email.com', phone: '+1 234-567-8906' },
      bloodGroup: 'A+',
      units: 1,
      type: 'whole_blood',
      status: 'pending',
      date: '2024-08-14T14:00:00',
      notes: 'Scheduled appointment',
      hemoglobin: null,
      bloodPressure: null
    },
  ];

  const getStatusStyle = (status) => {
    switch (status) {
      case 'completed':
        return 'bg-green-100 text-green-700';
      case 'processing':
        return 'bg-blue-100 text-blue-700';
      case 'pending':
        return 'bg-yellow-100 text-yellow-700';
      case 'rejected':
        return 'bg-red-100 text-red-700';
      default:
        return 'bg-gray-100 text-gray-700';
    }
  };

  const getTypeLabel = (type) => {
    const types = {
      whole_blood: 'Whole Blood',
      platelets: 'Platelets',
      plasma: 'Plasma',
      rbc: 'Red Blood Cells'
    };
    return types[type] || type;
  };

  const filteredDonations = filter === 'all' 
    ? donations 
    : donations.filter(d => d.status === filter);

  const stats = [
    { label: 'Total Donations', value: donations.length, color: 'blue' },
    { label: 'Completed', value: donations.filter(d => d.status === 'completed').length, color: 'green' },
    { label: 'Processing', value: donations.filter(d => d.status === 'processing').length, color: 'blue' },
    { label: 'Pending', value: donations.filter(d => d.status === 'pending').length, color: 'yellow' },
  ];

  const showNotification = (type, message) => {
    setNotification({ type, message });
    setTimeout(() => setNotification(null), 3000);
  };

  const handleUpdateStatus = async (donationId, newStatus) => {
    try {
      // await donationAPI.updateStatus(donationId, newStatus);
      setDonations(donations.map(d => 
        d.id === donationId ? { ...d, status: newStatus } : d
      ));
      showNotification('success', 'Status updated successfully!');
    } catch (error) {
      showNotification('error', 'Failed to update status');
    }
  };

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
            className="flex flex-col md:flex-row md:items-center md:justify-between mb-8"
          >
            <div>
              <h1 className="text-3xl font-bold text-gray-800">Manage Donations</h1>
              <p className="text-gray-600 mt-1">Track and manage blood donations at your facility</p>
            </div>
            <button
              onClick={() => setShowAddModal(true)}
              className="btn-primary mt-4 md:mt-0 flex items-center space-x-2"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
              <span>Record Donation</span>
            </button>
          </motion.div>

          {/* Stats */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6"
          >
            {stats.map((stat, index) => (
              <div key={stat.label} className="glass-card p-4 text-center">
                <p className={`text-3xl font-bold text-${stat.color}-600`}>{stat.value}</p>
                <p className="text-sm text-gray-500">{stat.label}</p>
              </div>
            ))}
          </motion.div>

          {/* Filter Tabs */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="flex space-x-2 mb-6 overflow-x-auto pb-2"
          >
            {[
              { id: 'all', label: 'All Donations' },
              { id: 'pending', label: 'Pending' },
              { id: 'processing', label: 'Processing' },
              { id: 'completed', label: 'Completed' },
              { id: 'rejected', label: 'Rejected' },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setFilter(tab.id)}
                className={`px-4 py-2 rounded-lg font-medium transition-all whitespace-nowrap ${
                  filter === tab.id
                    ? 'bg-primary-500 text-white shadow-lg shadow-primary-500/30'
                    : 'bg-white text-gray-600 hover:bg-gray-50'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </motion.div>

          {/* Donations Table */}
          {loading ? (
            <div className="flex items-center justify-center py-20">
              <div className="animate-spin w-12 h-12 border-4 border-primary-500 border-t-transparent rounded-full"></div>
            </div>
          ) : (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="glass-card overflow-hidden"
            >
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-4 text-left text-sm font-semibold text-gray-600">Donor</th>
                      <th className="px-6 py-4 text-left text-sm font-semibold text-gray-600">Blood Group</th>
                      <th className="px-6 py-4 text-left text-sm font-semibold text-gray-600">Type</th>
                      <th className="px-6 py-4 text-left text-sm font-semibold text-gray-600">Units</th>
                      <th className="px-6 py-4 text-left text-sm font-semibold text-gray-600">Date</th>
                      <th className="px-6 py-4 text-left text-sm font-semibold text-gray-600">Status</th>
                      <th className="px-6 py-4 text-left text-sm font-semibold text-gray-600">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {filteredDonations.map((donation, index) => (
                      <motion.tr
                        key={donation.id}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: index * 0.05 }}
                        className="hover:bg-gray-50 transition-colors"
                      >
                        <td className="px-6 py-4">
                          <div className="flex items-center space-x-3">
                            <div className="w-10 h-10 bg-primary-100 rounded-full flex items-center justify-center text-primary-600 font-semibold">
                              {donation.donor.name.charAt(0)}
                            </div>
                            <div>
                              <p className="font-medium text-gray-800">{donation.donor.name}</p>
                              <p className="text-sm text-gray-500">{donation.donor.email}</p>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <span className="px-3 py-1 bg-primary-100 text-primary-700 rounded-full text-sm font-semibold">
                            {donation.bloodGroup}
                          </span>
                        </td>
                        <td className="px-6 py-4">
                          <span className="text-gray-700">{getTypeLabel(donation.type)}</span>
                        </td>
                        <td className="px-6 py-4">
                          <span className="font-medium text-gray-800">{donation.units}</span>
                        </td>
                        <td className="px-6 py-4">
                          <p className="text-gray-700">
                            {new Date(donation.date).toLocaleDateString('en-US', {
                              month: 'short',
                              day: 'numeric',
                              year: 'numeric'
                            })}
                          </p>
                          <p className="text-xs text-gray-500">
                            {new Date(donation.date).toLocaleTimeString('en-US', {
                              hour: '2-digit',
                              minute: '2-digit'
                            })}
                          </p>
                        </td>
                        <td className="px-6 py-4">
                          <span className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusStyle(donation.status)}`}>
                            {donation.status.charAt(0).toUpperCase() + donation.status.slice(1)}
                          </span>
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex items-center space-x-2">
                            <button
                              onClick={() => setSelectedDonation(donation)}
                              className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                              title="View Details"
                            >
                              <svg className="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                              </svg>
                            </button>
                            {donation.status === 'pending' && (
                              <button
                                onClick={() => handleUpdateStatus(donation.id, 'processing')}
                                className="p-2 hover:bg-green-50 rounded-lg transition-colors"
                                title="Start Processing"
                              >
                                <svg className="w-5 h-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                                </svg>
                              </button>
                            )}
                            {donation.status === 'processing' && (
                              <button
                                onClick={() => handleUpdateStatus(donation.id, 'completed')}
                                className="p-2 hover:bg-green-50 rounded-lg transition-colors"
                                title="Mark Complete"
                              >
                                <svg className="w-5 h-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                </svg>
                              </button>
                            )}
                          </div>
                        </td>
                      </motion.tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </motion.div>
          )}

          {/* Donation Detail Modal */}
          <AnimatePresence>
            {selectedDonation && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
                onClick={() => setSelectedDonation(null)}
              >
                <motion.div
                  initial={{ scale: 0.9, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  exit={{ scale: 0.9, opacity: 0 }}
                  className="bg-white rounded-2xl shadow-xl max-w-2xl w-full overflow-hidden max-h-[90vh] overflow-y-auto"
                  onClick={(e) => e.stopPropagation()}
                >
                  <div className="bg-gradient-to-r from-primary-500 to-primary-600 px-6 py-4 flex justify-between items-center">
                    <h3 className="text-xl font-semibold text-white">Donation Details</h3>
                    <span className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusStyle(selectedDonation.status)}`}>
                      {selectedDonation.status}
                    </span>
                  </div>
                  
                  <div className="p-6 space-y-6">
                    {/* Donor Info */}
                    <div className="flex items-center space-x-4">
                      <div className="w-16 h-16 bg-primary-100 rounded-full flex items-center justify-center text-primary-600 text-2xl font-bold">
                        {selectedDonation.donor.name.charAt(0)}
                      </div>
                      <div>
                        <h4 className="text-xl font-semibold text-gray-800">{selectedDonation.donor.name}</h4>
                        <p className="text-gray-500">{selectedDonation.donor.email}</p>
                        <p className="text-gray-500">{selectedDonation.donor.phone}</p>
                      </div>
                    </div>

                    {/* Donation Details */}
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                      <div className="p-4 bg-gray-50 rounded-xl text-center">
                        <p className="text-2xl font-bold text-primary-600">{selectedDonation.bloodGroup}</p>
                        <p className="text-xs text-gray-500">Blood Group</p>
                      </div>
                      <div className="p-4 bg-gray-50 rounded-xl text-center">
                        <p className="text-2xl font-bold text-gray-800">{selectedDonation.units}</p>
                        <p className="text-xs text-gray-500">Units</p>
                      </div>
                      <div className="p-4 bg-gray-50 rounded-xl text-center">
                        <p className="text-lg font-bold text-gray-800">{getTypeLabel(selectedDonation.type)}</p>
                        <p className="text-xs text-gray-500">Type</p>
                      </div>
                      <div className="p-4 bg-gray-50 rounded-xl text-center">
                        <p className="text-lg font-bold text-gray-800">
                          {new Date(selectedDonation.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                        </p>
                        <p className="text-xs text-gray-500">Date</p>
                      </div>
                    </div>

                    {/* Health Metrics */}
                    {selectedDonation.hemoglobin && (
                      <div className="p-4 border border-gray-200 rounded-xl">
                        <h4 className="font-semibold text-gray-800 mb-3">Health Metrics</h4>
                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <p className="text-sm text-gray-500">Hemoglobin Level</p>
                            <p className="font-medium text-gray-800">{selectedDonation.hemoglobin} g/dL</p>
                          </div>
                          <div>
                            <p className="text-sm text-gray-500">Blood Pressure</p>
                            <p className="font-medium text-gray-800">{selectedDonation.bloodPressure} mmHg</p>
                          </div>
                        </div>
                      </div>
                    )}

                    {/* Notes */}
                    {selectedDonation.notes && (
                      <div className="p-4 bg-blue-50 rounded-xl border border-blue-200">
                        <h4 className="font-semibold text-blue-800 mb-2">Notes</h4>
                        <p className="text-blue-700">{selectedDonation.notes}</p>
                      </div>
                    )}

                    {/* Status Update */}
                    {selectedDonation.status !== 'completed' && selectedDonation.status !== 'rejected' && (
                      <div className="p-4 border border-gray-200 rounded-xl">
                        <h4 className="font-semibold text-gray-800 mb-3">Update Status</h4>
                        <div className="flex flex-wrap gap-2">
                          {selectedDonation.status === 'pending' && (
                            <>
                              <button
                                onClick={() => {
                                  handleUpdateStatus(selectedDonation.id, 'processing');
                                  setSelectedDonation({ ...selectedDonation, status: 'processing' });
                                }}
                                className="px-4 py-2 bg-blue-100 text-blue-700 rounded-lg font-medium hover:bg-blue-200 transition-colors"
                              >
                                Start Processing
                              </button>
                              <button
                                onClick={() => {
                                  handleUpdateStatus(selectedDonation.id, 'rejected');
                                  setSelectedDonation({ ...selectedDonation, status: 'rejected' });
                                }}
                                className="px-4 py-2 bg-red-100 text-red-700 rounded-lg font-medium hover:bg-red-200 transition-colors"
                              >
                                Reject
                              </button>
                            </>
                          )}
                          {selectedDonation.status === 'processing' && (
                            <button
                              onClick={() => {
                                handleUpdateStatus(selectedDonation.id, 'completed');
                                setSelectedDonation({ ...selectedDonation, status: 'completed' });
                              }}
                              className="px-4 py-2 bg-green-100 text-green-700 rounded-lg font-medium hover:bg-green-200 transition-colors"
                            >
                              Mark as Completed
                            </button>
                          )}
                        </div>
                      </div>
                    )}
                  </div>

                  <div className="px-6 py-4 bg-gray-50 flex justify-end space-x-3">
                    <button
                      onClick={() => setSelectedDonation(null)}
                      className="btn-primary"
                    >
                      Close
                    </button>
                  </div>
                </motion.div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Add Donation Modal */}
          <AnimatePresence>
            {showAddModal && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
                onClick={() => setShowAddModal(false)}
              >
                <motion.div
                  initial={{ scale: 0.9, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  exit={{ scale: 0.9, opacity: 0 }}
                  className="bg-white rounded-2xl shadow-xl max-w-lg w-full overflow-hidden max-h-[90vh] overflow-y-auto"
                  onClick={(e) => e.stopPropagation()}
                >
                  <div className="bg-gradient-to-r from-primary-500 to-primary-600 px-6 py-4">
                    <h3 className="text-xl font-semibold text-white">Record New Donation</h3>
                  </div>
                  
                  <form className="p-6 space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div className="col-span-2">
                        <label className="block text-sm font-medium text-gray-700 mb-2">Donor Name</label>
                        <input type="text" className="input-field" placeholder="Enter donor name" />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Email</label>
                        <input type="email" className="input-field" placeholder="Email address" />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Phone</label>
                        <input type="tel" className="input-field" placeholder="Phone number" />
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Blood Group</label>
                        <select className="input-field">
                          {bloodTypes.map(type => (
                            <option key={type} value={type}>{type}</option>
                          ))}
                        </select>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Donation Type</label>
                        <select className="input-field">
                          <option value="whole_blood">Whole Blood</option>
                          <option value="platelets">Platelets</option>
                          <option value="plasma">Plasma</option>
                          <option value="rbc">Red Blood Cells</option>
                        </select>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Hemoglobin (g/dL)</label>
                        <input type="number" step="0.1" className="input-field" placeholder="14.0" />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Blood Pressure</label>
                        <input type="text" className="input-field" placeholder="120/80" />
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Notes</label>
                      <textarea className="input-field" rows={3} placeholder="Any additional notes..." />
                    </div>

                    <div className="flex justify-end space-x-3 pt-4">
                      <button type="button" onClick={() => setShowAddModal(false)} className="btn-secondary">
                        Cancel
                      </button>
                      <button type="submit" className="btn-primary">
                        Record Donation
                      </button>
                    </div>
                  </form>
                </motion.div>
              </motion.div>
            )}
          </AnimatePresence>
    </div>
  );
};

export default ManageDonations;
