import { useState, useCallback, useEffect } from 'react';
import { View, Text, Image, Pressable, StyleSheet, useWindowDimensions } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import type { BottomTabScreenProps } from '@react-navigation/bottom-tabs';
import { MaterialCommunityIcons, Ionicons } from '@expo/vector-icons';
import type { RootTabParamList } from '../navigation/types';
import type { Pet, CheckinRecord } from '../types/pet';
import type { TutorProfile } from '../types/tutor';
import { getWellnessLabel } from '../constants/activityLevels';
import { loadLastCheckin, getHighlightedPet } from '../services/petData';
import { hasTutorProfile, loadTutorProfile } from '../services/tutorData';
import { usePetsQuery } from '../hooks/usePets';
import { colors } from '../theme';
import ScreenLayout from '../components/ScreenLayout';
import AppLogo from '../components/AppLogo';
import QuickActionCard from '../components/QuickActionCard';
import HealthOverviewCard from '../components/HealthOverviewCard';
import FlowHintCard from '../components/FlowHintCard';

type Props = BottomTabScreenProps<RootTabParamList, 'Home'>;

function getPetsSubtitle(pets: Pet[]) {
  if (pets.length === 0) return 'Cadastre na aba Meus Pets';
  if (pets.length === 1) return `1 pet (${pets[0].nome})`;
  const names = pets
    .slice(0, 2)
    .map((pet) => pet.nome)
    .join(', ');
  return pets.length > 2 ? `${pets.length} pets (${names}...)` : `${pets.length} pets (${names})`;
}

export default function HomeScreen({ navigation }: Props) {
  const { width } = useWindowDimensions();
  const petsQuery = usePetsQuery();
  const pets = petsQuery.data ?? [];
  const [tutor, setTutor] = useState<TutorProfile | null>(null);
  const [summaryPet, setSummaryPet] = useState<Pet | null>(null);
  const [lastCheckin, setLastCheckin] = useState<CheckinRecord | null>(null);

  const tutorReady = hasTutorProfile(tutor);
  const firstName = tutor?.nome.split(' ')[0] ?? 'tutor';

  const loadHomeData = useCallback(async () => {
    const [tutorProfile, checkin] = await Promise.all([
      loadTutorProfile(),
      loadLastCheckin(),
    ]);

    setTutor(tutorProfile);
    setLastCheckin(checkin);
  }, []);

  useFocusEffect(
    useCallback(() => {
      loadHomeData();
    }, [loadHomeData])
  );

  useEffect(() => {
    setSummaryPet((current) => {
      const defaultPet = getHighlightedPet(pets, lastCheckin);
      if (!defaultPet) return null;
      if (current && pets.some((pet) => pet.id === current.id)) {
        return current;
      }
      return defaultPet;
    });
  }, [pets, lastCheckin]);

  const remindersSubtitle =
    !tutorReady
      ? 'Crie seu perfil primeiro'
      : pets.length === 0
        ? 'Cadastre um pet'
        : 'Ver pets cadastrados';

  const heroCaption = !tutorReady
    ? 'Comece criando seu perfil de tutor na aba Meu Perfil.'
    : pets.length === 0
      ? 'Cadastre seu pet para iniciar o acompanhamento na clínica.'
      : lastCheckin
        ? `${lastCheckin.petName}: ${getWellnessLabel(lastCheckin.activity)} · ${lastCheckin.date}`
        : pets.length === 1
          ? `Conte como ${pets[0].nome} está em casa hoje.`
          : 'Escolha o pet e registre como ele está hoje.';

  return (
    <ScreenLayout contentContainerStyle={styles.homeContent}>
      <View style={styles.header}>
        <AppLogo width={170} height={44} />
        <View style={styles.greetingRow}>
          {tutor?.fotoUri ? (
            <Image source={{ uri: tutor.fotoUri }} style={styles.tutorPhoto} />
          ) : (
            <View style={styles.tutorAvatar}>
              <Text style={styles.tutorAvatarText}>
                {tutorReady ? firstName.charAt(0).toUpperCase() : '?'}
              </Text>
            </View>
          )}
          <View style={styles.greetingText}>
            <Text style={styles.greeting}>Olá, {firstName}!</Text>
            <Text style={styles.greetingSub}>
              Painel do tutor · acompanhamento veterinário
            </Text>
          </View>
        </View>
      </View>

      {!tutorReady ? (
        <FlowHintCard
          title="Complete seu perfil de tutor"
          message="Sua conta já está ativa. Agora informe seu nome em Meu Perfil (foto opcional) para liberar cadastro de pets, registro do dia e prontuário."
          buttonTitle="Ir para Meu Perfil"
          onPress={() => navigation.navigate('Settings')}
        />
      ) : null}

      {tutorReady && pets.length === 0 ? (
        <FlowHintCard
          title="Próximo passo: cadastrar seu pet"
          message="Com o perfil de tutor pronto, registre o animal que você acompanha na veterinária."
          buttonTitle="Ir para Meus Pets"
          onPress={() => navigation.navigate('Pets', { screen: 'PetsList' })}
        />
      ) : null}

      <View style={[styles.heroCard, { minHeight: width < 360 ? 200 : 168 }]}>
        <View style={styles.heroContent}>
          <Text style={styles.heroTitle}>Como está seu pet hoje?</Text>
          <Pressable
            style={({ pressed }) => [
              styles.heroButton,
              pressed && styles.heroButtonPressed,
              (!tutorReady || pets.length === 0) && styles.heroButtonDisabled,
            ]}
            onPress={() => {
              if (!tutorReady) {
                navigation.navigate('Settings');
                return;
              }
              if (pets.length === 0) {
                navigation.navigate('Pets', { screen: 'PetsList' });
                return;
              }
              navigation.navigate('Checkin');
            }}
          >
            <Ionicons name="medkit-outline" size={16} color={colors.textOnDark} />
            <Text style={styles.heroButtonText}>Registrar como está em casa</Text>
          </Pressable>
          <Text style={styles.heroCaption}>{heroCaption}</Text>
        </View>
        <Text style={styles.heroIllustration}>🩺</Text>
      </View>

      <View style={styles.quickActions}>
        <QuickActionCard
          title="Meus Pets"
          subtitle={getPetsSubtitle(pets)}
          icon={<MaterialCommunityIcons name="paw" size={22} color={colors.accent} />}
          onPress={() => navigation.navigate('Pets', { screen: 'PetsList' })}
        />
        <QuickActionCard
          title="Registro do dia"
          subtitle="Conte o que você notou"
          icon={<Ionicons name="clipboard-outline" size={22} color={colors.accent} />}
          onPress={() => navigation.navigate('Checkin')}
        />
        <QuickActionCard
          title="Prontuário"
          subtitle={remindersSubtitle}
          icon={<Ionicons name="document-text-outline" size={22} color={colors.accent} />}
          iconBackground={colors.iconBgGreen}
          onPress={() => navigation.navigate('Profile')}
        />
      </View>

      {tutorReady && summaryPet ? (
        <HealthOverviewCard
          pets={pets}
          focusPet={summaryPet}
          lastCheckin={lastCheckin}
          onSelectPet={setSummaryPet}
        />
      ) : null}
    </ScreenLayout>
  );
}

const styles = StyleSheet.create({
  homeContent: {
    paddingTop: 8,
  },
  header: {
    width: '100%',
    alignItems: 'center',
    gap: 20,
    marginBottom: 24,
  },
  greetingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
    alignSelf: 'stretch',
  },
  tutorPhoto: {
    width: 52,
    height: 52,
    borderRadius: 26,
    borderWidth: 1,
    borderColor: colors.border,
  },
  tutorAvatar: {
    width: 52,
    height: 52,
    borderRadius: 26,
    backgroundColor: colors.infoBg,
    borderWidth: 1,
    borderColor: colors.infoBorder,
    alignItems: 'center',
    justifyContent: 'center',
  },
  tutorAvatarText: {
    fontSize: 22,
    fontWeight: '700',
    color: colors.accent,
  },
  greetingText: {
    flex: 1,
    gap: 4,
  },
  greeting: {
    fontSize: 26,
    fontWeight: '700',
    color: colors.text,
    letterSpacing: -0.5,
  },
  greetingSub: {
    fontSize: 13,
    color: colors.textMuted,
    lineHeight: 18,
  },
  heroCard: {
    flexDirection: 'row',
    backgroundColor: colors.mint,
    borderRadius: 24,
    padding: 18,
    marginBottom: 22,
    overflow: 'hidden',
    alignItems: 'center',
  },
  heroContent: {
    flex: 1,
    paddingRight: 8,
  },
  heroTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: colors.text,
    marginBottom: 14,
    lineHeight: 24,
  },
  heroButton: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
    gap: 8,
    backgroundColor: colors.primaryLight,
    borderRadius: 24,
    paddingVertical: 11,
    paddingHorizontal: 16,
    marginBottom: 10,
  },
  heroButtonPressed: {
    backgroundColor: colors.primaryPressed,
  },
  heroButtonDisabled: {
    opacity: 0.85,
  },
  heroButtonText: {
    color: colors.textOnDark,
    fontSize: 13,
    fontWeight: '600',
  },
  heroCaption: {
    fontSize: 12,
    color: colors.textMuted,
    lineHeight: 17,
  },
  heroIllustration: {
    fontSize: 40,
  },
  quickActions: {
    flexDirection: 'row',
    gap: 10,
    marginBottom: 22,
  },
});
