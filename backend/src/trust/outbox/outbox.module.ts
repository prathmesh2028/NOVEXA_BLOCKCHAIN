import { Module } from '@nestjs/common';
import { OutboxService } from './outbox.service';
import { WorkerService } from './worker.service';
import { BlockchainModule } from '../blockchain/blockchain.module';
import { PrismaModule } from '../../core/database/prisma.module';
import { NotificationsModule } from '../../notifications/notifications.module';

@Module({ 
  imports: [BlockchainModule, PrismaModule, NotificationsModule],
  providers: [OutboxService, WorkerService], 
  exports: [OutboxService, WorkerService] 
})
export class OutboxModule {}
