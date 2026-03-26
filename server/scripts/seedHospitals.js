require('dotenv').config();

const mongoose = require('mongoose');
const {
  User,
  Hospital,
  BloodStock
} = require('../models');

const BLOOD_GROUPS = ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'];
const STOCK_TEMPLATE = {
  'A+': 18,
  'A-': 8,
  'B+': 16,
  'B-': 7,
  'AB+': 9,
  'AB-': 4,
  'O+': 22,
  'O-': 6
};

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

function buildStockUnits(bloodGroup, count, hospitalName) {
  return Array.from({ length: count }, (_, index) => {
    const collectedAt = new Date();
    collectedAt.setDate(collectedAt.getDate() - ((index % 10) + 2));

    const expiryDate = new Date();
    expiryDate.setDate(expiryDate.getDate() + 20 + (index % 12));

    return {
      unitId: `${bloodGroup.replace('+', 'P').replace('-', 'N')}-${hospitalName.replace(/[^A-Z0-9]/gi, '').slice(0, 8).toUpperCase()}-${String(index + 1).padStart(3, '0')}`,
      bagNumber: `BAG-${String(index + 1).padStart(4, '0')}`,
      collectedAt,
      collectionCenter: hospitalName,
      testResults: {
        hiv: 'negative',
        hepatitisB: 'negative',
        hepatitisC: 'negative',
        syphilis: 'negative',
        malaria: 'negative',
        overallStatus: 'safe'
      },
      testedAt: collectedAt,
      testedBy: 'BloodConnect Seed',
      expiryDate,
      status: 'available',
      quality: 'good',
      volume: 450
    };
  });
}

async function upsertHospitalUser(seed, index) {
  const email = `hospital${index + 1}@gmail.com`;
  let user = await User.findOne({ email }).select('+password');

  if (!user) {
    user = new User({
      email,
      phone: seed.phone,
      password: 'Hospital@123',
      firstName: `Hospital${index + 1}`,
      lastName: 'Manager',
      role: 'hospital',
      isVerified: true,
      isActive: true,
      address: {
        street: seed.street,
        city: seed.city,
        state: seed.state,
        country: 'India',
        zipCode: seed.zipCode
      },
      location: {
        type: 'Point',
        coordinates: seed.coordinates
      }
    });
  } else {
    user.phone = seed.phone;
    user.password = 'Hospital@123';
    user.firstName = `Hospital${index + 1}`;
    user.lastName = 'Manager';
    user.role = 'hospital';
    user.isVerified = true;
    user.isActive = true;
    user.isBlocked = false;
    user.address = {
      street: seed.street,
      city: seed.city,
      state: seed.state,
      country: 'India',
      zipCode: seed.zipCode
    };
    user.location = {
      type: 'Point',
      coordinates: seed.coordinates
    };
  }

  await user.save();
  return user;
}

async function upsertHospital(seed, user) {
  let hospital = await Hospital.findOne({
    $or: [
      { user: user._id },
      { registrationNumber: seed.registrationNumber },
      { email: user.email }
    ]
  });

  if (!hospital) {
    hospital = new Hospital({
      user: user._id,
      name: seed.name,
      type: seed.type,
      registrationNumber: seed.registrationNumber,
      email: user.email,
      phone: seed.phone,
      emergencyPhone: seed.emergencyPhone,
      address: {
        street: seed.street,
        city: seed.city,
        state: seed.state,
        country: 'India',
        zipCode: seed.zipCode
      },
      location: {
        type: 'Point',
        coordinates: seed.coordinates
      },
      hasBloodBank: true,
      hasDonationCenter: true,
      isVerified: true,
      isActive: true,
      bloodStorageCapacity: seed.bloodStorageCapacity
    });
  } else {
    hospital.user = user._id;
    hospital.name = seed.name;
    hospital.type = seed.type;
    hospital.registrationNumber = seed.registrationNumber;
    hospital.email = user.email;
    hospital.phone = seed.phone;
    hospital.emergencyPhone = seed.emergencyPhone;
    hospital.address = {
      street: seed.street,
      city: seed.city,
      state: seed.state,
      country: 'India',
      zipCode: seed.zipCode
    };
    hospital.location = {
      type: 'Point',
      coordinates: seed.coordinates
    };
    hospital.hasBloodBank = true;
    hospital.hasDonationCenter = true;
    hospital.isVerified = true;
    hospital.isActive = true;
    hospital.bloodStorageCapacity = seed.bloodStorageCapacity;
  }

  await hospital.save();
  return hospital;
}

async function seedHospitalStocks(hospital, hospitalSeed) {
  for (const bloodGroup of BLOOD_GROUPS) {
    const unitCount = STOCK_TEMPLATE[bloodGroup] || 5;
    const stockPayload = {
      hospital: hospital._id,
      bloodGroup,
      component: 'whole_blood',
      minThreshold: 5,
      criticalThreshold: 2,
      maxCapacity: Math.max(50, hospitalSeed.bloodStorageCapacity || 100),
      units: buildStockUnits(bloodGroup, unitCount, hospitalSeed.name)
    };

    const existingStock = await BloodStock.findOne({
      hospital: hospital._id,
      bloodGroup,
      component: 'whole_blood'
    });

    if (!existingStock) {
      await BloodStock.create(stockPayload);
      continue;
    }

    existingStock.minThreshold = stockPayload.minThreshold;
    existingStock.criticalThreshold = stockPayload.criticalThreshold;
    existingStock.maxCapacity = stockPayload.maxCapacity;
    existingStock.units = stockPayload.units;
    await existingStock.save();
  }
}

async function main() {
  if (!process.env.MONGODB_URI) {
    throw new Error('MONGODB_URI is missing.');
  }

  await mongoose.connect(process.env.MONGODB_URI);

  for (let index = 0; index < KOLKATA_HOSPITALS.length; index += 1) {
    const hospitalSeed = KOLKATA_HOSPITALS[index];
    const user = await upsertHospitalUser(hospitalSeed, index);
    const hospital = await upsertHospital(hospitalSeed, user);
    await seedHospitalStocks(hospital, hospitalSeed);
  }

  console.log('Kolkata hospitals seeded successfully.');
  console.log('Logins: hospital1@gmail.com ... hospital10@gmail.com');
  console.log('Password: Hospital@123');

  await mongoose.disconnect();
}

main().catch(async (error) => {
  console.error('Hospital seed failed:', error?.message || error);
  if (mongoose.connection.readyState) {
    await mongoose.disconnect();
  }
  process.exit(1);
});
