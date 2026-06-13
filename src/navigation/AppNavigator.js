import React from "react";
import { TouchableOpacity, View, Text, StyleSheet } from "react-native";
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
import DailyReportScreen from "../screens/DailyReportScreen";

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

function LifeXpTabBar({ state, descriptors, navigation }) {
  return (
    <View style={styles.tabShell}>
      <TouchableOpacity
        activeOpacity={0.85}
        style={styles.assistantBar}
        onPress={() => navigation.getParent()?.navigate("ChatAssistant")}
      >
        <View style={styles.assistantIcon}>
          <Ionicons name="sparkles" size={17} color="#fff" />
        </View>
        <View style={{ flex: 1 }}>
          <Text style={styles.assistantTitle}>LifeXp AI Assistant</Text>
          <Text style={styles.assistantSub}>Ask about reports, symptoms, medicine, or trends</Text>
        </View>
        <Ionicons name="chevron-forward" size={18} color={colors.primary} />
      </TouchableOpacity>

      <View style={styles.tabRow}>
        {state.routes.map((route, index) => {
          const { options } = descriptors[route.key];
          const isFocused = state.index === index;
          const isReport = route.name === "ReportTab";
          const label = options.title || route.name;

          const onPress = () => {
            const event = navigation.emit({
              type: "tabPress",
              target: route.key,
              canPreventDefault: true,
            });

            if (!isFocused && !event.defaultPrevented) {
              navigation.navigate(route.name);
            }
          };

          return (
            <TouchableOpacity
              key={route.key}
              accessibilityRole="button"
              accessibilityState={isFocused ? { selected: true } : {}}
              activeOpacity={0.85}
              onPress={onPress}
              style={[styles.tabItem, isReport && styles.reportTabItem]}
            >
              {isReport ? (
                <View style={[styles.plusButton, isFocused && styles.plusButtonActive]}>
                  <Ionicons name="add" size={30} color="#fff" />
                </View>
              ) : (
                options.tabBarIcon?.({ focused: isFocused })
              )}
              <Text style={[styles.tabLabel, isFocused && styles.tabLabelActive]} numberOfLines={1}>
                {label}
              </Text>
            </TouchableOpacity>
          );
        })}
      </View>
    </View>
  );
}

function MainTabs({ navigation }) {
  const { dbMode } = useApp();

  return (
    <Tab.Navigator
      tabBar={(props) => <LifeXpTabBar {...props} />}
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
        name="ReportTab"
        component={DailyReportScreen}
        options={{
          title: "Report",
          tabBarIcon: ({ focused }) => <TabBarIcon name={focused ? "add-circle" : "add-circle-outline"} focused={focused} />,
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
          <Stack.Screen
            name="ChatAssistant"
            component={ChatScreen}
            options={({ navigation }) => ({
              headerTitle: "LifeXp AI",
              headerRight: () => <HeaderAlertsButton navigation={navigation} />,
            })}
          />
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
  tabShell: {
    backgroundColor: colors.surface,
    borderTopWidth: 1,
    borderTopColor: colors.border,
    paddingHorizontal: 12,
    paddingTop: 8,
    paddingBottom: 8,
  },
  assistantBar: {
    minHeight: 54,
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    paddingHorizontal: 12,
    paddingVertical: 9,
    borderRadius: 12,
    backgroundColor: colors.surfaceAlt,
    borderWidth: 1,
    borderColor: colors.border,
    marginBottom: 8,
  },
  assistantIcon: {
    width: 34,
    height: 34,
    borderRadius: 17,
    backgroundColor: colors.violet,
    alignItems: "center",
    justifyContent: "center",
  },
  assistantTitle: { fontSize: 12, fontWeight: "800", color: colors.text },
  assistantSub: { fontSize: 9, color: colors.textMuted, marginTop: 1 },
  tabRow: { height: 58, flexDirection: "row", alignItems: "center", justifyContent: "space-between" },
  tabItem: { flex: 1, alignItems: "center", justifyContent: "center", gap: 3, minWidth: 0 },
  reportTabItem: { transform: [{ translateY: -4 }] },
  plusButton: {
    width: 50,
    height: 50,
    borderRadius: 25,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: colors.primary,
    borderWidth: 4,
    borderColor: colors.surface,
  },
  plusButtonActive: { backgroundColor: colors.primaryDark },
  tabLabel: { fontSize: 9, fontWeight: "700", color: colors.textMuted, maxWidth: 72 },
  tabLabelActive: { color: colors.primary },
});
