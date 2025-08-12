import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  ScrollView,
  Alert,
  ActivityIndicator,
  SafeAreaView,
  Image,
  Platform,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import * as DocumentPicker from 'expo-document-picker';
import * as ImagePicker from 'expo-image-picker';
import { Picker } from '@react-native-picker/picker';
import { teacherAPI } from '../../services/api';
import { storage } from '../../utils/storage';

const CreateAssignmentScreen = ({ navigation, route }) => {
  const { selectedClass } = route.params || {};
  
  // Check if selectedClass exists, if not navigate back
  useEffect(() => {
    if (!selectedClass) {
      Alert.alert('Error', 'No class selected. Please select a class first.');
      navigation.goBack();
      return;
    }
  }, [selectedClass, navigation]);
  
  const [loading, setLoading] = useState(false);
  const [userData, setUserData] = useState(null);
  
  // Form data
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [subject, setSubject] = useState('');
  const [priority, setPriority] = useState('medium');
  
  // File uploads
  const [images, setImages] = useState([]);
  const [attachments, setAttachments] = useState([]);
  const [uploadingFiles, setUploadingFiles] = useState(false);

  // Available subjects - will be fetched from API
  const [subjects, setSubjects] = useState([]);
  const [subjectsLoading, setSubjectsLoading] = useState(false);

  const priorities = [
    { label: 'Low', value: 'low' },
    { label: 'Medium', value: 'medium' },
    { label: 'High', value: 'high' },
    { label: 'Urgent', value: 'urgent' }
  ];

  useEffect(() => {
    loadUserData();
    loadTeacherSubjects();
  }, []);

  const loadUserData = async () => {
    try {
      const data = await storage.getUserData();
      setUserData(data);
    } catch (error) {
      console.error('Error loading user data:', error);
    }
  };

  const loadTeacherSubjects = async () => {
    try {
      setSubjectsLoading(true);
      const response = await teacherAPI.getTeacherSubjects(selectedClass.id);
      if (response.data && response.data.subjects) {
        setSubjects(response.data.subjects);
      }
    } catch (error) {
      console.error('Error loading teacher subjects:', error);
      Alert.alert('Error', 'Failed to load subjects. Please try again.');
    } finally {
      setSubjectsLoading(false);
    }
  };

  const pickImage = async () => {
    try {
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [4, 3],
        quality: 0.8,
      });

      if (!result.canceled && result.assets[0]) {
        setImages([...images, result.assets[0]]);
      }
    } catch (error) {
      console.error('Error picking image:', error);
      Alert.alert('Error', 'Failed to pick image');
    }
  };

  const pickDocument = async () => {
    try {
      const result = await DocumentPicker.getDocumentAsync({
        type: [
          'application/pdf',
          'text/plain',
          'application/msword',
          'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
          'application/vnd.oasis.opendocument.text'
        ],
        copyToCacheDirectory: true,
      });

      if (!result.canceled && result.assets[0]) {
        const file = result.assets[0];
        
        // Check file size (5MB limit)
        if (file.size > 5 * 1024 * 1024) {
          Alert.alert('Error', 'File size must be less than 5MB');
          return;
        }

        setAttachments([...attachments, file]);
      }
    } catch (error) {
      console.error('Error picking document:', error);
      Alert.alert('Error', 'Failed to pick document');
    }
  };

  const removeImage = (index) => {
    setImages(images.filter((_, i) => i !== index));
  };

  const removeAttachment = (index) => {
    setAttachments(attachments.filter((_, i) => i !== index));
  };

  const validateForm = () => {
    if (!title.trim()) {
      Alert.alert('Error', 'Please enter assignment title');
      return false;
    }
    if (!description.trim()) {
      Alert.alert('Error', 'Please enter assignment description');
      return false;
    }
    if (subjects.length === 0) {
      Alert.alert('Error', 'No subjects are assigned to you for this class. Please contact admin.');
      return false;
    }
    if (!subject) {
      Alert.alert('Error', 'Please select a subject');
      return false;
    }
    return true;
  };

  const createAssignment = async () => {
    if (!validateForm()) return;

    try {
      setLoading(true);
      
      const formData = new FormData();
      formData.append('title', title.trim());
      formData.append('description', description.trim());
      formData.append('subject', subject);
      formData.append('classId', selectedClass.id);
      formData.append('priority', priority);

      // Add images
      images.forEach((image, index) => {
        const imageFile = {
          uri: image.uri,
          type: 'image/jpeg',
          name: `image_${index}.jpg`
        };
        formData.append('files', imageFile);
      });

      // Add attachments
      attachments.forEach((file, index) => {
        const attachmentFile = {
          uri: file.uri,
          type: file.mimeType,
          name: file.name
        };
        formData.append('files', attachmentFile);
      });

      const response = await teacherAPI.createAssignment(formData);
      
      Alert.alert(
        'Success',
        'Assignment created successfully!',
        [
          {
            text: 'OK',
            onPress: () => navigation.navigate('TeacherAssignments')
          }
        ]
      );
    } catch (error) {
      console.error('Error creating assignment:', error);
      Alert.alert('Error', error.response?.data?.message || 'Failed to create assignment');
    } finally {
      setLoading(false);
    }
  };

  const formatFileSize = (bytes) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-back" size={24} color="#2C3E50" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Create Assignment</Text>
        <View style={styles.headerRight} />
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.classInfo}>
          <Ionicons name="school-outline" size={20} color="#4A90E2" />
          <Text style={styles.classText}>{selectedClass.name}</Text>
        </View>

        <View style={styles.formSection}>
          <Text style={styles.sectionTitle}>Assignment Details</Text>
          
          <View style={styles.inputContainer}>
            <Text style={styles.label}>Title *</Text>
            <TextInput
              style={styles.input}
              value={title}
              onChangeText={setTitle}
              placeholder="Enter assignment title"
              maxLength={100}
            />
          </View>

          <View style={styles.inputContainer}>
            <Text style={styles.label}>Description *</Text>
            <TextInput
              style={[styles.input, styles.textArea]}
              value={description}
              onChangeText={setDescription}
              placeholder="Enter assignment description"
              multiline
              numberOfLines={4}
              maxLength={1000}
            />
          </View>

          <View style={styles.inputContainer}>
            <Text style={styles.label}>Subject *</Text>
            <View style={styles.pickerContainer}>
              <Picker
                selectedValue={subject}
                onValueChange={setSubject}
                style={styles.picker}
                enabled={!subjectsLoading}
              >
                <Picker.Item label={subjectsLoading ? "Loading subjects..." : "Select a subject"} value="" />
                {subjects.map((sub) => (
                  <Picker.Item key={sub} label={sub} value={sub} />
                ))}
              </Picker>
            </View>
            {subjects.length === 0 && !subjectsLoading && (
              <Text style={styles.errorText}>No subjects assigned to you for this class. Please contact admin.</Text>
            )}
          </View>

          <View style={styles.inputContainer}>
            <Text style={styles.label}>Priority</Text>
            <View style={styles.pickerContainer}>
              <Picker
                selectedValue={priority}
                onValueChange={setPriority}
                style={styles.picker}
              >
                {priorities.map((p) => (
                  <Picker.Item key={p.value} label={p.label} value={p.value} />
                ))}
              </Picker>
            </View>
          </View>
        </View>

        <View style={styles.formSection}>
          <Text style={styles.sectionTitle}>Attachments</Text>
          <Text style={styles.sectionSubtitle}>Use Only When Important, Else Don't waste Server's Storage! Max Size 5Mb</Text>
          
          <View style={styles.uploadButtons}>
            <TouchableOpacity style={styles.uploadButton} onPress={pickImage}>
              <Ionicons name="image-outline" size={24} color="#4A90E2" />
              <Text style={styles.uploadButtonText}>Add Images</Text>
            </TouchableOpacity>
            
            <TouchableOpacity style={styles.uploadButton} onPress={pickDocument}>
              <Ionicons name="document-outline" size={24} color="#27AE60" />
              <Text style={styles.uploadButtonText}>Add Files</Text>
            </TouchableOpacity>
          </View>

          {images.length > 0 && (
            <View style={styles.filesSection}>
              <Text style={styles.filesTitle}>Images ({images.length})</Text>
              {images.map((image, index) => (
                <View key={index} style={styles.fileItem}>
                  <Image source={{ uri: image.uri }} style={styles.imagePreview} />
                  <View style={styles.fileInfo}>
                    <Text style={styles.fileName}>Image {index + 1}</Text>
                  </View>
                  <TouchableOpacity
                    style={styles.removeButton}
                    onPress={() => removeImage(index)}
                  >
                    <Ionicons name="close-circle" size={24} color="#E74C3C" />
                  </TouchableOpacity>
                </View>
              ))}
            </View>
          )}

          {attachments.length > 0 && (
            <View style={styles.filesSection}>
              <Text style={styles.filesTitle}>Files ({attachments.length})</Text>
              {attachments.map((file, index) => (
                <View key={index} style={styles.fileItem}>
                  <Ionicons name="document-outline" size={24} color="#27AE60" />
                  <View style={styles.fileInfo}>
                    <Text style={styles.fileName}>{file.name}</Text>
                    <Text style={styles.fileSize}>{formatFileSize(file.size)}</Text>
                  </View>
                  <TouchableOpacity
                    style={styles.removeButton}
                    onPress={() => removeAttachment(index)}
                  >
                    <Ionicons name="close-circle" size={24} color="#E74C3C" />
                  </TouchableOpacity>
                </View>
              ))}
            </View>
          )}
        </View>
      </ScrollView>

      <View style={styles.footer}>
        <TouchableOpacity
          style={[styles.createButton, (loading || subjects.length === 0) && styles.disabledButton]}
          onPress={createAssignment}
          disabled={loading || subjects.length === 0}
        >
          {loading ? (
            <ActivityIndicator color="#FFFFFF" />
          ) : subjects.length === 0 ? (
            <Text style={styles.createButtonText}>No Subjects Available</Text>
          ) : (
            <>
              <Ionicons name="create-outline" size={20} color="#FFFFFF" />
              <Text style={styles.createButtonText}>Create Assignment</Text>
            </>
          )}
        </TouchableOpacity>
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
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 15,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E9ECEF',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#2C3E50',
  },
  headerRight: {
    width: 24,
  },
  content: {
    flex: 1,
    paddingHorizontal: 20,
  },
  classInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#E3F2FD',
    padding: 15,
    borderRadius: 8,
    marginTop: 20,
    marginBottom: 20,
  },
  classText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1976D2',
    marginLeft: 10,
  },
  formSection: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 20,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 5,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#2C3E50',
    marginBottom: 8,
  },
  sectionSubtitle: {
    fontSize: 12,
    color: '#7F8C8D',
    marginBottom: 20,
    fontStyle: 'italic',
  },
  inputContainer: {
    marginBottom: 20,
  },
  label: {
    fontSize: 16,
    fontWeight: '500',
    color: '#2C3E50',
    marginBottom: 8,
  },
  input: {
    borderWidth: 1,
    borderColor: '#E9ECEF',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    backgroundColor: '#FFFFFF',
  },
  textArea: {
    height: 100,
    textAlignVertical: 'top',
  },
  pickerContainer: {
    borderWidth: 1,
    borderColor: '#E9ECEF',
    borderRadius: 8,
    backgroundColor: '#FFFFFF',
  },
  picker: {
    height: 50,
  },
  uploadButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 20,
  },
  uploadButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#F8F9FA',
    borderWidth: 1,
    borderColor: '#E9ECEF',
    borderRadius: 8,
    padding: 15,
    marginHorizontal: 5,
  },
  uploadButtonText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#2C3E50',
    marginLeft: 8,
  },
  filesSection: {
    marginTop: 15,
  },
  filesTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#2C3E50',
    marginBottom: 10,
  },
  fileItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F8F9FA',
    borderRadius: 8,
    padding: 12,
    marginBottom: 8,
  },
  imagePreview: {
    width: 40,
    height: 40,
    borderRadius: 4,
  },
  fileInfo: {
    flex: 1,
    marginLeft: 12,
  },
  fileName: {
    fontSize: 14,
    fontWeight: '500',
    color: '#2C3E50',
  },
  fileSize: {
    fontSize: 12,
    color: '#7F8C8D',
    marginTop: 2,
  },
  removeButton: {
    padding: 4,
  },
  footer: {
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 20,
    paddingVertical: 15,
    borderTopWidth: 1,
    borderTopColor: '#E9ECEF',
  },
  createButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#4A90E2',
    borderRadius: 8,
    padding: 15,
  },
  disabledButton: {
    backgroundColor: '#BDC3C7',
  },
  createButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
    marginLeft: 8,
  },
  errorText: {
    fontSize: 12,
    color: '#E74C3C',
    marginTop: 5,
    fontStyle: 'italic',
  },
});

export default CreateAssignmentScreen;