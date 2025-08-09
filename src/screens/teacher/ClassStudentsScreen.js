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

const ClassStudentsScreen = ({ route, navigation }) => {
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
      console.log('All students response:', response.data);
      
      if (response.data.students) {
        // Filter students who belong to this class
        const classStudents = response.data.students.filter(student => {
          // Check if student has a class and it matches the current classId
          return student.class && student.class._id === classId;
        });
        
        console.log('Students in class:', classStudents);
        setStudents(classStudents);
      }
    } catch (error) {
      console.error('Error fetching students in class:', error);
      Alert.alert('Error', 'Failed to load students in this class.');
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
    <View style={styles.studentCard}>
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

      {student.subjects && student.subjects.length > 0 && (
        <View style={styles.subjectsSection}>
          <Text style={styles.subjectsLabel}>Enrolled Subjects:</Text>
          <View style={styles.subjectsContainer}>
            {student.subjects.map((subject, index) => (
              <View key={index} style={styles.subjectChip}>
                <Text style={styles.subjectText}>{subject}</Text>
              </View>
            ))}
          </View>
        </View>
      )}
    </View>
  );

  const renderEmptyState = () => (
    <View style={styles.emptyContainer}>
      <Ionicons name="school-outline" size={80} color="#BDC3C7" />
      <Text style={styles.emptyTitle}>No Students Enrolled</Text>
      <Text style={styles.emptyText}>
        There are no students currently enrolled in "{className}" class.
      </Text>
      <Text style={styles.emptySubtext}>
        Students need to have their class assigned in their profile to appear here.
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
        <Text style={styles.headerTitle}>Class Students</Text>
        <View style={styles.headerRight} />
      </View>

      <View style={styles.content}>
        <View style={styles.classInfoCard}>
          <View style={styles.classInfoHeader}>
            <Ionicons name="school" size={24} color="#4A90E2" />
            <Text style={styles.classTitle}>{className}</Text>
          </View>
          <Text style={styles.studentCount}>
            {students.length} student{students.length !== 1 ? 's' : ''} enrolled
          </Text>
        </View>

        {students.length === 0 ? (
          renderEmptyState()
        ) : (
          <FlatList
            data={students}
            keyExtractor={(item) => item._id}
            renderItem={renderStudentItem}
            showsVerticalScrollIndicator={false}
            contentContainerStyle={styles.listContent}
          />
        )}
      </View>
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
  content: {
    flex: 1,
    padding: 20,
  },
  classInfoCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 3,
  },
  classInfoHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  classTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#2C3E50',
    marginLeft: 12,
  },
  studentCount: {
    fontSize: 14,
    color: '#7F8C8D',
    marginLeft: 36,
  },
  listContent: {
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
  subjectsSection: {
    marginTop: 12,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: '#ECF0F1',
  },
  subjectsLabel: {
    fontSize: 12,
    fontWeight: 'bold',
    color: '#7F8C8D',
    marginBottom: 6,
  },
  subjectsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  subjectChip: {
    backgroundColor: '#E3F2FD',
    borderRadius: 12,
    paddingHorizontal: 8,
    paddingVertical: 4,
    marginRight: 6,
    marginBottom: 4,
  },
  subjectText: {
    fontSize: 11,
    color: '#1976D2',
    fontWeight: '500',
  },
  emptyContainer: {
    flex: 1,
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
    marginBottom: 8,
  },
  emptySubtext: {
    fontSize: 14,
    color: '#BDC3C7',
    textAlign: 'center',
    lineHeight: 20,
    fontStyle: 'italic',
  },
});

export default ClassStudentsScreen;
