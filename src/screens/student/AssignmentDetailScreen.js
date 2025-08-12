import React from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  Alert,
  Linking,
  Dimensions,
  Image,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';

const { width } = Dimensions.get('window');

const AssignmentDetailScreen = ({ navigation, route }) => {
  const { assignment } = route.params;

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  const formatTime = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const openFile = async (url) => {
    try {
      const supported = await Linking.canOpenURL(url);
      if (supported) {
        await Linking.openURL(url);
      } else {
        Alert.alert('Error', 'Cannot open this file type');
      }
    } catch (error) {
      Alert.alert('Error', 'Failed to open file');
    }
  };

  const getPriorityColor = (priority) => {
    switch (priority) {
      case 'urgent':
        return '#E74C3C';
      case 'high':
        return '#E67E22';
      case 'medium':
        return '#F39C12';
      case 'low':
        return '#27AE60';
      default:
        return '#7F8C8D';
    }
  };

  const getPriorityText = (priority) => {
    return priority.charAt(0).toUpperCase() + priority.slice(1);
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-back" size={24} color="#2C3E50" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Assignment Details</Text>
        <View style={styles.headerRight} />
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Assignment Header */}
        <View style={styles.assignmentHeader}>
          <View style={styles.titleContainer}>
            <Text style={styles.title}>{assignment.title}</Text>
            <View style={[styles.priorityBadge, { backgroundColor: getPriorityColor(assignment.priority) }]}>
              <Text style={styles.priorityText}>{getPriorityText(assignment.priority)}</Text>
            </View>
          </View>
          <Text style={styles.subject}>{assignment.subject}</Text>
          <Text style={styles.className}>{assignment.className}</Text>
        </View>

        {/* Teacher Info */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Teacher</Text>
          <View style={styles.teacherInfo}>
            <View style={styles.teacherAvatar}>
              {assignment.teacher?.img ? (
                <Image source={{ uri: assignment.teacher.img }} style={styles.avatarImage} />
              ) : (
                <Ionicons name="person" size={24} color="#7F8C8D" />
              )}
            </View>
            <View style={styles.teacherDetails}>
              <Text style={styles.teacherName}>{assignment.teacherName}</Text>
              <Text style={styles.teacherId}>{assignment.teacher?.teacherId}</Text>
            </View>
          </View>
        </View>

        {/* Description */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Description</Text>
          <Text style={styles.description}>{assignment.description}</Text>
        </View>

        {/* Assignment Info */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Assignment Information</Text>
          <View style={styles.infoGrid}>
            <View style={styles.infoItem}>
              <Text style={styles.infoLabel}>Status</Text>
              <Text style={[styles.infoValue, { color: assignment.status === 'active' ? '#27AE60' : '#E74C3C' }]}>
                {assignment.status.charAt(0).toUpperCase() + assignment.status.slice(1)}
              </Text>
            </View>
            <View style={styles.infoItem}>
              <Text style={styles.infoLabel}>Created</Text>
              <Text style={styles.infoValue}>{formatDate(assignment.createdAt)}</Text>
            </View>
            <View style={styles.infoItem}>
              <Text style={styles.infoLabel}>Time</Text>
              <Text style={styles.infoValue}>{formatTime(assignment.createdAt)}</Text>
            </View>
            <View style={styles.infoItem}>
              <Text style={styles.infoLabel}>Students</Text>
              <Text style={styles.infoValue}>{assignment.totalStudents}</Text>
            </View>
          </View>
        </View>

        {/* Images */}
        {assignment.images && assignment.images.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Images</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.imagesContainer}>
              {assignment.images.map((image, index) => (
                <TouchableOpacity
                  key={index}
                  style={styles.imageContainer}
                  onPress={() => openFile(image)}
                >
                  <Image source={{ uri: image }} style={styles.assignmentImage} />
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>
        )}

        {/* Attachments */}
        {assignment.attachments && assignment.attachments.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Attachments</Text>
            {assignment.attachments.map((attachment, index) => (
              <TouchableOpacity
                key={index}
                style={styles.attachmentItem}
                onPress={() => openFile(attachment.fileUrl)}
              >
                <View style={styles.attachmentIcon}>
                  <Ionicons name="document" size={24} color="#4A90E2" />
                </View>
                <View style={styles.attachmentDetails}>
                  <Text style={styles.attachmentName}>{attachment.fileName}</Text>
                  <Text style={styles.attachmentInfo}>
                    {attachment.fileType} • {(attachment.fileSize / 1024 / 1024).toFixed(2)} MB
                  </Text>
                </View>
                <Ionicons name="download" size={20} color="#7F8C8D" />
              </TouchableOpacity>
            ))}
          </View>
        )}

        {/* Due Date (if exists) */}
        {assignment.dueDate && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Due Date</Text>
            <View style={styles.dueDateContainer}>
              <Ionicons name="time" size={20} color="#E74C3C" />
              <Text style={styles.dueDateText}>{formatDate(assignment.dueDate)}</Text>
            </View>
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8F9FA',
    paddingTop:35,
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
  content: {
    flex: 1,
    padding: 20,
  },
  assignmentHeader: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 20,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  titleContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 10,
  },
  title: {
    fontSize: 24,
    fontWeight: '700',
    color: '#2C3E50',
    flex: 1,
    marginRight: 10,
  },
  priorityBadge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
  },
  priorityText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '600',
  },
  subject: {
    fontSize: 16,
    color: '#4A90E2',
    fontWeight: '600',
    marginBottom: 5,
  },
  className: {
    fontSize: 14,
    color: '#7F8C8D',
  },
  section: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 20,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#2C3E50',
    marginBottom: 15,
  },
  teacherInfo: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  teacherAvatar: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: '#F8F9FA',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 15,
  },
  avatarImage: {
    width: 50,
    height: 50,
    borderRadius: 25,
  },
  teacherDetails: {
    flex: 1,
  },
  teacherName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#2C3E50',
    marginBottom: 2,
  },
  teacherId: {
    fontSize: 14,
    color: '#7F8C8D',
  },
  description: {
    fontSize: 16,
    lineHeight: 24,
    color: '#34495E',
  },
  infoGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  infoItem: {
    width: '48%',
    marginBottom: 15,
  },
  infoLabel: {
    fontSize: 14,
    color: '#7F8C8D',
    marginBottom: 5,
  },
  infoValue: {
    fontSize: 16,
    fontWeight: '600',
    color: '#2C3E50',
  },
  imagesContainer: {
    flexDirection: 'row',
  },
  imageContainer: {
    marginRight: 15,
  },
  assignmentImage: {
    width: 120,
    height: 120,
    borderRadius: 8,
  },
  attachmentItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#E9ECEF',
  },
  attachmentIcon: {
    width: 40,
    height: 40,
    borderRadius: 8,
    backgroundColor: '#F8F9FA',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 15,
  },
  attachmentDetails: {
    flex: 1,
  },
  attachmentName: {
    fontSize: 16,
    fontWeight: '500',
    color: '#2C3E50',
    marginBottom: 2,
  },
  attachmentInfo: {
    fontSize: 14,
    color: '#7F8C8D',
  },
  dueDateContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  dueDateText: {
    fontSize: 16,
    color: '#E74C3C',
    fontWeight: '600',
    marginLeft: 10,
  },
});

export default AssignmentDetailScreen;
