import React, { useState } from "react";
import { View, Text, ScrollView, StyleSheet, TouchableOpacity, TextInput, Alert } from "react-native";
import Animated, { FadeInDown } from "react-native-reanimated";
import { Button, ScreenHeader } from "../components/UI";
import { useApp } from "../context/AppContext";
import { api } from "../api/client";
import { colors, spacing, radius } from "../constants/theme";

const TAGS = ["Hypertension", "Diabetes", "Asthma", "Heart Disease", "Allergy"];

export default function RegisterPatientStatsScreen({ navigation, route }) {
  const { setActiveUser, loadUserData } = useApp();
  const account = route.params || {};
  const [tags, setTags] = useState(["Hypertension"]);
  const [customTag, setCustomTag] = useState("");
  const [symptoms, setSymptoms] = useState("");
  const [loading, setLoading] = useState(false);

  const toggleTag = (tag) => {
    setTags((prev) => (prev.includes(tag) ? prev.filter((t) => t !== tag) : [...prev, tag]));
  };

  const submit = async () => {
    if (!account.email || !account.username || !account.password || !account.fullName) {
      Alert.alert("Missing account details", "Please go back and complete Step 1 first.");
      return;
    }

    setLoading(true);
    try {
      const data = await api.registerUser({
        email: account.email,
        username: account.username,
        password: account.password,
        firstName: account.firstName,
        lastName: account.lastName,
        fullName: account.fullName,
        healthIssues: tags,
        currentSymptoms: symptoms.trim(),
      });

      if (data.success) {
        setActiveUser(data.user);
        await loadUserData(data.user._id);
      }
    } catch (e) {
      Alert.alert("Registration failed", e.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <ScreenHeader title="Health Information" subtitle="Step 2 of 2 - medical context" onBack={() => navigation.goBack()} />

      <Animated.View entering={FadeInDown.duration(400)}>
        <View style={styles.accountSummary}>
          <Text style={styles.summaryName}>{account.fullName || "New User"}</Text>
          <Text style={styles.summaryMeta}>{account.email || "Complete account details first"}</Text>
        </View>

        <Text style={styles.label}>Existing Health Conditions</Text>
        <View style={styles.tagRow}>
          {TAGS.map((tag) => (
            <TouchableOpacity
              key={tag}
              onPress={() => toggleTag(tag)}
              style={[styles.tag, tags.includes(tag) && styles.tagActive]}
            >
              <Text style={[styles.tagText, tags.includes(tag) && styles.tagTextActive]}>{tag}</Text>
            </TouchableOpacity>
          ))}
        </View>

        <View style={styles.customRow}>
          <TextInput
            style={styles.customInput}
            placeholder="Other condition..."
            value={customTag}
            onChangeText={setCustomTag}
            placeholderTextColor={colors.textMuted}
          />
          <TouchableOpacity
            style={styles.addBtn}
            onPress={() => {
              if (customTag.trim() && !tags.includes(customTag.trim())) {
                setTags((p) => [...p, customTag.trim()]);
                setCustomTag("");
              }
            }}
          >
            <Text style={styles.addBtnText}>+</Text>
          </TouchableOpacity>
        </View>

        <Text style={styles.label}>Current Symptoms (Optional)</Text>
        <TextInput
          style={styles.textarea}
          multiline
          numberOfLines={4}
          value={symptoms}
          onChangeText={setSymptoms}
          placeholder="Describe any current symptoms..."
          placeholderTextColor={colors.textMuted}
        />

        <Button
          title="Create Account"
          onPress={submit}
          loading={loading}
        />
      </Animated.View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  content: { padding: spacing.lg },
  accountSummary: {
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.md,
    padding: spacing.md,
    marginBottom: spacing.lg,
  },
  summaryName: { fontSize: 15, fontWeight: "700", color: colors.text },
  summaryMeta: { fontSize: 11, color: colors.textMuted, marginTop: 4 },
  label: { fontSize: 11, fontWeight: "700", color: colors.textMuted, textTransform: "uppercase", marginBottom: 8 },
  tagRow: { flexDirection: "row", flexWrap: "wrap", gap: 8, marginBottom: spacing.md },
  tag: { paddingHorizontal: 12, paddingVertical: 8, borderRadius: radius.full, backgroundColor: "#F5F5F4" },
  tagActive: { backgroundColor: colors.amber },
  tagText: { fontSize: 11, fontWeight: "600", color: colors.textMuted },
  tagTextActive: { color: "#fff" },
  customRow: { flexDirection: "row", gap: 8, marginBottom: spacing.lg },
  customInput: {
    flex: 1,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.md,
    paddingHorizontal: 12,
    paddingVertical: 10,
    backgroundColor: colors.surface,
    fontSize: 13,
  },
  addBtn: { backgroundColor: colors.amber, width: 40, borderRadius: radius.md, alignItems: "center", justifyContent: "center" },
  addBtnText: { color: "#fff", fontSize: 20, fontWeight: "700" },
  textarea: {
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.md,
    padding: 12,
    backgroundColor: colors.surface,
    fontSize: 13,
    minHeight: 90,
    textAlignVertical: "top",
    marginBottom: spacing.lg,
  },
});
