import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { authService, UserMeResponse } from '../services/auth';

export type Role = "system-admin" | "procurement-supply-chain-officer" | "quality-inspector" | "auditor";

export const DEFAULT_DEMO_USER: UserMeResponse = {
  id: "usr-001",
  email: "a.mehta@bel-defence.in",
  name: "Arjun Mehta",
  status: "ACTIVE",
  roles: ["SYSTEM_ADMIN"],
  actor: {
    id: "act-001",
    did: "did:bel:actor:001",
    credential_status: "ACTIVE",
    identity_status: "VERIFIED",
    wallet_address: "0x8A42b3c5d1e7f2a919F2",
  },
};

export function normalizeRole(roleStr?: string | null): Role {
  if (!roleStr) return "system-admin";
  const r = roleStr.toLowerCase().replaceAll("_", "-").trim();
  if (r === "system-admin" || r === "admin" || r === "administrator") return "system-admin";
  if (
    r === "procurement-supply-chain-officer" ||
    r === "creator" ||
    r === "nft-creator" ||
    r === "procurement-officer" ||
    r === "supply-chain"
  ) {
    return "procurement-supply-chain-officer";
  }
  if (
    r === "quality-inspector" ||
    r === "tech" ||
    r === "technician" ||
    r === "inspector"
  ) {
    return "quality-inspector";
  }
  if (r === "auditor" || r === "audit") return "auditor";
  return "system-admin";
}

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
    return null; // No default user - must authenticate
  });
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Derive the active role cleanly from backend roles with fallback normalization
  const activeRole: Role = user?.roles?.[0]
    ? normalizeRole(user.roles[0])
    : "system-admin";
  const isAuthenticated = !!user;

  useEffect(() => {
    const initAuth = async () => {
      const token = localStorage.getItem('kavach_token');
      
      if (token) {
        try {
          const userData = await authService.getMe();
          setUser(userData);
          localStorage.setItem('kavach_user', JSON.stringify(userData));
        } catch (err) {
          console.warn('Session verification failed, clearing invalid session', err);
          // SECURITY: Check if token is still valid before deciding to logout
          // Decode JWT to check expiration without network call
          try {
            const tokenParts = token.split('.');
            if (tokenParts.length === 3) {
              const payload = JSON.parse(atob(tokenParts[1]));
              const now = Date.now() / 1000;
              // If token is not expired, preserve session during temporary network/DB failures
              if (payload.exp && payload.exp > now) {
                const cachedUser = localStorage.getItem('kavach_user');
                if (cachedUser) {
                  try {
                    const parsed = JSON.parse(cachedUser);
                    setUser(parsed);
                    console.log('Using cached user data due to /me failure (token still valid)');
                    return; // Don't logout - preserve session
                  } catch (e) {
                    // Parse failed, proceed to logout
                  }
                }
              }
            }
            // Token is expired or invalid, clear session
            localStorage.removeItem('kavach_token');
            localStorage.removeItem('kavach_user');
            setUser(null);
          } catch (e) {
            // Token is invalid, clear session
            localStorage.removeItem('kavach_token');
            localStorage.removeItem('kavach_user');
            setUser(null);
          }
        }
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
