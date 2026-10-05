import { Navigate, Outlet } from "react-router";
import { useAuth } from "../../context/AuthContext";
import type { Role } from "../../context/RoleContext";

interface RoleGuardProps {
  allowedRoles: Role[];
}

export default function RoleGuard({ allowedRoles }: RoleGuardProps) {
  const { role, isAuthenticated, isLoading } = useAuth();

  // Debug logging
  console.log('[RoleGuard] Current state:', {
    role,
    isAuthenticated,
    isLoading,
    allowedRoles,
    includes: role ? allowedRoles.includes(role) : 'role is null'
  });

  if (isLoading) return <div style={{display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh', color: '#60a5fa'}}>Loading System...</div>;
  
  if (!isAuthenticated) {
    console.log('[RoleGuard] Not authenticated, redirecting to /login');
    return <Navigate to="/login" replace />;
  }

  if (!role || !allowedRoles.includes(role)) {
    console.log('[RoleGuard] Role not allowed, redirecting to /app/dashboard');
    return <Navigate to="/app/dashboard" replace />;
  }

  console.log('[RoleGuard] Role allowed, rendering Outlet');
  return <Outlet />;
}
