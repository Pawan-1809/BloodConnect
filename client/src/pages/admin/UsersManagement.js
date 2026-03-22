import React, { useEffect, useMemo, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import toast from 'react-hot-toast';
import { adminAPI } from '../../services/api';

const UsersManagement = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [roleFilter, setRoleFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedUser, setSelectedUser] = useState(null);

  useEffect(() => {
    let isMounted = true;

    const fetchUsers = async () => {
      setLoading(true);
      try {
        const response = await adminAPI.getUsers({
          limit: 100,
          ...(roleFilter !== 'all' ? { role: roleFilter } : {}),
          ...(statusFilter === 'verified' ? { verified: true } : {}),
          ...(statusFilter === 'blocked' ? { blocked: true } : {}),
          ...(searchTerm ? { search: searchTerm } : {})
        });

        if (!isMounted) {
          return;
        }

        setUsers(response.data?.users || []);
      } catch (error) {
        console.error('Error fetching users:', error);
        if (isMounted) {
          setUsers([]);
        }
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    };

    const timeoutId = setTimeout(fetchUsers, 250);

    return () => {
      isMounted = false;
      clearTimeout(timeoutId);
    };
  }, [roleFilter, searchTerm, statusFilter]);

  const stats = useMemo(() => [
    { label: 'Total Users', value: users.length, color: 'bg-blue-500' },
    { label: 'Donors', value: users.filter((user) => user.role === 'donor').length, color: 'bg-red-500' },
    { label: 'Receivers', value: users.filter((user) => user.role === 'receiver').length, color: 'bg-green-500' },
    { label: 'Hospitals', value: users.filter((user) => user.role === 'hospital').length, color: 'bg-purple-500' }
  ], [users]);

  const handleBlockToggle = async (user) => {
    try {
      await adminAPI.banUser(user._id, { block: !user.isBlocked, reason: 'Updated by admin panel' });
      setUsers((current) =>
        current.map((item) =>
          item._id === user._id ? { ...item, isBlocked: !item.isBlocked } : item
        )
      );
      setSelectedUser((current) => (current?._id === user._id ? { ...current, isBlocked: !current.isBlocked } : current));
      toast.success(user.isBlocked ? 'User unblocked.' : 'User blocked.');
    } catch (error) {
      toast.error(error.response?.data?.message || 'Unable to update user status.');
    }
  };

  const getRoleBadge = (role) => {
    const styles = {
      donor: 'bg-red-100 text-red-700',
      receiver: 'bg-blue-100 text-blue-700',
      hospital: 'bg-purple-100 text-purple-700',
      admin: 'bg-yellow-100 text-yellow-700'
    };
    return styles[role] || 'bg-gray-100 text-gray-700';
  };

  const getStatusBadge = (user) => {
    if (user.isBlocked) {
      return 'bg-red-100 text-red-700';
    }

    if (user.isVerified) {
      return 'bg-green-100 text-green-700';
    }

    return 'bg-yellow-100 text-yellow-700';
  };

  return (
    <div className="p-6 lg:p-8">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="mb-8">
        <h1 className="text-3xl font-bold text-gray-800">Users Management</h1>
        <p className="text-gray-600 mt-1">Real users from the admin API.</p>
      </motion.div>

      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        {stats.map((stat) => (
          <div key={stat.label} className="glass-card p-4">
            <div className="flex items-center space-x-4">
              <div className={`w-12 h-12 ${stat.color} rounded-xl`} />
              <div>
                <p className="text-2xl font-bold text-gray-800">{stat.value}</p>
                <p className="text-sm text-gray-500">{stat.label}</p>
              </div>
            </div>
          </div>
        ))}
      </motion.div>

      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="glass-card p-4 mb-6">
        <div className="flex flex-col md:flex-row md:items-center gap-4">
          <input type="text" placeholder="Search by name, email, or phone..." value={searchTerm} onChange={(event) => setSearchTerm(event.target.value)} className="input-field flex-1" />
          <select value={roleFilter} onChange={(event) => setRoleFilter(event.target.value)} className="input-field md:w-40">
            <option value="all">All Roles</option>
            <option value="donor">Donor</option>
            <option value="receiver">Receiver</option>
            <option value="hospital">Hospital</option>
            <option value="admin">Admin</option>
          </select>
          <select value={statusFilter} onChange={(event) => setStatusFilter(event.target.value)} className="input-field md:w-40">
            <option value="all">All Status</option>
            <option value="verified">Verified</option>
            <option value="blocked">Blocked</option>
          </select>
        </div>
      </motion.div>

      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }} className="glass-card overflow-hidden">
        {loading ? (
          <div className="p-10 text-center text-gray-500">Loading users...</div>
        ) : users.length === 0 ? (
          <div className="p-10 text-center text-gray-500">No users found.</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">User</th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Role</th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Status</th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Joined</th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {users.map((user) => (
                  <tr key={user._id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-4">
                      <p className="font-medium text-gray-800">{user.firstName} {user.lastName}</p>
                      <p className="text-sm text-gray-500">{user.email}</p>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`px-3 py-1 rounded-full text-xs font-medium ${getRoleBadge(user.role)}`}>
                        {user.role}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusBadge(user)}`}>
                        {user.isBlocked ? 'Blocked' : user.isVerified ? 'Verified' : 'Pending'}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-600">
                      {new Date(user.createdAt).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4">
                      <button onClick={() => setSelectedUser(user)} className="text-primary-600 hover:text-primary-700 text-sm font-medium" type="button">
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

      <AnimatePresence>
        {selectedUser ? (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4" onClick={() => setSelectedUser(null)}>
            <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.9, opacity: 0 }} className="bg-white rounded-2xl shadow-xl max-w-lg w-full overflow-hidden" onClick={(event) => event.stopPropagation()}>
              <div className="bg-gradient-to-r from-primary-500 to-primary-600 px-6 py-4">
                <h3 className="text-xl font-semibold text-white">User Details</h3>
              </div>
              <div className="p-6 space-y-4">
                <p><span className="text-gray-500">Name:</span> <span className="font-medium text-gray-800">{selectedUser.firstName} {selectedUser.lastName}</span></p>
                <p><span className="text-gray-500">Email:</span> <span className="font-medium text-gray-800">{selectedUser.email}</span></p>
                <p><span className="text-gray-500">Phone:</span> <span className="font-medium text-gray-800">{selectedUser.phone}</span></p>
                <p><span className="text-gray-500">Role:</span> <span className="font-medium text-gray-800">{selectedUser.role}</span></p>
                <p><span className="text-gray-500">Joined:</span> <span className="font-medium text-gray-800">{new Date(selectedUser.createdAt).toLocaleString()}</span></p>
              </div>
              <div className="px-6 py-4 bg-gray-50 flex justify-end gap-3">
                <button onClick={() => handleBlockToggle(selectedUser)} className="btn-secondary text-red-600 border-red-200 hover:bg-red-50" type="button">
                  {selectedUser.isBlocked ? 'Unblock' : 'Block'}
                </button>
                <button onClick={() => setSelectedUser(null)} className="btn-primary" type="button">
                  Close
                </button>
              </div>
            </motion.div>
          </motion.div>
        ) : null}
      </AnimatePresence>
    </div>
  );
};

export default UsersManagement;
