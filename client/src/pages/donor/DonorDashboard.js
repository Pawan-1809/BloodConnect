import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import CountUp from 'react-countup';
import {
  HiHeart,
  HiUserGroup,
  HiClipboardList,
  HiClock,
  HiLocationMarker,
  HiArrowRight,
  HiBell,
  HiCalendar,
  HiTrendingUp,
  HiStar,
  HiCheck,
  HiExclamation
} from 'react-icons/hi';
import { FaDroplet, FaMedal, FaTrophy, FaHeartPulse } from 'react-icons/fa6';
import { Line, Doughnut } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  ArcElement
} from 'chart.js';
import { donorAPI, requestAPI, scheduleAPI } from '../../services/api';
import toast from 'react-hot-toast';
import { useSocket } from '../../context/SocketContext';
import { useAuth } from '../../context/AuthContext';

// Register ChartJS components
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  ArcElement
);

const DonorDashboard = () => {
  const { user, donorProfile, refreshUser } = useAuth();
  const { isConnected, notifications } = useSocket();
  
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    totalDonations: 0,
    livesImpacted: 0,
    points: 0,
    rank: 0
  });
  const [recentDonations, setRecentDonations] = useState([]);
  const [nearbyRequests, setNearbyRequests] = useState([]);
  const [upcomingAppointments, setUpcomingAppointments] = useState([]);
  const [eligibilityStatus, setEligibilityStatus] = useState(null);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      
      // Fetch donor stats
      if (user?._id) {
        const [statsRes, historyRes, requestsRes, appointmentsRes, eligibilityRes] = await Promise.all([
          donorAPI.getDonorStats().catch(() => ({ data: {} })),
          donorAPI.getDonationHistory().catch(() => ({ data: { donations: [] } })),
          requestAPI.getMatched({ limit: 5 }).catch(() => ({ data: { requests: [] } })),
          scheduleAPI.getMyAppointments({ status: 'upcoming', limit: 3 }).catch(() => ({ data: { appointments: [] } })),
          donorAPI.checkEligibility().catch(() => ({ data: null }))
        ]);

        const donorStats = statsRes.data?.stats || {};

        setStats({
          totalDonations: donorStats.totalDonations || donorProfile?.totalDonations || 0,
          livesImpacted: donorStats.totalLivesSaved || (donorProfile?.totalDonations || 0) * 3,
          points: donorStats.points || donorProfile?.points || 0,
          rank: donorStats.rank || 0
        });

        setRecentDonations(historyRes.data?.donations || []);
        setNearbyRequests(requestsRes.data?.requests || []);
        setUpcomingAppointments(appointmentsRes.data?.appointments || []);
        setEligibilityStatus(eligibilityRes.data?.eligibility || null);
      }
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  // Chart data for donation history
  const donationChartData = {
    labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'],
    datasets: [
      {
        label: 'Donations',
        data: [0, 1, 0, 1, 0, 0, 1, 0, 1, 0, 0, 1],
        borderColor: '#DC2626',
        backgroundColor: 'rgba(220, 38, 38, 0.1)',
        fill: true,
        tension: 0.4
      }
    ]
  };

  const donationChartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        display: false
      }
    },
    scales: {
      y: {
        beginAtZero: true,
        ticks: {
          stepSize: 1
        }
      }
    }
  };

  // Blood type impact chart
  const impactChartData = {
    labels: ['Lives Saved', 'Potential Impact'],
    datasets: [
      {
        data: [stats.livesImpacted, Math.max(30 - stats.livesImpacted, 0)],
        backgroundColor: ['#DC2626', '#F3F4F6'],
        borderWidth: 0
      }
    ]
  };

  const impactChartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    cutout: '75%',
    plugins: {
      legend: {
        display: false
      }
    }
  };

  // Get badge based on donations
  const getBadge = () => {
    const donations = stats.totalDonations;
    if (donations >= 50) return { name: 'Legendary Hero', icon: '👑', color: 'yellow' };
    if (donations >= 25) return { name: 'Super Hero', icon: '🦸', color: 'purple' };
    if (donations >= 10) return { name: 'Champion', icon: '🏆', color: 'blue' };
    if (donations >= 5) return { name: 'Guardian', icon: '🛡️', color: 'green' };
    if (donations >= 1) return { name: 'First Timer', icon: '⭐', color: 'primary' };
    return { name: 'New Member', icon: '🌟', color: 'gray' };
  };

  const badge = getBadge();

  // Calculate next eligibility
  const getNextEligibleDate = () => {
    if (!donorProfile?.lastDonationDate) return null;
    const lastDonation = new Date(donorProfile.lastDonationDate);
    const nextEligible = new Date(lastDonation);
    nextEligible.setDate(nextEligible.getDate() + 56); // 8 weeks
    return nextEligible;
  };

  const nextEligibleDate = getNextEligibleDate();
  const isEligible = !nextEligibleDate || new Date() >= nextEligibleDate;

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <FaDroplet className="h-12 w-12 text-primary-600 animate-bounce mx-auto mb-4" />
          <p className="text-gray-600">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 lg:p-8">
          {/* Welcome Section */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-8"
          >
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
              <div>
                <h1 className="text-2xl md:text-3xl font-bold text-gray-900">
                  Welcome back, {user?.firstName}! 👋
                </h1>
                <p className="text-gray-600 mt-1">
                  {isConnected ? (
                    <span className="flex items-center gap-2">
                      <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
                      Connected and ready to save lives
                    </span>
                  ) : (
                    'Your dashboard overview'
                  )}
                </p>
              </div>
              
              <div className="flex items-center gap-3">
                <Link
                  to="/donor/find-requests"
                  className="btn-primary flex items-center gap-2"
                >
                  <HiHeart className="h-5 w-5" />
                  Find Requests
                </Link>
                <Link
                  to="/schedules"
                  className="btn-secondary flex items-center gap-2"
                >
                  <HiCalendar className="h-5 w-5" />
                  Book Appointment
                </Link>
              </div>
            </div>
          </motion.div>

          {/* Eligibility Alert */}
          {!isEligible && nextEligibleDate && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className="mb-6 bg-yellow-50 border border-yellow-200 rounded-xl p-4 flex items-center gap-4"
            >
              <div className="w-10 h-10 bg-yellow-100 rounded-full flex items-center justify-center">
                <HiClock className="h-5 w-5 text-yellow-600" />
              </div>
              <div>
                <p className="font-medium text-yellow-800">Next Eligible Date</p>
                <p className="text-sm text-yellow-700">
                  You can donate again on {nextEligibleDate.toLocaleDateString('en-US', {
                    weekday: 'long',
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric'
                  })}
                </p>
              </div>
            </motion.div>
          )}

          {/* Stats Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="stat-card"
            >
              <div className="flex items-center justify-between mb-4">
                <div className="w-12 h-12 bg-primary-100 rounded-xl flex items-center justify-center">
                  <FaDroplet className="h-6 w-6 text-primary-600" />
                </div>
                <span className={`badge ${isEligible ? 'badge-success' : 'badge-warning'}`}>
                  {isEligible ? 'Eligible' : 'Cooling Off'}
                </span>
              </div>
              <p className="text-3xl font-bold text-gray-900">
                <CountUp end={stats.totalDonations} duration={2} />
              </p>
              <p className="text-gray-500">Total Donations</p>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="stat-card"
            >
              <div className="flex items-center justify-between mb-4">
                <div className="w-12 h-12 bg-red-100 rounded-xl flex items-center justify-center">
                  <FaHeartPulse className="h-6 w-6 text-red-600" />
                </div>
                <span className="text-green-600 text-sm font-medium flex items-center">
                  <HiTrendingUp className="mr-1" />
                  +3 per donation
                </span>
              </div>
              <p className="text-3xl font-bold text-gray-900">
                <CountUp end={stats.livesImpacted} duration={2} />
              </p>
              <p className="text-gray-500">Lives Impacted</p>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="stat-card"
            >
              <div className="flex items-center justify-between mb-4">
                <div className="w-12 h-12 bg-secondary-100 rounded-xl flex items-center justify-center">
                  <FaMedal className="h-6 w-6 text-secondary-600" />
                </div>
                <span className={`badge badge-${badge.color}`}>
                  {badge.icon} {badge.name}
                </span>
              </div>
              <p className="text-3xl font-bold text-gray-900">
                <CountUp end={stats.points} duration={2} />
              </p>
              <p className="text-gray-500">Reward Points</p>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
              className="stat-card"
            >
              <div className="flex items-center justify-between mb-4">
                <div className="w-12 h-12 bg-purple-100 rounded-xl flex items-center justify-center">
                  <FaTrophy className="h-6 w-6 text-purple-600" />
                </div>
                <Link to="/leaderboard" className="text-primary-600 text-sm font-medium">
                  View Board →
                </Link>
              </div>
              <p className="text-3xl font-bold text-gray-900">
                #{stats.rank || '—'}
              </p>
              <p className="text-gray-500">Leaderboard Rank</p>
            </motion.div>
          </div>

          <div className="grid lg:grid-cols-3 gap-6 mb-8">
            {/* Donation History Chart */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5 }}
              className="lg:col-span-2 card p-6"
            >
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-lg font-semibold text-gray-900">Donation History</h2>
                <Link to="/donor/history" className="text-primary-600 text-sm font-medium hover:underline">
                  View All
                </Link>
              </div>
              <div className="h-64">
                <Line data={donationChartData} options={donationChartOptions} />
              </div>
            </motion.div>

            {/* Impact Chart */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.6 }}
              className="card p-6"
            >
              <h2 className="text-lg font-semibold text-gray-900 mb-6">Your Impact</h2>
              <div className="h-48 relative">
                <Doughnut data={impactChartData} options={impactChartOptions} />
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="text-center">
                    <p className="text-3xl font-bold text-primary-600">{stats.livesImpacted}</p>
                    <p className="text-sm text-gray-500">Lives Saved</p>
                  </div>
                </div>
              </div>
              <div className="mt-4 p-4 bg-primary-50 rounded-xl text-center">
                <p className="text-sm text-gray-600">
                  Each donation can save up to <span className="font-semibold text-primary-600">3 lives</span>!
                </p>
              </div>
            </motion.div>
          </div>

          <div className="grid lg:grid-cols-2 gap-6">
            {/* Nearby Blood Requests */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.7 }}
              className="card p-6"
            >
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-lg font-semibold text-gray-900">Nearby Requests</h2>
                <Link to="/donor/find-requests" className="text-primary-600 text-sm font-medium hover:underline">
                  View All
                </Link>
              </div>

              {nearbyRequests.length === 0 ? (
                <div className="text-center py-8">
                  <HiHeart className="h-12 w-12 text-gray-300 mx-auto mb-3" />
                  <p className="text-gray-500">No nearby requests at the moment</p>
                  <p className="text-sm text-gray-400 mt-1">We'll notify you when there's a match</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {nearbyRequests.slice(0, 3).map((request, index) => (
                    <motion.div
                      key={request._id}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 0.1 * index }}
                      className={`p-4 rounded-xl border ${
                        request.urgencyLevel === 'critical' ? 'border-red-200 bg-red-50' :
                        request.urgencyLevel === 'urgent' ? 'border-yellow-200 bg-yellow-50' :
                        'border-gray-200 bg-gray-50'
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <div className="blood-badge blood-badge-sm">{request.bloodGroup}</div>
                          <div>
                            <p className="font-medium text-gray-900">{request.unitsRequired} units needed</p>
                            <p className="text-sm text-gray-500 flex items-center gap-1">
                              <HiLocationMarker className="h-4 w-4" />
                              {request.hospital?.name || 'Unknown Hospital'}
                            </p>
                          </div>
                        </div>
                        <div className="text-right">
                          <span className={`urgency-badge urgency-${request.urgencyLevel}`}>
                            {request.urgencyLevel}
                          </span>
                          <p className="text-xs text-gray-400 mt-1">
                            {request.distance ? `${request.distance.toFixed(1)} km away` : ''}
                          </p>
                        </div>
                      </div>
                      <div className="mt-3 flex gap-2">
                        <Link
                          to={`/requests/${request._id}`}
                          className="flex-1 btn-secondary btn-sm text-center"
                        >
                          View Details
                        </Link>
                        <button
                          onClick={() => toast.success('Response sent!')}
                          className="flex-1 btn-primary btn-sm"
                          disabled={!isEligible}
                        >
                          Respond
                        </button>
                      </div>
                    </motion.div>
                  ))}
                </div>
              )}
            </motion.div>

            {/* Upcoming Appointments */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.8 }}
              className="card p-6"
            >
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-lg font-semibold text-gray-900">Upcoming Appointments</h2>
                <Link to="/schedules/my-appointments" className="text-primary-600 text-sm font-medium hover:underline">
                  View All
                </Link>
              </div>

              {upcomingAppointments.length === 0 ? (
                <div className="text-center py-8">
                  <HiCalendar className="h-12 w-12 text-gray-300 mx-auto mb-3" />
                  <p className="text-gray-500">No upcoming appointments</p>
                  <Link to="/schedules" className="btn-primary btn-sm mt-3 inline-block">
                    Schedule Now
                  </Link>
                </div>
              ) : (
                <div className="space-y-4">
                  {upcomingAppointments.map((appointment, index) => (
                    <motion.div
                      key={appointment._id}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 0.1 * index }}
                      className="p-4 rounded-xl border border-gray-200 bg-gray-50"
                    >
                      <div className="flex items-center gap-4">
                        <div className="w-14 h-14 bg-primary-100 rounded-xl flex flex-col items-center justify-center">
                          <span className="text-xs text-primary-600 font-medium">
                            {new Date(appointment.date).toLocaleDateString('en-US', { month: 'short' })}
                          </span>
                          <span className="text-lg font-bold text-primary-700">
                            {new Date(appointment.date).getDate()}
                          </span>
                        </div>
                        <div className="flex-1">
                          <p className="font-medium text-gray-900">{appointment.hospital?.name}</p>
                          <p className="text-sm text-gray-500">{appointment.slotTime}</p>
                        </div>
                        <span className="badge badge-primary">{appointment.status}</span>
                      </div>
                    </motion.div>
                  ))}
                </div>
              )}
            </motion.div>
          </div>

          {/* Recent Notifications */}
          {notifications.length > 0 && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.9 }}
              className="mt-8 card p-6"
            >
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-lg font-semibold text-gray-900">Recent Notifications</h2>
                <Link to="/notifications" className="text-primary-600 text-sm font-medium hover:underline">
                  View All
                </Link>
              </div>
              <div className="space-y-3">
                {notifications.slice(0, 3).map((notif, index) => (
                  <div
                    key={index}
                    className="flex items-center gap-4 p-3 rounded-lg bg-gray-50 hover:bg-gray-100 transition-colors"
                  >
                    <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                      notif.priority === 'urgent' ? 'bg-red-100' : 'bg-primary-100'
                    }`}>
                      <HiBell className={`h-5 w-5 ${
                        notif.priority === 'urgent' ? 'text-red-600' : 'text-primary-600'
                      }`} />
                    </div>
                    <div className="flex-1">
                      <p className="font-medium text-gray-900">{notif.title}</p>
                      <p className="text-sm text-gray-500">{notif.message}</p>
                    </div>
                    <span className="text-xs text-gray-400">
                      {new Date(notif.createdAt).toLocaleTimeString()}
                    </span>
                  </div>
                ))}
              </div>
            </motion.div>
          )}
    </div>
  );
};

export default DonorDashboard;
