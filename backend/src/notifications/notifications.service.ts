import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../core/database/prisma.service';
import { AppRole, NotificationSeverity, NotificationType } from '@prisma/client';

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

@Injectable()
export class NotificationsService {
  private readonly logger = new Logger(NotificationsService.name);

  constructor(private readonly prisma: PrismaService) {}

  async createNotification(data: CreateNotificationDto) {
    try {
      const notification = await this.prisma.notification.create({
        data: {
          recipientId: data.recipientId,
          recipientRole: data.recipientRole,
          title: data.title,
          message: data.message,
          type: data.type || 'SYSTEM_ALERT',
          severity: data.severity || 'INFO',
          link: data.link,
          metadata: data.metadata,
        },
      });

      this.logger.log(
        `Notification created [${notification.type} / ${notification.severity}]: ${notification.title}`,
      );
      return notification;
    } catch (e: any) {
      this.logger.error(`Failed to create notification: ${e.message}`);
      throw e;
    }
  }

  async listNotifications(params: {
    userId?: string;
    roles?: AppRole[];
    isRead?: boolean;
    page?: number;
    pageSize?: number;
  }) {
    const page = params.page || 1;
    const pageSize = params.pageSize || 20;
    const skip = (page - 1) * pageSize;

    const whereOr: any[] = [];
    if (params.userId) {
      whereOr.push({ recipientId: params.userId });
    }
    if (params.roles && params.roles.length > 0) {
      whereOr.push({ recipientRole: { in: params.roles } });
    }

    const where: any = {};
    if (whereOr.length > 0) {
      where.OR = whereOr;
    }
    if (params.isRead !== undefined) {
      where.isRead = params.isRead;
    }

    const [items, total] = await Promise.all([
      this.prisma.notification.findMany({
        where,
        skip,
        take: pageSize,
        orderBy: { createdAt: 'desc' },
      }),
      this.prisma.notification.count({ where }),
    ]);

    return {
      items,
      total,
      page,
      pageSize,
      hasNext: skip + pageSize < total,
    };
  }

  async getUnreadCount(userId?: string, roles?: AppRole[]): Promise<number> {
    const whereOr: any[] = [];
    if (userId) {
      whereOr.push({ recipientId: userId });
    }
    if (roles && roles.length > 0) {
      whereOr.push({ recipientRole: { in: roles } });
    }

    const where: any = { isRead: false };
    if (whereOr.length > 0) {
      where.OR = whereOr;
    }

    return this.prisma.notification.count({ where });
  }

  async markAsRead(id: string) {
    const existing = await this.prisma.notification.findUnique({ where: { id } });
    if (!existing) {
      throw new NotFoundException(`Notification ${id} not found`);
    }

    return this.prisma.notification.update({
      where: { id },
      data: {
        isRead: true,
        readAt: new Date(),
      },
    });
  }

  async markAllAsRead(userId?: string, roles?: AppRole[]) {
    const whereOr: any[] = [];
    if (userId) {
      whereOr.push({ recipientId: userId });
    }
    if (roles && roles.length > 0) {
      whereOr.push({ recipientRole: { in: roles } });
    }

    const where: any = { isRead: false };
    if (whereOr.length > 0) {
      where.OR = whereOr;
    }

    const result = await this.prisma.notification.updateMany({
      where,
      data: {
        isRead: true,
        readAt: new Date(),
      },
    });

    return { updatedCount: result.count };
  }
}
