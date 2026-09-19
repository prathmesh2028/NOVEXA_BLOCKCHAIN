import { useState, useEffect } from "react";
import { useParams, Link, useNavigate } from "react-router";
import PageHeader from "../../components/ui/PageHeader";
import StatusBadge from "../../components/ui/StatusBadge";
import { formatDateTime, formatDate, ASSETS } from "../../data/mockData";
import { inspectionService } from "../../services/inspections";
import { useAuth } from "../../context/AuthContext";
import type { Inspection, ChecklistItemState, EvidenceRequirement } from "../../data/mockData";

export default function InspectionDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();

  const [inspection, setInspection] = useState<Inspection | null>(null);
  const [loading, setLoading] = useState(true);
  const [findingsText, setFindingsText] = useState("");
  const [activeItemNote, setActiveItemNote] = useState<string | null>(null);
  const [noteInputs, setNoteInputs] = useState<Record<string, string>>({});

  // Feedback and validation states
  const [feedbackMessage, setFeedbackMessage] = useState<{
    type: "success" | "error" | "warning";
    text: string;
  } | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showConfirmModal, setShowConfirmModal] = useState(false);

  // Simulated mock evidence upload state
  const [evidenceRequirement, setEvidenceRequirement] = useState<EvidenceRequirement>("Required");
  const [simulatedEvidenceUploaded, setSimulatedEvidenceUploaded] = useState(false);

  const fetchInspection = async () => {
    if (!id) return;
    setLoading(true);
    try {
      const data = await inspectionService.getInspection(id);
      if (data) {
        setInspection(data);
        setFindingsText(data.findings || "");
        setEvidenceRequirement(data.evidenceStatus);
        setSimulatedEvidenceUploaded(data.evidenceStatus === "Attached");

        // Initialize notes map
        const notesMap: Record<string, string> = {};
        data.checklist.forEach((item) => {
          notesMap[item.id] = item.notes || "";
        });
        setNoteInputs(notesMap);
      }
    } catch (err) {
      console.error("Error fetching inspection:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchInspection();
  }, [id]);

  if (loading) {
    return (
      <div style={{ padding: "80px 24px", textAlign: "center", color: "#64748b" }}>
        <div style={{ fontSize: "2rem", marginBottom: 12 }}>⏳</div>
        <div style={{ fontSize: "1.125rem", color: "#e2e8f0" }}>Loading Inspection Details...</div>
        <div className="meta-id" style={{ marginTop: 4 }}>
          {id}
        </div>
      </div>
    );
  }

  if (!inspection) {
    return (
      <div className="page-fade" style={{ textAlign: "center", padding: "80px 24px" }}>
        <div style={{ fontSize: "2.5rem", marginBottom: 16, opacity: 0.4 }}>◌</div>
        <h2 className="font-display" style={{ color: "#e2e8f0", fontSize: "1.75rem", marginBottom: 8 }}>
          INSPECTION RECORD NOT FOUND
        </h2>
        <p style={{ color: "#64748b", marginBottom: 24, fontSize: "0.875rem" }}>
          No inspection record exists for identifier: <strong style={{ color: "#94a3b8" }}>{id}</strong>
        </p>
        <Link to="/app/inspections" className="btn-primary">
          ← Return to Inspections
        </Link>
      </div>
    );
  }

  const isFinalized = inspection.status === "COMPLETED";
  const passCount = inspection.checklist.filter((c) => c.state === "Pass").length;
  const failCount = inspection.checklist.filter((c) => c.state === "Fail").length;
  const notCheckedCount = inspection.checklist.filter((c) => c.state === "Not Checked").length;
  const totalCount = inspection.checklist.length;
  const percentComplete = Math.round(((totalCount - notCheckedCount) / totalCount) * 100);

  // Pre-flight check validation logic
  const uncheckedMandatory = inspection.checklist.filter(
    (c) => c.mandatory && c.state === "Not Checked"
  );
  const canComplete = uncheckedMandatory.length === 0 && findingsText.trim().length > 0;

  // Handle Checklist Item Toggle
  const handleChecklistStateChange = async (
    itemId: string,
    newState: ChecklistItemState
  ) => {
    if (isFinalized) return;
    try {
      const updated = await inspectionService.updateChecklistItem(
        inspection.id,
        itemId,
        newState,
        noteInputs[itemId]
      );
      setInspection(updated);
      setFeedbackMessage(null);
    } catch (err: any) {
      setFeedbackMessage({ type: "error", text: err.message || "Failed to update checklist item" });
    }
  };

  // Handle saving note for a specific checklist item
  const handleSaveItemNote = async (itemId: string) => {
    if (isFinalized) return;
    const currentItem = inspection.checklist.find((c) => c.id === itemId);
    if (!currentItem) return;

    try {
      const updated = await inspectionService.updateChecklistItem(
        inspection.id,
        itemId,
        currentItem.state,
        noteInputs[itemId] || ""
      );
      setInspection(updated);
      setActiveItemNote(null);
      setFeedbackMessage({ type: "success", text: `Note saved for ${itemId}` });
      setTimeout(() => setFeedbackMessage(null), 2500);
    } catch (err: any) {
      setFeedbackMessage({ type: "error", text: err.message || "Failed to save note" });
    }
  };

  // Handle findings blur/change
  const handleFindingsChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    if (isFinalized) return;
    setFindingsText(e.target.value);
  };

  const handleFindingsBlur = async () => {
    if (isFinalized || findingsText === inspection.findings) return;
    try {
      await inspectionService.updateFindings(inspection.id, findingsText);
    } catch (err) {
      console.error("Failed to update findings:", err);
    }
  };

  // Handle Simulated Evidence Attachment
  const handleSimulateEvidenceUpload = () => {
    setSimulatedEvidenceUploaded(true);
    setEvidenceRequirement("Attached");
    setFeedbackMessage({
      type: "success",
      text: "Simulated evidence report attached: 'inspection_evidence_signed.pdf' (SHA-256 fingerprint generated).",
    });
    setTimeout(() => setFeedbackMessage(null), 3500);
  };

  // Handle Complete Inspection
  const handleExecuteCompletion = async () => {
    setIsSubmitting(true);
    setShowConfirmModal(false);

    try {
      const result = await inspectionService.completeInspection(
        inspection.id,
        user?.name || "Rajesh Kumar",
        user?.id || "did:bel:actor:003",
        findingsText
      );

      if (result.success) {
        setInspection(result.inspection);
        setFeedbackMessage({
          type: result.inspection.status === "COMPLETED" ? "success" : "warning",
          text: result.message,
        });
      } else {
        setFeedbackMessage({
          type: "error",
          text: result.message,
        });
      }
    } catch (err: any) {
      setFeedbackMessage({
        type: "error",
        text: err.message || "An unexpected error occurred during completion.",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="page-fade">
      {/* Page Header */}
      <PageHeader
        title={inspection.id}
        subtitle={`${inspection.assetName} · ${inspection.type}`}
        breadcrumbs={[
          { label: "Dashboard", to: "/app/dashboard" },
          { label: "Inspections", to: "/app/inspections" },
          { label: inspection.id },
        ]}
        badge={<StatusBadge status={inspection.status} />}
        actions={
          <div style={{ display: "flex", gap: 10, alignItems: "center" }}>
            <StatusBadge status={inspection.priority} />
            <Link
              to="/app/inspections"
              className="btn-secondary"
              style={{ fontSize: "0.75rem", padding: "6px 14px" }}
            >
              ← Back to Inspections
            </Link>
          </div>
        }
      />

      {/* Prominent Demo Notice Banner */}
      <div
        style={{
          padding: "10px 16px",
          background: "rgba(15, 23, 42, 0.7)",
          border: "1px solid #1e3a60",
          borderRadius: "6px",
          marginBottom: 20,
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          flexWrap: "wrap",
          gap: 10,
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 8, fontSize: "0.8125rem", color: "#94a3b8" }}>
          <span style={{ color: "#38bdf8" }}>◌</span>
          <span>
            <strong style={{ color: "#e2e8f0" }}>BEL Inspection Workstation (Simulated Session):</strong>{" "}
            Checklist toggles, findings recordings, and completion actions modify active local session state.
          </span>
        </div>
        <div
          style={{
            fontSize: "0.6875rem",
            color: "#60a5fa",
            background: "rgba(37,99,235,0.15)",
            padding: "3px 8px",
            borderRadius: "3px",
            fontWeight: 600,
          }}
        >
          DEMO DATA ONLY
        </div>
      </div>

      {/* Feedback Message Alert */}
      {feedbackMessage && (
        <div
          style={{
            padding: "12px 16px",
            marginBottom: 20,
            borderRadius: "6px",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            fontSize: "0.8125rem",
            border:
              feedbackMessage.type === "success"
                ? "1px solid rgba(34, 197, 94, 0.4)"
                : feedbackMessage.type === "warning"
                ? "1px solid rgba(245, 158, 11, 0.4)"
                : "1px solid rgba(239, 68, 68, 0.4)",
            background:
              feedbackMessage.type === "success"
                ? "rgba(34, 197, 94, 0.12)"
                : feedbackMessage.type === "warning"
                ? "rgba(245, 158, 11, 0.12)"
                : "rgba(239, 68, 68, 0.12)",
            color:
              feedbackMessage.type === "success"
                ? "#4ade80"
                : feedbackMessage.type === "warning"
                ? "#fbbf24"
                : "#f87171",
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <span>{feedbackMessage.type === "success" ? "✓" : feedbackMessage.type === "warning" ? "⚠" : "✕"}</span>
            <span>{feedbackMessage.text}</span>
          </div>
          <button
            onClick={() => setFeedbackMessage(null)}
            style={{ background: "none", border: "none", color: "inherit", cursor: "pointer", fontSize: "1rem" }}
          >
            ✕
          </button>
        </div>
      )}

      {/* Top Asset & Workstation Specs Grid */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(320px, 1fr))", gap: 16, marginBottom: 24 }}>
        {/* Asset Identity Card */}
        <div className="panel" style={{ padding: 20 }}>
          <div className="section-label" style={{ display: "flex", justifyContent: "space-between" }}>
            <span>ASSET & BATCH IDENTITY</span>
            <Link
              to={`/app/assets/${inspection.assetId}`}
              style={{ fontSize: "0.75rem", color: "#60a5fa", textDecoration: "none" }}
            >
              View Asset Details →
            </Link>
          </div>

          <div style={{ display: "flex", flexDirection: "column", gap: 10, marginTop: 12 }}>
            {[
              { label: "Asset ID", value: inspection.assetId, mono: true, link: `/app/assets/${inspection.assetId}` },
              { label: "Asset Name", value: inspection.assetName },
              { label: "Model Code", value: inspection.assetModel, mono: true },
              { label: "Serial Number", value: inspection.assetSerial, mono: true },
              { label: "Batch ID", value: inspection.batchId, mono: true },
              { label: "Test Location", value: inspection.location },
            ].map((row) => (
              <div
                key={row.label}
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  paddingBottom: 8,
                  borderBottom: "1px solid #152b4a",
                  fontSize: "0.8125rem",
                }}
              >
                <span style={{ color: "#64748b" }}>{row.label}</span>
                {row.link ? (
                  <Link to={row.link} className="meta-id" style={{ color: "#60a5fa", textDecoration: "none" }}>
                    {row.value}
                  </Link>
                ) : row.mono ? (
                  <span className="meta-id" style={{ color: "#cbd5e1" }}>
                    {row.value}
                  </span>
                ) : (
                  <span style={{ color: "#cbd5e1", fontWeight: 500 }}>{row.value}</span>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Technician & Inspection Protocol Card */}
        <div className="panel" style={{ padding: 20 }}>
          <div className="section-label">INSPECTION TIMELINE & EVIDENCE</div>

          <div style={{ display: "flex", flexDirection: "column", gap: 10, marginTop: 12 }}>
            {[
              { label: "Inspection Type", value: inspection.type },
              { label: "Assigned Lead", value: `${inspection.assignedTechnician} (Technician)` },
              { label: "Technician DID", value: inspection.technicianDid, mono: true },
              { label: "Scheduled Date", value: formatDate(inspection.scheduledDate) },
              { label: "Last Evaluated", value: formatDateTime(inspection.updatedAt) },
            ].map((row) => (
              <div
                key={row.label}
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  paddingBottom: 8,
                  borderBottom: "1px solid #152b4a",
                  fontSize: "0.8125rem",
                }}
              >
                <span style={{ color: "#64748b" }}>{row.label}</span>
                {row.mono ? (
                  <span className="meta-id" style={{ color: "#cbd5e1" }}>
                    {row.value}
                  </span>
                ) : (
                  <span style={{ color: "#cbd5e1", fontWeight: 500 }}>{row.value}</span>
                )}
              </div>
            ))}

            {/* Evidence Status & Mock Attachment */}
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                paddingTop: 4,
              }}
            >
              <span style={{ fontSize: "0.8125rem", color: "#64748b" }}>Evidence Protocol</span>
              <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                <StatusBadge status={evidenceRequirement} size="sm" />
                {!isFinalized && !simulatedEvidenceUploaded && (
                  <button
                    onClick={handleSimulateEvidenceUpload}
                    className="btn-ghost"
                    style={{
                      padding: "2px 8px",
                      fontSize: "0.6875rem",
                      border: "1px solid #1e3a60",
                      color: "#60a5fa",
                    }}
                  >
                    + Attach Mock PDF
                  </button>
                )}
              </div>
            </div>

            {simulatedEvidenceUploaded && (
              <div
                style={{
                  background: "rgba(34, 197, 94, 0.08)",
                  border: "1px solid rgba(34, 197, 94, 0.2)",
                  padding: "8px 12px",
                  borderRadius: "4px",
                  fontSize: "0.75rem",
                  color: "#86efac",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                }}
              >
                <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                  <span>📄</span>
                  <span>{inspection.evidenceFilename || "inspection_signed_report.pdf"}</span>
                </div>
                <span className="meta-id" style={{ fontSize: "0.6875rem", color: "#4ade80" }}>
                  SHA-256 SIMULATED
                </span>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Progress Bar Header */}
      <div
        className="panel"
        style={{
          padding: "16px 20px",
          marginBottom: 20,
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          flexWrap: "wrap",
          gap: 16,
        }}
      >
        <div>
          <div style={{ fontSize: "0.875rem", color: "#e2e8f0", fontWeight: 600 }}>
            Quality Assessment Progress: {passCount + failCount} of {totalCount} Evaluated ({percentComplete}%)
          </div>
          <div style={{ fontSize: "0.75rem", color: "#64748b", marginTop: 2 }}>
            {notCheckedCount === 0
              ? "All quality criteria evaluated. Ready for sign-off review."
              : `${notCheckedCount} criterion item(s) pending evaluation.`}
          </div>
        </div>

        <div style={{ display: "flex", gap: 16, alignItems: "center" }}>
          <div style={{ display: "flex", gap: 12, fontSize: "0.75rem" }}>
            <span style={{ color: "#22c55e", fontWeight: 600 }}>✓ {passCount} Passed</span>
            <span style={{ color: "#ef4444", fontWeight: 600 }}>✕ {failCount} Failed</span>
            <span style={{ color: "#64748b", fontWeight: 600 }}>○ {notCheckedCount} Pending</span>
          </div>

          <div
            style={{
              width: 140,
              height: 8,
              background: "#152b4a",
              borderRadius: 4,
              overflow: "hidden",
            }}
          >
            <div
              style={{
                width: `${percentComplete}%`,
                height: "100%",
                background: failCount > 0 ? "#f59e0b" : "#22c55e",
                transition: "width 0.2s ease",
              }}
            />
          </div>
        </div>
      </div>

      {/* Section 1: Quality Checklist Table */}
      <div className="panel" style={{ padding: 20, marginBottom: 24 }}>
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            marginBottom: 16,
          }}
        >
          <div>
            <div className="section-label" style={{ marginBottom: 2 }}>
              TECHNICAL CRITERIA CHECKLIST
            </div>
            <p style={{ margin: 0, fontSize: "0.8125rem", color: "#94a3b8" }}>
              Standard inspection criteria governed by BEL Defence Quality Assurance protocols.
            </p>
          </div>

          {isFinalized && (
            <div
              style={{
                fontSize: "0.75rem",
                color: "#22c55e",
                background: "rgba(34, 197, 94, 0.12)",
                border: "1px solid rgba(34, 197, 94, 0.3)",
                padding: "4px 10px",
                borderRadius: "4px",
                fontWeight: 600,
              }}
            >
              🔒 Checklist Locked (Finalized)
            </div>
          )}
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
          {inspection.checklist.map((item, index) => {
            const isNoteOpen = activeItemNote === item.id;

            return (
              <div
                key={item.id}
                style={{
                  background:
                    item.state === "Pass"
                      ? "rgba(34, 197, 94, 0.03)"
                      : item.state === "Fail"
                      ? "rgba(239, 68, 68, 0.05)"
                      : "#08131f",
                  border: `1px solid ${
                    item.state === "Pass"
                      ? "rgba(34, 197, 94, 0.2)"
                      : item.state === "Fail"
                      ? "rgba(239, 68, 68, 0.3)"
                      : "#1e3a60"
                  }`,
                  borderRadius: "6px",
                  padding: "14px 16px",
                  transition: "all 0.15s ease",
                }}
              >
                <div
                  style={{
                    display: "flex",
                    alignItems: "flex-start",
                    justifyContent: "space-between",
                    gap: 16,
                    flexWrap: "wrap",
                  }}
                >
                  {/* Left: Criterion details */}
                  <div style={{ flex: 1, minWidth: 260 }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 4 }}>
                      <span className="meta-id" style={{ color: "#60a5fa", fontWeight: 700 }}>
                        {item.id}
                      </span>
                      <strong style={{ fontSize: "0.875rem", color: "#e2e8f0" }}>
                        {item.criterion}
                      </strong>
                      {item.mandatory && (
                        <span
                          style={{
                            fontSize: "0.625rem",
                            padding: "2px 6px",
                            borderRadius: "3px",
                            background: "rgba(239, 68, 68, 0.15)",
                            color: "#f87171",
                            border: "1px solid rgba(239, 68, 68, 0.3)",
                            fontWeight: 700,
                            letterSpacing: "0.04em",
                            textTransform: "uppercase",
                          }}
                        >
                          Mandatory
                        </span>
                      )}
                    </div>

                    <p style={{ margin: "4px 0 6px", fontSize: "0.8125rem", color: "#94a3b8", lineHeight: 1.4 }}>
                      {item.description}
                    </p>

                    <div style={{ display: "flex", alignItems: "center", gap: 12, flexWrap: "wrap" }}>
                      <span className="meta-id" style={{ fontSize: "0.6875rem", color: "#64748b" }}>
                        Ref: {item.standardRef}
                      </span>

                      {item.notes && !isNoteOpen && (
                        <span
                          style={{
                            fontSize: "0.75rem",
                            color: item.state === "Fail" ? "#f87171" : "#94a3b8",
                            fontStyle: "italic",
                          }}
                        >
                          Note: "{item.notes}"
                        </span>
                      )}

                      {!isFinalized && (
                        <button
                          onClick={() => setActiveItemNote(isNoteOpen ? null : item.id)}
                          style={{
                            background: "none",
                            border: "none",
                            color: "#60a5fa",
                            fontSize: "0.75rem",
                            cursor: "pointer",
                            padding: 0,
                            textDecoration: "underline",
                          }}
                        >
                          {isNoteOpen ? "Hide Note Form" : item.notes ? "Edit Note" : "+ Add Note"}
                        </button>
                      )}
                    </div>
                  </div>

                  {/* Right: Interactive State Buttons */}
                  <div style={{ display: "flex", alignItems: "center", gap: 6, flexShrink: 0 }}>
                    {/* Pass Button */}
                    <button
                      type="button"
                      disabled={isFinalized}
                      onClick={() => handleChecklistStateChange(item.id, "Pass")}
                      style={{
                        display: "inline-flex",
                        alignItems: "center",
                        gap: 6,
                        padding: "6px 14px",
                        fontSize: "0.75rem",
                        fontWeight: 600,
                        borderRadius: "4px",
                        cursor: isFinalized ? "not-allowed" : "pointer",
                        border: "1px solid",
                        borderColor: item.state === "Pass" ? "#22c55e" : "#1e3a60",
                        background: item.state === "Pass" ? "rgba(34, 197, 94, 0.2)" : "#0c1828",
                        color: item.state === "Pass" ? "#4ade80" : "#64748b",
                        transition: "all 0.15s ease",
                      }}
                    >
                      <span>✓</span> Pass
                    </button>

                    {/* Fail Button */}
                    <button
                      type="button"
                      disabled={isFinalized}
                      onClick={() => handleChecklistStateChange(item.id, "Fail")}
                      style={{
                        display: "inline-flex",
                        alignItems: "center",
                        gap: 6,
                        padding: "6px 14px",
                        fontSize: "0.75rem",
                        fontWeight: 600,
                        borderRadius: "4px",
                        cursor: isFinalized ? "not-allowed" : "pointer",
                        border: "1px solid",
                        borderColor: item.state === "Fail" ? "#ef4444" : "#1e3a60",
                        background: item.state === "Fail" ? "rgba(239, 68, 68, 0.2)" : "#0c1828",
                        color: item.state === "Fail" ? "#f87171" : "#64748b",
                        transition: "all 0.15s ease",
                      }}
                    >
                      <span>✕</span> Fail
                    </button>

                    {/* Not Checked / Reset Button */}
                    <button
                      type="button"
                      disabled={isFinalized}
                      onClick={() => handleChecklistStateChange(item.id, "Not Checked")}
                      style={{
                        display: "inline-flex",
                        alignItems: "center",
                        gap: 4,
                        padding: "6px 10px",
                        fontSize: "0.75rem",
                        borderRadius: "4px",
                        cursor: isFinalized ? "not-allowed" : "pointer",
                        border: "1px solid",
                        borderColor: item.state === "Not Checked" ? "#64748b" : "#1e3a60",
                        background: item.state === "Not Checked" ? "rgba(100, 116, 139, 0.15)" : "#0c1828",
                        color: item.state === "Not Checked" ? "#cbd5e1" : "#475569",
                        transition: "all 0.15s ease",
                      }}
                    >
                      <span>○</span> Not Checked
                    </button>
                  </div>
                </div>

                {/* Optional Note Drawer for item */}
                {isNoteOpen && !isFinalized && (
                  <div
                    style={{
                      marginTop: 12,
                      paddingTop: 12,
                      borderTop: "1px solid #152b4a",
                      display: "flex",
                      gap: 8,
                    }}
                  >
                    <input
                      className="input-field"
                      placeholder={`Enter specific inspection observation for ${item.id}…`}
                      value={noteInputs[item.id] || ""}
                      onChange={(e) =>
                        setNoteInputs((prev) => ({ ...prev, [item.id]: e.target.value }))
                      }
                      style={{ fontSize: "0.8125rem", padding: "6px 10px" }}
                    />
                    <button
                      onClick={() => handleSaveItemNote(item.id)}
                      className="btn-secondary"
                      style={{ fontSize: "0.75rem", padding: "6px 14px", flexShrink: 0 }}
                    >
                      Save Note
                    </button>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Section 2: Technician Findings & Observations Form */}
      <div className="panel" style={{ padding: 20, marginBottom: 24 }}>
        <div className="section-label" style={{ marginBottom: 4 }}>
          TECHNICIAN OBSERVATIONS & ENGINEERING FINDINGS
        </div>
        <p style={{ margin: "0 0 12px", fontSize: "0.8125rem", color: "#94a3b8" }}>
          Record detailed telemetry data, test bench serial numbers, environmental chambers utilized, and
          qualitative findings. Mandatory for sign-off.
        </p>

        <textarea
          className="input-field"
          rows={5}
          disabled={isFinalized}
          value={findingsText}
          onChange={handleFindingsChange}
          onBlur={handleFindingsBlur}
          placeholder="Enter thorough technician observations, test instrument calibration references, and non-conformance details…"
          style={{
            lineHeight: 1.5,
            fontSize: "0.875rem",
            opacity: isFinalized ? 0.8 : 1,
            cursor: isFinalized ? "not-allowed" : "text",
          }}
        />

        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            marginTop: 8,
            fontSize: "0.75rem",
            color: "#64748b",
          }}
        >
          <span>
            {findingsText.trim().length === 0 ? (
              <span style={{ color: "#f87171" }}>⚠ Findings are required to complete inspection</span>
            ) : (
              <span style={{ color: "#22c55e" }}>✓ Findings recorded ({findingsText.length} characters)</span>
            )}
          </span>

          {!isFinalized && (
            <span>Changes are automatically saved to current session</span>
          )}
        </div>
      </div>

      {/* Section 3: Pre-flight Verification & Complete Action Card */}
      <div
        className="panel-elevated"
        style={{
          padding: 24,
          marginBottom: 24,
          border: isFinalized
            ? "1px solid #22c55e44"
            : failCount > 0
            ? "1px solid #f59e0b44"
            : "1px solid #2563eb44",
        }}
      >
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", flexWrap: "wrap", gap: 16 }}>
          <div>
            <h3
              className="font-display"
              style={{
                fontSize: "1.25rem",
                color: "#e2e8f0",
                margin: "0 0 6px",
                letterSpacing: "0.02em",
              }}
            >
              {isFinalized
                ? "INSPECTION FINALIZED & SIGNED OFF"
                : "FINAL INSPECTION COMPLETION & SIGN-OFF"}
            </h3>
            <p style={{ margin: 0, fontSize: "0.8125rem", color: "#94a3b8", maxWidth: 650, lineHeight: 1.5 }}>
              {isFinalized
                ? `This inspection was finalized on ${formatDateTime(inspection.updatedAt)} by ${inspection.assignedTechnician}. Status: ${inspection.status}. Records are locked against further modification.`
                : "Verify all quality criteria before executing final sign-off. If any criteria failed, the system will record an ATTENTION REQUIRED status to trigger QA quarantine escalation."}
            </p>
          </div>

          {/* Action Area */}
          <div>
            {isFinalized ? (
              <div
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  gap: 8,
                  padding: "8px 16px",
                  background: "rgba(34, 197, 94, 0.15)",
                  border: "1px solid #22c55e",
                  borderRadius: "5px",
                  color: "#4ade80",
                  fontWeight: 600,
                  fontSize: "0.8125rem",
                }}
              >
                <span>✓</span> Finalized & Anchored in Demo Session
              </div>
            ) : (
              <button
                type="button"
                onClick={() => setShowConfirmModal(true)}
                disabled={!canComplete || isSubmitting}
                className="btn-primary"
                style={{
                  padding: "10px 22px",
                  fontSize: "0.875rem",
                  background: failCount > 0 ? "#d97706" : "#2563eb",
                  boxShadow: "0 2px 10px rgba(0,0,0,0.3)",
                }}
              >
                {isSubmitting
                  ? "Finalizing..."
                  : failCount > 0
                  ? "Mark Attention Required (Failures Present) →"
                  : "Complete Inspection (All Passed) →"}
              </button>
            )}
          </div>
        </div>

        {/* Live Validation Checklist Summary */}
        {!isFinalized && (
          <div
            style={{
              marginTop: 18,
              paddingTop: 16,
              borderTop: "1px solid #1e3a60",
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
              gap: 12,
              fontSize: "0.8125rem",
            }}
          >
            <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
              <span style={{ color: uncheckedMandatory.length === 0 ? "#22c55e" : "#ef4444" }}>
                {uncheckedMandatory.length === 0 ? "✓" : "✕"}
              </span>
              <span style={{ color: uncheckedMandatory.length === 0 ? "#cbd5e1" : "#f87171" }}>
                {uncheckedMandatory.length === 0
                  ? "All mandatory checks completed"
                  : `${uncheckedMandatory.length} mandatory check(s) pending`}
              </span>
            </div>

            <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
              <span style={{ color: findingsText.trim().length > 0 ? "#22c55e" : "#ef4444" }}>
                {findingsText.trim().length > 0 ? "✓" : "✕"}
              </span>
              <span style={{ color: findingsText.trim().length > 0 ? "#cbd5e1" : "#f87171" }}>
                {findingsText.trim().length > 0
                  ? "Technician findings entered"
                  : "Technician findings missing"}
              </span>
            </div>

            <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
              <span style={{ color: failCount === 0 ? "#22c55e" : "#f59e0b" }}>
                {failCount === 0 ? "✓" : "⚠"}
              </span>
              <span style={{ color: failCount === 0 ? "#cbd5e1" : "#fbbf24" }}>
                {failCount === 0
                  ? "No failed criteria (Full Pass)"
                  : `${failCount} failed check(s) (Will flag Attention Required)`}
              </span>
            </div>
          </div>
        )}
      </div>

      {/* Confirmation Modal */}
      {showConfirmModal && (
        <div
          style={{
            position: "fixed",
            inset: 0,
            background: "rgba(7, 15, 29, 0.85)",
            backdropFilter: "blur(4px)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            zIndex: 100,
            padding: 16,
          }}
        >
          <div
            className="panel-elevated"
            style={{
              maxWidth: 520,
              width: "100%",
              padding: 24,
              border: "1px solid #1e3a60",
              boxShadow: "0 20px 40px rgba(0,0,0,0.6)",
            }}
          >
            <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 16 }}>
              <div
                style={{
                  width: 42,
                  height: 42,
                  borderRadius: "8px",
                  background: failCount > 0 ? "rgba(245, 158, 11, 0.15)" : "rgba(34, 197, 94, 0.15)",
                  border: `1px solid ${failCount > 0 ? "#f59e0b" : "#22c55e"}`,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontSize: "1.25rem",
                  color: failCount > 0 ? "#f59e0b" : "#22c55e",
                }}
              >
                {failCount > 0 ? "⚠" : "✓"}
              </div>
              <div>
                <h3 className="font-display" style={{ margin: 0, fontSize: "1.25rem", color: "#e2e8f0" }}>
                  Confirm Inspection Sign-Off
                </h3>
                <span className="meta-id" style={{ color: "#64748b", fontSize: "0.75rem" }}>
                  {inspection.id} · {inspection.assetId}
                </span>
              </div>
            </div>

            <div style={{ fontSize: "0.875rem", color: "#94a3b8", lineHeight: 1.5, marginBottom: 20 }}>
              {failCount > 0 ? (
                <div>
                  <strong style={{ color: "#fbbf24" }}>Attention Required:</strong> You are submitting an inspection
                  with <strong style={{ color: "#f87171" }}>{failCount} failed check(s)</strong>.
                  This will transition the asset status to{" "}
                  <strong style={{ color: "#fbbf24" }}>ATTENTION_REQUIRED</strong> and generate an audit escalation
                  alert for senior defense QA oversight.
                </div>
              ) : (
                <div>
                  All <strong style={{ color: "#4ade80" }}>{totalCount} criteria</strong> have passed successfully.
                  This action will mark the inspection as <strong style={{ color: "#4ade80" }}>COMPLETED</strong> and
                  update the asset quality record.
                </div>
              )}

              <div
                style={{
                  marginTop: 14,
                  padding: "8px 12px",
                  background: "#0c1828",
                  border: "1px solid #152b4a",
                  borderRadius: "4px",
                  fontSize: "0.75rem",
                }}
              >
                <div style={{ color: "#64748b" }}>Technician Identity:</div>
                <div style={{ color: "#e2e8f0", fontWeight: 600 }}>
                  {user?.name || "Rajesh Kumar"} ({user?.id || "did:bel:actor:003"})
                </div>
              </div>
            </div>

            <div style={{ display: "flex", justifyContent: "flex-end", gap: 10 }}>
              <button
                type="button"
                onClick={() => setShowConfirmModal(false)}
                className="btn-secondary"
                style={{ fontSize: "0.8125rem" }}
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleExecuteCompletion}
                className="btn-primary"
                style={{
                  fontSize: "0.8125rem",
                  background: failCount > 0 ? "#d97706" : "#2563eb",
                }}
              >
                Confirm & Sign Off
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Section 4: Inspection Event History & Audit Log */}
      <div className="panel" style={{ padding: 20 }}>
        <div className="section-label" style={{ marginBottom: 12 }}>
          INSPECTION AUDIT TIMELINE
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
          {inspection.history.map((evt, idx) => (
            <div
              key={evt.id || idx}
              style={{
                display: "flex",
                alignItems: "flex-start",
                gap: 14,
                paddingBottom: idx === inspection.history.length - 1 ? 0 : 14,
                borderBottom: idx === inspection.history.length - 1 ? "none" : "1px solid #152b4a",
              }}
            >
              <div
                style={{
                  width: 24,
                  height: 24,
                  borderRadius: "50%",
                  background: "rgba(37,99,235,0.15)",
                  border: "1px solid #2563eb",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontSize: "0.6875rem",
                  color: "#60a5fa",
                  flexShrink: 0,
                  marginTop: 2,
                }}
              >
                ●
              </div>

              <div style={{ flex: 1 }}>
                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: 8 }}>
                  <span style={{ fontSize: "0.8125rem", fontWeight: 600, color: "#e2e8f0" }}>
                    {evt.action}
                  </span>
                  <span className="meta-id" style={{ fontSize: "0.6875rem", color: "#64748b" }}>
                    {formatDateTime(evt.timestamp)}
                  </span>
                </div>

                <div style={{ fontSize: "0.75rem", color: "#94a3b8", marginTop: 2 }}>
                  {evt.details}
                </div>

                <div style={{ fontSize: "0.6875rem", color: "#475569", marginTop: 4 }}>
                  Actor: <strong style={{ color: "#64748b" }}>{evt.actor}</strong> ({evt.actorRole})
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
