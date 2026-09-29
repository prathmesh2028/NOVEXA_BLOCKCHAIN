import { useState } from "react";
import { getAllDemoRecords, getDemoRecordsByType, DemoRecord } from "../../data/demoData";

interface DemoDataDropdownProps {
  type?: DemoRecord['type'];
  onSelect: (record: DemoRecord) => void;
  label?: string;
  placeholder?: string;
  disabled?: boolean;
}

/**
 * Universal Demo Data Dropdown Component
 * 
 * Provides one-click access to real persisted demo records for judge-friendly workflows.
 * Supports filtering by record type (asset, certification, evidence, inspection).
 */
export default function DemoDataDropdown({
  type,
  onSelect,
  label = "Demo Data",
  placeholder = "Select demo record...",
  disabled = false,
}: DemoDataDropdownProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [selectedRecord, setSelectedRecord] = useState<DemoRecord | null>(null);

  const records = type ? getDemoRecordsByType(type) : getAllDemoRecords();

  const handleSelect = (record: DemoRecord) => {
    setSelectedRecord(record);
    onSelect(record);
    setIsOpen(false);
  };

  return (
    <div style={{ position: "relative", display: "inline-block" }}>
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        disabled={disabled}
        style={{
          padding: "8px 12px",
          background: selectedRecord ? "rgba(59, 130, 246, 0.1)" : "rgba(255, 255, 255, 0.05)",
          border: `1px solid ${selectedRecord ? "rgba(59, 130, 246, 0.3)" : "rgba(255, 255, 255, 0.1)"}`,
          borderRadius: "6px",
          color: selectedRecord ? "#60a5fa" : "#94a3b8",
          fontSize: "0.8125rem",
          cursor: disabled ? "not-allowed" : "pointer",
          display: "flex",
          alignItems: "center",
          gap: "8px",
          transition: "all 0.2s",
        }}
        onMouseEnter={(e) => !disabled && (e.currentTarget.style.borderColor = "rgba(59, 130, 246, 0.5)")}
        onMouseLeave={(e) => !disabled && (e.currentTarget.style.borderColor = selectedRecord ? "rgba(59, 130, 246, 0.3)" : "rgba(255, 255, 255, 0.1)")}
      >
        <span style={{ fontWeight: 500 }}>{label}</span>
        <span style={{ fontSize: "0.6875rem", opacity: 0.7 }}>▼</span>
      </button>

      {isOpen && !disabled && (
        <>
          <div
            style={{
              position: "fixed",
              inset: 0,
              zIndex: 9998,
            }}
            onClick={() => setIsOpen(false)}
          />
          <div
            style={{
              position: "absolute",
              top: "100%",
              left: 0,
              marginTop: "4px",
              background: "#0f172a",
              border: "1px solid rgba(255, 255, 255, 0.1)",
              borderRadius: "8px",
              boxShadow: "0 10px 40px rgba(0, 0, 0, 0.5)",
              zIndex: 9999,
              minWidth: "320px",
              maxHeight: "400px",
              overflowY: "auto",
            }}
          >
            <div style={{ padding: "12px", borderBottom: "1px solid rgba(255, 255, 255, 0.1)" }}>
              <div style={{ fontSize: "0.75rem", color: "#64748b", fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.05em" }}>
                {type ? `${type.toUpperCase()} RECORDS` : "ALL DEMO RECORDS"}
              </div>
            </div>
            
            {records.length === 0 ? (
              <div style={{ padding: "24px", textAlign: "center", color: "#64748b", fontSize: "0.8125rem" }}>
                No demo records available
              </div>
            ) : (
              records.map((record) => (
                <button
                  key={record.id}
                  type="button"
                  onClick={() => handleSelect(record)}
                  style={{
                    width: "100%",
                    padding: "12px",
                    background: "transparent",
                    border: "none",
                    textAlign: "left",
                    cursor: "pointer",
                    display: "flex",
                    flexDirection: "column",
                    gap: "4px",
                    transition: "background 0.15s",
                  }}
                  onMouseEnter={(e) => e.currentTarget.style.background = "rgba(255, 255, 255, 0.03)"}
                  onMouseLeave={(e) => e.currentTarget.style.background = "transparent"}
                >
                  <div style={{ fontSize: "0.8125rem", color: "#e2e8f0", fontWeight: 500 }}>
                    {record.label}
                  </div>
                  <div style={{ fontSize: "0.6875rem", color: "#64748b", fontFamily: "monospace" }}>
                    ID: {record.id.slice(0, 20)}...
                  </div>
                </button>
              ))
            )}
          </div>
        </>
      )}
    </div>
  );
}
