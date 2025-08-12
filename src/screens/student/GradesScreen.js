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
  const tableData = useMemo(() => {
    return grades.flatMap((g) =>
      g.subjects.map((s) => [
        s.subject,
        s.marksObtained,
        s.totalMarks,
        `${s.percentage}%`,
        s.grade,
      ])
    );
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
          <View style={s.tableWrap}>
            <Table>
              <Row
                data={tableHead}
                style={s.head}
                textStyle={s.headText}
              />
              {tableData.map((row, i) => (
                <Row
                  key={i}
                  data={row}
                  style={[
                    s.row,
                    i % 2 && s.rowAlt,
                  ]}
                  textStyle={s.rowText}
                />
              ))}
            </Table>
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
  picker: { height: 48, width: "100%" },
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
  tableWrap: {
    borderWidth: 1,
    borderColor: "#CCC",
    borderRadius: 6,
    overflow: "hidden",
    marginBottom: 20,
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
});
