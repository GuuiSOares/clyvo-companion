import { useState, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  Pressable,
  Alert,
  StyleSheet,
  ScrollView,
  ActivityIndicator,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import type { BottomTabNavigationProp } from '@react-navigation/bottom-tabs';
import { Ionicons } from '@expo/vector-icons';
import ScreenLayout from '../components/ScreenLayout';
import MetricSelector from '../components/MetricSelector';
import {
  getHealthMetric,
  getHealthMetricHint,
  getHealthMetricLabel,
  isHealthMetric,
  parseMetricValue,
  type HealthMetric,
} from '../constants/healthMetrics';
import { formatPetSpecies } from '../constants/petSpecies';
import { colors, commonStyles } from '../theme';
import type { RootTabParamList } from '../navigation/types';
import type { Pet } from '../types/pet';
import FlowHintCard from '../components/FlowHintCard';
import { usePetsQuery } from '../hooks/usePets';
import { useHealthLogMutations, useHealthLogsQuery } from '../hooks/useHealthLogs';
import { formatLogDate, formatLogSummary, type HealthLog } from '../utils/healthLog';
import { ApiError } from '../services/httpClient';

export default function CheckinScreen() {
  const navigation = useNavigation<BottomTabNavigationProp<RootTabParamList>>();
  const petsQuery = usePetsQuery();
  const pets = petsQuery.data ?? [];
  const { create, update, remove } = useHealthLogMutations();
  const [selectedPetId, setSelectedPetIdState] = useState<string | null>(null);
  const [selectedPet, setSelectedPet] = useState<Pet | null>(null);
  const [metrica, setMetrica] = useState<HealthMetric | null>(null);
  const [valor, setValor] = useState('');
  const [observations, setObservations] = useState('');
  const [editingLog, setEditingLog] = useState<HealthLog | null>(null);

  const logsQuery = useHealthLogsQuery(selectedPet?.idPet ?? 0);
  const logs = logsQuery.data ?? [];

  useEffect(() => {
    if (pets.length === 1) {
      setSelectedPetIdState(pets[0].id);
      setSelectedPet(pets[0]);
      return;
    }

    if (selectedPetId) {
      const pet = pets.find((item) => item.id === selectedPetId);
      if (pet) {
        setSelectedPet(pet);
        return;
      }
    }

    if (pets.length === 0) {
      setSelectedPetIdState(null);
      setSelectedPet(null);
    }
  }, [pets, selectedPetId]);

  const resetForm = () => {
    setEditingLog(null);
    setMetrica(null);
    setValor('');
    setObservations('');
  };

  const handleSelectPet = (pet: Pet) => {
    setSelectedPetIdState(pet.id);
    setSelectedPet(pet);
    resetForm();
  };

  const handleEditLog = (log: HealthLog) => {
    setEditingLog(log);
    setMetrica(isHealthMetric(log.metrica) ? log.metrica : null);
    setValor(String(log.vlMetrica).replace('.', ','));
    setObservations(log.observations);
  };

  const handleDeleteLog = (log: HealthLog) => {
    Alert.alert('Excluir registro', 'Remover este registro do prontuário?', [
      { text: 'Cancelar', style: 'cancel' },
      {
        text: 'Excluir',
        style: 'destructive',
        onPress: async () => {
          try {
            await remove.mutateAsync(log.idLog);
            if (editingLog?.idLog === log.idLog) resetForm();
          } catch (error) {
            Alert.alert(
              'Erro',
              error instanceof Error ? error.message : 'Não foi possível excluir o registro.'
            );
          }
        },
      },
    ]);
  };

  const handleSave = async () => {
    const trimmedObservations = observations.trim();

    if (!selectedPet) {
      Alert.alert('Atenção', 'Selecione qual pet você está acompanhando hoje.');
      return;
    }

    if (!metrica) {
      Alert.alert(
        'Atenção',
        'Escolha o que você vai registrar: peso, alimentação, exercício, temperatura ou frequência cardíaca.'
      );
      return;
    }

    const vlMetrica = parseMetricValue(valor);
    if (vlMetrica === null) {
      Alert.alert('Atenção', 'Digite o número que você mediu. Use vírgula se precisar, como 12,4.');
      return;
    }

    try {
      if (editingLog) {
        await update.mutateAsync({
          idLog: editingLog.idLog,
          idPet: selectedPet.idPet,
          metrica,
          vlMetrica,
          observations: trimmedObservations,
          dtRegistro: editingLog.dtRegistro,
        });
        resetForm();
        Alert.alert(
          'Registro atualizado',
          `O veterinário já vê o acompanhamento atualizado de ${selectedPet.nome}.`
        );
        return;
      }

      await create.mutateAsync({
        idPet: selectedPet.idPet,
        metrica,
        vlMetrica,
        observations: trimmedObservations,
      });
      resetForm();
      Alert.alert(
        'Registro salvo',
        `O acompanhamento de ${selectedPet.nome} já está no prontuário para o veterinário.`
      );
    } catch (error) {
      Alert.alert(
        'Erro',
        error instanceof ApiError || error instanceof Error
          ? error.message
          : 'Não foi possível salvar o registro.'
      );
    }
  };

  if (pets.length === 0) {
    return (
      <ScreenLayout withHeader keyboard>
        <FlowHintCard
          title="Nenhum pet cadastrado"
          message="Cadastre o pet em Meus Pets para registrar o que o veterinário precisa acompanhar."
          buttonTitle="Cadastrar pet"
          onPress={() => navigation.navigate('Pets', { screen: 'PetsList' })}
        />
      </ScreenLayout>
    );
  }

  const needsPetSelection = pets.length > 1 && !selectedPet;
  const saving = create.isPending || update.isPending;

  return (
    <ScreenLayout withHeader keyboard>
      <View style={styles.introCard}>
        <Text style={styles.introTitle}>Registro para o veterinário</Text>
        <Text style={styles.introText}>
          Anote o que você mediu em casa. O veterinário usa esses números no prontuário. Dá para
          corrigir ou apagar depois.
        </Text>
      </View>

      <Text style={styles.stepTitle}>1. Qual pet você está registrando?</Text>
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
            <View style={styles.petChipAvatar}>
              <Text style={styles.petChipAvatarText}>{pet.nome.charAt(0).toUpperCase()}</Text>
            </View>
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
            <Text style={styles.selectedPetName}>
              {editingLog ? `Editando registro de ${selectedPet.nome}` : `Registrando: ${selectedPet.nome}`}
            </Text>
            <Text style={styles.selectedPetBreed}>{formatPetSpecies(selectedPet.especie)}</Text>
          </View>
        </View>
      ) : null}

      <View style={commonStyles.form}>
        <Text style={styles.stepTitle}>2. O que você mediu hoje?</Text>

        <MetricSelector value={metrica} onChange={setMetrica} />

        <Text style={styles.stepTitle}>3. Qual foi o valor?</Text>
        <View style={commonStyles.field}>
          <Text style={commonStyles.label}>
            {metrica
              ? `${getHealthMetricLabel(metrica)} (${getHealthMetric(metrica)?.unit})`
              : 'Número medido'}
          </Text>
          <TextInput
            style={commonStyles.input}
            value={valor}
            onChangeText={setValor}
            placeholder={getHealthMetric(metrica ?? '')?.placeholder ?? 'Escolha o tipo de registro primeiro'}
            placeholderTextColor={colors.placeholder}
            keyboardType="decimal-pad"
            editable={!!metrica}
          />
        </View>
        {metrica ? (
          <Text style={styles.summaryHint}>{getHealthMetricHint(metrica)}</Text>
        ) : (
          <Text style={styles.summaryHint}>
            Primeiro escolha o tipo de registro. A unidade aparece junto do campo, como kg ou minutos.
          </Text>
        )}

        <Text style={styles.stepTitle}>4. Recado para o veterinário (opcional)</Text>
        <View style={commonStyles.field}>
          <Text style={commonStyles.label}>O que o veterinário precisa saber</Text>
          <TextInput
            style={[commonStyles.input, commonStyles.textArea]}
            value={observations}
            onChangeText={setObservations}
            placeholder="Ex: comeu menos, está mais quieto, vomitou uma vez..."
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
            (needsPetSelection || saving) && styles.buttonDisabled,
          ]}
          onPress={handleSave}
          disabled={saving || needsPetSelection}
        >
          <Text style={commonStyles.primaryButtonText}>
            {saving ? 'Salvando...' : editingLog ? 'Atualizar registro' : 'Salvar registro de hoje'}
          </Text>
        </Pressable>

        {editingLog ? (
          <Pressable onPress={resetForm} style={styles.cancelEdit}>
            <Text style={styles.cancelEditText}>Cancelar edição</Text>
          </Pressable>
        ) : null}
      </View>

      <View style={commonStyles.summaryCard}>
        <Text style={commonStyles.summaryTitle}>O que o veterinário vai ver</Text>
        <View style={commonStyles.summaryRow}>
          <Text style={commonStyles.summaryLabel}>Pet</Text>
          <Text style={commonStyles.summaryValue}>{selectedPet?.nome ?? '—'}</Text>
        </View>
        <View style={commonStyles.summaryRow}>
          <Text style={commonStyles.summaryLabel}>Tipo de registro</Text>
          <Text style={commonStyles.summaryValue}>
            {metrica ? getHealthMetricLabel(metrica) : '—'}
          </Text>
        </View>
        <View style={commonStyles.summaryRow}>
          <Text style={commonStyles.summaryLabel}>Valor</Text>
          <Text style={commonStyles.summaryValue}>
            {metrica && parseMetricValue(valor) !== null
              ? formatLogSummary({ metrica, vlMetrica: parseMetricValue(valor)! })
              : valor.trim() || '—'}
          </Text>
        </View>
        <View style={commonStyles.summaryRow}>
          <Text style={commonStyles.summaryLabel}>Recado</Text>
          <Text style={commonStyles.summaryValue}>{observations.trim() || 'Nenhum'}</Text>
        </View>
      </View>

      {selectedPet ? (
        <View style={styles.history}>
          <Text style={styles.stepTitle}>Registros anteriores</Text>
          {logsQuery.isLoading ? (
            <ActivityIndicator color={colors.accent} />
          ) : logs.length === 0 ? (
            <Text style={styles.emptyHistory}>Ainda não há registros deste pet.</Text>
          ) : (
            logs.map((log) => (
              <View key={log.id} style={styles.logCard}>
                <View style={styles.logInfo}>
                  <Text style={styles.logTitle}>{formatLogSummary(log)}</Text>
                  <Text style={styles.logDate}>
                    {getHealthMetricLabel(log.metrica)} · {formatLogDate(log.dtRegistro)}
                  </Text>
                  {log.observations ? (
                    <Text style={styles.logObs}>{log.observations}</Text>
                  ) : null}
                </View>
                <View style={styles.logActions}>
                  <Pressable onPress={() => handleEditLog(log)} hitSlop={8}>
                    <Text style={styles.logAction}>Editar</Text>
                  </Pressable>
                  <Pressable onPress={() => handleDeleteLog(log)} hitSlop={8}>
                    <Text style={[styles.logAction, styles.logDelete]}>Excluir</Text>
                  </Pressable>
                </View>
              </View>
            ))
          )}
        </View>
      ) : null}
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
  cancelEdit: {
    alignItems: 'center',
    marginTop: 10,
  },
  cancelEditText: {
    color: colors.accent,
    fontSize: 14,
    fontWeight: '600',
  },
  summaryHint: {
    fontSize: 12,
    color: colors.textMuted,
    lineHeight: 16,
    marginTop: -4,
    marginBottom: 8,
    paddingLeft: 2,
  },
  history: {
    marginTop: 8,
    marginBottom: 24,
    gap: 10,
  },
  emptyHistory: {
    fontSize: 13,
    color: colors.textMuted,
  },
  logCard: {
    ...commonStyles.card,
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 12,
    marginBottom: 0,
  },
  logInfo: {
    flex: 1,
    gap: 4,
  },
  logTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: colors.text,
  },
  logDate: {
    fontSize: 12,
    color: colors.textMuted,
  },
  logObs: {
    fontSize: 13,
    color: colors.textSecondary,
    lineHeight: 18,
  },
  logActions: {
    gap: 10,
    alignItems: 'flex-end',
  },
  logAction: {
    fontSize: 13,
    fontWeight: '700',
    color: colors.accent,
  },
  logDelete: {
    color: colors.danger,
  },
});
