import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import CountUp from 'react-countup';
import { FaDroplet, FaHeart, FaHospital, FaUserGroup, FaHandHoldingHeart, FaClock, FaLocationDot, FaShieldHalved, FaMedal, FaBell } from 'react-icons/fa6';
import { HiArrowRight, HiCheck, HiStar, HiChevronLeft, HiChevronRight } from 'react-icons/hi';
import { Navbar, Footer } from '../components/common';

const Landing = () => {
  const [currentTestimonial, setCurrentTestimonial] = useState(0);

  // Stats
  const stats = [
    { value: 15000, suffix: '+', label: 'Lives Saved', icon: FaHeart },
    { value: 8500, suffix: '+', label: 'Active Donors', icon: FaUserGroup },
    { value: 450, suffix: '+', label: 'Partner Hospitals', icon: FaHospital },
    { value: 98, suffix: '%', label: 'Success Rate', icon: FaShieldHalved }
  ];

  // Features
  const features = [
    {
      icon: FaLocationDot,
      title: 'Find Nearby Donors',
      description: 'Locate blood donors in your area with real-time availability tracking and compatibility matching.',
      color: 'primary'
    },
    {
      icon: FaClock,
      title: 'Quick Response',
      description: 'Emergency blood requests get instant notifications to all compatible donors within radius.',
      color: 'secondary'
    },
    {
      icon: FaShieldHalved,
      title: 'Verified & Secure',
      description: 'All donors and hospitals are verified. Your health data is encrypted and protected.',
      color: 'primary'
    },
    {
      icon: FaMedal,
      title: 'Rewards & Recognition',
      description: 'Earn badges, points, and climb the leaderboard as you save lives through donations.',
      color: 'secondary'
    },
    {
      icon: FaBell,
      title: 'Smart Notifications',
      description: 'Get notified about matching requests, eligibility updates, and nearby blood drives.',
      color: 'primary'
    },
    {
      icon: FaHandHoldingHeart,
      title: 'Easy Scheduling',
      description: 'Book donation appointments at partner hospitals with just a few clicks.',
      color: 'secondary'
    }
  ];

  // How it works steps
  const steps = [
    {
      step: 1,
      title: 'Register & Verify',
      description: 'Create your account as a donor or receiver. Complete verification for trust and safety.',
      icon: '📝'
    },
    {
      step: 2,
      title: 'Set Your Profile',
      description: 'Add your blood type, location, and health information. Set your availability preferences.',
      icon: '🩸'
    },
    {
      step: 3,
      title: 'Connect & Donate',
      description: 'Match with those in need or request blood when necessary. Save lives together.',
      icon: '💝'
    }
  ];

  // Testimonials
  const testimonials = [
    {
      name: 'Sarah Johnson',
      role: 'Regular Donor',
      image: 'https://randomuser.me/api/portraits/women/44.jpg',
      content: 'BloodConnect made it so easy to become a regular donor. The app notifications keep me updated about local needs, and I love earning badges for my contributions!',
      donations: 12
    },
    {
      name: 'Dr. Michael Chen',
      role: 'Hospital Administrator',
      image: 'https://randomuser.me/api/portraits/men/32.jpg',
      content: 'As a hospital, managing blood inventory was always challenging. BloodConnect streamlined our entire process and connected us with reliable donors.',
      donations: null
    },
    {
      name: 'Emily Rodriguez',
      role: 'Blood Recipient',
      image: 'https://randomuser.me/api/portraits/women/68.jpg',
      content: 'After my accident, I needed an urgent transfusion. Within hours, BloodConnect found matching donors. This platform literally saved my life.',
      donations: null
    }
  ];

  // Blood type compatibility
  const bloodTypes = ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'];

  // Auto-rotate testimonials
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentTestimonial((prev) => (prev + 1) % testimonials.length);
    }, 5000);
    return () => clearInterval(interval);
  }, [testimonials.length]);

  return (
    <div className="min-h-screen bg-white">
      <Navbar />
      
      {/* Hero Section */}
      <section className="relative overflow-hidden bg-gradient-to-br from-primary-50 via-white to-secondary-50 pt-20 pb-32">
        {/* Background Elements */}
        <div className="absolute inset-0 overflow-hidden">
          <motion.div
            animate={{ 
              scale: [1, 1.2, 1],
              rotate: [0, 180, 360]
            }}
            transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
            className="absolute -top-40 -right-40 w-96 h-96 bg-primary-100 rounded-full opacity-50 blur-3xl"
          />
          <motion.div
            animate={{ 
              scale: [1.2, 1, 1.2],
              rotate: [360, 180, 0]
            }}
            transition={{ duration: 25, repeat: Infinity, ease: "linear" }}
            className="absolute -bottom-40 -left-40 w-96 h-96 bg-secondary-100 rounded-full opacity-50 blur-3xl"
          />
        </div>

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            {/* Hero Content */}
            <motion.div
              initial={{ opacity: 0, x: -50 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8 }}
            >
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                className="inline-flex items-center px-4 py-2 bg-primary-100 text-primary-700 rounded-full text-sm font-medium mb-6"
              >
                <FaDroplet className="mr-2" />
                Every Drop Counts. Every Life Matters.
              </motion.div>
              
              <motion.h1
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
                className="text-4xl md:text-5xl lg:text-6xl font-bold text-gray-900 leading-tight mb-6"
              >
                Connect. Donate.
                <span className="block text-transparent bg-clip-text bg-gradient-to-r from-primary-600 to-primary-800">
                  Save Lives.
                </span>
              </motion.h1>
              
              <motion.p
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 }}
                className="text-lg text-gray-600 mb-8 leading-relaxed"
              >
                Join the largest blood donation network connecting donors, hospitals, 
                and those in need. Find compatible donors instantly, schedule appointments 
                seamlessly, and be part of a community saving thousands of lives.
              </motion.p>
              
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.5 }}
                className="flex flex-col sm:flex-row gap-4"
              >
                <Link
                  to="/register"
                  className="btn-primary px-8 py-4 text-lg font-semibold flex items-center justify-center group"
                >
                  Become a Donor
                  <HiArrowRight className="ml-2 group-hover:translate-x-1 transition-transform" />
                </Link>
                <Link
                  to="/register?role=receiver"
                  className="btn-secondary px-8 py-4 text-lg font-semibold flex items-center justify-center"
                >
                  Request Blood
                </Link>
              </motion.div>

              {/* Quick Stats */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.6 }}
                className="flex items-center gap-8 mt-10 pt-10 border-t border-gray-200"
              >
                <div>
                  <p className="text-3xl font-bold text-gray-900">
                    <CountUp end={15000} duration={2.5} separator="," />+
                  </p>
                  <p className="text-sm text-gray-500">Lives Saved</p>
                </div>
                <div className="h-12 w-px bg-gray-200" />
                <div>
                  <p className="text-3xl font-bold text-gray-900">
                    <CountUp end={8500} duration={2.5} separator="," />+
                  </p>
                  <p className="text-sm text-gray-500">Active Donors</p>
                </div>
                <div className="h-12 w-px bg-gray-200" />
                <div>
                  <p className="text-3xl font-bold text-gray-900">24/7</p>
                  <p className="text-sm text-gray-500">Emergency Support</p>
                </div>
              </motion.div>
            </motion.div>

            {/* Hero Image/Animation */}
            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.8, delay: 0.3 }}
              className="relative hidden lg:block"
            >
              <div className="relative w-full h-[500px]">
                {/* Main Blood Drop */}
                <motion.div
                  animate={{ y: [0, -20, 0] }}
                  transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
                  className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2"
                >
                  <div className="relative">
                    <svg width="200" height="260" viewBox="0 0 200 260" className="drop-shadow-2xl">
                      <defs>
                        <linearGradient id="heroBloodGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                          <stop offset="0%" stopColor="#EF4444" />
                          <stop offset="50%" stopColor="#DC2626" />
                          <stop offset="100%" stopColor="#B91C1C" />
                        </linearGradient>
                        <filter id="heroGlow" x="-50%" y="-50%" width="200%" height="200%">
                          <feGaussianBlur stdDeviation="10" result="coloredBlur"/>
                          <feMerge>
                            <feMergeNode in="coloredBlur"/>
                            <feMergeNode in="SourceGraphic"/>
                          </feMerge>
                        </filter>
                      </defs>
                      <path
                        d="M100 10 C100 10 20 120 20 170 C20 220 55 250 100 250 C145 250 180 220 180 170 C180 120 100 10 100 10"
                        fill="url(#heroBloodGradient)"
                        filter="url(#heroGlow)"
                      />
                      <ellipse cx="70" cy="140" rx="20" ry="30" fill="rgba(255,255,255,0.2)" transform="rotate(-15 70 140)" />
                      <path d="M85 180 L95 170 L105 180 L115 170" stroke="white" strokeWidth="3" fill="none" opacity="0.5" />
                    </svg>
                    
                    {/* Pulse Effect */}
                    <motion.div
                      animate={{ scale: [1, 1.5, 1], opacity: [0.5, 0, 0.5] }}
                      transition={{ duration: 2, repeat: Infinity }}
                      className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-48 h-48 rounded-full border-4 border-primary-400"
                    />
                  </div>
                </motion.div>

                {/* Floating Cards */}
                <motion.div
                  animate={{ y: [0, -10, 0], rotate: [-3, 3, -3] }}
                  transition={{ duration: 5, repeat: Infinity, ease: "easeInOut" }}
                  className="absolute top-10 left-10 glass p-4 rounded-xl shadow-xl"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-primary-100 rounded-full flex items-center justify-center">
                      <FaHeart className="text-primary-600" />
                    </div>
                    <div>
                      <p className="text-xs text-gray-500">New Donation</p>
                      <p className="font-semibold text-gray-900">O+ Blood</p>
                    </div>
                  </div>
                </motion.div>

                <motion.div
                  animate={{ y: [0, 10, 0], rotate: [3, -3, 3] }}
                  transition={{ duration: 4, repeat: Infinity, ease: "easeInOut", delay: 1 }}
                  className="absolute top-20 right-5 glass p-4 rounded-xl shadow-xl"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-secondary-100 rounded-full flex items-center justify-center">
                      <FaUserGroup className="text-secondary-600" />
                    </div>
                    <div>
                      <p className="text-xs text-gray-500">Donors Nearby</p>
                      <p className="font-semibold text-gray-900">24 Active</p>
                    </div>
                  </div>
                </motion.div>

                <motion.div
                  animate={{ y: [0, -15, 0], rotate: [-2, 2, -2] }}
                  transition={{ duration: 6, repeat: Infinity, ease: "easeInOut", delay: 2 }}
                  className="absolute bottom-20 left-5 glass p-4 rounded-xl shadow-xl"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center">
                      <HiCheck className="text-green-600 text-xl" />
                    </div>
                    <div>
                      <p className="text-xs text-gray-500">Request Fulfilled</p>
                      <p className="font-semibold text-gray-900">2 mins ago</p>
                    </div>
                  </div>
                </motion.div>

                <motion.div
                  animate={{ y: [0, 8, 0], rotate: [2, -2, 2] }}
                  transition={{ duration: 4.5, repeat: Infinity, ease: "easeInOut", delay: 0.5 }}
                  className="absolute bottom-10 right-10 glass p-4 rounded-xl shadow-xl"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-yellow-100 rounded-full flex items-center justify-center">
                      <FaMedal className="text-yellow-600" />
                    </div>
                    <div>
                      <p className="text-xs text-gray-500">Achievement</p>
                      <p className="font-semibold text-gray-900">Super Hero!</p>
                    </div>
                  </div>
                </motion.div>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-16 bg-white relative -mt-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="grid grid-cols-2 lg:grid-cols-4 gap-6"
          >
            {stats.map((stat, index) => (
              <motion.div
                key={stat.label}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
                className="stat-card text-center"
              >
                <div className="w-14 h-14 mx-auto mb-4 bg-primary-100 rounded-2xl flex items-center justify-center">
                  <stat.icon className="h-7 w-7 text-primary-600" />
                </div>
                <p className="text-3xl md:text-4xl font-bold text-gray-900 mb-1">
                  <CountUp end={stat.value} duration={2.5} separator="," />
                  {stat.suffix}
                </p>
                <p className="text-gray-500">{stat.label}</p>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <span className="text-primary-600 font-semibold text-sm uppercase tracking-wider">Features</span>
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mt-2 mb-4">
              Everything You Need to Save Lives
            </h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              Our platform is designed to make blood donation seamless, secure, and rewarding for everyone involved.
            </p>
          </motion.div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {features.map((feature, index) => (
              <motion.div
                key={feature.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
                whileHover={{ y: -5, scale: 1.02 }}
                className="card p-6 hover:shadow-xl transition-all duration-300"
              >
                <div className={`w-12 h-12 mb-4 rounded-xl flex items-center justify-center ${
                  feature.color === 'primary' ? 'bg-primary-100' : 'bg-secondary-100'
                }`}>
                  <feature.icon className={`h-6 w-6 ${
                    feature.color === 'primary' ? 'text-primary-600' : 'text-secondary-600'
                  }`} />
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-2">{feature.title}</h3>
                <p className="text-gray-600">{feature.description}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <span className="text-primary-600 font-semibold text-sm uppercase tracking-wider">Process</span>
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mt-2 mb-4">
              How It Works
            </h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              Getting started is easy. Follow these simple steps to begin your journey as a lifesaver.
            </p>
          </motion.div>

          <div className="grid md:grid-cols-3 gap-8 relative">
            {/* Connecting Line */}
            <div className="hidden md:block absolute top-24 left-1/4 right-1/4 h-0.5 bg-gradient-to-r from-primary-200 via-primary-400 to-primary-200" />

            {steps.map((step, index) => (
              <motion.div
                key={step.step}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.2 }}
                className="relative text-center"
              >
                <motion.div
                  whileHover={{ scale: 1.1, rotate: 5 }}
                  className="w-20 h-20 mx-auto mb-6 bg-gradient-to-br from-primary-500 to-primary-700 rounded-2xl flex items-center justify-center text-4xl shadow-lg shadow-primary-200 relative z-10"
                >
                  {step.icon}
                </motion.div>
                <span className="inline-block px-4 py-1 bg-primary-100 text-primary-700 rounded-full text-sm font-semibold mb-3">
                  Step {step.step}
                </span>
                <h3 className="text-xl font-semibold text-gray-900 mb-2">{step.title}</h3>
                <p className="text-gray-600">{step.description}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Blood Type Section */}
      <section className="py-20 bg-gradient-to-br from-primary-600 to-primary-800 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <motion.div
              initial={{ opacity: 0, x: -30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
            >
              <h2 className="text-3xl md:text-4xl font-bold mb-6">
                Know Your Blood Type
              </h2>
              <p className="text-primary-100 text-lg mb-8">
                Understanding blood type compatibility is crucial for safe transfusions. 
                Our platform automatically matches you with compatible donors or recipients.
              </p>
              <div className="space-y-4">
                <div className="flex items-center gap-3">
                  <HiCheck className="h-6 w-6 text-secondary-400" />
                  <span>Instant compatibility matching</span>
                </div>
                <div className="flex items-center gap-3">
                  <HiCheck className="h-6 w-6 text-secondary-400" />
                  <span>Real-time blood availability</span>
                </div>
                <div className="flex items-center gap-3">
                  <HiCheck className="h-6 w-6 text-secondary-400" />
                  <span>Emergency request prioritization</span>
                </div>
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, x: 30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              className="grid grid-cols-4 gap-4"
            >
              {bloodTypes.map((type, index) => (
                <motion.div
                  key={type}
                  initial={{ opacity: 0, scale: 0.8 }}
                  whileInView={{ opacity: 1, scale: 1 }}
                  viewport={{ once: true }}
                  transition={{ delay: index * 0.05 }}
                  whileHover={{ scale: 1.1, rotate: 5 }}
                  className="aspect-square bg-white/10 backdrop-blur-sm rounded-2xl flex items-center justify-center text-2xl font-bold border border-white/20 cursor-pointer hover:bg-white/20 transition-colors"
                >
                  {type}
                </motion.div>
              ))}
            </motion.div>
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <span className="text-primary-600 font-semibold text-sm uppercase tracking-wider">Testimonials</span>
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mt-2 mb-4">
              Stories That Inspire
            </h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              Hear from donors, recipients, and healthcare professionals who've experienced the impact.
            </p>
          </motion.div>

          <div className="relative max-w-4xl mx-auto">
            <AnimatePresence mode="wait">
              <motion.div
                key={currentTestimonial}
                initial={{ opacity: 0, x: 50 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -50 }}
                className="card p-8 md:p-12"
              >
                <div className="flex flex-col md:flex-row gap-8 items-center">
                  <div className="flex-shrink-0">
                    <img
                      src={testimonials[currentTestimonial].image}
                      alt={testimonials[currentTestimonial].name}
                      className="w-24 h-24 rounded-full object-cover border-4 border-primary-100"
                    />
                  </div>
                  <div className="flex-1 text-center md:text-left">
                    <div className="flex justify-center md:justify-start mb-4">
                      {[...Array(5)].map((_, i) => (
                        <HiStar key={i} className="h-5 w-5 text-yellow-400" />
                      ))}
                    </div>
                    <p className="text-gray-700 text-lg mb-6 italic">
                      "{testimonials[currentTestimonial].content}"
                    </p>
                    <div>
                      <p className="font-semibold text-gray-900">{testimonials[currentTestimonial].name}</p>
                      <p className="text-gray-500">{testimonials[currentTestimonial].role}</p>
                      {testimonials[currentTestimonial].donations && (
                        <p className="text-sm text-primary-600 mt-1">
                          {testimonials[currentTestimonial].donations} donations
                        </p>
                      )}
                    </div>
                  </div>
                </div>
              </motion.div>
            </AnimatePresence>

            {/* Navigation */}
            <div className="flex justify-center items-center gap-4 mt-8">
              <button
                onClick={() => setCurrentTestimonial((prev) => (prev - 1 + testimonials.length) % testimonials.length)}
                className="p-2 rounded-full bg-white shadow-md hover:bg-gray-50 transition-colors"
              >
                <HiChevronLeft className="h-6 w-6 text-gray-600" />
              </button>
              <div className="flex gap-2">
                {testimonials.map((_, index) => (
                  <button
                    key={index}
                    onClick={() => setCurrentTestimonial(index)}
                    className={`w-3 h-3 rounded-full transition-colors ${
                      index === currentTestimonial ? 'bg-primary-600' : 'bg-gray-300'
                    }`}
                  />
                ))}
              </div>
              <button
                onClick={() => setCurrentTestimonial((prev) => (prev + 1) % testimonials.length)}
                className="p-2 rounded-full bg-white shadow-md hover:bg-gray-50 transition-colors"
              >
                <HiChevronRight className="h-6 w-6 text-gray-600" />
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-gradient-to-r from-primary-600 via-primary-700 to-primary-800 relative overflow-hidden">
        {/* Background Pattern */}
        <div className="absolute inset-0 opacity-10">
          <div className="absolute inset-0" style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='1'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`
          }} />
        </div>

        <div className="relative max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <h2 className="text-3xl md:text-5xl font-bold text-white mb-6">
              Ready to Make a Difference?
            </h2>
            <p className="text-xl text-primary-100 mb-10 max-w-2xl mx-auto">
              Join thousands of donors and healthcare providers in our mission to ensure 
              no one ever waits too long for life-saving blood.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link
                to="/register"
                className="inline-flex items-center justify-center px-8 py-4 bg-white text-primary-700 font-semibold rounded-xl hover:bg-gray-100 transition-colors shadow-xl group"
              >
                Join as Donor
                <HiArrowRight className="ml-2 group-hover:translate-x-1 transition-transform" />
              </Link>
              <Link
                to="/register?role=hospital"
                className="inline-flex items-center justify-center px-8 py-4 bg-primary-800 text-white font-semibold rounded-xl hover:bg-primary-900 transition-colors border border-primary-500"
              >
                Register Hospital
              </Link>
            </div>
          </motion.div>
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default Landing;
