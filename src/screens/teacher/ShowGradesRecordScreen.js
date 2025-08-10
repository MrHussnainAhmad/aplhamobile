import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  TouchableOpacity,
  FlatList,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { teacherAPI } from '../../services/api';

const ShowGradesRecordScreen = ({ route, navigation }) => {
  const { studentId, studentName } = route.params;
  const [marks, setMarks] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchMarks();
  }, [studentId]);

  const fetchMarks = async () => {
    setLoading(true);
    try {
      const response = await teacherAPI.getMarksByStudentId(studentId);
      if (response.data.success && response.data.marks) {
        setMarks(response.data.marks);
      } else {
        Alert.alert('Error', response.data.message || 'Failed to fetch marks.');
      }
    } catch (error) {
      console.error('Error fetching marks:', error);
      Alert.alert('Error', 'An error occurred while fetching marks.');
    } finally {
      setLoading(false);
    }
  };

  const renderMarkItem = ({ item }) => (
    <View style={styles.markCard}>
      <Text style={styles.markSubject}>{item.subject}</Text>
      <Text style={styles.markDetails}>{item.marksObtained} / {item.totalMarks}</Text>
      <Text style={styles.markDate}>Date: {new Date(item.date).toLocaleDateString()}</Text>
    </View>
  );

  const renderEmptyState = () => (
    <View style={styles.emptyContainer}>
      <Ionicons name="document-text-outline" size={80} color="#BDC3C7" />
      <Text style={styles.emptyTitle}>No Grades Recorded</Text>
      <Text style={styles.emptyText}>
        No grades have been added for {studentName} yet.
      </Text>
    </View>
  );

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#007BFF" />
        <Text style={styles.loadingText}>Loading grades...</Text>
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => navigation.goBack()}
        >
          <Ionicons name="arrow-back" size={24} color="#2C3E50" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Grades Record</Text>
        <View style={styles.headerRight} />
      </View>

      <View style={styles.content}>
        <Text style={styles.studentNameText}>Grades for: {studentName}</Text>
        <FlatList
          data={marks}
          keyExtractor={(item, index) => item?._id || index.toString()}
          renderItem={renderMarkItem}
          ListEmptyComponent={renderEmptyState}
          contentContainerStyle={marks.length === 0 ? styles.listEmptyContent : styles.listContent}
        />
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8F9FA',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F8F9FA',
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
  backButton: {
    width: 24,
  },
  headerRight: {
    width: 24,
  },
  content: {
    flex: 1,
    padding: 20,
  },
  studentNameText: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#2C3E50',
    marginBottom: 20,
    textAlign: 'center',
  },
  markCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 10,
    padding: 15,
    marginBottom: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 2,
  },
  markSubject: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#2C3E50',
    marginBottom: 5,
  },
  markDetails: {
    fontSize: 16,
    color: '#555',
    marginBottom: 5,
  },
  markDate: {
    fontSize: 14,
    color: '#7F8C8D',
    fontStyle: 'italic',
  },
  listContent: {
    paddingBottom: 20,
  },
  listEmptyContent: {
    flexGrow: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyContainer: {
    flexGrow: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 40,
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#7F8C8D',
    marginTop: 16,
    marginBottom: 8,
  },
  emptyText: {
    fontSize: 16,
    color: '#95A5A6',
    textAlign: 'center',
    lineHeight: 24,
  },
});

export default ShowGradesRecordScreen;