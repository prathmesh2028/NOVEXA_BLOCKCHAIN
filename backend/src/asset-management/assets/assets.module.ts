import { Module } from '@nestjs/common';
import { AssetsController } from './assets.controller';
import { AssetsService } from './assets.service';
import { AuditModule } from '../audit/audit.module';
import { VerificationModule } from '../../verification/verification.module';
import { LifecycleModule } from '../lifecycle/lifecycle.module';

@Module({
  imports: [AuditModule, VerificationModule, LifecycleModule],
  controllers: [AssetsController],
  providers: [AssetsService],
  exports: [AssetsService],
})
export class AssetsModule {}
