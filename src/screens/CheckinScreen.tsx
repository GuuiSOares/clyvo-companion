import { useState, useCallback } from 'react';
import {
  View,
  Text,
  TextInput,
  Image,
  Pressable,
  Alert,
  StyleSheet,
  ScrollView,
} from 'react-native';
import { useFocusEffect, useNavigation } from '@react-navigation/native';
import type { BottomTabNavigationProp } from '@react-navigation/bottom-tabs';
import { Ionicons } from '@expo/vector-icons';
import ScreenLayout from '../components/ScreenLayout';
import ActivitySelector from '../components/ActivitySelector';
import type { PetActivityLevel } from '../constants/activityLevels';
import { getWellnessHint, getWellnessLabel } from '../constants/activityLevels';
import { formatPetSpecies } from '../constants/petSpecies';
import { colors, commonStyles } from '../theme';
import type { RootTabParamList } from '../navigation/types';
import type { Pet } from '../types/pet';
import { loadPets, loadLastCheckin, saveLastCheckin } from '../services/petData';
import { hasTutorProfile, loadTutorProfile } from '../services/tutorData';
import FlowHintCard from '../components/FlowHintCard';

export default function CheckinScreen() {
  const navigation = useNavigation<BottomTabNavigationProp<RootTabParamList>>();
  const [tutorReady, setTutorReady] = useState(false);
  const [pets, setPets] = useState<Pet[]>([]);
  const [selectedPetId, setSelectedPetIdState] = useState<string | null>(null);
  const [selectedPet, setSelectedPet] = useState<Pet | null>(null);
  const [wellness, setWellness] = useState<PetActivityLevel | null>(null);
  const [observations, setObservations] = useState('');

  const loadCheckinData = useCallback(async () => {
    const tutor = await loadTutorProfile();
    setTutorReady(hasTutorProfile(tutor));

    const [petsList, lastCheckin] = await Promise.all([loadPets(), loadLastCheckin()]);
    setPets(petsList);

    if (petsList.length === 1) {
      setSelectedPetIdState(petsList[0].id);
      setSelectedPet(petsList[0]);
      return;
    }

    if (lastCheckin) {
      const pet = petsList.find((item) => item.id === lastCheckin.petId);
      if (pet) {
        setSelectedPetIdState(pet.id);
        setSelectedPet(pet);
        return;
      }
    }

    setSelectedPetIdState(null);
    setSelectedPet(null);
  }, []);

  useFocusEffect(
    useCallback(() => {
      loadCheckinData();
    }, [loadCheckinData])
  );

  const handleSelectPet = (pet: Pet) => {
    setSelectedPetIdState(pet.id);
    setSelectedPet(pet);
  };

  const handleSave = async () => {
    const trimmedObservations = observations.trim();

    if (!selectedPet) {
      Alert.alert('Atenção', 'Selecione qual pet você está acompanhando hoje.');
      return;
    }

    if (!wellness) {
      Alert.alert('Atenção', 'Escolha como o pet está se comportando hoje.');
      return;
    }

    await saveLastCheckin({
      petId: selectedPet.id,
      petName: selectedPet.nome,
      activity: wellness,
      observations: trimmedObservations,
      date: new Date().toLocaleDateString('pt-BR'),
    });

    setWellness(null);
    setObservations('');

    Alert.alert(
      'Registro salvo',
      `O acompanhamento de ${selectedPet.nome} de hoje foi guardado. A clínica pode ver no resumo.`
    );
  };

  if (!tutorReady) {
    return (
      <ScreenLayout withHeader keyboard>
        <FlowHintCard
          title="Registro do dia indisponível"
          message="Complete seu perfil em Meu Perfil antes de registrar como o pet está em casa."
          buttonTitle="Ir para Meu Perfil"
          onPress={() => navigation.navigate('Settings')}
        />
      </ScreenLayout>
    );
  }

  if (pets.length === 0) {
    return (
      <ScreenLayout withHeader keyboard>
        <FlowHintCard
          title="Nenhum pet cadastrado"
          message="Cadastre o pet em Meus Pets para poder contar à clínica como ele está no dia a dia."
          buttonTitle="Cadastrar pet"
          onPress={() => navigation.navigate('Pets', { screen: 'PetsList' })}
        />
      </ScreenLayout>
    );
  }

  const needsPetSelection = pets.length > 1 && !selectedPet;

  return (
    <ScreenLayout withHeader keyboard>
      <View style={styles.introCard}>
        <Text style={styles.introTitle}>Registro do dia para a clínica</Text>
        <Text style={styles.introText}>
          Em poucos passos, conte como o pet está em casa. Isso ajuda no acompanhamento entre
          as consultas — você não precisa usar termos médicos.
        </Text>
      </View>

      <Text style={styles.stepTitle}>1. Qual pet você está acompanhando hoje?</Text>
      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.petSelector}>
        {pets.map((pet) => (
          <Pressable
            key={pet.id}
            style={[
              styles.petChip,
              pet.id === selectedPetId && styles.petChipSelected,
            ]}
            onPress={() => handleSelectPet(pet)}
          >
            {pet.fotoUri ? (
              <Image source={{ uri: pet.fotoUri }} style={styles.petChipPhoto} />
            ) : (
              <View style={styles.petChipAvatar}>
                <Text style={styles.petChipAvatarText}>{pet.nome.charAt(0).toUpperCase()}</Text>
              </View>
            )}
            <Text style={styles.petChipName}>{pet.nome}</Text>
          </Pressable>
        ))}
      </ScrollView>

      {needsPetSelection ? (
        <Text style={styles.stepHint}>Toque no pet acima para continuar.</Text>
      ) : null}

      {selectedPet ? (
        <View style={styles.selectedPetCard}>
          <Ionicons name="paw" size={18} color={colors.accent} />
          <View style={styles.selectedPetInfo}>
            <Text style={styles.selectedPetName}>Registrando: {selectedPet.nome}</Text>
            <Text style={styles.selectedPetBreed}>
              {formatPetSpecies(selectedPet.especie, selectedPet.raca)}
            </Text>
          </View>
        </View>
      ) : null}

      <View style={commonStyles.form}>
        <Text style={styles.stepTitle}>2. Como ele está se comportando?</Text>

        <ActivitySelector value={wellness} onChange={setWellness} />

        <Text style={styles.stepTitle}>3. Quer contar mais alguma coisa? (opcional)</Text>
        <View style={commonStyles.field}>
          <Text style={commonStyles.label}>O que você notou hoje</Text>
          <TextInput
            style={[commonStyles.input, commonStyles.textArea]}
            value={observations}
            onChangeText={setObservations}
            placeholder="Ex: comeu menos, coçou muito, vomitou uma vez..."
            placeholderTextColor={colors.placeholder}
            multiline
            numberOfLines={4}
            textAlignVertical="top"
          />
        </View>

        <Pressable
          style={({ pressed }) => [
            commonStyles.primaryButton,
            pressed && commonStyles.primaryButtonPressed,
            needsPetSelection && styles.buttonDisabled,
          ]}
          onPress={handleSave}
        >
          <Text style={commonStyles.primaryButtonText}>Salvar registro de hoje</Text>
        </Pressable>
      </View>

      <View style={commonStyles.summaryCard}>
        <Text style={commonStyles.summaryTitle}>Prévia do que será enviado</Text>
        <View style={commonStyles.summaryRow}>
          <Text style={commonStyles.summaryLabel}>Pet</Text>
          <Text style={commonStyles.summaryValue}>{selectedPet?.nome ?? '—'}</Text>
        </View>
        <View style={commonStyles.summaryRow}>
          <Text style={commonStyles.summaryLabel}>Comportamento</Text>
          <Text style={commonStyles.summaryValue}>
            {wellness ? getWellnessLabel(wellness) : '—'}
          </Text>
        </View>
        {wellness ? (
          <Text style={styles.summaryHint}>{getWellnessHint(wellness)}</Text>
        ) : null}
        <View style={commonStyles.summaryRow}>
          <Text style={commonStyles.summaryLabel}>Detalhes extras</Text>
          <Text style={commonStyles.summaryValue}>{observations.trim() || 'Nenhum'}</Text>
        </View>
      </View>
    </ScreenLayout>
  );
}

const styles = StyleSheet.create({
  introCard: {
    ...commonStyles.card,
    marginBottom: 20,
    gap: 8,
  },
  introTitle: {
    fontSize: 17,
    fontWeight: '700',
    color: colors.text,
  },
  introText: {
    fontSize: 14,
    color: colors.textMuted,
    lineHeight: 20,
  },
  stepTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: colors.text,
    marginBottom: 10,
  },
  stepHint: {
    fontSize: 13,
    color: colors.accent,
    marginBottom: 14,
    marginTop: -6,
  },
  petSelector: {
    marginBottom: 14,
    marginHorizontal: -20,
    paddingHorizontal: 20,
  },
  petChip: {
    alignItems: 'center',
    marginRight: 12,
    padding: 8,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.surface,
    width: 80,
  },
  petChipSelected: {
    borderColor: colors.accent,
    borderWidth: 2,
  },
  petChipPhoto: {
    width: 48,
    height: 48,
    borderRadius: 24,
    marginBottom: 6,
  },
  petChipAvatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
    marginBottom: 6,
    backgroundColor: colors.infoBg,
    borderWidth: 1,
    borderColor: colors.infoBorder,
    alignItems: 'center',
    justifyContent: 'center',
  },
  petChipAvatarText: {
    fontSize: 18,
    fontWeight: '700',
    color: colors.accent,
  },
  petChipName: {
    fontSize: 12,
    fontWeight: '600',
    color: colors.text,
  },
  selectedPetCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    backgroundColor: colors.infoBg,
    borderRadius: 16,
    padding: 14,
    borderWidth: 1,
    borderColor: colors.accent,
    marginBottom: 20,
  },
  selectedPetInfo: {
    flex: 1,
    gap: 2,
  },
  selectedPetName: {
    fontSize: 15,
    fontWeight: '700',
    color: colors.text,
  },
  selectedPetBreed: {
    fontSize: 13,
    color: colors.textMuted,
  },
  buttonDisabled: {
    opacity: 0.7,
  },
  summaryHint: {
    fontSize: 12,
    color: colors.textMuted,
    lineHeight: 16,
    marginTop: -4,
    marginBottom: 8,
    paddingLeft: 2,
  },
});
