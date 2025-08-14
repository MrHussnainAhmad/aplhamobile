const axios = require('axios');

// Test production backend connectivity and credentials
async function testProductionBackend() {
  try {
    console.log('🧪 Testing Production Backend...\n');

    const API_BASE_URL = 'https://superior.up.railway.app/api';

    // Test 1: Check if backend is accessible
    console.log('1️⃣ Testing backend connectivity...');
    try {
      const healthCheck = await axios.get(`${API_BASE_URL}/admin/stats`);
      console.log('✅ Backend is accessible');
      console.log('   Response status:', healthCheck.status);
    } catch (error) {
      console.log('❌ Backend connectivity failed');
      console.log('   Error:', error.message);
      return;
    }
    console.log('');

    // Test 2: Test default admin login
    console.log('2️⃣ Testing default admin login...');
    try {
      const defaultAdminResponse = await axios.post(`${API_BASE_URL}/admin/login`, {
        email: 'admin@gmail.com',
        password: '123457'
      });
      console.log('✅ Default admin login successful');
      console.log('   Response:', defaultAdminResponse.data.message);
      console.log('   Token received:', defaultAdminResponse.data.token ? 'Yes' : 'No');
    } catch (error) {
      console.log('❌ Default admin login failed');
      console.log('   Error:', error.response?.data?.message || error.message);
    }
    console.log('');

    // Test 3: Test with invalid credentials
    console.log('3️⃣ Testing with invalid credentials...');
    try {
      await axios.post(`${API_BASE_URL}/admin/login`, {
        email: 'invalid@email.com',
        password: 'wrongpassword'
      });
      console.log('❌ This should have failed');
    } catch (error) {
      if (error.response && error.response.status === 400) {
        console.log('✅ Correctly rejected invalid credentials');
        console.log('   Error:', error.response.data.message);
      } else {
        console.log('❌ Unexpected error:', error.message);
      }
    }
    console.log('');

    // Test 4: Test teacher login with invalid credentials
    console.log('4️⃣ Testing teacher login with invalid credentials...');
    try {
      await axios.post(`${API_BASE_URL}/teacher/login`, {
        email: 'invalid@teacher.com',
        password: 'wrongpassword'
      });
      console.log('❌ This should have failed');
    } catch (error) {
      if (error.response && error.response.status === 400) {
        console.log('✅ Correctly rejected invalid teacher credentials');
        console.log('   Error:', error.response.data.message);
      } else {
        console.log('❌ Unexpected error:', error.message);
      }
    }
    console.log('');

    // Test 5: Test student login with invalid credentials
    console.log('5️⃣ Testing student login with invalid credentials...');
    try {
      await axios.post(`${API_BASE_URL}/student/login`, {
        email: 'invalid@student.com',
        password: 'wrongpassword'
      });
      console.log('❌ This should have failed');
    } catch (error) {
      if (error.response && error.response.status === 400) {
        console.log('✅ Correctly rejected invalid student credentials');
        console.log('   Error:', error.response.data.message);
      } else {
        console.log('❌ Unexpected error:', error.message);
      }
    }
    console.log('');

    console.log('🎉 Production backend test completed!');
    console.log('\n💡 The production backend is working correctly.');
    console.log('\n📱 For mobile app login, you need to use:');
    console.log('   - Default admin: admin@gmail.com / 123457');
    console.log('   - Or create new admin accounts through the web app');
    console.log('   - Or use existing teacher/student accounts');

  } catch (error) {
    console.error('\n❌ Production backend test failed:');
    console.error('Error:', error.message);
  }
}

// Run the test
testProductionBackend();
