import { StockMovementType } from '@prisma/client';
import { Queue } from 'bullmq';
export type AfterMovementJobPayload = {
    movementType: StockMovementType;
    productId: string;
    locationId: string;
    quantityOnHand: string;
    ledgerEntryId: string;
};
export declare class StockMovementJobsService {
    private readonly lowStockQueue;
    private readonly invoiceQueue;
    constructor(lowStockQueue: Queue, invoiceQueue: Queue);
    scheduleAfterMovement(payload: AfterMovementJobPayload): Promise<void>;
}
