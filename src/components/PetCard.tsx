import { View, Text, Pressable, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors } from '../theme';
import { formatPetBirthDate } from '../utils/petBirthDate';
import type { PetSpecies } from '../constants/petSpecies';

type Props = {
  nome: string;
  especie?: PetSpecies;
  dtNascimento?: string;
  onPress?: () => void;
  onLongPress?: () => void;
};

export default function PetCard({ nome, especie, dtNascimento, onPress, onLongPress }: Props) {
  const initial = nome.charAt(0).toUpperCase();
  const subtitle = [especie, formatPetBirthDate(dtNascimento)].filter(Boolean).join(' · ');

  return (
    <Pressable
      style={({ pressed }) => [styles.card, pressed && styles.cardPressed]}
      onPress={onPress}
      onLongPress={onLongPress}
    >
      <View style={styles.avatar}>
        <Text style={styles.avatarText}>{initial}</Text>
      </View>

      <View style={styles.info}>
        <Text style={styles.name}>{nome}</Text>
        <Text style={styles.subtitle}>{subtitle}</Text>
      </View>

      <Ionicons name="chevron-forward" size={22} color={colors.textMuted} />
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.surface,
    borderRadius: 16,
    padding: 12,
    borderWidth: 1,
    borderColor: colors.border,
    gap: 12,
  },
  cardPressed: {
    opacity: 0.92,
  },
  avatar: {
    width: 64,
    height: 64,
    borderRadius: 14,
    backgroundColor: colors.infoBg,
    borderWidth: 1,
    borderColor: colors.infoBorder,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarText: {
    fontSize: 24,
    fontWeight: '700',
    color: colors.accent,
  },
  info: {
    flex: 1,
    gap: 4,
    justifyContent: 'center',
  },
  name: {
    fontSize: 17,
    fontWeight: '700',
    color: colors.text,
  },
  subtitle: {
    fontSize: 14,
    color: colors.textMuted,
  },
});
