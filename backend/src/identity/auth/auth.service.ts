import { Injectable, UnauthorizedException, BadRequestException, NotFoundException, Logger } from '@nestjs/common';
import { PrismaService } from '../../core/database/prisma.service';
import { ConfigService } from '../../core/config/config.service';
import * as bcrypt from 'bcryptjs';
import * as jwt from 'jsonwebtoken';

export interface JwtPayload {
  sub: string;
  email: string;
  roles: string[];
  did?: string;
  iat?: number;
  exp?: number;
  iss?: string;
  aud?: string;
}

export interface TokenResponse {
  access_token: string;
  token_type: string;
}

export interface UserMeResponse {
  id: string;
  email: string;
  name: string;
  status: string;
  roles: string[];
  actor: {
    id: string;
    did: string;
    credential_status: string;
    identity_status: string;
    wallet_address: string | null;
  } | null;
}

@Injectable()
export class AuthService {
  private readonly logger = new Logger(AuthService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly config: ConfigService,
  ) {}

  async login(email: string, password: string): Promise<TokenResponse> {
    let user: any = null;
    try {
      user = await this.prisma.user.findUnique({
        where: { email },
        include: {
          roles: true,
          actor: true,
        },
      });
    } catch (e: any) {
      const isDemoMode = process.env.APP_ENV === 'demo' || process.env.NODE_ENV === 'demo';
      if (!isDemoMode) {
        this.logger.error(`Database failure during user login lookup: ${e.message}`, e.stack);
        throw e;
      }
      this.logger.warn('Database offline, checking fallback users (DEMO mode)');
      const { FALLBACK_USERS, DEMO_EMAIL_ALIASES } = await import('../../core/common/fallback-data');
      // Resolve email aliases (e.g. .gov.in frontend domain <-> .bel.in legacy)
      const resolvedEmail = DEMO_EMAIL_ALIASES[email] || email;
      const fallback = FALLBACK_USERS.find(u => u.email === resolvedEmail || u.email === email);
      if (fallback) {
        user = {
          id: fallback.id,
          email: fallback.email,
          name: fallback.name,
          status: fallback.status,
          passwordHash: await bcrypt.hash('password', 10),
          roles: fallback.roles.map(r => ({ role: r })),
          actor: fallback.actor,
        };
      }
    }

    const isDemoMode = process.env.APP_ENV === 'demo' || process.env.NODE_ENV === 'demo';
    if (!user && isDemoMode) {
      const { FALLBACK_USERS, DEMO_EMAIL_ALIASES } = await import('../../core/common/fallback-data');
      // Resolve email aliases (e.g. .gov.in frontend domain <-> .bel.in legacy)
      const resolvedEmail = DEMO_EMAIL_ALIASES[email] || email;
      const fallback = FALLBACK_USERS.find(u => u.email === resolvedEmail || u.email === email);
      if (fallback) {
        user = {
          id: fallback.id,
          email: fallback.email,
          name: fallback.name,
          status: fallback.status,
          passwordHash: await bcrypt.hash('password', 10),
          roles: fallback.roles.map(r => ({ role: r })),
          actor: fallback.actor,
        };
      }
    }

    if (!user) {
      throw new UnauthorizedException('Invalid credentials');
    }

    const isPasswordValid = await bcrypt.compare(password, user.passwordHash);
    if (!isPasswordValid) {
      throw new UnauthorizedException('Invalid credentials');
    }

    if (user.status === 'DISABLED') {
      throw new UnauthorizedException('Account is disabled');
    }

    // Update last active
    try {
      await this.prisma.user.update({
        where: { id: user.id },
        data: { lastActive: new Date() },
      });
    } catch (e) {
      // Ignored if offline
    }

    const roles = user.roles.map((r: any) => r.role);
    const payload: JwtPayload = {
      sub: user.id,
      email: user.email,
      roles,
      did: user.actor?.did,
    };

    const token = jwt.sign(payload, this.config.jwtSecret, {
      expiresIn: this.config.jwtExpiry as any,
      issuer: this.config.jwtIssuer,
      audience: this.config.jwtAudience,
    } as jwt.SignOptions);

    this.logger.log(`User ${user.email} authenticated successfully`);

    return {
      access_token: token,
      token_type: 'bearer',
    };
  }

  async validateToken(token: string): Promise<JwtPayload> {
    try {
      const payload = jwt.verify(token, this.config.jwtSecret, {
        issuer: this.config.jwtIssuer,
        audience: this.config.jwtAudience,
      }) as JwtPayload;
      return payload;
    } catch (error) {
      throw new UnauthorizedException('Invalid or expired token');
    }
  }

  async getMe(userId: string): Promise<UserMeResponse> {
    let user: any = null;
    try {
      user = await this.prisma.user.findUnique({
        where: { id: userId },
        include: {
          roles: true,
          actor: true,
        },
      });
    } catch (e: any) {
      const isDemoMode = process.env.APP_ENV === 'demo' || process.env.NODE_ENV === 'demo';
      if (!isDemoMode) throw e;
      const fallback = (await import('../../core/common/fallback-data')).FALLBACK_USERS.find(u => u.id === userId);
      if (fallback) {
        return {
          id: fallback.id,
          email: fallback.email,
          name: fallback.name,
          status: fallback.status,
          roles: fallback.roles,
          actor: fallback.actor,
        };
      }
    }

    const isDemoMode = process.env.APP_ENV === 'demo' || process.env.NODE_ENV === 'demo';
    if (!user && isDemoMode) {
      const fallback = (await import('../../core/common/fallback-data')).FALLBACK_USERS.find(u => u.id === userId || u.email === userId);
      if (fallback) {
        return {
          id: fallback.id,
          email: fallback.email,
          name: fallback.name,
          status: fallback.status,
          roles: fallback.roles,
          actor: fallback.actor,
        };
      }
    }

    if (!user) {
      throw new UnauthorizedException('User not found');
    }

    return {
      id: user.id,
      email: user.email,
      name: user.name,
      status: user.status,
      roles: user.roles.map((r: any) => r.role),
      actor: user.actor ? {
        id: user.actor.id,
        did: user.actor.did,
        credential_status: user.actor.credentialStatus || user.actor.credential_status,
        identity_status: user.actor.identityStatus || user.actor.identity_status,
        wallet_address: user.actor.walletAddress || user.actor.wallet_address,
      } : null,
    };
  }

  async changePassword(userId: string, currentPassword?: string, newPassword?: string): Promise<{ message: string }> {
    if (!currentPassword || !newPassword) {
      throw new BadRequestException('current_password and new_password are required');
    }
    if (newPassword.length < 8) {
      throw new BadRequestException('new_password must be at least 8 characters long');
    }

    let user: any = null;
    try {
      user = await this.prisma.user.findUnique({ where: { id: userId } });
    } catch (e: any) {
      const isDemoMode = process.env.APP_ENV === 'demo' || process.env.NODE_ENV === 'demo';
      if (!isDemoMode) throw e;
    }

    const isDemoMode = process.env.APP_ENV === 'demo' || process.env.NODE_ENV === 'demo';
    if (!user && isDemoMode) {
      const { FALLBACK_USERS } = await import('../../core/common/fallback-data');
      const fallback = FALLBACK_USERS.find(u => u.id === userId || u.email === userId);
      if (fallback) {
        const valid = currentPassword === 'password' || (fallback as any).customPassword === currentPassword;
        if (!valid) {
          throw new UnauthorizedException('Current password is incorrect');
        }
        (fallback as any).customPassword = newPassword;
        this.logger.log(`[DEMO MODE] Password updated for user ${fallback.email}`);
        return { message: 'Password updated successfully' };
      }
    }

    if (!user) {
      throw new NotFoundException('User not found');
    }

    const isCurrentValid = await bcrypt.compare(currentPassword, user.passwordHash);
    if (!isCurrentValid) {
      throw new UnauthorizedException('Current password is incorrect');
    }

    const newHash = await bcrypt.hash(newPassword, 10);
    await this.prisma.user.update({
      where: { id: user.id },
      data: { passwordHash: newHash },
    });

    this.logger.log(`Password updated for user ${user.email}`);
    return { message: 'Password updated successfully' };
  }
}
