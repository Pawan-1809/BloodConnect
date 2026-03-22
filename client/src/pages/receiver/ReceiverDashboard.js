import React, { useEffect, useMemo, useState } from 'react';
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
import { requestAPI, hospitalAPI } from '../../services/api';

ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend, ArcElement);

function buildStatusMap(items = []) {
  return items.reduce((accumulator, item) => {
    accumulator[item._id] = item.count;
    return accumulator;
  }, {});
}

function normalizeMonthlyTrend(rows = [], countKey = 'count') {
  const lookup = new Map(rows.map((row) => [`${row._id.year}-${row._id.month}`, row[countKey] || 0]));
  const series = [];

  for (let offset = 5; offset >= 0; offset -= 1) {
    const current = new Date(new Date().getFullYear(), new Date().getMonth() - offset, 1);
    const key = `${current.getFullYear()}-${current.getMonth() + 1}`;
    series.push({
      label: current.toLocaleDateString('en-US', { month: 'short' }),
      count: lookup.get(key) || 0
    });
  }

  return series;
}

const ReceiverDashboard = () => {
  const { user } = useAuth();

  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    totalRequests: 0,
    activeRequests: 0,
    fulfilledRequests: 0,
    pendingResponses: 0,
    monthlyTrend: []
  });
  const [myRequests, setMyRequests] = useState([]);
  const [nearbyHospitals, setNearbyHospitals] = useState([]);

  useEffect(() => {
    let isMounted = true;

    const fetchDashboardData = async () => {
      setLoading(true);

      try {
        const [requestsRes, statsRes, hospitalsRes] = await Promise.all([
          requestAPI.getMyRequests({ limit: 50 }).catch(() => ({ data: { requests: [] } })),
          requestAPI.getStats().catch(() => ({ data: { stats: {} } })),
          hospitalAPI.getAll({ limit: 4, verified: true }).catch(() => ({ data: { hospitals: [] } }))
        ]);

        if (!isMounted) {
          return;
        }

        const requests = requestsRes.data?.requests || [];
        const requestStats = statsRes.data?.stats || {};
        const byStatus = buildStatusMap(requestStats.byStatus);

        setMyRequests(requests);
        setStats({
          totalRequests: requests.length,
          activeRequests:
            (byStatus.pending || 0) +
            (byStatus.approved || 0) +
            (byStatus.in_progress || 0) +
            (byStatus.partially_fulfilled || 0),
          fulfilledRequests: byStatus.fulfilled || 0,
          pendingResponses: requests.reduce(
            (sum, request) => sum + (request.responseCount || request.matchedDonors?.length || 0),
            0
          ),
          monthlyTrend: normalizeMonthlyTrend(requestStats.monthlyTrend)
        });
        setNearbyHospitals(hospitalsRes.data?.hospitals || []);
      } catch (error) {
        console.error('Error fetching receiver dashboard:', error);
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    };

    fetchDashboardData();

    return () => {
      isMounted = false;
    };
  }, []);

  const statusChartData = useMemo(() => ({
    labels: ['Active', 'Fulfilled', 'Pending Responses'],
    datasets: [
      {
        data: [stats.activeRequests, stats.fulfilledRequests, stats.pendingResponses],
        backgroundColor: ['#3B82F6', '#10B981', '#F59E0B'],
        borderWidth: 0
      }
    ]
  }), [stats.activeRequests, stats.fulfilledRequests, stats.pendingResponses]);

  const monthlyChartData = useMemo(() => ({
    labels: stats.monthlyTrend.map((item) => item.label),
    datasets: [
      {
        label: 'Requests',
        data: stats.monthlyTrend.map((item) => item.count),
        backgroundColor: '#DC2626',
        borderRadius: 8
      }
    ]
  }), [stats.monthlyTrend]);

  const getStatusColor = (status) => {
    switch (status) {
      case 'pending': return 'badge-warning';
      case 'approved':
      case 'in_progress':
      case 'partially_fulfilled': return 'badge-info';
      case 'fulfilled': return 'badge-success';
      case 'cancelled':
      case 'expired': return 'badge-danger';
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
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="mb-8">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <h1 className="text-2xl md:text-3xl font-bold text-gray-900">Hello, {user?.firstName || 'Receiver'}</h1>
            <p className="text-gray-600 mt-1">Your request stats now reflect the live backend data.</p>
          </div>

          <div className="flex items-center gap-3">
            <Link to="/receiver/create-request" className="btn-primary flex items-center gap-2">
              <HiPlus className="h-5 w-5" />
              New Request
            </Link>
            <Link to="/receiver/find-donors" className="btn-secondary flex items-center gap-2">
              <HiSearch className="h-5 w-5" />
              Find Donors
            </Link>
          </div>
        </div>
      </motion.div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <div className="stat-card">
          <div className="flex items-center justify-between mb-4">
            <div className="w-12 h-12 bg-primary-100 rounded-xl flex items-center justify-center">
              <HiClipboardList className="h-6 w-6 text-primary-600" />
            </div>
            <HiTrendingUp className="h-5 w-5 text-green-500" />
          </div>
          <p className="text-3xl font-bold text-gray-900"><CountUp end={stats.totalRequests} duration={1.4} /></p>
          <p className="text-gray-500">Total Requests</p>
        </div>

        <div className="stat-card">
          <div className="flex items-center justify-between mb-4">
            <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center">
              <HiClock className="h-6 w-6 text-blue-600" />
            </div>
            <span className="badge badge-info">{stats.activeRequests} active</span>
          </div>
          <p className="text-3xl font-bold text-gray-900"><CountUp end={stats.activeRequests} duration={1.4} /></p>
          <p className="text-gray-500">Open Requests</p>
        </div>

        <div className="stat-card">
          <div className="flex items-center justify-between mb-4">
            <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center">
              <HiCheckCircle className="h-6 w-6 text-green-600" />
            </div>
            <span className="text-green-600 text-sm font-medium">
              {stats.totalRequests > 0 ? Math.round((stats.fulfilledRequests / stats.totalRequests) * 100) : 0}%
            </span>
          </div>
          <p className="text-3xl font-bold text-gray-900"><CountUp end={stats.fulfilledRequests} duration={1.4} /></p>
          <p className="text-gray-500">Fulfilled</p>
        </div>

        <div className="stat-card">
          <div className="flex items-center justify-between mb-4">
            <div className="w-12 h-12 bg-yellow-100 rounded-xl flex items-center justify-center">
              <FaUserDoctor className="h-6 w-6 text-yellow-600" />
            </div>
          </div>
          <p className="text-3xl font-bold text-gray-900"><CountUp end={stats.pendingResponses} duration={1.4} /></p>
          <p className="text-gray-500">Donor Responses</p>
        </div>
      </div>

      <div className="grid lg:grid-cols-3 gap-6 mb-8">
        <div className="card p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-6">Request Status</h2>
          <div className="h-64">
            <Doughnut data={statusChartData} options={{ responsive: true, maintainAspectRatio: false, cutout: '70%', plugins: { legend: { position: 'bottom', labels: { usePointStyle: true, padding: 20 } } } }} />
          </div>
        </div>

        <div className="lg:col-span-2 card p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-6">Monthly Requests</h2>
          <div className="h-64">
            <Bar data={monthlyChartData} options={{ responsive: true, maintainAspectRatio: false, plugins: { legend: { display: false } }, scales: { y: { beginAtZero: true, ticks: { precision: 0, stepSize: 1 } } } }} />
          </div>
        </div>
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        <div className="card p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-lg font-semibold text-gray-900">My Recent Requests</h2>
            <Link to="/receiver/my-requests" className="text-primary-600 text-sm font-medium hover:underline">
              View All
            </Link>
          </div>

          {myRequests.length === 0 ? (
            <div className="text-center py-8">
              <HiClipboardList className="h-12 w-12 text-gray-300 mx-auto mb-3" />
              <p className="text-gray-500">No requests yet.</p>
            </div>
          ) : (
            <div className="space-y-4">
              {myRequests.slice(0, 5).map((request) => (
                <div key={request._id} className="p-4 rounded-xl border border-gray-200 hover:border-gray-300 transition-colors">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="blood-badge blood-badge-sm">{request.bloodGroup}</div>
                      <div>
                        <p className="font-medium text-gray-900">
                          {request.unitsRequired} units - {request.patientInfo?.condition || 'Medical need'}
                        </p>
                        <p className="text-sm text-gray-500 flex items-center gap-1">
                          <HiCalendar className="h-4 w-4" />
                          {new Date(request.createdAt).toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      {getUrgencyIcon(request.urgency)}
                      <span className={`badge ${getStatusColor(request.status)}`}>{request.status}</span>
                    </div>
                  </div>
                  <Link to={`/requests/${request._id}`} className="mt-3 text-primary-600 text-sm font-medium flex items-center gap-1 hover:underline">
                    View Details
                    <HiArrowRight className="h-4 w-4" />
                  </Link>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="card p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-lg font-semibold text-gray-900">Nearby Blood Banks</h2>
            <Link to="/hospitals" className="text-primary-600 text-sm font-medium hover:underline">
              View All
            </Link>
          </div>

          {nearbyHospitals.length === 0 ? (
            <div className="text-center py-8">
              <FaHospital className="h-12 w-12 text-gray-300 mx-auto mb-3" />
              <p className="text-gray-500">No hospitals found.</p>
            </div>
          ) : (
            <div className="space-y-4">
              {nearbyHospitals.map((hospital) => (
                <div key={hospital._id} className="p-4 rounded-xl border border-gray-200 hover:border-gray-300 transition-colors">
                  <div className="flex items-start gap-4">
                    <div className="w-12 h-12 bg-primary-100 rounded-xl flex items-center justify-center flex-shrink-0">
                      <FaHospital className="h-6 w-6 text-primary-600" />
                    </div>
                    <div className="flex-1">
                      <p className="font-medium text-gray-900">{hospital.name}</p>
                      <p className="text-sm text-gray-500 flex items-center gap-1 mt-1">
                        <HiLocationMarker className="h-4 w-4" />
                        {hospital.address?.city || 'City'}, {hospital.address?.state || 'State'}
                      </p>
                    </div>
                    {hospital.phone ? (
                      <a href={`tel:${hospital.phone}`} className="p-2 bg-green-100 text-green-600 rounded-lg hover:bg-green-200 transition-colors">
                        <HiPhone className="h-4 w-4" />
                      </a>
                    ) : null}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ReceiverDashboard;
