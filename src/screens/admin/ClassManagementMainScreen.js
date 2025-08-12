import React from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  SafeAreaView,
  ScrollView,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";

const ClassManagementMainScreen = ({ navigation }) => {
  const handleManageClasses = () => {
    navigation.navigate("ManageClasses");
  };

  const handleManageSubjects = () => {
    navigation.navigate("ManageSubjects");
  };

  const handleManageSubjectsCRUD = () => {
    navigation.navigate("SubjectCrudScreen");
  };

  const handleViewClasses = () => {
    navigation.navigate('ViewClasses');
  };

  const renderMenuButton = (
    title,
    subtitle,
    icon,
    color,
    onPress,
    enabled = true
  ) => (
    <TouchableOpacity
      style={[styles.menuButton, { opacity: enabled ? 1 : 0.5 }]}
      onPress={enabled ? onPress : null}
    >
      <View style={styles.menuButtonContent}>
        <View style={[styles.iconContainer, { backgroundColor: `${color}20` }]}>
          <Ionicons name={icon} size={28} color={color} />
        </View>
        <View style={styles.textContainer}>
          <Text style={styles.menuButtonTitle}>{title}</Text>
          <Text style={styles.menuButtonSubtitle}>{subtitle}</Text>
        </View>
        <View style={styles.chevronContainer}>
          {enabled && (
            <Ionicons name="chevron-forward" size={20} color="#BDC3C7" />
          )}
        </View>
      </View>
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={{ paddingBottom: 16 }}>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => navigation.goBack()}>
            <Ionicons name="arrow-back" size={24} color="#2C3E50" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Classes & Subjects</Text>
          <View style={styles.headerRight} />
        </View>

        <View style={styles.content}>
          <Text style={styles.pageTitle}>Manage Classes and More</Text>
          <Text style={styles.pageSubtitle}>
            Choose an option to manage your educational system
          </Text>

          <View style={styles.menuContainer}>
            {renderMenuButton(
              "Manage Classes",
              "Create classes and assign them to verified teachers",
              "school-outline",
              "#4A90E2",
              handleManageClasses
            )}

            {renderMenuButton(
              "Assign Subjects",
              "Assign subjects to teachers with assigned classes",
              "library-outline",
              "#27AE60",
              handleManageSubjects
            )}

            {renderMenuButton(
              "Manage Subjects (CRUD)",
              "Create, edit, and delete subjects",
              "add-circle-outline",
              "#E74C3C",
              handleManageSubjectsCRUD
            )}

            {renderMenuButton(
              "View Classes",
              "View comprehensive class information and statistics",
              "eye-outline",
              "#9B59B6",
              handleViewClasses,
              true
            )}
          </View>

          <View style={styles.infoCard}>
            <View style={styles.infoHeader}>
              <Ionicons name="information-circle" size={24} color="#F39C12" />
              <Text style={styles.infoTitle}>Quick Guide</Text>
            </View>
                          <Text style={styles.infoText}>
                • <Text style={styles.boldText}>Manage Classes:</Text> Create new
                classes and assign them to verified teachers{"\n"}•{" "}
                <Text style={styles.boldText}>Assign Subjects:</Text> Assign
                subjects to teachers who already have classes •{" "}
                <Text style={styles.boldText}>Manage Subjects (CRUD):</Text>{" "}
                Create, edit, and delete subjects •{" "}
                <Text style={styles.boldText}>View Classes:</Text> View
                comprehensive class information and statistics
              </Text>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F5F7FA",
    paddingTop: 33,
  },
  header: {
    backgroundColor: "#FFFFFF",
    paddingTop: 10,
    paddingHorizontal: 20,
    paddingBottom: 20,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 5,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#2C3E50",
  },
  headerRight: {
    width: 24,
  },
  content: {
    flex: 1,
    padding: 20,
    paddingBottom: 40,
  },
  pageTitle: {
    fontSize: 28,
    fontWeight: "bold",
    color: "#2C3E50",
    textAlign: "center",
    marginBottom: 10,
  },
  pageSubtitle: {
    fontSize: 16,
    color: "#7F8C8D",
    textAlign: "center",
    marginBottom: 30,
  },
  menuContainer: {
    marginBottom: 30,
  },
  menuButton: {
    backgroundColor: "#FFFFFF",
    borderRadius: 12,
    marginBottom: 15,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 3,
  },
  menuButtonContent: {
    flexDirection: "row",
    alignItems: "center",
    padding: 20,
  },
  iconContainer: {
    width: 50,
    height: 50,
    borderRadius: 25,
    justifyContent: "center",
    alignItems: "center",
    marginRight: 15,
  },
  textContainer: {
    flex: 1,
  },
  menuButtonTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#2C3E50",
    marginBottom: 4,
  },
  menuButtonSubtitle: {
    fontSize: 14,
    color: "#7F8C8D",
    lineHeight: 20,
  },
  chevronContainer: {
    justifyContent: "center",
    alignItems: "center",
  },
  infoCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 12,
    padding: 20,
    borderLeftWidth: 4,
    borderLeftColor: "#F39C12",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 3,
  },
  infoHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 12,
  },
  infoTitle: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#2C3E50",
    marginLeft: 8,
  },
  infoText: {
    fontSize: 14,
    color: "#7F8C8D",
    lineHeight: 22,
  },
  boldText: {
    fontWeight: "bold",
    color: "#2C3E50",
  },
});

export default ClassManagementMainScreen;
