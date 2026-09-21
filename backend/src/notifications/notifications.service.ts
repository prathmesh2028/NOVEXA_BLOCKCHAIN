import { Injectable, Logger, NotFoundException, ForbiddenException } from '@nestjs/common';
import { PrismaService } from '../core/database/prisma.service';
import { AppRole, NotificationSeverity, NotificationType } from '@prisma/client';
import { INotificationPort } from './notification.port';

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
export class NotificationsService implements INotificationPort {
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

    try {
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
    } catch (e: any) {
      this.logger.error(`Database failure in listNotifications: ${e.message}`, e.stack);
      throw e;
    }
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

    try {
      return await this.prisma.notification.count({ where });
    } catch (e: any) {
      this.logger.error(`Database failure in getUnreadCount: ${e.message}`, e.stack);
      throw e;
    }
  }

  async markAsRead(id: string, userId?: string, roles?: AppRole[]) {
    try {
      const existing = await this.prisma.notification.findUnique({ where: { id } });
      if (!existing) {
        throw new NotFoundException(`Notification ${id} not found`);
      }

      if (userId) {
        const isRecipient = existing.recipientId === userId;
        const hasRole = existing.recipientRole ? roles?.includes(existing.recipientRole) : false;

        if (existing.recipientId && !isRecipient && !hasRole) {
          throw new ForbiddenException('You are not authorized to modify this notification');
        }

        if (!existing.recipientId && existing.recipientRole && !hasRole) {
          throw new ForbiddenException('You are not authorized to modify this notification');
        }
      }

      return await this.prisma.notification.update({
        where: { id },
        data: {
          isRead: true,
          readAt: new Date(),
        },
      });
    } catch (e: any) {
      if (e instanceof NotFoundException || e instanceof ForbiddenException) throw e;
      throw e;
    }
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

    try {
      const result = await this.prisma.notification.updateMany({
        where,
        data: {
          isRead: true,
          readAt: new Date(),
        },
      });

      return { updatedCount: result.count };
    } catch (e: any) {
      throw e;
    }
  }
}
