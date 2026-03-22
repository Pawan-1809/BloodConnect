const base = 'http://localhost:5000/api';

async function api(path, options = {}, token) {
  const headers = { 'Content-Type': 'application/json', ...(options.headers || {}) };
  if (token) headers.Authorization = `Bearer ${token}`;

  const response = await fetch(`${base}${path}`, {
    ...options,
    headers
  });

  const text = await response.text();
  let data;
  try {
    data = text ? JSON.parse(text) : {};
  } catch {
    data = { raw: text };
  }

  return {
    ok: response.ok,
    status: response.status,
    data
  };
}

function pass(message) {
  console.log(`PASS: ${message}`);
}

function fail(message, payload) {
  console.error(`FAIL: ${message}`);
  if (payload) {
    console.error(JSON.stringify(payload, null, 2));
  }
  process.exit(1);
}

function assert(condition, message, payload) {
  if (!condition) {
    fail(message, payload);
  }
  pass(message);
}

async function registerAndLogin(role, firstName, lastName, extra = {}) {
  const stamp = Date.now() + Math.floor(Math.random() * 10000);
  const email = `${role}.${firstName.toLowerCase()}.${stamp}@example.com`;
  const phone = `+91${Math.floor(7000000000 + Math.random() * 2000000000)}`;
  const password = 'TestPass123';

  const register = await api('/auth/register', {
    method: 'POST',
    body: JSON.stringify({
      email,
      phone,
      password,
      firstName,
      lastName,
      role,
      address: {
        street: 'Smoke Street 1',
        city: 'Kolkata',
        state: 'West Bengal',
        country: 'India',
        zipCode: '700001'
      },
      location: { type: 'Point', coordinates: [88.3639, 22.5726] },
      ...extra
    })
  });

  assert(register.ok && register.data && register.data.success, `${role} register`, register);

  const login = await api('/auth/login', {
    method: 'POST',
    body: JSON.stringify({ email, password })
  });

  assert(login.ok && login.data && login.data.token, `${role} login`, login);

  return {
    email,
    phone,
    token: login.data.token,
    user: login.data.user
  };
}

(async () => {
  console.log('--- Platform Endpoint Smoke Test ---');

  const health = await api('/health', { method: 'GET' });
  assert(health.ok && health.data && health.data.status === 'ok', 'health endpoint', health);

  const donor = await registerAndLogin('donor', 'SmokeDonor', 'User');
  const receiver = await registerAndLogin('receiver', 'SmokeReceiver', 'User');
  const hospital = await registerAndLogin('hospital', 'SmokeHospital', 'User');

  const donorProfile = await api('/donors/profile', {
    method: 'POST',
    body: JSON.stringify({
      bloodGroup: 'O+',
      weight: 70,
      height: 175,
      healthDeclaration: {
        hasChronicDisease: false,
        hasTattooRecently: false,
        hasRecentSurgery: false,
        isPregnant: false,
        hasSTD: false,
        hasHepatitis: false,
        hasHIV: false,
        usesIntravenousDrugs: false
      }
    })
  }, donor.token);
  assert(donorProfile.ok, 'donor profile create/update', donorProfile);

  const donorStats = await api('/donors/stats', { method: 'GET' }, donor.token);
  assert(donorStats.ok && donorStats.data && donorStats.data.success, 'donor stats endpoint', donorStats);

  const donorEligibility = await api('/donors/check-eligibility', { method: 'GET' }, donor.token);
  assert(donorEligibility.ok || donorEligibility.status === 404, 'donor eligibility endpoint reachable', donorEligibility);

  const hospitalBefore = await api('/hospitals/my-hospital', { method: 'GET' }, hospital.token);
  assert(hospitalBefore.status === 404, 'hospital profile initially missing', hospitalBefore);

  const regNo = `SMOKE-REG-${Date.now()}`;
  const hospitalProfile = await api('/hospitals/register', {
    method: 'POST',
    body: JSON.stringify({
      name: 'Smoke Runtime Hospital',
      registrationNumber: regNo,
      email: hospital.email,
      phone: hospital.phone,
      emergencyPhone: '+917857917511',
      hasBloodBank: true,
      hasDonationCenter: true,
      address: {
        street: '390 RR Plot',
        city: 'Kolkata',
        state: 'West Bengal',
        country: 'India',
        zipCode: '700107'
      },
      location: { type: 'Point', coordinates: [88.41, 22.54] }
    })
  }, hospital.token);
  assert(hospitalProfile.status === 201 && hospitalProfile.data && hospitalProfile.data.hospital, 'hospital profile creation', hospitalProfile);

  const myHospital = await api('/hospitals/my-hospital', { method: 'GET' }, hospital.token);
  assert(myHospital.ok && myHospital.data && myHospital.data.hospital && myHospital.data.hospital._id, 'hospital profile fetch', myHospital);
  const hospitalId = myHospital.data.hospital._id;

  const stockAdd = await api('/hospitals/stock', {
    method: 'PUT',
    body: JSON.stringify({
      bloodGroup: 'O+',
      action: 'add',
      unitDetails: {
        unitId: `UNIT-${Date.now()}-${Math.random().toString(36).slice(2, 8).toUpperCase()}`,
        bagNumber: `BAG-${Date.now()}-${Math.random().toString(36).slice(2, 8).toUpperCase()}`,
        expiryDate: new Date(Date.now() + 25 * 24 * 60 * 60 * 1000).toISOString(),
        status: 'available',
        testResults: {
          hiv: 'negative',
          hepatitisB: 'negative',
          hepatitisC: 'negative',
          syphilis: 'negative',
          malaria: 'negative',
          overallStatus: 'safe'
        },
        testedAt: new Date().toISOString(),
        testedBy: 'Smoke QA'
      }
    })
  }, hospital.token);
  assert(stockAdd.ok, 'hospital stock add endpoint', stockAdd);

  const stockOverview = await api('/hospitals/stock/overview', { method: 'GET' }, hospital.token);
  assert(stockOverview.ok && stockOverview.data && stockOverview.data.overview, 'hospital stock overview', stockOverview);

  const requestCreate = await api('/requests', {
    method: 'POST',
    body: JSON.stringify({
      patientInfo: { name: 'Receiver Patient', age: 30, gender: 'male' },
      bloodGroup: 'O+',
      bloodComponent: 'whole_blood',
      unitsRequired: 1,
      urgency: 'urgent',
      hospital: hospitalId,
      hospitalName: 'Smoke Runtime Hospital',
      hospitalAddress: 'Kolkata',
      location: { type: 'Point', coordinates: [88.41, 22.54] },
      contactName: 'Receiver Contact',
      contactPhone: receiver.phone,
      requiredBy: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
      medicalNotes: 'Platform smoke test'
    })
  }, receiver.token);
  assert(requestCreate.status === 201 && requestCreate.data && requestCreate.data.request && requestCreate.data.request._id, 'receiver request create', requestCreate);
  const requestId = requestCreate.data.request._id;

  const hospitalRequests = await api('/hospitals/requests?limit=10', { method: 'GET' }, hospital.token);
  assert(hospitalRequests.ok && hospitalRequests.data && Array.isArray(hospitalRequests.data.requests), 'hospital requests list', hospitalRequests);

  const requestByIdHospital = await api(`/requests/${requestId}`, { method: 'GET' }, hospital.token);
  assert(requestByIdHospital.ok && requestByIdHospital.data && requestByIdHospital.data.request, 'hospital request detail access', requestByIdHospital);

  const donorRequests = await api('/requests?limit=10', { method: 'GET' }, donor.token);
  assert(donorRequests.ok && donorRequests.data && Array.isArray(donorRequests.data.requests), 'donor request feed', donorRequests);

  const donorRespond = await api(`/requests/${requestId}/respond`, {
    method: 'POST',
    body: JSON.stringify({ accept: true })
  }, donor.token);
  assert(donorRespond.ok, 'donor respond to request', donorRespond);

  const hospitalFulfill = await api(`/requests/${requestId}/status`, {
    method: 'PUT',
    body: JSON.stringify({ status: 'fulfilled', notes: 'Smoke fulfilled' })
  }, hospital.token);
  assert(hospitalFulfill.ok && hospitalFulfill.data && hospitalFulfill.data.request && hospitalFulfill.data.request.status === 'fulfilled', 'hospital fulfill request', hospitalFulfill);

  const notifications = await api('/notifications', { method: 'GET' }, receiver.token);
  assert(notifications.ok && notifications.data && notifications.data.success, 'receiver notifications endpoint', notifications);

  const markAllRead = await api('/notifications/mark-all-read', { method: 'PUT' }, receiver.token);
  assert(markAllRead.ok, 'mark all notifications read', markAllRead);

  const schedules = await api('/schedules?limit=5', { method: 'GET' }, donor.token);
  assert(schedules.ok && schedules.data && schedules.data.success, 'schedules endpoint', schedules);

  const hospitalsPublic = await api('/hospitals?limit=5', { method: 'GET' });
  assert(hospitalsPublic.ok && hospitalsPublic.data && Array.isArray(hospitalsPublic.data.hospitals), 'public hospitals list endpoint', hospitalsPublic);

  console.log('--- RESULT: PLATFORM SMOKE PASSED ---');
  process.exit(0);
})().catch((error) => {
  console.error('Unexpected smoke failure:', error && error.message ? error.message : error);
  process.exit(1);
});
