import { useState } from 'react';
import { View, Text, TextInput, Pressable } from 'react-native';
import type { BottomTabScreenProps } from '@react-navigation/bottom-tabs';
import type { RootTabParamList } from '../navigation/types';
import ScreenLayout from '../components/ScreenLayout';
import { colors, commonStyles } from '../theme';

type Props = BottomTabScreenProps<RootTabParamList, 'Checkin'>;

export default function CheckinScreen() {
  const [petName, setPetName] = useState('');
  const [activity, setActivity] = useState('');
  const [observations, setObservations] = useState('');

  const handleSave = () => {
    setPetName('');
    setActivity('');
    setObservations('');
  };

  return (
    <ScreenLayout withHeader keyboard>
      <Text style={commonStyles.subtitle}>
        Preencha os campos abaixo para registrar o check-in de hoje.
      </Text>

      <View style={commonStyles.form}>
        <View style={commonStyles.field}>
          <Text style={commonStyles.label}>Nome do Pet</Text>
          <TextInput
            style={commonStyles.input}
            value={petName}
            onChangeText={setPetName}
            placeholder="Ex: Thor"
            placeholderTextColor={colors.placeholder}
          />
        </View>

        <View style={commonStyles.field}>
          <Text style={commonStyles.label}>Como está a atividade dele hoje?</Text>
          <TextInput
            style={commonStyles.input}
            value={activity}
            onChangeText={setActivity}
            placeholder="Ex: Normal, Quieto"
            placeholderTextColor={colors.placeholder}
          />
        </View>

        <View style={commonStyles.field}>
          <Text style={commonStyles.label}>Observações</Text>
          <TextInput
            style={[commonStyles.input, commonStyles.textArea]}
            value={observations}
            onChangeText={setObservations}
            placeholder="Descreva qualquer detalhe relevante..."
            placeholderTextColor={colors.placeholder}
            multiline
            numberOfLines={4}
            textAlignVertical="top"
          />
        </View>

        <Pressable
          style={({ pressed }) => [
            commonStyles.primaryButton,
            pressed && commonStyles.primaryButtonPressed,
          ]}
          onPress={handleSave}
        >
          <Text style={commonStyles.primaryButtonText}>Salvar Triagem</Text>
        </Pressable>
      </View>

      <View style={commonStyles.summaryCard}>
        <Text style={commonStyles.summaryTitle}>Resumo em tempo real</Text>
        <View style={commonStyles.summaryRow}>
          <Text style={commonStyles.summaryLabel}>Nome do Pet</Text>
          <Text style={commonStyles.summaryValue}>{petName.trim() || '—'}</Text>
        </View>
        <View style={commonStyles.summaryRow}>
          <Text style={commonStyles.summaryLabel}>Atividade</Text>
          <Text style={commonStyles.summaryValue}>{activity.trim() || '—'}</Text>
        </View>
        <View style={commonStyles.summaryRow}>
          <Text style={commonStyles.summaryLabel}>Observações</Text>
          <Text style={commonStyles.summaryValue}>{observations.trim() || '—'}</Text>
        </View>
      </View>
    </ScreenLayout>
  );
}
