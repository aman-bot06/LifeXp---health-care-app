import React, { useState, useEffect } from 'react';
import { 
  StyleSheet, 
  Text, 
  View, 
  ScrollView, 
  Pressable, 
  ActivityIndicator,
  Alert
} from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import Card from '../../components/Card';
import Input from '../../components/Input';
import Button from '../../components/Button';
import { getUserProfile, updateUserProfile } from '../../config/firebase';
import AsyncStorage from '@react-native-async-storage/async-storage';

export default function ProfileScreen() {
  const [userId, setUserId] = useState(null);
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);

  // Edit fields
  const [name, setName] = useState('');
  const [age, setAge] = useState('');
  const [height, setHeight] = useState('');
  const [weight, setWeight] = useState('');
  const [conditions, setConditions] = useState('');
  const [isEditing, setIsEditing] = useState(false);

  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    setLoading(true);
    try {
      const activeUid = await AsyncStorage.getItem('@lifexp_active_user_id');
      if (activeUid) {
        setUserId(activeUid);
        const data = await getUserProfile(activeUid);
        if (data) {
          setProfile(data);
          setName(data.name || '');
          setAge(String(data.age || ''));
          setHeight(data.height || '');
          setWeight(data.weight || '');
          setConditions(data.chronicConditions || '');
        }
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    if (!name || !age) {
      Alert.alert("Missing Fields", "Name and Age are required.");
      return;
    }

    try {
      const updatedData = {
        name,
        age: parseInt(age),
        height,
        weight,
        chronicConditions: conditions
      };
      await updateUserProfile(userId, updatedData);
      setProfile(prev => ({ ...prev, ...updatedData }));
      setIsEditing(false);
      Alert.alert("Success", "Profile updated successfully!");
    } catch (e) {
      Alert.alert("Error Saving Profile", e.message);
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
        
        {/* Profile Card Summary */}
        <View style={styles.summaryCard}>
          <View style={styles.avatar}>
            <MaterialIcons name="account-circle" size={64} color="#810b38" />
          </View>
          <Text style={styles.profileName}>{profile?.name || 'User'}</Text>
          <Text style={styles.profileEmail}>{profile?.email || 'user@email.com'}</Text>
        </View>

        {isEditing ? (
          /* EDIT MODE */
          <Card title="Edit Health Profile">
            <Input
              label="Full Name"
              placeholder="e.g. Sarah Jenkins"
              value={name}
              onChangeText={setName}
            />

            <Input
              label="Age"
              placeholder="e.g. 42"
              value={age}
              onChangeText={setAge}
              keyboardType="number-pad"
            />

            <Input
              label="Height"
              placeholder="e.g. 165 cm"
              value={height}
              onChangeText={setHeight}
            />

            <Input
              label="Weight"
              placeholder="e.g. 68 kg"
              value={weight}
              onChangeText={setWeight}
            />

            <Input
              label="Chronic Conditions"
              placeholder="e.g. Hypertension, Asthma"
              value={conditions}
              onChangeText={setConditions}
            />

            <View style={styles.actionRow}>
              <Button
                title="Cancel"
                type="secondary"
                onPress={() => setIsEditing(false)}
                style={styles.actionBtn}
              />
              <Button
                title="Save Details"
                onPress={handleSave}
                style={[styles.actionBtn, { marginLeft: 10 }]}
              />
            </View>
          </Card>
        ) : (
          /* VIEW MODE */
          <Card title="Personal Health Record">
            <View style={styles.details}>
              
              <View style={styles.detailRow}>
                <View style={styles.labelCol}>
                  <MaterialIcons name="cake" size={18} color="#8a7175" />
                  <Text style={styles.detailLabel}>Age</Text>
                </View>
                <Text style={styles.detailValue}>{profile?.age || '--'} yrs</Text>
              </View>

              <View style={styles.detailRow}>
                <View style={styles.labelCol}>
                  <MaterialIcons name="height" size={18} color="#8a7175" />
                  <Text style={styles.detailLabel}>Height</Text>
                </View>
                <Text style={styles.detailValue}>{profile?.height || '--'}</Text>
              </View>

              <View style={styles.detailRow}>
                <View style={styles.labelCol}>
                  <MaterialIcons name="scale" size={18} color="#8a7175" />
                  <Text style={styles.detailLabel}>Weight</Text>
                </View>
                <Text style={styles.detailValue}>{profile?.weight || '--'}</Text>
              </View>

              <View style={styles.detailRow}>
                <View style={styles.labelCol}>
                  <MaterialIcons name="healing" size={18} color="#8a7175" />
                  <Text style={styles.detailLabel}>Conditions</Text>
                </View>
                <Text style={styles.detailValue}>{profile?.chronicConditions || 'None'}</Text>
              </View>

            </View>

            <Button 
              title="Edit Profile" 
              type="secondary"
              onPress={() => setIsEditing(true)}
              style={styles.editBtn}
            />
          </Card>
        )}

      </ScrollView>
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
  summaryCard: {
    alignItems: 'center',
    marginBottom: 24,
    marginTop: 10,
  },
  avatar: {
    marginBottom: 12,
  },
  profileName: {
    fontSize: 22,
    fontWeight: '700',
    color: '#810b38',
  },
  profileEmail: {
    fontSize: 14,
    color: '#8a7175',
    marginTop: 4,
  },
  details: {
    marginVertical: 8,
  },
  detailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(129, 11, 56, 0.05)',
  },
  labelCol: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  detailLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#574145',
    marginLeft: 8,
  },
  detailValue: {
    fontSize: 14,
    fontWeight: '700',
    color: '#810b38',
  },
  editBtn: {
    marginTop: 20,
  },
  actionRow: {
    flexDirection: 'row',
    marginTop: 20,
  },
  actionBtn: {
    flex: 1,
  },
});
