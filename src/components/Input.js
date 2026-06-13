import React, { useState } from 'react';
import { View, Text, TextInput, StyleSheet, Pressable } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';

export default function Input({ label, icon, placeholder, value, onChangeText, secureTextEntry, ...props }) {
  const [isFocused, setIsFocused] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const isPassword = secureTextEntry;

  return (
    <View style={styles.container}>
      {label && <Text style={styles.label}>{label}</Text>}
      <View style={[
        styles.inputWrapper,
        isFocused && styles.focusedWrapper
      ]}>
        <TextInput
          style={styles.input}
          placeholder={placeholder}
          placeholderTextColor="#8a7175"
          value={value}
          onChangeText={onChangeText}
          secureTextEntry={isPassword && !showPassword}
          onFocus={() => setIsFocused(true)}
          onBlur={() => setIsFocused(false)}
          {...props}
        />
        {icon && !isPassword && (
          <MaterialIcons name={icon} size={20} color="#8a7175" style={styles.icon} />
        )}
        {isPassword && (
          <Pressable onPress={() => setShowPassword(!showPassword)} style={styles.iconButton}>
            <MaterialIcons 
              name={showPassword ? 'visibility-off' : 'visibility'} 
              size={20} 
              color="#8a7175" 
            />
          </Pressable>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginBottom: 16,
    width: '100%',
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    color: '#574145', // on-surface-variant
    marginBottom: 6,
    letterSpacing: 0.5,
  },
  inputWrapper: {
    height: 48,
    borderRadius: 12, // rounded-xl
    borderWidth: 1,
    borderColor: '#8a7175', // outline
    backgroundColor: '#fff1e3', // surface-container-low
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
  },
  focusedWrapper: {
    borderColor: '#810b38', // primary border
    borderWidth: 2,
  },
  input: {
    flex: 1,
    height: '100%',
    color: '#221a10', // on-surface
    fontSize: 15,
  },
  icon: {
    marginLeft: 10,
  },
  iconButton: {
    padding: 4,
    marginLeft: 6,
  },
});
