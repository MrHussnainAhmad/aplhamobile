import * as Notifications from 'expo-notifications';
import * as Device from 'expo-device';
import Constants from 'expo-constants';
import { Platform } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { adminAPI } from './api';

// Configure notification handler
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: true,
  }),
});

class NotificationService {
  constructor() {
    this.notificationListener = null;
    this.responseListener = null;
  }

  // Register for push notifications and get token
  async registerForPushNotificationsAsync() {
    let token;

    if (Platform.OS === 'android') {
      await Notifications.setNotificationChannelAsync('default', {
        name: 'default',
        importance: Notifications.AndroidImportance.MAX,
        vibrationPattern: [0, 250, 250, 250],
        lightColor: '#FF231F7C',
        sound: 'default',
      });
    }

    if (Device.isDevice) {
      const { status: existingStatus } = await Notifications.getPermissionsAsync();
      let finalStatus = existingStatus;
      
      if (existingStatus !== 'granted') {
        const { status } = await Notifications.requestPermissionsAsync();
        finalStatus = status;
      }
      
      if (finalStatus !== 'granted') {
        console.log('Failed to get push token for push notification!');
        return;
      }
      
      try {
        const projectId = Constants.expoConfig?.extra?.eas?.projectId ?? Constants.easConfig?.projectId;
        if (!projectId) {
          console.log('Project ID not found');
          return;
        }
        
        token = (await Notifications.getExpoPushTokenAsync({ projectId })).data;
        console.log('Push token:', token);
        
        // Save token locally
        await AsyncStorage.setItem('expoPushToken', token);
        
        return token;
      } catch (error) {
        console.log('Error getting push token:', error);
      }
    } else {
      console.log('Must use physical device for Push Notifications');
    }

    return token;
  }

  // Send push token to backend
  async sendTokenToBackend(token, userId, userType) {
    try {
      // Generate a unique device ID if not exists
      let deviceId = await AsyncStorage.getItem('deviceId');
      if (!deviceId) {
        deviceId = `${Platform.OS}_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
        await AsyncStorage.setItem('deviceId', deviceId);
      }

      const response = await adminAPI.savePushToken({
        token,
        deviceId
      });
      console.log('Token saved to backend:', response.data);
    } catch (error) {
      console.error('Error saving token to backend:', error);
      console.error('Full error details:', error.response?.data || error.message);
    }
  }

  // Initialize notification listeners
  async initialize(userId, userType) {
    console.log('🔔 NotificationService.initialize called with:', { userId, userType });
    
    // Register for push notifications
    const token = await this.registerForPushNotificationsAsync();
    console.log('📱 Token received from registerForPushNotificationsAsync:', token ? token.substring(0, 20) + '...' : 'null');
    
    if (token && userId) {
      console.log('📤 Sending token to backend...');
      // Send token to backend
      await this.sendTokenToBackend(token, userId, userType);
    } else {
      console.log('⚠️ Cannot send token to backend:', { 
        hasToken: !!token, 
        hasUserId: !!userId,
        token: token ? token.substring(0, 20) + '...' : 'null',
        userId 
      });
    }

    // Listen for notifications when app is in foreground
    this.notificationListener = Notifications.addNotificationReceivedListener(notification => {
      console.log('Notification received:', notification);
    });

    // Listen for notification responses (when user taps on notification)
    this.responseListener = Notifications.addNotificationResponseReceivedListener(response => {
      console.log('Notification response:', response);
      // Handle navigation based on notification data
      const data = response.notification.request.content.data;
      if (data?.postId) {
        // Navigate to post details
        // You can implement navigation logic here
      }
    });
  }

  // Clean up listeners
  cleanup() {
    if (this.notificationListener) {
      Notifications.removeNotificationSubscription(this.notificationListener);
    }
    if (this.responseListener) {
      Notifications.removeNotificationSubscription(this.responseListener);
    }
  }

  // Schedule a local notification (for testing)
  async scheduleLocalNotification(title, body, data = {}) {
    await Notifications.scheduleNotificationAsync({
      content: {
        title,
        body,
        data,
        sound: 'default',
      },
      trigger: { seconds: 1 },
    });
  }
}

export default new NotificationService();
