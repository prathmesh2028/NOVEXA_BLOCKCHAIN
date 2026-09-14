import { Link } from "react-router";
import { useState } from "react";

export default function PublicNavbar() {
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <nav
      style={{
        position: "sticky",
        top: 0,
        zIndex: 50,
        background: "rgba(7,15,29,0.92)",
        backdropFilter: "blur(12px)",
        borderBottom: "1px solid #152b4a",
      }}
    >
      <div
        style={{
          maxWidth: 1200,
          margin: "0 auto",
          padding: "0 24px",
          height: 60,
          display: "flex",
          alignItems: "center",
          gap: 32,
        }}
      >
        {/* Logo */}
        <Link to="/" style={{ display: "flex", alignItems: "center", gap: 10, textDecoration: "none" }}>
          <div
            style={{
              width: 32,
              height: 32,
              background: "#2563eb",
              borderRadius: "6px",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontFamily: "'Barlow Condensed', sans-serif",
              fontWeight: 900,
              fontSize: "0.95rem",
              color: "#fff",
              letterSpacing: "-0.03em",
            }}
          >
            BT
          </div>
          <div>
            <div
              className="font-display"
              style={{ fontSize: "0.9rem", fontWeight: 700, color: "#e2e8f0", letterSpacing: "0.05em", lineHeight: 1.1 }}
            >
              BEL-DEFENCE
            </div>
            <div style={{ fontSize: "0.55rem", color: "#475569", fontWeight: 600, letterSpacing: "0.1em" }}>
              ASSET TRUST
            </div>
          </div>
        </Link>

        <div style={{ flex: 1 }} />

        {/* Links */}
        <div style={{ display: "flex", alignItems: "center", gap: 4 }}>
          {["Platform", "Roles", "Blockchain", "Security"].map((item) => (
            <a
              key={item}
              href={`#${item.toLowerCase()}`}
              style={{
                padding: "6px 12px",
                fontSize: "0.8125rem",
                color: "#64748b",
                textDecoration: "none",
                borderRadius: "4px",
                transition: "color 0.15s",
              }}
              className="hover:text-[#94a3b8]"
            >
              {item}
            </a>
          ))}
        </div>

        <Link to="/login" className="btn-primary" style={{ padding: "7px 16px", fontSize: "0.8125rem" }}>
          Sign In →
        </Link>
      </div>
    </nav>
  );
}
