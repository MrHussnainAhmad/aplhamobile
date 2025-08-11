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
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { adminAPI } from '../../services/api';

const AssignClassesWithSearchScreen = ({ route, navigation }) => {
  const { classId, className } = route.params;
  const [teachers, setTeachers] = useState([]);
  const [filteredTeachers, setFilteredTeachers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    fetchTeachers();
  }, []);

  useEffect(() => {
    filterTeachers();
  }, [searchQuery, teachers]);

  const fetchTeachers = async () => {
    setLoading(true);
    try {
      const response = await adminAPI.getVerifiedTeachers();
      if (response.data.teachers) {
        setTeachers(response.data.teachers);
      }
    } catch (error) {
      console.error('Error fetching teachers:', error);
      Alert.alert('Error', 'Failed to load teachers.');
    } finally {
      setLoading(false);
    }
  };

  const filterTeachers = () => {
    if (!searchQuery.trim()) {
      setFilteredTeachers(teachers);
      return;
    }

    const filtered = teachers.filter(teacher => {
      const query = searchQuery.toLowerCase();
      return (
        teacher.fullname?.toLowerCase().includes(query) ||
        teacher.teacherId?.toLowerCase().includes(query) ||
        teacher.email?.toLowerCase().includes(query)
      );
    });

    setFilteredTeachers(filtered);
  };

  const handleAssignClass = async (teacherId) => {
    try {
      const response = await adminAPI.assignClass({ teacherId, classId });
      if (response.data.teacher) {
        setTeachers(teachers.map(t => 
          t._id === teacherId ? response.data.teacher : t
        ));
        Alert.alert('Success', response.data.message);
      }
    } catch (error) {
      console.error('Error assigning class:', error);
      Alert.alert('Error', error.response?.data?.message || 'Failed to assign class.');
    }
  };

  const handleUnassignClass = async (teacherId) => {
    try {
      const response = await adminAPI.unassignClass({ teacherId, classId });
      if (response.data.teacher) {
        setTeachers(teachers.map(t => 
          t._id === teacherId ? response.data.teacher : t
        ));
        Alert.alert('Success', response.data.message);
      }
    } catch (error) {
      console.error('Error unassigning class:', error);
      Alert.alert('Error', error.response?.data?.message || 'Failed to unassign class.');
    }
  };

  const renderTeacherItem = ({ item }) => {
    const isAssigned = item.classes.some(cls => cls._id === classId);
    return (
      <View style={styles.teacherCard}>
        <View style={styles.teacherInfo}>
          <Text style={styles.teacherName}>{item.fullname}</Text>
          <Text style={styles.teacherEmail}>{item.email}</Text>
          <Text style={styles.teacherId}>ID: {item.teacherId || 'Not assigned'}</Text>
          
          <View style={styles.classesSection}>
            <Text style={styles.classesLabel}>Assigned Classes:</Text>
            {item.classes && item.classes.length > 0 ? (
              <View style={styles.classesContainer}>
                {item.classes.map(cls => (
                  <View 
                    key={cls._id} 
                    style={[
                      styles.classChip,
                      cls._id === classId && styles.currentClassChip
                    ]}
                  >
                    <Text style={[
                      styles.classChipText,
                      cls._id === classId && styles.currentClassChipText
                    ]}>
                      {cls.name}
                    </Text>
                  </View>
                ))}
              </View>
            ) : (
              <Text style={styles.noClassesText}>No classes assigned</Text>
            )}
          </View>

          {item.subjects && item.subjects.length > 0 && (
            <View style={styles.subjectsSection}>
              <Text style={styles.subjectsLabel}>Subjects:</Text>
              <Text style={styles.subjectsText}>
                {item.subjects.join(', ')}
              </Text>
            </View>
          )}
        </View>
        
        <TouchableOpacity
          style={[styles.assignButton, isAssigned ? styles.unassignButton : styles.assignButtonActive]}
          onPress={() => isAssigned ? handleUnassignClass(item._id) : handleAssignClass(item._id)}
        >
          <Ionicons 
            name={isAssigned ? 'remove-circle' : 'add-circle'} 
            size={20} 
            color="#FFFFFF" 
          />
          <Text style={styles.assignButtonText}>
            {isAssigned ? 'Unassign' : 'Assign'}
          </Text>
        </TouchableOpacity>
      </View>
    );
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#4A90E2" />
        <Text style={styles.loadingText}>Loading verified teachers...</Text>
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-back" size={24} color="#2C3E50" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Assign Teachers</Text>
        <View style={styles.headerRight} />
      </View>

      <View style={styles.content}>
        <View style={styles.classInfo}>
          <Ionicons name="school" size={24} color="#4A90E2" />
          <Text style={styles.classTitle}>{className}</Text>
        </View>

        <View style={styles.searchContainer}>
          <Ionicons name="search" size={20} color="#7F8C8D" style={styles.searchIcon} />
          <TextInput
            style={styles.searchInput}
            placeholder="Search by name, ID, or email..."
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
          {searchQuery.length > 0 && (
            <TouchableOpacity onPress={() => setSearchQuery('')} style={styles.clearButton}>
              <Ionicons name="close-circle" size={20} color="#7F8C8D" />
            </TouchableOpacity>
          )}
        </View>

        {filteredTeachers.length === 0 ? (
          <View style={styles.emptyContainer}>
            <Ionicons name="person-outline" size={60} color="#BDC3C7" />
            <Text style={styles.emptyTitle}>
              {searchQuery ? 'No teachers found' : 'No verified teachers'}
            </Text>
            <Text style={styles.emptyText}>
              {searchQuery 
                ? 'Try adjusting your search terms.' 
                : 'Teachers need to be verified before they can be assigned to classes.'
              }
            </Text>
            {searchQuery && (
              <TouchableOpacity
                style={styles.emptyButton}
                onPress={() => setSearchQuery('')}
              >
                <Text style={styles.emptyButtonText}>Clear Search</Text>
              </TouchableOpacity>
            )}
          </View>
        ) : (
          <>
            <Text style={styles.resultsCount}>
              {filteredTeachers.length} verified teacher{filteredTeachers.length !== 1 ? 's' : ''} found
            </Text>
            <FlatList
              data={filteredTeachers}
              keyExtractor={(item) => item._id}
              renderItem={renderTeacherItem}
              contentContainerStyle={styles.listContent}
              showsVerticalScrollIndicator={false}
            />
          </>
        )}
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
  classInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    padding: 16,
    borderRadius: 12,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 3,
  },
  classTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#2C3E50',
    marginLeft: 12,
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    marginBottom: 16,
    paddingHorizontal: 16,
    borderWidth: 1,
    borderColor: '#E1E8ED',
  },
  searchIcon: {
    marginRight: 12,
  },
  searchInput: {
    flex: 1,
    height: 50,
    fontSize: 16,
    color: '#2C3E50',
  },
  clearButton: {
    padding: 4,
  },
  resultsCount: {
    fontSize: 14,
    color: '#7F8C8D',
    marginBottom: 16,
    textAlign: 'center',
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
  teacherInfo: {
    flex: 1,
    marginBottom: 16,
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
  teacherId: {
    fontSize: 12,
    color: '#95A5A6',
    marginBottom: 12,
  },
  classesSection: {
    marginBottom: 12,
  },
  classesLabel: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#2C3E50',
    marginBottom: 8,
  },
  classesContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
  },
  classChip: {
    backgroundColor: '#E3F2FD',
    borderRadius: 16,
    paddingHorizontal: 12,
    paddingVertical: 4,
  },
  currentClassChip: {
    backgroundColor: '#4A90E2',
  },
  classChipText: {
    fontSize: 12,
    color: '#1976D2',
    fontWeight: '500',
  },
  currentClassChipText: {
    color: '#FFFFFF',
  },
  noClassesText: {
    fontSize: 12,
    color: '#95A5A6',
    fontStyle: 'italic',
  },
  subjectsSection: {
    borderTopWidth: 1,
    borderTopColor: '#F0F0F0',
    paddingTop: 12,
  },
  subjectsLabel: {
    fontSize: 12,
    fontWeight: 'bold',
    color: '#7F8C8D',
    marginBottom: 4,
  },
  subjectsText: {
    fontSize: 12,
    color: '#95A5A6',
  },
  assignButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 8,
    gap: 6,
  },
  assignButtonActive: {
    backgroundColor: '#27AE60',
  },
  unassignButton: {
    backgroundColor: '#E74C3C',
  },
  assignButtonText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: 'bold',
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
});

export default AssignClassesWithSearchScreen;
