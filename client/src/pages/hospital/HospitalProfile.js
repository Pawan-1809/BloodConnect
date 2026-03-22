import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { useForm } from 'react-hook-form';
import { motion } from 'framer-motion';
import toast from 'react-hot-toast';
import { hospitalAPI } from '../../services/api';

const defaultValues = {
  name: '',
  type: 'hospital',
  registrationNumber: '',
  email: '',
  phone: '',
  emergencyPhone: '',
  website: '',
  address: {
    street: '',
    city: '',
    state: '',
    country: 'India',
    zipCode: ''
  }
};

const HospitalProfile = () => {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [profileExists, setProfileExists] = useState(false);
  const [hospital, setHospital] = useState(null);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors }
  } = useForm({ defaultValues });

  const isVerified = useMemo(() => !!hospital?.isVerified, [hospital]);

  const loadProfile = useCallback(async () => {
    setLoading(true);
    try {
      const response = await hospitalAPI.getProfile();
      const data = response.data?.hospital;

      if (!data) {
        setProfileExists(false);
        reset(defaultValues);
        return;
      }

      setProfileExists(true);
      setHospital(data);
      reset({
        name: data.name || '',
        type: data.type || 'hospital',
        registrationNumber: data.registrationNumber || '',
        email: data.email || '',
        phone: data.phone || '',
        emergencyPhone: data.emergencyPhone || '',
        website: data.website || '',
        address: {
          street: data.address?.street || '',
          city: data.address?.city || '',
          state: data.address?.state || '',
          country: data.address?.country || 'India',
          zipCode: data.address?.zipCode || ''
        }
      });
    } catch (error) {
      if (error?.response?.status === 404) {
        setProfileExists(false);
        setHospital(null);
        reset(defaultValues);
      } else {
        toast.error('Unable to load hospital profile');
      }
    } finally {
      setLoading(false);
    }
  }, [reset]);

  useEffect(() => {
    loadProfile();
  }, [loadProfile]);

  const onSubmit = async (formData) => {
    setSaving(true);
    try {
      if (!profileExists) {
        await hospitalAPI.register({
          name: formData.name,
          type: formData.type,
          registrationNumber: formData.registrationNumber,
          email: formData.email,
          phone: formData.phone,
          emergencyPhone: formData.emergencyPhone,
          website: formData.website,
          address: formData.address,
          hasBloodBank: true,
          hasDonationCenter: true,
          bloodStorageCapacity: 200
        });
        toast.success('Hospital profile created successfully');
      } else {
        await hospitalAPI.updateProfile({
          name: formData.name,
          phone: formData.phone,
          emergencyPhone: formData.emergencyPhone,
          website: formData.website,
          address: formData.address
        });
        toast.success('Hospital profile updated successfully');
      }

      await loadProfile();
    } catch (error) {
      toast.error(error?.response?.data?.message || 'Failed to save hospital profile');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="p-6 lg:p-8">
        <div className="flex items-center justify-center py-20">
          <div className="animate-spin w-12 h-12 border-4 border-primary-500 border-t-transparent rounded-full" />
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 lg:p-8">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-8"
      >
        <h1 className="text-3xl font-bold text-gray-800">Hospital Profile</h1>
        <p className="text-gray-600 mt-1">
          {profileExists
            ? 'Update your hospital details shown across the platform.'
            : 'Complete your hospital profile to activate stock and request operations.'}
        </p>
      </motion.div>

      {profileExists && hospital && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.05 }}
          className="glass-card p-5 mb-6"
        >
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3">
            <div>
              <h2 className="text-xl font-semibold text-gray-800">{hospital.name}</h2>
              <p className="text-sm text-gray-500 mt-1">Registration: {hospital.registrationNumber || 'Not provided'}</p>
            </div>
            <span className={`px-3 py-1 rounded-full text-sm font-medium ${isVerified ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'}`}>
              {isVerified ? 'Verified Hospital' : 'Verification Pending'}
            </span>
          </div>
        </motion.div>
      )}

      <motion.form
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        onSubmit={handleSubmit(onSubmit)}
        className="glass-card p-6 space-y-6"
      >
        {!profileExists && (
          <div className="p-4 rounded-xl bg-blue-50 border border-blue-200 text-blue-700 text-sm">
            This is your first login as hospital. Please provide complete hospital details to continue.
          </div>
        )}

        <div className="grid md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Hospital Name</label>
            <input
              className="input-field"
              {...register('name', { required: 'Hospital name is required' })}
              placeholder="Enter hospital name"
            />
            {errors.name && <p className="text-red-500 text-sm mt-1">{errors.name.message}</p>}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Hospital Type</label>
            <select className="input-field" disabled={profileExists} {...register('type', { required: 'Type is required' })}>
              <option value="hospital">Hospital</option>
              <option value="blood_bank">Blood Bank</option>
              <option value="clinic">Clinic</option>
              <option value="donation_center">Donation Center</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Registration Number</label>
            <input
              className="input-field"
              disabled={profileExists}
              {...register('registrationNumber', { required: 'Registration number is required' })}
              placeholder="Registration number"
            />
            {errors.registrationNumber && <p className="text-red-500 text-sm mt-1">{errors.registrationNumber.message}</p>}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Official Email</label>
            <input
              type="email"
              className="input-field"
              disabled={profileExists}
              {...register('email', { required: 'Email is required' })}
              placeholder="hospital@example.com"
            />
            {errors.email && <p className="text-red-500 text-sm mt-1">{errors.email.message}</p>}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Phone</label>
            <input
              className="input-field"
              {...register('phone', { required: 'Phone is required' })}
              placeholder="Primary phone"
            />
            {errors.phone && <p className="text-red-500 text-sm mt-1">{errors.phone.message}</p>}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Emergency Phone</label>
            <input className="input-field" {...register('emergencyPhone')} placeholder="Emergency contact" />
          </div>

          <div className="md:col-span-2">
            <label className="block text-sm font-medium text-gray-700 mb-1">Website</label>
            <input className="input-field" {...register('website')} placeholder="https://example.org" />
          </div>
        </div>

        <div>
          <h3 className="text-lg font-semibold text-gray-800 mb-3">Address</h3>
          <div className="grid md:grid-cols-2 gap-4">
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-1">Street</label>
              <input className="input-field" {...register('address.street', { required: 'Street is required' })} />
              {errors.address?.street && <p className="text-red-500 text-sm mt-1">{errors.address.street.message}</p>}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">City</label>
              <input className="input-field" {...register('address.city', { required: 'City is required' })} />
              {errors.address?.city && <p className="text-red-500 text-sm mt-1">{errors.address.city.message}</p>}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">State</label>
              <input className="input-field" {...register('address.state', { required: 'State is required' })} />
              {errors.address?.state && <p className="text-red-500 text-sm mt-1">{errors.address.state.message}</p>}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Country</label>
              <input className="input-field" {...register('address.country', { required: 'Country is required' })} />
              {errors.address?.country && <p className="text-red-500 text-sm mt-1">{errors.address.country.message}</p>}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">ZIP Code</label>
              <input className="input-field" {...register('address.zipCode', { required: 'ZIP code is required' })} />
              {errors.address?.zipCode && <p className="text-red-500 text-sm mt-1">{errors.address.zipCode.message}</p>}
            </div>
          </div>
        </div>

        <div className="flex justify-end">
          <button type="submit" disabled={saving} className="btn-primary disabled:opacity-70">
            {saving ? 'Saving...' : profileExists ? 'Update Hospital Profile' : 'Create Hospital Profile'}
          </button>
        </div>
      </motion.form>
    </div>
  );
};

export default HospitalProfile;
