import { describe, it, expect, beforeEach, vi } from 'vitest';
import { UsersService } from './users.service';
import { BadRequestException, ConflictException } from '@nestjs/common';
import { AppRole } from '@prisma/client';

describe('UsersService', () => {
  let service: UsersService;
  let mockPrisma: any;

  beforeEach(() => {
    mockPrisma = {
      user: {
        create: vi.fn(),
        findMany: vi.fn(),
        count: vi.fn(),
      },
    };
    service = new UsersService(mockPrisma);
  });

  // ─── inviteUser ────────────────────────────────────────────────────────────

  describe('inviteUser', () => {
    it('creates a user successfully with a valid role', async () => {
      const mockUser = {
        id: 'uuid-1',
        email: 'tech@example.com',
        name: 'Tech User',
        status: 'PENDING',
        createdAt: new Date('2026-01-01'),
        roles: [{ role: AppRole.TECHNICIAN }],
      };
      mockPrisma.user.create.mockResolvedValue(mockUser);

      const result = await service.inviteUser({
        email: 'tech@example.com',
        name: 'Tech User',
        role: AppRole.TECHNICIAN,
      });

      expect(result.email).toBe('tech@example.com');
      expect(result.roles).toContain(AppRole.TECHNICIAN);
      expect(result.status).toBe('PENDING');
    });

    it('throws BadRequestException for an invalid role string', async () => {
      await expect(
        service.inviteUser({
          email: 'bad@example.com',
          name: 'Bad Actor',
          role: 'NONEXISTENT_ROLE' as AppRole,
        }),
      ).rejects.toThrow(BadRequestException);
    });

    it('throws ConflictException when email already exists (P2002)', async () => {
      const prismaError = Object.assign(new Error('Unique constraint'), { code: 'P2002' });
      mockPrisma.user.create.mockRejectedValue(prismaError);

      await expect(
        service.inviteUser({
          email: 'duplicate@example.com',
          name: 'Dup User',
          role: AppRole.AUDITOR,
        }),
      ).rejects.toThrow(ConflictException);
    });

    it('returns mock user when database is offline (non-P2002 error)', async () => {
      mockPrisma.user.create.mockRejectedValue(new Error('Connection refused'));

      const result = await service.inviteUser({
        email: 'offline@example.com',
        name: 'Offline User',
        role: AppRole.NFT_CREATOR,
      });

      // Demo/offline fallback — returns synthetic response, not thrown error
      expect(result.email).toBe('offline@example.com');
      expect(result.status).toBe('PENDING');
      expect(result.roles).toContain(AppRole.NFT_CREATOR);
    });
  });

  // ─── listUsers ─────────────────────────────────────────────────────────────

  describe('listUsers', () => {
    it('returns paginated users from the database', async () => {
      const mockUsers = [
        {
          id: 'uuid-1',
          email: 'a@b.com',
          name: 'A B',
          status: 'ACTIVE',
          createdAt: new Date(),
          lastActive: new Date(),
          roles: [{ role: 'ADMIN' }],
          actor: { did: 'did:web:example', identityStatus: 'VERIFIED' },
        },
      ];
      mockPrisma.user.findMany.mockResolvedValue(mockUsers);
      mockPrisma.user.count.mockResolvedValue(1);

      const result = await service.listUsers({ page: 1, page_size: 10 });
      expect(result.items).toHaveLength(1);
      expect(result.total).toBe(1);
      expect(result.items[0].roles).toContain('ADMIN');
    });

    it('falls back to FALLBACK_USERS when database is offline', async () => {
      mockPrisma.user.findMany.mockRejectedValue(new Error('DB offline'));
      mockPrisma.user.count.mockRejectedValue(new Error('DB offline'));

      const result = await service.listUsers({});

      // Should return non-ALT canonical users from fallback-data
      expect(result.items.length).toBeGreaterThan(0);
      for (const user of result.items) {
        expect(user.id).not.toMatch(/-ALT$/);
      }
    });

    it('filters by search term on fallback data', async () => {
      mockPrisma.user.findMany.mockRejectedValue(new Error('DB offline'));

      const result = await service.listUsers({ search: 'Arjun' });

      expect(result.items.every((u: any) => u.name.includes('Arjun'))).toBe(true);
    });

    it('filters by role on fallback data', async () => {
      mockPrisma.user.findMany.mockRejectedValue(new Error('DB offline'));

      const result = await service.listUsers({ role: 'ADMIN' });

      expect(result.items.every((u: any) => u.roles.includes('ADMIN'))).toBe(true);
    });
  });
});
