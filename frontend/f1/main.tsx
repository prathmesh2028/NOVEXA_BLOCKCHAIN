import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App'
import './index.css'

// The injected provider can reject local custom RPC URLs before application code runs.
const originalError = console.error;
const originalWarn = console.warn;

const shouldSuppress = (args: any[]) => {
  return args.map(a => String(a)).join(' ').includes('Unlisted TLDs in URLs are not supported');
};

console.error = (...args) => {
  if (shouldSuppress(args)) return;
  originalError.apply(console, args);
};

console.warn = (...args) => {
  if (shouldSuppress(args)) return;
  originalWarn.apply(console, args);
};

window.addEventListener('unhandledrejection', (event) => {
  if (String(event.reason).includes('Unlisted TLDs in URLs are not supported')) {
    event.preventDefault();
  }
});

const rootElement = document.getElementById('root')
if (!rootElement) {
  throw new Error('Root element not found')
}

ReactDOM.createRoot(rootElement).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
)
