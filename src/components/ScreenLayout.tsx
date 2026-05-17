import type { ReactNode } from 'react';
import {
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  type StyleProp,
  type ViewStyle,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { colors, commonStyles } from '../theme';

type Edge = 'top' | 'right' | 'bottom' | 'left';

type Props = {
  children: ReactNode;
  scrollable?: boolean;
  /** Use quando a tela tem header nativo do React Navigation (não aplica safe area no topo). */
  withHeader?: boolean;
  keyboard?: boolean;
  contentContainerStyle?: StyleProp<ViewStyle>;
};

export default function ScreenLayout({
  children,
  scrollable = true,
  withHeader = false,
  keyboard = false,
  contentContainerStyle,
}: Props) {
  const edges: Edge[] = withHeader
    ? ['left', 'right', 'bottom']
    : ['top', 'left', 'right', 'bottom'];

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
    children
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
