import React from 'react';
import { View, Text, StyleSheet, SafeAreaView, TouchableOpacity } from 'react-native';
import { Ionicons, MaterialIcons } from '@expo/vector-icons';

const GradesManagementScreen = ({ navigation }) => {
  
  const managementOptions = [
    {
      id: 'add_grades',
      title: 'Manage Student Grades',
      description: 'Add, edit, and manage student grades across all classes',
      icon: 'school',
      color: '#3498db',
      onPress: () => navigation.navigate('SelectClassForGrading')
    },
    {
      id: 'view_reports',
      title: 'Grade Reports',
      description: 'View and generate comprehensive grade reports',
      icon: 'assessment',
      color: '#2ecc71',
      onPress: () => {
        // Navigate to reports screen when implemented
        console.log('Navigate to Grade Reports');
      }
    },
    {
      id: 'grade_settings',
      title: 'Grade Settings',
      description: 'Configure grading scales and assessment criteria',
      icon: 'settings',
      color: '#f39c12',
      onPress: () => navigation.navigate('GradeSettings')
    },
    {
      id: 'bulk_operations',
      title: 'Bulk Operations',
      description: 'Import/export grades and perform bulk actions',
      icon: 'storage',
      color: '#e74c3c',
      onPress: () => {
        // Navigate to bulk operations when implemented
        console.log('Navigate to Bulk Operations');
      }
    }
  ];

  return (
    <SafeAreaView style={styles.container}>
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
              style={[styles.optionCard, { borderLeftColor: option.color }]}
              onPress={option.onPress}
            >
              <View style={[styles.iconContainer, { backgroundColor: option.color }]}>
                <MaterialIcons name={option.icon} size={28} color="#FFFFFF" />
              </View>
              
              <View style={styles.optionContent}>
                <Text style={styles.optionTitle}>{option.title}</Text>
                <Text style={styles.optionDescription}>{option.description}</Text>
              </View>
              
              <View style={styles.arrowContainer}>
                <Ionicons name="chevron-forward" size={20} color="#BDC3C7" />
              </View>
            </TouchableOpacity>
          ))}
        </View>

        <View style={styles.infoBox}>
          <Ionicons name="information-circle" size={24} color="#3498db" />
          <View style={styles.infoContent}>
            <Text style={styles.infoTitle}>Administrator Access</Text>
            <Text style={styles.infoText}>
              As an administrator, you have full access to manage grades for all students across all classes. 
              Teachers can view but cannot modify grades.
            </Text>
          </View>
        </View>
      </View>
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
    flex: 1,
    padding: 20,
  },
  pageTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#2C3E50',
    marginBottom: 8,
  },
  pageSubtitle: {
    fontSize: 16,
    color: '#7F8C8D',
    marginBottom: 30,
    lineHeight: 22,
  },
  optionsContainer: {
    marginBottom: 30,
  },
  optionCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 20,
    marginBottom: 15,
    flexDirection: 'row',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 5,
    borderLeftWidth: 4,
  },
  iconContainer: {
    width: 56,
    height: 56,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 15,
  },
  optionContent: {
    flex: 1,
  },
  optionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#2C3E50',
    marginBottom: 4,
  },
  optionDescription: {
    fontSize: 14,
    color: '#7F8C8D',
    lineHeight: 20,
  },
  arrowContainer: {
    marginLeft: 10,
  },
  infoBox: {
    backgroundColor: '#EBF3FD',
    borderRadius: 12,
    padding: 16,
    flexDirection: 'row',
    alignItems: 'flex-start',
    borderWidth: 1,
    borderColor: '#BDE4FF',
  },
  infoContent: {
    flex: 1,
    marginLeft: 12,
  },
  infoTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#2C3E50',
    marginBottom: 4,
  },
  infoText: {
    fontSize: 14,
    color: '#5D6D7E',
    lineHeight: 20,
  },
});

export default GradesManagementScreen;
