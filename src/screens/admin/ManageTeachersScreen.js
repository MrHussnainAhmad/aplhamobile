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

  const renderTeacherItem = ({ item }) => (
    <View style={styles.teacherCard}>
      <View style={styles.teacherInfo}>
        <View style={styles.avatarPlaceholder}>
          <Ionicons name="person" size={30} color="#4A90E2" />
        </View>
        <View style={styles.teacherDetails}>
          <Text style={styles.teacherName}>{item.fullname}</Text>
          <Text style={styles.teacherEmail}>{item.email}</Text>
          <Text style={[styles.teacherId, !item.teacherId && styles.idMissing]}>
            ID: {item.teacherId || 'Not Assigned'}
          </Text>
        </View>
      </View>
      <View style={styles.actionsContainer}>
        <TouchableOpacity onPress={() => handleUpdateTeacher(item)} style={styles.actionButton}>
          <Ionicons name="create-outline" size={24} color="#F39C12" />
        </TouchableOpacity>
        <TouchableOpacity onPress={() => handleDeleteTeacher(item._id)} style={styles.actionButton}>
          <Ionicons name="trash-outline" size={24} color="#E74C3C" />
        </TouchableOpacity>
      </View>
    </View>
  );

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
        <Text style={styles.title}>Manage Teachers</Text>
        <TouchableOpacity onPress={() => navigation.navigate('CreateTeacherScreen')} style={styles.addButton}>
          <Ionicons name="add" size={24} color="#FFFFFF" />
          <Text style={styles.addButtonText}>Add Teacher</Text>
        </TouchableOpacity>
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
        renderItem={renderTeacherItem}
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
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E1E8ED',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#2C3E50',
  },
  addButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#4A90E2',
    paddingHorizontal: 15,
    paddingVertical: 10,
    borderRadius: 8,
  },
  addButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 5,
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
  teacherCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 20,
    marginBottom: 15,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 3,
  },
  teacherInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  avatarPlaceholder: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: '#F8F9FA',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 15,
  },
  teacherDetails: {
    flex: 1,
  },
  teacherName: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#2C3E50',
  },
  teacherEmail: {
    fontSize: 14,
    color: '#7F8C8D',
    marginVertical: 2,
  },
  teacherId: {
    fontSize: 14,
    color: '#4A90E2',
    fontWeight: '600',
  },
  idMissing: {
    color: '#E74C3C',
    fontStyle: 'italic',
  },
  actionsContainer: {
    flexDirection: 'row',
    gap: 15,
  },
  actionButton: {
    padding: 8,
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
