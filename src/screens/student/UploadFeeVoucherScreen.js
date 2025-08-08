import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Alert,
  Image,
  ScrollView,
  ActivityIndicator,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import { studentAPI } from '../../services/api';

const UploadFeeVoucherScreen = ({ navigation }) => {
  const [selectedImage, setSelectedImage] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [feeVouchers, setFeeVouchers] = useState([]);
  const [loadingVouchers, setLoadingVouchers] = useState(true);

  useEffect(() => {
    requestPermissions();
    fetchFeeVouchers();
  }, []);

  const requestPermissions = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert(
        'Permission Required',
        'Sorry, we need camera roll permissions to make this work!'
      );
    }
  };

  const fetchFeeVouchers = async () => {
    try {
      setLoadingVouchers(true);
      const response = await studentAPI.getFeeVouchers();
      setFeeVouchers(response.data.feeVouchers);
    } catch (error) {
      console.error('Error fetching fee vouchers:', error);
      Alert.alert('Error', 'Failed to load your fee vouchers.');
    } finally {
      setLoadingVouchers(false);
    }
  };

  const pickImage = async () => {
    let result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [4, 3],
      quality: 1,
      base64: true,
    });

    if (!result.canceled) {
      setSelectedImage(result.assets[0]);
    }
  };

  const uploadFeeVoucher = async () => {
    if (!selectedImage) {
      Alert.alert('No Image', 'Please select an image first.');
      return;
    }

    setUploading(true);
    try {
      const formData = new FormData();
      formData.append('image', {
        uri: selectedImage.uri,
        name: `feeVoucher_${Date.now()}.jpg`,
        type: selectedImage.mimeType || 'image/jpeg',
      });

      await studentAPI.uploadFeeVoucher(formData);
      Alert.alert('Success', 'Fee voucher uploaded successfully!');
      setSelectedImage(null);
      fetchFeeVouchers(); // Refresh the list
    } catch (error) {
      console.error('Error uploading fee voucher:', error.response?.data?.message || error.message);
      Alert.alert('Upload Failed', error.response?.data?.message || 'Failed to upload fee voucher.');
    } finally {
      setUploading(false);
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-back" size={24} color="#2C3E50" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Upload Fee Voucher</Text>
        <View style={{ width: 24 }} />{/* Spacer */}
      </View>

      <ScrollView style={styles.content}>
        <View style={styles.uploadSection}>
          <Text style={styles.sectionTitle}>Upload New Voucher</Text>
          <TouchableOpacity style={styles.imagePicker} onPress={pickImage}>
            {selectedImage ? (
              <Image source={{ uri: selectedImage.uri }} style={styles.selectedImage} />
            ) : (
              <View style={styles.imagePlaceholder}>
                <Ionicons name="image" size={50} color="#BDC3C7" />
                <Text style={styles.imagePlaceholderText}>Tap to select image</Text>
              </View>
            )}
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.uploadButton}
            onPress={uploadFeeVoucher}
            disabled={uploading || !selectedImage}
          >
            {uploading ? (
              <ActivityIndicator color="#FFFFFF" />
            ) : (
              <Text style={styles.uploadButtonText}>Upload Voucher</Text>
            )}
          </TouchableOpacity>
        </View>

        <View style={styles.historySection}>
          <Text style={styles.sectionTitle}>Your Uploaded Vouchers</Text>
          {loadingVouchers ? (
            <ActivityIndicator size="large" color="#4A90E2" />
          ) : feeVouchers.length === 0 ? (
            <Text style={styles.noVouchersText}>No fee vouchers uploaded yet.</Text>
          ) : (
            <View style={styles.voucherList}>
              {feeVouchers.map((voucher) => (
                <View key={voucher._id} style={styles.voucherItem}>
                  <Image source={{ uri: voucher.imageUrl }} style={styles.voucherImage} />
                  <View style={styles.voucherDetails}>
                    <Text style={styles.voucherId}>Voucher ID: {voucher.newId}</Text>
                    <Text style={styles.voucherDate}>Uploaded: {new Date(voucher.uploadedAt).toLocaleDateString()}</Text>
                  </View>
                </View>
              ))}
            </View>
          )}
        </View>
      </ScrollView>
    </View>
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
  content: {
    flex: 1,
    padding: 20,
  },
  uploadSection: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 20,
    marginBottom: 20,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 3,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#2C3E50',
    marginBottom: 15,
  },
  imagePicker: {
    width: '100%',
    height: 200,
    backgroundColor: '#E1E8ED',
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 15,
    overflow: 'hidden',
  },
  imagePlaceholder: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  imagePlaceholderText: {
    fontSize: 16,
    color: '#7F8C8D',
    marginTop: 10,
  },
  selectedImage: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
  },
  uploadButton: {
    backgroundColor: '#4A90E2',
    paddingVertical: 12,
    paddingHorizontal: 25,
    borderRadius: 8,
    width: '100%',
    alignItems: 'center',
  },
  uploadButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
  historySection: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 3,
  },
  noVouchersText: {
    textAlign: 'center',
    color: '#7F8C8D',
    fontSize: 16,
    marginTop: 10,
  },
  voucherList: {
    marginTop: 10,
  },
  voucherItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 15,
    backgroundColor: '#F8F9FA',
    borderRadius: 8,
    padding: 10,
    borderWidth: 1,
    borderColor: '#E1E8ED',
  },
  voucherImage: {
    width: 80,
    height: 80,
    borderRadius: 8,
    marginRight: 15,
    resizeMode: 'cover',
  },
  voucherDetails: {
    flex: 1,
  },
  voucherId: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#2C3E50',
    marginBottom: 5,
  },
  voucherDate: {
    fontSize: 14,
    color: '#7F8C8D',
  },
});

export default UploadFeeVoucherScreen;
