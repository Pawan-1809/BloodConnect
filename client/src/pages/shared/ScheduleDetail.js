import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { useNavigate, useParams, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import toast from 'react-hot-toast';
import { scheduleAPI } from '../../services/api';
import { useAuth } from '../../context/AuthContext';

const formatType = (type = '') =>
  type
    .split('_')
    .filter(Boolean)
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(' ');

const getTypeColor = (type) => {
  if (type === 'blood_drive') return 'bg-red-500';
  if (type === 'donation_appointment') return 'bg-green-500';
  if (type === 'camp') return 'bg-blue-500';
  return 'bg-gray-500';
};

const getAddressText = (venue = {}) => [venue.name, venue.address, venue.city, venue.state].filter(Boolean).join(', ');

const ScheduleDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [schedule, setSchedule] = useState(null);
  const [myAppointment, setMyAppointment] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [selectedSlotTime, setSelectedSlotTime] = useState('');
  const [booking, setBooking] = useState(false);
  const [cancelling, setCancelling] = useState(false);

  const fetchSchedule = useCallback(async () => {
    try {
      setError('');
      const scheduleResponse = await scheduleAPI.getById(id);
      setSchedule(scheduleResponse?.data?.schedule || null);

      if (user?.role === 'donor') {
        const appointmentsResponse = await scheduleAPI.getMyAppointments();
        const appointment = (appointmentsResponse?.data?.appointments || []).find(
          (item) => item.scheduleId === id
        );
        setMyAppointment(appointment || null);
      } else {
        setMyAppointment(null);
      }
    } catch (fetchError) {
      setError(fetchError.response?.data?.message || 'Unable to load this schedule.');
    } finally {
      setLoading(false);
    }
  }, [id, user?.role]);

  useEffect(() => {
    fetchSchedule();
  }, [fetchSchedule]);

  const availableSlots = useMemo(() => {
    if (!schedule?.slots?.length) return [];
    return schedule.slots.filter((slot) => Number(slot.booked || 0) < Number(slot.capacity || 0));
  }, [schedule]);

  useEffect(() => {
    if (!selectedSlotTime && availableSlots[0]?.time) {
      setSelectedSlotTime(availableSlots[0].time);
    }
  }, [availableSlots, selectedSlotTime]);

  const totalRegistered = useMemo(() => {
    if (!schedule) return 0;
    return Math.max(Number(schedule.totalSlots || 0) - Number(schedule.availableSlots || 0), 0);
  }, [schedule]);

  const fillPercentage = schedule?.totalSlots
    ? Math.min((totalRegistered / Number(schedule.totalSlots || 1)) * 100, 100)
    : 0;

  const canBookOnline =
    user?.role === 'donor' &&
    schedule?.type === 'donation_appointment' &&
    availableSlots.length > 0 &&
    myAppointment?.status !== 'confirmed';

  const handleBook = async () => {
    if (!user) {
      navigate('/login');
      return;
    }

    if (user.role !== 'donor') {
      toast.error('Only donors can book a donation schedule.');
      return;
    }

    if (!selectedSlotTime) {
      toast.error('Select an available slot first.');
      return;
    }

    try {
      setBooking(true);
      await scheduleAPI.bookSlot(id, { slotTime: selectedSlotTime });
      toast.success('Schedule booked successfully.');
      fetchSchedule();
    } catch (bookingError) {
      toast.error(bookingError.response?.data?.message || 'Unable to book this schedule.');
    } finally {
      setBooking(false);
    }
  };

  const handleCancelBooking = async () => {
    try {
      setCancelling(true);
      await scheduleAPI.cancelBooking(id);
      toast.success('Booking cancelled successfully.');
      fetchSchedule();
    } catch (cancelError) {
      toast.error(cancelError.response?.data?.message || 'Unable to cancel this booking.');
    } finally {
      setCancelling(false);
    }
  };

  const handleCopyLink = async () => {
    try {
      await navigator.clipboard.writeText(window.location.href);
      toast.success('Schedule link copied.');
    } catch (copyError) {
      toast.error('Unable to copy the schedule link.');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 flex items-center justify-center">
        <div className="glass-card p-8 text-gray-500">Loading schedule...</div>
      </div>
    );
  }

  if (error || !schedule) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 flex items-center justify-center p-6">
        <div className="glass-card p-8 max-w-lg text-center">
          <p className="text-red-600 font-medium">{error || 'Schedule not found.'}</p>
          <Link to="/schedules" className="inline-block mt-4 btn-secondary">
            Back to schedules
          </Link>
        </div>
      </div>
    );
  }

  const availableSpots = Math.max(Number(schedule.availableSlots || 0), 0);

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 p-6 lg:p-8">
      <div className="max-w-6xl mx-auto mb-6">
        <div className="flex items-center space-x-2 text-sm text-gray-500">
          <Link to="/schedules" className="hover:text-primary-600">
            Schedules
          </Link>
          <span>/</span>
          <span className="text-gray-800">{schedule.title}</span>
        </div>
      </div>

      <div className="max-w-6xl mx-auto">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="glass-card overflow-hidden mb-6">
          <div className={`h-48 ${getTypeColor(schedule.type)} relative`}>
            <div className="absolute inset-0 bg-black/20" />
            <div className="absolute bottom-0 left-0 right-0 p-6 bg-gradient-to-t from-black/60 to-transparent">
              <span className="inline-block px-3 py-1 bg-white/20 backdrop-blur-sm text-white rounded-full text-sm mb-2">
                {formatType(schedule.type)}
              </span>
              <h1 className="text-3xl font-bold text-white">{schedule.title}</h1>
            </div>
          </div>

          <div className="p-6">
            <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
              <div className="flex flex-wrap gap-8">
                <div>
                  <p className="text-sm text-gray-500">Date</p>
                  <p className="font-semibold text-gray-800">
                    {new Date(schedule.date).toLocaleDateString('en-US', {
                      weekday: 'long',
                      month: 'long',
                      day: 'numeric',
                      year: 'numeric'
                    })}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Time</p>
                  <p className="font-semibold text-gray-800">
                    {schedule.startTime} - {schedule.endTime}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Venue</p>
                  <p className="font-semibold text-gray-800">
                    {schedule.venue?.name || schedule.hospital?.name || 'Venue not listed'}
                  </p>
                </div>
              </div>

              <div className="flex flex-wrap gap-3">
                {canBookOnline && (
                  <button type="button" onClick={handleBook} className="btn-primary" disabled={booking}>
                    {booking ? 'Booking...' : 'Book Slot'}
                  </button>
                )}
                {myAppointment?.status === 'confirmed' && (
                  <button type="button" onClick={handleCancelBooking} className="btn-secondary" disabled={cancelling}>
                    {cancelling ? 'Cancelling...' : 'Cancel Booking'}
                  </button>
                )}
                <button type="button" onClick={handleCopyLink} className="btn-secondary">
                  Copy Link
                </button>
              </div>
            </div>

            <div className="mt-6 p-4 bg-gray-50 rounded-xl">
              <div className="flex justify-between text-sm mb-2">
                <span className="text-gray-600">Registration Status</span>
                <span className="font-medium text-gray-800">
                  {totalRegistered} / {schedule.totalSlots || 0} registered
                </span>
              </div>
              <div className="h-3 bg-gray-200 rounded-full overflow-hidden">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${fillPercentage}%` }}
                  transition={{ duration: 0.5 }}
                  className={`h-full rounded-full ${fillPercentage > 80 ? 'bg-orange-500' : 'bg-green-500'}`}
                />
              </div>
              <p className="mt-2 text-sm text-gray-500">
                {availableSpots > 0 ? `${availableSpots} spots remaining` : 'This schedule is fully booked'}
              </p>
            </div>
          </div>
        </motion.div>

        <div className="grid lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-6">
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="glass-card p-6">
              <h2 className="text-xl font-semibold text-gray-800 mb-4">About This Schedule</h2>
              <p className="text-gray-600">{schedule.description || 'No additional description has been published yet.'}</p>

              <div className="mt-6">
                <h3 className="font-medium text-gray-800 mb-3">Eligible Blood Groups</h3>
                <div className="flex flex-wrap gap-2">
                  {(schedule.eligibleBloodGroups || []).map((group) => (
                    <span key={group} className="px-4 py-2 bg-red-100 text-red-700 rounded-xl font-semibold">
                      {group}
                    </span>
                  ))}
                </div>
              </div>
            </motion.div>

            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="glass-card p-6">
              <h2 className="text-xl font-semibold text-gray-800 mb-4">Slot Availability</h2>

              {schedule.slots?.length ? (
                <div className="space-y-3">
                  {schedule.slots.map((slot) => {
                    const seatsLeft = Number(slot.capacity || 0) - Number(slot.booked || 0);
                    return (
                      <label
                        key={slot.time}
                        className={`flex items-center justify-between p-4 border rounded-xl ${
                          seatsLeft > 0 ? 'cursor-pointer hover:bg-gray-50' : 'bg-gray-50 text-gray-400'
                        }`}
                      >
                        <div>
                          <p className="font-medium text-gray-800">{slot.time}</p>
                          <p className="text-sm text-gray-500">{seatsLeft} seats left</p>
                        </div>

                        {user?.role === 'donor' && seatsLeft > 0 && myAppointment?.status !== 'confirmed' && (
                          <input
                            type="radio"
                            name="slotTime"
                            value={slot.time}
                            checked={selectedSlotTime === slot.time}
                            onChange={(event) => setSelectedSlotTime(event.target.value)}
                          />
                        )}
                      </label>
                    );
                  })}
                </div>
              ) : (
                <p className="text-gray-500">
                  This schedule does not currently expose bookable time slots in the platform.
                </p>
              )}
            </motion.div>

            {schedule.requirements?.length > 0 && (
              <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }} className="glass-card p-6">
                <h2 className="text-xl font-semibold text-gray-800 mb-4">Requirements</h2>
                <div className="space-y-3">
                  {schedule.requirements.map((requirement, index) => (
                    <div key={`${requirement}-${index}`} className="flex items-center space-x-3">
                      <span className="w-6 h-6 bg-primary-100 text-primary-600 rounded-full flex items-center justify-center text-sm">
                        {index + 1}
                      </span>
                      <span className="text-gray-600">{requirement}</span>
                    </div>
                  ))}
                </div>
              </motion.div>
            )}
          </div>

          <div className="space-y-6">
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="glass-card p-6">
              <h3 className="font-semibold text-gray-800 mb-4">Location</h3>
              <div className="space-y-3 text-sm">
                <p className="font-medium text-gray-800">{schedule.venue?.name || schedule.hospital?.name}</p>
                <p className="text-gray-600">{getAddressText(schedule.venue)}</p>
              </div>
              <a
                href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(getAddressText(schedule.venue))}`}
                target="_blank"
                rel="noopener noreferrer"
                className="w-full mt-4 btn-secondary inline-flex justify-center"
              >
                Open in Maps
              </a>
            </motion.div>

            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }} className="glass-card p-6">
              <h3 className="font-semibold text-gray-800 mb-4">Organizer</h3>
              <div className="space-y-3 text-sm">
                <p className="font-medium text-gray-800">
                  {schedule.contactPerson?.name || schedule.hospital?.name || 'Organizer not listed'}
                </p>
                {schedule.contactPerson?.phone && (
                  <a href={`tel:${schedule.contactPerson.phone}`} className="text-primary-600 hover:underline block">
                    {schedule.contactPerson.phone}
                  </a>
                )}
                {schedule.contactPerson?.email && (
                  <a href={`mailto:${schedule.contactPerson.email}`} className="text-primary-600 hover:underline block">
                    {schedule.contactPerson.email}
                  </a>
                )}
              </div>
            </motion.div>

            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }} className="glass-card p-6">
              <h3 className="font-semibold text-gray-800 mb-4">Current Status</h3>
              <div className="space-y-3 text-sm text-gray-600">
                <p>Visibility: {schedule.isPublic ? 'Public' : 'Private'}</p>
                <p>Status: {formatType(schedule.status)}</p>
                <p>Views: {schedule.views || 0}</p>
                {myAppointment?.status && <p>Your booking: {formatType(myAppointment.status)}</p>}
              </div>
            </motion.div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ScheduleDetail;
