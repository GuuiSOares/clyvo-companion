import 'react-native-gesture-handler';
import { registerRootComponent } from 'expo';
import { StatusBar } from 'expo-status-bar';
import { View, ActivityIndicator, StyleSheet } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import type { EventArg } from '@react-navigation/native';
import { SafeAreaProvider, useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';

import HomeScreen from './src/screens/HomeScreen';
import PetsNavigator from './src/navigation/PetsNavigator';
import CheckinScreen from './src/screens/CheckinScreen';
import ProfileScreen from './src/screens/ProfileScreen';
import SettingsScreen from './src/screens/SettingsScreen';
import AuthScreen from './src/screens/AuthScreen';
import AppLogo from './src/components/AppLogo';
import { AuthProvider, useAuth } from './src/context/AuthContext';
import { QueryClientProvider } from '@tanstack/react-query';
import { queryClient } from './src/lib/queryClient';
import type { RootTabParamList } from './src/navigation/types';
import { colors } from './src/theme';
import { hasTutorProfile, loadTutorProfile } from './src/services/tutorData';
import { loadPets } from './src/services/petData';

const Tab = createBottomTabNavigator<RootTabParamList>();

const TAB_BAR_HEIGHT = 56;
const TAB_BAR_EXTRA_BOTTOM = 10;

const headerOptions = {
  headerStyle: { backgroundColor: colors.background },
  headerTintColor: colors.text,
  headerTitleStyle: { fontWeight: '600' as const },
  headerShadowVisible: false,
};

const headerLogoOptions = {
  headerTitle: () => <AppLogo width={170} height={44} />,
  headerTitleAlign: 'center' as const,
};

type TabPressEvent = EventArg<'tabPress', true>;

async function guardTutorProfile(event: TabPressEvent, navigate: (name: 'Settings') => void) {
  const tutor = await loadTutorProfile();
  if (!hasTutorProfile(tutor)) {
    event.preventDefault();
    navigate('Settings');
  }
}

async function guardTutorAndPet(
  event: TabPressEvent,
  navigateSettings: () => void,
  navigatePets: () => void
) {
  const tutor = await loadTutorProfile();
  if (!hasTutorProfile(tutor)) {
    event.preventDefault();
    navigateSettings();
    return;
  }

  const pets = await loadPets();
  if (pets.length === 0) {
    event.preventDefault();
    navigatePets();
  }
}

function MainTabs() {
  const insets = useSafeAreaInsets();
  const bottomPadding = Math.max(insets.bottom, 10) + TAB_BAR_EXTRA_BOTTOM;

  return (
    <Tab.Navigator
      initialRouteName="Home"
      screenOptions={{
        tabBarActiveTintColor: colors.accent,
        tabBarInactiveTintColor: colors.textNav,
        tabBarStyle: {
          backgroundColor: colors.surface,
          borderTopColor: colors.border,
          borderTopWidth: 1,
          paddingTop: 8,
          paddingBottom: bottomPadding,
          height: TAB_BAR_HEIGHT + bottomPadding,
        },
        tabBarLabelStyle: {
          fontSize: 11,
          fontWeight: '600',
          marginBottom: 4,
        },
        tabBarItemStyle: {
          paddingTop: 4,
        },
      }}
    >
      <Tab.Screen
        name="Home"
        component={HomeScreen}
        options={{
          headerShown: false,
          title: 'Início',
          tabBarIcon: ({ color, size }) => <Ionicons name="home" size={size} color={color} />,
        }}
      />
      <Tab.Screen
        name="Pets"
        component={PetsNavigator}
        listeners={({ navigation }) => ({
          tabPress: (event) => {
            guardTutorProfile(event, () => navigation.navigate('Settings'));
          },
        })}
        options={{
          ...headerOptions,
          ...headerLogoOptions,
          title: 'Meus Pets',
          tabBarIcon: ({ color, size }) => (
            <MaterialCommunityIcons name="paw" size={size} color={color} />
          ),
        }}
      />
      <Tab.Screen
        name="Checkin"
        component={CheckinScreen}
        listeners={({ navigation }) => ({
          tabPress: (event) => {
            guardTutorAndPet(
              event,
              () => navigation.navigate('Settings'),
              () => navigation.navigate('Pets', { screen: 'PetsList' })
            );
          },
        })}
        options={{
          ...headerOptions,
          ...headerLogoOptions,
          title: 'Registro do dia',
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="clipboard-outline" size={size} color={color} />
          ),
        }}
      />
      <Tab.Screen
        name="Profile"
        component={ProfileScreen}
        listeners={({ navigation }) => ({
          tabPress: (event) => {
            guardTutorAndPet(
              event,
              () => navigation.navigate('Settings'),
              () => navigation.navigate('Pets', { screen: 'PetsList' })
            );
          },
        })}
        options={{
          ...headerOptions,
          ...headerLogoOptions,
          title: 'Prontuário',
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="document-text-outline" size={size} color={color} />
          ),
        }}
      />
      <Tab.Screen
        name="Settings"
        component={SettingsScreen}
        options={{
          ...headerOptions,
          ...headerLogoOptions,
          title: 'Meu Perfil',
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="person-circle-outline" size={size} color={color} />
          ),
        }}
      />
    </Tab.Navigator>
  );
}

function AppNavigator() {
  const { session, isLoading } = useAuth();

  if (isLoading) {
    return (
      <View style={styles.boot}>
        <ActivityIndicator size="large" color={colors.accent} />
      </View>
    );
  }

  return (
    <NavigationContainer>
      {session ? <MainTabs /> : <AuthScreen />}
    </NavigationContainer>
  );
}

function App() {
  return (
    <SafeAreaProvider>
      <StatusBar style="light" />
      <AuthProvider>
        <QueryClientProvider client={queryClient}>
          <AppNavigator />
        </QueryClientProvider>
      </AuthProvider>
    </SafeAreaProvider>
  );
}

const styles = StyleSheet.create({
  boot: {
    flex: 1,
    backgroundColor: colors.background,
    alignItems: 'center',
    justifyContent: 'center',
  },
});

registerRootComponent(App);
