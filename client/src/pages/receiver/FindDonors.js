import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { donorAPI } from '../../services/api';

const bloodTypes = ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'];

const getBloodGroupColor = (bloodGroup) => {
  const colors = {
    'O+': 'from-red-500 to-red-600',
    'O-': 'from-red-600 to-red-700',
    'A+': 'from-blue-500 to-blue-600',
    'A-': 'from-blue-600 to-blue-700',
    'B+': 'from-green-500 to-green-600',
    'B-': 'from-green-600 to-green-700',
    'AB+': 'from-purple-500 to-purple-600',
    'AB-': 'from-purple-600 to-purple-700'
  };
  return colors[bloodGroup] || 'from-gray-500 to-gray-600';
};

const formatDate = (value) => {
  if (!value) return 'No previous donation recorded';
  return new Date(value).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric'
  });
};

const normalizeDonor = (donor) => {
  const nextEligibleDate = donor?.nextEligibleDate ? new Date(donor.nextEligibleDate) : null;
  const isEligible = !nextEligibleDate || nextEligibleDate <= new Date();
  const user = donor?.user || {};

  return {
    id: donor?._id,
    name: [user.firstName, user.lastName].filter(Boolean).join(' ').trim() || 'Donor',
    bloodGroup: donor?.bloodGroup || 'N/A',
    distance: donor?.distance ?? null,
    donations: donor?.totalDonations || 0,
    lastDonation: donor?.lastDonationDate || null,
    eligible: isEligible && donor?.isAvailable !== false,
    verified: donor?.isVerified || false,
    points: donor?.points || 0,
    rank: donor?.donorRank || 'bronze',
    city: user?.address?.city || 'Location unavailable',
    phone: user?.phone || '',
    nextEligibleDate,
    maxTravelDistance: donor?.maxTravelDistance || 0,
    willingToTravel: donor?.willingToTravel || false
  };
};

const FindDonors = () => {
  const [donors, setDonors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [filters, setFilters] = useState({
    bloodGroup: '',
    distance: 25,
    availability: 'all'
  });
  const [sortBy, setSortBy] = useState('distance');
  const [selectedDonor, setSelectedDonor] = useState(null);
  const [userLocation, setUserLocation] = useState(null);
  const [locationStatus, setLocationStatus] = useState('');

  useEffect(() => {
    if (!navigator.geolocation) {
      setLocationStatus('Location access is unavailable in this browser. Results will load without distance.');
      return;
    }

    navigator.geolocation.getCurrentPosition(
      ({ coords }) => {
        setUserLocation({ latitude: coords.latitude, longitude: coords.longitude });
        setLocationStatus('');
      },
      () => {
        setLocationStatus('Allow location access to calculate donor distance.');
      },
      { enableHighAccuracy: false, timeout: 8000, maximumAge: 300000 }
    );
  }, []);

  const fetchDonors = useCallback(async () => {
    setLoading(true);
    setError('');

    try {
      const params = {
        bloodGroup: filters.bloodGroup || undefined,
        radius: filters.distance
      };

      if (userLocation) {
        params.lat = userLocation.latitude;
        params.lng = userLocation.longitude;
      }

      const response = await donorAPI.searchDonors(params);
      const normalized = (response?.data?.donors || []).map(normalizeDonor);
      setDonors(normalized);
    } catch (fetchError) {
      console.error('Error fetching donors:', fetchError);
      setDonors([]);
      setError(fetchError.response?.data?.message || 'Unable to load donor directory right now.');
    } finally {
      setLoading(false);
    }
  }, [filters.bloodGroup, filters.distance, userLocation]);

  useEffect(() => {
    fetchDonors();
  }, [fetchDonors]);

  const filteredDonors = useMemo(() => {
    const list = donors.filter((donor) => {
      if (filters.bloodGroup && donor.bloodGroup !== filters.bloodGroup) return false;
      if (filters.availability === 'eligible' && !donor.eligible) return false;
      if (donor.distance != null && donor.distance > filters.distance) return false;
      return true;
    });

    return [...list].sort((left, right) => {
      if (sortBy === 'donations') {
        return right.donations - left.donations;
      }

      if (sortBy === 'points') {
        return right.points - left.points;
      }

      if (left.distance == null && right.distance == null) return 0;
      if (left.distance == null) return 1;
      if (right.distance == null) return -1;
      return left.distance - right.distance;
    });
  }, [donors, filters.availability, filters.bloodGroup, filters.distance, sortBy]);

  return (
    <div className="p-6 lg:p-8">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="mb-8">
        <h1 className="text-3xl font-bold text-gray-800">Find Donors</h1>
        <p className="text-gray-600 mt-1">
          Browse verified donor profiles from live platform data and use your request workflow to reach the right people.
        </p>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="glass-card p-6 mb-6"
      >
        <div className="flex flex-col lg:flex-row lg:items-end gap-4">
          <div className="flex-1">
            <label className="block text-sm font-medium text-gray-700 mb-2">Blood Group</label>
            <select
              value={filters.bloodGroup}
              onChange={(event) => setFilters((current) => ({ ...current, bloodGroup: event.target.value }))}
              className="input-field"
            >
              <option value="">All Blood Types</option>
              {bloodTypes.map((type) => (
                <option key={type} value={type}>
                  {type}
                </option>
              ))}
            </select>
          </div>

          <div className="flex-1">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Maximum Distance: {filters.distance} km
            </label>
            <input
              type="range"
              min="5"
              max="50"
              value={filters.distance}
              onChange={(event) =>
                setFilters((current) => ({ ...current, distance: parseInt(event.target.value, 10) }))
              }
              className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
            />
          </div>

          <div className="flex-1">
            <label className="block text-sm font-medium text-gray-700 mb-2">Availability</label>
            <select
              value={filters.availability}
              onChange={(event) => setFilters((current) => ({ ...current, availability: event.target.value }))}
              className="input-field"
            >
              <option value="all">All visible donors</option>
              <option value="eligible">Eligible now</option>
            </select>
          </div>

          <div className="flex-1">
            <label className="block text-sm font-medium text-gray-700 mb-2">Sort by</label>
            <select value={sortBy} onChange={(event) => setSortBy(event.target.value)} className="input-field">
              <option value="distance">Distance</option>
              <option value="donations">Donation count</option>
              <option value="points">Points</option>
            </select>
          </div>
        </div>

        {locationStatus && <p className="text-sm text-gray-500 mt-4">{locationStatus}</p>}
      </motion.div>

      <div className="flex justify-between items-center mb-4 gap-4">
        <p className="text-gray-600">
          Found <span className="font-semibold text-gray-800">{filteredDonors.length}</span> donors
        </p>
        <Link to="/receiver/create-request" className="btn-primary text-sm">
          Create Blood Request
        </Link>
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-20">
          <div className="text-center">
            <div className="animate-spin w-12 h-12 border-4 border-primary-500 border-t-transparent rounded-full mx-auto" />
            <p className="text-gray-500 mt-4">Loading donor directory...</p>
          </div>
        </div>
      ) : error ? (
        <div className="glass-card p-10 text-center">
          <p className="text-red-600 font-medium">{error}</p>
          <button type="button" onClick={fetchDonors} className="btn-secondary mt-4">
            Retry
          </button>
        </div>
      ) : filteredDonors.length === 0 ? (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-center py-20 glass-card">
          <h3 className="text-xl font-semibold text-gray-800 mb-2">No donors found</h3>
          <p className="text-gray-500">Try broadening your filters or create a request to notify compatible donors.</p>
        </motion.div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredDonors.map((donor, index) => (
            <motion.div
              key={donor.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.05 }}
              className="glass-card overflow-hidden hover:shadow-lg transition-all"
            >
              <div className={`bg-gradient-to-r ${getBloodGroupColor(donor.bloodGroup)} p-4`}>
                <div className="flex justify-between items-start">
                  <div className="flex items-center space-x-3">
                    <div className="w-14 h-14 bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center text-white text-xl font-bold">
                      {donor.name.charAt(0)}
                    </div>
                    <div className="text-white">
                      <h3 className="font-semibold">{donor.name}</h3>
                      <p className="text-sm opacity-90">{donor.city}</p>
                    </div>
                  </div>
                  <div className="text-white text-center">
                    <div className="text-2xl font-bold">{donor.bloodGroup}</div>
                    {donor.verified && (
                      <span className="text-xs bg-white/20 px-2 py-0.5 rounded-full">Verified</span>
                    )}
                  </div>
                </div>
              </div>

              <div className="p-4 space-y-4">
                <div className="flex justify-between text-center">
                  <div>
                    <p className="text-2xl font-bold text-gray-800">{donor.donations}</p>
                    <p className="text-xs text-gray-500">Donations</p>
                  </div>
                  <div>
                    <p className="text-2xl font-bold text-gray-800">
                      {donor.distance != null ? donor.distance.toFixed(1) : '--'}
                    </p>
                    <p className="text-xs text-gray-500">km away</p>
                  </div>
                  <div>
                    <p className="text-2xl font-bold text-primary-600">{donor.points}</p>
                    <p className="text-xs text-gray-500">Points</p>
                  </div>
                </div>

                <div className="flex items-center justify-between">
                  <span
                    className={`px-3 py-1 rounded-full text-sm font-medium ${
                      donor.eligible ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'
                    }`}
                  >
                    {donor.eligible ? 'Eligible now' : 'Temporarily unavailable'}
                  </span>
                  <span className="text-xs font-semibold uppercase tracking-wide text-gray-500">
                    {donor.rank}
                  </span>
                </div>

                <p className="text-sm text-gray-500">Last donation: {formatDate(donor.lastDonation)}</p>

                {!donor.eligible && donor.nextEligibleDate && (
                  <p className="text-sm text-gray-500">
                    Eligible again on {formatDate(donor.nextEligibleDate)}
                  </p>
                )}
              </div>

              <div className="p-4 bg-gray-50 flex items-center justify-between">
                <button
                  type="button"
                  onClick={() => setSelectedDonor(donor)}
                  className="text-gray-600 hover:text-primary-600 font-medium text-sm"
                >
                  View Details
                </button>
                <Link to="/receiver/create-request" className="btn-primary text-sm">
                  Create Request
                </Link>
              </div>
            </motion.div>
          ))}
        </div>
      )}

      <AnimatePresence>
        {selectedDonor && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
            onClick={() => setSelectedDonor(null)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-white rounded-2xl shadow-xl max-w-lg w-full overflow-hidden"
              onClick={(event) => event.stopPropagation()}
            >
              <div className={`bg-gradient-to-r ${getBloodGroupColor(selectedDonor.bloodGroup)} px-6 py-6`}>
                <div className="flex items-center space-x-4">
                  <div className="w-20 h-20 bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center text-white text-3xl font-bold">
                    {selectedDonor.name.charAt(0)}
                  </div>
                  <div className="text-white">
                    <h3 className="text-2xl font-bold">{selectedDonor.name}</h3>
                    <p className="opacity-90">{selectedDonor.city}</p>
                    <span className="inline-flex items-center mt-2 text-sm bg-white/20 px-3 py-1 rounded-full">
                      {selectedDonor.verified ? 'Verified donor' : 'Unverified donor'}
                    </span>
                  </div>
                </div>
              </div>

              <div className="p-6 space-y-6">
                <div className="grid grid-cols-3 gap-4 text-center">
                  <div className="p-3 bg-gray-50 rounded-xl">
                    <p className="text-2xl font-bold text-primary-600">{selectedDonor.bloodGroup}</p>
                    <p className="text-xs text-gray-500">Blood Type</p>
                  </div>
                  <div className="p-3 bg-gray-50 rounded-xl">
                    <p className="text-2xl font-bold text-gray-800">{selectedDonor.donations}</p>
                    <p className="text-xs text-gray-500">Donations</p>
                  </div>
                  <div className="p-3 bg-gray-50 rounded-xl">
                    <p className="text-2xl font-bold text-primary-600">{selectedDonor.points}</p>
                    <p className="text-xs text-gray-500">Points</p>
                  </div>
                </div>

                <div className="space-y-3 text-gray-600">
                  <p>{selectedDonor.distance != null ? `${selectedDonor.distance.toFixed(1)} km away` : 'Distance unavailable'}</p>
                  <p>Last donation: {formatDate(selectedDonor.lastDonation)}</p>
                  <p>Rank: {selectedDonor.rank}</p>
                  <p>
                    Travel preference:{' '}
                    {selectedDonor.willingToTravel ? `Up to ${selectedDonor.maxTravelDistance} km` : 'Nearby only'}
                  </p>
                  {selectedDonor.phone && <p>Phone: {selectedDonor.phone}</p>}
                </div>

                <div
                  className={`p-4 rounded-xl ${
                    selectedDonor.eligible ? 'bg-green-50 border border-green-200' : 'bg-yellow-50 border border-yellow-200'
                  }`}
                >
                  <p className={`font-medium ${selectedDonor.eligible ? 'text-green-800' : 'text-yellow-800'}`}>
                    {selectedDonor.eligible ? 'Currently eligible to donate' : 'Currently not eligible to donate'}
                  </p>
                  {!selectedDonor.eligible && selectedDonor.nextEligibleDate && (
                    <p className="text-sm text-yellow-700 mt-1">
                      Expected eligibility: {formatDate(selectedDonor.nextEligibleDate)}
                    </p>
                  )}
                </div>
              </div>

              <div className="px-6 py-4 bg-gray-50 flex justify-end space-x-3">
                <button type="button" onClick={() => setSelectedDonor(null)} className="btn-secondary">
                  Close
                </button>
                <Link to="/receiver/create-request" className="btn-primary">
                  Start Blood Request
                </Link>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default FindDonors;
