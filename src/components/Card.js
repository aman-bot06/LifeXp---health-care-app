import React from 'react';
import { View, StyleSheet, Text } from 'react-native';

export default function Card({ title, headerRight, children, style, ...props }) {
  return (
    <View style={[styles.card, style]} {...props}>
      {(title || headerRight) && (
        <View style={styles.header}>
          {title && <Text style={styles.title}>{title}</Text>}
          {headerRight && <View>{headerRight}</View>}
        </View>
      )}
      <View style={styles.content}>
        {children}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#ffffff',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: 'rgba(129, 11, 56, 0.1)',
    shadowColor: '#810b38',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.05,
    shadowRadius: 10,
    elevation: 2,
    padding: 16,
    marginBottom: 16,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  title: {
    fontSize: 18,
    fontWeight: '600',
    color: '#810b38', // primary container
  },
  content: {
    flex: 1,
  },
});
