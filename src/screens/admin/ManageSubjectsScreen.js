import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
  SafeAreaView,
  TextInput,
  Modal,
  RefreshControl,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { adminAPI } from '../../services/api';

const ManageSubjectsScreen = ({ navigation }) => {
  const [teachers, setTeachers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const [selectedTeacher, setSelectedTeacher] = useState(null);
  const [availableSubjects, setAvailableSubjects] = useState([]);

  useEffect(() => {
    fetchTeachersWithClasses();
    fetchAvailableSubjects();
  }, []);

  const fetchAvailableSubjects = async () => {
    try {
      const response = await adminAPI.getAllSubjects();
      if (response.data && response.data.subjects) {
        setAvailableSubjects(response.data.subjects.map(s => s.name));
      }
    } catch (error) {
      console.error('Error fetching available subjects:', error);
      Alert.alert('Error', 'Failed to load available subjects.');
    }
  };

  

  

  // Add navigation focus listener to refresh data when screen comes into focus
  useEffect(() => {
    const unsubscribe = navigation.addListener('focus', () => {
      fetchTeachersWithClasses();
    });
    return unsubscribe;
  }, [navigation]);

  const fetchTeachersWithClasses = async (isRefresh = false) => {
    if (isRefresh) {
      setRefreshing(true);
    } else {
      setLoading(true);
    }
    
    try {
      const response = await adminAPI.getTeachersWithClasses();
      if (response.data.teachers) {
        setTeachers(response.data.teachers);
        console.log('Fetched teachers with classes:', response.data.teachers.length);
      }
    } catch (error) {
      console.error('Error fetching teachers with classes:', error);
      Alert.alert('Error', 'Failed to load teachers with assigned classes.');
    } finally {
      if (isRefresh) {
        setRefreshing(false);
      } else {
        setLoading(false);
      }
    }
  };

  const handleRefresh = () => {
    fetchTeachersWithClasses(true);
  };

  const handleAssignSubjects = async (teacherId, subjects) => {
    try {
      const response = await adminAPI.assignSubjectToTeacher({ 
        teacherId, 
        subjects: Array.isArray(subjects) ? subjects : [subjects]
      });
      if (response.data.teacher) {
        setTeachers(teachers.map(t => 
          t._id === teacherId ? response.data.teacher : t
        ));
        Alert.alert('Success', 'Subjects assigned successfully!');
      }
    } catch (error) {
      console.error('Error assigning subjects:', error);
      Alert.alert('Error', error.response?.data?.message || 'Failed to assign subjects.');
    }
  };

  const handleRemoveSubject = async (teacherId, subject) => {
    Alert.alert(
      'Remove Subject',
      `Are you sure you want to remove "${subject}" from this teacher?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Remove',
          style: 'destructive',
          onPress: async () => {
            try {
              const response = await adminAPI.removeSubjectFromTeacher({ 
                teacherId, 
                subjects: [subject] 
              });
              if (response.data.teacher) {
                setTeachers(teachers.map(t => 
                  t._id === teacherId ? response.data.teacher : t
                ));
                Alert.alert('Success', 'Subject removed successfully!');
              }
            } catch (error) {
              console.error('Error removing subject:', error);
              Alert.alert('Error', error.response?.data?.message || 'Failed to remove subject.');
            }
          },
        },
      ]
    );
  };

  const openAssignModal = (teacher) => {
    setSelectedTeacher(teacher);
    setModalVisible(true);
  };

  const handleQuickAssign = (subject) => {
    if (selectedTeacher && !selectedTeacher.subjects.includes(subject)) {
      handleAssignSubjects(selectedTeacher._id, subject);
      setModalVisible(false);
    }
  };

  const renderSubjectChip = (subject, teacherId, canRemove = true) => (
    <View key={subject} style={styles.subjectChip}>
      <Text style={styles.subjectText}>{subject}</Text>
      {canRemove && (
        <TouchableOpacity 
          onPress={() => handleRemoveSubject(teacherId, subject)}
          style={styles.removeButton}
        >
          <Ionicons name="close-circle" size={18} color="#E74C3C" />
        </TouchableOpacity>
      )}
    </View>
  );

  const renderQuickAssignButton = (subject) => {
    const isAlreadyAssigned = selectedTeacher?.subjects?.includes(subject);
    return (
      <TouchableOpacity
        key={subject}
        style={[
          styles.quickAssignButton,
          isAlreadyAssigned && styles.disabledButton
        ]}
        onPress={() => handleQuickAssign(subject)}
        disabled={isAlreadyAssigned}
      >
        <Text style={[
          styles.quickAssignText,
          isAlreadyAssigned && styles.disabledText
        ]}>
          {subject} {isAlreadyAssigned && '✓'}
        </Text>
      </TouchableOpacity>
    );
  };

  const renderTeacherItem = ({ item: teacher }) => (
    <View style={styles.teacherCard}>
      <View style={styles.teacherHeader}>
        <View style={styles.teacherInfo}>
          <Text style={styles.teacherName}>{teacher.fullname}</Text>
          <Text style={styles.teacherEmail}>{teacher.email}</Text>
          <Text style={styles.teacherStatus}>
            Verified • {teacher.classes?.map(cls => cls.name).join(', ') || 'No classes'}
          </Text>
        </View>
        <TouchableOpacity
          style={styles.assignButton}
          onPress={() => openAssignModal(teacher)}
        >
          <Ionicons name="add-circle" size={24} color="#4A90E2" />
        </TouchableOpacity>
      </View>

      <View style={styles.subjectsSection}>
        <Text style={styles.subjectsLabel}>Assigned Subjects:</Text>
        {teacher.subjects && teacher.subjects.length > 0 ? (
          <View style={styles.subjectsContainer}>
            {teacher.subjects.map(subject => 
              renderSubjectChip(subject, teacher._id)
            )}
          </View>
        ) : (
          <Text style={styles.noSubjectsText}>No subjects assigned yet</Text>
        )}
      </View>
    </View>
  );

  const AssignSubjectModal = () => (
    <Modal
      animationType="slide"
      transparent={true}
      visible={modalVisible}
      onRequestClose={() => setModalVisible(false)}
    >
      <View style={styles.modalOverlay}>
        <View style={styles.modalContent}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>
              Assign Subjects to {selectedTeacher?.fullname}
            </Text>
            <TouchableOpacity onPress={() => setModalVisible(false)}>
              <Ionicons name="close" size={24} color="#7F8C8D" />
            </TouchableOpacity>
          </View>

          <Text style={styles.sectionTitle}>Quick Assign:</Text>
          <View style={styles.quickAssignContainer}>
            {availableSubjects.map(subject => renderQuickAssignButton(subject))}
          </View>

          <Text style={styles.sectionTitle}>Or Add Custom Subject:</Text>
          <Text style={styles.contactPrincipalText}>If Your Subject is still not here, please Contact Principal!</Text>

          <View style={styles.modalActions}>
            <TouchableOpacity
              style={[styles.modalButton, styles.cancelButton]}
              onPress={() => setModalVisible(false)}
            >
              <Text style={styles.cancelButtonText}>Cancel</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#4A90E2" />
        <Text style={styles.loadingText}>Loading teachers with classes...</Text>
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-back" size={24} color="#2C3E50" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Manage Subjects</Text>
        <TouchableOpacity onPress={handleRefresh} disabled={refreshing}>
          <Ionicons 
            name={refreshing ? "reload" : "refresh"} 
            size={24} 
            color={refreshing ? "#95A5A6" : "#4A90E2"} 
          />
        </TouchableOpacity>
      </View>

      <View style={styles.content}>
        <Text style={styles.pageSubtitle}>
          Assign subjects to teachers who have assigned classes
        </Text>

        {teachers.length === 0 ? (
          <View style={styles.emptyContainer}>
            <Ionicons name="school-outline" size={60} color="#BDC3C7" />
            <Text style={styles.emptyTitle}>No Teachers with Classes</Text>
            <Text style={styles.emptyText}>
              Teachers need to have assigned classes before you can assign subjects to them. Make sure you've created classes and assigned them to verified teachers.
            </Text>
            <View style={styles.emptyButtonsContainer}>
              <TouchableOpacity
                style={[styles.emptyButton, styles.refreshButton]}
                onPress={handleRefresh}
                disabled={refreshing}
              >
                <Ionicons 
                  name={refreshing ? "reload" : "refresh"} 
                  size={16} 
                  color="#FFFFFF" 
                  style={{ marginRight: 8 }}
                />
                <Text style={styles.emptyButtonText}>
                  {refreshing ? 'Refreshing...' : 'Refresh'}
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.emptyButton}
                onPress={() => navigation.navigate('ManageClasses')}
              >
                <Text style={styles.emptyButtonText}>Manage Classes</Text>
              </TouchableOpacity>
            </View>
          </View>
        ) : (
          <FlatList
            data={teachers}
            keyExtractor={(item) => item._id}
            renderItem={renderTeacherItem}
            showsVerticalScrollIndicator={false}
            contentContainerStyle={styles.listContent}
            refreshControl={
              <RefreshControl
                refreshing={refreshing}
                onRefresh={handleRefresh}
                colors={['#4A90E2']}
                tintColor="#4A90E2"
              />
            }
          />
        )}
      </View>

      <AssignSubjectModal />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F7FA',
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
  pageSubtitle: {
    fontSize: 16,
    color: '#7F8C8D',
    textAlign: 'center',
    marginBottom: 20,
  },
  listContent: {
    paddingBottom: 20,
  },
  teacherCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 3,
  },
  teacherHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 16,
  },
  teacherInfo: {
    flex: 1,
  },
  teacherName: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#2C3E50',
    marginBottom: 4,
  },
  teacherEmail: {
    fontSize: 14,
    color: '#7F8C8D',
    marginBottom: 4,
  },
  teacherStatus: {
    fontSize: 12,
    color: '#27AE60',
    fontWeight: '500',
  },
  assignButton: {
    padding: 8,
  },
  subjectsSection: {
    borderTopWidth: 1,
    borderTopColor: '#ECF0F1',
    paddingTop: 16,
  },
  subjectsLabel: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#2C3E50',
    marginBottom: 8,
  },
  subjectsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  subjectChip: {
    backgroundColor: '#E3F2FD',
    borderRadius: 20,
    paddingHorizontal: 12,
    paddingVertical: 6,
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: 8,
    marginBottom: 8,
  },
  subjectText: {
    fontSize: 12,
    color: '#1976D2',
    fontWeight: '500',
    marginRight: 6,
  },
  removeButton: {
    marginLeft: 4,
  },
  noSubjectsText: {
    fontSize: 14,
    color: '#95A5A6',
    fontStyle: 'italic',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 40,
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#7F8C8D',
    marginTop: 20,
    marginBottom: 10,
  },
  emptyText: {
    fontSize: 16,
    color: '#95A5A6',
    textAlign: 'center',
    lineHeight: 24,
    marginBottom: 30,
  },
  emptyButton: {
    backgroundColor: '#4A90E2',
    paddingHorizontal: 30,
    paddingVertical: 12,
    borderRadius: 8,
  },
  emptyButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: 'bold',
  },
  emptyButtonsContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 15,
  },
  refreshButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#27AE60',
  },
  // Modal styles
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    padding: 20,
    margin: 20,
    maxHeight: '80%',
    width: '90%',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#2C3E50',
    flex: 1,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#2C3E50',
    marginBottom: 10,
    marginTop: 10,
  },
  quickAssignContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginBottom: 20,
  },
  quickAssignButton: {
    backgroundColor: '#F8F9FA',
    borderWidth: 1,
    borderColor: '#E1E8ED',
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingVertical: 8,
  },
  disabledButton: {
    backgroundColor: '#ECF0F1',
    borderColor: '#BDC3C7',
  },
  quickAssignText: {
    fontSize: 12,
    color: '#2C3E50',
    fontWeight: '500',
  },
  disabledText: {
    color: '#95A5A6',
  },
  customInputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
  },
  customInput: {
    flex: 1,
    height: 44,
    borderWidth: 1,
    borderColor: '#E1E8ED',
    borderRadius: 8,
    paddingHorizontal: 16,
    fontSize: 16,
    marginRight: 10,
  },
  addCustomButton: {
    backgroundColor: '#4A90E2',
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 8,
  },
  addCustomButtonText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: 'bold',
  },
  modalActions: {
    flexDirection: 'row',
    justifyContent: 'center',
  },
  modalButton: {
    paddingHorizontal: 30,
    paddingVertical: 12,
    borderRadius: 8,
  },
  cancelButton: {
    backgroundColor: '#ECF0F1',
  },
  cancelButtonText: {
    color: '#7F8C8D',
    fontSize: 16,
    fontWeight: 'bold',
  },
  contactPrincipalText: {
    fontSize: 14,
    color: '#7F8C8D',
    textAlign: 'center',
    marginTop: 10,
    paddingBottom: 20,
  },
});

export default ManageSubjectsScreen;
