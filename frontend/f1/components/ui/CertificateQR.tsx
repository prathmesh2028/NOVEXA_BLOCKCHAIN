import { QRCodeSVG } from "qrcode.react";

interface CertificateQRProps {
  certId: string;
  assetId?: string;
  contractAddress?: string;
  size?: number;
  showLabel?: boolean;
}

/**
 * Certificate QR Code Component
 * 
 * Generates a QR code containing a secure verification locator for certificate verification.
 * 
 * SECURITY NOTE:
 * - QR contains ONLY public verification reference (cert_id)
 * - No passwords, JWTs, private keys, or sensitive data
 * - Verification endpoint must enforce authorization
 * - QR is a LOCATOR mechanism, not the security proof itself
 */
export default function CertificateQR({
  certId,
  assetId,
  contractAddress,
  size = 128,
  showLabel = true,
}: CertificateQRProps) {
  // Construct verification URL (public endpoint)
  // This should point to a verification page that requires no auth
  // but only exposes public certificate information
  const verificationUrl = `${window.location.origin}/verify/cert/${certId}`;

  return (
    <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "12px" }}>
      <div
        style={{
          padding: "16px",
          background: "white",
          borderRadius: "8px",
          boxShadow: "0 4px 20px rgba(0, 0, 0, 0.3)",
        }}
      >
        <QRCodeSVG
          value={verificationUrl}
          size={size}
          level="M"
          includeMargin={false}
        />
      </div>
      
      {showLabel && (
        <div style={{ textAlign: "center" }}>
          <div style={{ fontSize: "0.6875rem", color: "#64748b", marginBottom: "4px" }}>
            Scan to verify certificate
          </div>
          <div style={{ fontSize: "0.625rem", color: "#475569", fontFamily: "monospace" }}>
            {certId}
          </div>
        </div>
      )}
    </div>
  );
}
