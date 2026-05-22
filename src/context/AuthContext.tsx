import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import type { ReactNode } from 'react';
import { loadAuthSession, logoutAuth } from '../services/authData';
import type { AuthSession } from '../types/auth';

type AuthContextValue = {
  session: AuthSession | null;
  isLoading: boolean;
  signIn: (session: AuthSession) => void;
  signOut: () => Promise<void>;
};

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [session, setSession] = useState<AuthSession | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadAuthSession()
      .then(setSession)
      .finally(() => setIsLoading(false));
  }, []);

  const signIn = useCallback((nextSession: AuthSession) => {
    setSession(nextSession);
  }, []);

  const signOut = useCallback(async () => {
    await logoutAuth();
    setSession(null);
  }, []);

  const value = useMemo(
    () => ({
      session,
      isLoading,
      signIn,
      signOut,
    }),
    [session, isLoading, signIn, signOut]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth deve ser usado dentro de AuthProvider');
  }
  return context;
}
