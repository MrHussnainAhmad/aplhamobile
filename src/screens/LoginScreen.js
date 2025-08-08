import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  KeyboardAvoidingView,
  ScrollView,
  Platform,
  ImageBackground, // Import ImageBackground
} from 'react-native';
import { authAPI } from '../services/api';
import { storage } from '../utils/storage';
import SuccessModal from '../components/SuccessModal';
import ErrorModal from '../components/ErrorModal';

const backgroundImage = require('../../assets/images/bg.jpg'); // Import the background image

const LoginScreen = ({ navigation }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [showErrorModal, setShowErrorModal] = useState(false);
  const [modalMessage, setModalMessage] = useState('');

  const handleLogin = async () => {
    if (!email.trim() || !password.trim()) {
      setModalMessage('Please fill in all fields');
      setShowErrorModal(true);
      return;
    }

    setLoading(true);

    try {
      // Try different login types
      let response = null;
      let userType = null;
      let lastError = null;

      // Check if this looks like admin email first
      if (email.trim().toLowerCase() === 'admin@gmail.com') {
        try {
          console.log('Trying admin login for admin email');
          response = await authAPI.adminLogin({ email: email.trim(), password });
          userType = 'admin';
        } catch (adminError) {
          console.log('Admin login failed:', adminError.response?.data?.message || adminError.message);
          lastError = adminError;
        }
      }

      // If not admin or admin login failed, try teacher login
      if (!response) {
        try {
          console.log('Trying teacher login');
          response = await authAPI.teacherLogin({ email: email.trim(), password });
          userType = 'teacher';
        } catch (teacherError) {
          console.log('Teacher login failed:', teacherError.response?.data?.message || teacherError.message);
          lastError = teacherError;
        }
      }

      // If teacher login failed, try student login
      if (!response) {
        try {
          console.log('Trying student login');
          response = await authAPI.studentLogin({ email: email.trim(), password });
          userType = 'student';
        } catch (studentError) {
          console.log('Student login failed:', studentError.response?.data?.message || studentError.message);
          lastError = studentError;
        }
      }

      // If all logins failed
      if (!response) {
        throw lastError || new Error('Invalid credentials');
      }

      // Store user data
      const { token } = response.data;
      const userData = userType === 'admin' ? response.data.admin : 
                      userType === 'teacher' ? response.data.teacher : 
                      response.data.student;
      
      await storage.storeUserData(token, userData, userType);

      setModalMessage(`Welcome ${userData.fullname}!`);
      setShowSuccessModal(true);

    } catch (error) {
      console.error('Login error:', error);
      setModalMessage(error.response?.data?.message || error.message || 'Please check your credentials and try again');
      setShowErrorModal(true);
    } finally {
      setLoading(false);
    }
  };

  const handleSuccessModalClose = () => {
    setShowSuccessModal(false);
    navigation.replace('Home');
  };

  const handleErrorModalClose = () => {
    setShowErrorModal(false);
  };

  return (
    <ImageBackground source={backgroundImage} style={styles.backgroundImage} resizeMode="cover">
      <KeyboardAvoidingView 
        style={styles.keyboardAvoidingContainer} 
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
        <ScrollView contentContainerStyle={styles.scrollContainer}>
          <View style={styles.headerContainer}>
            <Text style={styles.title}>Welcome Back</Text>
            <Text style={styles.subtitle}>Sign in to continue</Text>
          </View>

          <View style={styles.formContainer}>
            <View style={styles.inputContainer}>
              <Text style={styles.label}>Email</Text>
              <TextInput
                style={styles.input}
                placeholder="Enter your email"
                placeholderTextColor="#7F8C8D"
                value={email}
                onChangeText={setEmail}
                keyboardType="email-address"
                autoCapitalize="none"
                autoCorrect={false}
              />
            </View>

            <View style={styles.inputContainer}>
              <Text style={styles.label}>Password</Text>
              <TextInput
                style={styles.input}
                placeholder="Enter your password"
                placeholderTextColor="#7F8C8D"
                value={password}
                onChangeText={setPassword}
                secureTextEntry
                autoCapitalize="none"
              />
            </View>

            <TouchableOpacity
              style={[styles.loginButton, loading && styles.loginButtonDisabled]}
              onPress={handleLogin}
              disabled={loading}
            >
              <Text style={styles.loginButtonText}>
                {loading ? 'Signing In...' : 'Sign In'}
              </Text>
            </TouchableOpacity>

            <View style={styles.signupContainer}>
              <Text style={styles.signupText}>Don't have an account? </Text>
              <TouchableOpacity onPress={() => navigation.navigate('UserType')}>
                <Text style={styles.signupLink}>Sign Up</Text>
              </TouchableOpacity>
            </View>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>

      <SuccessModal
        isVisible={showSuccessModal}
        message={modalMessage}
        onClose={handleSuccessModalClose}
      />

      <ErrorModal
        isVisible={showErrorModal}
        message={modalMessage}
        onClose={handleErrorModalClose}
      />
    </ImageBackground>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  backgroundImage: {
    flex: 1,
    width: '100%',
    height: '100%',
    justifyContent: 'center',
  },
  scrollContainer: {
    flexGrow: 1,
    justifyContent: 'center',
    padding: 20,
  },
  headerContainer: {
    alignItems: 'center',
    marginBottom: 40,
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
  },
  formContainer: {
    backgroundColor: 'rgba(255, 255, 255, 0.8)', // Semi-transparent background
    borderRadius: 12,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 5,
  },
  inputContainer: {
    marginBottom: 20,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    color: '#2C3E50',
    marginBottom: 8,
  },
  input: {
    borderWidth: 1,
    borderColor: '#E1E8ED',
    borderRadius: 8,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 16,
    backgroundColor: '#F8F9FA',
  },
  loginButton: {
    backgroundColor: '#4A90E2',
    borderRadius: 8,
    paddingVertical: 15,
    alignItems: 'center',
    marginTop: 10,
  },
  loginButtonDisabled: {
    backgroundColor: '#B0C4DE',
  },
  loginButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
  signupContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: 20,
  },
  signupText: {
    fontSize: 14,
    color: '#7F8C8D',
  },
  signupLink: {
    fontSize: 14,
    color: '#4A90E2',
    fontWeight: '600',
  },
});

export default LoginScreen;
