import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useForm } from 'react-hook-form';
import { hospitalAPI } from '../../services/api';

const bloodTypes = ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'];

const ManageStock = () => {
  const [stock, setStock] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [selectedItem, setSelectedItem] = useState(null);
  const [notification, setNotification] = useState(null);
  
  const { register, handleSubmit, reset, setValue, formState: { errors } } = useForm();

  useEffect(() => {
    fetchStock();
  }, []);

  const fetchStock = async () => {
    setLoading(true);
    try {
      const response = await hospitalAPI.getStock();
      setStock(response.data.data || mockStock);
    } catch (error) {
      console.error('Error fetching stock:', error);
      setStock(mockStock);
    }
    setLoading(false);
  };

  // Mock data
  const mockStock = [
    { id: 1, bloodGroup: 'A+', units: 45, minUnits: 20, lastUpdated: '2024-08-14T10:30:00', status: 'adequate' },
    { id: 2, bloodGroup: 'A-', units: 12, minUnits: 15, lastUpdated: '2024-08-14T09:00:00', status: 'low' },
    { id: 3, bloodGroup: 'B+', units: 38, minUnits: 20, lastUpdated: '2024-08-14T11:00:00', status: 'adequate' },
    { id: 4, bloodGroup: 'B-', units: 8, minUnits: 10, lastUpdated: '2024-08-13T16:00:00', status: 'critical' },
    { id: 5, bloodGroup: 'AB+', units: 22, minUnits: 15, lastUpdated: '2024-08-14T08:30:00', status: 'adequate' },
    { id: 6, bloodGroup: 'AB-', units: 5, minUnits: 10, lastUpdated: '2024-08-12T14:00:00', status: 'critical' },
    { id: 7, bloodGroup: 'O+', units: 55, minUnits: 30, lastUpdated: '2024-08-14T12:00:00', status: 'adequate' },
    { id: 8, bloodGroup: 'O-', units: 15, minUnits: 20, lastUpdated: '2024-08-14T07:00:00', status: 'low' },
  ];

  const getStatusStyle = (status) => {
    switch (status) {
      case 'adequate':
        return { bg: 'bg-green-100', text: 'text-green-700', border: 'border-green-300', icon: '✓' };
      case 'low':
        return { bg: 'bg-yellow-100', text: 'text-yellow-700', border: 'border-yellow-300', icon: '⚠️' };
      case 'critical':
        return { bg: 'bg-red-100', text: 'text-red-700', border: 'border-red-300', icon: '🚨' };
      default:
        return { bg: 'bg-gray-100', text: 'text-gray-700', border: 'border-gray-300', icon: '•' };
    }
  };

  const getProgressColor = (status) => {
    switch (status) {
      case 'adequate': return 'bg-green-500';
      case 'low': return 'bg-yellow-500';
      case 'critical': return 'bg-red-500';
      default: return 'bg-gray-500';
    }
  };

  const onAddSubmit = async (data) => {
    try {
      // await hospitalAPI.addStock(data);
      const newItem = {
        id: stock.length + 1,
        ...data,
        lastUpdated: new Date().toISOString(),
        status: data.units >= data.minUnits ? 'adequate' : data.units < data.minUnits / 2 ? 'critical' : 'low'
      };
      setStock([...stock, newItem]);
      setShowAddModal(false);
      reset();
      showNotification('success', 'Stock added successfully!');
    } catch (error) {
      showNotification('error', 'Failed to add stock');
    }
  };

  const onEditSubmit = async (data) => {
    try {
      // await hospitalAPI.updateStock(selectedItem.id, data);
      setStock(stock.map(item => 
        item.id === selectedItem.id 
          ? { 
              ...item, 
              ...data, 
              lastUpdated: new Date().toISOString(),
              status: data.units >= item.minUnits ? 'adequate' : data.units < item.minUnits / 2 ? 'critical' : 'low'
            } 
          : item
      ));
      setShowEditModal(false);
      setSelectedItem(null);
      reset();
      showNotification('success', 'Stock updated successfully!');
    } catch (error) {
      showNotification('error', 'Failed to update stock');
    }
  };

  const handleEdit = (item) => {
    setSelectedItem(item);
    setValue('units', item.units);
    setValue('minUnits', item.minUnits);
    setShowEditModal(true);
  };

  const showNotification = (type, message) => {
    setNotification({ type, message });
    setTimeout(() => setNotification(null), 3000);
  };

  const totalUnits = stock.reduce((acc, item) => acc + item.units, 0);
  const lowStockCount = stock.filter(item => item.status === 'low' || item.status === 'critical').length;

  return (
    <div className="p-6 lg:p-8">
          {/* Notification Toast */}
          <AnimatePresence>
            {notification && (
              <motion.div
                initial={{ opacity: 0, y: -50 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -50 }}
                className={`fixed top-20 right-6 z-50 px-6 py-4 rounded-xl shadow-lg ${
                  notification.type === 'success' ? 'bg-green-500' : 'bg-red-500'
                } text-white`}
              >
                <div className="flex items-center space-x-3">
                  <span className="text-xl">{notification.type === 'success' ? '✓' : '✕'}</span>
                  <span>{notification.message}</span>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Header */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex flex-col md:flex-row md:items-center md:justify-between mb-8"
          >
            <div>
              <h1 className="text-3xl font-bold text-gray-800">Blood Stock Management</h1>
              <p className="text-gray-600 mt-1">Monitor and manage your blood inventory</p>
            </div>
            <button
              onClick={() => setShowAddModal(true)}
              className="btn-primary mt-4 md:mt-0 flex items-center space-x-2"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
              <span>Add Stock</span>
            </button>
          </motion.div>

          {/* Summary Cards */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6"
          >
            <div className="glass-card p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-500">Total Stock</p>
                  <p className="text-2xl font-bold text-gray-800">{totalUnits} units</p>
                </div>
                <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center">
                  <span className="text-2xl">🩸</span>
                </div>
              </div>
            </div>
            <div className="glass-card p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-500">Blood Types</p>
                  <p className="text-2xl font-bold text-gray-800">{stock.length}</p>
                </div>
                <div className="w-12 h-12 bg-purple-100 rounded-xl flex items-center justify-center">
                  <span className="text-2xl">📊</span>
                </div>
              </div>
            </div>
            <div className="glass-card p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-500">Low Stock Alerts</p>
                  <p className="text-2xl font-bold text-yellow-600">{lowStockCount}</p>
                </div>
                <div className="w-12 h-12 bg-yellow-100 rounded-xl flex items-center justify-center">
                  <span className="text-2xl">⚠️</span>
                </div>
              </div>
            </div>
            <div className="glass-card p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-500">Last Updated</p>
                  <p className="text-lg font-bold text-gray-800">Just now</p>
                </div>
                <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center">
                  <span className="text-2xl">🔄</span>
                </div>
              </div>
            </div>
          </motion.div>

          {/* Low Stock Alert Banner */}
          {lowStockCount > 0 && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="mb-6 p-4 bg-gradient-to-r from-red-500 to-orange-500 rounded-xl text-white"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <span className="text-2xl">🚨</span>
                  <div>
                    <h4 className="font-semibold">Low Stock Alert!</h4>
                    <p className="text-sm opacity-90">
                      {lowStockCount} blood type(s) are running low. Consider requesting donations.
                    </p>
                  </div>
                </div>
                <button className="bg-white/20 hover:bg-white/30 px-4 py-2 rounded-lg transition-colors">
                  Request Donors
                </button>
              </div>
            </motion.div>
          )}

          {/* Stock Grid */}
          {loading ? (
            <div className="flex items-center justify-center py-20">
              <div className="animate-spin w-12 h-12 border-4 border-primary-500 border-t-transparent rounded-full"></div>
            </div>
          ) : (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6"
            >
              {stock.map((item, index) => {
                const statusStyle = getStatusStyle(item.status);
                const percentage = Math.min((item.units / (item.minUnits * 2)) * 100, 100);
                
                return (
                  <motion.div
                    key={item.id}
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: index * 0.05 }}
                    className={`glass-card p-5 border-2 ${statusStyle.border} hover:shadow-lg transition-all`}
                  >
                    {/* Header */}
                    <div className="flex items-center justify-between mb-4">
                      <div className="w-16 h-16 bg-gradient-to-br from-primary-400 to-primary-600 rounded-2xl flex items-center justify-center text-white text-xl font-bold shadow-lg">
                        {item.bloodGroup}
                      </div>
                      <span className={`px-3 py-1 rounded-full text-sm font-medium ${statusStyle.bg} ${statusStyle.text}`}>
                        {statusStyle.icon} {item.status.charAt(0).toUpperCase() + item.status.slice(1)}
                      </span>
                    </div>

                    {/* Units */}
                    <div className="mb-4">
                      <div className="flex items-baseline justify-between mb-2">
                        <span className="text-4xl font-bold text-gray-800">{item.units}</span>
                        <span className="text-gray-500 text-sm">/ {item.minUnits * 2} max</span>
                      </div>
                      <p className="text-sm text-gray-500">units available</p>
                    </div>

                    {/* Progress Bar */}
                    <div className="mb-4">
                      <div className="h-3 bg-gray-200 rounded-full overflow-hidden">
                        <motion.div
                          initial={{ width: 0 }}
                          animate={{ width: `${percentage}%` }}
                          transition={{ delay: 0.5 + index * 0.05, duration: 0.5 }}
                          className={`h-full ${getProgressColor(item.status)} rounded-full`}
                        />
                      </div>
                      <div className="flex justify-between mt-1 text-xs text-gray-500">
                        <span>Min: {item.minUnits}</span>
                        <span>{Math.round(percentage)}%</span>
                      </div>
                    </div>

                    {/* Last Updated */}
                    <p className="text-xs text-gray-400 mb-4">
                      Updated: {new Date(item.lastUpdated).toLocaleString('en-US', {
                        month: 'short',
                        day: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit'
                      })}
                    </p>

                    {/* Actions */}
                    <div className="flex space-x-2">
                      <button
                        onClick={() => handleEdit(item)}
                        className="flex-1 px-3 py-2 bg-primary-50 text-primary-600 rounded-lg font-medium text-sm hover:bg-primary-100 transition-colors"
                      >
                        Update Stock
                      </button>
                      <button className="p-2 hover:bg-gray-100 rounded-lg transition-colors">
                        <svg className="w-5 h-5 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 17v-2m3 2v-4m3 4v-6m2 10H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                        </svg>
                      </button>
                    </div>
                  </motion.div>
                );
              })}
            </motion.div>
          )}

          {/* Recent Activity */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="mt-8 glass-card p-6"
          >
            <h3 className="text-lg font-semibold text-gray-800 mb-4">Recent Stock Changes</h3>
            <div className="space-y-3">
              {[
                { type: 'add', blood: 'O+', units: 5, time: '2 hours ago', user: 'Dr. Smith' },
                { type: 'remove', blood: 'A-', units: 2, time: '4 hours ago', user: 'Blood Bank' },
                { type: 'add', blood: 'B+', units: 3, time: '6 hours ago', user: 'Dr. Johnson' },
                { type: 'remove', blood: 'AB+', units: 1, time: '8 hours ago', user: 'Emergency' },
              ].map((activity, index) => (
                <div key={index} className="flex items-center justify-between py-3 border-b border-gray-100 last:border-0">
                  <div className="flex items-center space-x-3">
                    <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                      activity.type === 'add' ? 'bg-green-100' : 'bg-red-100'
                    }`}>
                      {activity.type === 'add' ? (
                        <svg className="w-5 h-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                        </svg>
                      ) : (
                        <svg className="w-5 h-5 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 12H4" />
                        </svg>
                      )}
                    </div>
                    <div>
                      <p className="font-medium text-gray-800">
                        {activity.type === 'add' ? 'Added' : 'Removed'} {activity.units} units of {activity.blood}
                      </p>
                      <p className="text-sm text-gray-500">By {activity.user}</p>
                    </div>
                  </div>
                  <span className="text-sm text-gray-400">{activity.time}</span>
                </div>
              ))}
            </div>
          </motion.div>

          {/* Add Stock Modal */}
          <AnimatePresence>
            {showAddModal && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
                onClick={() => setShowAddModal(false)}
              >
                <motion.div
                  initial={{ scale: 0.9, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  exit={{ scale: 0.9, opacity: 0 }}
                  className="bg-white rounded-2xl shadow-xl max-w-md w-full overflow-hidden"
                  onClick={(e) => e.stopPropagation()}
                >
                  <div className="bg-gradient-to-r from-primary-500 to-primary-600 px-6 py-4">
                    <h3 className="text-xl font-semibold text-white">Add Blood Stock</h3>
                  </div>
                  
                  <form onSubmit={handleSubmit(onAddSubmit)} className="p-6 space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Blood Group</label>
                      <select
                        {...register('bloodGroup', { required: 'Blood group is required' })}
                        className="input-field"
                      >
                        <option value="">Select blood group</option>
                        {bloodTypes.map(type => (
                          <option key={type} value={type}>{type}</option>
                        ))}
                      </select>
                      {errors.bloodGroup && <p className="text-red-500 text-sm mt-1">{errors.bloodGroup.message}</p>}
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Units</label>
                      <input
                        type="number"
                        {...register('units', { required: 'Units required', min: { value: 1, message: 'Minimum 1 unit' } })}
                        className="input-field"
                        placeholder="Enter number of units"
                      />
                      {errors.units && <p className="text-red-500 text-sm mt-1">{errors.units.message}</p>}
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Minimum Stock Level</label>
                      <input
                        type="number"
                        {...register('minUnits', { required: 'Minimum level required' })}
                        className="input-field"
                        placeholder="Alert when below this level"
                      />
                      {errors.minUnits && <p className="text-red-500 text-sm mt-1">{errors.minUnits.message}</p>}
                    </div>

                    <div className="flex justify-end space-x-3 pt-4">
                      <button type="button" onClick={() => setShowAddModal(false)} className="btn-secondary">
                        Cancel
                      </button>
                      <button type="submit" className="btn-primary">
                        Add Stock
                      </button>
                    </div>
                  </form>
                </motion.div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Edit Stock Modal */}
          <AnimatePresence>
            {showEditModal && selectedItem && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
                onClick={() => { setShowEditModal(false); setSelectedItem(null); }}
              >
                <motion.div
                  initial={{ scale: 0.9, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  exit={{ scale: 0.9, opacity: 0 }}
                  className="bg-white rounded-2xl shadow-xl max-w-md w-full overflow-hidden"
                  onClick={(e) => e.stopPropagation()}
                >
                  <div className="bg-gradient-to-r from-primary-500 to-primary-600 px-6 py-4">
                    <h3 className="text-xl font-semibold text-white">Update {selectedItem.bloodGroup} Stock</h3>
                  </div>
                  
                  <form onSubmit={handleSubmit(onEditSubmit)} className="p-6 space-y-4">
                    <div className="p-4 bg-gray-50 rounded-xl">
                      <div className="flex items-center justify-between">
                        <span className="text-gray-600">Current Stock</span>
                        <span className="text-2xl font-bold text-gray-800">{selectedItem.units} units</span>
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">New Units Count</label>
                      <input
                        type="number"
                        {...register('units', { required: 'Units required', min: { value: 0, message: 'Cannot be negative' } })}
                        className="input-field"
                      />
                      {errors.units && <p className="text-red-500 text-sm mt-1">{errors.units.message}</p>}
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Minimum Stock Level</label>
                      <input
                        type="number"
                        {...register('minUnits', { required: 'Minimum level required' })}
                        className="input-field"
                      />
                      {errors.minUnits && <p className="text-red-500 text-sm mt-1">{errors.minUnits.message}</p>}
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Reason for Change</label>
                      <select {...register('reason')} className="input-field">
                        <option value="donation">New Donation Received</option>
                        <option value="transfusion">Used for Transfusion</option>
                        <option value="expired">Expired Units Removed</option>
                        <option value="transfer">Transferred to Other Facility</option>
                        <option value="correction">Stock Correction</option>
                      </select>
                    </div>

                    <div className="flex justify-end space-x-3 pt-4">
                      <button 
                        type="button" 
                        onClick={() => { setShowEditModal(false); setSelectedItem(null); }} 
                        className="btn-secondary"
                      >
                        Cancel
                      </button>
                      <button type="submit" className="btn-primary">
                        Update Stock
                      </button>
                    </div>
                  </form>
                </motion.div>
              </motion.div>
            )}
          </AnimatePresence>
    </div>
  );
};

export default ManageStock;
