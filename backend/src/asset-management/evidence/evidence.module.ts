import { Module } from '@nestjs/common';
import { EvidenceController } from './evidence.controller';
import { EvidenceService } from './evidence.service';
import { MinioService } from './minio.service';

@Module({
  controllers: [EvidenceController],
  providers: [EvidenceService, MinioService],
  exports: [EvidenceService, MinioService],
})
export class EvidenceModule {}
