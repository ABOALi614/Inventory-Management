"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var OutboundInvoiceProcessor_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.OutboundInvoiceProcessor = void 0;
const bullmq_1 = require("@nestjs/bullmq");
const common_1 = require("@nestjs/common");
const client_1 = require("@prisma/client");
const promises_1 = require("fs/promises");
const path = require("path");
const prisma_service_1 = require("../../prisma/prisma.service");
const queues_constants_1 = require("../queues.constants");
let OutboundInvoiceProcessor = OutboundInvoiceProcessor_1 = class OutboundInvoiceProcessor extends bullmq_1.WorkerHost {
    constructor(prisma) {
        super();
        this.prisma = prisma;
        this.logger = new common_1.Logger(OutboundInvoiceProcessor_1.name);
    }
    async process(job) {
        if (job.name !== queues_constants_1.JOB_GENERATE_RECEIPT) {
            return;
        }
        const { ledgerEntryId } = job.data;
        const existing = await this.prisma.invoice.findUnique({
            where: { ledgerEntryId },
        });
        if (existing?.status === client_1.InvoiceStatus.COMPLETED) {
            return;
        }
        if (!existing) {
            await this.prisma.invoice.create({
                data: { ledgerEntryId, status: client_1.InvoiceStatus.PENDING },
            });
        }
        else if (existing.status === client_1.InvoiceStatus.FAILED) {
            await this.prisma.invoice.update({
                where: { ledgerEntryId },
                data: { status: client_1.InvoiceStatus.PENDING, errorMessage: null },
            });
        }
        try {
            const entry = await this.prisma.stockLedgerEntry.findUnique({
                where: { id: ledgerEntryId },
                include: {
                    product: true,
                    location: true,
                    warehouse: true,
                },
            });
            if (!entry) {
                throw new Error(`Ledger entry not found: ${ledgerEntryId}`);
            }
            const receiptText = this.buildDigitalReceipt(entry);
            const dir = path.join(process.cwd(), 'storage', 'receipts');
            await (0, promises_1.mkdir)(dir, { recursive: true });
            const receiptPath = path.join(dir, `${ledgerEntryId}.txt`);
            await (0, promises_1.writeFile)(receiptPath, receiptText, 'utf8');
            await this.prisma.invoice.update({
                where: { ledgerEntryId },
                data: {
                    status: client_1.InvoiceStatus.COMPLETED,
                    receiptPath,
                    receiptText,
                    errorMessage: null,
                },
            });
            this.logger.log(`Digital receipt saved: ${receiptPath}`);
        }
        catch (err) {
            const message = err instanceof Error ? err.message : String(err);
            await this.prisma.invoice.update({
                where: { ledgerEntryId },
                data: {
                    status: client_1.InvoiceStatus.FAILED,
                    errorMessage: message,
                },
            });
            this.logger.error(`Invoice job failed for ${ledgerEntryId}: ${message}`);
            throw err;
        }
    }
    buildDigitalReceipt(entry) {
        const qtyOut = new client_1.Prisma.Decimal(entry.quantityDelta).abs().toString();
        const lines = [
            '====================================',
            '       WMS DIGITAL RECEIPT',
            '====================================',
            `Receipt ID:     ${entry.id}`,
            `Issued (UTC):   ${entry.occurredAt.toISOString()}`,
            `Warehouse:      ${entry.warehouse.code} — ${entry.warehouse.name}`,
            `Location:       ${entry.location.code}${entry.location.name ? ` (${entry.location.name})` : ''}`,
            `Product SKU:    ${entry.product.sku}`,
            `Product Name:   ${entry.product.name}`,
            `Qty (outbound): ${qtyOut}`,
            '------------------------------------',
            'Thank you for using the WMS.',
            '====================================',
        ];
        return lines.join('\n');
    }
};
exports.OutboundInvoiceProcessor = OutboundInvoiceProcessor;
exports.OutboundInvoiceProcessor = OutboundInvoiceProcessor = OutboundInvoiceProcessor_1 = __decorate([
    (0, bullmq_1.Processor)(queues_constants_1.QUEUE_OUTBOUND_INVOICE),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], OutboundInvoiceProcessor);
//# sourceMappingURL=outbound-invoice.processor.js.map