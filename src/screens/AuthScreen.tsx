import { useState, useEffect } from 'react';
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
import { hasRegisteredAccount, loginAccount, registerAccount } from '../services/authData';
import { colors, commonStyles } from '../theme';

type AuthMode = 'login' | 'register';

export default function AuthScreen() {
  const { signIn } = useAuth();
  const [mode, setMode] = useState<AuthMode>('login');
  const [canRegister, setCanRegister] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const isRegister = mode === 'register';

  useEffect(() => {
    hasRegisteredAccount().then((exists) => {
      setCanRegister(!exists);
      if (exists) {
        setMode('login');
      }
    });
  }, []);

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
    if (nextMode === 'register' && !canRegister) {
      showAlert(
        'Conta já cadastrada',
        'Este aparelho já tem uma conta. Faça login ou limpe os dados em Meu Perfil para recomeçar do zero.'
      );
      return;
    }
    setMode(nextMode);
    resetFields();
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

        const result = await registerAccount(email, password);
        if (!result.ok) {
          showAlert('Não foi possível criar a conta', result.message);
          return;
        }

        setCanRegister(false);
        signIn(result.session);
        return;
      }

      const result = await loginAccount(email, password);
      if (!result.ok) {
        showAlert('Não foi possível entrar', result.message);
        return;
      }

      signIn(result.session);
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
            ? 'Use e-mail e senha para começar. Depois você completa seu perfil de tutor no app.'
            : 'Uma conta por aparelho. Seus pets e perfil ficam salvos ao sair e entrar de novo.'}
        </Text>
      </View>

      <View style={commonStyles.form}>
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

      {canRegister ? (
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
      ) : (
        <Text style={styles.singleAccountHint}>
          Este aparelho já possui conta. Para testar outro tutor, use &quot;Limpar todos os dados&quot; em
          Meu Perfil.
        </Text>
      )}

      <View style={styles.stepsCard}>
        <Text style={styles.stepsTitle}>Depois de entrar</Text>
        <Text style={styles.stepsItem}>1. Complete seu perfil em Meu Perfil (nome obrigatório)</Text>
        <Text style={styles.stepsItem}>2. Cadastre seu pet em Meus Pets</Text>
        <Text style={styles.stepsItem}>3. Registre o dia e consulte o prontuário</Text>
      </View>
    </ScreenLayout>
  );
}

const styles = StyleSheet.create({
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
  singleAccountHint: {
    fontSize: 13,
    color: colors.textMuted,
    textAlign: 'center',
    lineHeight: 18,
    marginTop: 20,
    marginBottom: 24,
    paddingHorizontal: 8,
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
