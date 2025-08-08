import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Dimensions,
  ImageBackground, // Import ImageBackground
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';

const { width } = Dimensions.get('window');
const userTypeBackground = require('../../assets/images/bg2.jpg'); // Import the background image

const UserTypeScreen = ({ navigation }) => {
  const handleUserTypeSelection = (userType) => {
    if (userType === 'teacher') {
      navigation.navigate('TeacherSignup');
    } else {
      navigation.navigate('StudentSignup');
    }
  };

  return (
    <ImageBackground source={userTypeBackground} style={styles.backgroundImage} resizeMode="cover">
      <View style={styles.overlay}>
        <View style={styles.headerContainer}>
          <Text style={styles.title}>Join as</Text>
          <Text style={styles.subtitle}>Choose your account type</Text>
        </View>

        <View style={styles.optionsContainer}>
          <TouchableOpacity
            style={styles.optionCard}
            onPress={() => handleUserTypeSelection('teacher')}
            activeOpacity={0.8}
          >
            <View style={styles.iconContainer}>
              <Ionicons name="person" size={50} color="#4A90E2" />
            </View>
            <Text style={styles.optionTitle}>Teacher</Text>
            <Text style={styles.optionDescription}>
              Create courses, manage students, and track progress
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.optionCard}
            onPress={() => handleUserTypeSelection('student')}
            activeOpacity={0.8}
          >
            <View style={styles.iconContainer}>
              <Ionicons name="school" size={50} color="#27AE60" />
            </View>
            <Text style={styles.optionTitle}>Student</Text>
            <Text style={styles.optionDescription}>
              Access courses, submit assignments, and view grades
            </Text>
          </TouchableOpacity>
        </View>

        <View style={styles.loginContainer}>
          <Text style={styles.loginText}>Already have an account? </Text>
          <TouchableOpacity onPress={() => navigation.navigate('Login')}>
            <Text style={styles.loginLink}>Sign In</Text>
          </TouchableOpacity>
        </View>
      </View>
    </ImageBackground>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    // backgroundColor: '#F5F7FA', // Removed background color
    padding: 20,
  },
  backgroundImage: {
    flex: 1,
    width: '100%',
    height: '100%',
  },
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)', // Semi-transparent overlay
    padding: 20,
  },
  headerContainer: {
    alignItems: 'center',
    marginTop: 60,
    marginBottom: 50,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#FFFFFF', // Changed text color for better contrast
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: '#E0E0E0', // Changed text color for better contrast
    textAlign: 'center',
  },
  optionsContainer: {
    flex: 1,
    justifyContent: 'center',
    gap: 20,
  },
  optionCard: {
    backgroundColor: 'rgba(255, 255, 255, 0.8)', // Semi-transparent background
    borderRadius: 16,
    padding: 30,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.1,
    shadowRadius: 6,
    elevation: 8,
    borderWidth: 2,
    borderColor: 'transparent',
  },
  iconContainer: {
    width: 80,
    height: 80,
    backgroundColor: '#F8F9FA',
    borderRadius: 40,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 20,
  },
  optionTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#2C3E50',
    marginBottom: 8,
  },
  optionDescription: {
    fontSize: 16,
    color: '#7F8C8D',
    textAlign: 'center',
    lineHeight: 22,
  },
  loginContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    paddingVertical: 20,
  },
  loginText: {
    fontSize: 16,
    color: '#E0E0E0', // Changed text color for better contrast
  },
  loginLink: {
    fontSize: 16,
    color: '#4A90E2',
    fontWeight: '600',
  },
});

export default UserTypeScreen;
