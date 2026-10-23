import { useMemo, type ReactNode } from 'react';
import { Pressable, View, Text, StyleSheet } from 'react-native';
import { useTheme, type AppColors } from '../theme';

type Props = {
  title: string;
  subtitle: string;
  icon: ReactNode;
  iconBackground?: string;
  onPress: () => void;
};

export default function QuickActionCard({
  title,
  subtitle,
  icon,
  iconBackground,
  onPress,
}: Props) {
  const { colors } = useTheme();
  const styles = useMemo(() => createStyles(colors), [colors]);

  return (
    <Pressable
      style={({ pressed }) => [styles.card, pressed && styles.cardPressed]}
      onPress={onPress}
    >
      <View style={[styles.iconCircle, { backgroundColor: iconBackground ?? colors.iconBgTeal }]}>
        {icon}
      </View>
      <Text style={styles.title}>{title}</Text>
      <Text style={styles.subtitle} numberOfLines={2}>
        {subtitle}
      </Text>
    </Pressable>
  );
}

function createStyles(colors: AppColors) {
  return StyleSheet.create({
    card: {
      flex: 1,
      minWidth: 0,
      backgroundColor: colors.surface,
      borderRadius: 20,
      padding: 12,
      borderWidth: 1,
      borderColor: colors.border,
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.2,
      shadowRadius: 8,
      elevation: 3,
    },
    cardPressed: {
      opacity: 0.92,
    },
    iconCircle: {
      width: 44,
      height: 44,
      borderRadius: 22,
      alignItems: 'center',
      justifyContent: 'center',
      marginBottom: 12,
    },
    title: {
      fontSize: 14,
      fontWeight: '700',
      color: colors.text,
      marginBottom: 6,
    },
    subtitle: {
      fontSize: 11,
      color: colors.textMuted,
      lineHeight: 15,
    },
  });
}
