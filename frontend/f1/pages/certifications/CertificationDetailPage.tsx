import { useState, useEffect } from "react";
import { useParams, Link, useNavigate } from "react-router";
import PageHeader from "../../components/ui/PageHeader";
import { formatDateTime, shortHash } from "../../data/utils";
import { certificationService, CertificationResponse } from "../../services/certifications";
import DemoDataDropdown from "../../components/ui/DemoDataDropdown";
import CertificateQR from "../../components/ui/CertificateQR";
import { DemoRecord } from "../../data/demoData";
import { useAuth } from "../../context/AuthContext";
import { useWallet } from "../../features/wallet/WalletContext";

export default function CertificationDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { logout } = useAuth();
  const { address: connectedWallet, chainId: connectedChainId } = useWallet();
  const [copiedField, setCopiedField] = useState<string | null>(null);

  const [cert, setCert] = useState<CertificationResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isPermissionError, setIsPermissionError] = useState(false);
  const [proof, setProof] = useState<Awaited<ReturnType<typeof certificationService.getBlockchainProof>> | null>(null);
  const [walletMessage, setWalletMessage] = useState<string | null>(null);

  const handleDemoDataSelect = (record: DemoRecord) => {
    if (record.type === 'certification') {
      navigate(`/app/certifications/${record.id}`);
    }
  };

  useEffect(() => {
    if (!id) return;
    setLoading(true);
    setError(null);
    setIsPermissionError(false);
    certificationService.getCertification(id)
      .then(async (loadedCert) => {
        setCert(loadedCert);
        if (loadedCert.status === "CONFIRMED" && loadedCert.token_id && loadedCert.contract_address) {
          try {
            setProof(await certificationService.getBlockchainProof(loadedCert.id));
          } catch (proofError) {
            console.error("Failed to load on-chain certification proof:", proofError);
          }
        }
      })
      .catch((err) => {
        console.error("Failed to load certification:", err);
        const errorMessage = err.message || "Failed to load certification";
        setError(errorMessage);
        // Detect permission errors
        if (errorMessage.includes("Insufficient permissions") || errorMessage.includes("403") || errorMessage.includes("Forbidden")) {
          setIsPermissionError(true);
        }
      })
      .finally(() => setLoading(false));
  }, [id]);

  const addToMetaMask = async () => {
    setWalletMessage(null);
    const ethereum = (window as Window & {
      ethereum?: { request: (args: { method: string; params?: unknown[] }) => Promise<unknown> };
    }).ethereum;
    const chainId = proof?.network.chain_id;
    const token = proof?.on_chain;
    if (!ethereum || !token || !chainId) {
      setWalletMessage("Wallet import is unavailable until the confirmed token proof is loaded.");
      return;
    }
    try {
      const currentChainId = Number(await ethereum.request({ method: "eth_chainId" }));
      if (currentChainId !== chainId) {
        await ethereum.request({
          method: "wallet_switchEthereumChain",
          params: [{ chainId: `0x${chainId.toString(16)}` }],
        });
      }
      await ethereum.request({
        method: "wallet_watchAsset",
        params: [{
          type: "ERC721",
          options: { address: token.contract_address, tokenId: token.token_id },
        }],
      });
      setWalletMessage("MetaMask import request sent for this real certification token.");
    } catch (error: any) {
      console.error("MetaMask NFT import failed:", error);
      setWalletMessage(
        "This MetaMask version does not expose NFT import for this custom network. " +
        `Use contract ${token.contract_address} and token ${token.token_id} in Import NFT.`,
      );
    }
  };

  const copyToClipboard = (text: string, fieldName: string) => {
    if (navigator.clipboard) {
      navigator.clipboard.writeText(text);
      setCopiedField(fieldName);
      setTimeout(() => setCopiedField(null), 2000);
    }
  };

  // Loading state
  if (loading) {
    return (
      <div className="page-fade" style={{ maxWidth: "800px", margin: "60px auto", textAlign: "center" }}>
        <div className="panel" style={{ padding: "60px 32px", background: "#0a1320", border: "1px solid #1e3a60", borderRadius: "8px" }}>
          <div style={{ color: "#94a3b8", fontSize: "0.875rem" }}>Loading certification...</div>
        </div>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="page-fade" style={{ maxWidth: "800px", margin: "60px auto", textAlign: "center" }}>
        <div className="panel" style={{ padding: "60px 32px", background: "#0a1320", border: "1px solid #1e3a60", borderRadius: "8px" }}>
          <div
            style={{
              width: 64,
              height: 64,
              borderRadius: "50%",
              background: isPermissionError ? "rgba(245, 158, 11, 0.12)" : "rgba(239, 68, 68, 0.12)",
              border: isPermissionError ? "1px solid rgba(245, 158, 11, 0.3)" : "1px solid rgba(239, 68, 68, 0.3)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: "2rem",
              color: isPermissionError ? "#f59e0b" : "#ef4444",
              margin: "0 auto 20px",
            }}
          >
            {isPermissionError ? "⚠" : "✕"}
          </div>
          <h2
            className="font-display"
            style={{
              fontSize: "1.75rem",
              fontWeight: 700,
              color: "#e2e8f0",
              marginBottom: 10,
              letterSpacing: "0.02em",
            }}
          >
            {isPermissionError ? "SESSION EXPIRED" : "ERROR LOADING CERTIFICATION"}
          </h2>
          <p
            style={{
              color: "#94a3b8",
              fontSize: "0.875rem",
              marginBottom: 24,
              lineHeight: 1.6,
            }}
          >
            {isPermissionError 
              ? "Your session has expired or you don't have permission to access this certification. Please login again to continue."
              : error}
          </p>
          <div style={{ display: "flex", gap: 12, justifyContent: "center" }}>
            {isPermissionError ? (
              <button
                onClick={() => {
                  logout();
                  navigate("/login");
                }}
                className="btn-primary"
                style={{ padding: "10px 20px", border: "none", cursor: "pointer" }}
              >
                Re-login
              </button>
            ) : (
              <Link
                to="/app/certifications"
                className="btn-primary"
                style={{ padding: "10px 20px", textDecoration: "none" }}
              >
                Back to Certifications
              </Link>
            )}
          </div>
        </div>
      </div>
    );
  }

  // If certificate not found (after successful load but null result)
  if (!cert) {
    return (
      <div
        className="page-fade"
        style={{ maxWidth: "800px", margin: "60px auto", textAlign: "center" }}
      >
        <div className="panel" style={{ padding: "60px 32px", background: "#0a1320", border: "1px solid #1e3a60", borderRadius: "8px" }}>
          <div
            style={{
              width: 64,
              height: 64,
              borderRadius: "50%",
              background: "rgba(239, 68, 68, 0.12)",
              border: "1px solid rgba(239, 68, 68, 0.3)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: "2rem",
              color: "#ef4444",
              margin: "0 auto 20px",
            }}
          >
            ✕
          </div>
          <h2
            className="font-display"
            style={{
              fontSize: "1.75rem",
              fontWeight: 700,
              color: "#e2e8f0",
              marginBottom: 10,
              letterSpacing: "0.02em",
            }}
          >
            CERTIFICATION RECORD NOT FOUND
          </h2>
          <p
            style={{
              color: "#94a3b8",
              fontSize: "0.875rem",
              marginBottom: 24,
              lineHeight: 1.6,
            }}
          >
            No sovereign defence certificate or airworthiness record exists for identifier:{" "}
            <span className="font-mono-id" style={{ color: "#f87171" }}>
              {id}
            </span>
            . Please check your certificate identifier or consult the certification registry.
          </p>
          <Link
            to="/app/certifications"
            className="btn-primary"
            style={{ padding: "10px 20px", textDecoration: "none" }}
          >
            ← Back to Certifications
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="page-fade" style={{ maxWidth: "1200px", margin: "0 auto" }}>
      <PageHeader
        title={cert.cert_id}
        subtitle={`Asset: ${cert.asset_id}`}
        breadcrumbs={[
          { label: "Dashboard", to: "/app/dashboard" },
          { label: "Certifications", to: "/app/certifications" },
          { label: cert.cert_id },
        ]}
        actions={
          <div style={{ display: "flex", gap: 8 }}>
            <DemoDataDropdown type="certification" onSelect={handleDemoDataSelect} />
            <Link
              to="/app/certifications"
              className="btn-ghost"
            style={{
              fontSize: "0.8125rem",
              padding: "6px 14px",
              textDecoration: "none",
            }}
          >
            ← Back to Certifications
          </Link>
          </div>
        }
      />

      <div className="panel" style={{ padding: "24px", marginBottom: "20px" }}>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(250px, 1fr))", gap: "20px" }}>
          <div>
            <div style={{ fontSize: "0.6875rem", color: "#64748b", fontWeight: 600, letterSpacing: "0.06em", textTransform: "uppercase", marginBottom: "6px" }}>
              Certification ID
            </div>
            <div style={{ fontSize: "0.9375rem", color: "#e2e8f0", fontWeight: 500 }}>
              {cert.cert_id}
            </div>
          </div>
          <div>
            <div style={{ fontSize: "0.6875rem", color: "#64748b", fontWeight: 600, letterSpacing: "0.06em", textTransform: "uppercase", marginBottom: "6px" }}>
              Asset ID
            </div>
            <div style={{ fontSize: "0.9375rem", color: "#e2e8f0", fontWeight: 500 }}>
              {cert.asset_id}
            </div>
          </div>
          <div>
            <div style={{ fontSize: "0.6875rem", color: "#64748b", fontWeight: 600, letterSpacing: "0.06em", textTransform: "uppercase", marginBottom: "6px" }}>
              Batch ID
            </div>
            <div style={{ fontSize: "0.9375rem", color: "#e2e8f0", fontWeight: 500 }}>
              {cert.batch_id || "N/A"}
            </div>
          </div>
          <div>
            <div style={{ fontSize: "0.6875rem", color: "#64748b", fontWeight: 600, letterSpacing: "0.06em", textTransform: "uppercase", marginBottom: "6px" }}>
              Status
            </div>
            <div style={{ fontSize: "0.9375rem", color: cert.status === "CONFIRMED" ? "#22c55e" : cert.status === "PENDING" ? "#f59e0b" : "#ef4444", fontWeight: 600 }}>
              {cert.status}
            </div>
            {cert.status === "CONFIRMED" && cert.token_id && cert.tx_hash && (
              <div style={{ marginTop: "4px", fontSize: "0.6875rem", color: "#94a3b8", fontWeight: 600, letterSpacing: "0.06em" }}>
                ALREADY MINTED
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="panel" style={{ padding: "24px", marginBottom: "20px" }}>
        <h3 style={{ fontSize: "1rem", fontWeight: 600, color: "#e2e8f0", marginBottom: "16px" }}>
          Blockchain Information
        </h3>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(250px, 1fr))", gap: "20px" }}>
          <div>
            <div style={{ fontSize: "0.6875rem", color: "#64748b", fontWeight: 600, letterSpacing: "0.06em", textTransform: "uppercase", marginBottom: "6px" }}>
              Token ID
            </div>
            <div style={{ fontSize: "0.9375rem", color: "#e2e8f0", fontWeight: 500 }}>
              {cert.token_id || "Pending"}
            </div>
          </div>
          <div>
            <div style={{ fontSize: "0.6875rem", color: "#64748b", fontWeight: 600, letterSpacing: "0.06em", textTransform: "uppercase", marginBottom: "6px" }}>
              Transaction Hash
            </div>
            <div style={{ fontSize: "0.875rem", color: "#e2e8f0", fontWeight: 500, fontFamily: "monospace" }}>
              {cert.tx_hash ? (
                <span
                  style={{ cursor: "pointer" }}
                  onClick={() => copyToClipboard(cert.tx_hash!, "txHash")}
                >
                  {shortHash(cert.tx_hash)}
                  {copiedField === "txHash" && " ✓"}
                </span>
              ) : (
                "Pending"
              )}
            </div>
          </div>
          <div>
            <div style={{ fontSize: "0.6875rem", color: "#64748b", fontWeight: 600, letterSpacing: "0.06em", textTransform: "uppercase", marginBottom: "6px" }}>
              Block Number
            </div>
            <div style={{ fontSize: "0.9375rem", color: "#e2e8f0", fontWeight: 500 }}>
              {cert.block_number || "Pending"}
            </div>
          </div>
          <div>
            <div style={{ fontSize: "0.6875rem", color: "#64748b", fontWeight: 600, letterSpacing: "0.06em", textTransform: "uppercase", marginBottom: "6px" }}>
              Network
            </div>
            <div style={{ fontSize: "0.9375rem", color: "#e2e8f0", fontWeight: 500 }}>
              {cert.network || "BEL-TRUST-CHAIN"}
            </div>
          </div>
          <div>
            <div style={{ fontSize: "0.6875rem", color: "#64748b", fontWeight: 600, letterSpacing: "0.06em", textTransform: "uppercase", marginBottom: "6px" }}>
              Contract
            </div>
            <div style={{ fontSize: "0.75rem", color: "#e2e8f0", fontFamily: "monospace", wordBreak: "break-all" }}>
              {cert.contract_address || "Pending"}
            </div>
          </div>
          <div>
            <div style={{ fontSize: "0.6875rem", color: "#64748b", fontWeight: 600, letterSpacing: "0.06em", textTransform: "uppercase", marginBottom: "6px" }}>
              Wallet Owner
            </div>
            <div style={{ fontSize: "0.75rem", color: "#e2e8f0", fontFamily: "monospace", wordBreak: "break-all" }}>
              {proof?.on_chain?.owner || "Verifying on-chain..."}
            </div>
          </div>
        </div>
        {cert.status === "CONFIRMED" && proof?.on_chain && (
          <div style={{ marginTop: "20px", paddingTop: "16px", borderTop: "1px solid #1e3a60" }}>
            <div style={{ color: proof.consistency.owner_verified ? "#22c55e" : "#f59e0b", fontWeight: 600, marginBottom: "8px" }}>
              {proof.consistency.owner_verified ? "✓ Blockchain Confirmed" : "⚠ Owner requires review"}
            </div>
            <div style={{ color: "#94a3b8", fontSize: "0.8125rem", lineHeight: 1.6 }}>
              ERC-721: {proof.on_chain.supportsErc721 ? "yes" : "no"} ·
              {" "}IERC-5192 locked: {proof.on_chain.locked ? "yes" : "no"} ·
              {" "}Metadata URI: {proof.on_chain.tokenUri || "not configured on deployed contract"}
            </div>
            <div style={{ display: "flex", gap: "10px", alignItems: "center", flexWrap: "wrap", marginTop: "14px" }}>
              <button
                type="button"
                className="btn-primary"
                onClick={addToMetaMask}
                disabled={!connectedWallet || connectedChainId !== proof.network.chain_id}
                style={{ border: "none", cursor: "pointer" }}
                title={!connectedWallet ? "Connect MetaMask first" : connectedChainId !== proof.network.chain_id ? "Switch MetaMask to BEL Trust Chain (31337)" : "Request NFT import in MetaMask"}
              >
                View in Wallet / Add to MetaMask
              </button>
              <span style={{ color: "#64748b", fontSize: "0.75rem" }}>
                Connected wallet: {connectedWallet || "not connected"} · Network: {connectedChainId === proof.network.chain_id ? "BEL Trust Chain" : "switch required"}
              </span>
            </div>
            {walletMessage && (
              <div style={{ color: "#fbbf24", fontSize: "0.8125rem", marginTop: "10px" }}>{walletMessage}</div>
            )}
          </div>
        )}
      </div>

      <div className="panel" style={{ padding: "24px", marginBottom: "20px" }}>
        <h3 style={{ fontSize: "1rem", fontWeight: 600, color: "#e2e8f0", marginBottom: "16px" }}>
          Digital Verification Locator
        </h3>
        <div style={{ display: "flex", justifyContent: "center", padding: "16px 0" }}>
          <CertificateQR
            certId={cert.cert_id}
            assetId={cert.asset_id}
            contractAddress={cert.contract_address || undefined}
            size={160}
            showLabel={true}
          />
        </div>
        <div style={{ textAlign: "center", fontSize: "0.75rem", color: "#64748b", marginTop: "8px" }}>
          Scan this locator code to retrieve digital provenance records from the verification system.
        </div>
      </div>

      <div className="panel" style={{ padding: "24px", marginBottom: "20px" }}>
        <h3 style={{ fontSize: "1rem", fontWeight: 600, color: "#e2e8f0", marginBottom: "16px" }}>
          Issuance Information
        </h3>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(250px, 1fr))", gap: "20px" }}>
          <div>
            <div style={{ fontSize: "0.6875rem", color: "#64748b", fontWeight: 600, letterSpacing: "0.06em", textTransform: "uppercase", marginBottom: "6px" }}>
              Issued By
            </div>
            <div style={{ fontSize: "0.9375rem", color: "#e2e8f0", fontWeight: 500 }}>
              {cert.issued_by || "N/A"}
            </div>
          </div>
          <div>
            <div style={{ fontSize: "0.6875rem", color: "#64748b", fontWeight: 600, letterSpacing: "0.06em", textTransform: "uppercase", marginBottom: "6px" }}>
              Issued At
            </div>
            <div style={{ fontSize: "0.9375rem", color: "#e2e8f0", fontWeight: 500 }}>
              {formatDateTime(cert.issued_at)}
            </div>
          </div>
          <div>
            <div style={{ fontSize: "0.6875rem", color: "#64748b", fontWeight: 600, letterSpacing: "0.06em", textTransform: "uppercase", marginBottom: "6px" }}>
              Confirmed At
            </div>
            <div style={{ fontSize: "0.9375rem", color: "#e2e8f0", fontWeight: 500 }}>
              {cert.confirmed_at ? formatDateTime(cert.confirmed_at) : "Pending"}
            </div>
          </div>
          <div>
            <div style={{ fontSize: "0.6875rem", color: "#64748b", fontWeight: 600, letterSpacing: "0.06em", textTransform: "uppercase", marginBottom: "6px" }}>
              Confirmations
            </div>
            <div style={{ fontSize: "0.9375rem", color: "#e2e8f0", fontWeight: 500 }}>
              {cert.confirmations}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
