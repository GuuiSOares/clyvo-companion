import { useMemo } from 'react';
import { Pressable, View, Text, StyleSheet } from 'react-native';
import { useTheme, type AppColors } from '../theme';

type Props = {
  title: string;
  description: string;
  onPress: () => void;
};

export default function MenuCard({ title, description, onPress }: Props) {
  const { colors } = useTheme();
  const styles = useMemo(() => createStyles(colors), [colors]);

  return (
    <Pressable
      style={({ pressed }) => [styles.card, pressed && styles.cardPressed]}
      onPress={onPress}
    >
      <View style={styles.accent} />
      <View style={styles.content}>
        <Text style={styles.title}>{title}</Text>
        <Text style={styles.description}>{description}</Text>
      </View>
      <Text style={styles.chevron}>›</Text>
    </Pressable>
  );
}

function createStyles(colors: AppColors) {
  return StyleSheet.create({
    card: {
      flexDirection: 'row',
      alignItems: 'center',
      backgroundColor: colors.surface,
      borderRadius: 12,
      borderWidth: 1,
      borderColor: colors.border,
      marginBottom: 10,
      overflow: 'hidden',
    },
    cardPressed: {
      backgroundColor: colors.surfaceElevated,
    },
    accent: {
      width: 4,
      alignSelf: 'stretch',
      backgroundColor: colors.primaryLight,
    },
    content: {
      flex: 1,
      paddingVertical: 16,
      paddingHorizontal: 14,
      gap: 4,
    },
    title: {
      fontSize: 16,
      fontWeight: '600',
      color: colors.text,
    },
    description: {
      fontSize: 13,
      color: colors.textMuted,
      lineHeight: 18,
    },
    chevron: {
      fontSize: 22,
      color: colors.accent,
      paddingRight: 14,
      fontWeight: '300',
    },
  });
}
