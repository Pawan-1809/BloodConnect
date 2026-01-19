import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useForm } from 'react-hook-form';
import { useNavigate } from 'react-router-dom';
import { requestAPI } from '../../services/api';

const bloodTypes = ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'];

const CreateRequest = () => {
  const navigate = useNavigate();
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const { register, handleSubmit, watch, formState: { errors } } = useForm();
  
  const urgency = watch('urgency');
  const bloodGroup = watch('bloodGroup');

  const onSubmit = async (data) => {
    setLoading(true);
    try {
      await requestAPI.create(data);
      setShowSuccess(true);
      setTimeout(() => {
        navigate('/receiver/requests');
      }, 3000);
    } catch (error) {
      console.error('Error creating request:', error);
    }
    setLoading(false);
  };

  const steps = [
    { id: 1, title: 'Blood Details', icon: '🩸' },
    { id: 2, title: 'Patient Info', icon: '👤' },
    { id: 3, title: 'Hospital & Timing', icon: '🏥' },
  ];

  const getCompatibleDonors = (bloodGroup) => {
    const compatibility = {
      'A+': ['A+', 'A-', 'O+', 'O-'],
      'A-': ['A-', 'O-'],
      'B+': ['B+', 'B-', 'O+', 'O-'],
      'B-': ['B-', 'O-'],
      'AB+': ['All blood types'],
      'AB-': ['A-', 'B-', 'AB-', 'O-'],
      'O+': ['O+', 'O-'],
      'O-': ['O-']
    };
    return compatibility[bloodGroup] || [];
  };

  if (showSuccess) {
    return (
      <div className="p-6 lg:p-8 flex items-center justify-center">
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              className="text-center"
            >
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ delay: 0.2, type: 'spring', stiffness: 200 }}
                className="w-24 h-24 bg-green-500 rounded-full flex items-center justify-center mx-auto mb-6"
              >
                <svg className="w-12 h-12 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                </svg>
              </motion.div>
              <h2 className="text-2xl font-bold text-gray-800 mb-2">Request Created Successfully!</h2>
              <p className="text-gray-600 mb-6">
                Your blood request has been posted. Matching donors will be notified immediately.
              </p>
              <p className="text-sm text-gray-500">Redirecting to your requests...</p>
            </motion.div>
      </div>
    );
  }

  return (
    <div className="p-6 lg:p-8">
          {/* Header */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-8"
          >
            <h1 className="text-3xl font-bold text-gray-800">Create Blood Request</h1>
            <p className="text-gray-600 mt-1">Fill in the details to find compatible donors</p>
          </motion.div>

          {/* Progress Steps */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="glass-card p-6 mb-6"
          >
            <div className="flex items-center justify-between">
              {steps.map((s, index) => (
                <React.Fragment key={s.id}>
                  <div className="flex items-center">
                    <div className={`w-12 h-12 rounded-full flex items-center justify-center text-xl transition-all ${
                      step >= s.id
                        ? 'bg-primary-500 text-white shadow-lg shadow-primary-500/30'
                        : 'bg-gray-200 text-gray-500'
                    }`}>
                      {step > s.id ? '✓' : s.icon}
                    </div>
                    <div className="ml-3 hidden sm:block">
                      <p className={`text-sm font-medium ${step >= s.id ? 'text-gray-800' : 'text-gray-500'}`}>
                        Step {s.id}
                      </p>
                      <p className={`text-xs ${step >= s.id ? 'text-gray-600' : 'text-gray-400'}`}>
                        {s.title}
                      </p>
                    </div>
                  </div>
                  {index < steps.length - 1 && (
                    <div className={`flex-1 h-1 mx-4 rounded-full ${
                      step > s.id ? 'bg-primary-500' : 'bg-gray-200'
                    }`} />
                  )}
                </React.Fragment>
              ))}
            </div>
          </motion.div>

          {/* Form */}
          <form onSubmit={handleSubmit(onSubmit)}>
            <AnimatePresence mode="wait">
              {/* Step 1: Blood Details */}
              {step === 1 && (
                <motion.div
                  key="step1"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  className="glass-card p-6"
                >
                  <h2 className="text-xl font-semibold text-gray-800 mb-6">Blood Requirements</h2>
                  
                  <div className="space-y-6">
                    {/* Blood Group Selection */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-3">
                        Blood Group Required *
                      </label>
                      <div className="grid grid-cols-4 gap-3">
                        {bloodTypes.map((type) => (
                          <label key={type} className="cursor-pointer">
                            <input
                              type="radio"
                              value={type}
                              {...register('bloodGroup', { required: 'Please select blood group' })}
                              className="hidden peer"
                            />
                            <div className="p-4 border-2 rounded-xl text-center transition-all peer-checked:border-primary-500 peer-checked:bg-primary-50 hover:border-gray-300">
                              <div className="text-2xl font-bold text-gray-800">{type}</div>
                            </div>
                          </label>
                        ))}
                      </div>
                      {errors.bloodGroup && (
                        <p className="text-red-500 text-sm mt-2">{errors.bloodGroup.message}</p>
                      )}
                      
                      {/* Compatibility Info */}
                      {bloodGroup && (
                        <motion.div
                          initial={{ opacity: 0, height: 0 }}
                          animate={{ opacity: 1, height: 'auto' }}
                          className="mt-4 p-4 bg-blue-50 rounded-xl border border-blue-200"
                        >
                          <p className="text-sm text-blue-800">
                            <strong>{bloodGroup}</strong> can receive from: {getCompatibleDonors(bloodGroup).join(', ')}
                          </p>
                        </motion.div>
                      )}
                    </div>

                    {/* Units Required */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Units Required *
                      </label>
                      <div className="flex items-center space-x-4">
                        <input
                          type="number"
                          min="1"
                          max="10"
                          defaultValue={1}
                          {...register('units', { 
                            required: 'Please enter units required',
                            min: { value: 1, message: 'Minimum 1 unit' },
                            max: { value: 10, message: 'Maximum 10 units' }
                          })}
                          className="input-field w-32"
                        />
                        <span className="text-gray-500">unit(s) of blood</span>
                      </div>
                      {errors.units && (
                        <p className="text-red-500 text-sm mt-1">{errors.units.message}</p>
                      )}
                    </div>

                    {/* Urgency Level */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-3">
                        Urgency Level *
                      </label>
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        {[
                          { value: 'critical', label: 'Critical', icon: '🚨', desc: 'Needed within 24 hours', color: 'red' },
                          { value: 'urgent', label: 'Urgent', icon: '⚠️', desc: 'Needed within 3 days', color: 'orange' },
                          { value: 'normal', label: 'Normal', icon: '📋', desc: 'Needed within a week', color: 'green' },
                        ].map((level) => (
                          <label key={level.value} className="cursor-pointer">
                            <input
                              type="radio"
                              value={level.value}
                              {...register('urgency', { required: 'Please select urgency level' })}
                              className="hidden peer"
                            />
                            <div className={`p-4 border-2 rounded-xl transition-all peer-checked:border-${level.color}-500 peer-checked:bg-${level.color}-50 hover:border-gray-300`}>
                              <div className="text-2xl mb-2">{level.icon}</div>
                              <p className="font-semibold text-gray-800">{level.label}</p>
                              <p className="text-sm text-gray-500">{level.desc}</p>
                            </div>
                          </label>
                        ))}
                      </div>
                      {errors.urgency && (
                        <p className="text-red-500 text-sm mt-2">{errors.urgency.message}</p>
                      )}
                    </div>

                    {/* Component Type */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Blood Component
                      </label>
                      <select
                        {...register('component')}
                        className="input-field"
                        defaultValue="whole"
                      >
                        <option value="whole">Whole Blood</option>
                        <option value="rbc">Red Blood Cells (RBC)</option>
                        <option value="plasma">Plasma</option>
                        <option value="platelets">Platelets</option>
                      </select>
                    </div>
                  </div>

                  <div className="mt-8 flex justify-end">
                    <button
                      type="button"
                      onClick={() => setStep(2)}
                      className="btn-primary"
                    >
                      Continue
                    </button>
                  </div>
                </motion.div>
              )}

              {/* Step 2: Patient Info */}
              {step === 2 && (
                <motion.div
                  key="step2"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  className="glass-card p-6"
                >
                  <h2 className="text-xl font-semibold text-gray-800 mb-6">Patient Information</h2>
                  
                  <div className="space-y-6">
                    {/* Patient Name */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Patient Name *
                      </label>
                      <input
                        type="text"
                        {...register('patientName', { required: 'Patient name is required' })}
                        className="input-field"
                        placeholder="Enter patient's full name"
                      />
                      {errors.patientName && (
                        <p className="text-red-500 text-sm mt-1">{errors.patientName.message}</p>
                      )}
                    </div>

                    {/* Patient Age & Gender */}
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Patient Age
                        </label>
                        <input
                          type="number"
                          {...register('patientAge')}
                          className="input-field"
                          placeholder="Age in years"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Gender
                        </label>
                        <select {...register('patientGender')} className="input-field">
                          <option value="">Select</option>
                          <option value="male">Male</option>
                          <option value="female">Female</option>
                          <option value="other">Other</option>
                        </select>
                      </div>
                    </div>

                    {/* Reason for Request */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Reason for Blood Request *
                      </label>
                      <select
                        {...register('reason', { required: 'Please select a reason' })}
                        className="input-field"
                      >
                        <option value="">Select reason</option>
                        <option value="surgery">Surgery</option>
                        <option value="accident">Accident/Trauma</option>
                        <option value="cancer">Cancer Treatment</option>
                        <option value="thalassemia">Thalassemia</option>
                        <option value="anemia">Anemia</option>
                        <option value="childbirth">Childbirth</option>
                        <option value="dengue">Dengue</option>
                        <option value="other">Other Medical Condition</option>
                      </select>
                      {errors.reason && (
                        <p className="text-red-500 text-sm mt-1">{errors.reason.message}</p>
                      )}
                    </div>

                    {/* Additional Details */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Additional Details
                      </label>
                      <textarea
                        {...register('additionalDetails')}
                        className="input-field"
                        rows={3}
                        placeholder="Any additional information for donors..."
                      />
                    </div>

                    {/* Contact Number */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Contact Number *
                      </label>
                      <input
                        type="tel"
                        {...register('contactNumber', { required: 'Contact number is required' })}
                        className="input-field"
                        placeholder="Phone number for coordination"
                      />
                      {errors.contactNumber && (
                        <p className="text-red-500 text-sm mt-1">{errors.contactNumber.message}</p>
                      )}
                    </div>

                    {/* Anonymous Option */}
                    <div className="flex items-center">
                      <input
                        type="checkbox"
                        id="anonymous"
                        {...register('anonymous')}
                        className="w-5 h-5 rounded text-primary-500 focus:ring-primary-500"
                      />
                      <label htmlFor="anonymous" className="ml-3">
                        <p className="font-medium text-gray-800">Keep patient name anonymous</p>
                        <p className="text-sm text-gray-500">Patient name will be hidden from donors until they respond</p>
                      </label>
                    </div>
                  </div>

                  <div className="mt-8 flex justify-between">
                    <button
                      type="button"
                      onClick={() => setStep(1)}
                      className="btn-secondary"
                    >
                      Back
                    </button>
                    <button
                      type="button"
                      onClick={() => setStep(3)}
                      className="btn-primary"
                    >
                      Continue
                    </button>
                  </div>
                </motion.div>
              )}

              {/* Step 3: Hospital & Timing */}
              {step === 3 && (
                <motion.div
                  key="step3"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  className="glass-card p-6"
                >
                  <h2 className="text-xl font-semibold text-gray-800 mb-6">Hospital & Timing</h2>
                  
                  <div className="space-y-6">
                    {/* Hospital Name */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Hospital / Blood Bank *
                      </label>
                      <input
                        type="text"
                        {...register('hospital', { required: 'Hospital name is required' })}
                        className="input-field"
                        placeholder="Enter hospital or blood bank name"
                      />
                      {errors.hospital && (
                        <p className="text-red-500 text-sm mt-1">{errors.hospital.message}</p>
                      )}
                    </div>

                    {/* Hospital Address */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Hospital Address *
                      </label>
                      <textarea
                        {...register('hospitalAddress', { required: 'Address is required' })}
                        className="input-field"
                        rows={2}
                        placeholder="Full address for donors to locate"
                      />
                      {errors.hospitalAddress && (
                        <p className="text-red-500 text-sm mt-1">{errors.hospitalAddress.message}</p>
                      )}
                    </div>

                    {/* City */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        City *
                      </label>
                      <input
                        type="text"
                        {...register('city', { required: 'City is required' })}
                        className="input-field"
                        placeholder="City name"
                      />
                      {errors.city && (
                        <p className="text-red-500 text-sm mt-1">{errors.city.message}</p>
                      )}
                    </div>

                    {/* Required By Date */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Required By Date *
                      </label>
                      <input
                        type="date"
                        {...register('requiredBy', { required: 'Please select required date' })}
                        className="input-field"
                        min={new Date().toISOString().split('T')[0]}
                      />
                      {errors.requiredBy && (
                        <p className="text-red-500 text-sm mt-1">{errors.requiredBy.message}</p>
                      )}
                    </div>

                    {/* Preferred Time */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Preferred Donation Time
                      </label>
                      <div className="flex flex-wrap gap-3">
                        {['Morning (8-12)', 'Afternoon (12-5)', 'Evening (5-8)', 'Any Time'].map((time) => (
                          <label key={time} className="cursor-pointer">
                            <input
                              type="radio"
                              value={time}
                              {...register('preferredTime')}
                              className="hidden peer"
                            />
                            <div className="px-4 py-2 border-2 rounded-lg transition-all peer-checked:border-primary-500 peer-checked:bg-primary-50 hover:border-gray-300">
                              {time}
                            </div>
                          </label>
                        ))}
                      </div>
                    </div>

                    {/* Summary */}
                    <div className="p-4 bg-gray-50 rounded-xl">
                      <h4 className="font-semibold text-gray-800 mb-3">Request Summary</h4>
                      <div className="grid grid-cols-2 gap-3 text-sm">
                        <div>
                          <p className="text-gray-500">Blood Group</p>
                          <p className="font-medium">{bloodGroup || '-'}</p>
                        </div>
                        <div>
                          <p className="text-gray-500">Urgency</p>
                          <p className="font-medium capitalize">{urgency || '-'}</p>
                        </div>
                        <div>
                          <p className="text-gray-500">Units</p>
                          <p className="font-medium">{watch('units') || 1}</p>
                        </div>
                        <div>
                          <p className="text-gray-500">Component</p>
                          <p className="font-medium capitalize">{watch('component') || 'Whole Blood'}</p>
                        </div>
                      </div>
                    </div>

                    {/* Terms */}
                    <div className="flex items-start">
                      <input
                        type="checkbox"
                        id="terms"
                        {...register('terms', { required: 'Please accept terms' })}
                        className="w-5 h-5 mt-1 rounded text-primary-500 focus:ring-primary-500"
                      />
                      <label htmlFor="terms" className="ml-3">
                        <p className="text-gray-700">
                          I confirm that the information provided is accurate and I understand that donors will be matched based on blood compatibility.
                        </p>
                      </label>
                    </div>
                    {errors.terms && (
                      <p className="text-red-500 text-sm">{errors.terms.message}</p>
                    )}
                  </div>

                  <div className="mt-8 flex justify-between">
                    <button
                      type="button"
                      onClick={() => setStep(2)}
                      className="btn-secondary"
                    >
                      Back
                    </button>
                    <button
                      type="submit"
                      disabled={loading}
                      className="btn-primary min-w-[160px]"
                    >
                      {loading ? (
                        <span className="flex items-center justify-center">
                          <svg className="animate-spin w-5 h-5 mr-2" viewBox="0 0 24 24">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                          </svg>
                          Creating...
                        </span>
                      ) : (
                        'Create Request'
                      )}
                    </button>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </form>
    </div>
  );
};

export default CreateRequest;
