import React, { useState, useRef, useEffect } from "react";
import {
  View,
  Text,
  FlatList,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import Animated, { FadeInUp, FadeIn } from "react-native-reanimated";
import { useApp } from "../context/AppContext";
import { api } from "../api/client";
import { colors, spacing, radius } from "../constants/theme";

const QUICK_PILLS = ["Analyze My Report", "Daily Plan", "Track Medication", "Hydration Tips"];

function ChatBubble({ message }) {
  const isUser = message.sender === "user";
  return (
    <Animated.View
      entering={FadeInUp.duration(300)}
      style={[styles.bubble, isUser ? styles.userBubble : styles.aiBubble]}
    >
      <Text style={[styles.bubbleText, isUser && styles.userText]}>{message.text}</Text>
      <Text style={[styles.time, isUser && styles.userTime]}>{message.timestamp}</Text>
    </Animated.View>
  );
}

function TypingIndicator() {
  return (
    <Animated.View entering={FadeIn.duration(300)} style={[styles.bubble, styles.aiBubble, styles.typing]}>
      <View style={styles.dots}>
        {[0, 1, 2].map((i) => (
          <Animated.View key={i} style={[styles.dot, { opacity: 0.4 + i * 0.2 }]} />
        ))}
      </View>
      <Text style={styles.typingText}>Reading your report...</Text>
    </Animated.View>
  );
}

export default function ChatScreen() {
  const { activeUser, chatHistory, setChatHistory } = useApp();
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const listRef = useRef(null);
  const tempIdRef = useRef(0);

  useEffect(() => {
    if (chatHistory.length) {
      setTimeout(() => listRef.current?.scrollToEnd({ animated: true }), 100);
    }
  }, [chatHistory, loading]);

  const send = async (text) => {
    const msg = (text || input).trim();
    if (!msg || loading) return;
    setInput("");
    setLoading(true);
    tempIdRef.current += 1;

    const tempUser = {
      _id: `temp_${tempIdRef.current}`,
      sender: "user",
      text: msg,
      timestamp: new Date().toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit" }),
    };
    setChatHistory((prev) => [...prev, tempUser]);

    try {
      const data = await api.sendChat(activeUser._id, msg);
      setChatHistory((prev) => {
        const clean = prev.filter((m) => m._id !== tempUser._id);
        return [...clean, data.userMessage, data.assistantMessage];
      });
    } catch (e) {
      setChatHistory((prev) => [
        ...prev.filter((m) => m._id !== tempUser._id),
        tempUser,
        {
          _id: `err_${tempIdRef.current}`,
          sender: "assistant",
          text: "I'm having trouble connecting. Please check your network and try again.",
          timestamp: new Date().toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit" }),
        },
      ]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView style={styles.container} behavior={Platform.OS === "ios" ? "padding" : undefined} keyboardVerticalOffset={90}>
      <View style={styles.header}>
        <View style={styles.aiAvatar}>
          <Ionicons name="sparkles" size={18} color="#fff" />
        </View>
        <View>
          <Text style={styles.headerTitle}>LifeXp AI Companion</Text>
          <Text style={styles.headerSub}>Friendly report analysis</Text>
        </View>
        <View style={styles.onlineBadge}>
          <Text style={styles.onlineText}>ONLINE</Text>
        </View>
      </View>

      <FlatList
        ref={listRef}
        data={chatHistory}
        keyExtractor={(item) => item._id}
        renderItem={({ item }) => <ChatBubble message={item} />}
        contentContainerStyle={styles.list}
        ListFooterComponent={loading ? <TypingIndicator /> : null}
      />

      <View style={styles.pills}>
        {QUICK_PILLS.map((pill) => (
          <TouchableOpacity
            key={pill}
            style={styles.pill}
            onPress={() => send(`Can you tell me about ${pill.toLowerCase()}?`)}
          >
            <Text style={styles.pillText}>{pill}</Text>
          </TouchableOpacity>
        ))}
      </View>

      <View style={styles.inputRow}>
        <TextInput
          style={styles.input}
          value={input}
          onChangeText={setInput}
          placeholder="Ask about your report, symptoms, meds..."
          placeholderTextColor={colors.textMuted}
          onSubmitEditing={() => send()}
        />
        <TouchableOpacity style={styles.sendBtn} onPress={() => send()}>
          <Ionicons name="send" size={18} color="#fff" />
        </TouchableOpacity>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#FAF5F0" },
  header: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    padding: spacing.md,
    backgroundColor: colors.surface,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  aiAvatar: { width: 36, height: 36, borderRadius: 18, backgroundColor: colors.violet, alignItems: "center", justifyContent: "center" },
  headerTitle: { fontSize: 13, fontWeight: "700", color: colors.text },
  headerSub: { fontSize: 9, color: colors.primary, fontWeight: "600" },
  onlineBadge: { marginLeft: "auto", backgroundColor: colors.successBg, paddingHorizontal: 8, paddingVertical: 4, borderRadius: radius.full },
  onlineText: { fontSize: 9, fontWeight: "700", color: colors.success },
  list: { padding: spacing.md, paddingBottom: spacing.lg },
  bubble: { maxWidth: "85%", padding: 12, borderRadius: radius.lg, marginBottom: 10 },
  userBubble: { alignSelf: "flex-end", backgroundColor: colors.amber, borderBottomRightRadius: 4 },
  aiBubble: { alignSelf: "flex-start", backgroundColor: colors.surface, borderWidth: 1, borderColor: colors.border, borderBottomLeftRadius: 4 },
  bubbleText: { fontSize: 13, lineHeight: 20, color: colors.text },
  userText: { color: "#fff" },
  time: { fontSize: 9, color: colors.textMuted, marginTop: 6, fontFamily: "monospace" },
  userTime: { color: "rgba(255,255,255,0.7)" },
  typing: { flexDirection: "row", alignItems: "center", gap: 8 },
  dots: { flexDirection: "row", gap: 4 },
  dot: { width: 8, height: 8, borderRadius: 4, backgroundColor: colors.violet },
  typingText: { fontSize: 10, color: colors.textMuted },
  pills: {
    flexDirection: "row",
    flexWrap: "wrap",
    backgroundColor: colors.surface,
    borderTopWidth: 1,
    borderTopColor: colors.border,
    paddingHorizontal: spacing.md,
    paddingVertical: 8,
    gap: 6,
  },
  pill: { paddingHorizontal: 10, paddingVertical: 6, backgroundColor: "#FAFAF9", borderRadius: radius.sm, borderWidth: 1, borderColor: colors.border },
  pillText: { fontSize: 10, color: colors.textMuted, fontWeight: "600" },
  inputRow: { flexDirection: "row", padding: spacing.md, gap: 8, backgroundColor: colors.surface, borderTopWidth: 1, borderTopColor: colors.border },
  input: { flex: 1, backgroundColor: colors.surfaceAlt, borderWidth: 1, borderColor: colors.border, borderRadius: radius.md, paddingHorizontal: 14, paddingVertical: 10, fontSize: 13 },
  sendBtn: { backgroundColor: colors.primary, width: 44, height: 44, borderRadius: radius.md, alignItems: "center", justifyContent: "center" },
});
