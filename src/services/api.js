import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { BASE_URL, getApiUrl } from '../config/api.config';

// Get API URL from configuration
getApiUrl(); // This will log the current API URL

const api = axios.create({
  baseURL: BASE_URL,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor to add auth token
api.interceptors.request.use(
  async (config) => {
    try {
      const token = await AsyncStorage.getItem('userToken');
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
    } catch (error) {
      console.log('Error getting token:', error);
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor to handle errors
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    if (error.response?.status === 401) {
      // Token expired or invalid
      await AsyncStorage.removeItem('userToken');
      await AsyncStorage.removeItem('userData');
      // You might want to redirect to login screen here
    }
    return Promise.reject(error);
  }
);

// Auth API functions
export const authAPI = {
  // Teacher login
  teacherLogin: (credentials) => api.post('/teacher/login', credentials),
  
  // Student login
  studentLogin: (credentials) => api.post('/student/login', credentials),
  
  // Admin create teacher (for signup)
  createTeacher: (teacherData) => api.post('/admin/create-teacher', teacherData),
  
  // Admin create student (for signup)
  createStudent: (studentData) => api.post('/admin/create-student', studentData),
};

// User API functions
export const userAPI = {
  // Get teacher profile
  getTeacherProfile: (id) => api.get(`/teacher/profile/${id}`),
  
  // Get student profile
  getStudentProfile: (id) => api.get(`/student/profile/${id}`),
  
  // Update teacher profile
  updateTeacherProfile: (data) => api.put('/teacher/profile', data),
  
  // Update student profile
  updateStudentProfile: (data) => api.put('/student/profile', data),
};

export default api;
