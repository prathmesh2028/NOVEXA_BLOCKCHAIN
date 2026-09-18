import { Controller, Get, Post, Delete, Body, Req, UseGuards, Param, BadRequestException } from '@nestjs/common';
import { WalletService } from './wallet.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { Request } from 'express';

@Controller('wallet')
@UseGuards(JwtAuthGuard)
export class WalletController {
  constructor(private readonly walletService: WalletService) {}

  @Get()
  async getWallets(@Req() req: Request) {
    const userId = (req as any).user.sub;
    return this.walletService.getWallets(userId);
  }

  @Post('challenge')
  async getChallenge(@Req() req: Request, @Body() body: { address: string }) {
    if (!body.address) throw new BadRequestException('Address is required');
    const userId = (req as any).user.sub;
    return this.walletService.generateChallenge(userId, body.address);
  }

  @Post('bind')
  async bindWallet(@Req() req: Request, @Body() body: { address: string; signature: string; nonce: string }) {
    if (!body.address || !body.signature || !body.nonce) {
      throw new BadRequestException('Address, signature, and nonce are required');
    }
    const userId = (req as any).user.sub;
    return this.walletService.verifySignatureAndBind(userId, body.address, body.signature, body.nonce);
  }

  @Delete(':address')
  async deleteWallet(@Req() req: Request, @Param('address') address: string) {
    const userId = (req as any).user.sub;
    return this.walletService.deleteWallet(userId, address);
  }
}
