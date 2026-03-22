const contactDetails = {
  email: 'pawankr16123114@gmail.com',
  phone: '+91 78579 17511',
  phoneHref: '+917857917511',
  address: '390 RR Plot, Nirvana Cooperative Society, Anandapur, Kolkata'
};

const publicContentData = {
  about: {
    badge: 'About BloodConnect',
    title: 'A Reliable Blood Coordination Platform',
    subtitle:
      'BloodConnect is designed to reduce delay between blood need and blood availability by connecting donors, receivers, hospitals, and administrators through one workflow-first platform.',
    highlights: [
      'Role-based experience for donor, receiver, hospital, and admin',
      'Real-time request lifecycle tracking from created to fulfilled',
      'Secure account model with controlled access to sensitive actions',
      'Built for emergency response speed and daily operational consistency'
    ],
    sections: [
      {
        title: 'What Problem We Solve',
        body:
          'Most blood requests fail due to fragmented communication and delayed discovery of compatible donors. BloodConnect centralizes those interactions and makes status visible to all relevant stakeholders.',
        bullets: [
          'Faster donor discovery for urgent and scheduled requests',
          'Standardized request details to reduce confusion',
          'Transparent progress updates for request owners and responders'
        ]
      },
      {
        title: 'How We Operate',
        body:
          'The platform follows practical healthcare workflows: hospitals verify stock and needs, receivers publish requests, donors respond based on compatibility, and admins supervise trust and quality.',
        bullets: [
          'Workflow clarity over feature overload',
          'Actionable notifications instead of noisy alerts',
          'Data captured for operations, analytics, and accountability'
        ]
      }
    ]
  },

  howItWorks: {
    badge: 'Platform Workflow',
    title: 'How BloodConnect Works End-To-End',
    subtitle:
      'From registration to successful donation, every step is structured so users know what to do, when to do it, and who is responsible at each stage.',
    highlights: [
      'Quick registration with role-specific onboarding',
      'Create or respond to requests with complete context',
      'Coordinate with hospital and track status changes',
      'Retain history for quality and audit readiness'
    ],
    sections: [
      {
        title: '1. Join and Complete Profile',
        body:
          'Users sign up and provide role-relevant information. Complete profile data improves matching quality and reduces back-and-forth during emergencies.',
        bullets: [
          'Donor details: blood group, availability, location',
          'Receiver details: request urgency and contact channel',
          'Hospital details: stock operations and verification'
        ]
      },
      {
        title: '2. Request, Discover, Respond',
        body:
          'Receivers and hospitals publish requests; donors discover compatible demand and respond. Notifications keep all parties informed without manual coordination overhead.',
        bullets: [
          'Structured request metadata with urgency markers',
          'Compatibility-aware donor-side visibility',
          'Centralized response capture for better coordination'
        ]
      },
      {
        title: '3. Fulfill, Confirm, Learn',
        body:
          'After donation coordination, the request status is updated and history is preserved. This supports reporting, trust-building, and future response optimization.',
        bullets: [
          'Status moves from open to fulfilled with traceability',
          'Users retain activity history and outcomes',
          'Admins get insights for policy and campaign planning'
        ]
      }
    ]
  },

  leaderboard: {
    badge: 'Community Impact',
    title: 'Leaderboard and Recognition',
    subtitle:
      'The leaderboard celebrates meaningful contribution, not vanity metrics. It is intended to motivate safe, consistent participation and local community support.',
    highlights: [
      'Top donors by verified contribution history',
      'Most responsive profiles for urgent requests',
      'Hospital and organization impact visibility',
      'Recognition badges for consistent reliability'
    ],
    sections: [
      {
        title: 'Scoring Principles',
        body:
          'Leaderboard position should reflect real value to the ecosystem. Score is influenced by verification, completion consistency, and emergency responsiveness.',
        bullets: [
          'Verified actions carry higher weight than raw activity',
          'Unfulfilled responses contribute minimal score',
          'Fairness controls prevent leaderboard gaming'
        ]
      },
      {
        title: 'Why It Matters',
        body:
          'Recognition improves retention of committed donors and motivates healthy competition around reliability, not just volume.',
        bullets: [
          'Boosts donor morale and repeat engagement',
          'Helps hospitals identify highly dependable contributors',
          'Supports campaign storytelling with real contribution data'
        ]
      }
    ]
  },

  bloodTypes: {
    badge: 'Medical Resource',
    title: 'Blood Types and Compatibility Guide',
    subtitle:
      'A practical overview of ABO and Rh compatibility to help users understand matching logic before coordinating donations.',
    highlights: [
      'ABO and Rh basics in plain language',
      'Compatibility awareness for faster decisions',
      'Emergency context for universal donor/receiver understanding',
      'Final transfusion decisions always belong to medical teams'
    ],
    sections: [
      {
        title: 'ABO + Rh Basics',
        body:
          'Blood type combines ABO group (A, B, AB, O) and Rh factor (+ or -). Both are critical for safe transfusion planning and donor targeting.',
        bullets: [
          'O negative is commonly used in high-pressure emergencies',
          'AB positive can receive from all ABO/Rh groups',
          'Mismatch risk makes medical confirmation mandatory'
        ]
      },
      {
        title: 'Operational Use In Platform',
        body:
          'BloodConnect uses blood group metadata to improve request-to-donor discovery, but hospitals remain final authority for transfusion compatibility.',
        bullets: [
          'Compatibility filters reduce search time',
          'Urgency and geography influence response strategy',
          'Clinical safety validation happens at facility level'
        ]
      }
    ]
  },

  eligibility: {
    badge: 'Donor Readiness',
    title: 'Eligibility Check Before Donation',
    subtitle:
      'Use this as a readiness checklist. Exact medical eligibility can vary by region and institution, so final screening is always done by professionals.',
    highlights: [
      'General age, weight, and wellness expectations',
      'Common temporary deferral scenarios',
      'Pre-donation preparation guidance',
      'Institution-specific criteria awareness'
    ],
    sections: [
      {
        title: 'General Criteria',
        body:
          'Most blood services expect donors to be in good health, meet age and weight thresholds, and pass routine pre-donation screening.',
        bullets: [
          'Stay hydrated and well-rested before donating',
          'Bring valid identification and accurate medical information',
          'Disclose relevant history honestly for recipient safety'
        ]
      },
      {
        title: 'Temporary Deferrals',
        body:
          'Recent infection, medication cycles, procedures, or travel may delay eligibility for a defined period.',
        bullets: [
          'Deferral protects both donor and recipient',
          'Duration depends on condition and medical policy',
          'Re-screening usually restores eligibility when safe'
        ]
      }
    ]
  },

  donationProcess: {
    badge: 'Donation Journey',
    title: 'Donation Process: What To Expect',
    subtitle:
      'A clear, step-based overview of registration, screening, collection, and post-donation recovery to reduce anxiety and improve preparedness.',
    highlights: [
      'Simple check-in and identity verification',
      'Medical screening before donation begins',
      'Safe blood collection under supervision',
      'Recovery guidance after donation'
    ],
    sections: [
      {
        title: 'Before Collection',
        body:
          'You complete registration and a short health check. Staff confirm eligibility and answer questions before starting the procedure.',
        bullets: [
          'Identity and consent verification',
          'Hemoglobin/vital checks where applicable',
          'Brief counseling and preparedness confirmation'
        ]
      },
      {
        title: 'During and After Collection',
        body:
          'Collection is monitored by trained staff. After donation, rest, hydration, and after-care instructions support smooth recovery.',
        bullets: [
          'Observation period before discharge',
          'Hydration and light nutrition recommendations',
          'Temporary activity restrictions for safety'
        ]
      }
    ]
  },

  faqs: {
    badge: 'Frequently Asked Questions',
    title: 'Common Questions, Clear Answers',
    subtitle:
      'Quick guidance for donors, receivers, and hospitals on account usage, requests, notifications, and safety practices.',
    highlights: [
      'Account access and role issues',
      'Request creation and response visibility',
      'Notification behavior and timing',
      'Safety, privacy, and support escalation'
    ],
    sections: [
      {
        title: 'Can I browse without signing in?',
        body:
          'Yes. Public informational pages are accessible without login. Operational actions such as creating requests or responding as donor require authentication.',
        bullets: [
          'Public pages are open by default',
          'Protected workflows are role-restricted',
          'Login ensures traceability and trust'
        ]
      },
      {
        title: 'Why is a request not visible to me?',
        body:
          'Visibility can depend on role, current status, blood compatibility, and routing logic. Ensure profile details are complete and role is correct.',
        bullets: [
          'Check account role and profile completeness',
          'Verify blood group and availability preferences',
          'Review active filters or request status'
        ]
      }
    ]
  },

  blog: {
    badge: 'Knowledge Hub',
    title: 'Blog and Community Insights',
    subtitle:
      'A publishing space for blood donation education, campaign stories, operational lessons, and product updates.',
    highlights: [
      'Donor stories and impact narratives',
      'Hospital-led awareness and best practices',
      'Campaign announcements and event recaps',
      'Platform release notes and improvements'
    ],
    sections: [
      {
        title: 'Content Scope',
        body:
          'The blog should help users make better decisions and understand why platform workflows exist.',
        bullets: [
          'Evidence-backed awareness posts',
          'Field stories from hospitals and volunteers',
          'Guides for first-time donors and families'
        ]
      },
      {
        title: 'Editorial Quality Standard',
        body:
          'Posts should be practical, ethically sound, and medically responsible. Avoid sensational claims and include context where needed.',
        bullets: [
          'No misleading medical advice',
          'Prefer actionable and verifiable content',
          'Respect identity and patient confidentiality'
        ]
      }
    ]
  },

  privacy: {
    badge: 'Legal and Trust',
    title: 'Privacy Policy',
    subtitle:
      'This policy explains how user data is collected, used, protected, and retained to deliver BloodConnect services responsibly.',
    highlights: [
      'Purpose-limited data collection',
      'Role-based access to sensitive information',
      'Security controls for account and communication safety',
      'User rights for profile correction and support'
    ],
    sections: [
      {
        title: 'Data Collection and Use',
        body:
          'Only data relevant to platform operations is collected, including profile details, request activity, and communication metadata needed for support and reliability.',
        bullets: [
          'Identity and contact information',
          'Operational event and request status data',
          'Support interaction details for issue resolution'
        ]
      },
      {
        title: 'Data Security and Access',
        body:
          'Access is controlled by role and need. Security controls are applied to reduce unauthorized use and maintain trust across workflows.',
        bullets: [
          'Least-privilege approach for internal access',
          'Protected authentication and session handling',
          'Ongoing improvement of security posture'
        ]
      }
    ]
  },

  terms: {
    badge: 'Legal and Compliance',
    title: 'Terms of Service',
    subtitle:
      'These terms define acceptable use, user responsibilities, and platform rights required to keep BloodConnect safe and dependable.',
    highlights: [
      'Truthful information and lawful usage required',
      'Misuse of emergency features is prohibited',
      'Role and permission boundaries must be respected',
      'Policy violations may lead to account action'
    ],
    sections: [
      {
        title: 'User Responsibilities',
        body:
          'Users must provide accurate account information and use features only for legitimate blood coordination and related support activities.',
        bullets: [
          'No impersonation or fabricated medical context',
          'No harassment, abuse, or unsafe coordination behavior',
          'Comply with applicable laws and institutional guidance'
        ]
      },
      {
        title: 'Enforcement and Account Action',
        body:
          'BloodConnect may investigate suspicious activity and restrict access where required to protect users and platform integrity.',
        bullets: [
          'Suspension for repeated or severe policy violations',
          'Investigation of abuse and fraud reports',
          'Support pathway for appeal or clarification'
        ]
      }
    ]
  },

  cookies: {
    badge: 'Legal and Technology',
    title: 'Cookie Policy',
    subtitle:
      'Cookies and related technologies are used for session continuity, preferences, and performance diagnostics.',
    highlights: [
      'Essential cookies for secure login sessions',
      'Preference cookies for improved UX consistency',
      'Diagnostic signals for reliability improvements',
      'Transparent intent and limited scope usage'
    ],
    sections: [
      {
        title: 'Cookie Categories',
        body:
          'Essential cookies keep core features functioning. Optional analytics cookies help improve performance and usability over time.',
        bullets: [
          'Session and authentication continuity',
          'UI and preference persistence',
          'Operational insights for product stability'
        ]
      },
      {
        title: 'User Control',
        body:
          'You can manage cookie behavior in browser settings. Disabling essential cookies may affect login and secure workflow functionality.',
        bullets: [
          'Browser-level cookie controls available',
          'Preference changes can be applied anytime',
          'Support team can help explain impact'
        ]
      }
    ]
  },

  dataProtection: {
    badge: 'Security Operations',
    title: 'Data Protection Commitment',
    subtitle:
      'BloodConnect follows practical controls to protect confidentiality, data integrity, and operational resilience.',
    highlights: [
      'Controlled access based on role and purpose',
      'Security-aware engineering and deployment practices',
      'Monitoring and review for risk reduction',
      'Incident readiness and response discipline'
    ],
    sections: [
      {
        title: 'Protection Measures',
        body:
          'Data protection combines technical controls and process discipline. Access, storage, and operations are structured for minimum required exposure.',
        bullets: [
          'Role-restricted internal access',
          'Secure credential handling standards',
          'Periodic review of data handling patterns'
        ]
      },
      {
        title: 'Incident Readiness',
        body:
          'When issues occur, response focuses on containment, analysis, corrective action, and communication with affected parties where required.',
        bullets: [
          'Detection and triage workflow',
          'Corrective action and hardening follow-up',
          'Post-incident quality improvement actions'
        ]
      }
    ]
  },

  help: {
    badge: 'Support Center',
    title: 'Help Center and Troubleshooting',
    subtitle:
      'Find actionable support for login problems, request visibility, profile setup, role confusion, and notification behavior.',
    highlights: [
      'Self-service checks for common issues',
      'Role-specific troubleshooting guidance',
      'Escalation path for unresolved cases',
      'Direct support contact for critical blockers'
    ],
    sections: [
      {
        title: 'Quick Diagnostic Checklist',
        body:
          'Before escalating, verify profile completeness, role assignment, request status filters, and connectivity/session validity.',
        bullets: [
          'Confirm active login and correct account role',
          'Review blood group and availability settings',
          'Validate request status and page filters'
        ]
      },
      {
        title: 'When To Escalate',
        body:
          'Escalate if operational data is missing, actions fail repeatedly, or workflow behavior is inconsistent with expected permissions.',
        bullets: [
          'Share exact route and failing action',
          'Include timestamp and user role context',
          'Attach screenshots or logs where possible'
        ]
      }
    ]
  },

  contact: {
    badge: 'Direct Contact',
    title: 'Contact BloodConnect',
    subtitle:
      'Reach out for product support, partnership discussion, technical bug escalation, or collaboration inquiries.',
    highlights: [
      'Support for user and admin workflows',
      'Issue escalation with response prioritization',
      'Partnership and campaign collaboration channel',
      'Reliable communication for platform operations'
    ],
    contactDetails,
    sections: [
      {
        title: 'Best Use Cases',
        body:
          'Contact this channel for account access issues, missing operational data, broken routes, and institutional onboarding discussions.',
        bullets: [
          'Authentication or authorization issues',
          'Request lifecycle and visibility concerns',
          'Partnership or implementation planning'
        ]
      },
      {
        title: 'How To Get Faster Resolution',
        body:
          'Provide enough context in your first message so support can reproduce and resolve the issue without delay.',
        bullets: [
          'Mention role, route, and expected outcome',
          'Describe actual behavior and error details',
          'Include screenshots and approximate time of issue'
        ]
      }
    ]
  },

  report: {
    badge: 'Quality and Safety',
    title: 'Report a Problem',
    subtitle:
      'Report bugs, safety concerns, misuse, and suspicious activities so platform reliability and trust can improve continuously.',
    highlights: [
      'Bug reporting for broken or inconsistent behavior',
      'Safety reporting for abuse or harmful coordination',
      'Fraud signals and suspicious account activity',
      'Operational incidents requiring urgent review'
    ],
    sections: [
      {
        title: 'What To Include In Report',
        body:
          'A clear issue report accelerates triage and correction. Focus on reproducibility and impact.',
        bullets: [
          'Page URL and exact action sequence',
          'Expected result vs actual result',
          'Screenshots, logs, and timestamp details'
        ]
      },
      {
        title: 'Safety and Abuse Reporting',
        body:
          'For abuse or misuse, share verifiable context quickly. The team can then assess risk and take policy action where required.',
        bullets: [
          'Provide involved account details if available',
          'Attach evidence responsibly and lawfully',
          'Avoid sharing unrelated personal data'
        ]
      }
    ]
  },

  partners: {
    badge: 'Institutional Collaboration',
    title: 'Partner With BloodConnect',
    subtitle:
      'We collaborate with hospitals, blood banks, NGOs, universities, and local communities to improve donation readiness and emergency response capacity.',
    highlights: [
      'Hospital and blood bank onboarding models',
      'Joint awareness and donor activation campaigns',
      'City-level emergency response collaboration',
      'Data-informed program planning and reporting'
    ],
    sections: [
      {
        title: 'Partnership Models',
        body:
          'Partnership can focus on operations, campaigns, technology integration, or community mobilization depending on your institution goals.',
        bullets: [
          'Operational partner onboarding for request workflows',
          'Co-branded donation drives and awareness programs',
          'Volunteer and campus outreach activation'
        ]
      },
      {
        title: 'Onboarding Requirements',
        body:
          'To start, share organization profile, geographic scope, expected use case volume, and implementation timeline.',
        bullets: [
          'Nominate operational and technical points of contact',
          'Define success metrics and reporting expectations',
          'Align communication and escalation channels early'
        ]
      }
    ]
  }
};

export default publicContentData;
