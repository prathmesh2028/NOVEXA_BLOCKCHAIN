import { Controller, Post, Get, Body, UseGuards, Req } from '@nestjs/common';
import { LifecycleService } from './lifecycle.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CasbinGuard, CasbinPolicy } from '../auth/guards/casbin.guard';
import { RolesGuard, RequireRoles } from '../auth/guards/roles.guard';
import { Request } from 'express';

@Controller('api/v1/lifecycle')
@UseGuards(JwtAuthGuard, CasbinGuard)
export class LifecycleController {
  constructor(private readonly lifecycleService: LifecycleService) {}

  /**
   * POST /lifecycle/transition
   * Execute a lifecycle state transition on an asset.
   * TECHNICIAN and ADMIN only.
   * Body: { asset_id, to_state, reason?, evidence_ids?, idempotency_key? }
   */
  @Post('transition')
  @UseGuards(RolesGuard)
  @RequireRoles('TECHNICIAN', 'ADMIN')
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
   * GET /lifecycle/rules
   * Returns the full transition rule table.
   * Available to all authenticated users.
   */
  @Get('rules')
  getRules() {
    return {
      rules: this.lifecycleService.getTransitionRules(),
      state_machine: {
        states: ['UNREGISTERED', 'SUPPLIER_DECLARED', 'RECEIVED', 'INSPECTION_RECORDED', 'ACCEPTED_FOR_ASSEMBLY', 'REJECTED_QUARANTINED'],
        terminal_states: ['ACCEPTED_FOR_ASSEMBLY', 'REJECTED_QUARANTINED'],
        description: 'Linear progression with two terminal states. INSPECTION_RECORDED can branch to either terminal state.',
      },
    };
  }
}
