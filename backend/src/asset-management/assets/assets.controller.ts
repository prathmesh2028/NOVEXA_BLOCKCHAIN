import { Controller, Get, Post, Param, Query, Body, UseGuards, Req } from '@nestjs/common';
import { AssetsService } from './assets.service';
import { VerificationService } from '../../verification/verification.service';
import { LifecycleService } from '../lifecycle/lifecycle.service';
import { JwtAuthGuard } from '../../identity/auth/guards/jwt-auth.guard';
import { CasbinGuard, CasbinPolicy } from '../../identity/auth/guards/casbin.guard';
import { Request } from 'express';

@Controller('assets')
@UseGuards(JwtAuthGuard, CasbinGuard)
export class AssetsController {
  constructor(
    private readonly assetsService: AssetsService,
    private readonly verificationService: VerificationService,
    private readonly lifecycleService: LifecycleService,
  ) {}

  @Get()
  async listAssets(
    @Query('search') search?: string,
    @Query('lifecycle') lifecycle?: string,
    @Query('page') page?: string,
    @Query('page_size') pageSize?: string,
    @Req() req?: Request,
  ) {
    const user = (req as any).user;
    return this.assetsService.listAssets({
      search,
      lifecycle,
      page: page ? parseInt(page, 10) : undefined,
      page_size: pageSize ? parseInt(pageSize, 10) : undefined,
      user,
    });
  }

  /**
   * GET /assets/eligible
   * Returns assets that are ACCEPTED_FOR_ASSEMBLY, have verified evidence,
   * and are not already certified. This is the pool for QUALITY_INSPECTOR certification.
   */
  @Get('eligible')
  @CasbinPolicy('/api/v1/assets/eligible', 'GET')
  async getEligibleAssets(
    @Query('page') page?: string,
    @Query('page_size') pageSize?: string,
    @Req() req?: Request,
  ) {
    const user = (req as any).user;
    return this.assetsService.getEligibleAssets({
      page: page ? parseInt(page, 10) : undefined,
      page_size: pageSize ? parseInt(pageSize, 10) : undefined,
      user,
    });
  }

  /**
   * GET /assets/:id/verify
   * Compatibility route — the canonical endpoint is GET /verification/asset/:id
   * The frontend calls this path; delegating to VerificationService keeps
   * a single source of truth and avoids duplicating verification logic.
   */
  @Get(':id/verify')
  async verifyAsset(@Param('id') id: string) {
    return this.verificationService.verifyAsset(id);
  }

  /**
   * GET /assets/:id/qr
   * Generates a verification QR code and canonical payload for physical asset verification.
   */
  @Get(':id/qr')
  async getAssetQr(@Param('id') id: string, @Req() req: Request) {
    const user = (req as any).user;
    return this.assetsService.getAssetQr(id, user);
  }

  @Get(':id')
  async getAsset(@Param('id') id: string, @Req() req: Request) {
    const user = (req as any).user;
    return this.assetsService.getAsset(id, user);
  }

  @Post()
  @CasbinPolicy('/api/v1/assets', 'POST')
  async createAsset(@Body() body: any, @Req() req: Request) {
    const user = (req as any).user;
    return this.assetsService.createAsset({
      ...body,
      registeredById: user.sub,
      registeredByName: user.name || user.email,
    });
  }

  /**
   * POST /assets/:id/lifecycle
   * Compatibility route — the canonical endpoint is POST /lifecycle/transition
   * The frontend sends { to_state, reason, evidence_ids } to this URL.
   * We forward to LifecycleService.transition() preserving all validation.
   */
  @Post(':id/lifecycle')
  async assetLifecycleTransition(@Param('id') id: string, @Body() body: any, @Req() req: Request) {
    const user = (req as any).user;
    return this.lifecycleService.transition({
      assetId: id,
      toState: body.to_state || body.state,
      actorId: user.sub,
      actorDid: user.did,
      actorRole: user.roles?.[0] || 'UNKNOWN',
      reason: body.reason,
      evidenceIds: body.evidence_ids,
      idempotencyKey: body.idempotency_key,
    });
  }
}
