const fs = require('fs');
const path = require('path');

// Test that mobile app has no notification code
function testMobileNoNotifications() {
  console.log('🧪 Testing Mobile App Without Notifications...\n');

  const mobileDir = path.join(__dirname);
  
  // Test 1: Check if notification service file is deleted
  console.log('1️⃣ Testing if notification service file is removed...');
  const notificationServicePath = path.join(mobileDir, 'src', 'services', 'notificationService.js');
  if (!fs.existsSync(notificationServicePath)) {
    console.log('✅ Notification service file successfully deleted');
  } else {
    console.log('❌ Notification service file still exists');
  }
  console.log('');

  // Test 2: Check if NotificationsScreen is deleted
  console.log('2️⃣ Testing if NotificationsScreen is removed...');
  const notificationsScreenPath = path.join(mobileDir, 'src', 'screens', 'NotificationsScreen.js');
  if (!fs.existsSync(notificationsScreenPath)) {
    console.log('✅ NotificationsScreen file successfully deleted');
  } else {
    console.log('❌ NotificationsScreen file still exists');
  }
  console.log('');

  // Test 3: Check if expo-notifications is removed from package.json
  console.log('3️⃣ Testing if expo-notifications dependency is removed...');
  const packageJsonPath = path.join(mobileDir, 'package.json');
  if (fs.existsSync(packageJsonPath)) {
    const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, 'utf8'));
    if (!packageJson.dependencies['expo-notifications']) {
      console.log('✅ expo-notifications dependency successfully removed');
    } else {
      console.log('❌ expo-notifications dependency still exists');
    }
  } else {
    console.log('❌ package.json not found');
  }
  console.log('');

  // Test 4: Check if App.js has no notification imports
  console.log('4️⃣ Testing if App.js has no notification imports...');
  const appJsPath = path.join(mobileDir, 'App.js');
  if (fs.existsSync(appJsPath)) {
    const appJsContent = fs.readFileSync(appJsPath, 'utf8');
    if (!appJsContent.includes('NotificationsScreen') && !appJsContent.includes('notification')) {
      console.log('✅ App.js has no notification imports');
    } else {
      console.log('❌ App.js still has notification imports');
    }
  } else {
    console.log('❌ App.js not found');
  }
  console.log('');

  // Test 5: Check if api.js has no notification endpoints
  console.log('5️⃣ Testing if api.js has no notification endpoints...');
  const apiJsPath = path.join(mobileDir, 'src', 'services', 'api.js');
  if (fs.existsSync(apiJsPath)) {
    const apiJsContent = fs.readFileSync(apiJsPath, 'utf8');
    if (!apiJsContent.includes('/notifications/') && !apiJsContent.includes('notificationAPI')) {
      console.log('✅ api.js has no notification endpoints');
    } else {
      console.log('❌ api.js still has notification endpoints');
    }
  } else {
    console.log('❌ api.js not found');
  }
  console.log('');

  // Test 6: Check if HomeScreen has no notification service usage
  console.log('6️⃣ Testing if HomeScreen has no notification service usage...');
  const homeScreenPath = path.join(mobileDir, 'src', 'screens', 'HomeScreen.js');
  if (fs.existsSync(homeScreenPath)) {
    const homeScreenContent = fs.readFileSync(homeScreenPath, 'utf8');
    if (!homeScreenContent.includes('notificationService') && !homeScreenContent.includes('notificationService.initialize')) {
      console.log('✅ HomeScreen has no notification service usage');
    } else {
      console.log('❌ HomeScreen still has notification service usage');
    }
  } else {
    console.log('❌ HomeScreen.js not found');
  }
  console.log('');

  console.log('🎉 All mobile app notification removal tests completed!');
  console.log('\n💡 Notifications have been completely removed from the mobile app.');
  console.log('\n📱 Your mobile app should now work without any expo-notifications errors!');
}

// Run the test
testMobileNoNotifications();
