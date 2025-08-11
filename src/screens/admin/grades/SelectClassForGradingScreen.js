import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
  SafeAreaView,
  Platform,
  StatusBar,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { adminAPI, classesAPI } from "../../../services/api";

const SelectClassForGradingScreen = ({ navigation }) => {
  const [teacherClasses, setTeacherClasses] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchTeacherClasses();
  }, []);

  const fetchTeacherClasses = async () => {
    setLoading(true);
    try {
      // Since this is admin panel, fetch all classes instead of teacher-specific classes
      const response = await classesAPI.getAllClasses();
      if (response.data && response.data.classes) {
        setTeacherClasses(response.data.classes.filter(Boolean));
      }
    } catch (error) {
      console.error("Error fetching classes for grading:", error);
      Alert.alert("Error", "Failed to load classes for grading.");
    } finally {
      setLoading(false);
    }
  };

  const renderClassItem = ({ item }) => (
    <TouchableOpacity
      style={styles.classItem}
      onPress={() =>
        navigation.navigate("StudentsListForGrading", {
          classId: item._id,
          className: item.classNumber,
        })
      }
    >
      <View style={styles.classContent}>
        <Text style={styles.className}>{item.classNumber}</Text>
        <Text style={styles.classHint}>Tap to view students for grading</Text>
      </View>
      <Ionicons name="chevron-forward" size={20} color="#BDC3C7" />
    </TouchableOpacity>
  );

  const renderEmptyState = () => (
    <View style={styles.emptyContainer}>
      <Ionicons name="school-outline" size={80} color="#BDC3C7" />
      <Text style={styles.emptyTitle}>No Classes Available</Text>
      <Text style={styles.emptyText}>
        No classes have been created yet. Please create classes first in the
        Class Management section.
      </Text>
    </View>
  );

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#007BFF" />
        <Text style={styles.loadingText}>Loading your classes...</Text>
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
        <Text style={styles.headerTitle}>Select a Class to Grade</Text>
        <View style={styles.headerRight} />
      </View>

      <FlatList
        data={teacherClasses}
        keyExtractor={(item, index) => item?._id || index.toString()}
        renderItem={renderClassItem}
        contentContainerStyle={[
          styles.listContent,
          teacherClasses.length === 0 && {
            flexGrow: 1,
            justifyContent: "center",
          },
        ]}
        ListEmptyComponent={renderEmptyState}
      />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    paddingTop: 33,
    flex: 1,
    backgroundColor: "#F8F9FA",
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#F8F9FA",
    paddingTop: Platform.OS === "android" ? StatusBar.currentHeight : 0,
  },
  loadingText: {
    marginTop: 10,
    fontSize: 16,
    color: "#555",
    fontFamily: "System",
  },
  header: {
    backgroundColor: "#FFFFFF",
    paddingTop: 18,           // Increased from 16 to 18
    paddingHorizontal: 18,    // Increased from 20 to 18 (as requested)
    paddingBottom: 18,        // Increased from 20 to 18
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 5,
    borderBottomWidth: 1,
    borderBottomColor: "#ECF0F1",
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#2C3E50",
    fontFamily: "System",
    textAlign: "center",
    flex: 1,
    marginHorizontal: 16,
    paddingTop: 0,            // Removed paddingTop since they're on same line
  },
  backButton: {
    width: 24,
    height: 24,
    justifyContent: "center",
    alignItems: "center",
  },
  headerRight: {
    width: 24,
  },
  classItem: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    backgroundColor: "#FFFFFF",
    padding: 18,              // Increased from 16 to 18
    borderRadius: 12,
    marginBottom: 12,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 4,
    elevation: 3,
    marginHorizontal: 18,     // Increased from 16 to 18
    borderWidth: 1,
    borderColor: "#ECF0F1",
  },
  classContent: {
    flex: 1,
    marginRight: 12,
  },
  className: {
    fontSize: 18,
    fontWeight: "600",
    color: "#2C3E50",
    marginBottom: 4,
    fontFamily: "System",
  },
  classHint: {
    fontSize: 14,
    color: "#7F8C8D",
    fontStyle: "normal",
    fontFamily: "System",
    lineHeight: 20,
  },
  listContent: {
    paddingVertical: 18,      // Increased from 20 to 18
    paddingHorizontal: 0,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 40,
    paddingTop: 20,
  },
  emptyTitle: {
    fontSize: 22,
    fontWeight: "600",
    color: "#7F8C8D",
    marginTop: 24,
    marginBottom: 12,
    textAlign: "center",
    fontFamily: "System",
  },
  emptyText: {
    fontSize: 16,
    color: "#95A5A6",
    textAlign: "center",
    lineHeight: 24,
    fontFamily: "System",
    marginBottom: 20,
  },
  // Safe area insets for better mobile handling
  safeAreaInsets: {
    flex: 1,
    paddingTop: Platform.OS === "ios" ? 0 : StatusBar.currentHeight,
  },
});

export default SelectClassForGradingScreen;