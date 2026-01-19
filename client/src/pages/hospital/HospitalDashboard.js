import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import CountUp from 'react-countup';
import {
  HiPlus,
  HiClipboardList,
  HiUserGroup,
  HiTrendingUp,
  HiTrendingDown,
  HiCalendar,
  HiLocationMarker,
  HiPhone,
  HiClock,
  HiExclamationCircle,
  HiCheckCircle,
  HiArrowRight,
  HiRefresh,
  HiBell
} from 'react-icons/hi';
import { FaDroplet, FaHospital, FaHeartPulse, FaKitMedical } from 'react-icons/fa6';
import { Bar, Line, Doughnut } from 'react-chartjs-2';
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
import { useSocket } from '../../context/SocketContext';
import { hospitalAPI, requestAPI } from '../../services/api';
import toast from 'react-hot-toast';

// Register ChartJS
ChartJS.register(
  CategoryScale, LinearScale, BarElement, PointElement, LineElement,
  Title, Tooltip, Legend, ArcElement
);

const HospitalDashboard = () => {
  const { user } = useAuth();
  const { isConnected, notifications } = useSocket();
  
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    totalStock: 0,
    lowStock: 0,
    expiringSoon: 0,
    pendingRequests: 0,
    todaysDonations: 0,
    monthlyDonations: 0
  });
  const [bloodStock, setBloodStock] = useState([]);
  const [recentRequests, setRecentRequests] = useState([]);
  const [recentDonations, setRecentDonations] = useState([]);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      
      const [dashboardRes, stockRes, requestsRes, donationsRes] = await Promise.all([
        hospitalAPI.getDashboardStats().catch(() => ({ data: {} })),
        hospitalAPI.getStock().catch(() => ({ data: { stock: [] } })),
        hospitalAPI.getRequests({ status: 'pending', limit: 5 }).catch(() => ({ data: { requests: [] } })),
        hospitalAPI.getDonations({ limit: 5 }).catch(() => ({ data: { donations: [] } }))
      ]);

      setStats(dashboardRes.data || {
        totalStock: 150,
        lowStock: 3,
        expiringSoon: 5,
        pendingRequests: 8,
        todaysDonations: 12,
        monthlyDonations: 87
      });

      setBloodStock(stockRes.data?.stock || getDefaultStock());
      setRecentRequests(requestsRes.data?.requests || []);
      setRecentDonations(donationsRes.data?.donations || []);
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  const getDefaultStock = () => [
    { bloodGroup: 'A+', quantity: 25, status: 'adequate' },
    { bloodGroup: 'A-', quantity: 8, status: 'low' },
    { bloodGroup: 'B+', quantity: 20, status: 'adequate' },
    { bloodGroup: 'B-', quantity: 5, status: 'critical' },
    { bloodGroup: 'AB+', quantity: 12, status: 'adequate' },
    { bloodGroup: 'AB-', quantity: 3, status: 'critical' },
    { bloodGroup: 'O+', quantity: 35, status: 'adequate' },
    { bloodGroup: 'O-', quantity: 10, status: 'adequate' }
  ];

  // Blood Stock Chart
  const stockChartData = {
    labels: bloodStock.map(item => item.bloodGroup),
    datasets: [
      {
        label: 'Units Available',
        data: bloodStock.map(item => item.quantity),
        backgroundColor: bloodStock.map(item => 
          item.status === 'critical' ? '#EF4444' :
          item.status === 'low' ? '#F59E0B' : '#10B981'
        ),
        borderRadius: 8
      }
    ]
  };

  const stockChartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        display: false
      }
    },
    scales: {
      y: {
        beginAtZero: true
      }
    }
  };

  // Donation Trends Chart
  const trendChartData = {
    labels: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
    datasets: [
      {
        label: 'Donations',
        data: [12, 19, 8, 15, 22, 18, 10],
        borderColor: '#DC2626',
        backgroundColor: 'rgba(220, 38, 38, 0.1)',
        fill: true,
        tension: 0.4
      },
      {
        label: 'Requests',
        data: [8, 12, 10, 14, 18, 15, 8],
        borderColor: '#3B82F6',
        backgroundColor: 'rgba(59, 130, 246, 0.1)',
        fill: true,
        tension: 0.4
      }
    ]
  };

  const trendChartOptions = {
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

  // Request Status Chart
  const requestStatusData = {
    labels: ['Pending', 'In Progress', 'Fulfilled', 'Cancelled'],
    datasets: [
      {
        data: [8, 5, 45, 2],
        backgroundColor: ['#F59E0B', '#3B82F6', '#10B981', '#EF4444'],
        borderWidth: 0
      }
    ]
  };

  const getStockStatusColor = (status) => {
    switch (status) {
      case 'critical': return 'text-red-600 bg-red-100';
      case 'low': return 'text-yellow-600 bg-yellow-100';
      default: return 'text-green-600 bg-green-100';
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <FaHospital className="h-12 w-12 text-primary-600 animate-pulse mx-auto mb-4" />
          <p className="text-gray-600">Loading dashboard...</p>
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
                  Hospital Dashboard 🏥
                </h1>
                <p className="text-gray-600 mt-1">
                  Manage blood inventory and requests efficiently
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
                  to="/hospital/stock/add"
                  className="btn-primary flex items-center gap-2"
                >
                  <HiPlus className="h-5 w-5" />
                  Add Stock
                </Link>
              </div>
            </div>
          </motion.div>

          {/* Alert Banner for Low Stock */}
          {stats.lowStock > 0 && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className="mb-6 bg-red-50 border border-red-200 rounded-xl p-4 flex items-center gap-4"
            >
              <div className="w-10 h-10 bg-red-100 rounded-full flex items-center justify-center animate-pulse">
                <HiExclamationCircle className="h-6 w-6 text-red-600" />
              </div>
              <div className="flex-1">
                <p className="font-medium text-red-800">Low Stock Alert</p>
                <p className="text-sm text-red-700">
                  {stats.lowStock} blood type(s) are running low. Consider restocking soon.
                </p>
              </div>
              <Link
                to="/hospital/stock"
                className="btn-danger btn-sm"
              >
                View Stock
              </Link>
            </motion.div>
          )}

          {/* Stats Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-6 gap-4 mb-8">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="stat-card col-span-1"
            >
              <div className="flex items-center justify-between mb-3">
                <div className="w-10 h-10 bg-primary-100 rounded-xl flex items-center justify-center">
                  <FaDroplet className="h-5 w-5 text-primary-600" />
                </div>
              </div>
              <p className="text-2xl font-bold text-gray-900">
                <CountUp end={stats.totalStock || 150} duration={2} />
              </p>
              <p className="text-sm text-gray-500">Total Units</p>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.15 }}
              className="stat-card col-span-1"
            >
              <div className="flex items-center justify-between mb-3">
                <div className="w-10 h-10 bg-red-100 rounded-xl flex items-center justify-center">
                  <HiExclamationCircle className="h-5 w-5 text-red-600" />
                </div>
              </div>
              <p className="text-2xl font-bold text-red-600">
                <CountUp end={stats.lowStock || 3} duration={2} />
              </p>
              <p className="text-sm text-gray-500">Low Stock</p>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="stat-card col-span-1"
            >
              <div className="flex items-center justify-between mb-3">
                <div className="w-10 h-10 bg-yellow-100 rounded-xl flex items-center justify-center">
                  <HiClock className="h-5 w-5 text-yellow-600" />
                </div>
              </div>
              <p className="text-2xl font-bold text-yellow-600">
                <CountUp end={stats.expiringSoon || 5} duration={2} />
              </p>
              <p className="text-sm text-gray-500">Expiring Soon</p>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.25 }}
              className="stat-card col-span-1"
            >
              <div className="flex items-center justify-between mb-3">
                <div className="w-10 h-10 bg-blue-100 rounded-xl flex items-center justify-center">
                  <HiClipboardList className="h-5 w-5 text-blue-600" />
                </div>
              </div>
              <p className="text-2xl font-bold text-blue-600">
                <CountUp end={stats.pendingRequests || 8} duration={2} />
              </p>
              <p className="text-sm text-gray-500">Pending Requests</p>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="stat-card col-span-1"
            >
              <div className="flex items-center justify-between mb-3">
                <div className="w-10 h-10 bg-green-100 rounded-xl flex items-center justify-center">
                  <FaHeartPulse className="h-5 w-5 text-green-600" />
                </div>
              </div>
              <p className="text-2xl font-bold text-green-600">
                <CountUp end={stats.todaysDonations || 12} duration={2} />
              </p>
              <p className="text-sm text-gray-500">Today's Donations</p>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.35 }}
              className="stat-card col-span-1"
            >
              <div className="flex items-center justify-between mb-3">
                <div className="w-10 h-10 bg-purple-100 rounded-xl flex items-center justify-center">
                  <HiTrendingUp className="h-5 w-5 text-purple-600" />
                </div>
              </div>
              <p className="text-2xl font-bold text-purple-600">
                <CountUp end={stats.monthlyDonations || 87} duration={2} />
              </p>
              <p className="text-sm text-gray-500">This Month</p>
            </motion.div>
          </div>

          <div className="grid lg:grid-cols-2 gap-6 mb-8">
            {/* Blood Stock Chart */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
              className="card p-6"
            >
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-lg font-semibold text-gray-900">Blood Stock Levels</h2>
                <Link to="/hospital/stock" className="text-primary-600 text-sm font-medium hover:underline">
                  Manage Stock
                </Link>
              </div>
              <div className="h-64">
                <Bar data={stockChartData} options={stockChartOptions} />
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
                <h2 className="text-lg font-semibold text-gray-900">Weekly Trends</h2>
                <select className="input input-sm w-auto">
                  <option>This Week</option>
                  <option>Last Week</option>
                  <option>This Month</option>
                </select>
              </div>
              <div className="h-64">
                <Line data={trendChartData} options={trendChartOptions} />
              </div>
            </motion.div>
          </div>

          {/* Blood Stock Grid */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6 }}
            className="card p-6 mb-8"
          >
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-lg font-semibold text-gray-900">Current Inventory</h2>
              <Link to="/hospital/stock" className="text-primary-600 text-sm font-medium hover:underline flex items-center gap-1">
                View Details <HiArrowRight className="h-4 w-4" />
              </Link>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-8 gap-4">
              {bloodStock.map((item, index) => (
                <motion.div
                  key={item.bloodGroup}
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: 0.05 * index }}
                  className={`p-4 rounded-xl text-center border-2 transition-all hover:shadow-md ${
                    item.status === 'critical' ? 'border-red-300 bg-red-50' :
                    item.status === 'low' ? 'border-yellow-300 bg-yellow-50' :
                    'border-gray-200 bg-gray-50'
                  }`}
                >
                  <div className="blood-badge mx-auto mb-2">{item.bloodGroup}</div>
                  <p className={`text-2xl font-bold ${
                    item.status === 'critical' ? 'text-red-600' :
                    item.status === 'low' ? 'text-yellow-600' : 'text-gray-900'
                  }`}>
                    {item.quantity}
                  </p>
                  <p className="text-xs text-gray-500">units</p>
                  <span className={`inline-block mt-2 px-2 py-0.5 rounded-full text-xs font-medium ${getStockStatusColor(item.status)}`}>
                    {item.status}
                  </span>
                </motion.div>
              ))}
            </div>
          </motion.div>

          <div className="grid lg:grid-cols-2 gap-6">
            {/* Recent Requests */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.7 }}
              className="card p-6"
            >
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-lg font-semibold text-gray-900">Pending Requests</h2>
                <Link to="/hospital/requests" className="text-primary-600 text-sm font-medium hover:underline">
                  View All
                </Link>
              </div>

              {recentRequests.length === 0 ? (
                <div className="text-center py-8">
                  <HiClipboardList className="h-12 w-12 text-gray-300 mx-auto mb-3" />
                  <p className="text-gray-500">No pending requests</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {recentRequests.map((request, index) => (
                    <div
                      key={request._id || index}
                      className="p-4 rounded-xl border border-gray-200 hover:border-gray-300 transition-colors"
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <div className="blood-badge blood-badge-sm">{request.bloodGroup}</div>
                          <div>
                            <p className="font-medium text-gray-900">
                              {request.unitsRequired} units needed
                            </p>
                            <p className="text-sm text-gray-500">
                              {request.patientName || 'Patient'} • {request.urgencyLevel}
                            </p>
                          </div>
                        </div>
                        <span className={`urgency-badge urgency-${request.urgencyLevel}`}>
                          {request.urgencyLevel}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </motion.div>

            {/* Recent Donations */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.8 }}
              className="card p-6"
            >
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-lg font-semibold text-gray-900">Recent Donations</h2>
                <Link to="/hospital/donations" className="text-primary-600 text-sm font-medium hover:underline">
                  View All
                </Link>
              </div>

              {recentDonations.length === 0 ? (
                <div className="text-center py-8">
                  <FaHeartPulse className="h-12 w-12 text-gray-300 mx-auto mb-3" />
                  <p className="text-gray-500">No recent donations</p>
                  <Link to="/hospital/donations/add" className="btn-primary btn-sm mt-3 inline-block">
                    Record Donation
                  </Link>
                </div>
              ) : (
                <div className="space-y-4">
                  {recentDonations.map((donation, index) => (
                    <div
                      key={donation._id || index}
                      className="p-4 rounded-xl border border-gray-200 hover:border-gray-300 transition-colors"
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 bg-primary-100 rounded-full flex items-center justify-center">
                            <FaHeartPulse className="h-5 w-5 text-primary-600" />
                          </div>
                          <div>
                            <p className="font-medium text-gray-900">
                              {donation.donor?.firstName} {donation.donor?.lastName}
                            </p>
                            <p className="text-sm text-gray-500">
                              {donation.bloodGroup} • {donation.quantity || 1} unit(s)
                            </p>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="text-sm text-gray-500">
                            {new Date(donation.createdAt).toLocaleDateString()}
                          </p>
                          <span className="badge badge-success">Completed</span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </motion.div>
          </div>

          {/* Quick Actions */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.9 }}
            className="mt-8 card p-6 bg-gradient-to-r from-primary-50 to-blue-50"
          >
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Quick Actions</h2>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <Link
                to="/hospital/stock/add"
                className="p-4 bg-white rounded-xl border border-gray-200 hover:border-primary-300 hover:shadow-md transition-all text-center group"
              >
                <div className="w-12 h-12 bg-primary-100 rounded-xl flex items-center justify-center mx-auto mb-3 group-hover:scale-110 transition-transform">
                  <HiPlus className="h-6 w-6 text-primary-600" />
                </div>
                <p className="font-medium text-gray-900">Add Stock</p>
              </Link>
              
              <Link
                to="/hospital/donations/add"
                className="p-4 bg-white rounded-xl border border-gray-200 hover:border-primary-300 hover:shadow-md transition-all text-center group"
              >
                <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center mx-auto mb-3 group-hover:scale-110 transition-transform">
                  <FaHeartPulse className="h-6 w-6 text-green-600" />
                </div>
                <p className="font-medium text-gray-900">Record Donation</p>
              </Link>
              
              <Link
                to="/hospital/blood-drives"
                className="p-4 bg-white rounded-xl border border-gray-200 hover:border-primary-300 hover:shadow-md transition-all text-center group"
              >
                <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center mx-auto mb-3 group-hover:scale-110 transition-transform">
                  <HiCalendar className="h-6 w-6 text-blue-600" />
                </div>
                <p className="font-medium text-gray-900">Schedule Drive</p>
              </Link>
              
              <Link
                to="/hospital/analytics"
                className="p-4 bg-white rounded-xl border border-gray-200 hover:border-primary-300 hover:shadow-md transition-all text-center group"
              >
                <div className="w-12 h-12 bg-purple-100 rounded-xl flex items-center justify-center mx-auto mb-3 group-hover:scale-110 transition-transform">
                  <HiTrendingUp className="h-6 w-6 text-purple-600" />
                </div>
                <p className="font-medium text-gray-900">View Analytics</p>
              </Link>
            </div>
          </motion.div>
    </div>
  );
};

export default HospitalDashboard;
