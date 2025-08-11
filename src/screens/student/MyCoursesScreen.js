import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, FlatList, ActivityIndicator, Alert } from 'react-native';
import { storage } from '../../utils/storage';
import { classesAPI } from '../../services/api';

const MyCoursesScreen = () => {
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    console.log('MyCoursesScreen: useEffect called');
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
          return;
        }
        
        const response = await classesAPI.getClassDetails(userData.class);
        console.log('MyCoursesScreen: response:', response);
        
        if (response.data.class && response.data.class.subjects) {
          setCourses(response.data.class.subjects);
          console.log('MyCoursesScreen: courses:', response.data.class.subjects);
        } else {
          setCourses([]);
          setError('No subjects found for your class. Please contact your administrator.');
        }
      } catch (error) {
        console.error('Error fetching courses:', error);
        setError('Failed to load courses. Please try again later.');
        setCourses([]);
      } finally {
        setLoading(false);
      }
    };

    fetchCourses();
  }, []);

  const renderItem = ({ item }) => (
    <View style={styles.row}>
      <Text style={styles.cell}>{item.name}</Text>
      <Text style={styles.cell}>{item.teacher ? item.teacher.fullname : 'N/A'}</Text>
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

  return (
    <View style={styles.container}>
      <Text style={styles.title}>My Courses</Text>
      {courses.length > 0 ? (
        <View style={styles.table}>
          <View style={styles.header}>
            <Text style={styles.headerCell}>Subject</Text>
            <Text style={styles.headerCell}>Teacher</Text>
          </View>
          <FlatList
            data={courses}
            renderItem={renderItem}
            keyExtractor={(item, index) => `${item.name}-${index}`}
          />
        </View>
      ) : (
        renderEmptyState()
      )}
    </View>
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
});

export default MyCoursesScreen;
