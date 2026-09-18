import { Link } from "react-router";
import { useState, useEffect } from "react";

export default function PublicNavbar() {
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 20) {
        setScrolled(true);
      } else {
        setScrolled(false);
      }
    };
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <nav
      className={scrolled ? "nav-scrolled" : ""}
      style={{
        position: "sticky",
        top: 0,
        zIndex: 50,
        background: "rgba(2, 8, 23, 0.94)",
        backdropFilter: "blur(12px)",
        borderBottom: "1px solid #152b4a",
        transition: "background 0.3s ease, border-color 0.3s ease, box-shadow 0.3s ease",
      }}
    >
      <div
        style={{
          maxWidth: 1200,
          margin: "0 auto",
          padding: "0 24px",
          height: 62,
          display: "flex",
          alignItems: "center",
          gap: 32,
        }}
      >
        {/* Logo */}
        <Link to="/" style={{ display: "flex", alignItems: "center", gap: 10, textDecoration: "none" }}>
          <div
            className="nav-logo-pulse"
            style={{
              width: 32,
              height: 32,
              background: "linear-gradient(135deg, #2563eb 0%, #1d4ed8 100%)",
              borderRadius: "6px",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontFamily: "'Barlow Condensed', sans-serif",
              fontWeight: 900,
              fontSize: "0.95rem",
              color: "#fff",
              letterSpacing: "-0.03em",
              border: "1px solid rgba(56, 189, 248, 0.4)",
            }}
          >
            NX
          </div>
          <div>
            <div
              className="font-display"
              style={{ fontSize: "0.95rem", fontWeight: 700, color: "#f8fafc", letterSpacing: "0.05em", lineHeight: 1.1 }}
            >
              NOVEXA
            </div>
            <div style={{ fontSize: "0.55rem", color: "#38bdf8", fontWeight: 600, letterSpacing: "0.12em" }}>
              DEFENCE TRUST
            </div>
          </div>
        </Link>

        <div style={{ flex: 1 }} />

        {/* Navigation Links with animated hover underlines */}
        <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
          {["Platform", "Roles", "Blockchain", "Security"].map((item) => (
            <a
              key={item}
              href={`#${item.toLowerCase()}`}
              className="nav-link-animated"
              style={{
                padding: "8px 14px",
                fontSize: "0.8125rem",
                color: "#94a3b8",
                textDecoration: "none",
                borderRadius: "4px",
                fontWeight: 500,
              }}
            >
              {item}
            </a>
          ))}
        </div>

        <Link
          to="/login"
          className="home-primary-btn"
          style={{ padding: "8px 18px", fontSize: "0.8125rem", borderRadius: "5px" }}
        >
          <span>Sign In</span>
          <span className="home-btn-arrow">→</span>
        </Link>
      </div>
    </nav>
  );
}
