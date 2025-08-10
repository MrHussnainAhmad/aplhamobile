import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, SafeAreaView, TouchableOpacity, TextInput, Alert, FlatList, ActivityIndicator, Modal } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { adminAPI } from '../../../services/api';

const SubjectCrudScreen = ({ navigation }) => {
  const [subjects, setSubjects] = useState([]);
  const [newSubject, setNewSubject] = useState('');
  const [loading, setLoading] = useState(false);
  const [isEditModalVisible, setEditModalVisible] = useState(false);
  const [selectedSubject, setSelectedSubject] = useState(null);
  const [editedSubjectName, setEditedSubjectName] = useState('');

  useEffect(() => {
    fetchSubjects();
  }, []);

  const fetchSubjects = async () => {
    setLoading(true);
    try {
      const response = await adminAPI.getAllSubjects();
      if (response.data && response.data.subjects) {
        setSubjects(response.data.subjects);
      }
    } catch (error) {
      console.error('Error fetching subjects:', error);
      Alert.alert('Error', 'Failed to load subjects.');
    } finally {
      setLoading(false);
    }
  };

  const handleAddSubject = async () => {
    if (!newSubject.trim()) {
      Alert.alert('Error', 'Subject name cannot be empty.');
      return;
    }
    try {
      const response = await adminAPI.createSubject({ name: newSubject.trim() });
      if (response.data && response.data.subject) {
        await fetchSubjects();
        setNewSubject('');
        Alert.alert('Success', 'Subject added successfully.');
      } else {
        Alert.alert('Error', response.data.message || 'Failed to add subject.');
      }
    } catch (error) {
      console.error('Error adding subject:', error);
      Alert.alert('Error', 'An error occurred while adding the subject.');
    }
  };

  const handleEditSubject = (subject) => {
    setSelectedSubject(subject);
    setEditedSubjectName(subject.name);
    setEditModalVisible(true);
  };

  const handleUpdateSubject = async () => {
    if (!editedSubjectName.trim()) {
      Alert.alert('Error', 'Subject name cannot be empty.');
      return;
    }
    try {
      const response = await adminAPI.updateSubject(selectedSubject._id, { name: editedSubjectName.trim() });
      if (response.data && response.data.subject) {
        await fetchSubjects();
        setEditModalVisible(false);
        Alert.alert('Success', 'Subject updated successfully.');
      } else {
        Alert.alert('Error', response.data.message || 'Failed to update subject.');
      }
    } catch (error) {
      console.error('Error updating subject:', error);
      Alert.alert('Error', 'An error occurred while updating the subject.');
    }
  };

  const handleDeleteSubject = async (subjectId) => {
    Alert.alert(
      'Delete Subject',
      'Are you sure you want to delete this subject?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            try {
              await adminAPI.deleteSubject(subjectId);
              await fetchSubjects();
              Alert.alert('Success', 'Subject deleted successfully.');
            } catch (error) {
              console.error('Error deleting subject:', error);
              Alert.alert('Error', 'An error occurred while deleting the subject.');
            }
          },
        },
      ]
    );
  };

  const renderSubjectItem = ({ item }) => (
    <View style={styles.subjectItem}>
      <Text style={styles.subjectName}>{item.name}</Text>
      <View style={styles.buttonsContainer}>
        <TouchableOpacity onPress={() => handleEditSubject(item)} style={styles.editButton}>
          <Ionicons name="pencil" size={20} color="#FFFFFF" />
        </TouchableOpacity>
        <TouchableOpacity onPress={() => handleDeleteSubject(item._id)} style={styles.deleteButton}>
          <Ionicons name="trash" size={20} color="#FFFFFF" />
        </TouchableOpacity>
      </View>
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-back" size={24} color="#2C3E50" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Manage Subjects</Text>
        <View style={{ width: 24 }} />
      </View>

      <View style={styles.content}>
        <View style={styles.inputContainer}>
          <TextInput
            style={styles.input}
            placeholder="Enter new subject name"
            value={newSubject}
            onChangeText={setNewSubject}
          />
          <TouchableOpacity style={styles.addButton} onPress={handleAddSubject}>
            <Text style={styles.addButtonText}>Add Subject</Text>
          </TouchableOpacity>
        </View>

        {loading ? (
          <ActivityIndicator size="large" color="#007BFF" />
        ) : (
          <FlatList
            data={subjects}
            renderItem={renderSubjectItem}
            keyExtractor={(item) => item._id}
            ListEmptyComponent={<Text>No subjects found.</Text>}
          />
        )}
      </View>

      <Modal
        animationType="slide"
        transparent={true}
        visible={isEditModalVisible}
        onRequestClose={() => setEditModalVisible(false)}
      >
        <View style={styles.centeredView}>
          <View style={styles.modalView}>
            <Text style={styles.modalText}>Edit Subject</Text>
            <TextInput
              style={styles.input}
              placeholder="Subject Name"
              value={editedSubjectName}
              onChangeText={setEditedSubjectName}
            />
            <View style={styles.modalButtons}>
              <TouchableOpacity
                style={[styles.button, styles.buttonClose]}
                onPress={() => setEditModalVisible(false)}
              >
                <Text style={styles.textStyle}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.button, styles.buttonOpen]}
                onPress={handleUpdateSubject}
              >
                <Text style={styles.textStyle}>Update</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8F9FA',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#ECF0F1',
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#2C3E50',
  },
  content: {
    flex: 1,
    padding: 20,
  },
  inputContainer: {
    marginBottom: 20,
  },
  input: {
    backgroundColor: '#FFFFFF',
    borderRadius: 10,
    padding: 15,
    fontSize: 16,
    marginBottom: 10,
  },
  addButton: {
    backgroundColor: '#007BFF',
    padding: 15,
    borderRadius: 10,
    alignItems: 'center',
  },
  addButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: 'bold',
  },
  subjectItem: {
    backgroundColor: '#FFFFFF',
    padding: 15,
    borderRadius: 10,
    marginBottom: 10,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  subjectName: {
    fontSize: 16,
  },
  buttonsContainer: {
    flexDirection: 'row',
  },
  editButton: {
    backgroundColor: '#3498db',
    padding: 10,
    borderRadius: 5,
    marginRight: 10,
  },
  deleteButton: {
    backgroundColor: '#e74c3c',
    padding: 10,
    borderRadius: 5,
  },
  centeredView: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    marginTop: 22
  },
  modalView: {
    margin: 20,
    backgroundColor: "white",
    borderRadius: 20,
    padding: 35,
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2
    },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5
  },
  button: {
    borderRadius: 20,
    padding: 10,
    elevation: 2
  },
  buttonOpen: {
    backgroundColor: "#F194FF",
  },
  buttonClose: {
    backgroundColor: "#2196F3",
  },
  textStyle: {
    color: "white",
    fontWeight: "bold",
    textAlign: "center"
  },
  modalText: {
    marginBottom: 15,
    textAlign: "center"
  },
  modalButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '100%'
  }
});

export default SubjectCrudScreen;
