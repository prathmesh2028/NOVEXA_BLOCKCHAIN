import { useState, useEffect } from "react";
import PageHeader from "../../components/ui/PageHeader";
import { api } from "../../services/api";

export default function LifecyclePage() {
  const [rules, setRules] = useState<any[]>([]);
  const [stateMachine, setStateMachine] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedState, setSelectedState] = useState<string | null>(null);
  const [roleFilter, setRoleFilter] = useState("ALL");
  const [searchTerm, setSearchTerm] = useState("");
  const [showTransitionModal, setShowTransitionModal] = useState(false);
  const [submitting, setSubmitting] = useState(false);
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
      if (data.state_machine?.states?.length > 0) {
        setSelectedState(data.state_machine.states[0]);
      }
    } catch (err: any) {
      setError(err.message || "Failed to fetch lifecycle rules");
    } finally {
      setLoading(false);
    }
  };

  const handleTransition = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      await api.post("/lifecycle/transition", transitionForm);
      alert("Lifecycle transition successful");
      setShowTransitionModal(false);
      setTransitionForm({ asset_id: "", to_state: "", reason: "" });
    } catch (err: any) {
      alert(`Failed to transition: ${err.message || "Unknown error"}`);
    } finally {
      setSubmitting(false);
    }
  };

  const filteredRules = rules.filter((r) => {
    const matchesSearch =
      !searchTerm ||
      r.from_state.toLowerCase().includes(searchTerm.toLowerCase()) ||
      r.to_state.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (r.description && r.description.toLowerCase().includes(searchTerm.toLowerCase()));
    const matchesRole = roleFilter === "ALL" || r.allowed_role === roleFilter;
    const matchesState = !selectedState || r.from_state === selectedState || r.to_state === selectedState;
    return matchesSearch && matchesRole && matchesState;
  });

  const uniqueRoles = Array.from(new Set(rules.map((r) => r.allowed_role)));

  return (
    <div className="internal-page page-fade">
      <PageHeader
        title="Asset Lifecycle Engine"
        subtitle="Finite state machine governing defence asset transitions, inspection checkpoints, and cryptographic custody clearance"
        breadcrumbs={[
          { label: "Dashboard", to: "/app/dashboard" },
          { label: "Lifecycle" },
        ]}
        actions={
          <div style={{ display: "flex", gap: 10 }}>
            <button className="btn-primary" onClick={() => setShowTransitionModal(true)}>
              Execute Transition →
            </button>
            <button className="btn-secondary" onClick={fetchRules}>
              ↻ Refresh
            </button>
          </div>
        }
      />

      {/* KPI Intelligence Cards */}
      <div className="internal-kpi-grid stagger-in-2">
        <div className="internal-kpi-card">
          <div className="internal-kpi-label">TOTAL PIPELINE STATES</div>
          <div className="internal-kpi-value">{stateMachine?.states?.length || 6}</div>
          <div className="internal-kpi-sub">
            <span style={{ width: 6, height: 6, borderRadius: "50%", background: "#2563eb" }} />
            Discrete custody phases
          </div>
        </div>

        <div className="internal-kpi-card">
          <div className="internal-kpi-label">TRANSITION RULES</div>
          <div className="internal-kpi-value" style={{ color: "#3b82f6" }}>
            {rules.length}
          </div>
          <div className="internal-kpi-sub">
            <span style={{ width: 6, height: 6, borderRadius: "50%", background: "#3b82f6" }} />
            Deterministic policy gates
          </div>
        </div>

        <div className="internal-kpi-card">
          <div className="internal-kpi-label">QA INSPECTION GATED</div>
          <div className="internal-kpi-value" style={{ color: "#f59e0b" }}>
            {rules.filter((r) => r.requires_inspection).length}
          </div>
          <div className="internal-kpi-sub">
            <span style={{ width: 6, height: 6, borderRadius: "50%", background: "#f59e0b" }} />
            Requires physical QA sign-off
          </div>
        </div>

        <div className="internal-kpi-card">
          <div className="internal-kpi-label">EVIDENCE REQUIRED</div>
          <div className="internal-kpi-value" style={{ color: "#22c55e" }}>
            {rules.filter((r) => r.requires_evidence).length}
          </div>
          <div className="internal-kpi-sub">
            <span style={{ width: 6, height: 6, borderRadius: "50%", background: "#22c55e" }} />
            Requires SHA-256 evidence
          </div>
        </div>
      </div>

      {/* Visual State Machine Diagram */}
      {stateMachine && (
        <div className="internal-card stagger-in-3" style={{ padding: "24px 28px" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20 }}>
            <div>
              <div style={{ fontSize: "0.75rem", fontWeight: 700, letterSpacing: "0.1em", textTransform: "uppercase", color: "var(--muted)" }}>
                STATE MACHINE TOPOLOGY
              </div>
              <div style={{ fontSize: "0.8125rem", color: "var(--muted)", marginTop: 4 }}>
                Select a state node to inspect inbound and outbound cryptographic transition rules
              </div>
            </div>
            {selectedState && (
              <button
                className="btn-ghost"
                style={{ fontSize: "0.75rem" }}
                onClick={() => setSelectedState(null)}
              >
                Clear Node Selection (Show All)
              </button>
            )}
          </div>

          <div style={{ display: "flex", alignItems: "center", overflowX: "auto", padding: "16px 0", gap: 8 }}>
            {stateMachine.states.map((state: string, idx: number) => {
              const isTerminal = stateMachine.terminal_states?.includes(state);
              const isSelected = selectedState === state;
              const isFirst = idx === 0;

              return (
                <div key={state} style={{ display: "flex", alignItems: "center", flexShrink: 0 }}>
                  <button
                    onClick={() => setSelectedState(state === selectedState ? null : state)}
                    style={{
                      padding: "12px 18px",
                      borderRadius: 10,
                      background: isSelected
                        ? "rgba(37, 99, 235, 0.18)"
                        : isTerminal
                        ? "rgba(34, 197, 94, 0.08)"
                        : "var(--panel-muted, #102038)",
                      border: `1px solid ${
                        isSelected
                          ? "#2563eb"
                          : isTerminal
                          ? "rgba(34, 197, 94, 0.3)"
                          : "var(--border)"
                      }`,
                      boxShadow: isSelected ? "0 0 16px rgba(37, 99, 235, 0.3)" : "none",
                      cursor: "pointer",
                      display: "flex",
                      flexDirection: "column",
                      alignItems: "flex-start",
                      gap: 4,
                      transition: "all 0.2s ease",
                      textAlign: "left",
                    }}
                  >
                    <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                      <span
                        style={{
                          width: 8,
                          height: 8,
                          borderRadius: "50%",
                          background: isTerminal ? "#22c55e" : isFirst ? "#60a5fa" : "#3b82f6",
                          display: "inline-block",
                        }}
                      />
                      <span style={{ fontSize: "0.6875rem", fontWeight: 700, color: "var(--muted)", textTransform: "uppercase" }}>
                        STAGE 0{idx + 1}
                      </span>
                    </div>
                    <div
                      style={{
                        fontSize: "0.875rem",
                        fontWeight: 700,
                        color: isSelected ? "var(--foreground)" : isTerminal ? "#22c55e" : "var(--foreground)",
                      }}
                    >
                      {state.replace(/_/g, " ")}
                    </div>
                  </button>

                  {idx < stateMachine.states.length - 1 && (
                    <div style={{ width: 32, display: "flex", alignItems: "center", justifyContent: "center", color: "var(--muted)", margin: "0 4px" }}>
                      →
                    </div>
                  )}
                </div>
              );
            })}
          </div>

          <div style={{ marginTop: 14, padding: "10px 14px", background: "rgba(37,99,235,0.05)", borderRadius: 8, fontSize: "0.8125rem", color: "var(--muted)" }}>
            <strong style={{ color: "var(--foreground)" }}>FSM Specification: </strong>
            {stateMachine.description}
          </div>
        </div>
      )}

      {/* Filter and Search Bar */}
      <div className="internal-filter-bar stagger-in-3">
        <input
          type="text"
          className="internal-search-input"
          placeholder="Filter rules by from-state, to-state, or description..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />

        <select
          className="internal-select"
          value={roleFilter}
          onChange={(e) => setRoleFilter(e.target.value)}
        >
          <option value="ALL">All Authorized Roles</option>
          {uniqueRoles.map((role) => (
            <option key={role} value={role}>
              {role}
            </option>
          ))}
        </select>

        <span style={{ fontSize: "0.75rem", color: "var(--muted)", marginLeft: "auto" }}>
          Showing {filteredRules.length} of {rules.length} transition rules
        </span>
      </div>

      {/* Rules Table */}
      <div className="internal-card stagger-in-4" style={{ padding: 0 }}>
        <div className="internal-table-container">
          <table style={{ width: "100%", borderCollapse: "collapse", minWidth: 860 }}>
            <thead>
              <tr style={{ borderBottom: "1px solid var(--border)", background: "var(--table-header-bg)" }}>
                {["Origin State", "Destination State", "Authorized Role", "Evidence Gate", "QA Inspection Gate", "Rule Description"].map((h) => (
                  <th
                    key={h}
                    style={{
                      padding: "12px 16px",
                      textAlign: "left",
                      fontSize: "0.6875rem",
                      color: "var(--muted)",
                      fontWeight: 700,
                      letterSpacing: "0.08em",
                      textTransform: "uppercase",
                      whiteSpace: "nowrap",
                    }}
                  >
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={6} style={{ padding: "48px 20px", textAlign: "center", color: "var(--muted)" }}>
                    <div style={{ display: "inline-block", width: 24, height: 24, borderRadius: "50%", border: "2px solid #3b82f6", borderTopColor: "transparent", animation: "orbitRotateSlow 1s linear infinite", marginBottom: 8 }} />
                    <div>Compiling lifecycle state machine rules...</div>
                  </td>
                </tr>
              ) : filteredRules.length === 0 ? (
                <tr>
                  <td colSpan={6} style={{ padding: "40px", textAlign: "center", color: "var(--muted)" }}>
                    No matching transition rules found
                  </td>
                </tr>
              ) : (
                filteredRules.map((rule: any, idx: number) => (
                  <tr key={idx} className="interactive-row" style={{ borderBottom: "1px solid var(--border-subtle)" }}>
                    <td style={{ padding: "14px 16px", fontWeight: 700, color: "var(--foreground)" }}>
                      {rule.from_state}
                    </td>
                    <td style={{ padding: "14px 16px", fontWeight: 700, color: "#22c55e" }}>
                      → {rule.to_state}
                    </td>
                    <td style={{ padding: "14px 16px" }}>
                      <span
                        style={{
                          padding: "3px 10px",
                          background: "rgba(139,92,246,0.1)",
                          border: "1px solid rgba(139,92,246,0.25)",
                          borderRadius: 6,
                          fontSize: "0.75rem",
                          fontWeight: 600,
                          color: "#a78bfa",
                        }}
                      >
                        {rule.allowed_role}
                      </span>
                    </td>
                    <td style={{ padding: "14px 16px", textAlign: "left" }}>
                      {rule.requires_evidence ? (
                        <span style={{ color: "#22c55e", fontWeight: 700, fontSize: "0.875rem" }}>✓ Required</span>
                      ) : (
                        <span style={{ color: "var(--muted)" }}>—</span>
                      )}
                    </td>
                    <td style={{ padding: "14px 16px", textAlign: "left" }}>
                      {rule.requires_inspection ? (
                        <span style={{ color: "#f59e0b", fontWeight: 700, fontSize: "0.875rem" }}>✓ Required</span>
                      ) : (
                        <span style={{ color: "var(--muted)" }}>—</span>
                      )}
                    </td>
                    <td style={{ padding: "14px 16px", fontSize: "0.8125rem", color: "var(--muted)" }}>
                      {rule.description || "System transition policy"}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Execute Transition Modal */}
      {showTransitionModal && (
        <div
          className="modal-backdrop"
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
          <div className="internal-card modal-content-animated" style={{ width: "100%", maxWidth: 500, padding: 24 }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 18 }}>
              <div style={{ fontSize: "1.1rem", fontWeight: 700, color: "var(--foreground)" }}>Execute Lifecycle State Transition</div>
              <button
                onClick={() => setShowTransitionModal(false)}
                style={{ background: "none", border: "none", color: "var(--muted)", cursor: "pointer", fontSize: "1.2rem" }}
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleTransition} style={{ display: "flex", flexDirection: "column", gap: 14 }}>
              <div>
                <label style={{ display: "block", fontSize: "0.75rem", fontWeight: 600, color: "var(--foreground)", marginBottom: 6 }}>
                  Target Asset ID *
                </label>
                <input
                  type="text"
                  className="internal-search-input"
                  style={{ width: "100%" }}
                  value={transitionForm.asset_id}
                  onChange={(e) => setTransitionForm({ ...transitionForm, asset_id: e.target.value })}
                  placeholder="e.g. EF-2026-00421"
                  required
                />
              </div>

              <div>
                <label style={{ display: "block", fontSize: "0.75rem", fontWeight: 600, color: "var(--foreground)", marginBottom: 6 }}>
                  Target Lifecycle State *
                </label>
                <select
                  className="internal-select"
                  style={{ width: "100%" }}
                  value={transitionForm.to_state}
                  onChange={(e) => setTransitionForm({ ...transitionForm, to_state: e.target.value })}
                  required
                >
                  <option value="">Select destination state...</option>
                  {stateMachine?.states.map((state: string) => (
                    <option key={state} value={state}>
                      {state}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label style={{ display: "block", fontSize: "0.75rem", fontWeight: 600, color: "var(--foreground)", marginBottom: 6 }}>
                  Transition Justification & Reason *
                </label>
                <textarea
                  className="internal-search-input"
                  style={{ width: "100%", minHeight: 80, resize: "vertical" }}
                  value={transitionForm.reason}
                  onChange={(e) => setTransitionForm({ ...transitionForm, reason: e.target.value })}
                  placeholder="State reason for moving asset to next lifecycle stage..."
                  rows={2}
                  required
                />
              </div>

              <div style={{ display: "flex", justifyContent: "flex-end", gap: 10, marginTop: 10 }}>
                <button type="button" className="btn-secondary" onClick={() => setShowTransitionModal(false)}>
                  Cancel
                </button>
                <button type="submit" className="btn-primary" disabled={submitting}>
                  {submitting ? "Transitioning..." : "Execute Transition"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
