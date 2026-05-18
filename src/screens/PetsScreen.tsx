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
import { colors, commonStyles } from '../theme';
import ScreenLayout from '../components/ScreenLayout';
import PetCard from '../components/PetCard';
import SpeciesSelector from '../components/SpeciesSelector';
import type { PetSpecies } from '../constants/petSpecies';
import type { PetsStackParamList } from '../navigation/types';
import type { Pet } from '../types/pet';
import {
  loadPets as fetchPets,
  savePets as persistPets,
  setSelectedPetId,
  getActivePet,
  savePetVitals,
} from '../services/petData';
type PetsListNav = NativeStackNavigationProp<PetsStackParamList, 'PetsList'>;

export default function PetsScreen() {
  const navigation = useNavigation<PetsListNav>();
  const [pets, setPets] = useState<Pet[]>([]);
  const [modalVisible, setModalVisible] = useState(false);
  const [nome, setNome] = useState('');
  const [especie, setEspecie] = useState<PetSpecies | null>(null);
  const [raca, setRaca] = useState('');
  const [peso, setPeso] = useState('');
  const [fotoUri, setFotoUri] = useState('');
  const [selectedPetId, setSelectedPetIdState] = useState<string | null>(null);

  const loadPets = useCallback(async () => {
    try {
      const petsList = await fetchPets();
      setPets(petsList);
      const active = await getActivePet(petsList);
      setSelectedPetIdState(active?.id ?? null);
    } catch {
      Alert.alert('Erro', 'Não foi possível carregar os pets salvos.');
    }
  }, []);

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
      peso: trimmedPeso,
      ...(fotoUri ? { fotoUri } : {}),
    };

    try {
      const updatedPets = [...pets, newPet];
      await savePets(updatedPets);
      await savePetVitals(newPet.id, { ultimaVacina: 'Não registrada' });
      await setSelectedPetId(newPet.id);
      setSelectedPetIdState(newPet.id);
      closeModal();
      Alert.alert('Sucesso', 'Pet cadastrado com sucesso!');
    } catch {
      Alert.alert('Erro', 'Não foi possível salvar o pet.');
    }
  };

  return (
    <ScreenLayout withHeader scrollable={false}>
      <Pressable
        style={({ pressed }) => [styles.registerButton, pressed && styles.registerButtonPressed]}
        onPress={() => setModalVisible(true)}
      >
        <Text style={styles.registerButtonText}>Cadastrar Novo Pet</Text>
      </Pressable>

      <Text style={[commonStyles.subtitle, styles.hint]}>
        Toque no pet para ver os detalhes. O pet ativo é definido na tela de detalhes.
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
            selected={item.id === selectedPetId}
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
          <KeyboardAvoidingView
            behavior={Platform.OS === 'ios' ? 'padding' : undefined}
            style={styles.modalKeyboard}
          >
            <View style={styles.modalContent}>
              <Text style={styles.modalTitle}>Cadastrar Novo Pet</Text>

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
                <Text style={commonStyles.label}>Peso</Text>
                <TextInput
                  style={commonStyles.input}
                  value={peso}
                  onChangeText={setPeso}
                  placeholder="Ex: 12 kg"
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

              <Pressable
                style={({ pressed }) => [styles.cancelButton, pressed && styles.cancelButtonPressed]}
                onPress={closeModal}
              >
                <Text style={styles.cancelButtonText}>Cancelar</Text>
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
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
    justifyContent: 'flex-end',
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
  modalScrollContent: {
    paddingBottom: 24,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: colors.text,
    marginBottom: 20,
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
    marginBottom: 10,
  },
  cancelButton: {
    paddingVertical: 12,
    alignItems: 'center',
  },
  cancelButtonPressed: {
    opacity: 0.8,
  },
  cancelButtonText: {
    color: colors.textMuted,
    fontSize: 15,
    fontWeight: '600',
  },
});
