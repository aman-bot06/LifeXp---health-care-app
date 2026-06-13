import React, { useState } from 'react';
import { StyleSheet, View, Modal, Text, Pressable, Alert, KeyboardAvoidingView, Platform } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { MaterialIcons } from '@expo/vector-icons';
import AppNavigator from './src/navigation/AppNavigator';
import Input from './src/components/Input';
import Button from './src/components/Button';
import { addVital, logWater, logSleep, addMedication } from './src/config/firebase';
import AsyncStorage from '@react-native-async-storage/async-storage';

export default function App() {
  const [quickAddVisible, setQuickAddVisible] = useState(false);
  
  // Specific quick add forms
  const [activeForm, setActiveForm] = useState(null); // 'vital' | 'water' | 'sleep' | 'med' | null
  
  // Form values
  const [hr, setHr] = useState('');
  const [bp, setBp] = useState('');
  const [bs, setBs] = useState('');
  const [waterMl, setWaterMl] = useState('');
  const [sleepHrs, setSleepHours] = useState('');
  const [medName, setMedName] = useState('');
  const [medDosage, setMedDosage] = useState('');
  const [medTiming, setMedTiming] = useState('');

  const handleOpenQuickAdd = () => {
    setQuickAddVisible(true);
    setActiveForm(null);
  };

  const handleSaveForm = async () => {
    try {
      const userId = await AsyncStorage.getItem('@lifexp_active_user_id');
      if (!userId) {
        Alert.alert("Sign In Required", "Please log in first.");
        setQuickAddVisible(false);
        return;
      }

      if (activeForm === 'vital') {
        if (!hr || !bp || !bs) throw new Error("Please fill in all vitals.");
        await addVital(userId, hr, bp, bs);
        Alert.alert("Success", "Vitals logged successfully!");
        setHr(''); setBp(''); setBs('');
      } else if (activeForm === 'water') {
        if (!waterMl) throw new Error("Please enter water amount.");
        await logWater(userId, new Date().toISOString().split('T')[0], parseInt(waterMl));
        Alert.alert("Success", "Water logged successfully!");
        setWaterMl('');
      } else if (activeForm === 'sleep') {
        if (!sleepHrs) throw new Error("Please enter sleep hours.");
        await logSleep(userId, new Date().toISOString().split('T')[0], parseFloat(sleepHrs));
        Alert.alert("Success", "Sleep logged successfully!");
        setSleepHours('');
      } else if (activeForm === 'med') {
        if (!medName || !medDosage || !medTiming) throw new Error("Please fill in all medication fields.");
        await addMedication(userId, medName, medDosage, medTiming);
        Alert.alert("Success", "Medication added successfully!");
        setMedName(''); setMedDosage(''); setMedTiming('');
      }

      setQuickAddVisible(false);
    } catch (e) {
      Alert.alert("Error Logging Data", e.message);
    }
  };

  return (
    <SafeAreaProvider style={styles.container}>
      <StatusBar style="dark" />
      <AppNavigator onQuickAddPress={handleOpenQuickAdd} />

      {/* Global Quick Add Action Sheet */}
      <Modal
        animationType="slide"
        transparent={true}
        visible={quickAddVisible}
        onRequestClose={() => setQuickAddVisible(false)}
      >
        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          style={styles.modalOverlay}
        >
          <View style={styles.modalContent}>
            
            {/* Header */}
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>
                {activeForm ? `Log ${activeForm.charAt(0).toUpperCase() + activeForm.slice(1)}` : 'Quick Action'}
              </Text>
              <Pressable onPress={() => setQuickAddVisible(false)}>
                <MaterialIcons name="close" size={24} color="#221a10" />
              </Pressable>
            </View>

            {/* Menu List (If no active form is chosen) */}
            {!activeForm && (
              <View style={styles.menuList}>
                <Pressable style={styles.menuItem} onPress={() => setActiveForm('vital')}>
                  <View style={[styles.menuIcon, { backgroundColor: '#ffd9df' }]}>
                    <MaterialIcons name="favorite" size={22} color="#810b38" />
                  </View>
                  <Text style={styles.menuText}>Log Vitals (Heart, BP, Sugar)</Text>
                  <MaterialIcons name="chevron-right" size={20} color="#8a7175" />
                </Pressable>

                <Pressable style={styles.menuItem} onPress={() => setActiveForm('water')}>
                  <View style={[styles.menuIcon, { backgroundColor: '#ffd9df' }]}>
                    <MaterialIcons name="local-drink" size={22} color="#810b38" />
                  </View>
                  <Text style={styles.menuText}>Log Water Intake</Text>
                  <MaterialIcons name="chevron-right" size={20} color="#8a7175" />
                </Pressable>

                <Pressable style={styles.menuItem} onPress={() => setActiveForm('sleep')}>
                  <View style={[styles.menuIcon, { backgroundColor: '#ffd9df' }]}>
                    <MaterialIcons name="bedtime" size={22} color="#810b38" />
                  </View>
                  <Text style={styles.menuText}>Log Sleep Duration</Text>
                  <MaterialIcons name="chevron-right" size={20} color="#8a7175" />
                </Pressable>

                <Pressable style={styles.menuItem} onPress={() => setActiveForm('med')}>
                  <View style={[styles.menuIcon, { backgroundColor: '#ffd9df' }]}>
                    <MaterialIcons name="grain" size={22} color="#810b38" />
                  </View>
                  <Text style={styles.menuText}>Add Medication</Text>
                  <MaterialIcons name="chevron-right" size={20} color="#8a7175" />
                </Pressable>
              </View>
            )}

            {/* Active Forms */}
            {activeForm === 'vital' && (
              <View>
                <Input label="Heart Rate (bpm)" placeholder="e.g. 72" value={hr} onChangeText={setHr} keyboardType="number-pad" />
                <Input label="Blood Pressure (mmHg)" placeholder="e.g. 120/80" value={bp} onChangeText={setBp} />
                <Input label="Blood Sugar (mg/dL)" placeholder="e.g. 94" value={bs} onChangeText={setBs} keyboardType="number-pad" />
              </View>
            )}

            {activeForm === 'water' && (
              <View>
                <Input label="Amount (ml)" placeholder="e.g. 250, 500" value={waterMl} onChangeText={setWaterMl} keyboardType="number-pad" />
              </View>
            )}

            {activeForm === 'sleep' && (
              <View>
                <Input label="Duration (Hours)" placeholder="e.g. 7.5" value={sleepHrs} onChangeText={setSleepHours} keyboardType="numeric" />
              </View>
            )}

            {activeForm === 'med' && (
              <View>
                <Input label="Medication Name" placeholder="e.g. Metformin" value={medName} onChangeText={setMedName} />
                <Input label="Dosage" placeholder="e.g. 500mg" value={medDosage} onChangeText={setMedDosage} />
                <Input label="Timing Schedule" placeholder="e.g. After Dinner" value={medTiming} onChangeText={setMedTiming} />
              </View>
            )}

            {/* Save Buttons for Active Forms */}
            {activeForm && (
              <View style={styles.formActions}>
                <Button title="Back" type="secondary" onPress={() => setActiveForm(null)} style={styles.halfBtn} />
                <Button title="Log" onPress={handleSaveForm} style={[styles.halfBtn, { marginLeft: 10 }]} />
              </View>
            )}

          </View>
        </KeyboardAvoidingView>
      </Modal>
    </SafeAreaProvider>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff8f3',
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
  menuList: {
    marginBottom: 8,
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(129, 11, 56, 0.05)',
  },
  menuIcon: {
    width: 38,
    height: 38,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 14,
  },
  menuText: {
    flex: 1,
    fontSize: 15,
    fontWeight: '600',
    color: '#221a10',
  },
  formActions: {
    flexDirection: 'row',
    marginTop: 16,
  },
  halfBtn: {
    flex: 1,
  },
});
