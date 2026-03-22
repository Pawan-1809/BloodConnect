import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { scheduleAPI } from '../../services/api';
import { useAuth } from '../../context/AuthContext';

const monthNames = [
  'January',
  'February',
  'March',
  'April',
  'May',
  'June',
  'July',
  'August',
  'September',
  'October',
  'November',
  'December'
];

const formatType = (type = '') =>
  type
    .split('_')
    .filter(Boolean)
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(' ');

const getTypeColor = (type) => {
  if (type === 'donation_appointment') return 'bg-red-100 text-red-700 border-red-200';
  if (type === 'blood_drive') return 'bg-blue-100 text-blue-700 border-blue-200';
  if (type === 'camp') return 'bg-green-100 text-green-700 border-green-200';
  return 'bg-gray-100 text-gray-700 border-gray-200';
};

const getAppointmentStatus = (schedule, myAppointmentsBySchedule) => {
  return myAppointmentsBySchedule[schedule._id]?.status || null;
};

const generateCalendarDays = (selectedDate) => {
  const year = selectedDate.getFullYear();
  const month = selectedDate.getMonth();
  const firstDay = new Date(year, month, 1);
  const lastDay = new Date(year, month + 1, 0);
  const startPadding = firstDay.getDay();
  const days = [];

  for (let index = 0; index < startPadding; index += 1) {
    days.push({ date: new Date(year, month, index - startPadding + 1), isCurrentMonth: false });
  }

  for (let day = 1; day <= lastDay.getDate(); day += 1) {
    days.push({ date: new Date(year, month, day), isCurrentMonth: true });
  }

  while (days.length < 42) {
    const nextDay = days.length - lastDay.getDate() - startPadding + 1;
    days.push({ date: new Date(year, month + 1, nextDay), isCurrentMonth: false });
  }

  return days;
};

const Schedules = () => {
  const { pathname } = useLocation();
  const { user } = useAuth();
  const isMyAppointmentsView = pathname === '/schedules/my-appointments' && user?.role === 'donor';
  const [view, setView] = useState('calendar');
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [selectedSchedule, setSelectedSchedule] = useState(null);
  const [schedules, setSchedules] = useState([]);
  const [myAppointments, setMyAppointments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const fetchSchedules = useCallback(async () => {
    try {
      setError('');
      const schedulesResponse = await scheduleAPI.getAll({ limit: 100, upcoming: true });
      const scheduleItems = schedulesResponse?.data?.schedules || [];
      setSchedules(scheduleItems);

      if (user?.role === 'donor') {
        const appointmentsResponse = await scheduleAPI.getMyAppointments();
        setMyAppointments(appointmentsResponse?.data?.appointments || []);
      } else {
        setMyAppointments([]);
      }
    } catch (fetchError) {
      setError(fetchError.response?.data?.message || 'Unable to load schedules right now.');
    } finally {
      setLoading(false);
    }
  }, [user?.role]);

  useEffect(() => {
    fetchSchedules();
    const intervalId = setInterval(fetchSchedules, 60000);
    return () => clearInterval(intervalId);
  }, [fetchSchedules]);

  const myAppointmentsBySchedule = useMemo(
    () =>
      myAppointments.reduce((accumulator, appointment) => {
        accumulator[appointment.scheduleId] = appointment;
        return accumulator;
      }, {}),
    [myAppointments]
  );

  const visibleSchedules = useMemo(() => {
    const baseSchedules = isMyAppointmentsView
      ? schedules.filter((schedule) => myAppointmentsBySchedule[schedule._id])
      : schedules;

    return [...baseSchedules].sort((left, right) => new Date(left.date) - new Date(right.date));
  }, [isMyAppointmentsView, myAppointmentsBySchedule, schedules]);

  const upcomingSchedules = visibleSchedules.filter((schedule) => new Date(schedule.date) >= new Date());
  const calendarDays = generateCalendarDays(selectedDate);

  const getSchedulesForDate = (date) => {
    const dateString = date.toISOString().split('T')[0];
    return visibleSchedules.filter(
      (schedule) => new Date(schedule.date).toISOString().split('T')[0] === dateString
    );
  };

  const stats = useMemo(() => {
    const openSlots = visibleSchedules.reduce(
      (count, schedule) => count + Number(schedule.availableSlots || 0),
      0
    );

    return [
      { label: 'Upcoming Events', value: visibleSchedules.length },
      {
        label: 'Appointments',
        value: visibleSchedules.filter((schedule) => schedule.type === 'donation_appointment').length
      },
      {
        label: 'Blood Drives',
        value: visibleSchedules.filter((schedule) => schedule.type === 'blood_drive').length
      },
      { label: 'Open Slots', value: openSlots }
    ];
  }, [visibleSchedules]);

  const navigateMonth = (direction) => {
    setSelectedDate(new Date(selectedDate.getFullYear(), selectedDate.getMonth() + direction, 1));
  };

  const isToday = (date) => date.toDateString() === new Date().toDateString();

  return (
    <div className="p-6 lg:p-8">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="mb-8">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold text-gray-800">
              {isMyAppointmentsView ? 'My Appointments' : 'Schedules'}
            </h1>
            <p className="text-gray-600 mt-1">
              {isMyAppointmentsView
                ? 'Your confirmed donation bookings and upcoming event registrations.'
                : 'Live public blood drives, camps, and donation appointment schedules.'}
            </p>
          </div>

          {user?.role === 'donor' && (
            <Link to={isMyAppointmentsView ? '/schedules' : '/schedules/my-appointments'} className="btn-primary">
              {isMyAppointmentsView ? 'View All Schedules' : 'View My Appointments'}
            </Link>
          )}
        </div>
      </motion.div>

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4 mb-8">
        {stats.map((stat) => (
          <div key={stat.label} className="glass-card p-5">
            <p className="text-sm text-gray-500">{stat.label}</p>
            <p className="text-3xl font-bold text-gray-900 mt-2">{stat.value}</p>
          </div>
        ))}
      </div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="flex space-x-2 mb-6"
      >
        {[
          { id: 'calendar', label: 'Calendar' },
          { id: 'list', label: 'List View' }
        ].map((option) => (
          <button
            key={option.id}
            type="button"
            onClick={() => setView(option.id)}
            className={`px-4 py-2 rounded-xl font-medium transition-all ${
              view === option.id ? 'bg-primary-500 text-white' : 'bg-white text-gray-600 hover:bg-gray-100'
            }`}
          >
            {option.label}
          </button>
        ))}
      </motion.div>

      {loading ? (
        <div className="glass-card p-10 text-center text-gray-500">Loading schedules...</div>
      ) : error ? (
        <div className="glass-card p-10 text-center text-red-600">{error}</div>
      ) : visibleSchedules.length === 0 ? (
        <div className="glass-card p-10 text-center text-gray-500">
          {isMyAppointmentsView ? 'You have no booked appointments yet.' : 'No public schedules are available right now.'}
        </div>
      ) : (
        <div className="grid lg:grid-cols-3 gap-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="lg:col-span-2"
          >
            {view === 'calendar' ? (
              <div className="glass-card p-6">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-xl font-semibold text-gray-800">
                    {monthNames[selectedDate.getMonth()]} {selectedDate.getFullYear()}
                  </h2>
                  <div className="flex space-x-2">
                    <button type="button" onClick={() => navigateMonth(-1)} className="p-2 hover:bg-gray-100 rounded-lg">
                      ←
                    </button>
                    <button
                      type="button"
                      onClick={() => setSelectedDate(new Date())}
                      className="px-3 py-1 text-sm bg-gray-100 hover:bg-gray-200 rounded-lg"
                    >
                      Today
                    </button>
                    <button type="button" onClick={() => navigateMonth(1)} className="p-2 hover:bg-gray-100 rounded-lg">
                      →
                    </button>
                  </div>
                </div>

                <div className="grid grid-cols-7 gap-1">
                  {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((day) => (
                    <div key={day} className="py-2 text-center text-sm font-medium text-gray-500">
                      {day}
                    </div>
                  ))}

                  {calendarDays.map((day, index) => {
                    const daySchedules = getSchedulesForDate(day.date);
                    return (
                      <button
                        key={`${day.date.toISOString()}-${index}`}
                        type="button"
                        onClick={() => {
                          if (daySchedules.length) {
                            setSelectedSchedule(daySchedules[0]);
                          }
                        }}
                        className={`relative p-2 h-24 rounded-xl text-left transition-all ${
                          !day.isCurrentMonth
                            ? 'text-gray-300'
                            : isToday(day.date)
                              ? 'bg-primary-100 text-primary-700'
                              : 'hover:bg-gray-100'
                        }`}
                      >
                        <span className={`text-sm ${isToday(day.date) ? 'font-bold' : ''}`}>
                          {day.date.getDate()}
                        </span>

                        {day.isCurrentMonth && daySchedules.length > 0 && (
                          <div className="absolute bottom-2 left-2 right-2 space-y-1">
                            {daySchedules.slice(0, 2).map((schedule) => (
                              <div
                                key={schedule._id}
                                className="truncate rounded bg-red-100 px-2 py-1 text-[11px] font-medium text-red-700"
                              >
                                {schedule.title}
                              </div>
                            ))}
                            {daySchedules.length > 2 && (
                              <div className="text-[11px] text-gray-500">+{daySchedules.length - 2} more</div>
                            )}
                          </div>
                        )}
                      </button>
                    );
                  })}
                </div>
              </div>
            ) : (
              <div className="glass-card p-6">
                <h2 className="text-xl font-semibold text-gray-800 mb-4">Live Schedule List</h2>
                <div className="space-y-4">
                  {visibleSchedules.map((schedule) => {
                    const appointmentStatus = getAppointmentStatus(schedule, myAppointmentsBySchedule);
                    return (
                      <div
                        key={schedule._id}
                        className={`p-4 border rounded-xl cursor-pointer hover:shadow-md transition-all ${getTypeColor(schedule.type)}`}
                        onClick={() => setSelectedSchedule(schedule)}
                        role="button"
                        tabIndex={0}
                        onKeyDown={(event) => {
                          if (event.key === 'Enter' || event.key === ' ') {
                            setSelectedSchedule(schedule);
                          }
                        }}
                      >
                        <div className="flex items-start justify-between gap-4">
                          <div>
                            <h3 className="font-semibold">{schedule.title}</h3>
                            <p className="text-sm mt-1">
                              {schedule.venue?.name || schedule.hospital?.name || 'Venue not listed'}
                            </p>
                          </div>
                          <div className="flex flex-col items-end gap-2">
                            <span className="px-3 py-1 rounded-full text-xs font-medium border border-current">
                              {formatType(schedule.type)}
                            </span>
                            {appointmentStatus && (
                              <span className="text-xs font-medium capitalize text-primary-700">
                                Your booking: {appointmentStatus}
                              </span>
                            )}
                          </div>
                        </div>
                        <div className="flex flex-wrap gap-4 mt-3 text-sm">
                          <span>{new Date(schedule.date).toLocaleDateString()}</span>
                          <span>{schedule.startTime} - {schedule.endTime}</span>
                          <span>{schedule.availableSlots || 0} slots open</span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="space-y-6"
          >
            <div className="glass-card p-6">
              <h3 className="text-lg font-semibold text-gray-800 mb-4">
                {isMyAppointmentsView ? 'Booked Appointments' : 'Upcoming Highlights'}
              </h3>
              <div className="space-y-4">
                {upcomingSchedules.slice(0, 4).map((schedule) => {
                  const appointmentStatus = getAppointmentStatus(schedule, myAppointmentsBySchedule);
                  return (
                    <button
                      key={schedule._id}
                      type="button"
                      onClick={() => setSelectedSchedule(schedule)}
                      className="w-full p-3 bg-gray-50 rounded-xl text-left hover:bg-gray-100 transition-colors"
                    >
                      <p className="font-medium text-gray-800">{schedule.title}</p>
                      <p className="text-sm text-gray-500 mt-1">
                        {new Date(schedule.date).toLocaleDateString()} at {schedule.startTime}
                      </p>
                      {appointmentStatus && (
                        <p className="text-xs text-primary-700 capitalize mt-2">Your booking: {appointmentStatus}</p>
                      )}
                    </button>
                  );
                })}
              </div>
            </div>

            <div className="glass-card p-6">
              <h3 className="text-lg font-semibold text-gray-800 mb-4">Notes</h3>
              <div className="space-y-3 text-sm text-gray-600">
                <p>Public schedules update automatically from the backend every minute.</p>
                <p>Donation bookings are reflected on your donor account after confirmation.</p>
                <p>Open a schedule to see real venue details, slot availability, and registration status.</p>
              </div>
            </div>
          </motion.div>
        </div>
      )}

      <AnimatePresence>
        {selectedSchedule && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
            onClick={() => setSelectedSchedule(null)}
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-white rounded-2xl max-w-lg w-full"
              onClick={(event) => event.stopPropagation()}
            >
              <div className="p-6">
                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-xl font-semibold text-gray-800">Schedule Details</h3>
                  <button type="button" onClick={() => setSelectedSchedule(null)} className="p-2 hover:bg-gray-100 rounded-lg">
                    ×
                  </button>
                </div>

                <div className={`p-4 rounded-xl mb-6 border ${getTypeColor(selectedSchedule.type)}`}>
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <h4 className="font-semibold text-lg">{selectedSchedule.title}</h4>
                      <p className="text-sm mt-1">{formatType(selectedSchedule.type)}</p>
                    </div>
                    <span className="text-sm font-medium">{selectedSchedule.availableSlots || 0} slots open</span>
                  </div>
                </div>

                <div className="space-y-4 text-sm">
                  <div>
                    <p className="text-gray-500">Date</p>
                    <p className="font-medium text-gray-800 mt-1">
                      {new Date(selectedSchedule.date).toLocaleDateString('en-US', {
                        weekday: 'long',
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric'
                      })}
                    </p>
                  </div>
                  <div>
                    <p className="text-gray-500">Time</p>
                    <p className="font-medium text-gray-800 mt-1">
                      {selectedSchedule.startTime} - {selectedSchedule.endTime}
                    </p>
                  </div>
                  <div>
                    <p className="text-gray-500">Venue</p>
                    <p className="font-medium text-gray-800 mt-1">
                      {selectedSchedule.venue?.name || selectedSchedule.hospital?.name || 'Venue not listed'}
                    </p>
                    <p className="text-gray-600 mt-1">
                      {[selectedSchedule.venue?.address, selectedSchedule.venue?.city, selectedSchedule.venue?.state]
                        .filter(Boolean)
                        .join(', ')}
                    </p>
                  </div>
                </div>

                <div className="flex gap-3 mt-6">
                  <button type="button" onClick={() => setSelectedSchedule(null)} className="flex-1 btn-secondary">
                    Close
                  </button>
                  <Link to={`/schedules/${selectedSchedule._id}`} className="flex-1 btn-primary text-center">
                    Open Full Page
                  </Link>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default Schedules;
