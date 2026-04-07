import { LedgerReferenceKind } from '@prisma/client';
export declare class AddStockDto {
    productId: string;
    locationId: string;
    quantity: number;
    referenceKind?: LedgerReferenceKind;
    referenceId?: string;
    idempotencyKey?: string;
}
export declare class RemoveStockDto {
    productId: string;
    locationId: string;
    quantity: number;
    referenceKind?: LedgerReferenceKind;
    referenceId?: string;
    idempotencyKey?: string;
}
export declare class StockMovementResultDto {
    stockPositionId: string;
    quantityOnHand: string;
    version: number;
    ledgerEntryId: string;
}
