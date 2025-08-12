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
import { useNavigation } from '@react-navigation/native';
import { attendanceAPI, API_BASE_URL } from '../../services/api';

const TeacherAttendanceScreen = () => {
  const navigation = useNavigation();
  const [teachers, setTeachers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [classes, setClasses] = useState([]);
  const [selectedClass, setSelectedClass] = useState(null);

  useEffect(() => {
    loadTeachers();
    loadClasses();
  }, []);

  const loadTeachers = async () => {
    try {
      setLoading(true);
      const response = await attendanceAPI.getVerifiedTeachers();
      setTeachers(response.data.teachers || []);
    } catch (error) {
      console.error('Error loading teachers:', error);
      Alert.alert('Error', 'Failed to load teachers');
    } finally {
      setLoading(false);
    }
  };

  const loadClasses = async () => {
    // For teacher attendance, we don't need a specific class
    // Teachers can have attendance marked without being tied to a specific class
    setSelectedClass(null);
  };

  const handleMarkAttendance = (teacher, status) => {
    Alert.alert(
      'Mark Attendance',
      `Mark ${teacher.fullname} as ${status === 'P' ? 'Present' : 'Absent'}?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Mark',
          onPress: () => submitAttendance(teacher._id, status),
        },
      ]
    );
  };

  const submitAttendance = async (teacherId, status) => {
    try {
      const attendanceData = {
        teacherId,
        status,
        date: new Date().toISOString(),
        // classId is optional for teacher attendance
      };

      console.log('Marking teacher attendance:', attendanceData);
      await attendanceAPI.markTeacherAttendance(attendanceData);
      Alert.alert('Success', 'Attendance marked successfully');
      
      // Refresh teachers list
      loadTeachers();
    } catch (error) {
      console.error('Error marking attendance:', error);
      console.error('Error response:', error.response?.data);
      Alert.alert('Error', 'Failed to mark attendance');
    }
  };

  const renderTeacherItem = ({ item }) => (
    <View style={styles.teacherItem}>
      <View style={styles.teacherInfo}>
        <View style={styles.teacherHeader}>
          <Text style={styles.teacherName}>{item.fullname}</Text>
          <View style={styles.verifiedBadge}>
            <Ionicons name="checkmark-circle" size={16} color="#27AE60" />
            <Text style={styles.verifiedText}>Verified</Text>
          </View>
        </View>
        <Text style={styles.teacherId}>ID: {item.teacherId}</Text>
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
        <Text style={styles.loadingText}>Loading teachers...</Text>
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
        <Text style={styles.headerTitle}>Teacher Attendance</Text>
        <View style={styles.placeholder} />
      </View>

      <ScrollView style={styles.content}>
        <View style={styles.infoCard}>
          <Ionicons name="information-circle" size={24} color="#3498DB" />
          <Text style={styles.infoTitle}>Teacher Attendance</Text>
          <Text style={styles.infoText}>
            Only verified teachers can have attendance marked. 
            Select a teacher and mark them as present or absent.
          </Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>
            Verified Teachers ({teachers.length} remaining for today)
          </Text>
          
          {teachers.length > 0 ? (
            <FlatList
              data={teachers}
              renderItem={renderTeacherItem}
              keyExtractor={(item) => item._id}
              scrollEnabled={false}
              showsVerticalScrollIndicator={false}
            />
          ) : (
            <View style={styles.emptyContainer}>
              <Ionicons name="checkmark-circle" size={48} color="#27AE60" />
              <Text style={styles.emptyText}>All teachers marked for today!</Text>
              <Text style={styles.emptySubtext}>
                Attendance has been completed for all verified teachers. Teachers will reappear tomorrow.
              </Text>
            </View>
          )}
        </View>
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
  content: {
    flex: 1,
  },
  infoCard: {
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
  infoTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#2C3E50',
    marginTop: 10,
    marginBottom: 8,
  },
  infoText: {
    fontSize: 14,
    color: '#7F8C8D',
    lineHeight: 20,
  },
  section: {
    padding: 20,
    paddingTop: 0,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#2C3E50',
    marginBottom: 15,
  },
  teacherItem: {
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
  teacherInfo: {
    marginBottom: 12,
  },
  teacherHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 4,
  },
  teacherName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#2C3E50',
    flex: 1,
  },
  verifiedBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#E8F5E8',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    gap: 4,
  },
  verifiedText: {
    fontSize: 12,
    color: '#27AE60',
    fontWeight: '600',
  },
  teacherId: {
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
    marginBottom: 8,
  },
  emptySubtext: {
    fontSize: 14,
    color: '#BDC3C7',
    textAlign: 'center',
    paddingHorizontal: 20,
  },
});

export default TeacherAttendanceScreen;
