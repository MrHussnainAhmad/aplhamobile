import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  ActivityIndicator,
  Alert,
  SafeAreaView,
  TouchableOpacity,
  Image,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { teacherAPI } from '../../services/api';

const StudentsListForGradingScreen = ({ route, navigation }) => {
  const { classId, className } = route.params;
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchStudentsInClass();
  }, [classId]);

  const fetchStudentsInClass = async () => {
    setLoading(true);
    try {
      // Using the existing API to get all students and filter by class
      const response = await teacherAPI.getAllStudents();
      if (response.data.students) {
        // Filter students who belong to this class
        const classStudents = response.data.students.filter(student => {
          return student.class && student.class === classId;
        });

        setStudents(classStudents);
      }
    } catch (error) {
      console.error('Error fetching students for grading:', error);
      Alert.alert('Error', 'Failed to load students for this class.');
    } finally {
      setLoading(false);
    }
  };

  const getInitials = (name) => {
    if (!name) return 'S';
    return name
      .split(' ')
      .map(word => word.charAt(0))
      .join('')
      .toUpperCase()
      .substring(0, 2);
  };

  const renderStudentItem = ({ item: student }) => (
    <TouchableOpacity
      style={styles.studentCard}
      onPress={() => navigation.navigate('GradeNow', { studentId: student._id, studentName: student.fullname })}
    >
      <View style={styles.studentHeader}>
        <View style={styles.avatarContainer}>
          {student.profilePicture ? (
            <Image
              source={{ uri: student.profilePicture }}
              style={styles.avatar}
            />
          ) : (
            <View style={styles.avatarPlaceholder}>
              <Text style={styles.avatarText}>
                {getInitials(student.fullname)}
              </Text>
            </View>
          )}
        </View>

        <View style={styles.studentInfo}>
          <Text style={styles.studentName}>{student.fullname}</Text>
          <Text style={styles.studentEmail}>{student.email}</Text>
          <Text style={styles.studentId}>
            ID: {student.studentId || 'Not assigned'}
          </Text>
        </View>

        <View style={styles.statusContainer}>
          <View style={[
            styles.statusBadge,
            student.isVerified ? styles.verifiedBadge : styles.unverifiedBadge
          ]}>
            <Ionicons
              name={student.isVerified ? 'checkmark-circle' : 'alert-circle'}
              size={16}
              color="#FFFFFF"
            />
            <Text style={styles.statusText}>
              {student.isVerified ? 'Verified' : 'Unverified'}
            </Text>
          </View>
        </View>
      </View>
    </TouchableOpacity>
  );

  const renderEmptyState = () => (
    <View style={styles.emptyContainer}>
      <Ionicons name="school-outline" size={80} color="#BDC3C7" />
      <Text style={styles.emptyTitle}>No Students Enrolled</Text>
      <Text style={styles.emptyText}>
        There are no students currently enrolled in "{className}" class.
      </Text>
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
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-back" size={24} color="#2C3E50" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Students in {className}</Text>
        <View style={styles.headerRight} />
      </View>

      

        <FlatList
        data={students}
        keyExtractor={(item) => item._id}
        renderItem={renderStudentItem}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={[styles.listContent, students.length === 0 && { flexGrow: 1, justifyContent: 'center' }]}
        ListEmptyComponent={renderEmptyState}
      />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F7FA',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F5F7FA',
  },
  loadingText: {
    marginTop: 10,
    fontSize: 16,
    color: '#7F8C8D',
  },
  header: {
    backgroundColor: '#FFFFFF',
    paddingTop: 10,
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
  
  
  listContent: {
    padding: 20,
    paddingBottom: 20,
  },
  studentCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 3,
  },
  studentHeader: {
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  avatarContainer: {
    marginRight: 12,
  },
  avatar: {
    width: 50,
    height: 50,
    borderRadius: 25,
  },
  avatarPlaceholder: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: '#4A90E2',
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatarText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#FFFFFF',
  },
  studentInfo: {
    flex: 1,
    marginRight: 12,
  },
  studentName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#2C3E50',
    marginBottom: 4,
  },
  studentEmail: {
    fontSize: 14,
    color: '#7F8C8D',
    marginBottom: 2,
  },
  studentId: {
    fontSize: 12,
    color: '#95A5A6',
  },
  statusContainer: {
    alignItems: 'flex-end',
  },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  verifiedBadge: {
    backgroundColor: '#27AE60',
  },
  unverifiedBadge: {
    backgroundColor: '#E74C3C',
  },
  statusText: {
    fontSize: 12,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginLeft: 4,
  },
  emptyContainer: {
    flexGrow: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 40,
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#7F8C8D',
    marginTop: 16,
    marginBottom: 8,
  },
  emptyText: {
    fontSize: 16,
    color: '#95A5A6',
    textAlign: 'center',
    lineHeight: 24,
  },
});

export default StudentsListForGradingScreen;