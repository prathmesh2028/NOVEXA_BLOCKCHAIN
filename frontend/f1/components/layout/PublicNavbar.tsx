import { Link } from "react-router";
import { useState, useEffect } from "react";
import ThemeToggle from "../ui/ThemeToggle";

export default function PublicNavbar() {
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 12);
    };
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

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
        {/* LEFT: BEL DEFENCE TRUST Logo */}
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
              BEL
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

        {/* RIGHT: Light / Dark Theme Toggle Only */}
        <div style={{ display: "flex", alignItems: "center", gap: 10, flexShrink: 0 }}>
          <ThemeToggle />
        </div>
      </div>
    </nav>
  );
}
