import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Alert,
  Image,
  ActivityIndicator,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { adminAPI } from '../../services/api';

const FeeVoucherDetailPage = ({ route, navigation }) => {
  const { specialStudentId } = route.params;
  const [loading, setLoading] = useState(true);
  const [studentInfo, setStudentInfo] = useState(null);
  const [feeVouchers, setFeeVouchers] = useState([]);

  useEffect(() => {
    fetchFeeVouchersDetail();
  }, [specialStudentId]);

  const fetchFeeVouchersDetail = async () => {
    setLoading(true);
    try {
      const response = await adminAPI.getStudentFeeVouchersAdmin(specialStudentId);
      setStudentInfo(response.data.studentInfo);
      setFeeVouchers(response.data.feeVouchers);
    } catch (error) {
      console.error('Error fetching fee voucher details:', error);
      Alert.alert('Error', 'Failed to load fee voucher details.');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <View style={[styles.container, styles.centerContent]}>
        <ActivityIndicator size="large" color="#4A90E2" />
        <Text style={styles.loadingText}>Loading fee voucher details...</Text>
      </View>
    );
  }

  if (!studentInfo) {
    return (
      <View style={[styles.container, styles.centerContent]}>
        <Text style={styles.noDataText}>No student information found.</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-back" size={24} color="#2C3E50" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Fee Vouchers</Text>
        <View style={{ width: 24 }} />{/* Spacer */}
      </View>

      <ScrollView style={styles.content}>
        <View style={styles.studentInfoCard}>
          {studentInfo.profilePicture ? (
            <Image source={{ uri: studentInfo.profilePicture }} style={styles.profilePicture} />
          ) : (
            <View style={styles.profilePicturePlaceholder}>
              <Ionicons name="person" size={40} color="#4A90E2" />
            </View>
          )}
          <View style={styles.studentDetails}>
            <Text style={styles.studentName}>{studentInfo.fullname}</Text>
            <Text style={styles.studentId}>Student ID: {studentInfo.studentId}</Text>
            <Text style={styles.specialId}>Special ID: {studentInfo.specialStudentId}</Text>
          </View>
        </View>

        <Text style={styles.sectionTitle}>Uploaded Vouchers</Text>
        {feeVouchers.length === 0 ? (
          <Text style={styles.noVouchersText}>No fee vouchers uploaded by this student.</Text>
        ) : (
          <View style={styles.voucherGrid}>
            {feeVouchers.map((voucher) => (
              <View key={voucher._id} style={styles.voucherItem}>
                <Image source={{ uri: voucher.imageUrl }} style={styles.voucherImage} />
                <Text style={styles.voucherId}>Voucher ID: {voucher.newId}</Text>
                <Text style={styles.voucherDate}>Uploaded: {new Date(voucher.uploadedAt).toLocaleDateString()}</Text>
              </View>
            ))}
          </View>
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
  studentInfoCard: {
    flexDirection: 'row',
    alignItems: 'center',
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
  profilePicture: {
    width: 70,
    height: 70,
    borderRadius: 35,
    marginRight: 15,
  },
  profilePicturePlaceholder: {
    width: 70,
    height: 70,
    borderRadius: 35,
    backgroundColor: '#E1E8ED',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 15,
  },
  studentDetails: {
    flex: 1,
  },
  studentName: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#2C3E50',
    marginBottom: 5,
  },
  studentId: {
    fontSize: 16,
    color: '#7F8C8D',
  },
  specialId: {
    fontSize: 14,
    color: '#7F8C8D',
    marginTop: 2,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#2C3E50',
    marginBottom: 15,
    marginTop: 10,
  },
  noVouchersText: {
    textAlign: 'center',
    color: '#7F8C8D',
    fontSize: 16,
    marginTop: 10,
  },
  voucherGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  voucherItem: {
    width: '48%', // Two items per row with some space
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 10,
    marginBottom: 15,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 3,
  },
  voucherImage: {
    width: '100%',
    height: 120,
    borderRadius: 8,
    marginBottom: 10,
    resizeMode: 'cover',
  },
  voucherId: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#2C3E50',
    marginBottom: 2,
  },
  voucherDate: {
    fontSize: 12,
    color: '#7F8C8D',
  },
});

export default FeeVoucherDetailPage;