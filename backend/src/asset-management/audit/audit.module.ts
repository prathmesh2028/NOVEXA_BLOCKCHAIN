import { Module } from '@nestjs/common';
import { AuditController } from './audit.controller';
import { AuditService } from './audit.service';
import { MerkleService } from './merkle.service';

@Module({ 
  controllers: [AuditController], 
  providers: [AuditService, MerkleService], 
  exports: [AuditService, MerkleService] 
})
export class AuditModule {}
