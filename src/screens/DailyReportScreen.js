import React, { useMemo, useState } from "react";
import {
  Alert,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import Animated, { FadeInDown } from "react-native-reanimated";
import { Card } from "../components/UI";
import { useApp } from "../context/AppContext";
import { api } from "../api/client";
import { colors, radius, spacing } from "../constants/theme";

function Field({ icon, label, value, onChangeText, keyboardType, placeholder }) {
  return (
    <View style={styles.field}>
      <View style={styles.fieldLabelRow}>
        <Ionicons name={icon} size={15} color={colors.primary} />
        <Text style={styles.fieldLabel}>{label}</Text>
      </View>
      <TextInput
        value={value}
        onChangeText={onChangeText}
        keyboardType={keyboardType}
        placeholder={placeholder}
        placeholderTextColor={colors.textMuted}
        style={styles.input}
      />
    </View>
  );
}

function formatReportDate(value) {
  const date = value ? new Date(value) : new Date();
  return date.toLocaleDateString("en-US", { month: "short", day: "numeric" });
}

export default function DailyReportScreen() {
  const { activeUser, vitals, setVitals, dailyReports, setDailyReports } = useApp();
  const [heartRate, setHeartRate] = useState(String(vitals?.heartRate || ""));
  const [bloodSugar, setBloodSugar] = useState(String(vitals?.bloodSugar || ""));
  const [systolic, setSystolic] = useState(String(vitals?.bloodPressure || "120/80").split("/")[0] || "");
  const [diastolic, setDiastolic] = useState(String(vitals?.bloodPressure || "120/80").split("/")[1] || "");
  const [notes, setNotes] = useState("");
  const [saving, setSaving] = useState(false);

  const recentReports = useMemo(
    () => [...dailyReports].sort((a, b) => new Date(b.date) - new Date(a.date)).slice(0, 6),
    [dailyReports]
  );

  const saveReport = async () => {
    const nextHeartRate = Number(heartRate);
    const nextBloodSugar = Number(bloodSugar);
    const nextSystolic = Number(systolic);
    const nextDiastolic = Number(diastolic);

    if (!nextHeartRate || !nextBloodSugar || !nextSystolic || !nextDiastolic) {
      Alert.alert("Missing report", "Please enter heart rate, blood pressure, and blood sugar.");
      return;
    }

    const bloodPressure = `${nextSystolic}/${nextDiastolic}`;
    setSaving(true);

    try {
      const data = await api.createDailyReport(activeUser._id, {
        heartRate: nextHeartRate,
        bloodPressure,
        bloodSugar: nextBloodSugar,
        notes: notes.trim(),
      });
      setDailyReports((prev) => [...prev, data.report]);
      setVitals({
        ...vitals,
        heartRate: data.report.heartRate,
        bloodPressure: data.report.bloodPressure,
        bloodSugar: data.report.bloodSugar,
      });
      setNotes("");
      Alert.alert("Saved", "Your daily report has been saved for future use.");
    } catch (e) {
      Alert.alert("Could not save", e.message);
    } finally {
      setSaving(false);
    }
  };

  return (
    <KeyboardAvoidingView style={styles.container} behavior={Platform.OS === "ios" ? "padding" : undefined}>
      <ScrollView contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
        <Animated.View entering={FadeInDown.duration(350)} style={styles.hero}>
          <View style={styles.heroIcon}>
            <Ionicons name="add" size={26} color="#fff" />
          </View>
          <View style={{ flex: 1 }}>
            <Text style={styles.heroTitle}>Daily health report</Text>
            <Text style={styles.heroSub}>Save BP, sugar, and heart rate for later review.</Text>
          </View>
        </Animated.View>

        <Animated.View entering={FadeInDown.delay(100).duration(350)}>
          <Card style={styles.formCard}>
            <View style={styles.grid}>
              <Field
                icon="pulse"
                label="Heart rate"
                value={heartRate}
                onChangeText={setHeartRate}
                keyboardType="number-pad"
                placeholder="72"
              />
              <Field
                icon="water"
                label="Blood sugar"
                value={bloodSugar}
                onChangeText={setBloodSugar}
                keyboardType="number-pad"
                placeholder="94"
              />
            </View>

            <Text style={styles.groupLabel}>Blood pressure</Text>
            <View style={styles.bpRow}>
              <TextInput
                value={systolic}
                onChangeText={setSystolic}
                keyboardType="number-pad"
                placeholder="120"
                placeholderTextColor={colors.textMuted}
                style={[styles.input, styles.bpInput]}
              />
              <Text style={styles.bpSlash}>/</Text>
              <TextInput
                value={diastolic}
                onChangeText={setDiastolic}
                keyboardType="number-pad"
                placeholder="80"
                placeholderTextColor={colors.textMuted}
                style={[styles.input, styles.bpInput]}
              />
            </View>

            <View style={styles.field}>
              <View style={styles.fieldLabelRow}>
                <Ionicons name="document-text-outline" size={15} color={colors.primary} />
                <Text style={styles.fieldLabel}>Notes</Text>
              </View>
              <TextInput
                value={notes}
                onChangeText={setNotes}
                placeholder="Symptoms, food timing, medication, or anything important"
                placeholderTextColor={colors.textMuted}
                multiline
                style={[styles.input, styles.notes]}
              />
            </View>

            <TouchableOpacity style={[styles.saveBtn, saving && styles.saveBtnDisabled]} onPress={saveReport} disabled={saving}>
              <Ionicons name="save-outline" size={18} color="#fff" />
              <Text style={styles.saveText}>{saving ? "Saving..." : "Save report"}</Text>
            </TouchableOpacity>
          </Card>
        </Animated.View>

        <Animated.View entering={FadeInDown.delay(200).duration(350)}>
          <Card style={styles.historyCard}>
            <Text style={styles.sectionTitle}>Saved reports</Text>
            {recentReports.length === 0 ? (
              <Text style={styles.emptyText}>No daily reports yet.</Text>
            ) : (
              recentReports.map((report) => (
                <View key={report._id} style={styles.reportRow}>
                  <View style={styles.dateBadge}>
                    <Text style={styles.dateText}>{formatReportDate(report.date)}</Text>
                  </View>
                  <View style={{ flex: 1 }}>
                    <Text style={styles.reportVitals}>
                      {report.bloodPressure} BP - {report.bloodSugar} mg/dL - {report.heartRate} bpm
                    </Text>
                    {report.notes ? <Text style={styles.reportNotes}>{report.notes}</Text> : null}
                  </View>
                </View>
              ))
            )}
          </Card>
        </Animated.View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  content: { padding: spacing.md, paddingBottom: 130, gap: spacing.md },
  hero: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    padding: spacing.md,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.md,
  },
  heroIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: colors.primary,
    alignItems: "center",
    justifyContent: "center",
  },
  heroTitle: { fontSize: 18, fontWeight: "800", color: colors.text },
  heroSub: { fontSize: 11, color: colors.textMuted, marginTop: 3, lineHeight: 16 },
  formCard: { gap: spacing.md },
  grid: { flexDirection: "row", gap: spacing.sm },
  field: { flex: 1, gap: 7 },
  fieldLabelRow: { flexDirection: "row", alignItems: "center", gap: 6 },
  fieldLabel: { fontSize: 11, fontWeight: "700", color: colors.text },
  groupLabel: { fontSize: 11, fontWeight: "700", color: colors.text },
  input: {
    backgroundColor: colors.surfaceAlt,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.md,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 14,
    color: colors.text,
  },
  bpRow: { flexDirection: "row", alignItems: "center", gap: 8 },
  bpInput: { flex: 1, textAlign: "center", fontVariant: ["tabular-nums"] },
  bpSlash: { fontSize: 20, fontWeight: "800", color: colors.textMuted },
  notes: { minHeight: 86, textAlignVertical: "top", lineHeight: 19 },
  saveBtn: {
    height: 48,
    borderRadius: radius.md,
    backgroundColor: colors.primary,
    alignItems: "center",
    justifyContent: "center",
    flexDirection: "row",
    gap: 8,
  },
  saveBtnDisabled: { opacity: 0.65 },
  saveText: { color: "#fff", fontSize: 13, fontWeight: "800" },
  historyCard: { gap: 10 },
  sectionTitle: { fontSize: 14, fontWeight: "800", color: colors.text },
  emptyText: { color: colors.textMuted, fontSize: 12 },
  reportRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    paddingVertical: 10,
    borderTopWidth: 1,
    borderTopColor: colors.border,
  },
  dateBadge: {
    width: 52,
    borderRadius: radius.sm,
    backgroundColor: colors.surfaceAlt,
    borderWidth: 1,
    borderColor: colors.border,
    paddingVertical: 8,
    alignItems: "center",
  },
  dateText: { fontSize: 10, fontWeight: "800", color: colors.primary },
  reportVitals: { fontSize: 12, fontWeight: "700", color: colors.text },
  reportNotes: { fontSize: 10, color: colors.textMuted, marginTop: 3, lineHeight: 15 },
});
