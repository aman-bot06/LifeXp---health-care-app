import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  Image,
  Alert,
  TextInput,
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
  const [newPrescription, setNewPrescription] = useState({ name: "", dosage: "", schedule: "" });
  const [addingPrescription, setAddingPrescription] = useState(false);
  const [editingMedId, setEditingMedId] = useState(null);
  const [editingPrescription, setEditingPrescription] = useState({ name: "", dosage: "", schedule: "" });
  const [savingPrescription, setSavingPrescription] = useState(false);
  const [waterDraft, setWaterDraft] = useState({
    currentAmount: String(water.currentAmount || 0),
    targetAmount: String(water.targetAmount || 2.5),
    logsCount: String(water.logsCount || 0),
  });
  const [savingWater, setSavingWater] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => {
      setWaterDraft({
        currentAmount: String(water.currentAmount || 0),
        targetAmount: String(water.targetAmount || 2.5),
        logsCount: String(water.logsCount || 0),
      });
    }, 0);
    return () => clearTimeout(timer);
  }, [water.currentAmount, water.logsCount, water.targetAmount]);

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
      setWaterDraft({
        currentAmount: String(updated.currentAmount || 0),
        targetAmount: String(updated.targetAmount || 2.5),
        logsCount: String(updated.logsCount || 0),
      });
    } catch (e) {
      Alert.alert("Error", e.message);
    }
  };

  const saveWater = async () => {
    setSavingWater(true);
    try {
      const updated = await api.updateWater(activeUser._id, waterDraft);
      setWater(updated);
      setWaterDraft({
        currentAmount: String(updated.currentAmount || 0),
        targetAmount: String(updated.targetAmount || 2.5),
        logsCount: String(updated.logsCount || 0),
      });
    } catch (e) {
      Alert.alert("Error", e.message);
    } finally {
      setSavingWater(false);
    }
  };

  const addPrescription = async () => {
    const payload = {
      name: newPrescription.name.trim(),
      dosage: newPrescription.dosage.trim(),
      schedule: newPrescription.schedule.trim(),
    };

    if (!payload.name || !payload.dosage || !payload.schedule) {
      Alert.alert("Missing prescription", "Please enter medicine name, dosage, and routine time.");
      return;
    }

    setAddingPrescription(true);
    try {
      const data = await api.addMedication(activeUser._id, payload);
      setMedications((prev) => [...prev, data.medication]);
      setNewPrescription({ name: "", dosage: "", schedule: "" });
    } catch (e) {
      Alert.alert("Error", e.message);
    } finally {
      setAddingPrescription(false);
    }
  };

  const startEditPrescription = (med) => {
    setEditingMedId(med._id);
    setEditingPrescription({ name: med.name || "", dosage: med.dosage || "", schedule: med.schedule || "" });
  };

  const savePrescription = async () => {
    const payload = {
      name: editingPrescription.name.trim(),
      dosage: editingPrescription.dosage.trim(),
      schedule: editingPrescription.schedule.trim(),
    };

    if (!payload.name || !payload.dosage || !payload.schedule) {
      Alert.alert("Missing prescription", "Please enter medicine name, dosage, and routine time.");
      return;
    }

    setSavingPrescription(true);
    try {
      await api.updateMedication(editingMedId, payload);
      setMedications((prev) => prev.map((med) => (med._id === editingMedId ? { ...med, ...payload } : med)));
      setEditingMedId(null);
      setEditingPrescription({ name: "", dosage: "", schedule: "" });
    } catch (e) {
      Alert.alert("Error", e.message);
    } finally {
      setSavingPrescription(false);
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
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Routine Prescriptions</Text>
            <Ionicons name="medical" size={17} color={colors.primary} />
          </View>
          <View style={styles.prescriptionForm}>
            <TextInput
              value={newPrescription.name}
              onChangeText={(name) => setNewPrescription((prev) => ({ ...prev, name }))}
              placeholder="Medicine name"
              placeholderTextColor={colors.textMuted}
              style={styles.prescriptionInput}
            />
            <View style={styles.prescriptionRow}>
              <TextInput
                value={newPrescription.dosage}
                onChangeText={(dosage) => setNewPrescription((prev) => ({ ...prev, dosage }))}
                placeholder="Dosage"
                placeholderTextColor={colors.textMuted}
                style={[styles.prescriptionInput, styles.prescriptionHalf]}
              />
              <TextInput
                value={newPrescription.schedule}
                onChangeText={(schedule) => setNewPrescription((prev) => ({ ...prev, schedule }))}
                placeholder="Routine time"
                placeholderTextColor={colors.textMuted}
                style={[styles.prescriptionInput, styles.prescriptionHalf]}
              />
            </View>
            <TouchableOpacity style={styles.addPrescriptionBtn} onPress={addPrescription} disabled={addingPrescription}>
              <Ionicons name="add" size={16} color="#fff" />
              <Text style={styles.addPrescriptionText}>{addingPrescription ? "Adding..." : "Add prescription"}</Text>
            </TouchableOpacity>
          </View>
          {medications.map((med, i) => (
            <Animated.View key={med._id} entering={FadeInRight.delay(i * 80).duration(300)}>
              {editingMedId === med._id ? (
                <View style={styles.editMedBox}>
                  <TextInput
                    value={editingPrescription.name}
                    onChangeText={(name) => setEditingPrescription((prev) => ({ ...prev, name }))}
                    placeholder="Medicine name"
                    placeholderTextColor={colors.textMuted}
                    style={styles.prescriptionInput}
                  />
                  <View style={styles.prescriptionRow}>
                    <TextInput
                      value={editingPrescription.dosage}
                      onChangeText={(dosage) => setEditingPrescription((prev) => ({ ...prev, dosage }))}
                      placeholder="Dosage"
                      placeholderTextColor={colors.textMuted}
                      style={[styles.prescriptionInput, styles.prescriptionHalf]}
                    />
                    <TextInput
                      value={editingPrescription.schedule}
                      onChangeText={(schedule) => setEditingPrescription((prev) => ({ ...prev, schedule }))}
                      placeholder="Routine time"
                      placeholderTextColor={colors.textMuted}
                      style={[styles.prescriptionInput, styles.prescriptionHalf]}
                    />
                  </View>
                  <View style={styles.editActions}>
                    <TouchableOpacity style={styles.cancelEditBtn} onPress={() => setEditingMedId(null)}>
                      <Text style={styles.cancelEditText}>Cancel</Text>
                    </TouchableOpacity>
                    <TouchableOpacity style={styles.saveEditBtn} onPress={savePrescription} disabled={savingPrescription}>
                      <Text style={styles.saveEditText}>{savingPrescription ? "Saving..." : "Save"}</Text>
                    </TouchableOpacity>
                  </View>
                </View>
              ) : (
                <View style={[styles.medRow, med.taken && styles.medTaken]}>
                  <TouchableOpacity onPress={() => toggleMed(med)} style={styles.medTapArea}>
                    <View style={[styles.medIcon, med.taken && styles.medIconDone]}>
                      <Ionicons name={med.taken ? "checkmark" : "time"} size={16} color={med.taken ? colors.success : colors.violet} />
                    </View>
                    <View style={styles.medLeftText}>
                      <Text style={[styles.medName, med.taken && styles.medNameDone]} numberOfLines={1}>
                        {med.name} ({med.dosage})
                      </Text>
                      <Text style={styles.medSchedule} numberOfLines={1}>{med.schedule}</Text>
                    </View>
                  </TouchableOpacity>
                  <TouchableOpacity style={styles.editIconBtn} onPress={() => startEditPrescription(med)}>
                    <Ionicons name="create-outline" size={16} color={colors.primary} />
                  </TouchableOpacity>
                  <Text style={[styles.medBadge, med.taken ? styles.badgeDone : styles.badgePending]}>
                    {med.taken ? `TAKEN ${med.takenAt || ""}` : "PENDING"}
                  </Text>
                </View>
              )}
            </Animated.View>
          ))}
        </Card>
      </Animated.View>

      <Animated.View entering={FadeInDown.delay(350).duration(400)}>
        <Card style={styles.section}>
          <Text style={styles.sectionTitle}>Hydration Tracker</Text>
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
          <View style={styles.waterEditBox}>
            <View style={styles.prescriptionRow}>
              <TextInput
                value={waterDraft.currentAmount}
                onChangeText={(currentAmount) => setWaterDraft((prev) => ({ ...prev, currentAmount }))}
                keyboardType="decimal-pad"
                placeholder="Current L"
                placeholderTextColor={colors.textMuted}
                style={[styles.prescriptionInput, styles.prescriptionHalf]}
              />
              <TextInput
                value={waterDraft.targetAmount}
                onChangeText={(targetAmount) => setWaterDraft((prev) => ({ ...prev, targetAmount }))}
                keyboardType="decimal-pad"
                placeholder="Target L"
                placeholderTextColor={colors.textMuted}
                style={[styles.prescriptionInput, styles.prescriptionHalf]}
              />
              <TextInput
                value={waterDraft.logsCount}
                onChangeText={(logsCount) => setWaterDraft((prev) => ({ ...prev, logsCount }))}
                keyboardType="number-pad"
                placeholder="Logs"
                placeholderTextColor={colors.textMuted}
                style={[styles.prescriptionInput, styles.prescriptionHalf]}
              />
            </View>
            <View style={styles.waterActions}>
              <TouchableOpacity style={styles.waterBtn} onPress={logWater}>
                <Ionicons name="add" size={16} color="#fff" />
                <Text style={styles.waterBtnText}>Log 250ml</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.saveWaterBtn} onPress={saveWater} disabled={savingWater}>
                <Ionicons name="save-outline" size={16} color="#fff" />
                <Text style={styles.waterBtnText}>{savingWater ? "Saving..." : "Save water"}</Text>
              </TouchableOpacity>
            </View>
          </View>
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
  sectionHeader: { flexDirection: "row", alignItems: "center", justifyContent: "space-between" },
  prescriptionForm: {
    gap: 8,
    padding: 10,
    borderRadius: radius.md,
    backgroundColor: colors.surfaceAlt,
    borderWidth: 1,
    borderColor: colors.border,
    marginBottom: 10,
  },
  prescriptionRow: { flexDirection: "row", gap: 8 },
  prescriptionInput: {
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.sm,
    paddingHorizontal: 10,
    paddingVertical: 9,
    fontSize: 12,
    color: colors.text,
  },
  prescriptionHalf: { flex: 1 },
  addPrescriptionBtn: {
    alignSelf: "flex-start",
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
    backgroundColor: colors.primary,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: radius.sm,
  },
  addPrescriptionText: { color: "#fff", fontSize: 11, fontWeight: "800" },
  medRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    gap: 8,
    padding: 10,
    borderRadius: radius.md,
    backgroundColor: "#FAFAF9",
    marginBottom: 8,
    borderWidth: 1,
    borderColor: colors.border,
  },
  medTaken: { opacity: 0.7, backgroundColor: colors.successBg },
  medLeft: { flexDirection: "row", alignItems: "center", gap: 8, flex: 1 },
  medTapArea: { flex: 1, minWidth: 0, flexDirection: "row", alignItems: "center", gap: 8 },
  medLeftText: { flex: 1, minWidth: 0 },
  editMedBox: {
    gap: 8,
    padding: 10,
    borderRadius: radius.md,
    backgroundColor: "#FAFAF9",
    borderWidth: 1,
    borderColor: colors.border,
    marginBottom: 8,
  },
  editActions: { flexDirection: "row", justifyContent: "flex-end", gap: 8 },
  cancelEditBtn: { paddingHorizontal: 12, paddingVertical: 8, borderRadius: radius.sm, backgroundColor: colors.surface },
  cancelEditText: { fontSize: 11, fontWeight: "800", color: colors.textMuted },
  saveEditBtn: { paddingHorizontal: 12, paddingVertical: 8, borderRadius: radius.sm, backgroundColor: colors.primary },
  saveEditText: { fontSize: 11, fontWeight: "800", color: "#fff" },
  editIconBtn: {
    width: 32,
    height: 32,
    borderRadius: radius.sm,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
  },
  medIcon: { padding: 6, borderRadius: 8, backgroundColor: "#EDE9FE" },
  medIconDone: { backgroundColor: "#D1FAE5" },
  medName: { fontSize: 12, fontWeight: "700", color: colors.text },
  medNameDone: { textDecorationLine: "line-through", color: colors.textMuted },
  medSchedule: { fontSize: 10, color: colors.textMuted },
  medBadge: { fontSize: 8, fontWeight: "700", paddingHorizontal: 8, paddingVertical: 4, borderRadius: radius.full, flexShrink: 0 },
  badgeDone: { backgroundColor: "#D1FAE5", color: "#065F46" },
  badgePending: { backgroundColor: "#EDE9FE", color: "#5B21B6" },
  waterAmount: { fontSize: 18, fontWeight: "800", fontFamily: "monospace", color: colors.text },
  droplets: { flexDirection: "row", gap: 4, marginVertical: 8 },
  waterEditBox: { gap: 10 },
  waterActions: { flexDirection: "row", flexWrap: "wrap", gap: 8 },
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
  saveWaterBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    backgroundColor: colors.primary,
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
