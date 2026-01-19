import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import CountUp from 'react-countup';
import {
  HiPlus,
  HiClipboardList,
  HiSearch,
  HiClock,
  HiTrendingUp,
  HiCheckCircle,
  HiExclamationCircle,
  HiArrowRight,
  HiLocationMarker,
  HiPhone,
  HiCalendar
} from 'react-icons/hi';
import { FaDroplet, FaHospital, FaUserDoctor } from 'react-icons/fa6';
import { Bar, Doughnut } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement
} from 'chart.js';
import { useAuth } from '../../context/AuthContext';
import { useSocket } from '../../context/SocketContext';
import { requestAPI, hospitalAPI } from '../../services/api';
import toast from 'react-hot-toast';

// Register ChartJS
ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend, ArcElement);

const ReceiverDashboard = () => {
  const { user } = useAuth();
  const { isConnected, notifications } = useSocket();
  
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    totalRequests: 0,
    activeRequests: 0,
    fulfilledRequests: 0,
    pendingResponses: 0
  });
  const [myRequests, setMyRequests] = useState([]);
  const [nearbyHospitals, setNearbyHospitals] = useState([]);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      
      const [requestsRes, statsRes, hospitalsRes] = await Promise.all([
        requestAPI.getMyRequests({ limit: 5 }).catch(() => ({ data: { requests: [] } })),
        requestAPI.getStats().catch(() => ({ data: {} })),
        hospitalAPI.getNearby({ limit: 4 }).catch(() => ({ data: { hospitals: [] } }))
      ]);

      setMyRequests(requestsRes.data?.requests || []);
      setStats({
        totalRequests: statsRes.data?.totalRequests || 0,
        activeRequests: statsRes.data?.activeRequests || 0,
        fulfilledRequests: statsRes.data?.fulfilledRequests || 0,
        pendingResponses: statsRes.data?.pendingResponses || 0
      });
      setNearbyHospitals(hospitalsRes.data?.hospitals || []);
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  // Request status chart
  const statusChartData = {
    labels: ['Active', 'Fulfilled', 'Pending', 'Cancelled'],
    datasets: [
      {
        data: [
          stats.activeRequests,
          stats.fulfilledRequests,
          stats.pendingResponses,
          stats.totalRequests - stats.activeRequests - stats.fulfilledRequests - stats.pendingResponses
        ],
        backgroundColor: ['#3B82F6', '#10B981', '#F59E0B', '#EF4444'],
        borderWidth: 0
      }
    ]
  };

  const statusChartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    cutout: '70%',
    plugins: {
      legend: {
        position: 'bottom',
        labels: {
          usePointStyle: true,
          padding: 20
        }
      }
    }
  };

  // Monthly requests chart
  const monthlyChartData = {
    labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'],
    datasets: [
      {
        label: 'Requests',
        data: [2, 1, 3, 0, 2, 1],
        backgroundColor: '#DC2626',
        borderRadius: 8
      }
    ]
  };

  const monthlyChartOptions = {
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

  const getStatusColor = (status) => {
    switch (status) {
      case 'pending': return 'badge-warning';
      case 'active': return 'badge-info';
      case 'fulfilled': return 'badge-success';
      case 'cancelled': return 'badge-danger';
      default: return 'badge-gray';
    }
  };

  const getUrgencyIcon = (urgency) => {
    switch (urgency) {
      case 'critical': return <HiExclamationCircle className="h-5 w-5 text-red-600" />;
      case 'urgent': return <HiClock className="h-5 w-5 text-yellow-600" />;
      default: return <HiCheckCircle className="h-5 w-5 text-green-600" />;
    }
  };

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
          {/* Header */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-8"
          >
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
              <div>
                <h1 className="text-2xl md:text-3xl font-bold text-gray-900">
                  Hello, {user?.firstName}! 👋
                </h1>
                <p className="text-gray-600 mt-1">
                  Manage your blood requests and find donors
                </p>
              </div>
              
              <div className="flex items-center gap-3">
                <Link
                  to="/receiver/create-request"
                  className="btn-primary flex items-center gap-2"
                >
                  <HiPlus className="h-5 w-5" />
                  New Request
                </Link>
                <Link
                  to="/receiver/find-donors"
                  className="btn-secondary flex items-center gap-2"
                >
                  <HiSearch className="h-5 w-5" />
                  Find Donors
                </Link>
              </div>
            </div>
          </motion.div>

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
                  <HiClipboardList className="h-6 w-6 text-primary-600" />
                </div>
                <HiTrendingUp className="h-5 w-5 text-green-500" />
              </div>
              <p className="text-3xl font-bold text-gray-900">
                <CountUp end={stats.totalRequests} duration={2} />
              </p>
              <p className="text-gray-500">Total Requests</p>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="stat-card"
            >
              <div className="flex items-center justify-between mb-4">
                <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center">
                  <HiClock className="h-6 w-6 text-blue-600" />
                </div>
                <span className="badge badge-info">{stats.activeRequests} active</span>
              </div>
              <p className="text-3xl font-bold text-gray-900">
                <CountUp end={stats.activeRequests} duration={2} />
              </p>
              <p className="text-gray-500">Active Requests</p>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="stat-card"
            >
              <div className="flex items-center justify-between mb-4">
                <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center">
                  <HiCheckCircle className="h-6 w-6 text-green-600" />
                </div>
                <span className="text-green-600 text-sm font-medium">
                  {stats.totalRequests > 0 ? Math.round((stats.fulfilledRequests / stats.totalRequests) * 100) : 0}%
                </span>
              </div>
              <p className="text-3xl font-bold text-gray-900">
                <CountUp end={stats.fulfilledRequests} duration={2} />
              </p>
              <p className="text-gray-500">Fulfilled</p>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
              className="stat-card"
            >
              <div className="flex items-center justify-between mb-4">
                <div className="w-12 h-12 bg-yellow-100 rounded-xl flex items-center justify-center">
                  <FaUserDoctor className="h-6 w-6 text-yellow-600" />
                </div>
                {stats.pendingResponses > 0 && (
                  <span className="badge badge-warning animate-pulse">New!</span>
                )}
              </div>
              <p className="text-3xl font-bold text-gray-900">
                <CountUp end={stats.pendingResponses} duration={2} />
              </p>
              <p className="text-gray-500">Donor Responses</p>
            </motion.div>
          </div>

          <div className="grid lg:grid-cols-3 gap-6 mb-8">
            {/* Request Status Chart */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5 }}
              className="card p-6"
            >
              <h2 className="text-lg font-semibold text-gray-900 mb-6">Request Status</h2>
              <div className="h-64">
                <Doughnut data={statusChartData} options={statusChartOptions} />
              </div>
            </motion.div>

            {/* Monthly Requests Chart */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.6 }}
              className="lg:col-span-2 card p-6"
            >
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-lg font-semibold text-gray-900">Monthly Requests</h2>
                <select className="input input-sm w-auto">
                  <option>Last 6 months</option>
                  <option>Last year</option>
                </select>
              </div>
              <div className="h-64">
                <Bar data={monthlyChartData} options={monthlyChartOptions} />
              </div>
            </motion.div>
          </div>

          <div className="grid lg:grid-cols-2 gap-6">
            {/* My Requests */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.7 }}
              className="card p-6"
            >
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-lg font-semibold text-gray-900">My Recent Requests</h2>
                <Link to="/receiver/my-requests" className="text-primary-600 text-sm font-medium hover:underline">
                  View All
                </Link>
              </div>

              {myRequests.length === 0 ? (
                <div className="text-center py-8">
                  <HiClipboardList className="h-12 w-12 text-gray-300 mx-auto mb-3" />
                  <p className="text-gray-500">No requests yet</p>
                  <Link to="/receiver/create-request" className="btn-primary btn-sm mt-3 inline-flex items-center gap-2">
                    <HiPlus className="h-4 w-4" />
                    Create Request
                  </Link>
                </div>
              ) : (
                <div className="space-y-4">
                  {myRequests.map((request, index) => (
                    <motion.div
                      key={request._id}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 0.1 * index }}
                      className="p-4 rounded-xl border border-gray-200 hover:border-gray-300 transition-colors"
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <div className="blood-badge blood-badge-sm">{request.bloodGroup}</div>
                          <div>
                            <p className="font-medium text-gray-900">
                              {request.unitsRequired} units - {request.reason || 'Medical Need'}
                            </p>
                            <p className="text-sm text-gray-500 flex items-center gap-1">
                              <HiCalendar className="h-4 w-4" />
                              {new Date(request.createdAt).toLocaleDateString()}
                            </p>
                          </div>
                        </div>
                        <div className="flex items-center gap-3">
                          {getUrgencyIcon(request.urgencyLevel)}
                          <span className={`badge ${getStatusColor(request.status)}`}>
                            {request.status}
                          </span>
                        </div>
                      </div>
                      {request.matchedDonors?.length > 0 && (
                        <div className="mt-3 pt-3 border-t border-gray-100">
                          <p className="text-sm text-gray-600">
                            <span className="font-medium text-green-600">
                              {request.matchedDonors.length}
                            </span> donor(s) responded
                          </p>
                        </div>
                      )}
                      <Link
                        to={`/requests/${request._id}`}
                        className="mt-3 text-primary-600 text-sm font-medium flex items-center gap-1 hover:underline"
                      >
                        View Details
                        <HiArrowRight className="h-4 w-4" />
                      </Link>
                    </motion.div>
                  ))}
                </div>
              )}
            </motion.div>

            {/* Nearby Hospitals */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.8 }}
              className="card p-6"
            >
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-lg font-semibold text-gray-900">Nearby Blood Banks</h2>
                <Link to="/hospitals" className="text-primary-600 text-sm font-medium hover:underline">
                  View All
                </Link>
              </div>

              {nearbyHospitals.length === 0 ? (
                <div className="text-center py-8">
                  <FaHospital className="h-12 w-12 text-gray-300 mx-auto mb-3" />
                  <p className="text-gray-500">No hospitals found nearby</p>
                  <p className="text-sm text-gray-400 mt-1">Try expanding your search radius</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {nearbyHospitals.map((hospital, index) => (
                    <motion.div
                      key={hospital._id}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 0.1 * index }}
                      className="p-4 rounded-xl border border-gray-200 hover:border-gray-300 transition-colors"
                    >
                      <div className="flex items-start gap-4">
                        <div className="w-12 h-12 bg-primary-100 rounded-xl flex items-center justify-center flex-shrink-0">
                          <FaHospital className="h-6 w-6 text-primary-600" />
                        </div>
                        <div className="flex-1">
                          <p className="font-medium text-gray-900">{hospital.name}</p>
                          <p className="text-sm text-gray-500 flex items-center gap-1 mt-1">
                            <HiLocationMarker className="h-4 w-4" />
                            {hospital.address?.city}, {hospital.address?.state}
                          </p>
                          {hospital.distance && (
                            <p className="text-sm text-primary-600 mt-1">
                              {hospital.distance.toFixed(1)} km away
                            </p>
                          )}
                        </div>
                        <div className="flex flex-col items-end gap-2">
                          {hospital.phone && (
                            <a
                              href={`tel:${hospital.phone}`}
                              className="p-2 bg-green-100 text-green-600 rounded-lg hover:bg-green-200 transition-colors"
                            >
                              <HiPhone className="h-4 w-4" />
                            </a>
                          )}
                        </div>
                      </div>
                      {/* Blood Availability */}
                      {hospital.bloodStock && (
                        <div className="mt-3 pt-3 border-t border-gray-100">
                          <p className="text-xs text-gray-500 mb-2">Available Blood Types</p>
                          <div className="flex flex-wrap gap-1">
                            {Object.entries(hospital.bloodStock)
                              .filter(([_, count]) => count > 0)
                              .map(([type, count]) => (
                                <span key={type} className="px-2 py-1 bg-primary-50 text-primary-700 text-xs rounded-full font-medium">
                                  {type}: {count}
                                </span>
                              ))}
                          </div>
                        </div>
                      )}
                    </motion.div>
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
            className="mt-8 card p-6 bg-gradient-to-r from-primary-50 to-secondary-50"
          >
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Quick Actions</h2>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <Link
                to="/receiver/create-request"
                className="p-4 bg-white rounded-xl border border-gray-200 hover:border-primary-300 hover:shadow-md transition-all text-center group"
              >
                <div className="w-12 h-12 bg-primary-100 rounded-xl flex items-center justify-center mx-auto mb-3 group-hover:scale-110 transition-transform">
                  <HiPlus className="h-6 w-6 text-primary-600" />
                </div>
                <p className="font-medium text-gray-900">New Request</p>
              </Link>
              
              <Link
                to="/receiver/find-donors"
                className="p-4 bg-white rounded-xl border border-gray-200 hover:border-primary-300 hover:shadow-md transition-all text-center group"
              >
                <div className="w-12 h-12 bg-secondary-100 rounded-xl flex items-center justify-center mx-auto mb-3 group-hover:scale-110 transition-transform">
                  <HiSearch className="h-6 w-6 text-secondary-600" />
                </div>
                <p className="font-medium text-gray-900">Find Donors</p>
              </Link>
              
              <Link
                to="/hospitals"
                className="p-4 bg-white rounded-xl border border-gray-200 hover:border-primary-300 hover:shadow-md transition-all text-center group"
              >
                <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center mx-auto mb-3 group-hover:scale-110 transition-transform">
                  <FaHospital className="h-6 w-6 text-blue-600" />
                </div>
                <p className="font-medium text-gray-900">Blood Banks</p>
              </Link>
              
              <Link
                to="/receiver/my-requests"
                className="p-4 bg-white rounded-xl border border-gray-200 hover:border-primary-300 hover:shadow-md transition-all text-center group"
              >
                <div className="w-12 h-12 bg-purple-100 rounded-xl flex items-center justify-center mx-auto mb-3 group-hover:scale-110 transition-transform">
                  <HiClipboardList className="h-6 w-6 text-purple-600" />
                </div>
                <p className="font-medium text-gray-900">My Requests</p>
              </Link>
            </div>
          </motion.div>
    </div>
  );
};

export default ReceiverDashboard;
