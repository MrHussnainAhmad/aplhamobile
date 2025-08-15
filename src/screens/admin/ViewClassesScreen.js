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
  RefreshControl,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useFocusEffect } from '@react-navigation/native';
import { adminAPI } from '../../services/api';

const ViewClassesScreen = ({ navigation }) => {
  const [classes, setClasses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    fetchClasses();
  }, []);

  // Refresh classes when screen comes into focus
  useFocusEffect(
    React.useCallback(() => {
      fetchClasses();
    }, [])
  );

  const fetchClasses = async () => {
    try {
      setLoading(true);
      console.log('ViewClassesScreen: Calling adminAPI.getClassStats()');
      
      // Try to get classes with stats first
      try {
        const response = await adminAPI.getClassStats();
        console.log('ViewClassesScreen: Stats response received:', response.data);
        if (response.data.classes) {
          setClasses(response.data.classes);
          return;
        }
      } catch (statsError) {
        console.log('ViewClassesScreen: Stats API failed, trying regular classes API');
        console.error('Stats error:', statsError.response?.status, statsError.response?.data);
      }
      
      // Fallback to regular classes API
      const response = await adminAPI.getClasses();
      console.log('ViewClassesScreen: Regular response received:', response.data);
      if (response.data.classes) {
        // Add empty stats to classes
        const classesWithStats = response.data.classes.map(classItem => ({
          ...classItem,
          stats: {
            totalStudents: 0,
            assignedTeachers: 0,
            subjects: 0
          }
        }));
        setClasses(classesWithStats);
      }
    } catch (error) {
      console.error('Error fetching classes:', error);
      console.error('Error details:', {
        message: error.message,
        response: error.response?.data,
        status: error.response?.status,
        url: error.config?.url
      });
      Alert.alert('Error', 'Failed to load classes.');
    } finally {
      setLoading(false);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await fetchClasses();
    setRefreshing(false);
  };

  const getClassStats = (classItem) => {
    // Return actual stats from the API response
    return classItem.stats || {
      totalStudents: 0,
      assignedTeachers: 0,
      subjects: 0,
    };
  };

  const renderClassItem = ({ item: classItem }) => {
    const stats = getClassStats(classItem);
    const fullClassName = classItem.section ? `${classItem.classNumber}-${classItem.section}` : classItem.classNumber;

    return (
      <View style={styles.classCard}>
        <View style={styles.classHeader}>
          <View style={styles.classInfo}>
            <Text style={styles.className}>{fullClassName}</Text>
            <Text style={styles.classId}>ID: {classItem._id}</Text>
          </View>
          <View style={styles.classIcon}>
            <Ionicons name="school" size={32} color="#4A90E2" />
          </View>
        </View>

        <View style={styles.statsContainer}>
          <View style={styles.statItem}>
            <Ionicons name="people" size={20} color="#27AE60" />
            <Text style={styles.statNumber}>{stats.totalStudents}</Text>
            <Text style={styles.statLabel}>Students</Text>
          </View>
          <View style={styles.statItem}>
            <Ionicons name="person" size={20} color="#E67E22" />
            <Text style={styles.statNumber}>{stats.assignedTeachers}</Text>
            <Text style={styles.statLabel}>Teachers</Text>
          </View>
          <View style={styles.statItem}>
            <Ionicons name="library" size={20} color="#9B59B6" />
            <Text style={styles.statNumber}>{stats.subjects}</Text>
            <Text style={styles.statLabel}>Subjects</Text>
          </View>
        </View>

        <View style={styles.actionButtons}>
          <TouchableOpacity
            style={[styles.actionButton, styles.viewButton]}
            onPress={() => navigation.navigate('ManageClasses')}
          >
            <Ionicons name="settings" size={16} color="#4A90E2" />
            <Text style={styles.actionButtonText}>Manage</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.actionButton, styles.assignButton]}
            onPress={() => navigation.navigate('AssignClassesWithSearch', {
              classId: classItem._id,
              classNumber: classItem.classNumber,
              section: classItem.section,
            })}
          >
            <Ionicons name="person-add" size={16} color="#27AE60" />
            <Text style={styles.actionButtonText}>Assign Teachers</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.actionButton, styles.viewStudentsButton]}
            onPress={() => {
              // Navigate to view students in this specific class
              navigation.navigate('StudentsByClass', {
                classId: classItem._id,
                className: fullClassName
              });
            }}
          >
            <Ionicons name="people-circle" size={16} color="#E67E22" />
            <Text style={styles.actionButtonText}>View Students</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  };

  const renderEmptyState = () => (
    <View style={styles.emptyContainer}>
      <Ionicons name="school-outline" size={80} color="#BDC3C7" />
      <Text style={styles.emptyTitle}>No Classes Found</Text>
      <Text style={styles.emptyText}>
        No classes have been created yet. Create your first class in the Manage Classes section.
      </Text>
      <TouchableOpacity
        style={styles.createClassButton}
        onPress={() => navigation.navigate('ManageClasses')}
      >
        <Ionicons name="add-circle" size={20} color="#FFFFFF" />
        <Text style={styles.createClassButtonText}>Create Class</Text>
      </TouchableOpacity>
    </View>
  );

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#4A90E2" />
        <Text style={styles.loadingText}>Loading classes...</Text>
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-back" size={24} color="#2C3E50" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>View Classes</Text>
        <View style={styles.headerRight} />
      </View>

      <View style={styles.content}>
        <Text style={styles.pageTitle}>All Classes Overview</Text>
        <Text style={styles.pageSubtitle}>
          View comprehensive information about all classes in the system
        </Text>

        <FlatList
          data={classes}
          keyExtractor={(item) => item._id}
          renderItem={renderClassItem}
          contentContainerStyle={[
            styles.listContent,
            classes.length === 0 && { flexGrow: 1, justifyContent: 'center' }
          ]}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
          }
          ListEmptyComponent={renderEmptyState}
          showsVerticalScrollIndicator={false}
        />
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F7FA',
    paddingTop: 33,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F5F7FA',
  },
  loadingText: {
    marginTop: 10,
    fontSize: 16,
    color: '#7F8C8D',
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
  headerRight: {
    width: 24,
  },
  content: {
    flex: 1,
    padding: 20,
  },
  pageTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#2C3E50',
    marginBottom: 8,
    textAlign: 'center',
  },
  pageSubtitle: {
    fontSize: 16,
    color: '#7F8C8D',
    textAlign: 'center',
    marginBottom: 20,
    lineHeight: 22,
  },
  listContent: {
    paddingBottom: 20,
  },
  classCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 20,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  classHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  classInfo: {
    flex: 1,
  },
  className: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#2C3E50',
    marginBottom: 4,
  },
  classId: {
    fontSize: 12,
    color: '#95A5A6',
    fontFamily: 'monospace',
  },
  classIcon: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: '#F8F9FA',
    justifyContent: 'center',
    alignItems: 'center',
  },
  statsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginBottom: 16,
    paddingVertical: 12,
    backgroundColor: '#F8F9FA',
    borderRadius: 8,
  },
  statItem: {
    alignItems: 'center',
  },
  statNumber: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#2C3E50',
    marginTop: 4,
  },
  statLabel: {
    fontSize: 12,
    color: '#7F8C8D',
    marginTop: 2,
  },
  actionButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 8,
  },
  actionButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 10,
    paddingHorizontal: 12,
    borderRadius: 8,
    gap: 6,
  },
  viewButton: {
    backgroundColor: '#E3F2FD',
  },
  assignButton: {
    backgroundColor: '#E8F5E8',
  },
  viewStudentsButton: {
    backgroundColor: '#FFF3E0',
  },
  actionButtonText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#2C3E50',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 40,
  },
  emptyTitle: {
    fontSize: 22,
    fontWeight: '600',
    color: '#7F8C8D',
    marginTop: 24,
    marginBottom: 12,
    textAlign: 'center',
  },
  emptyText: {
    fontSize: 16,
    color: '#95A5A6',
    textAlign: 'center',
    lineHeight: 24,
    marginBottom: 24,
  },
  createClassButton: {
    backgroundColor: '#4A90E2',
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 8,
    gap: 8,
  },
  createClassButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
});

export default ViewClassesScreen;
