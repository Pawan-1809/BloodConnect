import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';

const HospitalList = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [bloodGroupFilter, setBloodGroupFilter] = useState('all');
  const [sortBy, setSortBy] = useState('distance');

  // Mock hospitals data
  const hospitals = [
    {
      id: 1,
      name: 'City General Hospital',
      type: 'General Hospital',
      address: '123 Medical Center Drive, New York, NY 10001',
      distance: 2.5,
      rating: 4.8,
      reviews: 245,
      phone: '+1 (212) 555-0123',
      isOpen: true,
      openHours: '24/7',
      image: null,
      services: ['Whole Blood', 'Platelets', 'Plasma'],
      availableStock: {
        'A+': 45, 'A-': 12, 'B+': 38, 'B-': 8,
        'AB+': 15, 'AB-': 5, 'O+': 52, 'O-': 20
      },
      verified: true
    },
    {
      id: 2,
      name: 'Metropolitan Blood Bank',
      type: 'Blood Bank',
      address: '456 Healthcare Blvd, Chicago, IL 60601',
      distance: 4.2,
      rating: 4.5,
      reviews: 189,
      phone: '+1 (312) 555-0456',
      isOpen: true,
      openHours: '8:00 AM - 8:00 PM',
      image: null,
      services: ['Whole Blood', 'Platelets', 'Plasma', 'Red Cells'],
      availableStock: {
        'A+': 32, 'A-': 8, 'B+': 25, 'B-': 6,
        'AB+': 10, 'AB-': 3, 'O+': 40, 'O-': 15
      },
      verified: true
    },
    {
      id: 3,
      name: 'University Hospital',
      type: 'Teaching Hospital',
      address: '555 Academic Drive, Boston, MA 02101',
      distance: 6.8,
      rating: 4.9,
      reviews: 312,
      phone: '+1 (617) 555-0789',
      isOpen: true,
      openHours: '24/7',
      image: null,
      services: ['Whole Blood', 'Platelets', 'Plasma', 'Stem Cells'],
      availableStock: {
        'A+': 58, 'A-': 18, 'B+': 42, 'B-': 12,
        'AB+': 22, 'AB-': 8, 'O+': 65, 'O-': 28
      },
      verified: true
    },
    {
      id: 4,
      name: 'Community Health Center',
      type: 'Medical Center',
      address: '789 Wellness Way, Los Angeles, CA 90001',
      distance: 3.1,
      rating: 4.3,
      reviews: 156,
      phone: '+1 (213) 555-0321',
      isOpen: false,
      openHours: '9:00 AM - 6:00 PM',
      image: null,
      services: ['Whole Blood', 'Platelets'],
      availableStock: {
        'A+': 20, 'A-': 5, 'B+': 15, 'B-': 3,
        'AB+': 8, 'AB-': 2, 'O+': 28, 'O-': 10
      },
      verified: true
    },
    {
      id: 5,
      name: 'Regional Medical Center',
      type: 'General Hospital',
      address: '321 Hospital Road, Houston, TX 77001',
      distance: 8.5,
      rating: 4.1,
      reviews: 98,
      phone: '+1 (713) 555-0654',
      isOpen: true,
      openHours: '7:00 AM - 10:00 PM',
      image: null,
      services: ['Whole Blood', 'Plasma'],
      availableStock: {
        'A+': 35, 'A-': 10, 'B+': 28, 'B-': 7,
        'AB+': 12, 'AB-': 4, 'O+': 45, 'O-': 18
      },
      verified: false
    }
  ];

  const bloodGroups = ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'];

  const filteredHospitals = hospitals
    .filter(hospital => {
      const matchesSearch = hospital.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           hospital.address.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesBloodGroup = bloodGroupFilter === 'all' || 
                                hospital.availableStock[bloodGroupFilter] > 0;
      return matchesSearch && matchesBloodGroup;
    })
    .sort((a, b) => {
      switch (sortBy) {
        case 'distance':
          return a.distance - b.distance;
        case 'rating':
          return b.rating - a.rating;
        case 'name':
          return a.name.localeCompare(b.name);
        default:
          return 0;
      }
    });

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      {/* Hero Section */}
      <div className="bg-gradient-to-r from-red-600 to-red-500 text-white py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center"
          >
            <h1 className="text-4xl font-bold mb-4">Find Blood Banks & Hospitals</h1>
            <p className="text-red-100 text-lg max-w-2xl mx-auto">
              Locate nearby hospitals and blood banks with available blood supply. 
              Schedule your donation or find the blood you need.
            </p>
          </motion.div>

          {/* Search Bar */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="mt-8 max-w-3xl mx-auto"
          >
            <div className="flex flex-col md:flex-row gap-4">
              <div className="flex-1 relative">
                <input
                  type="text"
                  placeholder="Search hospitals by name or location..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full px-5 py-4 rounded-xl text-gray-800 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-white/50"
                />
                <span className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400">🔍</span>
              </div>
              <select
                value={bloodGroupFilter}
                onChange={(e) => setBloodGroupFilter(e.target.value)}
                className="px-5 py-4 rounded-xl text-gray-800 focus:outline-none focus:ring-2 focus:ring-white/50"
              >
                <option value="all">All Blood Types</option>
                {bloodGroups.map(bg => (
                  <option key={bg} value={bg}>{bg}</option>
                ))}
              </select>
            </div>
          </motion.div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Filters & Sort */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-6">
          <p className="text-gray-600 mb-4 sm:mb-0">
            Found <span className="font-semibold text-gray-800">{filteredHospitals.length}</span> hospitals
          </p>
          <div className="flex items-center space-x-4">
            <span className="text-sm text-gray-500">Sort by:</span>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="input-field !py-2 !w-auto"
            >
              <option value="distance">Distance</option>
              <option value="rating">Rating</option>
              <option value="name">Name</option>
            </select>
          </div>
        </div>

        {/* Hospital Cards */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredHospitals.map((hospital, index) => (
            <motion.div
              key={hospital.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
            >
              <Link to={`/hospitals/${hospital.id}`}>
                <div className="glass-card overflow-hidden hover:shadow-xl transition-all group">
                  {/* Image/Header */}
                  <div className="h-32 bg-gradient-to-br from-red-400 to-red-600 relative">
                    <div className="absolute inset-0 flex items-center justify-center">
                      <span className="text-5xl opacity-50">🏥</span>
                    </div>
                    {/* Status Badge */}
                    <div className="absolute top-3 right-3">
                      <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                        hospital.isOpen 
                          ? 'bg-green-500 text-white' 
                          : 'bg-gray-500 text-white'
                      }`}>
                        {hospital.isOpen ? 'Open Now' : 'Closed'}
                      </span>
                    </div>
                    {hospital.verified && (
                      <div className="absolute top-3 left-3">
                        <span className="px-2 py-1 bg-blue-500 text-white rounded-full text-xs flex items-center">
                          <svg className="w-3 h-3 mr-1" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                          </svg>
                          Verified
                        </span>
                      </div>
                    )}
                  </div>

                  {/* Content */}
                  <div className="p-5">
                    <div className="flex items-start justify-between mb-2">
                      <div>
                        <h3 className="font-semibold text-gray-800 group-hover:text-primary-600 transition-colors">
                          {hospital.name}
                        </h3>
                        <p className="text-sm text-gray-500">{hospital.type}</p>
                      </div>
                      <div className="flex items-center text-yellow-500">
                        <span className="font-medium">{hospital.rating}</span>
                        <span className="ml-1">★</span>
                      </div>
                    </div>

                    <p className="text-sm text-gray-600 mb-3 line-clamp-2">
                      📍 {hospital.address}
                    </p>

                    <div className="flex items-center justify-between text-sm mb-4">
                      <span className="text-gray-500">
                        📞 {hospital.phone}
                      </span>
                      <span className="text-primary-600 font-medium">
                        {hospital.distance} km away
                      </span>
                    </div>

                    {/* Blood Types Available */}
                    <div className="border-t border-gray-100 pt-4">
                      <p className="text-xs text-gray-500 mb-2">Available Blood Types:</p>
                      <div className="flex flex-wrap gap-1">
                        {bloodGroups.slice(0, 4).map(bg => (
                          <span
                            key={bg}
                            className={`px-2 py-1 rounded text-xs font-medium ${
                              hospital.availableStock[bg] > 10
                                ? 'bg-green-100 text-green-700'
                                : hospital.availableStock[bg] > 0
                                ? 'bg-yellow-100 text-yellow-700'
                                : 'bg-gray-100 text-gray-400'
                            }`}
                          >
                            {bg}: {hospital.availableStock[bg]}
                          </span>
                        ))}
                        <span className="px-2 py-1 text-xs text-gray-400">+4 more</span>
                      </div>
                    </div>
                  </div>
                </div>
              </Link>
            </motion.div>
          ))}
        </div>

        {/* Empty State */}
        {filteredHospitals.length === 0 && (
          <div className="text-center py-16">
            <span className="text-6xl mb-4 block">🏥</span>
            <h3 className="text-xl font-semibold text-gray-800 mb-2">No hospitals found</h3>
            <p className="text-gray-500">Try adjusting your search or filters</p>
          </div>
        )}

        {/* Map Placeholder */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="mt-12"
        >
          <div className="glass-card p-6">
            <h2 className="text-xl font-semibold text-gray-800 mb-4">Hospitals Near You</h2>
            <div className="h-96 bg-gray-200 rounded-xl flex items-center justify-center">
              <div className="text-center text-gray-500">
                <span className="text-5xl mb-4 block">🗺️</span>
                <p className="font-medium">Interactive Map</p>
                <p className="text-sm">Map integration with Leaflet coming soon</p>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default HospitalList;
