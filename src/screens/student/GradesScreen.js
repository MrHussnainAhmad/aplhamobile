import React, { useState } from 'react';
import { View, Text, StyleSheet, Button, Platform, ActivityIndicator, Alert } from 'react-native';
import { Picker } from '@react-native-picker/picker';
import DateTimePicker from '@react-native-community/datetimepicker';
import { Table, Row, Rows } from 'react-native-table-component';
import { userAPI } from '../../services/api';

const GradesScreen = () => {
  const [examType, setExamType] = useState('monthly');
  const [date, setDate] = useState(new Date());
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [grades, setGrades] = useState([]);
  const [loading, setLoading] = useState(false);

  const handleDateChange = (event, selectedDate) => {
    const currentDate = selectedDate || date;
    setShowDatePicker(Platform.OS === 'ios');
    setDate(currentDate);
  };

  const fetchGrades = async () => {
    setLoading(true);
    try {
      const params = {
        gradeType: examType,
        examDate: date.toISOString().split('T')[0],
      };
      const response = await userAPI.getMyGrades(params);
      setGrades(response.data.grades);
    } catch (error) {
      Alert.alert('Error', 'Failed to fetch grades.');
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const tableHead = ['Subject', 'Marks'];
  const tableData = grades.flatMap(grade => grade.subjects.map(subject => [subject.subjectName, subject.marks]));

  return (
    <View style={styles.container}>
      <Text style={styles.title}>View Grades</Text>

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
        <Text style={styles.dateText}>Exam Date: {date.toDateString()}</Text>
        <Button onPress={() => setShowDatePicker(true)} title="Select Date" />
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

      <Button title="Fetch Grades" onPress={fetchGrades} />

      {loading ? (
        <ActivityIndicator size="large" color="#0000ff" />
      ) : (
        grades.length > 0 ? (
          <View style={styles.tableContainer}>
            <Table borderStyle={{borderWidth: 2, borderColor: '#c8e1ff'}}>
              <Row data={tableHead} style={styles.head} textStyle={styles.text}/>
              <Rows data={tableData} textStyle={styles.text}/>
            </Table>
          </View>
        ) : (
          <Text>No grades found for the selected criteria.</Text>
        )
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, padding: 16, paddingTop: 30, backgroundColor: '#fff' },
  head: { height: 40, backgroundColor: '#f1f8ff' },
  text: { margin: 6, textAlign: 'center' },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
  },
  picker: {
    height: 50,
    width: '100%',
    marginBottom: 20,
  },
  dateContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  dateText: {
    fontSize: 16,
  },
  tableContainer: {
    marginTop: 20,
  },
});

export default GradesScreen;