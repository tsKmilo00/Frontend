import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { User, LoginRequest, RegisterRequest } from '../types';
import { apiService } from '../services/api';

interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  error: string | null;
  isAuthenticated: boolean;
  login: (credentials: LoginRequest) => Promise<User>;
  register: (data: RegisterRequest) => Promise<any>;
  logout: () => Promise<void>;
  clearError: () => void;
  reloadUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const initializeAuth = () => {
      try {
        if (apiService.isTokenValid()) {
          const u = apiService.getUserFromToken();
          setUser(u);
        } else {
          apiService.clearToken();
          setUser(null);
        }
      } catch (err) {
        setUser(null);
      } finally {
        setIsLoading(false);
      }
    };
    initializeAuth();
  }, []);

  const login = async (credentials: LoginRequest) => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await apiService.login(credentials);
      apiService.setToken(response.token);
      setUser(response.user);
      return response.user;
    } catch (err: any) {
      const msg = err.message || 'Credenciales incorrectas';
      setError(msg);
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  const register = async (data: RegisterRequest) => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await apiService.register(data);
      if (response.token) {
        apiService.setToken(response.token);
      }
      return response;
    } catch (err: any) {
      const msg = err.message || 'Error al registrarse';
      setError(msg);
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  const logout = useCallback(async () => {
    setIsLoading(true);
    try {
      await apiService.logout();
      setUser(null);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const clearError = () => {
    setError(null);
  };

  const reloadUser = async () => {
    const tokenValid = apiService.isTokenValid();
    if (!tokenValid) {
      setUser(null);
      return;
    }
    const tokenUser = apiService.getUserFromToken();
    if (!tokenUser) return;
    try {
      const updatedUser = await apiService.getUserByEmail(tokenUser.correo);
      setUser(updatedUser);
    } catch (err) {
      // If error occurs, e.g. token expired, interceptor handles 401 redirect
    }
  };

  const value = {
    user,
    isLoading,
    error,
    isAuthenticated: !!user && apiService.isTokenValid(),
    login,
    register,
    logout,
    clearError,
    reloadUser
  };

  return React.createElement(AuthContext.Provider, { value }, children);
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
