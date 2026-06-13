import React, { useEffect, useRef } from "react";
import { View, ActivityIndicator, StyleSheet, Text } from "react-native";
import { useApp } from "../context/AppContext";
import { colors } from "../constants/theme";

export default function AuthHandlerScreen({ navigation, route }) {
  const { login } = useApp();
  const { ident, password } = route.params || {};
  const ran = useRef(false);

  useEffect(() => {
    if (ran.current) return;
    ran.current = true;

    (async () => {
      try {
        await login(ident, password);
        // AppNavigator re-renders to MainTabs when activeUser is set
      } catch (e) {
        navigation.replace("Login");
        navigation.navigate("Login");
      }
    })();
  }, []);

  return (
    <View style={styles.container}>
      <ActivityIndicator size="large" color={colors.primary} />
      <Text style={styles.text}>Connecting to Lifexp...</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, alignItems: "center", justifyContent: "center", backgroundColor: colors.background, gap: 12 },
  text: { color: colors.textMuted, fontSize: 13 },
});
