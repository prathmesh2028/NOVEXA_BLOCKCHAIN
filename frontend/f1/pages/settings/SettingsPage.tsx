import { useState } from "react";
import PageHeader from "../../components/ui/PageHeader";
import { useAuth } from "../../context/AuthContext";
import RoleBadge from "../../components/ui/RoleBadge";
import { authService } from "../../services/auth";
import "./SettingsPage.css";

function ToggleSwitch({ enabled, onChange, label }: { enabled: boolean; onChange: () => void; label: string }) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={enabled}
      aria-label={label}
      onClick={onChange}
      className={`settings-toggle-btn ${enabled ? "on" : "off"}`}
    >
      <div className={`settings-toggle-knob ${enabled ? "on" : "off"}`} />
    </button>
  );
}

export default function SettingsPage() {
  const { user, role } = useAuth();
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [passwordStatus, setPasswordStatus] = useState<{ type: "success" | "error"; message: string } | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [securitySettings, setSecuritySettings] = useState<Record<string, boolean>>({
    "Two-Factor Authentication (2FA)": true,
    "Session auto-lock (15 min)": true,
    "Audit telemetry recording": true,
  });
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

  const toggleSecurity = (key: string) => {
    setSecuritySettings((prev) => ({
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
    <div className="settings-page-root">
      <PageHeader
        title="Settings"
        subtitle="Profile, security, and notification preferences"
        breadcrumbs={[{ label: "Dashboard", to: "/app/dashboard" }, { label: "Settings" }]}
      />

      <div className="settings-grid">
        {/* Profile */}
        <div className="settings-panel">
          <div className="settings-section-title">PROFILE</div>
          <div style={{ display: "flex", alignItems: "center", gap: 14, marginBottom: 20 }}>
            <div className="settings-profile-avatar">
              {user.name.split(" ").map((n) => n[0]).join("")}
            </div>
            <div>
              <div className="settings-user-name">{user.name}</div>
              <div style={{ fontSize: "0.8125rem", color: "var(--muted, #737373)", textTransform: "capitalize" }}>{role.replace('_', ' ')}</div>
            </div>
          </div>
          {[
            { label: "Name", value: user.name },
            { label: "Email", value: user.email },
            { label: "Role", value: role.replace('_', ' ').toUpperCase() },
            { label: "DID", value: user.actor?.did || "—", mono: true },
            { label: "Identity", value: "✓ Verified" },
          ].map((row) => (
            <div key={row.label} className="settings-profile-row">
              <span className="settings-profile-label">{row.label}</span>
              {(row as any).mono ? (
                <span className="meta-id settings-profile-value">{row.value}</span>
              ) : (
                <span className="settings-profile-value">{row.value}</span>
              )}
            </div>
          ))}
        </div>

        {/* Security */}
        <div className="settings-panel">
          <div className="settings-section-title">SECURITY</div>
          <div className="settings-row">
            <div>
              <div className="settings-row-label">Password</div>
              <div className="settings-row-sub">••••••••••</div>
            </div>
            <button
              className="btn-ghost"
              style={{ fontSize: "0.75rem" }}
              onClick={() => setShowPasswordModal(true)}
            >
              Change
            </button>
          </div>

          {Object.entries(securitySettings).map(([label, enabled]) => (
            <div key={label} className="settings-row">
              <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                <span className="settings-row-label">{label}</span>
                <span style={{ fontSize: "0.6875rem", fontWeight: 600, color: enabled ? "#4ade80" : "var(--muted, #737373)" }}>
                  {enabled ? "ON" : "OFF"}
                </span>
              </div>
              <ToggleSwitch
                enabled={enabled}
                onChange={() => toggleSecurity(label)}
                label={label}
              />
            </div>
          ))}

          <div className="settings-row" style={{ borderBottom: "none" }}>
            <div>
              <div className="settings-row-label">Active sessions</div>
              <div className="settings-row-sub">1 session (Current workstation)</div>
            </div>
            <button className="btn-ghost" style={{ fontSize: "0.75rem" }}>View</button>
          </div>
        </div>

        {/* Notifications */}
        <div className="settings-panel">
          <div className="settings-section-title">NOTIFICATIONS</div>
          {Object.entries(notifications).map(([label, enabled]) => (
            <div key={label} className="settings-row">
              <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                <span className="settings-row-label">{label}</span>
                <span style={{ fontSize: "0.6875rem", fontWeight: 600, color: enabled ? "#4ade80" : "var(--muted, #737373)" }}>
                  {enabled ? "ON" : "OFF"}
                </span>
              </div>
              <ToggleSwitch
                enabled={enabled}
                onChange={() => toggleNotification(label)}
                label={label}
              />
            </div>
          ))}
        </div>

        {/* Wallet */}
        <div className="settings-panel">
          <div className="settings-section-title">WALLET</div>
          <div className="settings-wallet-card">
            <div className="settings-wallet-status">
              <span style={{ width: 6, height: 6, borderRadius: "50%", background: "#22c55e", display: "inline-block" }} />
              CONNECTED
            </div>
            <div className="meta-id settings-wallet-address">{user.actor?.wallet_address || "0x1F2B...89A3"}</div>
          </div>
          <div className="settings-wallet-network">Network: BEL-TRUST-CHAIN (Synthetic Demo)</div>
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
            background: "rgba(0, 0, 0, 0.75)",
            backdropFilter: "blur(4px)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            zIndex: 1000,
            padding: 16,
          }}
        >
          <div className="settings-modal-panel">
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 18 }}>
              <div className="settings-modal-title">Change Password</div>
              <button
                onClick={() => {
                  setShowPasswordModal(false);
                  setPasswordStatus(null);
                }}
                style={{ background: "none", border: "none", color: "var(--muted, #737373)", cursor: "pointer", fontSize: "1.2rem" }}
              >
                ✕
              </button>
            </div>

            <form onSubmit={handlePasswordSubmit} style={{ display: "flex", flexDirection: "column", gap: 14 }}>
              {passwordStatus && (
                <div
                  style={{
                    padding: "8px 12px",
                    borderRadius: 6,
                    fontSize: "0.8125rem",
                    background: passwordStatus.type === "success" ? "rgba(34,197,94,0.12)" : "rgba(239,68,68,0.12)",
                    border: `1px solid ${passwordStatus.type === "success" ? "rgba(34,197,94,0.3)" : "rgba(239,68,68,0.3)"}`,
                    color: passwordStatus.type === "success" ? "#4ade80" : "#f87171",
                  }}
                >
                  {passwordStatus.message}
                </div>
              )}

              <div>
                <label className="settings-modal-label">
                  Current Password
                </label>
                <input
                  type="password"
                  className="settings-modal-input"
                  value={currentPassword}
                  onChange={(e) => setCurrentPassword(e.target.value)}
                  placeholder="Enter current password"
                  required
                />
              </div>

              <div>
                <label className="settings-modal-label">
                  New Password (min 8 characters)
                </label>
                <input
                  type="password"
                  className="settings-modal-input"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  placeholder="Enter new password"
                  required
                  minLength={8}
                />
              </div>

              <div>
                <label className="settings-modal-label">
                  Confirm New Password
                </label>
                <input
                  type="password"
                  className="settings-modal-input"
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
