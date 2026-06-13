import React, { useState, useEffect } from 'react';
import { 
  StyleSheet, 
  Text, 
  View, 
  ScrollView, 
  Pressable, 
  Modal, 
  Alert,
  ActivityIndicator
} from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import Card from '../../components/Card';
import Input from '../../components/Input';
import Button from '../../components/Button';
import { getDoctors, addDoctor } from '../../config/firebase';
import AsyncStorage from '@react-native-async-storage/async-storage';

export default function DoctorScreen() {
  const [userId, setUserId] = useState(null);
  const [doctors, setDoctors] = useState([]);
  const [loading, setLoading] = useState(true);

  // Add Doctor Modal
  const [modalVisible, setModalVisible] = useState(false);
  const [name, setName] = useState('');
  const [specialty, setSpecialty] = useState('');
  const [contact, setContact] = useState('');

  useEffect(() => {
    fetchDoctors();
  }, []);

  const fetchDoctors = async () => {
    setLoading(true);
    try {
      const activeUid = await AsyncStorage.getItem('@lifexp_active_user_id');
      if (activeUid) {
        setUserId(activeUid);
        const docs = await getDoctors(activeUid);
        setDoctors(docs);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const handleAddDoctor = async () => {
    if (!name || !specialty || !contact) {
      Alert.alert("Missing Fields", "Please enter name, specialty and contact number.");
      return;
    }

    try {
      const newDoc = await addDoctor(userId, name, specialty, contact);
      setDoctors(prev => [...prev, newDoc]);
      setModalVisible(false);
      setName('');
      setSpecialty('');
      setContact('');
    } catch (e) {
      Alert.alert("Error Adding Doctor", e.message);
    }
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#810b38" />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContainer} showsVerticalScrollIndicator={false}>
        
        {/* Header Description */}
        <View style={styles.header}>
          <Text style={styles.title}>Doctors Directory</Text>
          <Text style={styles.subtitle}>Manage your primary care providers, specialists, and clinical contact info.</Text>
        </View>

        {/* Doctors List */}
        <View style={styles.list}>
          {doctors.map(doc => (
            <Card key={doc.id} style={styles.doctorCard}>
              <View style={styles.cardHeader}>
                <View style={styles.avatar}>
                  <MaterialIcons name="medical-services" size={20} color="#810b38" />
                </View>
                <View style={styles.headerText}>
                  <Text style={styles.doctorName}>{doc.name}</Text>
                  <Text style={styles.doctorSpecialty}>{doc.specialty}</Text>
                </View>
              </View>

              <View style={styles.divider} />

              <View style={styles.contactRow}>
                <View style={styles.contactItem}>
                  <MaterialIcons name="phone" size={16} color="#8a7175" />
                  <Text style={styles.contactText}>{doc.contact}</Text>
                </View>
                
                <Pressable style={styles.callBtn} onPress={() => Alert.alert("Calling...", `Connecting to ${doc.name}`)}>
                  <MaterialIcons name="call" size={16} color="#ffffff" />
                  <Text style={styles.callBtnText}>Call</Text>
                </Pressable>
              </View>
            </Card>
          ))}

          {doctors.length === 0 && (
            <Text style={styles.emptyText}>No doctors linked yet.</Text>
          )}
        </View>

        {/* Add Doctor Button */}
        <Button 
          title="Add Provider" 
          onPress={() => setModalVisible(true)}
          style={styles.addBtn}
        />

      </ScrollView>

      {/* Add Provider Modal */}
      <Modal
        animationType="slide"
        transparent={true}
        visible={modalVisible}
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Add Health Provider</Text>
              <Pressable onPress={() => setModalVisible(false)}>
                <MaterialIcons name="close" size={24} color="#221a10" />
              </Pressable>
            </View>

            <Input
              label="Doctor Name"
              placeholder="e.g. Dr. Robert Chen"
              value={name}
              onChangeText={setName}
            />

            <Input
              label="Specialty / Department"
              placeholder="e.g. Pediatrician, Endocrinologist"
              value={specialty}
              onChangeText={setSpecialty}
            />

            <Input
              label="Contact Number"
              placeholder="e.g. 555-0177"
              value={contact}
              onChangeText={setContact}
              keyboardType="phone-pad"
            />

            <Button
              title="Save Provider"
              onPress={handleAddDoctor}
              style={styles.saveBtn}
            />
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff8f3',
  },
  scrollContainer: {
    padding: 20,
    paddingBottom: 100,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#fff8f3',
  },
  header: {
    marginBottom: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: '700',
    color: '#810b38',
    marginBottom: 6,
  },
  subtitle: {
    fontSize: 14,
    color: '#574145',
    lineHeight: 20,
  },
  list: {
    marginBottom: 20,
  },
  doctorCard: {
    marginBottom: 16,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  avatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#fff1e3',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  headerText: {
    flex: 1,
  },
  doctorName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#221a10',
  },
  doctorSpecialty: {
    fontSize: 12,
    color: '#574145',
    marginTop: 2,
  },
  divider: {
    height: 1,
    backgroundColor: 'rgba(129, 11, 56, 0.08)',
    marginVertical: 12,
  },
  contactRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  contactItem: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  contactText: {
    fontSize: 13,
    color: '#574145',
    marginLeft: 8,
  },
  callBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#810b38',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
  },
  callBtnText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#ffffff',
    marginLeft: 4,
  },
  addBtn: {
    marginTop: 10,
  },
  emptyText: {
    textAlign: 'center',
    color: '#8a7175',
    marginVertical: 20,
    fontSize: 14,
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
  saveBtn: {
    marginTop: 16,
  },
});
