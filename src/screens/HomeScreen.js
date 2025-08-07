import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Alert,
  Image,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { storage } from '../utils/storage';

const HomeScreen = ({ navigation }) => {
  const [userData, setUserData] = useState(null);
  const [userType, setUserType] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadUserData();
  }, []);

  const loadUserData = async () => {
    try {
      const { userData: storedUserData, userType: storedUserType } = await storage.getUserData();
      setUserData(storedUserData);
      setUserType(storedUserType);
    } catch (error) {
      console.error('Error loading user data:', error);
      Alert.alert('Error', 'Failed to load user data');
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = async () => {
    Alert.alert(
      'Confirm Logout',
      'Are you sure you want to logout?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Logout',
          style: 'destructive',
          onPress: async () => {
            try {
              await storage.clearUserData();
              navigation.replace('Login');
            } catch (error) {
              console.error('Logout error:', error);
              Alert.alert('Error', 'Failed to logout');
            }
          },
        },
      ]
    );
  };

  const renderTeacherHome = () => (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <View style={styles.profileSection}>
          <View style={styles.avatarContainer}>
            {userData?.img ? (
              <Image source={{ uri: userData.img }} style={styles.avatar} />
            ) : (
              <View style={styles.avatarPlaceholder}>
                <Ionicons name="person" size={40} color="#4A90E2" />
              </View>
            )}
          </View>
          <View style={styles.welcomeContainer}>
            <Text style={styles.welcomeText}>Welcome back,</Text>
            <Text style={styles.userName}>{userData?.fullname || 'Teacher'}</Text>
            <Text style={styles.userInfo}>Teacher ID: {userData?.teacherId}</Text>
          </View>
        </View>
        <TouchableOpacity onPress={handleLogout} style={styles.logoutButton}>
          <Ionicons name="log-out-outline" size={24} color="#E74C3C" />
        </TouchableOpacity>
      </View>

      <View style={styles.statsContainer}>
        <View style={styles.statCard}>
          <Ionicons name="school" size={30} color="#4A90E2" />
          <Text style={styles.statNumber}>--</Text>
          <Text style={styles.statLabel}>Students</Text>
        </View>
        <View style={styles.statCard}>
          <Ionicons name="book" size={30} color="#27AE60" />
          <Text style={styles.statNumber}>--</Text>
          <Text style={styles.statLabel}>Classes</Text>
        </View>
        <View style={styles.statCard}>
          <Ionicons name="checkmark-circle" size={30} color="#F39C12" />
          <Text style={styles.statNumber}>--</Text>
          <Text style={styles.statLabel}>Assignments</Text>
        </View>
      </View>

      <View style={styles.menuContainer}>
        <Text style={styles.menuTitle}>Quick Actions</Text>
        
        <TouchableOpacity style={styles.menuItem}>
          <View style={styles.menuItemContent}>
            <View style={styles.menuIconContainer}>
              <Ionicons name="people" size={24} color="#4A90E2" />
            </View>
            <View style={styles.menuTextContainer}>
              <Text style={styles.menuItemTitle}>Manage Students</Text>
              <Text style={styles.menuItemSubtitle}>View and manage your students</Text>
            </View>
            <Ionicons name="chevron-forward" size={20} color="#BDC3C7" />
          </View>
        </TouchableOpacity>

        <TouchableOpacity style={styles.menuItem}>
          <View style={styles.menuItemContent}>
            <View style={styles.menuIconContainer}>
              <Ionicons name="create" size={24} color="#27AE60" />
            </View>
            <View style={styles.menuTextContainer}>
              <Text style={styles.menuItemTitle}>Create Assignment</Text>
              <Text style={styles.menuItemSubtitle}>Assign tasks to students</Text>
            </View>
            <Ionicons name="chevron-forward" size={20} color="#BDC3C7" />
          </View>
        </TouchableOpacity>

        <TouchableOpacity style={styles.menuItem}>
          <View style={styles.menuItemContent}>
            <View style={styles.menuIconContainer}>
              <Ionicons name="analytics" size={24} color="#E67E22" />
            </View>
            <View style={styles.menuTextContainer}>
              <Text style={styles.menuItemTitle}>View Reports</Text>
              <Text style={styles.menuItemSubtitle}>Check student performance</Text>
            </View>
            <Ionicons name="chevron-forward" size={20} color="#BDC3C7" />
          </View>
        </TouchableOpacity>

        <TouchableOpacity style={styles.menuItem}>
          <View style={styles.menuItemContent}>
            <View style={styles.menuIconContainer}>
              <Ionicons name="megaphone" size={24} color="#9B59B6" />
            </View>
            <View style={styles.menuTextContainer}>
              <Text style={styles.menuItemTitle}>Announcements</Text>
              <Text style={styles.menuItemSubtitle}>Post updates and notifications</Text>
            </View>
            <Ionicons name="chevron-forward" size={20} color="#BDC3C7" />
          </View>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );

  const renderStudentHome = () => (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <View style={styles.profileSection}>
          <View style={styles.avatarContainer}>
            {userData?.img ? (
              <Image source={{ uri: userData.img }} style={styles.avatar} />
            ) : (
              <View style={styles.avatarPlaceholder}>
                <Ionicons name="person" size={40} color="#27AE60" />
              </View>
            )}
          </View>
          <View style={styles.welcomeContainer}>
            <Text style={styles.welcomeText}>Welcome back,</Text>
            <Text style={styles.userName}>{userData?.fullname || 'Student'}</Text>
            <Text style={styles.userInfo}>
              {userData?.class} - {userData?.section} | Student ID: {userData?.studentId}
            </Text>
          </View>
        </View>
        <TouchableOpacity onPress={handleLogout} style={styles.logoutButton}>
          <Ionicons name="log-out-outline" size={24} color="#E74C3C" />
        </TouchableOpacity>
      </View>

      <View style={styles.statsContainer}>
        <View style={styles.statCard}>
          <Ionicons name="book-outline" size={30} color="#27AE60" />
          <Text style={styles.statNumber}>--</Text>
          <Text style={styles.statLabel}>Subjects</Text>
        </View>
        <View style={styles.statCard}>
          <Ionicons name="checkmark-done" size={30} color="#4A90E2" />
          <Text style={styles.statNumber}>--</Text>
          <Text style={styles.statLabel}>Completed</Text>
        </View>
        <View style={styles.statCard}>
          <Ionicons name="trophy" size={30} color="#F39C12" />
          <Text style={styles.statNumber}>--</Text>
          <Text style={styles.statLabel}>Average</Text>
        </View>
      </View>

      <View style={styles.menuContainer}>
        <Text style={styles.menuTitle}>Student Portal</Text>
        
        <TouchableOpacity style={styles.menuItem}>
          <View style={styles.menuItemContent}>
            <View style={styles.menuIconContainer}>
              <Ionicons name="library" size={24} color="#27AE60" />
            </View>
            <View style={styles.menuTextContainer}>
              <Text style={styles.menuItemTitle}>My Courses</Text>
              <Text style={styles.menuItemSubtitle}>View your enrolled subjects</Text>
            </View>
            <Ionicons name="chevron-forward" size={20} color="#BDC3C7" />
          </View>
        </TouchableOpacity>

        <TouchableOpacity style={styles.menuItem}>
          <View style={styles.menuItemContent}>
            <View style={styles.menuIconContainer}>
              <Ionicons name="document-text" size={24} color="#4A90E2" />
            </View>
            <View style={styles.menuTextContainer}>
              <Text style={styles.menuItemTitle}>Assignments</Text>
              <Text style={styles.menuItemSubtitle}>View and submit assignments</Text>
            </View>
            <Ionicons name="chevron-forward" size={20} color="#BDC3C7" />
          </View>
        </TouchableOpacity>

        <TouchableOpacity style={styles.menuItem}>
          <View style={styles.menuItemContent}>
            <View style={styles.menuIconContainer}>
              <Ionicons name="bar-chart" size={24} color="#E67E22" />
            </View>
            <View style={styles.menuTextContainer}>
              <Text style={styles.menuItemTitle}>Grades</Text>
              <Text style={styles.menuItemSubtitle}>Check your academic performance</Text>
            </View>
            <Ionicons name="chevron-forward" size={20} color="#BDC3C7" />
          </View>
        </TouchableOpacity>

        <TouchableOpacity style={styles.menuItem}>
          <View style={styles.menuItemContent}>
            <View style={styles.menuIconContainer}>
              <Ionicons name="card" size={24} color="#9B59B6" />
            </View>
            <View style={styles.menuTextContainer}>
              <Text style={styles.menuItemTitle}>Fee Vouchers</Text>
              <Text style={styles.menuItemSubtitle}>Submit and track fee payments</Text>
            </View>
            <Ionicons name="chevron-forward" size={20} color="#BDC3C7" />
          </View>
        </TouchableOpacity>

        <TouchableOpacity style={styles.menuItem}>
          <View style={styles.menuItemContent}>
            <View style={styles.menuIconContainer}>
              <Ionicons name="notifications" size={24} color="#E74C3C" />
            </View>
            <View style={styles.menuTextContainer}>
              <Text style={styles.menuItemTitle}>Announcements</Text>
              <Text style={styles.menuItemSubtitle}>View latest updates</Text>
            </View>
            <Ionicons name="chevron-forward" size={20} color="#BDC3C7" />
          </View>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );

  if (loading) {
    return (
      <View style={[styles.container, styles.centerContent]}>
        <Text style={styles.loadingText}>Loading...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {userType === 'teacher' ? renderTeacherHome() : renderStudentHome()}
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
    fontSize: 16,
    color: '#7F8C8D',
  },
  header: {
    backgroundColor: '#FFFFFF',
    paddingTop: 50,
    paddingHorizontal: 20,
    paddingBottom: 20,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 5,
  },
  profileSection: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
  },
  avatarContainer: {
    marginRight: 15,
  },
  avatar: {
    width: 60,
    height: 60,
    borderRadius: 30,
  },
  avatarPlaceholder: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: '#F8F9FA',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#E1E8ED',
  },
  welcomeContainer: {
    flex: 1,
  },
  welcomeText: {
    fontSize: 14,
    color: '#7F8C8D',
    marginBottom: 2,
  },
  userName: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#2C3E50',
    marginBottom: 2,
  },
  userInfo: {
    fontSize: 12,
    color: '#7F8C8D',
  },
  logoutButton: {
    padding: 8,
  },
  statsContainer: {
    flexDirection: 'row',
    padding: 20,
    gap: 15,
  },
  statCard: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 20,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 3,
  },
  statNumber: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#2C3E50',
    marginTop: 10,
    marginBottom: 5,
  },
  statLabel: {
    fontSize: 12,
    color: '#7F8C8D',
    textAlign: 'center',
  },
  menuContainer: {
    padding: 20,
  },
  menuTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#2C3E50',
    marginBottom: 15,
  },
  menuItem: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  menuItemContent: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
  },
  menuIconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#F8F9FA',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 15,
  },
  menuTextContainer: {
    flex: 1,
  },
  menuItemTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#2C3E50',
    marginBottom: 2,
  },
  menuItemSubtitle: {
    fontSize: 14,
    color: '#7F8C8D',
  },
});

export default HomeScreen;
