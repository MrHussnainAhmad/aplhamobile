import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';

const MainAttendanceScreen = () => {
  const navigation = useNavigation();

  const handleStudentAttendance = () => {
    navigation.navigate('StudentAttendance');
  };

  const handleTeacherAttendance = () => {
    navigation.navigate('TeacherAttendance');
  };

  const handleAttendanceRecord = () => {
    navigation.navigate('AttendanceRecord');
  };

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Attendance Management</Text>
        <Text style={styles.headerSubtitle}>Manage student and teacher attendance</Text>
      </View>

      <View style={styles.menuContainer}>
        <TouchableOpacity 
          style={styles.menuItem}
          onPress={handleStudentAttendance}
        >
          <View style={styles.menuItemContent}>
            <View style={styles.menuIconContainer}>
              <Ionicons name="school" size={28} color="#4A90E2" />
            </View>
            <View style={styles.menuTextContainer}>
              <Text style={styles.menuItemTitle}>Student Attendance</Text>
              <Text style={styles.menuItemSubtitle}>Mark attendance for students by class</Text>
            </View>
            <Ionicons name="chevron-forward" size={20} color="#BDC3C7" />
          </View>
        </TouchableOpacity>

        <TouchableOpacity 
          style={styles.menuItem}
          onPress={handleTeacherAttendance}
        >
          <View style={styles.menuItemContent}>
            <View style={styles.menuIconContainer}>
              <Ionicons name="person" size={28} color="#27AE60" />
            </View>
            <View style={styles.menuTextContainer}>
              <Text style={styles.menuItemTitle}>Teacher Attendance</Text>
              <Text style={styles.menuItemSubtitle}>Mark attendance for verified teachers</Text>
            </View>
            <Ionicons name="chevron-forward" size={20} color="#BDC3C7" />
          </View>
        </TouchableOpacity>

        <TouchableOpacity 
          style={styles.menuItem}
          onPress={handleAttendanceRecord}
        >
          <View style={styles.menuItemContent}>
            <View style={styles.menuIconContainer}>
              <Ionicons name="analytics" size={28} color="#E67E22" />
            </View>
            <View style={styles.menuTextContainer}>
              <Text style={styles.menuItemTitle}>Attendance Records</Text>
              <Text style={styles.menuItemSubtitle}>View and manage attendance records</Text>
            </View>
            <Ionicons name="chevron-forward" size={20} color="#BDC3C7" />
          </View>
        </TouchableOpacity>
      </View>

      <View style={styles.infoContainer}>
        <View style={styles.infoCard}>
          <Ionicons name="information-circle" size={24} color="#3498DB" />
          <Text style={styles.infoTitle}>Quick Guide</Text>
          <Text style={styles.infoText}>
            • Select a class to mark student attendance{'\n'}
            • Only verified teachers can have attendance marked{'\n'}
            • Attendance records can be viewed and edited{'\n'}
            • Monthly reports are available for all users
          </Text>
        </View>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F7FA',
  },
  header: {
    backgroundColor: '#FFFFFF',
    paddingTop: 60,
    paddingHorizontal: 20,
    paddingBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 5,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#2C3E50',
    marginBottom: 5,
  },
  headerSubtitle: {
    fontSize: 14,
    color: '#7F8C8D',
  },
  menuContainer: {
    padding: 20,
  },
  menuItem: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    marginBottom: 15,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 3,
  },
  menuItemContent: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 20,
  },
  menuIconContainer: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: '#F8F9FA',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 15,
  },
  menuTextContainer: {
    flex: 1,
  },
  menuItemTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#2C3E50',
    marginBottom: 4,
  },
  menuItemSubtitle: {
    fontSize: 14,
    color: '#7F8C8D',
    lineHeight: 20,
  },
  infoContainer: {
    padding: 20,
  },
  infoCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 20,
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
    marginBottom: 10,
  },
  infoText: {
    fontSize: 14,
    color: '#7F8C8D',
    lineHeight: 20,
  },
});

export default MainAttendanceScreen;
