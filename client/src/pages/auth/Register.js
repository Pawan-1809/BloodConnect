import React, { useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useForm } from 'react-hook-form';
import { useAuth } from '../../context/AuthContext';
import { FaDroplet, FaEye, FaEyeSlash, FaUser, FaHospital, FaHandHoldingMedical } from 'react-icons/fa6';
import { HiMail, HiLockClosed, HiUser, HiPhone, HiArrowRight, HiArrowLeft } from 'react-icons/hi';

const Register = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { register: registerUser, loading } = useAuth();
  
  const [step, setStep] = useState(1);
  const [selectedRole, setSelectedRole] = useState(searchParams.get('role') || null);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
    trigger
  } = useForm();

  const password = watch('password');

  const roles = [
    {
      id: 'donor',
      title: 'Blood Donor',
      description: 'Register to donate blood and save lives',
      icon: FaUser,
      color: 'primary'
    },
    {
      id: 'receiver',
      title: 'Blood Receiver',
      description: 'Request blood when you or someone needs it',
      icon: FaHandHoldingMedical,
      color: 'secondary'
    },
    {
      id: 'hospital',
      title: 'Hospital/Blood Bank',
      description: 'Manage blood inventory and requests',
      icon: FaHospital,
      color: 'blue'
    }
  ];

  const bloodTypes = ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'];

  const handleRoleSelect = (role) => {
    setSelectedRole(role);
    setStep(2);
  };

  const handleNext = async () => {
    const fieldsToValidate = step === 2 
      ? ['firstName', 'lastName', 'email', 'phone'] 
      : ['password', 'confirmPassword'];
    
    const isValid = await trigger(fieldsToValidate);
    if (isValid) {
      setStep(step + 1);
    }
  };

  const onSubmit = async (data) => {
    const userData = {
      firstName: data.firstName,
      lastName: data.lastName,
      email: data.email,
      phone: data.phone,
      password: data.password,
      role: selectedRole,
      ...(selectedRole === 'donor' && { bloodGroup: data.bloodGroup })
    };

    const result = await registerUser(userData);
    if (result?.success) {
      navigate(`/${selectedRole}/dashboard`);
    }
  };

  return (
    <div className="min-h-screen flex">
      {/* Left Side - Form */}
      <div className="flex-1 flex items-center justify-center p-8 bg-white">
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5 }}
          className="w-full max-w-lg"
        >
          {/* Logo */}
          <Link to="/" className="flex items-center space-x-2 mb-8">
            <FaDroplet className="h-8 w-8 text-primary-600" />
            <span className="text-2xl font-bold bg-gradient-to-r from-primary-600 to-primary-800 bg-clip-text text-transparent">
              BloodConnect
            </span>
          </Link>

          {/* Progress Steps */}
          <div className="mb-8">
            <div className="flex items-center justify-between mb-2">
              {[1, 2, 3].map((s) => (
                <div
                  key={s}
                  className={`flex items-center ${s < 3 ? 'flex-1' : ''}`}
                >
                  <div
                    className={`w-10 h-10 rounded-full flex items-center justify-center font-semibold transition-colors ${
                      step >= s
                        ? 'bg-primary-600 text-white'
                        : 'bg-gray-200 text-gray-500'
                    }`}
                  >
                    {s}
                  </div>
                  {s < 3 && (
                    <div
                      className={`flex-1 h-1 mx-2 rounded transition-colors ${
                        step > s ? 'bg-primary-600' : 'bg-gray-200'
                      }`}
                    />
                  )}
                </div>
              ))}
            </div>
            <div className="flex justify-between text-sm">
              <span className={step >= 1 ? 'text-primary-600 font-medium' : 'text-gray-500'}>Role</span>
              <span className={step >= 2 ? 'text-primary-600 font-medium' : 'text-gray-500'}>Info</span>
              <span className={step >= 3 ? 'text-primary-600 font-medium' : 'text-gray-500'}>Security</span>
            </div>
          </div>

          {/* Step 1: Role Selection */}
          {step === 1 && (
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
            >
              <h1 className="text-2xl font-bold text-gray-900 mb-2">Choose Your Role</h1>
              <p className="text-gray-600 mb-6">Select how you want to use BloodConnect</p>

              <div className="space-y-4">
                {roles.map((role) => (
                  <motion.button
                    key={role.id}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => handleRoleSelect(role.id)}
                    className={`w-full p-4 rounded-xl border-2 text-left transition-all ${
                      selectedRole === role.id
                        ? 'border-primary-500 bg-primary-50'
                        : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
                    }`}
                  >
                    <div className="flex items-center gap-4">
                      <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${
                        role.color === 'primary' ? 'bg-primary-100' :
                        role.color === 'secondary' ? 'bg-secondary-100' : 'bg-blue-100'
                      }`}>
                        <role.icon className={`h-6 w-6 ${
                          role.color === 'primary' ? 'text-primary-600' :
                          role.color === 'secondary' ? 'text-secondary-600' : 'text-blue-600'
                        }`} />
                      </div>
                      <div>
                        <p className="font-semibold text-gray-900">{role.title}</p>
                        <p className="text-sm text-gray-500">{role.description}</p>
                      </div>
                    </div>
                  </motion.button>
                ))}
              </div>

              <p className="mt-6 text-center text-gray-600">
                Already have an account?{' '}
                <Link to="/login" className="text-primary-600 hover:text-primary-700 font-semibold">
                  Sign in
                </Link>
              </p>
            </motion.div>
          )}

          {/* Step 2: Personal Information */}
          {step === 2 && (
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
            >
              <button
                onClick={() => setStep(1)}
                className="flex items-center text-gray-600 hover:text-gray-900 mb-4"
              >
                <HiArrowLeft className="mr-2" />
                Back
              </button>

              <h1 className="text-2xl font-bold text-gray-900 mb-2">Personal Information</h1>
              <p className="text-gray-600 mb-6">Tell us about yourself</p>

              <form className="space-y-4">
                {/* Name Row */}
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      First Name
                    </label>
                    <div className="relative">
                      <HiUser className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                      <input
                        type="text"
                        {...register('firstName', { required: 'First name is required' })}
                        className={`input pl-11 ${errors.firstName ? 'border-red-500' : ''}`}
                        placeholder="John"
                      />
                    </div>
                    {errors.firstName && (
                      <p className="mt-1 text-sm text-red-600">{errors.firstName.message}</p>
                    )}
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Last Name
                    </label>
                    <input
                      type="text"
                      {...register('lastName', { required: 'Last name is required' })}
                      className={`input ${errors.lastName ? 'border-red-500' : ''}`}
                      placeholder="Doe"
                    />
                    {errors.lastName && (
                      <p className="mt-1 text-sm text-red-600">{errors.lastName.message}</p>
                    )}
                  </div>
                </div>

                {/* Email */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Email Address
                  </label>
                  <div className="relative">
                    <HiMail className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                    <input
                      type="email"
                      {...register('email', {
                        required: 'Email is required',
                        pattern: {
                          value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                          message: 'Invalid email address'
                        }
                      })}
                      className={`input pl-11 ${errors.email ? 'border-red-500' : ''}`}
                      placeholder="john@example.com"
                    />
                  </div>
                  {errors.email && (
                    <p className="mt-1 text-sm text-red-600">{errors.email.message}</p>
                  )}
                </div>

                {/* Phone */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Phone Number
                  </label>
                  <div className="relative">
                    <HiPhone className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                    <input
                      type="tel"
                      {...register('phone', {
                        required: 'Phone number is required',
                        pattern: {
                          value: /^[+]?[\d\s-]{10,}$/,
                          message: 'Invalid phone number'
                        }
                      })}
                      className={`input pl-11 ${errors.phone ? 'border-red-500' : ''}`}
                      placeholder="+1 234 567 8900"
                    />
                  </div>
                  {errors.phone && (
                    <p className="mt-1 text-sm text-red-600">{errors.phone.message}</p>
                  )}
                </div>

                {/* Blood Type for Donors */}
                {selectedRole === 'donor' && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Blood Type
                    </label>
                    <div className="grid grid-cols-4 gap-2">
                      {bloodTypes.map((type) => (
                        <label
                          key={type}
                          className={`flex items-center justify-center p-3 rounded-lg border-2 cursor-pointer transition-all ${
                            watch('bloodGroup') === type
                              ? 'border-primary-500 bg-primary-50 text-primary-700'
                              : 'border-gray-200 hover:border-gray-300'
                          }`}
                        >
                          <input
                            type="radio"
                            value={type}
                            {...register('bloodGroup', { required: selectedRole === 'donor' ? 'Blood type is required' : false })}
                            className="sr-only"
                          />
                          <span className="font-semibold">{type}</span>
                        </label>
                      ))}
                    </div>
                    {errors.bloodGroup && (
                      <p className="mt-1 text-sm text-red-600">{errors.bloodGroup.message}</p>
                    )}
                  </div>
                )}

                <motion.button
                  type="button"
                  onClick={handleNext}
                  whileHover={{ scale: 1.01 }}
                  whileTap={{ scale: 0.99 }}
                  className="btn-primary w-full py-3 flex items-center justify-center gap-2 group mt-6"
                >
                  Continue
                  <HiArrowRight className="group-hover:translate-x-1 transition-transform" />
                </motion.button>
              </form>
            </motion.div>
          )}

          {/* Step 3: Password */}
          {step === 3 && (
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
            >
              <button
                onClick={() => setStep(2)}
                className="flex items-center text-gray-600 hover:text-gray-900 mb-4"
              >
                <HiArrowLeft className="mr-2" />
                Back
              </button>

              <h1 className="text-2xl font-bold text-gray-900 mb-2">Create Password</h1>
              <p className="text-gray-600 mb-6">Secure your account with a strong password</p>

              <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                {/* Password */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Password
                  </label>
                  <div className="relative">
                    <HiLockClosed className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                    <input
                      type={showPassword ? 'text' : 'password'}
                      {...register('password', {
                        required: 'Password is required',
                        minLength: {
                          value: 8,
                          message: 'Password must be at least 8 characters'
                        },
                        pattern: {
                          value: /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/,
                          message: 'Must include uppercase, lowercase, and number'
                        }
                      })}
                      className={`input pl-11 pr-11 ${errors.password ? 'border-red-500' : ''}`}
                      placeholder="Create a strong password"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                    >
                      {showPassword ? <FaEyeSlash /> : <FaEye />}
                    </button>
                  </div>
                  {errors.password && (
                    <p className="mt-1 text-sm text-red-600">{errors.password.message}</p>
                  )}

                  {/* Password Strength Indicator */}
                  {password && (
                    <div className="mt-2">
                      <div className="flex gap-1">
                        <div className={`flex-1 h-1 rounded ${password.length >= 8 ? 'bg-green-500' : 'bg-gray-200'}`} />
                        <div className={`flex-1 h-1 rounded ${/[A-Z]/.test(password) ? 'bg-green-500' : 'bg-gray-200'}`} />
                        <div className={`flex-1 h-1 rounded ${/[a-z]/.test(password) ? 'bg-green-500' : 'bg-gray-200'}`} />
                        <div className={`flex-1 h-1 rounded ${/\d/.test(password) ? 'bg-green-500' : 'bg-gray-200'}`} />
                      </div>
                      <p className="text-xs text-gray-500 mt-1">
                        Use 8+ characters with uppercase, lowercase, and numbers
                      </p>
                    </div>
                  )}
                </div>

                {/* Confirm Password */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Confirm Password
                  </label>
                  <div className="relative">
                    <HiLockClosed className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                    <input
                      type={showConfirmPassword ? 'text' : 'password'}
                      {...register('confirmPassword', {
                        required: 'Please confirm your password',
                        validate: value => value === password || 'Passwords do not match'
                      })}
                      className={`input pl-11 pr-11 ${errors.confirmPassword ? 'border-red-500' : ''}`}
                      placeholder="Confirm your password"
                    />
                    <button
                      type="button"
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                      className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                    >
                      {showConfirmPassword ? <FaEyeSlash /> : <FaEye />}
                    </button>
                  </div>
                  {errors.confirmPassword && (
                    <p className="mt-1 text-sm text-red-600">{errors.confirmPassword.message}</p>
                  )}
                </div>

                {/* Terms */}
                <div className="flex items-start">
                  <input
                    type="checkbox"
                    {...register('terms', { required: 'You must accept the terms' })}
                    className="w-4 h-4 mt-1 text-primary-600 border-gray-300 rounded focus:ring-primary-500"
                  />
                  <label className="ml-2 text-sm text-gray-600">
                    I agree to the{' '}
                    <Link to="/terms" className="text-primary-600 hover:underline">Terms of Service</Link>
                    {' '}and{' '}
                    <Link to="/privacy" className="text-primary-600 hover:underline">Privacy Policy</Link>
                  </label>
                </div>
                {errors.terms && (
                  <p className="text-sm text-red-600">{errors.terms.message}</p>
                )}

                <motion.button
                  type="submit"
                  disabled={loading}
                  whileHover={{ scale: 1.01 }}
                  whileTap={{ scale: 0.99 }}
                  className="btn-primary w-full py-3 flex items-center justify-center gap-2 group mt-6"
                >
                  {loading ? (
                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  ) : (
                    <>
                      Create Account
                      <HiArrowRight className="group-hover:translate-x-1 transition-transform" />
                    </>
                  )}
                </motion.button>
              </form>
            </motion.div>
          )}
        </motion.div>
      </div>

      {/* Right Side - Image/Illustration */}
      <div className="hidden lg:flex flex-1 bg-gradient-to-br from-secondary-600 to-secondary-800 items-center justify-center p-12 relative overflow-hidden">
        {/* Background Elements */}
        <div className="absolute inset-0 overflow-hidden">
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 50, repeat: Infinity, ease: "linear" }}
            className="absolute -top-20 -right-20 w-80 h-80 bg-secondary-400 rounded-full opacity-20"
          />
          <motion.div
            animate={{ rotate: -360 }}
            transition={{ duration: 40, repeat: Infinity, ease: "linear" }}
            className="absolute -bottom-20 -left-20 w-60 h-60 bg-secondary-400 rounded-full opacity-20"
          />
        </div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.2 }}
          className="relative text-center text-white max-w-lg"
        >
          {/* Illustration */}
          <motion.div
            animate={{ y: [0, -10, 0] }}
            transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
            className="mb-8"
          >
            <div className="relative w-48 h-48 mx-auto">
              <div className="absolute inset-0 bg-white/20 rounded-full animate-pulse" />
              <div className="absolute inset-4 bg-white/30 rounded-full" />
              <div className="absolute inset-8 bg-white rounded-full flex items-center justify-center">
                <FaDroplet className="h-16 w-16 text-secondary-600" />
              </div>
            </div>
          </motion.div>

          <h2 className="text-3xl font-bold mb-4">Join Our Community</h2>
          <p className="text-secondary-100 text-lg mb-8">
            Become part of a network that connects donors, patients, and hospitals. 
            Together, we can ensure no one waits for life-saving blood.
          </p>

          {/* Features */}
          <div className="space-y-4 text-left">
            <div className="flex items-center gap-4 bg-white/10 rounded-xl p-4">
              <div className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center">
                ✓
              </div>
              <p>Quick and easy registration process</p>
            </div>
            <div className="flex items-center gap-4 bg-white/10 rounded-xl p-4">
              <div className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center">
                ✓
              </div>
              <p>Connect with nearby donors and hospitals</p>
            </div>
            <div className="flex items-center gap-4 bg-white/10 rounded-xl p-4">
              <div className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center">
                ✓
              </div>
              <p>Track your donations and earn rewards</p>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default Register;
