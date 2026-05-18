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
import ScreenLayout from '../components/ScreenLayout';
import AppButton from '../components/AppButton';
import ActivitySelector from '../components/ActivitySelector';
import type { PetActivityLevel } from '../constants/activityLevels';
import { colors, commonStyles } from '../theme';
import type { RootTabParamList } from '../navigation/types';
import type { Pet } from '../types/pet';
import {
  getActivePet,
  loadPets,
  saveLastCheckin,
  setSelectedPetId,
} from '../services/petData';

export default function CheckinScreen() {
  const navigation = useNavigation<BottomTabNavigationProp<RootTabParamList>>();
  const [pets, setPets] = useState<Pet[]>([]);
  const [selectedPetId, setSelectedPetIdState] = useState<string | null>(null);
  const [petName, setPetName] = useState('');
  const [activity, setActivity] = useState<PetActivityLevel | null>(null);
  const [observations, setObservations] = useState('');

  const loadCheckinData = useCallback(async () => {
    const petsList = await loadPets();
    setPets(petsList);
    const active = await getActivePet(petsList);
    if (active) {
      setSelectedPetIdState(active.id);
      setPetName(active.nome);
    } else {
      setSelectedPetIdState(null);
      setPetName('');
    }
  }, []);

  useFocusEffect(
    useCallback(() => {
      loadCheckinData();
    }, [loadCheckinData])
  );

  const handleSelectPet = async (pet: Pet) => {
    await setSelectedPetId(pet.id);
    setSelectedPetIdState(pet.id);
    setPetName(pet.nome);
  };

  const handleSave = async () => {
    const trimmedObservations = observations.trim();

    if (!selectedPetId || !petName.trim()) {
      Alert.alert('Atenção', 'Selecione um pet cadastrado para fazer o check-in.');
      return;
    }

    if (!activity) {
      Alert.alert('Atenção', 'Selecione como está a atividade do pet hoje.');
      return;
    }

    await saveLastCheckin({
      petId: selectedPetId,
      petName: petName.trim(),
      activity,
      observations: trimmedObservations,
      date: new Date().toLocaleDateString('pt-BR'),
    });

    setActivity(null);
    setObservations('');

    Alert.alert('Sucesso', `Check-in de ${petName} salvo com sucesso!`);
  };

  if (pets.length === 0) {
    return (
      <ScreenLayout withHeader keyboard>
        <View style={styles.emptyCard}>
          <Text style={styles.emptyTitle}>Nenhum pet cadastrado</Text>
          <Text style={styles.emptyText}>
            Cadastre um pet em Meus Pets antes de fazer a triagem diária.
          </Text>
          <AppButton
            title="Cadastrar pet"
            onPress={() => navigation.navigate('Pets', { screen: 'PetsList' })}
          />
        </View>
      </ScreenLayout>
    );
  }

  return (
    <ScreenLayout withHeader keyboard>
      <Text style={commonStyles.subtitle}>
        Selecione o pet e registre a triagem de hoje.
      </Text>

      <Text style={styles.selectorTitle}>Pet do check-in</Text>
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

      <View style={commonStyles.form}>
        <View style={commonStyles.field}>
          <Text style={commonStyles.label}>Nome do Pet</Text>
          <TextInput
            style={[commonStyles.input, styles.readOnlyInput]}
            value={petName}
            editable={false}
            placeholderTextColor={colors.placeholder}
          />
        </View>

        <ActivitySelector value={activity} onChange={setActivity} />

        <View style={commonStyles.field}>
          <Text style={commonStyles.label}>Observações</Text>
          <TextInput
            style={[commonStyles.input, commonStyles.textArea]}
            value={observations}
            onChangeText={setObservations}
            placeholder="Descreva qualquer detalhe relevante..."
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
          ]}
          onPress={handleSave}
        >
          <Text style={commonStyles.primaryButtonText}>Salvar Triagem</Text>
        </Pressable>
      </View>

      <View style={commonStyles.summaryCard}>
        <Text style={commonStyles.summaryTitle}>Resumo em tempo real</Text>
        <View style={commonStyles.summaryRow}>
          <Text style={commonStyles.summaryLabel}>Nome do Pet</Text>
          <Text style={commonStyles.summaryValue}>{petName.trim() || '—'}</Text>
        </View>
        <View style={commonStyles.summaryRow}>
          <Text style={commonStyles.summaryLabel}>Atividade</Text>
          <Text style={commonStyles.summaryValue}>{activity ?? '—'}</Text>
        </View>
        <View style={commonStyles.summaryRow}>
          <Text style={commonStyles.summaryLabel}>Observações</Text>
          <Text style={commonStyles.summaryValue}>{observations.trim() || '—'}</Text>
        </View>
      </View>
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
  selectorTitle: {
    fontSize: 13,
    fontWeight: '600',
    color: colors.textMuted,
    marginBottom: 10,
    textTransform: 'uppercase',
    letterSpacing: 0.4,
  },
  petSelector: {
    marginBottom: 18,
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
  readOnlyInput: {
    opacity: 0.85,
  },
});
