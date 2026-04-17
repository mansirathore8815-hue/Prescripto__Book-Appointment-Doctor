const axios = require('axios');

const BACKEND_URL = 'http://localhost:8000';

// Test data
const testUser = {
  name: 'Test User',
  email: `testuser${Date.now()}@example.com`,
  password: 'TestPassword123'
};

const testDoctor = {
  email: 'doctor@example.com',  // This should already exist in DB
  password: 'Docpass@123'
};

const testAdmin = {
  email: 'admin@example.com',
  password: 'admin123456'
};

let userToken = null;
let doctorToken = null;
let adminToken = null;
let doctorId = null;

async function test(name, fn) {
  try {
    console.log(`\n✓ Testing: ${name}`);
    await fn();
    console.log(`✅ PASSED: ${name}`);
  } catch (error) {
    console.error(`❌ FAILED: ${name}`);
    console.error('Error:', error.response?.data || error.message);
  }
}

async function runTests() {
  console.log('====== STARTING WORKFLOW TESTS ======\n');

  // USER WORKFLOW
  console.log('\n--- USER WORKFLOW ---');

  await test('User Signup', async () => {
    const response = await axios.post(`${BACKEND_URL}/api/user/register`, testUser);
    if (!response.data.success) throw new Error('Signup failed');
    userToken = response.data.token;
    console.log(`  Email: ${testUser.email}`);
    console.log(`  Token: ${userToken.substring(0, 20)}...`);
  });

  await test('User Login with same email', async () => {
    const response = await axios.post(`${BACKEND_URL}/api/user/login`, {
      email: testUser.email,
      password: testUser.password
    });
    if (!response.data.success) throw new Error('Login failed');
    if (response.data.token !== userToken) {
      console.log('  ⚠️ Different token returned (expected with new login)');
    }
    userToken = response.data.token;
  });

  await test('Get User Dashboard', async () => {
    const response = await axios.get(`${BACKEND_URL}/api/user/dashboard`, {
      headers: { token: userToken }
    });
    if (!response.data.success) throw new Error('Dashboard fetch failed');
    console.log(`  Total Appointments: ${response.data.dashData.appointments || 0}`);
    console.log(`  Completed: ${response.data.dashData.completedAppointments || 0}`);
  });

  await test('Get Doctors List', async () => {
    const response = await axios.get(`${BACKEND_URL}/api/doctor/list`);
    if (!response.data.success) throw new Error('Doctors list failed');
    console.log(`  Total Doctors: ${response.data.doctors.length}`);
    if (response.data.doctors.length > 0) {
      doctorId = response.data.doctors[0]._id;
      console.log(`  First Doctor: ${response.data.doctors[0].name} (${response.data.doctors[0].speciality})`);
    }
  });

  await test('Get Doctor Available Slots', async () => {
    if (!doctorId) {
      console.log('  ⚠️ Skipped: No doctorId found');
      return;
    }
    const response = await axios.get(`${BACKEND_URL}/api/user/get-doctor-slots`, {
      params: { docId: doctorId },
      headers: { token: userToken }
    });
    if (!response.data.success) throw new Error('Slots fetch failed');
    console.log(`  Available time slots retrieved`);
  });

  // DOCTOR WORKFLOW
  console.log('\n--- DOCTOR WORKFLOW ---');

  await test('Doctor Login', async () => {
    const response = await axios.post(`${BACKEND_URL}/api/doctor/login`, testDoctor);
    if (!response.data.success) {
      throw new Error('Doctor login failed - Doctor account may not exist. Create via admin first.');
    }
    doctorToken = response.data.token;
    console.log(`  Token: ${doctorToken.substring(0, 20)}...`);
  });

  await test('Get Doctor Appointments', async () => {
    const response = await axios.get(`${BACKEND_URL}/api/doctor/appointments`, {
      headers: { dToken: doctorToken }
    });
    if (!response.data.success) throw new Error('Appointments fetch failed');
    console.log(`  Total Appointments: ${response.data.appointments.length}`);
  });

  await test('Get Doctor Earnings', async () => {
    const response = await axios.get(`${BACKEND_URL}/api/doctor/earnings`, {
      headers: { dToken: doctorToken }
    });
    if (!response.data.success) throw new Error('Earnings fetch failed');
    console.log(`  Total Earnings: $${response.data.earnings.totalEarnings || 0}`);
    console.log(`  Last 30 Days: $${response.data.earnings.last30Days || 0}`);
  });

  // ADMIN WORKFLOW
  console.log('\n--- ADMIN WORKFLOW ---');

  await test('Admin Login', async () => {
    const response = await axios.post(`${BACKEND_URL}/api/admin/login`, testAdmin);
    if (!response.data.success) throw new Error('Admin login failed');
    adminToken = response.data.token;
    console.log(`  Token: ${adminToken.substring(0, 20)}...`);
  });

  await test('Get Platform Statistics', async () => {
    const response = await axios.get(`${BACKEND_URL}/api/admin/stats`, {
      headers: { aToken: adminToken }
    });
    if (!response.data.success) throw new Error('Stats fetch failed');
    console.log(`  Total Doctors: ${response.data.stats.totalDoctors || 0}`);
    console.log(`  Total Users: ${response.data.stats.totalUsers || 0}`);
    console.log(`  Total Appointments: ${response.data.stats.totalAppointments || 0}`);
    console.log(`  Platform Revenue: $${response.data.stats.totalRevenue || 0}`);
  });

  await test('Get All Doctors', async () => {
    const response = await axios.get(`${BACKEND_URL}/api/admin/all-doctors`, {
      headers: { aToken: adminToken }
    });
    if (!response.data.success) throw new Error('All doctors fetch failed');
    console.log(`  Total Doctors in System: ${response.data.doctors.length}`);
  });

  await test('Search Doctors', async () => {
    const response = await axios.get(`${BACKEND_URL}/api/admin/search-doctors?query=general`, {
      headers: { aToken: adminToken }
    });
    if (!response.data.success) throw new Error('Search failed');
    console.log(`  Search Results: ${response.data.doctors.length} doctors found`);
  });

  console.log('\n====== TESTS COMPLETED ======\n');
}

runTests().catch(console.error);
