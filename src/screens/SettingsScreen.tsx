import { useState, useEffect } from 'react';
import { View, Text, TextInput, Pressable, Alert, Platform } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import type { BottomTabScreenProps } from '@react-navigation/bottom-tabs';
import type { RootTabParamList } from '../navigation/types';
import ScreenLayout from '../components/ScreenLayout';
import AppButton from '../components/AppButton';
import { TUTOR_NAME_KEY } from '../constants/storage';
import { clearAllAppData } from '../services/petData';
import { colors, commonStyles } from '../theme';

type Props = BottomTabScreenProps<RootTabParamList, 'Settings'>;

export default function SettingsScreen() {
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
        showAlert('Erro', 'Não foi possível carregar o perfil salvo.');
      }
    };

    loadTutorName();
  }, []);

  const showAlert = (title: string, message: string) => {
    if (Platform.OS === 'web') {
      window.alert(`${title}\n\n${message}`);
    } else {
      Alert.alert(title, message);
    }
  };

  const handleSaveProfile = async () => {
    const trimmedName = tutorName.trim();

    if (!trimmedName) {
      showAlert('Atenção', 'Digite o nome do tutor antes de salvar.');
      return;
    }

    try {
      await AsyncStorage.setItem(TUTOR_NAME_KEY, trimmedName);
      setTutorName(trimmedName);
      setSavedTutorName(trimmedName);
      showAlert('Sucesso', 'Perfil salvo com sucesso!');
    } catch {
      showAlert('Erro', 'Não foi possível salvar o perfil.');
    }
  };

  const handleClearLocalData = async () => {
    try {
      await clearAllAppData();
      setTutorName('');
      setSavedTutorName('');
      showAlert('Sucesso', 'Todos os dados do app foram apagados.');
    } catch {
      showAlert('Erro', 'Não foi possível apagar os dados locais.');
    }
  };

  return (
    <ScreenLayout withHeader keyboard>
      <Text style={commonStyles.subtitle}>
        Gerencie o perfil do tutor e os dados salvos no aparelho.
      </Text>

      {savedTutorName ? (
        <View style={commonStyles.welcomeCard}>
          <Text style={commonStyles.welcomeText}>Bem-vindo(a) de volta, {savedTutorName}</Text>
        </View>
      ) : (
        <View style={commonStyles.welcomeCard}>
          <Text style={commonStyles.welcomePlaceholder}>
            Salve seu nome para ver a mensagem de boas-vindas.
          </Text>
        </View>
      )}

      <View style={commonStyles.form}>
        <View style={commonStyles.field}>
          <Text style={commonStyles.label}>Nome do Tutor</Text>
          <TextInput
            style={commonStyles.input}
            value={tutorName}
            onChangeText={setTutorName}
            placeholder="Digite seu nome"
            placeholderTextColor={colors.placeholder}
            autoCapitalize="words"
          />
        </View>

        <Pressable
          style={({ pressed }) => [
            commonStyles.primaryButton,
            pressed && commonStyles.primaryButtonPressed,
          ]}
          onPress={handleSaveProfile}
        >
          <Text style={commonStyles.primaryButtonText}>Salvar Perfil</Text>
        </Pressable>
      </View>

      <AppButton
        title="Limpar Dados Locais"
        onPress={handleClearLocalData}
        variant="danger"
      />
    </ScreenLayout>
  );
}
