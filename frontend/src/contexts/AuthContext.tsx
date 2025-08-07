import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import authService from '../services/authService';

interface User {
  id: string;
  email: string;
  name: string;
  tier: 'free' | 'pro' | 'elite';
  tenant_id: string;
}

interface AuthContextType {
  user: User | null;
  login: (email: string, password: string) => Promise<User>;
  logout: () => void;
  loading: boolean;
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
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const validateToken = async () => {
      const token = authService.getToken();
      
      if (token) {
        try {
          // Here you would typically validate the token with the backend
          // For demo purposes, we'll just set a mock user
          const mockUser = {
            id: 'demo-user-123',
            email: 'demo@govconone.com',
            name: 'Demo User',
            tier: 'free' as const,
            tenant_id: 'demo-tenant-123'
          };
          setUser(mockUser);
        } catch (error) {
          console.error('Error validating token:', error);
          authService.setToken(null);
        }
      }
      setLoading(false);
    };

    validateToken();
  }, []);

  const login = async (email: string, _password: string): Promise<User> => {
    try {
      // For demo purposes, bypass actual login and use mock data
      const mockUser = {
        id: 'demo-user-123',
        email: email || 'demo@govconone.com',
        name: 'Demo User',
        tier: 'free' as const,
        tenant_id: 'demo-tenant-123'
      };
      
      // Set a mock token
      const mockToken = 'demo-token-123';
      authService.setToken(mockToken);
      setUser(mockUser);
      
      return mockUser;
    } catch (error) {
      console.error('Login error:', error);
      throw error;
    }
  };

  const logout = () => {
    authService.setToken(null);
    setUser(null);
  };

  const value: AuthContextType = {
    user,
    login,
    logout,
    loading
  };

  return (
    <AuthContext.Provider value={value}>
      {!loading && children}
    </AuthContext.Provider>
  );
};
