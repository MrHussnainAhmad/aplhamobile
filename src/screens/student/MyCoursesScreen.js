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
      
      if (!userData) {
        setError('User data not found. Please login again.');
        return;
      }
      
      if (!userData.class) {
        setError('You are not assigned to any class yet. Please contact your administrator.');
        setCourses([]);
        setTimetable({});
        return;
      }
      
      const response = await classesAPI.getClassDetails(userData.class);
      console.log('MyCoursesScreen: response:', response);
      
      if (response.data.class) {
        if (response.data.class.subjects) {
          setCourses(response.data.class.subjects);
          console.log('MyCoursesScreen: courses:', response.data.class.subjects);
        }
        
        if (response.data.class.timetable) {
          setTimetable(response.data.class.timetable);
          console.log('MyCoursesScreen: timetable:', response.data.class.timetable);
        }
      } else {
        setCourses([]);
        setTimetable({});
        setError('No subjects found for your class. Please contact your administrator.');
      }
    } catch (error) {
      console.error('Error fetching courses:', error);
      setError('Failed to load courses. Please try again later.');
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
    padding: 20,
    backgroundColor: '#f0f0f0',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
  },
  table: {
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 5,
  },
  header: {
    flexDirection: 'row',
    backgroundColor: '#f0f0f0',
    padding: 10,
    borderBottomWidth: 1,
    borderColor: '#ccc',
  },
  headerCell: {
    flex: 1,
    fontWeight: 'bold',
  },
  row: {
    flexDirection: 'row',
    padding: 10,
    borderBottomWidth: 1,
    borderColor: '#ccc',
  },
  cell: {
    flex: 1,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f0f0f0',
  },
  loadingText: {
    marginTop: 10,
    fontSize: 18,
    color: '#333',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
    backgroundColor: '#f0f0f0',
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
  timetableRow: {
    flexDirection: 'row',
    padding: 10,
    borderBottomWidth: 1,
    borderColor: '#eee',
  },
  timeCell: {
    flex: 1,
    fontWeight: 'bold',
    color: '#555',
  },
  subjectCell: {
    flex: 2,
    fontWeight: 'bold',
  },
  teacherCell: {
    flex: 1,
    fontWeight: 'bold',
    color: '#007bff',
  },
  dayContainer: {
    marginBottom: 20,
    backgroundColor: '#fff',
    borderRadius: 8,
    padding: 15,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  dayHeader: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 10,
    textAlign: 'center',
    color: '#333',
  },
  timetableContainer: {
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 5,
  },
  timetableHeader: {
    flexDirection: 'row',
    backgroundColor: '#f0f0f0',
    padding: 10,
    borderBottomWidth: 1,
    borderColor: '#ccc',
  },
  simpleContainer: {
    marginTop: 20,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 10,
    color: '#333',
  },
  timetableView: {
    marginTop: 20,
  },
});

export default MyCoursesScreen;
