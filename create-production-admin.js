const axios = require('axios');

// Create a new admin account in production
async function createProductionAdmin() {
  console.log('🚀 Creating New Admin Account in Production...\n');

  const API_BASE_URL = 'https://superior.up.railway.app/api';

  // Generate unique admin data
  const timestamp = Date.now();
  const adminData = {
    fullname: `Production Admin ${timestamp}`,
    username: `prodadmin${timestamp}`,
    email: `prodadmin${timestamp}@gmail.com`,
    password: '12345678',
    phone: '+1234567890',
    address: 'Production Address'
  };

  console.log('📝 Creating admin with data:');
  console.log(`   Email: ${adminData.email}`);
  console.log(`   Username: ${adminData.username}`);
  console.log(`   Password: ${adminData.password}`);
  console.log(`   Name: ${adminData.fullname}`);
  console.log('');

  try {
    // Create the admin account
    console.log('🔄 Creating admin account...');
    const signupResponse = await axios.post(`${API_BASE_URL}/admin/signup`, adminData);
    
    console.log('✅ Admin account created successfully!');
    console.log(`   Admin ID: ${signupResponse.data.admin._id}`);
    console.log(`   Email: ${signupResponse.data.admin.email}`);
    console.log('');

    // Test login with the new admin
    console.log('🧪 Testing login with new admin...');
    const loginResponse = await axios.post(`${API_BASE_URL}/admin/login`, {
      email: adminData.email,
      password: adminData.password
    });

    console.log('✅ Login test successful!');
    console.log(`   Token: ${loginResponse.data.token ? 'Present' : 'Missing'}`);
    console.log(`   User: ${loginResponse.data.admin.fullname}`);
    console.log('');

    console.log('🎉 SUCCESS! New admin account created and tested.');
    console.log('\n📋 Your new admin credentials:');
    console.log(`   Email: ${adminData.email}`);
    console.log(`   Password: ${adminData.password}`);
    console.log('\n💡 Use these credentials in your mobile app!');

  } catch (error) {
    console.log('❌ Error creating admin account:');
    console.log(`   Message: ${error.response?.data?.message || error.message}`);
    console.log(`   Status: ${error.response?.status}`);
    
    if (error.response?.data?.message?.includes('already exists')) {
      console.log('\n💡 Account already exists. Trying to login instead...');
      
      try {
        const loginResponse = await axios.post(`${API_BASE_URL}/admin/login`, {
          email: adminData.email,
          password: adminData.password
        });
        
        console.log('✅ Login successful with existing account!');
        console.log(`   Email: ${adminData.email}`);
        console.log(`   Password: ${adminData.password}`);
      } catch (loginError) {
        console.log('❌ Login failed with existing account');
        console.log(`   Error: ${loginError.response?.data?.message || loginError.message}`);
      }
    }
  }
}

// Run the function
createProductionAdmin();
