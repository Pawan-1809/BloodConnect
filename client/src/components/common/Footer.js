import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { FaDroplet, FaFacebook, FaTwitter, FaInstagram, FaLinkedin, FaGithub } from 'react-icons/fa6';
import { HiMail, HiPhone, HiLocationMarker, HiHeart } from 'react-icons/hi';

const Footer = () => {
  const currentYear = new Date().getFullYear();

  const footerLinks = {
    platform: [
      { name: 'About Us', path: '/about' },
      { name: 'How It Works', path: '/how-it-works' },
      { name: 'Hospitals', path: '/hospitals' },
      { name: 'Blood Drives', path: '/schedules' },
      { name: 'Leaderboard', path: '/leaderboard' }
    ],
    resources: [
      { name: 'Blood Types Guide', path: '/resources/blood-types' },
      { name: 'Eligibility Check', path: '/resources/eligibility' },
      { name: 'Donation Process', path: '/resources/donation-process' },
      { name: 'FAQs', path: '/faqs' },
      { name: 'Blog', path: '/blog' }
    ],
    legal: [
      { name: 'Privacy Policy', path: '/privacy' },
      { name: 'Terms of Service', path: '/terms' },
      { name: 'Cookie Policy', path: '/cookies' },
      { name: 'Data Protection', path: '/data-protection' }
    ],
    support: [
      { name: 'Help Center', path: '/help' },
      { name: 'Contact Us', path: '/contact' },
      { name: 'Report Issue', path: '/report' },
      { name: 'Partner With Us', path: '/partners' }
    ]
  };

  const socialLinks = [
    { name: 'Facebook', icon: FaFacebook, url: 'https://facebook.com' },
    { name: 'Twitter', icon: FaTwitter, url: 'https://twitter.com' },
    { name: 'Instagram', icon: FaInstagram, url: 'https://instagram.com' },
    { name: 'LinkedIn', icon: FaLinkedin, url: 'https://linkedin.com' },
    { name: 'GitHub', icon: FaGithub, url: 'https://github.com' }
  ];

  return (
    <footer className="bg-gray-900 text-gray-300">
      {/* Main Footer */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-8">
          {/* Brand Section */}
          <div className="lg:col-span-2">
            <Link to="/" className="flex items-center space-x-2 mb-4">
              <motion.div whileHover={{ scale: 1.1 }}>
                <FaDroplet className="h-8 w-8 text-primary-500" />
              </motion.div>
              <span className="text-xl font-bold text-white">BloodConnect</span>
            </Link>
            <p className="text-gray-400 mb-6 leading-relaxed">
              Connecting lives through the gift of blood donation. Join our community of heroes 
              saving lives every day.
            </p>
            
            {/* Contact Info */}
            <div className="space-y-3">
              <a href="mailto:pawankr16123114@gmail.com" className="flex items-center text-gray-400 hover:text-white transition-colors">
                <HiMail className="h-5 w-5 mr-3 text-primary-500" />
                pawankr16123114@gmail.com
              </a>
              <a href="tel:+917857917511" className="flex items-center text-gray-400 hover:text-white transition-colors">
                <HiPhone className="h-5 w-5 mr-3 text-primary-500" />
                +91 78579 17511
              </a>
              <p className="flex items-center text-gray-400">
                <HiLocationMarker className="h-5 w-5 mr-3 text-primary-500" />
                390 RR Plot, Nirvana Cooperative Society, Anandapur, Kolkata
              </p>
            </div>

            {/* Social Links */}
            <div className="flex space-x-4 mt-6">
              {socialLinks.map((social) => (
                <motion.a
                  key={social.name}
                  href={social.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  whileHover={{ scale: 1.1, y: -2 }}
                  whileTap={{ scale: 0.95 }}
                  className="w-10 h-10 bg-gray-800 hover:bg-primary-600 rounded-lg flex items-center justify-center transition-colors"
                >
                  <social.icon className="h-5 w-5" />
                </motion.a>
              ))}
            </div>
          </div>

          {/* Platform Links */}
          <div>
            <h3 className="text-white font-semibold mb-4">Platform</h3>
            <ul className="space-y-3">
              {footerLinks.platform.map((link) => (
                <li key={link.name}>
                  <Link
                    to={link.path}
                    className="text-gray-400 hover:text-white transition-colors"
                  >
                    {link.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Resources Links */}
          <div>
            <h3 className="text-white font-semibold mb-4">Resources</h3>
            <ul className="space-y-3">
              {footerLinks.resources.map((link) => (
                <li key={link.name}>
                  <Link
                    to={link.path}
                    className="text-gray-400 hover:text-white transition-colors"
                  >
                    {link.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Legal Links */}
          <div>
            <h3 className="text-white font-semibold mb-4">Legal</h3>
            <ul className="space-y-3">
              {footerLinks.legal.map((link) => (
                <li key={link.name}>
                  <Link
                    to={link.path}
                    className="text-gray-400 hover:text-white transition-colors"
                  >
                    {link.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Support Links */}
          <div>
            <h3 className="text-white font-semibold mb-4">Support</h3>
            <ul className="space-y-3">
              {footerLinks.support.map((link) => (
                <li key={link.name}>
                  <Link
                    to={link.path}
                    className="text-gray-400 hover:text-white transition-colors"
                  >
                    {link.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>

      {/* Newsletter Section */}
      <div className="border-t border-gray-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="flex flex-col lg:flex-row items-center justify-between gap-6">
            <div>
              <h3 className="text-lg font-semibold text-white mb-1">Stay Updated</h3>
              <p className="text-gray-400">Subscribe to our newsletter for blood donation tips and updates.</p>
            </div>
            <form className="flex w-full lg:w-auto">
              <input
                type="email"
                placeholder="Enter your email"
                className="flex-1 lg:w-64 px-4 py-3 bg-gray-800 border border-gray-700 rounded-l-lg text-white placeholder-gray-500 focus:outline-none focus:border-primary-500 transition-colors"
              />
              <motion.button
                type="submit"
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className="px-6 py-3 bg-primary-600 hover:bg-primary-700 text-white font-medium rounded-r-lg transition-colors"
              >
                Subscribe
              </motion.button>
            </form>
          </div>
        </div>
      </div>

      {/* Bottom Bar */}
      <div className="border-t border-gray-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <p className="text-gray-400 text-sm">
              © {currentYear} BloodConnect. All rights reserved.
            </p>
            <p className="text-gray-400 text-sm flex items-center">
              Made with <HiHeart className="h-4 w-4 text-primary-500 mx-1" /> for saving lives
            </p>
            <div className="flex items-center space-x-4 text-sm">
              <Link to="/privacy" className="text-gray-400 hover:text-white transition-colors">
                Privacy
              </Link>
              <span className="text-gray-600">•</span>
              <Link to="/terms" className="text-gray-400 hover:text-white transition-colors">
                Terms
              </Link>
              <span className="text-gray-600">•</span>
              <Link to="/cookies" className="text-gray-400 hover:text-white transition-colors">
                Cookies
              </Link>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
