import { Module } from '@nestjs/common';
import { PhysicalBindingsController } from './physical-bindings.controller';
import { PhysicalBindingsService } from './physical-bindings.service';
import { AuditModule } from '../audit/audit.module';

@Module({
  imports: [AuditModule],
  controllers: [PhysicalBindingsController],
  providers: [PhysicalBindingsService],
  exports: [PhysicalBindingsService],
})
export class PhysicalBindingsModule {}
