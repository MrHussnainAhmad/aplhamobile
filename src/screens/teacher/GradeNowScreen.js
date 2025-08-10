import React from 'react';
import { View, Text, StyleSheet, SafeAreaView, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

const GradeNowScreen = ({ route, navigation }) => {
  const { studentId, studentName } = route.params;

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => navigation.goBack()}
        >
          <Ionicons name="arrow-back" size={24} color="#2C3E50" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Grade Student</Text>
        <View style={styles.headerRight} />
      </View>

      <View style={styles.content}>
        <Text style={styles.studentNameText}>Grading for: {studentName}</Text>
        <Text style={styles.studentIdText}>Student ID: {studentId}</Text>

        <TouchableOpacity
          style={styles.actionButton}
          onPress={() => navigation.navigate('AddGrades', { studentId, studentName })}
        >
          <Ionicons name="add-circle-outline" size={24} color="#FFFFFF" />
          <Text style={styles.buttonText}>Add New Grades</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.actionButton, styles.viewRecordButton]}
          onPress={() => navigation.navigate('ShowGradesRecord', { studentId, studentName })}
        >
          <Ionicons name="document-text-outline" size={24} color="#FFFFFF" />
          <Text style={styles.buttonText}>Show Record</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8F9FA',
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
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  studentNameText: {
    fontSize: 22,
    fontWeight: 'bold',
    marginBottom: 10,
    color: '#2C3E50',
  },
  studentIdText: {
    fontSize: 16,
    color: '#7F8C8D',
    marginBottom: 20,
  },
  
  actionButton: {
    flexDirection: 'row',
    backgroundColor: '#007BFF',
    paddingVertical: 12,
    paddingHorizontal: 25,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 15,
    width: '80%',
  },
  viewRecordButton: {
    backgroundColor: '#28A745',
  },
  buttonText: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: 'bold',
    marginLeft: 10,
  },
});

export default GradeNowScreen;