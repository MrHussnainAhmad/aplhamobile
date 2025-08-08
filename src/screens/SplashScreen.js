import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, Image, Dimensions, ActivityIndicator } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import axios from 'axios';
import { storage } from '../utils/storage';
import { BASE_URL } from '../config/api.config';

const { width, height } = Dimensions.get('window');
const loginBackground = require('../../assets/images/bg.jpg'); // Import the background image
const userTypeBackground = require('../../assets/images/bg2.jpg'); // Import the new background image
const signupBackground = require('../../assets/images/bg3.jpg'); // Import the new background image

const SplashScreen = ({ navigation }) => {
  const [appConfig, setAppConfig] = useState({
    collegeName: 'Alpha Education',
    logoUrl: ''
  });

  useEffect(() => {
    const initializeSplash = async () => {
      // Immediately try to load app config from storage
      const storedConfig = await storage.getAppConfig();
      if (storedConfig) {
        setAppConfig(storedConfig);
        if (storedConfig.logoUrl) {
          Image.prefetch(storedConfig.logoUrl).catch(error => console.log("Prefetch error:", error));
        }
      }

      // Fetch latest app config from API in background
      const fetchAppConfig = async () => {
        try {
          const response = await axios.get(`${BASE_URL}/app-config`);
          if (response.data.success && response.data.config) {
            setAppConfig(response.data.config);
            await storage.storeAppConfig(response.data.config);
            if (response.data.config.logoUrl) {
              Image.prefetch(response.data.config.logoUrl).catch(error => console.log("Prefetch error:", error));
            }
          }
        } catch (error) {
          console.log('Could not fetch app config, using defaults or stored:', error.message);
        }
      };

      fetchAppConfig();

      // Preload background images
      await Image.prefetch(Image.resolveAssetSource(loginBackground).uri);
      console.log('Login background image prefetched.');
      await Image.prefetch(Image.resolveAssetSource(userTypeBackground).uri);
      console.log('User type background image prefetched.');
      await Image.prefetch(Image.resolveAssetSource(signupBackground).uri);
      console.log('Signup background image prefetched.');

      // Show splash for 3 seconds total before navigating
      setTimeout(async () => {
        const isAuthenticated = await storage.isAuthenticated();
        if (isAuthenticated) {
          navigation.replace('Home');
        } else {
          navigation.replace('Login');
        }
      }, 3000);
    };

    initializeSplash();
  }, [navigation]);

  return (
    <View style={styles.container}>
      <View style={styles.contentContainer}>
        <View style={styles.logoSection}>
          {appConfig.logoUrl ? (
            <Image 
              source={{ uri: appConfig.logoUrl }} 
              style={styles.logoImage}
              resizeMode="contain"
            />
          ) : (
            <View style={styles.logoPlaceholder}>
              <Ionicons name="school" size={80} color="#FFFFFF" />
            </View>
          )}
          
          <Text style={styles.collegeName}>
            {appConfig.collegeName}
          </Text>
          
          <Text style={styles.subtitle}>
            Education Management System
          </Text>
        </View>
      </View>
      
      <View style={styles.footerContainer}>
        <ActivityIndicator size="small" color="rgba(255, 255, 255, 0.7)" />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#4A90E2',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: 100,
    paddingBottom: 50,
  },
  contentContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    width: '100%',
  },
  logoSection: {
    alignItems: 'center',
    paddingHorizontal: 40,
  },
  logoImage: {
    width: 150,
    height: 150,
    marginBottom: 30,
    borderRadius: 75,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
  },
  logoPlaceholder: {
    width: 150,
    height: 150,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    borderRadius: 75,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 30,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 10,
  },
  collegeName: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#FFFFFF',
    textAlign: 'center',
    marginBottom: 10,
    textShadowColor: 'rgba(0, 0, 0, 0.3)',
    textShadowOffset: { width: 0, height: 2 },
    textShadowRadius: 4,
  },
  subtitle: {
    fontSize: 16,
    color: 'rgba(255, 255, 255, 0.9)',
    textAlign: 'center',
    lineHeight: 22,
    fontWeight: '500',
  },
  footerContainer: {
    paddingBottom: 20,
  },
  loadingText: {
    fontSize: 16,
    color: '#FFFFFF',
    opacity: 0.8,
    marginTop: 15,
    textAlign: 'center',
  },
});

export default SplashScreen;
