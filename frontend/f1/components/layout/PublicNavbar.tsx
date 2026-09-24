import { Link } from "react-router";
import { useState, useEffect } from "react";
import ThemeToggle from "../ui/ThemeToggle";
import { useAuth } from "../../context/AuthContext";
import { getRoleLabel, getRoleColor } from "../../context/RoleContext";

export default function PublicNavbar() {
  const [scrolled, setScrolled] = useState(false);
  const { user, role } = useAuth();

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 12);
    };
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const displayUser = user || {
    name: "Arjun Mehta",
    email: "a.mehta@bel-defence.in",
  };
  const displayRole = role || "system-admin";
  const roleColor = getRoleColor(displayRole as any);

  const NAV_ITEMS = [
    { label: "Dashboard", to: "/app/dashboard" },
    { label: "Assets", to: "/app/assets" },
    { label: "Certifications", to: "/app/certifications" },
    { label: "Blockchain", to: "/app/blockchain" },
    { label: "System Activity", to: "/app/system-activity" },
    { label: "Supply Chain", to: "/app/supply-chain" },
    { label: "Settings", to: "/app/settings" },
  ];

  return (
    <nav
      className={`public-navbar ${scrolled ? "nav-scrolled" : ""}`}
      style={{
        position: "sticky",
        top: 0,
        zIndex: 50,
        background: "var(--topbar-bg, #ffffff)",
        backdropFilter: "blur(12px)",
        borderBottom: "1px solid var(--border-subtle, #e2e8f0)",
        boxShadow: "0 1px 3px rgba(0, 0, 0, 0.04)",
        transition: "background 0.25s ease, border-color 0.25s ease, box-shadow 0.25s ease",
      }}
    >
      <div
        style={{
          width: "100%",
          padding: "0 24px",
          height: 52,
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          gap: 16,
        }}
      >
        {/* LEFT: NOVEXA Logo */}
        <Link to="/" style={{ display: "flex", alignItems: "center", gap: 10, textDecoration: "none", flexShrink: 0 }}>
          <div
            className="navbar-logo-icon"
            style={{
              width: 28,
              height: 28,
              background: "linear-gradient(135deg, #2563eb 0%, #1d4ed8 100%)",
              borderRadius: "5px",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontWeight: 900,
              fontSize: "0.85rem",
              color: "#ffffff",
              letterSpacing: "-0.04em",
              fontFamily: "'Barlow Condensed', sans-serif",
              boxShadow: "0 2px 8px rgba(37, 99, 235, 0.35)",
              flexShrink: 0,
            }}
          >
            NX
          </div>
          <div style={{ display: "flex", flexDirection: "column", lineHeight: 1 }}>
            <span
              className="font-display"
              style={{
                fontSize: "0.95rem",
                fontWeight: 700,
                color: "var(--foreground, #0f172a)",
                letterSpacing: "0.04em",
              }}
            >
              NOVEXA
            </span>
            <span
              style={{
                fontSize: "0.55rem",
                color: "#2563eb",
                letterSpacing: "0.1em",
                fontWeight: 700,
                marginTop: 2,
              }}
            >
              DEFENCE TRUST
            </span>
          </div>
        </Link>

        {/* CENTER: Navigation Links */}
        <div
          className="navbar-center-links"
          style={{
            display: "flex",
            alignItems: "center",
            gap: 2,
            overflowX: "auto",
          }}
        >
          {NAV_ITEMS.map((item) => (
            <Link
              key={item.label}
              to={item.to}
              className="nav-link-item"
              style={{
                padding: "6px 12px",
                fontSize: "0.8125rem",
                color: "var(--muted-foreground, #475569)",
                textDecoration: "none",
                borderRadius: "4px",
                fontWeight: 500,
                whiteSpace: "nowrap",
                transition: "color 0.15s ease, background 0.15s ease",
              }}
            >
              {item.label}
            </Link>
          ))}
        </div>

        {/* RIGHT: Search, Theme Toggle, Notifications, User Profile */}
        <div style={{ display: "flex", alignItems: "center", gap: 10, flexShrink: 0 }}>
          {/* Quick Search */}
          <Link
            to="/app/search"
            className="btn-ghost"
            style={{
              padding: "6px 8px",
              color: "var(--muted, #64748b)",
              fontSize: "0.875rem",
              borderRadius: "5px",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
            title="Search Assets, Certs & Blockchain"
            aria-label="Search"
          >
            ◎
          </Link>

          {/* Theme Toggle */}
          <ThemeToggle />

          {/* Notifications with indicator */}
          <Link
            to="/app/dashboard"
            className="btn-ghost"
            style={{
              position: "relative",
              padding: "6px 8px",
              color: "var(--muted, #64748b)",
              fontSize: "0.875rem",
              borderRadius: "5px",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
            title="System Alerts & Notifications"
            aria-label="Notifications"
          >
            ◫
            <span
              style={{
                position: "absolute",
                top: 4,
                right: 4,
                width: 6,
                height: 6,
                background: "#ef4444",
                borderRadius: "50%",
              }}
            />
          </Link>

          {/* Enterprise User Avatar Chip */}
          <Link
            to={user ? "/app/settings" : "/login"}
            style={{
              display: "flex",
              alignItems: "center",
              gap: 8,
              padding: "3px 10px 3px 4px",
              background: "var(--hover-bg, rgba(226, 232, 240, 0.6))",
              border: "1px solid var(--border, #cbd5e1)",
              borderRadius: "20px",
              textDecoration: "none",
              transition: "border-color 0.15s ease, background 0.15s ease",
            }}
            title={user ? `${displayUser.name} (${getRoleLabel(displayRole as any)})` : "Sign In to NOVEXA Platform"}
          >
            <div
              style={{
                width: 24,
                height: 24,
                borderRadius: "50%",
                background: `${roleColor}22`,
                border: `1px solid ${roleColor}55`,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontSize: "0.625rem",
                fontWeight: 700,
                color: roleColor,
                flexShrink: 0,
              }}
            >
              {displayUser.name
                .split(" ")
                .map((n) => n[0])
                .join("")}
            </div>
            <div style={{ display: "flex", flexDirection: "column", lineHeight: 1.1 }}>
              <span
                style={{
                  fontSize: "0.75rem",
                  fontWeight: 600,
                  color: "var(--foreground, #0f172a)",
                  whiteSpace: "nowrap",
                }}
              >
                {displayUser.name}
              </span>
              <span
                style={{
                  fontSize: "0.6rem",
                  color: roleColor,
                  fontWeight: 600,
                }}
              >
                {getRoleLabel(displayRole as any)}
              </span>
            </div>
            <span style={{ fontSize: "0.6rem", color: "var(--muted, #64748b)", marginLeft: 2 }}>▼</span>
          </Link>
        </div>
      </div>
    </nav>
  );
}
