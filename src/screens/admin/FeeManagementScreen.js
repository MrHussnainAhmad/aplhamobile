import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Alert,
  TextInput,
  ActivityIndicator,
  Image,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Picker } from '@react-native-picker/picker';
import { adminAPI } from '../../services/api';

const FeeManagementScreen = ({ navigation }) => {
  const [feeVouchers, setFeeVouchers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedClass, setSelectedClass] = useState(''); // New state for class filter

  useEffect(() => {
    fetchFeeVouchers();
  }, [searchQuery, selectedClass]); // Add selectedClass to dependencies

  const fetchFeeVouchers = async () => {
    setLoading(true);
    try {
      // For now, class filter is non-functional, so we don't pass it to the API
      const response = await adminAPI.getAllFeeVouchersAdmin(searchQuery);
      setFeeVouchers(response.data.feeVouchers);
    } catch (error) {
      console.error('Error fetching fee vouchers for admin:', error);
      Alert.alert('Error', 'Failed to load fee vouchers.');
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (text) => {
    setSearchQuery(text);
  };

  const handleClassChange = (itemValue) => {
    setSelectedClass(itemValue);
    // In the future, this will trigger a re-fetch with the class filter
  };

  const navigateToVoucherDetail = (specialStudentId) => {
    navigation.navigate('FeeVoucherDetail', { specialStudentId });
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-back" size={24} color="#2C3E50" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Fee Management</Text>
        <View style={{ width: 24 }} />{/* Spacer */}
      </View>

      <View style={styles.searchContainer}>
        <Ionicons name="search" size={20} color="#7F8C8D" style={styles.searchIcon} />
        <TextInput
          style={styles.searchInput}
          placeholder="Search by Student ID or Name"
          placeholderTextColor="#95A5A6"
          value={searchQuery}
          onChangeText={handleSearch}
        />
      </View>

      <View style={styles.pickerContainer}>
        <Picker
          selectedValue={selectedClass}
          onValueChange={handleClassChange}
          style={styles.picker}
          itemStyle={styles.pickerItem}
        >
          <Picker.Item label="All Classes" value="" />
          <Picker.Item label="Class 9 Boys" value="Class 9 Boys" />
          <Picker.Item label="Class 9 Girls" value="Class 9 Girls" />
          <Picker.Item label="Class 10 Boys" value="Class 10 Boys" />
          <Picker.Item label="Class 10 Girls" value="Class 10 Girls" />
          <Picker.Item label="Class 11 Boys" value="Class 11 Boys" />
          <Picker.Item label="Class 11 Girls" value="Class 11 Girls" />
          <Picker.Item label="Class 12 Boys" value="Class 12 Boys" />
          <Picker.Item label="Class 12 Girls" value="Class 12 Girls" />
        </Picker>
      </View>

      <ScrollView style={styles.content}>
        {loading ? (
          <ActivityIndicator size="large" color="#4A90E2" style={styles.loadingIndicator} />
        ) : feeVouchers.length === 0 ? (
          <Text style={styles.noResultsText}>No fee vouchers found.</Text>
        ) : (
          feeVouchers.map((item) => {
            console.log('FeeManagementScreen: Item data:', item);
            return (
              <TouchableOpacity
                key={item.specialStudentId}
                style={styles.studentCard}
                onPress={() => navigateToVoucherDetail(item.specialStudentId)}
              >
                <View style={styles.studentInfo}>
                  {item.studentProfilePicture ? (
                    <Image source={{ uri: item.studentProfilePicture }} style={styles.profilePicture} />
                  ) : (
                    <View style={styles.profilePicturePlaceholder}>
                      <Ionicons name="person" size={30} color="#4A90E2" />
                    </View>
                  )}
                  <View>
                    <Text style={styles.studentName}>{item.studentName}</Text>
                    <Text style={styles.studentId}>ID: {item.studentId}</Text>
                    <Text style={styles.voucherCount}>{item.count} Vouchers Uploaded</Text>
                  </View>
                </View>
                <Ionicons name="chevron-forward" size={24} color="#BDC3C7" />
              </TouchableOpacity>
            );
          })
        )}
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
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 10,
    marginHorizontal: 20,
    marginTop: 15,
    paddingHorizontal: 15,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  searchIcon: {
    marginRight: 10,
  },
  searchInput: {
    flex: 1,
    height: 45,
    fontSize: 16,
    color: '#2C3E50',
  },
  pickerContainer: {
    backgroundColor: '#FFFFFF',
    borderRadius: 10,
    marginHorizontal: 20,
    marginTop: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
    overflow: 'hidden', // Ensures the picker content stays within bounds
  },
  picker: {
    height: 45,
    width: '100%',
    color: '#2C3E50',
  },
  pickerItem: {
    fontSize: 16,
  },
  content: {
    flex: 1,
    padding: 20,
  },
  loadingIndicator: {
    marginTop: 50,
  },
  noResultsText: {
    textAlign: 'center',
    marginTop: 50,
    fontSize: 16,
    color: '#7F8C8D',
  },
  studentCard: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 15,
    marginBottom: 15,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 3,
  },
  studentInfo: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  profilePicture: {
    width: 50,
    height: 50,
    borderRadius: 25,
    marginRight: 15,
  },
  profilePicturePlaceholder: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: '#E1E8ED',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 15,
  },
  studentName: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#2C3E50',
  },
  studentId: {
    fontSize: 14,
    color: '#7F8C8D',
    marginTop: 2,
  },
  voucherCount: {
    fontSize: 14,
    color: '#4A90E2',
    marginTop: 5,
    fontWeight: '500',
  },
});

export default FeeManagementScreen;
