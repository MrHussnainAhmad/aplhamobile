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
import { Ionicons } from '@expo/vector-icons';
import { adminAPI } from '../../services/api';

const AssignClassesScreen = ({ route, navigation }) => {
  const { classId, className } = route.params;
  const [teachers, setTeachers] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchTeachers();
  }, []);

  const fetchTeachers = async () => {
    setLoading(true);
    try {
      const response = await adminAPI.getVerifiedTeachers();
      if (response.data.teachers) {
        setTeachers(response.data.teachers);
      }
    } catch (error) {
      console.error('Error fetching teachers:', error);
      Alert.alert('Error', 'Failed to load teachers.');
    } finally {
      setLoading(false);
    }
  };

  const handleAssignClass = async (teacherId) => {
    try {
      const response = await adminAPI.assignClass({ teacherId, classId });
      if (response.data.teacher) {
        setTeachers(teachers.map(t => 
          t._id === teacherId ? response.data.teacher : t
        ));
        Alert.alert('Success', response.data.message);
      }
    } catch (error) {
      console.error('Error assigning class:', error);
      Alert.alert('Error', error.response?.data?.message || 'Failed to assign class.');
    }
  };

  const handleUnassignClass = async (teacherId) => {
    try {
      const response = await adminAPI.unassignClass({ teacherId, classId });
      if (response.data.teacher) {
        setTeachers(teachers.map(t => 
          t._id === teacherId ? response.data.teacher : t
        ));
        Alert.alert('Success', response.data.message);
      }
    } catch (error) {
      console.error('Error unassigning class:', error);
      Alert.alert('Error', error.response?.data?.message || 'Failed to unassign class.');
    }
  };

  const renderTeacherItem = ({ item }) => {
    const isAssigned = item.classes.some(cls => cls._id === classId);
    return (
      <View style={styles.teacherItem}>
        <View style={styles.teacherInfo}>
          <Text style={styles.teacherName}>{item.fullname}</Text>
          <Text style={styles.teacherEmail}>{item.email}</Text>
          <Text style={styles.assignedClasses}>Assigned Classes: {item.classes.map(cls => cls.name).join(', ') || 'None'}</Text>
        </View>
        <TouchableOpacity
          style={[styles.assignButton, isAssigned ? styles.unassignButton : {}]}
          onPress={() => isAssigned ? handleUnassignClass(item._id) : handleAssignClass(item._id)}
        >
          <Text style={styles.assignButtonText}>
            {isAssigned ? 'Unassign' : 'Assign'}
          </Text>
        </TouchableOpacity>
      </View>
    );
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#007BFF" />
        <Text style={styles.loadingText}>Loading teachers...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Assign Classes to Teachers</Text>
      <Text style={styles.subtitle}>Class: {className}</Text>

      {teachers.length === 0 ? (
        <Text style={styles.noTeachersText}>No verified teachers found.</Text>
      ) : (
        <FlatList
          data={teachers}
          keyExtractor={(item) => item._id}
          renderItem={renderTeacherItem}
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
  teacherItem: {
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
  teacherInfo: {
    flex: 1,
    marginRight: 10,
  },
  teacherName: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
  },
  teacherEmail: {
    fontSize: 14,
    color: '#777',
    marginTop: 5,
  },
  assignedClasses: {
    fontSize: 12,
    color: '#999',
    marginTop: 5,
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
  assignButtonText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: 'bold',
  },
  noTeachersText: {
    textAlign: 'center',
    marginTop: 50,
    fontSize: 16,
    color: '#777',
  },
});

export default AssignClassesScreen;
