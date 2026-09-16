import { api } from '../../services/api';

export interface WalletChallenge {
  nonce: string;
  message: string;
}

export interface WalletBinding {
  id: string;
  address: string;
  chainId: number | null;
  verified: boolean;
  verifiedAt: string | null;
}

export const walletApi = {
  getWallets: () => 
    api.get<WalletBinding[]>('/wallet'),
    
  getChallenge: (address: string) => 
    api.post<WalletChallenge>('/wallet/challenge', { address }),
    
  bindWallet: (address: string, signature: string, nonce: string) => 
    api.post<WalletBinding>('/wallet/bind', { address, signature, nonce }),
    
  deleteWallet: (address: string) => 
    api.delete<{ success: boolean }>(`/wallet/${address}`),
};
