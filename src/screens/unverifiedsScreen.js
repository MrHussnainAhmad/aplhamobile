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

  // Main fade & scale for content
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const scaleAnim = useRef(new Animated.Value(0.8)).current;

  // Floating icons
  const bookAnim1 = useRef(new Animated.Value(-50)).current;
  const bookAnim2 = useRef(new Animated.Value(width + 50)).current;
  const bookAnim3 = useRef(new Animated.Value(-100)).current;
  const pencilAnim = useRef(new Animated.Value(height + 50)).current;
  const graduationCapAnim = useRef(new Animated.Value(-100)).current;
  const bulbAnim = useRef(new Animated.Value(width + 100)).current;

  // Gradient animation
  const gradientShift = useRef(new Animated.Value(0)).current;

  // Particles (positions)
  const particles = Array.from({ length: 12 }, () => ({
    x: Math.random() * width,
    y: new Animated.Value(Math.random() * height),
    size: 2 + Math.random() * 3,
    opacity: 0.1 + Math.random() * 0.2,
    speed: 15000 + Math.random() * 5000
  }));

  useEffect(() => {
    const loadAppConfig = async () => {
      const storedConfig = await storage.getAppConfig();
      if (storedConfig) setAppConfig(storedConfig);
    };
    loadAppConfig();
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
              navigation.reset({ index: 0, routes: [{ name: 'Login' }] });
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
    // Content fade & scale
    Animated.parallel([
      Animated.timing(fadeAnim, { toValue: 1, duration: 1000, useNativeDriver: true }),
      Animated.spring(scaleAnim, { toValue: 1, friction: 5, useNativeDriver: true }),
    ]).start();

    // Floating icons with parallax
    const float = (animValue, start, end, duration) =>
      Animated.loop(
        Animated.sequence([
          Animated.timing(animValue, { toValue: end, duration, useNativeDriver: true }),
          Animated.timing(animValue, { toValue: start, duration, useNativeDriver: true }),
        ])
      );

    setTimeout(() => float(bookAnim1, -50, width + 50, 8000).start(), 1000);
    setTimeout(() => float(bookAnim2, width + 50, -100, 10000).start(), 2000);
    setTimeout(() => float(bookAnim3, -100, width + 100, 12000).start(), 3000);
    setTimeout(() => float(pencilAnim, height + 50, -100, 9000).start(), 1500);
    setTimeout(() => float(graduationCapAnim, -100, width + 100, 11000).start(), 2500);
    setTimeout(() => float(bulbAnim, width + 100, -100, 13000).start(), 4000);

    // Gradient shift animation
    Animated.loop(
      Animated.sequence([
        Animated.timing(gradientShift, { toValue: 1, duration: 8000, useNativeDriver: false }),
        Animated.timing(gradientShift, { toValue: 0, duration: 8000, useNativeDriver: false }),
      ])
    ).start();

    // Particle movement
    particles.forEach(p => {
      Animated.loop(
        Animated.sequence([
          Animated.timing(p.y, { toValue: -50, duration: p.speed, useNativeDriver: true }),
          Animated.timing(p.y, { toValue: height + 50, duration: 0, useNativeDriver: true }),
        ])
      ).start();
    });
  };

  // Interpolated gradient colors
  const bgColor1 = gradientShift.interpolate({
    inputRange: [0, 1],
    outputRange: ['#1E3A8A', '#6366F1'],
  });
  const bgColor2 = gradientShift.interpolate({
    inputRange: [0, 1],
    outputRange: ['#6366F1', '#8B5CF6'],
  });

  return (
    <View style={styles.container}>
      {/* Animated Gradient Background */}
      <Animated.View style={[StyleSheet.absoluteFill, { backgroundColor: bgColor1 }]} />
      <Animated.View style={[StyleSheet.absoluteFill, { backgroundColor: bgColor2, opacity: 0.6 }]} />

      {/* Particle Layer */}
      {particles.map((p, i) => (
        <Animated.View
          key={i}
          style={{
            position: 'absolute',
            width: p.size,
            height: p.size,
            borderRadius: p.size / 2,
            backgroundColor: '#FFF',
            opacity: p.opacity,
            left: p.x,
            transform: [{ translateY: p.y }],
          }}
        />
      ))}

      {/* Logout Button */}
      <View style={styles.header}>
        <TouchableOpacity onPress={handleLogout} style={styles.logoutButton}>
          <Ionicons name="log-out-outline" size={24} color="#F8FAFC" />
        </TouchableOpacity>
      </View>

      {/* Floating Icons */}
      <Animated.View style={[styles.floatingIcon, { top: height * 0.15, transform: [{ translateX: bookAnim1 }] }]}>
        <Ionicons name="book" size={32} color="#FFF" />
      </Animated.View>
      <Animated.View style={[styles.floatingIcon, { top: height * 0.25, transform: [{ translateX: bookAnim2 }] }]}>
        <Ionicons name="library" size={28} color="#FFF" />
      </Animated.View>
      <Animated.View style={[styles.floatingIcon, { top: height * 0.35, transform: [{ translateX: bookAnim3 }] }]}>
        <Ionicons name="school" size={36} color="#FFF" />
      </Animated.View>
      <Animated.View style={[styles.floatingIcon, { right: width * 0.1, transform: [{ translateY: pencilAnim }] }]}>
        <Ionicons name="pencil" size={30} color="#FFF" />
      </Animated.View>
      <Animated.View style={[styles.floatingIcon, { top: height * 0.45, transform: [{ translateX: graduationCapAnim }] }]}>
        <Ionicons name="school-outline" size={34} color="#FFF" />
      </Animated.View>
      <Animated.View style={[styles.floatingIcon, { top: height * 0.55, transform: [{ translateX: bulbAnim }] }]}>
        <Ionicons name="bulb" size={28} color="#FFF" />
      </Animated.View>

      {/* Main Content */}
      <Animated.View style={[styles.contentContainer, { opacity: fadeAnim, transform: [{ scale: scaleAnim }] }]}>
        <View style={styles.logoSection}>
          {appConfig.logoUrl ? (
            <Image source={{ uri: appConfig.logoUrl }} style={styles.logoImage} resizeMode="contain" />
          ) : (
            <View style={styles.logoPlaceholder}>
              <Ionicons name="school" size={80} color="#FFFFFF" />
            </View>
          )}
        </View>
        <View style={styles.messageContainer}>
          <View style={styles.messageBox}>
            <Ionicons name="warning-outline" size={40} color="#FF6B6B" style={styles.warningIcon} />
            <Text style={styles.mainMessage}>Oh, You are Unverified!</Text>
            <Text style={styles.subMessage}>Contact Admin/Principal to Verify you!</Text>
            <Text style={styles.thanksMessage}>We Know You Verified Your Account, But Admin Needs To Verify You Again!</Text>
            <Text style={styles.thanksMessage}>Thanks for understanding!!!</Text>
          </View>
        </View>
      </Animated.View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#0F172A', position: 'relative' },
  header: { position: 'absolute', top: 60, right: 24, zIndex: 100 },
  logoutButton: {
    paddingHorizontal: 18,
    paddingVertical: 12,
    backgroundColor: 'rgba(239, 68, 68, 0.1)',
    borderRadius: 16,
    borderWidth: 1.5,
    borderColor: 'rgba(239, 68, 68, 0.3)',
  },
  floatingIcon: { position: 'absolute', zIndex: 1, opacity: 0.15 },
  contentContainer: { flex: 1, justifyContent: 'center', alignItems: 'center', paddingHorizontal: 24, zIndex: 50 },
  logoSection: { alignItems: 'center', marginBottom: 48 },
  logoImage: {
    width: 140, height: 140, borderRadius: 32, backgroundColor: 'rgba(99, 102, 241, 0.1)',
    borderWidth: 2, borderColor: 'rgba(99, 102, 241, 0.3)',
  },
  logoPlaceholder: {
    width: 140, height: 140, backgroundColor: 'rgba(99, 102, 241, 0.15)', borderRadius: 32,
    justifyContent: 'center', alignItems: 'center', borderWidth: 2, borderColor: 'rgba(99, 102, 241, 0.3)',
  },
  messageContainer: { width: '100%', alignItems: 'center', paddingHorizontal: 20 },
  messageBox: {
    backgroundColor: 'rgba(30, 41, 59, 0.6)', borderRadius: 32, padding: 40, alignItems: 'center',
    width: '100%', maxWidth: 400, borderWidth: 1, borderColor: 'rgba(148, 163, 184, 0.1)',
  },
  warningIcon: {
    marginBottom: 24, padding: 16, backgroundColor: 'rgba(251, 146, 60, 0.1)',
    borderRadius: 24, borderWidth: 1.5, borderColor: 'rgba(251, 146, 60, 0.2)',
  },
  mainMessage: { fontSize: 28, fontWeight: '800', color: '#F8FAFC', textAlign: 'center', marginBottom: 12 },
  subMessage: { fontSize: 17, color: '#CBD5E1', textAlign: 'center', lineHeight: 26, marginBottom: 20 },
  thanksMessage: { fontSize: 15, color: '#94A3B8', textAlign: 'center', marginBottom: 32 },
  contactContainer: {
    flexDirection: 'row', alignItems: 'center', backgroundColor: 'rgba(99, 102, 241, 0.15)',
    paddingHorizontal: 24, paddingVertical: 14, borderRadius: 20, marginTop: 12,
    borderWidth: 1, borderColor: 'rgba(99, 102, 241, 0.3)',
  },
  contactText: { fontSize: 16, color: '#E0E7FF', marginLeft: 10, fontWeight: '600' },
});

export default UnverifiedScreen;
