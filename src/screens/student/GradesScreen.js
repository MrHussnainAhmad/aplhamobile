import React, {
  useState,
  useCallback,
  useMemo,
} from "react";
import {
  SafeAreaView,
  ScrollView,
  View,
  Text,
  StyleSheet,
  Pressable,
  ActivityIndicator,
  Alert,
  RefreshControl,
  Platform,
} from "react-native";
import { Picker } from "@react-native-picker/picker";
import DateTimePicker from "@react-native-community/datetimepicker";
import { Table, Row } from "react-native-table-component";
import { userAPI } from "../../services/api";

const GradesScreen = () => {
  const [examType, setExamType] = useState("monthly");
  const [date, setDate] = useState(new Date());
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [grades, setGrades] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [refreshing, setRefreshing] = useState(false);

  // Memoize params so fetchGrades doesn't recreate on every render
  const params = useMemo(() => ({
    gradeType: examType,
    examDate: date.toISOString().split("T")[0],
  }), [examType, date]);

  const fetchGrades = useCallback(async () => {
    setError("");
    setLoading(true);
    try {
      const res = await userAPI.getMyGrades(params);
      const fetched = res.data?.grades || [];
      if (!fetched.length) {
        setError("No grades found for that date/type.");
      }
      setGrades(fetched);
    } catch (e) {
      console.warn(e);
      setError("Failed to fetch grades. Pull down to retry.");
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [params]);

  // Pull-to-refresh handler
  const onRefresh = () => {
    setRefreshing(true);
    fetchGrades();
  };

  // DateChange
  const onDateChange = (e, selected) => {
    const current = selected || date;
    setShowDatePicker(Platform.OS === "ios");
    setDate(current);
  };

  // Build table data once
  const gradeTables = useMemo(() => {
    // Create separate tables for each grade submission (show all submissions for the day)
    return grades.map((grade, index) => {
      const subjectRows = grade.subjects.map((s) => [
        s.subject,
        s.marksObtained,
        s.totalMarks,
        `${s.percentage}%`,
        s.grade,
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
  }, [grades]);

  const tableHead = ["Subject", "Obtained", "Total", "Percent", "Grade"];

  return (
    <SafeAreaView style={s.flex}>
      <ScrollView
        contentContainerStyle={s.container}
        style={s.scroll}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
        <Text style={s.title}>View Grades</Text>

        <View style={s.pickerBox}>
          <Picker
            selectedValue={examType}
            style={s.picker}
            onValueChange={setExamType}
          >
            {["monthly", "weekly", "daily", "surprise"].map((val) => (
              <Picker.Item key={val} label={val[0].toUpperCase() + val.slice(1)} value={val} />
            ))}
          </Picker>
        </View>

        <View style={s.dateRow}>
          <Text style={s.dateText}>{date.toDateString()}</Text>
          <Pressable
            style={s.dateBtn}
            android_ripple={{ color: "#ddd" }}
            onPress={() => setShowDatePicker(true)}
          >
            <Text style={s.dateBtnText}>Change Date</Text>
          </Pressable>
        </View>

        {showDatePicker && (
          <DateTimePicker
            value={date}
            mode="date"
            display="default"
            onChange={onDateChange}
          />
        )}

        <Pressable
          style={s.fetchBtn}
          android_ripple={{ color: "#005bb5" }}
          onPress={fetchGrades}
        >
          <Text style={s.fetchTxt}>{loading ? "Loading…" : "Fetch Grades"}</Text>
        </Pressable>

        {/* Overlay spinner */}
        {loading && (
          <View style={s.loadingOverlay}>
            <ActivityIndicator size="large" color="#0066CC" />
          </View>
        )}

        {/* Error / Empty State */}
        {!!error && !loading && (
          <Text style={s.errorText}>{error}</Text>
        )}

        {/* Grades Table */}
        {!error && !loading && grades.length > 0 && (
          <View style={s.tablesContainer}>
            <Text style={s.resultsHeader}>
              Found {gradeTables.length} submission{gradeTables.length > 1 ? 's' : ''} for {new Date(date).toLocaleDateString()}
            </Text>
            {gradeTables.map((gradeTable, tableIndex) => (
              <View key={`${gradeTable.examId}-${tableIndex}`} style={s.tableWrap}>
                {/* Grade submission header */}
                <View style={s.tableHeader}>
                  <Text style={s.tableHeaderText}>
                    Submission #{gradeTable.submissionNumber} - {new Date(gradeTable.examDate).toLocaleDateString()}
                  </Text>
                  {gradeTable.comments && (
                    <Text style={s.commentsText}>
                      Comments: {gradeTable.comments}
                    </Text>
                  )}
                </View>
                
                <Table>
                  <Row
                    data={tableHead}
                    style={s.head}
                    textStyle={s.headText}
                  />
                  {gradeTable.tableData.map((row, i) => {
                    const isTotalRow = row[0] === 'TOTAL';
                    return (
                      <Row
                        key={i}
                        data={row}
                        style={[
                          isTotalRow ? s.totalRow : s.row,
                          !isTotalRow && i % 2 && s.rowAlt,
                        ]}
                        textStyle={isTotalRow ? s.totalRowText : s.rowText}
                      />
                    );
                  })}
                </Table>
                
                {/* Separator line between tables */}
                {tableIndex < gradeTables.length - 1 && (
                  <View style={s.tableSeparator} />
                )}
              </View>
            ))}
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
};

export default GradesScreen;

// Styles
const s = StyleSheet.create({
  flex: { flex: 1 },
  scroll: { paddingBottom: 16 },
  container: {
    flexGrow: 1,
    paddingTop: 35,
    paddingHorizontal: 16,
    backgroundColor: "#FFF",
  },
  title: {
    fontSize: 26,
    fontWeight: "600",
    textAlign: "center",
    marginBottom: 24,
  },
  pickerBox: {
    borderWidth: 1,
    borderColor: "#CCC",
    borderRadius: 6,
    overflow: "hidden",
    marginBottom: 18,
  },
  picker: { height: 52, width: "100%" },
  dateRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 18,
  },
  dateText: { fontSize: 16 },
  dateBtn: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 4,
    backgroundColor: "#F0F4FF",
  },
  dateBtnText: { fontWeight: "500" },
  fetchBtn: {
    backgroundColor: "#0066CC",
    paddingVertical: 12,
    borderRadius: 6,
    marginBottom: 14,
  },
  fetchTxt: {
    color: "#FFF",
    textAlign: "center",
    fontWeight: "600",
    fontSize: 16,
  },
  loadingOverlay: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(255,255,255,0.6)",
  },
  errorText: {
    textAlign: "center",
    color: "#B00020",
    marginVertical: 20,
  },
  tablesContainer: {
    gap: 25,
    paddingBottom: 20,
  },
  resultsHeader: {
    fontSize: 16,
    fontWeight: "600",
    color: "#495057",
    textAlign: "center",
    marginBottom: 15,
    paddingVertical: 10,
    backgroundColor: "#E8F4FD",
    borderRadius: 8,
  },
  tableWrap: {
    borderWidth: 1,
    borderColor: "#CCC",
    borderRadius: 6,
    overflow: "hidden",
    marginBottom: 20,
  },
  tableHeader: {
    padding: 10,
    backgroundColor: "#F8F9FA",
    borderBottomWidth: 1,
    borderBottomColor: "#E9ECEF",
  },
  tableHeaderText: {
    fontSize: 14,
    fontWeight: "600",
    color: "#495057",
    marginBottom: 4,
  },
  commentsText: {
    fontSize: 12,
    color: "#6C757D",
    fontStyle: "italic",
  },
  tableSeparator: {
    height: 2,
    backgroundColor: "#E9ECEF",
    marginVertical: 10,
    borderRadius: 1,
  },
  head: {
    height: 40,
    backgroundColor: "#E8F4FF",
  },
  headText: {
    textAlign: "center",
    fontWeight: "600",
  },
  row: { height: 36 },
  rowAlt: { backgroundColor: "#FAFBFC" },
  rowText: {
    textAlign: "center",
  },
  totalRow: { 
    height: 40,
    backgroundColor: "#2C3E50",
  },
  totalRowText: {
    textAlign: "center",
    color: "#FFFFFF",
    fontWeight: "bold",
  },
});
