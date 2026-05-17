import { useState } from 'react';
import { View, Text, Button, Alert, Platform } from 'react-native';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import type { RootStackParamList } from '../navigation/types';
import ScreenLayout from '../components/ScreenLayout';

type Props = NativeStackScreenProps<RootStackParamList, 'Profile'>;

export default function ProfileScreen({ navigation }: Props) {
  const [petVitals, setPetVitals] = useState({
    peso: '5kg',
    ultimaVacina: '12/03/2025',
    statusCirurgia: 'Nenhuma pendente',
  });

  const handleRegisterVaccine = () => {
    const hoje = new Date().toLocaleDateString('pt-BR');
    const message = 'Nova vacina registrada com sucesso!';

    setPetVitals((prev) => ({ ...prev, ultimaVacina: hoje }));

    if (Platform.OS === 'web') {
      window.alert(message);
    } else {
      Alert.alert('Vacina', message);
    }
  };

  return (
    <ScreenLayout withHeader>
      <Text>Histórico do Pet</Text>
      <Text>Peso atual: {petVitals.peso}</Text>
      <Text>Última vacina: {petVitals.ultimaVacina}</Text>
      <Text>Status da cirurgia: {petVitals.statusCirurgia}</Text>
      <Button title="Registrar nova vacina" onPress={handleRegisterVaccine} />
      <Button title="Home" onPress={() => navigation.navigate('Home')} />
      <Button title="Pets" onPress={() => navigation.navigate('Pets')} />
      <Button title="Check-in" onPress={() => navigation.navigate('Checkin')} />
      <Button title="Settings" onPress={() => navigation.navigate('Settings')} />
    </ScreenLayout>
  );
}
