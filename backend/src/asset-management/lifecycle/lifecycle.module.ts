import { Module } from '@nestjs/common';
import { LifecycleService } from './lifecycle.service';
import { LifecycleController } from './lifecycle.controller';
import { PrismaModule } from '../../core/database/prisma.module';
import { NotificationsModule } from '../../notifications/notifications.module';
import { CasbinModule } from '../../core/casbin/casbin.module';
import { AuthModule } from '../../identity/auth/auth.module';
import { AuditModule } from '../audit/audit.module';

@Module({
  imports: [PrismaModule, NotificationsModule, CasbinModule, AuthModule, AuditModule],
  controllers: [LifecycleController],
  providers: [LifecycleService],
  exports: [LifecycleService],
})
export class LifecycleModule {}
