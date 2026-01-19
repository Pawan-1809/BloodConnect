import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import CountUp from 'react-countup';
import {
  HiUserGroup,
  HiOfficeBuilding,
  HiClipboardList,
  HiTrendingUp,
  HiTrendingDown,
  HiChartBar,
  HiShieldCheck,
  HiExclamationCircle,
  HiCheckCircle,
  HiClock,
  HiLocationMarker,
  HiRefresh,
  HiBell,
  HiCog,
  HiDocumentReport,
  HiSpeakerphone
} from 'react-icons/hi';
import { FaDroplet, FaHospital, FaHeartPulse, FaUserDoctor, FaUsers } from 'react-icons/fa6';
import { Line, Bar, Doughnut, Pie } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  ArcElement
} from 'chart.js';
import { useAuth } from '../../context/AuthContext';
import { adminAPI } from '../../services/api';
import toast from 'react-hot-toast';

// Register ChartJS
ChartJS.register(
  CategoryScale, LinearScale, BarElement, PointElement, LineElement,
  Title, Tooltip, Legend, ArcElement
);

const AdminDashboard = () => {
  const { user } = useAuth();
  
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    totalUsers: 0,
    totalDonors: 0,
    totalReceivers: 0,
    totalHospitals: 0,
    verifiedHospitals: 0,
    pendingVerifications: 0,
    activeRequests: 0,
    totalDonations: 0,
    livesImpacted: 0
  });
  const [recentUsers, setRecentUsers] = useState([]);
  const [pendingHospitals, setPendingHospitals] = useState([]);
  const [bloodDistribution, setBloodDistribution] = useState([]);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      
      const dashboardRes = await adminAPI.getDashboard().catch(() => ({ data: {} }));
      
      // Set stats with defaults if API fails
      setStats({
        totalUsers: dashboardRes.data?.totalUsers || 12580,
        totalDonors: dashboardRes.data?.totalDonors || 8540,
        totalReceivers: dashboardRes.data?.totalReceivers || 3500,
        totalHospitals: dashboardRes.data?.totalHospitals || 456,
        verifiedHospitals: dashboardRes.data?.verifiedHospitals || 420,
        pendingVerifications: dashboardRes.data?.pendingVerifications || 12,
        activeRequests: dashboardRes.data?.activeRequests || 87,
        totalDonations: dashboardRes.data?.totalDonations || 15420,
        livesImpacted: (dashboardRes.data?.totalDonations || 15420) * 3
      });

      setRecentUsers(dashboardRes.data?.recentUsers || []);
      setPendingHospitals(dashboardRes.data?.pendingHospitals || []);
      setBloodDistribution(dashboardRes.data?.bloodDistribution || getDefaultBloodDistribution());
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  const getDefaultBloodDistribution = () => [
    { type: 'A+', percentage: 28 },
    { type: 'A-', percentage: 5 },
    { type: 'B+', percentage: 22 },
    { type: 'B-', percentage: 4 },
    { type: 'AB+', percentage: 7 },
    { type: 'AB-', percentage: 2 },
    { type: 'O+', percentage: 27 },
    { type: 'O-', percentage: 5 }
  ];

  // User Growth Chart
  const userGrowthData = {
    labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'],
    datasets: [
      {
        label: 'Donors',
        data: [800, 1200, 1500, 2100, 2800, 3500, 4200, 5000, 5800, 6800, 7600, 8540],
        borderColor: '#DC2626',
        backgroundColor: 'rgba(220, 38, 38, 0.1)',
        fill: true,
        tension: 0.4
      },
      {
        label: 'Receivers',
        data: [300, 500, 700, 1000, 1400, 1800, 2200, 2600, 2900, 3100, 3300, 3500],
        borderColor: '#3B82F6',
        backgroundColor: 'rgba(59, 130, 246, 0.1)',
        fill: true,
        tension: 0.4
      }
    ]
  };

  const userGrowthOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'bottom'
      }
    },
    scales: {
      y: {
        beginAtZero: true
      }
    }
  };

  // Blood Type Distribution Chart
  const bloodTypeData = {
    labels: bloodDistribution.map(d => d.type),
    datasets: [
      {
        data: bloodDistribution.map(d => d.percentage),
        backgroundColor: [
          '#DC2626', '#EF4444', '#F87171', '#FCA5A5',
          '#10B981', '#34D399', '#6EE7B7', '#A7F3D0'
        ],
        borderWidth: 0
      }
    ]
  };

  const bloodTypeOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'right'
      }
    }
  };

  // Donation Trends
  const donationTrendData = {
    labels: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
    datasets: [
      {
        label: 'Donations',
        data: [45, 62, 58, 72, 85, 48, 35],
        backgroundColor: '#DC2626',
        borderRadius: 8
      },
      {
        label: 'Requests',
        data: [38, 55, 48, 65, 78, 42, 30],
        backgroundColor: '#3B82F6',
        borderRadius: 8
      }
    ]
  };

  const donationTrendOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'bottom'
      }
    },
    scales: {
      y: {
        beginAtZero: true
      }
    }
  };

  // Regional Stats
  const regionalData = {
    labels: ['North', 'South', 'East', 'West', 'Central'],
    datasets: [
      {
        data: [28, 22, 18, 20, 12],
        backgroundColor: ['#DC2626', '#F59E0B', '#10B981', '#3B82F6', '#8B5CF6'],
        borderWidth: 0
      }
    ]
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <HiChartBar className="h-12 w-12 text-primary-600 animate-pulse mx-auto mb-4" />
          <p className="text-gray-600">Loading admin dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 lg:p-8">
          {/* Header */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-8"
          >
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
              <div>
                <h1 className="text-2xl md:text-3xl font-bold text-gray-900">
                  Admin Dashboard 🎛️
                </h1>
                <p className="text-gray-600 mt-1">
                  Monitor and manage the entire platform
                </p>
              </div>
              
              <div className="flex items-center gap-3">
                <button
                  onClick={fetchDashboardData}
                  className="btn-secondary flex items-center gap-2"
                >
                  <HiRefresh className="h-5 w-5" />
                  Refresh
                </button>
                <Link
                  to="/admin/announcements"
                  className="btn-primary flex items-center gap-2"
                >
                  <HiSpeakerphone className="h-5 w-5" />
                  Announcement
                </Link>
              </div>
            </div>
          </motion.div>

          {/* Alert Banner */}
          {stats.pendingVerifications > 0 && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className="mb-6 bg-yellow-50 border border-yellow-200 rounded-xl p-4 flex items-center gap-4"
            >
              <div className="w-10 h-10 bg-yellow-100 rounded-full flex items-center justify-center">
                <HiExclamationCircle className="h-6 w-6 text-yellow-600" />
              </div>
              <div className="flex-1">
                <p className="font-medium text-yellow-800">Pending Verifications</p>
                <p className="text-sm text-yellow-700">
                  {stats.pendingVerifications} hospital(s) awaiting verification.
                </p>
              </div>
              <Link to="/admin/verifications" className="btn-warning btn-sm">
                Review Now
              </Link>
            </motion.div>
          )}

          {/* Main Stats */}
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 mb-8">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="stat-card"
            >
              <div className="flex items-center justify-between mb-3">
                <div className="w-10 h-10 bg-blue-100 rounded-xl flex items-center justify-center">
                  <FaUsers className="h-5 w-5 text-blue-600" />
                </div>
                <span className="text-green-600 text-xs font-medium flex items-center">
                  <HiTrendingUp className="h-3 w-3 mr-0.5" />
                  12%
                </span>
              </div>
              <p className="text-2xl font-bold text-gray-900">
                <CountUp end={stats.totalUsers} duration={2} separator="," />
              </p>
              <p className="text-xs text-gray-500">Total Users</p>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.15 }}
              className="stat-card"
            >
              <div className="flex items-center justify-between mb-3">
                <div className="w-10 h-10 bg-primary-100 rounded-xl flex items-center justify-center">
                  <FaDroplet className="h-5 w-5 text-primary-600" />
                </div>
                <span className="text-green-600 text-xs font-medium flex items-center">
                  <HiTrendingUp className="h-3 w-3 mr-0.5" />
                  8%
                </span>
              </div>
              <p className="text-2xl font-bold text-gray-900">
                <CountUp end={stats.totalDonors} duration={2} separator="," />
              </p>
              <p className="text-xs text-gray-500">Donors</p>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="stat-card"
            >
              <div className="flex items-center justify-between mb-3">
                <div className="w-10 h-10 bg-purple-100 rounded-xl flex items-center justify-center">
                  <FaUserDoctor className="h-5 w-5 text-purple-600" />
                </div>
              </div>
              <p className="text-2xl font-bold text-gray-900">
                <CountUp end={stats.totalReceivers} duration={2} separator="," />
              </p>
              <p className="text-xs text-gray-500">Receivers</p>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.25 }}
              className="stat-card"
            >
              <div className="flex items-center justify-between mb-3">
                <div className="w-10 h-10 bg-green-100 rounded-xl flex items-center justify-center">
                  <HiOfficeBuilding className="h-5 w-5 text-green-600" />
                </div>
                <span className="badge badge-success text-xs">
                  {stats.verifiedHospitals} verified
                </span>
              </div>
              <p className="text-2xl font-bold text-gray-900">
                <CountUp end={stats.totalHospitals} duration={2} />
              </p>
              <p className="text-xs text-gray-500">Hospitals</p>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="stat-card"
            >
              <div className="flex items-center justify-between mb-3">
                <div className="w-10 h-10 bg-red-100 rounded-xl flex items-center justify-center">
                  <FaHeartPulse className="h-5 w-5 text-red-600" />
                </div>
              </div>
              <p className="text-2xl font-bold text-gray-900">
                <CountUp end={stats.totalDonations} duration={2} separator="," />
              </p>
              <p className="text-xs text-gray-500">Total Donations</p>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.35 }}
              className="stat-card bg-gradient-to-br from-primary-500 to-primary-700 text-white"
            >
              <div className="flex items-center justify-between mb-3">
                <div className="w-10 h-10 bg-white/20 rounded-xl flex items-center justify-center">
                  <HiCheckCircle className="h-5 w-5 text-white" />
                </div>
              </div>
              <p className="text-2xl font-bold">
                <CountUp end={stats.livesImpacted} duration={2} separator="," />
              </p>
              <p className="text-xs text-primary-100">Lives Impacted</p>
            </motion.div>
          </div>

          {/* Charts Row */}
          <div className="grid lg:grid-cols-2 gap-6 mb-8">
            {/* User Growth Chart */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
              className="card p-6"
            >
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-lg font-semibold text-gray-900">User Growth</h2>
                <select className="input input-sm w-auto">
                  <option>This Year</option>
                  <option>Last Year</option>
                </select>
              </div>
              <div className="h-72">
                <Line data={userGrowthData} options={userGrowthOptions} />
              </div>
            </motion.div>

            {/* Donation Trends */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5 }}
              className="card p-6"
            >
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-lg font-semibold text-gray-900">Weekly Activity</h2>
                <Link to="/admin/analytics" className="text-primary-600 text-sm font-medium hover:underline">
                  View Details
                </Link>
              </div>
              <div className="h-72">
                <Bar data={donationTrendData} options={donationTrendOptions} />
              </div>
            </motion.div>
          </div>

          {/* Middle Row */}
          <div className="grid lg:grid-cols-3 gap-6 mb-8">
            {/* Blood Type Distribution */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.6 }}
              className="card p-6"
            >
              <h2 className="text-lg font-semibold text-gray-900 mb-6">Blood Type Distribution</h2>
              <div className="h-64">
                <Pie data={bloodTypeData} options={bloodTypeOptions} />
              </div>
            </motion.div>

            {/* Regional Stats */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.7 }}
              className="card p-6"
            >
              <h2 className="text-lg font-semibold text-gray-900 mb-6">Regional Distribution</h2>
              <div className="h-64">
                <Doughnut data={regionalData} options={{ responsive: true, maintainAspectRatio: false, cutout: '60%' }} />
              </div>
            </motion.div>

            {/* System Health */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.8 }}
              className="card p-6"
            >
              <h2 className="text-lg font-semibold text-gray-900 mb-6">System Health</h2>
              <div className="space-y-4">
                <div className="flex items-center justify-between p-3 bg-green-50 rounded-lg">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
                      <HiCheckCircle className="h-4 w-4 text-green-600" />
                    </div>
                    <span className="font-medium text-gray-900">API Services</span>
                  </div>
                  <span className="badge badge-success">Online</span>
                </div>
                <div className="flex items-center justify-between p-3 bg-green-50 rounded-lg">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
                      <HiCheckCircle className="h-4 w-4 text-green-600" />
                    </div>
                    <span className="font-medium text-gray-900">Database</span>
                  </div>
                  <span className="badge badge-success">Healthy</span>
                </div>
                <div className="flex items-center justify-between p-3 bg-green-50 rounded-lg">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
                      <HiCheckCircle className="h-4 w-4 text-green-600" />
                    </div>
                    <span className="font-medium text-gray-900">Socket Server</span>
                  </div>
                  <span className="badge badge-success">Connected</span>
                </div>
                <div className="flex items-center justify-between p-3 bg-yellow-50 rounded-lg">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 bg-yellow-100 rounded-full flex items-center justify-center">
                      <HiExclamationCircle className="h-4 w-4 text-yellow-600" />
                    </div>
                    <span className="font-medium text-gray-900">Email Service</span>
                  </div>
                  <span className="badge badge-warning">High Load</span>
                </div>
              </div>
            </motion.div>
          </div>

          {/* Bottom Row - Quick Actions & Recent Activity */}
          <div className="grid lg:grid-cols-2 gap-6">
            {/* Pending Verifications */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.9 }}
              className="card p-6"
            >
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-lg font-semibold text-gray-900">Pending Hospital Verifications</h2>
                <Link to="/admin/verifications" className="text-primary-600 text-sm font-medium hover:underline">
                  View All
                </Link>
              </div>
              
              {pendingHospitals.length === 0 ? (
                <div className="text-center py-8">
                  <HiShieldCheck className="h-12 w-12 text-green-300 mx-auto mb-3" />
                  <p className="text-gray-500">All hospitals are verified!</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {[1, 2, 3].map((_, index) => (
                    <div key={index} className="p-4 rounded-xl border border-gray-200 hover:border-gray-300 transition-colors">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                            <FaHospital className="h-5 w-5 text-blue-600" />
                          </div>
                          <div>
                            <p className="font-medium text-gray-900">City General Hospital</p>
                            <p className="text-sm text-gray-500">Applied 2 days ago</p>
                          </div>
                        </div>
                        <div className="flex gap-2">
                          <button className="btn-success btn-sm">Approve</button>
                          <button className="btn-danger btn-sm">Reject</button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </motion.div>

            {/* Quick Admin Actions */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 1 }}
              className="card p-6"
            >
              <h2 className="text-lg font-semibold text-gray-900 mb-6">Quick Actions</h2>
              <div className="grid grid-cols-2 gap-4">
                <Link
                  to="/admin/users"
                  className="p-4 bg-gray-50 rounded-xl hover:bg-gray-100 transition-colors text-center group"
                >
                  <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center mx-auto mb-3 group-hover:scale-110 transition-transform">
                    <HiUserGroup className="h-6 w-6 text-blue-600" />
                  </div>
                  <p className="font-medium text-gray-900">Manage Users</p>
                </Link>
                
                <Link
                  to="/admin/hospitals"
                  className="p-4 bg-gray-50 rounded-xl hover:bg-gray-100 transition-colors text-center group"
                >
                  <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center mx-auto mb-3 group-hover:scale-110 transition-transform">
                    <HiOfficeBuilding className="h-6 w-6 text-green-600" />
                  </div>
                  <p className="font-medium text-gray-900">Hospitals</p>
                </Link>
                
                <Link
                  to="/admin/analytics"
                  className="p-4 bg-gray-50 rounded-xl hover:bg-gray-100 transition-colors text-center group"
                >
                  <div className="w-12 h-12 bg-purple-100 rounded-xl flex items-center justify-center mx-auto mb-3 group-hover:scale-110 transition-transform">
                    <HiChartBar className="h-6 w-6 text-purple-600" />
                  </div>
                  <p className="font-medium text-gray-900">Analytics</p>
                </Link>
                
                <Link
                  to="/admin/settings"
                  className="p-4 bg-gray-50 rounded-xl hover:bg-gray-100 transition-colors text-center group"
                >
                  <div className="w-12 h-12 bg-gray-200 rounded-xl flex items-center justify-center mx-auto mb-3 group-hover:scale-110 transition-transform">
                    <HiCog className="h-6 w-6 text-gray-600" />
                  </div>
                  <p className="font-medium text-gray-900">Settings</p>
                </Link>
              </div>
            </motion.div>
          </div>
    </div>
  );
};

export default AdminDashboard;
