import { View, Text, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors } from '../theme';
import type { Pet, CheckinRecord } from '../types/pet';
import { formatPetSpecies } from '../constants/petSpecies';

type Props = {
  pets: Pet[];
  activePet: Pet | null;
  lastCheckin: CheckinRecord | null;
};

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

function getCheckinLabel(activePet: Pet | null, lastCheckin: CheckinRecord | null) {
  if (!lastCheckin) return 'Ainda não registrado';

  if (activePet && lastCheckin.petId === activePet.id) {
    return `${lastCheckin.activity} · ${lastCheckin.date}`;
  }

  return `Último: ${lastCheckin.petName} (${lastCheckin.date})`;
}

export default function HealthOverviewCard({ pets, activePet, lastCheckin }: Props) {
  if (pets.length === 0) {
    return (
      <View style={styles.card}>
        <Text style={styles.title}>Resumo de saúde</Text>
        <Text style={styles.summary}>
          Nenhum pet cadastrado ainda. Vá em Meus Pets para adicionar o primeiro.
        </Text>
      </View>
    );
  }

  const focusPet = activePet ?? pets[0];
  const petNames = pets.map((pet) => pet.nome).join(', ');
  const hasActiveCheckin =
    lastCheckin !== null && lastCheckin.petId === focusPet.id;

  return (
    <View style={styles.card}>
      <View style={styles.header}>
        <Text style={styles.title}>Resumo de saúde</Text>
        <View style={styles.badge}>
          <Text style={styles.badgeText}>{hasActiveCheckin ? 'Em dia' : 'Pendente'}</Text>
        </View>
      </View>

      <Text style={styles.summary}>
        Acompanhando {focusPet.nome} ({formatPetSpecies(focusPet.especie, focusPet.raca)}). Total:{' '}
        {petNames}.
      </Text>

      <View style={styles.infoList}>
        <InfoRow icon="paw-outline" label="Total de pets" value={`${pets.length}`} />
        <InfoRow
          icon="heart-outline"
          label="Pet ativo"
          value={`${focusPet.nome} · ${formatPetSpecies(focusPet.especie, focusPet.raca)}`}
        />
        <InfoRow
          icon="clipboard-outline"
          label="Último check-in"
          value={getCheckinLabel(focusPet, lastCheckin)}
          highlight={hasActiveCheckin}
        />
        <InfoRow
          icon="notifications-outline"
          label="Perfil"
          value="Vacinas e dados vitais no menu Perfil"
        />
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
