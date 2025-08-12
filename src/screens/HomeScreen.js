import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Alert,
  Image,
  Linking,
  BackHandler,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { storage } from '../utils/storage';
import { adminAPI, teacherAPI, classesAPI } from '../services/api';
import { useFocusEffect } from '@react-navigation/native';

const HomeScreen = ({ navigation }) => {
  const [userData, setUserData] = useState(null);
  const [userType, setUserType] = useState(null);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({ teachers: 0, students: 0, posts: 0 });
  const [studentStats, setStudentStats] = useState({ subjects: 0, done: 0, average: 0 });
  const [supportPhoneNumber, setSupportPhoneNumber] = useState('');

  useEffect(() => {
    const unsubscribe = navigation.addListener('focus', () => {
      loadUserData();
    });

    return unsubscribe;
  }, [navigation]);

  // Prevent navigation back to login/signup screens
  useEffect(() => {
    const unsubscribe = navigation.addListener('beforeRemove', (e) => {
      // Prevent going back to login/signup screens
      if (e.target.includes('Login') || e.target.includes('Signup') || e.target.includes('UserType')) {
        e.preventDefault();
        Alert.alert(
          'Cannot Go Back',
          'You cannot go back to the login screen. Use the logout button instead.',
          [{ text: 'OK' }]
        );
      }
    });

    return unsubscribe;
  }, [navigation]);

  // Handle hardware back button only when HomeScreen is focused
  useFocusEffect(
    React.useCallback(() => {
      const backHandler = BackHandler.addEventListener('hardwareBackPress', () => {
        // Only show exit dialog when on HomeScreen
        Alert.alert(
          'Exit App',
          'Are you sure you want to exit the app?',
          [
            { text: 'Cancel', style: 'cancel' },
            { text: 'Exit', style: 'destructive', onPress: () => BackHandler.exitApp() },
          ]
        );
        return true; // Prevent default back behavior
      });

      return () => backHandler.remove();
    }, [])
  );

  useEffect(() => {
    loadUserData();
    loadAppConfig();
  }, []);

  useEffect(() => {
    if (userType === 'admin' || userType === 'teacher') {
      loadStats();
    } else if (userType === 'student') {
      loadStudentStats();
    }
  }, [userType]);

  // Refresh user data when screen comes into focus (e.g., after profile update)
  useFocusEffect(
    React.useCallback(() => {
      if (userType === 'student') {
        loadUserData();
        loadStudentStats();
      }
    }, [userType])
  );

  const loadUserData = async () => {
    try {
      const { userData: storedUserData, userType: storedUserType } = await storage.getUserData();
      console.log('HomeScreen: User data loaded from storage:', storedUserData);
      setUserData(storedUserData);
      setUserType(storedUserType);
    } catch (error) {
      console.error('Error loading user data:', error);
      Alert.alert('Error', 'Failed to load user data');
    } finally {
      setLoading(false);
    }
  };

  const loadAppConfig = async () => {
    try {
      const response = await adminAPI.getAppConfig();
      setSupportPhoneNumber(response.data.config.phoneNumber || '');
    } catch (error) {
      console.error('Error loading app config:', error);
    }
  };

  const loadStats = async () => {
    try {
      if (userType === 'admin') {
        const response = await adminAPI.getStats();
        setStats(response.data.stats);
      } else if (userType === 'teacher') {
        const response = await teacherAPI.getDashboardStats();
        console.log('Teacher Dashboard Stats Response:', response.data);
        setStats(response.data.stats);
      }
    } catch (error) {
      console.error('Error loading stats:', error);
      // Don't show alert for stats error, just keep default values
    }
  };

  const loadStudentStats = async () => {
    try {
      const { userData } = await storage.getUserData();
      console.log('HomeScreen loadStudentStats: userData:', userData);
      console.log('HomeScreen loadStudentStats: userData.class:', userData?.class);
      console.log('HomeScreen loadStudentStats: userData.className:', userData?.className);
      
      // Handle different possible formats of class field
      let classId = userData?.class;
      
      // If class is an object, extract the ID
      if (userData?.class && typeof userData.class === 'object' && userData.class._id) {
        classId = userData.class._id;
      }
      
      if (userData && classId) {
        console.log('HomeScreen loadStudentStats: Calling getClassDetails with class ID:', classId);
        const response = await classesAPI.getClassDetails(classId);
        console.log('HomeScreen loadStudentStats: API response:', response.data);
        
        if (response.data.class && response.data.class.subjects) {
          console.log('HomeScreen loadStudentStats: Setting subjects count to:', response.data.class.subjects.length);
          setStudentStats({
            subjects: response.data.class.subjects.length,
            done: 0, // Placeholder for future implementation
            average: 0 // Placeholder for future implementation
          });
        }
      } else {
        console.log('HomeScreen loadStudentStats: No class found in userData');
        setStudentStats({
          subjects: 0,
          done: 0,
          average: 0
        });
      }
    } catch (error) {
      console.error('Error loading student stats:', error);
      console.error('Error details:', {
        message: error.message,
        response: error.response?.data,
        status: error.response?.status
      });
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
              // Reset the entire navigation stack to prevent going back
              navigation.reset({
                index: 0,
                routes: [{ name: 'Login' }],
              });
            } catch (error) {
              console.error('Logout error:', error);
              Alert.alert('Error', 'Failed to logout');
            }
          },
        },
      ]
    );
  };

  const handleWhatsAppSupport = () => {
    if (supportPhoneNumber) {
      const whatsappUrl = `https://wa.me/${supportPhoneNumber}`;
      Linking.openURL(whatsappUrl).catch(err => console.error('An error occurred', err));
    } else {
      Alert.alert('Error', 'Support phone number not available.');
    }
  };

  const renderTeacherHome = () => (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <View style={styles.profileSection}>
          <TouchableOpacity 
            style={styles.avatarContainer}
            onPress={() => navigation.navigate('TeacherProfile')}
          >
            {userData?.img ? (
              <Image key={userData.img} source={{ uri: `${userData.img}?t=${new Date().getTime()}` }} style={styles.avatar} />
            ) : (
              console.log('HomeScreen: Using default image. userData.img is:', userData?.img),
              <View style={styles.avatarPlaceholder}>
                <Ionicons name="person" size={40} color="#4A90E2" />
              </View>
            )}
          </TouchableOpacity>
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
          <Text style={styles.statNumber}>{stats.students}</Text>
          <Text style={styles.statLabel}>Students</Text>
        </View>
        <View style={styles.statCard}>
          <Ionicons name="book" size={30} color="#27AE60" />
          <Text style={styles.statNumber}>{stats.classes}</Text>
          <Text style={styles.statLabel}>Classes</Text>
        </View>
        <View style={styles.statCard}>
          <Ionicons name="checkmark-circle" size={30} color="#F39C12" />
          <Text style={styles.statNumber}>{stats.assignments}</Text>
          <Text style={styles.statLabel}>Tasks</Text>
        </View>
      </View>

      <View style={styles.menuContainer}>
        <Text style={styles.menuTitle}>Quick Actions</Text>
        
        <TouchableOpacity 
          style={styles.menuItem}
          onPress={() => navigation.navigate('TeacherProfile')}
        >
          <View style={styles.menuItemContent}>
            <View style={styles.menuIconContainer}>
              <Ionicons name="person-circle" size={24} color="#8E44AD" />
            </View>
            <View style={styles.menuTextContainer}>
              <Text style={styles.menuItemTitle}>My Profile</Text>
              <Text style={styles.menuItemSubtitle}>View and update your profile</Text>
            </View>
            <Ionicons name="chevron-forward" size={20} color="#BDC3C7" />
          </View>
        </TouchableOpacity>

        {/* Grades management moved to admin panel */}

        <TouchableOpacity 
          style={styles.menuItem}
          onPress={() => navigation.navigate('ManageStudents')}
        >
          <View style={styles.menuItemContent}>
            <View style={styles.menuIconContainer}>
              <Ionicons name="people-outline" size={24} color="#8E44AD" />
            </View>
            <View style={styles.menuTextContainer}>
              <Text style={styles.menuItemTitle}>Manage Students</Text>
              <Text style={styles.menuItemSubtitle}>Add, edit, and manage student accounts</Text>
            </View>
            <Ionicons name="chevron-forward" size={20} color="#BDC3C7" />
          </View>
        </TouchableOpacity>

        <TouchableOpacity 
          style={styles.menuItem}
          onPress={() => navigation.navigate('SelectClassForAssignment')}
        >
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

        <TouchableOpacity style={styles.menuItem}
          onPress={() => navigation.navigate('MyClasses')}
        >
          <View style={styles.menuItemContent}>
            <View style={styles.menuIconContainer}>
              <Ionicons name="analytics" size={24} color="#E67E22" />
            </View>
            <View style={styles.menuTextContainer}>
              <Text style={styles.menuItemTitle}>My Classes</Text>
              <Text style={styles.menuItemSubtitle}>View your classes and students</Text>
            </View>
            <Ionicons name="chevron-forward" size={20} color="#BDC3C7" />
          </View>
        </TouchableOpacity>

        <TouchableOpacity 
          style={styles.menuItem}
          onPress={() => navigation.navigate('TeacherAssignments')}
        >
          <View style={styles.menuItemContent}>
            <View style={styles.menuIconContainer}>
              <Ionicons name="document-text-outline" size={24} color="#8E44AD" />
            </View>
            <View style={styles.menuTextContainer}>
              <Text style={styles.menuItemTitle}>My Assignments</Text>
              <Text style={styles.menuItemSubtitle}>View and manage your assignments</Text>
            </View>
            <Ionicons name="chevron-forward" size={20} color="#BDC3C7" />
          </View>
        </TouchableOpacity>

        <TouchableOpacity 
          style={styles.menuItem}
          onPress={() => navigation.navigate('TeacherSchoolPosts')}
        >
          <View style={styles.menuItemContent}>
            <View style={styles.menuIconContainer}>
              <Ionicons name="megaphone" size={24} color="#9B59B6" />
            </View>
            <View style={styles.menuTextContainer}>
              <Text style={styles.menuItemTitle}>School Posts</Text>
              <Text style={styles.menuItemSubtitle}>View latest updates from admin</Text>
            </View>
            <Ionicons name="chevron-forward" size={20} color="#BDC3C7" />
          </View>
        </TouchableOpacity>

        <TouchableOpacity 
          style={styles.menuItem}
          onPress={handleWhatsAppSupport}
        >
          <View style={styles.menuItemContent}>
            <View style={styles.menuIconContainer}>
              <Ionicons name="logo-whatsapp" size={24} color="#25D366" />
            </View>
            <View style={styles.menuTextContainer}>
              <Text style={styles.menuItemTitle}>Need Support?</Text>
              <Text style={styles.menuItemSubtitle}>Contact us via WhatsApp</Text>
            </View>
            <Ionicons name="chevron-forward" size={20} color="#BDC3C7" />
          </View>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );

  const renderAdminHome = () => (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <View style={styles.profileSection}>
          <View style={styles.avatarContainer}>
            <View style={styles.avatarPlaceholder}>
              <Ionicons name="shield-checkmark" size={40} color="#E74C3C" />
            </View>
          </View>
          <View style={styles.welcomeContainer}>
            <Text style={styles.welcomeText}>Welcome back,</Text>
            <Text style={styles.userName}>{userData?.fullname || 'Admin'}</Text>
            <Text style={styles.userInfo}>Administrator | {userData?.email}</Text>
          </View>
        </View>
        <TouchableOpacity onPress={handleLogout} style={styles.logoutButton}>
          <Ionicons name="log-out-outline" size={24} color="#E74C3C" />
        </TouchableOpacity>
      </View>

      <View style={styles.statsContainer}>
        <View style={styles.statCard}>
          <Ionicons name="people" size={30} color="#4A90E2" />
          <Text style={styles.statNumber}>{stats.teachers}</Text>
          <Text style={styles.statLabel}>Teachers</Text>
        </View>
        <View style={styles.statCard}>
          <Ionicons name="school" size={30} color="#27AE60" />
          <Text style={styles.statNumber}>{stats.students}</Text>
          <Text style={styles.statLabel}>Students</Text>
        </View>
        <View style={styles.statCard}>
          <Ionicons name="megaphone" size={30} color="#9B59B6" />
          <Text style={styles.statNumber}>{stats.posts}</Text>
          <Text style={styles.statLabel}>Posts</Text>
        </View>
      </View>

      <View style={styles.menuContainer}>
        <Text style={styles.menuTitle}>System Administration</Text>
        
        <TouchableOpacity 
          style={styles.menuItem}
          onPress={() => navigation.navigate('ManageTeachers')}
        >
          <View style={styles.menuItemContent}>
            <View style={styles.menuIconContainer}>
              <Ionicons name="person-add" size={24} color="#4A90E2" />
            </View>
            <View style={styles.menuTextContainer}>
              <Text style={styles.menuItemTitle}>Manage Teachers</Text>
              <Text style={styles.menuItemSubtitle}>Add, edit, and manage teacher accounts</Text>
            </View>
            <Ionicons name="chevron-forward" size={20} color="#BDC3C7" />
          </View>
        </TouchableOpacity>

        <TouchableOpacity 
          style={styles.menuItem}
          onPress={() => navigation.navigate('ManageStudents')}
        >
          <View style={styles.menuItemContent}>
            <View style={styles.menuIconContainer}>
              <Ionicons name="school" size={24} color="#27AE60" />
            </View>
            <View style={styles.menuTextContainer}>
              <Text style={styles.menuItemTitle}>Manage Students</Text>
              <Text style={styles.menuItemSubtitle}>Add, edit, and manage student accounts</Text>
            </View>
            <Ionicons name="chevron-forward" size={20} color="#BDC3C7" />
          </View>
        </TouchableOpacity>

        <TouchableOpacity 
          style={styles.menuItem}
          onPress={() => navigation.navigate('GradesManagement')}
        >
          <View style={styles.menuItemContent}>
            <View style={styles.menuIconContainer}>
              <Ionicons name="school-outline" size={24} color="#27AE60" />
            </View>
            <View style={styles.menuTextContainer}>
              <Text style={styles.menuItemTitle}>Manage Student Grades</Text>
              <Text style={styles.menuItemSubtitle}>Add, edit, and manage student grades</Text>
            </View>
            <Ionicons name="chevron-forward" size={20} color="#BDC3C7" />
          </View>
        </TouchableOpacity>

        <TouchableOpacity 
          style={styles.menuItem}
          onPress={() => navigation.navigate('ClassManagementMain')}
        >
          <View style={styles.menuItemContent}>
            <View style={styles.menuIconContainer}>
              <Ionicons name="analytics" size={24} color="#E67E22" />
            </View>
            <View style={styles.menuTextContainer}>
              <Text style={styles.menuItemTitle}>Manage Classes & More</Text>
              <Text style={styles.menuItemSubtitle}>View comprehensive system analytics</Text>
            </View>
            <Ionicons name="chevron-forward" size={20} color="#BDC3C7" />
          </View>
        </TouchableOpacity>

        <TouchableOpacity 
          style={styles.menuItem}
          onPress={() => navigation.navigate('SchoolPostsScreen')}
        >
          <View style={styles.menuItemContent}>
            <View style={styles.menuIconContainer}>
              <Ionicons name="megaphone" size={24} color="#9B59B6" />
            </View>
            <View style={styles.menuTextContainer}>
              <Text style={styles.menuItemTitle}>School Posts</Text>
              <Text style={styles.menuItemSubtitle}>Post and manage school-wide updates</Text>
            </View>
            <Ionicons name="chevron-forward" size={20} color="#BDC3C7" />
          </View>
        </TouchableOpacity>

        <TouchableOpacity 
          style={styles.menuItem}
          onPress={() => navigation.navigate('SystemDetail')}
        >
          <View style={styles.menuItemContent}>
            <View style={styles.menuIconContainer}>
              <Ionicons name="settings" size={24} color="#95A5A6" />
            </View>
            <View style={styles.menuTextContainer}>
              <Text style={styles.menuItemTitle}>System Detail</Text>
              <Text style={styles.menuItemSubtitle}>View app details and configurations</Text>
            </View>
            <Ionicons name="chevron-forward" size={20} color="#BDC3C7" />
          </View>
        </TouchableOpacity>

        <TouchableOpacity 
          style={styles.menuItem}
          onPress={() => navigation.navigate('FeeManagement')}
        >
          <View style={styles.menuItemContent}>
            <View style={styles.menuIconContainer}>
              <Ionicons name="card" size={24} color="#F39C12" />
            </View>
            <View style={styles.menuTextContainer}>
              <Text style={styles.menuItemTitle}>Fee Management</Text>
              <Text style={styles.menuItemSubtitle}>Monitor and approve fee submissions</Text>
            </View>
            <Ionicons name="chevron-forward" size={20} color="#BDC3C7" />
          </View>
        </TouchableOpacity>

        <TouchableOpacity 
          style={styles.menuItem}
          onPress={() => navigation.navigate('ManageApp')}
        >
          <View style={styles.menuItemContent}>
            <View style={styles.menuIconContainer}>
              <Ionicons name="phone-portrait" size={24} color="#8E44AD" />
            </View>
            <View style={styles.menuTextContainer}>
              <Text style={styles.menuItemTitle}>Manage App</Text>
              <Text style={styles.menuItemSubtitle}>Customize app logo and college name</Text>
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
          <TouchableOpacity 
            style={styles.avatarContainer}
            onPress={() => navigation.navigate('StudentProfile')}
          >
            {userData?.img ? (
              <Image source={{ uri: userData.img }} style={styles.avatar} />
            ) : (
              <View style={styles.avatarPlaceholder}>
                <Ionicons name="person" size={40} color="#27AE60" />
              </View>
            )}
          </TouchableOpacity>
          <View style={styles.welcomeContainer}>
            <Text style={styles.welcomeText}>Welcome back,</Text>
            <Text style={styles.userName}>{userData?.fullname || 'Student'}</Text>
            <Text style={styles.userInfo}>
              {userData?.class?.name} | Student ID: {userData?.studentId}
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
          <Text style={styles.statNumber}>{studentStats.subjects}</Text>
          <Text style={styles.statLabel}>Subjects</Text>
        </View>
        <View style={styles.statCard}>
          <Ionicons name="checkmark-done" size={30} color="#4A90E2" />
          <Text style={styles.statNumber}>{studentStats.done}</Text>
          <Text style={styles.statLabel}>Done</Text>
        </View>
        <View style={styles.statCard}>
          <Ionicons name="trophy" size={30} color="#F39C12" />
          <Text style={styles.statNumber}>{studentStats.average}</Text>
          <Text style={styles.statLabel}>Average</Text>
        </View>
      </View>

      <View style={styles.menuContainer}>
        <Text style={styles.menuTitle}>Student Portal</Text>
        
        <TouchableOpacity 
          style={styles.menuItem}
          onPress={() => navigation.navigate('StudentProfile')}
        >
          <View style={styles.menuItemContent}>
            <View style={styles.menuIconContainer}>
              <Ionicons name="person-circle" size={24} color="#8E44AD" />
            </View>
            <View style={styles.menuTextContainer}>
              <Text style={styles.menuItemTitle}>My Profile</Text>
              <Text style={styles.menuItemSubtitle}>View and update your profile</Text>
            </View>
            <Ionicons name="chevron-forward" size={20} color="#BDC3C7" />
          </View>
        </TouchableOpacity>

        <TouchableOpacity style={styles.menuItem}
          onPress={() => navigation.navigate('MyCourses')}
        >
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

        <TouchableOpacity 
          style={styles.menuItem}
          onPress={() => navigation.navigate('StudentAssignments')}
        >
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

        <TouchableOpacity style={styles.menuItem}
          onPress={() => navigation.navigate('Grades')}
        >
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

        <TouchableOpacity 
          style={styles.menuItem}
          onPress={() => navigation.navigate('UploadFeeVoucher')}
        >
          <View style={styles.menuItemContent}>
            <View style={styles.menuIconContainer}>
              <Ionicons name="card" size={24} color="#9B59B6" />
            </View>
            <View style={styles.menuTextContainer}>
              <Text style={styles.menuItemTitle}>Upload Fee Vouchers</Text>
              <Text style={styles.menuItemSubtitle}>Submit and track fee payments</Text>
            </View>
            <Ionicons name="chevron-forward" size={20} color="#BDC3C7" />
          </View>
        </TouchableOpacity>

        <TouchableOpacity 
          style={styles.menuItem}
          onPress={() => navigation.navigate('StudentSchoolPosts')}
        >
          <View style={styles.menuItemContent}>
            <View style={styles.menuIconContainer}>
              <Ionicons name="notifications" size={24} color="#E74C3C" />
            </View>
            <View style={styles.menuTextContainer}>
              <Text style={styles.menuItemTitle}>School Posts</Text>
              <Text style={styles.menuItemSubtitle}>View latest updates from admin</Text>
            </View>
            <Ionicons name="chevron-forward" size={20} color="#BDC3C7" />
          </View>
        </TouchableOpacity>

        <TouchableOpacity 
          style={styles.menuItem}
          onPress={handleWhatsAppSupport}
        >
          <View style={styles.menuItemContent}>
            <View style={styles.menuIconContainer}>
              <Ionicons name="logo-whatsapp" size={24} color="#25D366" />
            </View>
            <View style={styles.menuTextContainer}>
              <Text style={styles.menuItemTitle}>Need Support?</Text>
              <Text style={styles.menuItemSubtitle}>Contact us via WhatsApp</Text>
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
      {userType === 'admin' ? renderAdminHome() : 
       userType === 'teacher' ? renderTeacherHome() : 
       renderStudentHome()}
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