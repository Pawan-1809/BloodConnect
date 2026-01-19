import React, { useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { motion } from 'framer-motion';

const HospitalDetail = () => {
  const { id } = useParams();
  const [activeTab, setActiveTab] = useState('overview');
  const [showScheduleModal, setShowScheduleModal] = useState(false);

  // Mock hospital data
  const hospital = {
    id: id,
    name: 'City General Hospital',
    type: 'General Hospital',
    description: 'City General Hospital is a leading healthcare facility with a state-of-the-art blood bank serving the greater New York area. Our dedicated team ensures a safe and comfortable donation experience for all donors.',
    address: '123 Medical Center Drive, New York, NY 10001',
    distance: 2.5,
    rating: 4.8,
    reviews: 245,
    phone: '+1 (212) 555-0123',
    email: 'bloodbank@cityhospital.com',
    website: 'www.citygeneralhospital.com',
    isOpen: true,
    verified: true,
    operatingHours: {
      monday: { open: '06:00', close: '22:00' },
      tuesday: { open: '06:00', close: '22:00' },
      wednesday: { open: '06:00', close: '22:00' },
      thursday: { open: '06:00', close: '22:00' },
      friday: { open: '06:00', close: '22:00' },
      saturday: { open: '08:00', close: '18:00' },
      sunday: { open: '08:00', close: '14:00' }
    },
    services: [
      { name: 'Whole Blood Donation', available: true },
      { name: 'Platelet Donation', available: true },
      { name: 'Plasma Donation', available: true },
      { name: 'Red Cell Donation', available: false },
      { name: 'Blood Testing', available: true },
      { name: 'Emergency Supply', available: true }
    ],
    facilities: [
      'Modern Donation Center',
      'Waiting Lounge',
      'Refreshment Area',
      'Wheelchair Accessible',
      'Free Parking',
      'WiFi Available'
    ],
    bloodStock: {
      'A+': { units: 45, status: 'adequate' },
      'A-': { units: 12, status: 'low' },
      'B+': { units: 38, status: 'adequate' },
      'B-': { units: 8, status: 'critical' },
      'AB+': { units: 15, status: 'adequate' },
      'AB-': { units: 5, status: 'critical' },
      'O+': { units: 52, status: 'adequate' },
      'O-': { units: 20, status: 'low' }
    },
    recentReviews: [
      { id: 1, user: 'John D.', rating: 5, comment: 'Excellent service and very professional staff. The donation process was quick and comfortable.', date: '2024-12-05' },
      { id: 2, user: 'Sarah M.', rating: 4, comment: 'Good experience overall. Wait time was a bit long but the staff was friendly.', date: '2024-12-02' },
      { id: 3, user: 'Mike R.', rating: 5, comment: 'Best blood bank in the city! Clean facilities and caring nurses.', date: '2024-11-28' }
    ],
    stats: {
      totalDonations: 15420,
      donorsThisMonth: 892,
      livesImpacted: 46260
    }
  };

  const tabs = [
    { id: 'overview', label: 'Overview', icon: '📋' },
    { id: 'stock', label: 'Blood Stock', icon: '🩸' },
    { id: 'services', label: 'Services', icon: '🩺' },
    { id: 'reviews', label: 'Reviews', icon: '⭐' }
  ];

  const getStockStatusColor = (status) => {
    switch (status) {
      case 'adequate': return 'bg-green-100 text-green-700 border-green-200';
      case 'low': return 'bg-yellow-100 text-yellow-700 border-yellow-200';
      case 'critical': return 'bg-red-100 text-red-700 border-red-200';
      default: return 'bg-gray-100 text-gray-700';
    }
  };

  const days = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'];

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      {/* Hero Section */}
      <div className="bg-gradient-to-r from-red-600 to-red-500 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {/* Breadcrumb */}
          <div className="flex items-center space-x-2 text-red-200 text-sm mb-6">
            <Link to="/hospitals" className="hover:text-white">Hospitals</Link>
            <span>/</span>
            <span className="text-white">{hospital.name}</span>
          </div>

          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between">
            <div className="flex items-center space-x-6">
              <div className="w-24 h-24 bg-white/20 backdrop-blur-sm rounded-2xl flex items-center justify-center">
                <span className="text-5xl">🏥</span>
              </div>
              <div>
                <div className="flex items-center space-x-3 mb-2">
                  <h1 className="text-3xl font-bold">{hospital.name}</h1>
                  {hospital.verified && (
                    <span className="bg-blue-500 text-white px-2 py-1 rounded-full text-xs flex items-center">
                      <svg className="w-3 h-3 mr-1" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                      </svg>
                      Verified
                    </span>
                  )}
                </div>
                <p className="text-red-100">{hospital.type}</p>
                <div className="flex items-center space-x-4 mt-2">
                  <div className="flex items-center">
                    <span className="text-yellow-300">★</span>
                    <span className="ml-1 font-medium">{hospital.rating}</span>
                    <span className="text-red-200 ml-1">({hospital.reviews} reviews)</span>
                  </div>
                  <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                    hospital.isOpen ? 'bg-green-500' : 'bg-gray-500'
                  }`}>
                    {hospital.isOpen ? 'Open Now' : 'Closed'}
                  </span>
                </div>
              </div>
            </div>

            <div className="mt-6 lg:mt-0 flex space-x-3">
              <button
                onClick={() => setShowScheduleModal(true)}
                className="bg-white text-red-600 px-6 py-3 rounded-xl font-semibold hover:bg-red-50 transition-colors"
              >
                Schedule Donation
              </button>
              <a
                href={`tel:${hospital.phone}`}
                className="bg-white/20 backdrop-blur-sm text-white px-6 py-3 rounded-xl font-semibold hover:bg-white/30 transition-colors"
              >
                📞 Call Now
              </a>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Stats */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="grid grid-cols-3 gap-4 mb-8"
        >
          {[
            { label: 'Total Donations', value: hospital.stats.totalDonations.toLocaleString(), icon: '🩸' },
            { label: 'This Month', value: hospital.stats.donorsThisMonth, icon: '📅' },
            { label: 'Lives Impacted', value: hospital.stats.livesImpacted.toLocaleString(), icon: '❤️' }
          ].map((stat, index) => (
            <div key={index} className="glass-card p-4 text-center">
              <span className="text-2xl">{stat.icon}</span>
              <p className="text-2xl font-bold text-gray-800 mt-2">{stat.value}</p>
              <p className="text-sm text-gray-500">{stat.label}</p>
            </div>
          ))}
        </motion.div>

        {/* Tabs */}
        <div className="flex space-x-2 mb-6 overflow-x-auto pb-2">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center space-x-2 px-4 py-2 rounded-xl font-medium whitespace-nowrap transition-all ${
                activeTab === tab.id
                  ? 'bg-primary-500 text-white'
                  : 'bg-white text-gray-600 hover:bg-gray-100'
              }`}
            >
              <span>{tab.icon}</span>
              <span>{tab.label}</span>
            </button>
          ))}
        </div>

        <div className="grid lg:grid-cols-3 gap-6">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Overview Tab */}
            {activeTab === 'overview' && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="space-y-6"
              >
                <div className="glass-card p-6">
                  <h2 className="text-xl font-semibold text-gray-800 mb-4">About</h2>
                  <p className="text-gray-600">{hospital.description}</p>
                </div>

                <div className="glass-card p-6">
                  <h2 className="text-xl font-semibold text-gray-800 mb-4">Facilities</h2>
                  <div className="grid grid-cols-2 gap-3">
                    {hospital.facilities.map((facility, index) => (
                      <div key={index} className="flex items-center space-x-2 text-gray-600">
                        <span className="text-green-500">✓</span>
                        <span>{facility}</span>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="glass-card p-6">
                  <h2 className="text-xl font-semibold text-gray-800 mb-4">Operating Hours</h2>
                  <div className="space-y-2">
                    {days.map((day) => (
                      <div key={day} className="flex justify-between py-2 border-b border-gray-100 last:border-0">
                        <span className="font-medium text-gray-700 capitalize">{day}</span>
                        <span className="text-gray-600">
                          {hospital.operatingHours[day].open} - {hospital.operatingHours[day].close}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              </motion.div>
            )}

            {/* Blood Stock Tab */}
            {activeTab === 'stock' && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="glass-card p-6"
              >
                <h2 className="text-xl font-semibold text-gray-800 mb-6">Current Blood Stock</h2>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  {Object.entries(hospital.bloodStock).map(([type, data]) => (
                    <div key={type} className={`p-4 rounded-xl border-2 ${getStockStatusColor(data.status)}`}>
                      <div className="text-center">
                        <span className="text-3xl font-bold">{type}</span>
                        <p className="text-2xl font-semibold mt-2">{data.units}</p>
                        <p className="text-sm">units</p>
                        <span className="inline-block mt-2 px-2 py-1 rounded-full text-xs capitalize">
                          {data.status}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>

                <div className="mt-6 p-4 bg-blue-50 rounded-xl">
                  <p className="text-sm text-blue-700">
                    💡 Blood stock levels are updated in real-time. Critical and low stock types need urgent donations.
                  </p>
                </div>
              </motion.div>
            )}

            {/* Services Tab */}
            {activeTab === 'services' && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="glass-card p-6"
              >
                <h2 className="text-xl font-semibold text-gray-800 mb-6">Services Offered</h2>
                <div className="space-y-4">
                  {hospital.services.map((service, index) => (
                    <div key={index} className="flex items-center justify-between p-4 bg-gray-50 rounded-xl">
                      <span className="font-medium text-gray-800">{service.name}</span>
                      <span className={`px-3 py-1 rounded-full text-sm ${
                        service.available
                          ? 'bg-green-100 text-green-700'
                          : 'bg-gray-200 text-gray-500'
                      }`}>
                        {service.available ? 'Available' : 'Not Available'}
                      </span>
                    </div>
                  ))}
                </div>
              </motion.div>
            )}

            {/* Reviews Tab */}
            {activeTab === 'reviews' && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="glass-card p-6"
              >
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-xl font-semibold text-gray-800">Reviews</h2>
                  <button className="btn-secondary text-sm">Write Review</button>
                </div>
                <div className="space-y-4">
                  {hospital.recentReviews.map((review) => (
                    <div key={review.id} className="p-4 bg-gray-50 rounded-xl">
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center space-x-3">
                          <div className="w-10 h-10 bg-primary-100 text-primary-600 rounded-full flex items-center justify-center font-medium">
                            {review.user.charAt(0)}
                          </div>
                          <div>
                            <p className="font-medium text-gray-800">{review.user}</p>
                            <div className="flex text-yellow-400 text-sm">
                              {'★'.repeat(review.rating)}{'☆'.repeat(5 - review.rating)}
                            </div>
                          </div>
                        </div>
                        <span className="text-sm text-gray-400">{review.date}</span>
                      </div>
                      <p className="text-gray-600">{review.comment}</p>
                    </div>
                  ))}
                </div>
              </motion.div>
            )}
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Contact Card */}
            <div className="glass-card p-6">
              <h3 className="font-semibold text-gray-800 mb-4">Contact Information</h3>
              <div className="space-y-4">
                <div className="flex items-start space-x-3">
                  <span className="text-xl">📍</span>
                  <div>
                    <p className="text-sm text-gray-500">Address</p>
                    <p className="text-gray-800">{hospital.address}</p>
                  </div>
                </div>
                <div className="flex items-start space-x-3">
                  <span className="text-xl">📞</span>
                  <div>
                    <p className="text-sm text-gray-500">Phone</p>
                    <a href={`tel:${hospital.phone}`} className="text-primary-600 hover:underline">
                      {hospital.phone}
                    </a>
                  </div>
                </div>
                <div className="flex items-start space-x-3">
                  <span className="text-xl">✉️</span>
                  <div>
                    <p className="text-sm text-gray-500">Email</p>
                    <a href={`mailto:${hospital.email}`} className="text-primary-600 hover:underline">
                      {hospital.email}
                    </a>
                  </div>
                </div>
                <div className="flex items-start space-x-3">
                  <span className="text-xl">🌐</span>
                  <div>
                    <p className="text-sm text-gray-500">Website</p>
                    <a href={`https://${hospital.website}`} target="_blank" rel="noopener noreferrer" className="text-primary-600 hover:underline">
                      {hospital.website}
                    </a>
                  </div>
                </div>
              </div>
            </div>

            {/* Map Placeholder */}
            <div className="glass-card p-6">
              <h3 className="font-semibold text-gray-800 mb-4">Location</h3>
              <div className="h-48 bg-gray-200 rounded-xl flex items-center justify-center">
                <div className="text-center text-gray-500">
                  <span className="text-3xl">🗺️</span>
                  <p className="text-sm mt-2">Map View</p>
                </div>
              </div>
              <button className="w-full mt-4 btn-secondary">
                Get Directions
              </button>
            </div>

            {/* Quick Actions */}
            <div className="glass-card p-6">
              <h3 className="font-semibold text-gray-800 mb-4">Quick Actions</h3>
              <div className="space-y-3">
                <button
                  onClick={() => setShowScheduleModal(true)}
                  className="w-full btn-primary"
                >
                  Schedule Donation
                </button>
                <button className="w-full btn-secondary">
                  Request Blood
                </button>
                <button className="w-full py-2 text-gray-600 hover:text-primary-600 transition-colors">
                  Share Hospital
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Schedule Modal */}
      {showScheduleModal && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
          onClick={() => setShowScheduleModal(false)}
        >
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="bg-white rounded-2xl max-w-md w-full p-6"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-semibold text-gray-800">Schedule Donation</h3>
              <button onClick={() => setShowScheduleModal(false)} className="p-2 hover:bg-gray-100 rounded-lg">
                ✕
              </button>
            </div>

            <form className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Donation Type</label>
                <select className="input-field">
                  <option>Whole Blood Donation</option>
                  <option>Platelet Donation</option>
                  <option>Plasma Donation</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Preferred Date</label>
                <input type="date" className="input-field" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Preferred Time</label>
                <select className="input-field">
                  <option>9:00 AM</option>
                  <option>10:00 AM</option>
                  <option>11:00 AM</option>
                  <option>2:00 PM</option>
                  <option>3:00 PM</option>
                  <option>4:00 PM</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Notes (Optional)</label>
                <textarea className="input-field" rows={3} placeholder="Any special requirements..." />
              </div>
              <div className="flex space-x-3 pt-4">
                <button type="button" onClick={() => setShowScheduleModal(false)} className="flex-1 btn-secondary">
                  Cancel
                </button>
                <button type="submit" className="flex-1 btn-primary">
                  Confirm
                </button>
              </div>
            </form>
          </motion.div>
        </motion.div>
      )}
    </div>
  );
};

export default HospitalDetail;
