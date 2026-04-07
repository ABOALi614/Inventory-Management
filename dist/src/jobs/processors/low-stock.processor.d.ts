import { WorkerHost } from '@nestjs/bullmq';
import { Job } from 'bullmq';
import { PrismaService } from '../../prisma/prisma.service';
export type LowStockJobData = {
    productId: string;
    locationId: string;
    quantityOnHand: string;
    threshold: string;
};
export declare class LowStockProcessor extends WorkerHost {
    private readonly prisma;
    private readonly logger;
    constructor(prisma: PrismaService);
    process(job: Job<LowStockJobData, unknown, string>): Promise<void>;
}
