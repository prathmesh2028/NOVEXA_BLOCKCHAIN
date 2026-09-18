import { Module } from '@nestjs/common';
import { OutboxService } from './outbox.service';
import { WorkerService } from './worker.service';
import { BlockchainModule } from '../blockchain/blockchain.module';

@Module({ 
  imports: [BlockchainModule],
  providers: [OutboxService, WorkerService], 
  exports: [OutboxService, WorkerService] 
})
export class OutboxModule {}
