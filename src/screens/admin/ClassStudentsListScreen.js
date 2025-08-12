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

const ClassStudentsListScreen = () => {
  const navigation = useNavigation();
  const route = useRoute();
  const { classData, month } = route.params;
  
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    console.log('ClassStudentsListScreen mounted with params:', { classData, month });
    loadStudents();
  }, []);

  const loadStudents = async () => {
    try {
      setLoading(true);
      console.log('Loading students for class:', classData._id);
      
      // Test the API call - use the records endpoint (shows all students, no filtering)
      const response = await attendanceAPI.getStudentsForRecords(classData._id);
      console.log('Students response:', response.data);
      console.log('Students array length:', response.data.students?.length || 0);
      
      if (response.data.students && response.data.students.length > 0) {
        console.log('First student:', response.data.students[0]);
      } else {
        console.log('No students found in response');
      }
      
      setStudents(response.data.students || []);
    } catch (error) {
      console.error('Error loading students:', error);
      console.error('Error status:', error.response?.status);
      console.error('Error response:', error.response?.data);
      console.error('Error message:', error.message);
      
      // Try to get more specific error information
      if (error.response?.status === 401) {
        Alert.alert('Authentication Error', 'Please log in again');
      } else if (error.response?.status === 403) {
        Alert.alert('Access Denied', 'You do not have permission to access this data');
      } else if (error.response?.status === 404) {
        Alert.alert('Not Found', 'Class or students not found');
      } else {
        Alert.alert('Error', `Failed to load students: ${error.message}`);
      }
    } finally {
      setLoading(false);
    }
  };

  const handleStudentSelect = (student) => {
         navigation.navigate('AttendanceDetail', {
       type: 'student',
       id: student._id,
       name: student.fullname,
       classId: classData._id,
       className: `Class ${classData.classNumber} - ${classData.section}`,
       month: month,
     });
  };

  const renderStudentItem = ({ item }) => (
    <TouchableOpacity
      style={styles.studentItem}
      onPress={() => handleStudentSelect(item)}
    >
      <View style={styles.studentInfo}>
        <Text style={styles.studentName}>{item.fullname}</Text>
        <Text style={styles.studentId}>ID: {item.studentId}</Text>
        <Text style={styles.studentRoll}>Roll: {item.rollNumber}</Text>
      </View>
      <Ionicons name="chevron-forward" size={20} color="#BDC3C7" />
    </TouchableOpacity>
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
        <Text style={styles.headerTitle}>Select Student</Text>
        <View style={styles.placeholder} />
      </View>

      <View style={styles.classInfo}>
        <Text style={styles.className}>Class {classData.classNumber} - {classData.section}</Text>
        <Text style={styles.studentCount}>{students.length} students</Text>
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
            <Ionicons name="people-outline" size={48} color="#BDC3C7" />
            <Text style={styles.emptyText}>No students found in this class</Text>
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
    flexDirection: 'row',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  studentInfo: {
    flex: 1,
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
});

export default ClassStudentsListScreen;
