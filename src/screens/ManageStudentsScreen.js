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
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { adminAPI, teacherAPI } from '../services/api';
import { storage } from '../utils/storage';

const ManageStudentsScreen = ({ navigation }) => {
  const [students, setStudents] = useState([]);
  const [filteredStudents, setFilteredStudents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [userType, setUserType] = useState(null);

  useEffect(() => {
    checkUserType();
    loadStudents();
  }, []);

  useEffect(() => {
    filterStudents();
  }, [searchQuery, students]);

  const checkUserType = async () => {
    try {
      const { userType: storedUserType } = await storage.getUserData();
      setUserType(storedUserType);
    } catch (error) {
      console.error('Error checking user type:', error);
    }
  };

  const loadStudents = async () => {
    try {
      setLoading(true);
      // Use appropriate API based on user type
      const response = userType === 'admin' 
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
      return (
        student.fullname?.toLowerCase().includes(query) ||
        student.email?.toLowerCase().includes(query) ||
        student.studentId?.toLowerCase().includes(query) ||
        student.class?.toLowerCase().includes(query) ||
        student.section?.toLowerCase().includes(query)
      );
    });

    setFilteredStudents(filtered);
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    await loadStudents();
    setRefreshing(false);
  };

  const handleAssignStudentId = (student) => {
    Alert.prompt(
      'Assign Student ID',
      `Enter student ID for ${student.fullname}:`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Assign',
          onPress: async (studentId) => {
            if (!studentId || !studentId.trim()) {
              Alert.alert('Error', 'Please enter a valid student ID');
              return;
            }
            await assignStudentId(student._id, studentId.trim());
          },
        },
      ],
      'plain-text',
      student.studentId || ''
    );
  };

  const assignStudentId = async (studentId, newStudentId) => {
    try {
      // Use appropriate API based on user type
      const response = userType === 'admin'
        ? await adminAPI.updateStudent(studentId, { studentId: newStudentId })
        : await teacherAPI.assignStudentId(studentId, newStudentId);

      Alert.alert('Success', 'Student ID assigned successfully');
      loadStudents(); // Refresh the list
    } catch (error) {
      console.error('Error assigning student ID:', error);
      Alert.alert('Error', error.response?.data?.message || 'Failed to assign student ID');
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
      <View style={styles.studentHeader}>
        <View style={styles.avatarContainer}>
          <Ionicons name="person" size={24} color="#4A90E2" />
        </View>
        <View style={styles.studentInfo}>
          <Text style={styles.studentName}>{student.fullname}</Text>
          <Text style={styles.studentEmail}>{student.email}</Text>
          <Text style={styles.studentDetails}>
            {student.class} - {student.section}
          </Text>
        </View>
        <View style={styles.studentIdContainer}>
          {student.studentId ? (
            <Text style={styles.studentId}>ID: {student.studentId}</Text>
          ) : (
            <Text style={styles.noStudentId}>No ID</Text>
          )}
        </View>
      </View>

      <View style={styles.actionButtons}>
        <TouchableOpacity
          style={[styles.actionButton, styles.assignButton]}
          onPress={() => handleAssignStudentId(student)}
        >
          <Ionicons name="card" size={16} color="#fff" />
          <Text style={styles.actionButtonText}>
            {student.studentId ? 'Update ID' : 'Assign ID'}
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.actionButton, styles.updateButton]}
          onPress={() => handleUpdateStudent(student)}
        >
          <Ionicons name="create" size={16} color="#fff" />
          <Text style={styles.actionButtonText}>Update</Text>
        </TouchableOpacity>

        {userType === 'admin' && (
          <TouchableOpacity
            style={[styles.actionButton, styles.deleteButton]}
            onPress={() => handleDeleteStudent(student)}
          >
            <Ionicons name="trash" size={16} color="#fff" />
            <Text style={styles.actionButtonText}>Delete</Text>
          </TouchableOpacity>
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

      <View style={styles.searchContainer}>
        <Ionicons name="search" size={20} color="#7F8C8D" style={styles.searchIcon} />
        <TextInput
          style={styles.searchInput}
          placeholder="Search by name, email, student ID, or class..."
          value={searchQuery}
          onChangeText={setSearchQuery}
        />
        {searchQuery !== '' && (
          <TouchableOpacity onPress={() => setSearchQuery('')}>
            <Ionicons name="close-circle" size={20} color="#7F8C8D" />
          </TouchableOpacity>
        )}
      </View>

      <View style={styles.statsContainer}>
        <Text style={styles.statsText}>
          Showing {filteredStudents.length} of {students.length} students
        </Text>
        <Text style={styles.statsSubText}>
          {students.filter(s => s.studentId).length} with student IDs assigned
        </Text>
      </View>

      <FlatList
        data={filteredStudents}
        renderItem={renderStudentItem}
        keyExtractor={(item) => item._id}
        style={styles.studentList}
        contentContainerStyle={styles.listContainer}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={handleRefresh} />
        }
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Ionicons name="school" size={64} color="#BDC3C7" />
            <Text style={styles.emptyText}>
              {searchQuery ? 'No students found' : 'No students available'}
            </Text>
            {searchQuery && (
              <Text style={styles.emptySubText}>
                Try adjusting your search criteria
              </Text>
            )}
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
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    margin: 20,
    paddingHorizontal: 15,
    paddingVertical: 12,
    borderRadius: 25,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 3,
  },
  searchIcon: {
    marginRight: 10,
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
    color: '#2C3E50',
  },
  statsContainer: {
    paddingHorizontal: 20,
    marginBottom: 10,
  },
  statsText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#2C3E50',
  },
  statsSubText: {
    fontSize: 14,
    color: '#7F8C8D',
    marginTop: 2,
  },
  studentList: {
    flex: 1,
  },
  listContainer: {
    padding: 20,
    paddingTop: 10,
  },
  studentCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    marginBottom: 15,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 3,
  },
  studentHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 15,
  },
  avatarContainer: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: '#F8F9FA',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 15,
  },
  studentInfo: {
    flex: 1,
  },
  studentName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#2C3E50',
    marginBottom: 2,
  },
  studentEmail: {
    fontSize: 14,
    color: '#7F8C8D',
    marginBottom: 2,
  },
  studentDetails: {
    fontSize: 12,
    color: '#95A5A6',
  },
  studentIdContainer: {
    alignItems: 'flex-end',
  },
  studentId: {
    fontSize: 12,
    fontWeight: '600',
    color: '#27AE60',
    backgroundColor: '#D5EDDA',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  noStudentId: {
    fontSize: 12,
    fontWeight: '600',
    color: '#E74C3C',
    backgroundColor: '#F8D7DA',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  actionButtons: {
    flexDirection: 'row',
    paddingHorizontal: 15,
    paddingBottom: 15,
    gap: 8,
  },
  actionButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 8,
    gap: 4,
  },
  assignButton: {
    backgroundColor: '#4A90E2',
  },
  updateButton: {
    backgroundColor: '#F39C12',
  },
  deleteButton: {
    backgroundColor: '#E74C3C',
  },
  actionButtonText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '600',
  },
  emptyContainer: {
    alignItems: 'center',
    paddingVertical: 60,
  },
  emptyText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#7F8C8D',
    marginTop: 15,
    marginBottom: 5,
  },
  emptySubText: {
    fontSize: 14,
    color: '#BDC3C7',
    textAlign: 'center',
  },
});

export default ManageStudentsScreen;
