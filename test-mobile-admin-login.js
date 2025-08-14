const axios = require('axios');

// Test mobile app admin login functionality
async function testMobileAdminLogin() {
  try {
    console.log('🧪 Testing Mobile App Admin Login...\n');

    const API_BASE_URL = 'http://192.168.3.51:5000/api';

    // Step 1: Create a new admin account
    console.log('1️⃣ Creating new admin account for mobile app test...');
    const timestamp = Date.now();
    const adminData = {
      fullname: `Mobile Test Admin ${timestamp}`,
      username: `mobileadmin${timestamp}`,
      email: `mobileadmin${timestamp}@school.com`,
      password: "mobilepass123",
      role: "admin"
    };

    const signupResponse = await axios.post(`${API_BASE_URL}/admin/signup`, adminData);
    console.log('✅ Admin created successfully');
    console.log('   Email:', adminData.email);
    console.log('   Password:', adminData.password);
    console.log('');

    // Step 2: Test admin login with the new account
    console.log('2️⃣ Testing admin login with newly created account...');
    const loginResponse = await axios.post(`${API_BASE_URL}/admin/login`, {
      email: adminData.email,
      password: adminData.password
    });
    console.log('✅ Admin login successful');
    console.log('   Response:', loginResponse.data.message);
    console.log('   Token received:', loginResponse.data.token ? 'Yes' : 'No');
    console.log('   Admin data:', {
      id: loginResponse.data.admin.id,
      email: loginResponse.data.admin.email,
      fullname: loginResponse.data.admin.fullname
    });
    console.log('');

    // Step 3: Test default admin login
    console.log('3️⃣ Testing default admin login...');
    const defaultLoginResponse = await axios.post(`${API_BASE_URL}/admin/login`, {
      email: 'admin@gmail.com',
      password: '123457'
    });
    console.log('✅ Default admin login successful');
    console.log('   Response:', defaultLoginResponse.data.message);
    console.log('');

    console.log('🎉 Mobile app admin login test passed!');
    console.log('\n💡 The mobile app should now be able to login with:');
    console.log('   1. Newly created admin accounts');
    console.log('   2. Default admin account (admin@gmail.com)');
    console.log('\n📱 Test credentials for mobile app:');
    console.log('   Email:', adminData.email);
    console.log('   Password:', adminData.password);

  } catch (error) {
    console.error('\n❌ Mobile app admin login test failed:');
    if (error.response) {
      console.error('Error:', error.response.data.message);
      console.error('Status:', error.response.status);
    } else {
      console.error('Error:', error.message);
    }
  }
}

// Run the test
testMobileAdminLogin();
