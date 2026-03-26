import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useForm } from 'react-hook-form';
import { Link } from 'react-router-dom';
import { hospitalAPI } from '../../services/api';

const bloodTypes = ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'];

const ManageStock = () => {
  const [stock, setStock] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [selectedItem, setSelectedItem] = useState(null);
  const [notification, setNotification] = useState(null);
  const [profileReady, setProfileReady] = useState(true);
  
  const { register, handleSubmit, reset, setValue, formState: { errors } } = useForm();

  useEffect(() => {
    fetchStock();
  }, []);

  const fetchStock = async () => {
    setLoading(true);
    try {
      const response = await hospitalAPI.getStock();
      setProfileReady(true);
      const normalized = (response.data?.stocks || []).map((item) => ({
        id: item._id,
        bloodGroup: item.bloodGroup,
        units: item.availableUnits || 0,
        minUnits: item.minThreshold || 5,
        lastUpdated: item.lastStockUpdate || item.updatedAt || new Date().toISOString(),
        status: item.status || 'adequate'
      }));
      setStock(normalized);
    } catch (error) {
      console.error('Error fetching stock:', error);
      setProfileReady(error?.response?.status !== 404);
      setStock([]);
    }
    setLoading(false);
  };

  const addUnitsToStock = async (bloodGroup, units) => {
    const unitCount = Number(units || 0);
    for (let i = 0; i < unitCount; i += 1) {
      const unique = `${Date.now()}-${bloodGroup}-${i}-${Math.random().toString(36).slice(2, 8).toUpperCase()}`;
      await hospitalAPI.updateStock({
        bloodGroup,
        action: 'add',
        unitDetails: {
          unitId: `UNIT-${unique}`,
          bagNumber: `BAG-${unique}`,
          expiryDate: new Date(Date.now() + 35 * 24 * 60 * 60 * 1000).toISOString(),
          status: 'available',
          testResults: {
            hiv: 'negative',
            hepatitisB: 'negative',
            hepatitisC: 'negative',
            syphilis: 'negative',
            malaria: 'negative',
            overallStatus: 'safe'
          },
          testedAt: new Date().toISOString(),
          testedBy: 'Hospital Staff'
        }
      });
    }
  };

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
      await hospitalAPI.updateStock({
        bloodGroup: data.bloodGroup,
        action: 'update_threshold',
        units: {
          min: Number(data.minUnits),
          critical: Math.max(1, Math.floor(Number(data.minUnits) / 2))
        }
      });

      await addUnitsToStock(data.bloodGroup, data.units);
      await fetchStock();
      setShowAddModal(false);
      reset();
      showNotification('success', 'Stock updated successfully from hospital inventory input.');
    } catch (error) {
      if (error?.response?.status === 404) {
        setProfileReady(false);
        showNotification('error', 'Create your hospital profile first to activate stock management.');
      } else {
        showNotification('error', error?.response?.data?.message || 'Failed to add stock');
      }
    }
  };

  const onEditSubmit = async (data) => {
    try {
      const requestedUnits = Number(data.units);
      const currentUnits = Number(selectedItem.units || 0);
      const delta = requestedUnits - currentUnits;

      await hospitalAPI.updateStock({
        bloodGroup: selectedItem.bloodGroup,
        action: 'update_threshold',
        units: {
          min: Number(data.minUnits),
          critical: Math.max(1, Math.floor(Number(data.minUnits) / 2))
        }
      });

      if (delta > 0) {
        await addUnitsToStock(selectedItem.bloodGroup, delta);
      }

      if (delta < 0) {
        showNotification('error', 'Reducing stock units requires issuing/discarding specific units. Threshold updates were saved.');
      }

      await fetchStock();
      setShowEditModal(false);
      setSelectedItem(null);
      reset();
      showNotification('success', 'Stock settings saved successfully!');
    } catch (error) {
      if (error?.response?.status === 404) {
        setProfileReady(false);
        showNotification('error', 'Create your hospital profile first to activate stock management.');
      } else {
        showNotification('error', error?.response?.data?.message || 'Failed to update stock');
      }
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
                <Link to="/hospital/requests" className="bg-white/20 hover:bg-white/30 px-4 py-2 rounded-lg transition-colors">
                  Review Requests
                </Link>
              </div>
            </motion.div>
          )}

          {!profileReady && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="mb-6 rounded-xl border border-blue-200 bg-blue-50 p-5"
            >
              <h3 className="text-lg font-semibold text-blue-800">Hospital profile required</h3>
              <p className="mt-2 text-sm text-blue-700">
                Stock operations are enabled only after your hospital profile is created.
              </p>
              <Link to="/hospital/profile" className="btn-primary inline-flex mt-4">
                Complete Hospital Profile
              </Link>
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
              {stock
                .slice()
                .sort((a, b) => new Date(b.lastUpdated) - new Date(a.lastUpdated))
                .slice(0, 4)
                .map((activity, index) => (
                <div key={index} className="flex items-center justify-between py-3 border-b border-gray-100 last:border-0">
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 rounded-full flex items-center justify-center bg-green-100">
                        <svg className="w-5 h-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                        </svg>
                    </div>
                    <div>
                      <p className="font-medium text-gray-800">
                        Last update for {activity.bloodGroup}: {activity.units} available units
                      </p>
                      <p className="text-sm text-gray-500">Updated by hospital account</p>
                    </div>
                  </div>
                  <span className="text-sm text-gray-400">
                    {new Date(activity.lastUpdated).toLocaleString()}
                  </span>
                </div>
              ))}
              {stock.length === 0 && (
                <p className="text-sm text-gray-500">No stock changes recorded yet.</p>
              )}
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
