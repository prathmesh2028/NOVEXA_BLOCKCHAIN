import { Module } from '@nestjs/common';
import { CertificationMetadataController, CertificationsController } from './certifications.controller';
import { CertificationsService } from './certifications.service';
import { AuditModule } from '../../asset-management/audit/audit.module';
import { BlockchainModule } from '../../trust/blockchain/blockchain.module';

@Module({
  imports: [AuditModule, BlockchainModule],
  controllers: [CertificationsController, CertificationMetadataController],
  providers: [CertificationsService],
  exports: [CertificationsService],
})
export class CertificationsModule {}
