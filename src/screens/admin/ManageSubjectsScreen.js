import React, { useState, useEffect, useRef, forwardRef, useImperativeHandle, useCallback, useMemo } from 'react';
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
  ScrollView,
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
  const [classes, setClasses] = useState([]);
  
  // Enhanced subject assignment state with timetable
  const [selectedSubjects, setSelectedSubjects] = useState([]);
  const [selectedClass, setSelectedClass] = useState('');
  const [selectedDays, setSelectedDays] = useState([]); // Changed to array for multi-day selection
  const [subjectTimeSlots, setSubjectTimeSlots] = useState({});
  const [subjectAssignments, setSubjectAssignments] = useState([]);
  
  // Dropdown state for teacher classes
  const [expandedTeacherId, setExpandedTeacherId] = useState(null);

  const days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];

  useEffect(() => {
    fetchTeachersWithClasses();
    fetchAvailableSubjects();
    fetchClasses();
  }, []);

  const fetchClasses = async () => {
    try {
      const response = await adminAPI.getAllClasses();
      if (response.data && response.data.classes) {
        setClasses(response.data.classes);
      }
    } catch (error) {
      console.error('Error fetching classes:', error);
    }
  };

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
        console.log('Fetched teachers with classes:', response.data.teachers);
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

  const handleAssignSubjectsWithTimetable = useCallback(async () => {
    if (!selectedTeacher || selectedSubjects.length === 0) {
      Alert.alert('Error', 'Please select at least one subject.');
      return;
    }

    if (!selectedClass || selectedDays.length === 0) {
      Alert.alert('Error', 'Please select class and at least one day.');
      return;
    }

    // Validate all time slots
    const missingTimeSlots = selectedSubjects.filter(subject => !subjectTimeSlots[subject]);
    if (missingTimeSlots.length > 0) {
      Alert.alert('Error', `Please set time slots for: ${missingTimeSlots.join(', ')}`);
      return;
    }

    // Validate time slot format for all subjects
    for (const subject of selectedSubjects) {
      const timeSlot = subjectTimeSlots[subject];
      const timeSlotRegex = /^\d{2}:\d{2}-\d{2}:\d{2}$/;
      if (!timeSlotRegex.test(timeSlot)) {
        Alert.alert('Error', `Time slot for ${subject} must be in format HH:MM-HH:MM (e.g., 09:00-10:00)`);
        return;
      }
    }

    try {
      const subjectAssignments = selectedSubjects.map(subject => ({
        subject: subject,
        classId: selectedClass,
        days: selectedDays, // Use selectedDays array
        timeSlot: subjectTimeSlots[subject]
      }));

      const response = await adminAPI.assignSubjectsWithTimetable({
        teacherId: selectedTeacher._id,
        subjectAssignments: subjectAssignments
      });
      
      if (response.data.teacher) {
        setTeachers(prevTeachers => prevTeachers.map(t => 
          t._id === selectedTeacher._id ? response.data.teacher : t
        ));
        Alert.alert('Success', `Subjects assigned successfully with timetable! (${response.data.timetableEntries} entries created)`);
        setModalVisible(false);
        resetAssignmentForm();
      }
    } catch (error) {
      console.error('Error assigning subjects with timetable:', error);
      Alert.alert('Error', error.response?.data?.message || 'Failed to assign subjects with timetable.');
    }
  }, [selectedTeacher, selectedSubjects, selectedClass, selectedDays, subjectTimeSlots, resetAssignmentForm]);

  const toggleSubjectSelection = useCallback((subject) => {
    setSelectedSubjects(prev => {
      if (prev.includes(subject)) {
        // Remove subject and its time slot
        setSubjectTimeSlots(prevSlots => {
          const newTimeSlots = { ...prevSlots };
          delete newTimeSlots[subject];
          return newTimeSlots;
        });
        return prev.filter(s => s !== subject);
      } else {
        return [...prev, subject];
      }
    });
  }, []);

  const updateSubjectTimeSlot = useCallback((subject, timeSlot) => {
    setSubjectTimeSlots(prev => ({
      ...prev,
      [subject]: timeSlot
    }));
  }, []);

  const resetAssignmentForm = useCallback(() => {
    setSelectedSubjects([]);
    setSelectedClass('');
    setSelectedDays([]);
    setSubjectTimeSlots({});
    setSubjectAssignments([]);
  }, []);

  const handleRemoveSubject = async (teacherId, subject, classId, timeSlot) => {
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
                subjects: [subject],
                classId: classId,
                timeSlot: timeSlot
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
    resetAssignmentForm();
  };

  const handleQuickAssign = (subject) => {
    if (selectedTeacher && !selectedTeacher.subjects.includes(subject)) {
      handleAssignSubjects(selectedTeacher._id, subject);
      setModalVisible(false);
    }
  };

  const toggleDaySelection = (day) => {
    setSelectedDays(prev => {
      if (prev.includes(day)) {
        return prev.filter(d => d !== day);
      } else {
        return [...prev, day];
      }
    });
  };

  const renderSubjectChip = (assignment, teacherId, canRemove = true) => {
    console.log('renderSubjectChip assignment:', assignment);
    console.log('assignment.subject:', assignment.subject);
    console.log('assignment.class:', assignment.class);
    console.log('assignment.day:', assignment.day);
    console.log('assignment.timeSlot:', assignment.timeSlot);
    
    // Handle missing data gracefully
    const subject = assignment.subject || 'Unknown Subject';
    const className = assignment.class || 'Unknown Class';
    const day = assignment.day || 'Unknown Day';
    const timeSlot = assignment.timeSlot || 'Unknown Time';
    
    const displayText = `${subject} - ${className} • ${day} • ${timeSlot}`;
    console.log('displayText:', displayText);
    
    return (
      <View 
        key={`${assignment.subject}-${assignment.classId}-${assignment.timeSlot}`} 
        style={{
          backgroundColor: '#4A90E2',
          paddingHorizontal: 12,
          paddingVertical: 8,
          marginRight: 8,
          marginBottom: 8,
          borderRadius: 20,
          flexDirection: 'row',
          alignItems: 'center',
        }}
      >
        <Text style={{
          color: '#FFFFFF',
          fontSize: 13,
          fontWeight: '600',
          marginRight: 8,
        }}>
          {displayText}
        </Text>
        {canRemove && (
          <TouchableOpacity 
            onPress={() => handleRemoveSubject(teacherId, assignment.subject, assignment.classId, assignment.timeSlot)}
            style={{
              backgroundColor: '#E74C3C',
              borderRadius: 10,
              padding: 2,
            }}
          >
            <Ionicons name="close-circle" size={16} color="#FFFFFF" />
          </TouchableOpacity>
        )}
      </View>
    );
  };

  const renderSubjectButton = (subject) => {
    const isAlreadyAssigned = selectedTeacher?.subjects?.includes(subject);
    const isSelected = selectedSubjects.includes(subject);
    
    return (
      <TouchableOpacity
        key={subject}
        style={[
          styles.quickAssignButton,
          isAlreadyAssigned && styles.disabledButton,
          isSelected && styles.selectedSubjectButton
        ]}
        onPress={() => isAlreadyAssigned ? null : toggleSubjectSelection(subject)}
        disabled={isAlreadyAssigned}
      >
        <Text style={[
          styles.quickAssignText,
          isAlreadyAssigned && styles.disabledText,
          isSelected && styles.selectedSubjectText
        ]}>
          {subject} {isAlreadyAssigned && '✓'} {isSelected && '✓'}
        </Text>
      </TouchableOpacity>
    );
  };

  const renderTeacherItem = ({ item: teacher }) => {
    const isExpanded = expandedTeacherId === teacher._id;
    const hasSubjects = teacher.assignedSubjectsWithClasses && teacher.assignedSubjectsWithClasses.length > 0;

    return (
      <View style={styles.teacherCard}>
        <View style={styles.teacherHeader}>
          <View style={styles.teacherInfo}>
            <Text style={styles.teacherName}>{teacher.fullname}</Text>
            <Text style={styles.teacherEmail}>{teacher.email}</Text>
            <Text style={styles.teacherStatus}>
              Verified • {teacher.classes?.map(cls => cls.name).join(', ') || 'No classes'}
            </Text>
          </View>
          <View style={styles.actionButtons}>
            {hasSubjects && (
              <TouchableOpacity
                style={styles.dropdownButton}
                onPress={() => setExpandedTeacherId(isExpanded ? null : teacher._id)}
              >
                <Ionicons 
                  name={isExpanded ? "chevron-up" : "chevron-down"} 
                  size={20} 
                  color="#4A90E2" 
                />
              </TouchableOpacity>
            )}
            <TouchableOpacity
              style={styles.assignButton}
              onPress={() => openAssignModal(teacher)}
            >
              <Ionicons name="add-circle" size={24} color="#4A90E2" />
            </TouchableOpacity>
          </View>
        </View>

        {/* Dropdown for assigned subjects */}
        {isExpanded && hasSubjects && (
          <View style={styles.subjectsSection}>
            <Text style={styles.subjectsLabel}>Assigned Subjects:</Text>
            {console.log('teacher.assignedSubjectsWithClasses:', teacher.assignedSubjectsWithClasses)}
            <View style={styles.subjectsContainer}>
              {teacher.assignedSubjectsWithClasses.map(assignment => 
                renderSubjectChip(assignment, teacher._id)
              )}
            </View>
          </View>
        )}

        {/* Show subjects section if not expanded but has subjects */}
        {!isExpanded && hasSubjects && (
          <View style={styles.subjectsSection}>
            <Text style={styles.subjectsLabel}>
              Assigned Subjects: {teacher.assignedSubjectsWithClasses.length} subject{teacher.assignedSubjectsWithClasses.length > 1 ? 's' : ''}
            </Text>
          </View>
        )}

        {/* Show no subjects message if no subjects */}
        {!hasSubjects && (
          <View style={styles.subjectsSection}>
            <Text style={styles.subjectsLabel}>Assigned Subjects:</Text>
            <Text style={styles.noSubjectsText}>No subjects assigned yet</Text>
          </View>
        )}
      </View>
    );
  };

  // Optimized modal component to prevent re-renders
  const AssignSubjectModal = () => {
    // Local state to prevent re-renders during interactions
    const [localSelectedSubjects, setLocalSelectedSubjects] = useState([]);
    const [localSelectedClass, setLocalSelectedClass] = useState('');
    const [localSelectedDays, setLocalSelectedDays] = useState([]);
    const [localSubjectTimeSlots, setLocalSubjectTimeSlots] = useState({});

    // Sync local state with parent state when modal opens
    useEffect(() => {
      if (modalVisible && selectedTeacher) {
        setLocalSelectedSubjects(selectedSubjects);
        setLocalSelectedClass(selectedClass);
        setLocalSelectedDays(selectedDays);
        setLocalSubjectTimeSlots(subjectTimeSlots);
      }
    }, [modalVisible, selectedTeacher]);

    // Local handlers that don't trigger parent re-renders
    const handleLocalSubjectToggle = (subject) => {
      setLocalSelectedSubjects(prev => {
        if (prev.includes(subject)) {
          return prev.filter(s => s !== subject);
        } else {
          return [...prev, subject];
        }
      });
    };

    const handleLocalDayToggle = (day) => {
      setLocalSelectedDays(prev => {
        let newDays;
        if (prev.includes(day)) {
          newDays = prev.filter(d => d !== day);
        } else {
          newDays = [...prev, day];
        }
        
        // Auto-set day type based on selected days
        const fullDayPattern = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Saturday'];
        const hasFullDayPattern = fullDayPattern.every(d => newDays.includes(d));
        const hasFriday = newDays.includes('Friday');
        
        // If all full day pattern days are selected, show "Full day" indicator
        if (hasFullDayPattern) {
          console.log('Full day pattern detected: Monday, Tuesday, Wednesday, Thursday, Saturday');
        }
        
        // If Friday is selected, show "Half day" indicator
        if (hasFriday) {
          console.log('Half day pattern detected: Friday');
        }
        
        return newDays;
      });
    };

    const handleLocalTimeSlotUpdate = (subject, text) => {
      setLocalSubjectTimeSlots(prev => ({
        ...prev,
        [subject]: text
      }));
    };

    const handleConfirm = () => {
      // Sync local state back to parent state
      setSelectedSubjects(localSelectedSubjects);
      setSelectedClass(localSelectedClass);
      setSelectedDays(localSelectedDays);
      setSubjectTimeSlots(localSubjectTimeSlots);
      
      // Call the original handler
      handleAssignSubjectsWithTimetable();
    };

    if (!modalVisible || !selectedTeacher) return null;
    
    return (
      <Modal
        animationType="fade"
        transparent={true}
        visible={modalVisible}
        onRequestClose={() => setModalVisible(false)}
        statusBarTranslucent={true}
        hardwareAccelerated={true}
        presentationStyle="overFullScreen"
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>
                Assign Subjects with Timetable to {selectedTeacher.fullname}
              </Text>
              <TouchableOpacity onPress={() => setModalVisible(false)}>
                <Ionicons name="close" size={24} color="#7F8C8D" />
              </TouchableOpacity>
            </View>

            <ScrollView 
              showsVerticalScrollIndicator={false}
              keyboardShouldPersistTaps="handled"
              removeClippedSubviews={true}
              nestedScrollEnabled={true}
            >
              <Text style={styles.sectionTitle}>Select Subjects:</Text>
              <View style={styles.quickAssignContainer}>
                {availableSubjects.map(subject => {
                  const isAlreadyAssigned = selectedTeacher.assignedSubjectsWithClasses?.some(assignment => assignment.subject === subject && assignment.classId === localSelectedClass);
                  const isSelected = localSelectedSubjects.includes(subject);
                  
                  return (
                    <TouchableOpacity
                      key={subject}
                      style={[
                        styles.quickAssignButton,
                        isAlreadyAssigned && styles.disabledButton,
                        isSelected && styles.selectedSubjectButton
                      ]}
                      onPress={() => !isAlreadyAssigned && handleLocalSubjectToggle(subject)}
                      disabled={isAlreadyAssigned}
                      activeOpacity={0.8}
                    >
                      <Text style={[
                        styles.quickAssignText,
                        isAlreadyAssigned && styles.disabledText,
                        isSelected && styles.selectedSubjectText
                      ]}>
                        {subject} {isAlreadyAssigned && '✓'} {isSelected && '✓'}
                      </Text>
                    </TouchableOpacity>
                  );
                })}
              </View>

              {localSelectedSubjects.length > 0 && (
                <>
                  <Text style={styles.sectionTitle}>Select Class:</Text>
                  <ScrollView contentContainerStyle={styles.classSelectContainer}>
                    {classes.map(cls => (
                      <TouchableOpacity
                        key={cls._id}
                        style={[
                          styles.classSelectButton,
                          localSelectedClass === cls._id && styles.selectedClassButton
                        ]}
                        onPress={() => setLocalSelectedClass(cls._id)}
                        activeOpacity={0.8}
                      >
                        <Text style={styles.classSelectText}>{cls.classNumber}-{cls.section}</Text>
                      </TouchableOpacity>
                    ))}
                  </ScrollView>

                  <Text style={styles.sectionTitle}>Select Days:</Text>
                  <View style={styles.daySelectContainer}>
                    {days.map(day => (
                      <TouchableOpacity
                        key={day}
                        style={[
                          styles.daySelectButton,
                          localSelectedDays.includes(day) && styles.selectedDayButton
                        ]}
                        onPress={() => handleLocalDayToggle(day)}
                        activeOpacity={0.8}
                      >
                        <Text style={[
                          styles.daySelectText,
                          localSelectedDays.includes(day) && styles.selectedDayText
                        ]}>
                          {day}
                        </Text>
                      </TouchableOpacity>
                    ))}
                  </View>

                  {/* Show "Full day" indicator when Monday, Tuesday, Wednesday, Thursday, Saturday are selected */}
                  {(() => {
                    const fullDayPattern = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Saturday'];
                    const hasFullDayPattern = fullDayPattern.every(d => localSelectedDays.includes(d));
                    return hasFullDayPattern && (
                      <View style={[styles.everydayContainer, { backgroundColor: '#E8F5E8' }]}>
                        <Text style={[styles.everydayText, { color: '#27AE60' }]}>
                          ✓ Marked as "Full day" (Monday, Tuesday, Wednesday, Thursday, Saturday)
                        </Text>
                      </View>
                    );
                  })()}

                  {/* Show "Half day" indicator when Friday is selected */}
                  {localSelectedDays.includes('Friday') && (
                    <View style={[styles.everydayContainer, { backgroundColor: '#FEF9E7' }]}>
                      <Text style={[styles.everydayText, { color: '#F39C12' }]}>
                        ✓ Marked as "Half day" (Friday)
                      </Text>
                    </View>
                  )}

                  <Text style={styles.sectionTitle}>Set Time Slots:</Text>
                  {localSelectedSubjects.map(subject => (
                    <View key={subject} style={styles.timeSlotRow}>
                      <Text style={styles.subjectLabel}>{subject}:</Text>
                      <TextInput
                        style={styles.timeSlotInput}
                        placeholder="HH:MM-HH:MM"
                        value={localSubjectTimeSlots[subject] || ''}
                        onChangeText={(text) => handleLocalTimeSlotUpdate(subject, text)}
                        autoCorrect={false}
                        autoCapitalize="none"
                      />
                    </View>
                  ))}

                  <View style={styles.selectedSubjectsPreview}>
                    <Text style={styles.sectionTitle}>Preview:</Text>
                    {localSelectedSubjects.map(subject => {
                      const classObj = classes.find(c => c._id === localSelectedClass);
                      
                      // Determine day display with day type information
                      let dayDisplay;
                      const fullDayPattern = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Saturday'];
                      const hasFullDayPattern = fullDayPattern.every(d => localSelectedDays.includes(d));
                      const hasFriday = localSelectedDays.includes('Friday');
                      
                      if (hasFullDayPattern) {
                        dayDisplay = 'Full day (Mon, Tue, Wed, Thu, Sat)';
                      } else if (hasFriday) {
                        dayDisplay = 'Half day (Friday)';
                      } else {
                        dayDisplay = localSelectedDays.join(', ') || 'No days selected';
                      }
                      
                      return (
                        <View key={subject} style={styles.previewItem}>
                          <Text style={styles.previewSubject}>{subject}</Text>
                          <Text style={styles.previewDetails}>
                            {classObj ? `${classObj.classNumber}-${classObj.section}` : 'No class'} • {dayDisplay} • {localSubjectTimeSlots[subject] || 'No time'}
                          </Text>
                        </View>
                      );
                    })}
                  </View>
                </>
              )}

              <Text style={styles.contactPrincipalText}>If Your Subject is still not here, please Contact Principal!</Text>
            </ScrollView>

            <View style={styles.modalActions}>
              <TouchableOpacity
                style={[styles.modalButton, styles.cancelButton]}
                onPress={() => setModalVisible(false)}
                activeOpacity={0.8}
              >
                <Text style={styles.cancelButtonText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.modalButton, styles.confirmButton]}
                onPress={handleConfirm}
                activeOpacity={0.8}
              >
                <Text style={styles.confirmButtonText}>OK</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    );
  };

  

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
    paddingTop: 35,
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
  actionButtons: {
    flexDirection: 'row',
    gap: 10,
  },
  assignButton: {
    padding: 8,
  },
  timetableButton: {
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
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    paddingHorizontal: 12,
    paddingVertical: 8,
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: 8,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: '#E1E8ED',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  subjectChipContainer: {
    marginBottom: 8,
  },
  subjectChipContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    flex: 1,
  },
  subjectText: {
    fontSize: 14,
    color: '#2C3E50',
    fontWeight: '600',
    marginRight: 6,
    flex: 1,
    backgroundColor: '#FFE0E0', // Temporary background for debugging
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
    paddingHorizontal: 20,
    paddingVertical: 10,
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
    paddingHorizontal: 35,
    paddingVertical: 15,
    borderRadius: 8,
    marginHorizontal: 10,
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
  // Timetable Assignment Modal Styles
  subjectSelectContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
  },
  classSelectContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginBottom: 20,
  },
  classSelectButton: {
    backgroundColor: '#F8F9FA',
    borderWidth: 1,
    borderColor: '#E1E8ED',
    borderRadius: 20,
    paddingHorizontal: 20,
    paddingVertical: 10,
  },
  selectedClassButton: {
    backgroundColor: '#4A90E2',
    borderColor: '#4A90E2',
  },
  classSelectText: {
    fontSize: 14,
    color: '#2C3E50',
    fontWeight: '500',
  },
  daySelectContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginBottom: 20,
  },
  daySelectButton: {
    backgroundColor: '#F8F9FA',
    borderWidth: 1,
    borderColor: '#E1E8ED',
    borderRadius: 20,
    paddingHorizontal: 20,
    paddingVertical: 10,
  },
  selectedDayButton: {
    backgroundColor: '#4A90E2',
    borderColor: '#4A90E2',
  },
  daySelectText: {
    fontSize: 14,
    color: '#2C3E50',
    fontWeight: '500',
  },
  everydayContainer: {
    backgroundColor: '#E3F2FD',
    borderRadius: 8,
    padding: 10,
    marginTop: 10,
    alignItems: 'center',
  },
  everydayText: {
    fontSize: 14,
    color: '#1976D2',
    fontWeight: '500',
  },
  timeSlotContainer: {
    marginBottom: 20,
  },
  subjectAssignmentsList: {
    marginTop: 10,
  },
  subjectAssignmentItem: {
    backgroundColor: '#F8F9FA',
    borderRadius: 10,
    padding: 12,
    marginBottom: 10,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderWidth: 1,
    borderColor: '#E1E8ED',
  },
  assignmentSubject: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#2C3E50',
    flex: 1,
  },
  assignmentClass: {
    fontSize: 12,
    color: '#7F8C8D',
    marginLeft: 10,
  },
  assignmentDay: {
    fontSize: 12,
    color: '#7F8C8D',
    marginLeft: 10,
  },
  assignmentTimeSlot: {
    fontSize: 12,
    color: '#7F8C8D',
    marginLeft: 10,
  },
  removeAssignmentButton: {
    marginLeft: 10,
  },
  confirmButton: {
    backgroundColor: '#27AE60',
  },
  confirmButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: 'bold',
  },
  // New styles for enhanced subject assignment
  selectedSubjectButton: {
    backgroundColor: '#4A90E2',
    borderColor: '#4A90E2',
  },
  selectedSubjectText: {
    color: '#FFFFFF',
  },
  timeSlotRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 15,
    paddingHorizontal: 10,
  },
  subjectLabel: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#2C3E50',
    width: 80,
    marginRight: 10,
  },
  timeSlotInput: {
    flex: 1,
    borderWidth: 1,
    borderColor: '#E1E8ED',
    borderRadius: 8,
    padding: 10,
    fontSize: 16,
    color: '#333',
  },
  selectedSubjectsPreview: {
    marginTop: 20,
    padding: 15,
    backgroundColor: '#F8F9FA',
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#E1E8ED',
  },
  previewItem: {
    marginBottom: 10,
    padding: 10,
    backgroundColor: '#FFFFFF',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#E1E8ED',
  },
  previewSubject: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#2C3E50',
    marginBottom: 5,
  },
  previewDetails: {
    fontSize: 14,
    color: '#7F8C8D',
  },
  selectedDayText: {
    color: '#FFFFFF',
  },
  dropdownButton: {
    padding: 8,
  },
  classesDropdown: {
    backgroundColor: '#F8F9FA',
    borderRadius: 10,
    padding: 15,
    marginTop: 10,
    borderWidth: 1,
    borderColor: '#E1E8ED',
  },
  classesDropdownTitle: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#2C3E50',
    marginBottom: 8,
  },
  classItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 5,
  },
  classItemText: {
    fontSize: 14,
    color: '#2C3E50',
    marginLeft: 8,
  },
  subjectDetailsDropdown: {
    backgroundColor: '#F8F9FA',
    borderRadius: 10,
    padding: 15,
    marginTop: 10,
    borderWidth: 1,
    borderColor: '#E1E8ED',
  },
  detailRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  detailLabel: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#2C3E50',
    marginLeft: 8,
  },
  detailText: {
    fontSize: 14,
    color: '#7F8C8D',
    flex: 1,
  },
  daysList: {
    marginTop: 8,
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 4,
  },
  dayItem: {
    backgroundColor: '#E3F2FD',
    borderRadius: 12,
    paddingHorizontal: 8,
    paddingVertical: 4,
    fontSize: 11,
    color: '#1976D2',
    fontWeight: '500',
  },
  // Fixed subject chip styles
  subjectChipFixed: {
    backgroundColor: '#4A90E2',
    paddingHorizontal: 10,
    paddingVertical: 10,
    marginRight: 8,
    marginBottom: 8,
    borderRadius: 25,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    minHeight: 40,
    borderWidth: 2,
    borderColor: '#357ABD',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 4,
    elevation: 4,
  },
  subjectTextFixed: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '600',
    flex: 1,
    marginRight: 8,
    lineHeight: 16,
  },
  removeButtonFixed: {
    backgroundColor: '#E74C3C',
    borderRadius: 12,
    padding: 4,
    marginLeft: 6,
    alignItems: 'center',
    justifyContent: 'center',
    minWidth: 24,
    minHeight: 24,
  },
});

export default ManageSubjectsScreen;
