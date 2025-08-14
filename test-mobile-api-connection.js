const axios = require('axios');

// Test the mobile app's API configuration
async function testMobileApiConnection() {
  try {
    console.log('🧪 Testing Mobile App API Connection...\n');

    // Test 1: Check if backend is accessible
    console.log('1️⃣ Testing backend connectivity...');
    const healthCheck = await axios.get('http://localhost:5000/api/admin/stats');
    console.log('✅ Backend is accessible');
    console.log('   Response status:', healthCheck.status);

    // Test 2: Test teacher login endpoint
    console.log('\n2️⃣ Testing teacher login endpoint...');
    try {
      await axios.post('http://localhost:5000/api/teacher/login', {
        email: 'test@teacher.com',
        password: 'testpass'
      });
      console.log('❌ This should have failed with invalid credentials');
    } catch (error) {
      if (error.response && error.response.status === 400) {
        console.log('✅ Teacher login endpoint working (correctly rejected invalid credentials)');
        console.log('   Response:', error.response.data.message);
      } else {
        throw error;
      }
    }

    // Test 3: Test student login endpoint
    console.log('\n3️⃣ Testing student login endpoint...');
    try {
      await axios.post('http://localhost:5000/api/student/login', {
        email: 'test@student.com',
        password: 'testpass'
      });
      console.log('❌ This should have failed with invalid credentials');
    } catch (error) {
      if (error.response && error.response.status === 400) {
        console.log('✅ Student login endpoint working (correctly rejected invalid credentials)');
        console.log('   Response:', error.response.data.message);
      } else {
        throw error;
      }
    }

    // Test 4: Test admin login endpoint
    console.log('\n4️⃣ Testing admin login endpoint...');
    const adminLoginResponse = await axios.post('http://localhost:5000/api/admin/login', {
      email: 'admin@gmail.com',
      password: '123457'
    });
    console.log('✅ Admin login endpoint working');
    console.log('   Response:', adminLoginResponse.data.message);
    console.log('   Token received:', adminLoginResponse.data.token ? 'Yes' : 'No');

    // Test 5: Test app config endpoint
    console.log('\n5️⃣ Testing app config endpoint...');
    const configResponse = await axios.get('http://localhost:5000/api/admin/app-config');
    console.log('✅ App config endpoint working');
    console.log('   Response status:', configResponse.status);

    console.log('\n🎉 All mobile app API connection tests passed!');
    console.log('\n💡 Your mobile app should now be able to connect to the backend.');
    console.log('\n📱 Next steps:');
    console.log('   1. Restart your mobile app');
    console.log('   2. Try logging in with valid credentials');
    console.log('   3. The app should now connect to localhost:5000');

  } catch (error) {
    console.error('\n❌ Mobile app API connection test failed:');
    if (error.response) {
      console.error('Error:', error.response.data.message);
      console.error('Status:', error.response.status);
    } else if (error.code === 'ECONNREFUSED') {
      console.error('❌ Connection refused - Backend server is not running');
      console.log('\n💡 Make sure to:');
      console.log('   1. Start your backend server: npm start (in alpha folder)');
      console.log('   2. Ensure it\'s running on localhost:5000');
    } else {
      console.error('Error:', error.message);
    }
  }
}

// Run the test
testMobileApiConnection();
