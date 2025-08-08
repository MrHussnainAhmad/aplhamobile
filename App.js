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
      </Stack.Navigator>
    </NavigationContainer>
  );
}
