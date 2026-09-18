import { describe, it, expect, vi, beforeEach } from 'vitest';
import { NotificationsService } from './notifications.service';
import { NotFoundException } from '@nestjs/common';

describe('NotificationsService', () => {
  let service: NotificationsService;
  let mockPrisma: any;

  beforeEach(() => {
    mockPrisma = {
      notification: {
        create: vi.fn(),
        findMany: vi.fn(),
        count: vi.fn(),
        findUnique: vi.fn(),
        update: vi.fn(),
        updateMany: vi.fn(),
      },
    };

    service = new NotificationsService(mockPrisma);
  });

  describe('createNotification', () => {
    it('should create notification with default type and severity', async () => {
      const mockCreated = {
        id: 'notif-1',
        title: 'Inspection Due',
        message: 'Asset A-1 is due',
        type: 'SYSTEM_ALERT',
        severity: 'INFO',
        isRead: false,
        createdAt: new Date(),
      };
      mockPrisma.notification.create.mockResolvedValue(mockCreated);

      const result = await service.createNotification({
        title: 'Inspection Due',
        message: 'Asset A-1 is due',
      });

      expect(result).toEqual(mockCreated);
      expect(mockPrisma.notification.create).toHaveBeenCalledWith({
        data: {
          recipientId: undefined,
          recipientRole: undefined,
          title: 'Inspection Due',
          message: 'Asset A-1 is due',
          type: 'SYSTEM_ALERT',
          severity: 'INFO',
          link: undefined,
          metadata: undefined,
        },
      });
    });

    it('should create targeted notification with custom severity and link', async () => {
      const input = {
        recipientRole: 'NFT_CREATOR' as any,
        title: 'Approval Required',
        message: 'Approval APR-001 needs action',
        type: 'APPROVAL_REQUIRED' as any,
        severity: 'WARNING' as any,
        link: '/app/approvals/1',
        metadata: { approvalId: 'APR-001' },
      };
      mockPrisma.notification.create.mockResolvedValue({ id: 'notif-2', ...input });

      const result = await service.createNotification(input);
      expect(result.id).toBe('notif-2');
      expect(mockPrisma.notification.create).toHaveBeenCalledWith({
        data: input,
      });
    });
  });

  describe('listNotifications', () => {
    it('should query notifications with pagination and role/user filters', async () => {
      const items = [{ id: 'notif-1', title: 'Alert 1' }];
      mockPrisma.notification.findMany.mockResolvedValue(items);
      mockPrisma.notification.count.mockResolvedValue(1);

      const result = await service.listNotifications({
        userId: 'usr-1',
        roles: ['TECHNICIAN'],
        isRead: false,
        page: 1,
        pageSize: 10,
      });

      expect(result.items).toEqual(items);
      expect(result.total).toBe(1);
      expect(result.page).toBe(1);
      expect(result.pageSize).toBe(10);
      expect(result.hasNext).toBe(false);
      expect(mockPrisma.notification.findMany).toHaveBeenCalledWith({
        where: {
          OR: [
            { recipientId: 'usr-1' },
            { recipientRole: { in: ['TECHNICIAN'] } },
          ],
          isRead: false,
        },
        skip: 0,
        take: 10,
        orderBy: { createdAt: 'desc' },
      });
    });
  });

  describe('getUnreadCount', () => {
    it('should return unread count for user and roles', async () => {
      mockPrisma.notification.count.mockResolvedValue(5);

      const count = await service.getUnreadCount('usr-1', ['ADMIN']);
      expect(count).toBe(5);
      expect(mockPrisma.notification.count).toHaveBeenCalledWith({
        where: {
          isRead: false,
          OR: [
            { recipientId: 'usr-1' },
            { recipientRole: { in: ['ADMIN'] } },
          ],
        },
      });
    });
  });

  describe('markAsRead', () => {
    it('should mark existing notification as read', async () => {
      mockPrisma.notification.findUnique.mockResolvedValue({ id: 'notif-1', isRead: false });
      mockPrisma.notification.update.mockResolvedValue({ id: 'notif-1', isRead: true });

      const result = await service.markAsRead('notif-1');
      expect(result.isRead).toBe(true);
      expect(mockPrisma.notification.update).toHaveBeenCalledWith({
        where: { id: 'notif-1' },
        data: {
          isRead: true,
          readAt: expect.any(Date),
        },
      });
    });

    it('should throw NotFoundException if notification does not exist', async () => {
      mockPrisma.notification.findUnique.mockResolvedValue(null);

      await expect(service.markAsRead('nonexistent')).rejects.toThrow(NotFoundException);
    });
  });

  describe('markAllAsRead', () => {
    it('should update unread notifications and return count', async () => {
      mockPrisma.notification.updateMany.mockResolvedValue({ count: 3 });

      const result = await service.markAllAsRead('usr-1', ['TECHNICIAN']);
      expect(result.updatedCount).toBe(3);
      expect(mockPrisma.notification.updateMany).toHaveBeenCalledWith({
        where: {
          isRead: false,
          OR: [
            { recipientId: 'usr-1' },
            { recipientRole: { in: ['TECHNICIAN'] } },
          ],
        },
        data: {
          isRead: true,
          readAt: expect.any(Date),
        },
      });
    });
  });
});
