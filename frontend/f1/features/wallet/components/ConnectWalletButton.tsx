import { useState } from 'react';
import { useWallet } from '../WalletContext';

interface Props {
  expectedChainId?: number;
  variant?: 'orange' | 'blue';
}

export function ConnectWalletButton({ expectedChainId, variant = 'blue' }: Props) {
  const { address, chainId, isConnecting, walletBinding, connect, disconnect, error } = useWallet();

  const isUnsupportedNetwork = expectedChainId && chainId && expectedChainId !== chainId;

  // Suppress wallet extension errors from being displayed
  const displayError = error && !(
    error.includes('Broadcast channel') ||
    error.includes('channel secret') ||
    error.includes('UnknownRpcError') ||
    error.includes('BinanceInjectedProvider') ||
    error.includes('ProvidersManager') ||
    error.includes('viem') ||
    error.includes('Wallet connection not available in development')
  ) ? error : null;

  if (address) {
    return (
      <div className="flex items-center space-x-3 px-3 py-1 rounded-lg border border-[var(--border,#303030)] bg-[var(--panel,#181818)]">
        <div className="flex flex-col">
          <span className="text-xs font-medium text-[var(--foreground,#f5f5f5)] font-mono">
            {address.slice(0, 6)}...{address.slice(-4)}
          </span>
          {isUnsupportedNetwork ? (
            <span className="text-[10px] text-amber-500 font-medium">🟠 Unsupported Network</span>
          ) : walletBinding?.verified ? (
            <span className="text-[10px] text-emerald-500 font-medium flex items-center">
              <span className="mr-1">🟢</span> Verified
            </span>
          ) : (
            <span className="text-[10px] text-amber-400 font-medium flex items-center">
              <span className="mr-1">🟡</span> Connected (Unverified)
            </span>
          )}
        </div>
        <button
          onClick={disconnect}
          className="text-[11px] text-[var(--muted-foreground,#a3a3a3)] hover:text-red-400 transition-colors px-2 py-0.5 rounded border border-[var(--border,#333)] bg-transparent hover:bg-white/5"
        >
          Disconnect
        </button>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-end">
      <button
        onClick={connect}
        disabled={isConnecting}
        className={`flex items-center space-x-2 text-white px-4 py-2 rounded-lg font-medium shadow-sm disabled:opacity-50 cursor-pointer transition-all duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-blue-400 focus:ring-offset-2 focus:ring-offset-[var(--background,#111111)] ${
          variant === 'blue'
            ? 'bg-[#2563eb] hover:bg-[#1d4ed8] active:bg-[#1e40af] border border-blue-400/30 hover:border-blue-400/60 shadow-[0_2px_8px_rgba(37,99,235,0.25)] hover:shadow-[0_4px_12px_rgba(37,99,235,0.35)] hover:-translate-y-[1px] active:translate-y-0 active:shadow-[0_1px_4px_rgba(37,99,235,0.2)]'
            : 'bg-[#F6851B] hover:bg-[#e2761b]'
        }`}
      >
        <svg viewBox="0 0 111 111" className="w-5 h-5 flex-shrink-0" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path
            d="M106.31 34.4L102.52 14.86C102.13 12.82 100.86 11.23 98.92 10.51L57.21 21.05C56.24 21.29 55.17 21.29 54.19 21.05L12.48 10.51C10.54 10.02 8.7 11.53 8.31 13.57L4.52 33.11C4.03 35.63 5 38.16 7.04 39.52L53.22 71.07C54.49 71.94 56.43 71.94 57.7 71.07L103.88 39.52C105.92 38.16 106.89 35.63 106.31 34.4Z"
            fill={variant === 'blue' ? '#ffffff' : '#E17726'}
          />
          <path
            d="M101.44 100.64L76.55 79.43L58.53 91.73C57.17 92.65 55.03 92.65 53.67 91.73L35.65 79.43L10.76 100.64C8.92 102.2 9.01 105.11 10.96 106.47C11.93 107.15 13.1 107.39 14.17 107.1L51.34 96.65C52.99 96.16 56.49 96.16 58.14 96.65L95.31 107.1C96.38 107.39 97.55 107.15 98.52 106.47C100.47 105.11 100.56 102.2 98.72 100.64H101.44Z"
            fill={variant === 'blue' ? 'rgba(255, 255, 255, 0.85)' : '#E27625'}
          />
          <path
            d="M57.7 71.07C56.43 71.94 54.49 71.94 53.22 71.07L12.63 43.16L48.16 70.39C50.2 71.94 53.22 73.11 55.94 73.11C58.66 73.11 61.68 71.94 63.72 70.39L99.25 43.16L57.7 71.07Z"
            fill={variant === 'blue' ? 'rgba(255, 255, 255, 0.95)' : '#E27625'}
          />
        </svg>
        <span>{isConnecting ? 'Connecting...' : 'Connect MetaMask'}</span>
      </button>
      {displayError && <span className="text-xs text-red-500 mt-1">{displayError}</span>}
    </div>
  );
}
