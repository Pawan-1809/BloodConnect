import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

const UsersManagement = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [roleFilter, setRoleFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');
  const [selectedUser, setSelectedUser] = useState(null);
  const [showEditModal, setShowEditModal] = useState(false);

  // Mock users data
  const [users] = useState([
    {
      id: 1,
      name: 'John Doe',
      email: 'john.doe@email.com',
      phone: '+1 234-567-8901',
      role: 'donor',
      status: 'active',
      verified: true,
      bloodGroup: 'A+',
      donations: 12,
      joinedDate: '2024-01-15',
      lastActive: '2024-12-08',
      avatar: null
    },
    {
      id: 2,
      name: 'Jane Smith',
      email: 'jane.smith@email.com',
      phone: '+1 234-567-8902',
      role: 'receiver',
      status: 'active',
      verified: true,
      bloodGroup: 'B-',
      requests: 3,
      joinedDate: '2024-02-20',
      lastActive: '2024-12-07',
      avatar: null
    },
    {
      id: 3,
      name: 'City General Hospital',
      email: 'admin@cityhospital.com',
      phone: '+1 234-567-8903',
      role: 'hospital',
      status: 'active',
      verified: true,
      totalDonations: 1520,
      joinedDate: '2023-06-10',
      lastActive: '2024-12-08',
      avatar: null
    },
    {
      id: 4,
      name: 'Mike Johnson',
      email: 'mike.j@email.com',
      phone: '+1 234-567-8904',
      role: 'donor',
      status: 'suspended',
      verified: false,
      bloodGroup: 'O+',
      donations: 2,
      joinedDate: '2024-06-01',
      lastActive: '2024-10-15',
      avatar: null
    },
    {
      id: 5,
      name: 'Sarah Wilson',
      email: 'sarah.w@email.com',
      phone: '+1 234-567-8905',
      role: 'donor',
      status: 'pending',
      verified: false,
      bloodGroup: 'AB+',
      donations: 0,
      joinedDate: '2024-12-01',
      lastActive: '2024-12-01',
      avatar: null
    }
  ]);

  const filteredUsers = users.filter(user => {
    const matchesSearch = user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         user.email.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesRole = roleFilter === 'all' || user.role === roleFilter;
    const matchesStatus = statusFilter === 'all' || user.status === statusFilter;
    return matchesSearch && matchesRole && matchesStatus;
  });

  const getRoleBadge = (role) => {
    const styles = {
      donor: 'bg-red-100 text-red-700',
      receiver: 'bg-blue-100 text-blue-700',
      hospital: 'bg-purple-100 text-purple-700',
      admin: 'bg-yellow-100 text-yellow-700'
    };
    return styles[role] || 'bg-gray-100 text-gray-700';
  };

  const getStatusBadge = (status) => {
    const styles = {
      active: 'bg-green-100 text-green-700',
      suspended: 'bg-red-100 text-red-700',
      pending: 'bg-yellow-100 text-yellow-700',
      inactive: 'bg-gray-100 text-gray-700'
    };
    return styles[status] || 'bg-gray-100 text-gray-700';
  };

  const stats = [
    { label: 'Total Users', value: users.length, icon: '👥', color: 'bg-blue-500' },
    { label: 'Donors', value: users.filter(u => u.role === 'donor').length, icon: '❤️', color: 'bg-red-500' },
    { label: 'Receivers', value: users.filter(u => u.role === 'receiver').length, icon: '🏥', color: 'bg-green-500' },
    { label: 'Hospitals', value: users.filter(u => u.role === 'hospital').length, icon: '🏢', color: 'bg-purple-500' }
  ];

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
                <h1 className="text-3xl font-bold text-gray-800">Users Management</h1>
                <p className="text-gray-600 mt-1">Manage and monitor all platform users</p>
              </div>
              <button className="mt-4 md:mt-0 btn-primary">
                + Add New User
              </button>
            </div>
          </motion.div>

          {/* Stats */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6"
          >
            {stats.map((stat, index) => (
              <div key={index} className="glass-card p-4">
                <div className="flex items-center space-x-4">
                  <div className={`w-12 h-12 ${stat.color} rounded-xl flex items-center justify-center text-white text-xl`}>
                    {stat.icon}
                  </div>
                  <div>
                    <p className="text-2xl font-bold text-gray-800">{stat.value}</p>
                    <p className="text-sm text-gray-500">{stat.label}</p>
                  </div>
                </div>
              </div>
            ))}
          </motion.div>

          {/* Filters */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="glass-card p-4 mb-6"
          >
            <div className="flex flex-col md:flex-row md:items-center space-y-4 md:space-y-0 md:space-x-4">
              {/* Search */}
              <div className="flex-1 relative">
                <input
                  type="text"
                  placeholder="Search by name or email..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="input-field pl-10"
                />
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">🔍</span>
              </div>

              {/* Role Filter */}
              <select
                value={roleFilter}
                onChange={(e) => setRoleFilter(e.target.value)}
                className="input-field md:w-40"
              >
                <option value="all">All Roles</option>
                <option value="donor">Donors</option>
                <option value="receiver">Receivers</option>
                <option value="hospital">Hospitals</option>
              </select>

              {/* Status Filter */}
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="input-field md:w-40"
              >
                <option value="all">All Status</option>
                <option value="active">Active</option>
                <option value="pending">Pending</option>
                <option value="suspended">Suspended</option>
              </select>
            </div>
          </motion.div>

          {/* Users Table */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="glass-card overflow-hidden"
          >
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">User</th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Role</th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Status</th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Joined</th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Last Active</th>
                    <th className="px-6 py-4 text-right text-xs font-semibold text-gray-500 uppercase tracking-wider">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {filteredUsers.map((user, index) => (
                    <motion.tr
                      key={user.id}
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ delay: index * 0.05 }}
                      className="hover:bg-gray-50"
                    >
                      <td className="px-6 py-4">
                        <div className="flex items-center space-x-3">
                          <div className="w-10 h-10 bg-gradient-to-br from-primary-400 to-primary-600 rounded-full flex items-center justify-center text-white font-medium">
                            {user.name.charAt(0)}
                          </div>
                          <div>
                            <div className="flex items-center space-x-2">
                              <p className="font-medium text-gray-800">{user.name}</p>
                              {user.verified && (
                                <span className="text-blue-500">✓</span>
                              )}
                            </div>
                            <p className="text-sm text-gray-500">{user.email}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <span className={`px-3 py-1 rounded-full text-xs font-medium capitalize ${getRoleBadge(user.role)}`}>
                          {user.role}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <span className={`px-3 py-1 rounded-full text-xs font-medium capitalize ${getStatusBadge(user.status)}`}>
                          {user.status}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-600">
                        {new Date(user.joinedDate).toLocaleDateString()}
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-600">
                        {new Date(user.lastActive).toLocaleDateString()}
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center justify-end space-x-2">
                          <button
                            onClick={() => { setSelectedUser(user); }}
                            className="p-2 text-gray-500 hover:text-primary-600 hover:bg-gray-100 rounded-lg transition-colors"
                            title="View Details"
                          >
                            👁️
                          </button>
                          <button
                            onClick={() => { setSelectedUser(user); setShowEditModal(true); }}
                            className="p-2 text-gray-500 hover:text-blue-600 hover:bg-gray-100 rounded-lg transition-colors"
                            title="Edit User"
                          >
                            ✏️
                          </button>
                          <button
                            className="p-2 text-gray-500 hover:text-red-600 hover:bg-gray-100 rounded-lg transition-colors"
                            title="Delete User"
                          >
                            🗑️
                          </button>
                        </div>
                      </td>
                    </motion.tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Pagination */}
            <div className="px-6 py-4 border-t border-gray-100 flex items-center justify-between">
              <p className="text-sm text-gray-500">
                Showing {filteredUsers.length} of {users.length} users
              </p>
              <div className="flex space-x-2">
                <button className="px-3 py-1 border border-gray-300 rounded-lg text-sm hover:bg-gray-50">Previous</button>
                <button className="px-3 py-1 bg-primary-500 text-white rounded-lg text-sm">1</button>
                <button className="px-3 py-1 border border-gray-300 rounded-lg text-sm hover:bg-gray-50">2</button>
                <button className="px-3 py-1 border border-gray-300 rounded-lg text-sm hover:bg-gray-50">Next</button>
              </div>
            </div>
          </motion.div>

          {/* User Detail Modal */}
          <AnimatePresence>
            {selectedUser && !showEditModal && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
                onClick={() => setSelectedUser(null)}
              >
                <motion.div
                  initial={{ scale: 0.9, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  exit={{ scale: 0.9, opacity: 0 }}
                  className="bg-white rounded-2xl max-w-lg w-full max-h-[90vh] overflow-y-auto"
                  onClick={(e) => e.stopPropagation()}
                >
                  <div className="p-6">
                    <div className="flex items-center justify-between mb-6">
                      <h3 className="text-xl font-semibold text-gray-800">User Details</h3>
                      <button
                        onClick={() => setSelectedUser(null)}
                        className="p-2 hover:bg-gray-100 rounded-lg"
                      >
                        ✕
                      </button>
                    </div>

                    {/* User Profile */}
                    <div className="text-center mb-6">
                      <div className="w-20 h-20 bg-gradient-to-br from-primary-400 to-primary-600 rounded-full flex items-center justify-center text-white text-2xl font-bold mx-auto">
                        {selectedUser.name.charAt(0)}
                      </div>
                      <h4 className="text-xl font-semibold text-gray-800 mt-4">{selectedUser.name}</h4>
                      <p className="text-gray-500">{selectedUser.email}</p>
                      <div className="flex justify-center space-x-2 mt-2">
                        <span className={`px-3 py-1 rounded-full text-xs font-medium capitalize ${getRoleBadge(selectedUser.role)}`}>
                          {selectedUser.role}
                        </span>
                        <span className={`px-3 py-1 rounded-full text-xs font-medium capitalize ${getStatusBadge(selectedUser.status)}`}>
                          {selectedUser.status}
                        </span>
                      </div>
                    </div>

                    {/* User Info */}
                    <div className="space-y-4">
                      <div className="flex justify-between py-2 border-b border-gray-100">
                        <span className="text-gray-500">Phone</span>
                        <span className="text-gray-800">{selectedUser.phone}</span>
                      </div>
                      {selectedUser.bloodGroup && (
                        <div className="flex justify-between py-2 border-b border-gray-100">
                          <span className="text-gray-500">Blood Group</span>
                          <span className="text-red-600 font-bold">{selectedUser.bloodGroup}</span>
                        </div>
                      )}
                      {selectedUser.donations !== undefined && (
                        <div className="flex justify-between py-2 border-b border-gray-100">
                          <span className="text-gray-500">Total Donations</span>
                          <span className="text-gray-800">{selectedUser.donations}</span>
                        </div>
                      )}
                      <div className="flex justify-between py-2 border-b border-gray-100">
                        <span className="text-gray-500">Joined</span>
                        <span className="text-gray-800">{new Date(selectedUser.joinedDate).toLocaleDateString()}</span>
                      </div>
                      <div className="flex justify-between py-2 border-b border-gray-100">
                        <span className="text-gray-500">Last Active</span>
                        <span className="text-gray-800">{new Date(selectedUser.lastActive).toLocaleDateString()}</span>
                      </div>
                      <div className="flex justify-between py-2">
                        <span className="text-gray-500">Verified</span>
                        <span className={selectedUser.verified ? 'text-green-600' : 'text-red-600'}>
                          {selectedUser.verified ? 'Yes ✓' : 'No ✕'}
                        </span>
                      </div>
                    </div>

                    {/* Actions */}
                    <div className="mt-6 flex space-x-3">
                      <button className="flex-1 btn-secondary">Message User</button>
                      <button className="flex-1 btn-primary" onClick={() => setShowEditModal(true)}>Edit User</button>
                    </div>
                  </div>
                </motion.div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Edit User Modal */}
          <AnimatePresence>
            {showEditModal && selectedUser && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
                onClick={() => { setShowEditModal(false); setSelectedUser(null); }}
              >
                <motion.div
                  initial={{ scale: 0.9, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  exit={{ scale: 0.9, opacity: 0 }}
                  className="bg-white rounded-2xl max-w-lg w-full max-h-[90vh] overflow-y-auto"
                  onClick={(e) => e.stopPropagation()}
                >
                  <div className="p-6">
                    <div className="flex items-center justify-between mb-6">
                      <h3 className="text-xl font-semibold text-gray-800">Edit User</h3>
                      <button
                        onClick={() => { setShowEditModal(false); setSelectedUser(null); }}
                        className="p-2 hover:bg-gray-100 rounded-lg"
                      >
                        ✕
                      </button>
                    </div>

                    <form className="space-y-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Full Name</label>
                        <input
                          type="text"
                          className="input-field"
                          defaultValue={selectedUser.name}
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Email</label>
                        <input
                          type="email"
                          className="input-field"
                          defaultValue={selectedUser.email}
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Phone</label>
                        <input
                          type="tel"
                          className="input-field"
                          defaultValue={selectedUser.phone}
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Role</label>
                        <select className="input-field" defaultValue={selectedUser.role}>
                          <option value="donor">Donor</option>
                          <option value="receiver">Receiver</option>
                          <option value="hospital">Hospital</option>
                          <option value="admin">Admin</option>
                        </select>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Status</label>
                        <select className="input-field" defaultValue={selectedUser.status}>
                          <option value="active">Active</option>
                          <option value="pending">Pending</option>
                          <option value="suspended">Suspended</option>
                          <option value="inactive">Inactive</option>
                        </select>
                      </div>
                      <div className="flex items-center space-x-2">
                        <input type="checkbox" id="verified" defaultChecked={selectedUser.verified} className="rounded" />
                        <label htmlFor="verified" className="text-sm text-gray-700">Verified User</label>
                      </div>

                      <div className="flex space-x-3 pt-4">
                        <button
                          type="button"
                          onClick={() => { setShowEditModal(false); setSelectedUser(null); }}
                          className="flex-1 btn-secondary"
                        >
                          Cancel
                        </button>
                        <button type="submit" className="flex-1 btn-primary">
                          Save Changes
                        </button>
                      </div>
                    </form>
                  </div>
                </motion.div>
              </motion.div>
            )}
          </AnimatePresence>
    </div>
  );
};

export default UsersManagement;
