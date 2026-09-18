import { Controller, Get, Post, Param, Query, Body, UseGuards, Req } from '@nestjs/common';
import { AssetsService } from './assets.service';
import { JwtAuthGuard } from '../../identity/auth/guards/jwt-auth.guard';
import { CasbinGuard, CasbinPolicy } from '../../identity/auth/guards/casbin.guard';
import { Request } from 'express';

@Controller('assets')
@UseGuards(JwtAuthGuard, CasbinGuard)
export class AssetsController {
  constructor(private readonly assetsService: AssetsService) {}

  @Get()
  async listAssets(
    @Query('search') search?: string,
    @Query('lifecycle') lifecycle?: string,
    @Query('page') page?: string,
    @Query('page_size') pageSize?: string,
  ) {
    return this.assetsService.listAssets({
      search,
      lifecycle,
      page: page ? parseInt(page, 10) : undefined,
      page_size: pageSize ? parseInt(pageSize, 10) : undefined,
    });
  }

  /**
   * GET /assets/eligible
   * Returns assets that are ACCEPTED_FOR_ASSEMBLY, have verified evidence,
   * and are not already certified. This is the pool for NFT_CREATOR certification.
   */
  @Get('eligible')
  @CasbinPolicy('/api/v1/assets/eligible', 'GET')
  async getEligibleAssets(
    @Query('page') page?: string,
    @Query('page_size') pageSize?: string,
  ) {
    return this.assetsService.getEligibleAssets({
      page: page ? parseInt(page, 10) : undefined,
      page_size: pageSize ? parseInt(pageSize, 10) : undefined,
    });
  }

  @Get(':id')
  async getAsset(@Param('id') id: string) {
    return this.assetsService.getAsset(id);
  }

  @Post()
  @CasbinPolicy('/api/v1/assets', 'POST')
  async createAsset(@Body() body: any, @Req() req: Request) {
    const user = (req as any).user;
    return this.assetsService.createAsset({
      ...body,
      registeredById: user.sub,
      registeredByName: user.name || user.email,
    });
  }
}
