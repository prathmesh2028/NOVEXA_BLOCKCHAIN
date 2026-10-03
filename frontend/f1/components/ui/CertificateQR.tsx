import { useEffect, useRef, useState } from "react";
import QRCode from "qrcode";

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
  const [qrDataUrl, setQrDataUrl] = useState<string | null>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  // Construct verification URL (public endpoint)
  const verificationUrl = `${window.location.origin}/verify/cert/${certId}`;

  useEffect(() => {
    const generateQR = async () => {
      try {
        const dataUrl = await QRCode.toDataURL(verificationUrl, {
          width: size,
          margin: 1,
          color: {
            dark: "#000000",
            light: "#ffffff",
          },
        });
        setQrDataUrl(dataUrl);
      } catch (error) {
        console.error("Failed to generate QR code:", error);
      }
    };

    generateQR();
  }, [verificationUrl, size]);

  if (!qrDataUrl) {
    return (
      <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "12px" }}>
        <div
          style={{
            padding: "16px",
            background: "#f3f4f6",
            borderRadius: "8px",
            width: size,
            height: size,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            fontSize: "0.75rem",
            color: "#6b7280",
            textAlign: "center",
          }}
        >
          Loading QR...
        </div>
      </div>
    );
  }

  return (
    <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "12px" }}>
      <img
        src={qrDataUrl}
        alt="Certificate QR Code"
        style={{
          width: size,
          height: size,
          padding: "8px",
          background: "#ffffff",
          borderRadius: "8px",
          boxShadow: "0 4px 20px rgba(0, 0, 0, 0.1)",
          border: "1px solid #e5e7eb",
        }}
      />

      {showLabel && (
        <div style={{ textAlign: "center" }}>
          <div style={{ fontSize: "0.6875rem", color: "#64748b", marginBottom: "4px" }}>
            Certificate ID
          </div>
          <div style={{ fontSize: "0.625rem", color: "#475569", fontFamily: "monospace" }}>
            {certId}
          </div>
        </div>
      )}
    </div>
  );
}
