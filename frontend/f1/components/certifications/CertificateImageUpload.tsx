import React, { useState, useRef } from "react";

// Crisp SVG data-URLs for instant one-click testing of defence certificate seals
export const PRESET_CERTIFICATE_SEALS = [
  {
    id: "bel-qa-seal",
    name: "BEL Defence QA Seal",
    subtitle: "Govt of India Certified",
    color: "#22c55e",
    dataUrl: `data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="300" height="300" viewBox="0 0 300 300">
      <defs>
        <radialGradient id="grad" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stop-color="%231e3a60" />
          <stop offset="100%" stop-color="%230b1322" />
        </radialGradient>
      </defs>
      <circle cx="150" cy="150" r="140" fill="url(%23grad)" stroke="%2322c55e" stroke-width="6" stroke-dasharray="8 4"/>
      <circle cx="150" cy="150" r="120" fill="none" stroke="%2322c55e" stroke-width="2"/>
      <polygon points="150,55 170,110 230,110 180,145 200,205 150,170 100,205 120,145 70,110 130,110" fill="%2322c55e" opacity="0.15"/>
      <text x="150" y="95" font-family="Arial, sans-serif" font-size="13" font-weight="bold" fill="%2322c55e" text-anchor="middle" letter-spacing="2">★ BHARAT ELECTRONICS ★</text>
      <text x="150" y="145" font-family="Arial, sans-serif" font-size="20" font-weight="900" fill="%23ffffff" text-anchor="middle" letter-spacing="1">QA PASSED</text>
      <text x="150" y="170" font-family="Arial, sans-serif" font-size="11" font-weight="600" fill="%2394a3b8" text-anchor="middle" letter-spacing="1">DEFENCE SPEC 2026</text>
      <text x="150" y="210" font-family="monospace" font-size="10" fill="%2322c55e" text-anchor="middle">SOULBOUND SEAL #8894</text>
      <text x="150" y="235" font-family="Arial, sans-serif" font-size="9" fill="%2364748b" text-anchor="middle">TAMPER-EVIDENT MERKLE ROOT</text>
    </svg>`,
  },
  {
    id: "iso-milspec-seal",
    name: "MIL-STD-810H & ISO-9001",
    subtitle: "Aerospace & Tactical Rating",
    color: "#3b82f6",
    dataUrl: `data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="300" height="300" viewBox="0 0 300 300">
      <defs>
        <radialGradient id="grad2" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stop-color="%231e293b" />
          <stop offset="100%" stop-color="%2309111f" />
        </radialGradient>
      </defs>
      <rect x="20" y="20" width="260" height="260" rx="24" fill="url(%23grad2)" stroke="%233b82f6" stroke-width="4"/>
      <circle cx="150" cy="150" r="90" fill="none" stroke="%233b82f6" stroke-width="2" stroke-dasharray="4 4"/>
      <text x="150" y="80" font-family="Arial, sans-serif" font-size="12" font-weight="bold" fill="%2360a5fa" text-anchor="middle" letter-spacing="2">DEFENCE STANDARD</text>
      <text x="150" y="140" font-family="Arial, sans-serif" font-size="22" font-weight="900" fill="%23ffffff" text-anchor="middle">MIL-STD-810H</text>
      <text x="150" y="170" font-family="Arial, sans-serif" font-size="14" font-weight="700" fill="%2338bdf8" text-anchor="middle">CERTIFIED</text>
      <text x="150" y="220" font-family="monospace" font-size="10" fill="%2394a3b8" text-anchor="middle">BLOCKCHAIN PROOF ANCHORED</text>
    </svg>`,
  },
  {
    id: "drdo-crypt-seal",
    name: "Cryptographic Trust Seal",
    subtitle: "Soulbound Token Endorsement",
    color: "#a855f7",
    dataUrl: `data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="300" height="300" viewBox="0 0 300 300">
      <defs>
        <radialGradient id="grad3" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stop-color="%232e1065" />
          <stop offset="100%" stop-color="%230b0d1b" />
        </radialGradient>
      </defs>
      <polygon points="150,20 270,80 270,220 150,280 30,220 30,80" fill="url(%23grad3)" stroke="%23a855f7" stroke-width="5"/>
      <text x="150" y="90" font-family="Arial, sans-serif" font-size="12" font-weight="bold" fill="%23c084fc" text-anchor="middle" letter-spacing="1">IMMUTABLE CERTIFICATE</text>
      <text x="150" y="145" font-family="Arial, sans-serif" font-size="26" font-weight="900" fill="%23ffffff" text-anchor="middle">SOULBOUND</text>
      <text x="150" y="180" font-family="Arial, sans-serif" font-size="12" font-weight="bold" fill="%23a855f7" text-anchor="middle">BEL-TRUST-CHAIN</text>
      <text x="150" y="225" font-family="monospace" font-size="10" fill="%23e2e8f0" text-anchor="middle">EIP-5192 SBT VERIFIED</text>
    </svg>`,
  },
];

interface CertificateImageUploadProps {
  value?: string | null;
  fileName?: string | null;
  onChange: (dataUrl: string | null, fileName?: string) => void;
  required?: boolean;
}

export default function CertificateImageUpload({
  value,
  fileName,
  onChange,
  required = false,
}: CertificateImageUploadProps) {
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const handleFileChange = (file: File) => {
    if (!file) return;

    if (!file.type.startsWith("image/") && file.type !== "application/pdf") {
      alert("Please upload a valid image (PNG, JPG, WEBP, SVG) or PDF certificate document.");
      return;
    }

    const reader = new FileReader();
    reader.onload = (e) => {
      const result = e.target?.result as string;
      onChange(result, file.name);
    };
    reader.readAsDataURL(file);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      handleFileChange(e.dataTransfer.files[0]);
    }
  };

  const selectPreset = (preset: (typeof PRESET_CERTIFICATE_SEALS)[0]) => {
    onChange(preset.dataUrl, `${preset.name.toLowerCase().replace(/\s+/g, "_")}.svg`);
  };

  const handleRemove = (e: React.MouseEvent) => {
    e.stopPropagation();
    onChange(null, "");
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <label
          style={{
            fontSize: "0.75rem",
            fontWeight: 600,
            color: "#94a3b8",
            display: "flex",
            alignItems: "center",
            gap: 6,
          }}
        >
          <span>Certificate Document / Badge Image</span>
          {required && <span style={{ color: "#ef4444" }}>*</span>}
          <span style={{ fontSize: "0.6875rem", color: "#64748b", fontWeight: 400 }}>
            (PNG, JPG, SVG, WebP)
          </span>
        </label>
        {value && (
          <button
            type="button"
            onClick={handleRemove}
            style={{
              background: "none",
              border: "none",
              color: "#ef4444",
              fontSize: "0.75rem",
              fontWeight: 600,
              cursor: "pointer",
              padding: "2px 6px",
            }}
          >
            ✕ Remove Image
          </button>
        )}
      </div>

      {/* Hidden File Input */}
      <input
        ref={fileInputRef}
        type="file"
        accept="image/png,image/jpeg,image/jpg,image/webp,image/svg+xml,application/pdf"
        style={{ display: "none" }}
        onChange={(e) => {
          if (e.target.files && e.target.files[0]) {
            handleFileChange(e.target.files[0]);
          }
        }}
      />

      {/* Upload Box / Preview Area */}
      {value ? (
        <div
          style={{
            position: "relative",
            display: "flex",
            alignItems: "center",
            gap: 14,
            padding: 12,
            background: "var(--panel-muted, #F1F1F2)",
            border: "1px solid var(--border, #DADADA)",
            borderRadius: 6,
          }}
        >
          <div
            style={{
              width: 64,
              height: 64,
              borderRadius: 6,
              overflow: "hidden",
              border: "1px solid var(--border, rgba(59, 130, 246, 0.4))",
              background: "var(--card, #FFFFFF)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              flexShrink: 0,
            }}
          >
            <img
              src={value}
              alt="Certificate Preview"
              style={{
                width: "100%",
                height: "100%",
                objectFit: "contain",
              }}
            />
          </div>

          <div style={{ flex: 1, minWidth: 0 }}>
            <div
              style={{
                fontSize: "0.8125rem",
                fontWeight: 600,
                color: "var(--foreground, #171717)",
                whiteSpace: "nowrap",
                overflow: "hidden",
                textOverflow: "ellipsis",
              }}
            >
              {fileName || "certificate_seal.svg"}
            </div>
            <div
              style={{
                fontSize: "0.6875rem",
                color: "#16a34a",
                marginTop: 2,
                display: "flex",
                alignItems: "center",
                gap: 4,
                fontWeight: 600,
              }}
            >
              <span>✓</span> Attached to Soulbound Minting Payload
            </div>
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              style={{
                marginTop: 6,
                background: "none",
                border: "none",
                color: "var(--primary, #2563eb)",
                fontSize: "0.75rem",
                cursor: "pointer",
                padding: 0,
                textDecoration: "underline",
                fontWeight: 500,
              }}
            >
              Replace Image
            </button>
          </div>
        </div>
      ) : (
        <div
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          onClick={() => fileInputRef.current?.click()}
          style={{
            padding: "18px 16px",
            border: isDragging ? "2px dashed #2563eb" : "1px dashed var(--border, #DADADA)",
            borderRadius: 6,
            background: isDragging ? "rgba(37, 99, 235, 0.08)" : "var(--panel-muted, #F1F1F2)",
            cursor: "pointer",
            textAlign: "center",
            transition: "all 0.2s ease",
          }}
        >
          <div style={{ fontSize: "1.5rem", marginBottom: 6 }}>🛡️</div>
          <div style={{ fontSize: "0.8125rem", fontWeight: 600, color: "var(--foreground, #171717)" }}>
            Click to upload or drag & drop certificate image / seal
          </div>
          <div style={{ fontSize: "0.6875rem", color: "var(--subtle-text, #707070)", marginTop: 4 }}>
            Supported formats: PNG, JPG, WEBP, SVG (Max 5MB)
          </div>
        </div>
      )}

      {/* Preset Defense Seals */}
      <div style={{ marginTop: 2 }}>
        <div
          style={{
            fontSize: "0.6875rem",
            fontWeight: 600,
            color: "var(--subtle-text, #707070)",
            textTransform: "uppercase",
            letterSpacing: "0.05em",
            marginBottom: 6,
          }}
        >
          Or select an official defence preset seal:
        </div>
        <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
          {PRESET_CERTIFICATE_SEALS.map((preset) => (
            <button
              key={preset.id}
              type="button"
              onClick={() => selectPreset(preset)}
              style={{
                padding: "4px 9px",
                borderRadius: 4,
                background: "var(--card, #FFFFFF)",
                border: `1px solid ${preset.color}40`,
                color: "var(--foreground, #171717)",
                fontSize: "0.6875rem",
                fontWeight: 600,
                cursor: "pointer",
                display: "inline-flex",
                alignItems: "center",
                gap: 5,
                transition: "all 0.15s ease",
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.borderColor = preset.color;
                e.currentTarget.style.background = `${preset.color}15`;
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.borderColor = `${preset.color}40`;
                e.currentTarget.style.background = "var(--card, #FFFFFF)";
              }}
            >
              <span style={{ width: 6, height: 6, borderRadius: "50%", background: preset.color }} />
              {preset.name}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
