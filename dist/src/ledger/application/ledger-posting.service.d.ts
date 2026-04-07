import { LedgerReferenceKind, Prisma, StockLedgerEntry, StockMovementType } from '@prisma/client';
export type AppendLedgerEntryInput = {
    productId: string;
    locationId: string;
    warehouseId: string;
    movementType: StockMovementType;
    quantityDelta: Prisma.Decimal;
    referenceKind: LedgerReferenceKind;
    performedByUserId: string;
    referenceId?: string;
    correlationId?: string;
    idempotencyKey?: string;
    metadata?: Prisma.InputJsonValue;
};
export declare class LedgerPostingService {
    appendEntry(tx: Prisma.TransactionClient, input: AppendLedgerEntryInput): Promise<StockLedgerEntry>;
}
