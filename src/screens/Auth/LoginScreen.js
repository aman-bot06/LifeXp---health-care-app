import React, { useState } from 'react';
import { StyleSheet, Text, View, Pressable, ScrollView, KeyboardAvoidingView, Platform, ActivityIndicator } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import Input from '../../components/Input';
import Button from '../../components/Button';
import { signInUser } from '../../config/firebase';

export default function LoginScreen({ navigation }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleLogin = async () => {
    if (!email || !password) {
      setError('Please fill in all fields');
      return;
    }
    setError('');
    setLoading(true);
    try {
      await signInUser(email, password);
      // Auth listener in AppNavigator handles transition
    } catch (err) {
      setError(err.message || 'Incorrect email or password');
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

        {/* Welcome Text */}
        <View style={styles.headerContainer}>
          <Text style={styles.title}>Welcome Back</Text>
          <Text style={styles.subtitle}>Please enter your credentials to access your dashboard.</Text>
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
            label="Email Address"
            placeholder="e.g. alex.care@email.com"
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

          <Pressable style={styles.forgotBtn}>
            <Text style={styles.forgotText}>Forgot password?</Text>
          </Pressable>

          {loading ? (
            <ActivityIndicator size="large" color="#810b38" style={styles.loader} />
          ) : (
            <Button
              title="Login"
              onPress={handleLogin}
              style={styles.submitBtn}
            />
          )}
        </View>

        {/* Footer Link */}
        <View style={styles.footer}>
          <Text style={styles.footerText}>Don't have an account?</Text>
          <Pressable onPress={() => navigation.navigate('Signup')}>
            <Text style={styles.signupText}>Create a new account</Text>
          </Pressable>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff8f3', // background / surface
  },
  scrollContainer: {
    flexGrow: 1,
    paddingHorizontal: 24,
    paddingBottom: 40,
    justifyContent: 'center',
  },
  brandContainer: {
    alignItems: 'center',
    marginBottom: 40,
    marginTop: 60,
  },
  brandName: {
    fontSize: 36,
    fontWeight: '700',
    color: '#810b38', // primary container
    letterSpacing: -1,
  },
  brandTagline: {
    fontSize: 14,
    color: '#574145', // on-surface-variant
    marginTop: 4,
  },
  headerContainer: {
    marginBottom: 28,
  },
  title: {
    fontSize: 28,
    fontWeight: '700',
    color: '#221a10', // on-surface
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 15,
    color: '#574145',
    lineHeight: 22,
  },
  formContainer: {
    width: '100%',
  },
  errorContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#ffdad6', // error-container
    padding: 12,
    borderRadius: 12,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: '#ba1a1a',
  },
  errorText: {
    color: '#93000a', // on-error-container
    marginLeft: 8,
    fontSize: 14,
    fontWeight: '500',
    flex: 1,
  },
  forgotBtn: {
    alignSelf: 'flex-end',
    marginBottom: 24,
  },
  forgotText: {
    color: '#8a143e', // on-primary-fixed-variant
    fontSize: 14,
    fontWeight: '600',
  },
  submitBtn: {
    marginTop: 8,
  },
  loader: {
    marginVertical: 16,
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 40,
  },
  footerText: {
    color: '#574145',
    fontSize: 14,
  },
  signupText: {
    color: '#8a143e',
    fontSize: 14,
    fontWeight: '600',
    marginLeft: 6,
  },
});
