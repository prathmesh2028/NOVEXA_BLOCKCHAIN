import { Controller, Get, Post, Body, Param, UseGuards, Req, Patch, Query } from '@nestjs/common';
import { SupplyChainService } from './supply-chain.service';
import { JwtAuthGuard } from '../identity/auth/guards/jwt-auth.guard';
import { CasbinGuard } from '../identity/auth/guards/casbin.guard';

@Controller('supply-chain')
@UseGuards(JwtAuthGuard, CasbinGuard)
export class SupplyChainController {
  constructor(private readonly supplyChainService: SupplyChainService) {}

  @Get('suppliers')
  getSuppliers() {
    return this.supplyChainService.getSuppliers();
  }

  @Post('suppliers')
  createSupplier(@Body() body: any, @Req() req: any) {
    return this.supplyChainService.createSupplier(body, req.user?.id || req.user?.sub || 'system');
  }

  @Get('facilities')
  getFacilities() {
    return this.supplyChainService.getFacilities();
  }

  @Post('facilities')
  createFacility(@Body() body: any, @Req() req: any) {
    return this.supplyChainService.createFacility(body, req.user?.id || req.user?.sub || 'system');
  }

  @Get('lots')
  getLots() {
    return this.supplyChainService.getLots();
  }

  @Post('lots')
  createLot(@Body() body: any, @Req() req: any) {
    return this.supplyChainService.createLot(body, req.user?.id || req.user?.sub || 'system');
  }

  @Get('shipments')
  getShipments() {
    return this.supplyChainService.getShipments();
  }

  @Post('shipments')
  createShipment(@Body() body: any, @Req() req: any) {
    return this.supplyChainService.createShipment(body, req.user?.id || req.user?.sub || 'system');
  }

  @Patch('shipments/:id/dispatch')
  dispatchShipment(@Param('id') id: string, @Req() req: any) {
    return this.supplyChainService.dispatchShipment(id, req.user?.id || req.user?.sub || 'system');
  }

  @Patch('shipments/:id/receive')
  receiveShipment(@Param('id') id: string, @Req() req: any) {
    return this.supplyChainService.receiveShipment(id, req.user?.id || req.user?.sub || 'system');
  }

  // CUSTODY TRANSFERS
  @Get('custody-transfers')
  getCustodyTransfers() {
    return this.supplyChainService.getCustodyTransfers();
  }

  @Post('custody-transfers')
  createCustodyTransfer(@Body() body: any, @Req() req: any) {
    return this.supplyChainService.createCustodyTransfer(body, req.user?.id || req.user?.sub || 'system');
  }

  @Patch('custody-transfers/:id/accept')
  acceptCustodyTransfer(@Param('id') id: string, @Req() req: any) {
    return this.supplyChainService.acceptCustodyTransfer(id, req.user?.id || req.user?.sub || 'system');
  }

  @Patch('custody-transfers/:id/reject')
  rejectCustodyTransfer(@Param('id') id: string, @Body() body: { reason?: string }, @Req() req: any) {
    return this.supplyChainService.rejectCustodyTransfer(id, body?.reason || 'No reason provided', req.user?.id || req.user?.sub || 'system');
  }

  // SUPPLY CHAIN EVENTS
  @Get('events')
  getSupplyChainEvents(@Query('entity_type') entityType?: string, @Query('entity_id') entityId?: string) {
    return this.supplyChainService.getSupplyChainEvents({ entityType, entityId });
  }

  @Post('events')
  createSupplyChainEvent(@Body() body: any, @Req() req: any) {
    return this.supplyChainService.createSupplyChainEvent(body, req.user?.id || req.user?.sub || 'system');
  }
}
