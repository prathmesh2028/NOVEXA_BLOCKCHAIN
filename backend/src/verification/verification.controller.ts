import { Controller, Get, Param, UseGuards } from '@nestjs/common';
import { VerificationService } from './verification.service';
import { JwtAuthGuard } from '../identity/auth/guards/jwt-auth.guard';
import { CasbinGuard, CasbinPolicy } from '../identity/auth/guards/casbin.guard';

@Controller('verification')
@UseGuards(JwtAuthGuard, CasbinGuard)
export class VerificationController {
  constructor(private readonly verificationService: VerificationService) {}

  @Get('asset/:id')
  async verifyAsset(@Param('id') id: string) {
    return this.verificationService.verifyAsset(id);
  }
}
