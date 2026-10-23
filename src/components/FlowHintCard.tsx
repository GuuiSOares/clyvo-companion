import { useMemo } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { useTheme, type AppColors, type CommonStyles } from '../theme';
import AppButton from './AppButton';

type Props = {
  title: string;
  message: string;
  buttonTitle: string;
  onPress: () => void;
};

export default function FlowHintCard({ title, message, buttonTitle, onPress }: Props) {
  const { colors, commonStyles } = useTheme();
  const styles = useMemo(() => createStyles(colors, commonStyles), [colors, commonStyles]);

  return (
    <View style={styles.card}>
      <Text style={styles.title}>{title}</Text>
      <Text style={styles.message}>{message}</Text>
      <AppButton title={buttonTitle} onPress={onPress} />
    </View>
  );
}

function createStyles(colors: AppColors, commonStyles: CommonStyles) {
  return StyleSheet.create({
    card: {
      ...commonStyles.card,
      gap: 12,
      marginBottom: 20,
      borderColor: colors.accent,
    },
    title: {
      fontSize: 17,
      fontWeight: '700',
      color: colors.text,
    },
    message: {
      fontSize: 14,
      color: colors.textMuted,
      lineHeight: 20,
    },
  });
}
