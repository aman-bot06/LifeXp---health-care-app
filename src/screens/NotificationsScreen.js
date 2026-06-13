import React from "react";
import { View, Text, ScrollView, StyleSheet, TouchableOpacity, Alert } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import Animated, { FadeInDown } from "react-native-reanimated";
import { useApp } from "../context/AppContext";
import { api } from "../api/client";
import { colors, spacing, radius } from "../constants/theme";

export default function NotificationsScreen({ navigation }) {
  const { activeUser, notifications, setNotifications } = useApp();

  const clearAll = async () => {
    try {
      await api.clearNotifications(activeUser._id);
      setNotifications([]);
    } catch (e) {
      Alert.alert("Error", e.message);
    }
  };

  const dismiss = async (id) => {
    try {
      await api.deleteNotification(id);
      setNotifications((prev) => prev.filter((n) => n._id !== id));
    } catch (e) {
      Alert.alert("Error", e.message);
    }
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <View style={styles.headerRow}>
        <View>
          <Text style={styles.title}>Health Alerts</Text>
          <Text style={styles.subtitle}>Critical notifications requiring action.</Text>
        </View>
        {notifications.length > 0 ? (
          <TouchableOpacity onPress={clearAll}>
            <Text style={styles.clearBtn}>Clear All</Text>
          </TouchableOpacity>
        ) : null}
      </View>

      {notifications.length === 0 ? (
        <Animated.View entering={FadeInDown.duration(400)} style={styles.empty}>
          <Ionicons name="checkmark-circle" size={40} color={colors.success} />
          <Text style={styles.emptyTitle}>Clear Slate!</Text>
          <Text style={styles.emptyText}>No pending health anomalies detected.</Text>
        </Animated.View>
      ) : (
        notifications.map((notif, i) => {
          const isAlert = notif.type === "alert";
          return (
            <Animated.View
              key={notif._id}
              entering={FadeInDown.delay(i * 80).duration(400)}
              style={[styles.card, isAlert && styles.alertCard]}
            >
              <View style={[styles.iconBox, isAlert ? styles.alertIcon : styles.normalIcon]}>
                <Ionicons name={isAlert ? "warning" : "time"} size={18} color={isAlert ? "#fff" : colors.sky} />
              </View>
              <View style={styles.cardBody}>
                <View style={styles.cardHeader}>
                  <Text style={styles.cardTitle}>{notif.title}</Text>
                  <Text style={styles.cardTime}>{notif.createdAt}</Text>
                </View>
                <Text style={styles.cardDesc}>{notif.description}</Text>
                {isAlert ? (
                  <View style={styles.actions}>
                    <TouchableOpacity style={styles.callBtn} onPress={() => Alert.alert("Calling", "Connecting call...")}>
                      <Text style={styles.callText}>CALL NOW</Text>
                    </TouchableOpacity>
                    <TouchableOpacity style={styles.docBtn} onPress={() => navigation.navigate("MainTabs", { screen: "DoctorsTab" })}>
                      <Text style={styles.docText}>Contact Doctor</Text>
                    </TouchableOpacity>
                  </View>
                ) : null}
              </View>
              <TouchableOpacity onPress={() => dismiss(notif._id)} style={styles.dismiss}>
                <Text style={styles.dismissText}>✕</Text>
              </TouchableOpacity>
            </Animated.View>
          );
        })
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  content: { padding: spacing.md },
  headerRow: { flexDirection: "row", justifyContent: "space-between", alignItems: "flex-start", marginBottom: spacing.md },
  title: { fontSize: 17, fontWeight: "700", color: colors.text },
  subtitle: { fontSize: 12, color: colors.textMuted, marginTop: 4 },
  clearBtn: { color: colors.primary, fontSize: 11, fontWeight: "700" },
  empty: { alignItems: "center", padding: spacing.xl, backgroundColor: colors.surface, borderRadius: radius.lg, borderWidth: 1, borderColor: colors.border },
  emptyTitle: { fontSize: 14, fontWeight: "700", marginTop: 10 },
  emptyText: { fontSize: 11, color: colors.textMuted, marginTop: 4 },
  card: { flexDirection: "row", backgroundColor: colors.surface, borderRadius: radius.lg, padding: spacing.md, marginBottom: spacing.sm, borderWidth: 1, borderColor: colors.border, gap: 10 },
  alertCard: { backgroundColor: "#FFF1F2", borderColor: "#FECDD3" },
  iconBox: { width: 36, height: 36, borderRadius: radius.sm, alignItems: "center", justifyContent: "center" },
  alertIcon: { backgroundColor: colors.error },
  normalIcon: { backgroundColor: "#E0F2FE" },
  cardBody: { flex: 1 },
  cardHeader: { flexDirection: "row", justifyContent: "space-between" },
  cardTitle: { fontSize: 13, fontWeight: "700", color: colors.text, flex: 1 },
  cardTime: { fontSize: 9, color: colors.textMuted },
  cardDesc: { fontSize: 11, color: colors.textMuted, marginTop: 6, lineHeight: 16 },
  actions: { flexDirection: "row", gap: 8, marginTop: 10 },
  callBtn: { backgroundColor: colors.error, paddingHorizontal: 10, paddingVertical: 6, borderRadius: 6 },
  callText: { color: "#fff", fontSize: 9, fontWeight: "700" },
  docBtn: { borderWidth: 1, borderColor: "#FECDD3", paddingHorizontal: 10, paddingVertical: 6, borderRadius: 6 },
  docText: { color: colors.error, fontSize: 9, fontWeight: "700" },
  dismiss: { padding: 4 },
  dismissText: { color: colors.textMuted, fontSize: 14 },
});
