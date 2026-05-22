import { useState, useCallback } from 'react';
import {
  View,
  Text,
  TextInput,
  Image,
  Pressable,
  Alert,
  Platform,
  StyleSheet,
} from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import * as ImagePicker from 'expo-image-picker';
import type { BottomTabScreenProps } from '@react-navigation/bottom-tabs';
import type { RootTabParamList } from '../navigation/types';
import ScreenLayout from '../components/ScreenLayout';
import AppButton from '../components/AppButton';
import { colors, commonStyles } from '../theme';
import { useAuth } from '../context/AuthContext';
import { hasTutorProfile, loadTutorProfile, saveTutorProfile } from '../services/tutorData';
import { clearAllAppData } from '../services/petData';

type Props = BottomTabScreenProps<RootTabParamList, 'Settings'>;

export default function SettingsScreen() {
  const { session, signOut } = useAuth();
  const [nome, setNome] = useState('');
  const [fotoUri, setFotoUri] = useState('');
  const [profileComplete, setProfileComplete] = useState(false);

  const loadProfile = useCallback(async () => {
    const profile = await loadTutorProfile();
    if (profile) {
      setNome(profile.nome);
      setFotoUri(profile.fotoUri ?? '');
      setProfileComplete(hasTutorProfile(profile));
    } else {
      setNome('');
      setFotoUri('');
      setProfileComplete(false);
    }
  }, []);

  useFocusEffect(
    useCallback(() => {
      loadProfile();
    }, [loadProfile, session?.email])
  );

  const showAlert = (title: string, message: string) => {
    if (Platform.OS === 'web') {
      window.alert(`${title}\n\n${message}`);
    } else {
      Alert.alert(title, message);
    }
  };

  const handlePickPhoto = async () => {
    const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!permission.granted) {
      showAlert('Permissão necessária', 'Permita o acesso à galeria para escolher sua foto.');
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['images'],
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.8,
    });

    if (!result.canceled && result.assets[0]?.uri) {
      setFotoUri(result.assets[0].uri);
    }
  };

  const handleSaveProfile = async () => {
    const trimmedNome = nome.trim();

    if (!trimmedNome) {
      showAlert('Atenção', 'Informe seu nome para criar o perfil de tutor.');
      return;
    }

    try {
      await saveTutorProfile({
        nome: trimmedNome,
        ...(session?.email ? { email: session.email } : {}),
        ...(fotoUri ? { fotoUri } : {}),
      });
      setProfileComplete(true);
      showAlert(
        'Perfil criado',
        'Agora você pode cadastrar seus pets e acompanhar a saúde deles na clínica.'
      );
    } catch {
      showAlert('Erro', 'Não foi possível salvar o perfil do tutor.');
    }
  };

  const handleSignOut = async () => {
    try {
      await signOut();
    } catch {
      showAlert('Erro', 'Não foi possível sair da conta.');
    }
  };

  const handleClearLocalData = async () => {
    try {
      await clearAllAppData();
      await signOut();
      setNome('');
      setFotoUri('');
      setProfileComplete(false);
      showAlert('Sucesso', 'Todos os dados do app foram apagados. Faça login novamente.');
    } catch {
      showAlert('Erro', 'Não foi possível apagar os dados locais.');
    }
  };

  const initial = nome.trim().charAt(0).toUpperCase() || 'T';

  return (
    <ScreenLayout withHeader keyboard>
      <Text style={commonStyles.subtitle}>
        Complete seu perfil de tutor para liberar cadastro de pets, registro do dia e prontuário.
      </Text>

      {session?.email ? (
        <View style={styles.accountCard}>
          <Text style={styles.accountLabel}>Conta conectada</Text>
          <Text style={styles.accountEmail}>{session.email}</Text>
        </View>
      ) : null}

      {profileComplete ? (
        <View style={styles.statusCard}>
          <Text style={styles.statusTitle}>Tutor cadastrado na clínica</Text>
          <Text style={styles.statusText}>
            Perfil ativo. Você já pode cadastrar pets e registrar check-ins diários.
          </Text>
        </View>
      ) : (
        <View style={styles.statusCardPending}>
          <Text style={styles.statusTitlePending}>Perfil pendente</Text>
          <Text style={styles.statusText}>
            Informe seu nome para liberar Meus Pets, Registro do dia e Prontuário. A foto é opcional.
          </Text>
        </View>
      )}

      <View style={styles.photoSection}>
        {fotoUri ? (
          <Image source={{ uri: fotoUri }} style={styles.photo} />
        ) : (
          <View style={styles.avatar}>
            <Text style={styles.avatarText}>{initial}</Text>
          </View>
        )}
        <Pressable
          style={({ pressed }) => [styles.photoButton, pressed && styles.photoButtonPressed]}
          onPress={handlePickPhoto}
        >
          <Text style={styles.photoButtonText}>Escolher foto do tutor (opcional)</Text>
        </Pressable>
      </View>

      <View style={commonStyles.form}>
        <View style={commonStyles.field}>
          <Text style={commonStyles.label}>Nome completo do tutor</Text>
          <TextInput
            style={commonStyles.input}
            value={nome}
            onChangeText={setNome}
            placeholder="Ex: Maria Silva"
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
          <Text style={commonStyles.primaryButtonText}>
            {profileComplete ? 'Atualizar perfil do tutor' : 'Criar perfil do tutor'}
          </Text>
        </Pressable>
      </View>

      <AppButton
        title="Sair da conta"
        onPress={handleSignOut}
        variant="secondary"
        style={styles.signOutButton}
      />

      <AppButton
        title="Limpar todos os dados"
        onPress={handleClearLocalData}
        variant="danger"
        style={styles.clearButton}
      />
    </ScreenLayout>
  );
}

const styles = StyleSheet.create({
  statusCard: {
    ...commonStyles.card,
    marginBottom: 20,
    borderColor: colors.successBorder,
    backgroundColor: colors.successBg,
  },
  statusCardPending: {
    ...commonStyles.card,
    marginBottom: 20,
    borderColor: colors.accent,
  },
  statusTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: colors.successText,
    marginBottom: 6,
  },
  statusTitlePending: {
    fontSize: 15,
    fontWeight: '700',
    color: colors.accent,
    marginBottom: 6,
  },
  statusText: {
    fontSize: 13,
    color: colors.textMuted,
    lineHeight: 18,
  },
  photoSection: {
    alignItems: 'center',
    marginBottom: 24,
    gap: 14,
  },
  photo: {
    width: 96,
    height: 96,
    borderRadius: 48,
    borderWidth: 2,
    borderColor: colors.accent,
  },
  avatar: {
    width: 96,
    height: 96,
    borderRadius: 48,
    backgroundColor: colors.infoBg,
    borderWidth: 2,
    borderColor: colors.infoBorder,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarText: {
    fontSize: 36,
    fontWeight: '700',
    color: colors.accent,
  },
  photoButton: {
    backgroundColor: colors.surfaceElevated,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 24,
    paddingVertical: 12,
    paddingHorizontal: 18,
  },
  photoButtonPressed: {
    backgroundColor: colors.infoBg,
  },
  photoButtonText: {
    color: colors.textSecondary,
    fontSize: 14,
    fontWeight: '600',
  },
  accountCard: {
    ...commonStyles.card,
    marginBottom: 16,
    gap: 4,
    borderColor: colors.infoBorder,
    backgroundColor: colors.infoBg,
  },
  accountLabel: {
    fontSize: 11,
    fontWeight: '600',
    color: colors.textMuted,
    textTransform: 'uppercase',
    letterSpacing: 0.4,
  },
  accountEmail: {
    fontSize: 15,
    fontWeight: '600',
    color: colors.text,
  },
  signOutButton: {
    marginTop: 8,
  },
  clearButton: {
    marginTop: 8,
  },
});
