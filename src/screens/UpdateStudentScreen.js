import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  Image,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Picker } from '@react-native-picker/picker';
import { adminAPI, teacherAPI, classesAPI } from '../services/api';
import { storage } from '../utils/storage';

const UpdateStudentScreen = ({ navigation, route }) => {
  const { student } = route.params;
  const [loading, setLoading] = useState(false);
  const [userType, setUserType] = useState(null);
  const [classes, setClasses] = useState([]);
  
  const [formData, setFormData] = useState({
    fullname: student.fullname || '',
    email: student.email || '',
    phoneNumber: student.phoneNumber || '',
    class: student.class?._id || '',
    section: student.section || '',
    studentId: student.studentId || '',
    rollNumber: student.rollNumber || '',
    gender: student.gender || '', // Add gender to formData
    currentFee: student.currentFee || 0,
    futureFee: student.futureFee || 0,
  });

  const [errors, setErrors] = useState({});

  useEffect(() => {
    checkUserType();
    loadClasses();
  }, []);

  const checkUserType = async () => {
    try {
      const { userType: storedUserType } = await storage.getUserData();
      setUserType(storedUserType);
    } catch (error) {
      console.error('Error checking user type:', error);
    }
  };

  const loadClasses = async () => {
    try {
      const response = await classesAPI.getAllClasses();
      setClasses(response.data.classes || []);
    } catch (error) {
      console.error('Error loading classes:', error);
      Alert.alert('Error', 'Failed to load classes');
    }
  };

  const validateForm = () => {
    const newErrors = {};

    if (!formData.fullname.trim()) {
      newErrors.fullname = 'Full name is required';
    }

    if (!formData.email.trim()) {
      newErrors.email = 'Email is required';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'Email format is invalid';
    }

    if (!formData.class) {
      newErrors.class = 'Class is required';
    }

    if (!formData.section.trim()) {
      newErrors.section = 'Section is required';
    }

    if (formData.phoneNumber && !/^\d{10,15}$/.test(formData.phoneNumber.replace(/\s/g, ''))) {
      newErrors.phoneNumber = 'Phone number must be 10-15 digits';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleInputChange = (field, value) => {
    setFormData(prev => {
      let processedValue = value;
      if (field === 'currentFee' || field === 'futureFee') {
        processedValue = value === '' ? 0 : Number(value);
      }

      const newFormData = { ...prev, [field]: processedValue };
      if (field === 'gender') {
        if (value === 'male') {
          newFormData.section = 'Boys';
        } else if (value === 'female') {
          newFormData.section = 'Girls';
        } else {
          newFormData.section = ''; // Clear section if gender is not male or female
        }
      }
      return newFormData;
    });
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: null }));
    }
  };

  const handleUpdate = async () => {
    console.log("Update button pressed.");
    if (!validateForm()) {
      Alert.alert('Validation Error', 'Please check the form for errors');
      return;
    }

    setLoading(true);
    console.log("Updating student with data:", formData);
    try {
      // Use appropriate API based on user type
      const response = userType === 'admin'
        ? await adminAPI.updateStudent(student._id, formData)
        : await teacherAPI.updateStudent(student._id, formData);

      // Update local storage
      const { token, user } = await storage.getUserData();
      const updatedUser = { ...user, ...response.data.student };
      await storage.storeUserData(token, updatedUser, userType);

      Alert.alert('Success', 'Student updated successfully', [
        {
          text: 'OK',
          onPress: () => navigation.navigate('Home'),
        },
      ]);
    } catch (error) {
      console.error('Error updating student:', error);
      Alert.alert('Error', error.response?.data?.message || 'Failed to update student');
    } finally {
      setLoading(false);
    }
  };

  const renderInput = (field, label, placeholder, keyboardType = 'default', multiline = false) => (
    <View style={styles.inputContainer}>
      <Text style={styles.inputLabel}>{label}</Text>
      <TextInput
        style={[
          styles.textInput,
          multiline && styles.textArea,
          errors[field] && styles.inputError
        ]}
        value={String(formData[field])}
        onChangeText={(value) => handleInputChange(field, value)}
        placeholder={placeholder}
        keyboardType={keyboardType}
        multiline={multiline}
        numberOfLines={multiline ? 3 : 1}
        placeholderTextColor="#95A5A6"
      />
      {errors[field] && (
        <Text style={styles.errorText}>{errors[field]}</Text>
      )}
    </View>
  );

  return (
    <KeyboardAvoidingView 
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-back" size={24} color="#2C3E50" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Update Student</Text>
        <View style={styles.headerRight} />
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.studentInfo}>
          <View style={styles.avatarContainer}>
            {student.img ? (
              <Image source={{ uri: student.img }} style={styles.avatar} />
            ) : (
              <Ionicons name="person" size={40} color="#4A90E2" />
            )}
          </View>
          <Text style={styles.studentName}>{student.fullname}</Text>
          <Text style={styles.studentEmail}>{student.email}</Text>
          {student.studentId && (
            <Text style={styles.studentId}>ID: {student.studentId}</Text>
          )}
        </View>

        <View style={styles.form}>
          {renderInput('fullname', 'Full Name *', 'Enter full name')}
          {renderInput('email', 'Email *', 'Enter email address', 'email-address')}
          {renderInput('phoneNumber', 'Phone Number', 'Enter phone number', 'phone-pad')}
          
          <View style={styles.inputContainer}>
            <Text style={styles.inputLabel}>Class *</Text>
            <Picker
              selectedValue={formData.class}
              onValueChange={(itemValue) => handleInputChange('class', itemValue)}
              style={styles.textInput}
            >
              <Picker.Item label="Select Class" value="" />
              {classes.map((c) => (
                <Picker.Item key={c._id} label={c.name} value={c._id} />
              ))}
            </Picker>
            {errors.class && (
              <Text style={styles.errorText}>{errors.class}</Text>
            )}
          </View>
          
          <View style={styles.inputContainer}>
            <Text style={styles.inputLabel}>Gender *</Text>
            <Picker
              selectedValue={formData.gender}
              onValueChange={(itemValue) => handleInputChange('gender', itemValue)}
              style={styles.textInput}
            >
              <Picker.Item label="Select Gender" value="" />
              <Picker.Item label="Male" value="male" />
              <Picker.Item label="Female" value="female" />
              <Picker.Item label="Other" value="other" />
            </Picker>
            {errors.gender && (
              <Text style={styles.errorText}>{errors.gender}</Text>
            )}
          </View>

          <View style={styles.inputContainer}>
            <Text style={styles.inputLabel}>Section *</Text>
            <TextInput
              style={[styles.textInput, styles.readOnlyInput]}
              value={formData.section}
              editable={false} // Make it non-editable
            />
            {errors.section && (
              <Text style={styles.errorText}>{errors.section}</Text>
            )}
          </View>
          
          {renderInput('rollNumber', 'Roll Number', 'Enter roll number', 'numeric')}

          {userType === 'admin' && (
            <>
              {renderInput('currentFee', 'Current Fee', 'Enter current fee', 'numeric')}
              {renderInput('futureFee', 'Future Fee', 'Enter future fee', 'numeric')}
            </>
          )}
        </View>
      </ScrollView>

      <View style={styles.footer}>
        <TouchableOpacity
          style={[styles.button, styles.cancelButton]}
          onPress={() => navigation.goBack()}
        >
          <Text style={styles.cancelButtonText}>Cancel</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.button, styles.updateButton]}
          onPress={handleUpdate}
          disabled={loading}
        >
          {loading ? (
            <ActivityIndicator color="#FFFFFF" />
          ) : (
            <>
              <Ionicons name="checkmark" size={16} color="#FFFFFF" />
              <Text style={styles.updateButtonText}>Update Student</Text>
            </>
          )}
        </TouchableOpacity>
      </View>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F7FA',
  },
  header: {
    backgroundColor: '#FFFFFF',
    paddingTop: 50,
    paddingHorizontal: 20,
    paddingBottom: 20,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 5,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#2C3E50',
  },
  headerRight: {
    width: 24,
  },
  content: {
    flex: 1,
    padding: 20,
    paddingBottom: 100, // Added padding to account for footer height
  },
  studentInfo: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 20,
    alignItems: 'center',
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 3,
  },
  avatarContainer: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#F8F9FA',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 15,
    borderWidth: 2,
    borderColor: '#E1E8ED',
  },
  avatar: {
    width: 80,
    height: 80,
    borderRadius: 40,
  },
  studentName: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#2C3E50',
    marginBottom: 5,
  },
  studentEmail: {
    fontSize: 14,
    color: '#7F8C8D',
    marginBottom: 5,
  },
  studentId: {
    fontSize: 12,
    fontWeight: '600',
    color: '#27AE60',
    backgroundColor: '#D5EDDA',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  form: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 3,
  },
  inputContainer: {
    marginBottom: 20,
  },
  inputLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: '#2C3E50',
    marginBottom: 8,
  },
  textInput: {
    borderWidth: 1,
    borderColor: '#E1E8ED',
    borderRadius: 8,
    paddingHorizontal: 15,
    paddingVertical: 12,
    fontSize: 16,
    color: '#2C3E50',
    backgroundColor: '#FFFFFF',
  },
  textArea: {
    height: 80,
    textAlignVertical: 'top',
  },
  readOnlyInput: {
    backgroundColor: '#F8F9FA',
    color: '#7F8C8D',
  },
  inputError: {
    borderColor: '#E74C3C',
  },
  errorText: {
    color: '#E74C3C',
    fontSize: 12,
    marginTop: 5,
  },
  infoText: {
    color: '#7F8C8D',
    fontSize: 12,
    marginTop: 5,
    fontStyle: 'italic',
  },
  footer: {
    flexDirection: 'row',
    padding: 20,
    gap: 15,
    backgroundColor: '#FFFFFF',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 5,
  },
  button: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 15,
    borderRadius: 8,
    gap: 8,
  },
  cancelButton: {
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#BDC3C7',
  },
  cancelButtonText: {
    color: '#7F8C8D',
    fontSize: 16,
    fontWeight: '600',
  },
  updateButton: {
    backgroundColor: '#4A90E2',
  },
  updateButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
});

export default UpdateStudentScreen;
