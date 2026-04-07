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
var LowStockProcessor_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.LowStockProcessor = void 0;
const bullmq_1 = require("@nestjs/bullmq");
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../../prisma/prisma.service");
const queues_constants_1 = require("../queues.constants");
let LowStockProcessor = LowStockProcessor_1 = class LowStockProcessor extends bullmq_1.WorkerHost {
    constructor(prisma) {
        super();
        this.prisma = prisma;
        this.logger = new common_1.Logger(LowStockProcessor_1.name);
    }
    async process(job) {
        if (job.name !== queues_constants_1.JOB_LOW_STOCK_NOTIFY) {
            return;
        }
        const { productId, locationId, quantityOnHand, threshold } = job.data;
        const product = await this.prisma.product.findUnique({
            where: { id: productId },
            select: { sku: true, name: true },
        });
        const sku = product?.sku ?? productId;
        const name = product?.name ?? '(unknown)';
        this.logger.warn(`[LOW STOCK EMAIL → MANAGER] "${name}" (${sku}) at location ${locationId}: ` +
            `quantityOnHand=${quantityOnHand} (threshold=${threshold}). ` +
            `Simulated email: notify warehouse manager to reorder or transfer stock.`);
    }
};
exports.LowStockProcessor = LowStockProcessor;
exports.LowStockProcessor = LowStockProcessor = LowStockProcessor_1 = __decorate([
    (0, bullmq_1.Processor)(queues_constants_1.QUEUE_LOW_STOCK),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], LowStockProcessor);
//# sourceMappingURL=low-stock.processor.js.map