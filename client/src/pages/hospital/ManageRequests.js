import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Link } from 'react-router-dom';

const ManageRequests = () => {
  const [activeTab, setActiveTab] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedRequest, setSelectedRequest] = useState(null);
  const [showResponseModal, setShowResponseModal] = useState(false);

  // Mock requests data
  const requests = [
    {
      id: 1,
      patientName: 'John Doe',
      bloodType: 'O-',
      unitsNeeded: 3,
      unitsFulfilled: 1,
      urgency: 'critical',
      requestDate: '2024-12-08',
      requiredBy: '2024-12-10',
      status: 'pending',
      hospital: 'Our Hospital',
      reason: 'Emergency Surgery',
      contact: '+1 (555) 123-4567',
      notes: 'Patient is scheduled for emergency cardiac surgery'
    },
    {
      id: 2,
      patientName: 'Jane Smith',
      bloodType: 'A+',
      unitsNeeded: 2,
      unitsFulfilled: 2,
      urgency: 'moderate',
      requestDate: '2024-12-05',
      requiredBy: '2024-12-15',
      status: 'fulfilled',
      hospital: 'Our Hospital',
      reason: 'Scheduled Operation',
      contact: '+1 (555) 987-6543',
      notes: 'Pre-operative blood preparation'
    },
    {
      id: 3,
      patientName: 'Mike Johnson',
      bloodType: 'B+',
      unitsNeeded: 4,
      unitsFulfilled: 2,
      urgency: 'high',
      requestDate: '2024-12-07',
      requiredBy: '2024-12-12',
      status: 'in_progress',
      hospital: 'City Medical Center',
      reason: 'Accident Victim',
      contact: '+1 (555) 456-7890',
      notes: 'Multiple transfusions required'
    },
    {
      id: 4,
      patientName: 'Sarah Wilson',
      bloodType: 'AB-',
      unitsNeeded: 1,
      unitsFulfilled: 0,
      urgency: 'critical',
      requestDate: '2024-12-09',
      requiredBy: '2024-12-10',
      status: 'pending',
      hospital: 'Our Hospital',
      reason: 'Post-partum Hemorrhage',
      contact: '+1 (555) 234-5678',
      notes: 'Rare blood type - urgent need'
    },
    {
      id: 5,
      patientName: 'David Brown',
      bloodType: 'O+',
      unitsNeeded: 2,
      unitsFulfilled: 0,
      urgency: 'low',
      requestDate: '2024-12-01',
      requiredBy: '2024-12-20',
      status: 'cancelled',
      hospital: 'Our Hospital',
      reason: 'Elective Surgery',
      contact: '+1 (555) 345-6789',
      notes: 'Surgery postponed'
    }
  ];

  const tabs = [
    { id: 'all', label: 'All Requests', count: requests.length },
    { id: 'pending', label: 'Pending', count: requests.filter(r => r.status === 'pending').length },
    { id: 'in_progress', label: 'In Progress', count: requests.filter(r => r.status === 'in_progress').length },
    { id: 'fulfilled', label: 'Fulfilled', count: requests.filter(r => r.status === 'fulfilled').length },
    { id: 'cancelled', label: 'Cancelled', count: requests.filter(r => r.status === 'cancelled').length }
  ];

  const getUrgencyColor = (urgency) => {
    switch (urgency) {
      case 'critical':
        return 'bg-red-100 text-red-700 border-red-200';
      case 'high':
        return 'bg-orange-100 text-orange-700 border-orange-200';
      case 'moderate':
        return 'bg-yellow-100 text-yellow-700 border-yellow-200';
      case 'low':
        return 'bg-green-100 text-green-700 border-green-200';
      default:
        return 'bg-gray-100 text-gray-700 border-gray-200';
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'pending':
        return 'bg-yellow-500';
      case 'in_progress':
        return 'bg-blue-500';
      case 'fulfilled':
        return 'bg-green-500';
      case 'cancelled':
        return 'bg-gray-500';
      default:
        return 'bg-gray-500';
    }
  };

  const filteredRequests = requests.filter(request => {
    const matchesTab = activeTab === 'all' || request.status === activeTab;
    const matchesSearch = request.patientName.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         request.bloodType.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesTab && matchesSearch;
  });

  const stats = [
    { label: 'Total Requests', value: requests.length, icon: '📋', color: 'blue' },
    { label: 'Pending', value: requests.filter(r => r.status === 'pending').length, icon: '⏳', color: 'yellow' },
    { label: 'In Progress', value: requests.filter(r => r.status === 'in_progress').length, icon: '🔄', color: 'blue' },
    { label: 'Fulfilled', value: requests.filter(r => r.status === 'fulfilled').length, icon: '✅', color: 'green' }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 p-6 lg:p-8">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-8"
      >
        <h1 className="text-3xl font-bold text-gray-800">Manage Blood Requests</h1>
        <p className="text-gray-600 mt-2">Track and manage blood requests from patients and external sources</p>
      </motion.div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {stats.map((stat, index) => (
          <motion.div
            key={stat.label}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
            className="glass-card p-4"
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">{stat.label}</p>
                <p className="text-2xl font-bold text-gray-800">{stat.value}</p>
              </div>
              <div className={`w-12 h-12 bg-${stat.color}-100 rounded-xl flex items-center justify-center`}>
                <span className="text-2xl">{stat.icon}</span>
              </div>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Filters and Search */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="glass-card p-6 mb-6"
      >
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
          {/* Tabs */}
          <div className="flex flex-wrap gap-2">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`px-4 py-2 rounded-xl text-sm font-medium transition-all ${
                  activeTab === tab.id
                    ? 'bg-primary-500 text-white'
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
              >
                {tab.label} ({tab.count})
              </button>
            ))}
          </div>

          {/* Search and Actions */}
          <div className="flex items-center gap-3">
            <div className="relative">
              <input
                type="text"
                placeholder="Search requests..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 pr-4 py-2 border border-gray-200 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              />
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">🔍</span>
            </div>
            <button className="btn-primary">
              + New Request
            </button>
          </div>
        </div>
      </motion.div>

      {/* Requests Table */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        className="glass-card overflow-hidden"
      >
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="text-left p-4 font-medium text-gray-600">Patient</th>
                <th className="text-left p-4 font-medium text-gray-600">Blood Type</th>
                <th className="text-left p-4 font-medium text-gray-600">Units</th>
                <th className="text-left p-4 font-medium text-gray-600">Urgency</th>
                <th className="text-left p-4 font-medium text-gray-600">Required By</th>
                <th className="text-left p-4 font-medium text-gray-600">Status</th>
                <th className="text-left p-4 font-medium text-gray-600">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredRequests.map((request, index) => (
                <motion.tr
                  key={request.id}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: index * 0.05 }}
                  className="border-b border-gray-100 hover:bg-gray-50 transition-colors"
                >
                  <td className="p-4">
                    <div className="flex items-center space-x-3">
                      <div className="w-10 h-10 bg-primary-100 rounded-full flex items-center justify-center">
                        <span className="text-primary-600 font-medium">
                          {request.patientName.split(' ').map(n => n[0]).join('')}
                        </span>
                      </div>
                      <div>
                        <p className="font-medium text-gray-800">{request.patientName}</p>
                        <p className="text-sm text-gray-500">{request.reason}</p>
                      </div>
                    </div>
                  </td>
                  <td className="p-4">
                    <span className="px-3 py-1 bg-red-100 text-red-700 rounded-full font-bold">
                      {request.bloodType}
                    </span>
                  </td>
                  <td className="p-4">
                    <div className="flex items-center space-x-2">
                      <span className="font-medium text-gray-800">
                        {request.unitsFulfilled}/{request.unitsNeeded}
                      </span>
                      <div className="w-16 h-2 bg-gray-200 rounded-full overflow-hidden">
                        <div
                          className="h-full bg-green-500 rounded-full"
                          style={{ width: `${(request.unitsFulfilled / request.unitsNeeded) * 100}%` }}
                        />
                      </div>
                    </div>
                  </td>
                  <td className="p-4">
                    <span className={`px-3 py-1 rounded-full text-sm font-medium border ${getUrgencyColor(request.urgency)}`}>
                      {request.urgency.charAt(0).toUpperCase() + request.urgency.slice(1)}
                    </span>
                  </td>
                  <td className="p-4">
                    <span className="text-gray-800">
                      {new Date(request.requiredBy).toLocaleDateString()}
                    </span>
                  </td>
                  <td className="p-4">
                    <div className="flex items-center space-x-2">
                      <span className={`w-2 h-2 rounded-full ${getStatusColor(request.status)}`} />
                      <span className="text-gray-700 capitalize">
                        {request.status.replace('_', ' ')}
                      </span>
                    </div>
                  </td>
                  <td className="p-4">
                    <div className="flex items-center space-x-2">
                      <Link
                        to={`/requests/${request.id}`}
                        className="p-2 text-gray-500 hover:text-primary-600 hover:bg-primary-50 rounded-lg transition-colors"
                        title="View Details"
                      >
                        👁️
                      </Link>
                      {request.status === 'pending' && (
                        <button
                          onClick={() => {
                            setSelectedRequest(request);
                            setShowResponseModal(true);
                          }}
                          className="p-2 text-gray-500 hover:text-green-600 hover:bg-green-50 rounded-lg transition-colors"
                          title="Fulfill Request"
                        >
                          ✅
                        </button>
                      )}
                      <button
                        className="p-2 text-gray-500 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                        title="Edit Request"
                      >
                        ✏️
                      </button>
                      {request.status === 'pending' && (
                        <button
                          className="p-2 text-gray-500 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                          title="Cancel Request"
                        >
                          ❌
                        </button>
                      )}
                    </div>
                  </td>
                </motion.tr>
              ))}
            </tbody>
          </table>
        </div>

        {filteredRequests.length === 0 && (
          <div className="p-12 text-center">
            <span className="text-6xl">📭</span>
            <p className="mt-4 text-gray-500">No requests found</p>
          </div>
        )}
      </motion.div>

      {/* Critical Requests Alert */}
      {requests.filter(r => r.urgency === 'critical' && r.status === 'pending').length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="mt-6 p-4 bg-red-50 border border-red-200 rounded-xl"
        >
          <div className="flex items-center space-x-3">
            <span className="text-2xl">🚨</span>
            <div>
              <p className="font-medium text-red-700">
                {requests.filter(r => r.urgency === 'critical' && r.status === 'pending').length} Critical Request(s) Pending
              </p>
              <p className="text-sm text-red-600">
                These requests require immediate attention
              </p>
            </div>
          </div>
        </motion.div>
      )}

      {/* Fulfill Request Modal */}
      <AnimatePresence>
        {showResponseModal && selectedRequest && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4"
            onClick={() => setShowResponseModal(false)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="glass-card w-full max-w-md p-6"
              onClick={(e) => e.stopPropagation()}
            >
              <h3 className="text-xl font-bold text-gray-800 mb-4">Fulfill Blood Request</h3>
              
              <div className="p-4 bg-gray-50 rounded-xl mb-4">
                <p className="font-medium text-gray-800">{selectedRequest.patientName}</p>
                <p className="text-sm text-gray-500">
                  {selectedRequest.bloodType} • {selectedRequest.unitsNeeded - selectedRequest.unitsFulfilled} units remaining
                </p>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Units to Fulfill
                  </label>
                  <input
                    type="number"
                    min="1"
                    max={selectedRequest.unitsNeeded - selectedRequest.unitsFulfilled}
                    className="w-full px-4 py-2 border border-gray-200 rounded-xl focus:ring-2 focus:ring-primary-500"
                    placeholder="Enter units"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Source
                  </label>
                  <select className="w-full px-4 py-2 border border-gray-200 rounded-xl focus:ring-2 focus:ring-primary-500">
                    <option>Hospital Blood Bank</option>
                    <option>Donor Response</option>
                    <option>External Transfer</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Notes
                  </label>
                  <textarea
                    rows="3"
                    className="w-full px-4 py-2 border border-gray-200 rounded-xl focus:ring-2 focus:ring-primary-500"
                    placeholder="Add any notes..."
                  />
                </div>
              </div>

              <div className="flex space-x-3 mt-6">
                <button
                  onClick={() => setShowResponseModal(false)}
                  className="flex-1 btn-secondary"
                >
                  Cancel
                </button>
                <button
                  onClick={() => {
                    // Handle fulfillment
                    setShowResponseModal(false);
                  }}
                  className="flex-1 btn-primary"
                >
                  Fulfill Request
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default ManageRequests;
