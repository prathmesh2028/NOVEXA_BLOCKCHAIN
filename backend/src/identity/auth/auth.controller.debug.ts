import { Controller, Post, Body, UseGuards } from '@nestjs/common';
import { AuthService } from './auth.service';
import { JwtAuthGuard } from './guards/jwt-auth.guard';
import { CasbinGuard, CasbinPolicy } from './guards/casbin.guard';

/**
 * TEMPORARY DEBUG CONTROLLER FOR PASSWORD RESET
 * REMOVE AFTER FIXING AUTHENTICATION
 */
@Controller('auth/debug')
@UseGuards(JwtAuthGuard, CasbinGuard)
export class AuthDebugController {
  constructor(private readonly authService: AuthService) {}

  @Post('reset-passwords')
  @CasbinPolicy('/api/v1/auth/debug/reset-passwords', 'POST')
  async resetPasswords() {
    // This is a temporary debug endpoint
    // It should be removed after fixing the authentication issue
    return { message: 'Use the Prisma client directly instead' };
  }
}
