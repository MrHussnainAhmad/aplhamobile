# ALPHA Education Management Mobile App

This is the React Native mobile application for the ALPHA Education Management System built with Expo.

## Features

- 3-second splash screen with logo
- User authentication (Teacher/Student login)
- Role-based signup (Teacher or Student)
- User-specific home screens
- Responsive design

## Screen Flow

1. **Splash Screen** (3 seconds) → Checks authentication
2. **Login Screen** → Allows email/password login for both teachers and students
3. **User Type Screen** → Signup selection (Teacher or Student)
4. **Teacher Signup Screen** → Teacher registration form
5. **Student Signup Screen** → Student registration form
6. **Home Screen** → Different views for Teachers and Students

## Setup Instructions

### Prerequisites

- Node.js (v16 or later)
- npm or yarn
- Expo CLI (`npm install -g @expo/cli`)
- Android Studio (for Android emulator) or Xcode (for iOS simulator)

### Installation

1. Navigate to the mobile directory:
```bash
cd mobile
```

2. Install dependencies:
```bash
npm install
```

3. Start the development server:
```bash
npm start
# or
expo start
```

4. Run on device/simulator:
- For Android: Press 'a' in terminal or scan QR code with Expo Go app
- For iOS: Press 'i' in terminal or scan QR code with Expo Go app
- For web: Press 'w' in terminal

## Backend Configuration

Make sure your backend is running on `http://localhost:5000` or update the API base URL in `src/services/api.js`:

```javascript
const BASE_URL = 'http://your-backend-url:5000/api';
```

### For testing on physical device:
- Replace `localhost` with your computer's IP address
- For Android emulator: Use `http://10.0.2.2:5000/api`
- For iOS simulator: Use `http://localhost:5000/api`

## User Types

### Teacher Features
- Teacher profile management
- Student management
- Assignment creation
- Performance reports
- Announcements

### Student Features
- Student profile management
- Course access
- Assignment submission
- Grade viewing
- Fee voucher submission
- Announcements

## API Integration

The app connects to the backend API for:
- User authentication (Teacher/Student login)
- User registration (Teacher/Student signup)
- Profile management
- Data synchronization

## Environment Configuration

Update the API base URL in `src/services/api.js` based on your backend server location:

```javascript
// For local development
const BASE_URL = 'http://localhost:5000/api';

// For production
const BASE_URL = 'https://your-backend-domain.com/api';

// For testing on physical device
const BASE_URL = 'http://YOUR_COMPUTER_IP:5000/api';
```

## Dependencies

- React Navigation for navigation
- Axios for API calls
- AsyncStorage for local data persistence
- Expo Vector Icons for icons
- React Native Picker for dropdown selections

## Testing

1. Start the backend server first
2. Update MongoDB Atlas connection in backend/.env
3. Run the mobile app
4. Test the complete flow:
   - Splash screen loads for 3 seconds
   - Login with existing credentials or signup as new user
   - Navigate through user-specific home screen

## Troubleshooting

### Common Issues

1. **Network Error**: Make sure backend is running and API URL is correct
2. **Dependencies Error**: Run `npm install` to install missing packages
3. **Metro bundler issues**: Clear cache with `expo start -c`

### API Connection Issues

If you can't connect to the backend:
1. Check if backend server is running on port 5000
2. Verify API URL in `src/services/api.js`
3. For physical device testing, use your computer's IP address instead of localhost

## Screenshots Flow

1. Splash Screen → Logo with "Loading..." text
2. Login Screen → Email/password form with signup link
3. User Type Screen → Choose Teacher or Student
4. Signup Screens → Comprehensive forms for each user type
5. Home Screens → Role-specific dashboards

## Build for Production

```bash
# Build for Android
expo build:android

# Build for iOS
expo build:ios
```

Make sure to configure your app.json with proper app name, version, and bundle identifier before building.
