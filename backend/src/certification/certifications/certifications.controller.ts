import { Controller, Get, Post, Param, Body, Query, UseGuards, Req, NotFoundException } from '@nestjs/common';
import { CertificationsService } from './certifications.service';
import { JwtAuthGuard } from '../../identity/auth/guards/jwt-auth.guard';
import { CasbinGuard, CasbinPolicy } from '../../identity/auth/guards/casbin.guard';
import { CreateCertificationDto } from './dto/create-certification.dto';

@Controller('certifications')
@UseGuards(JwtAuthGuard, CasbinGuard)
export class CertificationsController {
  constructor(private readonly certificationsService: CertificationsService) {}

  @Get()
  async listCertifications(
    @Query('status_filter') statusFilter?: string,
    @Query('page') page?: string,
    @Query('page_size') pageSize?: string,
    @Query('assetId') assetId?: string,
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
   * QUALITY_INSPECTOR and SYSTEM_ADMIN only.
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

  /**
   * GET /certifications/:id
   * Returns a single certification by its UUID or certId (e.g. CERT-2026-24767).
   */
  @Get(':id/blockchain-proof')
  @CasbinPolicy('/api/v1/certifications/:id/blockchain-proof', 'GET')
  async getBlockchainProof(@Param('id') id: string) {
    return this.certificationsService.getBlockchainProof(id);
  }

  @Get(':id')
  @CasbinPolicy('/api/v1/certifications/:id', 'GET')
  async getCertification(@Param('id') id: string) {
    return this.certificationsService.getCertificationById(id);
  }

  @Post()
  @CasbinPolicy('/api/v1/certifications', 'POST')
  async createCertification(@Body() dto: CreateCertificationDto, @Req() req: any) {
    return this.certificationsService.createCertification({
      assetId: dto.asset_id,
      issuedById: req.user.sub,
      issuedByName: req.user.name || req.user.email,
      issuedByDid: req.user.did,
      issuedByRole: req.user.roles?.[0] || 'UNKNOWN',
      certificateImage: dto.certificate_image,
    });
  }

  @Post(':id/revoke')
  @CasbinPolicy('/api/v1/certifications', 'POST')
  async revokeCertification(
    @Param('id') id: string,
    @Body() body: { reason?: string },
    @Req() req: any,
  ) {
    return this.certificationsService.revokeCertification(id, req.user.sub, body?.reason);
  }
}

/**
 * Wallet-readable ERC-721 metadata. This route intentionally returns only
 * public certification fields; it does not expose evidence, credentials, or
 * defence-sensitive asset details.
 */
@Controller('certifications/metadata')
export class CertificationMetadataController {
  constructor(private readonly certificationsService: CertificationsService) {}

  @Get(':tokenId.json')
  async getMetadata(@Param('tokenId') tokenId: string) {
    return this.certificationsService.getMetadataByTokenId(tokenId);
  }
}
