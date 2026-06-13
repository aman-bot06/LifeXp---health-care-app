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
import Animated, { FadeInDown, FadeInRight } from "react-native-reanimated";
import { Card } from "../components/UI";
import { useApp } from "../context/AppContext";
import { api } from "../api/client";
import { colors, spacing, radius } from "../constants/theme";

function VitalCard({ icon, label, value, badge, onPress, delay, color }) {
  return (
    <Animated.View entering={FadeInDown.delay(delay).duration(400)} style={styles.vitalCard}>
      <TouchableOpacity onPress={onPress} activeOpacity={0.7} style={styles.vitalInner}>
        <View style={styles.vitalTop}>
          <Ionicons name={icon} size={18} color={color} />
          {badge ? <Text style={[styles.vitalBadge, { color }]}>{badge}</Text> : null}
        </View>
        <Text style={styles.vitalValue}>{value}</Text>
        <Text style={styles.vitalLabel}>{label}</Text>
      </TouchableOpacity>
    </Animated.View>
  );
}

export default function DashboardScreen() {
  const { activeUser, vitals, setVitals, medications, setMedications, water, setWater, appointments } = useApp();

  const toggleMed = async (med) => {
    const taken = !med.taken;
    try {
      await api.toggleMedication(med._id, taken);
      const updatedAt = new Date().toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit" });
      setMedications((prev) =>
        prev.map((m) =>
          m._id === med._id ? { ...m, taken, takenAt: taken ? updatedAt : null } : m
        )
      );
    } catch (e) {
      Alert.alert("Error", e.message);
    }
  };

  const logWater = async () => {
    try {
      const updated = await api.logWater(activeUser._id);
      setWater(updated);
    } catch (e) {
      Alert.alert("Error", e.message);
    }
  };

  const bumpVital = async (field, delta) => {
    const next = { ...vitals, [field]: vitals[field] + delta };
    setVitals(next);
    try {
      await api.updateVitals(activeUser._id, { [field]: next[field] });
    } catch (_) {}
  };

  const updateBloodPressure = async () => {
    const next = { ...vitals, bloodPressure: vitals.bloodPressure === "122/81" ? "120/80" : "122/81" };
    setVitals(next);
    try {
      await api.updateVitals(activeUser._id, { bloodPressure: next.bloodPressure });
    } catch (_) {}
  };

  const firstName = activeUser?.fullName?.split(" ")[0] || "User";

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <Animated.View entering={FadeInDown.duration(400)} style={styles.header}>
        <View style={styles.profileRow}>
          <Image source={{ uri: activeUser?.avatarUrl }} style={styles.avatar} />
          <View>
            <Text style={styles.greeting}>Good morning, {firstName}</Text>
            <Text style={styles.status}>Stable Status</Text>
          </View>
        </View>
        <Text style={styles.summary}>Your health summary for today is looking great.</Text>
      </Animated.View>

      <View style={styles.vitalsGrid}>
        <VitalCard
          icon="pulse"
          label="Heart rate"
          value={`${vitals.heartRate} bpm`}
          badge="TAP +"
          color="#F43F5E"
          delay={100}
          onPress={() => bumpVital("heartRate", 4)}
        />
        <VitalCard
          icon="heart"
          label="Blood Pr."
          value={vitals.bloodPressure}
          badge="NORMAL"
          color="#10B981"
          delay={150}
          onPress={updateBloodPressure}
        />
        <VitalCard
          icon="trending-up"
          label="Blood Sugar"
          value={`${vitals.bloodSugar} mg/dL`}
          badge="TAP +"
          color="#06B6D4"
          delay={200}
          onPress={() => bumpVital("bloodSugar", 5)}
        />
      </View>

      <Animated.View entering={FadeInDown.delay(250).duration(400)}>
        <Card style={styles.section}>
          <Text style={styles.sectionTitle}>💊 Routine Prescriptions</Text>
          {medications.map((med, i) => (
            <Animated.View key={med._id} entering={FadeInRight.delay(i * 80).duration(300)}>
              <TouchableOpacity
                onPress={() => toggleMed(med)}
                style={[styles.medRow, med.taken && styles.medTaken]}
              >
                <View style={styles.medLeft}>
                  <View style={[styles.medIcon, med.taken && styles.medIconDone]}>
                    <Ionicons name={med.taken ? "checkmark" : "time"} size={16} color={med.taken ? colors.success : colors.violet} />
                  </View>
                  <View>
                    <Text style={[styles.medName, med.taken && styles.medNameDone]}>
                      {med.name} ({med.dosage})
                    </Text>
                    <Text style={styles.medSchedule}>{med.schedule}</Text>
                  </View>
                </View>
                <Text style={[styles.medBadge, med.taken ? styles.badgeDone : styles.badgePending]}>
                  {med.taken ? `TAKEN ${med.takenAt || ""}` : "PENDING"}
                </Text>
              </TouchableOpacity>
            </Animated.View>
          ))}
        </Card>
      </Animated.View>

      <Animated.View entering={FadeInDown.delay(350).duration(400)}>
        <Card style={styles.section}>
          <Text style={styles.sectionTitle}>💧 Hydration Tracker</Text>
          <Text style={styles.waterAmount}>
            {water.currentAmount} / {water.targetAmount} L
          </Text>
          <View style={styles.droplets}>
            {Array.from({ length: 8 }).map((_, i) => (
              <Ionicons
                key={i}
                name="water"
                size={14}
                color={i < (water.logsCount || 0) ? colors.sky : "#E7E5E4"}
              />
            ))}
          </View>
          <TouchableOpacity style={styles.waterBtn} onPress={logWater}>
            <Ionicons name="add" size={16} color="#fff" />
            <Text style={styles.waterBtnText}>Log 250ml</Text>
          </TouchableOpacity>
        </Card>
      </Animated.View>

      <Animated.View entering={FadeInDown.delay(450).duration(400)}>
        <Card style={styles.section}>
          <Text style={styles.sectionTitle}>Upcoming Appointments</Text>
          {appointments.length === 0 ? (
            <Text style={styles.emptyText}>No visits booked yet. Open Specialists to schedule one.</Text>
          ) : (
            appointments.slice(0, 3).map((appt) => (
              <View key={appt._id} style={styles.apptRow}>
                <View style={styles.apptIcon}>
                  <Ionicons name="calendar" size={15} color={colors.primary} />
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={styles.apptDoctor}>{appt.doctorName}</Text>
                  <Text style={styles.apptMeta}>
                    {appt.specialty} - {appt.date} at {appt.time}
                  </Text>
                </View>
                <Text style={styles.apptStatus}>{appt.status || "Upcoming"}</Text>
              </View>
            ))
          )}
        </Card>
      </Animated.View>

      <Animated.View entering={FadeInDown.delay(550).duration(400)}>
        <Card style={[styles.section, styles.sleepCard]}>
          <View style={styles.sleepRing}>
            <Ionicons name="moon" size={28} color="#4338CA" />
          </View>
          <View style={{ flex: 1 }}>
            <Text style={styles.sectionTitle}>Regular Sleep Schedule</Text>
            <Text style={styles.sleepTime}>
              7h 45m <Text style={styles.sleepGoal}>Goal: 8h</Text>
            </Text>
            <Text style={styles.sleepNote}>Excellent deep sleep rhythm achieved last night.</Text>
          </View>
        </Card>
      </Animated.View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  content: { padding: spacing.md, paddingBottom: spacing.xl },
  header: { marginBottom: spacing.md },
  profileRow: { flexDirection: "row", alignItems: "center", gap: 10, marginBottom: 8 },
  avatar: { width: 40, height: 40, borderRadius: 20 },
  greeting: { fontSize: 16, fontWeight: "700", color: colors.text },
  status: { fontSize: 10, color: colors.primary, fontWeight: "700" },
  summary: { fontSize: 12, color: colors.textMuted },
  vitalsGrid: { flexDirection: "row", gap: 8, marginBottom: spacing.md },
  vitalCard: { flex: 1 },
  vitalInner: {
    backgroundColor: colors.surface,
    borderRadius: radius.md,
    padding: 10,
    borderWidth: 1,
    borderColor: colors.border,
  },
  vitalTop: { flexDirection: "row", justifyContent: "space-between", alignItems: "center" },
  vitalBadge: { fontSize: 8, fontWeight: "700", fontFamily: "monospace" },
  vitalValue: { fontSize: 12, fontWeight: "700", fontFamily: "monospace", marginTop: 8, color: colors.text },
  vitalLabel: { fontSize: 9, color: colors.textMuted, marginTop: 2 },
  section: { marginBottom: spacing.md },
  sectionTitle: { fontSize: 13, fontWeight: "700", color: colors.text, marginBottom: 10 },
  medRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 10,
    borderRadius: radius.md,
    backgroundColor: "#FAFAF9",
    marginBottom: 8,
    borderWidth: 1,
    borderColor: colors.border,
  },
  medTaken: { opacity: 0.7, backgroundColor: colors.successBg },
  medLeft: { flexDirection: "row", alignItems: "center", gap: 8, flex: 1 },
  medIcon: { padding: 6, borderRadius: 8, backgroundColor: "#EDE9FE" },
  medIconDone: { backgroundColor: "#D1FAE5" },
  medName: { fontSize: 12, fontWeight: "700", color: colors.text },
  medNameDone: { textDecorationLine: "line-through", color: colors.textMuted },
  medSchedule: { fontSize: 10, color: colors.textMuted },
  medBadge: { fontSize: 8, fontWeight: "700", paddingHorizontal: 8, paddingVertical: 4, borderRadius: radius.full },
  badgeDone: { backgroundColor: "#D1FAE5", color: "#065F46" },
  badgePending: { backgroundColor: "#EDE9FE", color: "#5B21B6" },
  waterAmount: { fontSize: 18, fontWeight: "800", fontFamily: "monospace", color: colors.text },
  droplets: { flexDirection: "row", gap: 4, marginVertical: 8 },
  waterBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    backgroundColor: colors.sky,
    alignSelf: "flex-start",
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: radius.md,
  },
  waterBtnText: { color: "#fff", fontSize: 11, fontWeight: "700" },
  sleepCard: { flexDirection: "row", gap: 14, alignItems: "center" },
  sleepRing: {
    width: 64,
    height: 64,
    borderRadius: 32,
    borderWidth: 4,
    borderColor: "#4338CA",
    alignItems: "center",
    justifyContent: "center",
  },
  sleepTime: { fontSize: 15, fontWeight: "700", fontFamily: "monospace", color: colors.text },
  sleepGoal: { fontSize: 11, color: colors.textMuted, fontWeight: "400" },
  sleepNote: { fontSize: 10, color: colors.textMuted, marginTop: 4 },
  emptyText: { fontSize: 11, color: colors.textMuted },
  apptRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    padding: 10,
    borderRadius: radius.md,
    backgroundColor: "#FAFAF9",
    borderWidth: 1,
    borderColor: colors.border,
    marginBottom: 8,
  },
  apptIcon: {
    width: 32,
    height: 32,
    borderRadius: radius.sm,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: colors.surfaceAlt,
  },
  apptDoctor: { fontSize: 12, fontWeight: "700", color: colors.text },
  apptMeta: { fontSize: 10, color: colors.textMuted, marginTop: 2 },
  apptStatus: { fontSize: 9, fontWeight: "700", color: colors.success },
});
