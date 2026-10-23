import { useMemo, useState } from 'react';
import { View, Text, Pressable, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme, type AppColors } from '../theme';

export type SelectOption<T extends string> = {
  value: T;
  label: string;
  hint?: string;
};

type Props<T extends string> = {
  label: string;
  helperText?: string;
  placeholder: string;
  value: T | null;
  options: readonly SelectOption<T>[];
  onChange: (value: T) => void;
};

export default function DropdownSelect<T extends string>({
  label,
  helperText,
  placeholder,
  value,
  options,
  onChange,
}: Props<T>) {
  const { colors, commonStyles } = useTheme();
  const styles = useMemo(() => createStyles(colors), [colors]);
  const [open, setOpen] = useState(false);

  const selectedOption = options.find((option) => option.value === value);
  const triggerLabel = selectedOption?.label ?? placeholder;

  const handleSelect = (option: SelectOption<T>) => {
    onChange(option.value);
    setOpen(false);
  };

  return (
    <View style={[styles.field, open && styles.fieldOpen]}>
      <Text style={commonStyles.label}>{label}</Text>
      {helperText ? <Text style={styles.helperText}>{helperText}</Text> : null}
      <View style={styles.selectBox}>
        <Pressable
          style={({ pressed }) => [
            styles.trigger,
            open && styles.triggerOpen,
            pressed && styles.triggerPressed,
          ]}
          onPress={() => setOpen((current) => !current)}
        >
          <Text style={[styles.triggerText, !value && styles.placeholderText]}>{triggerLabel}</Text>
          <Ionicons
            name={open ? 'chevron-up' : 'chevron-down'}
            size={20}
            color={colors.textMuted}
          />
        </Pressable>

        {open ? (
          <View style={styles.menu}>
            {options.map((option, index) => {
              const selected = value === option.value;
              const isLast = index === options.length - 1;
              return (
                <Pressable
                  key={option.value}
                  style={({ pressed }) => [
                    styles.option,
                    !isLast && styles.optionBorder,
                    selected && styles.optionSelected,
                    pressed && styles.optionPressed,
                  ]}
                  onPress={() => handleSelect(option)}
                >
                  <View style={styles.optionContent}>
                    <Text style={[styles.optionText, selected && styles.optionTextSelected]}>
                      {option.label}
                    </Text>
                    {option.hint ? <Text style={styles.optionHint}>{option.hint}</Text> : null}
                  </View>
                  {selected ? (
                    <Ionicons name="checkmark" size={18} color={colors.accent} />
                  ) : null}
                </Pressable>
              );
            })}
          </View>
        ) : null}
      </View>
    </View>
  );
}

function createStyles(colors: AppColors) {
  return StyleSheet.create({
    field: {
      marginBottom: 16,
    },
    fieldOpen: {
      marginBottom: 20,
    },
    helperText: {
      fontSize: 13,
      color: colors.textMuted,
      lineHeight: 18,
      marginTop: -4,
      marginBottom: 10,
    },
    selectBox: {
      width: '100%',
    },
    trigger: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      backgroundColor: colors.surfaceElevated,
      borderWidth: 1,
      borderColor: colors.border,
      borderRadius: 12,
      paddingHorizontal: 14,
      paddingVertical: 14,
      minHeight: 48,
    },
    triggerOpen: {
      borderColor: colors.accent,
      borderBottomLeftRadius: 0,
      borderBottomRightRadius: 0,
    },
    triggerPressed: {
      opacity: 0.9,
    },
    triggerText: {
      fontSize: 15,
      color: colors.text,
      fontWeight: '500',
      flex: 1,
    },
    placeholderText: {
      color: colors.placeholder,
      fontWeight: '400',
    },
    menu: {
      backgroundColor: colors.surfaceElevated,
      borderWidth: 1,
      borderTopWidth: 0,
      borderColor: colors.accent,
      borderBottomLeftRadius: 12,
      borderBottomRightRadius: 12,
    },
    option: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      paddingHorizontal: 14,
      paddingVertical: 12,
      gap: 10,
    },
    optionBorder: {
      borderBottomWidth: 1,
      borderBottomColor: colors.border,
    },
    optionSelected: {
      backgroundColor: colors.infoBg,
    },
    optionPressed: {
      backgroundColor: colors.surface,
    },
    optionContent: {
      flex: 1,
      gap: 3,
    },
    optionText: {
      fontSize: 15,
      color: colors.text,
      fontWeight: '600',
    },
    optionTextSelected: {
      color: colors.accent,
    },
    optionHint: {
      fontSize: 12,
      color: colors.textMuted,
      lineHeight: 16,
    },
  });
}
