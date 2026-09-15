import { Controller, Get, Param, UseGuards } from '@nestjs/common';
import { VerificationService } from './verification.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@Controller('verification')
@UseGuards(JwtAuthGuard)
export class VerificationController {
  constructor(private readonly verificationService: VerificationService) {}

  @Get('asset/:id')
  async verifyAsset(@Param('id') id: string) {
    return this.verificationService.verifyAsset(id);
  }
}
