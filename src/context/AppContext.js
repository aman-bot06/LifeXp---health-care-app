import React, { createContext, useContext, useState, useCallback } from "react";
import * as Speech from "expo-speech";
import { api } from "../api/client";

const AppContext = createContext(null);

export function AppProvider({ children }) {
  const [activeUser, setActiveUser] = useState(null);
  const [dbMode, setDbMode] = useState("Connecting...");
  const [vitals, setVitals] = useState({ heartRate: 72, bloodPressure: "120/80", bloodSugar: 94 });
  const [medications, setMedications] = useState([]);
  const [water, setWater] = useState({ currentAmount: 0, targetAmount: 2.5, logsCount: 0 });
  const [family, setFamily] = useState([]);
  const [notifications, setNotifications] = useState([]);
  const [chatHistory, setChatHistory] = useState([]);
  const [doctors, setDoctors] = useState([]);
  const [appointments, setAppointments] = useState([]);
  const [dailyReports, setDailyReports] = useState([]);
  const [doctorReports, setDoctorReports] = useState([]);
  const [voiceAssist, setVoiceAssistState] = useState(true);

  const checkStatus = useCallback(async () => {
    try {
      const data = await api.getStatus();
      setDbMode(data.dbMode);
    } catch {
      setDbMode("Offline");
    }
  }, []);

  const loadUserData = useCallback(async (userId) => {
    try {
      const [vitalsList, meds, waterData, familyData, notifs, chat, docList, appts, reports, doctorReportData] = await Promise.all([
        api.getVitals(userId),
        api.getMedications(userId),
        api.getWater(userId),
        api.getFamily(userId),
        api.getNotifications(userId),
        api.getChat(userId),
        api.getDoctors().catch(() => []),
        api.getAppointments(userId).catch(() => []),
        api.getDailyReports(userId).catch(() => []),
        api.getDoctorReports(userId).catch(() => []),
      ]);

      if (vitalsList?.length) setVitals(vitalsList[vitalsList.length - 1]);
      setMedications(meds || []);
      setWater(waterData || { currentAmount: 0, targetAmount: 2.5, logsCount: 0 });
      setFamily(familyData || []);
      setNotifications(notifs || []);
      setChatHistory(chat || []);
      if (docList?.length) setDoctors(docList);
      setAppointments(appts || []);
      setDailyReports(reports || []);
      setDoctorReports(doctorReportData || []);
    } catch (e) {
      console.warn("Failed to load user data:", e.message);
    }
  }, []);

  const login = async (usernameOrEmail, password) => {
    const data = await api.login(usernameOrEmail, password);
    if (data.success) {
      setActiveUser(data.user);
      await loadUserData(data.user._id);
    }
    return data;
  };

  const logout = () => {
    setActiveUser(null);
    setMedications([]);
    setFamily([]);
    setNotifications([]);
    setChatHistory([]);
    setAppointments([]);
    setDailyReports([]);
    setDoctorReports([]);
  };

  const setVoiceAssist = useCallback((enabled) => {
    setVoiceAssistState(enabled);
    if (!enabled) {
      Speech.stop();
      return;
    }
    Speech.stop();
    Speech.speak("Voice help is on.", {
      language: "en-US",
      pitch: 1,
      rate: 0.86,
    });
  }, []);

  const announce = useCallback(
    (message) => {
      if (voiceAssist && message) {
        Speech.stop();
        Speech.speak(message, {
          language: "en-US",
          pitch: 1,
          rate: 0.86,
        });
      }
    },
    [voiceAssist]
  );

  const value = {
    activeUser,
    setActiveUser,
    dbMode,
    vitals,
    setVitals,
    medications,
    setMedications,
    water,
    setWater,
    family,
    setFamily,
    notifications,
    setNotifications,
    chatHistory,
    setChatHistory,
    doctors,
    setDoctors,
    appointments,
    setAppointments,
    dailyReports,
    setDailyReports,
    doctorReports,
    setDoctorReports,
    voiceAssist,
    setVoiceAssist,
    announce,
    checkStatus,
    loadUserData,
    login,
    logout,
  };

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
}

export function useApp() {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error("useApp must be used within AppProvider");
  return ctx;
}
