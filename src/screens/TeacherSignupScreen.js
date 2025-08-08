import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
  Alert,
  KeyboardAvoidingView,
  Platform,
  ImageBackground, // Import ImageBackground
} from 'react-native';
import { Picker } from '@react-native-picker/picker';
import { authAPI } from '../services/api';

const signupBackground = require('../../assets/images/bg3.jpg'); // Import the background image

const TeacherSignupScreen = ({ navigation }) => {
  const [formData, setFormData] = useState({
    fullname: '',
    email: '',
    password: '',
    confirmPassword: '',
    phoneNumber: '',
    cnicNumber: '',
    gender: '',
    age: '',
    address: '',
    whatsappNumber: '',
    joiningYear: new Date().getFullYear().toString(),
  });
  const [loading, setLoading] = useState(false);

  const handleInputChange = (field, value) => {
    setFormData({ ...formData, [field]: value });
  };

  const validateForm = () => {
    const requiredFields = [
      'fullname', 'email', 'password', 'phoneNumber', 
      'cnicNumber', 'gender', 'age', 'address', 'whatsappNumber'
    ];

    for (let field of requiredFields) {
      if (!formData[field].toString().trim()) {
        Alert.alert('Error', `Please fill in ${field.replace(/([A-Z])/g, ' $1').toLowerCase()}`);
        return false;
      }
    }

    if (formData.password !== formData.confirmPassword) {
      Alert.alert('Error', 'Passwords do not match');
      return false;
    }

    if (formData.password.length < 6) {
      Alert.alert('Error', 'Password must be at least 6 characters long');
      return false;
    }

    if (formData.cnicNumber.length !== 11) {
      Alert.alert('Error', 'CNIC must be exactly 11 digits');
      return false;
    }

    if (isNaN(formData.age) || parseInt(formData.age) < 18 || parseInt(formData.age) > 70) {
      Alert.alert('Error', 'Age must be between 18 and 70');
      return false;
    }

    return true;
  };

  const handleSignup = async () => {
    if (!validateForm()) return;

    setLoading(true);

    try {
      const teacherData = {
        ...formData,
        age: parseInt(formData.age),
        joiningYear: parseInt(formData.joiningYear),
      };
      delete teacherData.confirmPassword;

      const response = await authAPI.createTeacher(teacherData);

      Alert.alert(
        'Success', 
        'Teacher account created successfully! You can now login with your credentials.',
        [
          { text: 'OK', onPress: () => navigation.navigate('Login') }
        ]
      );

    } catch (error) {
      console.error('Signup error:', error);
      Alert.alert(
        'Signup Failed', 
        error.response?.data?.message || 'Failed to create account. Please try again.'
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <ImageBackground source={signupBackground} style={styles.backgroundImage} resizeMode="cover">
      <KeyboardAvoidingView 
        style={styles.keyboardAvoidingContainer} 
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
        <ScrollView contentContainerStyle={styles.scrollContainer}>
          <View style={styles.headerContainer}>
            <Text style={styles.title}>Teacher Signup</Text>
            <Text style={styles.subtitle}>Create your teacher account</Text>
          </View>

          <View style={styles.formContainer}>
            <View style={styles.inputContainer}>
              <Text style={styles.label}>Full Name *</Text>
              <TextInput
                style={styles.input}
                placeholder="Enter your full name"
                placeholderTextColor="#7F8C8D"
                value={formData.fullname}
                onChangeText={(value) => handleInputChange('fullname', value)}
              />
            </View>

            <View style={styles.inputContainer}>
              <Text style={styles.label}>Email *</Text>
              <TextInput
                style={styles.input}
                placeholder="Enter your email"
                placeholderTextColor="#7F8C8D"
                value={formData.email}
                onChangeText={(value) => handleInputChange('email', value)}
                keyboardType="email-address"
                autoCapitalize="none"
              />
            </View>

            <View style={styles.inputContainer}>
              <Text style={styles.label}>Password *</Text>
              <TextInput
                style={styles.input}
                placeholder="Enter password (min 6 characters)"
                placeholderTextColor="#7F8C8D"
                value={formData.password}
                onChangeText={(value) => handleInputChange('password', value)}
                secureTextEntry
                autoCapitalize="none"
              />
            </View>

            <View style={styles.inputContainer}>
              <Text style={styles.label}>Confirm Password *</Text>
              <TextInput
                style={styles.input}
                placeholder="Confirm your password"
                placeholderTextColor="#7F8C8D"
                value={formData.confirmPassword}
                onChangeText={(value) => handleInputChange('confirmPassword', value)}
                secureTextEntry
                autoCapitalize="none"
              />
            </View>

            <View style={styles.inputContainer}>
              <Text style={styles.label}>Phone Number *</Text>
              <TextInput
                style={styles.input}
                placeholder="Enter your phone number"
                placeholderTextColor="#7F8C8D"
                value={formData.phoneNumber}
                onChangeText={(value) => handleInputChange('phoneNumber', value)}
                keyboardType="phone-pad"
              />
            </View>

            <View style={styles.inputContainer}>
              <Text style={styles.label}>WhatsApp Number *</Text>
              <TextInput
                style={styles.input}
                placeholder="Enter your WhatsApp number"
                placeholderTextColor="#7F8C8D"
                value={formData.whatsappNumber}
                onChangeText={(value) => handleInputChange('whatsappNumber', value)}
                keyboardType="phone-pad"
              />
            </View>

            <View style={styles.inputContainer}>
              <Text style={styles.label}>CNIC Number *</Text>
              <TextInput
                style={styles.input}
                placeholder="Enter 11-digit CNIC number"
                placeholderTextColor="#7F8C8D"
                value={formData.cnicNumber}
                onChangeText={(value) => handleInputChange('cnicNumber', value)}
                keyboardType="numeric"
                maxLength={11}
              />
            </View>

            <View style={styles.inputContainer}>
              <Text style={styles.label}>Gender *</Text>
              <View style={styles.pickerContainer}>
                <Picker
                  selectedValue={formData.gender}
                  onValueChange={(value) => handleInputChange('gender', value)}
                  style={styles.picker}
                >
                  <Picker.Item label="Select Gender" value="" />
                  <Picker.Item label="Male" value="male" />
                  <Picker.Item label="Female" value="female" />
                  <Picker.Item label="Other" value="other" />
                </Picker>
              </View>
            </View>

            <View style={styles.inputContainer}>
              <Text style={styles.label}>Age *</Text>
              <TextInput
                style={styles.input}
                placeholder="Enter your age (18-70)"
                placeholderTextColor="#7F8C8D"
                value={formData.age}
                onChangeText={(value) => handleInputChange('age', value)}
                keyboardType="numeric"
              />
            </View>

            <View style={styles.inputContainer}>
              <Text style={styles.label}>Address *</Text>
              <TextInput
                style={[styles.input, styles.textArea]}
                placeholder="Enter your full address"
                placeholderTextColor="#7F8C8D"
                value={formData.address}
                onChangeText={(value) => handleInputChange('address', value)}
                multiline
                numberOfLines={3}
              />
            </View>

            <View style={styles.inputContainer}>
              <Text style={styles.label}>Joining Year</Text>
              <TextInput
                style={styles.input}
                placeholder="Enter joining year"
                placeholderTextColor="#7F8C8D"
                value={formData.joiningYear}
                onChangeText={(value) => handleInputChange('joiningYear', value)}
                keyboardType="numeric"
              />
            </View>

            <TouchableOpacity
              style={[styles.signupButton, loading && styles.signupButtonDisabled]}
              onPress={handleSignup}
              disabled={loading}
            >
              <Text style={styles.signupButtonText}>
                {loading ? 'Creating Account...' : 'Create Account'}
              </Text>
            </TouchableOpacity>

            <View style={styles.loginContainer}>
              <Text style={styles.loginText}>Already have an account? </Text>
              <TouchableOpacity onPress={() => navigation.navigate('Login')}>
                <Text style={styles.loginLink}>Sign In</Text>
              </TouchableOpacity>
            </View>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
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
    marginTop: 40,
    marginBottom: 30,
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
  textArea: {
    height: 80,
    textAlignVertical: 'top',
  },
  pickerContainer: {
    borderWidth: 1,
    borderColor: '#E1E8ED',
    borderRadius: 8,
    backgroundColor: '#F8F9FA',
  },
  picker: {
    height: 50,
  },
  signupButton: {
    backgroundColor: '#4A90E2',
    borderRadius: 8,
    paddingVertical: 15,
    alignItems: 'center',
    marginTop: 10,
  },
  signupButtonDisabled: {
    backgroundColor: '#B0C4DE',
  },
  signupButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
  loginContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: 20,
  },
  loginText: {
    fontSize: 14,
    color: '#E0E0E0', // Changed text color for better contrast
  },
  loginLink: {
    fontSize: 14,
    color: '#4A90E2',
    fontWeight: '600',
  },
});

export default TeacherSignupScreen;
