import { Controller, Post, Get, Body, UseGuards, Req } from '@nestjs/common';
import { LifecycleService } from './lifecycle.service';
import { JwtAuthGuard } from '../../identity/auth/guards/jwt-auth.guard';
import { CasbinGuard, CasbinPolicy } from '../../identity/auth/guards/casbin.guard';
import { RolesGuard, RequireRoles } from '../../identity/auth/guards/roles.guard';
import { Request } from 'express';

@Controller('lifecycle')
@UseGuards(JwtAuthGuard, CasbinGuard)
export class LifecycleController {
  constructor(private readonly lifecycleService: LifecycleService) {}

  /**
   * POST /lifecycle/transition
   * Execute a lifecycle state transition on an asset.
   * QUALITY_INSPECTOR and SYSTEM_ADMIN only.
   * Body: { asset_id, to_state, reason?, evidence_ids?, idempotency_key? }
   */
  @Post('transition')
  @UseGuards(RolesGuard)
  @RequireRoles('QUALITY_INSPECTOR', 'SYSTEM_ADMIN')
  async transition(@Body() body: any, @Req() req: Request) {
    const user = (req as any).user;
    return this.lifecycleService.transition({
      assetId: body.asset_id,
      toState: body.to_state,
      actorId: user.sub,
      actorDid: user.did,
      actorRole: user.roles?.[0] || 'UNKNOWN',
      reason: body.reason,
      evidenceIds: body.evidence_ids,
      idempotencyKey: body.idempotency_key,
    });
  }

  /**
   * POST /lifecycle/detect-overdue
   * Triggers the real expiry and inspection overdue detection engine.
   * Auto-transitions overdue assets to INSPECTION_OVERDUE, generates notifications & audit events.
   */
  @Post('detect-overdue')
  @UseGuards(RolesGuard)
  @RequireRoles('SYSTEM_ADMIN', 'QUALITY_INSPECTOR')
  async detectOverdue(@Req() req: Request) {
    const user = (req as any).user;
    return this.lifecycleService.detectAndFlagOverdueAssets(user.sub);
  }

  /**
   * GET /lifecycle/overdue
   * Returns all currently overdue defence assets.
   */
  @Get('overdue')
  async getOverdue() {
    return this.lifecycleService.getOverdueAssets();
  }

  /**
   * GET /lifecycle/rules
   * Returns the full transition rule table.
   * Available to all authenticated users.
   */
  @Get('rules')
  getRules() {
    return {
      rules: this.lifecycleService.getTransitionRules(),
      state_machine: {
        states: ['UNREGISTERED', 'SUPPLIER_DECLARED', 'RECEIVED', 'INSPECTION_RECORDED', 'INSPECTION_OVERDUE', 'ACCEPTED_FOR_ASSEMBLY', 'REJECTED_QUARANTINED'],
        terminal_states: ['ACCEPTED_FOR_ASSEMBLY', 'REJECTED_QUARANTINED'],
        description: 'Linear progression with terminal states and INSPECTION_OVERDUE exception recovery.',
      },
    };
  }
}
