import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  FlatList,
  ActivityIndicator,
  Alert,
  SafeAreaView,
  Image,
  Linking,
  RefreshControl,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { teacherAPI } from '../../services/api';
import { storage } from '../../utils/storage';

const TeacherAssignmentsScreen = ({ navigation }) => {
  const [assignments, setAssignments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [userData, setUserData] = useState(null);
  const [stats, setStats] = useState({
    total: 0,
    active: 0,
    expired: 0
  });

  useEffect(() => {
    loadUserData();
    loadAssignments();
    loadStats();
  }, []);

  const loadUserData = async () => {
    try {
      const data = await storage.getUserData();
      setUserData(data);
    } catch (error) {
      console.error('Error loading user data:', error);
    }
  };

  const loadAssignments = async () => {
    try {
      setLoading(true);
      const response = await teacherAPI.getTeacherAssignments();
      setAssignments(response.data.assignments);
    } catch (error) {
      console.error('Error loading assignments:', error);
      Alert.alert('Error', 'Failed to load assignments');
    } finally {
      setLoading(false);
    }
  };

  const loadStats = async () => {
    try {
      const response = await teacherAPI.getAssignmentStats();
      setStats(response.data.stats);
    } catch (error) {
      console.error('Error loading stats:', error);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await Promise.all([loadAssignments(), loadStats()]);
    setRefreshing(false);
  };

  const handleDeleteAssignment = (assignmentId) => {
    Alert.alert(
      'Delete Assignment',
      'Are you sure you want to delete this assignment?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: () => deleteAssignment(assignmentId),
        },
      ]
    );
  };

  const deleteAssignment = async (assignmentId) => {
    try {
      await teacherAPI.deleteAssignment(assignmentId);
      Alert.alert('Success', 'Assignment deleted successfully');
      loadAssignments();
      loadStats();
    } catch (error) {
      console.error('Error deleting assignment:', error);
      Alert.alert('Error', 'Failed to delete assignment');
    }
  };

  const openFile = (fileUrl) => {
    Linking.openURL(fileUrl).catch(err => {
      console.error('Error opening file:', err);
      Alert.alert('Error', 'Unable to open file');
    });
  };

  const getPriorityColor = (priority) => {
    switch (priority) {
      case 'low': return '#27AE60';
      case 'medium': return '#F39C12';
      case 'high': return '#E67E22';
      case 'urgent': return '#E74C3C';
      default: return '#7F8C8D';
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'active': return '#27AE60';
      case 'expired': return '#E74C3C';
      case 'archived': return '#7F8C8D';
      default: return '#7F8C8D';
    }
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString() + ' ' + date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  const renderAssignmentItem = ({ item }) => (
    <View style={styles.assignmentCard}>
      <View style={styles.assignmentHeader}>
        <View style={styles.assignmentInfo}>
          <Text style={styles.assignmentTitle}>{item.title}</Text>
          <Text style={styles.assignmentSubject}>{item.subject}</Text>
          <Text style={styles.assignmentClass}>{item.className}</Text>
        </View>
        <View style={styles.assignmentMeta}>
          <View style={[styles.priorityBadge, { backgroundColor: getPriorityColor(item.priority) + '20' }]}>
            <Text style={[styles.priorityText, { color: getPriorityColor(item.priority) }]}>
              {item.priority.toUpperCase()}
            </Text>
          </View>
          <View style={[styles.statusBadge, { backgroundColor: getStatusColor(item.status) + '20' }]}>
            <Text style={[styles.statusText, { color: getStatusColor(item.status) }]}>
              {item.status.toUpperCase()}
            </Text>
          </View>
        </View>
      </View>

      <Text style={styles.assignmentDescription} numberOfLines={3}>
        {item.description}
      </Text>

      <View style={styles.assignmentDetails}>
        <View style={styles.detailItem}>
          <Ionicons name="calendar-outline" size={16} color="#7F8C8D" />
          <Text style={styles.detailText}>{item.dueDate ? `Due: ${formatDate(item.dueDate)}` : 'No due date'}</Text>
        </View>
        <View style={styles.detailItem}>
          <Ionicons name="people-outline" size={16} color="#7F8C8D" />
          <Text style={styles.detailText}>
            {item.submittedCount || 0}/{item.totalStudents || 0} submitted
          </Text>
        </View>
      </View>

      {(item.images.length > 0 || item.attachments.length > 0) && (
        <View style={styles.attachmentsSection}>
          <Text style={styles.attachmentsTitle}>Attachments:</Text>
          <View style={styles.attachmentsList}>
            {item.images.map((image, index) => (
              <TouchableOpacity
                key={`image-${index}`}
                style={styles.attachmentItem}
                onPress={() => openFile(image)}
              >
                <Ionicons name="image-outline" size={16} color="#4A90E2" />
                <Text style={styles.attachmentText}>Image {index + 1}</Text>
              </TouchableOpacity>
            ))}
            {item.attachments.map((file, index) => (
              <TouchableOpacity
                key={`file-${index}`}
                style={styles.attachmentItem}
                onPress={() => openFile(file.fileUrl)}
              >
                <Ionicons name="document-outline" size={16} color="#27AE60" />
                <Text style={styles.attachmentText}>{file.fileName}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>
      )}

      <View style={styles.assignmentActions}>
        <TouchableOpacity
          style={styles.actionButton}
          onPress={() => navigation.navigate('EditAssignment', { assignment: item })}
        >
          <Ionicons name="create-outline" size={16} color="#4A90E2" />
          <Text style={styles.actionButtonText}>Edit</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.actionButton}
          onPress={() => handleDeleteAssignment(item._id)}
        >
          <Ionicons name="trash-outline" size={16} color="#E74C3C" />
          <Text style={[styles.actionButtonText, { color: '#E74C3C' }]}>Delete</Text>
        </TouchableOpacity>
      </View>
    </View>
  );

  const renderStats = () => (
    <View style={styles.statsContainer}>
      <View style={styles.statCard}>
        <Ionicons name="document-text-outline" size={24} color="#4A90E2" />
        <Text style={styles.statNumber}>{stats.total}</Text>
        <Text style={styles.statLabel}>Total</Text>
      </View>
      <View style={styles.statCard}>
        <Ionicons name="checkmark-circle-outline" size={24} color="#27AE60" />
        <Text style={styles.statNumber}>{stats.active}</Text>
        <Text style={styles.statLabel}>Active</Text>
      </View>
      <View style={styles.statCard}>
        <Ionicons name="time-outline" size={24} color="#E74C3C" />
        <Text style={styles.statNumber}>{stats.expired}</Text>
        <Text style={styles.statLabel}>Expired</Text>
      </View>
    </View>
  );

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#4A90E2" />
        <Text style={styles.loadingText}>Loading assignments...</Text>
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-back" size={24} color="#2C3E50" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>My Assignments</Text>
        <TouchableOpacity onPress={() => navigation.navigate('SelectClassForAssignment')}>
          <Ionicons name="add" size={24} color="#4A90E2" />
        </TouchableOpacity>
      </View>

      <FlatList
        data={assignments}
        renderItem={renderAssignmentItem}
        keyExtractor={(item) => item._id}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.listContainer}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
        ListHeaderComponent={renderStats}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Ionicons name="document-text-outline" size={64} color="#BDC3C7" />
            <Text style={styles.emptyTitle}>No Assignments Yet</Text>
            <Text style={styles.emptySubtitle}>
              Create your first assignment to get started
            </Text>
            <TouchableOpacity
              style={styles.createFirstButton}
              onPress={() => navigation.navigate('SelectClassForAssignment')}
            >
              <Ionicons name="add" size={20} color="#FFFFFF" />
              <Text style={styles.createFirstButtonText}>Create Assignment</Text>
            </TouchableOpacity>
          </View>
        }
      />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8F9FA',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 15,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E9ECEF',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#2C3E50',
  },
  listContainer: {
    paddingHorizontal: 20,
    paddingBottom: 20,
  },
  statsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 20,
  },
  statCard: {
    flex: 1,
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 15,
    marginHorizontal: 5,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 5,
  },
  statNumber: {
    fontSize: 24,
    fontWeight: '700',
    color: '#2C3E50',
    marginTop: 8,
  },
  statLabel: {
    fontSize: 12,
    color: '#7F8C8D',
    marginTop: 4,
  },
  assignmentCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 20,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 5,
  },
  assignmentHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  assignmentInfo: {
    flex: 1,
  },
  assignmentTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#2C3E50',
    marginBottom: 4,
  },
  assignmentSubject: {
    fontSize: 14,
    color: '#4A90E2',
    fontWeight: '500',
    marginBottom: 2,
  },
  assignmentClass: {
    fontSize: 12,
    color: '#7F8C8D',
  },
  assignmentMeta: {
    alignItems: 'flex-end',
  },
  priorityBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    marginBottom: 4,
  },
  priorityText: {
    fontSize: 10,
    fontWeight: '600',
  },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  statusText: {
    fontSize: 10,
    fontWeight: '600',
  },
  assignmentDescription: {
    fontSize: 14,
    color: '#34495E',
    lineHeight: 20,
    marginBottom: 12,
  },
  assignmentDetails: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  detailItem: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  detailText: {
    fontSize: 12,
    color: '#7F8C8D',
    marginLeft: 4,
  },
  attachmentsSection: {
    borderTopWidth: 1,
    borderTopColor: '#E9ECEF',
    paddingTop: 12,
    marginBottom: 12,
  },
  attachmentsTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#2C3E50',
    marginBottom: 8,
  },
  attachmentsList: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  attachmentItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F8F9FA',
    borderRadius: 8,
    paddingHorizontal: 8,
    paddingVertical: 4,
    marginRight: 8,
    marginBottom: 4,
  },
  attachmentText: {
    fontSize: 12,
    color: '#2C3E50',
    marginLeft: 4,
  },
  assignmentActions: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    borderTopWidth: 1,
    borderTopColor: '#E9ECEF',
    paddingTop: 12,
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    marginLeft: 16,
  },
  actionButtonText: {
    fontSize: 14,
    color: '#4A90E2',
    marginLeft: 4,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F8F9FA',
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: '#7F8C8D',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 40,
    paddingVertical: 60,
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#2C3E50',
    marginTop: 16,
    marginBottom: 8,
  },
  emptySubtitle: {
    fontSize: 16,
    color: '#7F8C8D',
    textAlign: 'center',
    lineHeight: 22,
    marginBottom: 24,
  },
  createFirstButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#4A90E2',
    borderRadius: 8,
    paddingHorizontal: 20,
    paddingVertical: 12,
  },
  createFirstButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
    marginLeft: 8,
  },
});

export default TeacherAssignmentsScreen;
