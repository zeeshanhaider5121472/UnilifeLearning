'use client';

import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { User, AuthContextType } from '@/lib/types';
import { loginUser } from '@/lib/api';

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const stored = localStorage.getItem('resulthub_user');
    if (stored) {
      try {
        setUser(JSON.parse(stored));
      } catch {
        localStorage.removeItem('resulthub_user');
      }
    }
    setLoading(false);
  }, []);

  const login = async (username: string, password: string): Promise<User | null> => {
    const u = await loginUser(username, password);
    if (u) {
      setUser(u);
      localStorage.setItem('resulthub_user', JSON.stringify(u));
    }
    return u;
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('resulthub_user');
  };

  return (
    <AuthContext.Provider value={{ user, login, logout, loading }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = (): AuthContextType => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
};