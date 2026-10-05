import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App'
import './index.css'

// Suppress non-critical library errors (viem, wallet extensions, etc.)
const originalError = console.error;
const originalWarn = console.warn;

const shouldSuppress = (args: any[]) => {
  const message = args[0]?.toString?.() || '';
  const stringArgs = args.map(a => String(a)).join(' ');
  return (
    message.includes('Unlisted TLDs in URLs are not supported') ||
    stringArgs.includes('Unlisted TLDs in URLs are not supported') ||
    message.includes('inpage.js') ||
    stringArgs.includes('inpage.js') ||
    message.includes('Unable to obtain channel secret') ||
    message.includes('Unable to find node id') ||
    message.includes('Broadcast channel unavailable') ||
    message.includes('broadcast system') ||
    message.includes('TonAdapter') ||
    message.includes('SolanaAdapter') ||
    message.includes('TronAdapter') ||
    message.includes('BitcoinAdapter') ||
    message.includes('EthereumAdapter') ||
    message.includes('Web3RpcProvider') ||
    message.includes('ExtendedBroadcastMessage') ||
    message.includes('Failed to connect wallet') ||
    message.includes('UnknownRpcError') ||
    message.includes('BinanceInjectedProvider') ||
    message.includes('ProvidersManager') ||
    message.includes('viem') ||
    stringArgs.includes('TonAdapter') ||
    stringArgs.includes('SolanaAdapter') ||
    stringArgs.includes('TronAdapter') ||
    stringArgs.includes('BitcoinAdapter') ||
    stringArgs.includes('EthereumAdapter') ||
    stringArgs.includes('Web3RpcProvider') ||
    stringArgs.includes('ExtendedBroadcastMessage') ||
    stringArgs.includes('Failed to connect wallet') ||
    stringArgs.includes('UnknownRpcError') ||
    stringArgs.includes('BinanceInjectedProvider') ||
    stringArgs.includes('ProvidersManager') ||
    stringArgs.includes('viem')
  );
};

console.error = (...args) => {
  if (shouldSuppress(args)) return;
  originalError.apply(console, args);
};

console.warn = (...args) => {
  if (shouldSuppress(args)) return;
  originalWarn.apply(console, args);
};

// Suppress unhandled promise rejections from library warnings
window.addEventListener('unhandledrejection', (event) => {
  const reasonStr = String(event.reason);
  if (
    event.reason?.message?.includes('Unlisted TLDs in URLs are not supported') ||
    reasonStr.includes('Unlisted TLDs in URLs are not supported') ||
    reasonStr.includes('inpage.js') ||
    reasonStr.includes('channel secret') ||
    reasonStr.includes('Broadcast channel') ||
    reasonStr.includes('TonAdapter') ||
    reasonStr.includes('SolanaAdapter') ||
    reasonStr.includes('TronAdapter') ||
    reasonStr.includes('BitcoinAdapter') ||
    reasonStr.includes('EthereumAdapter') ||
    reasonStr.includes('Web3RpcProvider') ||
    reasonStr.includes('ExtendedBroadcastMessage') ||
    reasonStr.includes('Failed to connect wallet') ||
    reasonStr.includes('UnknownRpcError') ||
    reasonStr.includes('BinanceInjectedProvider') ||
    reasonStr.includes('ProvidersManager') ||
    reasonStr.includes('viem')
  ) {
    event.preventDefault();
  }
});

// Suppress window-level errors from wallet extension
window.addEventListener('error', (event) => {
  const message = event.message || '';
  if (
    message.includes('inpage.js') ||
    message.includes('channel secret') ||
    message.includes('Broadcast channel') ||
    message.includes('TonAdapter') ||
    message.includes('SolanaAdapter') ||
    message.includes('TronAdapter') ||
    message.includes('BitcoinAdapter') ||
    message.includes('EthereumAdapter') ||
    message.includes('Web3RpcProvider') ||
    message.includes('ExtendedBroadcastMessage') ||
    message.includes('BinanceInjectedProvider') ||
    message.includes('ProvidersManager')
  ) {
    event.preventDefault();
    event.stopPropagation();
    return true;
  }
}, true);

const rootElement = document.getElementById('root')
if (!rootElement) {
  throw new Error('Root element not found')
}

ReactDOM.createRoot(rootElement).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
)
