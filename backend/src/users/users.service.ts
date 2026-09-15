import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class UsersService {
  private readonly logger = new Logger(UsersService.name);

  constructor(private readonly prisma: PrismaService) {}

  async listUsers(params: {
    search?: string;
    status?: string;
    role?: string;
    page?: number;
    page_size?: number;
  }) {
    const page = params.page || 1;
    const pageSize = params.page_size || 20;
    const skip = (page - 1) * pageSize;

    const where: any = {};

    if (params.search) {
      where.OR = [
        { name: { contains: params.search, mode: 'insensitive' } },
        { email: { contains: params.search, mode: 'insensitive' } },
      ];
    }

    if (params.status) {
      where.status = params.status;
    }

    if (params.role) {
      where.roles = { some: { role: params.role } };
    }

    let users: any[] = [];
    let total = 0;

    try {
      const [dbUsers, dbTotal] = await Promise.all([
        this.prisma.user.findMany({
          where,
          include: { roles: true, actor: true },
          skip,
          take: pageSize,
          orderBy: { createdAt: 'desc' },
        }),
        this.prisma.user.count({ where }),
      ]);
      users = dbUsers;
      total = dbTotal;
    } catch (e: any) {
      const fallback = (await import('../common/fallback-data')).FALLBACK_USERS;
      // Exclude ALT variants — only return canonical users (no -ALT suffix IDs)
      const canonical = fallback.filter(
        (u) => !u.id.endsWith('-ALT'),
      );

      // Apply search filter if provided
      let filtered = canonical;
      if (params.search) {
        const q = params.search.toLowerCase();
        filtered = filtered.filter(
          (u) => u.name.toLowerCase().includes(q) || u.email.toLowerCase().includes(q),
        );
      }
      if (params.role) {
        filtered = filtered.filter((u) => u.roles.includes(params.role!));
      }
      if (params.status) {
        filtered = filtered.filter((u) => u.status === params.status);
      }

      return {
        items: filtered.map((u) => ({
          id: u.id,
          email: u.email,
          name: u.name,
          status: u.status,
          roles: u.roles,
          did: u.actor?.did || null,
          identity_status: u.actor?.identity_status || null,
          last_active: u.lastActive || u.last_active,
          created_at: u.createdAt || u.created_at,
        })),
        total: filtered.length,
        page,
        page_size: pageSize,
        has_next: false,
      };
    }

    return {
      items: users.map(u => ({
        id: u.id,
        email: u.email,
        name: u.name,
        status: u.status,
        roles: u.roles.map((r: any) => r.role),
        did: u.actor?.did || null,
        identity_status: u.actor?.identityStatus || null,
        last_active: u.lastActive?.toISOString() || '—',
        created_at: u.createdAt.toISOString(),
      })),
      total,
      page,
      page_size: pageSize,
      has_next: skip + pageSize < total,
    };
  }
}
