import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
  RefreshControl,
  SafeAreaView,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useFocusEffect } from '@react-navigation/native';
import { adminAPI } from '../../services/api';

const StudentsByClassScreen = ({ navigation, route }) => {
  const [studentsByClass, setStudentsByClass] = useState({});
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [expandedClasses, setExpandedClasses] = useState(new Set());
  
  // Get classId from route params if passed
  const { classId, className } = route?.params || {};

  useEffect(() => {
    loadStudentsByClass();
  }, []);

  // Refresh data when screen comes into focus
  useFocusEffect(
    React.useCallback(() => {
      loadStudentsByClass();
    }, [])
  );

  const loadStudentsByClass = async (isRefresh = false) => {
    if (isRefresh) {
      setRefreshing(true);
    } else {
      setLoading(true);
    }

    try {
      const response = await adminAPI.getAllStudents();
      const students = response.data.students || [];
      
      // Group students by class
      const grouped = {};
      students.forEach(student => {
        if (student.class) {
          const className = student.class.name || `${student.class.classNumber}-${student.class.section}`;
          if (!grouped[className]) {
            grouped[className] = {
              classInfo: student.class,
              students: []
            };
          }
          grouped[className].students.push(student);
        }
      });

      // If classId is provided, filter to show only that class
      if (classId) {
        const filteredGrouped = {};
        Object.keys(grouped).forEach(className => {
          const classData = grouped[className];
          if (classData.classInfo._id === classId) {
            filteredGrouped[className] = classData;
          }
        });
        setStudentsByClass(filteredGrouped);
        // Auto-expand the filtered class
        setExpandedClasses(new Set(Object.keys(filteredGrouped)));
      } else {
        // Sort classes and students within each class
        const sortedGrouped = {};
        Object.keys(grouped)
          .sort()
          .forEach(className => {
            sortedGrouped[className] = {
              ...grouped[className],
              students: grouped[className].students.sort((a, b) => 
                a.fullname.localeCompare(b.fullname)
              )
            };
          });
        setStudentsByClass(sortedGrouped);
      }
    } catch (error) {
      console.error('Error loading students by class:', error);
      Alert.alert('Error', 'Failed to load students');
    } finally {
      if (isRefresh) {
        setRefreshing(false);
      } else {
        setLoading(false);
      }
    }
  };

  const toggleClassExpansion = (className) => {
    setExpandedClasses(prev => {
      const newSet = new Set(prev);
      if (newSet.has(className)) {
        newSet.delete(className);
      } else {
        newSet.add(className);
      }
      return newSet;
    });
  };

  const renderStudentItem = ({ item: student }) => (
    <View style={styles.studentItem}>
      <View style={styles.studentInfo}>
        <Text style={styles.studentName}>{student.fullname}</Text>
        <Text style={styles.studentEmail}>{student.email}</Text>
        <Text style={styles.studentId}>ID: {student.customStudentId || student._id}</Text>
      </View>
      <View style={styles.studentStatus}>
        {student.isVerified ? (
          <View style={styles.verifiedBadge}>
            <Ionicons name="checkmark-circle" size={16} color="#27AE60" />
            <Text style={styles.verifiedText}>Verified</Text>
          </View>
        ) : (
          <View style={styles.unverifiedBadge}>
            <Ionicons name="time" size={16} color="#F39C12" />
            <Text style={styles.unverifiedText}>Pending</Text>
          </View>
        )}
      </View>
    </View>
  );

  const renderClassSection = ({ item: className }) => {
    const classData = studentsByClass[className];
    const isExpanded = expandedClasses.has(className);
    const studentCount = classData.students.length;

    return (
      <View style={styles.classSection}>
        <TouchableOpacity
          style={styles.classHeader}
          onPress={() => toggleClassExpansion(className)}
        >
          <View style={styles.classHeaderLeft}>
            <Ionicons 
              name={isExpanded ? "chevron-down" : "chevron-forward"} 
              size={20} 
              color="#4A90E2" 
            />
            <Text style={styles.className}>{className}</Text>
            <View style={styles.studentCountBadge}>
              <Text style={styles.studentCountText}>{studentCount}</Text>
            </View>
          </View>
        </TouchableOpacity>

        {isExpanded && (
          <View style={styles.studentsList}>
            {classData.students.length > 0 ? (
              <FlatList
                data={classData.students}
                renderItem={renderStudentItem}
                keyExtractor={(item) => item._id}
                scrollEnabled={false}
                showsVerticalScrollIndicator={false}
              />
            ) : (
              <Text style={styles.noStudentsText}>No students in this class</Text>
            )}
          </View>
        )}
      </View>
    );
  };

  const renderEmptyState = () => (
    <View style={styles.emptyContainer}>
      <Ionicons name="people-outline" size={64} color="#BDC3C7" />
      <Text style={styles.emptyTitle}>No Students Found</Text>
      <Text style={styles.emptyText}>
        There are no students assigned to any classes yet.
      </Text>
    </View>
  );

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#4A90E2" />
          <Text style={styles.loadingText}>Loading students...</Text>
        </View>
      </SafeAreaView>
    );
  }

  const classNames = Object.keys(studentsByClass);

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => navigation.goBack()}
        >
          <Ionicons name="arrow-back" size={24} color="#4A90E2" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>
          {classId ? `Students - ${className}` : 'Students by Class'}
        </Text>
        <TouchableOpacity
          style={styles.refreshButton}
          onPress={() => loadStudentsByClass(true)}
        >
          <Ionicons name="refresh" size={24} color="#4A90E2" />
        </TouchableOpacity>
      </View>

      {classNames.length > 0 ? (
        <FlatList
          data={classNames}
          renderItem={renderClassSection}
          keyExtractor={(item) => item}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={() => loadStudentsByClass(true)}
              colors={['#4A90E2']}
            />
          }
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.listContainer}
        />
      ) : (
        renderEmptyState()
      )}
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8F9FA',
    paddingTop: 33, // For status bar
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E1E8ED',
  },
  backButton: {
    padding: 8,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#2C3E50',
  },
  refreshButton: {
    padding: 8,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 12,
    fontSize: 16,
    color: '#7F8C8D',
  },
  listContainer: {
    padding: 16,
  },
  classSection: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  classHeader: {
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#F1F3F4',
  },
  classHeaderLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  className: {
    fontSize: 16,
    fontWeight: '600',
    color: '#2C3E50',
    marginLeft: 8,
    flex: 1,
  },
  studentCountBadge: {
    backgroundColor: '#4A90E2',
    borderRadius: 12,
    paddingHorizontal: 8,
    paddingVertical: 4,
    marginLeft: 8,
  },
  studentCountText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '600',
  },
  studentsList: {
    padding: 16,
  },
  studentItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#F1F3F4',
  },
  studentInfo: {
    flex: 1,
  },
  studentName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#2C3E50',
    marginBottom: 4,
  },
  studentEmail: {
    fontSize: 14,
    color: '#7F8C8D',
    marginBottom: 2,
  },
  studentId: {
    fontSize: 12,
    color: '#95A5A6',
  },
  studentStatus: {
    marginLeft: 12,
  },
  verifiedBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#E8F5E8',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  verifiedText: {
    fontSize: 12,
    color: '#27AE60',
    fontWeight: '600',
    marginLeft: 4,
  },
  unverifiedBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FEF9E7',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  unverifiedText: {
    fontSize: 12,
    color: '#F39C12',
    fontWeight: '600',
    marginLeft: 4,
  },
  noStudentsText: {
    fontSize: 14,
    color: '#95A5A6',
    fontStyle: 'italic',
    textAlign: 'center',
    paddingVertical: 20,
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
  },
});

export default StudentsByClassScreen;
