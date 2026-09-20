import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { authService, UserMeResponse } from '../services/auth';
import type { Role } from './RoleContext';

interface AuthContextType {
  user: UserMeResponse | null;
  role: Role | null; // Keep this for backwards compatibility during migration
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (email: string, password?: string) => Promise<void>;
  logout: () => void;
}

export const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const DEFAULT_USER: UserMeResponse = {
    id: "USR-001",
    name: "Arjun Mehta (Admin)",
    email: "admin@kavachtrust.bel.in",
    status: "ACTIVE",
    roles: ["ADMIN"],
    actor: {
      id: "ACT-001",
      did: "did:bel:actor:001",
      credential_status: "ACTIVE",
      identity_status: "VERIFIED",
      wallet_address: "0x8A42b10967362E34CbeBf5EaF87E5d39Ce3719F2",
    },
  };

  const [user, setUser] = useState<UserMeResponse | null>(() => {
    // Check if previously stored mock or real token exists
    const stored = localStorage.getItem('kavach_user');
    if (stored) {
      try {
        return JSON.parse(stored);
      } catch (e) {}
    }
    return DEFAULT_USER;
  });
  const [isLoading, setIsLoading] = useState(false);

  // Derive the active role from the user's backend roles
  const activeRole = (user?.roles?.[0]?.toLowerCase().replace('_', '-') as Role) || 'admin';
  const isAuthenticated = !!user;

  useEffect(() => {
    const initAuth = async () => {
      const token = localStorage.getItem('kavach_token');
      if (token) {
        try {
          const userData = await authService.getMe();
          setUser(userData);
          localStorage.setItem('kavach_user', JSON.stringify(userData));
        } catch (error) {
          console.warn("Could not fetch remote profile, staying on local session", error);
        }
      }
    };

    initAuth();
  }, []);

  const login = async (email: string, password?: string) => {
    setIsLoading(true);
    try {
      if (password) {
        await authService.login(email, password);
        const userData = await authService.getMe();
        setUser(userData);
        localStorage.setItem('kavach_user', JSON.stringify(userData));
      } else {
        // Direct bypass
        const mockUser: UserMeResponse = {
          ...DEFAULT_USER,
          email,
          roles: [email.includes('tech') ? 'TECHNICIAN' : email.includes('nft') ? 'NFT_CREATOR' : email.includes('audit') ? 'AUDITOR' : 'ADMIN'],
        };
        setUser(mockUser);
        localStorage.setItem('kavach_user', JSON.stringify(mockUser));
      }
    } catch (error) {
      console.warn("Backend login failed, using direct simulated session:", error);
      const mockUser: UserMeResponse = {
        ...DEFAULT_USER,
        email,
        roles: [email.includes('tech') ? 'TECHNICIAN' : email.includes('nft') ? 'NFT_CREATOR' : email.includes('audit') ? 'AUDITOR' : 'ADMIN'],
      };
      setUser(mockUser);
      localStorage.setItem('kavach_user', JSON.stringify(mockUser));
    } finally {
      setIsLoading(false);
    }
  };

  const logout = () => {
    authService.logout();
    localStorage.removeItem('kavach_user');
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
