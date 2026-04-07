import { BullModule } from '@nestjs/bullmq';
import { Module } from '@nestjs/common';
import { PrismaModule } from '../prisma/prisma.module';
import { StockMovementJobsService } from './application/stock-movement-jobs.service';
import { LowStockProcessor } from './processors/low-stock.processor';
import { OutboundInvoiceProcessor } from './processors/outbound-invoice.processor';
import {
  QUEUE_LOW_STOCK,
  QUEUE_OUTBOUND_INVOICE,
} from './queues.constants';

@Module({
  imports: [
    PrismaModule,
    BullModule.forRoot({
      connection: {
        host: process.env.REDIS_HOST ?? '127.0.0.1',
        port: parseInt(process.env.REDIS_PORT ?? '6379', 10),
      },
    }),
    BullModule.registerQueue({ name: QUEUE_LOW_STOCK }),
    BullModule.registerQueue({ name: QUEUE_OUTBOUND_INVOICE }),
  ],
  providers: [
    StockMovementJobsService,
    LowStockProcessor,
    OutboundInvoiceProcessor,
  ],
  exports: [BullModule, StockMovementJobsService],
})
export class JobsModule {}
