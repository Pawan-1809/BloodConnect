import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { useNavigate, useParams, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import toast from 'react-hot-toast';
import { hospitalAPI, scheduleAPI } from '../../services/api';
import { useAuth } from '../../context/AuthContext';

const BLOOD_GROUPS = ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'];

const getAddressText = (address = {}) =>
  [address.street, address.city, address.state, address.country, address.zipCode]
    .filter(Boolean)
    .join(', ');

const formatLabel = (value = '') =>
  value
    .split('_')
    .filter(Boolean)
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(' ');

const getMapUrl = (address) =>
  `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(getAddressText(address))}`;

const summarizeStocks = (stocks = []) =>
  stocks.reduce((summary, stock) => {
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

    const priorities = { critical: 3, low: 2, adequate: 1 };
    if ((priorities[stock.status] || 0) > (priorities[summary[key].status] || 0)) {
      summary[key].status = stock.status;
    }

    return summary;
  }, {});

const getStockTone = (status) => {
  if (status === 'critical') return 'bg-red-100 text-red-700 border-red-200';
  if (status === 'low') return 'bg-yellow-100 text-yellow-700 border-yellow-200';
  return 'bg-green-100 text-green-700 border-green-200';
};

const getUserName = (reviewUser) => {
  if (!reviewUser) return 'Community member';
  if (typeof reviewUser === 'string') return 'Community member';
  const fullName = [reviewUser.firstName, reviewUser.lastName].filter(Boolean).join(' ').trim();
  return fullName || 'Community member';
};

const formatTimeRange = (entry) => {
  if (!entry?.isOpen) return 'Closed';
  if (entry?.open && entry?.close) return `${entry.open} - ${entry.close}`;
  return 'Hours unavailable';
};

const HospitalDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user, isAuthenticated } = useAuth();
  const [activeTab, setActiveTab] = useState('overview');
  const [hospital, setHospital] = useState(null);
  const [stockSummary, setStockSummary] = useState({});
  const [schedules, setSchedules] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showScheduleModal, setShowScheduleModal] = useState(false);
  const [selectedScheduleId, setSelectedScheduleId] = useState('');
  const [selectedSlotTime, setSelectedSlotTime] = useState('');
  const [booking, setBooking] = useState(false);
  const [reviewForm, setReviewForm] = useState({ rating: '5', comment: '' });
  const [submittingReview, setSubmittingReview] = useState(false);

  const fetchHospitalData = useCallback(async () => {
    try {
      setError('');
      const [hospitalResponse, stockResponse, schedulesResponse] = await Promise.all([
        hospitalAPI.getById(id),
        hospitalAPI.getPublicStock(id),
        scheduleAPI.getAll({ hospital: id, upcoming: true, limit: 20 })
      ]);

      setHospital(hospitalResponse?.data?.hospital || null);
      setStockSummary(summarizeStocks(stockResponse?.data?.stocks || []));
      setSchedules(schedulesResponse?.data?.schedules || []);
    } catch (fetchError) {
      setError(fetchError.response?.data?.message || 'Unable to load this hospital profile.');
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    fetchHospitalData();
    const intervalId = setInterval(fetchHospitalData, 60000);
    return () => clearInterval(intervalId);
  }, [fetchHospitalData]);

  const bookableSchedules = useMemo(
    () =>
      schedules.filter(
        (schedule) =>
          schedule.type === 'donation_appointment' &&
          Array.isArray(schedule.slots) &&
          schedule.slots.some((slot) => Number(slot.booked || 0) < Number(slot.capacity || 0))
      ),
    [schedules]
  );

  const availableSlots = useMemo(() => {
    const activeSchedule = bookableSchedules.find((schedule) => schedule._id === selectedScheduleId);
    if (!activeSchedule) return [];
    return activeSchedule.slots.filter(
      (slot) => Number(slot.booked || 0) < Number(slot.capacity || 0)
    );
  }, [bookableSchedules, selectedScheduleId]);

  useEffect(() => {
    if (!showScheduleModal) return;
    const defaultSchedule = bookableSchedules[0];
    if (defaultSchedule && !selectedScheduleId) {
      setSelectedScheduleId(defaultSchedule._id);
    }
  }, [bookableSchedules, selectedScheduleId, showScheduleModal]);

  useEffect(() => {
    if (!selectedScheduleId) return;
    const firstSlot = availableSlots[0];
    setSelectedSlotTime(firstSlot?.time || '');
  }, [availableSlots, selectedScheduleId]);

  useEffect(() => {
    const existingReview = hospital?.reviews?.find(
      (review) => review.user?._id === user?._id || review.user === user?._id
    );

    if (existingReview) {
      setReviewForm({
        rating: String(existingReview.rating || 5),
        comment: existingReview.comment || ''
      });
    } else {
      setReviewForm({ rating: '5', comment: '' });
    }
  }, [hospital, user]);

  const metrics = useMemo(() => {
    const stockTotals = Object.values(stockSummary).reduce(
      (totals, stock) => {
        totals.available += Number(stock.availableUnits || 0);
        totals.total += Number(stock.totalUnits || 0);
        return totals;
      },
      { available: 0, total: 0 }
    );

    return [
      {
        label: 'Donations Received',
        value: hospital?.stats?.totalDonationsReceived || 0
      },
      {
        label: 'Requests Fulfilled',
        value: hospital?.stats?.totalRequestsFulfilled || 0
      },
      {
        label: 'Available Units',
        value: stockTotals.available
      }
    ];
  }, [hospital, stockSummary]);

  const overviewFacts = useMemo(() => {
    if (!hospital) return [];

    return [
      hospital.isVerified ? 'Verified by platform admins' : 'Verification pending',
      hospital.hasBloodBank ? 'Has in-house blood bank' : 'No in-house blood bank listed',
      hospital.hasDonationCenter ? 'Donation center available' : 'Donation center not listed',
      hospital.is24Hours ? 'Open 24 hours' : 'Operates on listed schedule'
    ];
  }, [hospital]);

  const services = hospital?.servicesOffered || [];
  const facilities = (hospital?.facilities || []).filter((facility) => facility.available !== false);
  const reviews = [...(hospital?.reviews || [])].sort(
    (left, right) => new Date(right.createdAt) - new Date(left.createdAt)
  );

  const handleOpenBooking = () => {
    if (!isAuthenticated) {
      navigate('/login');
      return;
    }

    if (user?.role !== 'donor') {
      toast.error('Only donors can book donation slots.');
      return;
    }

    if (!bookableSchedules.length) {
      toast.error('No live donation slots are currently available for this hospital.');
      return;
    }

    setShowScheduleModal(true);
  };

  const handleBookSlot = async (event) => {
    event.preventDefault();

    if (!selectedScheduleId || !selectedSlotTime) {
      toast.error('Choose a schedule and an available time slot first.');
      return;
    }

    try {
      setBooking(true);
      await scheduleAPI.bookSlot(selectedScheduleId, { slotTime: selectedSlotTime });
      toast.success('Donation slot booked successfully.');
      setShowScheduleModal(false);
      setSelectedScheduleId('');
      setSelectedSlotTime('');
      fetchHospitalData();
    } catch (bookingError) {
      toast.error(bookingError.response?.data?.message || 'Unable to book this slot.');
    } finally {
      setBooking(false);
    }
  };

  const handleSubmitReview = async (event) => {
    event.preventDefault();

    if (!isAuthenticated) {
      navigate('/login');
      return;
    }

    try {
      setSubmittingReview(true);
      await hospitalAPI.addReview(id, {
        rating: Number(reviewForm.rating),
        comment: reviewForm.comment.trim()
      });
      toast.success('Your review has been saved.');
      fetchHospitalData();
    } catch (reviewError) {
      toast.error(reviewError.response?.data?.message || 'Unable to save your review.');
    } finally {
      setSubmittingReview(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 flex items-center justify-center">
        <div className="glass-card p-8 text-gray-500">Loading hospital profile...</div>
      </div>
    );
  }

  if (error || !hospital) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 flex items-center justify-center p-6">
        <div className="glass-card p-8 max-w-lg text-center">
          <p className="text-red-600 font-medium">{error || 'Hospital not found.'}</p>
          <Link to="/hospitals" className="inline-block mt-4 btn-secondary">
            Back to hospitals
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      <div className="bg-gradient-to-r from-red-600 to-red-500 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="flex items-center space-x-2 text-red-100 text-sm mb-6">
            <Link to="/hospitals" className="hover:text-white">
              Hospitals
            </Link>
            <span>/</span>
            <span className="text-white">{hospital.name}</span>
          </div>

          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
            <div className="space-y-3">
              <div className="flex items-center gap-3 flex-wrap">
                <h1 className="text-3xl font-bold">{hospital.name}</h1>
                {hospital.isVerified && (
                  <span className="bg-blue-500 text-white px-3 py-1 rounded-full text-xs font-medium">
                    Verified
                  </span>
                )}
              </div>

              <p className="text-red-100">
                {formatLabel(hospital.type)} in {hospital.address?.city}, {hospital.address?.state}
              </p>

              <div className="flex flex-wrap gap-4 text-sm text-red-100">
                <span>{getAddressText(hospital.address)}</span>
                <span>Rating {Number(hospital.rating || 0).toFixed(1)}</span>
                <span>{hospital.totalReviews || 0} reviews</span>
              </div>
            </div>

            <div className="flex flex-wrap gap-3">
              <button
                type="button"
                onClick={handleOpenBooking}
                className="bg-white text-red-600 px-6 py-3 rounded-xl font-semibold hover:bg-red-50 transition-colors"
              >
                Book Donation Slot
              </button>
              <a
                href={`tel:${hospital.phone}`}
                className="bg-white/20 backdrop-blur-sm text-white px-6 py-3 rounded-xl font-semibold hover:bg-white/30 transition-colors"
              >
                Call
              </a>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8"
        >
          {metrics.map((metric) => (
            <div key={metric.label} className="glass-card p-5">
              <p className="text-sm text-gray-500">{metric.label}</p>
              <p className="text-3xl font-bold text-gray-900 mt-2">{metric.value}</p>
            </div>
          ))}
        </motion.div>

        <div className="flex space-x-2 mb-6 overflow-x-auto pb-2">
          {[
            { id: 'overview', label: 'Overview' },
            { id: 'stock', label: 'Blood Stock' },
            { id: 'services', label: 'Services' },
            { id: 'reviews', label: 'Reviews' }
          ].map((tab) => (
            <button
              key={tab.id}
              type="button"
              onClick={() => setActiveTab(tab.id)}
              className={`px-4 py-2 rounded-xl font-medium whitespace-nowrap transition-all ${
                activeTab === tab.id
                  ? 'bg-primary-500 text-white'
                  : 'bg-white text-gray-600 hover:bg-gray-100'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        <div className="grid lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-6">
            {activeTab === 'overview' && (
              <>
                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="glass-card p-6">
                  <h2 className="text-xl font-semibold text-gray-800 mb-4">Overview</h2>
                  <p className="text-gray-600 leading-7">
                    {hospital.name} is listed as a {formatLabel(hospital.type).toLowerCase()} in{' '}
                    {hospital.address?.city}. The profile currently shows {services.length} service areas,{' '}
                    {facilities.length} active facilities, and {schedules.length} upcoming public schedule
                    {schedules.length === 1 ? '' : 's'}.
                  </p>

                  <div className="grid md:grid-cols-2 gap-3 mt-6">
                    {overviewFacts.map((fact) => (
                      <div key={fact} className="rounded-xl bg-gray-50 px-4 py-3 text-gray-700">
                        {fact}
                      </div>
                    ))}
                  </div>
                </motion.div>

                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="glass-card p-6">
                  <h2 className="text-xl font-semibold text-gray-800 mb-4">Operating Hours</h2>
                  <div className="space-y-2">
                    {['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'].map(
                      (day) => (
                        <div
                          key={day}
                          className="flex justify-between py-2 border-b border-gray-100 last:border-0"
                        >
                          <span className="font-medium text-gray-700 capitalize">{day}</span>
                          <span className="text-gray-600">
                            {formatTimeRange(hospital.operatingHours?.[day])}
                          </span>
                        </div>
                      )
                    )}
                  </div>
                </motion.div>

                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="glass-card p-6">
                  <div className="flex items-center justify-between mb-4">
                    <h2 className="text-xl font-semibold text-gray-800">Upcoming Schedules</h2>
                    <Link to="/schedules" className="text-primary-600 text-sm font-medium hover:underline">
                      View all
                    </Link>
                  </div>

                  {schedules.length > 0 ? (
                    <div className="space-y-3">
                      {schedules.slice(0, 4).map((schedule) => (
                        <Link
                          key={schedule._id}
                          to={`/schedules/${schedule._id}`}
                          className="block rounded-xl bg-gray-50 p-4 hover:bg-gray-100 transition-colors"
                        >
                          <div className="flex items-start justify-between gap-4">
                            <div>
                              <p className="font-semibold text-gray-800">{schedule.title}</p>
                              <p className="text-sm text-gray-500 mt-1">
                                {new Date(schedule.date).toLocaleDateString()} at {schedule.startTime}
                              </p>
                            </div>
                            <span className="text-xs font-medium text-primary-600">
                              {formatLabel(schedule.type)}
                            </span>
                          </div>
                        </Link>
                      ))}
                    </div>
                  ) : (
                    <p className="text-gray-500">No public schedules are currently published for this hospital.</p>
                  )}
                </motion.div>
              </>
            )}

            {activeTab === 'stock' && (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="glass-card p-6">
                <h2 className="text-xl font-semibold text-gray-800 mb-6">Live Blood Stock</h2>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  {BLOOD_GROUPS.map((group) => {
                    const stock = stockSummary[group] || {
                      bloodGroup: group,
                      availableUnits: 0,
                      totalUnits: 0,
                      status: 'low'
                    };

                    return (
                      <div key={group} className={`p-4 rounded-xl border-2 ${getStockTone(stock.status)}`}>
                        <div className="text-center">
                          <p className="text-3xl font-bold">{group}</p>
                          <p className="text-2xl font-semibold mt-2">{stock.availableUnits}</p>
                          <p className="text-sm">available units</p>
                          <p className="text-xs mt-2 capitalize">{stock.status}</p>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </motion.div>
            )}

            {activeTab === 'services' && (
              <>
                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="glass-card p-6">
                  <h2 className="text-xl font-semibold text-gray-800 mb-6">Services Offered</h2>
                  {services.length > 0 ? (
                    <div className="grid md:grid-cols-2 gap-3">
                      {services.map((service) => (
                        <div key={service} className="p-4 bg-gray-50 rounded-xl text-gray-800">
                          {formatLabel(service)}
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-gray-500">No services have been listed yet.</p>
                  )}
                </motion.div>

                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="glass-card p-6">
                  <h2 className="text-xl font-semibold text-gray-800 mb-6">Facilities</h2>
                  {facilities.length > 0 ? (
                    <div className="grid md:grid-cols-2 gap-3">
                      {facilities.map((facility, index) => (
                        <div key={`${facility.name}-${index}`} className="p-4 bg-gray-50 rounded-xl text-gray-800">
                          {facility.name}
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-gray-500">No facilities have been listed yet.</p>
                  )}
                </motion.div>
              </>
            )}

            {activeTab === 'reviews' && (
              <>
                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="glass-card p-6">
                  <div className="flex items-center justify-between mb-6">
                    <h2 className="text-xl font-semibold text-gray-800">Community Reviews</h2>
                    <p className="text-sm text-gray-500">{hospital.totalReviews || 0} total reviews</p>
                  </div>

                  {reviews.length > 0 ? (
                    <div className="space-y-4">
                      {reviews.map((review) => (
                        <div key={review._id || `${review.createdAt}-${review.comment}`} className="p-4 bg-gray-50 rounded-xl">
                          <div className="flex items-center justify-between gap-4 mb-2">
                            <div>
                              <p className="font-medium text-gray-800">{getUserName(review.user)}</p>
                              <p className="text-sm text-yellow-500">{'★'.repeat(review.rating || 0)}</p>
                            </div>
                            <span className="text-sm text-gray-400">
                              {review.createdAt ? new Date(review.createdAt).toLocaleDateString() : 'Recently'}
                            </span>
                          </div>
                          <p className="text-gray-600">{review.comment || 'No written feedback provided.'}</p>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-gray-500">No reviews have been posted for this hospital yet.</p>
                  )}
                </motion.div>

                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="glass-card p-6">
                  <h3 className="text-lg font-semibold text-gray-800 mb-4">Write or update your review</h3>
                  <form onSubmit={handleSubmitReview} className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Rating</label>
                      <select
                        value={reviewForm.rating}
                        onChange={(event) =>
                          setReviewForm((current) => ({ ...current, rating: event.target.value }))
                        }
                        className="input-field"
                      >
                        {[5, 4, 3, 2, 1].map((rating) => (
                          <option key={rating} value={rating}>
                            {rating} star{rating === 1 ? '' : 's'}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Comment</label>
                      <textarea
                        rows={4}
                        value={reviewForm.comment}
                        onChange={(event) =>
                          setReviewForm((current) => ({ ...current, comment: event.target.value }))
                        }
                        className="input-field"
                        placeholder="Share your real experience with this hospital."
                      />
                    </div>

                    <button type="submit" className="btn-primary" disabled={submittingReview}>
                      {submittingReview ? 'Saving...' : isAuthenticated ? 'Save Review' : 'Login to Review'}
                    </button>
                  </form>
                </motion.div>
              </>
            )}
          </div>

          <div className="space-y-6">
            <div className="glass-card p-6">
              <h3 className="font-semibold text-gray-800 mb-4">Contact Information</h3>
              <div className="space-y-4 text-sm">
                <div>
                  <p className="text-gray-500">Address</p>
                  <p className="text-gray-800 mt-1">{getAddressText(hospital.address)}</p>
                </div>
                <div>
                  <p className="text-gray-500">Phone</p>
                  <a href={`tel:${hospital.phone}`} className="text-primary-600 hover:underline mt-1 block">
                    {hospital.phone}
                  </a>
                </div>
                <div>
                  <p className="text-gray-500">Email</p>
                  <a href={`mailto:${hospital.email}`} className="text-primary-600 hover:underline mt-1 block">
                    {hospital.email}
                  </a>
                </div>
                {hospital.website && (
                  <div>
                    <p className="text-gray-500">Website</p>
                    <a
                      href={hospital.website.startsWith('http') ? hospital.website : `https://${hospital.website}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-primary-600 hover:underline mt-1 block"
                    >
                      {hospital.website}
                    </a>
                  </div>
                )}
              </div>
            </div>

            <div className="glass-card p-6">
              <h3 className="font-semibold text-gray-800 mb-4">Directions</h3>
              <p className="text-sm text-gray-600">
                Use the mapped address below to open this center in your preferred navigation app.
              </p>
              <a
                href={getMapUrl(hospital.address)}
                target="_blank"
                rel="noopener noreferrer"
                className="w-full mt-4 btn-secondary inline-flex justify-center"
              >
                Open in Maps
              </a>
            </div>

            <div className="glass-card p-6">
              <h3 className="font-semibold text-gray-800 mb-4">Profile Summary</h3>
              <div className="space-y-3 text-sm">
                <div className="flex justify-between gap-4">
                  <span className="text-gray-500">Emergency Services</span>
                  <span className="text-gray-800">{hospital.hasEmergencyServices ? 'Yes' : 'No'}</span>
                </div>
                <div className="flex justify-between gap-4">
                  <span className="text-gray-500">Storage Capacity</span>
                  <span className="text-gray-800">{hospital.bloodStorageCapacity || 0} units</span>
                </div>
                <div className="flex justify-between gap-4">
                  <span className="text-gray-500">ICU Beds</span>
                  <span className="text-gray-800">{hospital.icuBeds || 0}</span>
                </div>
                <div className="flex justify-between gap-4">
                  <span className="text-gray-500">Average Response Time</span>
                  <span className="text-gray-800">{hospital.stats?.avgResponseTime || 0} min</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {showScheduleModal && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
          onClick={() => setShowScheduleModal(false)}
        >
          <motion.div
            initial={{ scale: 0.95, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="bg-white rounded-2xl max-w-lg w-full p-6"
            onClick={(event) => event.stopPropagation()}
          >
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-semibold text-gray-800">Book a real donation slot</h3>
              <button
                type="button"
                onClick={() => setShowScheduleModal(false)}
                className="p-2 hover:bg-gray-100 rounded-lg"
              >
                ×
              </button>
            </div>

            <form onSubmit={handleBookSlot} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Schedule</label>
                <select
                  value={selectedScheduleId}
                  onChange={(event) => setSelectedScheduleId(event.target.value)}
                  className="input-field"
                >
                  {bookableSchedules.map((schedule) => (
                    <option key={schedule._id} value={schedule._id}>
                      {schedule.title} • {new Date(schedule.date).toLocaleDateString()}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Available Time Slot</label>
                <select
                  value={selectedSlotTime}
                  onChange={(event) => setSelectedSlotTime(event.target.value)}
                  className="input-field"
                >
                  {availableSlots.map((slot) => (
                    <option key={slot.time} value={slot.time}>
                      {slot.time} • {Number(slot.capacity || 0) - Number(slot.booked || 0)} seats left
                    </option>
                  ))}
                </select>
              </div>

              <div className="flex gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setShowScheduleModal(false)}
                  className="flex-1 btn-secondary"
                >
                  Cancel
                </button>
                <button type="submit" className="flex-1 btn-primary" disabled={booking}>
                  {booking ? 'Booking...' : 'Confirm Booking'}
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
