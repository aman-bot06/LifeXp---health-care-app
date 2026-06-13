import React, { useState } from "react";
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, KeyboardAvoidingView, Platform } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import Animated, { FadeInDown } from "react-native-reanimated";
import { Button, Input } from "../components/UI";
import { PulseView } from "../components/AnimatedViews";
import { colors, spacing, radius } from "../constants/theme";

export default function LoginScreen({ navigation }) {
  const [ident, setIdent] = useState("");
  const [password, setPassword] = useState("password123");
  const [showPass, setShowPass] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleLogin = async () => {
    setError("");
    if (!ident.trim()) {
      setError("Please enter your email or username.");
      return;
    }
    navigation.navigate("AuthHandler", { ident: ident.trim(), password });
  };

  return (
    <KeyboardAvoidingView style={styles.container} behavior={Platform.OS === "ios" ? "padding" : undefined}>
      <ScrollView contentContainerStyle={styles.scroll} keyboardShouldPersistTaps="handled">
        <Text style={styles.appName}>LifeXp</Text>

        <Animated.View entering={FadeInDown.duration(500)} style={styles.brand}>
          <PulseView>
            <View style={styles.logoBox}>
              <Ionicons name="heart" size={28} color={colors.primary} />
            </View>
          </PulseView>
          <Text style={styles.title}>Welcome Back</Text>
          <Text style={styles.subtitle}>Enter your credentials to access your health dashboard.</Text>
        </Animated.View>

        <Animated.View entering={FadeInDown.delay(150).duration(500)}>
          {error ? (
            <View style={styles.errorBox}>
              <Text style={styles.errorBoxText}>⚠️ {error}</Text>
            </View>
          ) : null}

          <Input
            label="Username or Email"
            value={ident}
            onChangeText={setIdent}
            placeholder="sarah@email.com"
            autoCapitalize="none"
          />

          <View>
            <Input
              label="Password"
              value={password}
              onChangeText={setPassword}
              secureTextEntry={!showPass}
              placeholder="••••••••"
            />
            <TouchableOpacity style={styles.eyeBtn} onPress={() => setShowPass(!showPass)}>
              <Ionicons name={showPass ? "eye-off" : "eye"} size={18} color={colors.textMuted} />
            </TouchableOpacity>
          </View>

          <Button title="Login" onPress={handleLogin} loading={loading} style={{ marginTop: spacing.sm }} />

          <TouchableOpacity
            style={styles.demoBtn}
            onPress={() => navigation.navigate("AuthHandler", { ident: "sarah@email.com", password: "password123" })}
          >
            <Text style={styles.demoText}>Demo: Login as Sarah Mitchell</Text>
          </TouchableOpacity>
        </Animated.View>

        <Animated.View entering={FadeInDown.delay(300).duration(500)} style={styles.footer}>
          <Text style={styles.footerText}>
            Don&apos;t have an account?{" "}
            <Text style={styles.link} onPress={() => navigation.navigate("AccountSelect")}>
              Create account
            </Text>
          </Text>
        </Animated.View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  scroll: { flexGrow: 1, padding: spacing.lg, justifyContent: "center" },
  appName: {
    position: "absolute",
    top: spacing.lg,
    left: spacing.lg,
    fontSize: 18,
    fontWeight: "800",
    color: colors.primary,
  },
  brand: { alignItems: "center", marginBottom: spacing.xl },
  logoBox: {
    width: 56,
    height: 56,
    borderRadius: radius.md,
    backgroundColor: `${colors.primary}20`,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: spacing.md,
  },
  title: { fontSize: 26, fontWeight: "700", color: colors.text },
  subtitle: { fontSize: 12, color: colors.textMuted, textAlign: "center", marginTop: 6, maxWidth: 260 },
  errorBox: { backgroundColor: colors.errorBg, borderRadius: radius.sm, padding: 10, marginBottom: spacing.md, borderWidth: 1, borderColor: "#FECDD3" },
  errorBoxText: { color: colors.error, fontSize: 12 },
  eyeBtn: { position: "absolute", right: 14, top: 38 },
  demoBtn: { marginTop: spacing.md, alignItems: "center" },
  demoText: { color: colors.primary, fontSize: 12, fontWeight: "600" },
  footer: { marginTop: spacing.xl, alignItems: "center" },
  footerText: { fontSize: 12, color: colors.textMuted },
  link: { color: colors.primary, fontWeight: "700" },
});
