import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';
import toast from 'react-hot-toast';
import { scheduleAPI } from '../../services/api';

const formatLabel = (value = '') =>
  value
    .split('_')
    .filter(Boolean)
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(' ');

const statusTone = (status) => {
  if (status === 'published') return 'bg-green-100 text-green-700';
  if (status === 'ongoing') return 'bg-blue-100 text-blue-700';
  if (status === 'cancelled') return 'bg-gray-100 text-gray-700';
  if (status === 'completed') return 'bg-slate-100 text-slate-700';
  return 'bg-yellow-100 text-yellow-700';
};

const HospitalSchedules = () => {
  const location = useLocation();
  const isBloodDriveView = location.pathname.includes('/hospital/blood-drives');
  const [schedules, setSchedules] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [cancellingId, setCancellingId] = useState('');

  const fetchSchedules = useCallback(async () => {
    try {
      setError('');
      const response = await scheduleAPI.getMySchedules();
      setSchedules(response?.data?.schedules || []);
    } catch (fetchError) {
      setError(fetchError.response?.data?.message || 'Unable to load hospital schedules.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchSchedules();
  }, [fetchSchedules]);

  const filteredSchedules = useMemo(() => {
    const base = [...schedules].sort((left, right) => new Date(right.date) - new Date(left.date));
    if (isBloodDriveView) {
      return base.filter((schedule) => schedule.type !== 'donation_appointment');
    }
    return base;
  }, [isBloodDriveView, schedules]);

  const stats = useMemo(() => {
    const published = filteredSchedules.filter((schedule) => schedule.status === 'published').length;
    const ongoing = filteredSchedules.filter((schedule) => schedule.status === 'ongoing').length;
    const totalSlots = filteredSchedules.reduce((sum, schedule) => sum + Number(schedule.totalSlots || 0), 0);
    const bookedSlots = filteredSchedules.reduce(
      (sum, schedule) => sum + Math.max(Number(schedule.totalSlots || 0) - Number(schedule.availableSlots || 0), 0),
      0
    );

    return { published, ongoing, totalSlots, bookedSlots };
  }, [filteredSchedules]);

  const handleCancel = async (scheduleId) => {
    try {
      setCancellingId(scheduleId);
      await scheduleAPI.delete(scheduleId);
      toast.success('Schedule cancelled successfully.');
      fetchSchedules();
    } catch (cancelError) {
      toast.error(cancelError.response?.data?.message || 'Unable to cancel this schedule.');
    } finally {
      setCancellingId('');
    }
  };

  return (
    <div className="p-6 lg:p-8">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="mb-8">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">
              {isBloodDriveView ? 'Hospital Blood Drives' : 'Hospital Schedules'}
            </h1>
            <p className="text-gray-600 mt-1">
              {isBloodDriveView
                ? 'Track your published blood drives, camps, and collection events from live backend records.'
                : 'Review published appointments, operational events, slot load, and schedule status for your hospital.'}
            </p>
          </div>

          <div className="flex flex-wrap gap-3">
            <Link to="/hospital/dashboard" className="btn-secondary">
              Dashboard
            </Link>
            <Link to="/schedules" className="btn-primary">
              Public Schedule Feed
            </Link>
          </div>
        </div>
      </motion.div>

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4 mb-8">
        {[
          { label: 'Visible Items', value: filteredSchedules.length },
          { label: 'Published', value: stats.published },
          { label: 'Ongoing', value: stats.ongoing },
          { label: 'Booked Slots', value: stats.bookedSlots }
        ].map((stat) => (
          <div key={stat.label} className="glass-card p-5">
            <p className="text-sm text-gray-500">{stat.label}</p>
            <p className="text-3xl font-bold text-gray-900 mt-2">{stat.value}</p>
          </div>
        ))}
      </div>

      {loading ? (
        <div className="glass-card p-10 text-center text-gray-500">Loading schedules...</div>
      ) : error ? (
        <div className="glass-card p-10 text-center text-red-600">{error}</div>
      ) : filteredSchedules.length === 0 ? (
        <div className="glass-card p-10 text-center text-gray-500">
          No schedules are currently available for this hospital in this view.
        </div>
      ) : (
        <div className="grid gap-6">
          {filteredSchedules.map((schedule, index) => {
            const booked = Math.max(Number(schedule.totalSlots || 0) - Number(schedule.availableSlots || 0), 0);
            return (
              <motion.div
                key={schedule._id}
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.04 }}
                className="glass-card p-6"
              >
                <div className="flex flex-col xl:flex-row xl:items-start xl:justify-between gap-5">
                  <div className="space-y-3 flex-1">
                    <div className="flex flex-wrap items-center gap-3">
                      <h2 className="text-xl font-semibold text-gray-900">{schedule.title}</h2>
                      <span className={`px-3 py-1 rounded-full text-xs font-semibold ${statusTone(schedule.status)}`}>
                        {formatLabel(schedule.status)}
                      </span>
                      <span className="px-3 py-1 rounded-full text-xs font-semibold bg-primary-100 text-primary-700">
                        {formatLabel(schedule.type)}
                      </span>
                    </div>

                    <p className="text-sm text-gray-600">
                      {schedule.description || 'No additional schedule description has been provided.'}
                    </p>

                    <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-4 text-sm">
                      <div className="rounded-xl bg-gray-50 p-3">
                        <p className="text-gray-500">Date</p>
                        <p className="font-medium text-gray-900 mt-1">
                          {new Date(schedule.date).toLocaleDateString()}
                        </p>
                      </div>
                      <div className="rounded-xl bg-gray-50 p-3">
                        <p className="text-gray-500">Venue</p>
                        <p className="font-medium text-gray-900 mt-1">{schedule.venue?.name || 'Venue not listed'}</p>
                      </div>
                      <div className="rounded-xl bg-gray-50 p-3">
                        <p className="text-gray-500">Slots</p>
                        <p className="font-medium text-gray-900 mt-1">
                          {booked} booked / {schedule.totalSlots || 0} total
                        </p>
                      </div>
                      <div className="rounded-xl bg-gray-50 p-3">
                        <p className="text-gray-500">Visibility</p>
                        <p className="font-medium text-gray-900 mt-1">{schedule.isPublic ? 'Public' : 'Private'}</p>
                      </div>
                    </div>

                    {schedule.eligibleBloodGroups?.length > 0 && (
                      <div className="flex flex-wrap gap-2">
                        {schedule.eligibleBloodGroups.slice(0, 8).map((group) => (
                          <span key={group} className="px-2.5 py-1 rounded-full bg-red-50 text-red-700 text-xs font-semibold">
                            {group}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>

                  <div className="flex flex-col gap-3 xl:w-52">
                    <Link to={`/schedules/${schedule._id}`} className="btn-secondary text-center">
                      Open Public View
                    </Link>
                    {['published', 'ongoing'].includes(schedule.status) && (
                      <button
                        type="button"
                        onClick={() => handleCancel(schedule._id)}
                        className="btn-primary"
                        disabled={cancellingId === schedule._id}
                      >
                        {cancellingId === schedule._id ? 'Cancelling...' : 'Cancel Schedule'}
                      </button>
                    )}
                  </div>
                </div>
              </motion.div>
            );
          })}
        </div>
      )}

      <div className="mt-8 rounded-2xl bg-gray-900 text-gray-100 p-6">
        <h3 className="text-lg font-semibold">Operational Notes</h3>
        <ul className="mt-3 space-y-2 text-sm text-gray-300">
          <li>Published schedules appear in the public feed and are visible to donors.</li>
          <li>Booked slot counts update from the same schedule records used by the donor flow.</li>
          <li>Cancelling a live schedule updates backend status instead of deleting history.</li>
        </ul>
      </div>
    </div>
  );
};

export default HospitalSchedules;
