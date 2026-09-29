import { Module } from '@nestjs/common';
import { OutboxService } from './outbox.service';
import { WorkerService } from './worker.service';
import { BlockchainModule } from '../blockchain/blockchain.module';
import { PrismaModule } from '../../core/database/prisma.module';
import { NotificationsModule } from '../../notifications/notifications.module';
import { AuditModule } from '../../asset-management/audit/audit.module';

@Module({ 
  imports: [BlockchainModule, PrismaModule, NotificationsModule, AuditModule],
  providers: [OutboxService, WorkerService], 
  exports: [OutboxService, WorkerService] 
})
export class OutboxModule {}
