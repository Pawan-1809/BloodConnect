import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

const Schedules = () => {
  const [view, setView] = useState('calendar');
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [selectedAppointment, setSelectedAppointment] = useState(null);

  // Mock appointments data
  const appointments = [
    {
      id: 1,
      title: 'Blood Donation Appointment',
      type: 'donation',
      date: '2024-12-10',
      time: '10:00 AM',
      duration: '30 min',
      location: 'City General Hospital',
      status: 'confirmed',
      notes: 'Regular donation appointment'
    },
    {
      id: 2,
      title: 'Health Checkup',
      type: 'checkup',
      date: '2024-12-12',
      time: '2:00 PM',
      duration: '45 min',
      location: 'Metropolitan Blood Bank',
      status: 'pending',
      notes: 'Pre-donation health screening'
    },
    {
      id: 3,
      title: 'Plasma Donation',
      type: 'donation',
      date: '2024-12-15',
      time: '9:00 AM',
      duration: '1 hour',
      location: 'University Hospital',
      status: 'confirmed',
      notes: 'Scheduled plasma donation'
    },
    {
      id: 4,
      title: 'Follow-up Consultation',
      type: 'consultation',
      date: '2024-12-20',
      time: '11:00 AM',
      duration: '20 min',
      location: 'Community Health Center',
      status: 'confirmed',
      notes: 'Post-donation follow-up'
    }
  ];

  // Generate calendar days
  const generateCalendarDays = () => {
    const year = selectedDate.getFullYear();
    const month = selectedDate.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const startPadding = firstDay.getDay();
    
    const days = [];
    
    // Previous month padding
    for (let i = 0; i < startPadding; i++) {
      const prevDate = new Date(year, month, -startPadding + i + 1);
      days.push({ date: prevDate, isCurrentMonth: false });
    }
    
    // Current month
    for (let i = 1; i <= lastDay.getDate(); i++) {
      days.push({ date: new Date(year, month, i), isCurrentMonth: true });
    }
    
    // Next month padding
    const remaining = 42 - days.length;
    for (let i = 1; i <= remaining; i++) {
      days.push({ date: new Date(year, month + 1, i), isCurrentMonth: false });
    }
    
    return days;
  };

  const hasAppointment = (date) => {
    const dateStr = date.toISOString().split('T')[0];
    return appointments.some(apt => apt.date === dateStr);
  };

  const getAppointmentsForDate = (date) => {
    const dateStr = date.toISOString().split('T')[0];
    return appointments.filter(apt => apt.date === dateStr);
  };

  const getTypeColor = (type) => {
    const colors = {
      donation: 'bg-red-100 text-red-700 border-red-200',
      checkup: 'bg-blue-100 text-blue-700 border-blue-200',
      consultation: 'bg-purple-100 text-purple-700 border-purple-200'
    };
    return colors[type] || 'bg-gray-100 text-gray-700 border-gray-200';
  };

  const getStatusBadge = (status) => {
    const styles = {
      confirmed: 'bg-green-100 text-green-700',
      pending: 'bg-yellow-100 text-yellow-700',
      cancelled: 'bg-red-100 text-red-700'
    };
    return styles[status] || 'bg-gray-100 text-gray-700';
  };

  const monthNames = ['January', 'February', 'March', 'April', 'May', 'June',
                      'July', 'August', 'September', 'October', 'November', 'December'];

  const navigateMonth = (direction) => {
    setSelectedDate(new Date(selectedDate.getFullYear(), selectedDate.getMonth() + direction, 1));
  };

  const isToday = (date) => {
    const today = new Date();
    return date.toDateString() === today.toDateString();
  };

  const upcomingAppointments = appointments
    .filter(apt => new Date(apt.date) >= new Date())
    .sort((a, b) => new Date(a.date) - new Date(b.date));

  return (
    <div className="p-6 lg:p-8">
          {/* Header */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-8"
          >
            <div className="flex flex-col md:flex-row md:items-center md:justify-between">
              <div>
                <h1 className="text-3xl font-bold text-gray-800">Schedules</h1>
                <p className="text-gray-600 mt-1">Manage your appointments and donation schedules</p>
              </div>
              <button
                onClick={() => setShowCreateModal(true)}
                className="mt-4 md:mt-0 btn-primary"
              >
                + Schedule Appointment
              </button>
            </div>
          </motion.div>

          {/* View Toggle */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="flex space-x-2 mb-6"
          >
            {[
              { id: 'calendar', label: 'Calendar', icon: '📅' },
              { id: 'list', label: 'List View', icon: '📋' }
            ].map((v) => (
              <button
                key={v.id}
                onClick={() => setView(v.id)}
                className={`flex items-center space-x-2 px-4 py-2 rounded-xl font-medium transition-all ${
                  view === v.id
                    ? 'bg-primary-500 text-white'
                    : 'bg-white text-gray-600 hover:bg-gray-100'
                }`}
              >
                <span>{v.icon}</span>
                <span>{v.label}</span>
              </button>
            ))}
          </motion.div>

          <div className="grid lg:grid-cols-3 gap-6">
            {/* Calendar / List View */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="lg:col-span-2"
            >
              {view === 'calendar' ? (
                <div className="glass-card p-6">
                  {/* Calendar Header */}
                  <div className="flex items-center justify-between mb-6">
                    <h2 className="text-xl font-semibold text-gray-800">
                      {monthNames[selectedDate.getMonth()]} {selectedDate.getFullYear()}
                    </h2>
                    <div className="flex space-x-2">
                      <button
                        onClick={() => navigateMonth(-1)}
                        className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                      >
                        ←
                      </button>
                      <button
                        onClick={() => setSelectedDate(new Date())}
                        className="px-3 py-1 text-sm bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"
                      >
                        Today
                      </button>
                      <button
                        onClick={() => navigateMonth(1)}
                        className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                      >
                        →
                      </button>
                    </div>
                  </div>

                  {/* Calendar Grid */}
                  <div className="grid grid-cols-7 gap-1">
                    {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((day) => (
                      <div key={day} className="py-2 text-center text-sm font-medium text-gray-500">
                        {day}
                      </div>
                    ))}
                    {generateCalendarDays().map((day, index) => {
                      const dayAppointments = getAppointmentsForDate(day.date);
                      return (
                        <motion.button
                          key={index}
                          whileHover={{ scale: 1.05 }}
                          onClick={() => {
                            if (dayAppointments.length > 0) {
                              setSelectedAppointment(dayAppointments[0]);
                            }
                          }}
                          className={`relative p-2 h-20 rounded-xl transition-all ${
                            !day.isCurrentMonth ? 'text-gray-300' :
                            isToday(day.date) ? 'bg-primary-100 text-primary-700' :
                            'hover:bg-gray-100'
                          }`}
                        >
                          <span className={`text-sm ${isToday(day.date) ? 'font-bold' : ''}`}>
                            {day.date.getDate()}
                          </span>
                          {day.isCurrentMonth && hasAppointment(day.date) && (
                            <div className="absolute bottom-2 left-1/2 -translate-x-1/2 flex space-x-1">
                              {dayAppointments.slice(0, 3).map((apt, i) => (
                                <div
                                  key={i}
                                  className={`w-2 h-2 rounded-full ${
                                    apt.type === 'donation' ? 'bg-red-500' :
                                    apt.type === 'checkup' ? 'bg-blue-500' : 'bg-purple-500'
                                  }`}
                                />
                              ))}
                            </div>
                          )}
                        </motion.button>
                      );
                    })}
                  </div>

                  {/* Legend */}
                  <div className="flex justify-center space-x-6 mt-6 pt-4 border-t border-gray-100">
                    {[
                      { type: 'Donation', color: 'bg-red-500' },
                      { type: 'Checkup', color: 'bg-blue-500' },
                      { type: 'Consultation', color: 'bg-purple-500' }
                    ].map((item) => (
                      <div key={item.type} className="flex items-center space-x-2">
                        <div className={`w-3 h-3 rounded-full ${item.color}`} />
                        <span className="text-sm text-gray-600">{item.type}</span>
                      </div>
                    ))}
                  </div>
                </div>
              ) : (
                <div className="glass-card p-6">
                  <h2 className="text-xl font-semibold text-gray-800 mb-4">All Appointments</h2>
                  <div className="space-y-4">
                    {appointments.map((apt) => (
                      <motion.div
                        key={apt.id}
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        className={`p-4 border rounded-xl cursor-pointer hover:shadow-md transition-all ${getTypeColor(apt.type)}`}
                        onClick={() => setSelectedAppointment(apt)}
                      >
                        <div className="flex items-center justify-between">
                          <div>
                            <h3 className="font-semibold">{apt.title}</h3>
                            <p className="text-sm mt-1">{apt.location}</p>
                          </div>
                          <span className={`px-3 py-1 rounded-full text-xs font-medium capitalize ${getStatusBadge(apt.status)}`}>
                            {apt.status}
                          </span>
                        </div>
                        <div className="flex items-center space-x-4 mt-3 text-sm">
                          <span>📅 {new Date(apt.date).toLocaleDateString()}</span>
                          <span>🕐 {apt.time}</span>
                          <span>⏱️ {apt.duration}</span>
                        </div>
                      </motion.div>
                    ))}
                  </div>
                </div>
              )}
            </motion.div>

            {/* Upcoming Appointments Sidebar */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="space-y-6"
            >
              <div className="glass-card p-6">
                <h3 className="text-lg font-semibold text-gray-800 mb-4">Upcoming</h3>
                <div className="space-y-4">
                  {upcomingAppointments.slice(0, 4).map((apt) => (
                    <div
                      key={apt.id}
                      onClick={() => setSelectedAppointment(apt)}
                      className="p-3 bg-gray-50 rounded-xl cursor-pointer hover:bg-gray-100 transition-colors"
                    >
                      <div className="flex items-center space-x-3">
                        <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                          apt.type === 'donation' ? 'bg-red-100 text-red-600' :
                          apt.type === 'checkup' ? 'bg-blue-100 text-blue-600' :
                          'bg-purple-100 text-purple-600'
                        }`}>
                          {apt.type === 'donation' ? '🩸' : apt.type === 'checkup' ? '🩺' : '💬'}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="font-medium text-gray-800 truncate">{apt.title}</p>
                          <p className="text-sm text-gray-500">
                            {new Date(apt.date).toLocaleDateString()} at {apt.time}
                          </p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Quick Stats */}
              <div className="glass-card p-6">
                <h3 className="text-lg font-semibold text-gray-800 mb-4">This Month</h3>
                <div className="grid grid-cols-2 gap-4">
                  <div className="text-center p-3 bg-red-50 rounded-xl">
                    <p className="text-2xl font-bold text-red-600">2</p>
                    <p className="text-sm text-red-700">Donations</p>
                  </div>
                  <div className="text-center p-3 bg-blue-50 rounded-xl">
                    <p className="text-2xl font-bold text-blue-600">1</p>
                    <p className="text-sm text-blue-700">Checkups</p>
                  </div>
                </div>
              </div>

              {/* Tips */}
              <div className="glass-card p-6">
                <h3 className="text-lg font-semibold text-gray-800 mb-4">Reminder</h3>
                <div className="p-4 bg-yellow-50 rounded-xl">
                  <div className="flex space-x-3">
                    <span className="text-2xl">💡</span>
                    <div>
                      <p className="font-medium text-yellow-800">Pre-donation Tips</p>
                      <ul className="text-sm text-yellow-700 mt-2 space-y-1">
                        <li>• Stay hydrated</li>
                        <li>• Eat a healthy meal</li>
                        <li>• Get adequate sleep</li>
                        <li>• Bring valid ID</li>
                      </ul>
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>

          {/* Appointment Detail Modal */}
          <AnimatePresence>
            {selectedAppointment && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
                onClick={() => setSelectedAppointment(null)}
              >
                <motion.div
                  initial={{ scale: 0.9, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  exit={{ scale: 0.9, opacity: 0 }}
                  className="bg-white rounded-2xl max-w-md w-full"
                  onClick={(e) => e.stopPropagation()}
                >
                  <div className="p-6">
                    <div className="flex items-center justify-between mb-6">
                      <h3 className="text-xl font-semibold text-gray-800">Appointment Details</h3>
                      <button
                        onClick={() => setSelectedAppointment(null)}
                        className="p-2 hover:bg-gray-100 rounded-lg"
                      >
                        ✕
                      </button>
                    </div>

                    <div className={`p-4 rounded-xl mb-6 ${getTypeColor(selectedAppointment.type)}`}>
                      <div className="flex items-center justify-between">
                        <h4 className="font-semibold text-lg">{selectedAppointment.title}</h4>
                        <span className={`px-3 py-1 rounded-full text-xs font-medium capitalize ${getStatusBadge(selectedAppointment.status)}`}>
                          {selectedAppointment.status}
                        </span>
                      </div>
                    </div>

                    <div className="space-y-4">
                      <div className="flex items-center space-x-3">
                        <span className="text-xl">📅</span>
                        <div>
                          <p className="text-sm text-gray-500">Date</p>
                          <p className="font-medium text-gray-800">
                            {new Date(selectedAppointment.date).toLocaleDateString('en-US', {
                              weekday: 'long',
                              year: 'numeric',
                              month: 'long',
                              day: 'numeric'
                            })}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center space-x-3">
                        <span className="text-xl">🕐</span>
                        <div>
                          <p className="text-sm text-gray-500">Time</p>
                          <p className="font-medium text-gray-800">{selectedAppointment.time} ({selectedAppointment.duration})</p>
                        </div>
                      </div>
                      <div className="flex items-center space-x-3">
                        <span className="text-xl">📍</span>
                        <div>
                          <p className="text-sm text-gray-500">Location</p>
                          <p className="font-medium text-gray-800">{selectedAppointment.location}</p>
                        </div>
                      </div>
                      {selectedAppointment.notes && (
                        <div className="flex items-start space-x-3">
                          <span className="text-xl">📝</span>
                          <div>
                            <p className="text-sm text-gray-500">Notes</p>
                            <p className="font-medium text-gray-800">{selectedAppointment.notes}</p>
                          </div>
                        </div>
                      )}
                    </div>

                    <div className="flex space-x-3 mt-6">
                      <button className="flex-1 btn-secondary">Reschedule</button>
                      <button className="flex-1 btn-primary">Get Directions</button>
                    </div>

                    {selectedAppointment.status !== 'cancelled' && (
                      <button className="w-full mt-3 py-2 text-red-600 hover:bg-red-50 rounded-xl transition-colors">
                        Cancel Appointment
                      </button>
                    )}
                  </div>
                </motion.div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Create Appointment Modal */}
          <AnimatePresence>
            {showCreateModal && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
                onClick={() => setShowCreateModal(false)}
              >
                <motion.div
                  initial={{ scale: 0.9, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  exit={{ scale: 0.9, opacity: 0 }}
                  className="bg-white rounded-2xl max-w-md w-full"
                  onClick={(e) => e.stopPropagation()}
                >
                  <div className="p-6">
                    <div className="flex items-center justify-between mb-6">
                      <h3 className="text-xl font-semibold text-gray-800">Schedule Appointment</h3>
                      <button
                        onClick={() => setShowCreateModal(false)}
                        className="p-2 hover:bg-gray-100 rounded-lg"
                      >
                        ✕
                      </button>
                    </div>

                    <form className="space-y-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Appointment Type</label>
                        <select className="input-field">
                          <option value="donation">Blood Donation</option>
                          <option value="checkup">Health Checkup</option>
                          <option value="consultation">Consultation</option>
                        </select>
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Hospital / Location</label>
                        <select className="input-field">
                          <option>City General Hospital</option>
                          <option>Metropolitan Blood Bank</option>
                          <option>University Hospital</option>
                          <option>Community Health Center</option>
                        </select>
                      </div>

                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">Date</label>
                          <input type="date" className="input-field" />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">Time</label>
                          <select className="input-field">
                            <option>9:00 AM</option>
                            <option>10:00 AM</option>
                            <option>11:00 AM</option>
                            <option>2:00 PM</option>
                            <option>3:00 PM</option>
                            <option>4:00 PM</option>
                          </select>
                        </div>
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Notes (Optional)</label>
                        <textarea className="input-field" rows={3} placeholder="Any special requirements..." />
                      </div>

                      <div className="flex space-x-3 pt-4">
                        <button
                          type="button"
                          onClick={() => setShowCreateModal(false)}
                          className="flex-1 btn-secondary"
                        >
                          Cancel
                        </button>
                        <button type="submit" className="flex-1 btn-primary">
                          Schedule
                        </button>
                      </div>
                    </form>
                  </div>
                </motion.div>
              </motion.div>
            )}
          </AnimatePresence>
    </div>
  );
};

export default Schedules;
