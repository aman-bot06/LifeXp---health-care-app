import AsyncStorage from '@react-native-async-storage/async-storage';
import { initializeApp, getApps, getApp } from 'firebase/app';
import { 
  getAuth, 
  signInWithEmailAndPassword, 
  createUserWithEmailAndPassword, 
  signOut, 
  onAuthStateChanged 
} from 'firebase/auth';
import { 
  getFirestore, 
  doc, 
  setDoc, 
  getDoc, 
  updateDoc, 
  collection, 
  addDoc, 
  getDocs, 
  query, 
  where, 
  orderBy 
} from 'firebase/firestore';

// ==========================================
// FIREBASE CONFIGURATION
// ==========================================
// Replace these with your actual Firebase Project credentials:
const firebaseConfig = {
  apiKey: "YOUR_API_KEY_HERE",
  authDomain: "YOUR_PROJECT_ID.firebaseapp.com",
  projectId: "YOUR_PROJECT_ID",
  storageBucket: "YOUR_PROJECT_ID.appspot.com",
  messagingSenderId: "YOUR_MESSAGING_SENDER_ID",
  appId: "YOUR_APP_ID"
};

// Check if credentials are placeholders
const isFirebaseMocked = 
  !firebaseConfig.apiKey || 
  firebaseConfig.apiKey.includes("YOUR_API_KEY_HERE");

let firebaseApp = null;
let firebaseAuth = null;
let firestoreDb = null;

if (!isFirebaseMocked) {
  try {
    firebaseApp = getApps().length === 0 ? initializeApp(firebaseConfig) : getApp();
    firebaseAuth = getAuth(firebaseApp);
    firestoreDb = getFirestore(firebaseApp);
    console.log("🔥 Real Firebase and Firestore initialized successfully!");
  } catch (err) {
    console.warn("⚠️ Failed to initialize Real Firebase, falling back to mock database:", err);
  }
} else {
  console.log("ℹ️ Running in Mock Database mode (no real Firebase config provided). Data will persist in AsyncStorage.");
}

// ==========================================
// MOCK DATA STORAGE HELPERS (ASYNCTORAGE)
// ==========================================
const MOCK_STORAGE_KEYS = {
  USERS: '@lifexp_users',
  ACTIVE_USER_ID: '@lifexp_active_user_id',
  VITALS: '@lifexp_vitals_',
  MEDICATIONS: '@lifexp_medications_',
  WATER: '@lifexp_water_',
  SLEEP: '@lifexp_sleep_',
  FAMILY: '@lifexp_family_',
  DOCTORS: '@lifexp_doctors_'
};

const getMockData = async (key, defaultValue = []) => {
  try {
    const val = await AsyncStorage.getItem(key);
    return val ? JSON.parse(val) : defaultValue;
  } catch (e) {
    console.error("Error reading mock data:", e);
    return defaultValue;
  }
};

const saveMockData = async (key, data) => {
  try {
    await AsyncStorage.setItem(key, JSON.stringify(data));
  } catch (e) {
    console.error("Error writing mock data:", e);
  }
};

// Seed Mock Data if empty
const seedMockDataIfEmpty = async (userId) => {
  const vitalsKey = MOCK_STORAGE_KEYS.VITALS + userId;
  const currentVitals = await getMockData(vitalsKey, null);
  if (!currentVitals) {
    // Seed vitals
    const now = new Date();
    const mockVitals = [
      { id: '1', timestamp: new Date(now - 48*60*60*1000).toISOString(), heartRate: 74, bloodPressure: "122/81", bloodSugar: 96 },
      { id: '2', timestamp: new Date(now - 24*60*60*1000).toISOString(), heartRate: 75, bloodPressure: "121/79", bloodSugar: 98 },
      { id: '3', timestamp: now.toISOString(), heartRate: 72, bloodPressure: "120/80", bloodSugar: 94 }
    ];
    await saveMockData(vitalsKey, mockVitals);
  }

  const medKey = MOCK_STORAGE_KEYS.MEDICATIONS + userId;
  const currentMeds = await getMockData(medKey, null);
  if (!currentMeds) {
    const mockMeds = [
      { id: 'm1', name: 'Lisinopril', dosage: '10mg', timing: 'After Breakfast', checkLogs: {} },
      { id: 'm2', name: 'Metformin', dosage: '500mg', timing: 'After Lunch', checkLogs: {} },
      { id: 'm3', name: 'Atorvastatin', dosage: '20mg', timing: 'Before Bed', checkLogs: {} }
    ];
    await saveMockData(medKey, mockMeds);
  }

  const waterKey = MOCK_STORAGE_KEYS.WATER + userId;
  const currentWater = await getMockData(waterKey, null);
  if (!currentWater) {
    const today = new Date().toISOString().split('T')[0];
    const mockWater = {};
    mockWater[today] = 1800; // 1.8L
    await saveMockData(waterKey, mockWater);
  }

  const sleepKey = MOCK_STORAGE_KEYS.SLEEP + userId;
  const currentSleep = await getMockData(sleepKey, null);
  if (!currentSleep) {
    const today = new Date().toISOString().split('T')[0];
    const mockSleep = {};
    mockSleep[today] = 7.75; // 7h 45m
    await saveMockData(sleepKey, mockSleep);
  }

  const familyKey = MOCK_STORAGE_KEYS.FAMILY + userId;
  const currentFamily = await getMockData(familyKey, null);
  if (!currentFamily) {
    const mockFamily = [
      { id: 'f1', name: 'James', relation: 'Son', age: 14, conditions: 'Asthma' },
      { id: 'f2', name: 'David', relation: 'Husband', age: 46, conditions: 'None' }
    ];
    await saveMockData(familyKey, mockFamily);
  }

  const doctorKey = MOCK_STORAGE_KEYS.DOCTORS + userId;
  const currentDoctors = await getMockData(doctorKey, null);
  if (!currentDoctors) {
    const mockDoctors = [
      { id: 'd1', name: 'Dr. Evelyn Martinez', specialty: 'Cardiologist', contact: '555-0199' },
      { id: 'd2', name: 'Dr. Aris Thorne', specialty: 'General Practitioner', contact: '555-0142' }
    ];
    await saveMockData(doctorKey, mockDoctors);
  }
};

// ==========================================
// EXPORTED SERVICES
// ==========================================

// --- AUTHENTICATION SERVICES ---

export const signUpUser = async (email, password, name) => {
  if (isFirebaseMocked) {
    const users = await getMockData(MOCK_STORAGE_KEYS.USERS, {});
    if (users[email]) {
      throw new Error("User already exists!");
    }
    const newUserId = 'mock_uid_' + Math.random().toString(36).substring(7);
    users[email] = {
      userId: newUserId,
      email,
      password, // Note: plain password is just for local mock database
      name,
      age: 42,
      height: "165 cm",
      weight: "68 kg",
      chronicConditions: "Hypertension"
    };
    await saveMockData(MOCK_STORAGE_KEYS.USERS, users);
    await AsyncStorage.setItem(MOCK_STORAGE_KEYS.ACTIVE_USER_ID, newUserId);
    await seedMockDataIfEmpty(newUserId);
    return { uid: newUserId, email, displayName: name };
  } else {
    const userCredential = await createUserWithEmailAndPassword(firebaseAuth, email, password);
    const user = userCredential.user;
    
    // Save to Firestore
    await setDoc(doc(firestoreDb, "users", user.uid), {
      userId: user.uid,
      email,
      name,
      age: 42,
      height: "165 cm",
      weight: "68 kg",
      chronicConditions: "Hypertension"
    });
    
    await seedMockDataIfEmpty(user.uid);
    return user;
  }
};

export const signInUser = async (email, password) => {
  if (isFirebaseMocked) {
    const users = await getMockData(MOCK_STORAGE_KEYS.USERS, {});
    const userProfile = users[email];
    if (!userProfile || userProfile.password !== password) {
      throw new Error("Invalid email or password");
    }
    const newUserId = userProfile.userId;
    await AsyncStorage.setItem(MOCK_STORAGE_KEYS.ACTIVE_USER_ID, newUserId);
    await seedMockDataIfEmpty(newUserId);
    return { uid: newUserId, email, displayName: userProfile.name };
  } else {
    const userCredential = await signInWithEmailAndPassword(firebaseAuth, email, password);
    return userCredential.user;
  }
};

export const signOutUser = async () => {
  if (isFirebaseMocked) {
    await AsyncStorage.removeItem(MOCK_STORAGE_KEYS.ACTIVE_USER_ID);
    return true;
  } else {
    await signOut(firebaseAuth);
    return true;
  }
};

export const subscribeToAuthChanges = (callback) => {
  if (isFirebaseMocked) {
    // Check initial active user
    AsyncStorage.getItem(MOCK_STORAGE_KEYS.ACTIVE_USER_ID).then(async (userId) => {
      if (userId) {
        const users = await getMockData(MOCK_STORAGE_KEYS.USERS, {});
        const profile = Object.values(users).find(u => u.userId === userId);
        if (profile) {
          callback({ uid: userId, email: profile.email, displayName: profile.name });
        } else {
          callback(null);
        }
      } else {
        callback(null);
      }
    });

    // Return unsubscriber
    return () => {};
  } else {
    return onAuthStateChanged(firebaseAuth, callback);
  }
};

// --- USER PROFILE SERVICES ---

export const getUserProfile = async (userId) => {
  if (isFirebaseMocked) {
    const users = await getMockData(MOCK_STORAGE_KEYS.USERS, {});
    const profile = Object.values(users).find(u => u.userId === userId);
    return profile || { name: 'Sarah', age: 42, height: "165 cm", weight: "68 kg", chronicConditions: "Hypertension" };
  } else {
    const docRef = doc(firestoreDb, "users", userId);
    const docSnap = await getDoc(docRef);
    return docSnap.exists() ? docSnap.data() : null;
  }
};

export const updateUserProfile = async (userId, data) => {
  if (isFirebaseMocked) {
    const users = await getMockData(MOCK_STORAGE_KEYS.USERS, {});
    // Find matching email
    const email = Object.keys(users).find(key => users[key].userId === userId);
    if (email) {
      users[email] = { ...users[email], ...data };
      await saveMockData(MOCK_STORAGE_KEYS.USERS, users);
    }
    return true;
  } else {
    const docRef = doc(firestoreDb, "users", userId);
    await updateDoc(docRef, data);
    return true;
  }
};

// --- VITALS SERVICES ---

export const getVitals = async (userId) => {
  if (isFirebaseMocked) {
    const key = MOCK_STORAGE_KEYS.VITALS + userId;
    const items = await getMockData(key, []);
    return items.sort((a, b) => new Date(a.timestamp) - new Date(b.timestamp));
  } else {
    const q = query(collection(firestoreDb, `users/${userId}/vitals`), orderBy("timestamp", "asc"));
    const querySnapshot = await getDocs(q);
    const results = [];
    querySnapshot.forEach((doc) => {
      results.push({ id: doc.id, ...doc.data() });
    });
    return results;
  }
};

export const addVital = async (userId, heartRate, bloodPressure, bloodSugar) => {
  const data = {
    timestamp: new Date().toISOString(),
    heartRate: parseInt(heartRate),
    bloodPressure: bloodPressure,
    bloodSugar: parseInt(bloodSugar)
  };

  if (isFirebaseMocked) {
    const key = MOCK_STORAGE_KEYS.VITALS + userId;
    const items = await getMockData(key, []);
    data.id = 'vital_' + Math.random().toString(36).substring(7);
    items.push(data);
    await saveMockData(key, items);
    return data;
  } else {
    const docRef = await addDoc(collection(firestoreDb, `users/${userId}/vitals`), data);
    return { id: docRef.id, ...data };
  }
};

// --- MEDICATIONS SERVICES ---

export const getMedications = async (userId) => {
  if (isFirebaseMocked) {
    const key = MOCK_STORAGE_KEYS.MEDICATIONS + userId;
    return await getMockData(key, []);
  } else {
    const querySnapshot = await getDocs(collection(firestoreDb, `users/${userId}/medications`));
    const results = [];
    querySnapshot.forEach((doc) => {
      results.push({ id: doc.id, ...doc.data() });
    });
    return results;
  }
};

export const addMedication = async (userId, name, dosage, timing) => {
  const data = {
    name,
    dosage,
    timing,
    checkLogs: {} // Keyed by date YYYY-MM-DD: true/false
  };

  if (isFirebaseMocked) {
    const key = MOCK_STORAGE_KEYS.MEDICATIONS + userId;
    const items = await getMockData(key, []);
    data.id = 'med_' + Math.random().toString(36).substring(7);
    items.push(data);
    await saveMockData(key, items);
    return data;
  } else {
    const docRef = await addDoc(collection(firestoreDb, `users/${userId}/medications`), data);
    return { id: docRef.id, ...data };
  }
};

export const toggleMedicationCheck = async (userId, medId, dateStr, checked) => {
  if (isFirebaseMocked) {
    const key = MOCK_STORAGE_KEYS.MEDICATIONS + userId;
    const items = await getMockData(key, []);
    const idx = items.findIndex(item => item.id === medId);
    if (idx !== -1) {
      if (!items[idx].checkLogs) items[idx].checkLogs = {};
      items[idx].checkLogs[dateStr] = checked;
      await saveMockData(key, items);
    }
    return true;
  } else {
    const docRef = doc(firestoreDb, `users/${userId}/medications`, medId);
    const updateField = `checkLogs.${dateStr}`;
    await updateDoc(docRef, {
      [updateField]: checked
    });
    return true;
  }
};

// --- WATER INTAKE SERVICES ---

export const getWaterLogs = async (userId) => {
  if (isFirebaseMocked) {
    const key = MOCK_STORAGE_KEYS.WATER + userId;
    return await getMockData(key, {});
  } else {
    const docRef = doc(firestoreDb, `users/${userId}/water`, "dailyLogs");
    const docSnap = await getDoc(docRef);
    return docSnap.exists() ? docSnap.data() : {};
  }
};

export const logWater = async (userId, dateStr, amount) => {
  if (isFirebaseMocked) {
    const key = MOCK_STORAGE_KEYS.WATER + userId;
    const logs = await getMockData(key, {});
    logs[dateStr] = (logs[dateStr] || 0) + amount;
    await saveMockData(key, logs);
    return logs[dateStr];
  } else {
    const docRef = doc(firestoreDb, `users/${userId}/water`, "dailyLogs");
    const docSnap = await getDoc(docRef);
    let currentAmount = 0;
    if (docSnap.exists()) {
      currentAmount = docSnap.data()[dateStr] || 0;
    }
    const updatedAmount = currentAmount + amount;
    await setDoc(docRef, { [dateStr]: updatedAmount }, { merge: true });
    return updatedAmount;
  }
};

// --- SLEEP SERVICES ---

export const getSleepLogs = async (userId) => {
  if (isFirebaseMocked) {
    const key = MOCK_STORAGE_KEYS.SLEEP + userId;
    return await getMockData(key, {});
  } else {
    const docRef = doc(firestoreDb, `users/${userId}/sleep`, "dailyLogs");
    const docSnap = await getDoc(docRef);
    return docSnap.exists() ? docSnap.data() : {};
  }
};

export const logSleep = async (userId, dateStr, hours) => {
  if (isFirebaseMocked) {
    const key = MOCK_STORAGE_KEYS.SLEEP + userId;
    const logs = await getMockData(key, {});
    logs[dateStr] = hours;
    await saveMockData(key, logs);
    return hours;
  } else {
    const docRef = doc(firestoreDb, `users/${userId}/sleep`, "dailyLogs");
    await setDoc(docRef, { [dateStr]: hours }, { merge: true });
    return hours;
  }
};

// --- FAMILY SERVICES ---

export const getFamilyMembers = async (userId) => {
  if (isFirebaseMocked) {
    const key = MOCK_STORAGE_KEYS.FAMILY + userId;
    return await getMockData(key, []);
  } else {
    const querySnapshot = await getDocs(collection(firestoreDb, `users/${userId}/family`));
    const results = [];
    querySnapshot.forEach((doc) => {
      results.push({ id: doc.id, ...doc.data() });
    });
    return results;
  }
};

export const addFamilyMember = async (userId, name, relation, age, conditions) => {
  const data = { name, relation, age: parseInt(age) || 0, conditions };
  if (isFirebaseMocked) {
    const key = MOCK_STORAGE_KEYS.FAMILY + userId;
    const items = await getMockData(key, []);
    data.id = 'fam_' + Math.random().toString(36).substring(7);
    items.push(data);
    await saveMockData(key, items);
    return data;
  } else {
    const docRef = await addDoc(collection(firestoreDb, `users/${userId}/family`), data);
    return { id: docRef.id, ...data };
  }
};

// --- DOCTOR SERVICES ---

export const getDoctors = async (userId) => {
  if (isFirebaseMocked) {
    const key = MOCK_STORAGE_KEYS.DOCTORS + userId;
    return await getMockData(key, []);
  } else {
    const querySnapshot = await getDocs(collection(firestoreDb, `users/${userId}/doctors`));
    const results = [];
    querySnapshot.forEach((doc) => {
      results.push({ id: doc.id, ...doc.data() });
    });
    return results;
  }
};

export const addDoctor = async (userId, name, specialty, contact) => {
  const data = { name, specialty, contact };
  if (isFirebaseMocked) {
    const key = MOCK_STORAGE_KEYS.DOCTORS + userId;
    const items = await getMockData(key, []);
    data.id = 'doc_' + Math.random().toString(36).substring(7);
    items.push(data);
    await saveMockData(key, items);
    return data;
  } else {
    const docRef = await addDoc(collection(firestoreDb, `users/${userId}/doctors`), data);
    return { id: docRef.id, ...data };
  }
};
