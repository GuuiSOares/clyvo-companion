import { createNativeStackNavigator } from '@react-navigation/native-stack';
import SettingsScreen from '../screens/SettingsScreen';
import AboutScreen from '../screens/AboutScreen';
import type { SettingsStackParamList } from './types';
import { useTheme } from '../theme';

const Stack = createNativeStackNavigator<SettingsStackParamList>();

export default function SettingsNavigator() {
  const { colors } = useTheme();

  return (
    <Stack.Navigator
      screenOptions={{
        headerStyle: { backgroundColor: colors.background },
        headerTintColor: colors.text,
        headerTitleStyle: { fontWeight: '600' as const },
        headerShadowVisible: false,
        contentStyle: { backgroundColor: colors.background },
      }}
    >
      <Stack.Screen name="SettingsHome" component={SettingsScreen} options={{ headerShown: false }} />
      <Stack.Screen name="AboutApp" component={AboutScreen} options={{ title: 'Sobre o App' }} />
    </Stack.Navigator>
  );
}
