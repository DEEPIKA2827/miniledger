import React, { createContext, useContext, useEffect, useState } from 'react';
import { api } from '../services/api';
import { User } from '../types';

interface AuthContextType {
  user: User | null;
  token: string | null;
  isLoading: boolean;
  login: (token: string, user: User) => Promise<void>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  useEffect(() => {
    // Restore session from AsyncStorage on app startup
    async function loadStoredAuth() {
      try {
        const storedToken = await api.getToken();
        const storedUser = await api.getUser();

        if (storedToken && storedUser) {
          setToken(storedToken);
          setUser(storedUser);
        }
      } catch (err) {
        console.warn('Failed to load stored authentication session', err);
      } finally {
        setIsLoading(false);
      }
    }

    loadStoredAuth();
  }, []);

  const login = async (newToken: string, newUser: User) => {
    await api.setToken(newToken);
    await api.setUser(newUser);
    setToken(newToken);
    setUser(newUser);
  };

  const logout = async () => {
    await api.clearSession();
    setToken(null);
    setUser(null);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        isLoading,
        login,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export function useAuth(): AuthContextType {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
