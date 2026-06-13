import React, { useMemo, useState } from "react";
import { Alert, Platform, ScrollView, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import * as Print from "expo-print";
import * as Sharing from "expo-sharing";
import { useApp } from "../context/AppContext";
import { colors, radius, spacing } from "../constants/theme";

const RANGES = [
  { key: "today", label: "Today", days: 1 },
  { key: "yesterday", label: "Yesterday", days: 1 },
  { key: "7d", label: "7 Day", days: 7 },
  { key: "1m", label: "1 Month", days: 30 },
  { key: "1y", label: "1 Year", days: 365 },
];

function escapeHtml(value) {
  return String(value ?? "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

function buildReportHtml({ user, range, report }) {
  const medicationRows = report.medications
    .map(
      (med) => `
        <tr>
          <td>${escapeHtml(med.name)}</td>
          <td>${escapeHtml(med.dosage)}</td>
          <td>${escapeHtml(med.schedule)}</td>
          <td>${med.taken ? "Taken" : "Pending"}</td>
        </tr>
      `
    )
    .join("");

  return `
    <html>
      <head>
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <style>
          body { font-family: Arial, sans-serif; color: #1C1917; padding: 28px; }
          h1 { color: #800020; margin-bottom: 4px; }
          h2 { margin-top: 24px; border-bottom: 1px solid #E7E5E4; padding-bottom: 8px; }
          .muted { color: #78716C; font-size: 12px; }
          .grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 12px; margin-top: 18px; }
          .card { border: 1px solid #E7E5E4; border-radius: 10px; padding: 14px; background: #FCF8F5; }
          .value { font-size: 22px; font-weight: 700; margin-top: 8px; }
          table { border-collapse: collapse; width: 100%; margin-top: 10px; }
          td, th { border: 1px solid #E7E5E4; padding: 8px; text-align: left; font-size: 12px; }
          th { background: #F0E6DF; }
        </style>
      </head>
      <body>
        <h1>Lifexp Health Report</h1>
        <div class="muted">${escapeHtml(user?.fullName)} - ${escapeHtml(range.label)} - Generated ${escapeHtml(new Date().toLocaleString())}</div>
        <div class="grid">
          <div class="card"><div>Heart Rate</div><div class="value">${escapeHtml(report.heartRate)} bpm</div></div>
          <div class="card"><div>Blood Pressure</div><div class="value">${escapeHtml(report.bloodPressure)}</div></div>
          <div class="card"><div>Blood Sugar</div><div class="value">${escapeHtml(report.bloodSugar)} mg/dL</div></div>
        </div>
        <h2>Summary</h2>
        <p>${escapeHtml(report.summary)}</p>
        <h2>Hydration</h2>
        <p>${escapeHtml(report.water.currentAmount)}L of ${escapeHtml(report.water.targetAmount)}L target. ${escapeHtml(report.water.logsCount)} water logs counted for this report.</p>
        <h2>Medication Schedule</h2>
        <table>
          <tr><th>Name</th><th>Dosage</th><th>Schedule</th><th>Status</th></tr>
          ${medicationRows || "<tr><td colspan='4'>No medications recorded.</td></tr>"}
        </table>
        <h2>Care Activity</h2>
        <p>Appointments: ${report.appointmentsCount}</p>
        <p>Notifications: ${report.notificationsCount}</p>
      </body>
    </html>
  `;
}

export default function AnalyticsScreen() {
  const { activeUser, vitals, medications, water, appointments, notifications } = useApp();
  const [selectedRange, setSelectedRange] = useState(RANGES[0]);
  const [working, setWorking] = useState(false);

  const report = useMemo(() => {
    const takenCount = medications.filter((med) => med.taken).length;
    const medCount = medications.length;
    const waterAmount = Number(water.currentAmount || 0);
    const waterTarget = Number(water.targetAmount || 2.5);
    const hydrationPercent = waterTarget ? Math.min(100, Math.round((waterAmount / waterTarget) * 100)) : 0;
    const periodLabel = selectedRange.key === "yesterday" ? "yesterday" : `the last ${selectedRange.label.toLowerCase()}`;

    return {
      heartRate: vitals.heartRate || 72,
      bloodPressure: vitals.bloodPressure || "120/80",
      bloodSugar: vitals.bloodSugar || 94,
      medications,
      water: {
        currentAmount: waterAmount,
        targetAmount: waterTarget,
        logsCount: water.logsCount || 0,
      },
      medicationScore: medCount ? Math.round((takenCount / medCount) * 100) : 0,
      hydrationPercent,
      appointmentsCount: appointments.length,
      notificationsCount: notifications.length,
      summary: `For ${periodLabel}, vitals are based on the latest Lifexp readings. Medication completion is ${medCount ? `${takenCount}/${medCount}` : "not yet recorded"} and hydration progress is ${hydrationPercent}%.`,
    };
  }, [appointments.length, medications, notifications.length, selectedRange, vitals, water]);

  const createPdf = async (mode) => {
    setWorking(true);
    try {
      const html = buildReportHtml({ user: activeUser, range: selectedRange, report });
      const result = await Print.printToFileAsync({ html, base64: Platform.OS === "web" });
      const { uri, base64 } = result;

      if (mode === "share") {
        const available = await Sharing.isAvailableAsync();
        if (!available) {
          Alert.alert("Sharing unavailable", `PDF created at ${uri}`);
          return;
        }
        await Sharing.shareAsync(uri, { mimeType: "application/pdf", dialogTitle: "Share Lifexp report" });
        return;
      }

      if (Platform.OS === "web") {
        if (base64 && typeof document !== "undefined") {
          const link = document.createElement("a");
          link.href = `data:application/pdf;base64,${base64}`;
          link.download = `lifexp-${selectedRange.key}-report.pdf`;
          link.click();
          return;
        }
        Alert.alert("PDF ready", "The browser print dialog opened for your report.");
      } else {
        Alert.alert("PDF downloaded", `Report saved at ${uri}`);
      }
    } catch (e) {
      Alert.alert("PDF failed", e.message);
    } finally {
      setWorking(false);
    }
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <Text style={styles.title}>Health Analytics</Text>
      <Text style={styles.subtitle}>Review trends and export a care report.</Text>

      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.rangeScroller}>
        {RANGES.map((range) => (
          <TouchableOpacity
            key={range.key}
            style={[styles.rangeChip, selectedRange.key === range.key && styles.rangeChipActive]}
            onPress={() => setSelectedRange(range)}
          >
            <Text style={[styles.rangeText, selectedRange.key === range.key && styles.rangeTextActive]}>{range.label}</Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      <View style={styles.metricGrid}>
        <View style={styles.metricCard}>
          <Ionicons name="pulse" size={18} color="#F43F5E" />
          <Text style={styles.metricValue}>{report.heartRate}</Text>
          <Text style={styles.metricLabel}>Heart bpm</Text>
        </View>
        <View style={styles.metricCard}>
          <Ionicons name="heart" size={18} color={colors.success} />
          <Text style={styles.metricValue}>{report.bloodPressure}</Text>
          <Text style={styles.metricLabel}>Blood pressure</Text>
        </View>
        <View style={styles.metricCard}>
          <Ionicons name="water" size={18} color={colors.sky} />
          <Text style={styles.metricValue}>{report.hydrationPercent}%</Text>
          <Text style={styles.metricLabel}>Hydration</Text>
        </View>
      </View>

      <View style={styles.reportCard}>
        <Text style={styles.cardTitle}>{selectedRange.label} Report</Text>
        <Text style={styles.summary}>{report.summary}</Text>
        <View style={styles.reportRow}>
          <Text style={styles.rowLabel}>Medication completion</Text>
          <Text style={styles.rowValue}>{report.medicationScore}%</Text>
        </View>
        <View style={styles.reportRow}>
          <Text style={styles.rowLabel}>Appointments</Text>
          <Text style={styles.rowValue}>{report.appointmentsCount}</Text>
        </View>
        <View style={styles.reportRow}>
          <Text style={styles.rowLabel}>Notifications</Text>
          <Text style={styles.rowValue}>{report.notificationsCount}</Text>
        </View>
      </View>

      <View style={styles.actions}>
        <TouchableOpacity style={styles.actionBtn} onPress={() => createPdf("download")} disabled={working}>
          <Ionicons name="download" size={16} color="#fff" />
          <Text style={styles.actionText}>{working ? "Preparing..." : "Download PDF"}</Text>
        </TouchableOpacity>
        <TouchableOpacity style={[styles.actionBtn, styles.shareBtn]} onPress={() => createPdf("share")} disabled={working}>
          <Ionicons name="share-social" size={16} color="#fff" />
          <Text style={styles.actionText}>Share PDF</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  content: { padding: spacing.md, paddingBottom: spacing.xl },
  title: { fontSize: 18, fontWeight: "800", color: colors.text },
  subtitle: { fontSize: 12, color: colors.textMuted, marginTop: 4, marginBottom: spacing.md },
  rangeScroller: { marginBottom: spacing.md },
  rangeChip: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: radius.full,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    marginRight: 8,
  },
  rangeChipActive: { backgroundColor: colors.primary, borderColor: colors.primary },
  rangeText: { fontSize: 11, fontWeight: "700", color: colors.textMuted },
  rangeTextActive: { color: "#fff" },
  metricGrid: { flexDirection: "row", gap: 8, marginBottom: spacing.md },
  metricCard: {
    flex: 1,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.md,
    padding: 10,
  },
  metricValue: { fontSize: 16, fontWeight: "800", color: colors.text, marginTop: 8 },
  metricLabel: { fontSize: 9, color: colors.textMuted, marginTop: 2 },
  reportCard: {
    backgroundColor: colors.surface,
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: colors.border,
    padding: spacing.md,
    marginBottom: spacing.md,
  },
  cardTitle: { fontSize: 14, fontWeight: "800", color: colors.text },
  summary: { fontSize: 12, lineHeight: 18, color: colors.textMuted, marginVertical: spacing.md },
  reportRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingVertical: 10,
    borderTopWidth: 1,
    borderTopColor: colors.border,
  },
  rowLabel: { fontSize: 12, color: colors.textMuted },
  rowValue: { fontSize: 12, fontWeight: "800", color: colors.text },
  actions: { flexDirection: "row", gap: spacing.sm },
  actionBtn: {
    flex: 1,
    minHeight: 44,
    borderRadius: radius.md,
    backgroundColor: colors.primary,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 6,
  },
  shareBtn: { backgroundColor: colors.amber },
  actionText: { color: "#fff", fontSize: 12, fontWeight: "800" },
});
