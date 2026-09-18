import { Controller, Get, Patch, Post, Param, Query, UseGuards, Req } from '@nestjs/common';
import { NotificationsService } from './notifications.service';
import { JwtAuthGuard } from '../identity/auth/guards/jwt-auth.guard';
import { Request } from 'express';
import { AppRole } from '@prisma/client';

@Controller('notifications')
@UseGuards(JwtAuthGuard)
export class NotificationsController {
  constructor(private readonly notificationsService: NotificationsService) {}

  @Get()
  async listNotifications(
    @Req() req: Request,
    @Query('is_read') isRead?: string,
    @Query('page') page?: string,
    @Query('page_size') pageSize?: string,
  ) {
    const user = (req as any).user;
    const roles: AppRole[] = (user.roles || []).map((r: string) => r as AppRole);

    return this.notificationsService.listNotifications({
      userId: user.sub,
      roles,
      isRead: isRead !== undefined ? isRead === 'true' : undefined,
      page: page ? parseInt(page, 10) : undefined,
      pageSize: pageSize ? parseInt(pageSize, 10) : undefined,
    });
  }

  @Get('unread-count')
  async getUnreadCount(@Req() req: Request) {
    const user = (req as any).user;
    const roles: AppRole[] = (user.roles || []).map((r: string) => r as AppRole);
    const count = await this.notificationsService.getUnreadCount(user.sub, roles);
    return { unread_count: count };
  }

  @Patch(':id/read')
  async markAsRead(@Param('id') id: string) {
    return this.notificationsService.markAsRead(id);
  }

  @Post('mark-all-read')
  async markAllAsRead(@Req() req: Request) {
    const user = (req as any).user;
    const roles: AppRole[] = (user.roles || []).map((r: string) => r as AppRole);
    return this.notificationsService.markAllAsRead(user.sub, roles);
  }
}
