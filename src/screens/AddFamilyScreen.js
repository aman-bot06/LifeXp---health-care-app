import React, { useEffect, useState } from "react";
import { Image, View, Text, ScrollView, StyleSheet, TouchableOpacity } from "react-native";
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
  const [matches, setMatches] = useState([]);
  const [searching, setSearching] = useState(false);

  useEffect(() => {
    let cancelled = false;
    const term = searchIdent.trim();

    if (term.length < 2) {
      return undefined;
    }

    const timer = setTimeout(async () => {
      try {
        const results = await api.searchUsers(term, activeUser._id);
        if (!cancelled) setMatches(results || []);
      } catch (_) {
        if (!cancelled) setMatches([]);
      } finally {
        if (!cancelled) setSearching(false);
      }
    }, 250);

    return () => {
      cancelled = true;
      clearTimeout(timer);
    };
  }, [activeUser._id, searchIdent]);

  const updateSearch = (text) => {
    setSearchIdent(text);
    if (text.trim().length < 2) {
      setMatches([]);
      setSearching(false);
    } else {
      setSearching(true);
    }
  };

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
          onChangeText={updateSearch}
          placeholder="Search name, email, username, or user ID"
          autoCapitalize="none"
        />

        {searchIdent.trim().length >= 2 ? (
          <View style={styles.matchesBox}>
            <Text style={styles.matchesTitle}>{searching ? "Searching..." : "Matching users"}</Text>
            {matches.length === 0 && !searching ? (
              <Text style={styles.noMatch}>No users found with those letters.</Text>
            ) : null}
            {matches.map((user) => (
              <TouchableOpacity
                key={user._id}
                style={styles.matchRow}
                onPress={() => {
                  setSearchIdent(user.userCode || user.username || user.email);
                  setMatches([]);
                }}
              >
                <Image source={{ uri: user.avatarUrl }} style={styles.matchAvatar} />
                <View style={{ flex: 1 }}>
                  <Text style={styles.matchName}>{user.fullName}</Text>
                  <Text style={styles.matchMeta}>
                    {user.username} - {user.userCode || user._id}
                  </Text>
                </View>
                <Text style={styles.matchRole}>{user.role}</Text>
              </TouchableOpacity>
            ))}
          </View>
        ) : null}

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
  matchesBox: {
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.md,
    padding: 10,
    marginBottom: spacing.md,
    gap: 8,
  },
  matchesTitle: { fontSize: 11, fontWeight: "800", color: colors.textMuted },
  noMatch: { fontSize: 11, color: colors.textMuted },
  matchRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    paddingVertical: 8,
    borderTopWidth: 1,
    borderTopColor: colors.border,
  },
  matchAvatar: { width: 34, height: 34, borderRadius: 17, backgroundColor: colors.surfaceAlt },
  matchName: { fontSize: 12, fontWeight: "800", color: colors.text },
  matchMeta: { fontSize: 10, color: colors.textMuted, marginTop: 2 },
  matchRole: { fontSize: 9, fontWeight: "800", color: colors.primary, textTransform: "uppercase" },
});
