import React, { useEffect, useMemo, useState } from 'react';
import { motion } from 'framer-motion';
import { useForm } from 'react-hook-form';
import { useAuth } from '../../context/AuthContext';
import { donorAPI } from '../../services/api';

const bloodTypes = ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'];

const milestoneBadges = [
  { threshold: 1, name: 'First Timer', description: 'Completed your first donation' },
  { threshold: 5, name: 'Guardian', description: 'Completed 5 donations' },
  { threshold: 10, name: 'Champion', description: 'Completed 10 donations' },
  { threshold: 25, name: 'Super Hero', description: 'Completed 25 donations' },
  { threshold: 50, name: 'Legendary Hero', description: 'Completed 50 donations' }
];

function formatFullName(user) {
  return [user?.firstName, user?.lastName].filter(Boolean).join(' ') || 'Donor';
}

const DonorProfile = () => {
  const { user, updateProfile, refreshUser } = useAuth();
  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(false);
  const [pageLoading, setPageLoading] = useState(true);
  const [donorProfile, setDonorProfile] = useState(null);
  const [donorStats, setDonorStats] = useState(null);
  const [notification, setNotification] = useState(null);

  const { register, handleSubmit, reset, formState: { errors } } = useForm();

  useEffect(() => {
    let isMounted = true;

    const fetchProfile = async () => {
      setPageLoading(true);
      try {
        const [profileRes, statsRes] = await Promise.all([
          donorAPI.getProfile().catch(() => ({ data: { donorProfile: null } })),
          donorAPI.getDonorStats().catch(() => ({ data: { stats: null } }))
        ]);

        if (!isMounted) {
          return;
        }

        const profile = profileRes.data?.donorProfile || null;
        const stats = statsRes.data?.stats || null;

        setDonorProfile(profile);
        setDonorStats(stats);

        reset({
          firstName: user?.firstName || '',
          lastName: user?.lastName || '',
          phone: user?.phone || '',
          dateOfBirth: user?.dateOfBirth ? new Date(user.dateOfBirth).toISOString().slice(0, 10) : '',
          gender: user?.gender || '',
          bloodGroup: profile?.bloodGroup || '',
          weight: profile?.weight || '',
          height: profile?.height || '',
          addressStreet: user?.address?.street || '',
          addressCity: user?.address?.city || '',
          addressState: user?.address?.state || '',
          addressZipCode: user?.address?.zipCode || '',
          preferredDonationType: profile?.preferredDonationType || 'whole_blood',
          maxTravelDistance: profile?.maxTravelDistance || 10
        });
      } catch (error) {
        console.error('Error fetching donor profile:', error);
      } finally {
        if (isMounted) {
          setPageLoading(false);
        }
      }
    };

    fetchProfile();

    return () => {
      isMounted = false;
    };
  }, [reset, user]);

  const achievements = useMemo(() => {
    const totalDonations = donorStats?.totalDonations || 0;
    const earnedBadgeNames = new Set((donorStats?.badges || []).map((badge) => badge.name));

    return milestoneBadges.map((badge) => ({
      ...badge,
      unlocked: earnedBadgeNames.has(badge.name) || totalDonations >= badge.threshold,
      progress: Math.min(totalDonations, badge.threshold)
    }));
  }, [donorStats]);

  const onSubmit = async (data) => {
    setLoading(true);

    try {
      await updateProfile({
        firstName: data.firstName,
        lastName: data.lastName,
        phone: data.phone,
        dateOfBirth: data.dateOfBirth || undefined,
        gender: data.gender || undefined,
        address: {
          street: data.addressStreet || '',
          city: data.addressCity || '',
          state: data.addressState || '',
          zipCode: data.addressZipCode || ''
        }
      });

      await donorAPI.updateProfile({
        bloodGroup: data.bloodGroup,
        weight: Number(data.weight),
        height: data.height ? Number(data.height) : undefined,
        preferredDonationType: data.preferredDonationType,
        maxTravelDistance: Number(data.maxTravelDistance)
      });

      await refreshUser();

      const [profileRes, statsRes] = await Promise.all([
        donorAPI.getProfile(),
        donorAPI.getDonorStats()
      ]);

      setDonorProfile(profileRes.data?.donorProfile || null);
      setDonorStats(statsRes.data?.stats || null);
      setIsEditing(false);
      setNotification({ type: 'success', message: 'Profile updated successfully.' });
    } catch (error) {
      console.error('Error updating donor profile:', error);
      setNotification({ type: 'error', message: error.response?.data?.message || 'Failed to update profile.' });
    } finally {
      setLoading(false);
      setTimeout(() => setNotification(null), 3000);
    }
  };

  if (pageLoading) {
    return (
      <div className="p-6 lg:p-8">
        <div className="glass-card p-10 text-center">
          <p className="text-gray-500">Loading your profile...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 lg:p-8">
      {notification && (
        <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} className={`fixed top-20 right-6 z-50 px-6 py-4 rounded-xl shadow-lg ${notification.type === 'success' ? 'bg-green-500' : 'bg-red-500'} text-white`}>
          {notification.message}
        </motion.div>
      )}

      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="mb-8">
        <h1 className="text-3xl font-bold text-gray-800">My Profile</h1>
        <p className="text-gray-600 mt-1">Personal information and milestones backed by your real account data.</p>
      </motion.div>

      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="glass-card p-6 mb-6">
        <div className="flex flex-col md:flex-row items-start gap-6">
          <div className="w-24 h-24 rounded-full bg-gradient-to-br from-primary-400 to-primary-600 flex items-center justify-center text-white text-3xl font-bold shadow-lg">
            {formatFullName(user).charAt(0)}
          </div>
          <div className="flex-1">
            <h2 className="text-2xl font-bold text-gray-800">{formatFullName(user)}</h2>
            <p className="text-gray-600">{user?.email}</p>
            <div className="flex flex-wrap gap-3 mt-4">
              <span className="px-4 py-2 bg-primary-100 text-primary-700 rounded-full text-sm font-semibold">
                Blood Group: {donorProfile?.bloodGroup || 'Not set'}
              </span>
              <span className="px-4 py-2 bg-green-100 text-green-700 rounded-full text-sm font-semibold">
                {donorStats?.isEligible ? 'Eligible to donate' : 'Cooling off'}
              </span>
              <span className="px-4 py-2 bg-yellow-100 text-yellow-700 rounded-full text-sm font-semibold">
                Tier: {(donorStats?.rankTier || donorProfile?.donorRank || 'bronze').replace(/^\w/, (match) => match.toUpperCase())}
              </span>
            </div>
          </div>
          <div className="grid grid-cols-3 gap-6">
            <div className="text-center">
              <div className="text-3xl font-bold text-primary-600">{donorStats?.totalDonations || 0}</div>
              <div className="text-sm text-gray-500">Donations</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-green-600">{donorStats?.totalLivesSaved || 0}</div>
              <div className="text-sm text-gray-500">Lives Saved</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-yellow-600">{donorStats?.points || 0}</div>
              <div className="text-sm text-gray-500">Points</div>
            </div>
          </div>
        </div>
      </motion.div>

      <div className="grid lg:grid-cols-[2fr,1fr] gap-6">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="glass-card p-6">
          <div className="flex justify-between items-center mb-6">
            <h3 className="text-xl font-semibold text-gray-800">Personal and Donor Information</h3>
            <button onClick={() => setIsEditing((current) => !current)} className={isEditing ? 'btn-secondary' : 'btn-primary'} type="button">
              {isEditing ? 'Cancel' : 'Edit Profile'}
            </button>
          </div>

          <form onSubmit={handleSubmit(onSubmit)}>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">First Name</label>
                <input type="text" disabled={!isEditing} className="input-field disabled:bg-gray-100" {...register('firstName', { required: 'First name is required' })} />
                {errors.firstName && <p className="text-red-500 text-sm mt-1">{errors.firstName.message}</p>}
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Last Name</label>
                <input type="text" disabled={!isEditing} className="input-field disabled:bg-gray-100" {...register('lastName', { required: 'Last name is required' })} />
                {errors.lastName && <p className="text-red-500 text-sm mt-1">{errors.lastName.message}</p>}
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Phone</label>
                <input type="tel" disabled={!isEditing} className="input-field disabled:bg-gray-100" {...register('phone', { required: 'Phone number is required' })} />
                {errors.phone && <p className="text-red-500 text-sm mt-1">{errors.phone.message}</p>}
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Date of Birth</label>
                <input type="date" disabled={!isEditing} className="input-field disabled:bg-gray-100" {...register('dateOfBirth')} />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Gender</label>
                <select disabled={!isEditing} className="input-field disabled:bg-gray-100" {...register('gender')}>
                  <option value="">Select</option>
                  <option value="male">Male</option>
                  <option value="female">Female</option>
                  <option value="other">Other</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Blood Group</label>
                <select disabled={!isEditing} className="input-field disabled:bg-gray-100" {...register('bloodGroup', { required: 'Blood group is required' })}>
                  <option value="">Select</option>
                  {bloodTypes.map((type) => (
                    <option key={type} value={type}>{type}</option>
                  ))}
                </select>
                {errors.bloodGroup && <p className="text-red-500 text-sm mt-1">{errors.bloodGroup.message}</p>}
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Weight (kg)</label>
                <input type="number" disabled={!isEditing} className="input-field disabled:bg-gray-100" {...register('weight', { required: 'Weight is required', min: { value: 45, message: 'Weight must be at least 45 kg' } })} />
                {errors.weight && <p className="text-red-500 text-sm mt-1">{errors.weight.message}</p>}
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Height (cm)</label>
                <input type="number" disabled={!isEditing} className="input-field disabled:bg-gray-100" {...register('height')} />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Preferred Donation Type</label>
                <select disabled={!isEditing} className="input-field disabled:bg-gray-100" {...register('preferredDonationType')}>
                  <option value="whole_blood">Whole Blood</option>
                  <option value="platelets">Platelets</option>
                  <option value="plasma">Plasma</option>
                  <option value="double_red_cells">Double Red Cells</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Max Travel Distance (km)</label>
                <input type="number" disabled={!isEditing} className="input-field disabled:bg-gray-100" {...register('maxTravelDistance')} />
              </div>
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-2">Street Address</label>
                <input type="text" disabled={!isEditing} className="input-field disabled:bg-gray-100" {...register('addressStreet')} />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">City</label>
                <input type="text" disabled={!isEditing} className="input-field disabled:bg-gray-100" {...register('addressCity')} />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">State</label>
                <input type="text" disabled={!isEditing} className="input-field disabled:bg-gray-100" {...register('addressState')} />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Zip Code</label>
                <input type="text" disabled={!isEditing} className="input-field disabled:bg-gray-100" {...register('addressZipCode')} />
              </div>
            </div>

            {isEditing && (
              <div className="mt-6 flex justify-end">
                <button type="submit" disabled={loading} className="btn-primary">
                  {loading ? 'Saving...' : 'Save Changes'}
                </button>
              </div>
            )}
          </form>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }} className="space-y-6">
          <div className="glass-card p-6">
            <h3 className="text-xl font-semibold text-gray-800 mb-4">Eligibility</h3>
            <div className="space-y-3">
              <div className="flex justify-between">
                <span className="text-gray-500">Current status</span>
                <span className="font-medium text-gray-800">{donorStats?.isEligible ? 'Eligible' : 'Cooling off'}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">Last donation</span>
                <span className="font-medium text-gray-800">
                  {donorStats?.lastDonationDate ? new Date(donorStats.lastDonationDate).toLocaleDateString() : 'No completed donation yet'}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">Next eligible date</span>
                <span className="font-medium text-gray-800">
                  {donorStats?.nextEligibleDate ? new Date(donorStats.nextEligibleDate).toLocaleDateString() : 'Available now'}
                </span>
              </div>
            </div>
          </div>

          <div className="glass-card p-6">
            <div className="flex justify-between items-center mb-4">
              <div>
                <h3 className="text-xl font-semibold text-gray-800">Achievements</h3>
                <p className="text-gray-500 text-sm">Milestones based on real completed donations.</p>
              </div>
              <div className="text-right">
                <p className="text-2xl font-bold text-primary-600">
                  {achievements.filter((achievement) => achievement.unlocked).length}/{achievements.length}
                </p>
                <p className="text-sm text-gray-500">Unlocked</p>
              </div>
            </div>

            <div className="space-y-4">
              {achievements.map((achievement) => (
                <div key={achievement.name} className={`p-4 rounded-xl border ${achievement.unlocked ? 'border-primary-200 bg-primary-50' : 'border-gray-200 bg-gray-50'}`}>
                  <div className="flex justify-between items-start gap-4">
                    <div>
                      <h4 className="font-semibold text-gray-800">{achievement.name}</h4>
                      <p className="text-sm text-gray-500">{achievement.description}</p>
                    </div>
                    <span className={`text-sm font-medium ${achievement.unlocked ? 'text-green-600' : 'text-gray-500'}`}>
                      {achievement.unlocked ? 'Unlocked' : `${achievement.progress}/${achievement.threshold}`}
                    </span>
                  </div>
                  {!achievement.unlocked && (
                    <div className="mt-3 w-full bg-gray-200 rounded-full h-2">
                      <div className="bg-primary-500 h-2 rounded-full" style={{ width: `${Math.min(100, (achievement.progress / achievement.threshold) * 100)}%` }} />
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default DonorProfile;
