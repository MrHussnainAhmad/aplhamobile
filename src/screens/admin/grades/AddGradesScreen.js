import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, SafeAreaView, TouchableOpacity, TextInput, Alert, ScrollView, FlatList, ActivityIndicator, Modal } from 'react-native';
import { Ionicons, MaterialIcons } from '@expo/vector-icons';
import DateTimePicker from '@react-native-community/datetimepicker';
import { adminAPI } from '../../../services/api';

const AddGradesScreen = ({ route, navigation }) => {
  const { studentId, studentName } = route.params;
  
  // Grade types
  const [selectedGradeType, setSelectedGradeType] = useState('');
  
  // Subject management
  const [subjects, setSubjects] = useState([]);
  const [isModalVisible, setModalVisible] = useState(false);
  const [newSubject, setNewSubject] = useState('');

  useEffect(() => {
    fetchSubjects();
  }, []);

  const fetchSubjects = async () => {
    try {
      const response = await adminAPI.getAllSubjects();
      if (response.data && response.data.subjects) {
        setSubjects(response.data.subjects.map(s => s.name));
      }
    } catch (error) {
      console.error('Error fetching subjects:', error);
      Alert.alert('Error', 'Failed to load subjects.');
    }
  };

  const handleAddSubject = () => {
    Alert.alert('Not Implemented', 'This feature will be enabled soon.');
  };
  
  // For multiple subjects (Monthly, Weekly, Daily)
  const [selectedSubjects, setSelectedSubjects] = useState([]);
  const [subjectGrades, setSubjectGrades] = useState({});
  
  // For single subject (Surprise)
  const [singleSubject, setSingleSubject] = useState('');
  const [singleMarksObtained, setSingleMarksObtained] = useState('');
  const [singleTotalMarks, setSingleTotalMarks] = useState('');
  
  // Additional fields
  const [examDate, setExamDate] = useState('');
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [comments, setComments] = useState('');
  const [loading, setLoading] = useState(false);
  const [gradeSettingsLoading, setGradeSettingsLoading] = useState(true); // New state
  const [gradeSettings, setGradeSettings] = useState([]);

  useEffect(() => {
    fetchSubjects();
    fetchGradeSettings(); // New call
  }, []);

  const fetchGradeSettings = async () => {
    try {
      setGradeSettingsLoading(true); // Set loading to true
      const response = await adminAPI.getGradeSettings();
      if (response.data && response.data.gradeSettings) {
        // Sort settings by minPercentage in descending order for correct grade calculation
        const sortedSettings = response.data.gradeSettings.sort((a, b) => b.minPercentage - a.minPercentage);
        setGradeSettings(sortedSettings);
        console.log('Fetched and sorted grade settings:', sortedSettings);
      } else {
        // Fallback to default hardcoded grades if no settings are found
        const defaultGrades = [
          { grade: 'A+', minPercentage: 90 },
          { grade: 'A', minPercentage: 80 },
          { grade: 'B+', minPercentage: 70 },
          { grade: 'B', minPercentage: 60 },
          { grade: 'C+', minPercentage: 55 },
          { grade: 'C', minPercentage: 50 },
          { grade: 'D', minPercentage: 40 },
          { grade: 'F', minPercentage: 0 },
        ];
        setGradeSettings(defaultGrades);
        console.log('Using default grade settings:', defaultGrades);
      }
    } catch (error) {
      console.error('Error fetching grade settings:', error);
      Alert.alert('Error', 'Failed to load grade settings. Using default.');
      // Fallback to default hardcoded grades on error
      const defaultGrades = [
        { grade: 'A+', minPercentage: 90 },
        { grade: 'A', minPercentage: 80 },
        { grade: 'B+', minPercentage: 70 },
        { grade: 'B', minPercentage: 60 },
        { grade: 'C+', minPercentage: 55 },
        { grade: 'C', minPercentage: 50 },
        { grade: 'D', minPercentage: 40 },
        { grade: 'F', minPercentage: 0 },
      ];
      setGradeSettings(defaultGrades);
      console.log('Using default grade settings (on error):', defaultGrades);
    } finally {
      setGradeSettingsLoading(false); // Set loading to false
    }
  };

  const gradeTypes = [
    { id: 'monthly', label: 'Monthly Test', icon: 'calendar-month', color: '#3498db' },
    { id: 'weekly', label: 'Weekly Assessment', icon: 'calendar-week', color: '#2ecc71' },
    { id: 'daily', label: 'Daily Quiz', icon: 'today', color: '#f39c12' },
    { id: 'surprise', label: 'Surprise Test', icon: 'flash-on', color: '#e74c3c' }
  ];

  // Handle subject selection for multiple subjects
  const handleSubjectToggle = (subject) => {
    if (selectedSubjects.includes(subject)) {
      setSelectedSubjects(selectedSubjects.filter(s => s !== subject));
      const newGrades = { ...subjectGrades };
      delete newGrades[subject];
      setSubjectGrades(newGrades);
    } else {
      setSelectedSubjects([...selectedSubjects, subject]);
      setSubjectGrades({ ...subjectGrades, [subject]: { obtained: '', total: '' } });
    }
  };

  // Handle marks input for multiple subjects
  const handleSubjectMarksChange = (subject, field, value) => {
    setSubjectGrades({
      ...subjectGrades,
      [subject]: { ...subjectGrades[subject], [field]: value }
    });
  };

  // Calculate percentage and grade
  const calculateGrade = (obtained, total) => {
    const percentage = (obtained / total) * 100;
    console.log(`Calculating grade for: Obtained=${obtained}, Total=${total}, Percentage=${percentage}`);
    console.log('Current grade settings for calculation:', gradeSettings);

    // Use fetched grade settings
    for (const setting of gradeSettings) {
      console.log(`Checking grade: ${setting.grade}, Min Percentage: ${setting.minPercentage}, Current Percentage: ${percentage}`);
      if (percentage >= setting.minPercentage) {
        // Assign color based on grade (can be made configurable too if needed)
        let color = '#c0392b'; // Default to red for F
        if (setting.grade === 'A+') color = '#27ae60';
        else if (setting.grade === 'A') color = '#2ecc71';
        else if (setting.grade === 'B+') color = '#f39c12';
        else if (setting.grade === 'B') color = '#e67e22';
        else if (setting.grade === 'C+') color = '#e74c3c';
        else if (setting.grade === 'C') color = '#e74c3c';
        else if (setting.grade === 'D') color = '#e74c3c';
        console.log(`Assigned grade: ${setting.grade} with color ${color}`);
        return { grade: setting.grade, color };
      }
    }
    console.log('No grade matched, assigning F.');
    // Fallback if no grade matches (should ideally not happen with a 0% F grade)
    return { grade: 'F', color: '#c0392b' };
  };

  // Validate grades input
  const validateGrades = () => {
    if (!selectedGradeType) {
      Alert.alert('Error', 'Please select a grade type.');
      return false;
    }

    if (!examDate) {
      Alert.alert('Error', 'Please select an exam date.');
      return false;
    }

    if (selectedGradeType === 'surprise') {
      if (!singleSubject || !singleMarksObtained || !singleTotalMarks) {
        Alert.alert('Error', 'Please fill in all fields for the surprise test.');
        return false;
      }
      const obtained = parseFloat(singleMarksObtained);
      const total = parseFloat(singleTotalMarks);
      if (isNaN(obtained) || isNaN(total) || obtained < 0 || total <= 0) {
        Alert.alert('Error', 'Marks must be valid positive numbers.');
        return false;
      }
      if (obtained > total) {
        Alert.alert('Error', 'Marks obtained cannot exceed total marks.');
        return false;
      }
    } else {
      if (selectedSubjects.length === 0) {
        Alert.alert('Error', 'Please select at least one subject.');
        return false;
      }
      for (const subject of selectedSubjects) {
        const grades = subjectGrades[subject];
        if (!grades || !grades.obtained || !grades.total) {
          Alert.alert('Error', `Please fill in marks for ${subject}.`);
          return false;
        }
        const obtained = parseFloat(grades.obtained);
        const total = parseFloat(grades.total);
        if (isNaN(obtained) || isNaN(total) || obtained < 0 || total <= 0) {
          Alert.alert('Error', `Invalid marks for ${subject}. Must be positive numbers.`);
          return false;
        }
        if (obtained > total) {
          Alert.alert('Error', `Marks obtained cannot exceed total marks for ${subject}.`);
          return false;
        }
      }
    }
    return true;
  };

  const onDateChange = (event, selectedDate) => {
    setShowDatePicker(false);
    if (selectedDate) {
      setExamDate(selectedDate.toISOString().split('T')[0]); // Format YYYY-MM-DD
    }
  };
//new
  const handleSubmit = async () => {
    if (!validateGrades()) return;

    setLoading(true);
    try {
      let gradesData;
      
      if (selectedGradeType === 'surprise') {
        gradesData = {
          studentId,
          gradeType: selectedGradeType,
          examDate,
          comments,
          subjects: [{
            subject: singleSubject,
            marksObtained: parseFloat(singleMarksObtained),
            totalMarks: parseFloat(singleTotalMarks),
            percentage: ((parseFloat(singleMarksObtained) / parseFloat(singleTotalMarks)) * 100).toFixed(2),
            grade: calculateGrade(parseFloat(singleMarksObtained), parseFloat(singleTotalMarks)).grade
          }]
        };
      } else {
        gradesData = {
          studentId,
          gradeType: selectedGradeType,
          examDate,
          comments,
          subjects: selectedSubjects.map(subject => ({
            subject,
            marksObtained: parseFloat(subjectGrades[subject].obtained),
            totalMarks: parseFloat(subjectGrades[subject].total),
            percentage: ((parseFloat(subjectGrades[subject].obtained) / parseFloat(subjectGrades[subject].total)) * 100).toFixed(2),
            grade: calculateGrade(parseFloat(subjectGrades[subject].obtained), parseFloat(subjectGrades[subject].total)).grade
          }))
        };
      }

      console.log('Submitting grades data:', gradesData);
      const response = await adminAPI.addGrades(gradesData);
      
      Alert.alert('Success', `Grades added successfully!\nExam ID: ${response.data.examId}`, [
        { text: 'OK', onPress: () => navigation.goBack() }
      ]);
      
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

        {/* Grade Type Selection */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Select Grade Type</Text>
          <View style={styles.gradeTypesContainer}>
            {gradeTypes.map((type) => (
              <TouchableOpacity
                key={type.id}
                style={[
                  styles.gradeTypeCard,
                  selectedGradeType === type.id && {
                    backgroundColor: type.color,
                    transform: [{ scale: 0.95 }]
                  }
                ]}
                onPress={() => {
                  setSelectedGradeType(type.id);
                  // Reset selections when changing grade type
                  setSelectedSubjects([]);
                  setSubjectGrades({});
                  setSingleSubject('');
                  setSingleMarksObtained('');
                  setSingleTotalMarks('');
                }}
              >
                <MaterialIcons 
                  name={type.icon} 
                  size={24} 
                  color={selectedGradeType === type.id ? '#FFFFFF' : type.color} 
                />
                <Text style={[
                  styles.gradeTypeText,
                  selectedGradeType === type.id && { color: '#FFFFFF' }
                ]}>{type.label}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Additional Information */}
        {selectedGradeType && (
          <View style={styles.section}>
            <View style={styles.inputGroup}>
              <Text style={styles.label}>Exam Date</Text>
              <TouchableOpacity onPress={() => setShowDatePicker(true)} style={styles.datePickerButton}>
                <Text style={styles.datePickerButtonText}>{examDate || 'Select Date'}</Text>
                <Ionicons name="calendar" size={24} color="#2C3E50" />
              </TouchableOpacity>
            </View>
            <View style={styles.infoBox}>
              <Ionicons name="information-circle" size={20} color="#3498db" />
              <Text style={styles.infoText}>
                Exam ID will be auto-generated based on student ID for easy record retrieval.
              </Text>
            </View>
          </View>
        )}

        {/* Surprise Test - Single Subject */}
        {selectedGradeType === 'surprise' && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Surprise Test Details</Text>
            
            <View style={styles.inputGroup}>
              <View style={{flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center'}}>
                <Text style={styles.label}>Subject</Text>
                <TouchableOpacity onPress={() => setModalVisible(true)}>
                  <Ionicons name="add-circle-outline" size={24} color="#007BFF" />
                </TouchableOpacity>
              </View>
              <View style={styles.subjectsGrid}>
                {subjects.map((subject) => (
                  <TouchableOpacity
                    key={subject}
                    style={[
                      styles.subjectCard,
                      singleSubject === subject && styles.selectedSubjectCard
                    ]}
                    onPress={() => setSingleSubject(subject)}
                  >
                    <Text style={[
                      styles.subjectCardText,
                      singleSubject === subject && styles.selectedSubjectCardText
                    ]}>{subject}</Text>
                    {singleSubject === subject && (
                      <Ionicons name="checkmark-circle" size={20} color="#FFFFFF" style={styles.checkmark} />
                    )}
                  </TouchableOpacity>
                ))}
              </View>
            </View>

            <View style={styles.marksRow}>
              <View style={[styles.inputGroup, { flex: 1, marginRight: 10 }]}>
                <Text style={styles.label}>Obtained Marks</Text>
                <TextInput
                  style={styles.input}
                  placeholder="75"
                  keyboardType="numeric"
                  value={singleMarksObtained}
                  onChangeText={setSingleMarksObtained}
                />
              </View>
              <View style={[styles.inputGroup, { flex: 1, marginLeft: 10 }]}>
                <Text style={styles.label}>Total Marks</Text>
                <TextInput
                  style={styles.input}
                  placeholder="100"
                  keyboardType="numeric"
                  value={singleTotalMarks}
                  onChangeText={setSingleTotalMarks}
                />
              </View>
            </View>

            {/* Show calculated grade preview */}
            {singleMarksObtained && singleTotalMarks && (
              <View style={styles.gradePreview}>
                <Text style={styles.gradePreviewLabel}>Grade Preview:</Text>
                <View style={[
                  styles.gradeBadge,
                  { backgroundColor: calculateGrade(parseFloat(singleMarksObtained), parseFloat(singleTotalMarks)).color }
                ]}>
                  <Text style={styles.gradeBadgeText}>
                    {calculateGrade(parseFloat(singleMarksObtained), parseFloat(singleTotalMarks)).grade} 
                    ({((parseFloat(singleMarksObtained) / parseFloat(singleTotalMarks)) * 100).toFixed(1)}%)
                  </Text>
                </View>
              </View>
            )}
          </View>
        )}

        {/* Multiple Subjects - Monthly, Weekly, Daily */}
        {selectedGradeType && selectedGradeType !== 'surprise' && (
          <View style={styles.section}>
            <View style={{flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center'}}>
              <Text style={styles.sectionTitle}>
                Select Subjects {selectedGradeType === 'monthly' || selectedGradeType === 'weekly' ? '(All Subjects Available)' : '(Multiple Allowed)'}
              </Text>
              <TouchableOpacity onPress={() => setModalVisible(true)}>
                <Ionicons name="add-circle-outline" size={24} color="#007BFF" />
              </TouchableOpacity>
            </View>
            
            <View style={styles.subjectsGrid}>
              {subjects.map((subject) => (
                <TouchableOpacity
                  key={subject}
                  style={[
                    styles.subjectCard,
                    selectedSubjects.includes(subject) && styles.selectedSubjectCard
                  ]}
                  onPress={() => handleSubjectToggle(subject)}
                >
                  <Text style={[
                    styles.subjectCardText,
                    selectedSubjects.includes(subject) && styles.selectedSubjectCardText
                  ]}>{subject}</Text>
                  {selectedSubjects.includes(subject) && (
                    <Ionicons name="checkmark-circle" size={20} color="#FFFFFF" style={styles.checkmark} />
                  )}
                </TouchableOpacity>
              ))}
            </View>

            {/* Marks Input for Selected Subjects */}
            {selectedSubjects.length > 0 && (
              <View style={styles.marksSection}>
                <Text style={styles.sectionTitle}>Enter Marks</Text>
                {selectedSubjects.map((subject) => (
                  <View key={subject} style={styles.subjectMarksCard}>
                    <Text style={styles.subjectMarksTitle}>{subject}</Text>
                    <View style={styles.marksRow}>
                      <View style={[styles.inputGroup, { flex: 1, marginRight: 10 }]}>
                        <Text style={styles.label}>Obtained</Text>
                        <TextInput
                          style={styles.input}
                          placeholder="0"
                          keyboardType="numeric"
                          value={subjectGrades[subject]?.obtained || ''}
                          onChangeText={(value) => handleSubjectMarksChange(subject, 'obtained', value)}
                        />
                      </View>
                      <View style={[styles.inputGroup, { flex: 1, marginLeft: 10 }]}>
                        <Text style={styles.label}>Total</Text>
                        <TextInput
                          style={styles.input}
                          placeholder="100"
                          keyboardType="numeric"
                          value={subjectGrades[subject]?.total || ''}
                          onChangeText={(value) => handleSubjectMarksChange(subject, 'total', value)}
                        />
                      </View>
                      {subjectGrades[subject]?.obtained && subjectGrades[subject]?.total && (
                        <View style={styles.gradeIndicator}>
                          <View style={[
                            styles.miniGradeBadge,
                            { backgroundColor: calculateGrade(parseFloat(subjectGrades[subject].obtained), parseFloat(subjectGrades[subject].total)).color }
                          ]}>
                            <Text style={styles.miniGradeBadgeText}>
                              {calculateGrade(parseFloat(subjectGrades[subject].obtained), parseFloat(subjectGrades[subject].total)).grade}
                            </Text>
                          </View>
                        </View>
                      )}
                    </View>
                  </View>
                ))}
              </View>
            )}
          </View>
        )}

        {/* Comments Section */}
        {selectedGradeType && (
          <View style={styles.section}>
            <View style={styles.inputGroup}>
              <Text style={styles.label}>Comments (Optional)</Text>
              <TextInput
                style={[styles.input, styles.textArea]}
                placeholder="Add any additional notes or comments..."
                value={comments}
                onChangeText={setComments}
                multiline
                numberOfLines={3}
              />
            </View>
          </View>
        )}

        {/* Submit Button */}
        {selectedGradeType && (
          <TouchableOpacity
            style={[styles.submitButton, loading && styles.disabledButton]}
            onPress={handleSubmit}
            disabled={loading}
          >
            {loading ? (
              <ActivityIndicator color="#FFFFFF" />
            ) : (
              <>
                <Ionicons name="checkmark-circle-outline" size={24} color="#FFFFFF" />
                <Text style={styles.submitButtonText}>Submit Grades</Text>
              </>
            )}
          </TouchableOpacity>
        )}
      </ScrollView>

      {showDatePicker && (
        <DateTimePicker
          testID="dateTimePicker"
          value={examDate ? new Date(examDate) : new Date()}
          mode="date"
          display="default"
          onChange={onDateChange}
        />
      )}

      <Modal
        animationType="slide"
        transparent={true}
        visible={isModalVisible}
        onRequestClose={() => {
          setModalVisible(!isModalVisible);
        }}
      >
        <View style={styles.centeredView}>
          <View style={styles.modalView}>
            <Text style={styles.modalText}>Add New Subject</Text>
            <TextInput
              style={styles.input}
              placeholder="Subject Name"
              value={newSubject}
              onChangeText={setNewSubject}
            />
            <View style={styles.modalButtons}>
              <TouchableOpacity
                style={[styles.button, styles.buttonClose]}
                onPress={() => setModalVisible(!isModalVisible)}
              >
                <Text style={styles.textStyle}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.button, styles.buttonOpen]}
                onPress={handleAddSubject}
              >
                <Text style={styles.textStyle}>Add</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

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
    marginLeft: 8,
  },
  disabledButton: {
    backgroundColor: '#95a5a6',
  },
  
  // Section styles
  section: {
    width: '100%',
    marginBottom: 25,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#2C3E50',
    marginBottom: 15,
  },
  
  // Grade Type Selection
  gradeTypesContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  gradeTypeCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 15,
    alignItems: 'center',
    width: '48%',
    marginBottom: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 5,
  },
  gradeTypeText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#2C3E50',
    marginTop: 8,
    textAlign: 'center',
  },
  
  
  
  // Multiple subjects grid
  subjectsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  subjectCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 10,
    padding: 15,
    width: '48%',
    marginBottom: 10,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 2,
    position: 'relative',
  },
  selectedSubjectCard: {
    backgroundColor: '#3498db',
  },
  subjectCardText: {
    fontSize: 14,
    color: '#2C3E50',
    textAlign: 'center',
    fontWeight: '500',
  },
  selectedSubjectCardText: {
    color: '#FFFFFF',
    fontWeight: '600',
  },
  checkmark: {
    position: 'absolute',
    top: 8,
    right: 8,
  },
  
  // Marks input
  marksRow: {
    flexDirection: 'row',
    alignItems: 'flex-end',
  },
  marksSection: {
    width: '100%',
    marginTop: 20,
  },
  subjectMarksCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 10,
    padding: 15,
    marginBottom: 15,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 2,
  },
  subjectMarksTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#2C3E50',
    marginBottom: 10,
  },
  
  // Grade indicators
  gradeIndicator: {
    marginLeft: 10,
    justifyContent: 'flex-end',
  },
  miniGradeBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  miniGradeBadgeText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: 'bold',
  },
  
  // Grade preview
  gradePreview: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 15,
    padding: 15,
    backgroundColor: '#F8F9FA',
    borderRadius: 10,
  },
  gradePreviewLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: '#2C3E50',
    marginRight: 10,
  },
  gradeBadge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 15,
    alignItems: 'center',
    justifyContent: 'center',
  },
  gradeBadgeText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: 'bold',
  },
  
  // Text area
  textArea: {
    height: 80,
    textAlignVertical: 'top',
  },
  datePickerButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#FFFFFF',
    borderRadius: 10,
    paddingHorizontal: 15,
    paddingVertical: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 2,
  },
  datePickerButtonText: {
    fontSize: 16,
    color: '#2C3E50',
  },
  centeredView: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    marginTop: 22
  },
  modalView: {
    margin: 20,
    backgroundColor: "white",
    borderRadius: 20,
    padding: 35,
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2
    },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5
  },
  button: {
    borderRadius: 20,
    padding: 10,
    elevation: 2
  },
  buttonOpen: {
    backgroundColor: "#F194FF",
  },
  buttonClose: {
    backgroundColor: "#2196F3",
  },
  textStyle: {
    color: "white",
    fontWeight: "bold",
    textAlign: "center"
  },
  modalText: {
    marginBottom: 15,
    textAlign: "center"
  },
  modalButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '100%'
  },
  
  // Info box styles
  infoBox: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#E3F2FD',
    padding: 12,
    borderRadius: 8,
    marginTop: 10,
  },
  infoText: {
    fontSize: 14,
    color: '#1976D2',
    marginLeft: 8,
    flex: 1,
  },
  loadingOverlay: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F8F9FA',
  },
  loadingText: {
    marginTop: 10,
    fontSize: 16,
    color: '#2C3E50',
  }
});

export default AddGradesScreen;