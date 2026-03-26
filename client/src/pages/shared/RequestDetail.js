import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import toast from 'react-hot-toast';
import { donorAPI, requestAPI } from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import { useSocket } from '../../context/SocketContext';

const COMPATIBLE_DONORS = {
  'A+': ['A+', 'A-', 'O+', 'O-'],
  'A-': ['A-', 'O-'],
  'B+': ['B+', 'B-', 'O+', 'O-'],
  'B-': ['B-', 'O-'],
  'AB+': ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'],
  'AB-': ['A-', 'B-', 'AB-', 'O-'],
  'O+': ['O+', 'O-'],
  'O-': ['O-']
};

const getUrgencyStyles = (urgency) => {
  if (urgency === 'emergency' || urgency === 'critical') {
    return 'bg-red-500 text-white';
  }
  if (urgency === 'urgent') {
    return 'bg-orange-500 text-white';
  }
  return 'bg-blue-500 text-white';
};

const getStatusBadge = (status) => {
  if (['approved', 'fulfilled'].includes(status)) return 'bg-green-100 text-green-700';
  if (['cancelled', 'expired'].includes(status)) return 'bg-gray-100 text-gray-700';
  if (['accepted', 'confirmed'].includes(status)) return 'bg-green-100 text-green-700';
  if (['declined'].includes(status)) return 'bg-red-100 text-red-700';
  if (['pending', 'in_progress', 'partially_fulfilled'].includes(status)) {
    return 'bg-yellow-100 text-yellow-700';
  }
  return 'bg-gray-100 text-gray-700';
};

const getTimeRemaining = (requiredBy) => {
  if (!requiredBy) return 'No deadline set';
  const diff = new Date(requiredBy) - new Date();

  if (diff <= 0) return 'Deadline reached';

  const days = Math.floor(diff / (1000 * 60 * 60 * 24));
  const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));

  if (days > 0) return `${days}d ${hours}h remaining`;
  return `${hours}h remaining`;
};

const getTimelineEntries = (request) => {
  if (!request) return [];

  const entries = [
    {
      id: `created-${request._id}`,
      label: 'Request created',
      timestamp: request.createdAt,
      details: request.statusHistory?.[0]?.notes || 'Initial request submitted'
    },
    ...(request.statusHistory || []).map((item, index) => ({
      id: `${item._id || index}-${item.status}`,
      label: `Status changed to ${item.status.replace('_', ' ')}`,
      timestamp: item.changedAt,
      details: item.notes
    }))
  ];

  return entries
    .filter((entry) => entry.timestamp)
    .sort((left, right) => new Date(left.timestamp) - new Date(right.timestamp));
};

const RequestDetail = () => {
  const { id } = useParams();
  const { user } = useAuth();
  const { socket, subscribeToRequest, unsubscribeFromRequest } = useSocket();
  const [request, setRequest] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showResponseModal, setShowResponseModal] = useState(false);
  const [responding, setResponding] = useState(false);
  const [deleting, setDeleting] = useState(false);

  const fetchRequest = useCallback(async () => {
    try {
      setError('');
      const response = await requestAPI.getById(id);
      setRequest(response?.data?.request || null);
    } catch (fetchError) {
      setError(fetchError.response?.data?.message || 'Unable to load this blood request.');
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    fetchRequest();
  }, [fetchRequest]);

  useEffect(() => {
    if (!id) return undefined;

    subscribeToRequest(id);
    return () => unsubscribeFromRequest(id);
  }, [id, subscribeToRequest, unsubscribeFromRequest]);

  useEffect(() => {
    if (!socket) return undefined;

    const handleUpdate = (payload) => {
      if (payload?.requestId === id) {
        fetchRequest();
      }
    };

    socket.on('request_updated', handleUpdate);
    socket.on('request_status_update', handleUpdate);
    socket.on('donor_response', handleUpdate);

    return () => {
      socket.off('request_updated', handleUpdate);
      socket.off('request_status_update', handleUpdate);
      socket.off('donor_response', handleUpdate);
    };
  }, [fetchRequest, id, socket]);

  const currentUserResponse = useMemo(
    () =>
      request?.matchedDonors?.find((entry) => {
        const donorId = entry?.donor?._id || entry?.donor;
        return donorId === user?._id;
      }) || null,
    [request, user]
  );

  const canRespond =
    user?.role === 'donor' &&
    request &&
    ['pending', 'approved', 'in_progress', 'partially_fulfilled'].includes(request.status);

  const canDelete = user && request && (request.requester?._id === user._id || user.role === 'admin');
  const progress = request ? Math.min((Number(request.unitsFulfilled || 0) / Number(request.unitsRequired || 1)) * 100, 100) : 0;
  const timeline = useMemo(() => getTimelineEntries(request), [request]);

  const handleRespond = async (accept) => {
    try {
      setResponding(true);
      const response = await donorAPI.respondToRequest(id, { accept });
      const appointment = response?.data?.appointment;
      toast.success(
        accept
          ? appointment
            ? 'You accepted this request and your appointment was created.'
            : 'You accepted this request.'
          : 'You declined this request.'
      );
      setShowResponseModal(false);
      fetchRequest();
    } catch (responseError) {
      toast.error(responseError.response?.data?.message || 'Unable to update your response.');
    } finally {
      setResponding(false);
    }
  };

  const handleDelete = async () => {
    try {
      setDeleting(true);
      await requestAPI.delete(id);
      toast.success('Request cancelled successfully.');
      fetchRequest();
    } catch (deleteError) {
      toast.error(deleteError.response?.data?.message || 'Unable to cancel this request.');
    } finally {
      setDeleting(false);
    }
  };

  const handleShare = async () => {
    try {
      await navigator.clipboard.writeText(window.location.href);
      toast.success('Request link copied.');
    } catch (copyError) {
      toast.error('Unable to copy the request link.');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 flex items-center justify-center">
        <div className="glass-card p-8 text-gray-500">Loading request details...</div>
      </div>
    );
  }

  if (error || !request) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 flex items-center justify-center p-6">
        <div className="glass-card p-8 max-w-lg text-center">
          <p className="text-red-600 font-medium">{error || 'Request not found.'}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 p-6 lg:p-8">
      <div className="max-w-6xl mx-auto mb-6">
        <div className="flex items-center space-x-2 text-sm text-gray-500">
          <Link to={user?.role === 'receiver' ? '/receiver/my-requests' : '/'} className="hover:text-primary-600">
            Requests
          </Link>
          <span>/</span>
          <span className="text-gray-800">{request._id}</span>
        </div>
      </div>

      <div className="max-w-6xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="glass-card p-6 mb-6"
        >
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
            <div className="flex items-center space-x-6">
              <div className="w-20 h-20 bg-gradient-to-br from-red-400 to-red-600 rounded-2xl flex items-center justify-center text-white text-2xl font-bold shadow-lg shadow-red-500/30">
                {request.bloodGroup}
              </div>
              <div>
                <div className="flex items-center flex-wrap gap-3 mb-2">
                  <span className={`px-3 py-1 rounded-full text-sm font-medium ${getUrgencyStyles(request.urgency)}`}>
                    {request.urgency.toUpperCase()}
                  </span>
                  <span className={`px-3 py-1 rounded-full text-sm font-medium capitalize ${getStatusBadge(request.status)}`}>
                    {request.status.replace('_', ' ')}
                  </span>
                  {currentUserResponse && (
                    <span className={`px-3 py-1 rounded-full text-sm font-medium capitalize ${getStatusBadge(currentUserResponse.status)}`}>
                      Your response: {currentUserResponse.status}
                    </span>
                  )}
                </div>
                <h1 className="text-2xl font-bold text-gray-800">
                  {request.patientInfo?.condition || 'Blood request'} for {request.patientInfo?.name}
                </h1>
                <p className="text-gray-500 mt-1">
                  {request.unitsRequired} units needed • {getTimeRemaining(request.requiredBy)}
                </p>
              </div>
            </div>

            <div className="flex flex-wrap gap-3">
              {canRespond && (
                <button type="button" onClick={() => setShowResponseModal(true)} className="btn-primary">
                  Respond
                </button>
              )}
              <button type="button" onClick={handleShare} className="btn-secondary">
                Share
              </button>
              {canDelete && request.status !== 'cancelled' && (
                <button type="button" onClick={handleDelete} className="btn-secondary" disabled={deleting}>
                  {deleting ? 'Cancelling...' : 'Cancel Request'}
                </button>
              )}
            </div>
          </div>

          <div className="mt-6">
            <div className="flex justify-between text-sm mb-2">
              <span className="text-gray-600">Fulfilment Progress</span>
              <span className="font-medium text-gray-800">
                {request.unitsFulfilled || 0} / {request.unitsRequired} units
              </span>
            </div>
            <div className="h-3 bg-gray-200 rounded-full overflow-hidden">
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${progress}%` }}
                transition={{ duration: 0.5 }}
                className="h-full bg-gradient-to-r from-green-400 to-green-500 rounded-full"
              />
            </div>
          </div>
        </motion.div>

        <div className="grid lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-6">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="glass-card p-6"
            >
              <h2 className="text-xl font-semibold text-gray-800 mb-4">Request Details</h2>

              <div className="grid md:grid-cols-2 gap-4">
                <div className="p-4 bg-gray-50 rounded-xl">
                  <p className="text-sm text-gray-500">Patient</p>
                  <p className="font-medium text-gray-800">{request.patientInfo?.name}</p>
                </div>
                <div className="p-4 bg-gray-50 rounded-xl">
                  <p className="text-sm text-gray-500">Required Blood Group</p>
                  <p className="font-bold text-red-600 text-xl">{request.bloodGroup}</p>
                </div>
                <div className="p-4 bg-gray-50 rounded-xl">
                  <p className="text-sm text-gray-500">Blood Component</p>
                  <p className="font-medium text-gray-800">{request.bloodComponent.replaceAll('_', ' ')}</p>
                </div>
                <div className="p-4 bg-gray-50 rounded-xl">
                  <p className="text-sm text-gray-500">Required By</p>
                  <p className="font-medium text-gray-800">
                    {new Date(request.requiredBy).toLocaleString()}
                  </p>
                </div>
                <div className="p-4 bg-gray-50 rounded-xl">
                  <p className="text-sm text-gray-500">Patient Age</p>
                  <p className="font-medium text-gray-800">{request.patientInfo?.age}</p>
                </div>
                <div className="p-4 bg-gray-50 rounded-xl">
                  <p className="text-sm text-gray-500">Compatible Donor Groups</p>
                  <div className="flex flex-wrap gap-2 mt-2">
                    {(COMPATIBLE_DONORS[request.bloodGroup] || []).map((group) => (
                      <span key={group} className="px-2 py-1 bg-green-100 text-green-700 rounded text-sm font-medium">
                        {group}
                      </span>
                    ))}
                  </div>
                </div>
              </div>

              {request.medicalNotes && (
                <div className="mt-6 p-4 bg-gray-50 rounded-xl">
                  <p className="text-sm text-gray-500">Medical Notes</p>
                  <p className="text-gray-700 mt-2">{request.medicalNotes}</p>
                </div>
              )}
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="glass-card p-6"
            >
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-semibold text-gray-800">Donor Responses</h2>
                <span className="text-primary-600 font-medium">
                  {request.matchedDonors?.length || 0} responses
                </span>
              </div>

              {request.matchedDonors?.length ? (
                <div className="space-y-4">
                  {request.matchedDonors.map((response, index) => {
                    const donorName = [response.donor?.firstName, response.donor?.lastName]
                      .filter(Boolean)
                      .join(' ')
                      .trim();

                    return (
                      <div key={response._id || index} className="flex items-center justify-between p-4 bg-gray-50 rounded-xl">
                        <div>
                          <p className="font-medium text-gray-800">{donorName || 'Donor response'}</p>
                          <p className="text-sm text-gray-500 mt-1">
                            {response.respondedAt
                              ? `Responded ${new Date(response.respondedAt).toLocaleString()}`
                              : 'Awaiting response timestamp'}
                          </p>
                        </div>
                        <span className={`px-3 py-1 rounded-full text-xs font-medium capitalize ${getStatusBadge(response.status)}`}>
                          {response.status.replace('_', ' ')}
                        </span>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <p className="text-gray-500">No donor responses have been recorded yet.</p>
              )}
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="glass-card p-6"
            >
              <h2 className="text-xl font-semibold text-gray-800 mb-4">Timeline</h2>
              <div className="space-y-4">
                {timeline.map((entry) => (
                  <div key={entry.id} className="flex items-start space-x-4">
                    <div className="w-10 h-10 bg-primary-100 rounded-full flex items-center justify-center text-primary-600">
                      •
                    </div>
                    <div className="flex-1 pb-4 border-b border-gray-100 last:border-0">
                      <p className="font-medium text-gray-800">{entry.label}</p>
                      <p className="text-sm text-gray-500">{new Date(entry.timestamp).toLocaleString()}</p>
                      {entry.details && <p className="text-sm text-gray-600 mt-1">{entry.details}</p>}
                    </div>
                  </div>
                ))}
              </div>
            </motion.div>
          </div>

          <div className="space-y-6">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="glass-card p-6"
            >
              <h3 className="font-semibold text-gray-800 mb-4">Hospital Information</h3>
              <div className="space-y-4">
                <div>
                  <p className="font-medium text-gray-800">
                    {request.hospital?.name || request.hospitalName || 'Hospital not linked'}
                  </p>
                  {request.hospital?._id && (
                    <Link to={`/hospitals/${request.hospital._id}`} className="text-sm text-primary-600 hover:underline">
                      View hospital
                    </Link>
                  )}
                </div>
                <div className="text-sm text-gray-600">
                  {request.hospital?.address
                    ? `${request.hospital.address.street || ''} ${request.hospital.address.city || ''} ${request.hospital.address.state || ''}`.trim()
                    : request.hospitalAddress || 'Address unavailable'}
                </div>
                {request.hospital?.phone && (
                  <a href={`tel:${request.hospital.phone}`} className="text-primary-600 hover:underline text-sm">
                    {request.hospital.phone}
                  </a>
                )}
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="glass-card p-6"
            >
              <h3 className="font-semibold text-gray-800 mb-4">Contact Person</h3>
              <div className="space-y-3 text-sm">
                <div>
                  <p className="text-gray-500">Name</p>
                  <p className="text-gray-800 mt-1">{request.contactName}</p>
                </div>
                <div>
                  <p className="text-gray-500">Phone</p>
                  <a href={`tel:${request.contactPhone}`} className="text-primary-600 hover:underline mt-1 block">
                    {request.contactPhone}
                  </a>
                </div>
                {request.alternatePhone && (
                  <div>
                    <p className="text-gray-500">Alternate Phone</p>
                    <a href={`tel:${request.alternatePhone}`} className="text-primary-600 hover:underline mt-1 block">
                      {request.alternatePhone}
                    </a>
                  </div>
                )}
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
              className="glass-card p-6"
            >
              <h3 className="font-semibold text-gray-800 mb-4">Request Metrics</h3>
              <div className="space-y-3 text-sm">
                <div className="flex justify-between gap-4">
                  <span className="text-gray-500">Views</span>
                  <span className="text-gray-800">{request.viewCount || 0}</span>
                </div>
                <div className="flex justify-between gap-4">
                  <span className="text-gray-500">Responses</span>
                  <span className="text-gray-800">{request.responseCount || request.matchedDonors?.length || 0}</span>
                </div>
                <div className="flex justify-between gap-4">
                  <span className="text-gray-500">Broadcast Reach</span>
                  <span className="text-gray-800">{request.broadcastReach || 0}</span>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </div>

      {showResponseModal && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
          onClick={() => setShowResponseModal(false)}
        >
          <motion.div
            initial={{ scale: 0.95, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="bg-white rounded-2xl max-w-md w-full p-6"
            onClick={(event) => event.stopPropagation()}
          >
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-semibold text-gray-800">Respond to Request</h3>
              <button type="button" onClick={() => setShowResponseModal(false)} className="p-2 hover:bg-gray-100 rounded-lg">
                ×
              </button>
            </div>

            <div className="p-4 bg-red-50 rounded-xl mb-6">
              <p className="font-medium text-red-800">
                {request.unitsRequired} units of {request.bloodGroup} are needed for {request.patientInfo?.name}
              </p>
              <p className="text-sm text-red-700 mt-2">
                Only submit a positive response if you are currently eligible to donate.
              </p>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => handleRespond(false)}
                className="btn-secondary"
                disabled={responding}
              >
                Decline
              </button>
              <button
                type="button"
                onClick={() => handleRespond(true)}
                className="btn-primary"
                disabled={responding}
              >
                {responding ? 'Saving...' : 'Accept'}
              </button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </div>
  );
};

export default RequestDetail;
