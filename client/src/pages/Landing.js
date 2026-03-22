import React, { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import CountUp from 'react-countup';
import {
  FaBell,
  FaClock,
  FaDroplet,
  FaHandHoldingHeart,
  FaHeart,
  FaHospital,
  FaLocationDot,
  FaMedal,
  FaShieldHalved,
  FaUserGroup
} from 'react-icons/fa6';
import { HiArrowRight, HiCheck } from 'react-icons/hi';
import { Navbar, Footer } from '../components/common';
import { statsAPI } from '../services/api';

const EMPTY_STATS = {
  generatedAt: null,
  completedDonations: 0,
  livesImpacted: 0,
  availableDonors: 0,
  verifiedHospitals: 0,
  activeRequests: 0,
  urgentRequests: 0,
  upcomingDrives: 0,
  donationsToday: 0
};

const Landing = () => {
  const [platformStats, setPlatformStats] = useState(EMPTY_STATS);
  const [statsLoading, setStatsLoading] = useState(true);

  const features = [
    {
      icon: FaLocationDot,
      title: 'Find Nearby Donors',
      description: 'Locate blood donors in your area with live availability and compatibility-aware discovery.',
      color: 'primary'
    },
    {
      icon: FaClock,
      title: 'Quick Emergency Response',
      description: 'Critical requests can be broadcast fast so compatible donors and hospitals can act without delay.',
      color: 'secondary'
    },
    {
      icon: FaShieldHalved,
      title: 'Verified and Secure',
      description: 'BloodConnect is designed around verified participation, clear workflows, and safer coordination.',
      color: 'primary'
    },
    {
      icon: FaMedal,
      title: 'Meaningful Recognition',
      description: 'Contribution history, consistency, and real donation outcomes can power trust and recognition.',
      color: 'secondary'
    },
    {
      icon: FaBell,
      title: 'Actionable Notifications',
      description: 'Stay informed about matching requests, eligibility changes, and upcoming donation drives.',
      color: 'primary'
    },
    {
      icon: FaHandHoldingHeart,
      title: 'Simple Scheduling',
      description: 'Hospitals and donors can coordinate appointments and public drives from one place.',
      color: 'secondary'
    }
  ];

  const steps = [
    {
      step: 1,
      title: 'Register With The Right Role',
      description: 'Join as a donor, receiver, hospital, or admin so the platform can show the right workflow from day one.',
      icon: FaUserGroup
    },
    {
      step: 2,
      title: 'Complete Your Details',
      description: 'Add blood group, availability, contact, and operational details to improve matching and reduce delay.',
      icon: FaShieldHalved
    },
    {
      step: 3,
      title: 'Respond, Request, or Coordinate',
      description: 'Use real request data, hospital schedules, and notifications to move blood support forward quickly.',
      icon: FaHandHoldingHeart
    }
  ];

  const bloodTypes = ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'];

  const heroHighlights = useMemo(() => ([
    {
      value: platformStats.livesImpacted,
      suffix: '+',
      label: 'Potential Lives Reached'
    },
    {
      value: platformStats.availableDonors,
      suffix: '+',
      label: 'Available Donors'
    },
    {
      value: platformStats.verifiedHospitals,
      suffix: '+',
      label: 'Verified Hospitals'
    }
  ]), [platformStats.availableDonors, platformStats.livesImpacted, platformStats.verifiedHospitals]);

  const overviewStats = useMemo(() => ([
    { value: platformStats.completedDonations, suffix: '+', label: 'Completed Donations', icon: FaHeart },
    { value: platformStats.activeRequests, suffix: '', label: 'Open Requests', icon: FaHandHoldingHeart },
    { value: platformStats.urgentRequests, suffix: '', label: 'Urgent Needs', icon: FaBell },
    { value: platformStats.upcomingDrives, suffix: '', label: 'Upcoming Drives', icon: FaHospital }
  ]), [platformStats.activeRequests, platformStats.completedDonations, platformStats.upcomingDrives, platformStats.urgentRequests]);

  useEffect(() => {
    let isSubscribed = true;

    const loadStats = async ({ silent = false } = {}) => {
      if (!silent) {
        setStatsLoading(true);
      }

      try {
        const response = await statsAPI.getGlobal();
        const nextStats = response.data?.stats || EMPTY_STATS;

        if (isSubscribed) {
          setPlatformStats({
            ...EMPTY_STATS,
            ...nextStats
          });
        }
      } catch (error) {
        console.error('Unable to load landing page stats:', error);
      } finally {
        if (isSubscribed) {
          setStatsLoading(false);
        }
      }
    };

    loadStats();

    const interval = setInterval(() => {
      loadStats({ silent: true });
    }, 30000);

    return () => {
      isSubscribed = false;
      clearInterval(interval);
    };
  }, []);

  const lastUpdatedLabel = platformStats.generatedAt
    ? new Date(platformStats.generatedAt).toLocaleString()
    : 'Fetching live platform data';

  const renderMetric = (value, suffix = '') => (
    <>
      <CountUp end={value} duration={1.8} separator="," preserveValue={!statsLoading} />
      {suffix}
    </>
  );

  return (
    <div className="min-h-screen bg-white">
      <Navbar />

      <section className="relative overflow-hidden bg-gradient-to-br from-primary-50 via-white to-secondary-50 pt-20 pb-32">
        <div className="absolute inset-0 overflow-hidden">
          <motion.div
            animate={{
              scale: [1, 1.2, 1],
              rotate: [0, 180, 360]
            }}
            transition={{ duration: 20, repeat: Infinity, ease: 'linear' }}
            className="absolute -top-40 -right-40 w-96 h-96 bg-primary-100 rounded-full opacity-50 blur-3xl"
          />
          <motion.div
            animate={{
              scale: [1.2, 1, 1.2],
              rotate: [360, 180, 0]
            }}
            transition={{ duration: 25, repeat: Infinity, ease: 'linear' }}
            className="absolute -bottom-40 -left-40 w-96 h-96 bg-secondary-100 rounded-full opacity-50 blur-3xl"
          />
        </div>

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
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
                className="text-lg text-gray-600 mb-6 leading-relaxed"
              >
                BloodConnect helps donors, hospitals, and families move faster from blood need to real support.
                Explore verified hospitals, active requests, and upcoming drives from one coordinated platform.
              </motion.p>

              <motion.p
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.45 }}
                className="text-sm text-primary-700 bg-primary-50 border border-primary-100 rounded-xl px-4 py-3 inline-flex items-center"
              >
                Live platform snapshot updated from the database: {lastUpdatedLabel}
              </motion.p>

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.5 }}
                className="flex flex-col sm:flex-row gap-4 mt-8"
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

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.6 }}
                className="flex items-center gap-8 mt-10 pt-10 border-t border-gray-200"
              >
                {heroHighlights.map((highlight, index) => (
                  <React.Fragment key={highlight.label}>
                    <div>
                      <p className="text-3xl font-bold text-gray-900">
                        {renderMetric(highlight.value, highlight.suffix)}
                      </p>
                      <p className="text-sm text-gray-500">{highlight.label}</p>
                    </div>
                    {index < heroHighlights.length - 1 && <div className="h-12 w-px bg-gray-200" />}
                  </React.Fragment>
                ))}
              </motion.div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.8, delay: 0.3 }}
              className="relative hidden lg:block"
            >
              <div className="relative w-full h-[500px]">
                <motion.div
                  animate={{ y: [0, -20, 0] }}
                  transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut' }}
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
                          <feGaussianBlur stdDeviation="10" result="coloredBlur" />
                          <feMerge>
                            <feMergeNode in="coloredBlur" />
                            <feMergeNode in="SourceGraphic" />
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

                    <motion.div
                      animate={{ scale: [1, 1.5, 1], opacity: [0.5, 0, 0.5] }}
                      transition={{ duration: 2, repeat: Infinity }}
                      className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-48 h-48 rounded-full border-4 border-primary-400"
                    />
                  </div>
                </motion.div>

                <motion.div
                  animate={{ y: [0, -10, 0], rotate: [-3, 3, -3] }}
                  transition={{ duration: 5, repeat: Infinity, ease: 'easeInOut' }}
                  className="absolute top-10 left-10 glass p-4 rounded-xl shadow-xl"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-primary-100 rounded-full flex items-center justify-center">
                      <FaHeart className="text-primary-600" />
                    </div>
                    <div>
                      <p className="text-xs text-gray-500">Completed Donations</p>
                      <p className="font-semibold text-gray-900">{renderMetric(platformStats.completedDonations, '+')}</p>
                    </div>
                  </div>
                </motion.div>

                <motion.div
                  animate={{ y: [0, 10, 0], rotate: [3, -3, 3] }}
                  transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut', delay: 1 }}
                  className="absolute top-20 right-5 glass p-4 rounded-xl shadow-xl"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-secondary-100 rounded-full flex items-center justify-center">
                      <FaUserGroup className="text-secondary-600" />
                    </div>
                    <div>
                      <p className="text-xs text-gray-500">Available Donors</p>
                      <p className="font-semibold text-gray-900">{renderMetric(platformStats.availableDonors)}</p>
                    </div>
                  </div>
                </motion.div>

                <motion.div
                  animate={{ y: [0, -15, 0], rotate: [-2, 2, -2] }}
                  transition={{ duration: 6, repeat: Infinity, ease: 'easeInOut', delay: 2 }}
                  className="absolute bottom-20 left-5 glass p-4 rounded-xl shadow-xl"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-yellow-100 rounded-full flex items-center justify-center">
                      <FaBell className="text-yellow-600" />
                    </div>
                    <div>
                      <p className="text-xs text-gray-500">Urgent Needs</p>
                      <p className="font-semibold text-gray-900">{renderMetric(platformStats.urgentRequests)}</p>
                    </div>
                  </div>
                </motion.div>

                <motion.div
                  animate={{ y: [0, 8, 0], rotate: [2, -2, 2] }}
                  transition={{ duration: 4.5, repeat: Infinity, ease: 'easeInOut', delay: 0.5 }}
                  className="absolute bottom-10 right-10 glass p-4 rounded-xl shadow-xl"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center">
                      <FaHospital className="text-green-600" />
                    </div>
                    <div>
                      <p className="text-xs text-gray-500">Upcoming Drives</p>
                      <p className="font-semibold text-gray-900">{renderMetric(platformStats.upcomingDrives)}</p>
                    </div>
                  </div>
                </motion.div>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      <section className="py-16 bg-white relative -mt-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="mb-8 text-center"
          >
            <span className="text-primary-600 font-semibold text-sm uppercase tracking-wider">Live Platform Overview</span>
            <p className="text-gray-600 mt-2">These numbers are pulled from the current database state, not seeded demo content.</p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="grid grid-cols-2 lg:grid-cols-4 gap-6"
          >
            {overviewStats.map((stat, index) => (
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
                  {renderMetric(stat.value, stat.suffix)}
                </p>
                <p className="text-gray-500">{stat.label}</p>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

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
              Built For Fast, Trustworthy Blood Coordination
            </h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              BloodConnect focuses on request visibility, donor response speed, and clearer coordination between people and institutions.
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
                <div
                  className={`w-12 h-12 mb-4 rounded-xl flex items-center justify-center ${
                    feature.color === 'primary' ? 'bg-primary-100' : 'bg-secondary-100'
                  }`}
                >
                  <feature.icon
                    className={`h-6 w-6 ${
                      feature.color === 'primary' ? 'text-primary-600' : 'text-secondary-600'
                    }`}
                  />
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-2">{feature.title}</h3>
                <p className="text-gray-600">{feature.description}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

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
              How BloodConnect Works
            </h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              The platform is structured to reduce confusion, surface the right actions, and keep blood support moving.
            </p>
          </motion.div>

          <div className="grid md:grid-cols-3 gap-8 relative">
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
                  whileHover={{ scale: 1.08, rotate: 4 }}
                  className="w-20 h-20 mx-auto mb-6 bg-gradient-to-br from-primary-500 to-primary-700 rounded-2xl flex items-center justify-center shadow-lg shadow-primary-200 relative z-10"
                >
                  <step.icon className="h-9 w-9 text-white" />
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
                Blood type compatibility affects how quickly a request can be fulfilled. BloodConnect uses this information to guide safer, faster discovery.
              </p>
              <div className="space-y-4">
                <div className="flex items-center gap-3">
                  <HiCheck className="h-6 w-6 text-secondary-400" />
                  <span>Compatibility-aware donor discovery</span>
                </div>
                <div className="flex items-center gap-3">
                  <HiCheck className="h-6 w-6 text-secondary-400" />
                  <span>Live request and hospital coordination</span>
                </div>
                <div className="flex items-center gap-3">
                  <HiCheck className="h-6 w-6 text-secondary-400" />
                  <span>Medical decisions remain with qualified professionals</span>
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
                  whileHover={{ scale: 1.08, rotate: 4 }}
                  className="aspect-square bg-white/10 backdrop-blur-sm rounded-2xl flex items-center justify-center text-2xl font-bold border border-white/20 cursor-pointer hover:bg-white/20 transition-colors"
                >
                  {type}
                </motion.div>
              ))}
            </motion.div>
          </div>
        </div>
      </section>

      <section className="py-20 bg-gradient-to-r from-primary-600 via-primary-700 to-primary-800 relative overflow-hidden">
        <div className="absolute inset-0 opacity-10">
          <div
            className="absolute inset-0"
            style={{
              backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='1'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`
            }}
          />
        </div>

        <div className="relative max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <h2 className="text-3xl md:text-5xl font-bold text-white mb-6">
              Ready to Strengthen The Blood Support Network?
            </h2>
            <p className="text-xl text-primary-100 mb-10 max-w-2xl mx-auto">
              Join a platform built to reduce delay, improve visibility, and help more requests move toward real donation outcomes.
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
