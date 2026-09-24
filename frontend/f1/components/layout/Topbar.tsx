import { useState } from "react";
import { Link, useNavigate } from "react-router";
import { getRoleLabel, getRoleColor } from "../../context/RoleContext";
import { useAuth } from "../../context/AuthContext";
import { ConnectWalletButton } from "../../features/wallet/components/ConnectWalletButton";
import ThemeToggle from "../ui/ThemeToggle";

export default function Topbar() {
  const { user, role } = useAuth();
  const [search, setSearch] = useState("");
  const navigate = useNavigate();

  function handleSearch(e: React.FormEvent) {
    e.preventDefault();
    if (search.trim()) {
      navigate(`/app/search?q=${encodeURIComponent(search.trim())}`);
      setSearch("");
    }
  }

  if (!user || !role) return null;
  const roleColor = getRoleColor(role);

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
        zIndex: 10,
        transition: "background 0.2s ease, border-color 0.2s ease",
      }}
    >
      {/* Search */}
      <form onSubmit={handleSearch} style={{ flex: 1, maxWidth: 380 }}>
        <div style={{ position: "relative" }}>
          <span
            style={{
              position: "absolute",
              left: 10,
              top: "50%",
              transform: "translateY(-50%)",
              color: "#64748b",
              display: "flex",
              alignItems: "center",
              pointerEvents: "none",
            }}
          >
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <circle cx="11" cy="11" r="8" />
              <line x1="21" y1="21" x2="16.65" y2="16.65" />
            </svg>
          </span>
          <input
            className="input-field"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search assets, records, certifications…"
            style={{ paddingLeft: 30, fontSize: "0.8125rem", height: 32, padding: "0 12px 0 30px" }}
          />
        </div>
      </form>

      <div style={{ flex: 1 }} />

      {/* Synthetic data notice */}
      <div
        style={{
          padding: "3px 10px",
          background: "rgba(245,158,11,0.1)",
          border: "1px solid rgba(245,158,11,0.2)",
          borderRadius: "4px",
          fontSize: "0.6875rem",
          color: "#f59e0b",
          fontWeight: 600,
          letterSpacing: "0.04em",
          whiteSpace: "nowrap",
        }}
      >
        SYNTHETIC DEMO
      </div>

      {/* Connect Wallet */}
      <ConnectWalletButton expectedChainId={import.meta.env.VITE_BLOCKCHAIN_CHAIN_ID ? parseInt(import.meta.env.VITE_BLOCKCHAIN_CHAIN_ID) : undefined} />

      {/* Theme Toggle */}
      <ThemeToggle />

      {/* Notifications */}
      <button
        className="btn-ghost"
        style={{ position: "relative", padding: "6px 8px", display: "flex", alignItems: "center", justifyContent: "center" }}
        title="Notifications"
      >
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" />
          <path d="M13.73 21a2 2 0 0 1-3.46 0" />
        </svg>
        <span
          style={{
            position: "absolute",
            top: 2,
            right: 2,
            minWidth: 14,
            height: 14,
            background: "#ef4444",
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
          1
        </span>
      </button>

      {/* User chip */}
      <Link
        to="/app/settings"
        style={{
          display: "flex",
          alignItems: "center",
          gap: "7px",
          padding: "4px 10px 4px 6px",
          background: "var(--hover-bg, rgba(30,58,96,0.3))",
          border: "1px solid var(--border, #1e3a60)",
          borderRadius: "20px",
          textDecoration: "none",
          transition: "border-color 0.15s, background 0.15s",
        }}
      >
        <div
          style={{
            width: 22,
            height: 22,
            borderRadius: "50%",
            background: roleColor + "22",
            border: `1px solid ${roleColor}55`,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            fontSize: "0.6rem",
            fontWeight: 700,
            color: roleColor,
          }}
        >
          {user.name.split(" ").map((n) => n[0]).join("")}
        </div>
        <div>
          <div style={{ fontSize: "0.75rem", fontWeight: 600, color: "#94a3b8" }}>{user.name}</div>
          <div style={{ fontSize: "0.625rem", color: roleColor, fontWeight: 600, lineHeight: 1 }}>
            {getRoleLabel(role)}
          </div>
        </div>
      </Link>
    </div>
  );
}
