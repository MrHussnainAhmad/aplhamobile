import AsyncStorage from '@react-native-async-storage/async-storage';

export const StorageKeys = {
  USER_TOKEN: 'userToken',
  USER_DATA: 'userData',
  USER_TYPE: 'userType',
  APP_CONFIG: 'appConfig',
};

export const storage = {
  // Store user authentication data
  storeUserData: async (token, userData, userType) => {
    try {
      await AsyncStorage.setItem(StorageKeys.USER_TOKEN, token);
      await AsyncStorage.setItem(StorageKeys.USER_DATA, JSON.stringify(userData));
      await AsyncStorage.setItem(StorageKeys.USER_TYPE, userType);
    } catch (error) {
      console.error('Error storing user data:', error);
      throw error;
    }
  },

  // Get user authentication data
  getUserData: async () => {
    try {
      const token = await AsyncStorage.getItem(StorageKeys.USER_TOKEN);
      const userData = await AsyncStorage.getItem(StorageKeys.USER_DATA);
      const userType = await AsyncStorage.getItem(StorageKeys.USER_TYPE);

      return {
        token,
        userData: userData ? JSON.parse(userData) : null,
        userType,
      };
    } catch (error) {
      console.error('Error getting user data:', error);
      return { token: null, userData: null, userType: null };
    }
  },

  // Clear all user data (logout)
  clearUserData: async () => {
    try {
      await AsyncStorage.multiRemove([
        StorageKeys.USER_TOKEN,
        StorageKeys.USER_DATA,
        StorageKeys.USER_TYPE,
      ]);
    } catch (error) {
      console.error('Error clearing user data:', error);
      throw error;
    }
  },

  // Check if user is authenticated
  isAuthenticated: async () => {
    try {
      const token = await AsyncStorage.getItem(StorageKeys.USER_TOKEN);
      return !!token;
    } catch (error) {
      console.error('Error checking authentication:', error);
      return false;
    }
  },

  // Store app configuration
  storeAppConfig: async (config) => {
    try {
      await AsyncStorage.setItem(StorageKeys.APP_CONFIG, JSON.stringify(config));
    } catch (error) {
      console.error('Error storing app config:', error);
    }
  },

  // Get app configuration
  getAppConfig: async () => {
    try {
      const config = await AsyncStorage.getItem(StorageKeys.APP_CONFIG);
      return config ? JSON.parse(config) : null;
    } catch (error) {
      console.error('Error getting app config:', error);
      return null;
    }
  },
};
