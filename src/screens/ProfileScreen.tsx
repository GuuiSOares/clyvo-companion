import { FlatList, View, Text, StyleSheet } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import type { BottomTabNavigationProp } from '@react-navigation/bottom-tabs';
import ScreenLayout from '../components/ScreenLayout';
import PetCard from '../components/PetCard';
import FlowHintCard from '../components/FlowHintCard';
import { useTheme } from '../theme';
import type { RootTabParamList } from '../navigation/types';
import { usePetsQuery } from '../hooks/usePets';

export default function ProfileScreen() {
  const { commonStyles } = useTheme();
  const navigation = useNavigation<BottomTabNavigationProp<RootTabParamList>>();
  const petsQuery = usePetsQuery();
  const pets = petsQuery.data ?? [];

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
            dtNascimento={item.dtNascimento}
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
