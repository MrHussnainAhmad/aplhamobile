import React, { useState, useEffect } from "react";
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
  StatusBar,
  ScrollView,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { Picker } from "@react-native-picker/picker";
import DateTimePicker from "@react-native-community/datetimepicker";
import { Table, Row, Rows } from "react-native-table-component";
import { adminAPI } from "../../../services/api";

const ShowGradesRecordScreen = ({ route, navigation }) => {
  const { studentId, studentName } = route.params;
  const [examType, setExamType] = useState("monthly");
  const [date, setDate] = useState(new Date());
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [grades, setGrades] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showFilters, setShowFilters] = useState(true);

  const handleDateChange = (event, selectedDate) => {
    const currentDate = selectedDate || date;
    setShowDatePicker(Platform.OS === "ios");
    setDate(currentDate);
  };

  const fetchFilteredGrades = async () => {
    setLoading(true);
    try {
      // Use existing admin API to get all grades for student
      const response = await adminAPI.getGradesByStudentId(studentId);
      console.log("Admin - Student Grades API Response:", response.data);

      if (
        response.data &&
        response.data.grades &&
        response.data.grades.length > 0
      ) {
        let filteredGrades = response.data.grades;

        // Apply client-side filtering
        if (examType) {
          filteredGrades = filteredGrades.filter(
            (grade) => grade.gradeType === examType
          );
        }

        if (date) {
          const selectedDate = date.toISOString().split("T")[0];
          filteredGrades = filteredGrades.filter((grade) => {
            const gradeDate = new Date(grade.examDate)
              .toISOString()
              .split("T")[0];
            return gradeDate === selectedDate;
          });
        }

        console.log("Admin - Filtered Grades:", filteredGrades);
        if (filteredGrades.length > 0) {
          console.log(
            "Admin - First Grade Subjects:",
            filteredGrades[0].subjects
          );
          setGrades(filteredGrades);
        } else {
          Alert.alert(
            "No Data",
            `No grades found for ${studentName} with the selected criteria.`
          );
          setGrades([]);
        }
      } else {
        Alert.alert("No Data", `No grades found for ${studentName}.`);
        setGrades([]);
      }
    } catch (error) {
      Alert.alert("Error", "Failed to fetch grades.");
      console.error("Admin fetch grades error:", error);
      setGrades([]);
    } finally {
      setLoading(false);
    }
  };

  const tableHead = [
    "Subject",
    "Marks Obtained",
    "Total Marks",
    "Percentage",
    "Grade",
  ];
  // Create separate tables for each grade submission (show all submissions for the day)
  const gradeTables = grades.map((grade, index) => {
    const subjectRows = grade.subjects.map((subject) => [
      subject.subject,
      subject.marksObtained,
      subject.totalMarks,
      `${subject.percentage}%`,
      subject.grade,
    ]);
    
    // Calculate totals for this grade submission
    const totalObtained = grade.subjects.reduce((sum, subject) => sum + parseFloat(subject.marksObtained), 0);
    const totalMarks = grade.subjects.reduce((sum, subject) => sum + parseFloat(subject.totalMarks), 0);
    const overallPercentage = totalMarks > 0 ? ((totalObtained / totalMarks) * 100).toFixed(1) : 0;
    
    // Add total row
    const totalRow = [
      'TOTAL',
      totalObtained,
      totalMarks,
      `${overallPercentage}%`,
      '---', // Grade will be calculated based on percentage
    ];
    
    return {
      examId: grade.examId || grade._id,
      examDate: grade.examDate,
      gradeType: grade.gradeType,
      tableData: [...subjectRows, totalRow],
      comments: grade.comments,
      submissionNumber: index + 1
    };
  });

  const renderEmptyState = () => (
    <View style={styles.emptyContainer}>
      <Ionicons name="document-text-outline" size={80} color="#BDC3C7" />
      <Text style={styles.emptyTitle}>No Grades Found</Text>
      <Text style={styles.emptyText}>
        {showFilters
          ? 'Use the filters above and tap "Search Grades" to find grades.'
          : `No grades found for ${studentName} with the selected criteria.`}
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
          <Ionicons
            name={showFilters ? "eye-off" : "eye"}
            size={24}
            color="#2C3E50"
          />
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
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
              <Text style={styles.filterLabel}>
                Exam Date: {date.toDateString()}
              </Text>
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
                mode={"date"}
                is24Hour={true}
                display="default"
                onChange={handleDateChange}
              />
            )}

            <TouchableOpacity
              style={styles.searchButton}
              onPress={fetchFilteredGrades}
            >
              <Ionicons
                name="search"
                size={20}
                color="#FFFFFF"
                style={styles.searchIcon}
              />
              <Text style={styles.searchButtonText}>Search Grades</Text>
            </TouchableOpacity>
          </View>
        )}

        {grades.length > 0 ? (
          <View style={styles.tablesContainer}>
            <Text style={styles.resultsHeader}>
              Found {gradeTables.length} submission{gradeTables.length > 1 ? 's' : ''} for {new Date(date).toLocaleDateString()}
            </Text>
            {gradeTables.map((gradeTable, tableIndex) => (
              <View key={`${gradeTable.examId}-${tableIndex}`} style={styles.tableContainer}>
                {/* Grade submission header */}
                <View style={styles.tableHeader}>
                  <Text style={styles.tableHeaderText}>
                    Submission #{gradeTable.submissionNumber} - {new Date(gradeTable.examDate).toLocaleDateString()}
                  </Text>
                  {gradeTable.comments && (
                    <Text style={styles.commentsText}>
                      Comments: {gradeTable.comments}
                    </Text>
                  )}
                </View>
                
                <Table borderStyle={{ borderWidth: 2, borderColor: "#c8e1ff" }}>
                  <Row
                    data={tableHead}
                    style={styles.tableHead}
                    textStyle={styles.tableHeadText}
                  />
                  {gradeTable.tableData.map((row, index) => {
                    const isTotalRow = row[0] === 'TOTAL';
                    return (
                      <Row
                        key={index}
                        data={row}
                        style={isTotalRow ? styles.totalRow : styles.tableRow}
                        textStyle={isTotalRow ? styles.totalRowText : styles.tableText}
                      />
                    );
                  })}
                </Table>
                
                {/* Separator line between tables */}
                {tableIndex < gradeTables.length - 1 && (
                  <View style={styles.tableSeparator} />
                )}
              </View>
            ))}
          </View>
        ) : (
          renderEmptyState()
        )}
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F7F9FC",
    paddingTop: Platform.OS === "android" ? StatusBar.currentHeight || 24 : 0,
  },

  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 14,
    paddingVertical: 12,
    backgroundColor: "#FFFFFF",
    borderBottomWidth: 1,
    borderBottomColor: "#E6EEF8",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.06,
    shadowRadius: 4,
    elevation: 2,
  },
  backButton: {
    padding: 6,
    borderRadius: 8,
  },
  headerTitle: {
    flex: 1,
    textAlign: "center",
    fontSize: 17,
    fontWeight: "600",
    color: "#2C3E50",
  },
  filterToggle: {
    padding: 6,
    borderRadius: 8,
  },

  content: {
    flex: 1,
    padding: 14,
  },
  studentNameText: {
    fontSize: 15,
    fontWeight: "600",
    marginBottom: 12,
    color: "#34495E",
  },

  filtersContainer: {
    backgroundColor: "#FFFFFF",
    padding: 12,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#E6EEF8",
    marginBottom: 14,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.04,
    shadowRadius: 6,
    elevation: 1,
  },
  filterLabel: {
    fontSize: 13,
    marginBottom: 6,
    color: "#4B5B67",
    fontWeight: "500",
  },
  picker: {
    height: 52,
    width: "100%",
    marginBottom: 8,
    backgroundColor: "#FAFBFD",
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 8,
  },

  dateContainer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginTop: 6,
    marginBottom: 6,
  },
  dateButton: {
    paddingVertical: 8,
    paddingHorizontal: 12,
    backgroundColor: "#FFFFFF",
    borderWidth: 1,
    borderColor: "#DDEBF7",
    borderRadius: 8,
  },
  dateButtonText: {
    fontSize: 13,
    color: "#2B6CB0",
    fontWeight: "600",
  },

  searchButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 12,
    borderRadius: 10,
    backgroundColor: "#007BFF",
    marginTop: 10,
  },
  searchIcon: {
    marginRight: 8,
  },
  searchButtonText: {
    color: "#FFFFFF",
    fontSize: 15,
    fontWeight: "700",
  },

  tablesContainer: {
    gap: 25,
    paddingBottom: 20,
  },
  resultsHeader: {
    fontSize: 16,
    fontWeight: "600",
    color: "#2C3E50",
    textAlign: "center",
    marginBottom: 15,
    paddingVertical: 10,
    backgroundColor: "#E8F4FD",
    borderRadius: 8,
  },
  tableContainer: {
    backgroundColor: "#FFFFFF",
    borderRadius: 12,
    padding: 10,
    borderWidth: 1,
    borderColor: "#E6EEF8",
  },
  tableHeader: {
    marginBottom: 10,
    paddingBottom: 8,
    borderBottomWidth: 1,
    borderBottomColor: "#E6EEF8",
  },
  tableHeaderText: {
    fontSize: 14,
    fontWeight: "600",
    color: "#2C3E50",
    marginBottom: 4,
  },
  commentsText: {
    fontSize: 12,
    color: "#7F8C8D",
    fontStyle: "italic",
  },
  tableSeparator: {
    height: 2,
    backgroundColor: "#E6EEF8",
    marginVertical: 10,
    borderRadius: 1,
  },
  tableHead: {
    height: 48,
    backgroundColor: "#F1F8FF",
    borderTopLeftRadius: 8,
    borderTopRightRadius: 8,
  },
  tableHeadText: {
    fontWeight: "700",
    fontSize: 13,
    textAlign: "center",
    color: "#1F3A6D",
    paddingHorizontal: 4,
  },
  tableText: {
    fontSize: 13,
    textAlign: "center",
    paddingVertical: 8,
    color: "#2C3E50",
  },
  tableRow: {
    height: 40,
  },
  totalRow: {
    height: 45,
    backgroundColor: "#2C3E50",
  },
  totalRowText: {
    fontSize: 14,
    textAlign: "center",
    paddingVertical: 8,
    color: "#FFFFFF",
    fontWeight: "bold",
  },

  emptyContainer: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    padding: 20,
  },
  emptyTitle: {
    marginTop: 10,
    fontSize: 18,
    fontWeight: "700",
    color: "#566270",
  },
  emptyText: {
    marginTop: 8,
    fontSize: 13,
    textAlign: "center",
    color: "#7F8C8D",
    paddingHorizontal: 20,
  },

  loadingContainer: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    padding: 20,
    backgroundColor: "#F7F9FC",
  },
  loadingText: {
    marginTop: 12,
    fontSize: 14,
    color: "#2C3E50",
  },
});

export default ShowGradesRecordScreen;
