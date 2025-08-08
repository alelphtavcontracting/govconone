import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import authService from '../services/authService';

interface User {
  id: string;
  email: string;
  name: string;
  tier: 'free' | 'pro' | 'elite';
  tenant_id: string;
  avatar_url?: string;
  role: string;
}

interface AuthContextType {
  user: User | null;
<<<<<<< HEAD
  login: (email: string, password: string) => Promise<void>;
  googleLogin: (token: string) => Promise<void>;
=======
  login: (email: string, password: string) => Promise<User>;
>>>>>>> fix-main
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
<<<<<<< HEAD
    const initAuth = async () => {
      const token = localStorage.getItem('token');
      
      if (token) {
        authService.setToken(token);
        try {
          const response = await authService.verifyToken();
          if (response.valid) {
            setUser(response.user);
          } else {
            localStorage.removeItem('token');
            authService.setToken(null);
          }
        } catch (error) {
          console.error('Token verification failed:', error);
          localStorage.removeItem('token');
          authService.setToken(null);
        }
      } else {
        if (import.meta.env.MODE === 'development') {
          const demoToken = 'demo-jwt-token-for-development';
          localStorage.setItem('token', demoToken);
          authService.setToken(demoToken);
          setUser({
            id: '00000000-0000-0000-0000-000000000002',
            email: 'demo@govconone.com',
            name: 'Demo User',
            tier: 'pro',
            tenant_id: '00000000-0000-0000-0000-000000000001',
            role: 'admin'
          });
        }
      }
      
      setLoading(false);
    };

    initAuth();
=======
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
            tier: 'pro' as const,
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
>>>>>>> fix-main
  }, []);

  const login = async (email: string, _password: string): Promise<User> => {
    try {
<<<<<<< HEAD
      const response = await authService.login(email, password);
      localStorage.setItem('token', response.token);
      authService.setToken(response.token);
      setUser(response.user);
    } catch (error) {
      throw error;
    }
  };

  const googleLogin = async (token: string) => {
    try {
      const response = await authService.googleLogin(token);
      localStorage.setItem('token', response.token);
      authService.setToken(response.token);
      setUser(response.user);
=======
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
>>>>>>> fix-main
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
    googleLogin,
    logout,
    loading
  };

  return (
    <AuthContext.Provider value={value}>
      {!loading && children}
    </AuthContext.Provider>
  );
};
