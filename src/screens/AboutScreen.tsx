import { useMemo } from 'react';
import { Text, StyleSheet } from 'react-native';
import Constants from 'expo-constants';
import ScreenLayout from '../components/ScreenLayout';
import { useTheme, type AppColors, type CommonStyles } from '../theme';

function readCommitHash() {
  const hash = Constants.expoConfig?.extra?.commitHash;
  return typeof hash === 'string' && hash.length > 0 ? hash : 'Commit indisponível';
}

export default function AboutScreen() {
  const { colors, commonStyles } = useTheme();
  const styles = useMemo(() => createStyles(colors, commonStyles), [colors, commonStyles]);
  const version = Constants.expoConfig?.version ?? '1.0.0';
  const commitHash = readCommitHash();

  return (
    <ScreenLayout withHeader>
      <Text style={commonStyles.title}>Sobre o App</Text>
      <Text style={commonStyles.subtitle}>
        Clyvo Companion para o tutor acompanhar os pets na clínica.
      </Text>

      <Text style={styles.cardLabel}>Versão</Text>
      <Text style={styles.cardValue}>{version}</Text>

      <Text style={styles.cardLabel}>Commit da versão</Text>
      <Text selectable style={styles.commitHash}>
        {commitHash}
      </Text>
    </ScreenLayout>
  );
}

function createStyles(colors: AppColors, commonStyles: CommonStyles) {
  return StyleSheet.create({
    cardLabel: {
      ...commonStyles.label,
      marginBottom: 6,
    },
    cardValue: {
      ...commonStyles.card,
      color: colors.text,
      fontSize: 16,
      fontWeight: '600',
    },
    commitHash: {
      ...commonStyles.card,
      color: colors.text,
      fontSize: 14,
      lineHeight: 22,
      fontWeight: '600',
    },
  });
}
