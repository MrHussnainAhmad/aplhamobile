import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  TextInput,
  Alert,
  ActivityIndicator,
  RefreshControl,
  LinearGradient,
  Image,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useFocusEffect } from '@react-navigation/native';
import { adminAPI, teacherAPI } from '../services/api';
import { storage } from '../utils/storage';
import VerifiedBadge from '../components/VerifiedBadge';

const ManageStudentsScreen = ({ navigation }) => {
  const [students, setStudents] = useState([]);
  const [filteredStudents, setFilteredStudents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [userType, setUserType] = useState(null);

  useEffect(() => {
    initializeScreen();
  }, []);

  useEffect(() => {
    filterStudents();
  }, [searchQuery, students]);

  // Refresh students list when screen comes into focus (e.g., after student update)
  useFocusEffect(
    React.useCallback(() => {
      loadStudents();
    }, [])
  );

  const initializeScreen = async () => {
    try {
      const { userType: storedUserType } = await storage.getUserData();
      setUserType(storedUserType);
      await loadStudents(storedUserType);
    } catch (error) {
      console.error('Error initializing screen:', error);
      Alert.alert('Error', 'Failed to initialize screen');
      setLoading(false);
    }
  };

  const loadStudents = async (currentUserType = userType) => {
    try {
      setLoading(true);
      // Use appropriate API based on user type
      const response = currentUserType === 'admin' 
        ? await adminAPI.getAllStudents() 
        : await teacherAPI.getAllStudents();
      
      setStudents(response.data.students || []);
    } catch (error) {
      console.error('Error loading students:', error);
      Alert.alert('Error', 'Failed to load students');
    } finally {
      setLoading(false);
    }
  };

  const filterStudents = () => {
    if (!searchQuery.trim()) {
      setFilteredStudents(students);
      return;
    }

    const filtered = students.filter(student => {
      const query = searchQuery.toLowerCase();
      // Only search by student name or student ID
      return (
        student.fullname?.toLowerCase().includes(query) ||
        (student.studentId && student.studentId.toLowerCase().includes(query))
      );
    });

    setFilteredStudents(filtered);
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    await loadStudents();
    setRefreshing(false);
  };

  const handleVerifyStudent = async (studentId, isVerified) => {
    try {
      await adminAPI.verifyStudent(studentId, isVerified);
      Alert.alert('Success', `Student ${isVerified ? 'verified' : 'unverified'} successfully`);
      handleRefresh();
    } catch (error) {
      console.error('Error verifying student:', error);
      Alert.alert('Error', 'Failed to verify student');
    }
  };

  const handleUpdateStudent = (student) => {
    navigation.navigate('UpdateStudent', { student });
  };

  const handleDeleteStudent = (student) => {
    if (userType !== 'admin') {
      Alert.alert('Permission Denied', 'Only administrators can delete student accounts');
      return;
    }

    Alert.alert(
      'Confirm Delete',
      `Are you sure you want to delete ${student.fullname}'s account?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: () => deleteStudent(student._id),
        },
      ]
    );
  };

  const deleteStudent = async (studentId) => {
    try {
      await adminAPI.deleteStudent(studentId);
      Alert.alert('Success', 'Student deleted successfully');
      loadStudents();
    } catch (error) {
      console.error('Error deleting student:', error);
      Alert.alert('Error', 'Failed to delete student');
    }
  };

  const renderStudentItem = ({ item: student }) => (
    <View style={styles.studentCard}>
      {/* Institute Header with Gradient */}
      <View style={styles.cardHeader}>
        <Text style={styles.instituteName}>Superior Science College</Text>
        <View style={styles.verifiedBadgeContainer}>
          <VerifiedBadge isVerified={student.isVerified} showText={false} />
        </View>
      </View>

      {/* Main Card Content */}
      <View style={styles.cardBody}>
        {/* Student Avatar and Info Section */}
        <View style={styles.studentMainInfo}>
          <View style={styles.avatarSection}>
            <View style={styles.avatarContainer}>
              {student.img ? (
                <Image key={student.img} source={{ uri: student.img }} style={styles.avatar} />
              ) : (
                <Ionicons name="person" size={40} color="#4A90E2" />
              )}
            </View>
          </View>
          
          <View style={styles.studentDetailsSection}>
            <Text style={styles.studentName}>{student.fullname}</Text>
            
            {/* Student Information in ID Card Style */}
            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>Student ID:</Text>
              <Text style={styles.infoValue}>
                {student.studentId || 'Not Assigned'}
              </Text>
            </View>
            
            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>Email:</Text>
              <Text style={styles.infoValue}>{student.email}</Text>
            </View>
            
            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>Class:</Text>
              <Text style={styles.infoValue}>
                {student.class ? `${student.class.classNumber}-${student.class.section}` : 'N/A'}
              </Text>
            </View>
          </View>
        </View>
      </View>

      {/* Action Buttons */}
      <View style={styles.actionButtons}>
        <TouchableOpacity
          style={[styles.actionButton, styles.updateButton]}
          onPress={() => handleUpdateStudent(student)}
        >
          <Ionicons name="create" size={16} color="#fff" />
          <Text style={styles.actionButtonText}>Update</Text>
        </TouchableOpacity>

        {userType === 'admin' && (
          <>
            <TouchableOpacity
              style={[styles.actionButton, styles.deleteButton]}
              onPress={() => handleDeleteStudent(student)}
            >
              <Ionicons name="trash" size={16} color="#fff" />
              <Text style={styles.actionButtonText}>Delete</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.actionButton, { backgroundColor: student.isVerified ? '#E74C3C' : '#2ECC71' }]}
              onPress={() => handleVerifyStudent(student._id, !student.isVerified)}
            >
              <Ionicons name={student.isVerified ? 'close-circle' : 'checkmark-circle'} size={16} color="#fff" />
              <Text style={styles.actionButtonText}>{student.isVerified ? 'Unverify' : 'Verify'}</Text>
            </TouchableOpacity>
          </>
        )}
      </View>
    </View>
  );

  if (loading) {
    return (
      <View style={[styles.container, styles.centerContent]}>
        <ActivityIndicator size="large" color="#4A90E2" />
        <Text style={styles.loadingText}>Loading students...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-back" size={24} color="#2C3E50" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Manage Students</Text>
        <View style={styles.headerRight} />
      </View>

      {/* Updated Search Container - Same style as ManageTeachersScreen */}
      <View style={styles.searchContainer}>
        <Ionicons name="search" size={20} color="#7F8C8D" style={styles.searchIcon} />
        <TextInput
          style={styles.searchInput}
          placeholder="Search by name or student ID..."
          value={searchQuery}
          onChangeText={setSearchQuery}
        />
      </View>

      <FlatList
        data={filteredStudents}
        renderItem={renderStudentItem}
        keyExtractor={(item) => item._id}
        contentContainerStyle={styles.listContainer}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={handleRefresh} />
        }
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Ionicons name="sad-outline" size={50} color="#BDC3C7" />
            <Text style={styles.emptyText}>No students found</Text>
            <Text style={styles.emptySubText}>Try refreshing or add a new student</Text>
          </View>
        }
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
  // Updated Search Container - Same style as ManageTeachersScreen
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
  // Student Card Styles (ID Card Design)
  studentCard: {
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
  studentMainInfo: {
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
  studentDetailsSection: {
    flex: 1,
    justifyContent: 'center',
  },
  studentName: {
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

export default ManageStudentsScreen;