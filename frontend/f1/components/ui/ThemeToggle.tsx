import { useTheme } from "../../context/ThemeContext";

interface ThemeToggleProps {
  variant?: "compact" | "pill";
  className?: string;
}

export default function ThemeToggle({ variant = "compact", className = "" }: ThemeToggleProps) {
  const { theme, toggleTheme } = useTheme();
  const isDark = theme === "dark";

  return (
    <button
      type="button"
      onClick={toggleTheme}
      className={`theme-toggle-btn ${className}`}
      aria-label={isDark ? "Switch to light theme" : "Switch to dark theme"}
      title={isDark ? "Switch to light theme (current: Dark)" : "Switch to dark theme (current: Light)"}
      style={{
        display: "inline-flex",
        alignItems: "center",
        justifyContent: "center",
        gap: variant === "pill" ? 7 : 0,
        padding: variant === "pill" ? "5px 12px" : "6px 10px",
        background: isDark ? "rgba(30, 58, 96, 0.35)" : "rgba(226, 232, 240, 0.8)",
        border: `1px solid ${isDark ? "#1e3a60" : "#cbd5e1"}`,
        borderRadius: variant === "pill" ? 20 : 6,
        color: isDark ? "#fbbf24" : "#2563eb",
        fontSize: "0.8125rem",
        fontWeight: 600,
        cursor: "pointer",
        transition: "all 0.18s cubic-bezier(0.16, 1, 0.3, 1)",
        outline: "none",
        flexShrink: 0,
      }}
    >
      {/* Icon */}
      <span
        style={{
          display: "inline-flex",
          alignItems: "center",
          justifyContent: "center",
          fontSize: "0.95rem",
          lineHeight: 1,
          transform: isDark ? "rotate(0deg)" : "rotate(360deg)",
          transition: "transform 0.35s cubic-bezier(0.34, 1.56, 0.64, 1)",
        }}
        aria-hidden="true"
      >
        {isDark ? (
          /* Sun icon in Dark Mode prompting switch to Light */
          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="12" cy="12" r="4" />
            <path d="M12 2v2" />
            <path d="M12 20v2" />
            <path d="m4.93 4.93 1.41 1.41" />
            <path d="m17.66 17.66 1.41 1.41" />
            <path d="M2 12h2" />
            <path d="M20 12h2" />
            <path d="m6.34 17.66-1.41 1.41" />
            <path d="m19.07 4.93-1.41 1.41" />
          </svg>
        ) : (
          /* Moon icon in Light Mode prompting switch to Dark */
          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M12 3a6 6 0 0 0 9 9 9 9 0 1 1-9-9Z" />
          </svg>
        )}
      </span>

      {variant === "pill" && (
        <span
          style={{
            fontSize: "0.75rem",
            letterSpacing: "0.04em",
            textTransform: "uppercase",
            color: isDark ? "#e2e8f0" : "#0f172a",
          }}
        >
          {isDark ? "Light" : "Dark"}
        </span>
      )}
    </button>
  );
}
