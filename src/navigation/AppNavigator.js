import React from "react";
import { TouchableOpacity, View, StyleSheet } from "react-native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { Ionicons } from "@expo/vector-icons";
import { useApp } from "../context/AppContext";
import { colors } from "../constants/theme";

import LoginScreen from "../screens/LoginScreen";
import AuthHandlerScreen from "../screens/AuthHandlerScreen";
import AccountSelectScreen from "../screens/AccountSelectScreen";
import RegisterDoctorScreen from "../screens/RegisterDoctorScreen";
import RegisterPatientAccountScreen from "../screens/RegisterPatientAccountScreen";
import RegisterPatientStatsScreen from "../screens/RegisterPatientStatsScreen";
import RegisterPatientPhotoScreen from "../screens/RegisterPatientPhotoScreen";
import DashboardScreen from "../screens/DashboardScreen";
import FamilyScreen from "../screens/FamilyScreen";
import AddFamilyScreen from "../screens/AddFamilyScreen";
import FamilyMemberScreen from "../screens/FamilyMemberScreen";
import DoctorsScreen from "../screens/DoctorsScreen";
import ChatScreen from "../screens/ChatScreen";
import NotificationsScreen from "../screens/NotificationsScreen";
import AnalyticsScreen from "../screens/AnalyticsScreen";

const Stack = createNativeStackNavigator();
const Tab = createBottomTabNavigator();

function TabBarIcon({ name, focused, badge }) {
  return (
    <View>
      <Ionicons name={name} size={22} color={focused ? colors.primary : colors.textMuted} />
      {badge ? <View style={styles.badge} /> : null}
    </View>
  );
}

function HeaderAlertsButton({ navigation }) {
  const { notifications } = useApp();
  return (
    <TouchableOpacity onPress={() => navigation.navigate("Notifications")} style={styles.headerIconBtn}>
      <Ionicons name="notifications-outline" size={20} color={colors.primary} />
      {notifications.length > 0 ? <View style={styles.headerBadge} /> : null}
    </TouchableOpacity>
  );
}

function HeaderLogoutButton() {
  const { logout } = useApp();
  return (
    <TouchableOpacity onPress={logout} style={styles.headerIconBtn}>
      <Ionicons name="log-out-outline" size={20} color={colors.primary} />
    </TouchableOpacity>
  );
}

function MainTabs({ navigation }) {
  const { dbMode } = useApp();

  return (
    <Tab.Navigator
      screenOptions={{
        headerStyle: { backgroundColor: colors.surface },
        headerTintColor: colors.text,
        headerTitleStyle: { fontWeight: "700", fontSize: 16 },
        headerTitle: "LifeXp",
        headerRight: () => <HeaderAlertsButton navigation={navigation} />,
        tabBarStyle: { backgroundColor: colors.surface, borderTopColor: colors.border, height: 60, paddingBottom: 8 },
        tabBarActiveTintColor: colors.primary,
        tabBarInactiveTintColor: colors.textMuted,
        tabBarLabelStyle: { fontSize: 9, fontWeight: "700" },
      }}
    >
      <Tab.Screen
        name="DashboardTab"
        component={DashboardScreen}
        options={{
          title: "Dashboard",
          tabBarIcon: ({ focused }) => <TabBarIcon name={focused ? "pulse" : "pulse-outline"} focused={focused} />,
          headerRight: () => (
            <View style={styles.headerActions}>
              <HeaderAlertsButton navigation={navigation} />
              <HeaderLogoutButton />
            </View>
          ),
          headerSubtitle: dbMode,
        }}
      />
      <Tab.Screen
        name="FamilyTab"
        component={FamilyScreen}
        options={{
          title: "Family",
          tabBarIcon: ({ focused }) => <TabBarIcon name={focused ? "people" : "people-outline"} focused={focused} />,
        }}
      />
      <Tab.Screen
        name="DoctorsTab"
        component={DoctorsScreen}
        options={{
          title: "Specialists",
          tabBarIcon: ({ focused }) => <TabBarIcon name={focused ? "search" : "search-outline"} focused={focused} />,
        }}
      />
      <Tab.Screen
        name="ChatTab"
        component={ChatScreen}
        options={{
          title: "Lifexp AI",
          tabBarIcon: ({ focused }) => <TabBarIcon name={focused ? "sparkles" : "sparkles-outline"} focused={focused} />,
        }}
      />
      <Tab.Screen
        name="AnalyticsTab"
        component={AnalyticsScreen}
        options={{
          title: "Analytics",
          tabBarIcon: ({ focused }) => <TabBarIcon name={focused ? "analytics" : "analytics-outline"} focused={focused} />,
        }}
      />
    </Tab.Navigator>
  );
}

export default function AppNavigator() {
  const { activeUser } = useApp();

  return (
    <Stack.Navigator
      screenOptions={{
        headerShown: true,
        headerStyle: { backgroundColor: colors.background },
        headerTintColor: colors.text,
        headerTitle: "LifeXp",
        contentStyle: { backgroundColor: colors.background },
      }}
    >
      {!activeUser ? (
        <>
          <Stack.Screen name="Login" component={LoginScreen} options={{ headerShown: false }} />
          <Stack.Screen name="AuthHandler" component={AuthHandlerScreen} options={{ headerShown: false }} />
          <Stack.Screen name="AccountSelect" component={AccountSelectScreen} />
          <Stack.Screen name="RegisterDoctor" component={RegisterDoctorScreen} />
          <Stack.Screen name="RegisterPatientAccount" component={RegisterPatientAccountScreen} />
          <Stack.Screen name="RegisterPatientStats" component={RegisterPatientStatsScreen} />
          <Stack.Screen name="RegisterPatientPhoto" component={RegisterPatientPhotoScreen} />
        </>
      ) : (
        <>
          <Stack.Screen name="MainTabs" component={MainTabs} options={{ headerShown: false }} />
          <Stack.Screen
            name="AddFamily"
            component={AddFamilyScreen}
            options={({ navigation }) => ({
              headerTitle: "LifeXp",
              headerRight: () => <HeaderAlertsButton navigation={navigation} />,
            })}
          />
          <Stack.Screen
            name="FamilyMember"
            component={FamilyMemberScreen}
            options={({ navigation }) => ({
              headerTitle: "LifeXp",
              headerRight: () => <HeaderAlertsButton navigation={navigation} />,
            })}
          />
          <Stack.Screen name="Notifications" component={NotificationsScreen} />
        </>
      )}
    </Stack.Navigator>
  );
}

const styles = StyleSheet.create({
  badge: {
    position: "absolute",
    top: -2,
    right: -4,
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: colors.error,
  },
  headerActions: { flexDirection: "row", alignItems: "center", marginRight: 8 },
  headerIconBtn: { width: 36, height: 36, alignItems: "center", justifyContent: "center" },
  headerBadge: {
    position: "absolute",
    top: 7,
    right: 7,
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: colors.error,
  },
  logoutBtn: { marginRight: 12 },
});
