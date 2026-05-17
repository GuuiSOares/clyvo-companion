import { View, Text, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors } from '../theme';

const HEALTH_INFO = [
  {
    icon: 'paw-outline' as const,
    label: 'Pet em foco',
    value: 'Rex · Pug',
  },
  {
    icon: 'scale-outline' as const,
    label: 'Peso atual',
    value: '5 kg',
  },
  {
    icon: 'medkit-outline' as const,
    label: 'Última vacina',
    value: '12/03/2025',
  },
  {
    icon: 'clipboard-outline' as const,
    label: 'Check-in de hoje',
    value: 'Ainda não registrado',
    highlight: true,
  },
  {
    icon: 'notifications-outline' as const,
    label: 'Próximo lembrete',
    value: 'Vacina do Rex · 12/10',
  },
];

function InfoRow({
  icon,
  label,
  value,
  highlight,
}: {
  icon: keyof typeof Ionicons.glyphMap;
  label: string;
  value: string;
  highlight?: boolean;
}) {
  return (
    <View style={styles.infoRow}>
      <View style={styles.infoIcon}>
        <Ionicons name={icon} size={18} color={colors.accent} />
      </View>
      <View style={styles.infoContent}>
        <Text style={styles.infoLabel}>{label}</Text>
        <Text style={[styles.infoValue, highlight && styles.infoValueHighlight]}>{value}</Text>
      </View>
    </View>
  );
}

export default function HealthOverviewCard() {
  return (
    <View style={styles.card}>
      <View style={styles.header}>
        <Text style={styles.title}>Resumo de saúde</Text>
        <View style={styles.badge}>
          <Text style={styles.badgeText}>Estável</Text>
        </View>
      </View>

      <Text style={styles.summary}>
        Informações do pet Rex com base nos dados cadastrados no app.
      </Text>

      <View style={styles.infoList}>
        {HEALTH_INFO.map((item) => (
          <InfoRow
            key={item.label}
            icon={item.icon}
            label={item.label}
            value={item.value}
            highlight={item.highlight}
          />
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.surface,
    borderRadius: 24,
    padding: 18,
    borderWidth: 1,
    borderColor: colors.border,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 2,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 10,
  },
  title: {
    fontSize: 17,
    fontWeight: '700',
    color: colors.text,
  },
  badge: {
    backgroundColor: colors.successBg,
    borderRadius: 20,
    paddingHorizontal: 12,
    paddingVertical: 5,
    borderWidth: 1,
    borderColor: colors.successBorder,
  },
  badgeText: {
    fontSize: 12,
    fontWeight: '600',
    color: colors.successText,
  },
  summary: {
    fontSize: 13,
    color: colors.textMuted,
    lineHeight: 18,
    marginBottom: 16,
  },
  infoList: {
    gap: 12,
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    backgroundColor: colors.surfaceElevated,
    borderRadius: 12,
    padding: 12,
    borderWidth: 1,
    borderColor: colors.border,
  },
  infoIcon: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: colors.infoBg,
    alignItems: 'center',
    justifyContent: 'center',
  },
  infoContent: {
    flex: 1,
    gap: 2,
  },
  infoLabel: {
    fontSize: 11,
    fontWeight: '600',
    color: colors.textMuted,
    textTransform: 'uppercase',
    letterSpacing: 0.4,
  },
  infoValue: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.text,
    lineHeight: 20,
  },
  infoValueHighlight: {
    color: colors.accent,
  },
});
