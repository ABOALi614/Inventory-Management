import { Injectable } from '@nestjs/common';
import {
  LedgerReferenceKind,
  Prisma,
  StockLedgerEntry,
  StockMovementType,
} from '@prisma/client';

export type AppendLedgerEntryInput = {
  productId: string;
  locationId: string;
  warehouseId: string;
  movementType: StockMovementType;
  quantityDelta: Prisma.Decimal;
  referenceKind: LedgerReferenceKind;
  /** Actor for audit trail (JWT user). */
  performedByUserId: string;
  referenceId?: string;
  correlationId?: string;
  idempotencyKey?: string;
  metadata?: Prisma.InputJsonValue;
};

@Injectable()
export class LedgerPostingService {
  appendEntry(
    tx: Prisma.TransactionClient,
    input: AppendLedgerEntryInput,
  ): Promise<StockLedgerEntry> {
    return tx.stockLedgerEntry.create({
      data: {
        productId: input.productId,
        locationId: input.locationId,
        warehouseId: input.warehouseId,
        movementType: input.movementType,
        quantityDelta: input.quantityDelta,
        referenceKind: input.referenceKind,
        referenceId: input.referenceId,
        correlationId: input.correlationId,
        idempotencyKey: input.idempotencyKey,
        metadata: input.metadata === undefined ? undefined : input.metadata,
        performedByUserId: input.performedByUserId,
      },
    });
  }
}
