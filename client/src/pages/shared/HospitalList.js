import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import { hospitalAPI } from '../../services/api';

const BLOOD_GROUPS = ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'];
const HOSPITAL_TYPES = [
  { value: 'all', label: 'All Types' },
  { value: 'hospital', label: 'Hospitals' },
  { value: 'blood_bank', label: 'Blood Banks' },
  { value: 'clinic', label: 'Clinics' },
  { value: 'donation_center', label: 'Donation Centers' }
];

const getAddressText = (address = {}) =>
  [address.street, address.city, address.state, address.country].filter(Boolean).join(', ');

const formatType = (type = '') =>
  type
    .split('_')
    .filter(Boolean)
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(' ');

const getOpenHoursLabel = (hospital) => {
  if (hospital?.is24Hours) {
    return 'Open 24/7';
  }

  const todayKey = new Date().toLocaleDateString('en-US', { weekday: 'long' }).toLowerCase();
  const hours = hospital?.operatingHours?.[todayKey];

  if (!hours?.isOpen) {
    return 'Closed today';
  }

  if (hours?.open && hours?.close) {
    return `${hours.open} - ${hours.close}`;
  }

  return 'Hours unavailable';
};

const getStatusPriority = (status = 'adequate') => {
  if (status === 'critical') return 3;
  if (status === 'low') return 2;
  if (status === 'adequate') return 1;
  return 0;
};

const summarizeStocks = (stocks = []) => {
  return stocks.reduce((summary, stock) => {
    const key = stock.bloodGroup;
    if (!summary[key]) {
      summary[key] = {
        bloodGroup: key,
        availableUnits: 0,
        totalUnits: 0,
        status: 'adequate'
      };
    }

    summary[key].availableUnits += Number(stock.availableUnits || 0);
    summary[key].totalUnits += Number(stock.totalUnits || 0);

    if (getStatusPriority(stock.status) > getStatusPriority(summary[key].status)) {
      summary[key].status = stock.status;
    }

    return summary;
  }, {});
};

const toRadians = (value) => (value * Math.PI) / 180;

const calculateDistanceKm = (origin, destination) => {
  if (!origin || !destination || destination.length !== 2) {
    return null;
  }

  const [destLng, destLat] = destination;
  if (!destLat && !destLng) {
    return null;
  }

  const earthRadiusKm = 6371;
  const deltaLat = toRadians(destLat - origin.latitude);
  const deltaLng = toRadians(destLng - origin.longitude);
  const lat1 = toRadians(origin.latitude);
  const lat2 = toRadians(destLat);

  const a =
    Math.sin(deltaLat / 2) * Math.sin(deltaLat / 2) +
    Math.cos(lat1) * Math.cos(lat2) * Math.sin(deltaLng / 2) * Math.sin(deltaLng / 2);

  return earthRadiusKm * (2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a)));
};

const HospitalList = () => {
  const [searchParams] = useSearchParams();
  const [hospitals, setHospitals] = useState([]);
  const [stockByHospital, setStockByHospital] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [bloodGroupFilter, setBloodGroupFilter] = useState('all');
  const [typeFilter, setTypeFilter] = useState(searchParams.get('type') || 'all');
  const [sortBy, setSortBy] = useState('rating');
  const [verifiedOnly, setVerifiedOnly] = useState(false);
  const [userLocation, setUserLocation] = useState(null);
  const [locationStatus, setLocationStatus] = useState('');

  const fetchHospitals = useCallback(async () => {
    try {
      setError('');
      const response = await hospitalAPI.getAll({ limit: 100 });
      const items = response?.data?.hospitals || [];
      setHospitals(items);

      const stockResults = await Promise.allSettled(
        items.map(async (hospital) => {
          const stockResponse = await hospitalAPI.getPublicStock(hospital._id);
          return [hospital._id, summarizeStocks(stockResponse?.data?.stocks || [])];
        })
      );

      const nextStocks = stockResults.reduce((accumulator, result) => {
        if (result.status === 'fulfilled') {
          const [hospitalId, summary] = result.value;
          accumulator[hospitalId] = summary;
        }
        return accumulator;
      }, {});

      setStockByHospital(nextStocks);
    } catch (fetchError) {
      setError(fetchError.response?.data?.message || 'Unable to load hospitals right now.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchHospitals();
    const intervalId = setInterval(fetchHospitals, 60000);
    return () => clearInterval(intervalId);
  }, [fetchHospitals]);

  useEffect(() => {
    if (!navigator.geolocation) {
      setLocationStatus('Distance sorting is unavailable in this browser.');
      return;
    }

    navigator.geolocation.getCurrentPosition(
      ({ coords }) => {
        setUserLocation({
          latitude: coords.latitude,
          longitude: coords.longitude
        });
        setLocationStatus('');
      },
      () => {
        setLocationStatus('Allow location access to sort hospitals by distance.');
      },
      { enableHighAccuracy: false, timeout: 8000, maximumAge: 300000 }
    );
  }, []);

  useEffect(() => {
    setTypeFilter(searchParams.get('type') || 'all');
  }, [searchParams]);

  const filteredHospitals = useMemo(() => {
    const normalizedSearch = searchTerm.trim().toLowerCase();

    const list = hospitals
      .map((hospital) => {
        const stockSummary = stockByHospital[hospital._id] || {};
        return {
          ...hospital,
          stockSummary,
          distanceKm: calculateDistanceKm(userLocation, hospital?.location?.coordinates)
        };
      })
      .filter((hospital) => {
        const addressText = getAddressText(hospital.address).toLowerCase();
        const matchesSearch =
          !normalizedSearch ||
          hospital.name?.toLowerCase().includes(normalizedSearch) ||
          addressText.includes(normalizedSearch);
        const matchesBloodGroup =
          bloodGroupFilter === 'all' ||
          Number(hospital.stockSummary?.[bloodGroupFilter]?.availableUnits || 0) > 0;
        const matchesType = typeFilter === 'all' || hospital.type === typeFilter;
        const matchesVerified = !verifiedOnly || hospital.isVerified;

        return matchesSearch && matchesBloodGroup && matchesType && matchesVerified;
      });

    return list.sort((left, right) => {
      if (sortBy === 'distance') {
        if (left.distanceKm == null && right.distanceKm == null) return 0;
        if (left.distanceKm == null) return 1;
        if (right.distanceKm == null) return -1;
        return left.distanceKm - right.distanceKm;
      }

      if (sortBy === 'name') {
        return (left.name || '').localeCompare(right.name || '');
      }

      if (sortBy === 'reviews') {
        return (right.totalReviews || 0) - (left.totalReviews || 0);
      }

      return (right.rating || 0) - (left.rating || 0);
    });
  }, [bloodGroupFilter, hospitals, searchTerm, sortBy, stockByHospital, typeFilter, userLocation, verifiedOnly]);

  const summaryStats = useMemo(() => {
    const totalHospitals = filteredHospitals.length;
    const verifiedHospitals = filteredHospitals.filter((hospital) => hospital.isVerified).length;
    const bloodBanks = filteredHospitals.filter((hospital) => hospital.hasBloodBank).length;
    const openAllDay = filteredHospitals.filter((hospital) => hospital.is24Hours).length;

    return { totalHospitals, verifiedHospitals, bloodBanks, openAllDay };
  }, [filteredHospitals]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      <div className="bg-gradient-to-r from-red-600 to-red-500 text-white py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center"
          >
            <h1 className="text-4xl font-bold mb-4">Find Blood Banks and Hospitals</h1>
            <p className="text-red-100 text-lg max-w-3xl mx-auto">
              Browse verified centers, check their live stock summaries, and open the full profile for
              schedules, reviews, and contact details.
            </p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="mt-8 max-w-5xl mx-auto grid gap-4 md:grid-cols-2 xl:grid-cols-5"
          >
            <input
              type="text"
              placeholder="Search by hospital or city"
              value={searchTerm}
              onChange={(event) => setSearchTerm(event.target.value)}
              className="xl:col-span-2 w-full px-5 py-4 rounded-xl text-gray-800 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-white/50"
            />

            <select
              value={bloodGroupFilter}
              onChange={(event) => setBloodGroupFilter(event.target.value)}
              className="px-5 py-4 rounded-xl text-gray-800 focus:outline-none focus:ring-2 focus:ring-white/50"
            >
              <option value="all">All Blood Types</option>
              {BLOOD_GROUPS.map((group) => (
                <option key={group} value={group}>
                  {group}
                </option>
              ))}
            </select>

            <select
              value={typeFilter}
              onChange={(event) => setTypeFilter(event.target.value)}
              className="px-5 py-4 rounded-xl text-gray-800 focus:outline-none focus:ring-2 focus:ring-white/50"
            >
              {HOSPITAL_TYPES.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>

            <select
              value={sortBy}
              onChange={(event) => setSortBy(event.target.value)}
              className="px-5 py-4 rounded-xl text-gray-800 focus:outline-none focus:ring-2 focus:ring-white/50"
            >
              <option value="rating">Top Rated</option>
              <option value="reviews">Most Reviewed</option>
              <option value="name">Name</option>
              <option value="distance">Distance</option>
            </select>
          </motion.div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between mb-6">
          <div>
            <p className="text-gray-700">
              Showing <span className="font-semibold text-gray-900">{filteredHospitals.length}</span> live
              hospital profiles
            </p>
            {locationStatus && <p className="text-sm text-gray-500 mt-1">{locationStatus}</p>}
          </div>

          <label className="inline-flex items-center gap-3 text-sm text-gray-700">
            <input
              type="checkbox"
              checked={verifiedOnly}
              onChange={(event) => setVerifiedOnly(event.target.checked)}
              className="rounded border-gray-300 text-primary-600 focus:ring-primary-500"
            />
            Verified centers only
          </label>
        </div>

        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4 mb-8">
          {[
            { label: 'Visible Profiles', value: summaryStats.totalHospitals },
            { label: 'Verified Centers', value: summaryStats.verifiedHospitals },
            { label: 'Blood Banks', value: summaryStats.bloodBanks },
            { label: 'Open 24/7', value: summaryStats.openAllDay }
          ].map((stat) => (
            <div key={stat.label} className="glass-card p-5">
              <p className="text-sm text-gray-500">{stat.label}</p>
              <p className="text-3xl font-bold text-gray-900 mt-2">{stat.value}</p>
            </div>
          ))}
        </div>

        {loading ? (
          <div className="glass-card p-10 text-center text-gray-500">Loading hospitals...</div>
        ) : error ? (
          <div className="glass-card p-10 text-center">
            <p className="text-red-600 font-medium">{error}</p>
            <button type="button" onClick={fetchHospitals} className="mt-4 btn-secondary">
              Retry
            </button>
          </div>
        ) : filteredHospitals.length === 0 ? (
          <div className="glass-card p-10 text-center text-gray-500">
            No hospitals matched the current filters.
          </div>
        ) : (
          <div className="grid md:grid-cols-2 xl:grid-cols-3 gap-6">
            {filteredHospitals.map((hospital, index) => {
              const stockSummary = hospital.stockSummary || {};
              const visibleGroups = BLOOD_GROUPS.filter(
                (group) => Number(stockSummary[group]?.availableUnits || 0) > 0
              )
                .sort(
                  (left, right) =>
                    Number(stockSummary[right]?.availableUnits || 0) -
                    Number(stockSummary[left]?.availableUnits || 0)
                )
                .slice(0, 4);

              return (
                <motion.div
                  key={hospital._id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.05 }}
                >
                  <Link to={`/hospitals/${hospital._id}`} className="block h-full">
                    <div className="glass-card h-full overflow-hidden hover:shadow-xl transition-all group">
                      <div className="h-32 bg-gradient-to-br from-red-400 to-red-600 relative px-5 py-4 flex flex-col justify-between">
                        <div className="flex items-start justify-between gap-4">
                          <div>
                            <p className="text-red-100 text-sm">{formatType(hospital.type)}</p>
                            <h2 className="text-white text-xl font-semibold mt-1 group-hover:text-red-50">
                              {hospital.name}
                            </h2>
                          </div>

                          {hospital.isVerified && (
                            <span className="px-3 py-1 bg-blue-500 text-white rounded-full text-xs font-medium">
                              Verified
                            </span>
                          )}
                        </div>

                        <div className="flex items-center justify-between text-sm text-red-100">
                          <span>{getOpenHoursLabel(hospital)}</span>
                          {hospital.distanceKm != null && (
                            <span>{hospital.distanceKm.toFixed(1)} km away</span>
                          )}
                        </div>
                      </div>

                      <div className="p-5 space-y-4">
                        <div className="flex items-center justify-between text-sm">
                          <span className="text-gray-600">{getAddressText(hospital.address)}</span>
                        </div>

                        <div className="grid grid-cols-2 gap-3">
                          <div className="rounded-xl bg-gray-50 p-3">
                            <p className="text-xs uppercase tracking-wide text-gray-500">Rating</p>
                            <p className="text-lg font-semibold text-gray-900">
                              {hospital.rating?.toFixed?.(1) || Number(hospital.rating || 0).toFixed(1)}
                            </p>
                          </div>
                          <div className="rounded-xl bg-gray-50 p-3">
                            <p className="text-xs uppercase tracking-wide text-gray-500">Reviews</p>
                            <p className="text-lg font-semibold text-gray-900">{hospital.totalReviews || 0}</p>
                          </div>
                        </div>

                        <div>
                          <div className="flex items-center justify-between mb-2">
                            <p className="text-sm font-medium text-gray-800">Live blood stock</p>
                            {hospital.hasBloodBank && (
                              <span className="text-xs font-medium text-primary-600">Blood bank available</span>
                            )}
                          </div>

                          {visibleGroups.length > 0 ? (
                            <div className="flex flex-wrap gap-2">
                              {visibleGroups.map((group) => {
                                const stock = stockSummary[group];
                                const color =
                                  stock.status === 'critical'
                                    ? 'bg-red-100 text-red-700'
                                    : stock.status === 'low'
                                      ? 'bg-yellow-100 text-yellow-700'
                                      : 'bg-green-100 text-green-700';

                                return (
                                  <span
                                    key={group}
                                    className={`px-3 py-1 rounded-full text-xs font-semibold ${color}`}
                                  >
                                    {group}: {stock.availableUnits}
                                  </span>
                                );
                              })}
                            </div>
                          ) : (
                            <p className="text-sm text-gray-500">Live stock details are not available yet.</p>
                          )}
                        </div>

                        <div className="flex items-center justify-between text-sm text-gray-600 pt-2 border-t border-gray-100">
                          <span>{hospital.phone}</span>
                          <span className="text-primary-600 font-medium">View details</span>
                        </div>
                      </div>
                    </div>
                  </Link>
                </motion.div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};

export default HospitalList;
