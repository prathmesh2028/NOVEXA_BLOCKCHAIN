import { describe, it, expect, beforeEach, vi } from 'vitest';
import { AuthService } from './auth.service';
import { BadRequestException, UnauthorizedException } from '@nestjs/common';

describe('AuthService (Authentication & Password Management)', () => {
  let service: AuthService;
  let mockPrisma: any;
  let mockConfig: any;

  beforeEach(() => {
    process.env.APP_ENV = 'demo';
    process.env.NODE_ENV = 'demo';

    mockPrisma = {
      user: {
        findUnique: vi.fn().mockRejectedValue(new Error('Database offline')),
        update: vi.fn().mockResolvedValue({}),
      },
    };

    mockConfig = {
      jwtSecret: 'test-secret-key-1234567890123456',
      jwtExpiry: '24h',
      jwtIssuer: 'kavachtrust',
      jwtAudience: 'kavachtrust-api',
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

    it('rejects unknown user', async () => {
      await expect(
        service.login('unknown@nonexistent.domain', 'password')
      ).rejects.toThrow(UnauthorizedException);
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
