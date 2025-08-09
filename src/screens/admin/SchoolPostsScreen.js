import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

const SchoolPostsScreen = () => {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>School Posts Management</Text>
      <Text>This is where you will manage school announcements and posts.</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
  },
});

export default SchoolPostsScreen;
