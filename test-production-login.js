const axios = require('axios');

// Test production login with various accounts
async function testProductionLogin() {
  console.log('🧪 Testing Production Login...\n');

  const API_BASE_URL = 'https://superior.up.railway.app/api';

  // Test accounts to try
  const testAccounts = [
    // Default admin (should always work)
    { email: 'admin@gmail.com', password: '123457', type: 'admin' },
    
    // Your test account
    { email: 'a@gmail.com', password: '12345678', type: 'admin' },
    
    // Some common test accounts
    { email: 'test@gmail.com', password: '12345678', type: 'admin' },
    { email: 'admin@test.com', password: '12345678', type: 'admin' },
    { email: 'teacher@gmail.com', password: '12345678', type: 'teacher' },
    { email: 'student@gmail.com', password: '12345678', type: 'student' },
  ];

  for (const account of testAccounts) {
    console.log(`🔍 Testing ${account.type} login: ${account.email}`);
    
    try {
      let response;
      
      if (account.type === 'admin') {
        response = await axios.post(`${API_BASE_URL}/admin/login`, {
          email: account.email,
          password: account.password
        });
      } else if (account.type === 'teacher') {
        response = await axios.post(`${API_BASE_URL}/teacher/login`, {
          email: account.email,
          password: account.password
        });
      } else if (account.type === 'student') {
        response = await axios.post(`${API_BASE_URL}/student/login`, {
          email: account.email,
          password: account.password
        });
      }

      console.log(`✅ ${account.type} login SUCCESS for ${account.email}`);
      console.log(`   User: ${response.data.user?.fullname || response.data.admin?.fullname || 'Unknown'}`);
      console.log(`   Token: ${response.data.token ? 'Present' : 'Missing'}`);
      console.log('');

    } catch (error) {
      console.log(`❌ ${account.type} login FAILED for ${account.email}`);
      console.log(`   Error: ${error.response?.data?.message || error.message}`);
      console.log('');
    }
  }

  console.log('🎯 Testing complete!');
  console.log('\n💡 If all logins failed, you need to create accounts in production.');
  console.log('💡 The default admin (admin@gmail.com / 123457) should always work.');
}

// Run the test
testProductionLogin();
