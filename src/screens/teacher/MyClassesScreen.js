import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { userAPI } from '../../services/api'; // Assuming userAPI has getTeacherProfile

const MyClassesScreen = ({ navigation }) => {
  const [teacherClasses, setTeacherClasses] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchTeacherClasses();
  }, []);

  const fetchTeacherClasses = async () => {
    setLoading(true);
    try {
      const response = await userAPI.getTeacherProfile();
      console.log('Teacher Profile Response in MyClassesScreen:', response.data);
      if (response.data.profile && response.data.profile.classes) {
        setTeacherClasses(response.data.profile.classes);
      }
    } catch (error) {
      console.error('Error fetching teacher classes:', error);
      Alert.alert('Error', 'Failed to load your classes.');
    } finally {
      setLoading(false);
    }
  };

  const renderClassItem = ({ item }) => (
    <TouchableOpacity 
      style={styles.classItem}
      onPress={() => navigation.navigate('AssignStudents', { classId: item._id, className: item.name })}
    >
      <Text style={styles.className}>{item.name}</Text>
    </TouchableOpacity>
  );

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#007BFF" />
        <Text style={styles.loadingText}>Loading your classes...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>My Assigned Classes</Text>
      {teacherClasses.length === 0 ? (
        <Text style={styles.noClassesText}>No classes assigned yet.</Text>
      ) : (
        <FlatList
          data={teacherClasses}
          keyExtractor={(item) => item._id}
          renderItem={renderClassItem}
          contentContainerStyle={styles.listContent}
        />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: '#F8F9FA',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F8F9FA',
  },
  loadingText: {
    marginTop: 10,
    fontSize: 16,
    color: '#555',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
    color: '#333',
    textAlign: 'center',
  },
  classItem: {
    backgroundColor: '#FFFFFF',
    padding: 15,
    borderRadius: 10,
    marginBottom: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  className: {
    fontSize: 18,
    color: '#333',
  },
  noClassesText: {
    textAlign: 'center',
    marginTop: 50,
    fontSize: 18,
    color: '#777',
  },
  listContent: {
    paddingBottom: 20,
  },
});

export default MyClassesScreen;
