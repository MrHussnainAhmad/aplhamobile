import React, { useState, useEffect } from 'react';
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
import * as ImagePicker from 'expo-image-picker';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Ionicons } from '@expo/vector-icons';
import { API_BASE_URL } from '../../services/api';

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
  });
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPasswordSection, setShowPasswordSection] = useState(false);

  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    try {
      const token = await AsyncStorage.getItem('token');
      const response = await fetch(`${API_BASE_URL}/profile/student`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      if (response.ok) {
        const data = await response.json();
        setProfile(data.profile);
      } else {
        Alert.alert('Error', 'Failed to load profile');
      }
    } catch (error) {
      console.error('Error fetching profile:', error);
      Alert.alert('Error', 'Network error occurred');
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

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.8,
      allowsMultipleSelection: false,
    });

    if (!result.canceled && result.assets[0]) {
      const imageUri = result.assets[0].uri;
      uploadImage(imageUri);
    }
  };

  const uploadImage = async (imageUri) => {
    try {
      setSaving(true);
      const formData = new FormData();
      formData.append('image', {
        uri: imageUri,
        type: 'image/jpeg',
        name: 'profile.jpg',
      });

      const response = await fetch(`${API_BASE_URL}/upload-profile`, {
        method: 'POST',
        body: formData,
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      if (response.ok) {
        const data = await response.json();
        setProfile(prev => ({ ...prev, profileImage: data.imageUrl }));
        Alert.alert('Success', 'Profile image updated');
      } else {
        Alert.alert('Error', 'Failed to upload image');
      }
    } catch (error) {
      console.error('Error uploading image:', error);
      Alert.alert('Error', 'Failed to upload image');
    } finally {
      setSaving(false);
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
      const token = await AsyncStorage.getItem('token');
      
      const updateData = {
        name: profile.name,
        email: profile.email,
        phone: profile.phone,
        address: profile.address,
        fatherName: profile.fatherName,
        motherName: profile.motherName,
        dateOfBirth: profile.dateOfBirth,
        gender: profile.gender,
        profileImage: profile.profileImage,
      };

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
        <TouchableOpacity onPress={pickImage} style={styles.imageContainer}>
          {profile.profileImage ? (
            <Image source={{ uri: profile.profileImage }} style={styles.profileImage} />
          ) : (
            <View style={styles.placeholderImage}>
              <Text style={styles.placeholderText}>Tap to add photo</Text>
            </View>
          )}
        </TouchableOpacity>
      </View>

      {/* Academic Information */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Academic Information</Text>
        
        <View style={styles.inputGroup}>
          <Text style={styles.label}>Class</Text>
          <Text style={styles.readOnlyText}>{profile.class || 'Not assigned'}</Text>
        </View>

        <View style={styles.inputGroup}>
          <Text style={styles.label}>Section</Text>
          <Text style={styles.readOnlyText}>{profile.section || 'Not assigned'}</Text>
        </View>

        <View style={styles.inputGroup}>
          <Text style={styles.label}>Roll Number</Text>
          <Text style={styles.readOnlyText}>{profile.rollNumber || 'Not assigned'}</Text>
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
          <TextInput
            style={styles.input}
            value={profile.gender}
            onChangeText={(text) => setProfile(prev => ({ ...prev, gender: text }))}
            placeholder="Enter your gender"
          />
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
});

export default StudentProfileScreen;
