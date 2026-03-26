require('dotenv').config();

const mongoose = require('mongoose');
const {
  User,
  DonorProfile,
  Hospital,
  BloodStock,
  BloodRequest,
  Donation,
  Notification,
  Schedule
} = require('../models');

const BLOOD_GROUPS = ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'];
const STATES = ['West Bengal', 'Karnataka', 'Maharashtra', 'Delhi'];
const CITIES = ['Kolkata', 'Howrah', 'Bengaluru', 'Mumbai', 'New Delhi'];
const KOLKATA_HOSPITALS = [
  {
    name: 'Apollo Multispeciality Hospitals Kolkata',
    type: 'hospital',
    registrationNumber: 'KOL-APOLLO-001',
    street: '58 Canal Circular Road',
    city: 'Kolkata',
    state: 'West Bengal',
    zipCode: '700054',
    phone: '+913323218888',
    emergencyPhone: '+913323218999',
    coordinates: [88.3924, 22.5739],
    bloodStorageCapacity: 420
  },
  {
    name: 'Fortis Hospital Anandapur',
    type: 'hospital',
    registrationNumber: 'KOL-FORTIS-002',
    street: '730 Eastern Metropolitan Bypass, Anandapur',
    city: 'Kolkata',
    state: 'West Bengal',
    zipCode: '700107',
    phone: '+913366288444',
    emergencyPhone: '+913366288555',
    coordinates: [88.4004, 22.5146],
    bloodStorageCapacity: 380
  },
  {
    name: 'Ruby General Hospital',
    type: 'hospital',
    registrationNumber: 'KOL-RUBY-003',
    street: 'Kasba Golpark, E M Bypass',
    city: 'Kolkata',
    state: 'West Bengal',
    zipCode: '700107',
    phone: '+913324450101',
    emergencyPhone: '+913324450111',
    coordinates: [88.3929, 22.5142],
    bloodStorageCapacity: 300
  },
  {
    name: 'AMRI Hospital Dhakuria',
    type: 'hospital',
    registrationNumber: 'KOL-AMRI-004',
    street: 'P-4 and 5, Gariahat Road',
    city: 'Kolkata',
    state: 'West Bengal',
    zipCode: '700029',
    phone: '+913366220000',
    emergencyPhone: '+913366220111',
    coordinates: [88.3698, 22.5127],
    bloodStorageCapacity: 310
  },
  {
    name: 'Medica Superspecialty Hospital',
    type: 'hospital',
    registrationNumber: 'KOL-MEDICA-005',
    street: '127 Mukundapur, E M Bypass',
    city: 'Kolkata',
    state: 'West Bengal',
    zipCode: '700099',
    phone: '+913366550000',
    emergencyPhone: '+913366550111',
    coordinates: [88.4035, 22.4838],
    bloodStorageCapacity: 360
  },
  {
    name: 'Peerless Hospital',
    type: 'hospital',
    registrationNumber: 'KOL-PEERLESS-006',
    street: '360 Panchasayar',
    city: 'Kolkata',
    state: 'West Bengal',
    zipCode: '700094',
    phone: '+913340170000',
    emergencyPhone: '+913340170111',
    coordinates: [88.4078, 22.4767],
    bloodStorageCapacity: 290
  },
  {
    name: 'CMRI Hospital Kolkata',
    type: 'hospital',
    registrationNumber: 'KOL-CMRI-007',
    street: '7/2 Diamond Harbour Road',
    city: 'Kolkata',
    state: 'West Bengal',
    zipCode: '700027',
    phone: '+913330990999',
    emergencyPhone: '+913330991111',
    coordinates: [88.3307, 22.5164],
    bloodStorageCapacity: 270
  },
  {
    name: 'Belle Vue Clinic',
    type: 'hospital',
    registrationNumber: 'KOL-BELLEVUE-008',
    street: '9 Loudon Street',
    city: 'Kolkata',
    state: 'West Bengal',
    zipCode: '700017',
    phone: '+913322870000',
    emergencyPhone: '+913322870111',
    coordinates: [88.3578, 22.5394],
    bloodStorageCapacity: 250
  },
  {
    name: 'Woodlands Multispeciality Hospital',
    type: 'hospital',
    registrationNumber: 'KOL-WOODLANDS-009',
    street: '8/5 Alipore Road',
    city: 'Kolkata',
    state: 'West Bengal',
    zipCode: '700027',
    phone: '+913340306000',
    emergencyPhone: '+913340306111',
    coordinates: [88.3375, 22.5236],
    bloodStorageCapacity: 240
  },
  {
    name: 'Desun Hospital Kolkata',
    type: 'hospital',
    registrationNumber: 'KOL-DESUN-010',
    street: 'Desun More, Kasba Golpark, E M Bypass',
    city: 'Kolkata',
    state: 'West Bengal',
    zipCode: '700107',
    phone: '+913371242424',
    emergencyPhone: '+913371242525',
    coordinates: [88.3948, 22.5098],
    bloodStorageCapacity: 280
  }
];

const FIRST_NAMES = ['Aarav', 'Diya', 'Rohan', 'Isha', 'Rahul', 'Neha', 'Arjun', 'Sneha', 'Karan', 'Meera'];
const LAST_NAMES = ['Sharma', 'Gupta', 'Roy', 'Mukherjee', 'Das', 'Singh', 'Nair', 'Khan', 'Patel', 'Verma'];

const random = (min, max) => Math.floor(Math.random() * (max - min + 1)) + min;
const pick = (arr) => arr[random(0, arr.length - 1)];

function randomPhone() {
  return `+91${random(6000000000, 9999999999)}`;
}

function randomEmail(prefix) {
  const domain = pick(['gmail.com', 'outlook.com', 'example.com']);
  const safePrefix = String(prefix)
    .toLowerCase()
    .replace(/[^a-z0-9._-]/g, '')
    .replace(/^[._-]+|[._-]+$/g, '')
    .slice(0, 24) || 'user';
  return `${safePrefix}${Date.now()}${random(100, 999)}@${domain}`;
}

function randomLocation(centerLng = 88.3639, centerLat = 22.5726) {
  const lng = centerLng + (Math.random() - 0.5) * 0.6;
  const lat = centerLat + (Math.random() - 0.5) * 0.6;
  return [Number(lng.toFixed(6)), Number(lat.toFixed(6))];
}

function randomFutureDate(daysMin = 1, daysMax = 7) {
  const date = new Date();
  date.setDate(date.getDate() + random(daysMin, daysMax));
  return date;
}

function randomPastDate(daysMin = 1, daysMax = 120) {
  const date = new Date();
  date.setDate(date.getDate() - random(daysMin, daysMax));
  return date;
}

function makeUser(overrides = {}) {
  const firstName = overrides.firstName || pick(FIRST_NAMES);
  const lastName = overrides.lastName || pick(LAST_NAMES);
  const role = overrides.role || 'donor';
  const emailPrefix = `${firstName}.${lastName}.${role}`.toLowerCase();

  return {
    firstName,
    lastName,
    email: overrides.email || randomEmail(emailPrefix),
    phone: overrides.phone || randomPhone(),
    password: overrides.password || 'Password123',
    role,
    isVerified: overrides.isVerified ?? true,
    isActive: overrides.isActive ?? true,
    isBlocked: overrides.isBlocked ?? false,
    address: overrides.address || {
      street: `${random(10, 300)} ${pick(['Park Street', 'MG Road', 'Lake Road', 'Main Road'])}`,
      city: pick(CITIES),
      state: pick(STATES),
      country: 'India',
      zipCode: String(random(100000, 999999))
    },
    location: {
      type: 'Point',
      coordinates: randomLocation()
    }
  };
}

function makeBloodUnit({ donorUser, donorProfile, status, expiryOffsetDays, requestId }) {
  const expiryDate = new Date();
  expiryDate.setDate(expiryDate.getDate() + expiryOffsetDays);

  return {
    unitId: `UNIT-${Date.now()}-${Math.random().toString(36).slice(2, 8).toUpperCase()}`,
    bagNumber: `BAG-${Math.random().toString(36).slice(2, 7).toUpperCase()}`,
    donor: donorUser?._id,
    donorProfile: donorProfile?._id,
    collectedAt: randomPastDate(5, 50),
    testResults: {
      hiv: 'negative',
      hepatitisB: 'negative',
      hepatitisC: 'negative',
      syphilis: 'negative',
      malaria: 'negative',
      overallStatus: 'safe'
    },
    testedAt: randomPastDate(1, 20),
    testedBy: 'Lab Team',
    expiryDate,
    status,
    issuedTo: requestId
      ? {
          request: requestId,
          patient: 'Linked Request Patient',
          issuedAt: randomPastDate(1, 3)
        }
      : undefined,
    quality: pick(['good', 'good', 'acceptable'])
  };
}

async function clearCollections() {
  await Promise.all([
    Notification.deleteMany({}),
    Donation.deleteMany({}),
    BloodRequest.deleteMany({}),
    BloodStock.deleteMany({}),
    Schedule.deleteMany({}),
    Hospital.deleteMany({}),
    DonorProfile.deleteMany({}),
    User.deleteMany({})
  ]);
}

async function seed() {
  if (!process.env.MONGODB_URI) {
    throw new Error('MONGODB_URI is missing. Create .env from .env.example first.');
  }

  await mongoose.connect(process.env.MONGODB_URI);
  console.log('Connected to MongoDB for seeding');

  await clearCollections();

  // Admin user
  const adminUser = await User.create(
    makeUser({
      firstName: 'Platform',
      lastName: 'Admin',
      email: 'admin@bloodconnect.com',
      phone: '+919999999999',
      role: 'admin'
    })
  );

  // Hospital users + hospitals
  const hospitals = [];
  for (let i = 0; i < KOLKATA_HOSPITALS.length; i += 1) {
    const hospitalSeed = KOLKATA_HOSPITALS[i];
    const hospitalUser = await User.create(
      makeUser({
        role: 'hospital',
        firstName: `Hospital${i + 1}`,
        lastName: 'Manager',
        email: `hospital${i + 1}@gmail.com`,
        password: 'Hospital@123',
        phone: hospitalSeed.phone,
        address: {
          street: hospitalSeed.street,
          city: hospitalSeed.city,
          state: hospitalSeed.state,
          country: 'India',
          zipCode: hospitalSeed.zipCode
        },
        location: {
          type: 'Point',
          coordinates: hospitalSeed.coordinates
        }
      })
    );

    const hospital = await Hospital.create({
      user: hospitalUser._id,
      name: hospitalSeed.name,
      type: hospitalSeed.type,
      registrationNumber: hospitalSeed.registrationNumber,
      email: hospitalUser.email,
      phone: hospitalUser.phone,
      emergencyPhone: hospitalSeed.emergencyPhone,
      address: {
        street: hospitalSeed.street,
        city: hospitalSeed.city,
        state: hospitalSeed.state,
        country: 'India',
        zipCode: hospitalSeed.zipCode
      },
      location: {
        type: 'Point',
        coordinates: hospitalSeed.coordinates
      },
      hasBloodBank: true,
      hasDonationCenter: true,
      isVerified: true,
      verifiedBy: adminUser._id,
      verifiedAt: new Date(),
      bloodStorageCapacity: hospitalSeed.bloodStorageCapacity
    });

    hospitals.push({ hospital, hospitalUser });
  }

  // Receiver users
  const receivers = [];
  for (let i = 0; i < 12; i += 1) {
    const receiver = await User.create(makeUser({ role: 'receiver' }));
    receivers.push(receiver);
  }

  // Donor users + profiles (include rare blood groups)
  const donorProfiles = [];
  for (let i = 0; i < 48; i += 1) {
    const donor = await User.create(makeUser({ role: 'donor' }));
    const bloodGroup = i < 3 ? 'AB-' : i < 6 ? 'O-' : pick(BLOOD_GROUPS);
    const donationCount = random(0, 16);
    const profile = await DonorProfile.create({
      user: donor._id,
      bloodGroup,
      weight: random(48, 92),
      height: random(150, 188),
      hemoglobinLevel: Number((Math.random() * 3 + 11.8).toFixed(1)),
      healthDeclaration: {
        hasChronicDisease: false,
        hasTattooRecently: false,
        hasRecentSurgery: false,
        isPregnant: false,
        hasSTD: false,
        hasHepatitis: false,
        hasHIV: false,
        usesIntravenousDrugs: false
      },
      isAvailable: Math.random() > 0.25,
      isVerified: true,
      verifiedBy: adminUser._id,
      verifiedAt: randomPastDate(30, 200),
      totalDonations: donationCount,
      totalLivesSaved: donationCount * random(1, 3),
      points: donationCount * 100,
      preferredDonationType: pick(['whole_blood', 'platelets', 'plasma']),
      lastDonationDate: randomPastDate(20, 180)
    });

    donorProfiles.push({ donor, profile });
  }

  // Blood requests (include pending emergency/critical edge cases)
  const requests = [];
  for (let i = 0; i < 24; i += 1) {
    const receiver = pick(receivers);
    const selectedHospital = pick(hospitals).hospital;
    const urgency = i < 5 ? pick(['emergency', 'critical']) : pick(['normal', 'urgent', 'critical']);
    const status = i < 6 ? 'pending' : pick(['approved', 'in_progress', 'fulfilled', 'pending']);
    const requiredBy = urgency === 'emergency' ? randomFutureDate(0, 1) : randomFutureDate(1, 6);

    const request = await BloodRequest.create({
      requester: receiver._id,
      patientInfo: {
        name: `${pick(FIRST_NAMES)} ${pick(LAST_NAMES)}`,
        age: random(3, 78),
        gender: pick(['male', 'female'])
      },
      bloodGroup: pick(BLOOD_GROUPS),
      bloodComponent: pick(['whole_blood', 'packed_red_cells', 'platelets', 'plasma']),
      unitsRequired: urgency === 'emergency' ? random(3, 8) : random(1, 4),
      unitsFulfilled: 0,
      urgency,
      hospital: selectedHospital._id,
      hospitalName: selectedHospital.name,
      hospitalAddress: `${selectedHospital.address.street}, ${selectedHospital.address.city}`,
      location: {
        type: 'Point',
        coordinates: selectedHospital.location.coordinates
      },
      contactName: `${receiver.firstName} ${receiver.lastName}`,
      contactPhone: receiver.phone,
      requiredBy,
      status,
      isEmergencyBroadcast: urgency === 'emergency',
      broadcastRadius: urgency === 'emergency' ? 80 : 50,
      statusHistory: [
        {
          status: 'pending',
          changedBy: receiver._id,
          notes: 'Seeded request created'
        }
      ]
    });

    requests.push(request);
  }

  // Donations linked to random requests
  for (let i = 0; i < 20; i += 1) {
    const { donor, profile } = pick(donorProfiles);
    const { hospital } = pick(hospitals);
    const linkedRequest = pick(requests);

    await Donation.create({
      donationId: `DON-${Date.now()}-${i}-${Math.random().toString(36).slice(2, 5).toUpperCase()}`,
      donor: donor._id,
      donorProfile: profile._id,
      bloodGroup: profile.bloodGroup,
      donationType: profile.preferredDonationType,
      request: linkedRequest._id,
      hospital: hospital._id,
      donationDate: randomPastDate(1, 120),
      status: 'completed',
      preScreening: {
        bloodPressure: { systolic: random(105, 132), diastolic: random(68, 88) },
        pulse: random(62, 92),
        temperature: Number((Math.random() * 0.8 + 36.2).toFixed(1)),
        hemoglobin: Number((Math.random() * 2.8 + 12.2).toFixed(1)),
        weight: profile.weight,
        isEligible: true
      },
      collection: {
        bagNumber: `BAG-${Date.now()}-${i}`,
        volumeCollected: 450,
        successfulCollection: true
      },
      postDonation: {
        restTime: random(10, 25),
        donorCondition: 'good'
      }
    });
  }

  // Stock setup with edge cases: low/critical and expired units
  for (const { hospital } of hospitals) {
    for (const group of BLOOD_GROUPS) {
      const isRareGroup = group === 'AB-' || group === 'O-';
      const baseUnits = isRareGroup ? random(1, 4) : random(6, 15);
      const units = [];

      for (let i = 0; i < baseUnits; i += 1) {
        const donorRecord = pick(donorProfiles);
        units.push(
          makeBloodUnit({
            donorUser: donorRecord.donor,
            donorProfile: donorRecord.profile,
            status: 'available',
            expiryOffsetDays: random(3, 30)
          })
        );
      }

      // Add some expired units to validate edge-case screens
      const expiredCount = random(0, 2);
      for (let i = 0; i < expiredCount; i += 1) {
        const donorRecord = pick(donorProfiles);
        units.push(
          makeBloodUnit({
            donorUser: donorRecord.donor,
            donorProfile: donorRecord.profile,
            status: 'expired',
            expiryOffsetDays: -random(1, 8)
          })
        );
      }

      await BloodStock.create({
        hospital: hospital._id,
        bloodGroup: group,
        component: 'whole_blood',
        minThreshold: 5,
        criticalThreshold: 2,
        units
      });
    }
  }

  // Public schedules
  for (let i = 0; i < 10; i += 1) {
    const { hospital, hospitalUser } = pick(hospitals);
    await Schedule.create({
      type: pick(['donation_appointment', 'blood_drive', 'camp']),
      title: `${pick(['City', 'Weekend', 'Emergency', 'Community'])} Blood Drive #${i + 1}`,
      description: 'Seeded schedule for testing appointment and event flows.',
      organizer: hospitalUser._id,
      hospital: hospital._id,
      venue: {
        name: hospital.name,
        address: hospital.address.street,
        city: hospital.address.city,
        state: hospital.address.state
      },
      location: hospital.location,
      date: randomFutureDate(1, 45),
      startTime: '09:00',
      endTime: '17:00',
      totalSlots: 30,
      availableSlots: 30,
      status: 'published',
      isPublic: true,
      eligibleBloodGroups: BLOOD_GROUPS,
      contactPerson: {
        name: `${hospitalUser.firstName} ${hospitalUser.lastName}`,
        phone: hospital.phone,
        email: hospital.email
      }
    });
  }

  // Notifications to test unread counts and timeline rendering
  const notificationTargets = [...receivers.slice(0, 4), ...donorProfiles.slice(0, 6).map(d => d.donor)];
  for (const user of notificationTargets) {
    await Notification.create({
      recipient: user._id,
      type: pick(['blood_request', 'donation_reminder', 'emergency_alert', 'account_update']),
      title: pick(['New compatible request', 'Donation reminder', 'Emergency alert', 'Profile update required']),
      message: 'This is seeded notification data for dashboard and badge testing.',
      priority: pick(['normal', 'high', 'urgent']),
      isRead: Math.random() > 0.55
    });
  }

  console.log('Seed completed successfully.');
  console.log('Created:');
  console.log('- 1 admin user');
  console.log(`- ${hospitals.length} Kolkata hospitals (+ hospital users)`);
  console.log('- Hospital login pattern: hospital1@gmail.com ... hospital10@gmail.com');
  console.log('- Shared hospital password: Hospital@123');
  console.log(`- ${receivers.length} receivers`);
  console.log(`- ${donorProfiles.length} donors + donor profiles`);
  console.log(`- ${requests.length} blood requests (includes pending emergency/critical)`);
  console.log('- Donations, blood stock (with expired units), schedules, and notifications');

  await mongoose.disconnect();
}

seed()
  .then(() => process.exit(0))
  .catch(async (error) => {
    console.error('Seeding failed:', error?.message || error);
    if (error?.code) {
      console.error('Error code:', error.code);
    }
    if (error?.keyPattern) {
      console.error('Key pattern:', JSON.stringify(error.keyPattern));
    }
    if (error?.keyValue) {
      console.error('Key value:', JSON.stringify(error.keyValue));
    }
    if (error?.stack) {
      console.error(error.stack);
    }
    await mongoose.disconnect();
    process.exit(1);
  });
