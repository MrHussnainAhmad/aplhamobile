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

const MyAttendanceRecordScreen = () => {
  const navigation = useNavigation();
  const route = useRoute();
  // For teacher's own record, we don't need type, id, name, classId, className from route params
  // We will get teacherId from the authenticated user context on the backend

  const [attendance, setAttendance] = useState([]);
  const [statistics, setStatistics] = useState({});
  const [loading, setLoading] = useState(true);
  const [currentMonth, setCurrentMonth] = useState(new Date().toISOString().slice(0, 7)); // YYYY-MM format

  useEffect(() => {
    loadAttendanceRecord();
  }, [currentMonth]);

  const loadAttendanceRecord = async () => {
    try {
      setLoading(true);
      // Call the teacher's own attendance API
      const response = await attendanceAPI.getMyAttendanceRecord(currentMonth);
      setAttendance(response.data.attendance || []);
      setStatistics(response.data.statistics || {});
    } catch (error) {
      console.error(`Error loading teacher's own attendance record:`, error);
      Alert.alert('Error', 'Failed to load your attendance record');
    } finally {
      setLoading(false);
    }
  };

  const handleMonthChange = (direction) => {
    const [year, month] = currentMonth.split('-').map(Number);
    let newYear = year;
    let newMonth = month;

    if (direction === 'prev') {
      if (month === 1) {
        newMonth = 12;
        newYear = year - 1;
      } else {
        newMonth = month - 1;
      }
    } else {
      if (month === 12) {
        newMonth = 1;
        newYear = year + 1;
      } else {
        newMonth = month + 1;
      }
    }

    const newMonthString = `${newYear}-${newMonth.toString().padStart(2, '0')}`;
    setCurrentMonth(newMonthString);
  };

  const handleEditAttendance = (attendanceItem) => {
    // Teachers cannot edit their own attendance records directly from this screen
    // This functionality is typically for admins
    Alert.alert(
      'Info',
      'You cannot edit attendance records from this screen. Please contact an administrator if you believe there is an error.'
    );
  };

  const getMonthName = (monthString) => {
    const [year, month] = monthString.split('-').map(Number);
    const date = new Date(year, month - 1);
    return date.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
  };

  const getDayName = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { weekday: 'short' });
  };

  const renderAttendanceItem = ({ item }) => (
    <TouchableOpacity
      style={styles.attendanceItem}
      onPress={() => handleEditAttendance(item)} // Keep for consistency, but will show info alert
    >
      <View style={styles.attendanceDate}>
        <Text style={styles.dayName}>{getDayName(item.date)}</Text>
        <Text style={styles.dateText}>
          {new Date(item.date).toLocaleDateString()}
        </Text>
      </View>
      <View style={[
        styles.statusBadge,
        item.status === 'P' ? styles.presentBadge :
        item.status === 'A' ? styles.absentBadge :
        styles.holidayBadge
      ]}>
        <Ionicons 
          name={item.status === 'P' ? 'checkmark' : item.status === 'A' ? 'close' : 'calendar'} 
          size={16} 
          color="#FFFFFF" 
        />
        <Text style={styles.statusText}>
          {item.status === 'P' ? 'Present' : item.status === 'A' ? 'Absent' : 'Holiday'}
        </Text>
      </View>
      <Ionicons name="chevron-forward" size={16} color="#BDC3C7" />
    </TouchableOpacity>
  );

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#4A90E2" />
        <Text style={styles.loadingText}>Loading your attendance record...</Text>
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
        <Text style={styles.headerTitle}>My Attendance Record</Text>
        <View style={styles.placeholder} />
      </View>

      <ScrollView style={styles.content}>
        <View style={styles.infoCard}>
          <Text style={styles.nameText}>Your Attendance</Text>
          <Text style={styles.classText}>View your monthly attendance summary and details.</Text>
        </View>

        <View style={styles.statsContainer}>
          <View style={styles.statCard}>
            <Ionicons name="calendar" size={24} color="#4A90E2" />
            <Text style={styles.statNumber}>{statistics.totalDays || 0}</Text>
            <Text style={styles.statLabel}>Total Days</Text>
          </View>
          <View style={styles.statCard}>
            <Ionicons name="checkmark-circle" size={24} color="#27AE60" />
            <Text style={styles.statNumber}>{statistics.presentDays || 0}</Text>
            <Text style={styles.statLabel}>Present</Text>
          </View>
          <View style={styles.statCard}>
            <Ionicons name="close-circle" size={24} color="#E74C3C" />
            <Text style={styles.statNumber}>{statistics.absentDays || 0}</Text>
            <Text style={styles.statLabel}>Absent</Text>
          </View>
          <View style={styles.statCard}>
            <Ionicons name="analytics" size={24} color="#F39C12" />
            <Text style={styles.statNumber}>{statistics.attendancePercentage || 0}%</Text>
            <Text style={styles.statLabel}>Percentage</Text>
          </View>
        </View>

        <View style={styles.monthSelector}>
          <TouchableOpacity
            style={styles.monthButton}
            onPress={() => handleMonthChange('prev')}
          >
            <Ionicons name="chevron-back" size={20} color="#4A90E2" />
          </TouchableOpacity>
          <Text style={styles.monthText}>{getMonthName(currentMonth)}</Text>
          <TouchableOpacity
            style={styles.monthButton}
            onPress={() => handleMonthChange('next')}
          >
            <Ionicons name="chevron-forward" size={20} color="#4A90E2" />
          </TouchableOpacity>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Daily Attendance</Text>
          
          {attendance.length > 0 ? (
            <FlatList
              data={attendance}
              renderItem={renderAttendanceItem}
              keyExtractor={(item) => item._id}
              scrollEnabled={false}
              showsVerticalScrollIndicator={false}
            />
          ) : (
            <View style={styles.emptyContainer}>
              <Ionicons name="calendar-outline" size={48} color="#BDC3C7" />
              <Text style={styles.emptyText}>No attendance records for this month</Text>
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
  nameText: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#2C3E50',
    marginBottom: 4,
  },
  classText: {
    fontSize: 16,
    color: '#7F8C8D',
    marginBottom: 2,
  },
  typeText: {
    fontSize: 14,
    color: '#7F8C8D',
  },
  statsContainer: {
    flexDirection: 'row',
    paddingHorizontal: 20,
    gap: 10,
  },
  statCard: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 3,
  },
  statNumber: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#2C3E50',
    marginTop: 8,
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 10,
    color: '#7F8C8D',
    textAlign: 'center',
  },
  monthSelector: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#FFFFFF',
    margin: 20,
    padding: 16,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 3,
  },
  monthButton: {
    padding: 8,
  },
  monthText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#2C3E50',
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
  attendanceItem: {
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
  attendanceDate: {
    flex: 1,
  },
  dayName: {
    fontSize: 14,
    fontWeight: '600',
    color: '#2C3E50',
    marginBottom: 2,
  },
  dateText: {
    fontSize: 14,
    color: '#7F8C8D',
  },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    marginRight: 12,
    gap: 4,
  },
  presentBadge: {
    backgroundColor: '#27AE60',
  },
  absentBadge: {
    backgroundColor: '#E74C3C',
  },
  holidayBadge: {
    backgroundColor: '#F39C12',
  },
  statusText: {
    color: '#FFFFFF',
    fontSize: 12,
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
});

export default MyAttendanceRecordScreen;
