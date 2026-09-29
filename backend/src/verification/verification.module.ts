import { Module } from '@nestjs/common';
import { VerificationController } from './verification.controller';
import { VerificationService } from './verification.service';
import { BlockchainModule } from '../trust/blockchain/blockchain.module';
@Module({
  controllers: [VerificationController],
  providers: [VerificationService],
  exports: [VerificationService],
  imports: [BlockchainModule],
})
export class VerificationModule {}
