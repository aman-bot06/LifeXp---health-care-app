import React, { useState } from "react";
import { View, Text, Image, StyleSheet, ScrollView, Alert } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import Animated, { FadeIn, ZoomIn } from "react-native-reanimated";
import { Button, ScreenHeader } from "../components/UI";
import { useApp } from "../context/AppContext";
import { api } from "../api/client";
import { colors, spacing, radius } from "../constants/theme";

const AVATARS = [
  "https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=150&auto=format&fit=crop&q=60",
  "https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=150&auto=format&fit=crop&q=60",
];

export default function RegisterPatientPhotoScreen({ navigation, route }) {
  const { setActiveUser, loadUserData } = useApp();
  const params = route.params || {};
  const [avatarUrl, setAvatarUrl] = useState(null);
  const [loading, setLoading] = useState(false);

  const submit = async () => {
    setLoading(true);
    try {
      const data = await api.registerUser({
        ...params,
        avatarUrl: avatarUrl || AVATARS[0],
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
      <ScreenHeader title="Identity Verification" subtitle="Step 3 of 3 — profile photo" onBack={() => navigation.goBack()} />

      <Animated.View entering={ZoomIn.duration(500)} style={styles.avatarWrap}>
        {avatarUrl ? (
          <Image source={{ uri: avatarUrl }} style={styles.avatar} />
        ) : (
          <View style={styles.avatarPlaceholder}>
            <Ionicons name="person" size={56} color="#D6D3D1" />
          </View>
        )}
      </Animated.View>

      <Animated.View entering={FadeIn.delay(200).duration(400)}>
        <Button title="📷 Simulate Camera Photo" onPress={() => setAvatarUrl(AVATARS[0])} style={{ marginBottom: 8 }} />
        <Button title="Use Alternate Profile" variant="outline" onPress={() => setAvatarUrl(AVATARS[1])} style={{ marginBottom: spacing.lg }} />
        <Button title="Finish Registration" onPress={submit} loading={loading} />
      </Animated.View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  content: { padding: spacing.lg, alignItems: "center" },
  avatarWrap: { marginVertical: spacing.xl },
  avatar: { width: 140, height: 140, borderRadius: 70, borderWidth: 4, borderColor: "#fff" },
  avatarPlaceholder: {
    width: 140,
    height: 140,
    borderRadius: 70,
    backgroundColor: "#F5F5F4",
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 4,
    borderColor: colors.border,
  },
});
