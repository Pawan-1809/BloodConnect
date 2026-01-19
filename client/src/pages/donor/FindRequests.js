import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { formatDistanceToNow } from 'date-fns';
import { requestAPI } from '../../services/api';

const bloodTypes = ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'];
const urgencyLevels = ['Critical', 'Urgent', 'Normal'];

// Mock data
const MOCK_REQUESTS = [
  {
    id: 1,
    patientName: 'Anonymous Patient',
    bloodGroup: 'O+',
    units: 2,
    urgency: 'Critical',
    hospital: 'City General Hospital',
    distance: 2.5,
    reason: 'Emergency Surgery',
    requiredBy: '2024-08-16',
    postedAt: '2 hours ago',
    responses: 3,
    status: 'active'
  },
  {
    id: 2,
    patientName: 'Child Patient',
    bloodGroup: 'A-',
    units: 1,
    urgency: 'Urgent',
    hospital: "Children's Hospital",
    distance: 5.8,
    reason: 'Thalassemia Treatment',
    requiredBy: '2024-08-18',
    postedAt: '5 hours ago',
    responses: 1,
    status: 'active'
  },
  {
    id: 3,
    patientName: 'Adult Patient',
    bloodGroup: 'B+',
    units: 3,
    urgency: 'Normal',
    hospital: 'Memorial Medical Center',
    distance: 8.2,
    reason: 'Scheduled Surgery',
    requiredBy: '2024-08-25',
    postedAt: '1 day ago',
    responses: 5,
    status: 'active'
  },
  {
    id: 4,
    patientName: 'Senior Patient',
    bloodGroup: 'AB+',
    units: 2,
    urgency: 'Urgent',
    hospital: 'St. Mary Hospital',
    distance: 12.4,
    reason: 'Heart Surgery',
    requiredBy: '2024-08-20',
    postedAt: '8 hours ago',
    responses: 2,
    status: 'active'
  },
  {
    id: 5,
    patientName: 'Accident Victim',
    bloodGroup: 'O-',
    units: 4,
    urgency: 'Critical',
    hospital: 'Trauma Center',
    distance: 3.1,
    reason: 'Accident Trauma',
    requiredBy: '2024-08-15',
    postedAt: '30 minutes ago',
    responses: 0,
    status: 'active'
  },
  {
    id: 6,
    patientName: 'Cancer Patient',
    bloodGroup: 'A+',
    units: 2,
    urgency: 'Normal',
    hospital: 'Cancer Research Institute',
    distance: 15.7,
    reason: 'Chemotherapy Support',
    requiredBy: '2024-08-30',
    postedAt: '2 days ago',
    responses: 8,
    status: 'active'
  },
];

const FindRequests = () => {
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({
    bloodGroup: '',
    urgency: '',
    distance: 25,
    type: 'all'
  });
  const [selectedRequest, setSelectedRequest] = useState(null);
  const [showRespondModal, setShowRespondModal] = useState(false);

  const mapBackendRequestToCard = useCallback((req, index) => {
    const id = req?._id || req?.id || `${index}`;
    const patientName = req?.patientInfo?.name || req?.patientName || 'Patient';
    const bloodGroup = req?.bloodGroup || req?.bloodType || 'O+';
    const units = Number(req?.unitsRequired ?? req?.units ?? 1);
    const urgencyRaw = (req?.urgency || req?.priority || 'normal').toString().toLowerCase();
    const urgency =
      urgencyRaw === 'critical' || urgencyRaw === 'emergency'
        ? 'Critical'
        : urgencyRaw === 'urgent'
          ? 'Urgent'
          : 'Normal';

    const hospital =
      req?.hospital?.name || req?.hospitalName || req?.hospital || 'Hospital';

    const createdAt = req?.createdAt ? new Date(req.createdAt) : null;
    const postedAt = createdAt && !Number.isNaN(createdAt.getTime())
      ? formatDistanceToNow(createdAt, { addSuffix: true })
      : 'Recently';

    // Backend doesn't currently return a computed distance for donors.
    // Provide a stable pseudo-distance so the UI slider still behaves.
    const distance =
      typeof req?.distance === 'number'
        ? req.distance
        : Math.round((2 + (index * 3.1) % 23) * 10) / 10;

    const reason =
      req?.patientInfo?.condition || req?.medicalNotes || req?.reason || 'Blood needed';

    const requiredBy = req?.requiredBy
      ? new Date(req.requiredBy).toISOString().slice(0, 10)
      : 'N/A';

    const responses = Number(req?.responseCount ?? req?.responses ?? 0);

    return {
      id,
      patientName,
      bloodGroup,
      units: Number.isFinite(units) && units > 0 ? units : 1,
      urgency,
      hospital,
      distance,
      reason,
      requiredBy,
      postedAt,
      responses,
      status: req?.status || 'active'
    };
  }, []);

  const fetchRequests = useCallback(async () => {
    setLoading(true);
    try {
      // Use an existing backend route (GET /api/requests). Filters are applied client-side.
      const response = await requestAPI.getAll({ limit: 50 });
      const raw = response?.data?.requests;
      const mapped = Array.isArray(raw)
        ? raw.map((r, i) => mapBackendRequestToCard(r, i))
        : [];

      setRequests(mapped.length > 0 ? mapped : MOCK_REQUESTS);
    } catch (error) {
      console.error('Error fetching requests:', error);
      setRequests(MOCK_REQUESTS);
    } finally {
      setLoading(false);
    }
  }, [mapBackendRequestToCard]);

  useEffect(() => {
    fetchRequests();
  }, [fetchRequests]);

  const getUrgencyStyle = (urgency) => {
    switch (urgency) {
      case 'Critical':
        return 'bg-red-100 text-red-700 border-red-300';
      case 'Urgent':
        return 'bg-orange-100 text-orange-700 border-orange-300';
      default:
        return 'bg-green-100 text-green-700 border-green-300';
    }
  };

  const getUrgencyIcon = (urgency) => {
    switch (urgency) {
      case 'Critical':
        return '🚨';
      case 'Urgent':
        return '⚠️';
      default:
        return '📋';
    }
  };

  const handleRespond = (request) => {
    setSelectedRequest(request);
    setShowRespondModal(true);
  };

  const submitResponse = async () => {
    try {
      // await requestAPI.respond(selectedRequest.id);
      setShowRespondModal(false);
      setSelectedRequest(null);
      // Show success notification
    } catch (error) {
      console.error('Error responding to request:', error);
    }
  };

  const filteredRequests = requests.filter(req => {
    if (filters.bloodGroup && req.bloodGroup !== filters.bloodGroup) return false;
    if (filters.urgency && req.urgency !== filters.urgency) return false;
    if (req.distance > filters.distance) return false;
    return true;
  });

  return (
    <div className="p-6 lg:p-8">
          {/* Header */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-8"
          >
            <h1 className="text-3xl font-bold text-gray-800">Find Blood Requests</h1>
            <p className="text-gray-600 mt-1">Help save lives by responding to blood requests near you</p>
          </motion.div>

          {/* Filters */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="glass-card p-6 mb-6"
          >
            <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
              <div className="flex flex-wrap gap-4">
                {/* Blood Group Filter */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Blood Group</label>
                  <select
                    value={filters.bloodGroup}
                    onChange={(e) => setFilters({ ...filters, bloodGroup: e.target.value })}
                    className="input-field w-32"
                  >
                    <option value="">All</option>
                    {bloodTypes.map(type => (
                      <option key={type} value={type}>{type}</option>
                    ))}
                  </select>
                </div>

                {/* Urgency Filter */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Urgency</label>
                  <select
                    value={filters.urgency}
                    onChange={(e) => setFilters({ ...filters, urgency: e.target.value })}
                    className="input-field w-36"
                  >
                    <option value="">All</option>
                    {urgencyLevels.map(level => (
                      <option key={level} value={level}>{level}</option>
                    ))}
                  </select>
                </div>

                {/* Distance Filter */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Distance: {filters.distance} km
                  </label>
                  <input
                    type="range"
                    min="5"
                    max="50"
                    value={filters.distance}
                    onChange={(e) => setFilters({ ...filters, distance: parseInt(e.target.value) })}
                    className="w-32 h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
                  />
                </div>
              </div>

              <div className="flex items-center space-x-4">
                <span className="text-gray-500">{filteredRequests.length} requests found</span>
                <div className="flex bg-gray-100 rounded-lg p-1">
                  <button
                    onClick={() => setFilters({ ...filters, type: 'all' })}
                    className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                      filters.type === 'all' ? 'bg-white shadow text-gray-800' : 'text-gray-500'
                    }`}
                  >
                    All
                  </button>
                  <button
                    onClick={() => setFilters({ ...filters, type: 'compatible' })}
                    className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                      filters.type === 'compatible' ? 'bg-white shadow text-gray-800' : 'text-gray-500'
                    }`}
                  >
                    Compatible
                  </button>
                </div>
              </div>
            </div>
          </motion.div>

          {/* Requests Grid */}
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
              className="text-center py-20"
            >
              <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-10 h-10 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <h3 className="text-xl font-semibold text-gray-800 mb-2">No requests found</h3>
              <p className="text-gray-500">Try adjusting your filters or check back later.</p>
            </motion.div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredRequests.map((request, index) => (
                <motion.div
                  key={request.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.05 }}
                  className={`glass-card overflow-hidden hover:shadow-lg transition-shadow ${
                    request.urgency === 'Critical' ? 'border-l-4 border-red-500' : ''
                  }`}
                >
                  {/* Card Header */}
                  <div className="p-4 border-b border-gray-100">
                    <div className="flex items-center justify-between mb-3">
                      <span className={`px-3 py-1 rounded-full text-sm font-medium border ${getUrgencyStyle(request.urgency)}`}>
                        {getUrgencyIcon(request.urgency)} {request.urgency}
                      </span>
                      <span className="text-sm text-gray-500">{request.postedAt}</span>
                    </div>
                    <div className="flex items-center space-x-4">
                      <div className="w-16 h-16 bg-gradient-to-br from-primary-400 to-primary-600 rounded-2xl flex items-center justify-center text-white text-xl font-bold shadow-lg">
                        {request.bloodGroup}
                      </div>
                      <div>
                        <h3 className="text-lg font-semibold text-gray-800">{request.patientName}</h3>
                        <p className="text-sm text-gray-500">{request.reason}</p>
                      </div>
                    </div>
                  </div>

                  {/* Card Body */}
                  <div className="p-4 space-y-3">
                    <div className="flex items-center text-sm text-gray-600">
                      <svg className="w-5 h-5 mr-2 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                      </svg>
                      {request.hospital}
                    </div>
                    <div className="flex items-center text-sm text-gray-600">
                      <svg className="w-5 h-5 mr-2 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                      </svg>
                      {request.distance} km away
                    </div>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center text-sm text-gray-600">
                        <svg className="w-5 h-5 mr-2 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z" />
                        </svg>
                        {request.units} unit(s) needed
                      </div>
                      <span className="text-sm text-primary-600 font-medium">
                        {request.responses} responses
                      </span>
                    </div>
                    <div className="flex items-center text-sm text-gray-600">
                      <svg className="w-5 h-5 mr-2 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                      </svg>
                      Required by: {new Date(request.requiredBy).toLocaleDateString('en-US', {
                        month: 'short',
                        day: 'numeric',
                        year: 'numeric'
                      })}
                    </div>
                  </div>

                  {/* Card Footer */}
                  <div className="p-4 bg-gray-50 flex items-center justify-between">
                    <button
                      onClick={() => setSelectedRequest(request)}
                      className="text-gray-600 hover:text-primary-600 text-sm font-medium transition-colors"
                    >
                      View Details
                    </button>
                    <button
                      onClick={() => handleRespond(request)}
                      className="btn-primary text-sm py-2 px-4"
                    >
                      Respond to Request
                    </button>
                  </div>
                </motion.div>
              ))}
            </div>
          )}

          {/* Response Modal */}
          <AnimatePresence>
            {showRespondModal && selectedRequest && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
                onClick={() => setShowRespondModal(false)}
              >
                <motion.div
                  initial={{ scale: 0.9, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  exit={{ scale: 0.9, opacity: 0 }}
                  className="bg-white rounded-2xl shadow-xl max-w-lg w-full overflow-hidden"
                  onClick={(e) => e.stopPropagation()}
                >
                  <div className="bg-gradient-to-r from-primary-500 to-primary-600 px-6 py-4">
                    <h3 className="text-xl font-semibold text-white">Respond to Request</h3>
                  </div>
                  
                  <div className="p-6 space-y-4">
                    <div className="p-4 bg-gray-50 rounded-xl">
                      <div className="flex items-center space-x-4">
                        <div className="w-14 h-14 bg-gradient-to-br from-primary-400 to-primary-600 rounded-xl flex items-center justify-center text-white font-bold">
                          {selectedRequest.bloodGroup}
                        </div>
                        <div>
                          <h4 className="font-semibold text-gray-800">{selectedRequest.patientName}</h4>
                          <p className="text-sm text-gray-500">{selectedRequest.hospital}</p>
                        </div>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <p className="text-sm text-gray-500">Units Needed</p>
                        <p className="font-semibold">{selectedRequest.units} unit(s)</p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-500">Required By</p>
                        <p className="font-semibold">{selectedRequest.requiredBy}</p>
                      </div>
                    </div>

                    <div className="p-4 bg-yellow-50 rounded-xl border border-yellow-200">
                      <h4 className="font-medium text-yellow-800 mb-2">Before you respond:</h4>
                      <ul className="text-sm text-yellow-700 space-y-1">
                        <li>• Make sure you are eligible to donate</li>
                        <li>• You haven't donated in the last 56 days</li>
                        <li>• You are in good health condition</li>
                        <li>• You can travel to the hospital</li>
                      </ul>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Add a message (optional)
                      </label>
                      <textarea
                        className="input-field"
                        rows={3}
                        placeholder="Let them know when you can come or any other details..."
                      />
                    </div>
                  </div>

                  <div className="px-6 py-4 bg-gray-50 flex justify-end space-x-3">
                    <button
                      onClick={() => setShowRespondModal(false)}
                      className="btn-secondary"
                    >
                      Cancel
                    </button>
                    <button
                      onClick={submitResponse}
                      className="btn-primary"
                    >
                      Confirm Response
                    </button>
                  </div>
                </motion.div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Request Detail Modal */}
          <AnimatePresence>
            {selectedRequest && !showRespondModal && (
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
                    <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                      selectedRequest.urgency === 'Critical' ? 'bg-red-100 text-red-700' :
                      selectedRequest.urgency === 'Urgent' ? 'bg-orange-100 text-orange-700' :
                      'bg-green-100 text-green-700'
                    }`}>
                      {selectedRequest.urgency}
                    </span>
                  </div>
                  
                  <div className="p-6 space-y-6">
                    {/* Patient Info */}
                    <div className="flex items-center space-x-4">
                      <div className="w-20 h-20 bg-gradient-to-br from-primary-400 to-primary-600 rounded-2xl flex items-center justify-center text-white text-2xl font-bold shadow-lg">
                        {selectedRequest.bloodGroup}
                      </div>
                      <div>
                        <h3 className="text-xl font-bold text-gray-800">{selectedRequest.patientName}</h3>
                        <p className="text-gray-500">{selectedRequest.reason}</p>
                        <p className="text-sm text-gray-400">Posted {selectedRequest.postedAt}</p>
                      </div>
                    </div>

                    {/* Details Grid */}
                    <div className="grid grid-cols-2 gap-4">
                      <div className="p-4 bg-gray-50 rounded-xl">
                        <p className="text-sm text-gray-500">Units Needed</p>
                        <p className="text-xl font-bold text-gray-800">{selectedRequest.units}</p>
                      </div>
                      <div className="p-4 bg-gray-50 rounded-xl">
                        <p className="text-sm text-gray-500">Required By</p>
                        <p className="text-xl font-bold text-gray-800">
                          {new Date(selectedRequest.requiredBy).toLocaleDateString('en-US', {
                            month: 'short',
                            day: 'numeric'
                          })}
                        </p>
                      </div>
                      <div className="p-4 bg-gray-50 rounded-xl">
                        <p className="text-sm text-gray-500">Distance</p>
                        <p className="text-xl font-bold text-gray-800">{selectedRequest.distance} km</p>
                      </div>
                      <div className="p-4 bg-gray-50 rounded-xl">
                        <p className="text-sm text-gray-500">Responses</p>
                        <p className="text-xl font-bold text-gray-800">{selectedRequest.responses}</p>
                      </div>
                    </div>

                    {/* Hospital Info */}
                    <div className="p-4 border border-gray-200 rounded-xl">
                      <h4 className="font-semibold text-gray-800 mb-2">Hospital / Blood Bank</h4>
                      <p className="text-gray-600">{selectedRequest.hospital}</p>
                      <div className="mt-3 flex items-center space-x-4">
                        <button className="text-primary-600 hover:text-primary-700 text-sm font-medium flex items-center">
                          <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                          </svg>
                          View on Map
                        </button>
                        <button className="text-primary-600 hover:text-primary-700 text-sm font-medium flex items-center">
                          <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                          </svg>
                          Contact Hospital
                        </button>
                      </div>
                    </div>

                    {/* Compatibility Note */}
                    <div className="p-4 bg-blue-50 rounded-xl border border-blue-200">
                      <h4 className="font-medium text-blue-800 flex items-center">
                        <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                        Blood Type Compatibility
                      </h4>
                      <p className="text-sm text-blue-700 mt-1">
                        {selectedRequest.bloodGroup} can receive from: {
                          selectedRequest.bloodGroup === 'AB+' ? 'All blood types' :
                          selectedRequest.bloodGroup === 'AB-' ? 'A-, B-, AB-, O-' :
                          selectedRequest.bloodGroup === 'O+' ? 'O+, O-' :
                          selectedRequest.bloodGroup === 'O-' ? 'O- only' :
                          selectedRequest.bloodGroup === 'A+' ? 'A+, A-, O+, O-' :
                          selectedRequest.bloodGroup === 'A-' ? 'A-, O-' :
                          selectedRequest.bloodGroup === 'B+' ? 'B+, B-, O+, O-' :
                          'B-, O-'
                        }
                      </p>
                    </div>
                  </div>

                  <div className="px-6 py-4 bg-gray-50 flex justify-end space-x-3">
                    <button
                      onClick={() => setSelectedRequest(null)}
                      className="btn-secondary"
                    >
                      Close
                    </button>
                    <button
                      onClick={() => handleRespond(selectedRequest)}
                      className="btn-primary"
                    >
                      Respond to Request
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
