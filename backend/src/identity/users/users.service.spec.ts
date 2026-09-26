import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { UsersService } from './users.service';
import { BadRequestException, ConflictException } from '@nestjs/common';
import { AppRole } from '@prisma/client';

describe('UsersService', () => {
  let service: UsersService;
  let mockPrisma: any;
  const originalEnv = { ...process.env };

  beforeEach(() => {
    process.env.APP_ENV = 'demo';
    process.env.NODE_ENV = 'demo';

    mockPrisma = {
      user: {
        create: vi.fn(),
        findMany: vi.fn(),
        count: vi.fn(),
      },
    };
    service = new UsersService(mockPrisma);
  });

  afterEach(() => {
    process.env = { ...originalEnv };
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
        roles: [{ role: AppRole.QUALITY_INSPECTOR }],
      };
      mockPrisma.user.create.mockResolvedValue(mockUser);

      const result = await service.inviteUser({
        email: 'tech@example.com',
        name: 'Tech User',
        role: AppRole.QUALITY_INSPECTOR,
      });

      expect(result.email).toBe('tech@example.com');
      expect(result.roles).toContain(AppRole.QUALITY_INSPECTOR);
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

    it('throws database error when database is offline during invite', async () => {
      mockPrisma.user.create.mockRejectedValue(new Error('Connection refused'));

      await expect(
        service.inviteUser({
          email: 'offline@example.com',
          name: 'Offline User',
          role: AppRole.QUALITY_INSPECTOR,
        }),
      ).rejects.toThrow('Connection refused');
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

    it('filters by search term in database query', async () => {
      mockPrisma.user.findMany.mockResolvedValue([
        {
          id: 'uuid-1',
          email: 'arjun@example.com',
          name: 'Arjun Mehta',
          status: 'ACTIVE',
          createdAt: new Date(),
          roles: [{ role: 'ADMIN' }],
          actor: null,
        },
      ]);
      mockPrisma.user.count.mockResolvedValue(1);

      const result = await service.listUsers({ search: 'Arjun' });
      expect(mockPrisma.user.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({
            OR: [
              { name: { contains: 'Arjun', mode: 'insensitive' } },
              { email: { contains: 'Arjun', mode: 'insensitive' } },
            ],
          }),
        }),
      );
      expect(result.items).toHaveLength(1);
    });

    it('filters by role in database query', async () => {
      mockPrisma.user.findMany.mockResolvedValue([
        {
          id: 'uuid-1',
          email: 'admin@example.com',
          name: 'Admin User',
          status: 'ACTIVE',
          createdAt: new Date(),
          roles: [{ role: 'ADMIN' }],
          actor: null,
        },
      ]);
      mockPrisma.user.count.mockResolvedValue(1);

      const result = await service.listUsers({ role: 'ADMIN' });
      expect(mockPrisma.user.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({
            roles: { some: { role: 'ADMIN' } },
          }),
        }),
      );
      expect(result.items[0].roles).toContain('ADMIN');
    });

    it('throws database error when database is offline in production mode', async () => {
      // Set production mode to disable fallback
      process.env.APP_ENV = 'production';
      process.env.NODE_ENV = 'production';

      mockPrisma.user.findMany.mockRejectedValue(new Error('DB offline'));
      mockPrisma.user.count.mockRejectedValue(new Error('DB offline'));

      await expect(service.listUsers({})).rejects.toThrow('DB offline');
    });
  });
});
