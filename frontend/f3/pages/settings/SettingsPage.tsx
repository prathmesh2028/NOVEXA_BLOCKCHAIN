import PageHeader from "../../components/ui/PageHeader";
import { useAuth } from "../../context/AuthContext";
import RoleBadge from "../../components/ui/RoleBadge";

export default function SettingsPage() {
  const { user, role } = useAuth();
  if (!user || !role) return null;

  return (
    <div className="page-fade">
      <PageHeader
        title="Settings"
        subtitle="Profile, security, and notification preferences"
        breadcrumbs={[{ label: "Dashboard", to: "/app/dashboard" }, { label: "Settings" }]}
      />

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 20 }}>
        {/* Profile */}
        <div className="panel" style={{ padding: 24 }}>
          <div className="section-label" style={{ marginBottom: 16 }}>PROFILE</div>
          <div style={{ display: "flex", alignItems: "center", gap: 14, marginBottom: 20 }}>
            <div
              style={{
                width: 48,
                height: 48,
                borderRadius: "50%",
                background: "rgba(37,99,235,0.18)",
                border: "1px solid rgba(37,99,235,0.3)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontSize: "1rem",
                fontWeight: 700,
                color: "#60a5fa",
              }}
            >
              {user.name.split(" ").map((n) => n[0]).join("")}
            </div>
            <div>
              <div style={{ fontSize: "1rem", fontWeight: 600, color: "#e2e8f0" }}>{user.name}</div>
              <div style={{ fontSize: "0.8125rem", color: "#64748b", textTransform: "capitalize" }}>{role.replace('_', ' ')}</div>
            </div>
          </div>
          {[
            { label: "Name", value: user.name },
            { label: "Email", value: user.email },
            { label: "Role", value: role.replace('_', ' ').toUpperCase() },
            { label: "DID", value: user.actor?.did || "—", mono: true },
            { label: "Identity", value: "✓ Verified" },
          ].map((row) => (
            <div key={row.label} style={{ display: "flex", gap: 12, padding: "8px 0", borderBottom: "1px solid #152b4a" }}>
              <span style={{ fontSize: "0.6875rem", color: "#475569", width: 80, flexShrink: 0 }}>{row.label}</span>
              {(row as any).mono ? (
                <span className="meta-id" style={{ color: "#94a3b8" }}>{row.value}</span>
              ) : (
                <span style={{ fontSize: "0.8125rem", color: "#94a3b8" }}>{row.value}</span>
              )}
            </div>
          ))}
        </div>

        {/* Security */}
        <div className="panel" style={{ padding: 24 }}>
          <div className="section-label" style={{ marginBottom: 16 }}>SECURITY</div>
          {[
            { label: "Password", value: "••••••••••", action: "Change" },
            { label: "2FA", value: "Enabled ✓", action: "Manage" },
            { label: "Active sessions", value: "1 session", action: "View" },
          ].map((row) => (
            <div key={row.label} style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "12px 0", borderBottom: "1px solid #152b4a" }}>
              <div>
                <div style={{ fontSize: "0.8125rem", fontWeight: 500, color: "#e2e8f0" }}>{row.label}</div>
                <div style={{ fontSize: "0.75rem", color: "#64748b" }}>{row.value}</div>
              </div>
              <button className="btn-ghost" style={{ fontSize: "0.75rem" }}>{row.action}</button>
            </div>
          ))}
        </div>

        {/* Notifications */}
        <div className="panel" style={{ padding: 24 }}>
          <div className="section-label" style={{ marginBottom: 16 }}>NOTIFICATIONS</div>
          {[
            { label: "Certification updates", enabled: true },
            { label: "System alerts", enabled: true },
            { label: "Evidence integrity events", enabled: true },
            { label: "Blockchain confirmations", enabled: false },
            { label: "Audit events", enabled: false },
          ].map((pref) => (
            <div key={pref.label} style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "10px 0", borderBottom: "1px solid #152b4a" }}>
              <span style={{ fontSize: "0.8125rem", color: "#94a3b8" }}>{pref.label}</span>
              <div
                style={{
                  width: 36,
                  height: 20,
                  background: pref.enabled ? "#2563eb" : "#1e3a60",
                  borderRadius: "10px",
                  cursor: "pointer",
                  position: "relative",
                  transition: "background 0.2s",
                }}
              >
                <div
                  style={{
                    width: 14,
                    height: 14,
                    background: "#fff",
                    borderRadius: "50%",
                    position: "absolute",
                    top: 3,
                    left: pref.enabled ? 19 : 3,
                    transition: "left 0.2s",
                  }}
                />
              </div>
            </div>
          ))}
        </div>

        {/* Wallet */}
        <div className="panel" style={{ padding: 24 }}>
          <div className="section-label" style={{ marginBottom: 16 }}>WALLET</div>
          <div style={{ padding: "12px", background: "rgba(34,197,94,0.06)", border: "1px solid rgba(34,197,94,0.2)", borderRadius: "5px", marginBottom: 14 }}>
            <div style={{ fontSize: "0.75rem", color: "#22c55e", fontWeight: 600, marginBottom: 4 }}>● CONNECTED</div>
            <div className="meta-id" style={{ color: "#94a3b8" }}>0x1F2B...89A3</div>
          </div>
          <div style={{ fontSize: "0.8125rem", color: "#64748b" }}>Network: BEL-TRUST-CHAIN (Synthetic Demo)</div>
        </div>
      </div>
    </div>
  );
}
