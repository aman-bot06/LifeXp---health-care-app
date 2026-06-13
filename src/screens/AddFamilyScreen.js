import React, { useState } from "react";
import { View, Text, ScrollView, StyleSheet, TouchableOpacity } from "react-native";
import Animated, { FadeInDown } from "react-native-reanimated";
import { Button, Input, ScreenHeader } from "../components/UI";
import { useApp } from "../context/AppContext";
import { api } from "../api/client";
import { colors, spacing, radius } from "../constants/theme";

const RELATIONSHIPS = ["Spouse", "Child", "Parent", "Sibling", "Other"];

export default function AddFamilyScreen({ navigation }) {
  const { activeUser, loadUserData } = useApp();
  const [searchIdent, setSearchIdent] = useState("");
  const [relationship, setRelationship] = useState("Spouse");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [loading, setLoading] = useState(false);

  const submit = async () => {
    setError("");
    setSuccess("");
    if (!searchIdent.trim()) {
      setError("Please enter a username or email.");
      return;
    }
    setLoading(true);
    try {
      const data = await api.addFamily(activeUser._id, searchIdent.trim(), relationship);
      setSuccess(`${data.targetFullName} successfully linked!`);
      setSearchIdent("");
      await loadUserData(activeUser._id);
    } catch (e) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <ScreenHeader title="Connect Member" subtitle="Search by email or username." onBack={() => navigation.goBack()} />

      <Animated.View entering={FadeInDown.duration(400)}>
        {error ? <Text style={styles.error}>{error}</Text> : null}
        {success ? <Text style={styles.success}>{success}</Text> : null}

        <Input
          label="Email or Username"
          value={searchIdent}
          onChangeText={setSearchIdent}
          placeholder="james@email.com"
          autoCapitalize="none"
        />

        <Text style={styles.label}>Relationship</Text>
        <View style={styles.relRow}>
          {RELATIONSHIPS.map((r) => (
            <TouchableOpacity
              key={r}
              onPress={() => setRelationship(r)}
              style={[styles.relChip, relationship === r && styles.relChipActive]}
            >
              <Text style={[styles.relText, relationship === r && styles.relTextActive]}>{r}</Text>
            </TouchableOpacity>
          ))}
        </View>

        <Button title="Confirm and Connect" onPress={submit} loading={loading} />
      </Animated.View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  content: { padding: spacing.lg },
  label: { fontSize: 11, fontWeight: "700", color: colors.textMuted, textTransform: "uppercase", marginBottom: 6 },
  relRow: { flexDirection: "row", flexWrap: "wrap", gap: 8, marginBottom: spacing.lg },
  relChip: { paddingHorizontal: 12, paddingVertical: 8, borderRadius: radius.full, backgroundColor: colors.surface, borderWidth: 1, borderColor: colors.border },
  relChipActive: { backgroundColor: colors.amber, borderColor: colors.amber },
  relText: { fontSize: 11, fontWeight: "600", color: colors.textMuted },
  relTextActive: { color: "#fff" },
  error: { color: colors.error, fontSize: 12, marginBottom: spacing.md, backgroundColor: colors.errorBg, padding: 10, borderRadius: 8 },
  success: { color: colors.success, fontSize: 12, marginBottom: spacing.md, backgroundColor: colors.successBg, padding: 10, borderRadius: 8 },
});
