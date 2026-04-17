const axios = require('axios');

const BACKEND_URL = 'http://localhost:8000';

async function test() {
  console.log('Testing Backend Connection...\n');
  
  try {
    console.log('1. Testing root endpoint:');
    const root = await axios.get(`${BACKEND_URL}/`);
    console.log('✅ Status:', root.status);
    console.log('Response:', root.data, '\n');
  } catch (e) {
    console.log('❌ Error:', e.message, '\n');
  }

  try {
    console.log('2. Testing /api/doctor/list:');
    const docs = await axios.get(`${BACKEND_URL}/api/doctor/list`);
    console.log('✅ Status:', docs.status);
    console.log('Found', docs.data.doctors?.length, 'doctors\n');
  } catch (e) {
    console.log('❌ Error:', e.response?.status, '-', e.response?.data?.message || e.message, '\n');
  }

  try {
    console.log('3. Testing User Signup:');
    const signup = await axios.post(`${BACKEND_URL}/api/user/register`, {
      name: 'Test User',
      email: `test${Date.now()}@test.com`,
      password: 'Test@12345'
    });
    console.log('✅ Status:', signup.status);
    console.log('Token:', signup.data.token?.substring(0, 20) + '...', '\n');
  } catch (e) {
    console.log('❌ Error:', e.response?.status, '-', e.response?.data?.message || e.message, '\n');
  }

  try {
    console.log('4. Testing Admin Login:');
    const admin = await axios.post(`${BACKEND_URL}/api/admin/login`, {
      email: 'admin@example.com',
      password: 'admin123456'
    });
    console.log('✅ Status:', admin.status);
    console.log('Token:', admin.data.token?.substring(0, 20) + '...\n');
  } catch (e) {
    console.log('❌ Error:', e.response?.status, '-', e.response?.data?.message || e.message, '\n');
  }
}

test();
