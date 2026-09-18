import { Module } from '@nestjs/common';
import { TechnicalRecordsController } from './technical-records.controller';
import { TechnicalRecordsService } from './technical-records.service';
import { PrismaModule } from '../../core/database/prisma.module';
import { AuditModule } from '../audit/audit.module';

@Module({
  imports: [PrismaModule, AuditModule],
  controllers: [TechnicalRecordsController],
  providers: [TechnicalRecordsService],
  exports: [TechnicalRecordsService],
})
export class TechnicalRecordsModule {}
