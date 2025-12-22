import { BullModule } from '@nestjs/bullmq';
import { Module } from '@nestjs/common';
import { StockQueueService } from './stock-queue.service';

@Module({
  imports: [BullModule.registerQueue({
    name: 'stock-queue',
  })],
  providers: [StockQueueService],
  exports: [StockQueueService],
})
export class QueueModule {}
