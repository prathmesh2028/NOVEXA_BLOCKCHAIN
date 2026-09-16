import { Controller, Get, UseGuards } from '@nestjs/common';
import { DashboardService } from './dashboard.service';
import { JwtAuthGuard } from '../identity/auth/guards/jwt-auth.guard';
import { CasbinGuard, CasbinPolicy } from '../identity/auth/guards/casbin.guard';

@Controller('dashboard')
@UseGuards(JwtAuthGuard, CasbinGuard)
export class DashboardController {
  constructor(private readonly dashboardService: DashboardService) {}

  @Get('summary')
  async getSummary() {
    return this.dashboardService.getSummary();
  }
}
