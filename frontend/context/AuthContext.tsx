import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { authService, UserMeResponse } from '../services/auth';
import type { Role } from './RoleContext';

interface AuthContextType {
  user: UserMeResponse | null;
  role: Role | null; // Keep this for backwards compatibility during migration
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (email: string) => Promise<void>;
  logout: () => void;
}

export const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<UserMeResponse | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Derive the active role from the user's backend roles
  const activeRole = (user?.roles?.[0]?.toLowerCase().replace('_', '-') as Role) || null;
  const isAuthenticated = !!user;

  useEffect(() => {
    const initAuth = async () => {
      const token = localStorage.getItem('kavach_token');
      if (token) {
        try {
          const userData = await authService.getMe();
          setUser(userData);
        } catch (error) {
          console.error("Session expired or invalid", error);
          localStorage.removeItem('kavach_token');
        }
      }
      setIsLoading(false);
    };

    initAuth();
  }, []);

  const login = async (email: string) => {
    setIsLoading(true);
    try {
      await authService.login(email, "password"); // Hardcoded password for demo purposes
      const userData = await authService.getMe();
      setUser(userData);
    } catch (error) {
      console.error("Login failed", error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const logout = () => {
    authService.logout();
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, role: activeRole, isAuthenticated, isLoading, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

// Export useAuth hook. 
// Note: We'll eventually replace useRole with useAuth across the app.
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
