import { useMemo, useState } from 'react';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import {
  View,
  Text,
  TextInput,
  FlatList,
  Modal,
  Pressable,
  Alert,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  ActivityIndicator,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme, type AppColors } from '../theme';
import ScreenLayout from '../components/ScreenLayout';
import PetCard from '../components/PetCard';
import SpeciesSelector from '../components/SpeciesSelector';
import type { PetSpecies } from '../constants/petSpecies';
import type { PetsStackParamList } from '../navigation/types';
import type { Pet } from '../types/pet';
import FlowHintCard from '../components/FlowHintCard';
import { usePetMutations, usePetsQuery } from '../hooks/usePets';
import { isValidBirthDate } from '../utils/petBirthDate';
import { ApiError } from '../services/httpClient';

type PetsListNav = NativeStackNavigationProp<PetsStackParamList, 'PetsList'>;

export default function PetsScreen() {
  const { colors, commonStyles } = useTheme();
  const styles = useMemo(() => createStyles(colors), [colors]);
  const navigation = useNavigation<PetsListNav>();
  const petsQuery = usePetsQuery();
  const { create, update } = usePetMutations();
  const [modalVisible, setModalVisible] = useState(false);
  const [editingPet, setEditingPet] = useState<Pet | null>(null);
  const [nome, setNome] = useState('');
  const [especie, setEspecie] = useState<PetSpecies | null>(null);
  const [dtNascimento, setDtNascimento] = useState('');

  const pets = petsQuery.data ?? [];

  const resetForm = () => {
    setEditingPet(null);
    setNome('');
    setEspecie(null);
    setDtNascimento('');
  };

  const closeModal = () => {
    setModalVisible(false);
    resetForm();
  };

  const openCreate = () => {
    resetForm();
    setModalVisible(true);
  };

  const openEdit = (pet: Pet) => {
    setEditingPet(pet);
    setNome(pet.nome);
    setEspecie(pet.especie ?? null);
    setDtNascimento(pet.dtNascimento);
    setModalVisible(true);
  };

  const handleSavePet = async () => {
    const trimmedNome = nome.trim();
    const trimmedDate = dtNascimento.trim();

    if (!trimmedNome || !especie || !trimmedDate) {
      Alert.alert('Atenção', 'Preencha o nome, o tipo e a data de nascimento (AAAA-MM-DD).');
      return;
    }

    if (!isValidBirthDate(trimmedDate)) {
      Alert.alert('Atenção', 'Use a data no formato AAAA-MM-DD. Ex: 2020-05-10');
      return;
    }

    try {
      if (editingPet) {
        await update.mutateAsync({
          idPet: editingPet.idPet,
          nome: trimmedNome,
          especie,
          dtNascimento: trimmedDate,
        });
        closeModal();
        Alert.alert('Pronto', `${trimmedNome} foi atualizado.`);
        return;
      }

      await create.mutateAsync({
        nome: trimmedNome,
        especie,
        dtNascimento: trimmedDate,
      });
      closeModal();
      Alert.alert('Pronto', `${trimmedNome} foi cadastrado na clínica.`);
    } catch (error) {
      const message = error instanceof ApiError || error instanceof Error
        ? error.message
        : 'Não foi possível salvar o pet.';
      Alert.alert('Erro', message);
    }
  };

  if (petsQuery.isLoading) {
    return (
      <ScreenLayout withHeader>
        <View style={styles.loading}>
          <ActivityIndicator size="large" color={colors.accent} />
          <Text style={styles.loadingText}>Carregando seus pets...</Text>
        </View>
      </ScreenLayout>
    );
  }

  if (petsQuery.isError) {
    return (
      <ScreenLayout withHeader>
        <FlowHintCard
          title="Não foi possível carregar os pets"
          message={
            petsQuery.error instanceof Error
              ? petsQuery.error.message
              : 'Tente de novo em alguns segundos.'
          }
          buttonTitle="Tentar de novo"
          onPress={() => petsQuery.refetch()}
        />
      </ScreenLayout>
    );
  }

  const saving = create.isPending || update.isPending;

  return (
    <ScreenLayout withHeader scrollable={false}>
      <Pressable
        style={({ pressed }) => [styles.registerButton, pressed && styles.registerButtonPressed]}
        onPress={openCreate}
      >
        <Text style={styles.registerButtonText}>Cadastrar pet na clínica</Text>
      </Pressable>

      <Text style={[commonStyles.subtitle, styles.hint]}>
        Toque no pet para ver o prontuário. O lápis edita os dados.
      </Text>
      <Text style={[commonStyles.subtitle, styles.count]}>
        {pets.length} pet{pets.length !== 1 ? 's' : ''} cadastrado{pets.length !== 1 ? 's' : ''}
      </Text>

      <FlatList
        data={pets}
        keyExtractor={(item) => item.id}
        style={styles.list}
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
        ItemSeparatorComponent={() => <View style={styles.separator} />}
        onRefresh={() => petsQuery.refetch()}
        refreshing={petsQuery.isRefetching}
        renderItem={({ item }) => (
          <PetCard
            nome={item.nome}
            especie={item.especie}
            dtNascimento={item.dtNascimento}
            onPress={() => navigation.navigate('PetDetails', { petId: item.id })}
            onEdit={() => openEdit(item)}
          />
        )}
        ListEmptyComponent={
          <View style={styles.empty}>
            <Text style={styles.emptyTitle}>Nenhum pet cadastrado</Text>
            <Text style={styles.emptyText}>
              Cadastre seu primeiro pet usando o botão acima.
            </Text>
          </View>
        }
      />

      <Modal visible={modalVisible} animationType="slide" transparent onRequestClose={closeModal}>
        <View style={styles.modalOverlay}>
          <Pressable style={styles.modalBackdrop} onPress={closeModal} accessibilityLabel="Fechar" />
          <KeyboardAvoidingView
            behavior={Platform.OS === 'ios' ? 'padding' : undefined}
            style={styles.modalKeyboard}
          >
            <View style={styles.modalContent}>
              <View style={styles.modalHeader}>
                <Text style={styles.modalTitle}>
                  {editingPet ? 'Editar pet' : 'Cadastrar Novo Pet'}
                </Text>
                <Pressable
                  style={({ pressed }) => [styles.closeButton, pressed && styles.closeButtonPressed]}
                  onPress={closeModal}
                  hitSlop={12}
                  accessibilityLabel="Fechar"
                >
                  <Ionicons name="close" size={24} color={colors.textMuted} />
                </Pressable>
              </View>

              <ScrollView
                showsVerticalScrollIndicator
                keyboardShouldPersistTaps="handled"
                nestedScrollEnabled
                contentContainerStyle={styles.modalScrollContent}
              >
                <View style={commonStyles.field}>
                  <Text style={commonStyles.label}>Nome do Pet</Text>
                  <TextInput
                    style={commonStyles.input}
                    value={nome}
                    onChangeText={setNome}
                    placeholder="Ex: Thor"
                    placeholderTextColor={colors.placeholder}
                  />
                </View>

                <SpeciesSelector value={especie} onChange={setEspecie} />

                <View style={commonStyles.field}>
                  <Text style={commonStyles.label}>Nascimento (AAAA-MM-DD)</Text>
                  <TextInput
                    style={commonStyles.input}
                    value={dtNascimento}
                    onChangeText={setDtNascimento}
                    placeholder="Ex: 2020-05-10"
                    placeholderTextColor={colors.placeholder}
                    autoCapitalize="none"
                  />
                </View>

                <Pressable
                  style={({ pressed }) => [
                    commonStyles.primaryButton,
                    pressed && commonStyles.primaryButtonPressed,
                    styles.saveButton,
                    saving && styles.buttonDisabled,
                  ]}
                  onPress={handleSavePet}
                  disabled={saving}
                >
                  <Text style={commonStyles.primaryButtonText}>
                    {saving ? 'Salvando...' : 'Salvar'}
                  </Text>
                </Pressable>
              </ScrollView>
            </View>
          </KeyboardAvoidingView>
        </View>
      </Modal>
    </ScreenLayout>
  );
}

function createStyles(colors: AppColors) {
  return StyleSheet.create({
  loading: {
    alignItems: 'center',
    paddingTop: 48,
    gap: 12,
  },
  loadingText: {
    fontSize: 14,
    color: colors.textMuted,
  },
  registerButton: {
    backgroundColor: colors.primaryLight,
    borderRadius: 24,
    paddingVertical: 14,
    alignItems: 'center',
    marginBottom: 16,
  },
  registerButtonPressed: {
    backgroundColor: colors.primaryPressed,
  },
  registerButtonText: {
    color: colors.textOnDark,
    fontSize: 16,
    fontWeight: '600',
  },
  hint: {
    marginBottom: 8,
  },
  count: {
    marginBottom: 16,
  },
  list: {
    flex: 1,
  },
  listContent: {
    paddingBottom: 24,
  },
  separator: {
    height: 10,
  },
  empty: {
    alignItems: 'center',
    paddingTop: 48,
    gap: 8,
  },
  emptyTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.text,
  },
  emptyText: {
    fontSize: 14,
    color: colors.textMuted,
    textAlign: 'center',
  },
  modalOverlay: {
    flex: 1,
    justifyContent: 'flex-end',
  },
  modalBackdrop: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
  },
  modalKeyboard: {
    width: '100%',
  },
  modalContent: {
    backgroundColor: colors.surface,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    padding: 20,
    paddingBottom: 32,
    borderWidth: 1,
    borderColor: colors.border,
    maxHeight: '90%',
  },
  modalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 20,
  },
  modalScrollContent: {
    paddingBottom: 24,
  },
  modalTitle: {
    flex: 1,
    fontSize: 20,
    fontWeight: '700',
    color: colors.text,
    paddingRight: 12,
  },
  closeButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.surfaceElevated,
    borderWidth: 1,
    borderColor: colors.border,
  },
  closeButtonPressed: {
    opacity: 0.8,
    backgroundColor: colors.infoBg,
  },
  saveButton: {
    marginTop: 4,
  },
  buttonDisabled: {
    opacity: 0.7,
  },
  });
}
