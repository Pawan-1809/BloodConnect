import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Line, Bar, Doughnut, Pie } from 'react-chartjs-2';
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

// Register ChartJS components
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

const AnalyticsPage = () => {
  const [timeRange, setTimeRange] = useState('30d');
  const [activeSection, setActiveSection] = useState('overview');

  // Mock analytics data
  const stats = [
    { label: 'Total Donations', value: '45,832', change: '+12.5%', trend: 'up', icon: '🩸' },
    { label: 'Active Users', value: '12,456', change: '+8.2%', trend: 'up', icon: '👥' },
    { label: 'Lives Saved', value: '137,496', change: '+15.3%', trend: 'up', icon: '❤️' },
    { label: 'Active Requests', value: '234', change: '-5.1%', trend: 'down', icon: '📋' }
  ];

  // Donations Over Time Chart
  const donationsChartData = {
    labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'],
    datasets: [
      {
        label: 'Donations',
        data: [3200, 3500, 3800, 4200, 4500, 4100, 4800, 5200, 5600, 5100, 4900, 5400],
        borderColor: '#EF4444',
        backgroundColor: 'rgba(239, 68, 68, 0.1)',
        fill: true,
        tension: 0.4
      },
      {
        label: 'Requests',
        data: [2800, 3100, 3400, 3600, 3900, 3700, 4200, 4600, 4900, 4500, 4300, 4700],
        borderColor: '#3B82F6',
        backgroundColor: 'rgba(59, 130, 246, 0.1)',
        fill: true,
        tension: 0.4
      }
    ]
  };

  // Blood Group Distribution
  const bloodGroupData = {
    labels: ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'],
    datasets: [{
      data: [25, 5, 20, 4, 8, 2, 30, 6],
      backgroundColor: [
        '#EF4444', '#F87171', '#F97316', '#FB923C',
        '#8B5CF6', '#A78BFA', '#10B981', '#34D399'
      ]
    }]
  };

  // User Growth Chart
  const userGrowthData = {
    labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'],
    datasets: [
      {
        label: 'Donors',
        data: [5200, 5800, 6500, 7200, 8100, 9000],
        backgroundColor: '#EF4444'
      },
      {
        label: 'Receivers',
        data: [1200, 1400, 1600, 1800, 2000, 2200],
        backgroundColor: '#3B82F6'
      },
      {
        label: 'Hospitals',
        data: [45, 52, 58, 65, 72, 80],
        backgroundColor: '#8B5CF6'
      }
    ]
  };

  // Request Fulfillment Rate
  const fulfillmentData = {
    labels: ['Fulfilled', 'Pending', 'Expired', 'Cancelled'],
    datasets: [{
      data: [72, 15, 8, 5],
      backgroundColor: ['#10B981', '#F59E0B', '#6B7280', '#EF4444']
    }]
  };

  // Regional Distribution
  const regionalData = [
    { region: 'New York', donations: 12450, percentage: 27 },
    { region: 'California', donations: 9820, percentage: 21 },
    { region: 'Texas', donations: 7560, percentage: 16 },
    { region: 'Florida', donations: 5890, percentage: 13 },
    { region: 'Illinois', donations: 4230, percentage: 9 },
    { region: 'Others', donations: 5882, percentage: 14 }
  ];

  // Top Hospitals
  const topHospitals = [
    { name: 'City General Hospital', donations: 15420, rating: 4.8 },
    { name: 'University Hospital', donations: 12350, rating: 4.9 },
    { name: 'Metropolitan Blood Bank', donations: 9870, rating: 4.5 },
    { name: 'Community Health Center', donations: 7650, rating: 4.3 },
    { name: 'Regional Medical Center', donations: 5430, rating: 4.1 }
  ];

  const chartOptions = {
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

  const pieOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'right'
      }
    }
  };

  return (
    <div className="p-6 lg:p-8">
          {/* Header */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-8"
          >
            <div className="flex flex-col md:flex-row md:items-center md:justify-between">
              <div>
                <h1 className="text-3xl font-bold text-gray-800">Platform Analytics</h1>
                <p className="text-gray-600 mt-1">Comprehensive insights into platform performance</p>
              </div>
              <div className="mt-4 md:mt-0 flex space-x-2">
                {['7d', '30d', '90d', '1y'].map((range) => (
                  <button
                    key={range}
                    onClick={() => setTimeRange(range)}
                    className={`px-4 py-2 rounded-xl font-medium transition-all ${
                      timeRange === range
                        ? 'bg-primary-500 text-white'
                        : 'bg-white text-gray-600 hover:bg-gray-100'
                    }`}
                  >
                    {range}
                  </button>
                ))}
              </div>
            </div>
          </motion.div>

          {/* Key Stats */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6"
          >
            {stats.map((stat, index) => (
              <div key={index} className="glass-card p-4">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-2xl">{stat.icon}</span>
                  <span className={`text-sm font-medium ${
                    stat.trend === 'up' ? 'text-green-600' : 'text-red-600'
                  }`}>
                    {stat.change}
                  </span>
                </div>
                <p className="text-2xl font-bold text-gray-800">{stat.value}</p>
                <p className="text-sm text-gray-500">{stat.label}</p>
              </div>
            ))}
          </motion.div>

          {/* Section Tabs */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="flex space-x-2 mb-6 overflow-x-auto pb-2"
          >
            {[
              { id: 'overview', label: 'Overview', icon: '📊' },
              { id: 'donations', label: 'Donations', icon: '🩸' },
              { id: 'users', label: 'Users', icon: '👥' },
              { id: 'hospitals', label: 'Hospitals', icon: '🏥' }
            ].map((section) => (
              <button
                key={section.id}
                onClick={() => setActiveSection(section.id)}
                className={`flex items-center space-x-2 px-4 py-2 rounded-xl font-medium whitespace-nowrap transition-all ${
                  activeSection === section.id
                    ? 'bg-primary-500 text-white'
                    : 'bg-white text-gray-600 hover:bg-gray-100'
                }`}
              >
                <span>{section.icon}</span>
                <span>{section.label}</span>
              </button>
            ))}
          </motion.div>

          {/* Charts Grid */}
          <div className="grid lg:grid-cols-2 gap-6 mb-6">
            {/* Donations Over Time */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="glass-card p-6"
            >
              <h3 className="text-lg font-semibold text-gray-800 mb-4">Donations & Requests Trend</h3>
              <div className="h-80">
                <Line data={donationsChartData} options={chartOptions} />
              </div>
            </motion.div>

            {/* Blood Group Distribution */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
              className="glass-card p-6"
            >
              <h3 className="text-lg font-semibold text-gray-800 mb-4">Blood Group Distribution</h3>
              <div className="h-80">
                <Doughnut data={bloodGroupData} options={pieOptions} />
              </div>
            </motion.div>

            {/* User Growth */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5 }}
              className="glass-card p-6"
            >
              <h3 className="text-lg font-semibold text-gray-800 mb-4">User Growth</h3>
              <div className="h-80">
                <Bar data={userGrowthData} options={chartOptions} />
              </div>
            </motion.div>

            {/* Request Fulfillment */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.6 }}
              className="glass-card p-6"
            >
              <h3 className="text-lg font-semibold text-gray-800 mb-4">Request Fulfillment Rate</h3>
              <div className="h-80">
                <Pie data={fulfillmentData} options={pieOptions} />
              </div>
            </motion.div>
          </div>

          {/* Additional Insights */}
          <div className="grid lg:grid-cols-2 gap-6">
            {/* Regional Distribution */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.7 }}
              className="glass-card p-6"
            >
              <h3 className="text-lg font-semibold text-gray-800 mb-4">Regional Distribution</h3>
              <div className="space-y-4">
                {regionalData.map((region, index) => (
                  <div key={index}>
                    <div className="flex justify-between mb-1">
                      <span className="font-medium text-gray-700">{region.region}</span>
                      <span className="text-gray-500">{region.donations.toLocaleString()} donations</span>
                    </div>
                    <div className="h-3 bg-gray-200 rounded-full overflow-hidden">
                      <motion.div
                        initial={{ width: 0 }}
                        animate={{ width: `${region.percentage}%` }}
                        transition={{ delay: 0.8 + index * 0.1, duration: 0.5 }}
                        className="h-full bg-gradient-to-r from-primary-400 to-primary-600 rounded-full"
                      />
                    </div>
                  </div>
                ))}
              </div>
            </motion.div>

            {/* Top Hospitals */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.8 }}
              className="glass-card p-6"
            >
              <h3 className="text-lg font-semibold text-gray-800 mb-4">Top Performing Hospitals</h3>
              <div className="space-y-4">
                {topHospitals.map((hospital, index) => (
                  <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-xl">
                    <div className="flex items-center space-x-3">
                      <span className="w-8 h-8 bg-primary-100 text-primary-600 rounded-lg flex items-center justify-center font-bold text-sm">
                        #{index + 1}
                      </span>
                      <div>
                        <p className="font-medium text-gray-800">{hospital.name}</p>
                        <p className="text-sm text-gray-500">{hospital.donations.toLocaleString()} donations</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="flex items-center text-yellow-500">
                        <span className="text-lg font-medium">{hospital.rating}</span>
                        <span className="ml-1">★</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </motion.div>
          </div>

          {/* Quick Insights */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.9 }}
            className="mt-6 grid md:grid-cols-3 gap-4"
          >
            <div className="glass-card p-6">
              <div className="flex items-center space-x-3 mb-4">
                <span className="text-3xl">🎯</span>
                <h4 className="font-semibold text-gray-800">Goal Progress</h4>
              </div>
              <div className="space-y-3">
                <div>
                  <div className="flex justify-between text-sm mb-1">
                    <span className="text-gray-600">Monthly Donation Target</span>
                    <span className="text-primary-600 font-medium">87%</span>
                  </div>
                  <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                    <div className="h-full w-[87%] bg-primary-500 rounded-full" />
                  </div>
                </div>
                <div>
                  <div className="flex justify-between text-sm mb-1">
                    <span className="text-gray-600">User Registration Goal</span>
                    <span className="text-green-600 font-medium">112%</span>
                  </div>
                  <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                    <div className="h-full w-full bg-green-500 rounded-full" />
                  </div>
                </div>
              </div>
            </div>

            <div className="glass-card p-6">
              <div className="flex items-center space-x-3 mb-4">
                <span className="text-3xl">⚡</span>
                <h4 className="font-semibold text-gray-800">Real-time Activity</h4>
              </div>
              <div className="space-y-3">
                {[
                  { text: 'New donation completed', time: '2 min ago' },
                  { text: 'Critical request created', time: '5 min ago' },
                  { text: 'Hospital registered', time: '12 min ago' }
                ].map((activity, index) => (
                  <div key={index} className="flex items-center justify-between">
                    <span className="text-gray-700">{activity.text}</span>
                    <span className="text-xs text-gray-400">{activity.time}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="glass-card p-6">
              <div className="flex items-center space-x-3 mb-4">
                <span className="text-3xl">💡</span>
                <h4 className="font-semibold text-gray-800">Insights</h4>
              </div>
              <div className="space-y-3">
                <div className="p-3 bg-green-50 rounded-xl">
                  <p className="text-sm text-green-800">
                    <span className="font-medium">↑ 23%</span> increase in O- donations this month
                  </p>
                </div>
                <div className="p-3 bg-yellow-50 rounded-xl">
                  <p className="text-sm text-yellow-800">
                    <span className="font-medium">⚠️</span> AB- stock running low across 3 regions
                  </p>
                </div>
              </div>
            </div>
          </motion.div>

          {/* Export Options */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 1 }}
            className="mt-6 flex justify-end space-x-4"
          >
            <button className="btn-secondary flex items-center space-x-2">
              <span>📊</span>
              <span>Export as PDF</span>
            </button>
            <button className="btn-secondary flex items-center space-x-2">
              <span>📈</span>
              <span>Export as CSV</span>
            </button>
          </motion.div>
    </div>
  );
};

export default AnalyticsPage;
