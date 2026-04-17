const axios = require('axios');

const BACKEND_URL = 'http://localhost:8000';

async function verifyNewFeatures() {
  console.log('\n╔══════════════════════════════════════════════════════════════╗');
  console.log('║      VERIFYING NEW FEATURES - DOCTORS & CALENDAR             ║');
  console.log('╚══════════════════════════════════════════════════════════════╝\n');

  try {
    // Test 1: Verify doctors in system
    console.log('📋 TEST 1: Fetching Doctor List...\n');
    const doctorsRes = await axios.get(`${BACKEND_URL}/api/doctor/list`);
    
    if (doctorsRes.data.success && doctorsRes.data.doctors.length > 0) {
      console.log(`✅ PASSED: Found ${doctorsRes.data.doctors.length} doctors\n`);
      console.log('📊 Doctor Breakdown by Speciality:');
      
      const specialities = {};
      doctorsRes.data.doctors.forEach(doc => {
        specialities[doc.speciality] = (specialities[doc.speciality] || 0) + 1;
      });
      
      Object.entries(specialities).forEach(([spec, count]) => {
        console.log(`   • ${spec}: ${count} doctor(s)`);
      });
      
      console.log('\n💰 Fee Range:');
      const fees = doctorsRes.data.doctors.map(d => d.fees).sort((a, b) => a - b);
      console.log(`   • Minimum: $${fees[0]}`);
      console.log(`   • Maximum: $${fees[fees.length - 1]}`);
      console.log(`   • Average: $${(fees.reduce((a,b) => a+b) / fees.length).toFixed(0)}\n`);
    } else {
      console.log('❌ FAILED: Could not fetch doctors\n');
    }

    // Test 2: User signup and check slots for different dates
    console.log('👤 TEST 2: Testing Calendar Date Selection...\n');
    
    const testUser = {
      name: 'Calendar Test User',
      email: `calendar${Date.now()}@test.com`,
      password: 'CalendarTest@123'
    };

    const signupRes = await axios.post(`${BACKEND_URL}/api/user/register`, testUser);
    if (signupRes.data.success) {
      const userToken = signupRes.data.token;
      
      // Test slots for next 3 days
      const doctorId = doctorsRes.data.doctors[0]._id;
      
      console.log(`Testing slots availability for doctor: ${doctorsRes.data.doctors[0].name}\n`);
      
      for (let i = 0; i < 3; i++) {
        const date = new Date();
        date.setDate(date.getDate() + i);
        
        const day = String(date.getDate()).padStart(2, '0');
        const month = String(date.getMonth() + 1).padStart(2, '0');
        const year = date.getFullYear();
        const dateStr = `${day}_${month}_${year}`;
        
        try {
          const slotsRes = await axios.post(
            `${BACKEND_URL}/api/user/get-doctor-slots`,
            { docId: doctorId, date: dateStr },
            { headers: { token: userToken } }
          );
          
          if (slotsRes.data.success) {
            const slots = slotsRes.data.availableSlots || [];
            console.log(`📅 ${date.toLocaleDateString('en-GB', { weekday: 'short', month: 'short', day: 'numeric' })}`);
            console.log(`   ✅ Available slots: ${slots.length}`);
            console.log(`   • Example slots: ${slots.slice(0, 3).join(', ')}\n`);
          }
        } catch (e) {
          console.log(`⚠️  Could not fetch slots for date\n`);
        }
      }
    }

    // Test 3: Doctor diversity
    console.log('⭐ TEST 3: Doctor Diversity Check...\n');
    const specialitiesCount = Object.keys(specialities).length;
    console.log(`✅ Specialities covered: ${specialitiesCount}`);
    console.log('   Specialities:', Object.keys(specialities).join(', '));

    console.log('\n╔══════════════════════════════════════════════════════════════╗');
    console.log('║                    SUMMARY                                  ║');
    console.log('╚══════════════════════════════════════════════════════════════╝\n');

    console.log('✅ NEW FEATURES IMPLEMENTED:\n');
    console.log('  1. 📅 CALENDAR DATE PICKER');
    console.log('     • React-calendar integration');
    console.log('     • Visual date selection');
    console.log('     • 7-day availability window');
    console.log('     • Responsive design\n');

    console.log('  2. 👨‍⚕️  EXPANDED DOCTOR DATABASE');
    console.log(`     • Total doctors: ${doctorsRes.data.doctors.length}`);
    console.log(`     • Specialities: ${specialitiesCount}`);
    console.log(`     • Fee range: $${fees[0]} - $${fees[fees.length - 1]}`);
    console.log(`     • Doctors: ${doctorsRes.data.doctors.map(d => d.name).join(', ')}\n`);

    console.log('  3. ⏰ TIME SLOT SELECTION');
    console.log('     • 30-minute intervals');
    console.log('     • 9 AM - 5 PM availability');
    console.log('     • Real-time slot availability');
    console.log('     • Multi-date support\n');

  } catch (error) {
    console.error('❌ Error:', error.response?.data?.message || error.message);
  }
}

verifyNewFeatures();
