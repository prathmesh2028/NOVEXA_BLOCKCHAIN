import { Module } from '@nestjs/common';
import { ApprovalsService } from './approvals.service';
import { ApprovalsController } from './approvals.controller';
import { PrismaModule } from '../../core/database/prisma.module';
import { NotificationsModule } from '../../notifications/notifications.module';
import { CasbinModule } from '../../core/casbin/casbin.module';
import { AuthModule } from '../../identity/auth/auth.module';
import { AuditModule } from '../audit/audit.module';

@Module({
  imports: [PrismaModule, NotificationsModule, CasbinModule, AuthModule, AuditModule],
  controllers: [ApprovalsController],
  providers: [ApprovalsService],
  exports: [ApprovalsService],
})
export class ApprovalsModule {}
