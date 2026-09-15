import { Controller, Post, Get, Body, Query, UseGuards, Req } from '@nestjs/common';
import { InspectionsService } from './inspections.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CasbinGuard, CasbinPolicy } from '../auth/guards/casbin.guard';
import { RolesGuard, RequireRoles } from '../auth/guards/roles.guard';

@Controller('inspections')
@UseGuards(JwtAuthGuard, CasbinGuard)
export class InspectionsController {
  constructor(private readonly inspectionsService: InspectionsService) {}

  @Post('record')
  @UseGuards(RolesGuard)
  @RequireRoles('TECHNICIAN', 'ADMIN')
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

  @Get()
  async listInspections(@Query('asset_id') assetId?: string) {
    return this.inspectionsService.listInspections(assetId);
  }
}
