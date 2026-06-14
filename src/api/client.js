import { Platform } from "react-native";

// Android emulator: 10.0.2.2 | iOS simulator: localhost | Physical device: your PC LAN IP
const DEV_HOST = Platform.OS === "android" ? "10.0.2.2" : "localhost";
export const API_BASE = process.env.EXPO_PUBLIC_API_URL || `http://${DEV_HOST}:3001/api`;

async function request(path, options = {}) {
  const url = `${API_BASE}${path}`;
  const res = await fetch(url, {
    headers: { "Content-Type": "application/json", ...options.headers },
    ...options,
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) {
    const err = new Error(data.error || `Request failed (${res.status})`);
    err.status = res.status;
    err.data = data;
    throw err;
  }
  return data;
}

export const api = {
  getStatus: () => request("/status"),

  login: (usernameOrEmail, password) =>
    request("/auth/login", {
      method: "POST",
      body: JSON.stringify({ usernameOrEmail, password }),
    }),

  registerUser: (payload) =>
    request("/auth/register-user", { method: "POST", body: JSON.stringify(payload) }),

  registerDoctor: (payload) =>
    request("/auth/register-doctor", { method: "POST", body: JSON.stringify(payload) }),

  getDoctors: () => request("/doctors"),
  searchUsers: (query, excludeUserId) =>
    request(`/users/search?q=${encodeURIComponent(query)}&excludeUserId=${encodeURIComponent(excludeUserId || "")}`),

  getVitals: (userId) => request(`/vitals/${userId}`),
  updateVitals: (userId, payload) =>
    request(`/vitals/${userId}`, { method: "POST", body: JSON.stringify(payload) }),
  getDailyReports: (userId) => request(`/daily-reports/${userId}`),
  createDailyReport: (userId, payload) =>
    request(`/daily-reports/${userId}`, { method: "POST", body: JSON.stringify(payload) }),
  getDoctorReports: (userId) => request(`/doctor-reports/${userId}`),
  createDoctorReport: (userId, payload) =>
    request(`/doctor-reports/${userId}`, { method: "POST", body: JSON.stringify(payload) }),

  getMedications: (userId) => request(`/medications/${userId}`),
  addMedication: (userId, payload) =>
    request(`/medications/${userId}`, { method: "POST", body: JSON.stringify(payload) }),
  updateMedication: (medId, payload) =>
    request(`/medications/${medId}`, { method: "PUT", body: JSON.stringify(payload) }),
  toggleMedication: (medId, taken) =>
    request(`/medications/toggle/${medId}`, { method: "POST", body: JSON.stringify({ taken }) }),

  getWater: (userId) => request(`/water/${userId}`),
  updateWater: (userId, payload) =>
    request(`/water/${userId}`, { method: "PUT", body: JSON.stringify(payload) }),
  logWater: (userId) => request(`/water/log/${userId}`, { method: "POST" }),

  getFamily: (userId) => request(`/family/${userId}`),
  addFamily: (userId, searchIdent, relationship) =>
    request(`/family/add/${userId}`, {
      method: "POST",
      body: JSON.stringify({ searchIdent, relationship }),
    }),

  getNotifications: (userId) => request(`/notifications/${userId}`),
  clearNotifications: (userId) => request(`/notifications/clear/${userId}`, { method: "POST" }),
  deleteNotification: (notifId) => request(`/notifications/${notifId}`, { method: "DELETE" }),

  getChat: (userId) => request(`/chat/${userId}`),
  sendChat: (userId, text) =>
    request(`/chat/${userId}`, { method: "POST", body: JSON.stringify({ text }) }),

  getAppointments: (userId) => request(`/appointments/${userId}`),
  bookAppointment: (userId, payload) =>
    request(`/appointments/${userId}`, { method: "POST", body: JSON.stringify(payload) }),
};
