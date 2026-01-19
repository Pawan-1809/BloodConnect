import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

const RequestsManagement = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [urgencyFilter, setUrgencyFilter] = useState('all');
  const [selectedRequest, setSelectedRequest] = useState(null);

  // Mock requests data
  const [requests] = useState([
    {
      id: 'REQ-001',
      patientName: 'John Smith',
      bloodGroup: 'A+',
      unitsNeeded: 3,
      urgency: 'critical',
      status: 'active',
      hospital: 'City General Hospital',
      reason: 'Emergency Surgery',
      requester: 'Jane Smith',
      requesterPhone: '+1 234-567-8901',
      responses: 5,
      createdAt: '2024-12-07T10:30:00',
      expiresAt: '2024-12-10T10:30:00'
    },
    {
      id: 'REQ-002',
      patientName: 'Mary Johnson',
      bloodGroup: 'O-',
      unitsNeeded: 2,
      urgency: 'urgent',
      status: 'active',
      hospital: 'Metropolitan Blood Bank',
      reason: 'Blood Transfusion',
      requester: 'Robert Johnson',
      requesterPhone: '+1 234-567-8902',
      responses: 3,
      createdAt: '2024-12-06T14:00:00',
      expiresAt: '2024-12-09T14:00:00'
    },
    {
      id: 'REQ-003',
      patientName: 'David Brown',
      bloodGroup: 'B+',
      unitsNeeded: 4,
      urgency: 'normal',
      status: 'fulfilled',
      hospital: 'University Hospital',
      reason: 'Scheduled Surgery',
      requester: 'Sarah Brown',
      requesterPhone: '+1 234-567-8903',
      responses: 8,
      createdAt: '2024-12-01T09:00:00',
      expiresAt: '2024-12-08T09:00:00',
      fulfilledAt: '2024-12-05T16:30:00'
    },
    {
      id: 'REQ-004',
      patientName: 'Emily Davis',
      bloodGroup: 'AB+',
      unitsNeeded: 1,
      urgency: 'critical',
      status: 'expired',
      hospital: 'Community Health Center',
      reason: 'Emergency',
      requester: 'Michael Davis',
      requesterPhone: '+1 234-567-8904',
      responses: 0,
      createdAt: '2024-11-25T08:00:00',
      expiresAt: '2024-11-28T08:00:00'
    },
    {
      id: 'REQ-005',
      patientName: 'Chris Wilson',
      bloodGroup: 'O+',
      unitsNeeded: 2,
      urgency: 'urgent',
      status: 'active',
      hospital: 'City General Hospital',
      reason: 'Accident Victim',
      requester: 'Lisa Wilson',
      requesterPhone: '+1 234-567-8905',
      responses: 12,
      createdAt: '2024-12-08T06:00:00',
      expiresAt: '2024-12-11T06:00:00'
    }
  ]);

  const filteredRequests = requests.filter(request => {
    const matchesSearch = request.patientName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         request.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         request.hospital.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'all' || request.status === statusFilter;
    const matchesUrgency = urgencyFilter === 'all' || request.urgency === urgencyFilter;
    return matchesSearch && matchesStatus && matchesUrgency;
  });

  const getStatusBadge = (status) => {
    const styles = {
      active: 'bg-green-100 text-green-700',
      fulfilled: 'bg-blue-100 text-blue-700',
      expired: 'bg-gray-100 text-gray-700',
      cancelled: 'bg-red-100 text-red-700'
    };
    return styles[status] || 'bg-gray-100 text-gray-700';
  };

  const getUrgencyBadge = (urgency) => {
    const styles = {
      critical: 'bg-red-500 text-white',
      urgent: 'bg-orange-500 text-white',
      normal: 'bg-blue-500 text-white'
    };
    return styles[urgency] || 'bg-gray-500 text-white';
  };

  const stats = [
    { label: 'Total Requests', value: requests.length, icon: '📋', color: 'bg-blue-500' },
    { label: 'Active', value: requests.filter(r => r.status === 'active').length, icon: '🔴', color: 'bg-green-500' },
    { label: 'Critical', value: requests.filter(r => r.urgency === 'critical').length, icon: '🚨', color: 'bg-red-500' },
    { label: 'Fulfilled', value: requests.filter(r => r.status === 'fulfilled').length, icon: '✓', color: 'bg-purple-500' }
  ];

  const formatDateTime = (dateString) => {
    return new Date(dateString).toLocaleString();
  };

  const getTimeRemaining = (expiresAt) => {
    const now = new Date();
    const expiry = new Date(expiresAt);
    const diff = expiry - now;
    
    if (diff < 0) return 'Expired';
    
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    
    if (days > 0) return `${days}d ${hours}h remaining`;
    return `${hours}h remaining`;
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
                <h1 className="text-3xl font-bold text-gray-800">Blood Requests</h1>
                <p className="text-gray-600 mt-1">Monitor and manage all blood donation requests</p>
              </div>
              <button className="mt-4 md:mt-0 btn-primary">
                + Create Request
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
                  placeholder="Search by ID, patient, or hospital..."
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
                <option value="active">Active</option>
                <option value="fulfilled">Fulfilled</option>
                <option value="expired">Expired</option>
                <option value="cancelled">Cancelled</option>
              </select>

              {/* Urgency Filter */}
              <select
                value={urgencyFilter}
                onChange={(e) => setUrgencyFilter(e.target.value)}
                className="input-field md:w-40"
              >
                <option value="all">All Urgency</option>
                <option value="critical">Critical</option>
                <option value="urgent">Urgent</option>
                <option value="normal">Normal</option>
              </select>
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
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase">Request</th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase">Blood Type</th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase">Urgency</th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase">Status</th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase">Hospital</th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase">Responses</th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase">Time</th>
                    <th className="px-6 py-4 text-right text-xs font-semibold text-gray-500 uppercase">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {filteredRequests.map((request, index) => (
                    <motion.tr
                      key={request.id}
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ delay: index * 0.05 }}
                      className="hover:bg-gray-50"
                    >
                      <td className="px-6 py-4">
                        <div>
                          <p className="font-medium text-gray-800">{request.id}</p>
                          <p className="text-sm text-gray-500">{request.patientName}</p>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center space-x-2">
                          <span className="w-10 h-10 bg-red-100 text-red-600 rounded-lg flex items-center justify-center font-bold">
                            {request.bloodGroup}
                          </span>
                          <span className="text-sm text-gray-500">{request.unitsNeeded} units</span>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <span className={`px-3 py-1 rounded-full text-xs font-medium capitalize ${getUrgencyBadge(request.urgency)}`}>
                          {request.urgency}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <span className={`px-3 py-1 rounded-full text-xs font-medium capitalize ${getStatusBadge(request.status)}`}>
                          {request.status}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <p className="text-sm text-gray-800 max-w-[150px] truncate">{request.hospital}</p>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center space-x-2">
                          <span className="text-lg font-medium text-gray-800">{request.responses}</span>
                          <span className="text-gray-400">👥</span>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <p className={`text-sm ${request.status === 'expired' ? 'text-red-500' : 'text-gray-600'}`}>
                          {request.status === 'active' ? getTimeRemaining(request.expiresAt) : 
                           request.status === 'fulfilled' ? 'Fulfilled' : 'Expired'}
                        </p>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center justify-end space-x-2">
                          <button
                            onClick={() => setSelectedRequest(request)}
                            className="p-2 text-gray-500 hover:text-primary-600 hover:bg-gray-100 rounded-lg transition-colors"
                            title="View Details"
                          >
                            👁️
                          </button>
                          <button
                            className="p-2 text-gray-500 hover:text-blue-600 hover:bg-gray-100 rounded-lg transition-colors"
                            title="Edit"
                          >
                            ✏️
                          </button>
                          {request.status === 'active' && (
                            <button
                              className="p-2 text-gray-500 hover:text-red-600 hover:bg-gray-100 rounded-lg transition-colors"
                              title="Cancel"
                            >
                              ✕
                            </button>
                          )}
                        </div>
                      </td>
                    </motion.tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Pagination */}
            <div className="px-6 py-4 border-t border-gray-100 flex items-center justify-between">
              <p className="text-sm text-gray-500">
                Showing {filteredRequests.length} of {requests.length} requests
              </p>
              <div className="flex space-x-2">
                <button className="px-3 py-1 border border-gray-300 rounded-lg text-sm hover:bg-gray-50">Previous</button>
                <button className="px-3 py-1 bg-primary-500 text-white rounded-lg text-sm">1</button>
                <button className="px-3 py-1 border border-gray-300 rounded-lg text-sm hover:bg-gray-50">Next</button>
              </div>
            </div>
          </motion.div>

          {/* Request Detail Modal */}
          <AnimatePresence>
            {selectedRequest && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
                onClick={() => setSelectedRequest(null)}
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
                      <div className="flex items-center space-x-3">
                        <h3 className="text-xl font-semibold text-gray-800">Request Details</h3>
                        <span className={`px-3 py-1 rounded-full text-xs font-medium capitalize ${getUrgencyBadge(selectedRequest.urgency)}`}>
                          {selectedRequest.urgency}
                        </span>
                      </div>
                      <button
                        onClick={() => setSelectedRequest(null)}
                        className="p-2 hover:bg-gray-100 rounded-lg"
                      >
                        ✕
                      </button>
                    </div>

                    {/* Request Header */}
                    <div className="flex items-center space-x-4 mb-6 p-4 bg-red-50 rounded-xl">
                      <div className="w-16 h-16 bg-red-500 text-white rounded-xl flex items-center justify-center text-2xl font-bold">
                        {selectedRequest.bloodGroup}
                      </div>
                      <div>
                        <p className="font-mono text-gray-500">{selectedRequest.id}</p>
                        <h4 className="text-xl font-semibold text-gray-800">{selectedRequest.patientName}</h4>
                        <p className="text-gray-600">{selectedRequest.unitsNeeded} units needed • {selectedRequest.reason}</p>
                      </div>
                    </div>

                    {/* Status Timeline */}
                    <div className="mb-6">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-sm font-medium text-gray-700">Request Status</span>
                        <span className={`px-3 py-1 rounded-full text-xs font-medium capitalize ${getStatusBadge(selectedRequest.status)}`}>
                          {selectedRequest.status}
                        </span>
                      </div>
                      <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                        <div 
                          className={`h-full ${
                            selectedRequest.status === 'fulfilled' ? 'bg-green-500 w-full' :
                            selectedRequest.status === 'active' ? 'bg-blue-500 w-2/3' :
                            'bg-gray-400 w-full'
                          }`}
                        />
                      </div>
                    </div>

                    {/* Details Grid */}
                    <div className="grid md:grid-cols-2 gap-4 mb-6">
                      <div className="p-4 bg-gray-50 rounded-xl">
                        <p className="text-sm text-gray-500">Hospital</p>
                        <p className="font-medium text-gray-800">{selectedRequest.hospital}</p>
                      </div>
                      <div className="p-4 bg-gray-50 rounded-xl">
                        <p className="text-sm text-gray-500">Requester</p>
                        <p className="font-medium text-gray-800">{selectedRequest.requester}</p>
                        <p className="text-sm text-gray-500">{selectedRequest.requesterPhone}</p>
                      </div>
                      <div className="p-4 bg-gray-50 rounded-xl">
                        <p className="text-sm text-gray-500">Created</p>
                        <p className="font-medium text-gray-800">{formatDateTime(selectedRequest.createdAt)}</p>
                      </div>
                      <div className="p-4 bg-gray-50 rounded-xl">
                        <p className="text-sm text-gray-500">Expires</p>
                        <p className="font-medium text-gray-800">{formatDateTime(selectedRequest.expiresAt)}</p>
                      </div>
                    </div>

                    {/* Responses */}
                    <div className="mb-6">
                      <div className="flex items-center justify-between mb-4">
                        <h4 className="font-medium text-gray-800">Donor Responses</h4>
                        <span className="text-primary-600 font-medium">{selectedRequest.responses} responses</span>
                      </div>
                      <div className="space-y-3">
                        {[1, 2, 3].slice(0, Math.min(3, selectedRequest.responses)).map((_, index) => (
                          <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-xl">
                            <div className="flex items-center space-x-3">
                              <div className="w-10 h-10 bg-gradient-to-br from-primary-400 to-primary-600 rounded-full flex items-center justify-center text-white font-medium">
                                D
                              </div>
                              <div>
                                <p className="font-medium text-gray-800">Donor #{index + 1}</p>
                                <p className="text-sm text-gray-500">Responded 2h ago</p>
                              </div>
                            </div>
                            <span className="px-3 py-1 bg-yellow-100 text-yellow-700 rounded-full text-xs font-medium">
                              Pending
                            </span>
                          </div>
                        ))}
                        {selectedRequest.responses > 3 && (
                          <button className="w-full py-2 text-primary-600 hover:bg-primary-50 rounded-xl text-sm font-medium">
                            View all {selectedRequest.responses} responses
                          </button>
                        )}
                      </div>
                    </div>

                    {/* Actions */}
                    <div className="flex space-x-3">
                      {selectedRequest.status === 'active' && (
                        <>
                          <button className="flex-1 px-4 py-3 border border-red-300 text-red-600 rounded-xl font-medium hover:bg-red-50">
                            Cancel Request
                          </button>
                          <button className="flex-1 btn-primary">
                            Mark as Fulfilled
                          </button>
                        </>
                      )}
                      {selectedRequest.status !== 'active' && (
                        <button className="flex-1 btn-secondary">
                          Close
                        </button>
                      )}
                    </div>
                  </div>
                </motion.div>
              </motion.div>
            )}
          </AnimatePresence>
    </div>
  );
};

export default RequestsManagement;
