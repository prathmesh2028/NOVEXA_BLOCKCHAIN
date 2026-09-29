import { Injectable, BadRequestException, NotFoundException, Logger } from '@nestjs/common';
import { PrismaService } from '../../core/database/prisma.service';
import { verifyMessage } from 'viem';
import { randomUUID } from 'crypto';

export interface WalletChallengeResponse {
  nonce: string;
  message: string;
}

@Injectable()
export class WalletService {
  private readonly logger = new Logger(WalletService.name);

  constructor(private readonly prisma: PrismaService) {}

  /**
   * Generates a single-use challenge for a wallet address binding.
   */
  async generateChallenge(userId: string, address: string): Promise<WalletChallengeResponse> {
    const normalizedAddress = address.toLowerCase();
    
    // Clear any existing pending unconsumed challenges for this user/address to prevent spam
    await this.prisma.walletChallenge.deleteMany({
      where: {
        userId,
        address: normalizedAddress,
        consumed: false
      }
    });

    const nonce = randomUUID();
    const expiresAt = new Date(Date.now() + 5 * 60 * 1000); // 5 minutes

    await this.prisma.walletChallenge.create({
      data: {
        userId,
        address: normalizedAddress,
        nonce,
        expiresAt,
      }
    });

    const message = this.buildMessage(normalizedAddress, nonce);
    return { nonce, message };
  }

  /**
   * Constructs the canonical challenge message to be signed by the wallet.
   */
  private buildMessage(address: string, nonce: string): string {
    return `KavachTrust wallet verification

Verify ownership of wallet:
${address}

Nonce:
${nonce}`;
  }

  /**
   * Verifies the signature against the nonce and binds the wallet.
   */
  async verifySignatureAndBind(userId: string, address: string, signature: string, nonce: string): Promise<any> {
    const normalizedAddress = address.toLowerCase();
    const message = this.buildMessage(normalizedAddress, nonce);
    
    let isValid = false;
    try {
      isValid = await verifyMessage({
        address: address as `0x${string}`,
        message,
        signature: signature as `0x${string}`
      });
    } catch (e) {
      this.logger.error(`Signature verification failed: ${e}`);
      throw new BadRequestException('Invalid signature format');
    }

    if (!isValid) {
      throw new BadRequestException('Signature verification failed');
    }

    // Wrap the challenge consumption and wallet binding in a transaction
    return await this.prisma.$transaction(async (tx) => {
      const challenge = await tx.walletChallenge.findUnique({
        where: { nonce }
      });

      if (!challenge) {
        throw new BadRequestException('Challenge not found');
      }

      if (challenge.userId !== userId || challenge.address !== normalizedAddress) {
        throw new BadRequestException('Challenge does not match user or address');
      }

      if (challenge.consumed) {
        throw new BadRequestException('Challenge already consumed');
      }

      if (challenge.expiresAt < new Date()) {
        throw new BadRequestException('Challenge expired');
      }

      // Mark consumed
      await tx.walletChallenge.update({
        where: { id: challenge.id },
        data: { consumed: true }
      });

      // Upsert wallet binding
      const binding = await tx.walletBinding.upsert({
        where: {
          userId_address: {
            userId,
            address: normalizedAddress,
          }
        },
        update: {
          verified: true,
          verifiedAt: new Date(),
        },
        create: {
          userId,
          address: normalizedAddress,
          verified: true,
          verifiedAt: new Date(),
        }
      });

      return binding;
    });
  }

  /**
   * Returns all wallet bindings for a user.
   */
  async getWallets(userId: string) {
    try {
      return await this.prisma.walletBinding.findMany({
        where: { userId },
        orderBy: { createdAt: 'desc' }
      });
    } catch (err: any) {
      this.logger.warn(`DB offline — returning empty wallets: ${err.message}`);
      return [];
    }
  }

  /**
   * Deletes a wallet binding.
   */
  async deleteWallet(userId: string, address: string) {
    const normalizedAddress = address.toLowerCase();

    try {
      await this.prisma.walletBinding.delete({
        where: {
          userId_address: {
            userId,
            address: normalizedAddress
          }
        }
      });
      return { success: true };
    } catch (e) {
      throw new NotFoundException('Wallet binding not found');
    }
  }
}
