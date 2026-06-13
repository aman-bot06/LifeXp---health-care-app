import React from "react";
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  Image,
  Alert,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import Animated, { FadeInDown } from "react-native-reanimated";
import { useApp } from "../context/AppContext";
import { api } from "../api/client";
import { colors, spacing, radius } from "../constants/theme";

export default function FamilyScreen({ navigation }) {
  const { activeUser, family, loadUserData } = useApp();

  const autoLink = async () => {
    try {
      await api.addFamily(activeUser._id, "james@email.com", "Son");
      await loadUserData(activeUser._id);
    } catch (e) {
      Alert.alert("Error", e.message);
    }
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <Animated.View entering={FadeInDown.duration(400)} style={styles.insights}>
        <View>
          <Text style={styles.insightsLabel}>FAMILY INSIGHTS</Text>
          <Text style={styles.insightsScore}>
            91 <Text style={styles.insightsMax}>/ 100</Text>
          </Text>
        </View>
        <View style={styles.insightsBadge}>
          <Text style={styles.insightsDelta}>▲ 4%</Text>
          <Text style={styles.insightsDeltaLabel}>wellness</Text>
        </View>
      </Animated.View>

      <View style={styles.row}>
        <Text style={styles.title}>Circle Connections ({family.length})</Text>
        <TouchableOpacity style={styles.addBtn} onPress={() => navigation.navigate("AddFamily")}>
          <Ionicons name="add" size={14} color="#fff" />
          <Text style={styles.addBtnText}>Add</Text>
        </TouchableOpacity>
      </View>

      {family.length === 0 ? (
        <Animated.View entering={FadeInDown.delay(100).duration(400)} style={styles.empty}>
          <Text style={styles.emptyText}>No family members in your circle.</Text>
          <TouchableOpacity style={styles.autoLinkBtn} onPress={autoLink}>
            <Text style={styles.autoLinkText}>➕ Auto-Link James (Son)</Text>
          </TouchableOpacity>
        </Animated.View>
      ) : (
        family.map((member, i) => (
          <Animated.View key={member.memberId} entering={FadeInDown.delay(i * 100).duration(400)} style={styles.memberCard}>
            <View style={styles.memberHeader}>
              <Image source={{ uri: member.avatarUrl }} style={styles.avatar} />
              <View style={{ flex: 1 }}>
                <Text style={styles.memberName}>
                  {member.fullName}{" "}
                  <Text style={styles.relationship}>{member.relationship}</Text>
                </Text>
                <Text style={styles.vitalsScore}>Vitals Score: 94%</Text>
              </View>
              <TouchableOpacity
                style={styles.viewBtn}
                onPress={() => navigation.navigate("FamilyMember", { member })}
              >
                <Text style={styles.viewBtnText}>Analytics</Text>
              </TouchableOpacity>
            </View>
            <View style={styles.miniVitals}>
              <View style={styles.miniVital}>
                <Text style={styles.miniLabel}>Heart</Text>
                <Text style={styles.miniValue}>{member.vitals?.heartRate || 72} bpm</Text>
              </View>
              <View style={styles.miniVital}>
                <Text style={styles.miniLabel}>BP</Text>
                <Text style={styles.miniValue}>{member.vitals?.bloodPressure || "120/80"}</Text>
              </View>
              <View style={styles.miniVital}>
                <Text style={styles.miniLabel}>Sugar</Text>
                <Text style={styles.miniValue}>{member.vitals?.bloodSugar || 94}</Text>
              </View>
            </View>
          </Animated.View>
        ))
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  content: { padding: spacing.md },
  insights: {
    backgroundColor: "#1C1917",
    borderRadius: radius.lg,
    padding: spacing.md,
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: spacing.md,
  },
  insightsLabel: { color: "#A8A29E", fontSize: 11, fontWeight: "600", letterSpacing: 1 },
  insightsScore: { color: "#fff", fontSize: 28, fontWeight: "700", marginTop: 4 },
  insightsMax: { fontSize: 12, color: "#34D399" },
  insightsBadge: {
    backgroundColor: "rgba(16,185,129,0.1)",
    borderWidth: 1,
    borderColor: "rgba(16,185,129,0.2)",
    borderRadius: radius.md,
    padding: 8,
    alignItems: "center",
  },
  insightsDelta: { color: "#34D399", fontSize: 12, fontWeight: "700" },
  insightsDeltaLabel: { color: "#34D399", fontSize: 8 },
  row: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: spacing.md },
  title: { fontSize: 13, fontWeight: "700", color: colors.text },
  addBtn: { flexDirection: "row", alignItems: "center", gap: 4, backgroundColor: colors.amber, paddingHorizontal: 10, paddingVertical: 6, borderRadius: radius.sm },
  addBtnText: { color: "#fff", fontSize: 10, fontWeight: "700" },
  empty: { backgroundColor: colors.surface, borderRadius: radius.lg, padding: spacing.lg, alignItems: "center", borderWidth: 1, borderColor: colors.border },
  emptyText: { fontSize: 12, color: colors.textMuted },
  autoLinkBtn: { marginTop: 12, backgroundColor: "#FEF3C7", paddingHorizontal: 14, paddingVertical: 8, borderRadius: radius.sm },
  autoLinkText: { color: colors.amber, fontSize: 11, fontWeight: "700" },
  memberCard: { backgroundColor: colors.surface, borderRadius: radius.lg, padding: spacing.md, marginBottom: spacing.md, borderWidth: 1, borderColor: colors.border },
  memberHeader: { flexDirection: "row", alignItems: "center", gap: 10 },
  avatar: { width: 44, height: 44, borderRadius: 22 },
  memberName: { fontSize: 13, fontWeight: "700", color: colors.text },
  relationship: { fontSize: 10, fontWeight: "400", color: colors.textMuted, fontStyle: "italic" },
  vitalsScore: { fontSize: 10, color: colors.primary, fontWeight: "600", marginTop: 2 },
  viewBtn: { backgroundColor: "#F5F5F4", paddingHorizontal: 10, paddingVertical: 6, borderRadius: radius.sm },
  viewBtnText: { fontSize: 10, fontWeight: "600", color: colors.text },
  miniVitals: { flexDirection: "row", gap: 8, marginTop: spacing.md, paddingTop: spacing.md, borderTopWidth: 1, borderTopColor: colors.border },
  miniVital: { flex: 1, backgroundColor: "#FAFAF9", padding: 8, borderRadius: radius.sm, alignItems: "center" },
  miniLabel: { fontSize: 9, color: colors.textMuted },
  miniValue: { fontSize: 11, fontWeight: "700", fontFamily: "monospace", marginTop: 2 },
});
