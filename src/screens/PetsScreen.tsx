import { useState } from 'react';
import { View, Text, TextInput, FlatList, Button, StyleSheet } from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import type { RootStackParamList } from '../navigation/types';
import { colors } from '../theme';

type Props = NativeStackScreenProps<RootStackParamList, 'Pets'>;

export default function PetsScreen({ navigation }: Props) {
  const insets = useSafeAreaInsets();
  const [searchQuery, setSearchQuery] = useState('');

  const pets = [
    { id: '1', nome: 'Rex', raca: 'Pug' },
    { id: '2', nome: 'Bolinha', raca: 'Gato' },
  ];

  const filteredPets = pets.filter((pet) =>
    pet.nome.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const horizontalPadding = Math.max(insets.left, insets.right, 20);

  return (
    <SafeAreaView style={styles.safe} edges={['left', 'right', 'bottom']}>
      <View style={[styles.header, { paddingHorizontal: horizontalPadding }]}>
        <TextInput
          value={searchQuery}
          onChangeText={setSearchQuery}
          placeholder="Buscar pet pelo nome"
          placeholderTextColor={colors.placeholder}
        />
      </View>
      <FlatList
        data={filteredPets}
        keyExtractor={(item) => item.id}
        contentContainerStyle={{
          paddingHorizontal: horizontalPadding,
          paddingBottom: insets.bottom + 16,
        }}
        renderItem={({ item }) => (
          <View>
            <Text>{item.nome}</Text>
            <Text>{item.raca}</Text>
          </View>
        )}
        ListFooterComponent={
          <View style={styles.footer}>
            <Button title="Home" onPress={() => navigation.navigate('Home')} />
            <Button title="Check-in" onPress={() => navigation.navigate('Checkin')} />
            <Button title="Profile" onPress={() => navigation.navigate('Profile')} />
            <Button title="Settings" onPress={() => navigation.navigate('Settings')} />
          </View>
        }
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: colors.background,
  },
  header: {
    paddingTop: 8,
    paddingBottom: 8,
  },
  footer: {
    marginTop: 16,
    gap: 8,
  },
});
