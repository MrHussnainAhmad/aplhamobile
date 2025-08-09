import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { Picker } from '@react-native-picker/picker';
import { Ionicons } from '@expo/vector-icons';
import { teacherAPI } from '../../services/api';

const AssignStudentsScreen = ({ route, navigation }) => {
  const { classId, className } = route.params;
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedSection, setSelectedSection] = useState('all'); // 'all', 'boys', 'girls'

  useEffect(() => {
    fetchStudents();
  }, [selectedSection]); // Refetch students when section changes

  const fetchStudents = async () => {
    setLoading(true);
    try {
      const params = { classId };
      if (selectedSection !== 'all') {
        params.section = selectedSection;
      }
      console.log('Fetching students with params:', params);
      const response = await teacherAPI.getVerifiedStudents(params);
      if (response.data.students) {
        setStudents(response.data.students);
      }
    } catch (error) {
      console.error('Error fetching students:', error);
      Alert.alert('Error', 'Failed to load students.');
    } finally {
      setLoading(false);
    }
  };

  const handleAssignStudent = async (studentId) => {
    try {
      const response = await teacherAPI.assignStudentClass({ studentId, classId });
      if (response.data.student) {
        setStudents(students.map(s => 
          s._id === studentId ? response.data.student : s
        ));
        Alert.alert('Success', response.data.message);
      }
    } catch (error) {
      console.error('Error assigning student:', error);
      Alert.alert('Error', error.response?.data?.message || 'Failed to assign student.');
    }
  };

  const handleUnassignStudent = async (studentId) => {
    try {
      const response = await teacherAPI.unassignStudentClass({ studentId });
      if (response.data.student) {
        setStudents(students.map(s => 
          s._id === studentId ? response.data.student : s
        ));
        Alert.alert('Success', response.data.message);
      }
    } catch (error) {
      console.error('Error unassigning student:', error);
      Alert.alert('Error', error.response?.data?.message || 'Failed to unassign student.');
    }
  };

  const renderStudentItem = ({ item }) => {
    const isAssignedToCurrentClass = item.class && item.class._id === classId;
    const isAssignedToOtherClass = item.class && item.class._id !== classId;

    return (
      <View style={styles.studentItem}>
        <View style={styles.studentInfo}>
          <Text style={styles.studentName}>{item.fullname}</Text>
          <Text style={styles.studentEmail}>{item.email}</Text>
          {item.class && (
            <Text style={styles.assignedClass}>Assigned Class: {item.class.name}</Text>
          )}
          {item.section && (
            <Text style={styles.studentSection}>Section: {item.section}</Text>
          )}
        </View>
        <TouchableOpacity
          style={[
            styles.assignButton,
            isAssignedToCurrentClass ? styles.unassignButton : {},
            isAssignedToOtherClass ? styles.disabledButton : {},
          ]}
          onPress={() => {
            if (isAssignedToOtherClass) {
              Alert.alert('Cannot Assign', `Student is already assigned to ${item.class.name}. Unassign them first.`);
            } else if (isAssignedToCurrentClass) {
              handleUnassignStudent(item._id);
            } else {
              handleAssignStudent(item._id);
            }
          }}
          disabled={isAssignedToOtherClass}
        >
          <Text style={styles.assignButtonText}>
            {isAssignedToCurrentClass ? 'Unassign' : 'Assign'}
          </Text>
        </TouchableOpacity>
      </View>
    );
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#007BFF" />
        <Text style={styles.loadingText}>Loading students...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Assign Students to Class</Text>
      <Text style={styles.subtitle}>Class: {className}</Text>

      <View style={styles.pickerContainer}>
        <Text style={styles.pickerLabel}>Filter by Section:</Text>
        <Picker
          selectedValue={selectedSection}
          style={styles.picker}
          onValueChange={(itemValue) => setSelectedSection(itemValue)}
        >
          <Picker.Item label="All Students" value="all" />
          <Picker.Item label="Boys Section" value="boys" />
          <Picker.Item label="Girls Section" value="girls" />
        </Picker>
      </View>

      {students.length === 0 ? (
        <Text style={styles.noStudentsText}>No verified students found for this section.</Text>
      ) : (
        <FlatList
          data={students}
          keyExtractor={(item) => item._id}
          renderItem={renderStudentItem}
          contentContainerStyle={styles.listContent}
        />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: '#F8F9FA',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F8F9FA',
  },
  loadingText: {
    marginTop: 10,
    fontSize: 16,
    color: '#555',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 10,
    color: '#333',
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 18,
    color: '#555',
    marginBottom: 20,
    textAlign: 'center',
  },
  pickerContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
    backgroundColor: '#FFFFFF',
    borderRadius: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 3,
    padding: 10,
  },
  pickerLabel: {
    fontSize: 16,
    fontWeight: 'bold',
    marginRight: 10,
    color: '#333',
  },
  picker: {
    flex: 1,
    height: 40,
    color: '#333', // Set text color to be visible
  },
  studentItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    padding: 15,
    borderRadius: 10,
    marginBottom: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  studentInfo: {
    flex: 1,
    marginRight: 10,
  },
  studentName: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
  },
  studentEmail: {
    fontSize: 14,
    color: '#777',
    marginTop: 5,
  },
  assignedClass: {
    fontSize: 12,
    color: '#999',
    marginTop: 5,
  },
  studentSection: {
    fontSize: 12,
    color: '#999',
    marginTop: 2,
  },
  assignButton: {
    backgroundColor: '#28A745',
    paddingVertical: 8,
    paddingHorizontal: 15,
    borderRadius: 8,
  },
  unassignButton: {
    backgroundColor: '#DC3545',
  },
  disabledButton: {
    backgroundColor: '#999',
  },
  assignButtonText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: 'bold',
  },
  noStudentsText: {
    textAlign: 'center',
    marginTop: 50,
    fontSize: 16,
    color: '#777',
  },
});

export default AssignStudentsScreen;
