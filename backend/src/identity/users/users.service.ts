import { Injectable, Logger, ConflictException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../../core/database/prisma.service';
import { AppRole } from '@prisma/client';
import { InviteUserDto } from './dto/invite-user.dto';

@Injectable()
export class UsersService {
  private readonly logger = new Logger(UsersService.name);

  constructor(private readonly prisma: PrismaService) {}

  async inviteUser(data: InviteUserDto) {
    // Guard: role must be a valid AppRole enum value.
    // InviteUserDto enforces this at the DTO layer, but we re-check here
    // to be safe if this method is called programmatically.
    const validRoles = ['SYSTEM_ADMIN', 'PROCUREMENT_SUPPLY_CHAIN_OFFICER', 'QUALITY_INSPECTOR', 'AUDITOR'];
    if (!validRoles.includes(data.role)) {
      throw new BadRequestException(
        `Invalid role '${data.role}'. Must be one of: ${validRoles.join(', ')}`,
      );
    }

    try {
      // Create user with pending status.
      // In production, this would trigger an email with a password reset link.
      const tempPasswordHash = 'INVITATION_PENDING';

      const user = await this.prisma.user.create({
        data: {
          email: data.email,
          name: data.name,
          passwordHash: tempPasswordHash,
          status: 'PENDING',
          roles: {
            create: [{ role: data.role as any }],
          },
        },
        include: { roles: true },
      });

      this.logger.log(`User invited: ${user.email} with role ${data.role}`);

      return {
        id: user.id,
        email: user.email,
        name: user.name,
        status: user.status,
        roles: user.roles.map((r: any) => r.role),
        created_at: user.createdAt.toISOString(),
      };
    } catch (e: any) {
      // Prisma unique constraint on email (P2002) → 409 Conflict
      if (e?.code === 'P2002') {
        throw new ConflictException(`A user with email '${data.email}' already exists`);
      }

      this.logger.error(`Database failure during user invitation: ${e?.message}`, e?.stack);
      throw e;
    }
  }

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
      this.logger.warn(`Database failure in listUsers: ${e?.message}. Returning demo users list.`);
      if (process.env.APP_ENV === 'demo' || process.env.NODE_ENV === 'demo' || process.env.NODE_ENV === 'development') {
        return {
          items: [
            { id: 'usr-001', email: 'a.mehta@bel-defence.in', name: 'Arjun Mehta', status: 'ACTIVE', roles: ['SYSTEM_ADMIN', 'ADMIN'], created_at: new Date().toISOString() },
            { id: 'usr-002', email: 'p.sharma@bel-defence.in', name: 'Priya Sharma', status: 'ACTIVE', roles: ['PROCUREMENT_SUPPLY_CHAIN_OFFICER', 'CREATOR'], created_at: new Date().toISOString() },
            { id: 'usr-003', email: 'r.kumar@bel-defence.in', name: 'Rajesh Kumar', status: 'ACTIVE', roles: ['QUALITY_INSPECTOR', 'TECH'], created_at: new Date().toISOString() },
            { id: 'usr-004', email: 'd.nair@bel-defence.in', name: 'Deepa Nair', status: 'ACTIVE', roles: ['AUDITOR'], created_at: new Date().toISOString() },
          ],
          total: 4,
          page,
          page_size: pageSize,
          has_next: false,
        };
      }
      throw e;
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
