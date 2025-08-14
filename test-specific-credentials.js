const axios = require('axios');

// Test the specific credentials you mentioned
async function testSpecificCredentials() {
  try {
    console.log('🧪 Testing Your Specific Credentials...\n');

    const API_BASE_URL = 'https://superior.up.railway.app/api';

    // Test 1: Test the credentials you mentioned
    console.log('1️⃣ Testing your test account: a@gmail.com / 12345678');
    try {
      const loginResponse = await axios.post(`${API_BASE_URL}/admin/login`, {
        email: 'a@gmail.com',
        password: '12345678'
      });
      console.log('✅ Login successful!');
      console.log('   Response:', loginResponse.data.message);
      console.log('   Token received:', loginResponse.data.token ? 'Yes' : 'No');
    } catch (error) {
      console.log('❌ Login failed');
      console.log('   Error:', error.response?.data?.message || error.message);
      console.log('   Status:', error.response?.status);
    }
    console.log('');

    // Test 2: Test default admin
    console.log('2️⃣ Testing default admin: admin@gmail.com / 123457');
    try {
      const defaultResponse = await axios.post(`${API_BASE_URL}/admin/login`, {
        email: 'admin@gmail.com',
        password: '123457'
      });
      console.log('✅ Default admin login successful!');
      console.log('   Response:', defaultResponse.data.message);
    } catch (error) {
      console.log('❌ Default admin login failed');
      console.log('   Error:', error.response?.data?.message || error.message);
    }
    console.log('');

    // Test 3: Test the production admin we created earlier
    console.log('3️⃣ Testing production admin: prodadmin1755185135889@school.com / prodpass123');
    try {
      const prodResponse = await axios.post(`${API_BASE_URL}/admin/login`, {
        email: 'prodadmin1755185135889@school.com',
        password: 'prodpass123'
      });
      console.log('✅ Production admin login successful!');
      console.log('   Response:', prodResponse.data.message);
    } catch (error) {
      console.log('❌ Production admin login failed');
      console.log('   Error:', error.response?.data?.message || error.message);
    }
    console.log('');

    // Test 4: Check what admin accounts exist
    console.log('4️⃣ Checking admin accounts in production...');
    try {
      const statsResponse = await axios.get(`${API_BASE_URL}/admin/stats`);
      console.log('✅ Admin stats retrieved');
      console.log('   Response:', statsResponse.data);
    } catch (error) {
      console.log('❌ Could not get admin stats');
      console.log('   Error:', error.response?.data?.message || error.message);
    }

  } catch (error) {
    console.error('\n❌ Test failed:');
    console.error('Error:', error.message);
  }
}

// Run the test
testSpecificCredentials();
