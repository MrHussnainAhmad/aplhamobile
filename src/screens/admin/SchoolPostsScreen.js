import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  TextInput,
  Alert,
  ActivityIndicator,
  Image,
  Modal,
  FlatList,
  RefreshControl,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Picker } from '@react-native-picker/picker';
import * as ImagePicker from 'expo-image-picker';
import { adminAPI, classesAPI } from '../../services/api';

const SchoolPostsScreen = ({ navigation }) => {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [postContent, setPostContent] = useState('');
  const [postType, setPostType] = useState('text');
  const [targetAudience, setTargetAudience] = useState('both');
  const [selectedClass, setSelectedClass] = useState('');
  const [classes, setClasses] = useState([]);
  const [selectedImage, setSelectedImage] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [classesLoading, setClassesLoading] = useState(true);
  const scrollViewRef = useRef();

  useEffect(() => {
    fetchPosts();
    fetchClasses();
  }, []);

  const fetchPosts = async () => {
    try {
      setLoading(true);
      const response = await adminAPI.getAllPosts();
      setPosts(response.data.posts || []);
    } catch (error) {
      console.error('Error fetching posts:', error);
      Alert.alert('Error', 'Failed to load posts.');
    } finally {
      setLoading(false);
    }
  };

  const fetchClasses = async () => {
    try {
      setClassesLoading(true);
      const response = await classesAPI.getAllClasses();
      if (response.data && response.data.classes) {
        setClasses(response.data.classes.filter(Boolean));
      }
    } catch (error) {
      console.error('Error fetching classes:', error);
    } finally {
      setClassesLoading(false);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await fetchPosts();
    setRefreshing(false);
  };

  const pickImage = async () => {
    try {
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [4, 3],
        quality: 0.8,
      });

      if (!result.canceled) {
        setSelectedImage(result.assets[0]);
      }
    } catch (error) {
      console.error('Error picking image:', error);
      Alert.alert('Error', 'Failed to pick image.');
    }
  };

  const createPost = async () => {
    if (!postContent.trim() && !selectedImage) {
      Alert.alert('Error', 'Please add some content or an image to your post.');
      return;
    }

    if (targetAudience === 'class' && !selectedClass) {
      Alert.alert('Error', 'Please select a target class.');
      return;
    }

    try {
      setUploading(true);

      const formData = new FormData();
      formData.append('content', postContent.trim());
      formData.append('postType', postType);
      formData.append('targetAudience', targetAudience);
      
      if (targetAudience === 'class') {
        formData.append('targetClass', selectedClass);
      }

      if (selectedImage) {
        const imageUri = selectedImage.uri;
        const imageName = imageUri.split('/').pop();
        const imageType = imageName.split('.').pop();
        
        formData.append('image', {
          uri: imageUri,
          type: `image/${imageType}`,
          name: imageName,
        });
      }

      await adminAPI.createPost(formData);
      
      Alert.alert('Success', 'Post created successfully!');
      setShowCreateModal(false);
      resetForm();
      fetchPosts();
    } catch (error) {
      console.error('Error creating post:', error);
      Alert.alert('Error', 'Failed to create post. Please try again.');
    } finally {
      setUploading(false);
    }
  };

  const deletePost = async (postId) => {
    Alert.alert(
      'Delete Post',
      'Are you sure you want to delete this post?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            try {
              await adminAPI.deletePost(postId);
              Alert.alert('Success', 'Post deleted successfully!');
              fetchPosts();
            } catch (error) {
              console.error('Error deleting post:', error);
              Alert.alert('Error', 'Failed to delete post.');
            }
          },
        },
      ]
    );
  };

  const resetForm = () => {
    setPostContent('');
    setPostType('text');
    setTargetAudience('both');
    setSelectedClass('');
    setSelectedImage(null);
  };

  const getAudienceText = (audience, targetClass) => {
    switch (audience) {
      case 'teachers':
        return '👨‍🏫 Teachers Only';
      case 'students':
        return '👨‍🎓 Students Only';
      case 'both':
        return '👥 Everyone';
      case 'class':
        return `📚 Class ${targetClass?.classNumber}-${targetClass?.section}`;
      default:
        return audience;
    }
  };

  const getPostTypeIcon = (type) => {
    switch (type) {
      case 'text':
        return '📝';
      case 'image':
        return '🖼️';
      case 'image_text':
        return '📝🖼️';
      default:
        return '📄';
    }
  };

  const renderPost = ({ item }) => (
    <View style={styles.postCard}>
      <View style={styles.postHeader}>
        <View style={styles.postInfo}>
          <Text style={styles.authorName}>{item.author?.fullname || 'Unknown Admin'}</Text>
          <Text style={styles.postDate}>{new Date(item.createdAt).toLocaleDateString()}</Text>
        </View>
        <View style={styles.postMeta}>
          <Text style={styles.postTypeIcon}>{getPostTypeIcon(item.postType)}</Text>
          <Text style={styles.audienceText}>{getAudienceText(item.targetAudience, item.targetClass)}</Text>
        </View>
      </View>

      {item.content && (
        <Text style={styles.postContent}>{item.content}</Text>
      )}

      {item.imageUrl && (
        <Image source={{ uri: item.imageUrl }} style={styles.postImage} resizeMode="cover" />
      )}

      <View style={styles.postActions}>
        <TouchableOpacity
          style={styles.deleteButton}
          onPress={() => deletePost(item._id)}
        >
          <Ionicons name="trash" size={16} color="#E74C3C" />
          <Text style={styles.deleteButtonText}>Delete</Text>
        </TouchableOpacity>
      </View>
    </View>
  );

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-back" size={24} color="#2C3E50" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>School Posts Management</Text>
        <TouchableOpacity onPress={() => setShowCreateModal(true)}>
          <Ionicons name="add" size={24} color="#2C3E50" />
        </TouchableOpacity>
      </View>

      <FlatList
        ref={scrollViewRef}
        data={posts}
        renderItem={renderPost}
        keyExtractor={(item) => item._id}
        contentContainerStyle={styles.postsList}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Ionicons name="chatbubbles-outline" size={80} color="#BDC3C7" />
            <Text style={styles.emptyTitle}>No Posts Yet</Text>
            <Text style={styles.emptyText}>
              Create your first post to start communicating with teachers and students.
            </Text>
          </View>
        }
      />

      {/* Create Post Modal */}
      <Modal
        visible={showCreateModal}
        animationType="slide"
        presentationStyle="pageSheet"
      >
        <KeyboardAvoidingView 
          style={styles.modalContainer}
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        >
          <View style={styles.modalHeader}>
            <TouchableOpacity onPress={() => setShowCreateModal(false)}>
              <Text style={styles.cancelButton}>Cancel</Text>
            </TouchableOpacity>
            <Text style={styles.modalTitle}>Create Post</Text>
            <TouchableOpacity 
              onPress={createPost}
              disabled={uploading}
              style={uploading ? styles.disabledButton : null}
            >
              <Text style={[styles.postButton, uploading && styles.disabledButtonText]}>
                {uploading ? 'Posting...' : 'Post'}
              </Text>
            </TouchableOpacity>
          </View>

          <ScrollView style={styles.modalContent}>
            <View style={styles.inputContainer}>
              <TextInput
                style={styles.contentInput}
                placeholder="What's on your mind?"
                placeholderTextColor="#95A5A6"
                value={postContent}
                onChangeText={setPostContent}
                multiline
                textAlignVertical="top"
              />
            </View>

            {selectedImage && (
              <View style={styles.imagePreviewContainer}>
                <Image source={{ uri: selectedImage.uri }} style={styles.imagePreview} />
                <TouchableOpacity
                  style={styles.removeImageButton}
                  onPress={() => setSelectedImage(null)}
                >
                  <Ionicons name="close-circle" size={24} color="#E74C3C" />
                </TouchableOpacity>
              </View>
            )}

            <View style={styles.optionsContainer}>
              <TouchableOpacity style={styles.imageButton} onPress={pickImage}>
                <Ionicons name="image" size={20} color="#4A90E2" />
                <Text style={styles.imageButtonText}>Add Image</Text>
              </TouchableOpacity>
            </View>

            <View style={styles.pickerContainer}>
              <Text style={styles.pickerLabel}>Post Type:</Text>
              <Picker
                selectedValue={postType}
                onValueChange={setPostType}
                style={styles.picker}
              >
                <Picker.Item label="Text Only" value="text" />
                <Picker.Item label="Image Only" value="image" />
                <Picker.Item label="Image + Text" value="image_text" />
              </Picker>
            </View>

            <View style={styles.pickerContainer}>
              <Text style={styles.pickerLabel}>Target Audience:</Text>
              <Picker
                selectedValue={targetAudience}
                onValueChange={setTargetAudience}
                style={styles.picker}
              >
                <Picker.Item label="👥 Everyone (Teachers & Students)" value="both" />
                <Picker.Item label="👨‍🏫 Teachers Only" value="teachers" />
                <Picker.Item label="👨‍🎓 Students Only" value="students" />
                <Picker.Item label="📚 Specific Class" value="class" />
              </Picker>
            </View>

            {targetAudience === 'class' && (
              <View style={styles.pickerContainer}>
                <Text style={styles.pickerLabel}>Select Class:</Text>
                <Picker
                  selectedValue={selectedClass}
                  onValueChange={setSelectedClass}
                  style={styles.picker}
                  enabled={!classesLoading}
                >
                  <Picker.Item label="Select a class..." value="" />
                  {classes.map((cls) => {
                    const fullClassName = cls.section ? `${cls.classNumber}-${cls.section}` : cls.classNumber;
                    return (
                      <Picker.Item 
                        key={cls._id} 
                        label={fullClassName} 
                        value={cls._id} 
                      />
                    );
                  })}
                </Picker>
              </View>
            )}
          </ScrollView>
        </KeyboardAvoidingView>
      </Modal>

      {loading && (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#4A90E2" />
          <Text style={styles.loadingText}>Loading posts...</Text>
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F7FA',
  },
  header: {
    backgroundColor: '#FFFFFF',
    paddingTop: 50,
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
  postsList: {
    padding: 20,
  },
  postCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 3,
  },
  postHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  postInfo: {
    flex: 1,
  },
  authorName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#2C3E50',
  },
  postDate: {
    fontSize: 12,
    color: '#7F8C8D',
    marginTop: 2,
  },
  postMeta: {
    alignItems: 'flex-end',
  },
  postTypeIcon: {
    fontSize: 16,
    marginBottom: 4,
  },
  audienceText: {
    fontSize: 12,
    color: '#4A90E2',
    fontWeight: '500',
  },
  postContent: {
    fontSize: 16,
    color: '#2C3E50',
    lineHeight: 24,
    marginBottom: 12,
  },
  postImage: {
    width: '100%',
    height: 200,
    borderRadius: 8,
    marginBottom: 12,
  },
  postActions: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    borderTopWidth: 1,
    borderTopColor: '#ECF0F1',
    paddingTop: 12,
  },
  deleteButton: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 8,
  },
  deleteButtonText: {
    fontSize: 14,
    color: '#E74C3C',
    marginLeft: 4,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 40,
    paddingTop: 50,
  },
  emptyTitle: {
    fontSize: 22,
    fontWeight: '600',
    color: '#7F8C8D',
    marginTop: 24,
    marginBottom: 12,
    textAlign: 'center',
  },
  emptyText: {
    fontSize: 16,
    color: '#95A5A6',
    textAlign: 'center',
    lineHeight: 24,
  },
  loadingContainer: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.8)',
  },
  loadingText: {
    marginTop: 10,
    fontSize: 16,
    color: '#555',
  },
  modalContainer: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  modalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingTop: 50,
    paddingBottom: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#ECF0F1',
  },
  cancelButton: {
    fontSize: 16,
    color: '#7F8C8D',
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#2C3E50',
  },
  postButton: {
    fontSize: 16,
    fontWeight: '600',
    color: '#4A90E2',
  },
  disabledButton: {
    opacity: 0.5,
  },
  disabledButtonText: {
    color: '#95A5A6',
  },
  modalContent: {
    flex: 1,
    padding: 20,
  },
  inputContainer: {
    marginBottom: 20,
  },
  contentInput: {
    minHeight: 120,
    borderWidth: 1,
    borderColor: '#ECF0F1',
    borderRadius: 8,
    padding: 16,
    fontSize: 16,
    color: '#2C3E50',
    backgroundColor: '#F8F9FA',
  },
  imagePreviewContainer: {
    position: 'relative',
    marginBottom: 20,
  },
  imagePreview: {
    width: '100%',
    height: 200,
    borderRadius: 8,
  },
  removeImageButton: {
    position: 'absolute',
    top: 8,
    right: 8,
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
  },
  optionsContainer: {
    marginBottom: 20,
  },
  imageButton: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    backgroundColor: '#F8F9FA',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#ECF0F1',
  },
  imageButtonText: {
    marginLeft: 8,
    fontSize: 16,
    color: '#4A90E2',
  },
  pickerContainer: {
    marginBottom: 20,
  },
  pickerLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: '#2C3E50',
    marginBottom: 8,
  },
  picker: {
    backgroundColor: '#F8F9FA',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#ECF0F1',
  },
});

export default SchoolPostsScreen;
