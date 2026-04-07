import { InjectQueue } from '@nestjs/bullmq';
import { Injectable } from '@nestjs/common';
import { Prisma, StockMovementType } from '@prisma/client';
import { Queue } from 'bullmq';
import {
  JOB_GENERATE_RECEIPT,
  JOB_LOW_STOCK_NOTIFY,
  LOW_STOCK_THRESHOLD,
  QUEUE_LOW_STOCK,
  QUEUE_OUTBOUND_INVOICE,
} from '../queues.constants';

export type AfterMovementJobPayload = {
  movementType: StockMovementType;
  productId: string;
  locationId: string;
  quantityOnHand: string;
  ledgerEntryId: string;
};

@Injectable()
export class StockMovementJobsService {
  constructor(
    @InjectQueue(QUEUE_LOW_STOCK) private readonly lowStockQueue: Queue,
    @InjectQueue(QUEUE_OUTBOUND_INVOICE)
    private readonly invoiceQueue: Queue,
  ) {}

  /**
   * Enqueue side-effects after the stock transaction has committed successfully.
   */
  async scheduleAfterMovement(payload: AfterMovementJobPayload): Promise<void> {
    const onHand = new Prisma.Decimal(payload.quantityOnHand);
    const threshold = new Prisma.Decimal(LOW_STOCK_THRESHOLD);

    if (onHand.lessThan(threshold)) {
      await this.lowStockQueue.add(
        JOB_LOW_STOCK_NOTIFY,
        {
          productId: payload.productId,
          locationId: payload.locationId,
          quantityOnHand: payload.quantityOnHand,
          threshold: threshold.toString(),
        },
        { removeOnComplete: 1000, removeOnFail: 5000 },
      );
    }

    if (payload.movementType === StockMovementType.OUTBOUND) {
      await this.invoiceQueue.add(
        JOB_GENERATE_RECEIPT,
        { ledgerEntryId: payload.ledgerEntryId },
        { removeOnComplete: 1000, removeOnFail: 5000 },
      );
    }
  }
}
