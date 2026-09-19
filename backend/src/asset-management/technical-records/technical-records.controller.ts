import { Controller, Get, Post, Param, Query, Body, UseGuards, Req } from '@nestjs/common';
import { TechnicalRecordsService } from './technical-records.service';
import { JwtAuthGuard } from '../../identity/auth/guards/jwt-auth.guard';
import { CasbinGuard, CasbinPolicy } from '../../identity/auth/guards/casbin.guard';
import { Request } from 'express';

@Controller('technical-records')
@UseGuards(JwtAuthGuard, CasbinGuard)
export class TechnicalRecordsController {
  constructor(private readonly technicalRecordsService: TechnicalRecordsService) {}

  @Get()
  @CasbinPolicy('/api/v1/technical-records', 'GET')
  async listTechnicalRecords(
    @Query('asset_id') assetId?: string,
    @Query('record_type') recordType?: string,
    @Query('page') page?: string,
    @Query('page_size') pageSize?: string,
  ) {
    return this.technicalRecordsService.listTechnicalRecords({
      assetId,
      recordType,
      page: page ? parseInt(page, 10) : undefined,
      page_size: pageSize ? parseInt(pageSize, 10) : undefined,
    });
  }

  @Get(':id')
  @CasbinPolicy('/api/v1/technical-records', 'GET')
  async getTechnicalRecord(@Param('id') id: string) {
    return this.technicalRecordsService.getTechnicalRecord(id);
  }

  @Post()
  @CasbinPolicy('/api/v1/technical-records', 'POST')
  async createTechnicalRecord(@Body() body: any, @Req() req: Request) {
    const user = (req as any).user;
    return this.technicalRecordsService.createTechnicalRecord({
      assetId: body.asset_id,
      recordType: body.record_type,
      data: body.data,
      classification: body.classification,
      actorId: user.sub,
      actorName: user.name || user.email,
    });
  }
}
