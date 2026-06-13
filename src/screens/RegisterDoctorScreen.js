import React, { useState } from "react";
import { ScrollView, StyleSheet, Alert } from "react-native";
import Animated, { FadeInDown } from "react-native-reanimated";
import { Button, Input, ScreenHeader } from "../components/UI";
import { useApp } from "../context/AppContext";
import { api } from "../api/client";
import { colors, spacing } from "../constants/theme";

const DEFAULT_DOCTOR_ID = Date.now();

export default function RegisterDoctorScreen({ navigation }) {
  const { setActiveUser, loadUserData } = useApp();
  const [fullName, setFullName] = useState("Dr. Alex Thorne");
  const [email, setEmail] = useState(`dr_${DEFAULT_DOCTOR_ID}@email.com`);
  const [username, setUsername] = useState(`dr_${DEFAULT_DOCTOR_ID}`);
  const [password, setPassword] = useState("password123");
  const [specialization, setSpecialization] = useState("Cardiology");
  const [loading, setLoading] = useState(false);

  const submit = async () => {
    setLoading(true);
    try {
      const data = await api.registerDoctor({ email, username, password, fullName, specialization });
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
      <ScreenHeader title="Professional Profile" subtitle="Activate system consulting permissions." onBack={() => navigation.goBack()} />

      <Animated.View entering={FadeInDown.duration(400)}>
        <Input label="Full Professional Name" value={fullName} onChangeText={setFullName} />
        <Input label="Specialization" value={specialization} onChangeText={setSpecialization} />
        <Input label="Professional Email" value={email} onChangeText={setEmail} autoCapitalize="none" />
        <Input label="Username" value={username} onChangeText={setUsername} autoCapitalize="none" />
        <Input label="Password" value={password} onChangeText={setPassword} secureTextEntry />
        <Button title="Submit Registration" onPress={submit} loading={loading} />
      </Animated.View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  content: { padding: spacing.lg },
});
