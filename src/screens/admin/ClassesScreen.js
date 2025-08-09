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
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { adminAPI } from '../../services/api'; // Assuming adminAPI has methods for class management

const ClassesScreen = ({ navigation }) => {
  const [classes, setClasses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [newClassName, setNewClassName] = useState('');
  const [editingClassId, setEditingClassId] = useState(null);
  const [editingClassName, setEditingClassName] = useState('');

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
    if (!newClassName.trim()) {
      Alert.alert('Error', 'Class name cannot be empty.');
      return;
    }
    try {
      const response = await adminAPI.createClass({ name: newClassName });
      if (response.data.class) {
        setClasses([...classes, response.data.class]);
        setNewClassName('');
        Alert.alert('Success', 'Class created successfully!');
      }
    } catch (error) {
      console.error('Error creating class:', error);
      Alert.alert('Error', error.response?.data?.message || 'Failed to create class.');
    }
  };

  const handleUpdateClass = async () => {
    if (!editingClassName.trim()) {
      Alert.alert('Error', 'Class name cannot be empty.');
      return;
    }
    try {
      const response = await adminAPI.updateClass(editingClassId, { name: editingClassName });
      if (response.data.class) {
        setClasses(classes.map(cls => 
          cls._id === editingClassId ? response.data.class : cls
        ));
        setEditingClassId(null);
        setEditingClassName('');
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

  const renderClassItem = ({ item }) => (
    <TouchableOpacity 
      style={styles.classItem}
      onPress={() => navigation.navigate('AssignClasses', { classId: item._id, className: item.name })}
    >
      {editingClassId === item._id ? (
        <TextInput
          style={styles.editInput}
          value={editingClassName}
          onChangeText={setEditingClassName}
          placeholder="New class name"
        />
      ) : (
        <Text style={styles.className}>{item.name}</Text>
      )}
      
      <View style={styles.classActions}>
        {editingClassId === item._id ? (
          <>
            <TouchableOpacity onPress={handleUpdateClass} style={styles.actionButton}>
              <Ionicons name="checkmark-circle" size={24} color="#28A745" />
            </TouchableOpacity>
            <TouchableOpacity onPress={() => { setEditingClassId(null); setEditingClassName(''); }} style={styles.actionButton}>
              <Ionicons name="close-circle" size={24} color="#DC3545" />
            </TouchableOpacity>
          </>
        ) : (
          <>
            <TouchableOpacity onPress={() => { setEditingClassId(item._id); setEditingClassName(item.name); }} style={styles.actionButton}>
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
        <ActivityIndicator size="large" color="#007BFF" />
        <Text style={styles.loadingText}>Loading classes...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Manage Classes</Text>

      <View style={styles.inputContainer}>
        <TextInput
          style={styles.input}
          placeholder="Enter new class name"
          value={newClassName}
          onChangeText={setNewClassName}
        />
        <TouchableOpacity onPress={handleCreateClass} style={styles.createButton}>
          <Ionicons name="add-circle" size={24} color="#FFFFFF" />
          <Text style={styles.createButtonText}>Add Class</Text>
        </TouchableOpacity>
      </View>

      {classes.length === 0 ? (
        <Text style={styles.noClassesText}>No classes found. Add a new one!</Text>
      ) : (
        <FlatList
          data={classes}
          keyExtractor={(item) => item._id}
          renderItem={renderClassItem}
          contentContainerStyle={styles.listContent}
        />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: '#F8F9FA',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F8F9FA',
  },
  loadingText: {
    marginTop: 10,
    fontSize: 16,
    color: '#555',
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    marginBottom: 20,
    color: '#333',
    textAlign: 'center',
  },
  inputContainer: {
    flexDirection: 'row',
    marginBottom: 20,
    backgroundColor: '#FFFFFF',
    borderRadius: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 3,
    padding: 10,
  },
  input: {
    flex: 1,
    height: 40,
    borderColor: '#E0E0E0',
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 10,
    marginRight: 10,
    fontSize: 16,
  },
  createButton: {
    backgroundColor: '#007BFF',
    paddingVertical: 10,
    paddingHorizontal: 15,
    borderRadius: 8,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  createButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: 'bold',
    marginLeft: 5,
  },
  listContent: {
    paddingBottom: 20,
  },
  classItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    padding: 15,
    borderRadius: 10,
    marginBottom: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  className: {
    fontSize: 18,
    color: '#333',
    flex: 1,
  },
  editInput: {
    flex: 1,
    height: 40,
    borderColor: '#007BFF',
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 10,
    fontSize: 16,
  },
  classActions: {
    flexDirection: 'row',
    marginLeft: 10,
  },
  actionButton: {
    marginLeft: 15,
  },
  noClassesText: {
    textAlign: 'center',
    marginTop: 50,
    fontSize: 18,
    color: '#777',
  },
});

export default ClassesScreen;
