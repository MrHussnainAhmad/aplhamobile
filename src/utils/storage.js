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

  // Update stored user data (for profile updates)
  updateUserData: async (updatedUserData) => {
    try {
      await AsyncStorage.setItem(StorageKeys.USER_DATA, JSON.stringify(updatedUserData));
    } catch (error) {
      console.error('Error updating user data:', error);
      throw error;
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

  // Check if user is authenticated and verified (for students)
  getAuthenticationStatus: async () => {
    try {
      const token = await AsyncStorage.getItem(StorageKeys.USER_TOKEN);
      const userData = await AsyncStorage.getItem(StorageKeys.USER_DATA);
      const userType = await AsyncStorage.getItem(StorageKeys.USER_TYPE);

      if (!token) {
        return { isAuthenticated: false, isVerified: false, userType: null };
      }

      const parsedUserData = userData ? JSON.parse(userData) : null;
      
      // For students, check if they are verified
      if (userType === 'student') {
        const isVerified = parsedUserData ? parsedUserData.isVerified || false : false;
        return {
          isAuthenticated: true,
          isVerified: isVerified,
          userType: userType
        };
      }

      // For admin and teachers, they don't need verification check
      return {
        isAuthenticated: true,
        isVerified: true, // Always true for non-students
        userType: userType
      };
    } catch (error) {
      console.error('Error checking authentication status:', error);
      return { isAuthenticated: false, isVerified: false, userType: null };
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
