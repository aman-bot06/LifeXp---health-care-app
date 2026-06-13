import "react-native-gesture-handler";
import React, { useEffect } from "react";
import { StatusBar } from "expo-status-bar";
import { NavigationContainer } from "@react-navigation/native";
import { SafeAreaProvider } from "react-native-safe-area-context";
import { AppProvider, useApp } from "./src/context/AppContext";
import AppNavigator from "./src/navigation/AppNavigator";

function Root() {
  const { checkStatus, activeUser } = useApp();

  useEffect(() => {
    checkStatus();
  }, []);

  return (
    <>
      <StatusBar style="dark" />
      <AppNavigator key={activeUser ? "auth" : "guest"} />
    </>
  );
}

export default function App() {
  return (
    <SafeAreaProvider>
      <AppProvider>
        <NavigationContainer>
          <Root />
        </NavigationContainer>
      </AppProvider>
    </SafeAreaProvider>
  );
}
