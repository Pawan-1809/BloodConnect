import React from 'react';
import { useParams, Link } from 'react-router-dom';
import { motion } from 'framer-motion';

const ScheduleDetail = () => {
  const { id } = useParams();

  // Mock schedule data
  const schedule = {
    id: id,
    title: 'Community Blood Drive',
    type: 'blood_drive',
    description: 'Join us for our monthly community blood drive event. All blood types are welcome. Free health checkup included for all donors.',
    date: '2024-12-15',
    startTime: '9:00 AM',
    endTime: '5:00 PM',
    location: {
      name: 'City Community Center',
      address: '456 Main Street, New York, NY 10001',
      room: 'Hall A'
    },
    organizer: {
      name: 'City General Hospital',
      phone: '+1 (212) 555-0123',
      email: 'events@cityhospital.com'
    },
    capacity: 100,
    registered: 67,
    bloodTypesNeeded: ['O-', 'O+', 'A-', 'B-'],
    amenities: [
      'Free Parking',
      'Refreshments Provided',
      'Health Screening',
      'Certificate of Donation',
      'Wheelchair Accessible'
    ],
    requirements: [
      'Must be 18-65 years old',
      'Weight at least 50 kg',
      'Valid ID required',
      'No recent tattoos (within 6 months)',
      'Good health condition'
    ],
    schedule: [
      { time: '9:00 AM', activity: 'Registration Opens' },
      { time: '9:30 AM', activity: 'Donation Sessions Begin' },
      { time: '12:00 PM', activity: 'Lunch Break' },
      { time: '1:00 PM', activity: 'Donation Sessions Resume' },
      { time: '4:30 PM', activity: 'Last Registration' },
      { time: '5:00 PM', activity: 'Event Closes' }
    ],
    status: 'upcoming',
    isRegistered: false
  };

  const getTypeColor = (type) => {
    switch (type) {
      case 'blood_drive':
        return 'bg-red-500';
      case 'donation':
        return 'bg-green-500';
      case 'checkup':
        return 'bg-blue-500';
      default:
        return 'bg-gray-500';
    }
  };

  const availableSpots = schedule.capacity - schedule.registered;
  const fillPercentage = (schedule.registered / schedule.capacity) * 100;

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 p-6 lg:p-8">
      {/* Breadcrumb */}
      <div className="max-w-6xl mx-auto mb-6">
        <div className="flex items-center space-x-2 text-sm text-gray-500">
          <Link to="/schedules" className="hover:text-primary-600">Schedules</Link>
          <span>/</span>
          <span className="text-gray-800">{schedule.title}</span>
        </div>
      </div>

      <div className="max-w-6xl mx-auto">
        {/* Hero Card */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="glass-card overflow-hidden mb-6"
        >
          <div className={`h-48 ${getTypeColor(schedule.type)} relative`}>
            <div className="absolute inset-0 bg-black/20" />
            <div className="absolute inset-0 flex items-center justify-center">
              <span className="text-8xl opacity-30">🩸</span>
            </div>
            <div className="absolute bottom-0 left-0 right-0 p-6 bg-gradient-to-t from-black/60 to-transparent">
              <span className="inline-block px-3 py-1 bg-white/20 backdrop-blur-sm text-white rounded-full text-sm mb-2">
                {schedule.type.replace('_', ' ').toUpperCase()}
              </span>
              <h1 className="text-3xl font-bold text-white">{schedule.title}</h1>
            </div>
          </div>

          <div className="p-6">
            <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between">
              <div className="flex items-center space-x-8">
                <div className="flex items-center space-x-3">
                  <div className="w-12 h-12 bg-red-100 rounded-xl flex items-center justify-center">
                    <span className="text-2xl">📅</span>
                  </div>
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
                </div>
                <div className="flex items-center space-x-3">
                  <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center">
                    <span className="text-2xl">🕐</span>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Time</p>
                    <p className="font-semibold text-gray-800">{schedule.startTime} - {schedule.endTime}</p>
                  </div>
                </div>
              </div>

              <div className="mt-6 lg:mt-0 flex space-x-3">
                {!schedule.isRegistered ? (
                  <button className="btn-primary">
                    Register Now
                  </button>
                ) : (
                  <button className="btn-secondary">
                    ✓ Registered
                  </button>
                )}
                <button className="btn-secondary">
                  Add to Calendar
                </button>
              </div>
            </div>

            {/* Capacity Bar */}
            <div className="mt-6 p-4 bg-gray-50 rounded-xl">
              <div className="flex justify-between text-sm mb-2">
                <span className="text-gray-600">Registration Status</span>
                <span className="font-medium text-gray-800">{schedule.registered} / {schedule.capacity} registered</span>
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
                {availableSpots > 0 
                  ? `${availableSpots} spots remaining` 
                  : 'Event is fully booked'}
              </p>
            </div>
          </div>
        </motion.div>

        <div className="grid lg:grid-cols-3 gap-6">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* About */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="glass-card p-6"
            >
              <h2 className="text-xl font-semibold text-gray-800 mb-4">About This Event</h2>
              <p className="text-gray-600">{schedule.description}</p>

              {/* Blood Types Needed */}
              <div className="mt-6">
                <h3 className="font-medium text-gray-800 mb-3">Blood Types Urgently Needed</h3>
                <div className="flex flex-wrap gap-2">
                  {schedule.bloodTypesNeeded.map((type) => (
                    <span key={type} className="px-4 py-2 bg-red-100 text-red-700 rounded-xl font-semibold">
                      {type}
                    </span>
                  ))}
                </div>
              </div>
            </motion.div>

            {/* Event Schedule */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="glass-card p-6"
            >
              <h2 className="text-xl font-semibold text-gray-800 mb-4">Event Schedule</h2>
              <div className="space-y-4">
                {schedule.schedule.map((item, index) => (
                  <div key={index} className="flex items-center space-x-4">
                    <div className="w-24 text-sm font-medium text-primary-600">{item.time}</div>
                    <div className="w-3 h-3 bg-primary-500 rounded-full" />
                    <div className="flex-1 p-3 bg-gray-50 rounded-xl">
                      <p className="text-gray-800">{item.activity}</p>
                    </div>
                  </div>
                ))}
              </div>
            </motion.div>

            {/* Requirements */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="glass-card p-6"
            >
              <h2 className="text-xl font-semibold text-gray-800 mb-4">Eligibility Requirements</h2>
              <div className="space-y-3">
                {schedule.requirements.map((req, index) => (
                  <div key={index} className="flex items-center space-x-3">
                    <span className="w-6 h-6 bg-primary-100 text-primary-600 rounded-full flex items-center justify-center text-sm">
                      {index + 1}
                    </span>
                    <span className="text-gray-600">{req}</span>
                  </div>
                ))}
              </div>
            </motion.div>

            {/* Amenities */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
              className="glass-card p-6"
            >
              <h2 className="text-xl font-semibold text-gray-800 mb-4">What's Included</h2>
              <div className="grid grid-cols-2 gap-4">
                {schedule.amenities.map((amenity, index) => (
                  <div key={index} className="flex items-center space-x-3 p-3 bg-green-50 rounded-xl">
                    <span className="text-green-500">✓</span>
                    <span className="text-gray-700">{amenity}</span>
                  </div>
                ))}
              </div>
            </motion.div>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Location */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="glass-card p-6"
            >
              <h3 className="font-semibold text-gray-800 mb-4">Location</h3>
              <div className="space-y-3">
                <div className="flex items-start space-x-3">
                  <span className="text-xl">🏢</span>
                  <div>
                    <p className="font-medium text-gray-800">{schedule.location.name}</p>
                    <p className="text-sm text-gray-500">{schedule.location.room}</p>
                  </div>
                </div>
                <div className="flex items-start space-x-3">
                  <span className="text-xl">📍</span>
                  <p className="text-gray-600 text-sm">{schedule.location.address}</p>
                </div>
              </div>

              {/* Map Placeholder */}
              <div className="mt-4 h-40 bg-gray-200 rounded-xl flex items-center justify-center">
                <span className="text-gray-500">🗺️ Map</span>
              </div>

              <button className="w-full mt-4 btn-secondary">
                Get Directions
              </button>
            </motion.div>

            {/* Organizer */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="glass-card p-6"
            >
              <h3 className="font-semibold text-gray-800 mb-4">Organizer</h3>
              <div className="space-y-3">
                <div className="flex items-center space-x-3">
                  <div className="w-12 h-12 bg-primary-100 rounded-xl flex items-center justify-center">
                    <span className="text-xl">🏥</span>
                  </div>
                  <div>
                    <p className="font-medium text-gray-800">{schedule.organizer.name}</p>
                  </div>
                </div>
                <div className="flex items-center space-x-3">
                  <span className="text-lg">📞</span>
                  <a href={`tel:${schedule.organizer.phone}`} className="text-primary-600 hover:underline text-sm">
                    {schedule.organizer.phone}
                  </a>
                </div>
                <div className="flex items-center space-x-3">
                  <span className="text-lg">✉️</span>
                  <a href={`mailto:${schedule.organizer.email}`} className="text-primary-600 hover:underline text-sm">
                    {schedule.organizer.email}
                  </a>
                </div>
              </div>
            </motion.div>

            {/* Share */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
              className="glass-card p-6"
            >
              <h3 className="font-semibold text-gray-800 mb-4">Share This Event</h3>
              <div className="flex space-x-3">
                {['📘', '🐦', '💬', '📧'].map((icon, index) => (
                  <button
                    key={index}
                    className="w-12 h-12 bg-gray-100 rounded-xl flex items-center justify-center hover:bg-gray-200 transition-colors"
                  >
                    <span className="text-xl">{icon}</span>
                  </button>
                ))}
              </div>
              <button className="w-full mt-4 py-2 text-gray-600 hover:text-primary-600 transition-colors">
                Copy Link
              </button>
            </motion.div>

            {/* Tips */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5 }}
              className="glass-card p-6"
            >
              <h3 className="font-semibold text-gray-800 mb-4">Before You Come</h3>
              <div className="space-y-3 text-sm">
                <div className="p-3 bg-blue-50 rounded-xl">
                  <p className="text-blue-800">💧 Stay hydrated - drink plenty of water</p>
                </div>
                <div className="p-3 bg-green-50 rounded-xl">
                  <p className="text-green-800">🍎 Eat a healthy meal before donating</p>
                </div>
                <div className="p-3 bg-yellow-50 rounded-xl">
                  <p className="text-yellow-800">🆔 Bring a valid photo ID</p>
                </div>
                <div className="p-3 bg-purple-50 rounded-xl">
                  <p className="text-purple-800">😴 Get a good night's sleep</p>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ScheduleDetail;
