import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { authService, UserMeResponse } from '../services/auth';

export type Role = "system-admin" | "procurement-supply-chain-officer" | "quality-inspector" | "auditor";

interface AuthContextType {
  user: UserMeResponse | null;
  role: Role | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
  error: string | null;
}

export const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<UserMeResponse | null>(() => {
    const stored = localStorage.getItem('kavach_user');
    if (stored) {
      try {
        return JSON.parse(stored);
      } catch (e) {}
    }
    return null;
  });
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Derive the active role from the user's backend roles
  const activeRole = user?.roles?.[0]
    ? (user.roles[0].toLowerCase().replaceAll('_', '-') as Role)
    : null;
  const isAuthenticated = !!user;

  useEffect(() => {
    const initAuth = async () => {
      const token = localStorage.getItem('kavach_token');
      if (!token) {
        setIsLoading(false);
        return;
      }
      try {
        const userData = await authService.getMe();
        setUser(userData);
        localStorage.setItem('kavach_user', JSON.stringify(userData));
      } catch (err) {
        // Token is invalid or expired — clear session
        console.warn('Session validation failed, clearing local session', err);
        localStorage.removeItem('kavach_token');
        localStorage.removeItem('kavach_user');
        setUser(null);
      } finally {
        setIsLoading(false);
      }
    };

    initAuth();
  }, []);

  const login = async (email: string, password: string) => {
    setIsLoading(true);
    setError(null);
    try {
      await authService.login(email, password);
      const userData = await authService.getMe();
      setUser(userData);
      localStorage.setItem('kavach_user', JSON.stringify(userData));
    } catch (err: any) {
      const msg = err?.message || err?.data?.detail || 'Authentication failed. Check credentials.';
      setError(msg);
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  const logout = () => {
    authService.logout();
    localStorage.removeItem('kavach_user');
    setUser(null);
    setError(null);
  };

  return (
    <AuthContext.Provider value={{ user, role: activeRole, isAuthenticated, isLoading, login, logout, error }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
