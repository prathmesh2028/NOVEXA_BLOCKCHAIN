import {
  Controller,
  Post,
  Get,
  Delete,
  Body,
  Param,
  Query,
  UseGuards,
  Req,
} from '@nestjs/common';
import { PhysicalBindingsService } from './physical-bindings.service';
import { JwtAuthGuard } from '../../identity/auth/guards/jwt-auth.guard';
import { CasbinGuard } from '../../identity/auth/guards/casbin.guard';
import { RolesGuard, RequireRoles } from '../../identity/auth/guards/roles.guard';

@Controller('physical-bindings')
@UseGuards(JwtAuthGuard, CasbinGuard)
export class PhysicalBindingsController {
  constructor(private readonly bindingsService: PhysicalBindingsService) {}

  @Post()
  @UseGuards(RolesGuard)
  @RequireRoles('QUALITY_INSPECTOR', 'SYSTEM_ADMIN')
  async createBinding(@Body() body: any, @Req() req: any) {
    return this.bindingsService.createBinding({
      assetId: body.asset_id || body.assetId,
      bindingType: body.binding_type || body.bindingType,
      identifier: body.identifier,
      metadata: body.metadata,
      actorId: req.user?.sub,
      actorName: req.user?.name,
    });
  }

  @Get()
  async listBindings(@Query('asset_id') assetId?: string) {
    return this.bindingsService.listBindings(assetId);
  }

  @Get(':id')
  async getBinding(@Param('id') id: string) {
    return this.bindingsService.getBinding(id);
  }

  @Delete(':id')
  @UseGuards(RolesGuard)
  @RequireRoles('QUALITY_INSPECTOR', 'SYSTEM_ADMIN')
  async deleteBinding(@Param('id') id: string, @Req() req: any) {
    return this.bindingsService.deleteBinding(id, req.user?.sub, req.user?.name);
  }
}
