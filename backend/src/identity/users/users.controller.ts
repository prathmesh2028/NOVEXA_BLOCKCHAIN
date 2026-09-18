import { Controller, Get, Post, Query, Body, UseGuards } from '@nestjs/common';
import { UsersService } from './users.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CasbinGuard, CasbinPolicy } from '../auth/guards/casbin.guard';

@Controller('users')
@UseGuards(JwtAuthGuard, CasbinGuard)
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Get()
  @CasbinPolicy('/api/v1/users', 'GET')
  async listUsers(
    @Query('search') search?: string,
    @Query('status') status?: string,
    @Query('role') role?: string,
    @Query('page') page?: string,
    @Query('page_size') pageSize?: string,
  ) {
    return this.usersService.listUsers({
      search,
      status,
      role,
      page: page ? parseInt(page, 10) : undefined,
      page_size: pageSize ? parseInt(pageSize, 10) : undefined,
    });
  }

  @Post()
  @CasbinPolicy('/api/v1/users', 'POST')
  async inviteUser(
    @Body() body: { email: string; name: string; role: string },
  ) {
    return this.usersService.inviteUser(body);
  }
}
