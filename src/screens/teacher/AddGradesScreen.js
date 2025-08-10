import React, { useState } from 'react';
import { View, Text, StyleSheet, SafeAreaView, TouchableOpacity, TextInput, Alert, ScrollView } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { teacherAPI } from '../../services/api';

const AddGradesScreen = ({ route, navigation }) => {
  const { studentId, studentName } = route.params;
  const [subject, setSubject] = useState('');
  const [marksObtained, setMarksObtained] = useState('');
  const [totalMarks, setTotalMarks] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async () => {
    if (!subject || !marksObtained || !totalMarks) {
      Alert.alert('Error', 'Please fill in all fields.');
      return;
    }

    const parsedMarksObtained = parseFloat(marksObtained);
    const parsedTotalMarks = parseFloat(totalMarks);

    if (isNaN(parsedMarksObtained) || isNaN(parsedTotalMarks) || parsedMarksObtained < 0 || parsedTotalMarks <= 0) {
      Alert.alert('Error', 'Marks must be valid positive numbers.');
      return;
    }

    if (parsedMarksObtained > parsedTotalMarks) {
      Alert.alert('Error', 'Marks obtained cannot be greater than total marks.');
      return;
    }

    setLoading(true);
    try {
      const response = await teacherAPI.addMarks({
        studentId,
        subject,
        marksObtained: parsedMarksObtained,
        totalMarks: parsedTotalMarks,
      });

      if (response.data.success) {
        Alert.alert('Success', 'Grades added successfully!');
        navigation.goBack();
      } else {
        Alert.alert('Error', response.data.message || 'Failed to add grades.');
      }
    } catch (error) {
      console.error('Error adding grades:', error);
      Alert.alert('Error', 'An error occurred while adding grades.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => navigation.goBack()}
        >
          <Ionicons name="arrow-back" size={24} color="#2C3E50" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Add Grades</Text>
        <View style={styles.headerRight} />
      </View>

      <ScrollView contentContainerStyle={styles.content}>
        <Text style={styles.formTitle}>Add Grades for {studentName}</Text>

        <View style={styles.inputGroup}>
          <Text style={styles.label}>Subject:</Text>
          <TextInput
            style={styles.input}
            placeholder="e.g., Mathematics"
            value={subject}
            onChangeText={setSubject}
          />
        </View>

        <View style={styles.inputGroup}>
          <Text style={styles.label}>Marks Obtained:</Text>
          <TextInput
            style={styles.input}
            placeholder="e.g., 75"
            keyboardType="numeric"
            value={marksObtained}
            onChangeText={setMarksObtained}
          />
        </View>

        <View style={styles.inputGroup}>
          <Text style={styles.label}>Total Marks:</Text>
          <TextInput
            style={styles.input}
            placeholder="e.g., 100"
            keyboardType="numeric"
            value={totalMarks}
            onChangeText={setTotalMarks}
          />
        </View>

        <TouchableOpacity
          style={styles.submitButton}
          onPress={handleSubmit}
          disabled={loading}
        >
          {loading ? (
            <ActivityIndicator color="#FFFFFF" />
          ) : (
            <Text style={styles.submitButtonText}>Submit Grades</Text>
          )}
        </TouchableOpacity>
      </ScrollView>
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
    flexGrow: 1,
    padding: 20,
    alignItems: 'center',
  },
  formTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#2C3E50',
    marginBottom: 30,
    textAlign: 'center',
  },
  inputGroup: {
    width: '100%',
    marginBottom: 20,
  },
  label: {
    fontSize: 16,
    color: '#2C3E50',
    marginBottom: 8,
    fontWeight: '600',
  },
  input: {
    backgroundColor: '#FFFFFF',
    borderRadius: 10,
    paddingHorizontal: 15,
    paddingVertical: 12,
    fontSize: 16,
    color: '#2C3E50',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 2,
  },
  submitButton: {
    backgroundColor: '#007BFF',
    paddingVertical: 15,
    paddingHorizontal: 30,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
    width: '100%',
    marginTop: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 3.84,
    elevation: 5,
  },
  submitButtonText: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: 'bold',
  },
});

export default AddGradesScreen;