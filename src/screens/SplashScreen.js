import React, { useEffect } from 'react';
import { View, Text, StyleSheet, Image, Dimensions } from 'react-native';
import { storage } from '../utils/storage';

const { width, height } = Dimensions.get('window');

const SplashScreen = ({ navigation }) => {
  useEffect(() => {
    const checkAuthAndNavigate = async () => {
      try {
        // Show splash for 3 seconds
        setTimeout(async () => {
          const isAuthenticated = await storage.isAuthenticated();
          
          if (isAuthenticated) {
            // User is logged in, go to home screen
            navigation.replace('Home');
          } else {
            // User is not logged in, go to login screen
            navigation.replace('Login');
          }
        }, 3000);
      } catch (error) {
        console.error('Error in splash screen:', error);
        // On error, go to login screen
        setTimeout(() => {
          navigation.replace('Login');
        }, 3000);
      }
    };

    checkAuthAndNavigate();
  }, [navigation]);

  return (
    <View style={styles.container}>
      <View style={styles.logoContainer}>
        {/* You can replace this with your actual logo image */}
        <View style={styles.logoPlaceholder}>
          <Text style={styles.logoText}>ALPHA</Text>
          <Text style={styles.subText}>Education Management</Text>
        </View>
      </View>
      
      <View style={styles.loadingContainer}>
        <Text style={styles.loadingText}>Loading...</Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#4A90E2',
    justifyContent: 'center',
    alignItems: 'center',
  },
  logoContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  logoPlaceholder: {
    width: 200,
    height: 200,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    borderRadius: 100,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 20,
  },
  logoText: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginBottom: 5,
  },
  subText: {
    fontSize: 14,
    color: '#FFFFFF',
    textAlign: 'center',
  },
  loadingContainer: {
    position: 'absolute',
    bottom: 50,
  },
  loadingText: {
    fontSize: 16,
    color: '#FFFFFF',
    opacity: 0.8,
  },
});

export default SplashScreen;
