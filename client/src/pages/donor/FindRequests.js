import React, { useEffect, useMemo, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { formatDistanceToNow } from 'date-fns';
import toast from 'react-hot-toast';
import { donorAPI, requestAPI } from '../../services/api';

const bloodTypes = ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'];
const urgencyLevels = ['critical', 'urgent', 'normal'];

function mapRequest(request) {
  const createdAt = request.createdAt ? new Date(request.createdAt) : null;

  return {
    id: request._id,
    patientName: request.patientInfo?.name || 'Patient',
    bloodGroup: request.bloodGroup,
    units: request.unitsRequired || 0,
    urgency: request.urgency || 'normal',
    hospital: request.hospital?.name || request.hospitalName || 'Hospital',
    reason: request.patientInfo?.condition || request.medicalNotes || 'Blood needed',
    requiredBy: request.requiredBy,
    postedAt: createdAt && !Number.isNaN(createdAt.getTime())
      ? formatDistanceToNow(createdAt, { addSuffix: true })
      : 'Recently',
    responses: request.responseCount || request.matchedDonors?.length || 0
  };
}

const FindRequests = () => {
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({
    bloodGroup: '',
    urgency: ''
  });
  const [selectedRequest, setSelectedRequest] = useState(null);
  const [showRespondModal, setShowRespondModal] = useState(false);
  const [responding, setResponding] = useState(false);

  useEffect(() => {
    let isMounted = true;

    const fetchRequests = async () => {
      setLoading(true);
      try {
        const response = await requestAPI.getAll({ limit: 50 });
        if (!isMounted) {
          return;
        }

        setRequests((response.data?.requests || []).map(mapRequest));
      } catch (error) {
        console.error('Error fetching donor requests:', error);
        if (isMounted) {
          setRequests([]);
        }
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    };

    fetchRequests();

    return () => {
      isMounted = false;
    };
  }, []);

  const filteredRequests = useMemo(() => {
    return requests.filter((request) => {
      if (filters.bloodGroup && request.bloodGroup !== filters.bloodGroup) {
        return false;
      }

      if (filters.urgency && request.urgency !== filters.urgency) {
        return false;
      }

      return true;
    });
  }, [filters, requests]);

  const handleRespond = (request) => {
    setSelectedRequest(request);
    setShowRespondModal(true);
  };

  const submitResponse = async (accept) => {
    if (!selectedRequest) {
      return;
    }

    setResponding(true);

    try {
      const response = await donorAPI.respondToRequest(selectedRequest.id, { accept });
      const appointment = response?.data?.appointment;

      toast.success(
        accept
          ? appointment
            ? 'Response saved and your donation appointment was created.'
            : 'Response sent successfully.'
          : 'Request declined.'
      );
      setShowRespondModal(false);
      setSelectedRequest(null);
      setRequests((current) =>
        current.filter((request) => request.id !== selectedRequest.id)
      );
    } catch (error) {
      toast.error(error.response?.data?.message || 'Unable to respond right now.');
    } finally {
      setResponding(false);
    }
  };

  return (
    <div className="p-6 lg:p-8">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="mb-8">
        <h1 className="text-3xl font-bold text-gray-800">Find Blood Requests</h1>
        <p className="text-gray-600 mt-1">Live open requests that match your donor account.</p>
      </motion.div>

      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="glass-card p-4 mb-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <select value={filters.bloodGroup} onChange={(event) => setFilters((current) => ({ ...current, bloodGroup: event.target.value }))} className="input-field">
            <option value="">All Blood Groups</option>
            {bloodTypes.map((type) => (
              <option key={type} value={type}>{type}</option>
            ))}
          </select>

          <select value={filters.urgency} onChange={(event) => setFilters((current) => ({ ...current, urgency: event.target.value }))} className="input-field">
            <option value="">All Urgencies</option>
            {urgencyLevels.map((urgency) => (
              <option key={urgency} value={urgency}>{urgency}</option>
            ))}
          </select>
        </div>
      </motion.div>

      {loading ? (
        <div className="glass-card p-10 text-center">
          <p className="text-gray-500">Loading open requests...</p>
        </div>
      ) : filteredRequests.length === 0 ? (
        <div className="glass-card p-10 text-center">
          <p className="text-gray-500">No live requests match your current filters.</p>
        </div>
      ) : (
        <div className="grid gap-4">
          {filteredRequests.map((request, index) => (
            <motion.div key={request.id} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: index * 0.04 }} className="glass-card p-6">
              <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-4">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-3">
                    <div className="blood-badge">{request.bloodGroup}</div>
                    <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                      request.urgency === 'critical'
                        ? 'bg-red-100 text-red-700'
                        : request.urgency === 'urgent'
                          ? 'bg-orange-100 text-orange-700'
                          : 'bg-green-100 text-green-700'
                    }`}>
                      {request.urgency}
                    </span>
                  </div>
                  <h3 className="text-xl font-semibold text-gray-800">{request.patientName}</h3>
                  <p className="text-gray-500 mt-1">{request.reason}</p>
                  <div className="grid md:grid-cols-2 gap-3 mt-4 text-sm text-gray-600">
                    <p>Hospital: {request.hospital}</p>
                    <p>Units needed: {request.units}</p>
                    <p>Required by: {request.requiredBy ? new Date(request.requiredBy).toLocaleDateString() : 'Not specified'}</p>
                    <p>Posted: {request.postedAt}</p>
                  </div>
                </div>
                <div className="lg:w-52">
                  <div className="glass-card p-4 bg-gray-50">
                    <p className="text-sm text-gray-500">Donor responses</p>
                    <p className="text-2xl font-bold text-gray-800">{request.responses}</p>
                  </div>
                  <button onClick={() => handleRespond(request)} className="btn-primary w-full mt-4" type="button">
                    Respond
                  </button>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      )}

      <AnimatePresence>
        {showRespondModal && selectedRequest && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4" onClick={() => setShowRespondModal(false)}>
            <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.9, opacity: 0 }} className="bg-white rounded-2xl shadow-xl max-w-lg w-full p-6" onClick={(event) => event.stopPropagation()}>
              <h3 className="text-xl font-semibold text-gray-800 mb-3">Respond to Request</h3>
              <p className="text-gray-600 mb-6">
                Blood group {selectedRequest.bloodGroup}, {selectedRequest.units} unit(s), needed at {selectedRequest.hospital}.
              </p>
              <div className="flex gap-3 justify-end">
                <button onClick={() => setShowRespondModal(false)} className="btn-secondary" type="button">
                  Close
                </button>
                <button onClick={() => submitResponse(false)} disabled={responding} className="btn-secondary" type="button">
                  Decline
                </button>
                <button onClick={() => submitResponse(true)} disabled={responding} className="btn-primary" type="button">
                  {responding ? 'Sending...' : 'Accept'}
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default FindRequests;
