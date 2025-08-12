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
import { useFocusEffect } from '@react-navigation/native';
import { studentAPI } from '../../services/api';
import { storage } from '../../utils/storage';

const StudentAssignmentsScreen = ({ navigation }) => {
  const [assignments, setAssignments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [userData, setUserData] = useState(null);

  useEffect(() => {
    loadUserData();
    loadAssignments();
  }, []);

  // Refresh assignments when screen comes into focus (e.g., after teacher profile update)
  useFocusEffect(
    React.useCallback(() => {
      loadAssignments();
    }, [])
  );

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
      const response = await studentAPI.getMyAssignments();
      setAssignments(response.data.assignments);
    } catch (error) {
      console.error('Error loading assignments:', error);
      Alert.alert('Error', 'Failed to load assignments');
    } finally {
      setLoading(false);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await loadAssignments();
    setRefreshing(false);
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

  const isAssignmentExpired = (dueDate) => {
    if (!dueDate) return false;
    return new Date(dueDate) < new Date();
  };

  const renderAssignmentItem = ({ item }) => {
    const expired = isAssignmentExpired(item.dueDate);
    
    return (
      <View style={[styles.assignmentCard, expired && styles.expiredCard]}>
        <View style={styles.assignmentHeader}>
          <View style={styles.assignmentInfo}>
            <Text style={styles.assignmentTitle}>{item.title}</Text>
            <Text style={styles.assignmentSubject}>{item.subject}</Text>
            <Text style={styles.teacherName}>By {item.teacherName}</Text>
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
            <Text style={[styles.detailText, expired && styles.expiredText]}>
              {item.dueDate ? `Due: ${formatDate(item.dueDate)}` : 'No due date'}
            </Text>
          </View>
          <View style={styles.detailItem}>
            <Ionicons name="time-outline" size={16} color="#7F8C8D" />
            <Text style={styles.detailText}>
              {expired ? 'Expired' : 'Active'}
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
            onPress={() => navigation.navigate('AssignmentDetail', { assignment: item })}
          >
            <Ionicons name="eye-outline" size={16} color="#4A90E2" />
            <Text style={styles.actionButtonText}>View Details</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#27AE60" />
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
        <Text style={styles.headerTitle}>Assignments</Text>
        <View style={styles.headerRight} />
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
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Ionicons name="document-text-outline" size={64} color="#BDC3C7" />
            <Text style={styles.emptyTitle}>No Assignments</Text>
            <Text style={styles.emptySubtitle}>
              Your teachers haven't posted any assignments yet
            </Text>
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
    paddingTop: 33,
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
  headerRight: {
    width: 24,
  },
  listContainer: {
    paddingHorizontal: 20,
    paddingBottom: 20,
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
  expiredCard: {
    opacity: 0.7,
    borderLeftWidth: 4,
    borderLeftColor: '#E74C3C',
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
    color: '#27AE60',
    fontWeight: '500',
    marginBottom: 2,
  },
  teacherName: {
    fontSize: 12,
    color: '#4A90E2',
    fontWeight: '500',
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
  expiredText: {
    color: '#E74C3C',
    fontWeight: '600',
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
  },
});

export default StudentAssignmentsScreen;
