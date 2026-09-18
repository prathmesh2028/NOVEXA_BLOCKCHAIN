import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '../../core/config/config.service';
import { createPublicClient, createWalletClient, http, fallback, parseAbi, parseEther, encodeFunctionData, decodeEventLog } from 'viem';
import { privateKeyToAccount } from 'viem/accounts';

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
  private publicClient: any;
  private walletClient: any;
  private account: any;

  constructor(private readonly config: ConfigService) {
    this.initConnection();
  }

  private async initConnection() {
    try {
      const rpcUrl = this.config.blockchainRpcUrl;
      const privateKey = this.config.blockchainPrivateKey;

      if (rpcUrl) {
        this.publicClient = createPublicClient({
          transport: fallback([http(rpcUrl)]),
        });

        this.account = privateKeyToAccount(privateKey as `0x${string}`);
        
        this.walletClient = createWalletClient({
          account: this.account,
          transport: fallback([http(rpcUrl)]),
        });

        // Test connection by fetching block number
        await this.publicClient.getBlockNumber();

        this.logger.log(`Blockchain adapter configured for ${rpcUrl}`);
        this.connected = true;
      }
    } catch (e: any) {
      this.logger.warn(`Blockchain RPC not available — adapter in offline mode. Reason: ${e.message}`);
      this.connected = false;
    }
  }

  isConnected(): boolean {
    return this.connected;
  }

  async getBlockNumber(): Promise<number | null> {
    if (!this.connected) return null;
    try {
      const block = await this.publicClient.getBlockNumber();
      return Number(block);
    } catch {
      return null;
    }
  }

  async getChainId(): Promise<number | null> {
    if (!this.connected) return null;
    try {
      const chainId = await this.publicClient.getChainId();
      return Number(chainId);
    } catch {
      return this.config.blockchainChainId;
    }
  }

  async submitTransaction(params: {
    to: string;
    data: string;
    value?: bigint;
  }): Promise<{ txHash: string; status: string }> {
    if (!this.connected) {
      if (process.env.APP_ENV === 'demo') {
        this.logger.warn('Blockchain not connected — DEMO mode simulating transaction submission');
        return { txHash: `0xDEMO-mocktx${Date.now()}`, status: 'SIMULATED' };
      }
      this.logger.error('Blockchain not connected — failing transaction submission');
      return { txHash: '', status: 'FAILED' };
    }
    
    try {
      const hash = await this.walletClient.sendTransaction({
        account: this.account,
        to: params.to as `0x${string}`,
        data: params.data as `0x${string}`,
        value: params.value || 0n,
      });
      return { txHash: hash, status: 'SUBMITTED' };
    } catch (e: any) {
      this.logger.error(`Transaction submission failed: ${e.message}`);
      return { txHash: '', status: 'FAILED' };
    }
  }

  async getTransactionReceipt(txHash: string): Promise<any | null> {
    if (!this.connected) return null;
    try {
      return await this.publicClient.getTransactionReceipt({ hash: txHash as `0x${string}` });
    } catch {
      return null;
    }
  }

  decodeCertificationMintedEvent(receipt: any): any {
    if (!receipt || !receipt.logs) return null;
    try {
      // Dummy ABI for decoding just the CertificationMinted event
      const abi = parseAbi([
        'event CertificationMinted(uint256 indexed tokenId, string assetId, string batchId, string evidenceHash, uint256 issuedAt)'
      ]);
      
      for (const log of receipt.logs) {
        try {
          const decoded = decodeEventLog({
            abi,
            data: log.data,
            topics: log.topics,
          });
          if (decoded.eventName === 'CertificationMinted') {
            return decoded.args;
          }
        } catch {
          // ignore logs that don't match
        }
      }
    } catch (e: any) {
      this.logger.error(`Failed to decode event: ${e.message}`);
    }
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
    try {
      const receipt = await this.publicClient.getTransactionReceipt({ hash: txHash as `0x${string}` });
      if (receipt && receipt.status === 'success') {
        return {
          verified: true,
          blockNumber: Number(receipt.blockNumber),
          status: 'MINED',
        };
      }
      return { verified: false, status: 'FAILED_OR_PENDING' };
    } catch (e: any) {
      this.logger.error(`Transaction verification failed: ${e.message}`);
      return { verified: false, status: 'ERROR' };
    }
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
