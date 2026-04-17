const axios = require('axios');
const FormData = require('form-data');

const BACKEND_URL = 'http://localhost:8000';

// Admin credentials
const adminCredentials = {
  email: 'admin@example.com',
  password: 'admin123456'
};

// Doctors data to seed
const doctorsToAdd = [
  {
    name: 'Dr. Vishnu Singh Rajput',
    email: 'dr.vishnu@hospital.com',
    password: 'DrVishnu@123',
    speciality: 'Cardiologist',
    degree: 'MBBS, MD',
    experience: 12,
    about: 'Specialist in cardiac diseases with 12 years of experience in interventional cardiology',
    fees: 200,
    address: JSON.stringify({ city: 'Mumbai', state: 'Maharashtra', zip: '400001' })
  },
  {
    name: 'Dr. Mansi Rathore',
    email: 'dr.mansi@hospital.com',
    password: 'DrMansi@123',
    speciality: 'Gynecologist',
    degree: 'MBBS, DGO',
    experience: 10,
    about: 'Women health specialist with comprehensive experience in reproductive health',
    fees: 180,
    address: JSON.stringify({ city: 'Delhi', state: 'Delhi', zip: '110001' })
  },
  {
    name: 'Dr. Arjun Kapoor',
    email: 'dr.arjun@hospital.com',
    password: 'DrArjun@123',
    speciality: 'Dermatologist',
    degree: 'MBBS, MD',
    experience: 8,
    about: 'Expert in skin and dermatological treatments with focus on laser therapy',
    fees: 150,
    address: JSON.stringify({ city: 'Bangalore', state: 'Karnataka', zip: '560001' })
  },
  {
    name: 'Dr. Sarah Johnson',
    email: 'dr.sarah@hospital.com',
    password: 'DrSarah@123',
    speciality: 'Pediatrician',
    degree: 'MBBS, MD',
    experience: 9,
    about: 'Child health specialist with caring approach and expertise in immunization',
    fees: 120,
    address: JSON.stringify({ city: 'Chennai', state: 'Tamil Nadu', zip: '600001' })
  },
  {
    name: 'Dr. Mohammad Hassan',
    email: 'dr.hassan@hospital.com',
    password: 'DrHassan@123',
    speciality: 'Neurologist',
    degree: 'MBBS, DM',
    experience: 14,
    about: 'Expert in neurological disorders and spine surgery with advanced diagnostic skills',
    fees: 220,
    address: JSON.stringify({ city: 'Hyderabad', state: 'Telangana', zip: '500001' })
  },
  {
    name: 'Dr. Priya Singh',
    email: 'dr.priya@hospital.com',
    password: 'DrPriya@123',
    speciality: 'General Physician',
    degree: 'MBBS, MRCP',
    experience: 11,
    about: 'General medicine with focus on preventive care and chronic disease management',
    fees: 100,
    address: JSON.stringify({ city: 'Kolkata', state: 'West Bengal', zip: '700001' })
  },
  {
    name: 'Dr. Vikram Patel',
    email: 'dr.vikram@hospital.com',
    password: 'DrVikram@123',
    speciality: 'Gastroenterologist',
    degree: 'MBBS, DM',
    experience: 13,
    about: 'Specialist in gastrointestinal health and endoscopic procedures',
    fees: 210,
    address: JSON.stringify({ city: 'Pune', state: 'Maharashtra', zip: '411001' })
  },
  {
    name: 'Dr. Lisa Anderson',
    email: 'dr.lisa@hospital.com',
    password: 'DrLisa@123',
    speciality: 'Orthopedic',
    degree: 'MBBS, MS',
    experience: 10,
    about: 'Specialist in bone and joint disorders with arthroscopic surgery expertise',
    fees: 190,
    address: JSON.stringify({ city: 'Jaipur', state: 'Rajasthan', zip: '302001' })
  },
  {
    name: 'Dr. Arun Verma',
    email: 'dr.arun@hospital.com',
    password: 'DrArun@123',
    speciality: 'Pulmonologist',
    degree: 'MBBS, MD',
    experience: 9,
    about: 'Expert in respiratory diseases and sleep disorders management',
    fees: 170,
    address: JSON.stringify({ city: 'Lucknow', state: 'Uttar Pradesh', zip: '226001' })
  },
  {
    name: 'Dr. Rachel Green',
    email: 'dr.rachel@hospital.com',
    password: 'DrRachel@123',
    speciality: 'Psychiatrist',
    degree: 'MBBS, MD',
    experience: 11,
    about: 'Mental health specialist with compassionate approach and psychotherapy expertise',
    fees: 160,
    address: JSON.stringify({ city: 'Chandigarh', state: 'Chandigarh', zip: '160001' })
  },
  {
    name: 'Dr. Rohan Kumar',
    email: 'dr.rohan@hospital.com',
    password: 'DrRohan@123',
    speciality: 'Urologist',
    degree: 'MBBS, MCh',
    experience: 12,
    about: 'Specialist in urinary tract disorders and minimally invasive surgical procedures',
    fees: 185,
    address: JSON.stringify({ city: 'Ahmedabad', state: 'Gujarat', zip: '380001' })
  },
  {
    name: 'Dr. Neha Gupta',
    email: 'dr.neha@hospital.com',
    password: 'DrNeha@123',
    speciality: 'ENT',
    degree: 'MBBS, MS',
    experience: 8,
    about: 'Expert in ear, nose and throat disorders with endoscopic expertise',
    fees: 130,
    address: JSON.stringify({ city: 'Surat', state: 'Gujarat', zip: '395001' })
  }
];

async function addDoctors() {
  console.log('\n╔══════════════════════════════════════════════════════╗');
  console.log('║        ADDING DOCTORS TO THE SYSTEM                 ║');
  console.log('╚══════════════════════════════════════════════════════╝\n');

  try {
    // Admin login
    console.log('🔐 Admin Login...');
    const adminLogin = await axios.post(`${BACKEND_URL}/api/admin/login`, adminCredentials);
    if (!adminLogin.data.success) throw new Error('Admin login failed');
    const adminToken = adminLogin.data.token;
    console.log('✅ Admin logged in\n');

    let addedCount = 0;
    let skippedCount = 0;

    for (const doctor of doctorsToAdd) {
      try {
        console.log(`Adding: ${doctor.name} (${doctor.speciality})...`);

        const formData = new FormData();
        formData.append('name', doctor.name);
        formData.append('email', doctor.email);
        formData.append('password', doctor.password);
        formData.append('speciality', doctor.speciality);
        formData.append('degree', doctor.degree);
        formData.append('experience', doctor.experience);
        formData.append('about', doctor.about);
        formData.append('fees', doctor.fees);
        formData.append('address', doctor.address);

        // Add placeholder image
        const pngBuffer = Buffer.from([
          0x89, 0x50, 0x4E, 0x47, 0x0D, 0x0A, 0x1A, 0x0A, 0x00, 0x00, 0x00, 0x0D,
          0x49, 0x48, 0x44, 0x52, 0x00, 0x00, 0x00, 0x01, 0x00, 0x00, 0x00, 0x01,
          0x08, 0x06, 0x00, 0x00, 0x00, 0x1F, 0x15, 0xC4, 0x89
        ]);
        formData.append('image', pngBuffer, 'doctor.png');

        const response = await axios.post(`${BACKEND_URL}/api/admin/add-doctor`, formData, {
          headers: {
            ...formData.getHeaders(),
            aToken: adminToken
          }
        });

        if (response.data.success) {
          console.log(`   ✅ Added successfully\n`);
          addedCount++;
        } else {
          console.log(`   ⚠️  ${response.data.message}\n`);
          skippedCount++;
        }
      } catch (error) {
        const errorMsg = error.response?.data?.message || error.message;
        if (errorMsg.includes('email already exists')) {
          console.log(`   ⚠️  Already exists - Skipped\n`);
          skippedCount++;
        } else {
          console.log(`   ❌ Error: ${errorMsg}\n`);
        }
      }
    }

    console.log('╔══════════════════════════════════════════════════════╗');
    console.log(`║  Added: ${addedCount}  |  Skipped: ${skippedCount}  |  Total: ${doctorsToAdd.length}  ║`);
    console.log('╚══════════════════════════════════════════════════════╝\n');

    // Verify by getting doctors list
    console.log('📋 Fetching updated doctors list...\n');
    const doctorsList = await axios.get(`${BACKEND_URL}/api/doctor/list`);
    if (doctorsList.data.success) {
      console.log(`✅ Total doctors in system: ${doctorsList.data.doctors.length}\n`);
      console.log('Doctor list:');
      doctorsList.data.doctors.forEach((doc, index) => {
        console.log(`  ${index + 1}. ${doc.name} - ${doc.speciality} (Fee: $${doc.fees})`);
      });
    }

    console.log('\n✨ Doctors seeding completed!\n');
  } catch (error) {
    console.error('❌ Error:', error.response?.data?.message || error.message);
  }
}

addDoctors();
