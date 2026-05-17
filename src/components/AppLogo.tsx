import { View, StyleSheet } from 'react-native';
import { Image } from 'expo-image';

const logoSource = require('../../assets/images/logo.png');

type Props = {
  width?: number;
  height?: number;
};

export default function AppLogo({ width = 280, height = 80 }: Props) {
  return (
    <View style={[styles.wrap, { width, height }]}>
      <Image
        source={logoSource}
        style={{ width, height }}
        contentFit="contain"
        contentPosition="center"
        accessibilityLabel="Clyvo Companion"
      />
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    alignSelf: 'center',
    alignItems: 'center',
    justifyContent: 'center',
  },
});
