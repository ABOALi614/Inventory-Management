import { WorkerHost } from '@nestjs/bullmq';
import { Job } from 'bullmq';
import { PrismaService } from '../../prisma/prisma.service';
export type OutboundInvoiceJobData = {
    ledgerEntryId: string;
};
export declare class OutboundInvoiceProcessor extends WorkerHost {
    private readonly prisma;
    private readonly logger;
    constructor(prisma: PrismaService);
    process(job: Job<OutboundInvoiceJobData, unknown, string>): Promise<void>;
    private buildDigitalReceipt;
}
