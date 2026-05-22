import { useState, useCallback } from 'react';
import { View, Text, Image, StyleSheet } from 'react-native';
import { useFocusEffect, useRoute } from '@react-navigation/native';
import type { RouteProp } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import ScreenLayout from '../components/ScreenLayout';
import { colors, commonStyles } from '../theme';
import type { PetsStackParamList } from '../navigation/types';
import type { Pet, CheckinRecord } from '../types/pet';
import { getWellnessHint, getWellnessLabel } from '../constants/activityLevels';
import { formatPetSpecies } from '../constants/petSpecies';
import { loadPets, loadLastCheckin } from '../services/petData';
import { formatPetWeight } from '../utils/petWeight';

type Route = RouteProp<PetsStackParamList, 'PetDetails'>;

function buildAboutText(pet: Pet) {
  const especie = pet.especie?.toLowerCase() ?? 'pet';
  const parts = [
    `${pet.nome} é um ${especie} da raça ${pet.raca}, acompanhado na clínica pelo tutor pelo app Clyvo Companion.`,
  ];

  if (pet.peso) {
    parts.push(`Peso registrado no cadastro: ${formatPetWeight(pet.peso)}.`);
  }

  return parts.join(' ');
}

export default function PetDetailsScreen() {
  const { params } = useRoute<Route>();
  const [pet, setPet] = useState<Pet | null>(null);
  const [lastCheckin, setLastCheckin] = useState<CheckinRecord | null>(null);

  const loadDetails = useCallback(async () => {
    const pets = await loadPets();
    const found = pets.find((item) => item.id === params.petId) ?? null;
    setPet(found);
    setLastCheckin(await loadLastCheckin());
  }, [params.petId]);

  useFocusEffect(
    useCallback(() => {
      loadDetails();
    }, [loadDetails])
  );

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
  const pesoLabel = formatPetWeight(pet.peso, 'Não informado');
  const breedLabel = formatPetSpecies(pet.especie, pet.raca);
  const petCheckin = lastCheckin?.petId === pet.id ? lastCheckin : null;

  return (
    <ScreenLayout withTabBar contentContainerStyle={styles.screenContent}>
      <View style={styles.heroWrap}>
        {pet.fotoUri ? (
          <Image
            source={{ uri: pet.fotoUri }}
            style={styles.heroImage}
            resizeMode="cover"
          />
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
        <Text style={styles.aboutText}>{buildAboutText(pet)}</Text>

        <Text style={styles.sectionTitle}>Acompanhamento na clínica</Text>
        {petCheckin ? (
          <View style={styles.infoBox}>
            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>Comportamento</Text>
              <Text style={styles.infoValue}>{getWellnessLabel(petCheckin.activity)}</Text>
              <Text style={styles.infoHint}>{getWellnessHint(petCheckin.activity)}</Text>
            </View>
            <View style={styles.infoDivider} />
            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>Data do registro</Text>
              <Text style={styles.infoValue}>{petCheckin.date}</Text>
            </View>
            {petCheckin.observations.trim() ? (
              <>
                <View style={styles.infoDivider} />
                <View style={styles.infoRow}>
                  <Text style={styles.infoLabel}>O que o tutor notou</Text>
                  <Text style={styles.infoValue}>{petCheckin.observations.trim()}</Text>
                </View>
              </>
            ) : null}
          </View>
        ) : (
          <View style={styles.infoBox}>
            <Text style={styles.emptyFollowUp}>
              Nenhum registro do dia para este pet ainda. Use a aba Registro do dia para contar
              como ele está em casa.
            </Text>
          </View>
        )}
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
    width: '100%',
    height: 280,
    backgroundColor: colors.surfaceElevated,
    overflow: 'hidden',
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
  infoBox: {
    backgroundColor: colors.surfaceElevated,
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: colors.border,
  },
  infoRow: {
    gap: 6,
  },
  infoDivider: {
    height: 1,
    backgroundColor: colors.border,
    marginVertical: 14,
  },
  infoHint: {
    fontSize: 13,
    color: colors.textMuted,
    lineHeight: 18,
  },
  emptyFollowUp: {
    fontSize: 14,
    color: colors.textMuted,
    lineHeight: 20,
  },
  infoLabel: {
    fontSize: 11,
    fontWeight: '600',
    color: colors.textMuted,
    textTransform: 'uppercase',
    letterSpacing: 0.4,
  },
  infoValue: {
    fontSize: 15,
    fontWeight: '600',
    color: colors.text,
    lineHeight: 22,
  },
});
