import { Module } from '@nestjs/common';
import { NotificationsService } from './notifications.service';
import { NotificationsController } from './notifications.controller';
import { PrismaModule } from '../core/database/prisma.module';
import { AuthModule } from '../identity/auth/auth.module';

@Module({
  imports: [PrismaModule, AuthModule],
  controllers: [NotificationsController],
  providers: [
    NotificationsService,
    {
      provide: 'NotificationPort',
      useExisting: NotificationsService,
    },
  ],
  exports: [NotificationsService, 'NotificationPort'],
})
export class NotificationsModule {}
