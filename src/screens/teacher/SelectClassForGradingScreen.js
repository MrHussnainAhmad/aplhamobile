import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
  SafeAreaView,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { userAPI } from '../../services/api';

const SelectClassForGradingScreen = ({ navigation }) => {
  const [teacherClasses, setTeacherClasses] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchTeacherClasses();
  }, []);

  const fetchTeacherClasses = async () => {
    setLoading(true);
    try {
      const response = await userAPI.getTeacherProfile();
      if (response.data.profile && response.data.profile.classes) {
        setTeacherClasses(response.data.profile.classes.filter(Boolean));
      }
    } catch (error) {
      console.error('Error fetching teacher classes for grading:', error);
      Alert.alert('Error', 'Failed to load your classes for grading.');
    } finally {
      setLoading(false);
    }
  };

  const renderClassItem = ({ item }) => (
    <TouchableOpacity
      style={styles.classItem}
      onPress={() => navigation.navigate('StudentsListForGrading', { classId: item._id, className: item.classNumber })}
    >
      <View style={styles.classContent}>
        <Text style={styles.className}>{item.classNumber}</Text>
        <Text style={styles.classHint}>Tap to view students for grading</Text>
      </View>
      <Ionicons name="chevron-forward" size={20} color="#BDC3C7" />
    </TouchableOpacity>
  );

  const renderEmptyState = () => (
    <View style={styles.emptyContainer}>
      <Ionicons name="school-outline" size={80} color="#BDC3C7" />
      <Text style={styles.emptyTitle}>No Classes Assigned</Text>
      <Text style={styles.emptyText}>
        You have no classes assigned. Please contact admin.
      </Text>
    </View>
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
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => navigation.goBack()}
        >
          <Ionicons name="arrow-back" size={24} color="#2C3E50" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Select a Class to Grade</Text>
        <View style={styles.headerRight} />
      </View>

      <FlatList
          data={teacherClasses}
          keyExtractor={(item, index) => item?._id || index.toString()}
          renderItem={renderClassItem}
          contentContainerStyle={[styles.listContent, teacherClasses.length === 0 && { flexGrow: 1, justifyContent: 'center' }]}
          ListEmptyComponent={renderEmptyState}
        />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
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
  header: {
    backgroundColor: '#FFFFFF',
    paddingTop: 10,
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
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#2C3E50',
  },
  backButton: {
    width: 24,
  },
  headerRight: {
    width: 24,
  },
  classItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#FFFFFF',
    padding: 15,
    borderRadius: 10,
    marginBottom: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
    marginHorizontal: 20,
  },
  classContent: {
    flex: 1,
  },
  className: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#2C3E50',
    marginBottom: 4,
  },
  classHint: {
    fontSize: 14,
    color: '#7F8C8D',
    fontStyle: 'italic',
  },
  listContent: {
    paddingVertical: 20,
  },
  emptyContainer: {
    flexGrow: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 40,
  },
  
  emptyTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#7F8C8D',
    marginTop: 16,
    marginBottom: 8,
  },
  emptyText: {
    fontSize: 16,
    color: '#95A5A6',
    textAlign: 'center',
    lineHeight: 24,
  },
});

export default SelectClassForGradingScreen;