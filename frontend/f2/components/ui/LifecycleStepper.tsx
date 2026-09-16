import type { LifecycleState } from "../../data/mockData";

const LIFECYCLE_STEPS = [
  { key: "UNREGISTERED", label: "Unregistered" },
  { key: "SUPPLIER_DECLARED", label: "Supplier Declared" },
  { key: "RECEIVED", label: "Received" },
  { key: "INSPECTION_RECORDED", label: "Inspection Recorded" },
] as const;

const TERMINAL = {
  ACCEPTED_FOR_ASSEMBLY: { label: "Accepted for Assembly", color: "#22c55e" },
  REJECTED_QUARANTINED: { label: "Rejected / Quarantined", color: "#ef4444" },
};

interface LifecycleStepperProps {
  current: LifecycleState;
}

export default function LifecycleStepper({ current }: LifecycleStepperProps) {
  const isRejected = current === "REJECTED_QUARANTINED";
  const isAccepted = current === "ACCEPTED_FOR_ASSEMBLY";
  const isTerminal = isRejected || isAccepted;

  const mainStepIndex = isTerminal
    ? LIFECYCLE_STEPS.length
    : LIFECYCLE_STEPS.findIndex((s) => s.key === current);

  return (
    <div style={{ padding: "20px 0" }}>
      {/* Main steps */}
      <div style={{ display: "flex", alignItems: "flex-start", gap: 0 }}>
        {LIFECYCLE_STEPS.map((step, i) => {
          const done = i < mainStepIndex || (isTerminal && i < LIFECYCLE_STEPS.length);
          const active = !isTerminal && step.key === current;
          return (
            <div key={step.key} style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center" }}>
              <div style={{ display: "flex", alignItems: "center", width: "100%" }}>
                {i > 0 && (
                  <div
                    style={{
                      flex: 1,
                      height: "2px",
                      background: done ? "#2563eb" : "#1e3a60",
                      transition: "background 0.3s",
                    }}
                  />
                )}
                <div
                  style={{
                    width: 28,
                    height: 28,
                    borderRadius: "50%",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    fontSize: "0.75rem",
                    fontWeight: 700,
                    flexShrink: 0,
                    border: "2px solid",
                    borderColor: done ? "#2563eb" : active ? "#3b82f6" : "#1e3a60",
                    background: done ? "#2563eb" : active ? "rgba(59,130,246,0.15)" : "transparent",
                    color: done ? "#fff" : active ? "#60a5fa" : "#475569",
                    transition: "all 0.3s",
                  }}
                >
                  {done ? "✓" : i + 1}
                </div>
                {i < LIFECYCLE_STEPS.length - 1 && (
                  <div
                    style={{
                      flex: 1,
                      height: "2px",
                      background: i < mainStepIndex - 1 || (isTerminal && i < LIFECYCLE_STEPS.length - 1)
                        ? "#2563eb"
                        : "#1e3a60",
                    }}
                  />
                )}
              </div>
              <div
                style={{
                  marginTop: 8,
                  fontSize: "0.6875rem",
                  textAlign: "center",
                  color: done ? "#60a5fa" : active ? "#e2e8f0" : "#475569",
                  fontWeight: active ? 600 : 400,
                  maxWidth: 80,
                  lineHeight: 1.3,
                }}
              >
                {step.label}
              </div>
            </div>
          );
        })}

        {/* Connector to terminal */}
        <div style={{ display: "flex", flexDirection: "column", alignItems: "center" }}>
          <div style={{ display: "flex", alignItems: "center" }}>
            <div
              style={{
                width: 40,
                height: "2px",
                background: isTerminal ? (isAccepted ? "#22c55e" : "#ef4444") : "#1e3a60",
              }}
            />
            <div
              style={{
                width: 28,
                height: 28,
                borderRadius: "50%",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontSize: "0.75rem",
                fontWeight: 700,
                border: "2px solid",
                borderColor: isTerminal
                  ? isAccepted ? "#22c55e" : "#ef4444"
                  : "#1e3a60",
                background: isTerminal
                  ? isAccepted ? "rgba(34,197,94,0.15)" : "rgba(239,68,68,0.15)"
                  : "transparent",
                color: isTerminal
                  ? isAccepted ? "#22c55e" : "#ef4444"
                  : "#475569",
              }}
            >
              {isTerminal ? (isAccepted ? "✓" : "✕") : "5"}
            </div>
          </div>
          <div
            style={{
              marginTop: 8,
              fontSize: "0.6875rem",
              textAlign: "center",
              color: isTerminal
                ? isAccepted ? "#22c55e" : "#ef4444"
                : "#475569",
              fontWeight: isTerminal ? 600 : 400,
              maxWidth: 100,
              lineHeight: 1.3,
            }}
          >
            {isTerminal
              ? TERMINAL[current as keyof typeof TERMINAL]?.label ?? current
              : "Terminal State"}
          </div>
        </div>
      </div>
    </div>
  );
}
