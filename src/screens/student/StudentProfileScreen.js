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
import { API_BASE_URL } from '../../services/api';
import VerifiedBadge from '../../components/VerifiedBadge';

const StudentProfileScreen = ({ navigation }) => {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [profile, setProfile] = useState({
    name: '',
    email: '',
    phone: '',
    address: '',
    fatherName: '',
    motherName: '',
    dateOfBirth: '',
    gender: '',
    profileImage: '',
    class: '',
    section: '',
    rollNumber: '',
    isVerified: false,
    currentFee: 0,
    futureFee: 0,
    hasClassAndSectionSet: false, // New state for one-time setting
  });
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPasswordSection, setShowPasswordSection] = useState(false);
  const [availableClasses, setAvailableClasses] = useState([]); // New state for available classes
  const [showClassSectionWarning, setShowClassSectionWarning] = useState(false); // New state for warning

  useFocusEffect(
    useCallback(() => {
      fetchProfile();
      fetchAvailableClasses(); // Fetch available classes when screen focuses
    }, [])
  );

  const fetchProfile = async () => {
    try {
      const token = await AsyncStorage.getItem('userToken');
      console.log('StudentProfileScreen: Fetched token:', token ? 'Exists' : 'Does not exist');
      if (!token) {
        Alert.alert('Error', 'Authentication token not found. Please login again.');
        navigation.replace('Login');
        return;
      }
      const url = `${API_BASE_URL}/profile/student`;
      console.log('StudentProfileScreen: Fetching from URL:', url);
      const response = await fetch(url, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      console.log('StudentProfileScreen: Response status:', response.status);
      console.log('StudentProfileScreen: Response OK:', response.ok);

      if (response.ok) {
        const data = await response.json();
        console.log('StudentProfileScreen: Received data:', data);
        setProfile({
          ...data.profile,
          isVerified: data.profile.isVerified || false,
          hasClassAndSectionSet: data.profile.hasClassAndSectionSet || false, // Set from backend
        });
      } else {
        const errorData = await response.json();
        console.error('StudentProfileScreen: Error response data:', errorData);
        Alert.alert('Error', errorData.message || 'Failed to load profile');
      }
    } catch (error) {
      console.error('StudentProfileScreen: Error fetching profile:', error);
      Alert.alert('Error', 'Network error occurred');
    } finally {
      setLoading(false);
    }
  };

  const fetchAvailableClasses = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/classes/public`);
      if (response.ok) {
        const data = await response.json();
        setAvailableClasses(data.classes);
      } else {
        console.error('Failed to fetch available classes');
      }
    } catch (error) {
      console.error('Error fetching available classes:', error);
    }
  };

  const pickImage = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert('Permission Needed', 'Please grant camera roll permissions to continue');
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.5,
      base64: true, // Request base64 directly
    });

    if (!result.canceled && result.assets[0]) {
      const selectedImage = result.assets[0];
      setProfile(prev => ({
        ...prev,
        profileImage: selectedImage.uri, // For local display
        profileImageBase64: selectedImage.base64, // For sending to backend
        profileImageType: selectedImage.mimeType, // For sending to backend
      }));
    }
  };

  const handleSave = async () => {
    if (showPasswordSection && password !== confirmPassword) {
      Alert.alert('Error', 'Passwords do not match');
      return;
    }

    if (showPasswordSection && password.length < 6) {
      Alert.alert('Error', 'Password must be at least 6 characters');
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
        classId: profile.class, // Send class ID to backend
        section: profile.section, // Send section to backend
      };

      // Only include image data if a new image was picked
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
        Alert.alert('Success', 'Profile updated successfully');
        setPassword('');
        setConfirmPassword('');
        setShowPasswordSection(false);
        // Clear base64 data after successful upload to prevent re-upload on next save
        setProfile(prev => ({ ...prev, profileImageBase64: null, profileImageType: null }));
        fetchProfile(); // Re-fetch profile to get updated hasClassAndSectionSet status
      } else {
        const error = await response.json();
        Alert.alert('Error', error.message || 'Failed to update profile');
      }
    } catch (error) {
      console.error('Error updating profile:', error);
      Alert.alert('Error', 'Network error occurred');
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
        <TouchableOpacity 
          style={styles.backButton} 
          onPress={() => navigation.goBack()}
        >
          <Ionicons name="arrow-back" size={24} color="#fff" />
        </TouchableOpacity>
        <Text style={styles.title}>My Profile</Text>
        <View style={styles.backButton} />
      </View>

      {/* Profile Image */}
      <View style={styles.imageSection}>
        {/* Verification Badge */}
        <View style={styles.verificationContainer}>
          <VerifiedBadge isVerified={profile.isVerified} size="large" />
        </View>
        <TouchableOpacity onPress={pickImage} style={styles.imageContainer}>
          {profile.profileImage ? (
            <Image source={{ uri: profile.profileImage }} style={styles.profileImage} />
          ) : (
            <Image source={require('../../../assets/images/student.png')} style={styles.profileImage} />
          )}
        </TouchableOpacity>
      </View>

      {/* Academic Information */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Academic Information</Text>
        
        {showClassSectionWarning && (
          <Text style={styles.warningText}>
            Changing Class or section or For any fun making change in profile page can lead to punishment and fine.
          </Text>
        )}

        <View style={styles.inputGroup}>
          <Text style={styles.label}>Class</Text>
          {profile.hasClassAndSectionSet ? (
            <Text style={styles.readOnlyText}>
              {(() => {
                const classObj = availableClasses.find(cls => cls._id === profile.class);
                return `${classObj?.classNumber || 'Not assigned'} - ${profile.section || 'Not assigned'}`;
              })()}
            </Text>
          ) : (
            <View style={[styles.pickerContainer, !profile.hasClassAndSectionSet && styles.pickerContainerActive]}>
              <Picker
                selectedValue={profile.class}
                onValueChange={(itemValue) => {
                  if (profile.hasClassAndSectionSet) {
                    setShowClassSectionWarning(true);
                    Alert.alert(
                      'Warning',
                      'Changing Class or section or For any fun making change in profile page can lead to punishment and fine.',
                      [{ text: 'OK', onPress: () => setShowClassSectionWarning(false) }]
                    );
                  } else {
                    setProfile(prev => ({ ...prev, class: itemValue }));
                  }
                }}
                style={styles.pickerInput}
                enabled={!profile.hasClassAndSectionSet} // Disable if already set
              >
                <Picker.Item label="Select Class" value="" />
                {availableClasses.map((cls) => (
                  <Picker.Item key={cls._id} label={`${cls.classNumber} - ${cls.section}`} value={cls._id} />
                ))}
              </Picker>
              <Ionicons name="chevron-down" size={24} color={profile.hasClassAndSectionSet ? "#ccc" : "#007bff"} style={styles.pickerIcon} />
            </View>
          )}
        </View>

        <View style={styles.inputGroup}>
          <Text style={styles.label}>Section</Text>
          {profile.hasClassAndSectionSet ? (
            <Text style={styles.readOnlyText}>
              {(() => {
                const sectionToProcess = (profile.section || '').trim();
                const displayedSection = sectionToProcess === 'select' ? 'Boys' : sectionToProcess || 'Not assigned';
                console.log('DEBUG: profile.section:', profile.section);
                console.log('DEBUG: sectionToProcess:', sectionToProcess);
                console.log('DEBUG: displayedSection (Section):', displayedSection);
                return displayedSection;
              })()}
            </Text>
          ) : (
            <View style={[styles.pickerContainer, !profile.hasClassAndSectionSet && styles.pickerContainerActive]}>
              <Picker
                selectedValue={profile.section}
                onValueChange={(itemValue) => {
                  if (profile.hasClassAndSectionSet) {
                    setShowClassSectionWarning(true);
                    Alert.alert(
                      'Warning',
                      'Changing Class or section or For any fun making change in profile page can lead to punishment and fine.',
                      [{ text: 'OK', onPress: () => setShowClassSectionWarning(false) }]
                    );
                  } else {
                    setProfile(prev => ({ ...prev, section: itemValue }));
                  }
                }}
                style={styles.pickerInput}
                enabled={!profile.hasClassAndSectionSet} // Disable if already set
              >
                <Picker.Item label="Select Section" value="" />
                {/* Filter sections based on selected class if needed, or list all unique sections */}
                {availableClasses.filter(cls => cls._id === profile.class).flatMap(cls => cls.section).filter((value, index, self) => self.indexOf(value) === index).map((sec) => (
                  <Picker.Item key={sec} label={sec} value={sec} />
                ))}
              </Picker>
              <Ionicons name="chevron-down" size={24} color={profile.hasClassAndSectionSet ? "#ccc" : "#007bff"} style={styles.pickerIcon} />
            </View>
          )}
        </View>

        <View style={styles.inputGroup}>
          <Text style={styles.label}>Roll Number</Text>
          <TextInput
            style={[styles.input, profile.rollNumber && styles.readOnlyInput]}
            value={profile.rollNumber}
            onChangeText={(text) => setProfile(prev => ({ ...prev, rollNumber: text }))}
            placeholder="Enter your roll number"
            keyboardType="numeric"
            editable={!profile.rollNumber} // Editable only if rollNumber is not set
          />
        </View>

        <View style={styles.inputGroup}>
          <Text style={styles.label}>Current Fee</Text>
          <Text style={styles.readOnlyText}>{profile.currentFee || 'Not set'}</Text>
        </View>

        <View style={styles.inputGroup}>
          <Text style={styles.label}>Future Fee</Text>
          <Text style={styles.readOnlyText}>{profile.futureFee || 'Not set'}</Text>
        </View>
      </View>

      {/* Basic Information */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Basic Information</Text>
        
        <View style={styles.inputGroup}>
          <Text style={styles.label}>Name</Text>
          <TextInput
            style={styles.input}
            value={profile.name}
            onChangeText={(text) => setProfile(prev => ({ ...prev, name: text }))}
            placeholder="Enter your name"
          />
        </View>

        <View style={styles.inputGroup}>
          <Text style={styles.label}>Email</Text>
          <TextInput
            style={styles.input}
            value={profile.email}
            onChangeText={(text) => setProfile(prev => ({ ...prev, email: text }))}
            placeholder="Enter your email"
            keyboardType="email-address"
            autoCapitalize="none"
          />
        </View>

        <View style={styles.inputGroup}>
          <Text style={styles.label}>Phone</Text>
          <TextInput
            style={styles.input}
            value={profile.phone}
            onChangeText={(text) => setProfile(prev => ({ ...prev, phone: text }))}
            placeholder="Enter your phone number"
            keyboardType="phone-pad"
          />
        </View>

        <View style={styles.inputGroup}>
          <Text style={styles.label}>Address</Text>
          <TextInput
            style={[styles.input, styles.textArea]}
            value={profile.address}
            onChangeText={(text) => setProfile(prev => ({ ...prev, address: text }))}
            placeholder="Enter your address"
            multiline
            numberOfLines={3}
          />
        </View>

        <View style={styles.inputGroup}>
          <Text style={styles.label}>Date of Birth</Text>
          <TextInput
            style={styles.input}
            value={profile.dateOfBirth}
            onChangeText={(text) => setProfile(prev => ({ ...prev, dateOfBirth: text }))}
            placeholder="DD/MM/YYYY"
          />
        </View>

        <View style={styles.inputGroup}>
          <Text style={styles.label}>Gender</Text>
          <Picker
            selectedValue={profile.gender}
            onValueChange={(itemValue) => {
              setProfile(prev => ({
                ...prev,
                gender: itemValue,
                // Section is no longer derived from gender here, it's selected from available classes
              }));
            }}
            style={styles.input}
          >
            <Picker.Item label="Select Gender" value="" />
            <Picker.Item label="Male" value="male" />
            <Picker.Item label="Female" value="female" />
            <Picker.Item label="Other" value="other" />
          </Picker>
        </View>
      </View>

      {/* Family Information */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Family Information</Text>
        
        <View style={styles.inputGroup}>
          <Text style={styles.label}>Father's Name</Text>
          <TextInput
            style={styles.input}
            value={profile.fatherName}
            onChangeText={(text) => setProfile(prev => ({ ...prev, fatherName: text }))}
            placeholder="Enter father's name"
          />
        </View>

        <View style={styles.inputGroup}>
          <Text style={styles.label}>Mother's Name</Text>
          <TextInput
            style={styles.input}
            value={profile.motherName}
            onChangeText={(text) => setProfile(prev => ({ ...prev, motherName: text }))}
            placeholder="Enter mother's name"
          />
        </View>
      </View>

      {/* Change Password Section */}
      <View style={styles.section}>
        <TouchableOpacity 
          style={styles.passwordToggle}
          onPress={() => setShowPasswordSection(!showPasswordSection)}
        >
          <Text style={styles.passwordToggleText}>
            {showPasswordSection ? 'Hide' : 'Change Password'}
          </Text>
        </TouchableOpacity>

        {showPasswordSection && (
          <>
            <View style={styles.inputGroup}>
              <Text style={styles.label}>New Password</Text>
              <TextInput
                style={styles.input}
                value={password}
                onChangeText={setPassword}
                placeholder="Enter new password"
                secureTextEntry
              />
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.label}>Confirm Password</Text>
              <TextInput
                style={styles.input}
                value={confirmPassword}
                onChangeText={setConfirmPassword}
                placeholder="Confirm new password"
                secureTextEntry
              />
            </View>
          </>
        )}
      </View>

      {/* Save Button */}
      <TouchableOpacity 
        style={[styles.saveButton, saving && styles.saveButtonDisabled]}
        onPress={handleSave}
        disabled={saving}
      >
        {saving ? (
          <ActivityIndicator color="#fff" />
        ) : (
          <Text style={styles.saveButtonText}>Save Changes</Text>
        )}
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
  profileImage: {
    width: 120,
    height: 120,
    borderRadius: 60,
    borderWidth: 3,
    borderColor: '#007bff',
  },
  placeholderImage: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: '#e9ecef',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#dee2e6',
    borderStyle: 'dashed',
  },
  placeholderText: {
    color: '#6c757d',
    fontSize: 12,
    textAlign: 'center',
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
  },
  // Enhanced Picker Container Styles
  pickerContainer: {
    position: 'relative',
    borderWidth: 2,
    borderColor: '#e9ecef',
    borderRadius: 12,
    backgroundColor: '#f8f9fa',
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  pickerContainerActive: {
    borderColor: '#007bff',
    backgroundColor: '#fff',
    shadowColor: '#007bff',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  pickerInput: {
    height: 50,
    fontSize: 16,
    color: '#333',
    paddingHorizontal: 15,
    paddingRight: 45,
  },
  pickerIcon: {
    position: 'absolute',
    right: 15,
    top: 13,
    zIndex: 1,
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
    color: 'red',
    fontSize: 14,
    textAlign: 'center',
    marginBottom: 10,
    fontWeight: 'bold',
  },
});

export default StudentProfileScreen;