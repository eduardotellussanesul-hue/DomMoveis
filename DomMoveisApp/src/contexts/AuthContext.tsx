import React, { createContext, useContext, useState, useEffect, type ReactNode } from 'react';
import type { User } from '../api/types/user';
import { authService } from '../services/authService';
import { apiClient } from '../api/client';

interface AuthContextData {
  user: User | null;
  token: string | null;
  loading: boolean;
  login: (email: string, senha: string) => Promise<void>;
  register: (nome: string, email: string, senha: string) => Promise<void>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextData | undefined>(undefined);

export const useAuth = (): AuthContextData => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const storedToken = localStorage.getItem('@DomMoveis:token');
    const storedUser = localStorage.getItem('@DomMoveis:user');

    if (storedToken && storedUser) {
      try {
        const parsedUser = JSON.parse(storedUser);
        setToken(storedToken);
        setUser(parsedUser);
        apiClient.defaults.headers.common['Authorization'] = `Bearer ${storedToken}`;
      } catch {
        localStorage.removeItem('@DomMoveis:token');
        localStorage.removeItem('@DomMoveis:user');
      }
    }
    setLoading(false);
  }, []);

  const login = async (email: string, senha: string) => {
    const { user, token } = await authService.login({ email, senha });
    console.log('🔐 Token recebido:', token);
    console.log('👤 Usuário recebido:', user);
    localStorage.setItem('@DomMoveis:token', token);
    localStorage.setItem('@DomMoveis:user', JSON.stringify(user));
    console.log('💾 Token salvo?', localStorage.getItem('@DomMoveis:token'));
    console.log('💾 Usuário salvo?', localStorage.getItem('@DomMoveis:user'));
    setUser(user);
    setToken(token);
    apiClient.defaults.headers.common['Authorization'] = `Bearer ${token}`;
  };

  const register = async (nome: string, email: string, senha: string) => {
    const { user, token } = await authService.register({ nome, email, senha });
    localStorage.setItem('@DomMoveis:token', token);
    localStorage.setItem('@DomMoveis:user', JSON.stringify(user));
    setUser(user);
    setToken(token);
    apiClient.defaults.headers.common['Authorization'] = `Bearer ${token}`;
  };

  const logout = () => {
    localStorage.removeItem('@DomMoveis:token');
    localStorage.removeItem('@DomMoveis:user');
    setUser(null);
    setToken(null);
    delete apiClient.defaults.headers.common['Authorization'];
  };

  return (
    <AuthContext.Provider value={{ user, token, loading, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  );
};