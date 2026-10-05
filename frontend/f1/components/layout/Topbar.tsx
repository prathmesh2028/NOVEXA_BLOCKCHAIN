import { useState, useRef, useEffect } from "react";
import { Link, useNavigate, useLocation } from "react-router";
import { getRoleLabel, getRoleColor } from "../../context/RoleContext";
import { useAuth } from "../../context/AuthContext";
import { ConnectWalletButton } from "../../features/wallet/components/ConnectWalletButton";
import ThemeToggle from "../ui/ThemeToggle";
import BelIconMark from "../ui/BelIconMark";

export default function Topbar() {
  const { user, role, logout } = useAuth();
  const [search, setSearch] = useState("");
  const [showNotifications, setShowNotifications] = useState(false);
  const [unreadCount, setUnreadCount] = useState(1);
  const [showProfileDropdown, setShowProfileDropdown] = useState(false);

  const notifRef = useRef<HTMLDivElement>(null);
  const profileRef = useRef<HTMLDivElement>(null);

  const navigate = useNavigate();
  const location = useLocation();
  const isDashboard = location.pathname === "/app/dashboard" || location.pathname === "/app";

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (notifRef.current && !notifRef.current.contains(e.target as Node)) {
        setShowNotifications(false);
      }
      if (profileRef.current && !profileRef.current.contains(e.target as Node)) {
        setShowProfileDropdown(false);
      }
    }
    function handleKeyDown(e: KeyboardEvent) {
      if (e.key === "Escape") {
        setShowNotifications(false);
        setShowProfileDropdown(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    document.addEventListener("keydown", handleKeyDown);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, []);

  function handleSearch(e: React.FormEvent) {
    e.preventDefault();
    if (search.trim()) {
      navigate(`/app/search?q=${encodeURIComponent(search.trim())}`);
      setSearch("");
    }
  }

  if (!user || !role) return null;
  const roleColor = getRoleColor(role);

  const notificationsList = unreadCount > 0 ? [
    {
      id: "notif-1",
      title: "Cryptographic Audit Complete",
      desc: "All defence asset hashes verified against on-chain anchor.",
      time: "5m ago",
      type: "success",
    },
    {
      id: "notif-2",
      title: "Contract Telemetry",
      desc: "Autonomous SLA engine active on BEL-TRUST-CHAIN.",
      time: "20m ago",
      type: "info",
    },
  ] : [];

  return (
    <div
      style={{
        height: 52,
        background: "var(--topbar-bg, #08131f)",
        borderBottom: "1px solid var(--border-subtle, #152b4a)",
        display: "flex",
        alignItems: "center",
        padding: "0 20px",
        gap: "12px",
        position: "sticky",
        top: 0,
        zIndex: 30,
        transition: "background 0.2s ease, border-color 0.2s ease",
      }}
    >
      {/* Search */}
      <form onSubmit={handleSearch} style={{ flex: 1, maxWidth: 400 }}>
        <div style={{ position: "relative", display: "flex", alignItems: "center" }}>
          <span
            style={{
              position: "absolute",
              left: 12,
              top: "50%",
              transform: "translateY(-50%)",
              color: "var(--subtle-text, #64748b)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              width: 16,
              height: 16,
              pointerEvents: "none",
              zIndex: 2,
            }}
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="11" cy="11" r="8" />
              <line x1="21" y1="21" x2="16.65" y2="16.65" />
            </svg>
          </span>
          <input
            className="input-field topbar-search-input"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search assets, records, certifications…"
            style={{
              paddingLeft: "38px !important",
              fontSize: "0.8125rem",
              height: 34,
              padding: "0 14px 0 38px",
              width: "100%",
            }}
          />
        </div>
      </form>

      <div style={{ flex: 1 }} />

      {/* Synthetic data notice */}
      <div
        style={{
          padding: "4px 10px",
          background: "var(--panel-muted, #181818)",
          border: "1px solid var(--border, #303030)",
          borderRadius: "6px",
          fontSize: "0.6875rem",
          color: "var(--muted, #a3a3a3)",
          fontWeight: 600,
          letterSpacing: "0.04em",
          whiteSpace: "nowrap",
          transition: "all 0.2s ease",
        }}
      >
        SYNTHETIC PILOT DATA
      </div>

      {/* Connect Wallet */}
      <ConnectWalletButton
        expectedChainId={import.meta.env.VITE_BLOCKCHAIN_CHAIN_ID ? parseInt(import.meta.env.VITE_BLOCKCHAIN_CHAIN_ID) : undefined}
        variant="blue"
      />

      {/* Theme Toggle */}
      <ThemeToggle />

      {/* Notifications Button & Popover */}
      <div style={{ position: "relative" }} ref={notifRef}>
        <button
          className="btn-ghost"
          onClick={() => {
            setShowNotifications((v) => !v);
            setShowProfileDropdown(false);
          }}
          style={{
            position: "relative",
            padding: "6px 8px",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            borderRadius: "6px",
            background: showNotifications ? "rgba(37, 99, 235, 0.18)" : "transparent",
            color: showNotifications ? "#38bdf8" : "inherit",
            border: showNotifications ? "1px solid rgba(56, 189, 248, 0.4)" : "1px solid transparent",
            transition: "all 0.18s ease",
          }}
          title="Notifications"
          aria-label="View system notifications"
          aria-expanded={showNotifications}
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" />
            <path d="M13.73 21a2 2 0 0 1-3.46 0" />
          </svg>
          {unreadCount > 0 && (
            <span
              style={{
                position: "absolute",
                top: 2,
                right: 2,
                minWidth: 14,
                height: 14,
                background: "#2563eb",
                boxShadow: "0 0 8px rgba(37, 99, 235, 0.6)",
                borderRadius: "7px",
                fontSize: "0.55rem",
                fontWeight: 700,
                color: "#ffffff",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                padding: "0 2px",
              }}
            >
              {unreadCount}
            </span>
          )}
        </button>

        {/* Notifications Popover Panel */}
        {showNotifications && (
          <div
            style={{
              position: "absolute",
              top: "calc(100% + 8px)",
              right: 0,
              width: 330,
              background: "var(--card, #181818)",
              border: "1px solid var(--border, #303030)",
              borderRadius: "10px",
              boxShadow: "0 12px 32px rgba(0,0,0,0.25)",
              padding: "12px",
              zIndex: 100,
              backdropFilter: "blur(12px)",
            }}
          >
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 10, paddingBottom: 8, borderBottom: "1px solid var(--border-subtle, rgba(255,255,255,0.08))" }}>
              <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                <span style={{ width: 6, height: 6, borderRadius: "50%", background: "#38bdf8", boxShadow: "0 0 6px #38bdf8" }} />
                <span style={{ fontFamily: "'Barlow Condensed', sans-serif", fontSize: "0.85rem", fontWeight: 700, letterSpacing: "0.06em", color: "var(--foreground, #e2e8f0)", textTransform: "uppercase" }}>
                  SYSTEM NOTIFICATIONS
                </span>
              </div>
              {unreadCount > 0 && (
                <button
                  onClick={() => setUnreadCount(0)}
                  style={{
                    background: "none",
                    border: "none",
                    color: "var(--primary, #38bdf8)",
                    fontSize: "0.68rem",
                    cursor: "pointer",
                    fontWeight: 600,
                    padding: "2px 4px",
                  }}
                >
                  Mark all read
                </button>
              )}
            </div>

            {notificationsList.length === 0 ? (
              <div style={{ padding: "20px 0", textAlign: "center", color: "var(--muted, #64748b)", fontSize: "0.78rem" }}>
                No new notifications
              </div>
            ) : (
              <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                {notificationsList.map((n) => (
                  <div
                    key={n.id}
                    style={{
                      padding: "8px 10px",
                      background: "var(--panel-muted, #202020)",
                      border: "1px solid var(--border, #2e2e2e)",
                      borderRadius: "6px",
                      display: "flex",
                      flexDirection: "column",
                      gap: 3,
                    }}
                  >
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                      <span style={{ fontSize: "0.75rem", fontWeight: 600, color: "var(--foreground, #f5f5f5)" }}>{n.title}</span>
                      <span style={{ fontSize: "0.62rem", color: "var(--subtle-text, #737373)" }}>{n.time}</span>
                    </div>
                    <span style={{ fontSize: "0.7rem", color: "var(--muted, #a3a3a3)", lineHeight: 1.35 }}>{n.desc}</span>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>

      {/* User / Profile Chip */}
      <div style={{ position: "relative" }} ref={profileRef}>
        <button
          onClick={() => {
            setShowProfileDropdown((v) => !v);
            setShowNotifications(false);
          }}
          style={{
            display: "flex",
            alignItems: "center",
            gap: "8px",
            padding: "4px 10px 4px 6px",
            background: showProfileDropdown
              ? "rgba(37, 99, 235, 0.22)"
              : "var(--hover-bg, rgba(30,58,96,0.3))",
            border: showProfileDropdown
              ? "1px solid rgba(56, 189, 248, 0.55)"
              : "1px solid var(--border, #1e3a60)",
            borderRadius: "20px",
            cursor: "pointer",
            transition: "all 0.2s ease",
            boxShadow: showProfileDropdown ? "0 0 12px rgba(56, 189, 248, 0.2)" : "none",
          }}
          aria-expanded={showProfileDropdown}
          aria-label="User profile settings and sign out"
        >
          {/* Avatar with BEL badge */}
          <div style={{ position: "relative" }}>
            <div
              style={{
                width: 24,
                height: 24,
                borderRadius: "50%",
                background: "linear-gradient(135deg, rgba(37,99,235,0.4) 0%, rgba(6,182,212,0.3) 100%)",
                border: `1.5px solid ${roleColor}`,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontSize: "0.62rem",
                fontWeight: 700,
                color: "#ffffff",
              }}
            >
              {user.name.split(" ").map((n) => n[0]).join("")}
            </div>
            {/* Small BEL indicator badge */}
            <div
              style={{
                position: "absolute",
                bottom: -2,
                right: -2,
                width: 11,
                height: 11,
                borderRadius: "50%",
                background: "#08131f",
                border: "1px solid #38bdf8",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
              title="BEL Defence Trust"
            >
              <BelIconMark size={7} />
            </div>
          </div>

          <div style={{ textAlign: "left" }}>
            <div style={{ fontSize: "0.76rem", fontWeight: 700, color: "var(--foreground, #e2e8f0)", lineHeight: 1.1 }}>
              {user.name}
            </div>
            <div style={{ fontSize: "0.62rem", color: roleColor, fontWeight: 600, letterSpacing: "0.02em" }}>
              {getRoleLabel(role)}
            </div>
          </div>

          <svg
            width="11"
            height="11"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2.5"
            style={{
              color: "#64748b",
              transform: showProfileDropdown ? "rotate(180deg)" : "rotate(0deg)",
              transition: "transform 0.2s ease",
            }}
          >
            <polyline points="6 9 12 15 18 9" />
          </svg>
        </button>

        {/* Profile Dropdown */}
        {showProfileDropdown && (
          <div
            style={{
              position: "absolute",
              top: "calc(100% + 8px)",
              right: 0,
              width: 240,
              background: "var(--card, #181818)",
              border: "1px solid var(--border, #303030)",
              borderRadius: "10px",
              boxShadow: "0 12px 32px rgba(0,0,0,0.25)",
              padding: "12px",
              zIndex: 100,
              backdropFilter: "blur(12px)",
            }}
          >
            <div style={{ display: "flex", alignItems: "center", gap: 10, paddingBottom: 10, borderBottom: "1px solid var(--border-subtle, rgba(255,255,255,0.08))" }}>
              <div
                style={{
                  width: 32,
                  height: 32,
                  borderRadius: "50%",
                  background: "linear-gradient(135deg, #1d4ed8 0%, #0284c7 100%)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  color: "#fff",
                  fontWeight: 700,
                  fontSize: "0.8rem",
                }}
              >
                {user.name.split(" ").map((n) => n[0]).join("")}
              </div>
              <div>
                <div style={{ fontSize: "0.82rem", fontWeight: 700, color: "var(--foreground, #e2e8f0)" }}>{user.name}</div>
                <div style={{ fontSize: "0.68rem", color: roleColor, fontWeight: 600 }}>{getRoleLabel(role)}</div>
              </div>
            </div>

            <div style={{ padding: "8px 0" }}>
              <div style={{ fontSize: "0.65rem", color: "var(--subtle-text, #64748b)", fontFamily: "'JetBrains Mono', monospace", marginBottom: 6 }}>
                DID: did:bel:{user.email.split("@")[0]}
              </div>
              <Link
                to="/app/settings"
                onClick={() => setShowProfileDropdown(false)}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 8,
                  padding: "6px 8px",
                  borderRadius: "6px",
                  fontSize: "0.78rem",
                  color: "var(--foreground, #e2e8f0)",
                  textDecoration: "none",
                  transition: "background 0.15s ease",
                }}
              >
                <span>⚙</span> Account & Security
              </Link>
            </div>

            <div style={{ paddingTop: 8, borderTop: "1px solid var(--border-subtle, rgba(255,255,255,0.08))" }}>
              <button
                onClick={() => {
                  setShowProfileDropdown(false);
                  logout();
                }}
                style={{
                  width: "100%",
                  display: "flex",
                  alignItems: "center",
                  gap: 8,
                  padding: "6px 8px",
                  borderRadius: "6px",
                  fontSize: "0.78rem",
                  color: "#ef4444",
                  background: "none",
                  border: "none",
                  cursor: "pointer",
                  textAlign: "left",
                  transition: "background 0.15s ease",
                }}
              >
                <span>⎋</span> Sign Out
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
