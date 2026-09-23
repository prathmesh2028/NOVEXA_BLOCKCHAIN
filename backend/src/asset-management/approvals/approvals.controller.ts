import { Controller, Get, Post, Patch, Param, Body, Query, UseGuards, Req } from '@nestjs/common';
import { ApprovalsService } from './approvals.service';
import { JwtAuthGuard } from '../../identity/auth/guards/jwt-auth.guard';
import { CasbinGuard, CasbinPolicy } from '../../identity/auth/guards/casbin.guard';
import { Request } from 'express';
import { AppRole, ApprovalStage, ApprovalStatus } from '@prisma/client';

@Controller('approvals')
@UseGuards(JwtAuthGuard, CasbinGuard)
export class ApprovalsController {
  constructor(private readonly approvalsService: ApprovalsService) {}

  @Post()
  @CasbinPolicy('/api/v1/approvals', 'POST')
  async requestApproval(@Body() body: any, @Req() req: Request) {
    const user = (req as any).user;
    return this.approvalsService.requestApproval({
      assetId: body.asset_id || body.assetId,
      entityType: body.entity_type || body.entityType,
      entityId: body.entity_id || body.entityId,
      stage: body.stage as ApprovalStage,
      requestedById: user.sub,
      requestedByName: user.name || user.email,
      requestedByRole: user.roles?.[0] || 'QUALITY_INSPECTOR',
      comments: body.comments,
    });
  }

  @Get()
  async listApprovals(
    @Query('status') status?: ApprovalStatus,
    @Query('stage') stage?: ApprovalStage,
    @Query('asset_id') assetId?: string,
    @Query('page') page?: string,
    @Query('page_size') pageSize?: string,
  ) {
    return this.approvalsService.listApprovals({
      status,
      stage,
      assetId,
      page: page ? parseInt(page, 10) : undefined,
      pageSize: pageSize ? parseInt(pageSize, 10) : undefined,
    });
  }

  @Get(':id')
  async getApproval(@Param('id') id: string) {
    return this.approvalsService.getApproval(id);
  }

  @Patch(':id/decide')
  @CasbinPolicy('/api/v1/approvals/:id/decide', 'PATCH')
  async decideApproval(
    @Param('id') id: string,
    @Body() body: { status: 'APPROVED' | 'REJECTED'; comments?: string; digital_signature?: string },
    @Req() req: Request,
  ) {
    const user = (req as any).user;
    return this.approvalsService.decideApproval(id, {
      status: body.status,
      approverId: user.sub,
      approverName: user.name || user.email,
      approverRole: (user.roles?.[0] || 'QUALITY_INSPECTOR') as AppRole,
      comments: body.comments,
      digitalSignature: body.digital_signature,
    });
  }
}
