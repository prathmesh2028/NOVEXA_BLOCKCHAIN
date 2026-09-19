import { AppRole, NotificationType, NotificationSeverity } from '@prisma/client';

export interface CreateNotificationDto {
  recipientId?: string;
  recipientRole?: AppRole;
  title: string;
  message: string;
  type?: NotificationType;
  severity?: NotificationSeverity;
  link?: string;
  metadata?: any;
}

export interface NotificationPort {
  createNotification(data: CreateNotificationDto): Promise<any>;
}
