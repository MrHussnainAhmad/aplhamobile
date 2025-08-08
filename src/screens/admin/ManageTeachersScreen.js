import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  FlatList,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
  RefreshControl,
  Image,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { adminAPI } from '../../services/api';
import VerifiedBadge from '../../components/VerifiedBadge';

const ManageTeachersScreen = ({ navigation }) => {
  const [teachers, setTeachers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [filteredTeachers, setFilteredTeachers] = useState([]);

  useEffect(() => {
    fetchTeachers();
  }, []);

  useEffect(() => {
    // Filter teachers based on search query
    const filtered = teachers.filter(teacher => 
      teacher.fullname.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (teacher.teacherId && teacher.teacherId.toLowerCase().includes(searchQuery.toLowerCase()))
    );
    setFilteredTeachers(filtered);
  }, [searchQuery, teachers]);

  const fetchTeachers = async () => {
    try {
      const response = await adminAPI.getAllTeachers();
      console.log('Fetched teachers data:', response.data.teachers);
      setTeachers(response.data.teachers);
    } catch (error) {
      console.error('Error fetching teachers:', error);
      Alert.alert('Error', 'Failed to fetch teachers');
    } finally {
      setLoading(false);
    }
  };

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    fetchTeachers().finally(() => setRefreshing(false));
  }, []);

  const handleVerifyTeacher = async (teacherId, isVerified) => {
    try {
      await adminAPI.verifyTeacher(teacherId, isVerified);
      Alert.alert('Success', `Teacher ${isVerified ? 'verified' : 'unverified'} successfully`);
      onRefresh(); // Refresh the list
    } catch (error) {
      console.error('Error verifying teacher:', error);
      Alert.alert('Error', 'Failed to verify teacher');
    }
  };

  const handleDeleteTeacher = async (teacherId) => {
    Alert.alert(
      'Confirm Deletion',
      'Are you sure you want to delete this teacher? This action is irreversible.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            try {
              await adminAPI.deleteTeacher(teacherId);
              Alert.alert('Success', 'Teacher deleted successfully');
              onRefresh(); // Refresh the list
            } catch (error) {
              console.error('Error deleting teacher:', error);
              Alert.alert('Error', 'Failed to delete teacher');
            }
          },
        },
      ]
    );
  };

  const handleUpdateTeacher = (teacher) => {
    navigation.navigate('UpdateTeacherScreen', { teacher });
  };

  const handleAssignTeacherId = (teacher) => {
    Alert.prompt(
      'Assign Teacher ID',
      `Enter teacher ID for ${teacher.fullname}:`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Assign',
          onPress: async (teacherId) => {
            if (!teacherId || !teacherId.trim()) {
              Alert.alert('Error', 'Please enter a valid teacher ID');
              return;
            }
            await assignTeacherId(teacher._id, teacherId.trim());
          },
        },
      ],
      'plain-text',
      teacher.teacherId || ''
    );
  };

  const assignTeacherId = async (teacherId, newTeacherId) => {
    try {
      await adminAPI.assignTeacherId(teacherId, newTeacherId);
      Alert.alert('Success', 'Teacher ID assigned successfully');
      onRefresh(); // Refresh the list
    } catch (error) {
      console.error('Error assigning teacher ID:', error);
      Alert.alert('Error', error.response?.data?.message || 'Failed to assign teacher ID');
    }
  };

  const renderTeacherItem = ({ item }) => (
    <View style={styles.teacherCard}>
      {/* Institute Header with Gradient */}
      <View style={styles.cardHeader}>
        <Text style={styles.instituteName}>Superior Science College</Text>
        <View style={styles.verifiedBadgeContainer}>
          <VerifiedBadge isVerified={item.isVerified} showText={false} />
        </View>
      </View>

      {/* Main Card Content */}
      <View style={styles.cardBody}>
        {/* Teacher Avatar and Info Section */}
        <View style={styles.teacherMainInfo}>
          <View style={styles.avatarSection}>
            <View style={styles.avatarContainer}>
              {item.img ? (
                <Image key={item.img} source={{ uri: item.img }} style={styles.avatar} />
              ) : (
                <Ionicons name="person" size={40} color="#4A90E2" />
              )}
            </View>
          </View>
          
          <View style={styles.teacherDetailsSection}>
            <Text style={styles.teacherName}>{item.fullname}</Text>
            
            {/* Teacher Information in ID Card Style */}
            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>Teacher ID:</Text>
              <Text style={styles.infoValue}>
                {item.teacherId || 'Not Assigned'}
              </Text>
            </View>
            
            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>Email:</Text>
              <Text style={styles.infoValue}>{item.email}</Text>
            </View>
          </View>
        </View>
      </View>

      {/* Action Buttons */}
      <View style={styles.actionButtons}>
        <TouchableOpacity
          style={[styles.actionButton, styles.updateButton]}
          onPress={() => handleUpdateTeacher(item)}
        >
          <Ionicons name="create" size={16} color="#fff" />
          <Text style={styles.actionButtonText}>Update</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.actionButton, styles.deleteButton]}
          onPress={() => handleDeleteTeacher(item._id)}
        >
          <Ionicons name="trash" size={16} color="#fff" />
          <Text style={styles.actionButtonText}>Delete</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.actionButton, { backgroundColor: item.isVerified ? '#E74C3C' : '#2ECC71' }]}
          onPress={() => handleVerifyTeacher(item._id, !item.isVerified)}
        >
          <Ionicons name={item.isVerified ? 'close-circle' : 'checkmark-circle'} size={16} color="#fff" />
          <Text style={styles.actionButtonText}>{item.isVerified ? 'Unverify' : 'Verify'}</Text>
        </TouchableOpacity>
      </View>
    </View>
  );

  if (loading) {
    return (
      <View style={[styles.container, styles.centerContent]}>
        <ActivityIndicator size="large" color="#4A90E2" />
        <Text style={styles.loadingText}>Loading teachers...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-back" size={24} color="#2C3E50" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Manage Teachers</Text>
        <View style={styles.headerRight} />
      </View>

      <View style={styles.searchContainer}>
        <Ionicons name="search" size={20} color="#7F8C8D" style={styles.searchIcon} />
        <TextInput
          style={styles.searchInput}
          placeholder="Search by name or teacher ID..."
          value={searchQuery}
          onChangeText={setSearchQuery}
        />
      </View>

      <FlatList
        data={filteredTeachers}
        renderItem={renderTeacherItem}
        keyExtractor={(item) => item._id}
        contentContainerStyle={styles.listContainer}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
        ListEmptyComponent={() => (
          <View style={styles.emptyContainer}>
            <Ionicons name="sad-outline" size={50} color="#BDC3C7" />
            <Text style={styles.emptyText}>No teachers found</Text>
            <Text style={styles.emptySubText}>Try refreshing or add a new teacher</Text>
          </View>
        )}
      />
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
  headerRight: {
    width: 24,
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 8,
    margin: 20,
    paddingHorizontal: 15,
    borderWidth: 1,
    borderColor: '#E1E8ED',
  },
  searchIcon: {
    marginRight: 10,
  },
  searchInput: {
    flex: 1,
    height: 50,
    fontSize: 16,
    color: '#2C3E50',
  },
  listContainer: {
    paddingHorizontal: 20,
    paddingBottom: 20,
  },
  teacherCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 15,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 8,
    overflow: 'hidden',
  },
  cardHeader: {
    backgroundColor: '#4A5FD7',
    paddingVertical: 12,
    paddingHorizontal: 20,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  instituteName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#FFFFFF',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  verifiedBadgeContainer: {
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    borderRadius: 12,
    padding: 4,
  },
  cardBody: {
    padding: 20,
  },
  teacherMainInfo: {
    flexDirection: 'row',
    marginBottom: 20,
  },
  avatarSection: {
    marginRight: 20,
    alignItems: 'center',
  },
  avatarContainer: {
    width: 60,
    height: 60,
    borderRadius: 6,
    backgroundColor: '#E8F4FD',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#4A90E2',
  },
  avatar: {
    width: 60,
    height: 60,
    borderRadius: 6,
  },
  teacherDetailsSection: {
    flex: 1,
    justifyContent: 'center',
  },
  teacherName: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#2C3E50',
    marginBottom: 12,
  },
  infoRow: {
    flexDirection: 'row',
    marginBottom: 8,
    alignItems: 'center',
  },
  infoLabel: {
    fontSize: 12,
    fontWeight: '600',
    color: '#7F8C8D',
    width: 80,
  },
  infoValue: {
    fontSize: 12,
    color: '#2C3E50',
    flex: 1,
    fontWeight: '500',
  },
  actionButtons: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    paddingHorizontal: 20,
    paddingBottom: 15,
    gap: 8,
    borderTopWidth: 1,
    borderTopColor: '#ECF0F1',
    paddingTop: 15,
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 6,
    gap: 4,
  },
  updateButton: {
    backgroundColor: '#FFC107',
  },
  deleteButton: {
    backgroundColor: '#DC3545',
  },
  actionButtonText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: 'bold',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 100,
  },
  emptyText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#7F8C8D',
    marginTop: 10,
  },
  emptySubText: {
    fontSize: 14,
    color: '#BDC3C7',
    marginTop: 5,
  },
});

export default ManageTeachersScreen;