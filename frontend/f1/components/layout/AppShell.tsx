import { useState } from "react";
import { Outlet, Navigate } from "react-router";
import { useAuth } from "../../context/AuthContext";
import Sidebar from "./Sidebar";
import Topbar from "./Topbar";

export default function AppShell() {
  const { isAuthenticated, isLoading } = useAuth();
  const [collapsed, setCollapsed] = useState(false);

  if (isLoading) {
    return <div style={{ minHeight: "100vh", background: "#070f1d", display: "flex", alignItems: "center", justifyContent: "center", color: "#64748b" }}>Loading...</div>;
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  return (
    <div style={{ display: "flex", minHeight: "100vh", background: "#070f1d" }}>
      <Sidebar collapsed={collapsed} onToggle={() => setCollapsed((c) => !c)} />
      <div style={{ flex: 1, display: "flex", flexDirection: "column", minWidth: 0 }}>
        <Topbar />
        <main
          style={{
            flex: 1,
            padding: "28px 28px 48px",
            overflow: "auto",
          }}
          className="page-fade"
        >
          <Outlet />
        </main>
      </div>
    </div>
  );
}
