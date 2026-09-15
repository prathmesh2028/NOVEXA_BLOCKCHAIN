import { Controller, Get, Query, UseGuards } from '@nestjs/common';
import { AuditService } from './audit.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CasbinGuard, CasbinPolicy } from '../auth/guards/casbin.guard';

@Controller('audit')
@UseGuards(JwtAuthGuard, CasbinGuard)
export class AuditController {
  constructor(private readonly auditService: AuditService) {}

  @Get('events')
  async listEvents(
    @Query('resource_id') resourceId?: string,
    @Query('event_type') eventType?: string,
    @Query('actor_role') actorRole?: string,
    @Query('page') page?: string,
    @Query('page_size') pageSize?: string,
  ) {
    return this.auditService.listEvents({
      resource_id: resourceId,
      event_type: eventType,
      actor_role: actorRole,
      page: page ? parseInt(page, 10) : undefined,
      page_size: pageSize ? parseInt(pageSize, 10) : undefined,
    });
  }

  @Get('verify-chain')
  async verifyChain(@Query('limit') limit?: string) {
    return this.auditService.verifyChain(limit ? parseInt(limit, 10) : 100);
  }
}
