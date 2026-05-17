import type { ReactNode } from 'react';
import {
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  View,
  type StyleProp,
  type ViewStyle,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { colors, commonStyles } from '../theme';

type Edge = 'top' | 'right' | 'bottom' | 'left';

type Props = {
  children: ReactNode;
  scrollable?: boolean;
  withHeader?: boolean;
  withTabBar?: boolean;
  keyboard?: boolean;
  contentContainerStyle?: StyleProp<ViewStyle>;
};

export default function ScreenLayout({
  children,
  scrollable = true,
  withHeader = false,
  withTabBar = true,
  keyboard = false,
  contentContainerStyle,
}: Props) {
  const edges: Edge[] = [];
  if (!withHeader) edges.push('top');
  edges.push('left', 'right');
  if (!withTabBar) edges.push('bottom');

  const content = scrollable ? (
    <ScrollView
      style={styles.flex}
      contentContainerStyle={[commonStyles.scrollContent, contentContainerStyle]}
      keyboardShouldPersistTaps="handled"
      showsVerticalScrollIndicator={false}
    >
      {children}
    </ScrollView>
  ) : (
    <View style={[styles.flex, commonStyles.screenBody]}>{children}</View>
  );

  const body = (
    <SafeAreaView style={styles.safe} edges={edges}>
      {content}
    </SafeAreaView>
  );

  if (keyboard) {
    return (
      <KeyboardAvoidingView
        style={styles.flex}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        {body}
      </KeyboardAvoidingView>
    );
  }

  return body;
}

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: colors.background,
  },
  flex: {
    flex: 1,
  },
});
