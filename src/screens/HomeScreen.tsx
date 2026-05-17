import { View, Text, StyleSheet } from 'react-native';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import type { RootStackParamList } from '../navigation/types';
import { colors, commonStyles } from '../theme';
import MenuCard from '../components/MenuCard';
import ScreenLayout from '../components/ScreenLayout';

type Props = NativeStackScreenProps<RootStackParamList, 'Home'>;

const menuItems = [
  {
    title: 'Meus Pets',
    description: 'Veja a lista e busque pelo nome',
    route: 'Pets' as const,
  },
  {
    title: 'Check-in diário',
    description: 'Registre a triagem do seu pet',
    route: 'Checkin' as const,
  },
  {
    title: 'Perfil do pet',
    description: 'Peso, vacinas e histórico de saúde',
    route: 'Profile' as const,
  },
  {
    title: 'Configurações',
    description: 'Perfil do tutor e dados locais',
    route: 'Settings' as const,
  },
];

export default function HomeScreen({ navigation }: Props) {
  return (
    <ScreenLayout>
      <View style={styles.header}>
        <View style={styles.badge}>
          <Text style={styles.badgeText}>Clyvo Companion</Text>
        </View>
        <Text style={commonStyles.title}>Olá, tutor!</Text>
        <Text style={commonStyles.subtitle}>
          Cuide do bem-estar do seu pet em um só lugar. Escolha uma opção abaixo.
        </Text>
      </View>

      <View style={styles.menu}>
        {menuItems.map((item) => (
          <MenuCard
            key={item.route}
            title={item.title}
            description={item.description}
            onPress={() => navigation.navigate(item.route)}
          />
        ))}
      </View>

      <View style={styles.footer}>
        <Text style={styles.footerText}>Protótipo · Sprint 1</Text>
      </View>
    </ScreenLayout>
  );
}

const styles = StyleSheet.create({
  header: {
    marginBottom: 8,
  },
  badge: {
    alignSelf: 'flex-start',
    backgroundColor: colors.infoBg,
    borderWidth: 1,
    borderColor: colors.infoBorder,
    borderRadius: 20,
    paddingHorizontal: 12,
    paddingVertical: 5,
    marginBottom: 14,
  },
  badgeText: {
    fontSize: 12,
    fontWeight: '600',
    color: colors.accent,
    letterSpacing: 0.3,
  },
  menu: {
    marginTop: 4,
  },
  footer: {
    marginTop: 24,
    alignItems: 'center',
  },
  footerText: {
    fontSize: 12,
    color: colors.placeholder,
  },
});
