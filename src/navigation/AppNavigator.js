import React, { useState, useEffect } from 'react';
import { View, StyleSheet, Pressable, ActivityIndicator } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { MaterialIcons } from '@expo/vector-icons';

// Config & Auth
import { subscribeToAuthChanges } from '../config/firebase';

// Auth Screens
import LoginScreen from '../screens/Auth/LoginScreen';
import SignupScreen from '../screens/Auth/SignupScreen';

// App Screens
import DashboardScreen from '../screens/App/DashboardScreen';
import FamilyScreen from '../screens/App/FamilyScreen';
import DoctorScreen from '../screens/App/DoctorScreen';
import AnalyticsScreen from '../screens/App/AnalyticsScreen';
import ProfileScreen from '../screens/App/ProfileScreen';

const Stack = createStackNavigator();
const Tab = createBottomTabNavigator();

// --- Auth Navigation Stack ---
function AuthStack() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="Login" component={LoginScreen} />
      <Stack.Screen name="Signup" component={SignupScreen} />
    </Stack.Navigator>
  );
}

// --- App Tab Navigation ---
function AppTabs({ onQuickAddPress }) {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        headerShown: true,
        headerStyle: {
          backgroundColor: '#fff8f3',
          borderBottomWidth: 1,
          borderBottomColor: 'rgba(129, 11, 56, 0.08)',
          shadowColor: '#810b38',
          shadowOffset: { width: 0, height: 4 },
          shadowOpacity: 0.04,
          shadowRadius: 8,
          elevation: 2,
        },
        headerTitleStyle: {
          fontWeight: '700',
          fontSize: 20,
          color: '#810b38',
          letterSpacing: -0.5,
        },
        headerTitleAlign: 'center',
        tabBarActiveTintColor: '#810b38',
        tabBarInactiveTintColor: '#6e5b47',
        tabBarStyle: {
          height: 80,
          backgroundColor: '#ffffff',
          borderTopLeftRadius: 20,
          borderTopRightRadius: 20,
          borderTopWidth: 1,
          borderTopColor: 'rgba(129, 11, 56, 0.08)',
          paddingBottom: 16,
          paddingTop: 10,
          position: 'absolute',
          bottom: 0,
          left: 0,
          right: 0,
          shadowColor: '#810b38',
          shadowOffset: { width: 0, height: -6 },
          shadowOpacity: 0.06,
          shadowRadius: 10,
          elevation: 5,
        },
        tabBarLabelStyle: {
          fontSize: 11,
          fontWeight: '600',
          marginTop: 2,
        },
        tabBarIcon: ({ color, size }) => {
          let iconName;
          if (route.name === 'Dashboard') iconName = 'dashboard';
          else if (route.name === 'Family') iconName = 'people';
          else if (route.name === 'Doctor') iconName = 'medical-services';
          else if (route.name === 'Analytics') iconName = 'analytics';
          else if (route.name === 'Profile') iconName = 'account-circle';

          return <MaterialIcons name={iconName} size={24} color={color} />;
        },
      })}
    >
      <Tab.Screen name="Dashboard" component={DashboardScreen} options={{ title: 'Dashboard' }} />
      <Tab.Screen name="Family" component={FamilyScreen} options={{ title: 'Family' }} />
      
      {/* Central Quick Add Button (Using a placeholder screen with custom button) */}
      <Tab.Screen 
        name="QuickAdd" 
        component={DashboardScreen} // fallback component
        options={{
          tabBarLabel: () => null,
          tabBarButton: () => (
            <View style={styles.fabContainer}>
              <Pressable style={styles.fab} onPress={onQuickAddPress}>
                <MaterialIcons name="add" size={30} color="#ffffff" />
              </Pressable>
            </View>
          ),
        }} 
      />

      <Tab.Screen name="Doctor" component={DoctorScreen} options={{ title: 'Doctors' }} />
      <Tab.Screen name="Analytics" component={AnalyticsScreen} options={{ title: 'Analytics' }} />
    </Tab.Navigator>
  );
}

export default function AppNavigator({ onQuickAddPress }) {
  const [currentUser, setCurrentUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = subscribeToAuthChanges((user) => {
      setCurrentUser(user);
      setLoading(false);
    });

    return unsubscribe;
  }, []);

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#810b38" />
      </View>
    );
  }

  return (
    <NavigationContainer>
      <Stack.Navigator screenOptions={{ headerShown: false }}>
        {currentUser ? (
          <Stack.Screen name="AppHome">
            {props => <AppTabs {...props} onQuickAddPress={onQuickAddPress} />}
          </Stack.Screen>
        ) : (
          <Stack.Screen name="Auth" component={AuthStack} />
        )}
      </Stack.Navigator>
    </NavigationContainer>
  );
}

const styles = StyleSheet.create({
  loadingContainer: {
    flex: 1,
    backgroundColor: '#fff8f3',
    justifyContent: 'center',
    alignItems: 'center',
  },
  fabContainer: {
    top: -24,
    justifyContent: 'center',
    alignItems: 'center',
    width: 68,
    height: 68,
  },
  fab: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: '#810b38',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 4,
    borderColor: '#fff8f3',
    shadowColor: '#810b38',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.3,
    shadowRadius: 10,
    elevation: 6,
  },
});
