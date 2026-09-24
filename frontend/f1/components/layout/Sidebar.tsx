import { NavLink, Link } from "react-router";
import { getRoleLabel, getRoleColor } from "../../context/RoleContext";
import { useAuth } from "../../context/AuthContext";
import type { Role } from "../../context/AuthContext";

const NAV_CONFIG: Record<Role, { label: string; items: { to: string; label: string; icon: string }[] }> = {
  "system-admin": {
    label: "System Administration",
    items: [
      { to: "/app/dashboard", label: "Dashboard", icon: "⊞" },
      { to: "/app/users", label: "Users", icon: "◉" },
      { to: "/app/assets", label: "Assets", icon: "◈" },
      { to: "/app/certifications", label: "Certifications", icon: "◆" },
      { to: "/app/blockchain", label: "Blockchain", icon: "⬡" },
      { to: "/app/system-activity", label: "System Activity", icon: "≡" },
      { to: "/app/settings", label: "Settings", icon: "⚙" },
      { to: "/app/supply-chain", label: "Supply Chain", icon: "⛟" },
    ],
  },
  "procurement-supply-chain-officer": {
    label: "Procurement & Supply Chain",
    items: [
      { to: "/app/dashboard", label: "Dashboard", icon: "⊞" },
      { to: "/app/supply-chain", label: "Supply Chain", icon: "⛟" },
      { to: "/app/assets", label: "Assets", icon: "◈" },
      { to: "/app/certification-queue", label: "Certification Queue", icon: "◉" },
      { to: "/app/certifications", label: "Certifications", icon: "◆" },
      { to: "/app/blockchain", label: "Blockchain", icon: "⬡" },
    ],
  },
  "quality-inspector": {
    label: "Quality Inspection",
    items: [
      { to: "/app/dashboard", label: "Dashboard", icon: "⊞" },
      { to: "/app/assets", label: "Assets", icon: "◈" },
      { to: "/app/register", label: "Register Asset", icon: "⊕" },
      { to: "/app/technical-records", label: "Technical Records", icon: "☰" },
      { to: "/app/evidence", label: "Evidence", icon: "◫" },
      { to: "/app/inspections", label: "Inspections", icon: "◌" },
      { to: "/app/lifecycle", label: "Lifecycle", icon: "◷" },
      { to: "/app/certification-queue", label: "Certification Queue", icon: "◉" },
      { to: "/app/eligible-assets", label: "Eligible Assets", icon: "◈" },
      { to: "/app/certifications", label: "Certifications", icon: "◆" },
      { to: "/app/blockchain", label: "Blockchain", icon: "⬡" },
      { to: "/app/supply-chain", label: "Supply Chain", icon: "⛟" },
    ],
  },
  auditor: {
    label: "Audit & Verification",
    items: [
      { to: "/app/dashboard", label: "Dashboard", icon: "⊞" },
      { to: "/app/verification", label: "Verification Center", icon: "◉" },
      { to: "/app/assets", label: "Assets", icon: "◈" },
      { to: "/app/evidence-integrity", label: "Evidence Integrity", icon: "◫" },
      { to: "/app/certifications", label: "Certifications", icon: "◆" },
      { to: "/app/blockchain-proof", label: "Blockchain Proof", icon: "⬡" },
      { to: "/app/system-activity", label: "System Activity", icon: "≡" },
      { to: "/app/supply-chain", label: "Supply Chain", icon: "⛟" },
    ],
  },
};

interface SidebarProps {
  collapsed: boolean;
  onToggle: () => void;
}

export default function Sidebar({ collapsed, onToggle }: SidebarProps) {
  const { user, role, logout } = useAuth();
  if (!user) return null;

  const currentRole = (role && NAV_CONFIG[role as Role]) ? (role as Role) : "quality-inspector";
  const nav = NAV_CONFIG[currentRole] || NAV_CONFIG["quality-inspector"];
  const roleColor = getRoleColor(currentRole);

  return (
    <aside
      style={{
        width: collapsed ? 56 : 220,
        minHeight: "100vh",
        background: "var(--sidebar-bg, #08131f)",
        borderRight: "1px solid var(--border-subtle, #152b4a)",
        display: "flex",
        flexDirection: "column",
        transition: "width 0.2s ease, background 0.2s ease, border-color 0.2s ease",
        flexShrink: 0,
        position: "relative",
        zIndex: 20,
      }}
    >
      {/* Logo */}
      <div
        style={{
          padding: "16px 14px 14px",
          borderBottom: "1px solid var(--border-subtle, #152b4a)",
          display: "flex",
          alignItems: "center",
          gap: "10px",
        }}
      >
        <div
          style={{
            width: 28,
            height: 28,
            background: "linear-gradient(135deg, #2563eb 0%, #1d4ed8 100%)",
            borderRadius: "5px",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            fontWeight: 900,
            fontSize: "0.9rem",
            color: "#fff",
            flexShrink: 0,
            letterSpacing: "-0.04em",
            fontFamily: "'Barlow Condensed', sans-serif",
            boxShadow: "0 2px 8px rgba(37, 99, 235, 0.35)",
          }}
        >
          NX
        </div>
        {!collapsed && (
          <div>
            <div
              className="font-display"
              style={{
                fontSize: "0.95rem",
                fontWeight: 700,
                color: "var(--foreground, #e2e8f0)",
                letterSpacing: "0.04em",
                lineHeight: 1.1,
              }}
            >
              BEL
            </div>
            <div style={{ fontSize: "0.6rem", color: "#60a5fa", letterSpacing: "0.08em", fontWeight: 600 }}>
              DEFENCE TRUST
            </div>
          </div>
        )}
        <button
          onClick={onToggle}
          style={{
            marginLeft: "auto",
            background: "none",
            border: "none",
            color: "#475569",
            cursor: "pointer",
            fontSize: "0.875rem",
            padding: "2px 4px",
            flexShrink: 0,
          }}
        >
          {collapsed ? "›" : "‹"}
        </button>
      </div>

      {/* Nav */}
      <nav style={{ flex: 1, padding: "10px 8px", overflowY: "auto" }}>
        {!collapsed && (
          <div
            className="section-label"
            style={{ paddingLeft: 4, marginBottom: 6, marginTop: 4 }}
          >
            {nav.label}
          </div>
        )}
        {nav.items.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            className={({ isActive }) => `sidebar-link${isActive ? " active" : ""}`}
            title={collapsed ? item.label : undefined}
            style={collapsed ? { justifyContent: "center", padding: "8px" } : undefined}
          >
            <span style={{ fontSize: "0.9rem", flexShrink: 0, width: collapsed ? "auto" : 16, textAlign: "center" }}>
              {item.icon}
            </span>
            {!collapsed && <span>{item.label}</span>}
          </NavLink>
        ))}
      </nav>

      {/* Secure People Emblem Widget matching Reference */}
      {!collapsed && (
        <div className="sidebar-secure-people-widget">
          <div className="sidebar-shield-emblem">
            <span style={{ fontSize: "1.25rem" }}>🛡</span>
          </div>
          <div className="sidebar-secure-text">
            <div>SECURE PEOPLE</div>
            <div>SECURE ASSETS</div>
            <div style={{ color: "#22c55e" }}>SECURE NATION</div>
          </div>
        </div>
      )}

      {/* User */}
      <div
        style={{
          padding: collapsed ? "10px 8px" : "12px 14px",
          borderTop: "1px solid var(--border-subtle, #152b4a)",
        }}
      >
        {!collapsed ? (
          <div>
            <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: 8 }}>
              <div
                style={{
                  width: 28,
                  height: 28,
                  borderRadius: "50%",
                  background: roleColor + "22",
                  border: `1px solid ${roleColor}44`,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontSize: "0.65rem",
                  fontWeight: 700,
                  color: roleColor,
                  flexShrink: 0,
                }}
              >
                {user.name.split(" ").map((n) => n[0]).join("")}
              </div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontSize: "0.8125rem", fontWeight: 600, color: "#94a3b8", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                  {user.name}
                </div>
                <div
                  style={{
                    fontSize: "0.6875rem",
                    color: roleColor,
                    fontWeight: 600,
                  }}
                >
                  {getRoleLabel(role)}
                </div>
              </div>
            </div>
            <div className="meta-id" style={{ marginBottom: 8, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
              {user.actor?.did || "—"}
            </div>
            <button
              onClick={logout}
              className="btn-ghost"
              style={{ width: "100%", justifyContent: "center", padding: "5px", fontSize: "0.75rem" }}
            >
              Sign Out
            </button>
          </div>
        ) : (
          <button
            onClick={logout}
            style={{
              width: "100%",
              background: "none",
              border: "none",
              color: "#475569",
              cursor: "pointer",
              fontSize: "0.875rem",
              padding: "6px",
              borderRadius: "4px",
            }}
            title="Sign Out"
          >
            ⊗
          </button>
        )}
      </div>
    </aside>
  );
}
