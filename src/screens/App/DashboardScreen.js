import React, { useState, useEffect } from 'react';
import { 
  StyleSheet, 
  Text, 
  View, 
  ScrollView, 
  Pressable, 
  Modal, 
  TextInput, 
  KeyboardAvoidingView, 
  Platform,
  Alert,
  ActivityIndicator
} from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import Svg, { Circle } from 'react-native-svg';
import Card from '../../components/Card';
import Button from '../../components/Button';
import Input from '../../components/Input';
import { 
  getVitals, 
  addVital, 
  getMedications, 
  toggleMedicationCheck, 
  getWaterLogs, 
  logWater, 
  getSleepLogs, 
  logSleep,
  getUserProfile,
  signOutUser
} from '../../config/firebase';
import AsyncStorage from '@react-native-async-storage/async-storage';

export default function DashboardScreen() {
  const [userId, setUserId] = useState(null);
  const [userName, setUserName] = useState('Sarah');
  const [vitals, setVitals] = useState({ heartRate: '--', bloodPressure: '--/--', bloodSugar: '--' });
  const [medications, setMedications] = useState([]);
  const [waterAmount, setWaterAmount] = useState(0);
  const [sleepHours, setSleepHours] = useState(0);
  const [loading, setLoading] = useState(true);

  // Vitals Log Modal State
  const [vitalsModalVisible, setVitalsModalVisible] = useState(false);
  const [newHeartRate, setNewHeartRate] = useState('');
  const [newBP, setNewBP] = useState('');
  const [newSugar, setNewSugar] = useState('');

  // AI Assistant Popover State
  const [aiVisible, setAiVisible] = useState(false);
  const [aiMessage, setAiMessage] = useState('How are you feeling after your Lisinopril dose today?');

  const todayStr = new Date().toISOString().split('T')[0];

  useEffect(() => {
    fetchInitialData();
  }, []);

  const fetchInitialData = async () => {
    setLoading(true);
    try {
      const activeUid = await AsyncStorage.getItem('@lifexp_active_user_id');
      if (activeUid) {
        setUserId(activeUid);

        // Fetch User Profile Name
        const profile = await getUserProfile(activeUid);
        if (profile && profile.name) {
          setUserName(profile.name.split(' ')[0]);
        }

        // Fetch Vitals
        const vitalsList = await getVitals(activeUid);
        if (vitalsList.length > 0) {
          const latest = vitalsList[vitalsList.length - 1];
          setVitals({
            heartRate: latest.heartRate,
            bloodPressure: latest.bloodPressure,
            bloodSugar: latest.bloodSugar
          });
        }

        // Fetch Meds
        const medsList = await getMedications(activeUid);
        setMedications(medsList);

        // Fetch Water
        const waterLogs = await getWaterLogs(activeUid);
        setWaterAmount(waterLogs[todayStr] || 0);

        // Fetch Sleep
        const sleepLogs = await getSleepLogs(activeUid);
        setSleepHours(sleepLogs[todayStr] || 0);
      }
    } catch (e) {
      console.error("Error fetching dashboard data:", e);
    } finally {
      setLoading(false);
    }
  };

  const handleLogVitals = async () => {
    if (!newHeartRate || !newBP || !newSugar) {
      Alert.alert("Missing Fields", "Please fill in all vitals fields.");
      return;
    }
    try {
      await addVital(userId, newHeartRate, newBP, newSugar);
      setVitals({
        heartRate: parseInt(newHeartRate),
        bloodPressure: newBP,
        bloodSugar: parseInt(newSugar)
      });
      setVitalsModalVisible(false);
      setNewHeartRate('');
      setNewBP('');
      setNewSugar('');
    } catch (e) {
      Alert.alert("Error Logging Vitals", e.message);
    }
  };

  const handleToggleMed = async (medId, checked) => {
    try {
      await toggleMedicationCheck(userId, medId, todayStr, checked);
      // Local state update
      setMedications(prev => prev.map(m => {
        if (m.id === medId) {
          const logs = m.checkLogs ? { ...m.checkLogs } : {};
          logs[todayStr] = checked;
          return { ...m, checkLogs: logs };
        }
        return m;
      }));
    } catch (e) {
      console.error("Error toggling medication check:", e);
    }
  };

  const handleLogWater = async () => {
    try {
      const updated = await logWater(userId, todayStr, 250);
      setWaterAmount(updated);
    } catch (e) {
      console.error("Error logging water:", e);
    }
  };

  const handleLogout = () => {
    Alert.alert("Sign Out", "Are you sure you want to sign out?", [
      { text: "Cancel", style: "cancel" },
      { text: "Sign Out", onPress: () => signOutUser() }
    ]);
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#810b38" />
      </View>
    );
  }

  // Circular progress configuration for Sleep (8h goal)
  const size = 110;
  const strokeWidth = 10;
  const radius = (size - strokeWidth) / 2;
  const circumference = radius * 2 * Math.PI;
  const sleepPercentage = Math.min(sleepHours / 8, 1);
  const strokeDashoffset = circumference - sleepPercentage * circumference;

  return (
    <View style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContainer} showsVerticalScrollIndicator={false}>
        
        {/* Welcome Section */}
        <View style={styles.welcomeRow}>
          <View>
            <Text style={styles.welcomeText}>Good morning,</Text>
            <Text style={styles.userName}>{userName}</Text>
          </View>
          <Pressable style={styles.logoutBtn} onPress={handleLogout}>
            <MaterialIcons name="logout" size={22} color="#8a7175" />
          </Pressable>
        </View>

        <Text style={styles.summaryText}>Your health summary for today is looking great.</Text>

        {/* Bento Grid layout */}

        {/* Vitals Column */}
        <View style={styles.vitalsRow}>
          {/* Heart Rate */}
          <Pressable style={styles.vitalCard} onPress={() => setVitalsModalVisible(true)}>
            <View style={[styles.iconBox, { backgroundColor: '#ffd9df' }]}>
              <MaterialIcons name="favorite" size={18} color="#810b38" />
            </View>
            <Text style={styles.vitalLabel}>Heart Rate</Text>
            <Text style={styles.vitalValue}>
              {vitals.heartRate} <Text style={styles.vitalUnit}>bpm</Text>
            </Text>
          </Pressable>

          {/* Blood Pressure */}
          <Pressable style={styles.vitalCard} onPress={() => setVitalsModalVisible(true)}>
            <View style={[styles.iconBox, { backgroundColor: '#ffd9df' }]}>
              <MaterialIcons name="speed" size={18} color="#810b38" />
            </View>
            <Text style={styles.vitalLabel}>Blood Pressure</Text>
            <Text style={[styles.vitalValue, { fontSize: 16 }]}>
              {vitals.bloodPressure} <Text style={styles.vitalUnit}>mmHg</Text>
            </Text>
          </Pressable>

          {/* Blood Sugar */}
          <Pressable style={styles.vitalCard} onPress={() => setVitalsModalVisible(true)}>
            <View style={[styles.iconBox, { backgroundColor: '#ffd9df' }]}>
              <MaterialIcons name="opacity" size={18} color="#810b38" />
            </View>
            <Text style={styles.vitalLabel}>Blood Sugar</Text>
            <Text style={styles.vitalValue}>
              {vitals.bloodSugar} <Text style={styles.vitalUnit}>mg/dL</Text>
            </Text>
          </Pressable>
        </View>

        {/* Medications List */}
        <Card title="Medications" headerRight={<Text style={styles.viewAllMeds}>Daily Schedule</Text>}>
          <View style={styles.medsList}>
            {medications.map(med => {
              const isChecked = med.checkLogs && med.checkLogs[todayStr] === true;
              return (
                <View key={med.id} style={styles.medItem}>
                  <View style={styles.medIconBox}>
                    <MaterialIcons name="grain" size={20} color="#810b38" />
                  </View>
                  <View style={styles.medInfo}>
                    <Text style={styles.medName}>{med.name}</Text>
                    <Text style={styles.medDosage}>{med.dosage} • {med.timing}</Text>
                  </View>
                  <Pressable 
                    onPress={() => handleToggleMed(med.id, !isChecked)}
                    style={[
                      styles.checkbox,
                      isChecked && styles.checkboxChecked
                    ]}
                  >
                    {isChecked && <MaterialIcons name="check" size={16} color="#ffffff" />}
                  </Pressable>
                </View>
              );
            })}
            {medications.length === 0 && (
              <Text style={styles.emptyText}>No medications logged today.</Text>
            )}
          </View>
        </Card>

        {/* Water & Sleep Side-by-Side */}
        <View style={styles.row}>
          {/* Water Card */}
          <View style={[styles.halfCard, styles.waterCard]}>
            <View style={styles.waterHeader}>
              <Text style={styles.halfCardTitle}>Hydration</Text>
              <Text style={styles.waterAmt}>{(waterAmount / 1000).toFixed(1)} <Text style={styles.waterAmtLabel}>/ 2.5 L</Text></Text>
            </View>
            <View style={styles.waterVisual}>
              <MaterialIcons name="local-drink" size={44} color="#810b38" style={{ opacity: 0.8 }} />
              <View style={styles.glassesContainer}>
                {[...Array(8)].map((_, i) => {
                  const loggedMl = (i + 1) * 312; // approx increments
                  const isActive = waterAmount >= loggedMl;
                  return (
                    <View 
                      key={i} 
                      style={[
                        styles.dotIndicator, 
                        isActive && styles.dotIndicatorActive
                      ]} 
                    />
                  );
                })}
              </View>
            </View>
            <Pressable style={styles.logWaterBtn} onPress={handleLogWater}>
              <MaterialIcons name="add" size={16} color="#810b38" />
              <Text style={styles.logWaterBtnText}>Log 250ml</Text>
            </Pressable>
          </View>

          {/* Sleep Card */}
          <View style={[styles.halfCard, styles.sleepCard]}>
            <Text style={styles.halfCardTitle}>Sleep Progress</Text>
            <View style={styles.sleepCircleContainer}>
              <Svg width={size} height={size}>
                <Circle
                  stroke="#f5dbc1"
                  fill="none"
                  cx={size / 2}
                  cy={size / 2}
                  r={radius}
                  strokeWidth={strokeWidth}
                />
                <Circle
                  stroke="#810b38"
                  fill="none"
                  cx={size / 2}
                  cy={size / 2}
                  r={radius}
                  strokeWidth={strokeWidth}
                  strokeDasharray={circumference}
                  strokeDashoffset={strokeDashoffset}
                  strokeLinecap="round"
                  transform={`rotate(-90 ${size / 2} ${size / 2})`}
                />
              </Svg>
              <View style={styles.sleepTextContainer}>
                <Text style={styles.sleepTimeText}>{sleepHours ? `${Math.floor(sleepHours)}h ${Math.round((sleepHours % 1) * 60)}m` : '--'}</Text>
                <Text style={styles.sleepGoalText}>Goal: 8h</Text>
              </View>
            </View>
          </View>
        </View>

      </ScrollView>

      {/* Floating AI Assistant Trigger */}
      <View style={styles.aiContainer}>
        <Pressable 
          style={styles.aiTrigger} 
          onPress={() => setAiVisible(!aiVisible)}
        >
          <MaterialIcons name="smart-toy" size={26} color="#ffffff" />
        </Pressable>

        {aiVisible && (
          <View style={styles.aiBubble}>
            <View style={styles.aiHeader}>
              <MaterialIcons name="smart-toy" size={18} color="#810b38" />
              <Text style={styles.aiTitle}>AI Health Assistant</Text>
            </View>
            <Text style={styles.aiMsgText}>{aiMessage}</Text>
            <View style={styles.aiActions}>
              <Pressable 
                style={styles.aiActionBtn} 
                onPress={() => {
                  setAiMessage("Excellent. Let's keep monitor your vitals and compliance today.");
                  setTimeout(() => setAiVisible(false), 2000);
                }}
              >
                <Text style={styles.aiActionText}>Feeling fine</Text>
              </Pressable>
              <Pressable 
                style={styles.aiActionBtn} 
                onPress={() => {
                  setAiMessage("You should check your Blood Pressure. I suggest taking a 10 min rest.");
                }}
              >
                <Text style={styles.aiActionText}>A bit dizzy</Text>
              </Pressable>
            </View>
          </View>
        )}
      </View>

      {/* Log Vitals Modal */}
      <Modal
        animationType="slide"
        transparent={true}
        visible={vitalsModalVisible}
        onRequestClose={() => setVitalsModalVisible(false)}
      >
        <KeyboardAvoidingView 
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          style={styles.modalOverlay}
        >
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Update Vitals</Text>
              <Pressable onPress={() => setVitalsModalVisible(false)}>
                <MaterialIcons name="close" size={24} color="#221a10" />
              </Pressable>
            </View>

            <Input
              label="Heart Rate (bpm)"
              placeholder="e.g. 72"
              value={newHeartRate}
              onChangeText={setNewHeartRate}
              keyboardType="number-pad"
            />

            <Input
              label="Blood Pressure (mmHg)"
              placeholder="e.g. 120/80"
              value={newBP}
              onChangeText={setNewBP}
            />

            <Input
              label="Blood Sugar (mg/dL)"
              placeholder="e.g. 94"
              value={newSugar}
              onChangeText={setNewSugar}
              keyboardType="number-pad"
            />

            <Button
              title="Save Vitals"
              onPress={handleLogVitals}
              style={styles.saveVitalsBtn}
            />
          </View>
        </KeyboardAvoidingView>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff8f3', // warm cream
  },
  scrollContainer: {
    padding: 20,
    paddingBottom: 100, // accommodate bottom tab bar height
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#fff8f3',
  },
  welcomeRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 10,
    marginBottom: 8,
  },
  welcomeText: {
    fontSize: 24,
    color: '#810b38',
    fontWeight: '400',
  },
  userName: {
    fontSize: 32,
    fontWeight: '700',
    color: '#810b38',
    lineHeight: 38,
  },
  logoutBtn: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#ffffff',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(129, 11, 56, 0.1)',
  },
  summaryText: {
    fontSize: 15,
    color: '#574145',
    marginBottom: 24,
  },
  vitalsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 20,
  },
  vitalCard: {
    flex: 1,
    backgroundColor: '#ffffff',
    marginHorizontal: 4,
    borderRadius: 16,
    padding: 12,
    borderWidth: 1,
    borderColor: 'rgba(129, 11, 56, 0.08)',
    shadowColor: '#810b38',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.04,
    shadowRadius: 8,
    elevation: 2,
    justifyContent: 'space-between',
    minHeight: 120,
  },
  iconBox: {
    width: 28,
    height: 28,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
    alignSelf: 'flex-start',
  },
  vitalLabel: {
    fontSize: 12,
    color: '#574145',
    fontWeight: '500',
    marginTop: 8,
  },
  vitalValue: {
    fontSize: 18,
    fontWeight: '700',
    color: '#810b38',
    marginTop: 4,
  },
  vitalUnit: {
    fontSize: 10,
    fontWeight: 'normal',
    color: '#8a7175',
  },
  viewAllMeds: {
    fontSize: 12,
    fontWeight: '600',
    color: '#810b38',
  },
  medsList: {
    marginTop: 4,
  },
  medItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#fecda',
  },
  medIconBox: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#fff1e3',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  medInfo: {
    flex: 1,
  },
  medName: {
    fontSize: 15,
    fontWeight: '600',
    color: '#221a10',
  },
  medDosage: {
    fontSize: 12,
    color: '#574145',
    marginTop: 2,
  },
  checkbox: {
    width: 24,
    height: 24,
    borderRadius: 12,
    borderWidth: 1.5,
    borderColor: '#8a7175',
    justifyContent: 'center',
    alignItems: 'center',
  },
  checkboxChecked: {
    backgroundColor: '#810b38',
    borderColor: '#810b38',
  },
  emptyText: {
    textAlign: 'center',
    color: '#8a7175',
    marginVertical: 12,
    fontSize: 14,
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  halfCard: {
    flex: 1,
    backgroundColor: '#ffffff',
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: 'rgba(129, 11, 56, 0.08)',
    shadowColor: '#810b38',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.04,
    shadowRadius: 8,
    elevation: 2,
    marginHorizontal: 4,
  },
  waterCard: {
    justifyContent: 'space-between',
    minHeight: 180,
  },
  waterHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  halfCardTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#810b38',
  },
  waterAmt: {
    fontSize: 18,
    fontWeight: '700',
    color: '#810b38',
  },
  waterAmtLabel: {
    fontSize: 11,
    fontWeight: 'normal',
    color: '#8a7175',
  },
  waterVisual: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginVertical: 12,
  },
  glassesContainer: {
    flex: 1,
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginLeft: 12,
    maxWidth: 80,
    gap: 4,
  },
  dotIndicator: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#f5dbc1',
  },
  dotIndicatorActive: {
    backgroundColor: '#810b38',
  },
  logWaterBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    height: 36,
    borderRadius: 18,
    backgroundColor: '#fff1e3',
    borderWidth: 1,
    borderColor: 'rgba(129, 11, 56, 0.15)',
  },
  logWaterBtnText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#810b38',
    marginLeft: 4,
  },
  sleepCard: {
    justifyContent: 'space-between',
    minHeight: 180,
  },
  sleepCircleContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
    marginTop: 8,
  },
  sleepTextContainer: {
    position: 'absolute',
    alignItems: 'center',
    justifyContent: 'center',
  },
  sleepTimeText: {
    fontSize: 16,
    fontWeight: '700',
    color: '#810b38',
  },
  sleepGoalText: {
    fontSize: 9,
    color: '#8a7175',
    marginTop: 2,
  },
  aiContainer: {
    position: 'absolute',
    bottom: 96,
    right: 16,
    alignItems: 'flex-end',
    zIndex: 99,
  },
  aiTrigger: {
    width: 52,
    height: 52,
    borderRadius: 26,
    backgroundColor: '#810b38',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#810b38',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.25,
    shadowRadius: 10,
    elevation: 5,
  },
  aiBubble: {
    backgroundColor: '#ffffff',
    width: 250,
    borderRadius: 16,
    padding: 14,
    bottom: 60,
    right: 0,
    position: 'absolute',
    borderWidth: 1,
    borderColor: 'rgba(129, 11, 56, 0.12)',
    shadowColor: '#810b38',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.12,
    shadowRadius: 16,
    elevation: 8,
  },
  aiHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
    gap: 6,
  },
  aiTitle: {
    fontSize: 13,
    fontWeight: '600',
    color: '#810b38',
  },
  aiMsgText: {
    fontSize: 13,
    color: '#574145',
    lineHeight: 18,
    marginBottom: 12,
  },
  aiActions: {
    flexDirection: 'row',
    gap: 8,
  },
  aiActionBtn: {
    flex: 1,
    height: 28,
    borderRadius: 6,
    backgroundColor: '#fff1e3',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(129, 11, 56, 0.08)',
  },
  aiActionText: {
    fontSize: 11,
    fontWeight: '600',
    color: '#810b38',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(34, 26, 16, 0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: '#fff8f3',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    padding: 24,
    paddingBottom: 40,
    maxHeight: '80%',
    shadowColor: '#221a10',
    shadowOffset: { width: 0, height: -10 },
    shadowOpacity: 0.1,
    shadowRadius: 20,
    elevation: 10,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#810b38',
  },
  saveVitalsBtn: {
    marginTop: 16,
  },
});
