import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Image,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import VerifiedBadge from './VerifiedBadge';

const TeacherCard = ({ item, onRefresh, handleVerifyTeacher, handleDeleteTeacher, handleUpdateTeacher }) => {
  return (
    <View style={styles.teacherCard}>
      {/* Institute Header with Gradient */}
      <View style={styles.cardHeader}>
        <Text style={styles.instituteName}>Superior Science College</Text>
        <View style={styles.verifiedBadgeContainer}>
          <VerifiedBadge isVerified={item.isVerified} showText={false} />
        </View>
      </View>

      {/* Main Card Content */}
      <View style={styles.cardBody}>
        {/* Teacher Avatar and Info Section */}
        <View style={styles.teacherMainInfo}>
          <View style={styles.avatarSection}>
            <View style={styles.avatarContainer}>
              {item.img ? (
                <Image key={item.img} source={{ uri: item.img }} style={styles.avatar} />
              ) : (
                <Ionicons name="person" size={40} color="#4A90E2" />
              )}
            </View>
          </View>
          
          <View style={styles.teacherDetailsSection}>
            <Text style={styles.teacherName}>{item.fullname}</Text>
            
            {/* Teacher Information in ID Card Style */}
            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>Teacher ID:</Text>
              <Text style={styles.infoValue}>
                {item.teacherId || 'Not Assigned'}
              </Text>
            </View>
            
            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>Email:</Text>
              <Text style={styles.infoValue}>{item.email}</Text>
            </View>
          </View>
        </View>
      </View>

      {/* Action Buttons */}
      <View style={styles.actionButtons}>
        <TouchableOpacity
          style={[styles.actionButton, styles.updateButton]}
          onPress={() => handleUpdateTeacher(item)}
        >
          <Ionicons name="create" size={16} color="#fff" />
          <Text style={styles.actionButtonText}>Update</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.actionButton, styles.deleteButton]}
          onPress={() => handleDeleteTeacher(item._id)}
        >
          <Ionicons name="trash" size={16} color="#fff" />
          <Text style={styles.actionButtonText}>Delete</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.actionButton, { backgroundColor: item.isVerified ? '#E74C3C' : '#2ECC71' }]}
          onPress={() => handleVerifyTeacher(item._id, !item.isVerified)}
        >
          <Ionicons name={item.isVerified ? 'close-circle' : 'checkmark-circle'} size={16} color="#fff" />
          <Text style={styles.actionButtonText}>{item.isVerified ? 'Unverify' : 'Verify'}</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  teacherCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 15,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 8,
    overflow: 'hidden',
  },
  cardHeader: {
    backgroundColor: '#4A5FD7',
    paddingVertical: 12,
    paddingHorizontal: 20,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  instituteName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#FFFFFF',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  verifiedBadgeContainer: {
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    borderRadius: 12,
    padding: 4,
  },
  cardBody: {
    padding: 20,
  },
  teacherMainInfo: {
    flexDirection: 'row',
    marginBottom: 20,
  },
  avatarSection: {
    marginRight: 20,
    alignItems: 'center',
  },
  avatarContainer: {
    width: 60,
    height: 60,
    borderRadius: 6,
    backgroundColor: '#E8F4FD',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#4A90E2',
  },
  avatar: {
    width: 60,
    height: 60,
    borderRadius: 6,
  },
  teacherDetailsSection: {
    flex: 1,
    justifyContent: 'center',
  },
  teacherName: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#2C3E50',
    marginBottom: 12,
  },
  infoRow: {
    flexDirection: 'row',
    marginBottom: 8,
    alignItems: 'center',
  },
  infoLabel: {
    fontSize: 12,
    fontWeight: '600',
    color: '#7F8C8D',
    width: 80,
  },
  infoValue: {
    fontSize: 12,
    color: '#2C3E50',
    flex: 1,
    fontWeight: '500',
  },
  actionButtons: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    paddingHorizontal: 20,
    paddingBottom: 15,
    gap: 8,
    borderTopWidth: 1,
    borderTopColor: '#ECF0F1',
    paddingTop: 15,
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 6,
    gap: 4,
  },
  updateButton: {
    backgroundColor: '#FFC107',
  },
  deleteButton: {
    backgroundColor: '#DC3545',
  },
  actionButtonText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: 'bold',
  },
});

export default TeacherCard;