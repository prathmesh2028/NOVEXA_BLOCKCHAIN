import { Link } from "react-router";
import type { ReactNode } from "react";

interface Crumb { label: string; to?: string }

interface PageHeaderProps {
  title: string;
  subtitle?: string;
  breadcrumbs?: Crumb[];
  actions?: ReactNode;
  badge?: ReactNode;
}

export default function PageHeader({ title, subtitle, breadcrumbs, actions, badge }: PageHeaderProps) {
  return (
    <div style={{ marginBottom: "28px" }} className="stagger-in-1">
      {breadcrumbs && breadcrumbs.length > 0 && (
        <div style={{ display: "flex", alignItems: "center", gap: "6px", marginBottom: "12px" }}>
          {breadcrumbs.map((c, i) => (
            <span key={i} style={{ display: "flex", alignItems: "center", gap: "6px" }}>
              {i > 0 && <span style={{ color: "var(--border, #1e3a60)", fontSize: "0.75rem" }}>›</span>}
              {c.to ? (
                <Link
                  to={c.to}
                  style={{ fontSize: "0.75rem", color: "var(--muted, #64748b)", textDecoration: "none" }}
                  className="hover:text-[var(--foreground,#94a3b8)]"
                >
                  {c.label}
                </Link>
              ) : (
                <span style={{ fontSize: "0.75rem", color: "var(--foreground, #94a3b8)", fontWeight: 500 }}>{c.label}</span>
              )}
            </span>
          ))}
        </div>
      )}
      <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: "16px" }}>
        <div>
          <div style={{ display: "flex", alignItems: "center", gap: "12px", flexWrap: "wrap" }}>
            <h1
              className="font-display"
              style={{ fontSize: "1.875rem", fontWeight: 700, color: "var(--foreground, #e2e8f0)", margin: 0, letterSpacing: "-0.01em" }}
            >
              {title}
            </h1>
            {badge}
          </div>
          {subtitle && (
            <p style={{ margin: "6px 0 0", fontSize: "0.875rem", color: "var(--muted, #64748b)", lineHeight: 1.5 }}>
              {subtitle}
            </p>
          )}
        </div>
        {actions && (
          <div style={{ display: "flex", alignItems: "center", gap: "8px", flexShrink: 0 }}>
            {actions}
          </div>
        )}
      </div>
    </div>
  );
}
