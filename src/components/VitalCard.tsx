import { useMemo } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { useTheme, type AppColors } from '../theme';

type Props = {
  label: string;
  value: string;
  fullWidth?: boolean;
};

export default function VitalCard({ label, value, fullWidth }: Props) {
  const { colors } = useTheme();
  const styles = useMemo(() => createStyles(colors), [colors]);

  return (
    <View style={[styles.card, fullWidth && styles.fullWidth]}>
      <Text style={styles.label}>{label}</Text>
      <Text style={styles.value}>{value}</Text>
    </View>
  );
}

function createStyles(colors: AppColors) {
  return StyleSheet.create({
    card: {
      backgroundColor: colors.surface,
      borderRadius: 20,
      padding: 14,
      borderWidth: 1,
      borderColor: colors.border,
      gap: 6,
      flex: 1,
      minWidth: '45%',
    },
    label: {
      fontSize: 11,
      fontWeight: '600',
      color: colors.textMuted,
      textTransform: 'uppercase',
      letterSpacing: 0.5,
    },
    value: {
      fontSize: 15,
      fontWeight: '600',
      color: colors.text,
      lineHeight: 20,
    },
    fullWidth: {
      flex: undefined,
      width: '100%',
    },
  });
}
