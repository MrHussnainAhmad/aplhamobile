import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, SafeAreaView, TouchableOpacity, TextInput, Alert, ScrollView, ActivityIndicator } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { adminAPI } from '../../services/api';

const GradeSettingsScreen = ({ navigation }) => {
  const [gradeSettings, setGradeSettings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const defaultGrades = [
    { grade: 'A+', minPercentage: '90' },
    { grade: 'A', minPercentage: '80' },
    { grade: 'B+', minPercentage: '70' },
    { grade: 'B', minPercentage: '60' },
    { grade: 'C+', minPercentage: '55' }, // Added C+
    { grade: 'C', minPercentage: '50' },
    { grade: 'D', minPercentage: '40' }, // Added D
    { grade: 'F', minPercentage: '0' },
  ];

  useEffect(() => {
    fetchGradeSettings();
  }, []);

  const fetchGradeSettings = async () => {
    try {
      setLoading(true);
      const response = await adminAPI.getGradeSettings();
      if (response.data && response.data.gradeSettings) {
        // Merge fetched settings with default grades to ensure all grades are present
        const fetchedSettingsMap = new Map(response.data.gradeSettings.map(s => [s.grade, s.minPercentage]));
        const mergedSettings = defaultGrades.map(defaultGrade => ({
          grade: defaultGrade.grade,
          minPercentage: fetchedSettingsMap.has(defaultGrade.grade)
            ? String(fetchedSettingsMap.get(defaultGrade.grade))
            : defaultGrade.minPercentage,
        }));
        setGradeSettings(mergedSettings);
      } else {
        setGradeSettings(defaultGrades);
      }
    } catch (error) {
      console.error('Error fetching grade settings:', error);
      Alert.alert('Error', 'Failed to load grade settings.');
      setGradeSettings(defaultGrades); // Fallback to defaults on error
    } finally {
      setLoading(false);
    }
  };

  const handlePercentageChange = (grade, value) => {
    setGradeSettings(prevSettings =>
      prevSettings.map(setting =>
        setting.grade === grade ? { ...setting, minPercentage: value } : setting
      )
    );
  };

  const validateSettings = () => {
    for (const setting of gradeSettings) {
      const percentage = parseFloat(setting.minPercentage);
      if (isNaN(percentage) || percentage < 0 || percentage > 100) {
        Alert.alert('Validation Error', `Invalid percentage for ${setting.grade}. Must be between 0 and 100.`);
        return false;
      }
    }

    // Optional: Add logic to ensure percentages are in descending order for A+ to F
    // This makes sure A+ > A > B+ etc.
    const sortedGrades = [...gradeSettings].sort((a, b) => {
      // Define a custom order for grades if needed, otherwise sort by percentage
      const order = {'A+': 8, 'A': 7, 'B+': 6, 'B': 5, 'C+': 4, 'C': 3, 'D': 2, 'F': 1};
      return order[b.grade] - order[a.grade];
    });

    for (let i = 0; i < sortedGrades.length - 1; i++) {
      const currentGrade = sortedGrades[i];
      const nextGrade = sortedGrades[i + 1];
      if (parseFloat(currentGrade.minPercentage) < parseFloat(nextGrade.minPercentage)) {
        Alert.alert('Validation Error', 
          `Percentage for ${currentGrade.grade} must be greater than or equal to ${nextGrade.grade}.`
        );
        return false;
      }
    }

    return true;
  };

  const handleSaveSettings = async () => {
    if (!validateSettings()) {
      return;
    }

    setSaving(true);
    try {
      const settingsToSave = gradeSettings.map(setting => ({
        grade: setting.grade,
        minPercentage: parseFloat(setting.minPercentage)
      }));
      await adminAPI.updateGradeSettings({ settings: settingsToSave });
      Alert.alert('Success', 'Grade settings updated successfully!');
    } catch (error) {
      console.error('Error saving grade settings:', error);
      Alert.alert('Error', 'Failed to save grade settings.');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#007BFF" />
        <Text style={styles.loadingText}>Loading Grade Settings...</Text>
      </SafeAreaView>
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
        <Text style={styles.headerTitle}>Grade Settings</Text>
        <View style={styles.headerRight} />
      </View>

      <ScrollView contentContainerStyle={styles.content}>
        <Text style={styles.description}>
          Define the minimum percentage required for each grade. Ensure percentages are in descending order e.g., A+, A.
        </Text>

        {gradeSettings.map((setting) => (
          <View key={setting.grade} style={styles.inputGroup}>
            <Text style={styles.label}>{setting.grade} Grade (Min Percentage)</Text>
            <TextInput
              style={styles.input}
              keyboardType="numeric"
              value={setting.minPercentage}
              onChangeText={(value) => handlePercentageChange(setting.grade, value)}
              placeholder="e.g., 90"
              maxLength={3}
            />
          </View>
        ))}

        <TouchableOpacity
          style={[styles.saveButton, saving && styles.disabledButton]}
          onPress={handleSaveSettings}
          disabled={saving}
        >
          {saving ? (
            <ActivityIndicator color="#FFFFFF" />
          ) : (
            <>
              <Ionicons name="save-outline" size={24} color="#FFFFFF" />
              <Text style={styles.saveButtonText}>Save Settings</Text>
            </>
          )}
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F4F6F8', // Softer neutral tone
    paddingTop: 33,
  },

  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F4F6F8',
  },
  loadingText: {
    marginTop: 12,
    fontSize: 16,
    color: '#1F2D3D',
    fontWeight: '500',
    letterSpacing: 0.3,
  },

  header: {
    backgroundColor: '#FFFFFF',
    paddingTop: 14,
    paddingHorizontal: 20,
    paddingBottom: 18,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',

    // Soft shadow for iOS + elevation for Android
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 3,

    borderBottomWidth: 1,
    borderBottomColor: '#E6EAF0',
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#1F2D3D',
    letterSpacing: 0.5,
  },
  backButton: {
    width: 28,
    height: 28,
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 8,
    backgroundColor: '#F0F2F5',
  },
  headerRight: {
    width: 28,
  },

  content: {
    flexGrow: 1,
    padding: 20,
    alignItems: 'center',
  },
  description: {
    fontSize: 15,
    color: '#5D6D7E',
    textAlign: 'center',
    marginBottom: 28,
    lineHeight: 22,
  },

  inputGroup: {
    width: '100%',
    marginBottom: 22,
  },
  label: {
    fontSize: 16,
    color: '#1F2D3D',
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

    // Subtle shadow
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.04,
    shadowRadius: 2,
    elevation: 1,

    borderWidth: 1,
    borderColor: '#E6EAF0',
  },

  saveButton: {
    backgroundColor: '#28A745',
    paddingVertical: 15,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
    width: '100%',
    marginTop: 20,
    flexDirection: 'row',

    // Stronger shadow for button
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 4,
    elevation: 4,
  },
  saveButtonText: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: '600',
    marginLeft: 8,
    letterSpacing: 0.3,
  },
  disabledButton: {
    backgroundColor: '#AAB7B8',
  },
});

export default GradeSettingsScreen;
