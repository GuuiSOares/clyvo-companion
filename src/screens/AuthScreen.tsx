import { useMemo, useState } from 'react';
import {
  View,
  Text,
  TextInput,
  Pressable,
  Alert,
  Platform,
  StyleSheet,
} from 'react-native';
import ScreenLayout from '../components/ScreenLayout';
import AppLogo from '../components/AppLogo';
import { useAuth } from '../context/AuthContext';
import { loginAccount, registerAccount } from '../services/authData';
import { saveTutorProfile } from '../services/tutorData';
import type { AuthSession } from '../types/auth';
import { useTheme, type AppColors, type CommonStyles } from '../theme';

type AuthMode = 'login' | 'register';

export default function AuthScreen() {
  const { colors, commonStyles } = useTheme();
  const styles = useMemo(() => createStyles(colors, commonStyles), [colors, commonStyles]);
  const { signIn } = useAuth();
  const [mode, setMode] = useState<AuthMode>('login');
  const [nome, setNome] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const isRegister = mode === 'register';

  const showAlert = (title: string, message: string) => {
    if (Platform.OS === 'web') {
      window.alert(`${title}\n\n${message}`);
    } else {
      Alert.alert(title, message);
    }
  };

  const resetFields = () => {
    setPassword('');
    setConfirmPassword('');
  };

  const switchMode = (nextMode: AuthMode) => {
    setMode(nextMode);
    resetFields();
  };

  const finishAuth = async (session: AuthSession) => {
    await saveTutorProfile({
      nome: session.nomeUsuario,
      email: session.email,
    });
    signIn(session);
  };

  const handleSubmit = async () => {
    if (submitting) return;
    setSubmitting(true);

    try {
      if (isRegister) {
        if (password !== confirmPassword) {
          showAlert('Atenção', 'As senhas não coincidem.');
          return;
        }

        const result = await registerAccount(nome, email, password);
        if (!result.ok) {
          showAlert('Não foi possível criar a conta', result.message);
          return;
        }

        await finishAuth(result.session);
        return;
      }

      const result = await loginAccount(email, password);
      if (!result.ok) {
        showAlert('Não foi possível entrar', result.message);
        return;
      }

      await finishAuth(result.session);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <ScreenLayout withTabBar={false} keyboard contentContainerStyle={styles.content}>
      <View style={styles.header}>
        <AppLogo width={190} height={48} />
        <Text style={styles.title}>
          {isRegister ? 'Criar sua conta' : 'Entrar na Clyvo Companion'}
        </Text>
        <Text style={styles.subtitle}>
          {isRegister
            ? 'Crie sua conta de tutor para acompanhar seus pets na clínica.'
            : 'Entre com seu e-mail e senha. Na primeira vez, a entrada pode demorar um pouco.'}
        </Text>
      </View>

      <View style={commonStyles.form}>
        {isRegister ? (
          <View style={commonStyles.field}>
            <Text style={commonStyles.label}>Nome completo</Text>
            <TextInput
              style={commonStyles.input}
              value={nome}
              onChangeText={setNome}
              placeholder="Ex: Maria Silva"
              placeholderTextColor={colors.placeholder}
              autoCapitalize="words"
            />
          </View>
        ) : null}

        <View style={commonStyles.field}>
          <Text style={commonStyles.label}>E-mail</Text>
          <TextInput
            style={commonStyles.input}
            value={email}
            onChangeText={setEmail}
            placeholder="seu@email.com"
            placeholderTextColor={colors.placeholder}
            keyboardType="email-address"
            autoCapitalize="none"
            autoCorrect={false}
          />
        </View>

        <View style={commonStyles.field}>
          <Text style={commonStyles.label}>Senha</Text>
          <TextInput
            style={commonStyles.input}
            value={password}
            onChangeText={setPassword}
            placeholder={isRegister ? 'Mínimo 6 caracteres' : 'Sua senha'}
            placeholderTextColor={colors.placeholder}
            secureTextEntry
            autoCapitalize="none"
          />
        </View>

        {isRegister ? (
          <View style={commonStyles.field}>
            <Text style={commonStyles.label}>Confirmar senha</Text>
            <TextInput
              style={commonStyles.input}
              value={confirmPassword}
              onChangeText={setConfirmPassword}
              placeholder="Repita a senha"
              placeholderTextColor={colors.placeholder}
              secureTextEntry
              autoCapitalize="none"
            />
          </View>
        ) : null}

        <Pressable
          style={({ pressed }) => [
            commonStyles.primaryButton,
            pressed && commonStyles.primaryButtonPressed,
            submitting && styles.buttonDisabled,
          ]}
          onPress={handleSubmit}
          disabled={submitting}
        >
          <Text style={commonStyles.primaryButtonText}>
            {submitting ? 'Aguarde...' : isRegister ? 'Criar conta' : 'Entrar'}
          </Text>
        </Pressable>
      </View>

      <View style={styles.switchRow}>
        <Text style={styles.switchText}>
          {isRegister ? 'Já tem conta?' : 'Primeira vez no app?'}
        </Text>
        <Pressable onPress={() => switchMode(isRegister ? 'login' : 'register')}>
          <Text style={styles.switchAction}>
            {isRegister ? 'Fazer login' : 'Criar conta agora'}
          </Text>
        </Pressable>
      </View>

      <View style={styles.stepsCard}>
        <Text style={styles.stepsTitle}>Conta de demonstração</Text>
        <Text style={styles.stepsItem}>E-mail: maria@email.com</Text>
        <Text style={styles.stepsItem}>Senha: senha123</Text>
        <Text style={styles.stepsItem}>
          Na primeira entrada, pode levar cerca de um minuto. É só esperar na tela.
        </Text>
      </View>
    </ScreenLayout>
  );
}

function createStyles(colors: AppColors, commonStyles: CommonStyles) {
  return StyleSheet.create({
  content: {
    paddingTop: 24,
    paddingBottom: 40,
  },
  header: {
    alignItems: 'center',
    gap: 12,
    marginBottom: 28,
  },
  title: {
    fontSize: 22,
    fontWeight: '700',
    color: colors.text,
    textAlign: 'center',
    marginTop: 8,
  },
  subtitle: {
    fontSize: 14,
    color: colors.textMuted,
    textAlign: 'center',
    lineHeight: 20,
    paddingHorizontal: 8,
  },
  buttonDisabled: {
    opacity: 0.7,
  },
  switchRow: {
    alignItems: 'center',
    gap: 6,
    marginTop: 20,
    marginBottom: 24,
  },
  switchText: {
    fontSize: 14,
    color: colors.textMuted,
  },
  switchAction: {
    fontSize: 14,
    fontWeight: '700',
    color: colors.accent,
  },
  stepsCard: {
    ...commonStyles.card,
    gap: 8,
    borderColor: colors.infoBorder,
    backgroundColor: colors.infoBg,
  },
  stepsTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: colors.infoTitle,
    marginBottom: 4,
  },
  stepsItem: {
    fontSize: 13,
    color: colors.textSecondary,
    lineHeight: 18,
  },
  });
}
