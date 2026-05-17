import { useState, useCallback } from 'react';
import { View, Text, Image, Alert, Platform, StyleSheet } from 'react-native';
import { useFocusEffect, useNavigation } from '@react-navigation/native';
import type { BottomTabNavigationProp } from '@react-navigation/bottom-tabs';
import ScreenLayout from '../components/ScreenLayout';
import VitalCard from '../components/VitalCard';
import AppButton from '../components/AppButton';
import { colors, commonStyles } from '../theme';
import type { RootTabParamList } from '../navigation/types';
import type { Pet, PetVitals } from '../types/pet';
import { getActivePet, loadPets, loadPetVitals, savePetVitals } from '../services/petData';

export default function ProfileScreen() {
  const navigation = useNavigation<BottomTabNavigationProp<RootTabParamList>>();
  const [activePet, setActivePet] = useState<Pet | null>(null);
  const [petVitals, setPetVitals] = useState<PetVitals>({
    peso: 'Não informado',
    ultimaVacina: 'Não registrada',
    statusCirurgia: 'Nenhuma pendente',
  });

  const loadProfileData = useCallback(async () => {
    const pets = await loadPets();
    const pet = await getActivePet(pets);
    setActivePet(pet);

    if (pet) {
      const vitals = await loadPetVitals(pet.id);
      setPetVitals(vitals);
    }
  }, []);

  useFocusEffect(
    useCallback(() => {
      loadProfileData();
    }, [loadProfileData])
  );

  const handleRegisterVaccine = async () => {
    if (!activePet) return;

    const hoje = new Date().toLocaleDateString('pt-BR');
    const updatedVitals = { ...petVitals, ultimaVacina: hoje };

    await savePetVitals(activePet.id, updatedVitals);
    setPetVitals(updatedVitals);

    const message = 'Nova vacina registrada com sucesso!';
    if (Platform.OS === 'web') {
      window.alert(message);
    } else {
      Alert.alert('Vacina', message);
    }
  };

  if (!activePet) {
    return (
      <ScreenLayout withHeader>
        <View style={styles.emptyCard}>
          <Text style={styles.emptyTitle}>Nenhum pet selecionado</Text>
          <Text style={styles.emptyText}>
            Cadastre um pet em Meus Pets para ver o perfil de saúde aqui.
          </Text>
          <AppButton title="Ir para Meus Pets" onPress={() => navigation.navigate('Pets')} />
        </View>
      </ScreenLayout>
    );
  }

  const initial = activePet.nome.charAt(0).toUpperCase();

  return (
    <ScreenLayout withHeader>
      <View style={styles.hero}>
        {activePet.fotoUri ? (
          <Image source={{ uri: activePet.fotoUri }} style={styles.photo} />
        ) : (
          <View style={styles.avatar}>
            <Text style={styles.avatarText}>{initial}</Text>
          </View>
        )}
        <View>
          <Text style={styles.petName}>{activePet.nome}</Text>
          <Text style={styles.petBreed}>{activePet.raca}</Text>
        </View>
      </View>

      <Text style={styles.sectionTitle}>Dados vitais</Text>
      <View style={styles.vitalsGrid}>
        <VitalCard label="Peso atual" value={petVitals.peso} />
        <VitalCard label="Última vacina" value={petVitals.ultimaVacina} />
      </View>
      <View style={styles.vitalsFull}>
        <VitalCard label="Status da cirurgia" value={petVitals.statusCirurgia} fullWidth />
      </View>

      <AppButton title="Registrar nova vacina" onPress={handleRegisterVaccine} style={styles.action} />
    </ScreenLayout>
  );
}

const styles = StyleSheet.create({
  emptyCard: {
    ...commonStyles.card,
    gap: 12,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: colors.text,
  },
  emptyText: {
    fontSize: 14,
    color: colors.textMuted,
    lineHeight: 20,
    marginBottom: 8,
  },
  hero: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
    backgroundColor: colors.surface,
    borderRadius: 20,
    padding: 16,
    borderWidth: 1,
    borderColor: colors.border,
    marginBottom: 24,
  },
  photo: {
    width: 64,
    height: 64,
    borderRadius: 32,
    borderWidth: 1,
    borderColor: colors.border,
  },
  avatar: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: colors.infoBg,
    borderWidth: 1,
    borderColor: colors.infoBorder,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarText: {
    fontSize: 28,
    fontWeight: '700',
    color: colors.accent,
  },
  petName: {
    fontSize: 22,
    fontWeight: '700',
    color: colors.text,
    marginBottom: 4,
  },
  petBreed: {
    fontSize: 14,
    color: colors.textMuted,
  },
  sectionTitle: {
    fontSize: 13,
    fontWeight: '600',
    color: colors.textMuted,
    textTransform: 'uppercase',
    letterSpacing: 0.6,
    marginBottom: 12,
  },
  vitalsGrid: {
    flexDirection: 'row',
    gap: 10,
    marginBottom: 10,
  },
  vitalsFull: {
    marginBottom: 24,
  },
  action: {
    marginTop: 4,
  },
});
