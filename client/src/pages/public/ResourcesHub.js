import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { HiBookOpen, HiHeart, HiShieldCheck, HiQuestionMarkCircle, HiArrowRight } from 'react-icons/hi';

const resourceCards = [
  {
    title: 'Blood Types Guide',
    description:
      'Understand ABO and Rh compatibility so donors and families can make faster, safer decisions before hospital confirmation.',
    path: '/resources/blood-types',
    icon: HiHeart,
    accent: 'from-red-500 to-rose-500'
  },
  {
    title: 'Eligibility Check',
    description:
      'Review the practical readiness checklist donors should consider before attempting to book or respond to a blood request.',
    path: '/resources/eligibility',
    icon: HiShieldCheck,
    accent: 'from-emerald-500 to-teal-500'
  },
  {
    title: 'Donation Process',
    description:
      'See the full donation journey from screening to recovery so first-time donors know what to expect on the day.',
    path: '/resources/donation-process',
    icon: HiBookOpen,
    accent: 'from-blue-500 to-cyan-500'
  },
  {
    title: 'FAQs and Help',
    description:
      'Get fast answers for account issues, request visibility, notifications, and role-based workflows across the platform.',
    path: '/faqs',
    icon: HiQuestionMarkCircle,
    accent: 'from-amber-500 to-orange-500'
  }
];

const practicalGuides = [
  {
    title: 'Before Donating',
    items: [
      'Stay hydrated and have a light meal before travelling to the hospital.',
      'Carry valid identification and keep your medical history accurate.',
      'Use the eligibility guide if you recently recovered from illness or treatment.'
    ]
  },
  {
    title: 'During Emergencies',
    items: [
      'Check request urgency, hospital details, and blood group compatibility first.',
      'Use verified hospitals and request pages to avoid misinformation.',
      'Respond only if you are genuinely available and medically eligible.'
    ]
  },
  {
    title: 'When Something Looks Wrong',
    items: [
      'Review your account role and profile completeness before assuming data is missing.',
      'Use the help center or report page if a route, request, or notification behaves unexpectedly.',
      'Include screenshots and the exact page URL when reporting platform issues.'
    ]
  }
];

const ResourcesHub = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-primary-50/20">
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute -top-20 right-0 w-72 h-72 rounded-full bg-primary-200/30 blur-3xl" />
          <div className="absolute -bottom-16 left-0 w-72 h-72 rounded-full bg-secondary-200/30 blur-3xl" />
        </div>

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-14 pb-12">
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            className="max-w-4xl"
          >
            <span className="inline-flex items-center gap-2 rounded-full bg-primary-100 text-primary-700 px-4 py-1.5 text-sm font-semibold">
              Knowledge Center
            </span>
            <h1 className="mt-5 text-4xl md:text-5xl font-bold text-gray-900 leading-tight">
              Practical Resources For Safer, Faster Blood Coordination
            </h1>
            <p className="mt-5 text-lg text-gray-600 leading-relaxed">
              This section brings together the most important public guidance in BloodConnect, from blood compatibility
              basics to donor readiness and troubleshooting help.
            </p>
          </motion.div>

          <div className="mt-10 grid gap-6 md:grid-cols-2 xl:grid-cols-4">
            {resourceCards.map((card, index) => (
              <motion.div
                key={card.path}
                initial={{ opacity: 0, y: 18 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.06 }}
                className="bg-white border border-gray-100 rounded-2xl shadow-card overflow-hidden"
              >
                <div className={`h-2 bg-gradient-to-r ${card.accent}`} />
                <div className="p-6">
                  <card.icon className="h-8 w-8 text-primary-600" />
                  <h2 className="mt-4 text-xl font-semibold text-gray-900">{card.title}</h2>
                  <p className="mt-3 text-sm text-gray-600 leading-relaxed">{card.description}</p>
                  <Link
                    to={card.path}
                    className="mt-5 inline-flex items-center gap-2 text-sm font-semibold text-primary-700 hover:text-primary-800"
                  >
                    Open resource
                    <HiArrowRight className="h-4 w-4" />
                  </Link>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-16">
        <div className="grid gap-6 lg:grid-cols-3">
          {practicalGuides.map((guide, index) => (
            <motion.article
              key={guide.title}
              initial={{ opacity: 0, y: 18 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.2 }}
              transition={{ delay: index * 0.05 }}
              className="bg-white border border-gray-100 rounded-2xl shadow-card p-6"
            >
              <h3 className="text-lg font-semibold text-gray-900">{guide.title}</h3>
              <ul className="mt-4 space-y-3">
                {guide.items.map((item) => (
                  <li key={item} className="flex items-start gap-3 text-sm text-gray-700">
                    <span className="mt-1.5 h-2 w-2 rounded-full bg-primary-600" />
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </motion.article>
          ))}
        </div>

        <div className="mt-8 rounded-2xl bg-gray-900 text-gray-100 p-6 md:p-8">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div>
              <h3 className="text-xl font-semibold">Need live operational data instead of guidance?</h3>
              <p className="text-sm text-gray-300 mt-2">
                Explore verified hospitals, schedules, and active request flows directly from the production-backed pages.
              </p>
            </div>
            <div className="flex flex-wrap gap-3">
              <Link to="/hospitals" className="btn-secondary">
                Browse Hospitals
              </Link>
              <Link to="/schedules" className="btn-primary">
                View Schedules
              </Link>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default ResourcesHub;
