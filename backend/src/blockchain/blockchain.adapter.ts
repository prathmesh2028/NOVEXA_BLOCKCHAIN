import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '../config/config.service';

/**
 * BlockchainAdapter — ALL blockchain calls go through this adapter.
 * Domain services must NOT scatter direct viem calls throughout the application.
 * 
 * In development mode without a running Besu node, operations are logged
 * but return simulated results marked as SIMULATED.
 */
@Injectable()
export class BlockchainAdapter {
  private readonly logger = new Logger(BlockchainAdapter.name);
  private connected = false;

  constructor(private readonly config: ConfigService) {
    this.initConnection();
  }

  private async initConnection() {
    try {
      // Attempt to connect to blockchain RPC
      const rpcUrl = this.config.blockchainRpcUrl;
      if (rpcUrl) {
        // In a full implementation, this would use viem createPublicClient
        this.logger.log(`Blockchain adapter configured for ${rpcUrl}`);
        this.connected = false; // Will be true when Besu is actually running
      }
    } catch (e) {
      this.logger.warn('Blockchain RPC not available — adapter in offline mode');
      this.connected = false;
    }
  }

  isConnected(): boolean {
    return this.connected;
  }

  async getBlockNumber(): Promise<number | null> {
    if (!this.connected) return null;
    // viem: publicClient.getBlockNumber()
    return null;
  }

  async getChainId(): Promise<number | null> {
    if (!this.connected) return null;
    return this.config.blockchainChainId;
  }

  async submitTransaction(params: {
    to: string;
    data: string;
    value?: bigint;
  }): Promise<{ txHash: string; status: string }> {
    if (!this.connected) {
      this.logger.warn('Blockchain not connected — transaction not submitted');
      return { txHash: '', status: 'FAILED' };
    }
    // viem: walletClient.sendTransaction(...)
    return { txHash: '', status: 'SUBMITTED' };
  }

  async getTransactionReceipt(txHash: string): Promise<any | null> {
    if (!this.connected) return null;
    // viem: publicClient.getTransactionReceipt({ hash })
    return null;
  }

  async verifyTransaction(txHash: string): Promise<{
    verified: boolean;
    blockNumber?: number;
    status?: string;
  }> {
    if (!this.connected) {
      return { verified: false, status: 'BLOCKCHAIN_UNAVAILABLE' };
    }
    return { verified: false, status: 'NOT_IMPLEMENTED' };
  }

  getNetworkInfo() {
    return {
      rpcUrl: this.config.blockchainRpcUrl,
      chainId: this.config.blockchainChainId,
      network: this.config.blockchainNetworkName,
      connected: this.connected,
    };
  }
}
