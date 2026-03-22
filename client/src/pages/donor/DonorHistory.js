import React, { useEffect, useMemo, useState } from 'react';
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
import { donorAPI } from '../../services/api';

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

const DONATION_TYPE_LABELS = {
  whole_blood: 'Whole Blood',
  platelets: 'Platelets',
  plasma: 'Plasma',
  double_red_cells: 'Double Red Cells'
};

const STATUS_COLORS = {
  completed: 'bg-green-100 text-green-700',
  scheduled: 'bg-blue-100 text-blue-700',
  cancelled: 'bg-red-100 text-red-700',
  deferred: 'bg-yellow-100 text-yellow-700',
  no_show: 'bg-gray-100 text-gray-700'
};

function getRangeStart(timeRange) {
  const now = new Date();

  if (timeRange === 'month') {
    return new Date(now.getFullYear(), now.getMonth(), 1);
  }

  if (timeRange === '6months') {
    return new Date(now.getFullYear(), now.getMonth() - 5, 1);
  }

  if (timeRange === 'year') {
    return new Date(now.getFullYear(), 0, 1);
  }

  return null;
}

function normalizeDonation(donation) {
  return {
    id: donation._id,
    date: donation.donationDate || donation.createdAt,
    hospital: donation.hospital?.name || 'Hospital',
    type: DONATION_TYPE_LABELS[donation.donationType] || donation.donationType || 'Donation',
    status: donation.status || 'scheduled',
    points: donation.pointsAwarded || 0,
    certificate: Boolean(donation.certificateGenerated),
    bloodGroup: donation.bloodGroup,
    notes: donation.notes || ''
  };
}

const DonorHistory = () => {
  const [timeRange, setTimeRange] = useState('all');
  const [donations, setDonations] = useState([]);
  const [summary, setSummary] = useState({
    totalDonations: 0,
    totalLivesSaved: 0,
    totalPoints: 0
  });
  const [loading, setLoading] = useState(true);
  const [selectedDonation, setSelectedDonation] = useState(null);

  useEffect(() => {
    let isMounted = true;

    const fetchDonations = async () => {
      setLoading(true);
      try {
        const response = await donorAPI.getDonationHistory({ limit: 100 });

        if (!isMounted) {
          return;
        }

        const rawDonations = response.data?.donations || [];

        setDonations(rawDonations.map(normalizeDonation));
        setSummary({
          totalDonations: response.data?.totalDonations || 0,
          totalLivesSaved: response.data?.totalLivesSaved || 0,
          totalPoints: response.data?.totalPoints || 0
        });
      } catch (error) {
        console.error('Error fetching donor history:', error);
        if (isMounted) {
          setDonations([]);
          setSummary({ totalDonations: 0, totalLivesSaved: 0, totalPoints: 0 });
        }
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    };

    fetchDonations();

    return () => {
      isMounted = false;
    };
  }, []);

  const filteredDonations = useMemo(() => {
    const rangeStart = getRangeStart(timeRange);

    if (!rangeStart) {
      return donations;
    }

    return donations.filter((donation) => new Date(donation.date) >= rangeStart);
  }, [donations, timeRange]);

  const stats = useMemo(() => {
    const completedDonations = filteredDonations.filter((donation) => donation.status === 'completed');
    const totalPoints = filteredDonations.reduce((sum, donation) => sum + (donation.points || 0), 0);
    const certificates = filteredDonations.filter((donation) => donation.certificate).length;

    return [
      { label: 'Completed Donations', value: String(completedDonations.length), color: 'bg-red-500' },
      { label: 'Lives Impacted', value: String(completedDonations.length * 3), color: 'bg-pink-500' },
      { label: 'Total Points', value: String(totalPoints), color: 'bg-yellow-500' },
      { label: 'Certificates', value: String(certificates), color: 'bg-blue-500' }
    ];
  }, [filteredDonations]);

  const donationChartData = useMemo(() => {
    const counts = Array(12).fill(0);

    filteredDonations.forEach((donation) => {
      const date = new Date(donation.date);
      if (!Number.isNaN(date.getTime())) {
        counts[date.getMonth()] += 1;
      }
    });

    return {
      labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'],
      datasets: [
        {
          label: 'Donations',
          data: counts,
          borderColor: '#DC2626',
          backgroundColor: 'rgba(220, 38, 38, 0.1)',
          tension: 0.35,
          fill: true
        }
      ]
    };
  }, [filteredDonations]);

  const typeChartData = useMemo(() => {
    const types = ['Whole Blood', 'Platelets', 'Plasma', 'Double Red Cells'];
    const counts = types.map((type) => filteredDonations.filter((donation) => donation.type === type).length);

    return {
      labels: types,
      datasets: [
        {
          data: counts,
          backgroundColor: ['#DC2626', '#F59E0B', '#10B981', '#3B82F6'],
          borderWidth: 0
        }
      ]
    };
  }, [filteredDonations]);

  const impactChartData = useMemo(() => ({
    labels: ['Completed', 'Lives Impacted', 'Certificates', 'Points'],
    datasets: [
      {
        label: 'Impact',
        data: [
          filteredDonations.filter((donation) => donation.status === 'completed').length,
          filteredDonations.filter((donation) => donation.status === 'completed').length * 3,
          filteredDonations.filter((donation) => donation.certificate).length,
          filteredDonations.reduce((sum, donation) => sum + (donation.points || 0), 0)
        ],
        backgroundColor: ['#DC2626', '#F59E0B', '#10B981', '#8B5CF6'],
        borderRadius: 8
      }
    ]
  }), [filteredDonations]);

  return (
    <div className="p-6 lg:p-8">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="flex flex-col md:flex-row md:items-center md:justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-800">Donation History</h1>
          <p className="text-gray-600 mt-1">Every row and chart here comes from your real donation history.</p>
        </div>
        <select value={timeRange} onChange={(event) => setTimeRange(event.target.value)} className="input-field w-auto mt-4 md:mt-0">
          <option value="all">All Time</option>
          <option value="year">This Year</option>
          <option value="6months">Last 6 Months</option>
          <option value="month">This Month</option>
        </select>
      </motion.div>

      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        {stats.map((stat) => (
          <div key={stat.label} className="glass-card p-4 text-center">
            <div className={`w-12 h-12 ${stat.color} rounded-xl mx-auto mb-3`} />
            <p className="text-2xl font-bold text-gray-800">{stat.value}</p>
            <p className="text-sm text-gray-500">{stat.label}</p>
          </div>
        ))}
      </motion.div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="glass-card p-6 lg:col-span-2">
          <h3 className="text-lg font-semibold text-gray-800 mb-4">Donation Timeline</h3>
          <Line data={donationChartData} options={{ responsive: true, plugins: { legend: { display: false } }, scales: { y: { beginAtZero: true, ticks: { precision: 0 } } } }} />
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }} className="glass-card p-6">
          <h3 className="text-lg font-semibold text-gray-800 mb-4">Donation Types</h3>
          <div className="h-48">
            <Doughnut data={typeChartData} options={{ responsive: true, maintainAspectRatio: false, plugins: { legend: { position: 'bottom', labels: { padding: 20 } } }, cutout: '60%' }} />
          </div>
        </motion.div>
      </div>

      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }} className="glass-card p-6 mb-8">
        <h3 className="text-lg font-semibold text-gray-800">Lifetime Summary</h3>
        <p className="text-sm text-gray-500 mt-1">
          Completed donations: {summary.totalDonations}, lives impacted: {summary.totalLivesSaved}, points earned: {summary.totalPoints}
        </p>
        <div className="h-64 mt-4">
          <Bar data={impactChartData} options={{ responsive: true, maintainAspectRatio: false, plugins: { legend: { display: false } }, scales: { y: { beginAtZero: true, ticks: { precision: 0 } } } }} />
        </div>
      </motion.div>

      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.5 }} className="glass-card overflow-hidden">
        <div className="p-6 border-b border-gray-200">
          <h3 className="text-lg font-semibold text-gray-800">Donation Records</h3>
        </div>

        {loading ? (
          <div className="p-12 text-center">
            <div className="animate-spin w-8 h-8 border-4 border-primary-500 border-t-transparent rounded-full mx-auto" />
            <p className="text-gray-500 mt-4">Loading donations...</p>
          </div>
        ) : filteredDonations.length === 0 ? (
          <div className="p-12 text-center">
            <p className="text-gray-500">No donation records found for the selected range.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-gray-600">Date</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-gray-600">Hospital</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-gray-600">Type</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-gray-600">Points</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-gray-600">Status</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-gray-600">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {filteredDonations.map((donation) => (
                  <tr key={donation.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-4">
                      <p className="font-medium text-gray-800">
                        {new Date(donation.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
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
                      <span className="font-semibold text-gray-800">+{donation.points}</span>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`px-3 py-1 rounded-full text-xs font-medium ${STATUS_COLORS[donation.status] || 'bg-gray-100 text-gray-700'}`}>
                        {donation.status.replace(/_/g, ' ')}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <button onClick={() => setSelectedDonation(donation)} className="p-2 hover:bg-gray-100 rounded-lg transition-colors" type="button">
                        View
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </motion.div>

      {selectedDonation && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4" onClick={() => setSelectedDonation(null)}>
          <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.9, opacity: 0 }} className="bg-white rounded-2xl shadow-xl max-w-lg w-full overflow-hidden" onClick={(event) => event.stopPropagation()}>
            <div className="bg-gradient-to-r from-primary-500 to-primary-600 px-6 py-4">
              <h3 className="text-xl font-semibold text-white">Donation Details</h3>
            </div>
            <div className="p-6 space-y-4">
              <div>
                <p className="text-sm text-gray-500">Donation Date</p>
                <p className="font-medium text-gray-800">
                  {new Date(selectedDonation.date).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}
                </p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Hospital</p>
                <p className="font-medium text-gray-800">{selectedDonation.hospital}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Type</p>
                <p className="font-medium text-gray-800">{selectedDonation.type}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Points Earned</p>
                <p className="font-medium text-gray-800">{selectedDonation.points}</p>
              </div>
              {selectedDonation.notes ? (
                <div>
                  <p className="text-sm text-gray-500">Notes</p>
                  <p className="font-medium text-gray-800">{selectedDonation.notes}</p>
                </div>
              ) : null}
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
