import { useState } from 'react';
import {
  View,
  Text,
  Image,
  Pressable,
  Modal,
  StyleSheet,
  ScrollView,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors } from '../theme';
import type { Pet, CheckinRecord } from '../types/pet';
import { getWellnessLabel } from '../constants/activityLevels';
import { formatPetSpecies } from '../constants/petSpecies';
import { formatPetWeight } from '../utils/petWeight';

type Props = {
  pets: Pet[];
  focusPet: Pet;
  lastCheckin: CheckinRecord | null;
  onSelectPet: (pet: Pet) => void;
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

function getCheckinLabelForPet(checkin: CheckinRecord | null) {
  if (!checkin) return 'Ainda não registrado';
  return `${getWellnessLabel(checkin.activity)} · ${checkin.date}`;
}

export default function HealthOverviewCard({ pets, focusPet, lastCheckin, onSelectPet }: Props) {
  const [pickerOpen, setPickerOpen] = useState(false);

  if (pets.length === 0) {
    return (
      <View style={styles.card}>
        <Text style={styles.title}>Resumo na clínica</Text>
        <Text style={styles.summary}>
          Nenhum pet cadastrado ainda. Vá em Meus Pets para adicionar o primeiro.
        </Text>
      </View>
    );
  }

  const petCheckin = lastCheckin?.petId === focusPet.id ? lastCheckin : null;
  const hasCheckin = petCheckin !== null;
  const showPetPicker = pets.length > 1;

  const handleSelectPet = (pet: Pet) => {
    onSelectPet(pet);
    setPickerOpen(false);
  };

  return (
    <View style={styles.card}>
      <View style={styles.header}>
        <Text style={styles.title}>Resumo na clínica</Text>
        <View style={[styles.badge, !hasCheckin && styles.badgePending]}>
          <Text style={[styles.badgeText, !hasCheckin && styles.badgeTextPending]}>
            {hasCheckin ? 'Em dia' : 'Pendente'}
          </Text>
        </View>
      </View>

      <Text style={styles.summary}>
        Resumo de {focusPet.nome} ({formatPetSpecies(focusPet.especie, focusPet.raca)}).
      </Text>

      {showPetPicker ? (
        <Pressable
          style={({ pressed }) => [styles.petPickerButton, pressed && styles.petPickerButtonPressed]}
          onPress={() => setPickerOpen(true)}
        >
          <Ionicons name="swap-horizontal" size={14} color={colors.accent} />
          <Text style={styles.petPickerButtonText}>Ver resumo de: {focusPet.nome}</Text>
          <Ionicons name="chevron-down" size={14} color={colors.accent} />
        </Pressable>
      ) : null}

      <View style={styles.infoList}>
        <InfoRow icon="paw-outline" label="Pet em foco" value={focusPet.nome} />
        <InfoRow icon="scale-outline" label="Peso" value={formatPetWeight(focusPet.peso)} />
        <InfoRow
          icon="clipboard-outline"
          label="Último registro"
          value={getCheckinLabelForPet(petCheckin)}
          highlight={hasCheckin}
        />
        <InfoRow
          icon="document-text-outline"
          label="Prontuário"
          value="Abra Meus Pets ou Prontuário para mais detalhes"
        />
      </View>

      <Modal
        visible={pickerOpen}
        transparent
        animationType="fade"
        onRequestClose={() => setPickerOpen(false)}
      >
        <Pressable style={styles.modalBackdrop} onPress={() => setPickerOpen(false)}>
          <Pressable style={styles.modalSheet} onPress={(event) => event.stopPropagation()}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Escolher pet</Text>
              <Pressable
                style={styles.modalClose}
                onPress={() => setPickerOpen(false)}
                hitSlop={8}
              >
                <Ionicons name="close" size={22} color={colors.textMuted} />
              </Pressable>
            </View>
            <Text style={styles.modalSubtitle}>
              Selecione qual pet você quer ver no resumo da clínica.
            </Text>
            <ScrollView style={styles.modalList} bounces={false}>
              {pets.map((pet) => {
                const selected = pet.id === focusPet.id;
                const initial = pet.nome.charAt(0).toUpperCase();
                return (
                  <Pressable
                    key={pet.id}
                    style={({ pressed }) => [
                      styles.petOption,
                      selected && styles.petOptionSelected,
                      pressed && styles.petOptionPressed,
                    ]}
                    onPress={() => handleSelectPet(pet)}
                  >
                    {pet.fotoUri ? (
                      <Image source={{ uri: pet.fotoUri }} style={styles.petOptionPhoto} />
                    ) : (
                      <View style={styles.petOptionAvatar}>
                        <Text style={styles.petOptionAvatarText}>{initial}</Text>
                      </View>
                    )}
                    <View style={styles.petOptionInfo}>
                      <Text style={styles.petOptionName}>{pet.nome}</Text>
                      <Text style={styles.petOptionMeta}>
                        {formatPetSpecies(pet.especie, pet.raca)} · {formatPetWeight(pet.peso)}
                      </Text>
                    </View>
                    {selected ? (
                      <Ionicons name="checkmark-circle" size={22} color={colors.accent} />
                    ) : null}
                  </Pressable>
                );
              })}
            </ScrollView>
          </Pressable>
        </Pressable>
      </Modal>
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
  badgePending: {
    backgroundColor: colors.surfaceElevated,
    borderColor: colors.border,
  },
  badgeText: {
    fontSize: 12,
    fontWeight: '600',
    color: colors.successText,
  },
  badgeTextPending: {
    color: colors.textMuted,
  },
  summary: {
    fontSize: 13,
    color: colors.textMuted,
    lineHeight: 18,
    marginBottom: 12,
  },
  petPickerButton: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
    gap: 6,
    backgroundColor: colors.infoBg,
    borderRadius: 20,
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderWidth: 1,
    borderColor: colors.infoBorder,
    marginBottom: 14,
  },
  petPickerButtonPressed: {
    opacity: 0.9,
  },
  petPickerButtonText: {
    fontSize: 12,
    fontWeight: '600',
    color: colors.accent,
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
  modalBackdrop: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
    justifyContent: 'flex-end',
  },
  modalSheet: {
    backgroundColor: colors.surface,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    paddingHorizontal: 20,
    paddingTop: 18,
    paddingBottom: 28,
    borderWidth: 1,
    borderColor: colors.border,
    maxHeight: '70%',
  },
  modalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 6,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: colors.text,
  },
  modalClose: {
    padding: 4,
  },
  modalSubtitle: {
    fontSize: 13,
    color: colors.textMuted,
    lineHeight: 18,
    marginBottom: 14,
  },
  modalList: {
    maxHeight: 320,
  },
  petOption: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingVertical: 12,
    paddingHorizontal: 12,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.surfaceElevated,
    marginBottom: 10,
  },
  petOptionSelected: {
    borderColor: colors.accent,
    backgroundColor: colors.infoBg,
  },
  petOptionPressed: {
    opacity: 0.92,
  },
  petOptionPhoto: {
    width: 44,
    height: 44,
    borderRadius: 22,
    borderWidth: 1,
    borderColor: colors.border,
  },
  petOptionAvatar: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: colors.infoBg,
    borderWidth: 1,
    borderColor: colors.infoBorder,
    alignItems: 'center',
    justifyContent: 'center',
  },
  petOptionAvatarText: {
    fontSize: 16,
    fontWeight: '700',
    color: colors.accent,
  },
  petOptionInfo: {
    flex: 1,
    gap: 2,
  },
  petOptionName: {
    fontSize: 15,
    fontWeight: '700',
    color: colors.text,
  },
  petOptionMeta: {
    fontSize: 12,
    color: colors.textMuted,
  },
});
