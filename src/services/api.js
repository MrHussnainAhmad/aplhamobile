import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { BASE_URL, getApiUrl } from '../config/api.config';

// Export API_BASE_URL for direct fetch calls
export const API_BASE_URL = BASE_URL;

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
  // Admin login
  adminLogin: (credentials) => api.post('/admin/login', credentials),
  
  // Teacher login
  teacherLogin: (credentials) => api.post('/teacher/login', credentials),
  
  // Student login
  studentLogin: (credentials) => api.post('/student/login', credentials),
  
  // Teacher self-signup (no ID assigned)
  createTeacher: (teacherData) => api.post('/teacher/signup', teacherData),
  
  // Student self-signup (no ID assigned)
  createStudent: (studentData) => api.post('/student/signup', studentData),
};

// Admin API functions
export const adminAPI = {
  // Get all teachers
  getAllTeachers: () => api.get('/admin/teachers'),
  
  // Get all students
  getAllStudents: () => api.get('/admin/students'),
  
  // Update teacher
  updateTeacher: (id, data) => api.put(`/admin/update-teacher/${id}`, data),
  
  // Verify/Unverify teacher
  verifyTeacher: (id, isVerified) => api.put(`/admin/verify-teacher/${id}`, { isVerified }),
  
  // Delete teacher
  deleteTeacher: (id) => api.delete(`/admin/delete-teacher/${id}`),
  
  // Update student
  updateStudent: (id, data) => api.put(`/admin/update-student/${id}`, data),
  
  // Verify/Unverify student
  verifyStudent: (id, isVerified) => api.put(`/admin/verify-student/${id}`, { isVerified }),
  
  // Delete student
  deleteStudent: (id) => api.delete(`/admin/delete-student/${id}`),
  
  // Assign Teacher ID (admin only)
  assignTeacherId: (id, customTeacherId) => api.put(`/admin/assign-teacher-id/${id}`, { customTeacherId }),
  
  // Assign Student ID (admin only)
  assignStudentId: (id, customStudentId) => api.put(`/admin/assign-student-id/${id}`, { customStudentId }),
  
  // Get dashboard stats
  getStats: () => api.get('/admin/stats'),
  
  // Clean up teachers without ID
  cleanupTeachers: () => api.post('/admin/cleanup-teachers'),
  
  // Clean up students without ID
  cleanupStudents: () => api.post('/admin/cleanup-students'),
  
  // App Configuration
  getAppConfig: () => api.get('/admin/app-config'),
  updateAppConfig: (data) => api.put('/admin/app-config', data),
  resetAppConfig: () => api.post('/admin/app-config/reset'),
};

// Teacher API functions
export const teacherAPI = {
  // Get all students
  getAllStudents: () => api.get('/teacher/students'),
  
  // Assign student ID
  assignStudentId: (id, studentId) => api.put(`/teacher/assign-student-id/${id}`, { studentId }),
  
  // Update student
  updateStudent: (id, data) => api.put(`/teacher/update-student/${id}`, data),
  
  // Get students by class and section
  getStudentsByClass: (className, section) => api.get(`/teacher/students/${className}/${section}`),
};

// User API functions
export const userAPI = {
  // Get authenticated teacher profile (no ID needed)
  getTeacherProfile: () => api.get('/profile/teacher'),
  
  // Get authenticated student profile (no ID needed)
  getStudentProfile: () => api.get('/profile/student'),
  
  // Update authenticated teacher profile
  updateTeacherProfile: (data) => api.put('/profile/teacher', data),
  
  // Update authenticated student profile
  updateStudentProfile: (data) => api.put('/profile/student', data),
};

export default api;
