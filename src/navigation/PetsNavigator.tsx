import { createNativeStackNavigator } from '@react-navigation/native-stack';
import PetsScreen from '../screens/PetsScreen';
import PetDetailsScreen from '../screens/PetDetailsScreen';
import type { PetsStackParamList } from './types';
import { colors } from '../theme';

const Stack = createNativeStackNavigator<PetsStackParamList>();

const screenOptions = {
  headerStyle: { backgroundColor: colors.background },
  headerTintColor: colors.text,
  headerTitleStyle: { fontWeight: '600' as const },
  headerShadowVisible: false,
  contentStyle: { backgroundColor: colors.background },
};

export default function PetsNavigator() {
  return (
    <Stack.Navigator screenOptions={screenOptions}>
      <Stack.Screen
        name="PetsList"
        component={PetsScreen}
        options={{ headerShown: false }}
      />
      <Stack.Screen
        name="PetDetails"
        component={PetDetailsScreen}
        options={{ title: 'Detalhes do Pet' }}
      />
    </Stack.Navigator>
  );
}
