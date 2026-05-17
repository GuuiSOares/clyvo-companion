import { View, Text, Image, Pressable, StyleSheet } from 'react-native';
import { colors } from '../theme';

type Props = {
  nome: string;
  raca: string;
  fotoUri?: string;
  selected?: boolean;
  onPress?: () => void;
};

export default function PetCard({ nome, raca, fotoUri, selected, onPress }: Props) {
  const initial = nome.charAt(0).toUpperCase();

  const content = (
    <>
      {fotoUri ? (
        <Image source={{ uri: fotoUri }} style={styles.photo} />
      ) : (
        <View style={styles.avatar}>
          <Text style={styles.avatarText}>{initial}</Text>
        </View>
      )}
      <View style={styles.info}>
        <Text style={styles.name}>{nome}</Text>
        <Text style={styles.breed}>{raca}</Text>
        {selected ? <Text style={styles.selectedTag}>Pet ativo no app</Text> : null}
      </View>
    </>
  );

  if (onPress) {
    return (
      <Pressable
        style={({ pressed }) => [
          styles.card,
          selected && styles.cardSelected,
          pressed && styles.cardPressed,
        ]}
        onPress={onPress}
      >
        {content}
      </Pressable>
    );
  }

  return <View style={[styles.card, selected && styles.cardSelected]}>{content}</View>;
}

const styles = StyleSheet.create({
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.surface,
    borderRadius: 20,
    padding: 14,
    borderWidth: 1,
    borderColor: colors.border,
    gap: 14,
  },
  cardSelected: {
    borderColor: colors.accent,
    borderWidth: 2,
  },
  cardPressed: {
    opacity: 0.9,
  },
  photo: {
    width: 56,
    height: 56,
    borderRadius: 28,
    borderWidth: 1,
    borderColor: colors.border,
  },
  avatar: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: colors.infoBg,
    borderWidth: 1,
    borderColor: colors.infoBorder,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarText: {
    fontSize: 20,
    fontWeight: '700',
    color: colors.accent,
  },
  info: {
    flex: 1,
    gap: 4,
  },
  name: {
    fontSize: 17,
    fontWeight: '600',
    color: colors.text,
  },
  breed: {
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
