import React, { useEffect, useMemo, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { adminAPI } from '../../services/api';

function normalizeRequest(request) {
  return {
    id: request._id,
    patientName: request.patientInfo?.name || 'Patient',
    bloodGroup: request.bloodGroup,
    unitsNeeded: request.unitsRequired || 0,
    urgency: request.urgency || 'normal',
    status: request.status || 'pending',
    hospital: request.hospital?.name || request.hospitalName || 'Hospital',
    reason: request.patientInfo?.condition || request.medicalNotes || 'Blood needed',
    requester: request.requester
      ? `${request.requester.firstName || ''} ${request.requester.lastName || ''}`.trim() || 'Requester'
      : 'Requester',
    requesterPhone: request.requester?.phone || 'N/A',
    responses: request.responseCount || request.matchedDonors?.length || 0,
    createdAt: request.createdAt,
    requiredBy: request.requiredBy
  };
}

const RequestsManagement = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [urgencyFilter, setUrgencyFilter] = useState('all');
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedRequest, setSelectedRequest] = useState(null);

  useEffect(() => {
    let isMounted = true;

    const fetchRequests = async () => {
      setLoading(true);
      try {
        const response = await adminAPI.getAllRequests({
          limit: 100,
          ...(statusFilter !== 'all' ? { status: statusFilter } : {}),
          ...(urgencyFilter !== 'all' ? { urgency: urgencyFilter } : {})
        });

        if (!isMounted) {
          return;
        }

        const allRequests = (response.data?.requests || []).map(normalizeRequest);
        const filtered = allRequests.filter((request) => {
          if (!searchTerm) {
            return true;
          }

          return (
            request.patientName.toLowerCase().includes(searchTerm.toLowerCase()) ||
            request.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
            request.hospital.toLowerCase().includes(searchTerm.toLowerCase())
          );
        });

        setRequests(filtered);
      } catch (error) {
        console.error('Error fetching admin requests:', error);
        if (isMounted) {
          setRequests([]);
        }
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    };

    const timeoutId = setTimeout(fetchRequests, 250);

    return () => {
      isMounted = false;
      clearTimeout(timeoutId);
    };
  }, [searchTerm, statusFilter, urgencyFilter]);

  const stats = useMemo(() => [
    { label: 'Total Requests', value: requests.length, color: 'bg-blue-500' },
    { label: 'Critical', value: requests.filter((request) => request.urgency === 'critical').length, color: 'bg-red-500' },
    { label: 'Fulfilled', value: requests.filter((request) => request.status === 'fulfilled').length, color: 'bg-green-500' }
  ], [requests]);

  const getStatusBadge = (status) => {
    const styles = {
      pending: 'bg-yellow-100 text-yellow-700',
      approved: 'bg-blue-100 text-blue-700',
      in_progress: 'bg-blue-100 text-blue-700',
      partially_fulfilled: 'bg-blue-100 text-blue-700',
      fulfilled: 'bg-green-100 text-green-700',
      expired: 'bg-gray-100 text-gray-700',
      cancelled: 'bg-red-100 text-red-700'
    };
    return styles[status] || 'bg-gray-100 text-gray-700';
  };

  const getUrgencyBadge = (urgency) => {
    const styles = {
      critical: 'bg-red-500 text-white',
      urgent: 'bg-orange-500 text-white',
      emergency: 'bg-red-600 text-white',
      normal: 'bg-blue-500 text-white'
    };
    return styles[urgency] || 'bg-gray-500 text-white';
  };

  return (
    <div className="p-6 lg:p-8">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="mb-8">
        <h1 className="text-3xl font-bold text-gray-800">Blood Requests</h1>
        <p className="text-gray-600 mt-1">Real request activity from the admin request endpoint.</p>
      </motion.div>

      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="grid grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
        {stats.map((stat) => (
          <div key={stat.label} className="glass-card p-4">
            <div className="flex items-center space-x-4">
              <div className={`w-12 h-12 ${stat.color} rounded-xl`} />
              <div>
                <p className="text-2xl font-bold text-gray-800">{stat.value}</p>
                <p className="text-sm text-gray-500">{stat.label}</p>
              </div>
            </div>
          </div>
        ))}
      </motion.div>

      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="glass-card p-4 mb-6">
        <div className="flex flex-col md:flex-row md:items-center gap-4">
          <input type="text" placeholder="Search by ID, patient, or hospital..." value={searchTerm} onChange={(event) => setSearchTerm(event.target.value)} className="input-field flex-1" />
          <select value={statusFilter} onChange={(event) => setStatusFilter(event.target.value)} className="input-field md:w-40">
            <option value="all">All Status</option>
            <option value="pending">Pending</option>
            <option value="approved">Approved</option>
            <option value="fulfilled">Fulfilled</option>
            <option value="expired">Expired</option>
            <option value="cancelled">Cancelled</option>
          </select>
          <select value={urgencyFilter} onChange={(event) => setUrgencyFilter(event.target.value)} className="input-field md:w-40">
            <option value="all">All Urgencies</option>
            <option value="critical">Critical</option>
            <option value="urgent">Urgent</option>
            <option value="normal">Normal</option>
          </select>
        </div>
      </motion.div>

      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }} className="glass-card overflow-hidden">
        {loading ? (
          <div className="p-10 text-center text-gray-500">Loading requests...</div>
        ) : requests.length === 0 ? (
          <div className="p-10 text-center text-gray-500">No requests found.</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Request</th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Urgency</th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Status</th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Responses</th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {requests.map((request) => (
                  <tr key={request.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-4">
                      <p className="font-medium text-gray-800">{request.patientName}</p>
                      <p className="text-sm text-gray-500">{request.hospital}</p>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`px-3 py-1 rounded-full text-xs font-medium ${getUrgencyBadge(request.urgency)}`}>
                        {request.urgency}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusBadge(request.status)}`}>
                        {request.status.replace(/_/g, ' ')}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-600">{request.responses}</td>
                    <td className="px-6 py-4">
                      <button onClick={() => setSelectedRequest(request)} className="text-primary-600 hover:text-primary-700 text-sm font-medium" type="button">
                        View
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </motion.div>

      <AnimatePresence>
        {selectedRequest ? (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4" onClick={() => setSelectedRequest(null)}>
            <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.9, opacity: 0 }} className="bg-white rounded-2xl shadow-xl max-w-lg w-full overflow-hidden" onClick={(event) => event.stopPropagation()}>
              <div className="bg-gradient-to-r from-primary-500 to-primary-600 px-6 py-4">
                <h3 className="text-xl font-semibold text-white">Request Details</h3>
              </div>
              <div className="p-6 space-y-4">
                <p><span className="text-gray-500">Patient:</span> <span className="font-medium text-gray-800">{selectedRequest.patientName}</span></p>
                <p><span className="text-gray-500">Blood Group:</span> <span className="font-medium text-gray-800">{selectedRequest.bloodGroup}</span></p>
                <p><span className="text-gray-500">Units Needed:</span> <span className="font-medium text-gray-800">{selectedRequest.unitsNeeded}</span></p>
                <p><span className="text-gray-500">Requester:</span> <span className="font-medium text-gray-800">{selectedRequest.requester}</span></p>
                <p><span className="text-gray-500">Contact:</span> <span className="font-medium text-gray-800">{selectedRequest.requesterPhone}</span></p>
                <p><span className="text-gray-500">Required By:</span> <span className="font-medium text-gray-800">{selectedRequest.requiredBy ? new Date(selectedRequest.requiredBy).toLocaleString() : 'Not specified'}</span></p>
              </div>
              <div className="px-6 py-4 bg-gray-50 flex justify-end">
                <button onClick={() => setSelectedRequest(null)} className="btn-primary" type="button">
                  Close
                </button>
              </div>
            </motion.div>
          </motion.div>
        ) : null}
      </AnimatePresence>
    </div>
  );
};

export default RequestsManagement;
