import React, { useState } from 'react';
import { StyleSheet, Text, View, Pressable, ScrollView, KeyboardAvoidingView, Platform, ActivityIndicator } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import Input from '../../components/Input';
import Button from '../../components/Button';
import { signUpUser } from '../../config/firebase';

export default function SignupScreen({ navigation }) {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSignup = async () => {
    if (!name || !email || !password || !confirmPassword) {
      setError('Please fill in all fields');
      return;
    }
    if (password !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }
    if (password.length < 6) {
      setError('Password should be at least 6 characters');
      return;
    }

    setError('');
    setLoading(true);
    try {
      await signUpUser(email, password, name);
      // Auth listener in AppNavigator handles transition
    } catch (err) {
      setError(err.message || 'Failed to create account');
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView 
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={styles.container}
    >
      <ScrollView contentContainerStyle={styles.scrollContainer} keyboardShouldPersistTaps="handled">
        {/* Brand Header */}
        <View style={styles.brandContainer}>
          <Text style={styles.brandName}>Lifexp</Text>
          <Text style={styles.brandTagline}>Human-Centric Health Management</Text>
        </View>

        {/* Signup Header */}
        <View style={styles.headerContainer}>
          <Text style={styles.title}>Create Account</Text>
          <Text style={styles.subtitle}>Join Lifexp to monitor your health and family records in real-time.</Text>
        </View>

        {/* Form Fields */}
        <View style={styles.formContainer}>
          {error ? (
            <View style={styles.errorContainer}>
              <MaterialIcons name="error-outline" size={20} color="#ba1a1a" />
              <Text style={styles.errorText}>{error}</Text>
            </View>
          ) : null}

          <Input
            label="Full Name"
            placeholder="e.g. Sarah Jenkins"
            icon="person"
            value={name}
            onChangeText={setName}
            autoCapitalize="words"
          />

          <Input
            label="Email Address"
            placeholder="e.g. sarah.j@email.com"
            icon="alternate-email"
            value={email}
            onChangeText={setEmail}
            keyboardType="email-address"
            autoCapitalize="none"
          />

          <Input
            label="Password"
            placeholder="••••••••"
            secureTextEntry
            value={password}
            onChangeText={setPassword}
            autoCapitalize="none"
          />

          <Input
            label="Confirm Password"
            placeholder="••••••••"
            secureTextEntry
            value={confirmPassword}
            onChangeText={setConfirmPassword}
            autoCapitalize="none"
          />

          {loading ? (
            <ActivityIndicator size="large" color="#810b38" style={styles.loader} />
          ) : (
            <Button
              title="Register"
              onPress={handleSignup}
              style={styles.submitBtn}
            />
          )}
        </View>

        {/* Footer Link */}
        <View style={styles.footer}>
          <Text style={styles.footerText}>Already have an account?</Text>
          <Pressable onPress={() => navigation.navigate('Login')}>
            <Text style={styles.loginText}>Sign in</Text>
          </Pressable>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff8f3',
  },
  scrollContainer: {
    flexGrow: 1,
    paddingHorizontal: 24,
    paddingBottom: 40,
    justifyContent: 'center',
  },
  brandContainer: {
    alignItems: 'center',
    marginBottom: 24,
    marginTop: 40,
  },
  brandName: {
    fontSize: 32,
    fontWeight: '700',
    color: '#810b38',
    letterSpacing: -1,
  },
  brandTagline: {
    fontSize: 13,
    color: '#574145',
    marginTop: 4,
  },
  headerContainer: {
    marginBottom: 24,
  },
  title: {
    fontSize: 26,
    fontWeight: '700',
    color: '#221a10',
    marginBottom: 6,
  },
  subtitle: {
    fontSize: 14,
    color: '#574145',
    lineHeight: 20,
  },
  formContainer: {
    width: '100%',
  },
  errorContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#ffdad6',
    padding: 12,
    borderRadius: 12,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: '#ba1a1a',
  },
  errorText: {
    color: '#93000a',
    marginLeft: 8,
    fontSize: 14,
    fontWeight: '500',
    flex: 1,
  },
  submitBtn: {
    marginTop: 16,
  },
  loader: {
    marginVertical: 16,
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 32,
  },
  footerText: {
    color: '#574145',
    fontSize: 14,
  },
  loginText: {
    color: '#8a143e',
    fontSize: 14,
    fontWeight: '600',
    marginLeft: 6,
  },
});
