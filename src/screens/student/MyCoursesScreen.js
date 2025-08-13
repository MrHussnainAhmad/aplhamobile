import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, FlatList, ActivityIndicator, Alert, ScrollView } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { storage } from '../../utils/storage';
import { classesAPI } from '../../services/api';

const MyCoursesScreen = () => {
  const [courses, setCourses] = useState([]);
  const [timetable, setTimetable] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchCourses = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const { userData } = await storage.getUserData();
      console.log('MyCoursesScreen: userData:', userData);
      console.log('MyCoursesScreen: userData.class:', userData?.class);
      console.log('MyCoursesScreen: userData type:', typeof userData?.class);
      console.log('MyCoursesScreen: userData.className:', userData?.className);
      console.log('MyCoursesScreen: Full userData object:', JSON.stringify(userData, null, 2));
      
      if (!userData) {
        setError('User data not found. Please login again.');
        return;
      }
      
      // Handle different possible formats of class field
      let classId = userData.class;
      
      // If class is an object, extract the ID
      if (userData.class && typeof userData.class === 'object' && userData.class._id) {
        classId = userData.class._id;
      }
      
      // If class is still not available, try to construct it from className
      if (!classId && userData.className) {
        // This is a fallback - we'll need to find the class by name
        console.log('No class ID found, trying to find class by name:', userData.className);
        // For now, we'll show an error, but you could implement a lookup here
        setError('Class information is incomplete. Please contact your administrator.');
        setCourses([]);
        setTimetable({});
        return;
      }
      
      if (!classId) {
        setError('You are not assigned to any class yet. Please contact your administrator.');
        setCourses([]);
        setTimetable({});
        return;
      }
      
      const response = await classesAPI.getClassDetails(classId);
      console.log('MyCoursesScreen: response:', response);
      console.log('MyCoursesScreen: response.data:', response.data);
      console.log('MyCoursesScreen: response.data.class:', response.data.class);
      
      if (response.data.class) {
        if (response.data.class.subjects) {
          setCourses(response.data.class.subjects);
          console.log('MyCoursesScreen: courses:', response.data.class.subjects);
        }
        
        if (response.data.class.timetable) {
          setTimetable(response.data.class.timetable);
          console.log('MyCoursesScreen: timetable:', response.data.class.timetable);
          console.log('MyCoursesScreen: timetable keys:', Object.keys(response.data.class.timetable));
          console.log('MyCoursesScreen: timetable values:', Object.values(response.data.class.timetable));
        }
      } else {
        setCourses([]);
        setTimetable({});
        setError('No subjects found for your class. Please contact your administrator.');
      }
    } catch (error) {
      console.error('Error fetching courses:', error);
      console.error('Error details:', {
        message: error.message,
        response: error.response?.data,
        status: error.response?.status,
        statusText: error.response?.statusText
      });
      setError(`Failed to load courses: ${error.response?.data?.message || error.message}`);
      setCourses([]);
      setTimetable({});
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    console.log('MyCoursesScreen: useEffect called');
    fetchCourses();
  }, []);

  // Add focus effect to refresh data when screen comes into focus
  useFocusEffect(
    React.useCallback(() => {
      console.log('MyCoursesScreen: useFocusEffect called');
      fetchCourses();
    }, [])
  );

  const renderTimetableItem = ({ item }) => (
    <View style={styles.timetableRow}>
      <Text style={styles.timeCell}>{item.timeSlot}</Text>
      <Text style={styles.subjectCell}>{item.subject}</Text>
      <Text style={styles.teacherCell}>{item.teacher.fullname}</Text>
    </View>
  );

  const renderDayTimetable = (day, dayEntries) => {
    if (!dayEntries || dayEntries.length === 0) {
      return null;
    }

    return (
      <View key={day} style={styles.dayContainer}>
        <Text style={styles.dayHeader}>{day}</Text>
        <View style={styles.timetableContainer}>
          <View style={styles.timetableHeader}>
            <Text style={styles.headerCell}>Time</Text>
            <Text style={styles.headerCell}>Subject</Text>
            <Text style={styles.headerCell}>Teacher</Text>
          </View>
          <FlatList
            data={dayEntries}
            renderItem={renderTimetableItem}
            keyExtractor={(item, index) => `${day}-${item.subject}-${index}`}
            scrollEnabled={false}
          />
        </View>
      </View>
    );
  };

  const renderSimpleCoursesList = () => (
    <View style={styles.simpleContainer}>
      <Text style={styles.sectionTitle}>All Courses</Text>
      <View style={styles.table}>
        <View style={styles.header}>
          <Text style={styles.headerCell}>Subject</Text>
          <Text style={styles.headerCell}>Teacher</Text>
          <Text style={styles.headerCell}>Time</Text>
        </View>
        <FlatList
          data={courses}
          renderItem={({ item }) => (
            <View style={styles.row}>
              <Text style={styles.cell}>{item.name}</Text>
              <Text style={styles.cell}>{item.teacher ? item.teacher.fullname : 'N/A'}</Text>
              <Text style={styles.cell}>{item.timeSlot || 'N/A'}</Text>
            </View>
          )}
          keyExtractor={(item, index) => `${item.name}-${index}`}
        />
      </View>
    </View>
  );

  const renderEmptyState = () => (
    <View style={styles.emptyContainer}>
      <Text style={styles.emptyText}>
        {error || 'No courses available for your class.'}
      </Text>
      <Text style={styles.emptySubText}>
        Please contact your administrator if you believe this is an error.
      </Text>
    </View>
  );

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#007bff" />
        <Text style={styles.loadingText}>Loading your courses...</Text>
      </View>
    );
  }

  const hasTimetable = Object.keys(timetable).length > 0 && 
    Object.values(timetable).some(day => day && day.length > 0);

  // Debug logging
  console.log('MyCoursesScreen Debug:');
  console.log('  - timetable keys:', Object.keys(timetable));
  console.log('  - timetable values:', Object.values(timetable));
  console.log('  - hasTimetable:', hasTimetable);
  console.log('  - courses length:', courses.length);
  console.log('  - Full timetable object:', JSON.stringify(timetable, null, 2));

  return (
    <ScrollView style={styles.container}>
      <Text style={styles.title}>My Courses</Text>
      
      {hasTimetable ? (
        <View style={styles.timetableView}>
          <Text style={styles.sectionTitle}>Weekly Timetable</Text>
          {Object.entries(timetable).map(([day, entries]) => 
            renderDayTimetable(day, entries)
          )}
        </View>
      ) : courses.length > 0 ? (
        renderSimpleCoursesList()
      ) : (
        renderEmptyState()
      )}
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingTop: 20,
    backgroundColor: '#F5F7FA',
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#2C3E50',
    marginBottom: 25,
    textAlign: 'center',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F5F7FA',
  },
  loadingText: {
    marginTop: 10,
    fontSize: 18,
    color: '#7F8C8D',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
    backgroundColor: '#F5F7FA',
  },
  emptyText: {
    fontSize: 18,
    fontWeight: 'bold',
    textAlign: 'center',
    color: '#555',
  },
  emptySubText: {
    marginTop: 5,
    fontSize: 14,
    textAlign: 'center',
    color: '#888',
  },
  sectionTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#2C3E50',
    marginBottom: 15,
    textAlign: 'center',
  },
  timetableView: {
    paddingHorizontal: 15,
    paddingBottom: 20,
  },
  dayContainer: {
    backgroundColor: '#FFFFFF',
    borderRadius: 15,
    marginBottom: 20,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 5,
  },
  dayHeader: {
    backgroundColor: '#4A90E2',
    paddingVertical: 15,
    paddingHorizontal: 20,
    fontSize: 20,
    fontWeight: 'bold',
    color: '#FFFFFF',
    textAlign: 'center',
  },
  timetableContainer: {
    borderWidth: 1,
    borderColor: '#E1E8ED',
    borderRadius: 10,
    margin: 15,
    overflow: 'hidden',
  },
  timetableHeader: {
    flexDirection: 'row',
    backgroundColor: '#ECF0F1',
    paddingVertical: 12,
    paddingHorizontal: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#D5DBDB',
  },
  headerCell: {
    flex: 1,
    fontWeight: 'bold',
    color: '#34495E',
    fontSize: 14,
    textAlign: 'center',
  },
  timetableRow: {
    flexDirection: 'row',
    paddingVertical: 12,
    paddingHorizontal: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#F0F3F4',
    alignItems: 'center',
  },
  timetableRowLast: {
    borderBottomWidth: 0,
  },
  timeCell: {
    flex: 1,
    fontWeight: '600',
    color: '#555',
    fontSize: 13,
    textAlign: 'center',
  },
  subjectCell: {
    flex: 2,
    fontWeight: 'bold',
    color: '#2C3E50',
    fontSize: 15,
    textAlign: 'center',
  },
  teacherCell: {
    flex: 1,
    fontWeight: '500',
    color: '#4A90E2',
    fontSize: 13,
    textAlign: 'center',
  },
  // Simple courses list styles (if no timetable)
  simpleContainer: {
    paddingHorizontal: 15,
    paddingBottom: 20,
  },
  table: {
    borderWidth: 1,
    borderColor: '#E1E8ED',
    borderRadius: 10,
    overflow: 'hidden',
    backgroundColor: '#FFFFFF',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  row: {
    flexDirection: 'row',
    paddingVertical: 12,
    paddingHorizontal: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#F0F3F4',
    alignItems: 'center',
  },
  cell: {
    flex: 1,
    fontSize: 14,
    color: '#34495E',
    textAlign: 'center',
  },
});

export default MyCoursesScreen;
