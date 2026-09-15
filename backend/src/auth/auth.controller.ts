import { Controller, Post, Get, Body, Req, UseGuards, HttpCode } from '@nestjs/common';
import { AuthService } from './auth.service';
import { JwtAuthGuard } from './guards/jwt-auth.guard';
import { CasbinGuard, CasbinPolicy } from './guards/casbin.guard';
import { Request } from 'express';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('login')
  @HttpCode(200)
  async login(@Body() body: { email: string; password: string }) {
    return this.authService.login(body.email, body.password);
  }

  @Get('me')
  @UseGuards(JwtAuthGuard, CasbinGuard)
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
}
