import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  TextInput,
  Alert,
  ActivityIndicator,
  SafeAreaView,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { adminAPI } from '../../services/api';

const ManageClassesScreen = ({ navigation }) => {
  const [classes, setClasses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [newClassNumber, setNewClassNumber] = useState('');
  const [newClassSection, setNewClassSection] = useState('');
  const [editingClassId, setEditingClassId] = useState(null);
  const [editingClassNumber, setEditingClassNumber] = useState('');
  const [editingClassSection, setEditingClassSection] = useState('');

  useEffect(() => {
    fetchClasses();
  }, []);

  const fetchClasses = async () => {
    setLoading(true);
    try {
      const response = await adminAPI.getClasses();
      if (response.data.classes) {
        setClasses(response.data.classes);
      }
    } catch (error) {
      console.error('Error fetching classes:', error);
      Alert.alert('Error', 'Failed to load classes.');
    } finally {
      setLoading(false);
    }
  };

  const handleCreateClass = async () => {
    if (!newClassNumber.trim() || !newClassSection.trim()) {
      Alert.alert('Error', 'Both Class Number and Section are required.');
      return;
    }
    
    console.log('Attempting to create class with:', { classNumber: newClassNumber.trim(), section: newClassSection.trim() });
    
    try {
      const response = await adminAPI.createClass({ 
        classNumber: newClassNumber.trim(),
        section: newClassSection.trim()
      });
      if (response.data.class) {
        setClasses([...classes, response.data.class]);
        setNewClassNumber('');
        setNewClassSection('');
        Alert.alert('Success', 'Class created successfully!');
      }
    } catch (error) {
      console.error('Error creating class:', error);
      Alert.alert('Error', error.response?.data?.message || 'Failed to create class.');
    }
  };

  const handleUpdateClass = async () => {
    if (!editingClassNumber.trim() || !editingClassSection.trim()) {
      Alert.alert('Error', 'Both Class Number and Section are required.');
      return;
    }
    
    try {
      const response = await adminAPI.updateClass(editingClassId, { 
        classNumber: editingClassNumber.trim(),
        section: editingClassSection.trim()
      });
      if (response.data.class) {
        setClasses(classes.map(cls => 
          cls._id === editingClassId ? response.data.class : cls
        ));
        setEditingClassId(null);
        setEditingClassNumber('');
        setEditingClassSection('');
        Alert.alert('Success', 'Class updated successfully!');
      }
    } catch (error) {
      console.error('Error updating class:', error);
      Alert.alert('Error', error.response?.data?.message || 'Failed to update class.');
    }
  };

  const handleDeleteClass = async (id) => {
    Alert.alert(
      'Confirm Delete',
      'Are you sure you want to delete this class? This action cannot be undone.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            try {
              await adminAPI.deleteClass(id);
              setClasses(classes.filter(cls => cls._id !== id));
              Alert.alert('Success', 'Class deleted successfully!');
            } catch (error) {
              console.error('Error deleting class:', error);
              Alert.alert('Error', error.response?.data?.message || 'Failed to delete class.');
            }
          },
        },
      ]
    );
  };

  const handleClassPress = (item) => {
    navigation.navigate('AssignClassesWithSearch', { 
      classId: item._id, 
      classNumber: item.classNumber,
      section: item.section
    });
  };

  const renderClassItem = ({ item }) => (
    <TouchableOpacity 
      style={styles.classItem}
      onPress={() => handleClassPress(item)}
    >
      {editingClassId === item._id ? (
        <View style={styles.editContainer}>
          <View style={styles.editInputRow}>
            <TextInput
              style={[styles.editInput, styles.halfInput]}
              value={editingClassNumber}
              onChangeText={setEditingClassNumber}
              placeholder="Class Number"
            />
            <TextInput
              style={[styles.editInput, styles.halfInput]}
              value={editingClassSection}
              onChangeText={setEditingClassSection}
              placeholder="Section"
            />
          </View>
          <Text style={styles.editPreview}>
            Preview: {editingClassNumber && editingClassSection ? `${editingClassNumber} - ${editingClassSection}` : '[Number] - [Section]'}
          </Text>
        </View>
      ) : (
        <View style={styles.classInfo}>
          <Text style={styles.className}>{item.classNumber} - {item.section}</Text>
          <Text style={styles.classHint}>Tap to assign teachers</Text>
        </View>
      )}
      
      <View style={styles.classActions}>
        {editingClassId === item._id ? (
          <>
            <TouchableOpacity onPress={handleUpdateClass} style={styles.actionButton}>
              <Ionicons name="checkmark-circle" size={24} color="#28A745" />
            </TouchableOpacity>
            <TouchableOpacity onPress={() => { 
              setEditingClassId(null); 
              setEditingClassNumber(''); 
              setEditingClassSection('');
            }} style={styles.actionButton}>
              <Ionicons name="close-circle" size={24} color="#DC3545" />
            </TouchableOpacity>
          </>
        ) : (
          <>
            <TouchableOpacity onPress={() => { 
              setEditingClassId(item._id);
              setEditingClassNumber(item.classNumber);
              setEditingClassSection(item.section);
            }} style={styles.actionButton}>
              <Ionicons name="pencil" size={20} color="#007BFF" />
            </TouchableOpacity>
            <TouchableOpacity onPress={() => handleDeleteClass(item._id)} style={styles.actionButton}>
              <Ionicons name="trash" size={20} color="#DC3545" />
            </TouchableOpacity>
          </>
        )}
      </View>
    </TouchableOpacity>
  );

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#4A90E2" />
        <Text style={styles.loadingText}>Loading classes...</Text>
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-back" size={24} color="#2C3E50" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Manage Classes</Text>
        <View style={styles.headerRight} />
      </View>

      <View style={styles.content}>
        <Text style={styles.pageSubtitle}>
          Create classes and assign them to verified teachers
        </Text>

        <View style={styles.formContainer}>
          <Text style={styles.formTitle}>Create New Class</Text>
          
          <View style={styles.inputRow}>
            <TextInput
              style={[styles.input, styles.halfInput]}
              placeholder="Class Number (e.g., 9)"
              value={newClassNumber}
              onChangeText={setNewClassNumber}
            />
            <TextInput
              style={[styles.input, styles.halfInput]}
              placeholder="Section (e.g., Boys)"
              value={newClassSection}
              onChangeText={setNewClassSection}
            />
          </View>
          
          <Text style={styles.previewText}>
            Preview: {newClassNumber && newClassSection ? `${newClassNumber} - ${newClassSection}` : '[Number] - [Section]'}
          </Text>
          
          <TouchableOpacity onPress={handleCreateClass} style={styles.createButton}>
            <Ionicons name="add-circle" size={24} color="#FFFFFF" />
            <Text style={styles.createButtonText}>Create Class</Text>
          </TouchableOpacity>
        </View>

        {classes.length === 0 ? (
          <View style={styles.emptyContainer}>
            <Ionicons name="school-outline" size={60} color="#BDC3C7" />
            <Text style={styles.emptyTitle}>No Classes Created</Text>
            <Text style={styles.emptyText}>
              Create your first class using the form above, then tap on it to assign teachers.
            </Text>
          </View>
        ) : (
          <FlatList
            data={classes}
            keyExtractor={(item) => item._id}
            renderItem={renderClassItem}
            contentContainerStyle={styles.listContent}
            showsVerticalScrollIndicator={false}
          />
        )}
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F7FA',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F5F7FA',
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
  headerRight: {
    width: 24,
  },
  content: {
    flex: 1,
    padding: 20,
  },
  pageSubtitle: {
    fontSize: 16,
    color: '#7F8C8D',
    textAlign: 'center',
    marginBottom: 20,
  },
  inputContainer: {
    flexDirection: 'row',
    marginBottom: 20,
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 3,
    padding: 12,
  },
  input: {
    flex: 1,
    height: 44,
    borderColor: '#E1E8ED',
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 16,
    marginRight: 12,
    fontSize: 16,
    backgroundColor: '#F8F9FA',
  },
  createButton: {
    backgroundColor: '#4A90E2',
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 8,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  createButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: 'bold',
    marginLeft: 8,
  },
  listContent: {
    paddingBottom: 20,
  },
  classItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 3,
  },
  classInfo: {
    flex: 1,
  },
  className: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#2C3E50',
    marginBottom: 4,
  },
  classHint: {
    fontSize: 12,
    color: '#7F8C8D',
    fontStyle: 'italic',
  },
  editInput: {
    flex: 1,
    height: 44,
    borderColor: '#4A90E2',
    borderWidth: 2,
    borderRadius: 8,
    paddingHorizontal: 16,
    fontSize: 16,
    backgroundColor: '#F8F9FA',
  },
  classActions: {
    flexDirection: 'row',
    marginLeft: 16,
  },
  actionButton: {
    marginLeft: 16,
    padding: 4,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 40,
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#7F8C8D',
    marginTop: 20,
    marginBottom: 10,
  },
  emptyText: {
    fontSize: 16,
    color: '#95A5A6',
    textAlign: 'center',
    lineHeight: 24,
  },
  formContainer: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 20,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 3,
  },
  formTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#2C3E50',
    marginBottom: 16,
    textAlign: 'center',
  },
  inputRow: {
    flexDirection: 'row',
    marginBottom: 12,
  },
  halfInput: {
    marginRight: 8,
  },
  previewText: {
    fontSize: 14,
    color: '#7F8C8D',
    textAlign: 'center',
    marginBottom: 16,
    fontStyle: 'italic',
  },
  editContainer: {
    flex: 1,
  },
  editInputRow: {
    flexDirection: 'row',
    marginBottom: 8,
  },
  editPreview: {
    fontSize: 12,
    color: '#7F8C8D',
    fontStyle: 'italic',
  },
});

export default ManageClassesScreen;
