import { Controller, Post, Get, Patch, Body, Query, Param, UseGuards, Req } from '@nestjs/common';
import { InspectionsService } from './inspections.service';
import { JwtAuthGuard } from '../../identity/auth/guards/jwt-auth.guard';
import { CasbinGuard, CasbinPolicy } from '../../identity/auth/guards/casbin.guard';
import { RolesGuard, RequireRoles } from '../../identity/auth/guards/roles.guard';

@Controller('inspections')
@UseGuards(JwtAuthGuard, CasbinGuard)
export class InspectionsController {
  constructor(private readonly inspectionsService: InspectionsService) {}

  @Post('record')
  @UseGuards(RolesGuard)
  @RequireRoles('QUALITY_INSPECTOR', 'SYSTEM_ADMIN')
  async recordInspection(@Body() body: any, @Req() req: any) {
    return this.inspectionsService.recordInspection({
      assetId: body.asset_id,
      inspectorId: req.user.sub,
      inspectorDid: req.user.did,
      result: body.result,
      notes: body.notes,
      evidenceIds: body.evidence_ids,
    });
  }

  @Patch(':id/decide')
  @UseGuards(RolesGuard)
  @RequireRoles('QUALITY_INSPECTOR', 'SYSTEM_ADMIN')
  async decideInspection(@Param('id') id: string, @Body() body: any, @Req() req: any) {
    return this.inspectionsService.decideInspection({
      inspectionId: id,
      decision: body.decision, // 'ACCEPT' or 'REJECT'
      reason: body.reason,
      actorId: req.user.sub,
      actorDid: req.user.did,
      actorRole: req.user.roles?.[0] || 'UNKNOWN',
    });
  }

  @Get()
  async listInspections(@Query('asset_id') assetId?: string) {
    return this.inspectionsService.listInspections(assetId);
  }
}
