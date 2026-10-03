import { Controller, Post, Get, Body, Req, UseGuards, HttpCode } from '@nestjs/common';
import { Throttle } from '@nestjs/throttler';
import { AuthService } from './auth.service';
import { JwtAuthGuard } from './guards/jwt-auth.guard';
import { LoginDto } from './dto/login.dto';
import { ChangePasswordDto } from './dto/change-password.dto';
import { Request } from 'express';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  /**
   * POST /auth/login
   * Validates email/password, returns a signed JWT bearer token.
   *
   * DEMO MODE NOTE: When APP_ENV=demo and the database is unavailable,
   * fallback users authenticate with the password 'password'. This behaviour
   * is gated strictly on APP_ENV=demo and must never be active in production.
   */
  @Post('login')
  @Throttle({ default: { limit: 5, ttl: 60000 } })
  @HttpCode(200)
  async login(@Body() body: LoginDto) {
    return this.authService.login(body.email, body.password);
  }

  @Get('me')
  @UseGuards(JwtAuthGuard)
  async getMe(@Req() req: Request) {
    const userId = (req as any).user.sub;
    return this.authService.getMe(userId);
  }

  @Post('logout')
  @HttpCode(200)
  async logout() {
    // Stateless JWT — logout is client-side token removal
    return { message: 'Logged out' };
  }

  @Post('change-password')
  @UseGuards(JwtAuthGuard)
  @Throttle({ default: { limit: 3, ttl: 60000 } })
  @HttpCode(200)
  async changePassword(
    @Body() body: ChangePasswordDto,
    @Req() req: Request,
  ) {
    const userId = (req as any).user.sub;
    return this.authService.changePassword(userId, body.current_password, body.new_password);
  }

  /**
   * POST /auth/reset-password (DEVELOPMENT ONLY)
   * Allows resetting a user's password without knowing the current password.
   * This is for demo/development purposes only and should be disabled in production.
   */
  @Post('reset-password')
  @HttpCode(200)
  async resetPassword(@Body() body: { email: string; new_password: string }) {
    return this.authService.resetPassword(body.email, body.new_password);
  }
}
