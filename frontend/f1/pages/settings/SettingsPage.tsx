import { useState } from "react";
import PageHeader from "../../components/ui/PageHeader";
import { useAuth } from "../../context/AuthContext";
import RoleBadge from "../../components/ui/RoleBadge";
import { authService } from "../../services/auth";

export default function SettingsPage() {
  const { user, role } = useAuth();
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [passwordStatus, setPasswordStatus] = useState<{ type: "success" | "error"; message: string } | null>(null);
  const [notifications, setNotifications] = useState<Record<string, boolean>>({
    "Certification updates": true,
    "System alerts": true,
    "Evidence integrity events": true,
    "Blockchain confirmations": false,
    "Audit events": false,
  });

  const toggleNotification = (key: string) => {
    setNotifications((prev) => ({
      ...prev,
      [key]: !prev[key],
    }));
  };

  if (!user || !role) return null;

  const handlePasswordSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setPasswordStatus(null);
    if (!currentPassword || !newPassword) {
      setPasswordStatus({ type: "error", message: "Please fill in all fields" });
      return;
    }
    if (newPassword.length < 8) {
      setPasswordStatus({ type: "error", message: "New password must be at least 8 characters" });
      return;
    }
    if (newPassword !== confirmPassword) {
      setPasswordStatus({ type: "error", message: "New passwords do not match" });
      return;
    }

    setIsSubmitting(true);
    try {
      const res = await authService.changePassword(currentPassword, newPassword);
      setPasswordStatus({ type: "success", message: res.message || "Password updated successfully" });
      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
      setTimeout(() => {
        setShowPasswordModal(false);
        setPasswordStatus(null);
      }, 1500);
    } catch (err: any) {
      setPasswordStatus({
        type: "error",
        message: err.data?.message || err.message || "Failed to update password",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

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
            { label: "Password", value: "••••••••••", action: "Change", onClick: () => setShowPasswordModal(true) },
            { label: "2FA", value: "Enabled ✓", action: "Manage" },
            { label: "Active sessions", value: "1 session", action: "View" },
          ].map((row) => (
            <div key={row.label} style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "12px 0", borderBottom: "1px solid #152b4a" }}>
              <div>
                <div style={{ fontSize: "0.8125rem", fontWeight: 500, color: "#e2e8f0" }}>{row.label}</div>
                <div style={{ fontSize: "0.75rem", color: "#64748b" }}>{row.value}</div>
              </div>
              <button
                className="btn-ghost"
                style={{ fontSize: "0.75rem" }}
                onClick={(row as any).onClick}
              >
                {row.action}
              </button>
            </div>
          ))}
        </div>

        {/* Notifications */}
        <div className="panel" style={{ padding: 24 }}>
          <div className="section-label" style={{ marginBottom: 16 }}>NOTIFICATIONS</div>
          {Object.entries(notifications).map(([label, enabled]) => (
            <div key={label} style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "10px 0", borderBottom: "1px solid #152b4a" }}>
              <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                <span style={{ fontSize: "0.8125rem", color: enabled ? "#e2e8f0" : "#94a3b8" }}>{label}</span>
                <span style={{ fontSize: "0.6875rem", fontWeight: 600, color: enabled ? "#22c55e" : "#64748b" }}>
                  {enabled ? "ON" : "OFF"}
                </span>
              </div>
              <button
                type="button"
                role="switch"
                aria-checked={enabled}
                onClick={() => toggleNotification(label)}
                style={{
                  width: 40,
                  height: 22,
                  background: enabled ? "#2563eb" : "#1e3a60",
                  borderRadius: "11px",
                  cursor: "pointer",
                  position: "relative",
                  transition: "background 0.2s ease",
                  border: "none",
                  padding: 0,
                  display: "inline-block",
                  outline: "none",
                }}
              >
                <div
                  style={{
                    width: 16,
                    height: 16,
                    background: "#fff",
                    borderRadius: "50%",
                    position: "absolute",
                    top: 3,
                    left: enabled ? 21 : 3,
                    transition: "left 0.2s ease",
                    boxShadow: "0 1px 3px rgba(0,0,0,0.3)",
                  }}
                />
              </button>
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

      {/* Change Password Modal */}
      {showPasswordModal && (
        <div
          style={{
            position: "fixed",
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: "rgba(3, 7, 18, 0.75)",
            backdropFilter: "blur(4px)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            zIndex: 1000,
          }}
        >
          <div
            className="panel"
            style={{
              width: "100%",
              maxWidth: 420,
              padding: 24,
              boxShadow: "0 20px 25px -5px rgba(0, 0, 0, 0.5)",
              border: "1px solid #1e3a60",
            }}
          >
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 18 }}>
              <div style={{ fontSize: "1rem", fontWeight: 600, color: "#e2e8f0" }}>Change Password</div>
              <button
                onClick={() => {
                  setShowPasswordModal(false);
                  setPasswordStatus(null);
                }}
                style={{ background: "none", border: "none", color: "#64748b", cursor: "pointer", fontSize: "1.2rem" }}
              >
                ✕
              </button>
            </div>

            <form onSubmit={handlePasswordSubmit} style={{ display: "flex", flexDirection: "column", gap: 14 }}>
              {passwordStatus && (
                <div
                  style={{
                    padding: "8px 12px",
                    borderRadius: 4,
                    fontSize: "0.8125rem",
                    background: passwordStatus.type === "success" ? "rgba(34,197,94,0.15)" : "rgba(239,68,68,0.15)",
                    border: `1px solid ${passwordStatus.type === "success" ? "rgba(34,197,94,0.3)" : "rgba(239,68,68,0.3)"}`,
                    color: passwordStatus.type === "success" ? "#22c55e" : "#ef4444",
                  }}
                >
                  {passwordStatus.message}
                </div>
              )}

              <div>
                <label style={{ display: "block", fontSize: "0.75rem", color: "#94a3b8", marginBottom: 4 }}>
                  Current Password
                </label>
                <input
                  type="password"
                  className="input"
                  style={{ width: "100%", padding: "8px 12px", background: "#0c1828", border: "1px solid #1e3a60", borderRadius: 4, color: "#e2e8f0" }}
                  value={currentPassword}
                  onChange={(e) => setCurrentPassword(e.target.value)}
                  placeholder="Enter current password"
                  required
                />
              </div>

              <div>
                <label style={{ display: "block", fontSize: "0.75rem", color: "#94a3b8", marginBottom: 4 }}>
                  New Password (min 8 characters)
                </label>
                <input
                  type="password"
                  className="input"
                  style={{ width: "100%", padding: "8px 12px", background: "#0c1828", border: "1px solid #1e3a60", borderRadius: 4, color: "#e2e8f0" }}
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  placeholder="Enter new password"
                  required
                  minLength={8}
                />
              </div>

              <div>
                <label style={{ display: "block", fontSize: "0.75rem", color: "#94a3b8", marginBottom: 4 }}>
                  Confirm New Password
                </label>
                <input
                  type="password"
                  className="input"
                  style={{ width: "100%", padding: "8px 12px", background: "#0c1828", border: "1px solid #1e3a60", borderRadius: 4, color: "#e2e8f0" }}
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="Confirm new password"
                  required
                />
              </div>

              <div style={{ display: "flex", justifyContent: "flex-end", gap: 8, marginTop: 8 }}>
                <button
                  type="button"
                  className="btn-ghost"
                  onClick={() => {
                    setShowPasswordModal(false);
                    setPasswordStatus(null);
                  }}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="btn-primary"
                  disabled={isSubmitting}
                >
                  {isSubmitting ? "Updating..." : "Update Password"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
