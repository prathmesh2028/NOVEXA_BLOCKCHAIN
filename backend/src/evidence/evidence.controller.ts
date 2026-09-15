import {
  Controller,
  Get,
  Post,
  Param,
  Query,
  Body,
  UseGuards,
  Req,
  BadRequestException,
} from '@nestjs/common';
import { EvidenceService } from './evidence.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard, RequireRoles } from '../auth/guards/roles.guard';

@Controller('evidence')
@UseGuards(JwtAuthGuard)
export class EvidenceController {
  constructor(private readonly evidenceService: EvidenceService) {}

  @Get()
  async listEvidence(
    @Query('asset_id') assetId?: string,
    @Query('event_type') eventType?: string,
    @Query('page') page?: string,
    @Query('page_size') pageSize?: string,
  ) {
    return this.evidenceService.listEvidence({
      asset_id: assetId,
      event_type: eventType,
      page: page ? parseInt(page, 10) : undefined,
      page_size: pageSize ? parseInt(pageSize, 10) : undefined,
    });
  }

  /**
   * GET /evidence/integrity-report
   * GET /evidence/integrity-report/:assetId
   * Returns a per-item integrity report for all evidence on an asset.
   * Checks stored hash vs integrityVerified flag.
   * AUDITOR, ADMIN, NFT_CREATOR can read integrity reports.
   */
  @Get('integrity-report')
  @UseGuards(RolesGuard)
  @RequireRoles('AUDITOR', 'ADMIN', 'NFT_CREATOR', 'TECHNICIAN')
  async getIntegrityReportByQuery(@Query('asset_id') assetId?: string) {
    return this.evidenceService.getIntegrityReport(assetId || 'EF-2026-00421');
  }

  @Get('integrity-report/:assetId')
  @UseGuards(RolesGuard)
  @RequireRoles('AUDITOR', 'ADMIN', 'NFT_CREATOR', 'TECHNICIAN')
  async getIntegrityReport(@Param('assetId') assetId: string) {
    return this.evidenceService.getIntegrityReport(assetId);
  }

  @Get(':id')
  async getEvidence(@Param('id') id: string) {
    return this.evidenceService.getEvidence(id);
  }

  /**
   * POST /evidence
   * Upload a new evidence item.
   * Body: { asset_id, filename, type, mime_type, size_kb, content_base64, event }
   * content_base64 is the file content encoded in base64 — hash computed server-side.
   * TECHNICIAN and ADMIN only.
   */
  @Post()
  @UseGuards(RolesGuard)
  @RequireRoles('TECHNICIAN', 'ADMIN')
  async uploadEvidence(@Body() body: any, @Req() req: any) {
    if (!body.asset_id || !body.filename || !body.content_base64) {
      throw new BadRequestException('asset_id, filename, and content_base64 are required');
    }

    const content = Buffer.from(body.content_base64, 'base64');

    return this.evidenceService.uploadEvidence({
      assetId: body.asset_id,
      filename: body.filename,
      type: body.type || 'Document',
      mimeType: body.mime_type || 'application/octet-stream',
      sizeKb: body.size_kb || Math.ceil(content.length / 1024),
      content,
      event: body.event || 'EVIDENCE_UPLOAD',
      uploadedById: req.user.sub,
      uploadedByName: req.user.name || req.user.email,
      uploadedByDid: req.user.did,
    });
  }
}
