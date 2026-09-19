import { Module } from '@nestjs/common';
import { NotificationsService } from './notifications.service';
import { NotificationsController } from './notifications.controller';
import { PrismaModule } from '../core/database/prisma.module';
import { AuthModule } from '../identity/auth/auth.module';
import { NOTIFICATION_PORT } from './notification.port';

@Module({
  imports: [PrismaModule, AuthModule],
  controllers: [NotificationsController],
  providers: [
    NotificationsService,
    // Provide INotificationPort under the NOTIFICATION_PORT token.
    // Part B domain services (ApprovalsService, LifecycleService, WorkerService)
    // should inject via @Inject(NOTIFICATION_PORT) rather than importing
    // NotificationsService directly, to keep the Part A/B boundary clean.
    {
      provide: NOTIFICATION_PORT,
      useExisting: NotificationsService,
    },
  ],
  exports: [
    NotificationsService,
    NOTIFICATION_PORT, // Exported so Part B modules can inject by token
  ],
})
export class NotificationsModule {}
