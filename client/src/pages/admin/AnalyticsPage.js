import React, { useEffect, useMemo, useState } from 'react';
import { motion } from 'framer-motion';
import { Line, Bar, Doughnut } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  ArcElement,
  Title,
  Tooltip,
  Legend,
  Filler
} from 'chart.js';
import { adminAPI } from '../../services/api';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  ArcElement,
  Title,
  Tooltip,
  Legend,
  Filler
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

const AnalyticsPage = () => {
  const [timeRange, setTimeRange] = useState('30');
  const [loading, setLoading] = useState(true);
  const [overview, setOverview] = useState({
    totalDonations: 0,
    totalUsers: 0,
    totalRequests: 0,
    totalHospitals: 0
  });
  const [dailyStats, setDailyStats] = useState({
    registrations: [],
    requests: [],
    donations: []
  });
  const [dashboardGroups, setDashboardGroups] = useState([]);
  const [analytics, setAnalytics] = useState({
    fulfillmentByBloodGroup: [],
    avgResponseTime: 0,
    donorRetention: { totalDonors: 0, repeatDonors: 0 },
    cityDistribution: []
  });

  useEffect(() => {
    let isMounted = true;

    const fetchAnalytics = async () => {
      setLoading(true);
      try {
        const [dashboardRes, analyticsRes] = await Promise.all([
          adminAPI.getDashboard().catch(() => ({ data: { dashboard: {} } })),
          adminAPI.getAnalytics({ period: timeRange }).catch(() => ({ data: { analytics: {} } }))
        ]);

        if (!isMounted) {
          return;
        }

        const dashboard = dashboardRes.data?.dashboard || {};
        const overviewData = dashboard.overview || {};

        setOverview({
          totalDonations: overviewData.totalDonations || 0,
          totalUsers: overviewData.totalUsers || 0,
          totalRequests: overviewData.totalRequests || 0,
          totalHospitals: overviewData.totalHospitals || 0
        });
        setDailyStats({
          registrations: dailySeriesMap(dashboard.dailyStats?.registrations),
          requests: dailySeriesMap(dashboard.dailyStats?.requests),
          donations: dailySeriesMap(dashboard.dailyStats?.donations)
        });
        setDashboardGroups(dashboard.distributions?.bloodGroups || []);
        setAnalytics({
          fulfillmentByBloodGroup: analyticsRes.data?.analytics?.fulfillmentByBloodGroup || [],
          avgResponseTime: analyticsRes.data?.analytics?.avgResponseTime || 0,
          donorRetention: analyticsRes.data?.analytics?.donorRetention || { totalDonors: 0, repeatDonors: 0 },
          cityDistribution: analyticsRes.data?.analytics?.cityDistribution || []
        });
      } catch (error) {
        console.error('Error fetching analytics:', error);
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    };

    fetchAnalytics();

    return () => {
      isMounted = false;
    };
  }, [timeRange]);

  const stats = useMemo(() => [
    { label: 'Total Donations', value: overview.totalDonations, helper: 'Completed donations recorded' },
    { label: 'Active Users', value: overview.totalUsers, helper: 'All platform users' },
    { label: 'Total Requests', value: overview.totalRequests, helper: 'Requests created so far' },
    { label: 'Hospitals', value: overview.totalHospitals, helper: 'Registered hospitals' }
  ], [overview]);

  const donationsChartData = useMemo(() => ({
    labels: dailyStats.donations.map((item) => item.label),
    datasets: [
      {
        label: 'Donations',
        data: dailyStats.donations.map((item) => item.count),
        borderColor: '#EF4444',
        backgroundColor: 'rgba(239, 68, 68, 0.1)',
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
      }
    ]
  }), [dailyStats.donations, dailyStats.requests]);

  const bloodGroupData = useMemo(() => ({
    labels: dashboardGroups.map((item) => item._id),
    datasets: [
      {
        data: dashboardGroups.map((item) => item.count),
        backgroundColor: [
          '#EF4444', '#F87171', '#F97316', '#FB923C',
          '#8B5CF6', '#A78BFA', '#10B981', '#34D399'
        ]
      }
    ]
  }), [dashboardGroups]);

  const fulfillmentData = useMemo(() => ({
    labels: analytics.fulfillmentByBloodGroup.map((item) => item.bloodGroup),
    datasets: [
      {
        label: 'Fulfillment Rate',
        data: analytics.fulfillmentByBloodGroup.map((item) => item.fulfillmentRate || 0),
        backgroundColor: '#10B981',
        borderRadius: 8
      }
    ]
  }), [analytics.fulfillmentByBloodGroup]);

  if (loading) {
    return (
      <div className="p-6 lg:p-8">
        <div className="glass-card p-10 text-center">
          <p className="text-gray-500">Loading analytics...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 lg:p-8">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="mb-8">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-800">Platform Analytics</h1>
            <p className="text-gray-600 mt-1">Admin analytics powered by the live backend.</p>
          </div>
          <div className="mt-4 md:mt-0 flex space-x-2">
            {['7', '30', '90'].map((range) => (
              <button
                key={range}
                onClick={() => setTimeRange(range)}
                className={`px-4 py-2 rounded-xl font-medium transition-all ${
                  timeRange === range
                    ? 'bg-primary-500 text-white'
                    : 'bg-white text-gray-600 hover:bg-gray-100'
                }`}
                type="button"
              >
                {range}d
              </button>
            ))}
          </div>
        </div>
      </motion.div>

      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        {stats.map((stat) => (
          <div key={stat.label} className="glass-card p-4">
            <p className="text-2xl font-bold text-gray-800">{stat.value}</p>
            <p className="text-sm text-gray-500">{stat.label}</p>
            <p className="text-xs text-gray-400 mt-2">{stat.helper}</p>
          </div>
        ))}
      </motion.div>

      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6 mb-6">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="glass-card p-6">
          <h3 className="text-lg font-semibold text-gray-800 mb-4">Last 7 Days</h3>
          <div className="h-80">
            <Line data={donationsChartData} options={{ responsive: true, maintainAspectRatio: false, plugins: { legend: { position: 'bottom' } }, scales: { y: { beginAtZero: true, ticks: { precision: 0 } } } }} />
          </div>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }} className="glass-card p-6">
          <h3 className="text-lg font-semibold text-gray-800 mb-4">Blood Group Distribution</h3>
          <div className="h-80">
            <Doughnut data={bloodGroupData} options={{ responsive: true, maintainAspectRatio: false, plugins: { legend: { position: 'right' } } }} />
          </div>
        </motion.div>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }} className="glass-card p-6">
          <h3 className="text-lg font-semibold text-gray-800 mb-4">Fulfillment by Blood Group</h3>
          <div className="h-80">
            <Bar data={fulfillmentData} options={{ responsive: true, maintainAspectRatio: false, plugins: { legend: { display: false } }, scales: { y: { beginAtZero: true, max: 100 } } }} />
          </div>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.5 }} className="glass-card p-6">
          <h3 className="text-lg font-semibold text-gray-800 mb-4">Additional Insights</h3>
          <div className="space-y-4">
            <div className="p-4 rounded-xl bg-gray-50">
              <p className="text-sm text-gray-500">Average Response Time</p>
              <p className="text-2xl font-bold text-gray-800">{analytics.avgResponseTime.toFixed(1)} hrs</p>
            </div>
            <div className="p-4 rounded-xl bg-gray-50">
              <p className="text-sm text-gray-500">Repeat Donors</p>
              <p className="text-2xl font-bold text-gray-800">{analytics.donorRetention.repeatDonors}</p>
              <p className="text-xs text-gray-400 mt-1">Out of {analytics.donorRetention.totalDonors} donors with recorded donations</p>
            </div>
            <div className="p-4 rounded-xl bg-gray-50">
              <p className="text-sm text-gray-500 mb-2">Top Cities</p>
              <div className="space-y-2">
                {analytics.cityDistribution.length === 0 ? (
                  <p className="text-sm text-gray-500">No city distribution data available.</p>
                ) : analytics.cityDistribution.map((city) => (
                  <div key={city._id} className="flex items-center justify-between text-sm">
                    <span className="text-gray-700">{city._id || 'Unknown city'}</span>
                    <span className="font-medium text-gray-900">{city.count}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default AnalyticsPage;
