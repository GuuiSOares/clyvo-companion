import { View, Text, FlatList, Button } from 'react-native';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import type { RootStackParamList } from '../navigation/types';

type Props = NativeStackScreenProps<RootStackParamList, 'Pets'>;

export default function PetsScreen({ navigation }: Props) {
  const pets = [
    { id: '1', nome: 'Rex', raca: 'Pug' },
    { id: '2', nome: 'Bolinha', raca: 'Gato' },
  ];

  return (
    <View>
      <Text>Pets</Text>
      <FlatList
        data={pets}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <View>
            <Text>{item.nome}</Text>
            <Text>{item.raca}</Text>
          </View>
        )}
      />
      <Button title="Home" onPress={() => navigation.navigate('Home')} />
      <Button title="Check-in" onPress={() => navigation.navigate('Checkin')} />
      <Button title="Profile" onPress={() => navigation.navigate('Profile')} />
      <Button title="Settings" onPress={() => navigation.navigate('Settings')} />
    </View>
  );
}
