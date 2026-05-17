import { useState, useCallback } from 'react';
import { View, Text, Pressable, StyleSheet, useWindowDimensions } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import type { BottomTabScreenProps } from '@react-navigation/bottom-tabs';
import { MaterialCommunityIcons, Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import type { RootTabParamList } from '../navigation/types';
import type { Pet, CheckinRecord } from '../types/pet';
import { TUTOR_NAME_KEY } from '../constants/storage';
import { loadPets, getActivePet, loadLastCheckin } from '../services/petData';
import { colors } from '../theme';
import ScreenLayout from '../components/ScreenLayout';
import AppLogo from '../components/AppLogo';
import QuickActionCard from '../components/QuickActionCard';
import HealthOverviewCard from '../components/HealthOverviewCard';

type Props = BottomTabScreenProps<RootTabParamList, 'Home'>;

function getPetsSubtitle(pets: Pet[]) {
  if (pets.length === 0) return 'Nenhum pet cadastrado';
  if (pets.length === 1) return `1 pet (${pets[0].nome})`;
  const names = pets
    .slice(0, 2)
    .map((pet) => pet.nome)
    .join(', ');
  return pets.length > 2 ? `${pets.length} pets (${names}...)` : `${pets.length} pets (${names})`;
}

export default function HomeScreen({ navigation }: Props) {
  const { width } = useWindowDimensions();
  const [tutorName, setTutorName] = useState('tutor');
  const [pets, setPets] = useState<Pet[]>([]);
  const [activePet, setActivePet] = useState<Pet | null>(null);
  const [lastCheckin, setLastCheckin] = useState<CheckinRecord | null>(null);

  const loadHomeData = useCallback(async () => {
    const [storedName, petsList, checkin] = await Promise.all([
      AsyncStorage.getItem(TUTOR_NAME_KEY),
      loadPets(),
      loadLastCheckin(),
    ]);

    if (storedName) setTutorName(storedName.split(' ')[0]);

    setPets(petsList);
    setLastCheckin(checkin);
    const active = await getActivePet(petsList);
    setActivePet(active);
  }, []);

  useFocusEffect(
    useCallback(() => {
      loadHomeData();
    }, [loadHomeData])
  );

  const remindersSubtitle =
    pets.length === 0
      ? 'Cadastre um pet primeiro'
      : activePet
        ? `Vacinas de ${activePet.nome}`
        : 'Ver perfil do pet';

  return (
    <ScreenLayout contentContainerStyle={styles.homeContent}>
      <View style={styles.header}>
        <AppLogo width={170} height={44} />
        <Text style={styles.greeting}>Olá, {tutorName}! 👋</Text>
      </View>

      <View style={[styles.heroCard, { minHeight: width < 360 ? 200 : 168 }]}>
        <View style={styles.heroContent}>
          <Text style={styles.heroTitle}>Triagem Diária do Pet</Text>
          <Pressable
            style={({ pressed }) => [styles.heroButton, pressed && styles.heroButtonPressed]}
            onPress={() => navigation.navigate('Checkin')}
          >
            <Ionicons name="calendar-outline" size={16} color={colors.textOnDark} />
            <Text style={styles.heroButtonText}>Iniciar check-in de hoje</Text>
          </Pressable>
          <Text style={styles.heroCaption}>
            {activePet
              ? lastCheckin?.petId === activePet.id
                ? `Último check-in de ${activePet.nome}: ${lastCheckin.date}`
                : `Triagem diária de ${activePet.nome}`
              : 'Cadastre um pet para começar a triagem.'}
          </Text>
        </View>
        <Text style={styles.heroIllustration}>🐕🐈</Text>
      </View>

      <View style={styles.quickActions}>
        <QuickActionCard
          title="Meus Pets"
          subtitle={getPetsSubtitle(pets)}
          icon={<MaterialCommunityIcons name="paw" size={22} color={colors.accent} />}
          onPress={() => navigation.navigate('Pets')}
        />
        <QuickActionCard
          title="Registros"
          subtitle="Check-in diário"
          icon={<Ionicons name="clipboard-outline" size={22} color={colors.accent} />}
          onPress={() => navigation.navigate('Checkin')}
        />
        <QuickActionCard
          title="Lembretes"
          subtitle={remindersSubtitle}
          icon={<Ionicons name="notifications-outline" size={22} color={colors.accent} />}
          iconBackground={colors.iconBgGreen}
          onPress={() => navigation.navigate('Profile')}
        />
      </View>

      <HealthOverviewCard pets={pets} activePet={activePet} lastCheckin={lastCheckin} />
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
  greeting: {
    fontSize: 28,
    fontWeight: '700',
    color: colors.text,
    letterSpacing: -0.5,
    alignSelf: 'stretch',
    textAlign: 'left',
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
    fontSize: 48,
  },
  quickActions: {
    flexDirection: 'row',
    gap: 10,
    marginBottom: 22,
  },
});
