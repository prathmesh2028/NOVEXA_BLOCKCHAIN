import { Controller, Get, Param, Query, UseGuards } from '@nestjs/common';
import { BlockchainService } from './blockchain.service';
import { JwtAuthGuard } from '../../identity/auth/guards/jwt-auth.guard';
import { CasbinGuard, CasbinPolicy } from '../../identity/auth/guards/casbin.guard';

@Controller('blockchain')
export class BlockchainController {
  constructor(private readonly blockchainService: BlockchainService) {}

  @Get('transactions')
  @UseGuards(JwtAuthGuard, CasbinGuard)
  async listTransactions(
    @Query('asset_id') assetId?: string,
    @Query('status') status?: string,
    @Query('page') page?: string,
    @Query('page_size') pageSize?: string,
  ) {
    return this.blockchainService.listTransactions({
      asset_id: assetId, status,
      page: page ? parseInt(page, 10) : undefined,
      page_size: pageSize ? parseInt(pageSize, 10) : undefined,
    });
  }

  /**
   * GET /blockchain/proof/:assetId
   * Returns blockchain proof for an asset — tx hashes, confirmation status,
   * evidence anchors, and on-chain verification result.
   */
  @Get('proof/:assetId')
  @UseGuards(JwtAuthGuard, CasbinGuard)
  async getAssetProof(@Param('assetId') assetId: string) {
    return this.blockchainService.getAssetProof(assetId);
  }

  @Get('status')
  async getStatus() {
    return this.blockchainService.getStatus();
  }
}
