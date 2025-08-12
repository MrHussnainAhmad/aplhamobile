import React from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Platform,
  ScrollView,
} from "react-native";
import { Ionicons, MaterialIcons } from "@expo/vector-icons";
import { SafeAreaView } from "react-native-safe-area-context";

const GradesManagementScreen = ({ navigation }) => {
  const managementOptions = [
    {
      id: "add_grades",
      title: "Manage Student Grades",
      description: "Add, edit, and manage student grades across all classes",
      icon: "school",
      color: "#3498db",
      enabled: true,
      onPress: () => navigation.navigate("SelectClassForGrading"),
    },
    {
      id: "view_reports",
      title: "Grade Reports",
      description: "View and generate comprehensive grade reports",
      icon: "assessment",
      color: "#2ecc71",
      enabled: false,
      onPress: () => {
        // Navigate to reports screen when implemented
        console.log("Navigate to Grade Reports");
      },
    },
    {
      id: "grade_settings",
      title: "Grade Settings",
      description: "Configure grading scales and assessment criteria",
      icon: "settings",
      color: "#f39c12",
      enabled: true,
      onPress: () => navigation.navigate("GradeSettings"),
    },
    {
      id: "bulk_operations",
      title: "Bulk Operations",
      description: "Import/export grades and perform bulk actions",
      icon: "storage",
      color: "#e74c3c",
      enabled: false,
      onPress: () => {
        // Navigate to bulk operations when implemented
        console.log("Navigate to Bulk Operations");
      },
    },
  ];

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={{ paddingBottom: 16 }}>
        <View style={styles.header}>
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => navigation.goBack()}
          >
            <Ionicons name="arrow-back" size={24} color="#2C3E50" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Grades Management</Text>
          <View style={styles.headerRight} />
        </View>

        <View style={styles.content}>
          <Text style={styles.pageTitle}>Student Grades Administration</Text>
          <Text style={styles.pageSubtitle}>
            Manage all aspects of student grading and assessment
          </Text>

          <View style={styles.optionsContainer}>
            {managementOptions.map((option) => (
              <TouchableOpacity
                key={option.id}
                style={[
                  styles.optionCard, 
                  { borderLeftColor: option.color },
                  !option.enabled && styles.disabledCard
                ]}
                onPress={option.enabled ? option.onPress : null}
                disabled={!option.enabled}
              >
                <View
                  style={[
                    styles.iconContainer,
                    { backgroundColor: option.color },
                    !option.enabled && styles.disabledIconContainer
                  ]}
                >
                  <MaterialIcons name={option.icon} size={28} color="#FFFFFF" />
                </View>

                <View style={styles.optionContent}>
                  <Text style={[
                    styles.optionTitle,
                    !option.enabled && styles.disabledText
                  ]}>
                    {option.title}
                  </Text>
                  <Text style={[
                    styles.optionDescription,
                    !option.enabled && styles.disabledText
                  ]}>
                    {option.description}
                  </Text>
                </View>

                <View style={styles.arrowContainer}>
                  <Ionicons 
                    name="chevron-forward" 
                    size={20} 
                    color={option.enabled ? "#BDC3C7" : "#D5D8DC"} 
                  />
                </View>
              </TouchableOpacity>
            ))}
          </View>

          <View style={styles.infoBox}>
            <Ionicons name="information-circle" size={24} color="#3498db" />
            <View style={styles.infoContent}>
              <Text style={styles.infoTitle}>Administrator Access</Text>
              <Text style={styles.infoText}>
                As an administrator, you have full access to manage grades for
                all students across all classes. Teachers can view but cannot
                modify grades.
              </Text>
            </View>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F4F6F8",
    // Removed paddingTop: 33 - SafeAreaView handles this automatically
  },

  header: {
    backgroundColor: "#FFFFFF",
    paddingHorizontal: 20,
    paddingVertical: 16,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    borderBottomWidth: 1,
    borderBottomColor: "#E6EAF0",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.06,
    shadowRadius: 4,
    elevation: 2,
  },
  backButton: {
    width: 28,
    alignItems: "center",
  },
  headerRight: {
    width: 28,
    alignItems: "center",
  },
  headerTitle: {
    fontSize: 19,
    fontWeight: "700",
    color: "#1F2D3D",
    flex: 1,
    textAlign: "center",
  },
  content: {
    flex: 1,
    paddingHorizontal: 18,
    paddingTop: 14,
  },
  pageTitle: {
    fontSize: 26,
    fontWeight: "700",
    color: "#1F2D3D",
    marginBottom: 6,
  },
  pageSubtitle: {
    fontSize: 15,
    color: "#6C7A89",
    marginBottom: 24,
    lineHeight: 21,
  },

  optionsContainer: {
    marginBottom: 26,
  },
  optionCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 14,
    padding: 16,
    marginBottom: 14,
    flexDirection: "row",
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 5,
    elevation: 3,
    borderLeftWidth: 4,
  },
  iconContainer: {
    width: 52,
    height: 52,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
    marginRight: 14,
  },
  optionContent: {
    flex: 1,
  },
  optionTitle: {
    fontSize: 17,
    fontWeight: "600",
    color: "#1F2D3D",
    marginBottom: 3,
  },
  optionDescription: {
    fontSize: 14,
    color: "#6C7A89",
    lineHeight: 19,
  },
  arrowContainer: {
    marginLeft: 8,
  },

  // Disabled styles
  disabledCard: {
    opacity: 0.5,
    backgroundColor: "#F8F9FA",
  },
  disabledIconContainer: {
    opacity: 0.6,
  },
  disabledText: {
    color: "#95A5A6",
  },

  infoBox: {
    backgroundColor: "#E9F3FF",
    borderRadius: 14,
    padding: 14,
    flexDirection: "row",
    alignItems: "flex-start",
    borderWidth: 1,
    borderColor: "#BBDFFF",
  },
  infoContent: {
    flex: 1,
    marginLeft: 10,
  },
  infoTitle: {
    fontSize: 15,
    fontWeight: "600",
    color: "#1F2D3D",
    marginBottom: 3,
  },
  infoText: {
    fontSize: 13,
    color: "#526170",
    lineHeight: 18,
  },
});

export default GradesManagementScreen;
