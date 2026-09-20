import { Navigate, Outlet } from "react-router";
import { useAuth } from "../../context/AuthContext";
import type { Role } from "../../context/RoleContext";

interface RoleGuardProps {
  allowedRoles: Role[];
}

export default function RoleGuard({ allowedRoles }: RoleGuardProps) {
  const { role, isAuthenticated, isLoading } = useAuth();

  if (isLoading) return <div style={{display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh', color: '#60a5fa'}}>Loading System...</div>;
  
  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  if (!role || !allowedRoles.includes(role)) {
    // Optionally redirect to a dedicated 403 page
    return <Navigate to="/app/dashboard" replace />;
  }

  return <Outlet />;
}
