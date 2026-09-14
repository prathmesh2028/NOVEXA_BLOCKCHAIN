import { NavLink, Link } from "react-router";
import { useRole, getRoleLabel, getRoleColor } from "../../context/RoleContext";
import type { Role } from "../../context/RoleContext";

const NAV_CONFIG: Record<Role, { label: string; items: { to: string; label: string; icon: string }[] }> = {
  admin: {
    label: "Administration",
    items: [
      { to: "/app/dashboard", label: "Dashboard", icon: "⊞" },
      { to: "/app/users", label: "Users", icon: "◉" },
      { to: "/app/roles", label: "Roles & Permissions", icon: "⊛" },
      { to: "/app/assets", label: "Assets", icon: "◈" },
      { to: "/app/certifications", label: "Certifications", icon: "◆" },
      { to: "/app/blockchain", label: "Blockchain", icon: "⬡" },
      { to: "/app/audit", label: "Audit Logs", icon: "≡" },
      { to: "/app/system-activity", label: "System Activity", icon: "◎" },
      { to: "/app/settings", label: "Settings", icon: "⚙" },
    ],
  },
  "nft-creator": {
    label: "NFT Creator",
    items: [
      { to: "/app/dashboard", label: "Dashboard", icon: "⊞" },
      { to: "/app/eligible-assets", label: "Eligible Assets", icon: "◈" },
      { to: "/app/certification-queue", label: "Certification Queue", icon: "◉" },
      { to: "/app/certifications", label: "Certifications", icon: "◆" },
      { to: "/app/blockchain", label: "Blockchain Transactions", icon: "⬡" },
      { to: "/app/history", label: "History", icon: "◷" },
    ],
  },
  technician: {
    label: "Technician",
    items: [
      { to: "/app/dashboard", label: "Dashboard", icon: "⊞" },
      { to: "/app/my-assets", label: "My Assets", icon: "◈" },
      { to: "/app/register", label: "Register / Update", icon: "⊕" },
      { to: "/app/technical-records", label: "Technical Records", icon: "☰" },
      { to: "/app/evidence", label: "Evidence", icon: "◫" },
      { to: "/app/inspections", label: "Inspections", icon: "◌" },
      { to: "/app/lifecycle", label: "Lifecycle", icon: "◷" },
    ],
  },
  auditor: {
    label: "Auditor",
    items: [
      { to: "/app/dashboard", label: "Dashboard", icon: "⊞" },
      { to: "/app/search", label: "Search", icon: "◎" },
      { to: "/app/verification", label: "Verification Center", icon: "◉" },
      { to: "/app/assets", label: "Assets", icon: "◈" },
      { to: "/app/evidence-integrity", label: "Evidence Integrity", icon: "◫" },
      { to: "/app/certifications", label: "Certifications", icon: "◆" },
      { to: "/app/blockchain-proof", label: "Blockchain Proof", icon: "⬡" },
      { to: "/app/audit-trail", label: "Audit Trail", icon: "≡" },
    ],
  },
};

interface SidebarProps {
  collapsed: boolean;
  onToggle: () => void;
}

export default function Sidebar({ collapsed, onToggle }: SidebarProps) {
  const { user, logout } = useRole();
  if (!user) return null;

  const nav = NAV_CONFIG[user.role];
  const roleColor = getRoleColor(user.role);

  return (
    <aside
      style={{
        width: collapsed ? 56 : 220,
        minHeight: "100vh",
        background: "#08131f",
        borderRight: "1px solid #152b4a",
        display: "flex",
        flexDirection: "column",
        transition: "width 0.2s ease",
        flexShrink: 0,
        position: "relative",
        zIndex: 20,
      }}
    >
      {/* Logo */}
      <div
        style={{
          padding: "16px 14px 14px",
          borderBottom: "1px solid #152b4a",
          display: "flex",
          alignItems: "center",
          gap: "10px",
        }}
      >
        <div
          style={{
            width: 28,
            height: 28,
            background: "#2563eb",
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
          }}
        >
          BT
        </div>
        {!collapsed && (
          <div>
            <div
              className="font-display"
              style={{
                fontSize: "0.9rem",
                fontWeight: 700,
                color: "#e2e8f0",
                letterSpacing: "0.04em",
                lineHeight: 1.1,
              }}
            >
              BEL-DEFENCE
            </div>
            <div style={{ fontSize: "0.6rem", color: "#475569", letterSpacing: "0.08em", fontWeight: 600 }}>
              ASSET TRUST
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

        {!collapsed && (
          <div style={{ borderTop: "1px solid #152b4a", marginTop: 12, paddingTop: 8 }}>
            <NavLink
              to="/app/search"
              className={({ isActive }) => `sidebar-link${isActive ? " active" : ""}`}
            >
              <span style={{ fontSize: "0.9rem", width: 16, textAlign: "center" }}>◎</span>
              <span>Search</span>
            </NavLink>
          </div>
        )}
      </nav>

      {/* User */}
      <div
        style={{
          padding: collapsed ? "10px 8px" : "12px 14px",
          borderTop: "1px solid #152b4a",
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
                  {getRoleLabel(user.role)}
                </div>
              </div>
            </div>
            <div className="meta-id" style={{ marginBottom: 8, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
              {user.did}
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
