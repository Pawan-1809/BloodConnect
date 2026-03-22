import React, { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import CountUp from 'react-countup';
import {
  HiPlus,
  HiClipboardList,
  HiTrendingUp,
  HiCalendar,
  HiExclamationCircle,
  HiArrowRight,
  HiRefresh
} from 'react-icons/hi';
import { FaDroplet, FaHospital, FaHeartPulse } from 'react-icons/fa6';
import { Bar, Line } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend
} from 'chart.js';
import { hospitalAPI, requestAPI } from '../../services/api';

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend
);

function normalizeMonthlySeries(rows = [], valueKey = 'count') {
  return rows.map((row) => ({
    label: `${String(row._id.month).padStart(2, '0')}/${row._id.year}`,
    value: row[valueKey] || 0
  }));
}

const HospitalDashboard = () => {
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    totalStock: 0,
    lowStock: 0,
    expiringSoon: 0,
    pendingRequests: 0,
    todaysDonations: 0,
    monthlyDonations: []
  });
  const [bloodStock, setBloodStock] = useState([]);
  const [recentRequests, setRecentRequests] = useState([]);
  const [recentDonations, setRecentDonations] = useState([]);
  const [requestTrend, setRequestTrend] = useState([]);

  const fetchDashboardData = async () => {
    setLoading(true);

    try {
      const [dashboardRes, stockRes, requestsRes, donationsRes, requestStatsRes] = await Promise.all([
        hospitalAPI.getDashboardStats().catch(() => ({ data: { stats: {} } })),
        hospitalAPI.getStock().catch(() => ({ data: { stocks: [], overview: {}, expiringSoon: [] } })),
        hospitalAPI.getRequests({ limit: 5 }).catch(() => ({ data: { requests: [] } })),
        hospitalAPI.getDonations({ limit: 5 }).catch(() => ({ data: { donations: [] } })),
        requestAPI.getStats().catch(() => ({ data: { stats: { monthlyTrend: [] } } }))
      ]);

      const dashboardStats = dashboardRes.data?.stats || {};
      const stockOverview = stockRes.data?.overview || {};

      setStats({
        totalStock: stockOverview.availableUnits || 0,
        lowStock: stockOverview.lowCount || 0,
        expiringSoon: (stockRes.data?.expiringSoon || []).reduce((sum, item) => sum + (item.count || 0), 0),
        pendingRequests: dashboardStats.pendingRequests || 0,
        todaysDonations: dashboardStats.todayDonations || 0,
        monthlyDonations: normalizeMonthlySeries(dashboardStats.monthlyDonations)
      });
      setBloodStock((stockRes.data?.stocks || []).map((item) => ({
        bloodGroup: item.bloodGroup,
        quantity: item.availableUnits,
        status: item.status
      })));
      setRecentRequests(requestsRes.data?.requests || []);
      setRecentDonations(donationsRes.data?.donations || []);
      setRequestTrend(normalizeMonthlySeries(requestStatsRes.data?.stats?.monthlyTrend));
    } catch (error) {
      console.error('Error fetching hospital dashboard:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const stockChartData = useMemo(() => ({
    labels: bloodStock.map((item) => item.bloodGroup),
    datasets: [
      {
        label: 'Units Available',
        data: bloodStock.map((item) => item.quantity),
        backgroundColor: bloodStock.map((item) =>
          item.status === 'critical' ? '#EF4444' : item.status === 'low' ? '#F59E0B' : '#10B981'
        ),
        borderRadius: 8
      }
    ]
  }), [bloodStock]);

  const trendChartData = useMemo(() => ({
    labels: stats.monthlyDonations.map((item) => item.label),
    datasets: [
      {
        label: 'Donations',
        data: stats.monthlyDonations.map((item) => item.value),
        borderColor: '#DC2626',
        backgroundColor: 'rgba(220, 38, 38, 0.1)',
        fill: true,
        tension: 0.35
      },
      {
        label: 'Requests',
        data: requestTrend.map((item) => item.value),
        borderColor: '#3B82F6',
        backgroundColor: 'rgba(59, 130, 246, 0.1)',
        fill: true,
        tension: 0.35
      }
    ]
  }), [requestTrend, stats.monthlyDonations]);

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
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="mb-8">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <h1 className="text-2xl md:text-3xl font-bold text-gray-900">Hospital Dashboard</h1>
            <p className="text-gray-600 mt-1">Inventory, requests, and donation stats from the live backend.</p>
          </div>

          <div className="flex items-center gap-3">
            <button onClick={fetchDashboardData} className="btn-secondary flex items-center gap-2" type="button">
              <HiRefresh className="h-5 w-5" />
              Refresh
            </button>
            <Link to="/hospital/stock" className="btn-primary flex items-center gap-2">
              <HiPlus className="h-5 w-5" />
              Add Stock
            </Link>
          </div>
        </div>
      </motion.div>

      {stats.lowStock > 0 ? (
        <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="mb-6 bg-red-50 border border-red-200 rounded-xl p-4 flex items-center gap-4">
          <div className="w-10 h-10 bg-red-100 rounded-full flex items-center justify-center animate-pulse">
            <HiExclamationCircle className="h-6 w-6 text-red-600" />
          </div>
          <div className="flex-1">
            <p className="font-medium text-red-800">Low Stock Alert</p>
            <p className="text-sm text-red-700">{stats.lowStock} blood type(s) are currently low.</p>
          </div>
          <Link to="/hospital/stock" className="btn-danger btn-sm">
            View Stock
          </Link>
        </motion.div>
      ) : null}

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-6 gap-4 mb-8">
        <div className="stat-card">
          <div className="w-10 h-10 bg-primary-100 rounded-xl flex items-center justify-center mb-3">
            <FaDroplet className="h-5 w-5 text-primary-600" />
          </div>
          <p className="text-2xl font-bold text-gray-900"><CountUp end={stats.totalStock} duration={1.4} /></p>
          <p className="text-sm text-gray-500">Total Units</p>
        </div>

        <div className="stat-card">
          <div className="w-10 h-10 bg-red-100 rounded-xl flex items-center justify-center mb-3">
            <HiExclamationCircle className="h-5 w-5 text-red-600" />
          </div>
          <p className="text-2xl font-bold text-red-600"><CountUp end={stats.lowStock} duration={1.4} /></p>
          <p className="text-sm text-gray-500">Low Stock</p>
        </div>

        <div className="stat-card">
          <div className="w-10 h-10 bg-yellow-100 rounded-xl flex items-center justify-center mb-3">
            <HiCalendar className="h-5 w-5 text-yellow-600" />
          </div>
          <p className="text-2xl font-bold text-yellow-600"><CountUp end={stats.expiringSoon} duration={1.4} /></p>
          <p className="text-sm text-gray-500">Expiring Soon</p>
        </div>

        <div className="stat-card">
          <div className="w-10 h-10 bg-blue-100 rounded-xl flex items-center justify-center mb-3">
            <HiClipboardList className="h-5 w-5 text-blue-600" />
          </div>
          <p className="text-2xl font-bold text-blue-600"><CountUp end={stats.pendingRequests} duration={1.4} /></p>
          <p className="text-sm text-gray-500">Requests</p>
        </div>

        <div className="stat-card">
          <div className="w-10 h-10 bg-green-100 rounded-xl flex items-center justify-center mb-3">
            <FaHeartPulse className="h-5 w-5 text-green-600" />
          </div>
          <p className="text-2xl font-bold text-green-600"><CountUp end={stats.todaysDonations} duration={1.4} /></p>
          <p className="text-sm text-gray-500">Today&apos;s Donations</p>
        </div>

        <div className="stat-card">
          <div className="w-10 h-10 bg-purple-100 rounded-xl flex items-center justify-center mb-3">
            <HiTrendingUp className="h-5 w-5 text-purple-600" />
          </div>
          <p className="text-2xl font-bold text-purple-600">
            <CountUp end={stats.monthlyDonations.reduce((sum, item) => sum + item.value, 0)} duration={1.4} />
          </p>
          <p className="text-sm text-gray-500">Recent Donations</p>
        </div>
      </div>

      <div className="grid lg:grid-cols-2 gap-6 mb-8">
        <div className="card p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-lg font-semibold text-gray-900">Blood Stock Levels</h2>
            <Link to="/hospital/stock" className="text-primary-600 text-sm font-medium hover:underline">
              Manage Stock
            </Link>
          </div>
          <div className="h-64">
            <Bar data={stockChartData} options={{ responsive: true, maintainAspectRatio: false, plugins: { legend: { display: false } }, scales: { y: { beginAtZero: true, ticks: { precision: 0 } } } }} />
          </div>
        </div>

        <div className="card p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-lg font-semibold text-gray-900">Monthly Trends</h2>
          </div>
          <div className="h-64">
            <Line data={trendChartData} options={{ responsive: true, maintainAspectRatio: false, plugins: { legend: { position: 'bottom' } }, scales: { y: { beginAtZero: true, ticks: { precision: 0 } } } }} />
          </div>
        </div>
      </div>

      <div className="card p-6 mb-8">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-lg font-semibold text-gray-900">Current Inventory</h2>
          <Link to="/hospital/stock" className="text-primary-600 text-sm font-medium hover:underline flex items-center gap-1">
            View Details <HiArrowRight className="h-4 w-4" />
          </Link>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-8 gap-4">
          {bloodStock.map((item) => (
            <div key={item.bloodGroup} className={`p-4 rounded-xl text-center border-2 ${item.status === 'critical' ? 'border-red-300 bg-red-50' : item.status === 'low' ? 'border-yellow-300 bg-yellow-50' : 'border-gray-200 bg-gray-50'}`}>
              <div className="blood-badge mx-auto mb-2">{item.bloodGroup}</div>
              <p className="text-2xl font-bold text-gray-900">{item.quantity}</p>
              <p className="text-xs text-gray-500">units</p>
              <span className={`inline-block mt-2 px-2 py-0.5 rounded-full text-xs font-medium ${getStockStatusColor(item.status)}`}>
                {item.status}
              </span>
            </div>
          ))}
        </div>
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        <div className="card p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-lg font-semibold text-gray-900">Recent Requests</h2>
            <Link to="/hospital/requests" className="text-primary-600 text-sm font-medium hover:underline">
              View All
            </Link>
          </div>

          {recentRequests.length === 0 ? (
            <div className="text-center py-8">
              <HiClipboardList className="h-12 w-12 text-gray-300 mx-auto mb-3" />
              <p className="text-gray-500">No requests yet.</p>
            </div>
          ) : (
            <div className="space-y-4">
              {recentRequests.map((request) => (
                <div key={request._id} className="p-4 rounded-xl border border-gray-200 hover:border-gray-300 transition-colors">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="blood-badge blood-badge-sm">{request.bloodGroup}</div>
                      <div>
                        <p className="font-medium text-gray-900">{request.unitsRequired} units needed</p>
                        <p className="text-sm text-gray-500">{request.patientInfo?.name || 'Patient'} • {request.urgency}</p>
                      </div>
                    </div>
                    <span className={`urgency-badge urgency-${request.urgency || 'normal'}`}>{request.urgency || 'normal'}</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="card p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-lg font-semibold text-gray-900">Recent Donations</h2>
            <Link to="/hospital/donations" className="text-primary-600 text-sm font-medium hover:underline">
              View All
            </Link>
          </div>

          {recentDonations.length === 0 ? (
            <div className="text-center py-8">
              <FaHeartPulse className="h-12 w-12 text-gray-300 mx-auto mb-3" />
              <p className="text-gray-500">No recent donations.</p>
            </div>
          ) : (
            <div className="space-y-4">
              {recentDonations.map((donation) => (
                <div key={donation._id} className="p-4 rounded-xl border border-gray-200 hover:border-gray-300 transition-colors">
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
                          {donation.bloodGroup} • {(donation.donationType || 'whole_blood').replace(/_/g, ' ')}
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-sm text-gray-500">{new Date(donation.donationDate || donation.createdAt).toLocaleDateString()}</p>
                      <span className="badge badge-success">{donation.status}</span>
                    </div>
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

export default HospitalDashboard;
