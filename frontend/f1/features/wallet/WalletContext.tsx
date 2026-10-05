import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { createWalletClient, custom } from 'viem';
import { walletApi, WalletBinding } from './walletApi';

interface WalletContextType {
  address: string | null;
  chainId: number | null;
  isConnecting: boolean;
  walletBinding: WalletBinding | null;
  connect: () => Promise<void>;
  disconnect: () => void;
  error: string | null;
}

const WalletContext = createContext<WalletContextType | null>(null);

export function WalletProvider({ children }: { children: ReactNode }) {
  const [address, setAddress] = useState<string | null>(null);
  const [chainId, setChainId] = useState<number | null>(null);
  const [isConnecting, setIsConnecting] = useState(false);
  const [walletBinding, setWalletBinding] = useState<WalletBinding | null>(null);
  const [error, setError] = useState<string | null>(null);

  // Sync wallet state with backend
  const syncWalletState = async (currentAddress: string) => {
    // Only attempt to sync if user has an auth token, as /wallet requires JWT authentication
    const token = localStorage.getItem('kavach_token');
    if (!token) {
      setWalletBinding(null);
      return;
    }

    try {
      const wallets = await walletApi.getWallets();
      const binding = wallets.find(w => w.address.toLowerCase() === currentAddress.toLowerCase());
      setWalletBinding(binding || null);
    } catch (err) {
      // Suppress wallet sync errors
      const errStr = String(err);
      if (
        errStr.includes('Broadcast channel') ||
        errStr.includes('channel secret') ||
        errStr.includes('UnknownRpcError') ||
        errStr.includes('BinanceInjectedProvider') ||
        errStr.includes('ProvidersManager') ||
        errStr.includes('viem')
      ) {
        // Silently ignore wallet extension errors
        setWalletBinding(null);
        return;
      }
      console.warn("Could not sync wallet state with backend", err);
      setWalletBinding(null);
    }
  };

  const checkConnection = async () => {
    if (typeof window.ethereum === 'undefined') return;

    try {
      const client = createWalletClient({ transport: custom(window.ethereum) });
      const [currentAddress] = await client.getAddresses();
      if (currentAddress) {
        setAddress(currentAddress);
        const currentChainId = await client.getChainId();
        setChainId(currentChainId);
        await syncWalletState(currentAddress);
      }
    } catch (err: any) {
      // Suppress all wallet extension errors for development
      const errStr = String(err.message || err);
      if (
        errStr.includes('TLD') ||
        errStr.includes('Broadcast channel') ||
        errStr.includes('channel secret') ||
        errStr.includes('UnknownRpcError') ||
        errStr.includes('BinanceInjectedProvider') ||
        errStr.includes('ProvidersManager') ||
        errStr.includes('viem')
      ) {
        // Silently ignore wallet extension errors
        return;
      }
      console.error('Failed to check wallet connection', err);
    }
  };

  useEffect(() => {
    checkConnection();

    if (typeof window.ethereum !== 'undefined') {
      const handleAccountsChanged = async (accounts: string[]) => {
        if (accounts.length === 0) {
          setAddress(null);
          setWalletBinding(null);
        } else {
          setAddress(accounts[0]);
          const currentChainId = await createWalletClient({ transport: custom(window.ethereum) }).getChainId();
          setChainId(currentChainId);
          await syncWalletState(accounts[0]);
        }
      };

      const handleChainChanged = (newChainId: string) => {
        setChainId(parseInt(newChainId, 16));
        setError(null);
      };

      window.ethereum.on('accountsChanged', handleAccountsChanged);
      window.ethereum.on('chainChanged', handleChainChanged);

      return () => {
        window.ethereum.removeListener('accountsChanged', handleAccountsChanged);
        window.ethereum.removeListener('chainChanged', handleChainChanged);
      };
    }
  }, []);

  const connect = async () => {
    setError(null);
    if (typeof window.ethereum === 'undefined') {
      setError('MetaMask is not installed');
      return;
    }

    setIsConnecting(true);
    try {
      const client = createWalletClient({ transport: custom(window.ethereum) });
      const [newAddress] = await client.requestAddresses();
      setAddress(newAddress);

      const newChainId = await client.getChainId();
      setChainId(newChainId);

      // Fetch challenge
      const challenge = await walletApi.getChallenge(newAddress);

      // Sign message
      const signature = await client.signMessage({
        account: newAddress as `0x${string}`,
        message: challenge.message
      });

      // Bind wallet
      const binding = await walletApi.bindWallet(newAddress, signature, challenge.nonce);
      setWalletBinding(binding);

    } catch (err: any) {
      // Suppress all wallet extension errors for development
      const errStr = String(err.message || err);
      if (
        errStr.includes('TLD') ||
        errStr.includes('Broadcast channel') ||
        errStr.includes('channel secret') ||
        errStr.includes('UnknownRpcError') ||
        errStr.includes('BinanceInjectedProvider') ||
        errStr.includes('ProvidersManager') ||
        errStr.includes('viem')
      ) {
        // Silently ignore wallet extension errors
        setError('Wallet connection not available in development environment');
        return;
      }
      console.error('Failed to connect wallet', err);
      if (err.code === 4001) {
        setError('User rejected the request');
      } else {
        setError(err.message || 'Failed to connect wallet');
      }
    } finally {
      setIsConnecting(false);
    }
  };

  const disconnect = () => {
    setAddress(null);
    setWalletBinding(null);
    // MetaMask doesn't have a true disconnect method for dApps,
    // so we just clear local state.
  };

  return (
    <WalletContext.Provider value={{
      address,
      chainId,
      isConnecting,
      walletBinding,
      connect,
      disconnect,
      error
    }}>
      {children}
    </WalletContext.Provider>
  );
}

export function useWallet() {
  const context = useContext(WalletContext);
  if (!context) {
    throw new Error('useWallet must be used within a WalletProvider');
  }
  return context;
}
