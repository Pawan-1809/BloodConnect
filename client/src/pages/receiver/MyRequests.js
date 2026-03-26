import React, { useEffect, useMemo, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Link } from 'react-router-dom';
import toast from 'react-hot-toast';
import { requestAPI } from '../../services/api';

function normalizeRequest(request) {
  return {
    id: request._id,
    patientName: request.patientInfo?.name || 'Patient',
    bloodGroup: request.bloodGroup,
    units: request.unitsRequired || 0,
    fulfilled: request.unitsFulfilled || 0,
    urgency: request.urgency || 'normal',
    hospital: request.hospital?.name || request.hospitalName || 'Hospital',
    status: request.status || 'pending',
    reason: request.patientInfo?.condition || request.medicalNotes || 'Blood needed',
    requiredBy: request.requiredBy,
    createdAt: request.createdAt,
    responses: (request.matchedDonors || []).map((response, index) => ({
      id: `${request._id}-${index}`,
      donor: response.donor
        ? `${response.donor.firstName || ''} ${response.donor.lastName || ''}`.trim() || 'Donor'
        : 'Donor',
      donorBlood: response.donorProfile?.bloodGroup || request.bloodGroup,
      status: response.status
    }))
  };
}

const MyRequests = () => {
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');
  const [selectedRequest, setSelectedRequest] = useState(null);

  useEffect(() => {
    let isMounted = true;

    const fetchMyRequests = async () => {
      setLoading(true);
      try {
        const response = await requestAPI.getMyRequests({ limit: 100 });
        if (!isMounted) {
          return;
        }

        setRequests((response.data?.requests || []).map(normalizeRequest));
      } catch (error) {
        console.error('Error fetching receiver requests:', error);
        if (isMounted) {
          setRequests([]);
        }
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    };

    fetchMyRequests();

    return () => {
      isMounted = false;
    };
  }, []);

  const filteredRequests = useMemo(() => (
    filter === 'all' ? requests : requests.filter((request) => request.status === filter)
  ), [filter, requests]);

  const stats = useMemo(() => [
    { label: 'Total Requests', value: requests.length, className: 'text-blue-600' },
    { label: 'Open', value: requests.filter((request) => ['pending', 'approved', 'in_progress', 'partially_fulfilled'].includes(request.status)).length, className: 'text-primary-600' },
    { label: 'Fulfilled', value: requests.filter((request) => request.status === 'fulfilled').length, className: 'text-green-600' },
    { label: 'Donor Responses', value: requests.reduce((total, request) => total + request.responses.length, 0), className: 'text-purple-600' }
  ], [requests]);

  const getStatusStyle = (status) => {
    switch (status) {
      case 'pending':
      case 'approved':
      case 'in_progress':
      case 'partially_fulfilled':
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

  const handleCancelRequest = async (requestId) => {
    try {
      await requestAPI.delete(requestId, { reason: 'Cancelled by receiver' });
      setRequests((current) =>
        current.map((request) =>
          request.id === requestId ? { ...request, status: 'cancelled' } : request
        )
      );
      setSelectedRequest(null);
      toast.success('Request cancelled.');
    } catch (error) {
      toast.error(error.response?.data?.message || 'Unable to cancel request.');
    }
  };

  return (
    <div className="p-6 lg:p-8">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="flex flex-col md:flex-row md:items-center md:justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-800">My Requests</h1>
          <p className="text-gray-600 mt-1">Every request below is loaded from your real account history.</p>
        </div>
        <Link to="/receiver/create-request" className="btn-primary mt-4 md:mt-0">
          Create Request
        </Link>
      </motion.div>

      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        {stats.map((stat) => (
          <div key={stat.label} className="glass-card p-4 text-center">
            <p className={`text-3xl font-bold ${stat.className}`}>{stat.value}</p>
            <p className="text-sm text-gray-500">{stat.label}</p>
          </div>
        ))}
      </motion.div>

      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="flex space-x-2 mb-6 overflow-x-auto pb-2">
        {[
          { id: 'all', label: 'All Requests' },
          { id: 'pending', label: 'Pending' },
          { id: 'approved', label: 'Approved' },
          { id: 'in_progress', label: 'In Progress' },
          { id: 'fulfilled', label: 'Fulfilled' },
          { id: 'cancelled', label: 'Cancelled' },
          { id: 'expired', label: 'Expired' }
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

      {loading ? (
        <div className="flex items-center justify-center py-20">
          <div className="text-center">
            <div className="animate-spin w-12 h-12 border-4 border-primary-500 border-t-transparent rounded-full mx-auto" />
            <p className="text-gray-500 mt-4">Loading requests...</p>
          </div>
        </div>
      ) : filteredRequests.length === 0 ? (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-center py-20 glass-card">
          <h3 className="text-xl font-semibold text-gray-800 mb-2">No requests found</h3>
          <p className="text-gray-500 mb-6">There are no requests in this category yet.</p>
          <Link to="/receiver/create-request" className="btn-primary">
            Create Your First Request
          </Link>
        </motion.div>
      ) : (
        <div className="space-y-4">
          {filteredRequests.map((request, index) => (
            <motion.div key={request.id} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: index * 0.05 }} className="glass-card overflow-hidden">
              <div className="p-4 md:p-6">
                <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
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

                  <div className="flex items-center space-x-6 md:space-x-8">
                    <div className="text-center">
                      <p className="text-2xl font-bold text-gray-800">{request.fulfilled}/{request.units}</p>
                      <p className="text-xs text-gray-500">Units</p>
                    </div>
                    <div className="text-center">
                      <p className="text-2xl font-bold text-gray-800">{request.responses.length}</p>
                      <p className="text-xs text-gray-500">Responses</p>
                    </div>
                    <div>
                      <span className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusStyle(request.status)}`}>
                        {request.status.replace(/_/g, ' ')}
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center space-x-3">
                    <button onClick={() => setSelectedRequest(request)} className="p-2 hover:bg-gray-100 rounded-lg transition-colors" type="button">
                      View
                    </button>
                    {['pending', 'approved', 'in_progress', 'partially_fulfilled'].includes(request.status) ? (
                      <button onClick={() => handleCancelRequest(request.id)} className="p-2 hover:bg-red-50 rounded-lg transition-colors text-red-600" type="button">
                        Cancel
                      </button>
                    ) : null}
                  </div>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      )}

      <AnimatePresence>
        {selectedRequest && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4" onClick={() => setSelectedRequest(null)}>
            <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.9, opacity: 0 }} className="bg-white rounded-2xl shadow-xl max-w-2xl w-full overflow-hidden max-h-[90vh] overflow-y-auto" onClick={(event) => event.stopPropagation()}>
              <div className="bg-gradient-to-r from-primary-500 to-primary-600 px-6 py-4 flex justify-between items-center">
                <h3 className="text-xl font-semibold text-white">Request Details</h3>
                <span className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusStyle(selectedRequest.status)}`}>
                  {selectedRequest.status.replace(/_/g, ' ')}
                </span>
              </div>

              <div className="p-6 space-y-6">
                <div className="flex items-center space-x-4">
                  <div className="w-16 h-16 bg-gradient-to-br from-primary-400 to-primary-600 rounded-2xl flex items-center justify-center text-white text-2xl font-bold shadow-lg">
                    {selectedRequest.bloodGroup}
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-gray-800">{selectedRequest.patientName}</h3>
                    <p className="text-gray-500">{selectedRequest.reason}</p>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="p-4 bg-gray-50 rounded-xl">
                    <p className="text-sm text-gray-500">Units Needed</p>
                    <p className="text-xl font-bold text-gray-800">{selectedRequest.fulfilled} / {selectedRequest.units} fulfilled</p>
                  </div>
                  <div className="p-4 bg-gray-50 rounded-xl">
                    <p className="text-sm text-gray-500">Required By</p>
                    <p className="text-xl font-bold text-gray-800">
                      {selectedRequest.requiredBy ? new Date(selectedRequest.requiredBy).toLocaleDateString() : 'Not specified'}
                    </p>
                  </div>
                </div>

                <div className="p-4 border border-gray-200 rounded-xl">
                  <p className="text-sm text-gray-500">Hospital / Blood Bank</p>
                  <p className="font-semibold text-gray-800">{selectedRequest.hospital}</p>
                </div>

                <div>
                  <h4 className="font-semibold text-gray-800 mb-3">Donor Responses ({selectedRequest.responses.length})</h4>
                  {selectedRequest.responses.length === 0 ? (
                    <div className="p-4 bg-gray-50 rounded-xl text-center text-gray-500">
                      No donor responses yet.
                    </div>
                  ) : (
                    <div className="space-y-3">
                      {selectedRequest.responses.map((response) => (
                        <div key={response.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-xl">
                          <div>
                            <p className="font-medium text-gray-800">{response.donor}</p>
                            <p className="text-sm text-gray-500">Blood Type: {response.donorBlood}</p>
                          </div>
                          <span className="px-3 py-1 rounded-full text-sm font-medium bg-gray-100 text-gray-700">
                            {response.status}
                          </span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>

              <div className="px-6 py-4 bg-gray-50 flex justify-end space-x-3">
                {['pending', 'approved', 'in_progress', 'partially_fulfilled'].includes(selectedRequest.status) ? (
                  <button onClick={() => handleCancelRequest(selectedRequest.id)} className="btn-secondary text-red-600 border-red-200 hover:bg-red-50" type="button">
                    Cancel Request
                  </button>
                ) : null}
                <button onClick={() => setSelectedRequest(null)} className="btn-primary" type="button">
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
