import { Controller, Get, Post, Param, Body, Query, UseGuards, Req } from '@nestjs/common';
import { CertificationsService } from './certifications.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CasbinGuard, CasbinPolicy } from '../auth/guards/casbin.guard';

@Controller('api/v1/certifications')
@UseGuards(JwtAuthGuard, CasbinGuard)
export class CertificationsController {
  constructor(private readonly certificationsService: CertificationsService) {}

  @Get()
  async listCertifications(
    @Query('status_filter') statusFilter?: string,
    @Query('page') page?: string,
    @Query('page_size') pageSize?: string,
  ) {
    return this.certificationsService.listCertifications({
      status_filter: statusFilter,
      page: page ? parseInt(page, 10) : undefined,
      page_size: pageSize ? parseInt(pageSize, 10) : undefined,
    });
  }

  /**
   * GET /certifications/queue
   * Returns the certification queue: assets in ACCEPTED_FOR_ASSEMBLY with
   * verified evidence, grouped by eligibility for minting.
   * NFT_CREATOR and ADMIN only.
   */
  @Get('queue')
  @CasbinPolicy('/api/v1/certifications/queue', 'GET')
  async getCertificationQueue(
    @Query('page') page?: string,
    @Query('page_size') pageSize?: string,
  ) {
    return this.certificationsService.getCertificationQueue({
      page: page ? parseInt(page, 10) : undefined,
      page_size: pageSize ? parseInt(pageSize, 10) : undefined,
    });
  }

  @Post()
  @CasbinPolicy('/api/v1/certifications', 'POST')
  async createCertification(@Body() body: any, @Req() req: any) {
    return this.certificationsService.createCertification({
      assetId: body.asset_id,
      issuedById: req.user.sub,
      issuedByName: req.user.name || req.user.email,
      issuedByDid: req.user.did,
    });
  }
}
