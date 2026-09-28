import { useState, useEffect } from "react";
import { NavLink, Link, useLocation } from "react-router";
import { getRoleLabel, getRoleColor } from "../../context/RoleContext";
import { useAuth } from "../../context/AuthContext";
import type { Role } from "../../context/AuthContext";
import BelIconMark from "../ui/BelIconMark";

export interface NavItem {
  to: string;
  label: string;
  icon: string;
}

export interface NavGroup {
  id: string;
  label: string;
  icon?: string;
  collapsible?: boolean;
  items: NavItem[];
}

export const GROUPED_NAV_CONFIG: Record<Role, { roleLabel: string; groups: NavGroup[] }> = {
  "quality-inspector": {
    roleLabel: "Quality Inspection",
    groups: [
      {
        id: "overview",
        label: "Overview",
        items: [{ to: "/app/dashboard", label: "Dashboard", icon: "⊞" }],
      },
      {
        id: "asset-ops",
        label: "Asset Management",
        icon: "◈",
        collapsible: true,
        items: [
          { to: "/app/assets", label: "My Assets", icon: "◈" },
          { to: "/app/register", label: "Register / Update", icon: "⊕" },
          { to: "/app/technical-records", label: "Technical Records", icon: "☰" },
          { to: "/app/inspections", label: "Inspections", icon: "◌" },
          { to: "/app/lifecycle", label: "Lifecycle", icon: "◷" },
        ],
      },
      {
        id: "trust-cert",
        label: "Evidence & Certification",
        icon: "◆",
        collapsible: true,
        items: [
          { to: "/app/evidence", label: "Evidence", icon: "◫" },
          { to: "/app/certification-queue", label: "Certification Queue", icon: "◉" },
          { to: "/app/eligible-assets", label: "Eligible Assets", icon: "◈" },
          { to: "/app/certifications", label: "Certifications", icon: "◆" },
        ],
      },
      {
        id: "blockchain",
        label: "Blockchain",
        items: [{ to: "/app/blockchain", label: "Blockchain", icon: "⬡" }],
      },
      {
        id: "supply-chain",
        label: "Supply Chain",
        items: [{ to: "/app/supply-chain", label: "Supply Chain", icon: "⛟" }],
      },
      {
        id: "utility",
        label: "Utility",
        items: [{ to: "/app/search", label: "Search", icon: "⌕" }],
      },
    ],
  },
  "system-admin": {
    roleLabel: "System Administration",
    groups: [
      {
        id: "overview",
        label: "Overview",
        items: [{ to: "/app/dashboard", label: "Dashboard", icon: "⊞" }],
      },
      {
        id: "identity",
        label: "Identity & Access",
        icon: "◉",
        collapsible: true,
        items: [
          { to: "/app/users", label: "Users", icon: "◉" },
          { to: "/app/roles", label: "Roles", icon: "🛡" },
        ],
      },
      {
        id: "asset-trust",
        label: "Asset Trust",
        icon: "◈",
        collapsible: true,
        items: [
          { to: "/app/assets", label: "Assets", icon: "◈" },
          { to: "/app/certifications", label: "Certifications", icon: "◆" },
          { to: "/app/blockchain", label: "Blockchain", icon: "⬡" },
        ],
      },
      {
        id: "operations",
        label: "Operations",
        icon: "≡",
        collapsible: true,
        items: [
          { to: "/app/system-activity", label: "System Activity", icon: "≡" },
          { to: "/app/supply-chain", label: "Supply Chain", icon: "⛟" },
        ],
      },
      {
        id: "utility",
        label: "Utility",
        items: [{ to: "/app/search", label: "Search", icon: "⌕" }],
      },
      {
        id: "settings",
        label: "Settings",
        items: [{ to: "/app/settings", label: "Settings", icon: "⚙" }],
      },
    ],
  },
  "procurement-supply-chain-officer": {
    roleLabel: "Procurement & Supply Chain",
    groups: [
      {
        id: "overview",
        label: "Overview",
        items: [{ to: "/app/dashboard", label: "Dashboard", icon: "⊞" }],
      },
      {
        id: "asset-cert",
        label: "Asset Certification",
        icon: "◆",
        collapsible: true,
        items: [
          { to: "/app/assets", label: "Assets", icon: "◈" },
          { to: "/app/eligible-assets", label: "Eligible Assets", icon: "◈" },
          { to: "/app/certification-queue", label: "Certification Queue", icon: "◉" },
          { to: "/app/certifications", label: "Certifications", icon: "◆" },
        ],
      },
      {
        id: "blockchain",
        label: "Blockchain",
        items: [{ to: "/app/blockchain", label: "Blockchain", icon: "⬡" }],
      },
      {
        id: "supply-chain",
        label: "Supply Chain",
        items: [{ to: "/app/supply-chain", label: "Supply Chain", icon: "⛟" }],
      },
      {
        id: "history",
        label: "History",
        items: [{ to: "/app/history", label: "History", icon: "◷" }],
      },
      {
        id: "utility",
        label: "Utility",
        items: [{ to: "/app/search", label: "Search", icon: "⌕" }],
      },
    ],
  },
  auditor: {
    roleLabel: "Audit & Verification",
    groups: [
      {
        id: "overview",
        label: "Overview",
        items: [{ to: "/app/dashboard", label: "Dashboard", icon: "⊞" }],
      },
      {
        id: "audit-trust",
        label: "Audit & Trust",
        icon: "◆",
        collapsible: true,
        items: [
          { to: "/app/verification", label: "Verification Center", icon: "◉" },
          { to: "/app/assets", label: "Assets", icon: "◈" },
          { to: "/app/certifications", label: "Certifications", icon: "◆" },
          { to: "/app/blockchain-proof", label: "Blockchain Proof", icon: "⬡" },
          { to: "/app/system-activity", label: "System Activity", icon: "≡" },
        ],
      },
      {
        id: "evidence",
        label: "Evidence",
        icon: "◫",
        collapsible: true,
        items: [
          { to: "/app/evidence-integrity", label: "Evidence Integrity", icon: "◫" },
          { to: "/app/evidence", label: "Evidence Vault", icon: "◫" },
        ],
      },
      {
        id: "supply-chain",
        label: "Supply Chain",
        items: [{ to: "/app/supply-chain", label: "Supply Chain", icon: "⛟" }],
      },
      {
        id: "utility",
        label: "Utility",
        items: [{ to: "/app/search", label: "Search", icon: "⌕" }],
      },
    ],
  },
};

interface SidebarProps {
  collapsed: boolean;
  onToggle: () => void;
}

export default function Sidebar({ collapsed, onToggle }: SidebarProps) {
  const { user, role, logout } = useAuth();
  const location = useLocation();
  if (!user) return null;

  const currentRole = (role && GROUPED_NAV_CONFIG[role as Role]) ? (role as Role) : "quality-inspector";
  const navData = GROUPED_NAV_CONFIG[currentRole] || GROUPED_NAV_CONFIG["quality-inspector"];
  const roleColor = getRoleColor(currentRole);

  // Group expansion state
  const [expandedGroups, setExpandedGroups] = useState<Record<string, boolean>>({});

  const isItemActive = (to: string) => {
    if (to === "/app/dashboard") {
      return location.pathname === "/app/dashboard" || location.pathname === "/app";
    }
    return location.pathname === to || location.pathname.startsWith(to + "/");
  };

  // Auto-expand group containing current active route
  useEffect(() => {
    const currentPath = location.pathname;
    setExpandedGroups((prev) => {
      const next = { ...prev };
      navData.groups.forEach((group) => {
        const hasActive = group.items.some((item) =>
          item.to === "/app/dashboard"
            ? (currentPath === "/app/dashboard" || currentPath === "/app")
            : (currentPath === item.to || currentPath.startsWith(item.to + "/"))
        );
        if (hasActive) {
          next[group.id] = true;
        }
      });
      return next;
    });
  }, [location.pathname, currentRole, navData]);

  const toggleGroup = (groupId: string) => {
    setExpandedGroups((prev) => ({
      ...prev,
      [groupId]: !prev[groupId],
    }));
  };

  return (
    <aside
      className="sidebar-panel"
      style={{
        width: collapsed ? 58 : 236,
        minHeight: "100vh",
        background: "var(--sidebar-bg, #0D0D0D)",
        borderRight: "1px solid var(--border-subtle, #2A2A2A)",
        display: "flex",
        flexDirection: "column",
        transition: "width 0.2s ease, background 0.2s ease, border-color 0.2s ease",
        flexShrink: 0,
        position: "relative",
        zIndex: 20,
        boxSizing: "border-box",
      }}
    >
      {/* Logo */}
      <div
        style={{
          padding: "16px 14px 14px",
          borderBottom: "1px solid var(--border-subtle, #2A2A2A)",
          display: "flex",
          alignItems: "center",
          gap: "10px",
        }}
      >
        <div
          style={{
            width: 28,
            height: 28,
            background: "var(--panel-muted, #1c1c1c)",
            border: "1px solid var(--border-strong, #333333)",
            borderRadius: "6px",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            fontWeight: 900,
            fontSize: "0.9rem",
            color: "var(--foreground, #fff)",
            flexShrink: 0,
            boxShadow: "0 1px 3px rgba(0, 0, 0, 0.15)",
          }}
        >
          <BelIconMark size={18} />
        </div>
        {!collapsed && (
          <div>
            <div
              className="font-display"
              style={{
                fontSize: "0.95rem",
                fontWeight: 700,
                color: "var(--foreground, #f5f5f5)",
                letterSpacing: "0.04em",
                lineHeight: 1.1,
              }}
            >
              BEL
            </div>
            <div style={{ fontSize: "0.6rem", color: "var(--muted, #a3a3a3)", letterSpacing: "0.08em", fontWeight: 700 }}>
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
            color: "#64748b",
            cursor: "pointer",
            fontSize: "0.875rem",
            padding: "2px 4px",
            flexShrink: 0,
          }}
          title={collapsed ? "Expand Sidebar" : "Collapse Sidebar"}
        >
          {collapsed ? "›" : "‹"}
        </button>
      </div>

      {/* Nav */}
      <nav style={{ flex: 1, padding: collapsed ? "10px 4px" : "10px 8px", overflowY: "auto" }}>
        {!collapsed && (
          <div
            className="section-label"
            style={{ paddingLeft: 6, marginBottom: 8, marginTop: 4, fontSize: "0.65rem", color: "#475569" }}
          >
            {navData.roleLabel}
          </div>
        )}

        {collapsed ? (
          // Mini / Icon-Only Sidebar Mode
          <div>
            {navData.groups.map((group, gIdx) => (
              <div key={group.id}>
                {gIdx > 0 && <div className="sidebar-nav-divider" />}
                {group.items.map((item) => {
                  const active = isItemActive(item.to);
                  return (
                    <NavLink
                      key={item.to}
                      to={item.to}
                      className={`sidebar-link${active ? " active" : ""}`}
                      title={item.label}
                      style={{ justifyContent: "center", padding: "7px 0", margin: "2px 0" }}
                    >
                      <span style={{ fontSize: "0.9rem" }}>{item.icon}</span>
                    </NavLink>
                  );
                })}
              </div>
            ))}
          </div>
        ) : (
          // Full Grouped Enterprise Mode
          <div style={{ display: "flex", flexDirection: "column", gap: "2px" }}>
            {navData.groups.map((group) => {
              const isCollapsible = group.collapsible && group.items.length > 1;
              const isOpen = isCollapsible ? !!expandedGroups[group.id] : true;
              const hasActiveChild = group.items.some((item) => isItemActive(item.to));

              if (isCollapsible) {
                return (
                  <div key={group.id} className="sidebar-group">
                    <button
                      type="button"
                      className={`sidebar-group-header${hasActiveChild ? " has-active" : ""}`}
                      onClick={() => toggleGroup(group.id)}
                      aria-expanded={isOpen}
                    >
                      <div className="sidebar-group-header-left">
                        {group.icon && <span style={{ fontSize: "0.75rem", opacity: 0.8 }}>{group.icon}</span>}
                        <span>{group.label}</span>
                      </div>
                      <span className="sidebar-group-chevron">
                        {isOpen ? "˅" : "›"}
                      </span>
                    </button>

                    {isOpen && (
                      <div className="sidebar-group-items open">
                        {group.items.map((item) => {
                          const active = isItemActive(item.to);
                          return (
                            <NavLink
                              key={item.to}
                              to={item.to}
                              className={`sidebar-child-link${active ? " active" : ""}`}
                            >
                              <span className="sidebar-child-icon">{item.icon}</span>
                              <span style={{ overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                                {item.label}
                              </span>
                            </NavLink>
                          );
                        })}
                      </div>
                    )}
                  </div>
                );
              }

              // Non-collapsible single-item sections (e.g. Overview, Blockchain, Supply Chain, Utility, Settings)
              return (
                <div key={group.id} className="sidebar-group">
                  {group.items.map((item) => {
                    const active = isItemActive(item.to);
                    return (
                      <NavLink
                        key={item.to}
                        to={item.to}
                        className={`sidebar-link${active ? " active" : ""}`}
                        style={{ padding: "6px 10px" }}
                      >
                        <span style={{ fontSize: "0.85rem", width: 16, textAlign: "center", flexShrink: 0 }}>
                          {item.icon}
                        </span>
                        <span style={{ fontSize: "0.8125rem", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                          {item.label}
                        </span>
                      </NavLink>
                    );
                  })}
                </div>
              );
            })}
          </div>
        )}
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
        className="sidebar-user-section"
        style={{
          padding: collapsed ? "10px 8px" : "10px 10px 14px",
          borderTop: "1px solid var(--border-subtle, #2A2A2A)",
          boxSizing: "border-box",
        }}
      >
        {!collapsed ? (
          <div
            className="sidebar-user-card"
            style={{
              padding: "10px 12px",
              background: "var(--panel-muted, rgba(255, 255, 255, 0.03))",
              border: "1px solid var(--border, rgba(255, 255, 255, 0.08))",
              borderRadius: "10px",
              boxSizing: "border-box",
            }}
          >
            <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: 6 }}>
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
                <div style={{ fontSize: "0.8125rem", fontWeight: 600, color: "var(--foreground, #f5f5f5)", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
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
            <div className="meta-id" style={{ marginBottom: 8, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", fontSize: "0.6875rem" }}>
              {user.actor?.did || "—"}
            </div>
            <button
              onClick={logout}
              className="btn-ghost"
              style={{ width: "100%", justifyContent: "center", padding: "5px", fontSize: "0.75rem", borderRadius: "6px" }}
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
