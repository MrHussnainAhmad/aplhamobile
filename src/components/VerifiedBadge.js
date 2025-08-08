import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

const VerifiedBadge = ({ isVerified, size = 'medium', showText = true }) => {
  const sizes = {
    small: { icon: 16, text: 10, padding: 4 },
    medium: { icon: 20, text: 12, padding: 6 },
    large: { icon: 24, text: 14, padding: 8 }
  };

  const currentSize = sizes[size] || sizes.medium;

  if (!isVerified) {
    return (
      <View style={[styles.badge, styles.unverifiedBadge, { padding: currentSize.padding }]}>
        <Ionicons name="alert-circle" size={currentSize.icon} color="#FFA500" />
        {showText && (
          <Text style={[styles.badgeText, styles.unverifiedText, { fontSize: currentSize.text }]}>
            Not Verified
          </Text>
        )}
      </View>
    );
  }

  return (
    <View style={[styles.badge, styles.verifiedBadge, { padding: currentSize.padding }]}>
      <Ionicons name="checkmark-circle" size={currentSize.icon} color="#28A745" />
      {showText && (
        <Text style={[styles.badgeText, styles.verifiedText, { fontSize: currentSize.text }]}>
          Verified
        </Text>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  badge: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 20,
    gap: 4,
  },
  verifiedBadge: {
    backgroundColor: '#E8F5E9',
  },
  unverifiedBadge: {
    backgroundColor: '#FFF3E0',
  },
  badgeText: {
    fontWeight: '600',
    marginRight: 4,
  },
  verifiedText: {
    color: '#28A745',
  },
  unverifiedText: {
    color: '#FFA500',
  },
});

export default VerifiedBadge;
