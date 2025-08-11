import React, { useState, useEffect, useCallback } from 'react';
import { useFocusEffect } from '@react-navigation/native';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  Image,
  StyleSheet,
  ScrollView,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { Picker } from '@react-native-picker/picker';
import * as ImagePicker from 'expo-image-picker';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Ionicons } from '@expo/vector-icons';
import { API_BASE_URL, userAPI } from '../../services/api';
import VerifiedBadge from '../../components/VerifiedBadge';
import { storage } from '../../utils/storage';

const StudentProfileScreen = ({ navigation }) => {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [profile, setProfile] = useState({
    studentId: '',
    name: '',
    email: '',
    phone: '',
    address: '',
    fatherName: '',
    motherName: '',
    dateOfBirth: '',
    gender: '',
    profileImage: '',
    class: '', // Will store the class ID (_id)
    section: '',
    rollNumber: '',
    isVerified: false,
    currentFee: 0,
    futureFee: 0,
    hasClassAndSectionSet: false,
  });
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPasswordSection, setShowPasswordSection] = useState(false);
  const [availableClasses, setAvailableClasses] = useState([]);
  const [showClassSectionWarning, setShowClassSectionWarning] = useState(false);
  const [grades, setGrades] = useState([]);

  // useFocusEffect ensures data is fetched every time the screen is focused
  useFocusEffect(
    useCallback(() => {
      const initializeProfile = async () => {
        setLoading(true);
        // FIX: Chained async calls to prevent race condition.
        // First, fetch the available classes and wait for the result.
        const classes = await fetchAvailableClasses();
        // Then, pass the fetched classes directly to fetchProfile.
        if (classes) {
          fetchProfile(classes);
        } else {
          // Handle case where classes could not be fetched
          setLoading(false);
          Alert.alert("Error", "Could not load class information. Please try again later.");
        }
      };
      initializeProfile();
    }, [])
  );

  // FIX: Modified to return the fetched classes data.
  const fetchAvailableClasses = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/classes/public`);
      if (response.ok) {
        const data = await response.json();
        setAvailableClasses(data.classes);
        return data.classes; // Return data for chaining
      } else {
        console.error('Failed to fetch available classes');
        return null;
      }
    } catch (error) {
      console.error('Error fetching available classes:', error);
      Alert.alert('Error', 'Network error occurred while fetching classes.');
      return null;
    }
  };
  
  // FIX: Modified to accept the list of classes as a parameter.
  const fetchProfile = async (classes) => {
    try {
      const token = await AsyncStorage.getItem('userToken');
      if (!token) {
        Alert.alert('Error', 'Authentication token not found. Please login again.');
        navigation.replace('Login');
        return;
      }
      const url = `${API_BASE_URL}/profile/student`;
      const response = await fetch(url, {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (response.ok) {
        const data = await response.json();
        const studentData = data.profile;

        // Find the class ID using the classNumber and section from the profile data
        const assignedClass = classes.find(
          (cls) => cls.classNumber === studentData.classNumber && cls.section === studentData.section
        );

        setProfile({
          ...studentData,
          class: assignedClass ? assignedClass._id : '', // Set the class ID
          section: studentData.section || '',
          isVerified: studentData.isVerified || false,
          hasClassAndSectionSet: studentData.hasClassAndSectionSet || false,
        });

        if (!studentData.hasClassAndSectionSet) {
          setShowClassSectionWarning(true);
        }

      } else {
        const errorData = await response.json();
        Alert.alert('Error', errorData.message || 'Failed to load profile');
      }
    } catch (error) {
      console.error('Error fetching profile:', error);
      Alert.alert('Error', 'Network error occurred while fetching your profile.');
    } finally {
      setLoading(false);
    }
  };

  const pickImage = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert('Permission Needed', 'Please grant camera roll permissions to continue');
      return;
    }

    let result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.5,
      base64: true,
    });

    if (!result.canceled && result.assets && result.assets[0]) {
      const selectedImage = result.assets[0];
      setProfile(prev => ({
        ...prev,
        profileImage: selectedImage.uri,
        profileImageBase64: selectedImage.base64,
        profileImageType: selectedImage.mimeType,
      }));
    }
  };

  const handleSave = async () => {
    if (showPasswordSection) {
      if (password !== confirmPassword) {
        Alert.alert('Error', 'Passwords do not match');
        return;
      }
      if (password && password.length < 6) {
        Alert.alert('Error', 'Password must be at least 6 characters');
        return;
      }
    }

    // Ensure class and section are selected if they haven't been set before
    if (!profile.hasClassAndSectionSet && !profile.class) {
      Alert.alert('Error', 'Please select your class and section.');
      return;
    }

    try {
      setSaving(true);
      const token = await AsyncStorage.getItem('userToken');
      
      const updateData = {
        name: profile.name,
        email: profile.email,
        phone: profile.phone,
        address: profile.address,
        fatherName: profile.fatherName,
        motherName: profile.motherName,
        dateOfBirth: profile.dateOfBirth,
        gender: profile.gender,
        rollNumber: profile.rollNumber,
        classId: profile.class, // Send the selected class ID
        section: profile.section, // Send the section as well
      };

      if (profile.profileImageBase64 && profile.profileImageType) {
        updateData.profileImageBase64 = profile.profileImageBase64;
        updateData.profileImageType = profile.profileImageType;
      }

      if (showPasswordSection && password) {
        updateData.password = password;
      }

      const response = await fetch(`${API_BASE_URL}/profile/student`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(updateData),
      });

      if (response.ok) {
        const responseData = await response.json();
        Alert.alert('Success', 'Profile updated successfully');
        setPassword('');
        setConfirmPassword('');
        setShowPasswordSection(false);
        setProfile(prev => ({ ...prev, profileImageBase64: null, profileImageType: null }));
        
        // Update stored user data with the new profile information
        try {
          const { userData: currentUserData } = await storage.getUserData();
          const updatedUserData = {
            ...currentUserData,
            studentId: responseData.profile.studentId,
            fullname: responseData.profile.name,
            email: responseData.profile.email,
            phoneNumber: responseData.profile.phone,
            address: responseData.profile.address,
            fathername: responseData.profile.fatherName,
            mothername: responseData.profile.motherName,
            dob: responseData.profile.dateOfBirth,
            gender: responseData.profile.gender,
            profilePicture: responseData.profile.profileImage,
            class: responseData.profile.class,
            section: responseData.profile.section,
            rollNumber: responseData.profile.rollNumber,
            hasClassAndSectionSet: responseData.profile.hasClassAndSectionSet
          };
          await storage.updateUserData(updatedUserData);
        } catch (error) {
          console.error('Error updating stored user data:', error);
        }
        
        // Re-initialize to get the latest state from the server
        const classes = await fetchAvailableClasses();
        if(classes) fetchProfile(classes);
      } else {
        const error = await response.json();
        Alert.alert('Error', error.message || 'Failed to update profile');
      }
    } catch (error) {
      console.error('Error updating profile:', error);
      Alert.alert('Error', 'An unexpected error occurred.');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#007bff" />
        <Text style={styles.loadingText}>Loading Profile...</Text>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-back" size={24} color="#fff" />
        </TouchableOpacity>
        <Text style={styles.title}>My Profile</Text>
        <View style={styles.backButton} />
      </View>

      <View style={styles.imageSection}>
        <View style={styles.verificationContainer}>
          <VerifiedBadge isVerified={profile.isVerified} size="large" />
        </View>
        {profile.studentId && <Text style={styles.studentIdText}>Student ID: {profile.studentId}</Text>}
        <TouchableOpacity onPress={pickImage} style={styles.imageContainer}>
          <Image 
            source={profile.profileImage ? { uri: profile.profileImage } : require('../../../assets/images/student.png')} 
            style={styles.profileImage} 
          />
        </TouchableOpacity>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Academic Information</Text>
        
        {showClassSectionWarning && !profile.hasClassAndSectionSet && (
          <Text style={styles.warningText}>
            Please select your class and section carefully. This can only be set once.
          </Text>
        )}

        {/* FIX: Combined Class and Section handling */}
        <View style={styles.inputGroup}>
          <Text style={styles.label}>Class & Section</Text>
          {profile.hasClassAndSectionSet ? (
            <Text style={styles.readOnlyText}>
              {(() => {
                // FIX: Correct syntax and simplified logic
                const classObj = availableClasses.find(cls => cls._id === profile.class);
                return classObj ? `${classObj.classNumber} - ${classObj.section}` : 'Not Assigned';
              })()}
            </Text>
          ) : (
            <View style={[styles.pickerContainer, styles.pickerContainerActive]}>
              <Picker
                selectedValue={profile.class}
                onValueChange={(itemValue) => {
                  // FIX: Set both class ID and section string from the selected item
                  const selectedClass = availableClasses.find(cls => cls._id === itemValue);
                  if (selectedClass) {
                    setProfile(prev => ({ 
                      ...prev, 
                      class: selectedClass._id, 
                      section: selectedClass.section 
                    }));
                  } else {
                     setProfile(prev => ({ ...prev, class: '', section: '' }));
                  }
                }}
                style={styles.pickerInput}
                enabled={!profile.hasClassAndSectionSet}
              >
                <Picker.Item label="Select Class..." value="" />
                {availableClasses.map((cls) => (
                  <Picker.Item key={cls._id} label={`${cls.classNumber} - ${cls.section}`} value={cls._id} />
                ))}
              </Picker>
              <Ionicons name="chevron-down" size={24} color={"#007bff"} style={styles.pickerIcon} />
            </View>
          )}
        </View>

        {/* The Section is now derived from the Class Picker, so we just display it */}
        <View style={styles.inputGroup}>
          <Text style={styles.label}>Section</Text>
          <Text style={styles.readOnlyText}>
            {profile.section || 'Not selected'}
          </Text>
        </View>

        <View style={styles.inputGroup}>
          <Text style={styles.label}>Roll Number</Text>
          <TextInput
            style={[styles.input, profile.rollNumber && styles.readOnlyInput]}
            value={profile.rollNumber}
            onChangeText={(text) => setProfile(prev => ({ ...prev, rollNumber: text }))}
            placeholder="Enter your roll number"
            keyboardType="numeric"
            editable={!profile.rollNumber}
          />
        </View>

        <View style={styles.inputGroup}>
          <Text style={styles.label}>Current Fee</Text>
          <Text style={styles.readOnlyText}>Rs. {profile.currentFee || '0'}</Text>
        </View>

        <View style={styles.inputGroup}>
          <Text style={styles.label}>Future Fee</Text>
          <Text style={styles.readOnlyText}>Rs. {profile.futureFee || '0'}</Text>
        </View>

        
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Basic Information</Text>
        <View style={styles.inputGroup}>
          <Text style={styles.label}>Name</Text>
          <TextInput style={styles.input} value={profile.name} onChangeText={(text) => setProfile(prev => ({ ...prev, name: text }))} placeholder="Enter your name" />
        </View>
        <View style={styles.inputGroup}>
          <Text style={styles.label}>Email</Text>
          <TextInput style={styles.input} value={profile.email} onChangeText={(text) => setProfile(prev => ({ ...prev, email: text }))} placeholder="Enter your email" keyboardType="email-address" autoCapitalize="none" />
        </View>
        <View style={styles.inputGroup}>
          <Text style={styles.label}>Phone</Text>
          <TextInput style={styles.input} value={profile.phone} onChangeText={(text) => setProfile(prev => ({ ...prev, phone: text }))} placeholder="Enter your phone number" keyboardType="phone-pad" />
        </View>
        <View style={styles.inputGroup}>
          <Text style={styles.label}>Address</Text>
          <TextInput style={[styles.input, styles.textArea]} value={profile.address} onChangeText={(text) => setProfile(prev => ({ ...prev, address: text }))} placeholder="Enter your address" multiline numberOfLines={3} />
        </View>
        <View style={styles.inputGroup}>
          <Text style={styles.label}>Date of Birth</Text>
          <TextInput style={styles.input} value={profile.dateOfBirth} onChangeText={(text) => setProfile(prev => ({ ...prev, dateOfBirth: text }))} placeholder="DD/MM/YYYY" />
        </View>
        <View style={styles.inputGroup}>
          <Text style={styles.label}>Gender</Text>
          <Picker selectedValue={profile.gender} onValueChange={(itemValue) => setProfile(prev => ({ ...prev, gender: itemValue }))} style={styles.input}>
            <Picker.Item label="Select Gender" value="" />
            <Picker.Item label="Male" value="male" />
            <Picker.Item label="Female" value="female" />
            <Picker.Item label="Other" value="other" />
          </Picker>
        </View>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Family Information</Text>
        <View style={styles.inputGroup}>
          <Text style={styles.label}>Father's Name</Text>
          <TextInput style={styles.input} value={profile.fatherName} onChangeText={(text) => setProfile(prev => ({ ...prev, fatherName: text }))} placeholder="Enter father's name" />
        </View>
        <View style={styles.inputGroup}>
          <Text style={styles.label}>Mother's Name</Text>
          <TextInput style={styles.input} value={profile.motherName} onChangeText={(text) => setProfile(prev => ({ ...prev, motherName: text }))} placeholder="Enter mother's name" />
        </View>
      </View>

      <View style={styles.section}>
        <TouchableOpacity style={styles.passwordToggle} onPress={() => setShowPasswordSection(!showPasswordSection)}>
          <Text style={styles.passwordToggleText}>{showPasswordSection ? 'Hide' : 'Change Password'}</Text>
        </TouchableOpacity>
        {showPasswordSection && (
          <>
            <View style={styles.inputGroup}>
              <Text style={styles.label}>New Password</Text>
              <TextInput style={styles.input} value={password} onChangeText={setPassword} placeholder="Enter new password" secureTextEntry />
            </View>
            <View style={styles.inputGroup}>
              <Text style={styles.label}>Confirm Password</Text>
              <TextInput style={styles.input} value={confirmPassword} onChangeText={setConfirmPassword} placeholder="Confirm new password" secureTextEntry />
            </View>
          </>
        )}
      </View>

      <TouchableOpacity style={[styles.saveButton, saving && styles.saveButtonDisabled]} onPress={handleSave} disabled={saving}>
        {saving ? <ActivityIndicator color="#fff" /> : <Text style={styles.saveButtonText}>Save Changes</Text>}
      </TouchableOpacity>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f9fa',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f8f9fa',
  },
  loadingText: {
    marginTop: 10,
    fontSize: 16,
    color: '#666',
  },
  header: {
    backgroundColor: '#007bff',
    padding: 20,
    paddingTop: 60,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  backButton: {
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#fff',
    flex: 1,
    textAlign: 'center',
  },
  imageSection: {
    alignItems: 'center',
    paddingVertical: 20,
    backgroundColor: '#fff',
    marginBottom: 10,
  },
  imageContainer: {
    position: 'relative',
  },
  verificationContainer: {
    marginBottom: 10,
  },
  studentIdText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#007bff',
    marginBottom: 15,
  },
  profileImage: {
    width: 120,
    height: 120,
    borderRadius: 60,
    borderWidth: 3,
    borderColor: '#007bff',
  },
  section: {
    backgroundColor: '#fff',
    padding: 20,
    marginBottom: 10,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 15,
  },
  inputGroup: {
    marginBottom: 15,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
    marginBottom: 5,
  },
  input: {
    borderWidth: 1,
    borderColor: '#dee2e6',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    backgroundColor: '#fff',
  },
  readOnlyInput: {
    backgroundColor: '#f8f9fa',
    color: '#6c757d',
  },
  textArea: {
    height: 80,
    textAlignVertical: 'top',
  },
  readOnlyText: {
    fontSize: 16,
    color: '#495057',
    backgroundColor: '#f8f9fa',
    padding: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#dee2e6',
    minHeight: 50,
    textAlignVertical: 'center',
  },
  pickerContainer: {
    position: 'relative',
    borderWidth: 2,
    borderColor: '#e9ecef',
    borderRadius: 12,
    backgroundColor: '#f8f9fa',
  },
  pickerContainerActive: {
    borderColor: '#007bff',
    backgroundColor: '#fff',
  },
  pickerInput: {
    height: 50,
    fontSize: 16,
    color: '#333',
    paddingHorizontal: 15,
  },
  pickerIcon: {
    position: 'absolute',
    right: 15,
    top: 13,
    zIndex: -1, // Place behind picker on Android
  },
  passwordToggle: {
    backgroundColor: '#007bff',
    padding: 12,
    borderRadius: 8,
    alignItems: 'center',
    marginBottom: 15,
  },
  passwordToggleText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  saveButton: {
    backgroundColor: '#28a745',
    padding: 15,
    borderRadius: 8,
    margin: 20,
    alignItems: 'center',
  },
  saveButtonDisabled: {
    backgroundColor: '#6c757d',
  },
  saveButtonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
  },
  warningText: {
    color: '#dc3545',
    backgroundColor: '#f8d7da',
    borderColor: '#f5c6cb',
    borderWidth: 1,
    borderRadius: 8,
    padding: 10,
    fontSize: 14,
    textAlign: 'center',
    marginBottom: 15,
    fontWeight: 'bold',
  },
  button: {
    backgroundColor: '#007bff',
    padding: 15,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 10,
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
});

export default StudentProfileScreen;