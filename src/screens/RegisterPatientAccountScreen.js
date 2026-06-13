import React, { useState } from "react";
import { ScrollView, StyleSheet, Text, View } from "react-native";
import Animated, { FadeInDown } from "react-native-reanimated";
import { Button, Input, ScreenHeader } from "../components/UI";
import { colors, spacing, radius } from "../constants/theme";

function normalizeUsername(value) {
  return value.trim().toLowerCase().replace(/\s+/g, "_");
}

export default function RegisterPatientAccountScreen({ navigation }) {
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");

  const submit = () => {
    const cleanFirst = firstName.trim();
    const cleanLast = lastName.trim();
    const cleanUsername = normalizeUsername(username);
    const cleanEmail = email.trim().toLowerCase();

    setError("");

    if (!cleanFirst || !cleanLast || !cleanUsername || !cleanEmail || !password || !confirmPassword) {
      setError("Please fill all account details.");
      return;
    }

    if (!cleanEmail.endsWith("@gmail.com")) {
      setError("Please enter a valid Gmail address.");
      return;
    }

    if (password.length < 6) {
      setError("Password must be at least 6 characters.");
      return;
    }

    if (password !== confirmPassword) {
      setError("Password and confirm password do not match.");
      return;
    }

    navigation.navigate("RegisterPatientStats", {
      firstName: cleanFirst,
      lastName: cleanLast,
      fullName: `${cleanFirst} ${cleanLast}`,
      username: cleanUsername,
      email: cleanEmail,
      password,
    });
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
      <ScreenHeader title="User Details" subtitle="Step 1 of 2 - account information" onBack={() => navigation.goBack()} />

      <Animated.View entering={FadeInDown.duration(400)} style={styles.formCard}>
        {error ? (
          <View style={styles.errorBox}>
            <Text style={styles.errorText}>{error}</Text>
          </View>
        ) : null}

        <Input
          label="First Name"
          value={firstName}
          onChangeText={setFirstName}
          placeholder="Aman"
        />
        <Input
          label="Last Name"
          value={lastName}
          onChangeText={setLastName}
          placeholder="Sharma"
        />

        <Input
          label="Username"
          value={username}
          onChangeText={setUsername}
          placeholder="aman_sharma"
          autoCapitalize="none"
        />
        <Input
          label="Gmail"
          value={email}
          onChangeText={setEmail}
          placeholder="aman@gmail.com"
          keyboardType="email-address"
          autoCapitalize="none"
        />
        <Input
          label="Password"
          value={password}
          onChangeText={setPassword}
          placeholder="Minimum 6 characters"
          secureTextEntry
        />
        <Input
          label="Confirm Password"
          value={confirmPassword}
          onChangeText={setConfirmPassword}
          placeholder="Re-enter password"
          secureTextEntry
        />

        <Button title="Continue to Health Info" onPress={submit} />
      </Animated.View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  content: { padding: spacing.lg },
  formCard: {
    backgroundColor: colors.surface,
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: colors.border,
    padding: spacing.md,
  },
  errorBox: {
    backgroundColor: colors.errorBg,
    borderWidth: 1,
    borderColor: "#FECDD3",
    borderRadius: radius.sm,
    padding: 10,
    marginBottom: spacing.md,
  },
  errorText: { color: colors.error, fontSize: 12, fontWeight: "600" },
});
