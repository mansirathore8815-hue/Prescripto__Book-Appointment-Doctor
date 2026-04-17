const axios = require('axios');
const FormData = require('form-data');
const fs = require('fs');

const BACKEND_URL = 'http://localhost:8000';

// Test data
const testUser = {
  name: 'John Doe',
  email: `john${Date.now()}@example.com`,
  password: 'JohnPass@123'
};

const testAdmin = {
  email: 'admin@example.com',
  password: 'admin123456'
};

// Test doctor data (will be created via admin)
const testDoctor = {
  name: 'Dr. Sarah Smith',
  email: `doctor${Date.now()}@example.com`,
  password: 'DocPass@123',
  speciality: 'General physician',
  degree: 'MBBS',
  experience: 5,
  about: 'Experienced general physician with 5 years of experience',
  fees: 100,
  address: JSON.stringify({ city: 'New York', state: 'NY', zip: '10001' })
};

let userToken = null;
let adminToken = null;
let doctorToken = null;
let doctorId = null;

async function test(name, fn) {
  try {
    await fn();
    console.log(`✅ PASSED: ${name}`);
    return true;
  } catch (error) {
    console.error(`\n❌ FAILED: ${name}`);
    console.error('Error:', error.response?.data?.message || error.message);
    return false;
  }
}

async function runTests() {
  let passCount = 0;
  let totalTests = 0;

  console.log('╔════════════════════════════════════════════════════════╗');
  console.log('║    DOCTOR APPOINTMENT SYSTEM - WORKFLOW TEST SUITE    ║');
  console.log('╚════════════════════════════════════════════════════════╝\n');

  // ADMIN SETUP
  console.log('\n📋 PHASE 1: ADMIN SETUP\n');

  totalTests++;
  if (await test('Admin Login', async () => {
    console.log(`  Using: ${testAdmin.email}`);
    const response = await axios.post(`${BACKEND_URL}/api/admin/login`, testAdmin);
    if (!response.data.success) throw new Error(response.data.message);
    adminToken = response.data.token;
    console.log(`  ✓ Token: ${adminToken.substring(0, 20)}...`);
  })) { passCount++; }

  // CREATE TEST DOCTOR
  totalTests++;
  if (await test('Create Test Doctor (via Admin)', async () => {
    console.log(`  Doctor: ${testDoctor.name}`);
    
    const formData = new FormData();
    formData.append('name', testDoctor.name);
    formData.append('email', testDoctor.email);
    formData.append('password', testDoctor.password);
    formData.append('speciality', testDoctor.speciality);
    formData.append('degree', testDoctor.degree);
    formData.append('experience', testDoctor.experience);
    formData.append('about', testDoctor.about);
    formData.append('fees', testDoctor.fees);
    formData.append('address', testDoctor.address);
    
    // Use a placeholder image (1x1 pixel PNG)
    const pngBuffer = Buffer.from([
      0x89, 0x50, 0x4E, 0x47, 0x0D, 0x0A, 0x1A, 0x0A, 0x00, 0x00, 0x00, 0x0D,
      0x49, 0x48, 0x44, 0x52, 0x00, 0x00, 0x00, 0x01, 0x00, 0x00, 0x00, 0x01,
      0x08, 0x06, 0x00, 0x00, 0x00, 0x1F, 0x15, 0xC4, 0x89, 0x00, 0x00, 0x00,
      0x0A, 0x49, 0x44, 0x41, 0x54, 0x78, 0x9C, 0x63, 0x00, 0x01, 0x00, 0x00,
      0x05, 0x00, 0x01, 0x0D, 0x0A, 0x2D, 0xB4, 0x00, 0x00, 0x00, 0x00, 0x49,
      0x45, 0x4E, 0x44, 0xAE, 0x42, 0x60, 0x82
    ]);
    formData.append('image', pngBuffer, 'doctor.png');
    
    const response = await axios.post(`${BACKEND_URL}/api/admin/add-doctor`, formData, {
      headers: {
        ...formData.getHeaders(),
        aToken: adminToken
      }
    });
    
    if (!response.data.success) throw new Error(response.data.message);
    console.log(`  ✓ Doctor created successfully`);
  })) { passCount++; }

  // GET DOCTORS LIST
  totalTests++;
  if (await test('Fetch Doctors List', async () => {
    const response = await axios.get(`${BACKEND_URL}/api/doctor/list`);
    if (!response.data.success) throw new Error(response.data.message);
    if (response.data.doctors.length === 0) throw new Error('No doctors found in database');
    doctorId = response.data.doctors[0]._id;
    console.log(`  ✓ Found ${response.data.doctors.length} doctor(s)`);
    console.log(`  ✓ Using Doctor: ${response.data.doctors[0].name}`);
  })) { passCount++; }

  // ADMIN PLATFORM STATS
  totalTests++;
  if (await test('Get Platform Statistics (Admin)', async () => {
    const response = await axios.get(`${BACKEND_URL}/api/admin/stats`, {
      headers: { aToken: adminToken }
    });
    if (!response.data.success) throw new Error(response.data.message);
    console.log(`  ✓ Doctors: ${response.data.stats.totalDoctors}`);
    console.log(`  ✓ Users: ${response.data.stats.totalUsers}`);
  })) { passCount++; }

  // USER WORKFLOW
  console.log('\n👤 PHASE 2: USER WORKFLOW\n');

  // SIGNUP
  totalTests++;
  if (await test('User Signup', async () => {
    console.log(`  Name: ${testUser.name}`);
    console.log(`  Email: ${testUser.email}`);
    const response = await axios.post(`${BACKEND_URL}/api/user/register`, testUser);
    if (!response.data.success) throw new Error(response.data.message);
    userToken = response.data.token;
    console.log(`  ✓ Token: ${userToken.substring(0, 20)}...`);
  })) { passCount++; }

  // LOGIN
  totalTests++;
  if (await test('User Login (same email)', async () => {
    const response = await axios.post(`${BACKEND_URL}/api/user/login`, {
      email: testUser.email,
      password: testUser.password
    });
    if (!response.data.success) throw new Error(response.data.message);
    userToken = response.data.token;
    console.log(`  ✓ Successfully logged in`);
  })) { passCount++; }

  // GET DASHBOARD
  totalTests++;
  if (await test('Get User Dashboard', async () => {
    const response = await axios.get(`${BACKEND_URL}/api/user/dashboard`, {
      headers: { token: userToken }
    });
    if (!response.data.success) throw new Error(response.data.message);
    console.log(`  ✓ Total Appointments: ${response.data.stats.total}`);
    console.log(`  ✓ Completed: ${response.data.stats.completed}`);
    console.log(`  ✓ Pending: ${response.data.stats.pending}`);
  })) { passCount++; }

  // GET PROFILE
  totalTests++;
  if (await test('Get User Profile', async () => {
    const response = await axios.get(`${BACKEND_URL}/api/user/get-profile`, {
      headers: { token: userToken }
    });
    if (!response.data.success) throw new Error(response.data.message);
    console.log(`  ✓ Profile: ${response.data.userData.name} (${response.data.userData.email})`);
  })) { passCount++; }

  // GET DOCTOR SLOTS
  totalTests++;
  if (await test('Get Doctor Available Slots', async () => {
    const date = new Date();
    date.setDate(date.getDate() + 1);
    const dateStr = `${String(date.getDate()).padStart(2, '0')}_${String(date.getMonth() + 1).padStart(2, '0')}_${date.getFullYear()}`;
    
    const response = await axios.post(`${BACKEND_URL}/api/user/get-doctor-slots`, 
      { docId: doctorId, date: dateStr },
      { headers: { token: userToken } }
    );
    if (!response.data.success) throw new Error(response.data.message);
    console.log(`  ✓ Available slots retrieved`);
  })) { passCount++; }

  // BOOK APPOINTMENT
  let appointmentId = null;
  totalTests++;
  if (await test('Book Appointment', async () => {
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    const dateStr = `${String(tomorrow.getDate()).padStart(2, '0')}_${String(tomorrow.getMonth() + 1).padStart(2, '0')}_${tomorrow.getFullYear()}`;
    
    // Use a random time slot to avoid conflicts
    const timeSlots = ["09:00", "09:30", "10:00", "10:30", "11:00", "11:30", "12:00", "14:00", "14:30", "15:00"];
    const randomSlot = timeSlots[Math.floor(Math.random() * timeSlots.length)];
    
    const response = await axios.post(`${BACKEND_URL}/api/user/book-appointment`, 
      { docId: doctorId, slotDate: dateStr, slotTime: randomSlot },
      { headers: { token: userToken } }
    );
    if (!response.data.success) throw new Error(response.data.message);
    appointmentId = response.data.appointment ? response.data.appointment._id : null;
    if (!appointmentId) throw new Error("No appointment ID returned");
    console.log(`  ✓ Appointment booked for ${dateStr} at ${randomSlot}`);
  })) { passCount++; }

  // MAKE PAYMENT
  totalTests++;
  if (await test('Make Payment', async () => {
    const response = await axios.post(`${BACKEND_URL}/api/user/make-payment`, 
      { appointmentId },
      { headers: { token: userToken } }
    );
    if (!response.data.success) throw new Error(response.data.message);
    console.log(`  ✓ Payment successful`);
  })) { passCount++; }

  // GET APPOINTMENTS
  totalTests++;
  if (await test('Get User Appointments', async () => {
    const response = await axios.get(`${BACKEND_URL}/api/user/appointments`, {
      headers: { token: userToken }
    });
    if (!response.data.success) throw new Error(response.data.message);
    console.log(`  ✓ Found ${response.data.appointments.length} appointment(s)`);
  })) { passCount++; }

  // DOCTOR WORKFLOW
  console.log('\n⚕️  PHASE 3: DOCTOR WORKFLOW\n');

  // DOCTOR LOGIN
  totalTests++;
  if (await test('Doctor Login', async () => {
    console.log(`  Email: ${testDoctor.email}`);
    const response = await axios.post(`${BACKEND_URL}/api/doctor/login`, {
      email: testDoctor.email,
      password: testDoctor.password
    });
    if (!response.data.success) throw new Error(response.data.message);
    doctorToken = response.data.token;
    console.log(`  ✓ Token: ${doctorToken.substring(0, 20)}...`);
  })) { passCount++; }

  // GET APPOINTMENTS
  totalTests++;
  if (await test('Doctor: Get Appointments', async () => {
    const response = await axios.get(`${BACKEND_URL}/api/doctor/appointments`, {
      headers: { dToken: doctorToken }
    });
    if (!response.data.success) throw new Error(response.data.message);
    console.log(`  ✓ Found ${response.data.appointments.length} appointment(s)`);
  })) { passCount++; }

  // APPROVE APPOINTMENT
  totalTests++;
  if (appointmentId && await test('Doctor: Approve Appointment', async () => {
    const response = await axios.post(`${BACKEND_URL}/api/doctor/approve-appointment`,
      { appointmentId },
      { headers: { dToken: doctorToken } }
    );
    if (!response.data.success) throw new Error(response.data.message);
    console.log(`  ✓ Appointment approved`);
  })) { passCount++; }

  // COMPLETE APPOINTMENT
  totalTests++;
  if (appointmentId && await test('Doctor: Complete Appointment', async () => {
    const response = await axios.post(`${BACKEND_URL}/api/doctor/complete-appointment`,
      { appointmentId },
      { headers: { dToken: doctorToken } }
    );
    if (!response.data.success) throw new Error(response.data.message);
    console.log(`  ✓ Appointment marked as complete`);
  })) { passCount++; }

  // GET EARNINGS
  totalTests++;
  if (await test('Doctor: Get Earnings', async () => {
    const response = await axios.get(`${BACKEND_URL}/api/doctor/earnings`, {
      headers: { dToken: doctorToken }
    });
    if (!response.data.success) throw new Error(response.data.message);
    console.log(`  ✓ Total Earnings: $${response.data.earning || 0}`);
    console.log(`  ✓ Last 30 Days: $${response.data.earning30Days || 0}`);
  })) { passCount++; }

  // ADD REVIEW
  totalTests++;
  if (appointmentId && await test('User: Add Review', async () => {
    const response = await axios.post(`${BACKEND_URL}/api/user/add-review`,
      { appointmentId, rating: 5, reviewText: 'Excellent doctor!' },
      { headers: { token: userToken } }
    );
    if (!response.data.success) throw new Error(response.data.message);
    console.log(`  ✓ Review added successfully`);
  })) { passCount++; }

  // GET REVIEWS
  totalTests++;
  if (await test('Get Doctor Reviews', async () => {
    const response = await axios.post(`${BACKEND_URL}/api/user/get-doctor-reviews`,
      { docId: doctorId },
      { headers: { token: userToken } }
    );
    if (!response.data.success) throw new Error(response.data.message);
    console.log(`  ✓ Doctor has ${response.data.reviews.length} review(s)`);
  })) { passCount++; }

  // FINAL ADMIN STATS
  console.log('\n📊 PHASE 4: FINAL VERIFICATION\n');

  totalTests++;
  if (await test('Verify Updated Platform Stats', async () => {
    const response = await axios.get(`${BACKEND_URL}/api/admin/stats`, {
      headers: { aToken: adminToken }
    });
    if (!response.data.success) throw new Error(response.data.message);
    console.log(`  ✓ Total Users: ${response.data.stats.totalUsers}`);
    console.log(`  ✓ Total Appointments: ${response.data.stats.totalAppointments}`);
    console.log(`  ✓ Completed Appointments: ${response.data.stats.completedAppointments}`);
    console.log(`  ✓ Total Revenue: $${response.data.stats.totalRevenue}`);
  })) { passCount++; }

  // SUMMARY
  console.log('\n╔════════════════════════════════════════════════════════╗');
  console.log('║                    TEST SUMMARY                        ║');
  console.log('╚════════════════════════════════════════════════════════╝\n');
  console.log(`📈 Tests Passed: ${passCount}/${totalTests}`);
  console.log(`✅ Success Rate: ${((passCount/totalTests)*100).toFixed(1)}%\n`);

  if (passCount === totalTests) {
    console.log('🎉 ALL WORKFLOWS VERIFIED SUCCESSFULLY! 🎉\n');
    console.log('The following functionality is working:');
    console.log('  ✓ User Signup & Login');
    console.log('  ✓ User Dashboard & Profile');
    console.log('  ✓ Appointment Booking & Payment');
    console.log('  ✓ Doctor Login & Dashboard');
    console.log('  ✓ Appointment Approval & Completion');
    console.log('  ✓ Review & Rating System');
    console.log('  ✓ Admin Dashboard & Statistics\n');
  } else {
    console.log(`⚠️  ${totalTests - passCount} test(s) failed. Please review the errors above.\n`);
  }
}

// Install form-data if not present
try {
  require('form-data');
} catch (e) {
  console.log('Installing form-data package...');
  require('child_process').execSync('npm install form-data --save');
}

runTests().catch(console.error);
