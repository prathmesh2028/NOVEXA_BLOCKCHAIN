import { useState, useEffect } from "react";
import { Link } from "react-router";
import PageHeader from "../../components/ui/PageHeader";
import { api } from "../../services/api";

export default function LifecyclePage() {
  const [rules, setRules] = useState<any[]>([]);
  const [stateMachine, setStateMachine] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showTransitionModal, setShowTransitionModal] = useState(false);
  const [transitionForm, setTransitionForm] = useState({
    asset_id: "",
    to_state: "",
    reason: "",
  });

  useEffect(() => {
    fetchRules();
  }, []);

  const fetchRules = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await api.get<any>("/lifecycle/rules");
      setRules(data.rules || []);
      setStateMachine(data.state_machine);
    } catch (err: any) {
      setError(err.message || "Failed to fetch lifecycle rules");
    } finally {
      setLoading(false);
    }
  };

  const handleTransition = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await api.post("/lifecycle/transition", transitionForm);
      alert("Lifecycle transition successful");
      setShowTransitionModal(false);
      setTransitionForm({ asset_id: "", to_state: "", reason: "" });
    } catch (err: any) {
      alert(`Failed to transition: ${err.message || "Unknown error"}`);
    }
  };

  return (
    <div className="page-fade">
      <PageHeader
        title="Lifecycle Management"
        subtitle="Asset lifecycle state transitions and rules"
        breadcrumbs={[
          { label: "Dashboard", to: "/app/dashboard" },
          { label: "Lifecycle" },
        ]}
        actions={
          <button className="btn-primary" onClick={() => setShowTransitionModal(true)}>
            Execute Transition
          </button>
        }
      />

      {stateMachine && (
        <div className="panel" style={{ padding: 20, marginBottom: 20 }}>
          <div className="section-label" style={{ marginBottom: 14 }}>STATE MACHINE</div>
          <div style={{ marginBottom: 12 }}>
            <div style={{ fontSize: "0.75rem", color: "#64748b", marginBottom: 6 }}>States:</div>
            <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
              {stateMachine.states.map((state: string) => (
                <span
                  key={state}
                  style={{
                    padding: "4px 10px",
                    background: stateMachine.terminal_states.includes(state) ? "rgba(34,197,94,0.1)" : "rgba(37,99,235,0.1)",
                    border: `1px solid ${stateMachine.terminal_states.includes(state) ? "rgba(34,197,94,0.3)" : "rgba(37,99,235,0.3)"}`,
                    borderRadius: 4,
                    fontSize: "0.75rem",
                    color: stateMachine.terminal_states.includes(state) ? "#22c55e" : "#60a5fa",
                  }}
                >
                  {state}
                </span>
              ))}
            </div>
          </div>
          <div style={{ fontSize: "0.8125rem", color: "#94a3b8" }}>
            {stateMachine.description}
          </div>
        </div>
      )}

      {loading ? (
        <div style={{ textAlign: "center", padding: "60px 20px", color: "#64748b" }}>
          Loading lifecycle rules...
        </div>
      ) : error ? (
        <div style={{ textAlign: "center", padding: "60px 20px" }}>
          <div style={{ color: "#ef4444", marginBottom: 12 }}>{error}</div>
          <button className="btn-secondary" onClick={fetchRules}>Retry</button>
        </div>
      ) : (
        <div className="panel">
          <div style={{ padding: 16, borderBottom: "1px solid #1e3a60" }}>
            <div className="section-label">TRANSITION RULES</div>
          </div>
          <table>
            <thead>
              <tr>
                <th>From State</th>
                <th>To State</th>
                <th>Allowed Role</th>
                <th>Requires Evidence</th>
                <th>Requires Inspection</th>
                <th>Description</th>
              </tr>
            </thead>
            <tbody>
              {rules.map((rule: any, idx: number) => (
                <tr key={idx}>
                  <td style={{ fontWeight: 600, color: "#e2e8f0" }}>{rule.from_state}</td>
                  <td style={{ fontWeight: 600, color: "#22c55e" }}>→ {rule.to_state}</td>
                  <td>
                    <span style={{
                      padding: "2px 8px",
                      background: "rgba(139,92,246,0.1)",
                      border: "1px solid rgba(139,92,246,0.3)",
                      borderRadius: 3,
                      fontSize: "0.75rem",
                      color: "#a78bfa",
                    }}>
                      {rule.allowed_role}
                    </span>
                  </td>
                  <td style={{ textAlign: "center" }}>
                    {rule.requires_evidence ? "✓" : "—"}
                  </td>
                  <td style={{ textAlign: "center" }}>
                    {rule.requires_inspection ? "✓" : "—"}
                  </td>
                  <td style={{ fontSize: "0.8125rem", color: "#94a3b8" }}>
                    {rule.description || "—"}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {showTransitionModal && (
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
          <div className="panel" style={{ width: "100%", maxWidth: 500, padding: 24 }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 18 }}>
              <div style={{ fontSize: "1rem", fontWeight: 600, color: "#e2e8f0" }}>Execute Transition</div>
              <button
                onClick={() => setShowTransitionModal(false)}
                style={{ background: "none", border: "none", color: "#64748b", cursor: "pointer", fontSize: "1.2rem" }}
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleTransition} style={{ display: "flex", flexDirection: "column", gap: 14 }}>
              <div>
                <label style={{ display: "block", fontSize: "0.75rem", color: "#94a3b8", marginBottom: 4 }}>
                  Asset ID
                </label>
                <input
                  type="text"
                  className="input"
                  value={transitionForm.asset_id}
                  onChange={(e) => setTransitionForm({ ...transitionForm, asset_id: e.target.value })}
                  placeholder="e.g. EF-2026-00421"
                  required
                />
              </div>

              <div>
                <label style={{ display: "block", fontSize: "0.75rem", color: "#94a3b8", marginBottom: 4 }}>
                  To State
                </label>
                <select
                  className="input"
                  value={transitionForm.to_state}
                  onChange={(e) => setTransitionForm({ ...transitionForm, to_state: e.target.value })}
                  required
                >
                  <option value="">Select state...</option>
                  {stateMachine?.states.map((state: string) => (
                    <option key={state} value={state}>{state}</option>
                  ))}
                </select>
              </div>

              <div>
                <label style={{ display: "block", fontSize: "0.75rem", color: "#94a3b8", marginBottom: 4 }}>
                  Reason
                </label>
                <textarea
                  className="input"
                  value={transitionForm.reason}
                  onChange={(e) => setTransitionForm({ ...transitionForm, reason: e.target.value })}
                  placeholder="Reason for transition..."
                  rows={2}
                />
              </div>

              <div style={{ display: "flex", justifyContent: "flex-end", gap: 8, marginTop: 8 }}>
                <button type="button" className="btn-ghost" onClick={() => setShowTransitionModal(false)}>
                  Cancel
                </button>
                <button type="submit" className="btn-primary">
                  Execute
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
