import React, { useMemo } from "react";
import { ScrollView, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import Animated, { FadeInDown } from "react-native-reanimated";
import { Card } from "../components/UI";
import { useApp } from "../context/AppContext";
import { colors, radius, spacing } from "../constants/theme";

function formatDate(value) {
  return new Date(value || Date.now()).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

function RecommendationList({ icon, title, items, renderItem }) {
  return (
    <View style={styles.block}>
      <View style={styles.blockTitleRow}>
        <Ionicons name={icon} size={15} color={colors.primary} />
        <Text style={styles.blockTitle}>{title}</Text>
      </View>
      {items?.length ? (
        items.map((item, index) => (
          <View key={`${title}-${index}`} style={styles.recommendationRow}>
            {renderItem(item)}
          </View>
        ))
      ) : (
        <Text style={styles.emptyText}>No recommendation added.</Text>
      )}
    </View>
  );
}

export default function DoctorReportsScreen() {
  const { doctorReports, voiceAssist, setVoiceAssist, announce } = useApp();

  const sortedReports = useMemo(
    () => [...doctorReports].sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt)),
    [doctorReports]
  );

  const readReport = (report) => {
    const medicines = report.medicines?.map((med) => `${med.name} ${med.dosage}, because ${med.reason}`).join(". ");
    const workouts = report.workouts?.map((workout) => `${workout.name} for ${workout.duration}, ${workout.frequency}`).join(". ");
    const diet = report.diet?.join(", ");
    announce(`${report.title}. ${report.summary}. Medicines: ${medicines || "none"}. Workouts: ${workouts || "none"}. Diet: ${diet || "not added"}. Next review: ${report.nextReview}.`);
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <Animated.View entering={FadeInDown.duration(350)} style={styles.hero}>
        <View style={styles.heroIcon}>
          <Ionicons name="document-text" size={24} color="#fff" />
        </View>
        <View style={{ flex: 1 }}>
          <Text style={styles.heroTitle}>Doctor Reports</Text>
          <Text style={styles.heroSub}>Doctor-generated medicine, workout, and diet recommendations.</Text>
        </View>
      </Animated.View>

      <Card style={styles.voiceCard}>
        <View style={{ flex: 1 }}>
          <Text style={styles.voiceTitle}>Voice help for elders</Text>
          <Text style={styles.voiceText}>Turn on voice to read reports and guide important actions aloud.</Text>
        </View>
        <TouchableOpacity
          style={[styles.voiceToggle, voiceAssist && styles.voiceToggleOn]}
          onPress={() => {
            const next = !voiceAssist;
            setVoiceAssist(next);
            if (next) announce("Voice help is on. I will read important guidance aloud.");
          }}
        >
          <Ionicons name={voiceAssist ? "volume-high" : "volume-mute"} size={17} color={voiceAssist ? "#fff" : colors.textMuted} />
          <Text style={[styles.voiceToggleText, voiceAssist && styles.voiceToggleTextOn]}>{voiceAssist ? "On" : "Off"}</Text>
        </TouchableOpacity>
      </Card>

      {sortedReports.length === 0 ? (
        <Card>
          <Text style={styles.emptyText}>No doctor reports available yet.</Text>
        </Card>
      ) : (
        sortedReports.map((report, index) => (
          <Animated.View key={report._id} entering={FadeInDown.delay(index * 80).duration(350)}>
            <Card style={styles.reportCard}>
              <View style={styles.reportHead}>
                <View style={{ flex: 1 }}>
                  <Text style={styles.reportTitle}>{report.title}</Text>
                  <Text style={styles.reportMeta}>
                    {report.doctorName} - {report.specialty} - {formatDate(report.createdAt)}
                  </Text>
                </View>
                <TouchableOpacity style={styles.readBtn} onPress={() => readReport(report)}>
                  <Ionicons name="volume-high" size={16} color="#fff" />
                </TouchableOpacity>
              </View>

              <Text style={styles.summary}>{report.summary}</Text>

              <RecommendationList
                icon="medkit"
                title="Medicine recommendation"
                items={report.medicines}
                renderItem={(med) => (
                  <>
                    <Text style={styles.itemTitle}>{med.name} ({med.dosage})</Text>
                    <Text style={styles.itemText}>{med.reason}</Text>
                  </>
                )}
              />

              <RecommendationList
                icon="walk"
                title="Workout recommendation"
                items={report.workouts}
                renderItem={(workout) => (
                  <>
                    <Text style={styles.itemTitle}>{workout.name}</Text>
                    <Text style={styles.itemText}>
                      {workout.duration} - {workout.frequency}. {workout.reason}
                    </Text>
                  </>
                )}
              />

              <RecommendationList
                icon="nutrition"
                title="Food guidance"
                items={report.diet}
                renderItem={(item) => <Text style={styles.itemTitle}>{item}</Text>}
              />

              <View style={styles.reviewBox}>
                <Ionicons name="calendar" size={15} color={colors.primary} />
                <Text style={styles.reviewText}>Next review: {report.nextReview}</Text>
              </View>
            </Card>
          </Animated.View>
        ))
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  content: { padding: spacing.md, paddingBottom: 140, gap: spacing.md },
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
  voiceCard: { flexDirection: "row", alignItems: "center", gap: 12 },
  voiceTitle: { fontSize: 13, fontWeight: "800", color: colors.text },
  voiceText: { fontSize: 11, color: colors.textMuted, marginTop: 3, lineHeight: 16 },
  voiceToggle: {
    minWidth: 72,
    height: 38,
    borderRadius: radius.full,
    borderWidth: 1,
    borderColor: colors.border,
    alignItems: "center",
    justifyContent: "center",
    flexDirection: "row",
    gap: 5,
    backgroundColor: colors.surfaceAlt,
  },
  voiceToggleOn: { backgroundColor: colors.primary, borderColor: colors.primary },
  voiceToggleText: { fontSize: 11, fontWeight: "800", color: colors.textMuted },
  voiceToggleTextOn: { color: "#fff" },
  reportCard: { gap: spacing.md },
  reportHead: { flexDirection: "row", gap: 10, alignItems: "center" },
  reportTitle: { fontSize: 15, fontWeight: "900", color: colors.text },
  reportMeta: { fontSize: 10, color: colors.textMuted, marginTop: 3 },
  readBtn: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: colors.primary,
    alignItems: "center",
    justifyContent: "center",
  },
  summary: { fontSize: 12, color: colors.textMuted, lineHeight: 18 },
  block: { gap: 8 },
  blockTitleRow: { flexDirection: "row", alignItems: "center", gap: 6 },
  blockTitle: { fontSize: 12, fontWeight: "800", color: colors.text },
  recommendationRow: {
    padding: 10,
    borderRadius: radius.md,
    backgroundColor: colors.surfaceAlt,
    borderWidth: 1,
    borderColor: colors.border,
  },
  itemTitle: { fontSize: 12, fontWeight: "800", color: colors.text },
  itemText: { fontSize: 10, color: colors.textMuted, lineHeight: 15, marginTop: 3 },
  reviewBox: {
    flexDirection: "row",
    alignItems: "center",
    gap: 7,
    padding: 10,
    borderRadius: radius.md,
    backgroundColor: "#FFF1F2",
  },
  reviewText: { fontSize: 11, fontWeight: "800", color: colors.primary },
  emptyText: { fontSize: 12, color: colors.textMuted },
});
