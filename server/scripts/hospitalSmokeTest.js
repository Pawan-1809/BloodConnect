const base = 'http://localhost:5000/api';

async function call(path, options = {}, token) {
  const headers = { 'Content-Type': 'application/json', ...(options.headers || {}) };
  if (token) headers.Authorization = `Bearer ${token}`;
  const res = await fetch(`${base}${path}`, { ...options, headers });
  const text = await res.text();
  let data;
  try {
    data = text ? JSON.parse(text) : {};
  } catch {
    data = { raw: text };
  }
  return { status: res.status, ok: res.ok, data };
}

function assert(cond, msg, payload) {
  if (!cond) {
    console.error(`FAIL: ${msg}`);
    if (payload !== undefined) {
      console.error(JSON.stringify(payload, null, 2));
    }
    process.exit(1);
  }
  console.log(`PASS: ${msg}`);
}

(async () => {
  const stamp = Date.now();
  const email = `hospital.smoke.${stamp}@example.com`;
  const password = 'TestPass123';
  const phone = `+91${Math.floor(7000000000 + Math.random() * 2000000000)}`;

  console.log('--- Hospital Runtime Smoke Test ---');

  const registerUser = await call('/auth/register', {
    method: 'POST',
    body: JSON.stringify({
      email,
      phone,
      password,
      firstName: 'Smoke',
      lastName: 'Hospital',
      role: 'hospital',
      address: {
        street: '12 Smoke Street',
        city: 'Kolkata',
        state: 'West Bengal',
        country: 'India',
        zipCode: '700001'
      },
      location: { type: 'Point', coordinates: [88.3639, 22.5726] }
    })
  });
  assert(registerUser.ok && registerUser.data && registerUser.data.success, 'Register hospital user', registerUser);

  const login = await call('/auth/login', {
    method: 'POST',
    body: JSON.stringify({ email, password })
  });
  assert(login.ok && login.data && login.data.token, 'Login hospital user', login);
  const token = login.data.token;

  const myHospitalBefore = await call('/hospitals/my-hospital', { method: 'GET' }, token);
  assert(myHospitalBefore.status === 404, 'Profile absent before hospital registration', myHospitalBefore);

  const regNo = `SMOKE-HOSP-${stamp}`;
  const createProfile = await call('/hospitals/register', {
    method: 'POST',
    body: JSON.stringify({
      name: 'Smoke Test Hospital',
      registrationNumber: regNo,
      email,
      phone,
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
  }, token);
  assert(createProfile.status === 201 && createProfile.data && createProfile.data.hospital && createProfile.data.hospital._id, 'Create hospital profile', createProfile);

  const myHospital = await call('/hospitals/my-hospital', { method: 'GET' }, token);
  assert(myHospital.ok && myHospital.data && myHospital.data.hospital && myHospital.data.hospital.name === 'Smoke Test Hospital', 'Fetch hospital profile', myHospital);
  const hospitalId = myHospital.data.hospital._id;

  const threshold = await call('/hospitals/stock', {
    method: 'PUT',
    body: JSON.stringify({
      bloodGroup: 'O+',
      action: 'update_threshold',
      units: { min: 3, critical: 1 }
    })
  }, token);
  assert(threshold.ok && threshold.data && threshold.data.stock && threshold.data.stock.bloodGroup === 'O+', 'Update stock threshold', threshold);

  const unitId = `UNIT-SMOKE-${stamp}`;
  const bagId = `BAG-SMOKE-${stamp}`;
  const addUnit = await call('/hospitals/stock', {
    method: 'PUT',
    body: JSON.stringify({
      bloodGroup: 'O+',
      action: 'add',
      unitDetails: {
        unitId,
        bagNumber: bagId,
        expiryDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
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
  }, token);
  assert(addUnit.ok && addUnit.data && addUnit.data.stock && addUnit.data.stock.availableUnits >= 1, 'Add blood unit to stock', addUnit);

  const overview = await call('/hospitals/stock/overview', { method: 'GET' }, token);
  assert(overview.ok && overview.data && Array.isArray(overview.data.stocks), 'Fetch stock overview', overview);
  const oPlus = (overview.data.stocks || []).find((s) => s.bloodGroup === 'O+');
  assert(oPlus && oPlus.availableUnits >= 1, 'O+ stock reflects added unit', overview);

  const requestCreate = await call('/requests', {
    method: 'POST',
    body: JSON.stringify({
      patientInfo: { name: 'Smoke Patient', age: 35, gender: 'male' },
      bloodGroup: 'O+',
      bloodComponent: 'whole_blood',
      unitsRequired: 1,
      urgency: 'urgent',
      hospital: hospitalId,
      hospitalName: 'Smoke Test Hospital',
      hospitalAddress: '390 RR Plot, Kolkata',
      location: { type: 'Point', coordinates: [88.41, 22.54] },
      contactName: 'Smoke Operator',
      contactPhone: phone,
      requiredBy: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
      medicalNotes: 'Smoke test request'
    })
  }, token);
  assert(requestCreate.status === 201 && requestCreate.data && requestCreate.data.request && requestCreate.data.request._id, 'Create hospital blood request', requestCreate);
  const requestId = requestCreate.data.request._id;

  const hospitalRequests = await call('/hospitals/requests?limit=20', { method: 'GET' }, token);
  assert(hospitalRequests.ok && hospitalRequests.data && Array.isArray(hospitalRequests.data.requests), 'Fetch hospital requests', hospitalRequests);
  const found = hospitalRequests.data.requests.find((r) => r._id === requestId);
  assert(!!found, 'New request visible in hospital request list', hospitalRequests);

  const fulfill = await call(`/requests/${requestId}/status`, {
    method: 'PUT',
    body: JSON.stringify({ status: 'fulfilled', notes: 'Smoke test fulfilled' })
  }, token);
  assert(fulfill.ok && fulfill.data && fulfill.data.request && fulfill.data.request.status === 'fulfilled', 'Fulfill hospital request', fulfill);

  const fulfilledRequests = await call('/hospitals/requests?status=fulfilled&limit=20', { method: 'GET' }, token);
  assert(fulfilledRequests.ok && fulfilledRequests.data && Array.isArray(fulfilledRequests.data.requests), 'Fetch fulfilled hospital requests', fulfilledRequests);
  const fulfilledItem = fulfilledRequests.data.requests.find((r) => r._id === requestId && r.status === 'fulfilled');
  assert(!!fulfilledItem, 'Request status persisted as fulfilled', fulfilledRequests);

  console.log('--- RESULT: ALL SMOKE CHECKS PASSED ---');
  process.exit(0);
})().catch((err) => {
  console.error('Unexpected smoke test failure:', err && err.message ? err.message : err);
  process.exit(1);
});
