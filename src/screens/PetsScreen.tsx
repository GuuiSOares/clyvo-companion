import { useState, useCallback } from 'react';
import { useFocusEffect, useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import {
  View,
  Text,
  TextInput,
  Image,
  FlatList,
  Modal,
  Pressable,
  Alert,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
} from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import { Ionicons } from '@expo/vector-icons';
import { colors, commonStyles } from '../theme';
import ScreenLayout from '../components/ScreenLayout';
import PetCard from '../components/PetCard';
import SpeciesSelector from '../components/SpeciesSelector';
import type { PetSpecies } from '../constants/petSpecies';
import type { PetsStackParamList } from '../navigation/types';
import type { Pet } from '../types/pet';
import { normalizePetWeight } from '../utils/petWeight';
import {
  loadPets as fetchPets,
  savePets as persistPets,
} from '../services/petData';
import { hasTutorProfile, loadTutorProfile } from '../services/tutorData';
import FlowHintCard from '../components/FlowHintCard';

type PetsListNav = NativeStackNavigationProp<PetsStackParamList, 'PetsList'>;

export default function PetsScreen() {
  const navigation = useNavigation<PetsListNav>();
  const tabNavigation = navigation.getParent();
  const [tutorReady, setTutorReady] = useState(false);
  const [pets, setPets] = useState<Pet[]>([]);
  const [modalVisible, setModalVisible] = useState(false);
  const [nome, setNome] = useState('');
  const [especie, setEspecie] = useState<PetSpecies | null>(null);
  const [raca, setRaca] = useState('');
  const [peso, setPeso] = useState('');
  const [fotoUri, setFotoUri] = useState('');
  const loadPets = useCallback(async () => {
    try {
      const tutor = await loadTutorProfile();
      setTutorReady(hasTutorProfile(tutor));

      const petsList = await fetchPets();
      setPets(petsList);
    } catch {
      Alert.alert('Erro', 'Não foi possível carregar os pets salvos.');
    }
  }, []);

  const goToTutorProfile = () => {
    tabNavigation?.navigate('Settings');
  };

  const handleOpenRegister = async () => {
    const tutor = await loadTutorProfile();
    if (!hasTutorProfile(tutor)) {
      Alert.alert(
        'Perfil do tutor necessário',
        'Complete seu perfil em Meu Perfil (nome obrigatório) antes de cadastrar um pet.',
        [
          { text: 'Cancelar', style: 'cancel' },
          { text: 'Criar perfil', onPress: goToTutorProfile },
        ]
      );
      return;
    }
    setModalVisible(true);
  };

  useFocusEffect(
    useCallback(() => {
      loadPets();
    }, [loadPets])
  );

  const savePets = async (updatedPets: Pet[]) => {
    await persistPets(updatedPets);
    setPets(updatedPets);
  };

  const resetForm = () => {
    setNome('');
    setEspecie(null);
    setRaca('');
    setPeso('');
    setFotoUri('');
  };

  const closeModal = () => {
    setModalVisible(false);
    resetForm();
  };

  const handlePickImage = async () => {
    const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!permission.granted) {
      Alert.alert('Permissão necessária', 'Permita o acesso à galeria para escolher a foto do pet.');
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

  const handleSavePet = async () => {
    const trimmedNome = nome.trim();
    const trimmedRaca = raca.trim();
    const trimmedPeso = peso.trim();

    if (!trimmedNome || !especie || !trimmedRaca || !trimmedPeso) {
      Alert.alert('Atenção', 'Preencha o nome, o tipo, a raça e o peso do pet.');
      return;
    }

    const newPet: Pet = {
      id: Date.now().toString(),
      nome: trimmedNome,
      especie,
      raca: trimmedRaca,
      peso: normalizePetWeight(trimmedPeso),
      ...(fotoUri ? { fotoUri } : {}),
    };

    try {
      const updatedPets = [...pets, newPet];
      await savePets(updatedPets);
      closeModal();
      Alert.alert('Sucesso', 'Pet cadastrado com sucesso!');
    } catch {
      Alert.alert('Erro', 'Não foi possível salvar o pet.');
    }
  };

  if (!tutorReady) {
    return (
      <ScreenLayout withHeader>
        <FlowHintCard
          title="Cadastro de pets bloqueado"
          message="Complete seu perfil em Meu Perfil (nome obrigatório, foto opcional) para cadastrar seu primeiro pet."
          buttonTitle="Ir para Meu Perfil"
          onPress={goToTutorProfile}
        />
      </ScreenLayout>
    );
  }

  return (
    <ScreenLayout withHeader scrollable={false}>
      <Pressable
        style={({ pressed }) => [styles.registerButton, pressed && styles.registerButtonPressed]}
        onPress={handleOpenRegister}
      >
        <Text style={styles.registerButtonText}>Cadastrar pet na clínica</Text>
      </Pressable>

      <Text style={[commonStyles.subtitle, styles.hint]}>
        Toque no pet para ver o prontuário na clínica.
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
        renderItem={({ item }) => (
          <PetCard
            nome={item.nome}
            especie={item.especie}
            raca={item.raca}
            peso={item.peso}
            fotoUri={item.fotoUri}
            onPress={() => navigation.navigate('PetDetails', { petId: item.id })}
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
                <Text style={styles.modalTitle}>Cadastrar Novo Pet</Text>
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
                <Text style={commonStyles.label}>Raça</Text>
                <TextInput
                  style={commonStyles.input}
                  value={raca}
                  onChangeText={setRaca}
                  placeholder="Ex: Labrador"
                  placeholderTextColor={colors.placeholder}
                />
              </View>

              <View style={commonStyles.field}>
                <Text style={commonStyles.label}>Peso (kg)</Text>
                <TextInput
                  style={commonStyles.input}
                  value={peso}
                  onChangeText={setPeso}
                  placeholder="Ex: 12"
                  keyboardType="decimal-pad"
                  placeholderTextColor={colors.placeholder}
                  keyboardType="default"
                />
              </View>

              <Pressable
                style={({ pressed }) => [styles.pickPhotoButton, pressed && styles.pickPhotoButtonPressed]}
                onPress={handlePickImage}
              >
                <Text style={styles.pickPhotoButtonText}>Escolher foto (opcional)</Text>
              </Pressable>

              {fotoUri ? <Image source={{ uri: fotoUri }} style={styles.thumbnail} /> : null}

              <Pressable
                style={({ pressed }) => [
                  commonStyles.primaryButton,
                  pressed && commonStyles.primaryButtonPressed,
                  styles.saveButton,
                ]}
                onPress={handleSavePet}
              >
                <Text style={commonStyles.primaryButtonText}>Salvar</Text>
              </Pressable>

              </ScrollView>
            </View>
          </KeyboardAvoidingView>
        </View>
      </Modal>
    </ScreenLayout>
  );
}

const styles = StyleSheet.create({
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
  pickPhotoButton: {
    backgroundColor: colors.surfaceElevated,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 24,
    paddingVertical: 12,
    alignItems: 'center',
    marginBottom: 16,
  },
  pickPhotoButtonPressed: {
    backgroundColor: colors.infoBg,
  },
  pickPhotoButtonText: {
    color: colors.textSecondary,
    fontSize: 15,
    fontWeight: '600',
  },
  thumbnail: {
    width: 120,
    height: 120,
    borderRadius: 60,
    alignSelf: 'center',
    marginBottom: 20,
    borderWidth: 2,
    borderColor: colors.accent,
  },
  saveButton: {
    marginTop: 4,
  },
});
