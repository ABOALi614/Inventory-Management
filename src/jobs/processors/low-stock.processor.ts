import { Processor, WorkerHost } from '@nestjs/bullmq';
import { Logger } from '@nestjs/common';
import { Job } from 'bullmq';
import { PrismaService } from '../../prisma/prisma.service';
import {
  JOB_LOW_STOCK_NOTIFY,
  QUEUE_LOW_STOCK,
} from '../queues.constants';

export type LowStockJobData = {
  productId: string;
  locationId: string;
  quantityOnHand: string;
  threshold: string;
};

@Processor(QUEUE_LOW_STOCK)
export class LowStockProcessor extends WorkerHost {
  private readonly logger = new Logger(LowStockProcessor.name);

  constructor(private readonly prisma: PrismaService) {
    super();
  }

  async process(job: Job<LowStockJobData, unknown, string>): Promise<void> {
    if (job.name !== JOB_LOW_STOCK_NOTIFY) {
      return;
    }
    const { productId, locationId, quantityOnHand, threshold } = job.data;
    const product = await this.prisma.product.findUnique({
      where: { id: productId },
      select: { sku: true, name: true },
    });
    const sku = product?.sku ?? productId;
    const name = product?.name ?? '(unknown)';
    this.logger.warn(
      `[LOW STOCK EMAIL → MANAGER] "${name}" (${sku}) at location ${locationId}: ` +
        `quantityOnHand=${quantityOnHand} (threshold=${threshold}). ` +
        `Simulated email: notify warehouse manager to reorder or transfer stock.`,
    );
  }
}
