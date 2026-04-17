const axios = require('axios');
const FormData = require('form-data');

const BACKEND_URL = 'http://localhost:8000';

// Use fixed test data for consistency
const testAdmin = { email: 'admin@example.com', password: 'admin123456' };
const testUser = { name: 'Test User One', email: `user${Date.now()}@test.com`, password: 'Password@123' };
const testDoctor = { 
  name: 'Dr. Ahmed Khan',
  email: 'dr.ahmed@test.com',
  password: 'DoctorPass@123',
  speciality: 'General physician',
  degree: 'MBBS',
  experience: 8,
  about: 'Experience general physician',
  fees: 150,
  address: JSON.stringify({ city: 'NYC', state: 'NY' })
};

let adminToken, userToken, doctorToken, doctorId, appointmentId;
let passCount = 0, totalTests = 0;

async function test(name, fn) {
  try {
    await fn();
    console.log(`✅ ${name}`);
    return true;
  } catch (error) {
    console.error(`❌ ${name}`);
    console.error(`   Error: ${error.response?.data?.message || error.message}\n`);
    return false;
  }
}

async function main() {
  console.log('\n════════════════════════════════════════════════════\n');
  console.log('   🚀 DOCTOR APPOINTMENT SYSTEM - COMPLETE TEST 🚀\n');
  console.log('════════════════════════════════════════════════════\n');

  // ADMIN LOGIN
  console.log('📋 ADMIN OPERATIONS\n');
  totalTests++;
  if (await test('1. Admin Login', async () => {
    const { data } = await axios.post(`${BACKEND_URL}/api/admin/login`, testAdmin);
    if (!data.success) throw new Error('Admin login failed');
    adminToken = data.token;
  })) passCount++;

  // CREATE DOCTOR
  totalTests++;
  if (await test('2. Create Doctor (via Admin)', async () => {
    // Check if doctor exists first
    try {
      const loginResp = await axios.post(`${BACKEND_URL}/api/doctor/login`, {
        email: testDoctor.email,
        password: testDoctor.password
      });
      if (loginResp.data.success) {
        doctorToken = loginResp.data.token;
        return; // Doctor already exists
      }
    } catch (e) {
      // Doctor doesn't exist, create it
    }

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

    const pngBuffer = Buffer.from([
      0x89, 0x50, 0x4E, 0x47, 0x0D, 0x0A, 0x1A, 0x0A, 0x00, 0x00, 0x00, 0x0D,
      0x49, 0x48, 0x44, 0x52, 0x00, 0x00, 0x00, 0x01, 0x00, 0x00, 0x00, 0x01,
      0x08, 0x06, 0x00, 0x00, 0x00, 0x1F, 0x15, 0xC4, 0x89
    ]);
    formData.append('image', pngBuffer, 'doc.png');

    const { data } = await axios.post(`${BACKEND_URL}/api/admin/add-doctor`, formData, {
      headers: { ...formData.getHeaders(), aToken: adminToken }
    });
    if (!data.success) throw new Error('Doctor creation failed');
  })) passCount++;

  // GET DOCTORS
  totalTests++;
  if (await test('3. Get Doctors List', async () => {
    const { data } = await axios.get(`${BACKEND_URL}/api/doctor/list`);
    if (!data.success || data.doctors.length === 0) throw new Error('No doctors found');
    doctorId = data.doctors.find(d => d.email === testDoctor.email)?._id ||  data.doctors[0]._id;
  })) passCount++;

  // GET STATS
  totalTests++;
  if (await test('4. Platform Statistics', async () => {
    const { data } = await axios.get(`${BACKEND_URL}/api/admin/stats`, { headers: { aToken: adminToken } });
    if (!data.success) throw new Error('Stats fetch failed');
  })) passCount++;

  // USER SIGNUP
  console.log('\n👤 USER OPERATIONS\n');
  totalTests++;
  if (await test('5. User Signup', async () => {
    const { data } = await axios.post(`${BACKEND_URL}/api/user/register`, testUser);
    if (!data.success) throw new Error('Signup failed');
    userToken = data.token;
  })) passCount++;

  // USER LOGIN
  totalTests++;
  if (await test('6. User Login', async () => {
    const { data } = await axios.post(`${BACKEND_URL}/api/user/login`, {
      email: testUser.email,
      password: testUser.password
    });
    if (!data.success) throw new Error('Login failed');
    userToken = data.token;
  })) passCount++;

  // USER PROFILE
  totalTests++;
  if (await test('7. Get User Profile', async () => {
    const { data } = await axios.get(`${BACKEND_URL}/api/user/get-profile`, { headers: { token: userToken } });
    if (!data.success) throw new Error('Profile fetch failed');
  })) passCount++;

  // USER DASHBOARD
  totalTests++;
  if (await test('8. User Dashboard', async () => {
    const { data } = await axios.get(`${BACKEND_URL}/api/user/dashboard`, { headers: { token: userToken } });
    if (!data.success) throw new Error('Dashboard fetch failed');
  })) passCount++;

  // GET SLOTS
  totalTests++;
  if (await test('9. Get Doctor Slots', async () => {
    const date = new Date();
    date.setDate(date.getDate() + 1);
    const dateStr = `${String(date.getDate()).padStart(2, '0')}_${String(date.getMonth() + 1).padStart(2, '0')}_${date.getFullYear()}`;
    const { data } = await axios.post(`${BACKEND_URL}/api/user/get-doctor-slots`, { docId: doctorId, date: dateStr }, { headers: { token: userToken } });
    if (!data.success) throw new Error('Slots fetch failed');
  })) passCount++;

  // BOOK APPOINTMENT
  totalTests++;
  if (await test('10. Book Appointment', async () => {
    const date = new Date();
    date.setDate(date.getDate() + 2); // Use different date
    const dateStr = `${String(date.getDate()).padStart(2, '0')}_${String(date.getMonth() + 1).padStart(2, '0')}_${date.getFullYear()}`;
    const { data } = await axios.post(`${BACKEND_URL}/api/user/book-appointment`, 
      { docId: doctorId, slotDate: dateStr, slotTime: '10:00' },
      { headers: { token: userToken } }
    );
    if (!data.success) throw new Error('Booking failed');
    appointmentId = data.appointment?._id;
    if (!appointmentId) throw new Error('No appointment ID');
  })) passCount++;

  // MAKE PAYMENT
  totalTests++;
  if (await test('11. Make Payment', async () => {
    const { data } = await axios.post(`${BACKEND_URL}/api/user/make-payment`, { appointmentId }, { headers: { token: userToken } });
    if (!data.success) throw new Error('Payment failed');
  })) passCount++;

  // USER DOCTOR LOGIN
  console.log('\n⚕️  DOCTOR OPERATIONS\n');
  totalTests++;
  if (await test('12. Doctor Login', async () => {
    const { data } = await axios.post(`${BACKEND_URL}/api/doctor/login`, {
      email: testDoctor.email,
      password: testDoctor.password
    });
    if (!data.success) throw new Error('Doctor login failed');
    doctorToken = data.token;
  })) passCount++;

  // DOCTOR APPOINTMENTS
  totalTests++;
  if (await test('13. Doctor: Get Appointments', async () => {
    const { data } = await axios.get(`${BACKEND_URL}/api/doctor/appointments`, { headers: { dToken: doctorToken } });
    if (!data.success) throw new Error('Appointments fetch failed');
  })) passCount++;

  // APPROVE APPOINTMENT
  totalTests++;
  if (appointmentId && await test('14. Doctor: Approve Appointment', async () => {
    const { data } = await axios.post(`${BACKEND_URL}/api/doctor/approve-appointment`, { appointmentId }, { headers: { dToken: doctorToken } });
    if (!data.success) throw new Error('Approval failed');
  })) passCount++;

  // COMPLETE APPOINTMENT
  totalTests++;
  if (appointmentId && await test('15. Doctor: Complete Appointment', async () => {
    const { data } = await axios.post(`${BACKEND_URL}/api/doctor/complete-appointment`, { appointmentId }, { headers: { dToken: doctorToken } });
    if (!data.success) throw new Error('Completion failed');
  })) passCount++;

  // DOCTOR EARNINGS
  totalTests++;
  if (await test('16. Doctor: Get Earnings', async () => {
    const { data } = await axios.get(`${BACKEND_URL}/api/doctor/earnings`, { headers: { dToken: doctorToken } });
    if (!data.success) throw new Error('Earnings fetch failed');
  })) passCount++;

  // USER REVIEWS
  console.log('\n⭐ REVIEW OPERATIONS\n');
  totalTests++;
  if (appointmentId && await test('17. Add Review', async () => {
    const { data } = await axios.post(`${BACKEND_URL}/api/user/add-review`, 
      { appointmentId, rating: 5, reviewText: 'Excellent doctor!' },
      { headers: { token: userToken } }
    );
    if (!data.success) throw new Error('Review failed');
  })) passCount++;

  // GET DOCTOR REVIEWS
  totalTests++;
  if (await test('18. Get Doctor Reviews', async () => {
    const { data } = await axios.post(`${BACKEND_URL}/api/user/get-doctor-reviews`, { docId: doctorId }, { headers: { token: userToken } });
    if (!data.success) throw new Error('Reviews fetch failed');
  })) passCount++;

  // FINAL STATS
  console.log('\n📊 FINAL VERIFICATION\n');
  totalTests++;
  if (await test('19. Final Platform Stats', async () => {
    const { data } = await axios.get(`${BACKEND_URL}/api/admin/stats`, { headers: { aToken: adminToken } });
    if (!data.success) throw new Error('Stats fetch failed');
  })) passCount++;

  // CANCEL APPOINTMENT (edge case)
  console.log('\n🔄 EDGE CASE TESTING\n');
  let appointmentId2 = null;
  totalTests++;
  if (await test('20. Book Another Appointment', async () => {
    const date = new Date();
    date.setDate(date.getDate() + 5);
    const dateStr = `${String(date.getDate()).padStart(2, '0')}_${String(date.getMonth() + 1).padStart(2, '0')}_${date.getFullYear()}`;
    const { data } = await axios.post(`${BACKEND_URL}/api/user/book-appointment`, 
      { docId: doctorId, slotDate: dateStr, slotTime: '14:00' },
      { headers: { token: userToken } }
    );
    if (!data.success) throw new Error('Booking failed');
    appointmentId2 = data.appointment?._id;
    if (!appointmentId2) throw new Error('No appointment ID');
  })) passCount++;

  totalTests++;
  if (appointmentId2 && await test('21. Cancel Appointment', async () => {
    const { data } = await axios.post(`${BACKEND_URL}/api/user/cancel-appointment`, 
      { appointmentId: appointmentId2 },
      { headers: { token: userToken } }
    );
    if (!data.success) throw new Error('Cancellation failed');
  })) passCount++;

  // SUMMARY
  console.log('\n════════════════════════════════════════════════════\n');
  console.log(`📊 FINAL RESULTS: ${passCount}/${totalTests} TESTS PASSED\n`);
  
  const percentage = ((passCount / totalTests) * 100).toFixed(1);
  console.log(`✅ Success Rate: ${percentage}%\n`);

  if (passCount === totalTests) {
    console.log('🎉 ALL WORKFLOWS VERIFIED SUCCESSFULLY! 🎉\n');
    console.log('✓ User signup → login → dashboard\n✓ Doctor booking and payment\n✓ Doctor approval and completion\n✓ Review and rating system\n✓ Admin statistics\n');
  }

  console.log('════════════════════════════════════════════════════\n');
}

main().catch(console.error);
