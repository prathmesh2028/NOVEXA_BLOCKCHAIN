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
    {
      provide: NOTIFICATION_PORT,
      useExisting: NotificationsService,
    },
    {
      provide: 'NotificationPort',
      useExisting: NotificationsService,
    },
  ],
  exports: [
    NotificationsService,
    NOTIFICATION_PORT,
    'NotificationPort',
  ],
})
export class NotificationsModule {}
