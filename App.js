import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import { StatusBar } from 'expo-status-bar';

// Import screens
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
import StudentProfileScreen from './src/screens/student/StudentProfileScreen';
import UploadFeeVoucherScreen from './src/screens/student/UploadFeeVoucherScreen';

import FeeVoucherDetailPage from './src/screens/admin/FeeVoucherDetailPage';
import FeeManagementScreen from './src/screens/admin/FeeManagementScreen';
import SystemDetailScreen from './src/screens/admin/SystemDetailScreen';
import SchoolPostsScreen from './src/screens/admin/SchoolPostsScreen';
import ClassesScreen from './src/screens/admin/ClassesScreen';
import AssignClassesScreen from './src/screens/admin/AssignClassesScreen';

const Stack = createStackNavigator();

export default function App() {
  return (
    <NavigationContainer>
      <StatusBar style="auto" />
      <Stack.Navigator 
        initialRouteName="Splash"
        screenOptions={{
          headerShown: false,
        }}
      >
        <Stack.Screen name="Splash" component={SplashScreen} />
        <Stack.Screen name="Login" component={LoginScreen} />
        <Stack.Screen name="UserType" component={UserTypeScreen} />
        <Stack.Screen name="TeacherSignup" component={TeacherSignupScreen} />
        <Stack.Screen name="StudentSignup" component={StudentSignupScreen} />
        <Stack.Screen name="Home" component={HomeScreen} />
        <Stack.Screen name="ManageApp" component={ManageAppScreen} />
        <Stack.Screen name="ManageStudents" component={ManageStudentsScreen} />
        <Stack.Screen name="ManageTeachers" component={ManageTeachersScreen} />
        <Stack.Screen name="UpdateStudent" component={UpdateStudentScreen} />
        <Stack.Screen name="UpdateTeacherScreen" component={UpdateTeacherScreen} />
        <Stack.Screen name="CreateTeacherScreen" component={CreateTeacherScreen} />
        <Stack.Screen name="TeacherProfile" component={TeacherProfileScreen} />
        <Stack.Screen name="MyClasses" component={MyClassesScreen} />
        <Stack.Screen name="AssignStudents" component={AssignStudentsScreen} />
        <Stack.Screen name="StudentProfile" component={StudentProfileScreen} />
        <Stack.Screen name="UploadFeeVoucher" component={UploadFeeVoucherScreen} />
        
        <Stack.Screen name="FeeVoucherDetail" component={FeeVoucherDetailPage} />
        <Stack.Screen name="FeeManagement" component={FeeManagementScreen} />
        <Stack.Screen name="SystemDetail" component={SystemDetailScreen} />
        <Stack.Screen name="SchoolPostsScreen" component={SchoolPostsScreen} />
        <Stack.Screen name="ClassesScreen" component={ClassesScreen} />
        <Stack.Screen name="AssignClasses" component={AssignClassesScreen} />
      </Stack.Navigator>
    </NavigationContainer>
  );
}
