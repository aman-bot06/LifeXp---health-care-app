import React, { useState, useMemo } from "react";
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  Image,
  TextInput,
  Alert,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import Animated, { FadeInDown } from "react-native-reanimated";
import { useApp } from "../context/AppContext";
import { api } from "../api/client";
import { colors, spacing, radius } from "../constants/theme";

const FALLBACK_DOCTORS = [
  { _id: "d1", fullName: "Dr. Sarah Jenkins", specialization: "Cardiology", avatarUrl: "https://images.unsplash.com/photo-1559839734-2b71ea197ec2?w=150&auto=format&fit=crop&q=60" },
  { _id: "d2", fullName: "Dr. Marcus Thorne", specialization: "Neurology", avatarUrl: "https://images.unsplash.com/photo-1622253692010-333f2da6031d?w=150&auto=format&fit=crop&q=60" },
  { _id: "d3", fullName: "Dr. Elena Rodriguez", specialization: "Pediatrics", avatarUrl: "https://images.unsplash.com/photo-1594824813573-246434de83fb?w=150&auto=format&fit=crop&q=60" },
  { _id: "d4", fullName: "Dr. James Wilson", specialization: "Dermatology", avatarUrl: "https://images.unsplash.com/photo-1612349317150-e413f6a5b16d?w=150&auto=format&fit=crop&q=60" },
  { _id: "d5", fullName: "Dr. Sophia Chen", specialization: "Endocrinologist", avatarUrl: "https://images.unsplash.com/photo-1591604466107-ec97de577aff?w=150&auto=format&fit=crop&q=60" },
];

const SPECIALTIES = ["All", "Cardiology", "Neurology", "Pediatrics", "Dermatology", "Endocrinologist"];
const appointmentDate = () =>
  new Date(Date.now() + 3 * 86400000).toLocaleDateString("en-US", { month: "short", day: "numeric" });

export default function DoctorsScreen() {
  const { activeUser, doctors, setAppointments, loadUserData } = useApp();
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState("All");

  const list = doctors.length ? doctors : FALLBACK_DOCTORS;

  const filtered = useMemo(() => {
    return list.filter((doc) => {
      const matchSearch = doc.fullName.toLowerCase().includes(search.toLowerCase());
      const matchFilter = filter === "All" || doc.specialization === filter;
      return matchSearch && matchFilter;
    });
  }, [list, search, filter]);

  const book = async (doc) => {
    const dateStr = appointmentDate();
    try {
      const data = await api.bookAppointment(activeUser._id, {
        doctorName: doc.fullName,
        specialty: doc.specialization,
        date: dateStr,
        time: "11:00 AM",
      });
      if (data.appointment) {
        setAppointments((prev) => [data.appointment, ...prev]);
      }
      await loadUserData(activeUser._id);
      Alert.alert(
        "Appointment Confirmed!",
        `Doctor: ${doc.fullName}\nSpecialty: ${doc.specialization}\nDate: ${dateStr}\nTime: 11:00 AM`
      );
    } catch (e) {
      Alert.alert("Error", e.message);
    }
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <Text style={styles.title}>Find Specialists</Text>
      <Text style={styles.subtitle}>Schedule check-ups with certified doctors.</Text>

      <View style={styles.searchWrap}>
        <Ionicons name="search" size={18} color={colors.textMuted} style={styles.searchIcon} />
        <TextInput
          style={styles.searchInput}
          placeholder="Search by name..."
          value={search}
          onChangeText={setSearch}
          placeholderTextColor={colors.textMuted}
        />
      </View>

      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.chips}>
        {SPECIALTIES.map((s) => (
          <TouchableOpacity
            key={s}
            onPress={() => setFilter(s)}
            style={[styles.chip, filter === s && styles.chipActive]}
          >
            <Text style={[styles.chipText, filter === s && styles.chipTextActive]}>{s}</Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      {filtered.map((doc, i) => (
        <Animated.View key={doc._id} entering={FadeInDown.delay(i * 80).duration(400)} style={styles.docCard}>
          <Image source={{ uri: doc.avatarUrl }} style={styles.avatar} />
          <View style={{ flex: 1 }}>
            <Text style={styles.docName}>{doc.fullName}</Text>
            <Text style={styles.spec}>{doc.specialization}</Text>
            <Text style={styles.rating}>NYC Care Network • ⭐ 4.9</Text>
          </View>
          <TouchableOpacity style={styles.bookBtn} onPress={() => book(doc)}>
            <Text style={styles.bookText}>Book</Text>
          </TouchableOpacity>
        </Animated.View>
      ))}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  content: { padding: spacing.md },
  title: { fontSize: 17, fontWeight: "700", color: colors.text },
  subtitle: { fontSize: 12, color: colors.textMuted, marginBottom: spacing.md },
  searchWrap: { position: "relative", marginBottom: spacing.md },
  searchIcon: { position: "absolute", left: 12, top: 12, zIndex: 1 },
  searchInput: {
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.md,
    paddingLeft: 38,
    paddingVertical: 12,
    fontSize: 13,
  },
  chips: { marginBottom: spacing.md },
  chip: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: radius.full,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    marginRight: 8,
  },
  chipActive: { backgroundColor: colors.amber, borderColor: colors.amber },
  chipText: { fontSize: 11, fontWeight: "700", color: colors.textMuted },
  chipTextActive: { color: "#fff" },
  docCard: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    backgroundColor: colors.surface,
    borderRadius: radius.lg,
    padding: spacing.md,
    marginBottom: spacing.sm,
    borderWidth: 1,
    borderColor: colors.border,
  },
  avatar: { width: 44, height: 44, borderRadius: 22 },
  docName: { fontSize: 13, fontWeight: "700", color: colors.text },
  spec: { fontSize: 10, color: colors.primary, fontWeight: "600", marginTop: 2 },
  rating: { fontSize: 9, color: colors.textMuted, marginTop: 2 },
  bookBtn: { backgroundColor: colors.amber, paddingHorizontal: 12, paddingVertical: 8, borderRadius: radius.sm },
  bookText: { color: "#fff", fontSize: 10, fontWeight: "700" },
});
