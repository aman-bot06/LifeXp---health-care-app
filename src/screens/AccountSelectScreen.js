import React from "react";
import { View, Text, StyleSheet, TouchableOpacity, ScrollView } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import Animated, { FadeInDown } from "react-native-reanimated";
import { colors, spacing, radius } from "../constants/theme";

export default function AccountSelectScreen({ navigation }) {
  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <Animated.View entering={FadeInDown.duration(400)}>
        <Text style={styles.title}>Join our health ecosystem</Text>
        <Text style={styles.subtitle}>Select your account type to begin your journey.</Text>
      </Animated.View>

      <Animated.View entering={FadeInDown.delay(100).duration(400)}>
        <TouchableOpacity
          style={styles.optionCard}
          activeOpacity={0.85}
          onPress={() => navigation.navigate("RegisterDoctor")}
        >
          <View style={styles.iconBox}>
            <Ionicons name="clipboard" size={22} color={colors.primary} />
          </View>
          <View style={styles.optionText}>
            <Text style={styles.optionTitle}>Register as Doctor</Text>
            <Text style={styles.optionDesc}>Provide clinical consultations and manage family groups.</Text>
          </View>
        </TouchableOpacity>
      </Animated.View>

      <Animated.View entering={FadeInDown.delay(200).duration(400)}>
        <TouchableOpacity
          style={styles.optionCard}
          activeOpacity={0.85}
          onPress={() => navigation.navigate("RegisterPatientAccount")}
        >
          <View style={styles.iconBox}>
            <Ionicons name="person" size={22} color={colors.primary} />
          </View>
          <View style={styles.optionText}>
            <Text style={styles.optionTitle}>Register as User</Text>
            <Text style={styles.optionDesc}>Track vitals, log prescriptions, and connect with family care circles.</Text>
          </View>
        </TouchableOpacity>
      </Animated.View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  content: { padding: spacing.lg, paddingTop: spacing.xl },
  title: { fontSize: 20, fontWeight: "700", color: colors.text, textAlign: "center" },
  subtitle: { fontSize: 12, color: colors.textMuted, textAlign: "center", marginTop: 6, marginBottom: spacing.lg },
  optionCard: {
    flexDirection: "row",
    backgroundColor: colors.surface,
    borderRadius: radius.lg,
    padding: spacing.md,
    marginBottom: spacing.md,
    borderWidth: 2,
    borderColor: colors.border,
    gap: spacing.md,
  },
  iconBox: { backgroundColor: "#F5F5F4", padding: 10, borderRadius: radius.md },
  optionText: { flex: 1 },
  optionTitle: { fontSize: 13, fontWeight: "700", color: colors.text },
  optionDesc: { fontSize: 11, color: colors.textMuted, marginTop: 4, lineHeight: 16 },
});
