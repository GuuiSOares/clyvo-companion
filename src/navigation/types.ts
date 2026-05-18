import type { NavigatorScreenParams } from '@react-navigation/native';

export type PetsStackParamList = {
  PetsList: undefined;
  PetDetails: { petId: string };
};

export type RootTabParamList = {
  Home: undefined;
  Pets: NavigatorScreenParams<PetsStackParamList>;
  Checkin: undefined;
  Profile: undefined;
  Settings: undefined;
};
