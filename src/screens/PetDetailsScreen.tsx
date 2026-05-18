import { useState, useCallback } from 'react';
import { View, Text, Image, Alert, Platform, StyleSheet } from 'react-native';
import { useFocusEffect, useRoute } from '@react-navigation/native';
import type { RouteProp } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import ScreenLayout from '../components/ScreenLayout';
import VitalCard from '../components/VitalCard';
import AppButton from '../components/AppButton';
import { colors, commonStyles } from '../theme';
import type { PetsStackParamList } from '../navigation/types';
import type { Pet, CheckinRecord } from '../types/pet';
import { formatPetSpecies } from '../constants/petSpecies';
import {
  loadPets,
  loadPetVitals,
  loadLastCheckin,
  savePetVitals,
  setSelectedPetId,
} from '../services/petData';

type Route = RouteProp<PetsStackParamList, 'PetDetails'>;

function buildAboutText(pet: Pet, lastCheckin: CheckinRecord | null) {
  const especie = pet.especie?.toLowerCase() ?? 'pet';
  const parts = [
    `${pet.nome} é um ${especie} da raça ${pet.raca}. Acompanhe a saúde e a recuperação com check-ins diários no app.`,
  ];

  if (pet.peso) {
    parts.push(`Peso registrado: ${pet.peso}.`);
  }

  if (lastCheckin?.petId === pet.id) {
    parts.push(
      `Último check-in em ${lastCheckin.date}: atividade ${lastCheckin.activity.toLowerCase()}.`
    );
    if (lastCheckin.observations.trim()) {
      parts.push(lastCheckin.observations.trim());
    }
  }

  return parts.join(' ');
}

export default function PetDetailsScreen() {
  const { params } = useRoute<Route>();
  const [pet, setPet] = useState<Pet | null>(null);
  const [ultimaVacina, setUltimaVacina] = useState('Não registrada');
  const [lastCheckin, setLastCheckin] = useState<CheckinRecord | null>(null);

  const loadDetails = useCallback(async () => {
    const pets = await loadPets();
    const found = pets.find((item) => item.id === params.petId) ?? null;
    setPet(found);

    if (found) {
      const [vitals, checkin] = await Promise.all([
        loadPetVitals(found.id),
        loadLastCheckin(),
      ]);
      setUltimaVacina(vitals.ultimaVacina);
      setLastCheckin(checkin);
    }
  }, [params.petId]);

  useFocusEffect(
    useCallback(() => {
      loadDetails();
    }, [loadDetails])
  );

  const handleRegisterVaccine = async () => {
    if (!pet) return;

    const hoje = new Date().toLocaleDateString('pt-BR');
    await savePetVitals(pet.id, { ultimaVacina: hoje });
    setUltimaVacina(hoje);

    const message = 'Nova vacina registrada com sucesso!';
    if (Platform.OS === 'web') {
      window.alert(message);
    } else {
      Alert.alert('Vacina', message);
    }
  };

  const handleSetActive = async () => {
    if (!pet) return;
    await setSelectedPetId(pet.id);
    Alert.alert('Pet ativo', `${pet.nome} é o pet usado no check-in e no perfil.`);
  };

  if (!pet) {
    return (
      <ScreenLayout withTabBar>
        <View style={styles.emptyCard}>
          <Text style={styles.emptyTitle}>Pet não encontrado</Text>
        </View>
      </ScreenLayout>
    );
  }

  const initial = pet.nome.charAt(0).toUpperCase();
  const pesoLabel = pet.peso?.trim() || 'Não informado';
  const breedLabel = formatPetSpecies(pet.especie, pet.raca);

  return (
    <ScreenLayout
      withTabBar
      contentContainerStyle={styles.screenContent}
    >
        <View style={styles.heroWrap}>
          {pet.fotoUri ? (
            <Image source={{ uri: pet.fotoUri }} style={styles.heroImage} />
          ) : (
            <View style={styles.heroPlaceholder}>
              <Text style={styles.heroPlaceholderText}>{initial}</Text>
            </View>
          )}
        </View>

        <View style={styles.detailsCard}>
          <Text style={styles.petName}>{pet.nome}</Text>

          <View style={styles.metaRow}>
            <View style={styles.metaItem}>
              <Ionicons name="scale-outline" size={18} color={colors.accent} />
              <Text style={styles.metaText}>{pesoLabel}</Text>
            </View>
            <View style={styles.metaDivider} />
            <View style={styles.metaItem}>
              <Ionicons name="paw-outline" size={18} color={colors.accent} />
              <Text style={styles.metaText}>{breedLabel}</Text>
            </View>
          </View>

          <View style={styles.divider} />

          <Text style={styles.aboutTitle}>Sobre o {pet.nome}</Text>
          <Text style={styles.aboutText}>{buildAboutText(pet, lastCheckin)}</Text>

          <Text style={styles.sectionTitle}>Dados de saúde</Text>
          <View style={styles.vitalsGrid}>
            <VitalCard label="Peso" value={pesoLabel} />
            <VitalCard label="Última vacina" value={ultimaVacina} />
          </View>

          <AppButton title="Registrar nova vacina" onPress={handleRegisterVaccine} />
          <AppButton
            title="Usar como pet ativo"
            onPress={handleSetActive}
            variant="secondary"
            style={styles.activeButton}
          />
        </View>
    </ScreenLayout>
  );
}

const styles = StyleSheet.create({
  screenContent: {
    paddingHorizontal: 0,
    paddingTop: 0,
    paddingBottom: 0,
  },
  emptyCard: {
    ...commonStyles.card,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: colors.text,
  },
  heroWrap: {
    height: 260,
    backgroundColor: colors.surfaceElevated,
  },
  heroImage: {
    width: '100%',
    height: '100%',
  },
  heroPlaceholder: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.infoBg,
  },
  heroPlaceholderText: {
    fontSize: 72,
    fontWeight: '700',
    color: colors.accent,
  },
  detailsCard: {
    marginTop: -28,
    backgroundColor: colors.surface,
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    paddingHorizontal: 20,
    paddingTop: 24,
    paddingBottom: 32,
    borderWidth: 1,
    borderColor: colors.border,
    minHeight: 320,
  },
  petName: {
    fontSize: 28,
    fontWeight: '700',
    color: colors.text,
    marginBottom: 16,
  },
  metaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginBottom: 20,
  },
  metaItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    flex: 1,
  },
  metaText: {
    fontSize: 14,
    color: colors.textSecondary,
    fontWeight: '500',
    flexShrink: 1,
  },
  metaDivider: {
    width: 1,
    height: 24,
    backgroundColor: colors.border,
  },
  divider: {
    height: 1,
    backgroundColor: colors.border,
    marginBottom: 20,
  },
  aboutTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: colors.accent,
    marginBottom: 10,
  },
  aboutText: {
    fontSize: 15,
    lineHeight: 22,
    color: colors.textSecondary,
    marginBottom: 24,
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
    marginBottom: 16,
  },
  activeButton: {
    marginTop: 10,
  },
});
