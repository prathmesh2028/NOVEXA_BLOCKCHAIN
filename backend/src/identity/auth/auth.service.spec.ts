import { describe, it, expect, beforeEach, vi } from 'vitest';
import { AuthService } from './auth.service';
import { BadRequestException, UnauthorizedException } from '@nestjs/common';

import * as bcrypt from 'bcryptjs';

describe('AuthService (Authentication & Password Management)', () => {
  let service: AuthService;
  let mockPrisma: any;
  let mockConfig: any;
  const passwordHash = bcrypt.hashSync('password', 10);
  const mockAdminUser = {
    id: 'USR-001',
    email: 'admin@kavachtrust.gov.in',
    name: 'Arjun Mehta',
    status: 'ACTIVE',
    passwordHash,
    roles: [{ role: 'SYSTEM_ADMIN' }],
    actor: { did: 'did:bel:actor:001' },
  };
  const mockNftUser = {
    id: 'USR-002',
    email: 'nft@kavachtrust.gov.in',
    name: 'Priya Sharma',
    status: 'ACTIVE',
    passwordHash,
    roles: [{ role: 'PROCUREMENT_SUPPLY_CHAIN_OFFICER' }],
    actor: { did: 'did:bel:actor:002' },
  };

  beforeEach(() => {
    process.env.APP_ENV = 'demo';
    process.env.NODE_ENV = 'demo';

    mockPrisma = {
      user: {
        findUnique: vi.fn().mockImplementation(async ({ where }) => {
          if (where.id === 'USR-001' || where.email === 'admin@kavachtrust.gov.in' || where.email === 'a.mehta@bel-defence.in') {
            return { ...mockAdminUser, email: where.email || mockAdminUser.email };
          }
          if (where.email === 'nft@kavachtrust.gov.in' || where.email === 'p.sharma@bel-defence.in') {
            return mockNftUser;
          }
          return null;
        }),
        update: vi.fn().mockResolvedValue({}),
      },
    };

    mockConfig = {
      jwtSecret: 'test-secret-key-1234567890123456',
      jwtExpiry: '24h',
      jwtIssuer: 'kavachtrust',
      jwtAudience: 'kavachtrust-api',
      isDemoMode: true,
    };

    service = new AuthService(mockPrisma, mockConfig);
  });

  describe('login', () => {
    it('authenticates demo user with correct password', async () => {
      const res = await service.login('admin@kavachtrust.gov.in', 'password');
      expect(res.access_token).toBeDefined();
      expect(res.token_type).toBe('bearer');
    });

    it('rejects invalid password', async () => {
      await expect(
        service.login('admin@kavachtrust.gov.in', 'wrongpassword')
      ).rejects.toThrow(UnauthorizedException);
    });

    // SECURITY: Empty password must NEVER authenticate anyone, even in demo mode
    it('rejects empty password even in demo mode', async () => {
      await expect(
        service.login('admin@kavachtrust.gov.in', '')
      ).rejects.toThrow(UnauthorizedException);
    });

    it('rejects unknown user', async () => {
      await expect(
        service.login('unknown@nonexistent.domain', 'password')
      ).rejects.toThrow(UnauthorizedException);
    });

    // SECURITY: Verify that the JWT payload contains expected claims
    it('issues a token with correct sub, email, and roles claims', async () => {
      const res = await service.login('admin@kavachtrust.gov.in', 'password');
      // Decode (not verify) the token to inspect claims shape
      const [, payloadB64] = res.access_token.split('.');
      const payload = JSON.parse(Buffer.from(payloadB64, 'base64url').toString('utf8'));
      expect(payload.sub).toBeDefined();
      expect(payload.email).toBe('admin@kavachtrust.gov.in');
      expect(Array.isArray(payload.roles)).toBe(true);
      expect(payload.iss).toBe('kavachtrust');
    });

    // SECURITY: Demo email alias resolution — .gov.in aliases map to .bel.in entries
    it('resolves demo email aliases (gov.in -> bel.in)', async () => {
      const res = await service.login('nft@kavachtrust.gov.in', 'password');
      expect(res.access_token).toBeDefined();
    });

    // SECURITY: Disabled accounts must be rejected even with correct password
    it('rejects login for DISABLED account (non-demo DB path)', async () => {
      const bcrypt = await import('bcryptjs');
      const disabledUser = {
        id: 'usr-disabled',
        email: 'disabled@example.com',
        name: 'Disabled',
        status: 'DISABLED',
        passwordHash: await bcrypt.hash('password', 10),
        roles: [{ role: 'QUALITY_INSPECTOR' }],
        actor: null,
      };
      mockPrisma.user.findUnique = vi.fn().mockResolvedValue(disabledUser);
      process.env.APP_ENV = 'development';
      process.env.NODE_ENV = 'development';
      const serviceNonDemo = new AuthService(mockPrisma, mockConfig);

      await expect(
        serviceNonDemo.login('disabled@example.com', 'password')
      ).rejects.toThrow(UnauthorizedException);

      // Restore demo mode for subsequent tests
      process.env.APP_ENV = 'demo';
      process.env.NODE_ENV = 'demo';
    });
  });

  describe('validateToken', () => {
    it('returns a valid payload for a genuine token', async () => {
      const { access_token } = await service.login('admin@kavachtrust.gov.in', 'password');
      const payload = await service.validateToken(access_token);
      expect(payload.sub).toBeDefined();
      expect(payload.email).toBe('admin@kavachtrust.gov.in');
    });

    it('throws UnauthorizedException for a tampered token', async () => {
      await expect(
        service.validateToken('header.tampered.signature')
      ).rejects.toThrow(UnauthorizedException);
    });

    it('throws UnauthorizedException for an empty string', async () => {
      await expect(service.validateToken('')).rejects.toThrow(UnauthorizedException);
    });
  });

  describe('changePassword', () => {
    it('changes password when current password is valid', async () => {
      const res = await service.changePassword('USR-001', 'password', 'newSecurePassword123');
      expect(res.message).toContain('Password updated successfully');
    });

    it('rejects password change if current password is wrong', async () => {
      await expect(
        service.changePassword('USR-001', 'wrongCurrentPassword', 'newSecurePassword123')
      ).rejects.toThrow(UnauthorizedException);
    });

    it('rejects new password if shorter than 8 characters', async () => {
      await expect(
        service.changePassword('USR-001', 'password', 'short')
      ).rejects.toThrow(BadRequestException);
    });

    it('rejects when parameters are missing', async () => {
      await expect(
        service.changePassword('USR-001', '', 'newSecurePassword123')
      ).rejects.toThrow(BadRequestException);
    });
  });
});
