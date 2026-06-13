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
import { getFamilyMembers, addFamilyMember } from '../../config/firebase';
import AsyncStorage from '@react-native-async-storage/async-storage';

export default function FamilyScreen() {
  const [userId, setUserId] = useState(null);
  const [family, setFamily] = useState([]);
  const [loading, setLoading] = useState(true);

  // Add Family Modal
  const [modalVisible, setModalVisible] = useState(false);
  const [name, setName] = useState('');
  const [relation, setRelation] = useState('');
  const [age, setAge] = useState('');
  const [conditions, setConditions] = useState('');

  useEffect(() => {
    fetchFamily();
  }, []);

  const fetchFamily = async () => {
    setLoading(true);
    try {
      const activeUid = await AsyncStorage.getItem('@lifexp_active_user_id');
      if (activeUid) {
        setUserId(activeUid);
        const members = await getFamilyMembers(activeUid);
        setFamily(members);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const handleAddMember = async () => {
    if (!name || !relation || !age) {
      Alert.alert("Missing Fields", "Please enter name, relation and age.");
      return;
    }

    try {
      const newMember = await addFamilyMember(userId, name, relation, age, conditions || 'None');
      setFamily(prev => [...prev, newMember]);
      setModalVisible(false);
      setName('');
      setRelation('');
      setAge('');
      setConditions('');
    } catch (e) {
      Alert.alert("Error Adding Family Member", e.message);
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
          <Text style={styles.title}>Family Hub</Text>
          <Text style={styles.subtitle}>Coordinate and monitor the health records of your family members in one unified dashboard.</Text>
        </View>

        {/* Family Grid List */}
        <View style={styles.grid}>
          {family.map(member => (
            <Card key={member.id} style={styles.memberCard}>
              <View style={styles.cardHeader}>
                <View style={styles.avatar}>
                  <MaterialIcons name="person" size={20} color="#810b38" />
                </View>
                <View style={styles.headerText}>
                  <Text style={styles.memberName}>{member.name}</Text>
                  <Text style={styles.memberRelation}>{member.relation} • Age {member.age}</Text>
                </View>
              </View>

              <View style={styles.divider} />

              <View style={styles.metaRow}>
                <MaterialIcons name="healing" size={16} color="#8a7175" />
                <Text style={styles.metaText}>
                  <Text style={styles.metaLabel}>Conditions: </Text>
                  {member.conditions}
                </Text>
              </View>

              <Pressable style={styles.viewRecordsBtn}>
                <Text style={styles.viewRecordsText}>View Health Records</Text>
                <MaterialIcons name="chevron-right" size={16} color="#8a143e" />
              </Pressable>
            </Card>
          ))}

          {family.length === 0 && (
            <Text style={styles.emptyText}>No family members linked yet.</Text>
          )}
        </View>

        {/* Add Family Member Button */}
        <Button 
          title="Add Family Member" 
          onPress={() => setModalVisible(true)}
          style={styles.addBtn}
        />

      </ScrollView>

      {/* Add Member Modal */}
      <Modal
        animationType="slide"
        transparent={true}
        visible={modalVisible}
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Add Family Member</Text>
              <Pressable onPress={() => setModalVisible(false)}>
                <MaterialIcons name="close" size={24} color="#221a10" />
              </Pressable>
            </View>

            <Input
              label="Full Name"
              placeholder="e.g. James Jenkins"
              value={name}
              onChangeText={setName}
            />

            <Input
              label="Relation"
              placeholder="e.g. Son, Husband, Mother"
              value={relation}
              onChangeText={setRelation}
            />

            <Input
              label="Age"
              placeholder="e.g. 14"
              value={age}
              onChangeText={setAge}
              keyboardType="number-pad"
            />

            <Input
              label="Medical Conditions / Allergies"
              placeholder="e.g. Asthma, Penicillin allergy, None"
              value={conditions}
              onChangeText={setConditions}
            />

            <Button
              title="Save Member"
              onPress={handleAddMember}
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
  grid: {
    marginBottom: 20,
  },
  memberCard: {
    marginBottom: 16,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
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
  memberName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#221a10',
  },
  memberRelation: {
    fontSize: 12,
    color: '#574145',
    marginTop: 2,
  },
  divider: {
    height: 1,
    backgroundColor: 'rgba(129, 11, 56, 0.08)',
    marginVertical: 12,
  },
  metaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  metaText: {
    fontSize: 13,
    color: '#574145',
    marginLeft: 8,
  },
  metaLabel: {
    fontWeight: '600',
    color: '#810b38',
  },
  viewRecordsBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-end',
  },
  viewRecordsText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#8a143e',
    marginRight: 4,
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
