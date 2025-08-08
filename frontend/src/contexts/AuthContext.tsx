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
  login: (email: string, password: string) => Promise<User>;
  googleLogin: (token: string) => Promise<void>;
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

  // Initialize authentication state on mount
  useEffect(() => {
    const initAuth = async () => {
      const token = authService.getToken();
      
      if (token) {
        try {
          // In production, validate the token with the backend
          if (import.meta.env.PROD) {
            const response = await authService.verifyToken();
            if (response.valid) {
              setUser(response.user);
            } else {
              authService.setToken(null);
            }
          } else {
            // In development, bypass token validation
            setUser({
              id: '00000000-0000-0000-0000-000000000002',
              email: 'demo@govconone.com',
              name: 'Demo User',
              tier: 'pro',
              tenant_id: '00000000-0000-0000-0000-000000000001',
              role: 'admin',
              avatar_url: ''
            });
          }
        } catch (error) {
          console.error('Token validation failed:', error);
          authService.setToken(null);
        }
      } else if (import.meta.env.DEV) {
        // Auto-login demo user in development
        const demoToken = 'demo-jwt-token-for-development';
        authService.setToken(demoToken);
        setUser({
          id: '00000000-0000-0000-0000-000000000002',
          email: 'demo@govconone.com',
          name: 'Demo User',
          tier: 'pro',
          tenant_id: '00000000-0000-0000-0000-000000000001',
          role: 'admin',
          avatar_url: ''
        });
      }
      
      setLoading(false);
    };

    initAuth();
  }, []);

  const login = async (email: string, password: string): Promise<User> => {
    try {
      if (import.meta.env.DEV) {
        // In development, bypass actual login and use demo user
        const demoUser = {
          id: '00000000-0000-0000-0000-000000000002',
          email: email || 'demo@govconone.com',
          name: 'Demo User',
          tier: 'pro' as const,
          tenant_id: '00000000-0000-0000-0000-000000000001',
          role: 'admin',
          avatar_url: ''
        };
        
        const demoToken = 'demo-jwt-token-for-development';
        authService.setToken(demoToken);
        setUser(demoUser);
        return demoUser;
      } else {
        // In production, use actual auth service
        const response = await authService.login(email, password);
        authService.setToken(response.token);
        setUser(response.user);
        return response.user;
      }
    } catch (error) {
      console.error('Login error:', error);
      throw error;
    }
  };

  const googleLogin = async (token: string) => {
    try {
      const response = await authService.googleLogin(token);
      authService.setToken(response.token);
      setUser(response.user);
    } catch (error) {
      console.error('Google login error:', error);
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
