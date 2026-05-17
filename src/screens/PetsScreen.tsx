import { useState } from 'react';
import { View, Text, TextInput, FlatList, StyleSheet } from 'react-native';
import type { BottomTabScreenProps } from '@react-navigation/bottom-tabs';
import type { RootTabParamList } from '../navigation/types';
import { colors, commonStyles } from '../theme';
import ScreenLayout from '../components/ScreenLayout';
import PetCard from '../components/PetCard';

type Props = BottomTabScreenProps<RootTabParamList, 'Pets'>;

export default function PetsScreen() {
  const [searchQuery, setSearchQuery] = useState('');

  const pets = [
    { id: '1', nome: 'Rex', raca: 'Pug' },
    { id: '2', nome: 'Bolinha', raca: 'Gato' },
    { id: '3', nome: 'Thor', raca: 'Labrador' },
  ];

  const filteredPets = pets.filter((pet) =>
    pet.nome.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <ScreenLayout withHeader scrollable={false}>
      <Text style={[commonStyles.subtitle, styles.count]}>
        {filteredPets.length} pet{filteredPets.length !== 1 ? 's' : ''} encontrado
        {filteredPets.length !== 1 ? 's' : ''}
      </Text>
      <TextInput
        style={[commonStyles.input, styles.search]}
        value={searchQuery}
        onChangeText={setSearchQuery}
        placeholder="Buscar pelo nome..."
        placeholderTextColor={colors.placeholder}
      />
      <FlatList
        data={filteredPets}
        keyExtractor={(item) => item.id}
        style={styles.list}
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
        ItemSeparatorComponent={() => <View style={styles.separator} />}
        renderItem={({ item }) => <PetCard nome={item.nome} raca={item.raca} />}
        ListEmptyComponent={
          <View style={styles.empty}>
            <Text style={styles.emptyTitle}>Nenhum pet encontrado</Text>
            <Text style={styles.emptyText}>Tente outro termo na busca.</Text>
          </View>
        }
      />
    </ScreenLayout>
  );
}

const styles = StyleSheet.create({
  count: {
    marginBottom: 12,
  },
  search: {
    marginBottom: 20,
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
  },
});
