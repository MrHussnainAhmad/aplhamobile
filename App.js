import 'react-native-gesture-handler';
import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import { StatusBar } from 'expo-status-bar';
// 1. Import SafeAreaProvider
import { SafeAreaProvider } from 'react-native-safe-area-context';

// Import screens (all your screen imports remain the same)
import SplashScreen from './src/screens/SplashScreen';
import LoginScreen from './src/screens/LoginScreen';
import UserTypeScreen from './src/screens/UserTypeScreen';
import TeacherSignupScreen from './src/screens/TeacherSignupScreen';
import StudentSignupScreen from './src/screens/StudentSignupScreen';
import HomeScreen from './src/screens/HomeScreen';
import ManageAppScreen from './src/screens/ManageAppScreen';
import ManageStudentsScreen from './src/screens/ManageStudentsScreen';
import ManageTeachersScreen from './src/screens/admin/ManageTeachersScreen';
import UpdateStudentScreen from './src/screens/UpdateStudentScreen';
import UpdateTeacherScreen from './src/screens/UpdateTeacherScreen';
import CreateTeacherScreen from './src/screens/CreateTeacherScreen';
import TeacherProfileScreen from './src/screens/teacher/TeacherProfileScreen';
import MyClassesScreen from './src/screens/teacher/MyClassesScreen';
import AssignStudentsScreen from './src/screens/teacher/AssignStudentsScreen';
import TeacherClassStudentsScreen from './src/screens/teacher/ClassStudentsScreen';
import StudentProfileScreen from './src/screens/student/StudentProfileScreen';
import UploadFeeVoucherScreen from './src/screens/student/UploadFeeVoucherScreen';
import MyCoursesScreen from './src/screens/student/MyCoursesScreen';
import GradesScreen from './src/screens/student/GradesScreen';
import FeeVoucherDetailPage from './src/screens/admin/FeeVoucherDetailPage';
import FeeManagementScreen from './src/screens/admin/FeeManagementScreen';
import SystemDetailScreen from './src/screens/admin/SystemDetailScreen';
import SchoolPostsScreen from './src/screens/admin/SchoolPostsScreen';
import ClassesScreen from './src/screens/admin/ClassesScreen';
import AssignClassesScreen from './src/screens/admin/AssignClassesScreen';
import ClassManagementMainScreen from './src/screens/admin/ClassManagementMainScreen';
import ManageClassesScreen from './src/screens/admin/ManageClassesScreen';
import ViewClassesScreen from './src/screens/admin/ViewClassesScreen';
import ManageSubjectsScreen from './src/screens/admin/ManageSubjectsScreen';
import AssignClassesWithSearchScreen from './src/screens/admin/AssignClassesWithSearchScreen';
import GradesManagementScreen from './src/screens/admin/grades/GradesManagementScreen';
import SelectClassForGradingScreen from './src/screens/admin/grades/SelectClassForGradingScreen';
import GradeNowScreen from './src/screens/admin/grades/GradeNowScreen';
import StudentsListForGradingScreen from './src/screens/admin/grades/StudentsListForGradingScreen';
import AddGradesScreen from './src/screens/admin/grades/AddGradesScreen';
import ShowGradesRecordScreen from './src/screens/admin/grades/ShowGradesRecordScreen';
import SubjectCrudScreen from './src/screens/admin/subjects/ManageSubjectsScreen';
import GradeSettingsScreen from './src/screens/admin/GradeSettingsScreen';
import TeacherSchoolPostsScreen from './src/screens/teacher/SchoolPostsScreen';
import StudentSchoolPostsScreen from './src/screens/student/SchoolPostsScreen';
import SelectClassForAssignmentScreen from './src/screens/teacher/SelectClassForAssignmentScreen';
import CreateAssignmentScreen from './src/screens/teacher/CreateAssignmentScreen';
import TeacherAssignmentsScreen from './src/screens/teacher/TeacherAssignmentsScreen';
import StudentAssignmentsScreen from './src/screens/student/StudentAssignmentsScreen';
import AssignmentDetailScreen from './src/screens/student/AssignmentDetailScreen';

// Attendance screens
import MainAttendanceScreen from './src/screens/admin/MainAttendanceScreen';
import StudentAttendanceScreen from './src/screens/admin/StudentAttendanceScreen';
import TeacherAttendanceScreen from './src/screens/admin/TeacherAttendanceScreen';
import AttendanceRecordScreen from './src/screens/admin/AttendanceRecordScreen';
import AttendanceDetailScreen from './src/screens/admin/AttendanceDetailScreen';
import TeacherAttendanceRecordScreen from './src/screens/teacher/TeacherAttendanceRecordScreen';
import StudentAttendanceRecordScreen from './src/screens/student/StudentAttendanceRecordScreen';
import AdminClassStudentsScreen from './src/screens/admin/ClassStudentsScreen';
import ClassStudentsListScreen from './src/screens/admin/ClassStudentsListScreen';
import UnverifiedScreen from './src/screens/unverifiedsScreen';

const Stack = createStackNavigator();

export default function App() {
  return (
    // 2. Wrap your NavigationContainer with SafeAreaProvider
    <SafeAreaProvider>
      <NavigationContainer>
        <StatusBar style="auto" />
        <Stack.Navigator 
          initialRouteName="Splash"
          screenOptions={{
            headerShown: false,
          }}
        >
          {/* All your Stack.Screen components remain the same */}
          <Stack.Screen name="Splash" component={SplashScreen} />
          <Stack.Screen name="Login" component={LoginScreen} />
          <Stack.Screen name="UserType" component={UserTypeScreen} />
          <Stack.Screen name="TeacherSignup" component={TeacherSignupScreen} />
          <Stack.Screen name="StudentSignup" component={StudentSignupScreen} />
          <Stack.Screen 
            name="Home" 
            component={HomeScreen}
            options={{
              gestureEnabled: false,
              headerLeft: null,
            }}
          />
          <Stack.Screen name="ManageApp" component={ManageAppScreen} />
          <Stack.Screen name="ManageStudents" component={ManageStudentsScreen} />
          <Stack.Screen name="ManageTeachers" component={ManageTeachersScreen} />
          <Stack.Screen name="UpdateStudent" component={UpdateStudentScreen} />
          <Stack.Screen name="UpdateTeacherScreen" component={UpdateTeacherScreen} />
          <Stack.Screen name="CreateTeacherScreen" component={CreateTeacherScreen} />
          <Stack.Screen name="TeacherProfile" component={TeacherProfileScreen} />
          <Stack.Screen name="MyClasses" component={MyClassesScreen} />
          <Stack.Screen name="AssignStudents" component={AssignStudentsScreen} />
          <Stack.Screen name="ClassStudents" component={TeacherClassStudentsScreen} />
          <Stack.Screen name="StudentProfile" component={StudentProfileScreen} />
          <Stack.Screen name="UploadFeeVoucher" component={UploadFeeVoucherScreen} />
          <Stack.Screen name="MyCourses" component={MyCoursesScreen} />
          <Stack.Screen name="Grades" component={GradesScreen} />
          <Stack.Screen name="FeeVoucherDetail" component={FeeVoucherDetailPage} />
          <Stack.Screen name="FeeManagement" component={FeeManagementScreen} />
          <Stack.Screen name="SystemDetail" component={SystemDetailScreen} />
          <Stack.Screen name="SchoolPostsScreen" component={SchoolPostsScreen} />
          <Stack.Screen name="ClassesScreen" component={ClassesScreen} />
          <Stack.Screen name="AssignClasses" component={AssignClassesScreen} />
          <Stack.Screen name="ClassManagementMain" component={ClassManagementMainScreen} />
          <Stack.Screen name="ManageClasses" component={ManageClassesScreen} />
          <Stack.Screen name="ViewClasses" component={ViewClassesScreen} />
          <Stack.Screen name="ManageSubjects" component={ManageSubjectsScreen} />
          <Stack.Screen name="AssignClassesWithSearch" component={AssignClassesWithSearchScreen} />
          <Stack.Screen name="GradesManagement" component={GradesManagementScreen} />
          <Stack.Screen name="SelectClassForGrading" component={SelectClassForGradingScreen} />
          <Stack.Screen name="GradeNow" component={GradeNowScreen} />
          <Stack.Screen name="StudentsListForGrading" component={StudentsListForGradingScreen} />
          <Stack.Screen name="AddGrades" component={AddGradesScreen} />
          <Stack.Screen name="ShowGradesRecord" component={ShowGradesRecordScreen} />
          <Stack.Screen name="SubjectCrudScreen" component={SubjectCrudScreen} />
          <Stack.Screen name="GradeSettings" component={GradeSettingsScreen} />
          <Stack.Screen name="TeacherSchoolPosts" component={TeacherSchoolPostsScreen} />
          <Stack.Screen name="StudentSchoolPosts" component={StudentSchoolPostsScreen} />
          <Stack.Screen name="SelectClassForAssignment" component={SelectClassForAssignmentScreen} />
          <Stack.Screen name="CreateAssignment" component={CreateAssignmentScreen} />
          <Stack.Screen name="TeacherAssignments" component={TeacherAssignmentsScreen} />
          <Stack.Screen name="StudentAssignments" component={StudentAssignmentsScreen} />
          <Stack.Screen name="AssignmentDetail" component={AssignmentDetailScreen} />
          
          {/* Attendance screens */}
          <Stack.Screen name="MainAttendance" component={MainAttendanceScreen} />
          <Stack.Screen name="StudentAttendance" component={StudentAttendanceScreen} />
          <Stack.Screen name="TeacherAttendance" component={TeacherAttendanceScreen} />
          <Stack.Screen name="AttendanceRecord" component={AttendanceRecordScreen} />
          <Stack.Screen name="AttendanceDetail" component={AttendanceDetailScreen} />
          <Stack.Screen name="TeacherAttendanceRecord" component={TeacherAttendanceRecordScreen} />
          <Stack.Screen name="StudentAttendanceRecord" component={StudentAttendanceRecordScreen} />
          <Stack.Screen name="AdminClassStudents" component={AdminClassStudentsScreen} />
          <Stack.Screen name="ClassStudentsList" component={ClassStudentsListScreen} />
          <Stack.Screen 
            name="Unverified" 
            component={UnverifiedScreen}
            options={{
              gestureEnabled: false,
              headerLeft: null,
            }}
          />
        </Stack.Navigator>
      </NavigationContainer>
    </SafeAreaProvider>
  );
}
