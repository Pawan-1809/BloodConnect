import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Link } from 'react-router-dom';
import { requestAPI } from '../../services/api';

const MyRequests = () => {
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');
  const [selectedRequest, setSelectedRequest] = useState(null);

  useEffect(() => {
    fetchMyRequests();
  }, []);

  const fetchMyRequests = async () => {
    setLoading(true);
    try {
      const response = await requestAPI.getMyRequests();
      setRequests(response.data.data || mockRequests);
    } catch (error) {
      console.error('Error fetching requests:', error);
      setRequests(mockRequests);
    }
    setLoading(false);
  };

  // Mock data
  const mockRequests = [
    {
      id: 1,
      patientName: 'John Doe',
      bloodGroup: 'O+',
      units: 2,
      urgency: 'critical',
      hospital: 'City General Hospital',
      status: 'active',
      reason: 'Emergency Surgery',
      requiredBy: '2024-08-18',
      createdAt: '2024-08-14T10:30:00',
      responses: [
        { id: 1, donor: 'Mike Johnson', status: 'accepted', donorBlood: 'O+' },
        { id: 2, donor: 'Sarah Williams', status: 'pending', donorBlood: 'O-' },
      ],
      fulfilled: 1,
    },
    {
      id: 2,
      patientName: 'Jane Smith',
      bloodGroup: 'A-',
      units: 1,
      urgency: 'urgent',
      hospital: 'Memorial Medical Center',
      status: 'fulfilled',
      reason: 'Scheduled Surgery',
      requiredBy: '2024-08-10',
      createdAt: '2024-08-05T14:00:00',
      responses: [
        { id: 3, donor: 'Robert Brown', status: 'completed', donorBlood: 'A-' },
      ],
      fulfilled: 1,
    },
    {
      id: 3,
      patientName: 'Child Patient',
      bloodGroup: 'B+',
      units: 3,
      urgency: 'normal',
      hospital: 'Children\'s Hospital',
      status: 'active',
      reason: 'Thalassemia Treatment',
      requiredBy: '2024-08-25',
      createdAt: '2024-08-12T09:00:00',
      responses: [],
      fulfilled: 0,
    },
    {
      id: 4,
      patientName: 'Elder Patient',
      bloodGroup: 'AB+',
      units: 2,
      urgency: 'urgent',
      hospital: 'St. Mary Hospital',
      status: 'cancelled',
      reason: 'Heart Surgery',
      requiredBy: '2024-08-08',
      createdAt: '2024-08-01T11:30:00',
      responses: [
        { id: 4, donor: 'Emily Davis', status: 'cancelled', donorBlood: 'AB+' },
      ],
      fulfilled: 0,
    },
    {
      id: 5,
      patientName: 'Anonymous Patient',
      bloodGroup: 'O-',
      units: 4,
      urgency: 'critical',
      hospital: 'Trauma Center',
      status: 'expired',
      reason: 'Accident Trauma',
      requiredBy: '2024-07-30',
      createdAt: '2024-07-28T16:00:00',
      responses: [
        { id: 5, donor: 'James Wilson', status: 'expired', donorBlood: 'O-' },
        { id: 6, donor: 'Lisa Anderson', status: 'expired', donorBlood: 'O-' },
      ],
      fulfilled: 2,
    },
  ];

  const getStatusStyle = (status) => {
    switch (status) {
      case 'active':
        return 'bg-blue-100 text-blue-700';
      case 'fulfilled':
        return 'bg-green-100 text-green-700';
      case 'cancelled':
        return 'bg-red-100 text-red-700';
      case 'expired':
        return 'bg-gray-100 text-gray-700';
      default:
        return 'bg-gray-100 text-gray-700';
    }
  };

  const getUrgencyStyle = (urgency) => {
    switch (urgency) {
      case 'critical':
        return 'bg-red-500';
      case 'urgent':
        return 'bg-orange-500';
      default:
        return 'bg-green-500';
    }
  };

  const filteredRequests = filter === 'all' 
    ? requests 
    : requests.filter(r => r.status === filter);

  const handleCancelRequest = async (requestId) => {
    try {
      // await requestAPI.cancel(requestId);
      setRequests(requests.map(r => 
        r.id === requestId ? { ...r, status: 'cancelled' } : r
      ));
      setSelectedRequest(null);
    } catch (error) {
      console.error('Error cancelling request:', error);
    }
  };

  const stats = [
    { label: 'Total Requests', value: requests.length, color: 'blue' },
    { label: 'Active', value: requests.filter(r => r.status === 'active').length, color: 'primary' },
    { label: 'Fulfilled', value: requests.filter(r => r.status === 'fulfilled').length, color: 'green' },
    { label: 'Donor Responses', value: requests.reduce((acc, r) => acc + r.responses.length, 0), color: 'purple' },
  ];

  return (
    <div className="p-6 lg:p-8">
          {/* Header */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex flex-col md:flex-row md:items-center md:justify-between mb-8"
          >
            <div>
              <h1 className="text-3xl font-bold text-gray-800">My Requests</h1>
              <p className="text-gray-600 mt-1">Manage and track your blood requests</p>
            </div>
            <Link to="/receiver/create-request" className="btn-primary mt-4 md:mt-0">
              <span className="flex items-center space-x-2">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                </svg>
                <span>New Request</span>
              </span>
            </Link>
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
              { id: 'all', label: 'All Requests' },
              { id: 'active', label: 'Active' },
              { id: 'fulfilled', label: 'Fulfilled' },
              { id: 'cancelled', label: 'Cancelled' },
              { id: 'expired', label: 'Expired' },
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

          {/* Requests List */}
          {loading ? (
            <div className="flex items-center justify-center py-20">
              <div className="text-center">
                <div className="animate-spin w-12 h-12 border-4 border-primary-500 border-t-transparent rounded-full mx-auto"></div>
                <p className="text-gray-500 mt-4">Loading requests...</p>
              </div>
            </div>
          ) : filteredRequests.length === 0 ? (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="text-center py-20 glass-card"
            >
              <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-10 h-10 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                </svg>
              </div>
              <h3 className="text-xl font-semibold text-gray-800 mb-2">No requests found</h3>
              <p className="text-gray-500 mb-6">You haven't created any blood requests yet.</p>
              <Link to="/receiver/create-request" className="btn-primary">
                Create Your First Request
              </Link>
            </motion.div>
          ) : (
            <div className="space-y-4">
              {filteredRequests.map((request, index) => (
                <motion.div
                  key={request.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.05 }}
                  className="glass-card overflow-hidden"
                >
                  <div className="p-4 md:p-6">
                    <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                      {/* Left Section */}
                      <div className="flex items-center space-x-4">
                        <div className={`w-3 h-16 rounded-full ${getUrgencyStyle(request.urgency)}`} />
                        <div className="w-14 h-14 bg-gradient-to-br from-primary-400 to-primary-600 rounded-xl flex items-center justify-center text-white font-bold text-lg shadow-lg">
                          {request.bloodGroup}
                        </div>
                        <div>
                          <h3 className="text-lg font-semibold text-gray-800">{request.patientName}</h3>
                          <p className="text-sm text-gray-500">{request.reason}</p>
                          <p className="text-xs text-gray-400 mt-1">
                            Created: {new Date(request.createdAt).toLocaleDateString('en-US', {
                              month: 'short',
                              day: 'numeric',
                              year: 'numeric',
                              hour: '2-digit',
                              minute: '2-digit'
                            })}
                          </p>
                        </div>
                      </div>

                      {/* Middle Section */}
                      <div className="flex items-center space-x-6 md:space-x-8">
                        <div className="text-center">
                          <p className="text-2xl font-bold text-gray-800">
                            {request.fulfilled}/{request.units}
                          </p>
                          <p className="text-xs text-gray-500">Units</p>
                        </div>
                        <div className="text-center">
                          <p className="text-2xl font-bold text-gray-800">{request.responses.length}</p>
                          <p className="text-xs text-gray-500">Responses</p>
                        </div>
                        <div>
                          <span className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusStyle(request.status)}`}>
                            {request.status.charAt(0).toUpperCase() + request.status.slice(1)}
                          </span>
                        </div>
                      </div>

                      {/* Right Section */}
                      <div className="flex items-center space-x-3">
                        <button
                          onClick={() => setSelectedRequest(request)}
                          className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                          title="View Details"
                        >
                          <svg className="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                          </svg>
                        </button>
                        {request.status === 'active' && (
                          <>
                            <button
                              className="p-2 hover:bg-blue-50 rounded-lg transition-colors"
                              title="Edit Request"
                            >
                              <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                              </svg>
                            </button>
                            <button
                              onClick={() => handleCancelRequest(request.id)}
                              className="p-2 hover:bg-red-50 rounded-lg transition-colors"
                              title="Cancel Request"
                            >
                              <svg className="w-5 h-5 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                              </svg>
                            </button>
                          </>
                        )}
                      </div>
                    </div>

                    {/* Responses Preview */}
                    {request.responses.length > 0 && (
                      <div className="mt-4 pt-4 border-t border-gray-100">
                        <p className="text-sm font-medium text-gray-700 mb-2">Donor Responses:</p>
                        <div className="flex flex-wrap gap-2">
                          {request.responses.slice(0, 3).map((response) => (
                            <span
                              key={response.id}
                              className={`px-3 py-1 rounded-full text-sm ${
                                response.status === 'completed' || response.status === 'accepted'
                                  ? 'bg-green-100 text-green-700'
                                  : response.status === 'pending'
                                  ? 'bg-yellow-100 text-yellow-700'
                                  : 'bg-gray-100 text-gray-600'
                              }`}
                            >
                              {response.donor} ({response.donorBlood})
                            </span>
                          ))}
                          {request.responses.length > 3 && (
                            <span className="px-3 py-1 bg-gray-100 rounded-full text-sm text-gray-600">
                              +{request.responses.length - 3} more
                            </span>
                          )}
                        </div>
                      </div>
                    )}
                  </div>
                </motion.div>
              ))}
            </div>
          )}

          {/* Request Detail Modal */}
          <AnimatePresence>
            {selectedRequest && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
                onClick={() => setSelectedRequest(null)}
              >
                <motion.div
                  initial={{ scale: 0.9, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  exit={{ scale: 0.9, opacity: 0 }}
                  className="bg-white rounded-2xl shadow-xl max-w-2xl w-full overflow-hidden max-h-[90vh] overflow-y-auto"
                  onClick={(e) => e.stopPropagation()}
                >
                  <div className="bg-gradient-to-r from-primary-500 to-primary-600 px-6 py-4 flex justify-between items-center">
                    <h3 className="text-xl font-semibold text-white">Request Details</h3>
                    <span className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusStyle(selectedRequest.status)}`}>
                      {selectedRequest.status}
                    </span>
                  </div>
                  
                  <div className="p-6 space-y-6">
                    {/* Patient Info */}
                    <div className="flex items-center space-x-4">
                      <div className="w-16 h-16 bg-gradient-to-br from-primary-400 to-primary-600 rounded-2xl flex items-center justify-center text-white text-2xl font-bold shadow-lg">
                        {selectedRequest.bloodGroup}
                      </div>
                      <div>
                        <h3 className="text-xl font-bold text-gray-800">{selectedRequest.patientName}</h3>
                        <p className="text-gray-500">{selectedRequest.reason}</p>
                        <span className={`inline-block px-2 py-0.5 rounded text-xs font-medium mt-1 ${
                          selectedRequest.urgency === 'critical' ? 'bg-red-100 text-red-700' :
                          selectedRequest.urgency === 'urgent' ? 'bg-orange-100 text-orange-700' :
                          'bg-green-100 text-green-700'
                        }`}>
                          {selectedRequest.urgency.toUpperCase()}
                        </span>
                      </div>
                    </div>

                    {/* Details Grid */}
                    <div className="grid grid-cols-2 gap-4">
                      <div className="p-4 bg-gray-50 rounded-xl">
                        <p className="text-sm text-gray-500">Units Needed</p>
                        <p className="text-xl font-bold text-gray-800">
                          {selectedRequest.fulfilled} / {selectedRequest.units} fulfilled
                        </p>
                      </div>
                      <div className="p-4 bg-gray-50 rounded-xl">
                        <p className="text-sm text-gray-500">Required By</p>
                        <p className="text-xl font-bold text-gray-800">
                          {new Date(selectedRequest.requiredBy).toLocaleDateString()}
                        </p>
                      </div>
                    </div>

                    {/* Hospital */}
                    <div className="p-4 border border-gray-200 rounded-xl">
                      <p className="text-sm text-gray-500">Hospital / Blood Bank</p>
                      <p className="font-semibold text-gray-800">{selectedRequest.hospital}</p>
                    </div>

                    {/* Responses */}
                    <div>
                      <h4 className="font-semibold text-gray-800 mb-3">Donor Responses ({selectedRequest.responses.length})</h4>
                      {selectedRequest.responses.length === 0 ? (
                        <div className="p-4 bg-gray-50 rounded-xl text-center text-gray-500">
                          No responses yet. Matching donors will be notified.
                        </div>
                      ) : (
                        <div className="space-y-3">
                          {selectedRequest.responses.map((response) => (
                            <div key={response.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-xl">
                              <div className="flex items-center space-x-3">
                                <div className="w-10 h-10 bg-primary-100 rounded-full flex items-center justify-center text-primary-600 font-bold">
                                  {response.donor.charAt(0)}
                                </div>
                                <div>
                                  <p className="font-medium text-gray-800">{response.donor}</p>
                                  <p className="text-sm text-gray-500">Blood Type: {response.donorBlood}</p>
                                </div>
                              </div>
                              <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                                response.status === 'completed' || response.status === 'accepted'
                                  ? 'bg-green-100 text-green-700'
                                  : response.status === 'pending'
                                  ? 'bg-yellow-100 text-yellow-700'
                                  : 'bg-gray-100 text-gray-600'
                              }`}>
                                {response.status}
                              </span>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="px-6 py-4 bg-gray-50 flex justify-end space-x-3">
                    {selectedRequest.status === 'active' && (
                      <button
                        onClick={() => handleCancelRequest(selectedRequest.id)}
                        className="btn-secondary text-red-600 border-red-200 hover:bg-red-50"
                      >
                        Cancel Request
                      </button>
                    )}
                    <button
                      onClick={() => setSelectedRequest(null)}
                      className="btn-primary"
                    >
                      Close
                    </button>
                  </div>
                </motion.div>
              </motion.div>
            )}
          </AnimatePresence>
    </div>
  );
};

export default MyRequests;
