import { useState, useEffect } from 'react';
import { View, Text, TextInput, Pressable, Button, Alert, StyleSheet } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import type { RootStackParamList } from '../navigation/types';
import ScreenLayout from '../components/ScreenLayout';

const TUTOR_NAME_KEY = '@clyvo/tutorName';

type Props = NativeStackScreenProps<RootStackParamList, 'Settings'>;

export default function SettingsScreen({ navigation }: Props) {
  const [tutorName, setTutorName] = useState('');
  const [savedTutorName, setSavedTutorName] = useState('');

  useEffect(() => {
    const loadTutorName = async () => {
      try {
        const storedName = await AsyncStorage.getItem(TUTOR_NAME_KEY);
        if (storedName) {
          setTutorName(storedName);
          setSavedTutorName(storedName);
        }
      } catch {
        Alert.alert('Erro', 'Não foi possível carregar o perfil salvo.');
      }
    };

    loadTutorName();
  }, []);

  const handleSaveProfile = async () => {
    const trimmedName = tutorName.trim();

    if (!trimmedName) {
      Alert.alert('Atenção', 'Digite o nome do tutor antes de salvar.');
      return;
    }

    try {
      await AsyncStorage.setItem(TUTOR_NAME_KEY, trimmedName);
      setTutorName(trimmedName);
      setSavedTutorName(trimmedName);
      Alert.alert('Sucesso', 'Perfil salvo com sucesso!');
    } catch {
      Alert.alert('Erro', 'Não foi possível salvar o perfil.');
    }
  };

  const handleClearLocalData = async () => {
    try {
      await AsyncStorage.removeItem(TUTOR_NAME_KEY);
      setTutorName('');
      setSavedTutorName('');
      Alert.alert('Sucesso', 'Dados apagados com sucesso');
    } catch {
      Alert.alert('Erro', 'Não foi possível apagar os dados locais.');
    }
  };

  return (
    <ScreenLayout withHeader keyboard>
        <Text style={styles.title}>Configurações</Text>
        <Text style={styles.subtitle}>Gerencie os dados do seu perfil localmente.</Text>

        {savedTutorName ? (
          <View style={styles.welcomeCard}>
            <Text style={styles.welcomeText}>
              Bem-vindo(a) de volta, {savedTutorName}
            </Text>
          </View>
        ) : (
          <View style={styles.welcomeCard}>
            <Text style={styles.welcomePlaceholder}>
              Salve seu nome para ver a mensagem de boas-vindas.
            </Text>
          </View>
        )}

        <View style={styles.form}>
          <View style={styles.field}>
            <Text style={styles.label}>Nome do Tutor</Text>
            <TextInput
              style={styles.input}
              value={tutorName}
              onChangeText={setTutorName}
              placeholder="Digite seu nome"
              placeholderTextColor="#9ca3af"
              autoCapitalize="words"
            />
          </View>

          <Pressable
            style={({ pressed }) => [styles.saveButton, pressed && styles.saveButtonPressed]}
            onPress={handleSaveProfile}
          >
            <Text style={styles.saveButtonText}>Salvar Perfil</Text>
          </Pressable>
        </View>

        <Button title="Limpar Dados Locais" onPress={handleClearLocalData} />

        <View style={styles.navRow}>
          <Pressable
            style={({ pressed }) => [styles.navButton, pressed && styles.navButtonPressed]}
            onPress={() => navigation.navigate('Home')}
          >
            <Text style={styles.navButtonText}>Home</Text>
          </Pressable>
          <Pressable
            style={({ pressed }) => [styles.navButton, pressed && styles.navButtonPressed]}
            onPress={() => navigation.navigate('Profile')}
          >
            <Text style={styles.navButtonText}>Profile</Text>
          </Pressable>
        </View>
    </ScreenLayout>
  );
}

const styles = StyleSheet.create({
  title: {
    fontSize: 24,
    fontWeight: '700',
    color: '#0f172a',
    marginBottom: 6,
  },
  subtitle: {
    fontSize: 14,
    color: '#64748b',
    marginBottom: 20,
    lineHeight: 20,
  },
  welcomeCard: {
    backgroundColor: '#ecfdf5',
    borderRadius: 12,
    padding: 16,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: '#a7f3d0',
  },
  welcomeText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#065f46',
    lineHeight: 22,
  },
  welcomePlaceholder: {
    fontSize: 14,
    color: '#047857',
    lineHeight: 20,
  },
  form: {
    backgroundColor: '#ffffff',
    borderRadius: 12,
    padding: 16,
    gap: 16,
    borderWidth: 1,
    borderColor: '#e2e8f0',
    marginBottom: 24,
  },
  field: {
    gap: 6,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    color: '#334155',
  },
  input: {
    backgroundColor: '#f8fafc',
    borderWidth: 1,
    borderColor: '#cbd5e1',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 16,
    color: '#0f172a',
  },
  saveButton: {
    backgroundColor: '#2563eb',
    borderRadius: 8,
    paddingVertical: 14,
    alignItems: 'center',
    marginTop: 4,
  },
  saveButtonPressed: {
    backgroundColor: '#1d4ed8',
  },
  saveButtonText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '600',
  },
  navRow: {
    flexDirection: 'row',
    gap: 12,
  },
  navButton: {
    flex: 1,
    backgroundColor: '#ffffff',
    borderWidth: 1,
    borderColor: '#e2e8f0',
    borderRadius: 8,
    paddingVertical: 12,
    alignItems: 'center',
  },
  navButtonPressed: {
    backgroundColor: '#f1f5f9',
  },
  navButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#475569',
  },
});
