import { Module } from '@nestjs/common';
import { CertificationsController } from './certifications.controller';
import { CertificationsService } from './certifications.service';
import { AuditModule } from '../../asset-management/audit/audit.module';

@Module({
  imports: [AuditModule],
  controllers: [CertificationsController],
  providers: [CertificationsService],
  exports: [CertificationsService],
})
export class CertificationsModule {}
