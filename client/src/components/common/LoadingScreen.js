import React from 'react';
import { motion } from 'framer-motion';

const LoadingScreen = ({ message = 'Loading...' }) => {
  return (
    <div className="fixed inset-0 bg-gradient-to-br from-primary-50 via-white to-secondary-50 flex items-center justify-center z-50">
      <div className="text-center">
        {/* Animated Blood Drop */}
        <motion.div
          className="relative mx-auto mb-8"
          style={{ width: 80, height: 100 }}
        >
          {/* Drop Shape */}
          <motion.svg
            viewBox="0 0 80 100"
            className="w-full h-full"
            initial={{ scale: 0.8, opacity: 0.5 }}
            animate={{ 
              scale: [0.8, 1, 0.8],
              opacity: [0.5, 1, 0.5]
            }}
            transition={{
              duration: 1.5,
              repeat: Infinity,
              ease: "easeInOut"
            }}
          >
            <defs>
              <linearGradient id="bloodGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#DC2626" />
                <stop offset="50%" stopColor="#B91C1C" />
                <stop offset="100%" stopColor="#991B1B" />
              </linearGradient>
              <filter id="glow">
                <feGaussianBlur stdDeviation="2" result="coloredBlur"/>
                <feMerge>
                  <feMergeNode in="coloredBlur"/>
                  <feMergeNode in="SourceGraphic"/>
                </feMerge>
              </filter>
            </defs>
            <path
              d="M40 5 C40 5 10 50 10 70 C10 88 23 95 40 95 C57 95 70 88 70 70 C70 50 40 5 40 5"
              fill="url(#bloodGradient)"
              filter="url(#glow)"
            />
            {/* Highlight */}
            <ellipse
              cx="30"
              cy="55"
              rx="8"
              ry="12"
              fill="rgba(255,255,255,0.3)"
              transform="rotate(-20 30 55)"
            />
          </motion.svg>

          {/* Pulse Ring */}
          <motion.div
            className="absolute inset-0 rounded-full border-2 border-primary-400"
            style={{ 
              top: '50%', 
              left: '50%', 
              transform: 'translate(-50%, -50%)',
              width: 60,
              height: 60
            }}
            initial={{ scale: 0.8, opacity: 1 }}
            animate={{ scale: 1.5, opacity: 0 }}
            transition={{
              duration: 1.5,
              repeat: Infinity,
              ease: "easeOut"
            }}
          />
        </motion.div>

        {/* Loading Text */}
        <motion.h2
          className="text-2xl font-bold text-gray-800 mb-2"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          {message}
        </motion.h2>

        {/* Loading Dots */}
        <div className="flex justify-center space-x-2">
          {[0, 1, 2].map((i) => (
            <motion.div
              key={i}
              className="w-3 h-3 bg-primary-500 rounded-full"
              initial={{ opacity: 0.3 }}
              animate={{ opacity: [0.3, 1, 0.3] }}
              transition={{
                duration: 1,
                repeat: Infinity,
                delay: i * 0.2
              }}
            />
          ))}
        </div>

        {/* Tagline */}
        <motion.p
          className="text-gray-500 mt-4 text-sm"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
        >
          Every drop counts. Every life matters.
        </motion.p>
      </div>
    </div>
  );
};

export default LoadingScreen;
