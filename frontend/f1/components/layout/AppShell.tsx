import { useState } from "react";
import { Outlet, Navigate } from "react-router";
import { useAuth } from "../../context/AuthContext";
import Sidebar from "./Sidebar";
import Topbar from "./Topbar";

export default function AppShell() {
  const { isAuthenticated, isLoading } = useAuth();
  const [collapsed, setCollapsed] = useState(false);

  if (isLoading) {
    return <div style={{ minHeight: "100vh", background: "var(--background, #070f1d)", display: "flex", alignItems: "center", justifyContent: "center", color: "var(--muted, #64748b)" }}>Loading...</div>;
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  return (
    <div
      className="app-shell-root"
      style={{
        display: "flex",
        minHeight: "100vh",
        background: "var(--background, #0D0D0D)",
        color: "var(--foreground, #F5F5F5)",
        transition: "background 0.25s ease, color 0.25s ease",
      }}
    >
      <Sidebar collapsed={collapsed} onToggle={() => setCollapsed((c) => !c)} />
      <div style={{ flex: 1, display: "flex", flexDirection: "column", minWidth: 0 }}>
        <Topbar />
        <main
          style={{
            flex: 1,
            padding: "28px 32px 48px 42px",
            overflow: "auto",
          }}
          className="page-fade app-main-content"
        >
          <Outlet />
        </main>
      </div>
    </div>
  );
}
