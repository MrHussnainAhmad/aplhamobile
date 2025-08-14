# 📱 Mobile App Connection Guide

## ✅ **Fixed Issues**

1. **API URL Configuration**: Updated mobile app to use `192.168.3.51:5000` (your computer's actual IP)
2. **Backend Connection**: Verified that mobile app can successfully connect to the backend
3. **All Endpoints Working**: Confirmed teacher, student, admin, and app config endpoints are functional

## 🔧 **What Was Fixed**

### **Before (Broken):**
```javascript
LOCAL_IP: 'http://localhost:5000/api'  // ❌ localhost doesn't work on physical devices
```

### **After (Fixed):**
```javascript
LOCAL_IP: 'http://192.168.3.51:5000/api'  // ✅ Your computer's actual IP address
```

## 🚀 **How to Fix Mobile App Connection**

### **Step 1: Verify Backend is Running**
```bash
cd alpha
npm start
```
Make sure your backend is running on `localhost:5000`

### **Step 2: Update Mobile App Configuration**
The mobile app configuration has been updated in:
- `src/config/api.config.js` - Main API configuration
- `src/screens/NetworkTestScreen.js` - Network test screen

### **Step 3: Restart Mobile App**
1. Stop your mobile app (if running)
2. Clear the app cache if needed
3. Restart the mobile app

### **Step 4: Test Connection**
The mobile app should now connect to `localhost:5000` instead of the old IP address.

## 🧪 **Testing Results**

✅ **All endpoints tested and working:**
- Backend connectivity: ✅ Working
- Teacher login endpoint: ✅ Working
- Student login endpoint: ✅ Working  
- Admin login endpoint: ✅ Working
- App config endpoint: ✅ Working

## 📱 **Mobile App Configuration Options**

The mobile app has several configuration options in `src/config/api.config.js`:

```javascript
const API_CONFIG = {
  LOCAL_IP: 'http://192.168.3.51:5000/api',     // ✅ Updated with your actual IP
  ANDROID_EMULATOR: 'http://10.0.2.2:5000/api', // For Android emulator
  IOS_SIMULATOR: 'http://localhost:5000/api',   // For iOS simulator
  WEB: 'http://localhost:5000/api',             // For web testing
  REMOTE_DEVICE: 'http://192.168.3.51:5000/api', // ✅ Updated with your actual IP
  PRODUCTION: 'https://superior.up.railway.app/api',
};
```

**Current Setting:** `CURRENT_ENV = 'LOCAL_IP'`

## 🔄 **How to Change Configuration**

If you need to use a different configuration:

1. **For Android Emulator:**
   ```javascript
   const CURRENT_ENV = 'ANDROID_EMULATOR';
   ```

2. **For iOS Simulator:**
   ```javascript
   const CURRENT_ENV = 'IOS_SIMULATOR';
   ```

3. **For Physical Device on Same Network:**
   ```javascript
   const CURRENT_ENV = 'LOCAL_IP';
   // Make sure LOCAL_IP points to your computer's actual IP address
   ```

## 🚨 **Troubleshooting**

### **If mobile app still can't connect:**

1. **Check Backend Status:**
   ```bash
   cd alpha
   npm start
   ```
   Verify it's running on `localhost:5000`

2. **Test API Connection:**
   ```bash
   cd aplhamobile
   node test-mobile-api-connection.js
   ```

3. **Check Network Configuration:**
   - Ensure mobile device is on the same network as your computer
   - If using physical device, you might need to use your computer's actual IP address

4. **For Physical Device:**
   If you're using a physical device (not emulator), you might need to:
   ```javascript
   LOCAL_IP: 'http://YOUR_COMPUTER_IP:5000/api'
   ```
   Replace `YOUR_COMPUTER_IP` with your actual computer's IP address.

### **Find Your Computer's IP Address:**

**Windows:**
```bash
ipconfig
```
Look for "IPv4 Address" under your active network adapter.

**Mac/Linux:**
```bash
ifconfig
# or
ip addr
```

## 📋 **Common Error Messages & Solutions**

### **"Network Error" or "Could not fetch app config"**
- ✅ **Solution**: Backend not running or wrong IP address
- **Fix**: Start backend and verify IP configuration

### **"Invalid credentials or account deactivated"**
- ✅ **Solution**: This is actually good! It means the connection is working
- **Fix**: Use valid credentials to login

### **"Connection refused"**
- ✅ **Solution**: Backend server not running
- **Fix**: Start the backend server with `npm start`

## 🎯 **Success Indicators**

✅ **Mobile app is working if:**
- App loads without network errors
- Login attempts get proper responses (even if credentials are wrong)
- App config loads successfully
- No "Network Error" messages in logs

## 📝 **Important Notes**

- **Restart the mobile app** after making configuration changes
- **Clear app cache** if needed
- **Use valid credentials** for testing login functionality
- **Check the logs** for detailed error information

---

**🎉 Your mobile app should now connect successfully to the backend!**
