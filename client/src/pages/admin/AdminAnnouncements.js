import React, { useCallback, useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import toast from 'react-hot-toast';
import { adminAPI } from '../../services/api';

const targetOptions = [
  { value: '', label: 'All active users' },
  { value: 'donor', label: 'Donors only' },
  { value: 'receiver', label: 'Receivers only' },
  { value: 'hospital', label: 'Hospitals only' },
  { value: 'admin', label: 'Admins only' }
];

const priorityOptions = ['normal', 'high', 'urgent'];

const AdminAnnouncements = () => {
  const [overview, setOverview] = useState({
    totalUsers: 0,
    totalDonors: 0,
    totalHospitals: 0,
    verificationsPending: 0
  });
  const [form, setForm] = useState({
    title: '',
    message: '',
    targetRole: '',
    priority: 'normal'
  });
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);

  const fetchOverview = useCallback(async () => {
    try {
      const response = await adminAPI.getDashboard();
      setOverview(response?.data?.dashboard?.overview || {});
    } catch (error) {
      console.error('Unable to load admin overview for announcements', error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchOverview();
  }, [fetchOverview]);

  const handleSubmit = async (event) => {
    event.preventDefault();

    if (!form.title.trim() || !form.message.trim()) {
      toast.error('Title and message are required.');
      return;
    }

    try {
      setSending(true);
      const response = await adminAPI.createAnnouncement({
        title: form.title.trim(),
        message: form.message.trim(),
        targetRole: form.targetRole || undefined,
        priority: form.priority
      });
      toast.success(response?.data?.message || 'Announcement sent successfully.');
      setForm({ title: '', message: '', targetRole: '', priority: 'normal' });
    } catch (error) {
      toast.error(error.response?.data?.message || 'Unable to send announcement.');
    } finally {
      setSending(false);
    }
  };

  return (
    <div className="p-6 lg:p-8">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Announcement Center</h1>
        <p className="text-gray-600 mt-1">
          Send platform-wide or role-specific announcements that arrive as notifications and live socket events.
        </p>
      </motion.div>

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4 mb-8">
        {[
          { label: 'Total Users', value: overview.totalUsers || 0 },
          { label: 'Donors', value: overview.totalDonors || 0 },
          { label: 'Hospitals', value: overview.totalHospitals || 0 },
          { label: 'Pending Verifications', value: overview.verificationsPending || 0 }
        ].map((stat) => (
          <div key={stat.label} className="glass-card p-5">
            <p className="text-sm text-gray-500">{stat.label}</p>
            <p className="text-3xl font-bold text-gray-900 mt-2">{loading ? '...' : stat.value}</p>
          </div>
        ))}
      </div>

      <div className="grid gap-6 lg:grid-cols-[1.3fr,0.7fr]">
        <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} className="glass-card p-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Compose Announcement</h2>

          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Audience</label>
              <select
                value={form.targetRole}
                onChange={(event) => setForm((current) => ({ ...current, targetRole: event.target.value }))}
                className="input-field"
              >
                {targetOptions.map((option) => (
                  <option key={option.label} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Priority</label>
              <select
                value={form.priority}
                onChange={(event) => setForm((current) => ({ ...current, priority: event.target.value }))}
                className="input-field"
              >
                {priorityOptions.map((priority) => (
                  <option key={priority} value={priority}>
                    {priority.charAt(0).toUpperCase() + priority.slice(1)}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Title</label>
              <input
                type="text"
                value={form.title}
                onChange={(event) => setForm((current) => ({ ...current, title: event.target.value }))}
                className="input-field"
                placeholder="Example: Emergency O-negative campaign starts at 6 PM"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Message</label>
              <textarea
                rows={6}
                value={form.message}
                onChange={(event) => setForm((current) => ({ ...current, message: event.target.value }))}
                className="input-field"
                placeholder="Write the exact operational update users should receive."
              />
            </div>

            <button type="submit" className="btn-primary" disabled={sending}>
              {sending ? 'Sending...' : 'Send Announcement'}
            </button>
          </form>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
          <div className="glass-card p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Best Uses</h3>
            <ul className="space-y-3 text-sm text-gray-700">
              <li>Share emergency donor campaigns without editing each request individually.</li>
              <li>Notify hospitals about maintenance, verification deadlines, or workflow changes.</li>
              <li>Send urgent platform-wide notices when service behavior or timing changes materially.</li>
            </ul>
          </div>

          <div className="glass-card p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Delivery Behavior</h3>
            <ul className="space-y-3 text-sm text-gray-700">
              <li>Announcements are stored as notifications for targeted recipients.</li>
              <li>Live socket broadcasts are emitted immediately after the backend accepts the message.</li>
              <li>Use `urgent` only for time-sensitive operational communication.</li>
            </ul>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default AdminAnnouncements;
