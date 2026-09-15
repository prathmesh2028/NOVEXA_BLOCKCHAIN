import { Module } from '@nestjs/common';
import { OutboxService } from './outbox.service';
import { WorkerService } from './worker.service';
@Module({ providers: [OutboxService, WorkerService], exports: [OutboxService, WorkerService] })
export class OutboxModule {}
