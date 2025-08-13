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
  ImageBackground,
  Alert,
  ActivityIndicator,
  BackHandler,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { passwordResetAPI } from '../services/api';

const backgroundImage = require('../../assets/images/bg.jpg');

const ResetPasswordScreen = ({ navigation, route }) => {
  const [token, setToken] = useState('');
  const [email, setEmail] = useState(route?.params?.email || '');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [step, setStep] = useState(1); // 1: Enter token, 2: Enter new password

  const handleVerifyToken = async () => {
    if (!token.trim() || !email.trim()) {
      Alert.alert('Error', 'Please enter both token and email');
      return;
    }

    setLoading(true);

    try {
      const response = await passwordResetAPI.verifyToken(token.trim(), email.trim());
      
      if (response.data.success) {
        setStep(2);
        Alert.alert('Success', 'Token verified! Now enter your new password.');
      } else {
        Alert.alert('Error', response.data.message || 'Invalid token');
      }
    } catch (error) {
      console.error('Token verification error:', error);
      
      const errorData = error.response?.data;
      const errorType = errorData?.errorType;
      const errorMessage = errorData?.message || 'Failed to verify token. Please try again.';
      
      if (errorType === 'NOT_REGISTERED') {
        Alert.alert(
          'Intruder!',
          'Your Account is not registered with this mail.',
          [
            {
              text: 'Exit App',
              onPress: () => {
                if (Platform.OS === 'ios') {
                  navigation.reset({
                    index: 0,
                    routes: [{ name: 'Login' }],
                  });
                } else {
                  BackHandler.exitApp();
                }
              },
              style: 'destructive'
            }
          ]
        );
      } else if (errorType === 'NOT_VERIFIED') {
        Alert.alert(
          'Account Not Verified',
          'For Password Reset Account Should be Verified from Admin, Please Approach admin to verify your account.',
          [
            {
              text: 'OK',
              onPress: () => navigation.navigate('Login')
            }
          ]
        );
      } else {
        Alert.alert('Error', errorMessage);
      }
    } finally {
      setLoading(false);
    }
  };

  const handleResetPassword = async () => {
    if (!newPassword.trim() || !confirmPassword.trim()) {
      Alert.alert('Error', 'Please enter both passwords');
      return;
    }

    if (newPassword.length < 6) {
      Alert.alert('Error', 'Password must be at least 6 characters long');
      return;
    }

    if (newPassword !== confirmPassword) {
      Alert.alert('Error', 'Passwords do not match');
      return;
    }

    setLoading(true);

    try {
      const response = await passwordResetAPI.resetPassword(token.trim(), email.trim(), newPassword.trim());
      
      if (response.data.success) {
        Alert.alert(
          'Success!',
          'Your password has been reset successfully. You can now login with your new password.',
          [
            {
              text: 'OK',
              onPress: () => navigation.navigate('Login')
            }
          ]
        );
      } else {
        Alert.alert('Error', response.data.message || 'Failed to reset password');
      }
    } catch (error) {
      console.error('Password reset error:', error);
      
      const errorData = error.response?.data;
      const errorType = errorData?.errorType;
      const errorMessage = errorData?.message || 'Failed to reset password. Please try again.';
      
      if (errorType === 'NOT_REGISTERED') {
        Alert.alert(
          'Intruder!',
          'Your Account is not registered with this mail.',
          [
            {
              text: 'Exit App',
              onPress: () => {
                if (Platform.OS === 'ios') {
                  navigation.reset({
                    index: 0,
                    routes: [{ name: 'Login' }],
                  });
                } else {
                  BackHandler.exitApp();
                }
              },
              style: 'destructive'
            }
          ]
        );
      } else if (errorType === 'NOT_VERIFIED') {
        Alert.alert(
          'Account Not Verified',
          'For Password Reset Account Should be Verified from Admin, Please Approach admin to verify your account.',
          [
            {
              text: 'OK',
              onPress: () => navigation.navigate('Login')
            }
          ]
        );
      } else {
        Alert.alert('Error', errorMessage);
      }
    } finally {
      setLoading(false);
    }
  };

  const renderStep1 = () => (
    <View style={styles.formContainer}>
      <View style={styles.stepIndicator}>
        <View style={[styles.stepDot, styles.activeStep]} />
        <View style={styles.stepLine} />
        <View style={styles.stepDot} />
      </View>
      
      <Text style={styles.stepTitle}>Step 1: Enter Reset Token</Text>
      <Text style={styles.stepDescription}>
        Enter the token you received in your email
      </Text>

      <View style={styles.inputContainer}>
        <Text style={styles.label}>Reset Token</Text>
        <View style={styles.inputWrapper}>
          <Ionicons name="key" size={20} color="#4A90E2" style={styles.inputIcon} />
          <TextInput
            style={styles.input}
            placeholder="Enter the reset token"
            placeholderTextColor="#7F8C8D"
            value={token}
            onChangeText={setToken}
            autoCapitalize="none"
            autoCorrect={false}
            editable={!loading}
          />
        </View>
      </View>

      <View style={styles.inputContainer}>
        <Text style={styles.label}>Email Address</Text>
        <View style={styles.inputWrapper}>
          <Ionicons name="mail" size={20} color="#4A90E2" style={styles.inputIcon} />
          <TextInput
            style={styles.input}
            placeholder="Enter your email address"
            placeholderTextColor="#7F8C8D"
            value={email}
            onChangeText={setEmail}
            keyboardType="email-address"
            autoCapitalize="none"
            autoCorrect={false}
            editable={!loading}
          />
        </View>
      </View>

      <TouchableOpacity
        style={[styles.primaryButton, loading && styles.primaryButtonDisabled]}
        onPress={handleVerifyToken}
        disabled={loading}
      >
        {loading ? (
          <ActivityIndicator size="small" color="#FFFFFF" />
        ) : (
          <>
            <Ionicons name="checkmark-circle" size={20} color="#FFFFFF" style={styles.buttonIcon} />
            <Text style={styles.primaryButtonText}>Verify Token</Text>
          </>
        )}
      </TouchableOpacity>
    </View>
  );

  const renderStep2 = () => (
    <View style={styles.formContainer}>
      <View style={styles.stepIndicator}>
        <View style={styles.stepDot} />
        <View style={styles.stepLine} />
        <View style={[styles.stepDot, styles.activeStep]} />
      </View>
      
      <Text style={styles.stepTitle}>Step 2: Set New Password</Text>
      <Text style={styles.stepDescription}>
        Enter your new password
      </Text>

      <View style={styles.inputContainer}>
        <Text style={styles.label}>New Password</Text>
        <View style={styles.inputWrapper}>
          <Ionicons name="lock-closed" size={20} color="#4A90E2" style={styles.inputIcon} />
          <TextInput
            style={styles.input}
            placeholder="Enter new password"
            placeholderTextColor="#7F8C8D"
            value={newPassword}
            onChangeText={setNewPassword}
            secureTextEntry={!showPassword}
            autoCapitalize="none"
            autoCorrect={false}
            editable={!loading}
          />
          <TouchableOpacity
            style={styles.eyeIcon}
            onPress={() => setShowPassword(!showPassword)}
          >
            <Ionicons
              name={showPassword ? 'eye-off' : 'eye'}
              size={20}
              color="#7F8C8D"
            />
          </TouchableOpacity>
        </View>
      </View>

      <View style={styles.inputContainer}>
        <Text style={styles.label}>Confirm Password</Text>
        <View style={styles.inputWrapper}>
          <Ionicons name="lock-closed" size={20} color="#4A90E2" style={styles.inputIcon} />
          <TextInput
            style={styles.input}
            placeholder="Confirm new password"
            placeholderTextColor="#7F8C8D"
            value={confirmPassword}
            onChangeText={setConfirmPassword}
            secureTextEntry={!showConfirmPassword}
            autoCapitalize="none"
            autoCorrect={false}
            editable={!loading}
          />
          <TouchableOpacity
            style={styles.eyeIcon}
            onPress={() => setShowConfirmPassword(!showConfirmPassword)}
          >
            <Ionicons
              name={showConfirmPassword ? 'eye-off' : 'eye'}
              size={20}
              color="#7F8C8D"
            />
          </TouchableOpacity>
        </View>
      </View>

      <TouchableOpacity
        style={[styles.primaryButton, loading && styles.primaryButtonDisabled]}
        onPress={handleResetPassword}
        disabled={loading}
      >
        {loading ? (
          <ActivityIndicator size="small" color="#FFFFFF" />
        ) : (
          <>
            <Ionicons name="lock-open" size={20} color="#FFFFFF" style={styles.buttonIcon} />
            <Text style={styles.primaryButtonText}>Reset Password</Text>
          </>
        )}
      </TouchableOpacity>

      <TouchableOpacity
        style={styles.secondaryButton}
        onPress={() => setStep(1)}
        disabled={loading}
      >
        <Ionicons name="arrow-back" size={16} color="#4A90E2" />
        <Text style={styles.secondaryButtonText}>Back to Step 1</Text>
      </TouchableOpacity>
    </View>
  );

  return (
    <ImageBackground source={backgroundImage} style={styles.backgroundImage} resizeMode="cover">
      <KeyboardAvoidingView 
        style={styles.keyboardAvoidingContainer} 
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
        <ScrollView contentContainerStyle={styles.scrollContainer} keyboardShouldPersistTaps="handled">
          {/* Header */}
          <View style={styles.headerContainer}>
            <TouchableOpacity 
              style={styles.backButton}
              onPress={() => navigation.goBack()}
            >
              <Ionicons name="arrow-back" size={24} color="#FFFFFF" />
            </TouchableOpacity>
            
            <View style={styles.titleContainer}>
              <Ionicons name="key" size={40} color="#FFFFFF" style={styles.icon} />
              <Text style={styles.title}>Reset Password</Text>
              <Text style={styles.subtitle}>Enter your reset token and new password</Text>
            </View>
          </View>

          {/* Form */}
          {step === 1 ? renderStep1() : renderStep2()}

          {/* Footer */}
          <View style={styles.footerContainer}>
            <TouchableOpacity 
              style={styles.backToLoginButton}
              onPress={() => navigation.navigate('Login')}
            >
              <Ionicons name="arrow-back" size={16} color="#4A90E2" />
              <Text style={styles.backToLoginText}>Back to Login</Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </ImageBackground>
  );
};

const styles = StyleSheet.create({
  backgroundImage: {
    flex: 1,
    width: '100%',
    height: '100%',
  },
  keyboardAvoidingContainer: {
    flex: 1,
  },
  scrollContainer: {
    flexGrow: 1,
    padding: 20,
  },
  headerContainer: {
    alignItems: 'center',
    marginTop: 60,
    marginBottom: 40,
  },
  backButton: {
    position: 'absolute',
    top: 0,
    left: 0,
    padding: 10,
    backgroundColor: 'rgba(0, 0, 0, 0.3)',
    borderRadius: 20,
  },
  titleContainer: {
    alignItems: 'center',
    marginTop: 20,
  },
  icon: {
    marginBottom: 15,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#FFFFFF',
    textAlign: 'center',
    marginBottom: 8,
    textShadowColor: 'rgba(0, 0, 0, 0.5)',
    textShadowOffset: { width: 0, height: 2 },
    textShadowRadius: 4,
  },
  subtitle: {
    fontSize: 16,
    color: '#E0E0E0',
    textAlign: 'center',
    lineHeight: 22,
    textShadowColor: 'rgba(0, 0, 0, 0.5)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 2,
  },
  formContainer: {
    backgroundColor: 'rgba(255, 255, 255, 0.95)',
    borderRadius: 20,
    padding: 30,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  stepIndicator: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 25,
  },
  stepDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: '#E1E8ED',
  },
  activeStep: {
    backgroundColor: '#4A90E2',
  },
  stepLine: {
    width: 40,
    height: 2,
    backgroundColor: '#E1E8ED',
    marginHorizontal: 10,
  },
  stepTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#2C3E50',
    textAlign: 'center',
    marginBottom: 8,
  },
  stepDescription: {
    fontSize: 14,
    color: '#7F8C8D',
    textAlign: 'center',
    marginBottom: 25,
  },
  inputContainer: {
    marginBottom: 20,
  },
  label: {
    fontSize: 16,
    fontWeight: '600',
    color: '#2C3E50',
    marginBottom: 10,
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#E1E8ED',
    borderRadius: 12,
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 15,
    paddingVertical: 5,
  },
  inputIcon: {
    marginRight: 12,
  },
  input: {
    flex: 1,
    fontSize: 16,
    color: '#2C3E50',
    paddingVertical: 15,
  },
  eyeIcon: {
    padding: 5,
  },
  primaryButton: {
    backgroundColor: '#4A90E2',
    borderRadius: 12,
    paddingVertical: 18,
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'center',
    marginBottom: 15,
    shadowColor: '#4A90E2',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 6,
  },
  primaryButtonDisabled: {
    backgroundColor: '#B0C4DE',
  },
  buttonIcon: {
    marginRight: 8,
  },
  primaryButtonText: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: '600',
  },
  secondaryButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 15,
  },
  secondaryButtonText: {
    color: '#4A90E2',
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 5,
  },
  footerContainer: {
    alignItems: 'center',
    marginTop: 30,
  },
  backToLoginButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 10,
    paddingHorizontal: 20,
  },
  backToLoginText: {
    color: '#4A90E2',
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 5,
  },
});

export default ResetPasswordScreen;
