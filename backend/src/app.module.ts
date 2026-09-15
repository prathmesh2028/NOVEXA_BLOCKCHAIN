import { Module, MiddlewareConsumer, NestModule } from '@nestjs/common';
import { ConfigModule } from './config/config.module';
import { PrismaModule } from './prisma/prisma.module';
import { AuthModule } from './auth/auth.module';
import { UsersModule } from './users/users.module';
import { AssetsModule } from './assets/assets.module';
import { EvidenceModule } from './evidence/evidence.module';
import { LifecycleModule } from './lifecycle/lifecycle.module';
import { InspectionsModule } from './inspections/inspections.module';
import { CertificationsModule } from './certifications/certifications.module';
import { BlockchainModule } from './blockchain/blockchain.module';
import { AuditModule } from './audit/audit.module';
import { MerkleModule } from './merkle/merkle.module';
import { OutboxModule } from './outbox/outbox.module';
import { VerificationModule } from './verification/verification.module';
import { SearchModule } from './search/search.module';
import { DashboardModule } from './dashboard/dashboard.module';
import { HealthModule } from './health/health.module';
import { IdentityModule } from './identity/identity.module';
import { RequestIdMiddleware } from './common/middleware/request-id.middleware';

@Module({
  imports: [
    ConfigModule,
    PrismaModule,
    AuthModule,
    UsersModule,
    AssetsModule,
    EvidenceModule,
    LifecycleModule,
    InspectionsModule,
    CertificationsModule,
    BlockchainModule,
    AuditModule,
    MerkleModule,
    OutboxModule,
    VerificationModule,
    SearchModule,
    DashboardModule,
    HealthModule,
    IdentityModule,
  ],
})
export class AppModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer.apply(RequestIdMiddleware).forRoutes('*');
  }
}
