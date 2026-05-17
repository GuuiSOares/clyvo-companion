import { useState } from 'react';
import { View, Text, Alert, Platform, StyleSheet } from 'react-native';
import type { BottomTabScreenProps } from '@react-navigation/bottom-tabs';
import type { RootTabParamList } from '../navigation/types';
import ScreenLayout from '../components/ScreenLayout';
import VitalCard from '../components/VitalCard';
import AppButton from '../components/AppButton';
import { colors } from '../theme';

type Props = BottomTabScreenProps<RootTabParamList, 'Profile'>;

export default function ProfileScreen() {
  const [petVitals, setPetVitals] = useState({
    peso: '5 kg',
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
      <View style={styles.hero}>
        <View style={styles.avatar}>
          <Text style={styles.avatarText}>R</Text>
        </View>
        <View>
          <Text style={styles.petName}>Rex</Text>
          <Text style={styles.petBreed}>Pug · Macho</Text>
        </View>
      </View>

      <Text style={styles.sectionTitle}>Dados vitais</Text>
      <View style={styles.vitalsGrid}>
        <VitalCard label="Peso atual" value={petVitals.peso} />
        <VitalCard label="Última vacina" value={petVitals.ultimaVacina} />
      </View>
      <View style={styles.vitalsFull}>
        <VitalCard label="Status da cirurgia" value={petVitals.statusCirurgia} fullWidth />
      </View>

      <AppButton
        title="Registrar nova vacina"
        onPress={handleRegisterVaccine}
        style={styles.action}
      />
    </ScreenLayout>
  );
}

const styles = StyleSheet.create({
  hero: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
    backgroundColor: colors.surface,
    borderRadius: 20,
    padding: 16,
    borderWidth: 1,
    borderColor: colors.border,
    marginBottom: 24,
  },
  avatar: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: colors.infoBg,
    borderWidth: 1,
    borderColor: colors.infoBorder,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarText: {
    fontSize: 28,
    fontWeight: '700',
    color: colors.accent,
  },
  petName: {
    fontSize: 22,
    fontWeight: '700',
    color: colors.text,
    marginBottom: 4,
  },
  petBreed: {
    fontSize: 14,
    color: colors.textMuted,
  },
  sectionTitle: {
    fontSize: 13,
    fontWeight: '600',
    color: colors.textMuted,
    textTransform: 'uppercase',
    letterSpacing: 0.6,
    marginBottom: 12,
  },
  vitalsGrid: {
    flexDirection: 'row',
    gap: 10,
    marginBottom: 10,
  },
  vitalsFull: {
    marginBottom: 24,
  },
  action: {
    marginTop: 4,
  },
});
