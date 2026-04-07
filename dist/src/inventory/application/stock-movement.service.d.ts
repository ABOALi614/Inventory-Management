import { LedgerReferenceKind } from '@prisma/client';
import { StockMovementJobsService } from '../../jobs/application/stock-movement-jobs.service';
import { LedgerPostingService } from '../../ledger/application/ledger-posting.service';
import { PrismaService } from '../../prisma/prisma.service';
type StockMovementBase = {
    productId: string;
    locationId: string;
    quantity: number;
    performedByUserId: string;
    referenceKind?: LedgerReferenceKind;
    referenceId?: string;
    idempotencyKey?: string;
};
export declare class StockMovementService {
    private readonly prisma;
    private readonly ledgerPosting;
    private readonly stockJobs;
    constructor(prisma: PrismaService, ledgerPosting: LedgerPostingService, stockJobs: StockMovementJobsService);
    addStock(params: StockMovementBase): Promise<{
        stockPositionId: string;
        quantityOnHand: string;
        version: number;
        ledgerEntryId: string;
    }>;
    removeStock(params: StockMovementBase): Promise<{
        stockPositionId: string;
        quantityOnHand: string;
        version: number;
        ledgerEntryId: string;
    }>;
    private applyStockChange;
}
export {};
