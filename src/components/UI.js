import React from "react";
import { View, Text, TextInput, TouchableOpacity, StyleSheet, ActivityIndicator } from "react-native";
import { colors, radius, spacing } from "../constants/theme";

export function Button({ title, onPress, variant = "primary", loading, disabled, style }) {
  const isPrimary = variant === "primary";
  const isOutline = variant === "outline";

  return (
    <TouchableOpacity
      onPress={onPress}
      disabled={disabled || loading}
      activeOpacity={0.8}
      style={[
        styles.button,
        isPrimary && styles.buttonPrimary,
        isOutline && styles.buttonOutline,
        (disabled || loading) && styles.buttonDisabled,
        style,
      ]}
    >
      {loading ? (
        <ActivityIndicator color={isOutline ? colors.primary : "#fff"} />
      ) : (
        <Text style={[styles.buttonText, isOutline && styles.buttonTextOutline]}>{title}</Text>
      )}
    </TouchableOpacity>
  );
}

export function Input({ label, error, style, ...props }) {
  return (
    <View style={styles.inputWrap}>
      {label ? <Text style={styles.label}>{label}</Text> : null}
      <TextInput
        style={[styles.input, error && styles.inputError, style]}
        placeholderTextColor={colors.textMuted}
        {...props}
      />
      {error ? <Text style={styles.errorText}>{error}</Text> : null}
    </View>
  );
}

export function Card({ children, style }) {
  return <View style={[styles.card, style]}>{children}</View>;
}

export function ScreenHeader({ title, subtitle, onBack }) {
  return (
    <View style={styles.header}>
      {onBack ? (
        <TouchableOpacity onPress={onBack} style={styles.backBtn}>
          <Text style={styles.backText}>← Back</Text>
        </TouchableOpacity>
      ) : null}
      <Text style={styles.headerTitle}>{title}</Text>
      {subtitle ? <Text style={styles.headerSub}>{subtitle}</Text> : null}
    </View>
  );
}

const styles = StyleSheet.create({
  button: {
    paddingVertical: 14,
    paddingHorizontal: 20,
    borderRadius: radius.md,
    alignItems: "center",
    justifyContent: "center",
  },
  buttonPrimary: {
    backgroundColor: colors.primary,
  },
  buttonOutline: {
    backgroundColor: "transparent",
    borderWidth: 1,
    borderColor: colors.border,
  },
  buttonDisabled: { opacity: 0.6 },
  buttonText: {
    color: "#fff",
    fontWeight: "700",
    fontSize: 13,
    letterSpacing: 0.5,
    textTransform: "uppercase",
  },
  buttonTextOutline: { color: colors.text },
  inputWrap: { marginBottom: spacing.md },
  label: {
    fontSize: 11,
    fontWeight: "700",
    color: colors.textMuted,
    textTransform: "uppercase",
    marginBottom: 6,
    letterSpacing: 0.5,
  },
  input: {
    backgroundColor: colors.surfaceAlt,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.md,
    paddingHorizontal: 14,
    paddingVertical: 12,
    fontSize: 14,
    color: colors.text,
  },
  inputError: { borderColor: colors.error },
  errorText: { color: colors.error, fontSize: 11, marginTop: 4 },
  card: {
    backgroundColor: colors.surface,
    borderRadius: radius.lg,
    padding: spacing.md,
    borderWidth: 1,
    borderColor: colors.border,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  header: { marginBottom: spacing.lg },
  backBtn: { marginBottom: spacing.sm },
  backText: { color: colors.textMuted, fontSize: 13 },
  headerTitle: { fontSize: 22, fontWeight: "700", color: colors.text },
  headerSub: { fontSize: 12, color: colors.textMuted, marginTop: 4 },
});
