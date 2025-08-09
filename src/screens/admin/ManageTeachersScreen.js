import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  FlatList,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
  RefreshControl,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { adminAPI } from '../../services/api';
import TeacherCard from '../../components/TeacherCard'; // Import the new TeacherCard component

const ManageTeachersScreen = ({ navigation }) => {
  const [teachers, setTeachers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [filteredTeachers, setFilteredTeachers] = useState([]);

  useEffect(() => {
    fetchTeachers();
  }, []);

  useEffect(() => {
    // Filter teachers based on search query
    const filtered = teachers.filter(teacher => 
      teacher.fullname.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (teacher.teacherId && teacher.teacherId.toLowerCase().includes(searchQuery.toLowerCase()))
    );
    setFilteredTeachers(filtered);
  }, [searchQuery, teachers]);

  const fetchTeachers = async () => {
    try {
      const response = await adminAPI.getAllTeachers();
      console.log('Fetched teachers data:', response.data.teachers);
      setTeachers(response.data.teachers);
    } catch (error) {
      console.error('Error fetching teachers:', error);
      Alert.alert('Error', 'Failed to fetch teachers');
    } finally {
      setLoading(false);
    }
  };

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    fetchTeachers().finally(() => setRefreshing(false));
  }, []);

  const handleVerifyTeacher = async (teacherId, isVerified) => {
    try {
      await adminAPI.verifyTeacher(teacherId, isVerified);
      Alert.alert('Success', `Teacher ${isVerified ? 'verified' : 'unverified'} successfully`);
      onRefresh(); // Refresh the list
    } catch (error) {
      console.error('Error verifying teacher:', error);
      Alert.alert('Error', 'Failed to verify teacher');
    }
  };

  const handleDeleteTeacher = async (teacherId) => {
    Alert.alert(
      'Confirm Deletion',
      'Are you sure you want to delete this teacher? This action is irreversible.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            try {
              await adminAPI.deleteTeacher(teacherId);
              Alert.alert('Success', 'Teacher deleted successfully');
              onRefresh(); // Refresh the list
            } catch (error) {
              console.error('Error deleting teacher:', error);
              Alert.alert('Error', 'Failed to delete teacher');
            }
          },
        },
      ]
    );
  };

  const handleUpdateTeacher = (teacher) => {
    navigation.navigate('UpdateTeacherScreen', { teacher });
  };

  const handleAssignTeacherId = (teacher) => {
    Alert.prompt(
      'Assign Teacher ID',
      `Enter teacher ID for ${teacher.fullname}:`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Assign',
          onPress: async (teacherId) => {
            if (!teacherId || !teacherId.trim()) {
              Alert.alert('Error', 'Please enter a valid teacher ID');
              return;
            }
            await assignTeacherId(teacher._id, teacherId.trim());
          },
        },
      ],
      'plain-text',
      teacher.teacherId || ''
    );
  };

  const assignTeacherId = async (teacherId, newTeacherId) => {
    try {
      await adminAPI.assignTeacherId(teacherId, newTeacherId);
      Alert.alert('Success', 'Teacher ID assigned successfully');
      onRefresh(); // Refresh the list
    } catch (error) {
      console.error('Error assigning teacher ID:', error);
      Alert.alert('Error', error.response?.data?.message || 'Failed to assign teacher ID');
    }
  };

  if (loading) {
    return (
      <View style={[styles.container, styles.centerContent]}>
        <ActivityIndicator size="large" color="#4A90E2" />
        <Text style={styles.loadingText}>Loading teachers...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-back" size={24} color="#2C3E50" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Manage Teachers</Text>
        <View style={styles.headerRight} />
      </View>

      <View style={styles.searchContainer}>
        <Ionicons name="search" size={20} color="#7F8C8D" style={styles.searchIcon} />
        <TextInput
          style={styles.searchInput}
          placeholder="Search by name or teacher ID..."
          value={searchQuery}
          onChangeText={setSearchQuery}
        />
      </View>

      <FlatList
        data={filteredTeachers}
        renderItem={({ item }) => (
          <TeacherCard 
            item={item} 
            onRefresh={onRefresh} 
            handleVerifyTeacher={handleVerifyTeacher}
            handleDeleteTeacher={handleDeleteTeacher}
            handleUpdateTeacher={handleUpdateTeacher}
          />
        )}
        keyExtractor={(item) => item._id}
        contentContainerStyle={styles.listContainer}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
        ListEmptyComponent={() => (
          <View style={styles.emptyContainer}>
            <Ionicons name="sad-outline" size={50} color="#BDC3C7" />
            <Text style={styles.emptyText}>No teachers found</Text>
            <Text style={styles.emptySubText}>Try refreshing or add a new teacher</Text>
          </View>
        )}
      />
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
    marginTop: 10,
    fontSize: 16,
    color: '#7F8C8D',
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
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#2C3E50',
  },
  headerRight: {
    width: 24,
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 8,
    margin: 20,
    paddingHorizontal: 15,
    borderWidth: 1,
    borderColor: '#E1E8ED',
  },
  searchIcon: {
    marginRight: 10,
  },
  searchInput: {
    flex: 1,
    height: 50,
    fontSize: 16,
    color: '#2C3E50',
  },
  listContainer: {
    paddingHorizontal: 20,
    paddingBottom: 20,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 100,
  },
  emptyText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#7F8C8D',
    marginTop: 10,
  },
  emptySubText: {
    fontSize: 14,
    color: '#BDC3C7',
    marginTop: 5,
  },
});

export default ManageTeachersScreen;
