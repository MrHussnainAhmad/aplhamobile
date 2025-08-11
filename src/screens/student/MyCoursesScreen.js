import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, FlatList, ActivityIndicator } from 'react-native';
import { storage } from '../../utils/storage';
import { classesAPI } from '../../services/api';

const MyCoursesScreen = () => {
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    console.log('MyCoursesScreen: useEffect called');
    const fetchCourses = async () => {
      try {
        const { userData } = await storage.getUserData();
        console.log('MyCoursesScreen: userData:', userData);
        if (userData && userData.class) {
          const response = await classesAPI.getClassDetails(userData.class);
          console.log('MyCoursesScreen: response:', response);
          setCourses(response.data.class.subjects);
          console.log('MyCoursesScreen: courses:', response.data.class.subjects);
        }
      } catch (error) {
        console.error('Error fetching courses:', error);
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

  if (loading) {
    return <ActivityIndicator size="large" color="#0000ff" />;
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>My Courses</Text>
      <View style={styles.table}>
        <View style={styles.header}>
          <Text style={styles.headerCell}>Subject</Text>
          <Text style={styles.headerCell}>Teacher</Text>
        </View>
        <FlatList
          data={courses}
          renderItem={renderItem}
          keyExtractor={(item) => item._id}
        />
      </View>
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
});

export default MyCoursesScreen;
