import { Injectable, OnModuleInit, OnModuleDestroy, Logger } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';
import * as bcrypt from 'bcryptjs';

@Injectable()
export class PrismaService extends PrismaClient implements OnModuleInit, OnModuleDestroy {
  private readonly logger = new Logger(PrismaService.name);

  constructor() {
    super({
      log: [
        { level: 'warn', emit: 'event' },
        { level: 'error', emit: 'event' },
      ],
    });
  }

  async onModuleInit() {
    try {
      await this.$connect();
      this.logger.log('Connected to PostgreSQL');

      // Auto-seed baseline users if database is empty
      try {
        const count = await this.user.count();
        if (count === 0) {
          this.logger.log('Empty database detected — auto-seeding baseline users...');
          await this.autoSeedBaseline();
        }
      } catch (seedErr: any) {
        this.logger.warn(`Auto-seeding check skipped: ${seedErr.message}`);
      }
    } catch (err: any) {
      this.logger.error(`PostgreSQL connection unavailable: ${err.message}`);
      if (process.env.NODE_ENV === 'production' || process.env.APP_ENV === 'production') {
        throw err;
      }
      this.logger.warn('Starting server in local offline/fallback mode.');
    }
  }

  private async autoSeedBaseline() {
    try {
      const passwordHash = await bcrypt.hash('password', 10);

      const users = [
        {
          id: 'usr-001',
          email: 'a.mehta@bel-defence.in',
          name: 'Arjun Mehta',
          role: 'SYSTEM_ADMIN' as const,
          actor: { id: 'act-001', did: 'did:bel:actor:001', walletAddress: '0x8A42b3c5d1e7f2a919F2' },
        },
        {
          id: 'usr-002',
          email: 'p.sharma@bel-defence.in',
          name: 'Priya Sharma',
          role: 'PROCUREMENT_SUPPLY_CHAIN_OFFICER' as const,
          actor: { id: 'act-002', did: 'did:bel:actor:002', walletAddress: '0x3C77f4a2b8c1d5e9A4D1' },
        },
        {
          id: 'usr-003',
          email: 'r.kumar@bel-defence.in',
          name: 'Rajesh Kumar',
          role: 'QUALITY_INSPECTOR' as const,
          actor: { id: 'act-003', did: 'did:bel:actor:003', walletAddress: null },
        },
        {
          id: 'usr-004',
          email: 'd.nair@bel-defence.in',
          name: 'Deepa Nair',
          role: 'AUDITOR' as const,
          actor: { id: 'act-004', did: 'did:bel:actor:004', walletAddress: null },
        },
      ];

      for (const u of users) {
        const user = await this.user.upsert({
          where: { email: u.email },
          update: {},
          create: {
            id: u.id,
            email: u.email,
            name: u.name,
            passwordHash,
            status: 'ACTIVE',
          },
        });

        await this.userRole.upsert({
          where: { userId_role: { userId: user.id, role: u.role } },
          update: {},
          create: { userId: user.id, role: u.role },
        }).catch(() => {});

        if (u.actor) {
          await this.actor.upsert({
            where: { userId: user.id },
            update: {},
            create: {
              id: u.actor.id,
              userId: user.id,
              did: u.actor.did,
              walletAddress: u.actor.walletAddress,
              credentialStatus: 'VERIFIED',
              identityStatus: 'VERIFIED',
            },
          }).catch(() => {});
        }
      }

      this.logger.log('Baseline users, roles, and actors successfully seeded');
    } catch (e: any) {
      this.logger.warn(`Failed to auto-seed baseline users: ${e.message}`);
    }
  }

  async onModuleDestroy() {
    await this.$disconnect();
    this.logger.log('Disconnected from PostgreSQL');
  }
}
