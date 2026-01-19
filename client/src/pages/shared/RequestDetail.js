import React, { useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { motion } from 'framer-motion';

const RequestDetail = () => {
  const { id } = useParams();
  const [showResponseModal, setShowResponseModal] = useState(false);

  // Mock request data
  const request = {
    id: id,
    status: 'active',
    urgency: 'critical',
    patientName: 'John Smith',
    bloodGroup: 'A+',
    unitsNeeded: 3,
    unitsFulfilled: 1,
    reason: 'Emergency Surgery - Heart Bypass',
    description: 'Patient requires urgent blood transfusion for scheduled heart bypass surgery. Family requests help from eligible donors.',
    hospital: {
      id: 1,
      name: 'City General Hospital',
      address: '123 Medical Center Drive, New York, NY 10001',
      phone: '+1 (212) 555-0123'
    },
    requester: {
      name: 'Jane Smith',
      relation: 'Spouse',
      phone: '+1 (212) 555-4567',
      email: 'jane.smith@email.com'
    },
    createdAt: '2024-12-07T10:30:00',
    expiresAt: '2024-12-10T10:30:00',
    responses: [
      { id: 1, donorName: 'Michael D.', bloodGroup: 'A+', status: 'confirmed', respondedAt: '2024-12-07T14:00:00' },
      { id: 2, donorName: 'Sarah K.', bloodGroup: 'A+', status: 'pending', respondedAt: '2024-12-07T15:30:00' },
      { id: 3, donorName: 'David L.', bloodGroup: 'A-', status: 'pending', respondedAt: '2024-12-08T09:00:00' }
    ],
    compatibleTypes: ['A+', 'A-', 'O+', 'O-'],
    timeline: [
      { event: 'Request Created', time: '2024-12-07T10:30:00', icon: '📝' },
      { event: 'First Response Received', time: '2024-12-07T14:00:00', icon: '👤' },
      { event: 'Donation Confirmed', time: '2024-12-07T16:00:00', icon: '✓' }
    ]
  };

  const getUrgencyStyles = (urgency) => {
    switch (urgency) {
      case 'critical':
        return 'bg-red-500 text-white animate-pulse';
      case 'urgent':
        return 'bg-orange-500 text-white';
      default:
        return 'bg-blue-500 text-white';
    }
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case 'active':
        return 'bg-green-100 text-green-700';
      case 'fulfilled':
        return 'bg-blue-100 text-blue-700';
      case 'expired':
        return 'bg-gray-100 text-gray-700';
      case 'confirmed':
        return 'bg-green-100 text-green-700';
      case 'pending':
        return 'bg-yellow-100 text-yellow-700';
      default:
        return 'bg-gray-100 text-gray-700';
    }
  };

  const getTimeRemaining = () => {
    const now = new Date();
    const expiry = new Date(request.expiresAt);
    const diff = expiry - now;
    
    if (diff < 0) return 'Expired';
    
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    
    if (days > 0) return `${days}d ${hours}h remaining`;
    return `${hours}h remaining`;
  };

  const progress = (request.unitsFulfilled / request.unitsNeeded) * 100;

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 p-6 lg:p-8">
      {/* Breadcrumb */}
      <div className="max-w-6xl mx-auto mb-6">
        <div className="flex items-center space-x-2 text-sm text-gray-500">
          <Link to="/requests" className="hover:text-primary-600">Requests</Link>
          <span>/</span>
          <span className="text-gray-800">{request.id}</span>
        </div>
      </div>

      <div className="max-w-6xl mx-auto">
        {/* Header Card */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="glass-card p-6 mb-6"
        >
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between">
            <div className="flex items-center space-x-6">
              <div className="w-20 h-20 bg-gradient-to-br from-red-400 to-red-600 rounded-2xl flex items-center justify-center text-white text-2xl font-bold shadow-lg shadow-red-500/30">
                {request.bloodGroup}
              </div>
              <div>
                <div className="flex items-center space-x-3 mb-2">
                  <span className={`px-3 py-1 rounded-full text-sm font-medium ${getUrgencyStyles(request.urgency)}`}>
                    {request.urgency.toUpperCase()}
                  </span>
                  <span className={`px-3 py-1 rounded-full text-sm font-medium capitalize ${getStatusBadge(request.status)}`}>
                    {request.status}
                  </span>
                </div>
                <h1 className="text-2xl font-bold text-gray-800">{request.reason}</h1>
                <p className="text-gray-500 mt-1">
                  Request ID: {request.id} • {getTimeRemaining()}
                </p>
              </div>
            </div>

            <div className="mt-6 lg:mt-0 flex space-x-3">
              <button
                onClick={() => setShowResponseModal(true)}
                className="btn-primary"
              >
                Respond to Request
              </button>
              <button className="btn-secondary">
                Share
              </button>
            </div>
          </div>

          {/* Progress Bar */}
          <div className="mt-6">
            <div className="flex justify-between text-sm mb-2">
              <span className="text-gray-600">Donation Progress</span>
              <span className="font-medium text-gray-800">{request.unitsFulfilled} / {request.unitsNeeded} units</span>
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
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Request Details */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="glass-card p-6"
            >
              <h2 className="text-xl font-semibold text-gray-800 mb-4">Request Details</h2>
              <p className="text-gray-600 mb-6">{request.description}</p>

              <div className="grid md:grid-cols-2 gap-4">
                <div className="p-4 bg-gray-50 rounded-xl">
                  <p className="text-sm text-gray-500">Patient Name</p>
                  <p className="font-medium text-gray-800">{request.patientName}</p>
                </div>
                <div className="p-4 bg-gray-50 rounded-xl">
                  <p className="text-sm text-gray-500">Blood Group Required</p>
                  <p className="font-bold text-red-600 text-xl">{request.bloodGroup}</p>
                </div>
                <div className="p-4 bg-gray-50 rounded-xl">
                  <p className="text-sm text-gray-500">Units Needed</p>
                  <p className="font-medium text-gray-800">{request.unitsNeeded} units</p>
                </div>
                <div className="p-4 bg-gray-50 rounded-xl">
                  <p className="text-sm text-gray-500">Compatible Blood Types</p>
                  <div className="flex space-x-2 mt-1">
                    {request.compatibleTypes.map((type) => (
                      <span key={type} className="px-2 py-1 bg-green-100 text-green-700 rounded text-sm font-medium">
                        {type}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            </motion.div>

            {/* Donor Responses */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="glass-card p-6"
            >
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-semibold text-gray-800">Donor Responses</h2>
                <span className="text-primary-600 font-medium">{request.responses.length} responses</span>
              </div>

              <div className="space-y-4">
                {request.responses.map((response) => (
                  <div key={response.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-xl">
                    <div className="flex items-center space-x-4">
                      <div className="w-12 h-12 bg-gradient-to-br from-primary-400 to-primary-600 rounded-full flex items-center justify-center text-white font-medium">
                        {response.donorName.charAt(0)}
                      </div>
                      <div>
                        <p className="font-medium text-gray-800">{response.donorName}</p>
                        <p className="text-sm text-gray-500">
                          Blood Type: <span className="font-medium text-red-600">{response.bloodGroup}</span> • 
                          Responded {new Date(response.respondedAt).toLocaleString()}
                        </p>
                      </div>
                    </div>
                    <span className={`px-3 py-1 rounded-full text-xs font-medium capitalize ${getStatusBadge(response.status)}`}>
                      {response.status}
                    </span>
                  </div>
                ))}
              </div>
            </motion.div>

            {/* Timeline */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="glass-card p-6"
            >
              <h2 className="text-xl font-semibold text-gray-800 mb-4">Activity Timeline</h2>
              <div className="space-y-4">
                {request.timeline.map((item, index) => (
                  <div key={index} className="flex items-start space-x-4">
                    <div className="w-10 h-10 bg-primary-100 rounded-full flex items-center justify-center">
                      <span className="text-lg">{item.icon}</span>
                    </div>
                    <div className="flex-1 pb-4 border-b border-gray-100 last:border-0">
                      <p className="font-medium text-gray-800">{item.event}</p>
                      <p className="text-sm text-gray-500">{new Date(item.time).toLocaleString()}</p>
                    </div>
                  </div>
                ))}
              </div>
            </motion.div>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Hospital Info */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="glass-card p-6"
            >
              <h3 className="font-semibold text-gray-800 mb-4">Hospital Information</h3>
              <div className="space-y-4">
                <div className="flex items-center space-x-3">
                  <span className="text-2xl">🏥</span>
                  <div>
                    <p className="font-medium text-gray-800">{request.hospital.name}</p>
                    <Link to={`/hospitals/${request.hospital.id}`} className="text-sm text-primary-600 hover:underline">
                      View Hospital
                    </Link>
                  </div>
                </div>
                <div className="flex items-start space-x-3">
                  <span className="text-xl">📍</span>
                  <p className="text-gray-600 text-sm">{request.hospital.address}</p>
                </div>
                <div className="flex items-center space-x-3">
                  <span className="text-xl">📞</span>
                  <a href={`tel:${request.hospital.phone}`} className="text-primary-600 hover:underline">
                    {request.hospital.phone}
                  </a>
                </div>
              </div>
              <button className="w-full mt-4 btn-secondary">
                Get Directions
              </button>
            </motion.div>

            {/* Requester Info */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="glass-card p-6"
            >
              <h3 className="font-semibold text-gray-800 mb-4">Contact Person</h3>
              <div className="space-y-3">
                <div className="flex items-center space-x-3">
                  <div className="w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center">
                    <span className="text-xl">👤</span>
                  </div>
                  <div>
                    <p className="font-medium text-gray-800">{request.requester.name}</p>
                    <p className="text-sm text-gray-500">{request.requester.relation}</p>
                  </div>
                </div>
                <div className="flex items-center space-x-3">
                  <span className="text-lg">📞</span>
                  <a href={`tel:${request.requester.phone}`} className="text-primary-600 hover:underline">
                    {request.requester.phone}
                  </a>
                </div>
                <div className="flex items-center space-x-3">
                  <span className="text-lg">✉️</span>
                  <a href={`mailto:${request.requester.email}`} className="text-primary-600 hover:underline text-sm">
                    {request.requester.email}
                  </a>
                </div>
              </div>
            </motion.div>

            {/* Important Info */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
              className="glass-card p-6"
            >
              <h3 className="font-semibold text-gray-800 mb-4">Important Information</h3>
              <div className="space-y-3 text-sm">
                <div className="p-3 bg-yellow-50 rounded-xl">
                  <p className="text-yellow-800">
                    ⚠️ Please ensure you meet all eligibility criteria before donating.
                  </p>
                </div>
                <div className="p-3 bg-blue-50 rounded-xl">
                  <p className="text-blue-800">
                    💡 Bring a valid ID and eat well before your donation.
                  </p>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </div>

      {/* Response Modal */}
      {showResponseModal && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
          onClick={() => setShowResponseModal(false)}
        >
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="bg-white rounded-2xl max-w-md w-full p-6"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-semibold text-gray-800">Respond to Request</h3>
              <button onClick={() => setShowResponseModal(false)} className="p-2 hover:bg-gray-100 rounded-lg">
                ✕
              </button>
            </div>

            <div className="p-4 bg-red-50 rounded-xl mb-6">
              <div className="flex items-center space-x-3">
                <span className="text-3xl font-bold text-red-600">{request.bloodGroup}</span>
                <div>
                  <p className="font-medium text-red-800">{request.reason}</p>
                  <p className="text-sm text-red-600">{request.hospital.name}</p>
                </div>
              </div>
            </div>

            <form className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Your Blood Type</label>
                <select className="input-field">
                  {request.compatibleTypes.map((type) => (
                    <option key={type} value={type}>{type}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Preferred Date</label>
                <input type="date" className="input-field" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Message (Optional)</label>
                <textarea className="input-field" rows={3} placeholder="Add a message to the requester..." />
              </div>

              <div className="flex items-start space-x-2">
                <input type="checkbox" id="confirm" className="mt-1 rounded" />
                <label htmlFor="confirm" className="text-sm text-gray-600">
                  I confirm that I am eligible to donate blood and meet all health requirements.
                </label>
              </div>

              <div className="flex space-x-3 pt-4">
                <button type="button" onClick={() => setShowResponseModal(false)} className="flex-1 btn-secondary">
                  Cancel
                </button>
                <button type="submit" className="flex-1 btn-primary">
                  Submit Response
                </button>
              </div>
            </form>
          </motion.div>
        </motion.div>
      )}
    </div>
  );
};

export default RequestDetail;
