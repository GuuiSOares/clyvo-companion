import { useState } from 'react';
import { View, Text, Pressable, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors, commonStyles } from '../theme';

type Props<T extends string> = {
  label: string;
  placeholder: string;
  value: T | null;
  options: readonly T[];
  onChange: (value: T) => void;
};

export default function DropdownSelect<T extends string>({
  label,
  placeholder,
  value,
  options,
  onChange,
}: Props<T>) {
  const [open, setOpen] = useState(false);

  const handleSelect = (option: T) => {
    onChange(option);
    setOpen(false);
  };

  return (
    <View style={[styles.field, open && styles.fieldOpen]}>
      <Text style={commonStyles.label}>{label}</Text>
      <View style={styles.selectBox}>
        <Pressable
          style={({ pressed }) => [
            styles.trigger,
            open && styles.triggerOpen,
            pressed && styles.triggerPressed,
          ]}
          onPress={() => setOpen((current) => !current)}
        >
          <Text style={[styles.triggerText, !value && styles.placeholderText]}>
            {value ?? placeholder}
          </Text>
          <Ionicons
            name={open ? 'chevron-up' : 'chevron-down'}
            size={20}
            color={colors.textMuted}
          />
        </Pressable>

        {open ? (
          <View style={styles.menu}>
            {options.map((option, index) => {
              const selected = value === option;
              const isLast = index === options.length - 1;
              return (
                <Pressable
                  key={option}
                  style={({ pressed }) => [
                    styles.option,
                    !isLast && styles.optionBorder,
                    selected && styles.optionSelected,
                    pressed && styles.optionPressed,
                  ]}
                  onPress={() => handleSelect(option)}
                >
                  <Text style={[styles.optionText, selected && styles.optionTextSelected]}>
                    {option}
                  </Text>
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

const styles = StyleSheet.create({
  field: {
    marginBottom: 16,
  },
  fieldOpen: {
    marginBottom: 20,
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
    paddingVertical: 14,
    minHeight: 48,
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
  optionText: {
    fontSize: 15,
    color: colors.text,
    fontWeight: '500',
  },
  optionTextSelected: {
    color: colors.accent,
    fontWeight: '600',
  },
});
