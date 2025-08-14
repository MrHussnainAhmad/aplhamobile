import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { getApiUrl } from '../config/api.config';

// Get API URL from configuration
const API_URL = getApiUrl(); // This will log the current API URL and get the URL

// Export API_BASE_URL for direct fetch calls
export const API_BASE_URL = API_URL;

const api = axios.create({
  baseURL: API_URL,
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
};

export const studentAPI = {
  // Student self-signup (no ID assigned)
  createStudent: (studentData) => api.post('/student/signup', studentData),
  // Upload fee voucher
  uploadFeeVoucher: (formData) => api.post('/fee-vouchers/upload', formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  }),
  // Get student's fee vouchers
  getFeeVouchers: () => api.get('/fee-vouchers/my-vouchers'),
  // Posts
  getPosts: () => api.get('/posts/student'),
  // Assignment Management
  getMyAssignments: () => api.get('/assignments/student/assignments'),
  getClassAssignments: (classId) => api.get(`/assignments/class/${classId}`),
  getAssignmentDetails: (id) => api.get(`/assignments/${id}`),
};

// Admin API functions
export const adminAPI = {
  // Get all teachers
  getAllTeachers: () => api.get('/admin/teachers'),
  
  // Get all students
  getAllStudents: () => api.get('/admin/students'),
  
  // Get admin profile
  getAdminProfile: () => api.get('/admin/profile'),
  
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
  getAppConfig: () => api.get('/app-config'),
  updateAppConfig: (data) => api.put('/admin/app-config', data),
  resetAppConfig: () => api.post('/admin/app-config/reset'),
  savePushToken: (data) => api.post('/notifications/push-token', data),

  // Fee Voucher Management
  getAllFeeVouchersAdmin: (searchQuery, classId) => api.get(`/fee-vouchers/admin/all?search=${searchQuery}&classId=${classId || ''}`),
  getStudentFeeVouchersAdmin: (specialStudentId) => api.get(`/fee-vouchers/admin/${specialStudentId}`),

  // Class Management
  getClasses: () => api.get('/classes'),
  createClass: (data) => api.post('/classes', data),
  updateClass: (id, data) => api.put(`/classes/${id}`, data),
  deleteClass: (id) => api.delete(`/classes/${id}`),

  // Teacher Class Assignment
  getVerifiedTeachers: () => api.get('/admin/verified-teachers'),
  assignClass: (data) => api.post('/admin/assign-class', data),
  unassignClass: (data) => api.post('/admin/unassign-class', data),

  // Teacher Pay Management
  updateTeacherPay: (id, data) => api.put(`/admin/update-teacher-pay/${id}`, data),

  // Enhanced Teacher and Class Management
  // Search verified teachers with optional filters
  searchVerifiedTeachers: (params) => api.get('/admin/search-verified-teachers', { params }),
  
  // Get teachers with assigned classes (for subject management)
  getTeachersWithClasses: () => api.get('/admin/teachers-with-classes'),
  
  // Get class assignment stats
  getClassStats: () => api.get('/classes/stats'),
  
  // Get assigned teachers for a specific class
  getAssignedTeachers: (classId) => api.get(`/classes/${classId}/teachers`),
  
  // Subject Management for Teachers
  assignSubjectToTeacher: (data) => api.post('/admin/assign-subjects', data),
  removeSubjectFromTeacher: (data) => api.post('/admin/remove-subjects', data),

  // Subject Management
  getAllSubjects: () => api.get('/subjects'),
  createSubject: (data) => api.post('/subjects', data),
  updateSubject: (id, data) => api.put(`/subjects/${id}`, data),
  deleteSubject: (id) => api.delete(`/subjects/${id}`),

  // Enhanced Subject Assignment with Timetable
  assignSubjectsWithTimetable: (data) => api.post('/admin/assign-subjects-with-timetable', data),
  
  // Timetable Management
  getTimetable: (classId) => api.get(`/admin/timetable/${classId}`),
  removeTimetableEntry: (entryId) => api.delete(`/admin/timetable/${entryId}`),
  
  // Class Management
  getAllClasses: () => api.get('/classes'),

  // Grade Management
  addGrades: (data) => api.post('/grades', data),
  getGradesByStudentId: (studentId) => api.get(`/grades/student/${studentId}`),
  getGradesByExamId: (examId, examDate) => {
    const params = examDate ? `?examDate=${examDate}` : '';
    return api.get(`/grades/exam/${examId}${params}`);
  },

  // Grade Settings
  getGradeSettings: () => api.get('/admin/grade-settings'),
  updateGradeSettings: (data) => api.post('/admin/grade-settings', data),

  // Posts Management
  getAllPosts: () => api.get('/posts/admin/all'),
  createPost: (formData) => api.post('/posts/create', formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  }),
  deletePost: (postId) => api.delete(`/posts/admin/${postId}`),
  getPostStats: () => api.get('/posts/stats'),
};

// Teacher API functions
export const teacherAPI = {
  // Get all students
  getAllStudents: () => api.get('/teacher/students'),
  

  // Get teacher dashboard stats
  getDashboardStats: () => api.get('/teacher/dashboard-stats'),
  
  // Assign student ID
  assignStudentId: (id, studentId) => api.put(`/teacher/assign-student-id/${id}`, { studentId }),
  
  // Update student
  updateStudent: (id, data) => api.put(`/teacher/update-student/${id}`, data),
  
  // Get students by class and section
  getStudentsByClass: (className, section) => api.get(`/teacher/students/${className}/${section}`),

  // Student Class Assignment
  getVerifiedStudents: (params) => api.get('/teacher/verified-students', { params }),
  assignStudentClass: (data) => api.post('/teacher/assign-student-class', data),
  unassignStudentClass: (data) => api.post('/teacher/unassign-student-class', data),
  
  // Add marks for a student
  addMarks: (data) => api.post('/teacher/marks', data),
  
    // Get marks by student ID
  getMarksByStudentId: (studentId) => api.get(`/teacher/marks/${studentId}`),
   
  // Posts
  getPosts: () => api.get('/posts/teacher'),
  
  // Assignment Management
  getTeacherClasses: () => api.get('/teacher/classes'),
  getTeacherSubjects: (classId) => api.get(`/assignments/teacher/subjects/${classId}`),
  createAssignment: (formData) => api.post('/assignments/create', formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  }),
  getTeacherAssignments: (params) => api.get('/assignments/teacher', { params }),
  getAssignmentStats: () => api.get('/assignments/teacher/stats'),
  updateAssignment: (id, formData) => api.put(`/assignments/${id}`, formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  }),
  deleteAssignment: (id) => api.delete(`/assignments/${id}`),
  getAssignmentDetails: (id) => api.get(`/assignments/${id}`),
 };

export const publicAPI = {
  getClasses: () => api.get('/classes/public'),
};

export const classesAPI = {
  getAllClasses: () => publicAPI.getClasses(),
  getClassDetails: (id) => api.get(`/classes/${id}/details`),
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
  // Get student's courses
  getMyCourses: () => api.get('/profile/student/my-courses'),
  // Get student's grades
  getMyGrades: (params) => api.get('/grades/me', { params }),
  
  // Assignment Management
  getClassAssignments: (classId) => api.get(`/assignments/class/${classId}`),
  getAssignmentDetails: (id) => api.get(`/assignments/${id}`),
};

// Attendance API functions
export const attendanceAPI = {
  // Admin functions
  markStudentAttendance: (data) => api.post('/attendance/mark-student', data),
  markTeacherAttendance: (data) => api.post('/attendance/mark-teacher', data),
  updateAttendance: (id, data) => api.put(`/attendance/update/${id}`, data),
  getStudentsForClass: (classId) => api.get(`/attendance/students/${classId}`),
  getStudentsForRecords: (classId) => api.get(`/attendance/students-records/${classId}`),
  getVerifiedTeachers: () => api.get('/attendance/teachers'),
  getAttendanceRecord: (type, id, month) => api.get(`/attendance/record/${type}/${id}/${month}`),
  
  // Teacher functions
  getMyAttendanceRecord: (month) => api.get(`/attendance/my-record/${month}`),
  
  // Student functions
  getMyStudentAttendanceRecord: (month) => api.get(`/attendance/student/my-record/${month}`),
};

export const passwordResetAPI = {
  // Request password reset
  forgotPassword: (email) => api.post('/password-reset/forgot-password', { email }),

  // Verify reset token
  verifyToken: (token, email) => api.post('/password-reset/verify-token', { token, email }),

  // Reset password
  resetPassword: (token, email, newPassword) => api.post('/password-reset/reset-password', { token, email, newPassword })
};

export const notificationAPI = {
  // Get user's notifications
  getMyNotifications: (page = 1, limit = 20, unreadOnly = false) => 
    api.get(`/notifications/my-notifications?page=${page}&limit=${limit}&unreadOnly=${unreadOnly}`),

  // Mark notification as read
  markAsRead: (notificationId) => api.post(`/notifications/${notificationId}/read`),

  // Mark all notifications as read
  markAllAsRead: () => api.post('/notifications/mark-all-read'),

  // Get unread count
  getUnreadCount: () => api.get('/notifications/unread-count'),

  // Delete notification
  deleteNotification: (notificationId) => api.delete(`/notifications/${notificationId}`)
};

export default api;
