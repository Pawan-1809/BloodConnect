import React, { useMemo, useState, useEffect, useCallback } from 'react';
import { motion } from 'framer-motion';
import { Line, Doughnut, Bar } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement
} from 'chart.js';
import { donationAPI } from '../../services/api';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement
);

const MOCK_DONATIONS = [
  {
    id: 1,
    date: '2024-06-20',
    hospital: 'City General Hospital',
    type: 'Whole Blood',
    units: 1,
    status: 'completed',
    certificate: true,
    recipient: 'Emergency Surgery Patient',
    points: 100
  },
  {
    id: 2,
    date: '2024-04-15',
    hospital: 'Red Cross Blood Bank',
    type: 'Platelets',
    units: 1,
    status: 'completed',
    certificate: true,
    recipient: 'Cancer Patient',
    points: 150
  },
  {
    id: 3,
    date: '2024-02-10',
    hospital: 'Memorial Medical Center',
    type: 'Whole Blood',
    units: 1,
    status: 'completed',
    certificate: true,
    recipient: 'Accident Victim',
    points: 100
  },
  {
    id: 4,
    date: '2023-12-05',
    hospital: 'St. John Hospital',
    type: 'Plasma',
    units: 1,
    status: 'completed',
    certificate: true,
    recipient: 'Burn Patient',
    points: 120
  },
  {
    id: 5,
    date: '2023-10-01',
    hospital: 'City General Hospital',
    type: 'Whole Blood',
    units: 1,
    status: 'completed',
    certificate: true,
    recipient: 'Child Patient',
    points: 100
  },
  {
    id: 6,
    date: '2023-07-20',
    hospital: 'Red Cross Blood Bank',
    type: 'Whole Blood',
    units: 1,
    status: 'completed',
    certificate: true,
    recipient: 'Surgery Patient',
    points: 100
  }
];

const DonorHistory = () => {
  const [timeRange, setTimeRange] = useState('all');
  const [donations, setDonations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedDonation, setSelectedDonation] = useState(null);

  const fetchDonations = useCallback(async () => {
    setLoading(true);
    try {
      const response = await donationAPI.getMyDonations({ timeRange });
      const data = response?.data?.data;
      setDonations(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error('Error fetching donations:', error);
      setDonations([]);
    } finally {
      setLoading(false);
    }
  }, [timeRange]);

  useEffect(() => {
    fetchDonations();
  }, [fetchDonations]);

  const displayDonations = useMemo(() => {
    return Array.isArray(donations) && donations.length > 0 ? donations : MOCK_DONATIONS;
  }, [donations]);

  const totalDonations = displayDonations.length;
  const livesImpacted = totalDonations * 3;
  const totalPoints = displayDonations.reduce((sum, d) => sum + (Number(d.points) || 0), 0);
  const certificates = displayDonations.reduce((sum, d) => sum + (d.certificate ? 1 : 0), 0);

  const stats = [
    { label: 'Total Donations', value: String(totalDonations), icon: '🩸', color: 'bg-red-500' },
    { label: 'Lives Impacted', value: String(livesImpacted), icon: '❤️', color: 'bg-pink-500' },
    { label: 'Total Points', value: String(totalPoints), icon: '⭐', color: 'bg-yellow-500' },
    { label: 'Certificates', value: String(certificates), icon: '📜', color: 'bg-blue-500' }
  ];

  const monthlyCounts = useMemo(() => {
    const counts = Array(12).fill(0);
    for (const d of displayDonations) {
      const dt = new Date(d.date);
      if (!Number.isNaN(dt.getTime())) {
        counts[dt.getMonth()] += 1;
      }
    }
    return counts;
  }, [displayDonations]);

  const donationChartData = {
    labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'],
    datasets: [
      {
        label: 'Donations',
        data: monthlyCounts,
        borderColor: '#DC2626',
        backgroundColor: 'rgba(220, 38, 38, 0.1)',
        tension: 0.4,
        fill: true
      }
    ]
  };

  const typeCounts = useMemo(() => {
    const types = ['Whole Blood', 'Platelets', 'Plasma', 'Red Cells'];
    const map = new Map(types.map(t => [t, 0]));
    for (const d of displayDonations) {
      const key = map.has(d.type) ? d.type : null;
      if (key) map.set(key, (map.get(key) || 0) + 1);
    }
    return types.map(t => map.get(t) || 0);
  }, [displayDonations]);

  const typeChartData = {
    labels: ['Whole Blood', 'Platelets', 'Plasma', 'Red Cells'],
    datasets: [
      {
        data: typeCounts,
        backgroundColor: ['#DC2626', '#F59E0B', '#10B981', '#3B82F6'],
        borderWidth: 0
      }
    ]
  };

  const impactChartData = {
    labels: ['Lives Saved', 'Donations', 'Certificates', 'Points'],
    datasets: [
      {
        label: 'Impact',
        data: [livesImpacted, totalDonations, certificates, totalPoints],
        backgroundColor: ['#DC2626', '#F59E0B', '#10B981', '#8B5CF6'],
        borderRadius: 8
      }
    ]
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'completed':
        return 'bg-green-100 text-green-700';
      case 'pending':
        return 'bg-yellow-100 text-yellow-700';
      case 'cancelled':
        return 'bg-red-100 text-red-700';
      default:
        return 'bg-gray-100 text-gray-700';
    }
  };

  return (
    <div className="p-6 lg:p-8">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex flex-col md:flex-row md:items-center md:justify-between mb-8"
      >
        <div>
          <h1 className="text-3xl font-bold text-gray-800">Donation History</h1>
          <p className="text-gray-600 mt-1">Track your contribution to saving lives</p>
        </div>
        <div className="flex items-center space-x-4 mt-4 md:mt-0">
          <select
            value={timeRange}
            onChange={(e) => setTimeRange(e.target.value)}
            className="input-field w-auto"
          >
            <option value="all">All Time</option>
            <option value="year">This Year</option>
            <option value="6months">Last 6 Months</option>
            <option value="month">This Month</option>
          </select>
          <button className="btn-primary flex items-center space-x-2" type="button">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
              />
            </svg>
            <span>Export Report</span>
          </button>
        </div>
      </motion.div>

      {/* Stats Cards */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8"
      >
        {stats.map((stat, index) => (
          <motion.div
            key={stat.label}
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.1 + index * 0.05 }}
            className="glass-card p-4 text-center"
          >
            <div
              className={`w-12 h-12 ${stat.color} rounded-xl flex items-center justify-center text-2xl mx-auto mb-3`}
            >
              {stat.icon}
            </div>
            <p className="text-2xl font-bold text-gray-800">{stat.value}</p>
            <p className="text-sm text-gray-500">{stat.label}</p>
          </motion.div>
        ))}
      </motion.div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="glass-card p-6 lg:col-span-2"
        >
          <h3 className="text-lg font-semibold text-gray-800 mb-4">Donation Timeline</h3>
          <Line
            data={donationChartData}
            options={{
              responsive: true,
              plugins: { legend: { display: false } },
              scales: { y: { beginAtZero: true } }
            }}
          />
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="glass-card p-6"
        >
          <h3 className="text-lg font-semibold text-gray-800 mb-4">Donation Types</h3>
          <div className="h-48">
            <Doughnut
              data={typeChartData}
              options={{
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                  legend: { position: 'bottom', labels: { padding: 20 } }
                },
                cutout: '60%'
              }}
            />
          </div>
        </motion.div>
      </div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
        className="glass-card p-6 mb-8"
      >
        <h3 className="text-lg font-semibold text-gray-800 mb-4">Your Impact</h3>
        <div className="h-64">
          <Bar
            data={impactChartData}
            options={{
              responsive: true,
              maintainAspectRatio: false,
              plugins: { legend: { display: false } },
              scales: { y: { beginAtZero: true } }
            }}
          />
        </div>
      </motion.div>

      {/* Donations Table */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5 }}
        className="glass-card overflow-hidden"
      >
        <div className="p-6 border-b border-gray-200">
          <h3 className="text-lg font-semibold text-gray-800">Donation Records</h3>
        </div>

        {loading ? (
          <div className="p-12 text-center">
            <div className="animate-spin w-8 h-8 border-4 border-primary-500 border-t-transparent rounded-full mx-auto" />
            <p className="text-gray-500 mt-4">Loading donations...</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-gray-600">Date</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-gray-600">Hospital</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-gray-600">Type</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-gray-600">Recipient</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-gray-600">Points</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-gray-600">Status</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-gray-600">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {displayDonations.map((donation, index) => (
                  <motion.tr
                    key={donation.id || index}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.03 }}
                    className="hover:bg-gray-50 transition-colors"
                  >
                    <td className="px-6 py-4">
                      <p className="font-medium text-gray-800">
                        {new Date(donation.date).toLocaleDateString('en-US', {
                          month: 'short',
                          day: 'numeric',
                          year: 'numeric'
                        })}
                      </p>
                    </td>
                    <td className="px-6 py-4">
                      <p className="font-medium text-gray-800">{donation.hospital}</p>
                    </td>
                    <td className="px-6 py-4">
                      <span className="px-3 py-1 bg-primary-100 text-primary-700 rounded-full text-sm font-medium">
                        {donation.type}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <p className="text-gray-600">{donation.recipient}</p>
                    </td>
                    <td className="px-6 py-4">
                      <span className="font-semibold text-gray-800">+{donation.points}</span>
                    </td>
                    <td className="px-6 py-4">
                      <span
                        className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(donation.status)}`}
                      >
                        {(donation.status || 'unknown').charAt(0).toUpperCase() +
                          (donation.status || 'unknown').slice(1)}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <button
                        onClick={() => setSelectedDonation(donation)}
                        className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                        title="View Details"
                        type="button"
                      >
                        <svg className="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                          />
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"
                          />
                        </svg>
                      </button>
                    </td>
                  </motion.tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </motion.div>

      {/* Donation Detail Modal */}
      {selectedDonation && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
          onClick={() => setSelectedDonation(null)}
        >
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.9, opacity: 0 }}
            className="bg-white rounded-2xl shadow-xl max-w-lg w-full overflow-hidden"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="bg-gradient-to-r from-primary-500 to-primary-600 px-6 py-4">
              <h3 className="text-xl font-semibold text-white">Donation Details</h3>
            </div>
            <div className="p-6 space-y-4">
              <div className="flex items-center justify-between p-4 bg-gray-50 rounded-xl">
                <div className="flex items-center space-x-3">
                  <div className="w-12 h-12 bg-primary-100 rounded-full flex items-center justify-center text-2xl">
                    🩸
                  </div>
                  <div>
                    <p className="font-semibold text-gray-800">{selectedDonation.type}</p>
                    <p className="text-sm text-gray-500">{selectedDonation.units} unit(s)</p>
                  </div>
                </div>
                <span
                  className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(
                    selectedDonation.status
                  )}`}
                >
                  {selectedDonation.status}
                </span>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-gray-500">Date</p>
                  <p className="font-medium text-gray-800">
                    {new Date(selectedDonation.date).toLocaleDateString('en-US', {
                      month: 'long',
                      day: 'numeric',
                      year: 'numeric'
                    })}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Points Earned</p>
                  <p className="font-medium text-gray-800">⭐ {selectedDonation.points}</p>
                </div>
                <div className="col-span-2">
                  <p className="text-sm text-gray-500">Hospital/Blood Bank</p>
                  <p className="font-medium text-gray-800">{selectedDonation.hospital}</p>
                </div>
                <div className="col-span-2">
                  <p className="text-sm text-gray-500">Recipient</p>
                  <p className="font-medium text-gray-800">{selectedDonation.recipient}</p>
                </div>
              </div>

              <div className="p-4 bg-green-50 rounded-xl border border-green-200">
                <p className="text-green-800">
                  <span className="font-semibold">Thank you!</span> Your donation helped save up to 3 lives.
                </p>
              </div>
            </div>
            <div className="px-6 py-4 bg-gray-50 flex justify-end">
              <button onClick={() => setSelectedDonation(null)} className="btn-primary" type="button">
                Close
              </button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </div>
  );
};

export default DonorHistory;
