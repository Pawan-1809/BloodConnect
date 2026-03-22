import React, { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import CountUp from 'react-countup';
import {
  HiHeart,
  HiClock,
  HiLocationMarker,
  HiBell,
  HiCalendar,
  HiTrendingUp
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
import { useSocket } from '../../context/SocketContext';
import { useAuth } from '../../context/AuthContext';

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

const BADGE_META = {
  hero: { name: 'Legendary Hero', color: 'yellow' },
  platinum: { name: 'Super Hero', color: 'purple' },
  gold: { name: 'Champion', color: 'blue' },
  silver: { name: 'Guardian', color: 'green' },
  bronze: { name: 'First Step', color: 'primary' }
};

const INITIAL_STATS = {
  totalDonations: 0,
  totalLivesSaved: 0,
  points: 0,
  rank: null,
  rankTier: 'bronze',
  monthlyDonations: [],
  isEligible: true,
  daysUntilEligible: 0,
  nextEligibleDate: null
};

const DonorDashboard = () => {
  const { user } = useAuth();
  const { isConnected, notifications } = useSocket();

  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState(INITIAL_STATS);
  const [recentDonations, setRecentDonations] = useState([]);
  const [nearbyRequests, setNearbyRequests] = useState([]);
  const [upcomingAppointments, setUpcomingAppointments] = useState([]);

  useEffect(() => {
    if (!user?._id) {
      setLoading(false);
      return undefined;
    }

    let isMounted = true;

    const fetchDashboardData = async (showLoader = true) => {
      if (showLoader) {
        setLoading(true);
      }

      try {
        const [statsRes, historyRes, requestsRes, appointmentsRes] = await Promise.all([
          donorAPI.getDonorStats().catch(() => ({ data: { stats: INITIAL_STATS } })),
          donorAPI.getDonationHistory({ limit: 5 }).catch(() => ({ data: { donations: [] } })),
          requestAPI.getMatched({ limit: 5 }).catch(() => ({ data: { requests: [] } })),
          scheduleAPI.getMyAppointments({ status: 'upcoming', limit: 3 }).catch(() => ({ data: { appointments: [] } }))
        ]);

        if (!isMounted) {
          return;
        }

        setStats({
          ...INITIAL_STATS,
          ...(statsRes.data?.stats || {})
        });
        setRecentDonations(historyRes.data?.donations || []);
        setNearbyRequests(requestsRes.data?.requests || []);
        setUpcomingAppointments(appointmentsRes.data?.appointments || []);
      } catch (error) {
        console.error('Error fetching donor dashboard:', error);
      } finally {
        if (isMounted && showLoader) {
          setLoading(false);
        }
      }
    };

    fetchDashboardData();

    const intervalId = setInterval(() => {
      fetchDashboardData(false);
    }, 30000);

    return () => {
      isMounted = false;
      clearInterval(intervalId);
    };
  }, [user?._id]);

  useEffect(() => {
    if (!loading && user?._id) {
      donorAPI.getDonorStats()
        .then((response) => {
          setStats((previous) => ({
            ...previous,
            ...(response.data?.stats || {})
          }));
        })
        .catch((error) => {
          console.error('Error refreshing donor stats:', error);
        });
    }
  }, [notifications.length, loading, user?._id]);

  const badge = BADGE_META[stats.rankTier] || BADGE_META.bronze;

  const donationChartData = useMemo(() => ({
    labels: stats.monthlyDonations.map((item) => item.label),
    datasets: [
      {
        label: 'Completed Donations',
        data: stats.monthlyDonations.map((item) => item.count),
        borderColor: '#DC2626',
        backgroundColor: 'rgba(220, 38, 38, 0.1)',
        fill: true,
        tension: 0.35
      }
    ]
  }), [stats.monthlyDonations]);

  const impactChartData = useMemo(() => ({
    labels: ['Lives Impacted', 'Potential'],
    datasets: [
      {
        data: [stats.totalLivesSaved, Math.max(stats.totalDonations * 3, 3)],
        backgroundColor: ['#DC2626', '#F3F4F6'],
        borderWidth: 0
      }
    ]
  }), [stats.totalDonations, stats.totalLivesSaved]);

  const nextEligibleDate = stats.nextEligibleDate ? new Date(stats.nextEligibleDate) : null;

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
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="mb-8">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <h1 className="text-2xl md:text-3xl font-bold text-gray-900">
              Welcome back, {user?.firstName || 'Donor'}
            </h1>
            <p className="text-gray-600 mt-1">
              {isConnected ? 'Live updates are connected.' : 'Showing the latest donor data saved on the server.'}
            </p>
          </div>

          <div className="flex items-center gap-3">
            <Link to="/donor/find-requests" className="btn-primary flex items-center gap-2">
              <HiHeart className="h-5 w-5" />
              Find Requests
            </Link>
            <Link to="/schedules" className="btn-secondary flex items-center gap-2">
              <HiCalendar className="h-5 w-5" />
              Book Appointment
            </Link>
          </div>
        </div>
      </motion.div>

      {!stats.isEligible && nextEligibleDate && (
        <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="mb-6 bg-yellow-50 border border-yellow-200 rounded-xl p-4 flex items-center gap-4">
          <div className="w-10 h-10 bg-yellow-100 rounded-full flex items-center justify-center">
            <HiClock className="h-5 w-5 text-yellow-600" />
          </div>
          <div>
            <p className="font-medium text-yellow-800">Cooling Off Period</p>
            <p className="text-sm text-yellow-700">
              Eligible again on {nextEligibleDate.toLocaleDateString()}.
            </p>
          </div>
        </motion.div>
      )}

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <div className="stat-card">
          <div className="flex items-center justify-between mb-4">
            <div className="w-12 h-12 bg-primary-100 rounded-xl flex items-center justify-center">
              <FaDroplet className="h-6 w-6 text-primary-600" />
            </div>
            <span className={`badge ${stats.isEligible ? 'badge-success' : 'badge-warning'}`}>
              {stats.isEligible ? 'Eligible' : `${stats.daysUntilEligible} days`}
            </span>
          </div>
          <p className="text-3xl font-bold text-gray-900"><CountUp end={stats.totalDonations} duration={1.4} /></p>
          <p className="text-gray-500">Completed Donations</p>
        </div>

        <div className="stat-card">
          <div className="flex items-center justify-between mb-4">
            <div className="w-12 h-12 bg-red-100 rounded-xl flex items-center justify-center">
              <FaHeartPulse className="h-6 w-6 text-red-600" />
            </div>
            <span className="text-green-600 text-sm font-medium flex items-center">
              <HiTrendingUp className="mr-1" />
              3 per donation
            </span>
          </div>
          <p className="text-3xl font-bold text-gray-900"><CountUp end={stats.totalLivesSaved} duration={1.4} /></p>
          <p className="text-gray-500">Lives Impacted</p>
        </div>

        <div className="stat-card">
          <div className="flex items-center justify-between mb-4">
            <div className="w-12 h-12 bg-secondary-100 rounded-xl flex items-center justify-center">
              <FaMedal className="h-6 w-6 text-secondary-600" />
            </div>
            <span className={`badge badge-${badge.color}`}>{badge.name}</span>
          </div>
          <p className="text-3xl font-bold text-gray-900"><CountUp end={stats.points} duration={1.4} /></p>
          <p className="text-gray-500">Reward Points</p>
        </div>

        <div className="stat-card">
          <div className="flex items-center justify-between mb-4">
            <div className="w-12 h-12 bg-purple-100 rounded-xl flex items-center justify-center">
              <FaTrophy className="h-6 w-6 text-purple-600" />
            </div>
          </div>
          <p className="text-3xl font-bold text-gray-900">{stats.rank ? `#${stats.rank}` : 'Unranked'}</p>
          <p className="text-gray-500">Leaderboard Position</p>
        </div>
      </div>

      <div className="grid lg:grid-cols-3 gap-6 mb-8">
        <div className="lg:col-span-2 card p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-lg font-semibold text-gray-900">Donation History</h2>
            <Link to="/donor/history" className="text-primary-600 text-sm font-medium hover:underline">
              View All
            </Link>
          </div>
          <div className="h-64">
            <Line
              data={donationChartData}
              options={{
                responsive: true,
                maintainAspectRatio: false,
                plugins: { legend: { display: false } },
                scales: { y: { beginAtZero: true, ticks: { precision: 0, stepSize: 1 } } }
              }}
            />
          </div>
        </div>

        <div className="card p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-6">Your Impact</h2>
          <div className="h-48 relative">
            <Doughnut
              data={impactChartData}
              options={{
                responsive: true,
                maintainAspectRatio: false,
                cutout: '75%',
                plugins: { legend: { display: false } }
              }}
            />
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="text-center">
                <p className="text-3xl font-bold text-primary-600">{stats.totalLivesSaved}</p>
                <p className="text-sm text-gray-500">Lives Saved</p>
              </div>
            </div>
          </div>
          <div className="mt-4 p-4 bg-primary-50 rounded-xl text-center">
            <p className="text-sm text-gray-600">Based on your real completed donations on record.</p>
          </div>
        </div>
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        <div className="card p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-lg font-semibold text-gray-900">Nearby Requests</h2>
            <Link to="/donor/find-requests" className="text-primary-600 text-sm font-medium hover:underline">
              View All
            </Link>
          </div>

          {nearbyRequests.length === 0 ? (
            <div className="text-center py-8">
              <HiHeart className="h-12 w-12 text-gray-300 mx-auto mb-3" />
              <p className="text-gray-500">No matching requests right now.</p>
            </div>
          ) : (
            <div className="space-y-4">
              {nearbyRequests.slice(0, 3).map((request) => (
                <div key={request._id} className="p-4 rounded-xl border border-gray-200 bg-gray-50">
                  <div className="flex items-center justify-between gap-3">
                    <div className="flex items-center gap-3">
                      <div className="blood-badge blood-badge-sm">{request.bloodGroup}</div>
                      <div>
                        <p className="font-medium text-gray-900">{request.unitsRequired} units needed</p>
                        <p className="text-sm text-gray-500 flex items-center gap-1">
                          <HiLocationMarker className="h-4 w-4" />
                          {request.hospital?.name || request.hospitalName || 'Hospital'}
                        </p>
                      </div>
                    </div>
                    <span className={`urgency-badge urgency-${request.urgency || 'normal'}`}>
                      {request.urgency || 'normal'}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="card p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-lg font-semibold text-gray-900">Upcoming Appointments</h2>
            <Link to="/schedules/my-appointments" className="text-primary-600 text-sm font-medium hover:underline">
              View All
            </Link>
          </div>

          {upcomingAppointments.length === 0 ? (
            <div className="text-center py-8">
              <HiCalendar className="h-12 w-12 text-gray-300 mx-auto mb-3" />
              <p className="text-gray-500">No upcoming appointments.</p>
            </div>
          ) : (
            <div className="space-y-4">
              {upcomingAppointments.map((appointment) => (
                <div key={appointment._id} className="p-4 rounded-xl border border-gray-200 bg-gray-50">
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
                      <p className="font-medium text-gray-900">{appointment.hospital?.name || 'Hospital'}</p>
                      <p className="text-sm text-gray-500">{appointment.slotTime || 'Scheduled'}</p>
                    </div>
                    <span className="badge badge-primary">{appointment.status}</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {recentDonations.length > 0 && (
        <div className="mt-8 card p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-lg font-semibold text-gray-900">Latest Recorded Donations</h2>
            <Link to="/donor/history" className="text-primary-600 text-sm font-medium hover:underline">
              Full History
            </Link>
          </div>
          <div className="space-y-3">
            {recentDonations.slice(0, 3).map((donation) => (
              <div key={donation._id} className="flex items-center justify-between p-3 rounded-lg bg-gray-50">
                <div>
                  <p className="font-medium text-gray-900">{donation.hospital?.name || 'Hospital'}</p>
                  <p className="text-sm text-gray-500">
                    {(donation.donationType || 'whole_blood').replace(/_/g, ' ')} on {new Date(donation.donationDate).toLocaleDateString()}
                  </p>
                </div>
                <span className="text-sm font-medium text-primary-600">+{donation.pointsAwarded || 0} pts</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {notifications.length > 0 && (
        <div className="mt-8 card p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-lg font-semibold text-gray-900">Recent Notifications</h2>
            <Link to="/notifications" className="text-primary-600 text-sm font-medium hover:underline">
              View All
            </Link>
          </div>
          <div className="space-y-3">
            {notifications.slice(0, 3).map((notification, index) => (
              <div key={`${notification._id || notification.title}-${index}`} className="flex items-center gap-4 p-3 rounded-lg bg-gray-50">
                <div className="w-10 h-10 rounded-full flex items-center justify-center bg-primary-100">
                  <HiBell className="h-5 w-5 text-primary-600" />
                </div>
                <div className="flex-1">
                  <p className="font-medium text-gray-900">{notification.title}</p>
                  <p className="text-sm text-gray-500">{notification.message}</p>
                </div>
                <span className="text-xs text-gray-400">
                  {notification.createdAt ? new Date(notification.createdAt).toLocaleTimeString() : ''}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default DonorDashboard;
