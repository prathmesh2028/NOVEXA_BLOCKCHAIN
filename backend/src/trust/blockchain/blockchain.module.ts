import { Module } from '@nestjs/common';
import { BlockchainController } from './blockchain.controller';
import { BlockchainService } from './blockchain.service';
import { BlockchainAdapter } from './blockchain.adapter';
@Module({ controllers: [BlockchainController], providers: [BlockchainService, BlockchainAdapter], exports: [BlockchainService, BlockchainAdapter] })
export class BlockchainModule {}
