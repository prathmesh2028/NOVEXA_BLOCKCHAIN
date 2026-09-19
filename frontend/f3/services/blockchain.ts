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
    const { BLOCKCHAIN_TXS } = await import('../data/mockData');
    
    await new Promise(r => setTimeout(r, 600));

    let items = BLOCKCHAIN_TXS;
    if (params.asset_id) {
      items = items.filter(t => t.assetId === params.asset_id);
    }
    if (params.status) {
      items = items.filter(t => t.status === params.status);
    }

    const mapped = items.map(tx => ({
      id: tx.hash,
      tx_hash: tx.hash,
      network: tx.network,
      block_number: tx.blockNumber,
      status: tx.status,
      action: tx.action,
      confirmations: tx.confirmations,
      gas_used: tx.gasUsed,
      from_address: tx.from,
      contract_address: tx.contractAddress,
      token_id: tx.tokenId || null,
      timestamp: tx.timestamp
    }));

    return {
      items: mapped,
      total: mapped.length,
      page: params.page || 1,
      page_size: params.page_size || 100,
      has_next: false
    } as unknown as BlockchainListResponse;
  }
};
