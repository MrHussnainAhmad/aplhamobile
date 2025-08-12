import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Alert,
  ActivityIndicator,
  FlatList,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation, useRoute } from '@react-navigation/native';
import { attendanceAPI } from '../../services/api';

const ClassStudentsScreen = () => {
  const navigation = useNavigation();
  const route = useRoute();
  const { classData } = route.params;
  
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadStudents();
  }, []);

  const loadStudents = async () => {
    try {
      setLoading(true);
      const response = await attendanceAPI.getStudentsForClass(classData._id);
      console.log('Students loaded:', response.data.students?.length || 0, 'students');
      setStudents(response.data.students || []);
    } catch (error) {
      console.error('Error loading students:', error);
      Alert.alert('Error', 'Failed to load students for this class');
    } finally {
      setLoading(false);
    }
  };

  const handleMarkAttendance = (student, status) => {
    Alert.alert(
      'Mark Attendance',
      `Mark ${student.fullname} as ${status === 'P' ? 'Present' : 'Absent'}?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Mark',
          onPress: () => submitAttendance(student._id, status),
        },
      ]
    );
  };

  const submitAttendance = async (studentId, status) => {
    try {
      const attendanceData = {
        studentId,
        classId: classData._id,
        status,
        date: new Date().toISOString(),
      };

      console.log('Marking attendance for student:', studentId, 'status:', status);
      await attendanceAPI.markStudentAttendance(attendanceData);
      console.log('Attendance marked successfully, refreshing list...');
      
      Alert.alert('Success', 'Attendance marked successfully');
      
      // Refresh students list to hide the marked student
      setTimeout(() => {
        loadStudents();
      }, 500); // Small delay to ensure backend has processed the request
    } catch (error) {
      console.error('Error marking attendance:', error);
      Alert.alert('Error', 'Failed to mark attendance');
    }
  };

  const renderStudentItem = ({ item }) => (
    <View style={styles.studentItem}>
      <View style={styles.studentInfo}>
        <Text style={styles.studentName}>{item.fullname}</Text>
        <Text style={styles.studentId}>ID: {item.studentId}</Text>
        <Text style={styles.studentRoll}>Roll: {item.rollNumber}</Text>
      </View>
      <View style={styles.attendanceButtons}>
        <TouchableOpacity
          style={[styles.attendanceButton, styles.presentButton]}
          onPress={() => handleMarkAttendance(item, 'P')}
        >
          <Ionicons name="checkmark" size={20} color="#FFFFFF" />
          <Text style={styles.buttonText}>Present</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.attendanceButton, styles.absentButton]}
          onPress={() => handleMarkAttendance(item, 'A')}
        >
          <Ionicons name="close" size={20} color="#FFFFFF" />
          <Text style={styles.buttonText}>Absent</Text>
        </TouchableOpacity>
      </View>
    </View>
  );

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#4A90E2" />
        <Text style={styles.loadingText}>Loading students...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => navigation.goBack()}
        >
          <Ionicons name="arrow-back" size={24} color="#2C3E50" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Student Attendance</Text>
        <View style={styles.placeholder} />
      </View>

      <View style={styles.classInfo}>
        <Text style={styles.className}>Class {classData.classNumber} - {classData.section}</Text>
        <Text style={styles.dateText}>
          {new Date().toLocaleDateString('en-US', { 
            weekday: 'long', 
            year: 'numeric', 
            month: 'long', 
            day: 'numeric' 
          })}
        </Text>
        <Text style={styles.studentCount}>
          {students.length} student{students.length !== 1 ? 's' : ''} remaining for today
        </Text>
      </View>

      <ScrollView style={styles.content}>
        {students.length > 0 ? (
          <FlatList
            data={students}
            renderItem={renderStudentItem}
            keyExtractor={(item) => item._id}
            scrollEnabled={false}
            showsVerticalScrollIndicator={false}
          />
        ) : (
          <View style={styles.emptyContainer}>
            <Ionicons name="checkmark-circle" size={48} color="#27AE60" />
            <Text style={styles.emptyText}>All students marked for today!</Text>
            <Text style={styles.emptySubtext}>
              Attendance has been completed for this class. Students will reappear tomorrow.
            </Text>
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
  backButton: {
    padding: 8,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#2C3E50',
  },
  placeholder: {
    width: 40,
  },
  classInfo: {
    backgroundColor: '#FFFFFF',
    margin: 20,
    padding: 20,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 3,
  },
  className: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#2C3E50',
    marginBottom: 5,
  },
  dateText: {
    fontSize: 14,
    color: '#7F8C8D',
    marginBottom: 5,
    fontStyle: 'italic',
  },
  studentCount: {
    fontSize: 16,
    color: '#7F8C8D',
  },
  content: {
    flex: 1,
    paddingHorizontal: 20,
  },
  studentItem: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    marginBottom: 12,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  studentInfo: {
    marginBottom: 12,
  },
  studentName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#2C3E50',
    marginBottom: 4,
  },
  studentId: {
    fontSize: 14,
    color: '#7F8C8D',
    marginBottom: 2,
  },
  studentRoll: {
    fontSize: 14,
    color: '#7F8C8D',
  },
  attendanceButtons: {
    flexDirection: 'row',
    gap: 10,
  },
  attendanceButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 8,
    gap: 8,
  },
  presentButton: {
    backgroundColor: '#27AE60',
  },
  absentButton: {
    backgroundColor: '#E74C3C',
  },
  buttonText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '600',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 40,
  },
  loadingText: {
    marginTop: 10,
    fontSize: 16,
    color: '#7F8C8D',
  },
  emptyContainer: {
    alignItems: 'center',
    paddingVertical: 40,
  },
  emptyText: {
    marginTop: 10,
    fontSize: 16,
    color: '#7F8C8D',
    textAlign: 'center',
  },
  emptySubtext: {
    marginTop: 5,
    fontSize: 14,
    color: '#BDC3C7',
    textAlign: 'center',
    paddingHorizontal: 20,
  },
});

export default ClassStudentsScreen;
