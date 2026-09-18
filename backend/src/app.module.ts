import { Module, MiddlewareConsumer, NestModule } from '@nestjs/common';
import { ConfigModule } from './core/config/config.module';
import { PrismaModule } from './core/database/prisma.module';
import { AuthModule } from './identity/auth/auth.module';
import { UsersModule } from './identity/users/users.module';
import { AssetsModule } from './asset-management/assets/assets.module';
import { EvidenceModule } from './asset-management/evidence/evidence.module';
import { LifecycleModule } from './asset-management/lifecycle/lifecycle.module';
import { InspectionsModule } from './asset-management/inspections/inspections.module';
import { CertificationsModule } from './certification/certifications/certifications.module';
import { BlockchainModule } from './trust/blockchain/blockchain.module';
import { AuditModule } from './asset-management/audit/audit.module';
import { MerkleModule } from './asset-management/merkle/merkle.module';
import { OutboxModule } from './trust/outbox/outbox.module';
import { VerificationModule } from './verification/verification.module';
import { SearchModule } from './search/search.module';
import { DashboardModule } from './dashboard/dashboard.module';
import { HealthModule } from './health/health.module';
import { IdentityModule } from './identity/identity.module';
import { WalletModule } from './identity/wallet/wallet.module';
import { CasbinModule } from './core/casbin/casbin.module';
import { NotificationsModule } from './notifications/notifications.module';
import { ApprovalsModule } from './asset-management/approvals/approvals.module';
import { PhysicalBindingsModule } from './asset-management/physical-bindings/physical-bindings.module';
import { RequestIdMiddleware } from './core/middleware/request-id.middleware';

@Module({
  imports: [
    ConfigModule,
    PrismaModule,
    CasbinModule,
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
    WalletModule,
    NotificationsModule,
    ApprovalsModule,
    PhysicalBindingsModule,
  ],
})
export class AppModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer.apply(RequestIdMiddleware).forRoutes('*');
  }
}
