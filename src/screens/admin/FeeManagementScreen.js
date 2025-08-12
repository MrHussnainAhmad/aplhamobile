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
import { adminAPI, classesAPI } from '../../services/api';

const FeeManagementScreen = ({ navigation }) => {
  const [feeVouchers, setFeeVouchers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedClass, setSelectedClass] = useState(''); // New state for class filter
  const [classes, setClasses] = useState([]); // State for available classes
  const [classesLoading, setClassesLoading] = useState(true);

  useEffect(() => {
    fetchClasses();
    fetchFeeVouchers();
  }, []); // Initial load

  useEffect(() => {
    fetchFeeVouchers();
  }, [searchQuery, selectedClass]); // Re-fetch when search or class changes

  const fetchClasses = async () => {
    setClassesLoading(true);
    try {
      const response = await classesAPI.getAllClasses();
      if (response.data && response.data.classes) {
        setClasses(response.data.classes.filter(Boolean));
      }
    } catch (error) {
      console.error('Error fetching classes:', error);
      Alert.alert('Error', 'Failed to load classes.');
    } finally {
      setClassesLoading(false);
    }
  };

  const fetchFeeVouchers = async () => {
    setLoading(true);
    try {
      const response = await adminAPI.getAllFeeVouchersAdmin(searchQuery, selectedClass);
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
          enabled={!classesLoading}
        >
          <Picker.Item label="All Classes" value="" />
          {classes.map((cls) => {
            const fullClassName = cls.section ? `${cls.classNumber}-${cls.section}` : cls.classNumber;
            return (
              <Picker.Item 
                key={cls._id} 
                label={fullClassName} 
                value={cls._id} 
              />
            );
          })}
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
    marginVertical: 15,
    marginTop: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
    overflow: 'hidden', // Ensures the picker content stays within bounds
  },
  picker: {
    height: 55,
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
