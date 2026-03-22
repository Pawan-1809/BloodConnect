import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { HiCheckCircle, HiMail, HiPhone, HiLocationMarker, HiArrowRight } from 'react-icons/hi';
import { FaDroplet } from 'react-icons/fa6';
import publicContentData from './publicContentData';

const PublicContentPage = ({ pageKey }) => {
  const page = publicContentData[pageKey] || publicContentData.about;

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-primary-50/30">
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute -top-24 right-0 w-80 h-80 bg-primary-200/30 rounded-full blur-3xl" />
          <div className="absolute -bottom-24 left-0 w-80 h-80 bg-secondary-200/40 rounded-full blur-3xl" />
        </div>

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-14 pb-10">
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
            className="max-w-4xl"
          >
            <span className="inline-flex items-center gap-2 rounded-full bg-primary-100 text-primary-700 px-4 py-1.5 text-sm font-semibold">
              <FaDroplet className="h-4 w-4" />
              {page.badge}
            </span>
            <h1 className="mt-5 text-3xl md:text-4xl lg:text-5xl font-bold text-gray-900 leading-tight">
              {page.title}
            </h1>
            <p className="mt-5 text-base md:text-lg text-gray-600 leading-relaxed">
              {page.subtitle}
            </p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.15, duration: 0.4 }}
            className="mt-10 grid grid-cols-1 lg:grid-cols-3 gap-6"
          >
            <div className="lg:col-span-2 bg-white rounded-2xl border border-gray-100 shadow-card p-6 md:p-8">
              <h2 className="text-xl font-bold text-gray-900">Highlights</h2>
              <div className="mt-5 grid sm:grid-cols-2 gap-3">
                {page.highlights.map((item, index) => (
                  <div
                    key={`${pageKey}-highlight-${index}`}
                    className="flex items-start gap-3 rounded-xl border border-gray-100 bg-gray-50/70 p-3"
                  >
                    <HiCheckCircle className="h-5 w-5 text-primary-600 mt-0.5" />
                    <p className="text-sm text-gray-700 leading-relaxed">{item}</p>
                  </div>
                ))}
              </div>
            </div>

            <div className="bg-gradient-to-br from-primary-600 to-primary-700 rounded-2xl text-white p-6 md:p-8 shadow-lg">
              <h3 className="text-lg font-semibold">Take Action Today</h3>
              <p className="text-primary-100 mt-3 text-sm leading-relaxed">
                Become a part of the BloodConnect network and help create a faster, more reliable blood support ecosystem.
              </p>
              <div className="mt-6 space-y-3">
                <Link
                  to="/register"
                  className="inline-flex items-center justify-center w-full rounded-xl bg-white text-primary-700 font-semibold py-2.5 px-4 hover:bg-primary-50 transition-colors"
                >
                  Join BloodConnect
                </Link>
                <Link
                  to="/hospitals"
                  className="inline-flex items-center justify-center w-full rounded-xl border border-primary-300/40 text-white font-semibold py-2.5 px-4 hover:bg-white/10 transition-colors"
                >
                  Explore Hospitals
                </Link>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-16">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {page.sections.map((section, sectionIndex) => (
            <motion.article
              key={`${pageKey}-section-${sectionIndex}`}
              initial={{ opacity: 0, y: 16 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.2 }}
              transition={{ duration: 0.35, delay: sectionIndex * 0.06 }}
              className="bg-white border border-gray-100 rounded-2xl shadow-card p-6"
            >
              <h3 className="text-lg font-bold text-gray-900">{section.title}</h3>
              <p className="mt-3 text-gray-600 text-sm leading-relaxed">{section.body}</p>
              <ul className="mt-4 space-y-2">
                {section.bullets.map((bullet, bulletIndex) => (
                  <li key={`${pageKey}-section-${sectionIndex}-bullet-${bulletIndex}`} className="flex items-start gap-2 text-sm text-gray-700">
                    <span className="mt-1.5 h-1.5 w-1.5 rounded-full bg-primary-600" />
                    <span>{bullet}</span>
                  </li>
                ))}
              </ul>
            </motion.article>
          ))}
        </div>

        {page.contactDetails && (
          <motion.div
            initial={{ opacity: 0, y: 18 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.4 }}
            className="mt-8 bg-white border border-gray-100 rounded-2xl shadow-card p-6 md:p-8"
          >
            <h3 className="text-xl font-bold text-gray-900">Direct Contact Details</h3>
            <div className="mt-5 grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
              <a
                href={`mailto:${page.contactDetails.email}`}
                className="flex items-center gap-3 rounded-xl border border-gray-200 p-4 hover:border-primary-300 hover:bg-primary-50/40 transition-colors"
              >
                <HiMail className="h-5 w-5 text-primary-600" />
                <span className="text-sm font-medium text-gray-800">{page.contactDetails.email}</span>
              </a>
              <a
                href={`tel:${page.contactDetails.phoneHref}`}
                className="flex items-center gap-3 rounded-xl border border-gray-200 p-4 hover:border-primary-300 hover:bg-primary-50/40 transition-colors"
              >
                <HiPhone className="h-5 w-5 text-primary-600" />
                <span className="text-sm font-medium text-gray-800">{page.contactDetails.phone}</span>
              </a>
              <div className="flex items-start gap-3 rounded-xl border border-gray-200 p-4 sm:col-span-2 lg:col-span-1">
                <HiLocationMarker className="h-5 w-5 text-primary-600 mt-0.5" />
                <span className="text-sm font-medium text-gray-800 leading-relaxed">{page.contactDetails.address}</span>
              </div>
            </div>
          </motion.div>
        )}

        <div className="mt-8 rounded-2xl bg-gray-900 text-gray-100 p-6 md:p-8">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div>
              <h3 className="text-lg font-semibold">Need More Help?</h3>
              <p className="text-sm text-gray-300 mt-1">Visit support resources or reach out directly for guided assistance.</p>
            </div>
            <div className="flex flex-wrap items-center gap-3">
              <Link
                to="/help"
                className="inline-flex items-center gap-2 rounded-xl bg-white text-gray-900 px-4 py-2.5 text-sm font-semibold hover:bg-gray-100 transition-colors"
              >
                Help Center
                <HiArrowRight className="h-4 w-4" />
              </Link>
              <Link
                to="/contact"
                className="inline-flex items-center gap-2 rounded-xl border border-gray-600 px-4 py-2.5 text-sm font-semibold hover:bg-gray-800 transition-colors"
              >
                Contact Us
              </Link>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default PublicContentPage;
