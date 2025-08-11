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
  Button,
  Platform,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Picker } from '@react-native-picker/picker';
import DateTimePicker from '@react-native-community/datetimepicker';
import { Table, Row, Rows } from 'react-native-table-component';
import { adminAPI } from '../../../services/api';

const ShowGradesRecordScreen = ({ route, navigation }) => {
  const { studentId, studentName } = route.params;
  const [examType, setExamType] = useState('monthly');
  const [date, setDate] = useState(new Date());
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [grades, setGrades] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showFilters, setShowFilters] = useState(true);

  const handleDateChange = (event, selectedDate) => {
    const currentDate = selectedDate || date;
    setShowDatePicker(Platform.OS === 'ios');
    setDate(currentDate);
  };

  const fetchFilteredGrades = async () => {
    setLoading(true);
    try {
      // Use existing admin API to get all grades for student
      const response = await adminAPI.getGradesByStudentId(studentId);
      console.log('Admin - Student Grades API Response:', response.data);
      
      if (response.data && response.data.grades && response.data.grades.length > 0) {
        let filteredGrades = response.data.grades;
        
        // Apply client-side filtering
        if (examType) {
          filteredGrades = filteredGrades.filter(grade => grade.gradeType === examType);
        }
        
        if (date) {
          const selectedDate = date.toISOString().split('T')[0];
          filteredGrades = filteredGrades.filter(grade => {
            const gradeDate = new Date(grade.examDate).toISOString().split('T')[0];
            return gradeDate === selectedDate;
          });
        }
        
        console.log('Admin - Filtered Grades:', filteredGrades);
        if (filteredGrades.length > 0) {
          console.log('Admin - First Grade Subjects:', filteredGrades[0].subjects);
          setGrades(filteredGrades);
        } else {
          Alert.alert('No Data', `No grades found for ${studentName} with the selected criteria.`);
          setGrades([]);
        }
      } else {
        Alert.alert('No Data', `No grades found for ${studentName}.`);
        setGrades([]);
      }
    } catch (error) {
      Alert.alert('Error', 'Failed to fetch grades.');
      console.error('Admin fetch grades error:', error);
      setGrades([]);
    } finally {
      setLoading(false);
    }
  };

  const tableHead = ['Subject', 'Marks Obtained', 'Total Marks', 'Percentage', 'Grade'];
  const tableData = grades.flatMap(grade => grade.subjects.map(subject => [subject.subject, subject.marksObtained, subject.totalMarks, `${subject.percentage}%`, subject.grade]));

  const renderEmptyState = () => (
    <View style={styles.emptyContainer}>
      <Ionicons name="document-text-outline" size={80} color="#BDC3C7" />
      <Text style={styles.emptyTitle}>No Grades Found</Text>
      <Text style={styles.emptyText}>
        {showFilters ? 'Use the filters above and tap "Search Grades" to find grades.' : `No grades found for ${studentName} with the selected criteria.`}
      </Text>
    </View>
  );

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#007BFF" />
        <Text style={styles.loadingText}>Searching grades...</Text>
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
        <Text style={styles.headerTitle}>Search Student Grades</Text>
        <TouchableOpacity
          style={styles.filterToggle}
          onPress={() => setShowFilters(!showFilters)}
        >
          <Ionicons name={showFilters ? "eye-off" : "eye"} size={24} color="#2C3E50" />
        </TouchableOpacity>
      </View>

      <View style={styles.content}>
        <Text style={styles.studentNameText}>Student: {studentName}</Text>
        
        {showFilters && (
          <View style={styles.filtersContainer}>
            <Text style={styles.filterLabel}>Exam Type:</Text>
            <Picker
              selectedValue={examType}
              style={styles.picker}
              onValueChange={(itemValue) => setExamType(itemValue)}
            >
              <Picker.Item label="Monthly" value="monthly" />
              <Picker.Item label="Weekly" value="weekly" />
              <Picker.Item label="Daily" value="daily" />
              <Picker.Item label="Surprise" value="surprise" />
            </Picker>

            <View style={styles.dateContainer}>
              <Text style={styles.filterLabel}>Exam Date: {date.toDateString()}</Text>
              <TouchableOpacity 
                style={styles.dateButton} 
                onPress={() => setShowDatePicker(true)}
              >
                <Text style={styles.dateButtonText}>Select Date</Text>
              </TouchableOpacity>
            </View>

            {showDatePicker && (
              <DateTimePicker
                testID="dateTimePicker"
                value={date}
                mode={'date'}
                is24Hour={true}
                display="default"
                onChange={handleDateChange}
              />
            )}

            <TouchableOpacity style={styles.searchButton} onPress={fetchFilteredGrades}>
              <Ionicons name="search" size={20} color="#FFFFFF" style={styles.searchIcon} />
              <Text style={styles.searchButtonText}>Search Grades</Text>
            </TouchableOpacity>
          </View>
        )}

        {grades.length > 0 ? (
          <View style={styles.tableContainer}>
            <Table borderStyle={{borderWidth: 2, borderColor: '#c8e1ff'}}>
              <Row data={tableHead} style={styles.tableHead} textStyle={styles.tableHeadText}/>
              <Rows data={tableData} textStyle={styles.tableText}/>
            </Table>
          </View>
        ) : (
          renderEmptyState()
        )}
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
  filterToggle: {
    width: 24,
    height: 24,
    justifyContent: 'center',
    alignItems: 'center',
  },
  filtersContainer: {
    backgroundColor: '#FFFFFF',
    borderRadius: 10,
    padding: 20,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 2,
  },
  filterLabel: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#2C3E50',
    marginBottom: 8,
  },
  picker: {
    height: 50,
    width: '100%',
    marginBottom: 20,
    backgroundColor: '#F8F9FA',
    borderRadius: 5,
  },
  dateContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  dateButton: {
    backgroundColor: '#007BFF',
    paddingHorizontal: 15,
    paddingVertical: 8,
    borderRadius: 5,
  },
  dateButtonText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '600',
  },
  searchButton: {
    backgroundColor: '#28A745',
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 8,
    marginTop: 10,
  },
  searchIcon: {
    marginRight: 8,
  },
  searchButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: 'bold',
  },
  tableContainer: {
    backgroundColor: '#FFFFFF',
    borderRadius: 10,
    padding: 15,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 2,
  },
  tableHead: {
    height: 45,
    backgroundColor: '#007BFF',
  },
  tableHeadText: {
    margin: 6,
    textAlign: 'center',
    color: '#FFFFFF',
    fontWeight: 'bold',
    fontSize: 14,
  },
  tableText: {
    margin: 6,
    textAlign: 'center',
    fontSize: 13,
    color: '#2C3E50',
  },
});

export default ShowGradesRecordScreen;