import { View, Text, Image, Pressable, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors } from '../theme';
import type { PetSpecies } from '../constants/petSpecies';

type Props = {
  nome: string;
  especie?: PetSpecies;
  raca: string;
  peso?: string;
  fotoUri?: string;
  selected?: boolean;
  onPress?: () => void;
};

export default function PetCard({ nome, peso, fotoUri, selected, onPress }: Props) {
  const initial = nome.charAt(0).toUpperCase();
  const subtitle = peso?.trim() || 'Peso não informado';

  return (
    <Pressable
      style={({ pressed }) => [
        styles.card,
        selected && styles.cardSelected,
        pressed && styles.cardPressed,
      ]}
      onPress={onPress}
    >
      {fotoUri ? (
        <Image source={{ uri: fotoUri }} style={styles.photo} />
      ) : (
        <View style={styles.avatar}>
          <Text style={styles.avatarText}>{initial}</Text>
        </View>
      )}

      <View style={styles.info}>
        <Text style={styles.name}>{nome}</Text>
        <Text style={styles.subtitle}>{subtitle}</Text>
        {selected ? <Text style={styles.selectedTag}>Pet ativo no app</Text> : null}
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
  cardSelected: {
    borderColor: colors.accent,
    borderWidth: 2,
  },
  cardPressed: {
    opacity: 0.92,
  },
  photo: {
    width: 64,
    height: 64,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: colors.border,
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
  selectedTag: {
    fontSize: 11,
    fontWeight: '600',
    color: colors.accent,
    marginTop: 2,
  },
});
