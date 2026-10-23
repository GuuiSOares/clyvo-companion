import { useMemo } from 'react';
import { Pressable, Text, StyleSheet, type StyleProp, type ViewStyle } from 'react-native';
import { useTheme, type AppColors } from '../theme';

type Variant = 'primary' | 'secondary' | 'danger';

type Props = {
  title: string;
  onPress: () => void;
  variant?: Variant;
  style?: StyleProp<ViewStyle>;
};

export default function AppButton({ title, onPress, variant = 'primary', style }: Props) {
  const { colors } = useTheme();
  const styles = useMemo(() => createStyles(colors), [colors]);

  return (
    <Pressable
      style={({ pressed }) => [
        styles.base,
        variant === 'primary' && styles.primary,
        variant === 'secondary' && styles.secondary,
        variant === 'danger' && styles.danger,
        pressed && variant === 'primary' && styles.primaryPressed,
        pressed && variant === 'secondary' && styles.secondaryPressed,
        pressed && variant === 'danger' && styles.dangerPressed,
        style,
      ]}
      onPress={onPress}
    >
      <Text
        style={[
          styles.text,
          variant === 'primary' && styles.textOnDark,
          variant === 'secondary' && styles.textSecondary,
          variant === 'danger' && styles.textDanger,
        ]}
      >
        {title}
      </Text>
    </Pressable>
  );
}

function createStyles(colors: AppColors) {
  return StyleSheet.create({
    base: {
      borderRadius: 24,
      paddingVertical: 14,
      alignItems: 'center',
    },
    primary: {
      backgroundColor: colors.primaryLight,
    },
    primaryPressed: {
      backgroundColor: colors.primaryPressed,
    },
    secondary: {
      backgroundColor: colors.surface,
      borderWidth: 1,
      borderColor: colors.border,
    },
    secondaryPressed: {
      backgroundColor: colors.infoBg,
    },
    danger: {
      backgroundColor: colors.dangerBg,
      borderWidth: 1,
      borderColor: colors.dangerBorder,
    },
    dangerPressed: {
      opacity: 0.9,
    },
    text: {
      fontSize: 16,
      fontWeight: '600',
    },
    textOnDark: {
      color: colors.textOnDark,
    },
    textSecondary: {
      color: colors.textSecondary,
    },
    textDanger: {
      color: colors.danger,
    },
  });
}
