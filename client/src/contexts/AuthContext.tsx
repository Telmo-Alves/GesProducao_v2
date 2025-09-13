import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { User, LoginRequest, ApiResponse } from '../types';
import { authApi } from '../services/api';

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (credentials: LoginRequest) => Promise<{ success: boolean; error?: string }>;
  logout: () => void;
  checkAuth: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const isAuthenticated = !!user;

  const login = async (credentials: LoginRequest): Promise<{ success: boolean; error?: string }> => {
    try {
      const response = await authApi.login(credentials);
      
      if (response.data.success && response.data.data) {
        const { token, user: userData } = response.data.data;
        
        localStorage.setItem('authToken', token);
        localStorage.setItem('user', JSON.stringify(userData));
        setUser(userData);
        
        return { success: true };
      } else {
        return { success: false, error: response.data.error || 'Login failed' };
      }
    } catch (error: any) {
      const errorMessage = error.response?.data?.error || 'Network error';
      return { success: false, error: errorMessage };
    }
  };

  const logout = () => {
    localStorage.removeItem('authToken');
    localStorage.removeItem('user');
    setUser(null);
  };

  const checkAuth = async () => {
    try {
      setIsLoading(true);
      const token = localStorage.getItem('authToken');
      
      if (!token) {
        setIsLoading(false);
        return;
      }

      const response = await authApi.validateToken();
      
      if (response.data.success && response.data.data) {
        setUser(response.data.data.user);
      } else {
        logout();
      }
    } catch (error) {
      console.error('Auth check failed:', error);
      logout();
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    checkAuth();
  }, []);

  const value: AuthContextType = {
    user,
    isAuthenticated,
    isLoading,
    login,
    logout,
    checkAuth,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};