import React, { useEffect, useRef, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Animated,
  Dimensions,
  Image,
  TouchableOpacity,
  Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { storage } from '../utils/storage';

const { width, height } = Dimensions.get('window');

const UnverifiedScreen = ({ navigation }) => {
  const [appConfig, setAppConfig] = useState({
    collegeName: 'Alpha Education',
    logoUrl: ''
  });

  // Animation references
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const scaleAnim = useRef(new Animated.Value(0.8)).current;
  const bookAnim1 = useRef(new Animated.Value(-50)).current;
  const bookAnim2 = useRef(new Animated.Value(width + 50)).current;
  const bookAnim3 = useRef(new Animated.Value(-100)).current;
  const pencilAnim = useRef(new Animated.Value(height + 50)).current;
  const graduationCapAnim = useRef(new Animated.Value(-100)).current;
  const bulbAnim = useRef(new Animated.Value(width + 100)).current;

  useEffect(() => {
    // Load app config
    const loadAppConfig = async () => {
      const storedConfig = await storage.getAppConfig();
      if (storedConfig) {
        setAppConfig(storedConfig);
      }
    };
    loadAppConfig();

    // Start animations
    startAnimations();
  }, []);

  const handleLogout = async () => {
    Alert.alert(
      'Confirm Logout',
      'Are you sure you want to logout? You can login again once you are verified.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Logout',
          style: 'destructive',
          onPress: async () => {
            try {
              await storage.clearUserData();
              navigation.reset({
                index: 0,
                routes: [{ name: 'Login' }],
              });
            } catch (error) {
              console.error('Logout error:', error);
              Alert.alert('Error', 'Failed to logout');
            }
          },
        },
      ]
    );
  };

  const startAnimations = () => {
    // Main content animation
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 1000,
        useNativeDriver: true,
      }),
      Animated.spring(scaleAnim, {
        toValue: 1,
        duration: 800,
        useNativeDriver: true,
      }),
    ]).start();

    // Educational elements floating animations
    const createFloatingAnimation = (animValue, startValue, endValue, duration) => {
      return Animated.loop(
        Animated.sequence([
          Animated.timing(animValue, {
            toValue: endValue,
            duration: duration,
            useNativeDriver: true,
          }),
          Animated.timing(animValue, {
            toValue: startValue,
            duration: duration,
            useNativeDriver: true,
          }),
        ])
      );
    };

    // Start floating animations with delays
    setTimeout(() => {
      createFloatingAnimation(bookAnim1, -50, width + 50, 8000).start();
    }, 1000);

    setTimeout(() => {
      createFloatingAnimation(bookAnim2, width + 50, -100, 10000).start();
    }, 2000);

    setTimeout(() => {
      createFloatingAnimation(bookAnim3, -100, width + 100, 12000).start();
    }, 3000);

    setTimeout(() => {
      createFloatingAnimation(pencilAnim, height + 50, -100, 9000).start();
    }, 1500);

    setTimeout(() => {
      createFloatingAnimation(graduationCapAnim, -100, width + 100, 11000).start();
    }, 2500);

    setTimeout(() => {
      createFloatingAnimation(bulbAnim, width + 100, -100, 13000).start();
    }, 4000);
  };

  return (
    <View style={styles.container}>
      {/* Gradient Overlay Effects */}
      <View style={styles.gradientOverlay} />
      <View style={styles.gradientOverlayBottom} />
      
      {/* Header with Logout Button */}
      <View style={styles.header}>
        <TouchableOpacity onPress={handleLogout} style={styles.logoutButton}>
          <Ionicons name="log-out-outline" size={24} color="#F8FAFC" />
        </TouchableOpacity>
      </View>
      
      {/* Animated Educational Background Elements */}
      <Animated.View style={[styles.floatingIcon, {
        top: height * 0.15,
        transform: [{ translateX: bookAnim1 }]
      }]}>
        <Ionicons name="book" size={32} color="#6366F1" />
      </Animated.View>

      <Animated.View style={[styles.floatingIcon, {
        top: height * 0.25,
        transform: [{ translateX: bookAnim2 }]
      }]}>
        <Ionicons name="library" size={28} color="#8B5CF6" />
      </Animated.View>

      <Animated.View style={[styles.floatingIcon, {
        top: height * 0.35,
        transform: [{ translateX: bookAnim3 }]
      }]}>
        <Ionicons name="school" size={36} color="#6366F1" />
      </Animated.View>

      <Animated.View style={[styles.floatingIcon, {
        right: width * 0.1,
        transform: [{ translateY: pencilAnim }]
      }]}>
        <Ionicons name="pencil" size={30} color="#8B5CF6" />
      </Animated.View>

      <Animated.View style={[styles.floatingIcon, {
        top: height * 0.45,
        transform: [{ translateX: graduationCapAnim }]
      }]}>
        <Ionicons name="school-outline" size={34} color="#6366F1" />
      </Animated.View>

      <Animated.View style={[styles.floatingIcon, {
        top: height * 0.55,
        transform: [{ translateX: bulbAnim }]
      }]}>
        <Ionicons name="bulb" size={28} color="#8B5CF6" />
      </Animated.View>

      {/* Main Content */}
      <Animated.View style={[
        styles.contentContainer,
        {
          opacity: fadeAnim,
          transform: [{ scale: scaleAnim }]
        }
      ]}>
        {/* Logo Section */}
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
        </View>

        {/* Message Section */}
        <View style={styles.messageContainer}>
          <View style={styles.messageBox}>
            <Ionicons 
              name="warning-outline" 
              size={40} 
              color="#FF6B6B" 
              style={styles.warningIcon} 
            />
            
            <Text style={styles.mainMessage}>
              Oh, You are Unverified!
            </Text>
            
            <Text style={styles.subMessage}>
              Contact Admin/Principal to Verify you!
            </Text>
            
            <Text style={styles.thanksMessage}>
              Thanks for understanding!!!
            </Text>
            
            {/* Contact Info */}
            <View style={styles.contactContainer}>
              <Ionicons name="call" size={20} color="rgba(255, 255, 255, 0.8)" />
              <Text style={styles.contactText}>Contact Admin</Text>
            </View>
          </View>
        </View>
      </Animated.View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0F172A', // Modern dark background
    position: 'relative',
  },
  gradientOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: height * 0.5,
    backgroundColor: '#6366F1',
    opacity: 0.05,
    zIndex: 0,
  },
  gradientOverlayBottom: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: height * 0.3,
    backgroundColor: '#8B5CF6',
    opacity: 0.03,
    zIndex: 0,
  },
  header: {
    position: 'absolute',
    top: 60,
    right: 24,
    zIndex: 100,
    flexDirection: 'row',
    alignItems: 'center',
  },
  logoutButton: {
    paddingHorizontal: 18,
    paddingVertical: 12,
    backgroundColor: 'rgba(239, 68, 68, 0.1)', // Modern red tint
    borderRadius: 16,
    borderWidth: 1.5,
    borderColor: 'rgba(239, 68, 68, 0.3)',
    flexDirection: 'row',
    alignItems: 'center',
    backdropFilter: 'blur(10px)',
    // Modern shadow
    shadowColor: '#EF4444',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.15,
    shadowRadius: 12,
    elevation: 8,
  },
  floatingIcon: {
    position: 'absolute',
    zIndex: 1,
    opacity: 0.15,
  },
  contentContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 24,
    zIndex: 50,
  },
  logoSection: {
    alignItems: 'center',
    marginBottom: 48,
  },
  logoImage: {
    width: 140,
    height: 140,
    borderRadius: 32,
    backgroundColor: 'rgba(99, 102, 241, 0.1)', // Modern indigo
    borderWidth: 2,
    borderColor: 'rgba(99, 102, 241, 0.3)',
    // Premium shadow effect
    shadowColor: '#6366F1',
    shadowOffset: {
      width: 0,
      height: 20,
    },
    shadowOpacity: 0.25,
    shadowRadius: 40,
    elevation: 20,
  },
  logoPlaceholder: {
    width: 140,
    height: 140,
    backgroundColor: 'rgba(99, 102, 241, 0.15)',
    borderRadius: 32,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: 'rgba(99, 102, 241, 0.3)',
    // Glass effect
    backdropFilter: 'blur(20px)',
    // Premium shadow
    shadowColor: '#6366F1',
    shadowOffset: {
      width: 0,
      height: 20,
    },
    shadowOpacity: 0.3,
    shadowRadius: 40,
    elevation: 20,
  },
  messageContainer: {
    width: '100%',
    alignItems: 'center',
    paddingHorizontal: 20,
  },
  messageBox: {
    backgroundColor: 'rgba(30, 41, 59, 0.6)', // Modern dark glass
    borderRadius: 32,
    padding: 40,
    alignItems: 'center',
    width: '100%',
    maxWidth: 400,
    // Glass morphism effect
    backdropFilter: 'blur(20px)',
    borderWidth: 1,
    borderColor: 'rgba(148, 163, 184, 0.1)',
    // Premium shadow
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 20,
    },
    shadowOpacity: 0.5,
    shadowRadius: 40,
    elevation: 30,
  },
  warningIcon: {
    marginBottom: 24,
    padding: 16,
    backgroundColor: 'rgba(251, 146, 60, 0.1)', // Modern orange
    borderRadius: 24,
    borderWidth: 1.5,
    borderColor: 'rgba(251, 146, 60, 0.2)',
  },
  mainMessage: {
    fontSize: 28,
    fontWeight: '800',
    color: '#F8FAFC',
    textAlign: 'center',
    marginBottom: 12,
    letterSpacing: -0.5,
    // Modern text shadow
    textShadowColor: 'rgba(0, 0, 0, 0.5)',
    textShadowOffset: { width: 0, height: 2 },
    textShadowRadius: 8,
  },
  subMessage: {
    fontSize: 17,
    color: '#CBD5E1',
    textAlign: 'center',
    lineHeight: 26,
    marginBottom: 20,
    fontWeight: '400',
    letterSpacing: 0.3,
  },
  thanksMessage: {
    fontSize: 15,
    color: '#94A3B8',
    textAlign: 'center',
    fontStyle: 'normal',
    marginBottom: 32,
    lineHeight: 22,
    fontWeight: '300',
    letterSpacing: 0.5,
  },
  contactContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(99, 102, 241, 0.15)', // Modern indigo accent
    paddingHorizontal: 24,
    paddingVertical: 14,
    borderRadius: 20,
    marginTop: 12,
    borderWidth: 1,
    borderColor: 'rgba(99, 102, 241, 0.3)',
    // Button shadow
    shadowColor: '#6366F1',
    shadowOffset: {
      width: 0,
      height: 8,
    },
    shadowOpacity: 0.2,
    shadowRadius: 16,
    elevation: 10,
  },
  contactText: {
    fontSize: 16,
    color: '#E0E7FF',
    marginLeft: 10,
    fontWeight: '600',
    letterSpacing: 0.5,
  },
});

export default UnverifiedScreen;
