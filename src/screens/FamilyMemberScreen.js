import React from "react";
import { View, Text, ScrollView, StyleSheet, TouchableOpacity, Image } from "react-native";
import Animated, { FadeInDown } from "react-native-reanimated";
import { ScreenHeader, Button } from "../components/UI";
import { colors, spacing, radius } from "../constants/theme";

export default function FamilyMemberScreen({ navigation, route }) {
  const { member } = route.params;

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <ScreenHeader title="" onBack={() => navigation.goBack()} />

      <Animated.View entering={FadeInDown.duration(400)} style={styles.profileCard}>
        <Image source={{ uri: member.avatarUrl }} style={styles.avatar} />
        <View>
          <Text style={styles.name}>{member.fullName}</Text>
          <Text style={styles.rel}>Relationship: {member.relationship}</Text>
          <Text style={styles.active}>Last Active: 14m ago</Text>
        </View>
      </Animated.View>

      <Text style={styles.sectionLabel}>VITAL SIGNS LOG</Text>
      <View style={styles.vitalsRow}>
        {[
          { label: "Heart Rate", value: `${member.vitals?.heartRate || 72} BPM` },
          { label: "Blood Pr.", value: member.vitals?.bloodPressure || "120/80" },
          { label: "Sugar", value: `${member.vitals?.bloodSugar || 94} mg/dL` },
        ].map((v, i) => (
          <Animated.View key={v.label} entering={FadeInDown.delay(i * 80).duration(400)} style={styles.vitalBox}>
            <Text style={styles.vitalLabel}>{v.label}</Text>
            <Text style={styles.vitalValue}>{v.value}</Text>
          </Animated.View>
        ))}
      </View>

      <Animated.View entering={FadeInDown.delay(250).duration(400)} style={styles.bgCard}>
        <Text style={styles.bgTitle}>Health Background</Text>
        <Text style={styles.bgText}>
          Conditions: <Text style={styles.bold}>{member.healthIssues?.join(", ") || "None"}</Text>
        </Text>
        {member.currentSymptoms ? (
          <View style={styles.noteBox}>
            <Text style={styles.noteText}>💬 {member.currentSymptoms}</Text>
          </View>
        ) : null}
      </Animated.View>

      <Button
        title={`Consult for ${member.fullName.split(" ")[0]}`}
        onPress={() => navigation.navigate("MainTabs", { screen: "DoctorsTab" })}
      />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  content: { padding: spacing.lg },
  profileCard: { flexDirection: "row", gap: 14, backgroundColor: colors.surface, padding: spacing.md, borderRadius: radius.lg, borderWidth: 1, borderColor: colors.border, marginBottom: spacing.lg },
  avatar: { width: 56, height: 56, borderRadius: 28 },
  name: { fontSize: 16, fontWeight: "700", color: colors.text },
  rel: { fontSize: 11, color: colors.primary, fontWeight: "700", marginTop: 4 },
  active: { fontSize: 10, color: colors.textMuted, marginTop: 6, backgroundColor: "#FAFAF9", alignSelf: "flex-start", paddingHorizontal: 8, paddingVertical: 4, borderRadius: radius.full },
  sectionLabel: { fontSize: 11, fontWeight: "700", color: colors.textMuted, marginBottom: 8 },
  vitalsRow: { flexDirection: "row", gap: 8, marginBottom: spacing.lg },
  vitalBox: { flex: 1, backgroundColor: colors.surface, borderRadius: radius.md, padding: 12, alignItems: "center", borderWidth: 1, borderColor: colors.border },
  vitalLabel: { fontSize: 9, color: colors.textMuted },
  vitalValue: { fontSize: 13, fontWeight: "700", fontFamily: "monospace", marginTop: 4 },
  bgCard: { backgroundColor: colors.surface, borderRadius: radius.lg, padding: spacing.md, marginBottom: spacing.lg, borderWidth: 1, borderColor: colors.border },
  bgTitle: { fontSize: 13, fontWeight: "700", marginBottom: 8 },
  bgText: { fontSize: 12, color: colors.textMuted },
  bold: { fontWeight: "700", color: colors.text },
  noteBox: { marginTop: 10, backgroundColor: "#FAFAF9", padding: 10, borderRadius: radius.md },
  noteText: { fontSize: 12, color: colors.textMuted },
});
