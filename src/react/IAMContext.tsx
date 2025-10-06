import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { IAMClient } from '../IAMClient';
import { User, LoginCredentials, IAMConfig } from '../types';

interface IAMContextValue {
  client: IAMClient;
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (credentials: LoginCredentials) => Promise<void>;
  logout: () => Promise<void>;
  refreshUser: () => Promise<void>;
  hasPermission: (permission: string) => Promise<boolean>;
  hasRole: (role: string) => Promise<boolean>;
}

const IAMContext = createContext<IAMContextValue | undefined>(undefined);

interface IAMProviderProps {
  config: IAMConfig;
  children: ReactNode;
  tokenStorageKey?: string;
  onAuthStateChange?: (isAuthenticated: boolean) => void;
}

export const IAMProvider: React.FC<IAMProviderProps> = ({
  config,
  children,
  tokenStorageKey = 'iam_token',
  onAuthStateChange,
}) => {
  const [client] = useState(() => new IAMClient(config));
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Load token from storage on mount
  useEffect(() => {
    const storedToken = localStorage.getItem(tokenStorageKey);
    if (storedToken) {
      client.setToken(storedToken);
      setToken(storedToken);
      verifyAndLoadUser(storedToken);
    } else {
      setIsLoading(false);
    }
  }, []);

  // Notify auth state changes
  useEffect(() => {
    if (onAuthStateChange) {
      onAuthStateChange(!!user);
    }
  }, [user, onAuthStateChange]);

  const verifyAndLoadUser = async (authToken: string) => {
    try {
      const response = await client.verifyToken(authToken);
      setUser(response.user);
    } catch (error) {
      console.error('Token verification failed:', error);
      clearAuth();
    } finally {
      setIsLoading(false);
    }
  };

  const login = async (credentials: LoginCredentials) => {
    setIsLoading(true);
    try {
      const response = await client.login(credentials);
      const newToken = response.access_token;
      
      setToken(newToken);
      setUser(response.user);
      localStorage.setItem(tokenStorageKey, newToken);
    } catch (error) {
      clearAuth();
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const logout = async () => {
    try {
      if (token) {
        await client.logout(token);
      }
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      clearAuth();
    }
  };

  const clearAuth = () => {
    setUser(null);
    setToken(null);
    client.clearToken();
    localStorage.removeItem(tokenStorageKey);
  };

  const refreshUser = async () => {
    if (!token) return;
    
    try {
      const response = await client.verifyToken(token);
      setUser(response.user);
    } catch (error) {
      console.error('Failed to refresh user:', error);
      clearAuth();
    }
  };

  const hasPermission = async (permission: string): Promise<boolean> => {
    if (!token) return false;
    return client.hasPermission(permission, token);
  };

  const hasRole = async (role: string): Promise<boolean> => {
    if (!token) return false;
    return client.hasRole(role, token);
  };

  const value: IAMContextValue = {
    client,
    user,
    token,
    isAuthenticated: !!user,
    isLoading,
    login,
    logout,
    refreshUser,
    hasPermission,
    hasRole,
  };

  return <IAMContext.Provider value={value}>{children}</IAMContext.Provider>;
};

export const useIAM = (): IAMContextValue => {
  const context = useContext(IAMContext);
  if (!context) {
    throw new Error('useIAM must be used within an IAMProvider');
  }
  return context;
};
