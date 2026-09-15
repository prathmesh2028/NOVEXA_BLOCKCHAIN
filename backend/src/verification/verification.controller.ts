import { Controller, Get, Param, UseGuards } from '@nestjs/common';
import { VerificationService } from './verification.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CasbinGuard, CasbinPolicy } from '../auth/guards/casbin.guard';

@Controller('api/v1/verification')
@UseGuards(JwtAuthGuard, CasbinGuard)
export class VerificationController {
  constructor(private readonly verificationService: VerificationService) {}

  @Get('asset/:id')
  async verifyAsset(@Param('id') id: string) {
    return this.verificationService.verifyAsset(id);
  }
}
