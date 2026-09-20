import { Module } from '@nestjs/common';
import { SupplyChainController } from './supply-chain.controller';
import { SupplyChainService } from './supply-chain.service';
import { IdentityModule } from '../identity/identity.module';
import { AuditModule } from '../asset-management/audit/audit.module';

@Module({
  imports: [IdentityModule, AuditModule],
  controllers: [SupplyChainController],
  providers: [SupplyChainService],
  exports: [SupplyChainService],
})
export class SupplyChainModule {}
