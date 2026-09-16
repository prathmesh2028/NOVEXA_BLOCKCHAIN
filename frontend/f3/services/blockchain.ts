import { api } from './api';

export interface BlockchainTransactionResponse {
  id: string;
  tx_hash: string;
  network: string;
  block_number: number | null;
  status: string;
  action: string;
  confirmations: number;
  gas_used: number | null;
  from_address: string;
  contract_address: string;
  token_id: string | null;
  timestamp: string;
}

export interface BlockchainListResponse {
  items: BlockchainTransactionResponse[];
  total: number;
  page: number;
  page_size: number;
  has_next: boolean;
}

export const blockchainService = {
  listTransactions: async (params: { asset_id?: string; status?: string; page?: number; page_size?: number } = {}) => {
    const query = new URLSearchParams();
    if (params.asset_id) query.append('asset_id', params.asset_id);
    if (params.status) query.append('status', params.status);
    if (params.page) query.append('page', params.page.toString());
    if (params.page_size) query.append('page_size', params.page_size.toString());
    
    return api.get<BlockchainListResponse>(`/blockchain/transactions?${query.toString()}`);
  }
};
