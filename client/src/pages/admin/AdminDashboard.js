import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { motion } from 'framer-motion';
import CountUp from 'react-countup';
import {
  HiUserGroup,
  HiRefresh
} from 'react-icons/hi';
import { FaDroplet, FaHospital, FaHeartPulse } from 'react-icons/fa6';
import { Line, Bar, Doughnut } from 'react-chartjs-2';
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
import { adminAPI } from '../../services/api';

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  ArcElement
);

function dailySeriesMap(rows = []) {
  const map = new Map(rows.map((row) => [row._id, row.count]));
  const items = [];

  for (let offset = 6; offset >= 0; offset -= 1) {
    const current = new Date();
    current.setDate(current.getDate() - offset);
    const key = current.toISOString().slice(0, 10);
    items.push({
      label: current.toLocaleDateString('en-US', { weekday: 'short' }),
      count: map.get(key) || 0
    });
  }

  return items;
}

function monthlySeries(rows = [], valueKey) {
  return rows.map((row) => ({
    label: `${String(row._id.month).padStart(2, '0')}/${row._id.year}`,
    value: row[valueKey] || 0
  }));
}

const DEFAULT_OVERVIEW = {
  totalUsers: 0,
  totalDonors: 0,
  totalHospitals: 0,
  totalRequests: 0,
  pendingRequests: 0,
  emergencyRequests: 0,
  totalDonations: 0,
  verificationsPending: 0
};

const AdminDashboard = () => {
  const [loading, setLoading] = useState(true);
  const [overview, setOverview] = useState(DEFAULT_OVERVIEW);
  const [dailyStats, setDailyStats] = useState({
    registrations: [],
    requests: [],
    donations: []
  });
  const [distributions, setDistributions] = useState({
    bloodGroups: [],
    requestStatus: []
  });
  const [monthlyTrends, setMonthlyTrends] = useState({
    requests: [],
    donations: []
  });
  const [topHospitals, setTopHospitals] = useState([]);
  const [recentUsers, setRecentUsers] = useState([]);
  const [pendingHospitals, setPendingHospitals] = useState([]);

  const fetchDashboardData = useCallback(async () => {
    setLoading(true);

    try {
      const [dashboardRes, usersRes, hospitalsRes] = await Promise.all([
        adminAPI.getDashboard().catch(() => ({ data: { dashboard: {} } })),
        adminAPI.getUsers({ limit: 5 }).catch(() => ({ data: { users: [] } })),
        adminAPI.getHospitals({ limit: 5, verified: false }).catch(() => ({ data: { hospitals: [] } }))
      ]);

      const dashboard = dashboardRes.data?.dashboard || {};

      setOverview(dashboard.overview || DEFAULT_OVERVIEW);
      setDailyStats({
        registrations: dailySeriesMap(dashboard.dailyStats?.registrations),
        requests: dailySeriesMap(dashboard.dailyStats?.requests),
        donations: dailySeriesMap(dashboard.dailyStats?.donations)
      });
      setDistributions({
        bloodGroups: dashboard.distributions?.bloodGroups || [],
        requestStatus: dashboard.distributions?.requestStatus || []
      });
      setMonthlyTrends({
        requests: monthlySeries(dashboard.monthlyTrends?.requests || [], 'requests'),
        donations: monthlySeries(dashboard.monthlyTrends?.donations || [], 'donations')
      });
      setTopHospitals(dashboard.topHospitals || []);
      setRecentUsers(usersRes.data?.users || []);
      setPendingHospitals(hospitalsRes.data?.hospitals || []);
    } catch (error) {
      console.error('Error fetching admin dashboard:', error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchDashboardData();
  }, [fetchDashboardData]);

  const userGrowthData = useMemo(() => ({
    labels: dailyStats.registrations.map((item) => item.label),
    datasets: [
      {
        label: 'Registrations',
        data: dailyStats.registrations.map((item) => item.count),
        borderColor: '#DC2626',
        backgroundColor: 'rgba(220, 38, 38, 0.1)',
        fill: true,
        tension: 0.35
      },
      {
        label: 'Requests',
        data: dailyStats.requests.map((item) => item.count),
        borderColor: '#3B82F6',
        backgroundColor: 'rgba(59, 130, 246, 0.1)',
        fill: true,
        tension: 0.35
      },
      {
        label: 'Donations',
        data: dailyStats.donations.map((item) => item.count),
        borderColor: '#10B981',
        backgroundColor: 'rgba(16, 185, 129, 0.1)',
        fill: true,
        tension: 0.35
      }
    ]
  }), [dailyStats]);

  const bloodTypeData = useMemo(() => ({
    labels: distributions.bloodGroups.map((item) => item._id),
    datasets: [
      {
        data: distributions.bloodGroups.map((item) => item.count),
        backgroundColor: [
          '#DC2626', '#EF4444', '#F87171', '#FCA5A5',
          '#10B981', '#34D399', '#6EE7B7', '#A7F3D0'
        ],
        borderWidth: 0
      }
    ]
  }), [distributions.bloodGroups]);

  const trendData = useMemo(() => ({
    labels: monthlyTrends.requests.map((item) => item.label),
    datasets: [
      {
        label: 'Requests',
        data: monthlyTrends.requests.map((item) => item.value),
        backgroundColor: '#3B82F6',
        borderRadius: 8
      },
      {
        label: 'Donations',
        data: monthlyTrends.donations.map((item) => item.value),
        backgroundColor: '#DC2626',
        borderRadius: 8
      }
    ]
  }), [monthlyTrends]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <p className="text-gray-600">Loading admin dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 lg:p-8">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="mb-8">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Admin Dashboard</h1>
            <p className="text-gray-600 mt-1">Platform overview backed by live admin analytics.</p>
          </div>
          <button onClick={fetchDashboardData} className="btn-secondary flex items-center gap-2" type="button">
            <HiRefresh className="h-5 w-5" />
            Refresh
          </button>
        </div>
      </motion.div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <div className="stat-card">
          <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center mb-4">
            <HiUserGroup className="h-6 w-6 text-blue-600" />
          </div>
          <p className="text-3xl font-bold text-gray-900"><CountUp end={overview.totalUsers} duration={1.4} /></p>
          <p className="text-gray-500">Total Users</p>
        </div>

        <div className="stat-card">
          <div className="w-12 h-12 bg-red-100 rounded-xl flex items-center justify-center mb-4">
            <FaDroplet className="h-6 w-6 text-red-600" />
          </div>
          <p className="text-3xl font-bold text-gray-900"><CountUp end={overview.totalDonors} duration={1.4} /></p>
          <p className="text-gray-500">Donors</p>
        </div>

        <div className="stat-card">
          <div className="w-12 h-12 bg-purple-100 rounded-xl flex items-center justify-center mb-4">
            <FaHospital className="h-6 w-6 text-purple-600" />
          </div>
          <p className="text-3xl font-bold text-gray-900"><CountUp end={overview.totalHospitals} duration={1.4} /></p>
          <p className="text-gray-500">Hospitals</p>
        </div>

        <div className="stat-card">
          <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center mb-4">
            <FaHeartPulse className="h-6 w-6 text-green-600" />
          </div>
          <p className="text-3xl font-bold text-gray-900"><CountUp end={overview.totalDonations} duration={1.4} /></p>
          <p className="text-gray-500">Completed Donations</p>
        </div>
      </div>

      <div className="grid lg:grid-cols-3 gap-6 mb-8">
        <div className="lg:col-span-2 card p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-6">Last 7 Days</h2>
          <div className="h-64">
            <Line data={userGrowthData} options={{ responsive: true, maintainAspectRatio: false, plugins: { legend: { position: 'bottom' } }, scales: { y: { beginAtZero: true, ticks: { precision: 0 } } } }} />
          </div>
        </div>

        <div className="card p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-6">Blood Group Distribution</h2>
          <div className="h-64">
            <Doughnut data={bloodTypeData} options={{ responsive: true, maintainAspectRatio: false, plugins: { legend: { position: 'bottom' } } }} />
          </div>
        </div>
      </div>

      <div className="grid lg:grid-cols-2 gap-6 mb-8">
        <div className="card p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-6">Monthly Requests vs Donations</h2>
          <div className="h-64">
            <Bar data={trendData} options={{ responsive: true, maintainAspectRatio: false, plugins: { legend: { position: 'bottom' } }, scales: { y: { beginAtZero: true, ticks: { precision: 0 } } } }} />
          </div>
        </div>

        <div className="card p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-6">Platform Health</h2>
          <div className="space-y-4">
            <div className="flex items-center justify-between p-4 rounded-xl bg-gray-50">
              <span className="text-gray-600">Total Requests</span>
              <span className="font-semibold text-gray-900">{overview.totalRequests}</span>
            </div>
            <div className="flex items-center justify-between p-4 rounded-xl bg-gray-50">
              <span className="text-gray-600">Pending Requests</span>
              <span className="font-semibold text-gray-900">{overview.pendingRequests}</span>
            </div>
            <div className="flex items-center justify-between p-4 rounded-xl bg-gray-50">
              <span className="text-gray-600">Emergency Requests</span>
              <span className="font-semibold text-gray-900">{overview.emergencyRequests}</span>
            </div>
            <div className="flex items-center justify-between p-4 rounded-xl bg-gray-50">
              <span className="text-gray-600">Pending Verifications</span>
              <span className="font-semibold text-gray-900">{overview.verificationsPending}</span>
            </div>
          </div>
        </div>
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        <div className="card p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-6">Recent Users</h2>
          <div className="space-y-3">
            {recentUsers.length === 0 ? (
              <p className="text-sm text-gray-500">No users found.</p>
            ) : recentUsers.map((user) => (
              <div key={user._id} className="p-3 rounded-lg bg-gray-50">
                <p className="font-medium text-gray-900">{user.firstName} {user.lastName}</p>
                <p className="text-sm text-gray-500">{user.email}</p>
              </div>
            ))}
          </div>
        </div>

        <div className="card p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-6">Pending Hospitals</h2>
          <div className="space-y-3">
            {pendingHospitals.length === 0 ? (
              <p className="text-sm text-gray-500">No pending hospitals.</p>
            ) : pendingHospitals.map((hospital) => (
              <div key={hospital._id} className="p-3 rounded-lg bg-gray-50">
                <p className="font-medium text-gray-900">{hospital.name}</p>
                <p className="text-sm text-gray-500">{hospital.address?.city || 'Unknown city'}</p>
              </div>
            ))}
          </div>
        </div>

        <div className="card p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-6">Top Hospitals</h2>
          <div className="space-y-3">
            {topHospitals.length === 0 ? (
              <p className="text-sm text-gray-500">No donation leaders yet.</p>
            ) : topHospitals.map((hospital) => (
              <div key={hospital._id || hospital.name} className="p-3 rounded-lg bg-gray-50">
                <p className="font-medium text-gray-900">{hospital.name}</p>
                <p className="text-sm text-gray-500">{hospital.count} completed donations</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
