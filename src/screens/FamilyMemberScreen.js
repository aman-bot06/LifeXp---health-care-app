import React from "react";
import { Image, ScrollView, StyleSheet, Text, View } from "react-native";
import Animated, { FadeInDown } from "react-native-reanimated";
import { Button, ScreenHeader } from "../components/UI";
import { colors, radius, spacing } from "../constants/theme";

function InfoRow({ label, value }) {
  return (
    <View style={styles.detailRow}>
      <Text style={styles.detailLabel}>{label}</Text>
      <Text style={styles.detailValue}>{value}</Text>
    </View>
  );
}

export default function FamilyMemberScreen({ navigation, route }) {
  const { member } = route.params;
  const takenMeds = member.medications?.filter((med) => med.taken).length || 0;
  const reports = [...(member.dailyReports || [])].sort((a, b) => new Date(b.date) - new Date(a.date));

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <ScreenHeader title="" onBack={() => navigation.goBack()} />

      <Animated.View entering={FadeInDown.duration(400)} style={styles.profileCard}>
        <Image source={{ uri: member.avatarUrl }} style={styles.avatar} />
        <View style={{ flex: 1 }}>
          <Text style={styles.name}>{member.fullName}</Text>
          <Text style={styles.rel}>Relationship: {member.relationship}</Text>
          <Text style={styles.userId}>ID: {member.userCode || member.memberId}</Text>
          <Text style={styles.active}>Last Active: 14m ago</Text>
        </View>
      </Animated.View>

      <Animated.View entering={FadeInDown.delay(80).duration(400)} style={styles.bgCard}>
        <Text style={styles.bgTitle}>Member Details</Text>
        <InfoRow label="Username" value={member.username || "Not set"} />
        <InfoRow label="Email" value={member.email || "Hidden"} />
        <InfoRow label="Role" value={member.role || "patient"} />
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
            <Text style={styles.noteText}>{member.currentSymptoms}</Text>
          </View>
        ) : null}
      </Animated.View>

      <Animated.View entering={FadeInDown.delay(300).duration(400)} style={styles.bgCard}>
        <Text style={styles.bgTitle}>Routine Prescriptions</Text>
        <Text style={styles.bgText}>
          Taken today: <Text style={styles.bold}>{takenMeds}/{member.medications?.length || 0}</Text>
        </Text>
        {(member.medications || []).map((med) => (
          <View key={med._id} style={styles.listRow}>
            <View style={{ flex: 1 }}>
              <Text style={styles.listTitle}>{med.name} ({med.dosage})</Text>
              <Text style={styles.listSub}>{med.schedule}</Text>
            </View>
            <Text style={[styles.statusPill, med.taken && styles.statusTaken]}>{med.taken ? "Taken" : "Pending"}</Text>
          </View>
        ))}
      </Animated.View>

      <Animated.View entering={FadeInDown.delay(350).duration(400)} style={styles.bgCard}>
        <Text style={styles.bgTitle}>Care Data</Text>
        <InfoRow label="Hydration" value={`${member.water?.currentAmount || 0} / ${member.water?.targetAmount || 2.5} L`} />
        <InfoRow label="Appointments" value={String(member.appointments?.length || 0)} />
        <InfoRow label="Saved reports" value={String(reports.length)} />
        {reports.slice(0, 3).map((report) => (
          <View key={report._id} style={styles.listRow}>
            <View style={{ flex: 1 }}>
              <Text style={styles.listTitle}>{new Date(report.date).toLocaleDateString()}</Text>
              <Text style={styles.listSub}>
                {report.bloodPressure} BP - {report.bloodSugar} sugar - {report.heartRate} bpm
              </Text>
            </View>
          </View>
        ))}
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
  userId: { fontSize: 10, color: colors.textMuted, marginTop: 4, fontFamily: "monospace" },
  active: { fontSize: 10, color: colors.textMuted, marginTop: 6, backgroundColor: "#FAFAF9", alignSelf: "flex-start", paddingHorizontal: 8, paddingVertical: 4, borderRadius: radius.full },
  sectionLabel: { fontSize: 11, fontWeight: "700", color: colors.textMuted, marginBottom: 8 },
  vitalsRow: { flexDirection: "row", gap: 8, marginBottom: spacing.lg },
  vitalBox: { flex: 1, backgroundColor: colors.surface, borderRadius: radius.md, padding: 12, alignItems: "center", borderWidth: 1, borderColor: colors.border },
  vitalLabel: { fontSize: 9, color: colors.textMuted },
  vitalValue: { fontSize: 13, fontWeight: "700", fontFamily: "monospace", marginTop: 4 },
  bgCard: { backgroundColor: colors.surface, borderRadius: radius.lg, padding: spacing.md, marginBottom: spacing.lg, borderWidth: 1, borderColor: colors.border },
  bgTitle: { fontSize: 13, fontWeight: "700", marginBottom: 8, color: colors.text },
  bgText: { fontSize: 12, color: colors.textMuted },
  bold: { fontWeight: "700", color: colors.text },
  noteBox: { marginTop: 10, backgroundColor: "#FAFAF9", padding: 10, borderRadius: radius.md },
  noteText: { fontSize: 12, color: colors.textMuted },
  detailRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    gap: 12,
    paddingVertical: 9,
    borderTopWidth: 1,
    borderTopColor: colors.border,
  },
  detailLabel: { fontSize: 11, color: colors.textMuted },
  detailValue: { flex: 1, textAlign: "right", fontSize: 11, color: colors.text, fontWeight: "700" },
  listRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 10,
    paddingVertical: 10,
    borderTopWidth: 1,
    borderTopColor: colors.border,
  },
  listTitle: { fontSize: 12, fontWeight: "800", color: colors.text },
  listSub: { fontSize: 10, color: colors.textMuted, marginTop: 2 },
  statusPill: {
    fontSize: 9,
    fontWeight: "800",
    color: colors.warning,
    backgroundColor: "#FEF3C7",
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: radius.full,
  },
  statusTaken: { color: colors.success, backgroundColor: colors.successBg },
});
