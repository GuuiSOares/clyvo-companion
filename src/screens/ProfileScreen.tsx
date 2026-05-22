import { useState, useCallback } from 'react';
import { FlatList, View, Text, StyleSheet } from 'react-native';
import { useFocusEffect, useNavigation } from '@react-navigation/native';
import type { BottomTabNavigationProp } from '@react-navigation/bottom-tabs';
import ScreenLayout from '../components/ScreenLayout';
import PetCard from '../components/PetCard';
import FlowHintCard from '../components/FlowHintCard';
import { commonStyles } from '../theme';
import type { RootTabParamList } from '../navigation/types';
import type { Pet } from '../types/pet';
import { loadPets } from '../services/petData';
import { hasTutorProfile, loadTutorProfile } from '../services/tutorData';

export default function ProfileScreen() {
  const navigation = useNavigation<BottomTabNavigationProp<RootTabParamList>>();
  const [tutorReady, setTutorReady] = useState(false);
  const [pets, setPets] = useState<Pet[]>([]);

  const loadProfileData = useCallback(async () => {
    const tutor = await loadTutorProfile();
    setTutorReady(hasTutorProfile(tutor));
    setPets(await loadPets());
  }, []);

  useFocusEffect(
    useCallback(() => {
      loadProfileData();
    }, [loadProfileData])
  );

  if (!tutorReady) {
    return (
      <ScreenLayout withHeader>
        <FlowHintCard
          title="Prontuário indisponível"
          message="Complete seu perfil em Meu Perfil para acessar o prontuário dos pets na clínica."
          buttonTitle="Ir para Meu Perfil"
          onPress={() => navigation.navigate('Settings')}
        />
      </ScreenLayout>
    );
  }

  if (pets.length === 0) {
    return (
      <ScreenLayout withHeader>
        <FlowHintCard
          title="Nenhum pet no prontuário"
          message="Cadastre um pet em Meus Pets para acompanhar peso e triagens na clínica."
          buttonTitle="Cadastrar pet"
          onPress={() => navigation.navigate('Pets', { screen: 'PetsList' })}
        />
      </ScreenLayout>
    );
  }

  return (
    <ScreenLayout withHeader scrollable={false}>
      <Text style={commonStyles.subtitle}>
        Prontuário dos pets cadastrados na clínica. Toque para ver detalhes e histórico.
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
            onPress={() =>
              navigation.navigate('Pets', {
                screen: 'PetDetails',
                params: { petId: item.id },
              })
            }
          />
        )}
      />
    </ScreenLayout>
  );
}

const styles = StyleSheet.create({
  list: {
    flex: 1,
  },
  listContent: {
    paddingBottom: 24,
  },
  separator: {
    height: 10,
  },
});
