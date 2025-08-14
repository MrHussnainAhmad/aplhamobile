import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Alert,
} from 'react-native';
import { testNetworkConnectivity, authAPI } from '../services/api';
import { getApiUrl } from '../config/api.config';

const NetworkTestScreen = () => {
  const [testResults, setTestResults] = useState([]);
  const [isLoading, setIsLoading] = useState(false);

  const addResult = (test, result) => {
    setTestResults(prev => [...prev, { test, result, timestamp: new Date().toLocaleTimeString() }]);
  };

  const runNetworkTest = async () => {
    setIsLoading(true);
    setTestResults([]);
    
    try {
      // Test 1: Basic connectivity
      addResult('Network Test', 'Starting...');
      const networkResult = await testNetworkConnectivity();
      addResult('Network Test', networkResult.success ? '✅ Success' : `❌ Failed: ${networkResult.error}`);
      
      if (networkResult.success) {
        // Test 2: Admin login
        addResult('Admin Login', 'Testing...');
        try {
          const loginResult = await authAPI.adminLogin({
            email: 'admin@gmail.com',
            password: '123457'
          });
          addResult('Admin Login', '✅ Success');
        } catch (error) {
          addResult('Admin Login', `❌ Failed: ${error.message}`);
        }
        
        // Test 3: Admin signup
        addResult('Admin Signup', 'Testing...');
        try {
          const timestamp = Date.now();
          const signupResult = await authAPI.adminSignup({
            fullname: `Test Admin ${timestamp}`,
            username: `testadmin${timestamp}`,
            email: `testadmin${timestamp}@test.com`,
            password: 'test123',
            role: 'admin'
          });
          addResult('Admin Signup', '✅ Success');
        } catch (error) {
          addResult('Admin Signup', `❌ Failed: ${error.message}`);
        }
      }
    } catch (error) {
      addResult('General Error', `❌ ${error.message}`);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Network Connectivity Test</Text>
        <Text style={styles.subtitle}>API URL: {getApiUrl()}</Text>
      </View>

      <TouchableOpacity
        style={[styles.testButton, isLoading && styles.disabledButton]}
        onPress={runNetworkTest}
        disabled={isLoading}
      >
        <Text style={styles.buttonText}>
          {isLoading ? 'Testing...' : 'Run Network Test'}
        </Text>
      </TouchableOpacity>

      <View style={styles.resultsContainer}>
        <Text style={styles.resultsTitle}>Test Results:</Text>
        {testResults.map((result, index) => (
          <View key={index} style={styles.resultItem}>
            <Text style={styles.resultTest}>{result.test}</Text>
            <Text style={styles.resultStatus}>{result.result}</Text>
            <Text style={styles.resultTime}>{result.timestamp}</Text>
          </View>
        ))}
      </View>

      <View style={styles.infoContainer}>
        <Text style={styles.infoTitle}>Troubleshooting Tips:</Text>
        <Text style={styles.infoText}>• Make sure your device is on the same WiFi network as the server</Text>
        <Text style={styles.infoText}>• Check if the server is running on port 5000</Text>
        <Text style={styles.infoText}>• Verify the IP address is correct: 192.168.3.58</Text>
        <Text style={styles.infoText}>• Try restarting the mobile app</Text>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
    padding: 20,
  },
  header: {
    alignItems: 'center',
    marginBottom: 30,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 10,
  },
  subtitle: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
  },
  testButton: {
    backgroundColor: '#3498db',
    padding: 15,
    borderRadius: 8,
    alignItems: 'center',
    marginBottom: 20,
  },
  disabledButton: {
    backgroundColor: '#bdc3c7',
  },
  buttonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
  resultsContainer: {
    backgroundColor: 'white',
    borderRadius: 8,
    padding: 15,
    marginBottom: 20,
  },
  resultsTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 10,
    color: '#333',
  },
  resultItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  resultTest: {
    flex: 2,
    fontSize: 14,
    color: '#333',
  },
  resultStatus: {
    flex: 2,
    fontSize: 14,
    fontWeight: 'bold',
  },
  resultTime: {
    flex: 1,
    fontSize: 12,
    color: '#666',
    textAlign: 'right',
  },
  infoContainer: {
    backgroundColor: '#e8f4fd',
    borderRadius: 8,
    padding: 15,
  },
  infoTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 10,
    color: '#2980b9',
  },
  infoText: {
    fontSize: 14,
    color: '#333',
    marginBottom: 5,
  },
});

export default NetworkTestScreen;
