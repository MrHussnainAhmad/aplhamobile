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
  Image,
  Platform,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import { adminAPI } from '../services/api';

const ManageAppScreen = ({ navigation }) => {
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [appConfig, setAppConfig] = useState({
    collegeName: '',
    logoUrl: '',
    localLogo: null, // For storing selected local image
  });

  const [formData, setFormData] = useState({
    collegeName: '',
  });

  useEffect(() => {
    loadAppConfig();
    requestPermissions();
  }, []);

  const requestPermissions = async () => {
    if (Platform.OS !== 'web') {
      const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert('Permission Required', 'Sorry, we need camera roll permissions to change the logo.');
      }
    }
  };

  const loadAppConfig = async () => {
    try {
      setLoading(true);
      const response = await adminAPI.getAppConfig();
      const config = response.data.config;
      setAppConfig(config);
      setFormData({
        collegeName: config.collegeName || '',
      });
    } catch (error) {
      console.error('Error loading app config:', error);
      // Set default values if config doesn't exist
      setAppConfig({
        collegeName: 'Your College Name',
        logoUrl: '',
        localLogo: null,
      });
      setFormData({
        collegeName: 'Your College Name',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const pickImage = async () => {
    try {
      // Check permissions first
      const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert('Permission Required', 'Sorry, we need camera roll permissions to change the logo.');
        return;
      }

      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions?.Images || 'Images', // Fallback to string
        allowsEditing: true,
        aspect: [1, 1], // Square aspect ratio for logo
        quality: 0.8,
        base64: true,
      });

      if (!result.canceled && result.assets && result.assets[0]) {
        const asset = result.assets[0];
        setAppConfig(prev => ({
          ...prev,
          localLogo: {
            uri: asset.uri,
            base64: asset.base64,
            type: asset.mimeType || 'image/jpeg',
          }
        }));
      }
    } catch (error) {
      console.error('Error picking image:', error);
      Alert.alert('Error', `Failed to select image: ${error.message || 'Unknown error'}`);
    }
  };

  const handleSave = async () => {
    if (!formData.collegeName.trim()) {
      Alert.alert('Validation Error', 'College name is required');
      return;
    }

    setSaving(true);
    
    try {
      const updateData = {
        collegeName: formData.collegeName.trim(),
      };

      // If a new logo was selected, include it in the update
      if (appConfig.localLogo) {
        updateData.logoBase64 = appConfig.localLogo.base64;
        updateData.logoType = appConfig.localLogo.type;
      }

      await adminAPI.updateAppConfig(updateData);

      Alert.alert('Success', 'App configuration updated successfully!', [
        {
          text: 'OK',
          onPress: () => {
            // Refresh the configuration
            loadAppConfig();
          },
        },
      ]);
    } catch (error) {
      console.error('Error updating app config:', error);
      Alert.alert('Error', error.response?.data?.message || 'Failed to update app configuration');
    } finally {
      setSaving(false);
    }
  };

  const resetToDefaults = () => {
    Alert.alert(
      'Reset to Defaults',
      'Are you sure you want to reset to default configuration? This will remove the custom logo and reset the college name.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Reset',
          style: 'destructive',
          onPress: async () => {
            try {
              await adminAPI.resetAppConfig();
              Alert.alert('Success', 'App configuration reset to defaults');
              loadAppConfig();
            } catch (error) {
              Alert.alert('Error', 'Failed to reset configuration');
            }
          },
        },
      ]
    );
  };

  const renderLogoPreview = () => {
    const logoSource = appConfig.localLogo 
      ? { uri: appConfig.localLogo.uri }
      : appConfig.logoUrl 
      ? { uri: appConfig.logoUrl }
      : null;

    return (
      <View style={styles.logoPreviewContainer}>
        <Text style={styles.sectionTitle}>App Logo</Text>
        <View style={styles.logoPreview}>
          {logoSource ? (
            <Image source={logoSource} style={styles.logoImage} />
          ) : (
            <View style={styles.placeholderLogo}>
              <Ionicons name="school" size={40} color="#BDC3C7" />
              <Text style={styles.placeholderText}>No Logo</Text>
            </View>
          )}
        </View>
        <TouchableOpacity style={styles.changeLogoButton} onPress={pickImage}>
          <Ionicons name="camera" size={16} color="#FFFFFF" />
          <Text style={styles.changeLogoText}>Change Logo</Text>
        </TouchableOpacity>
      </View>
    );
  };

  const renderSplashPreview = () => (
    <View style={styles.previewContainer}>
      <Text style={styles.sectionTitle}>Splash Screen Preview</Text>
      <View style={styles.splashPreview}>
        <View style={styles.splashContent}>
          {appConfig.localLogo ? (
            <Image source={{ uri: appConfig.localLogo.uri }} style={styles.previewLogo} />
          ) : appConfig.logoUrl ? (
            <Image source={{ uri: appConfig.logoUrl }} style={styles.previewLogo} />
          ) : (
            <View style={styles.previewPlaceholder}>
              <Ionicons name="school" size={50} color="#4A90E2" />
            </View>
          )}
          <Text style={styles.previewCollegeName}>
            {formData.collegeName || 'Your College Name'}
          </Text>
        </View>
      </View>
    </View>
  );

  if (loading) {
    return (
      <View style={[styles.container, styles.centerContent]}>
        <ActivityIndicator size="large" color="#4A90E2" />
        <Text style={styles.loadingText}>Loading app configuration...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-back" size={24} color="#2C3E50" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Manage App</Text>
        <TouchableOpacity onPress={resetToDefaults}>
          <Ionicons name="refresh" size={24} color="#E74C3C" />
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {renderSplashPreview()}
        
        {renderLogoPreview()}

        <View style={styles.formSection}>
          <Text style={styles.sectionTitle}>College Information</Text>
          
          <View style={styles.inputContainer}>
            <Text style={styles.inputLabel}>College Name *</Text>
            <TextInput
              style={styles.textInput}
              value={formData.collegeName}
              onChangeText={(value) => handleInputChange('collegeName', value)}
              placeholder="Enter college name"
              placeholderTextColor="#95A5A6"
              maxLength={50}
            />
            <Text style={styles.helperText}>
              This will appear on the splash screen
            </Text>
          </View>
        </View>

        <View style={styles.infoSection}>
          <View style={styles.infoCard}>
            <Ionicons name="information-circle" size={20} color="#4A90E2" />
            <Text style={styles.infoText}>
              Changes will be applied immediately. The splash screen appears for 3 seconds when users open the app.
            </Text>
          </View>
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
          style={[styles.button, styles.saveButton]}
          onPress={handleSave}
          disabled={saving}
        >
          {saving ? (
            <ActivityIndicator color="#FFFFFF" />
          ) : (
            <>
              <Ionicons name="checkmark" size={16} color="#FFFFFF" />
              <Text style={styles.saveButtonText}>Save Changes</Text>
            </>
          )}
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F7FA',
  },
  centerContent: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 10,
    fontSize: 16,
    color: '#7F8C8D',
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
  content: {
    flex: 1,
    padding: 20,
  },
  previewContainer: {
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#2C3E50',
    marginBottom: 15,
  },
  splashPreview: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 40,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 3,
    minHeight: 200,
    justifyContent: 'center',
  },
  splashContent: {
    alignItems: 'center',
  },
  previewLogo: {
    width: 80,
    height: 80,
    borderRadius: 40,
    marginBottom: 20,
  },
  previewPlaceholder: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#F8F9FA',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 20,
    borderWidth: 2,
    borderColor: '#E1E8ED',
  },
  previewCollegeName: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#2C3E50',
    textAlign: 'center',
  },
  logoPreviewContainer: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 20,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 3,
  },
  logoPreview: {
    alignItems: 'center',
    marginBottom: 15,
  },
  logoImage: {
    width: 100,
    height: 100,
    borderRadius: 50,
  },
  placeholderLogo: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: '#F8F9FA',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#E1E8ED',
  },
  placeholderText: {
    fontSize: 12,
    color: '#95A5A6',
    marginTop: 5,
  },
  changeLogoButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#4A90E2',
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 8,
    gap: 8,
    alignSelf: 'center',
  },
  changeLogoText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '600',
  },
  formSection: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 20,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 3,
  },
  inputContainer: {
    marginBottom: 15,
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
  helperText: {
    fontSize: 12,
    color: '#7F8C8D',
    marginTop: 5,
    fontStyle: 'italic',
  },
  infoSection: {
    marginBottom: 20,
  },
  infoCard: {
    flexDirection: 'row',
    backgroundColor: '#E8F4FD',
    padding: 15,
    borderRadius: 8,
    borderLeftWidth: 4,
    borderLeftColor: '#4A90E2',
    gap: 10,
  },
  infoText: {
    flex: 1,
    fontSize: 14,
    color: '#2C3E50',
    lineHeight: 20,
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
  saveButton: {
    backgroundColor: '#4A90E2',
  },
  saveButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
});

export default ManageAppScreen;
