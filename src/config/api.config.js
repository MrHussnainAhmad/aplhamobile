// API Configuration for different environments
const API_CONFIG = {
  // Your computer's local IP (when backend runs locally)
  // LOCAL_IP: 'http://192.168.3.1:5000/api',
  
  // For Android emulator
  // ANDROID_EMULATOR: 'http://10.0.2.2:5000/api',
  
  // For iOS simulator
  // IOS_SIMULATOR: 'http://localhost:5000/api',
  
  // For web testing
  // WEB: 'http://localhost:5000/api',
  
  // If backend is hosted on another device, replace with that device's IP
  // Example: REMOTE_DEVICE: 'http://192.168.100.25:5000/api',
  // REMOTE_DEVICE: 'http://192.168.3.51:5000/api', // Your backend device IP
  
  // Production URL (when deployed)
  PRODUCTION: 'https://superior.up.railway.app/api',
};

// Choose which configuration to use
// Change this value based on how you're running the app:
// - 'LOCAL_IP' for physical device with local backend
// - 'ANDROID_EMULATOR' for Android emulator
// - 'IOS_SIMULATOR' for iOS simulator
// - 'REMOTE_DEVICE' for backend on different device
// - 'PRODUCTION' for production backend
const CURRENT_ENV = 'PRODUCTION';

export const BASE_URL = 'http://192.168.3.58:5000/api';

// Helper function to get the current API URL
export const getApiUrl = () => {
  console.log(`🌐 Using API URL: ${BASE_URL}`);
  return BASE_URL;
};

export default API_CONFIG;
