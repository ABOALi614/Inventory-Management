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
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.StockMovementJobsService = void 0;
const bullmq_1 = require("@nestjs/bullmq");
const common_1 = require("@nestjs/common");
const client_1 = require("@prisma/client");
const bullmq_2 = require("bullmq");
const queues_constants_1 = require("../queues.constants");
let StockMovementJobsService = class StockMovementJobsService {
    constructor(lowStockQueue, invoiceQueue) {
        this.lowStockQueue = lowStockQueue;
        this.invoiceQueue = invoiceQueue;
    }
    async scheduleAfterMovement(payload) {
        const onHand = new client_1.Prisma.Decimal(payload.quantityOnHand);
        const threshold = new client_1.Prisma.Decimal(queues_constants_1.LOW_STOCK_THRESHOLD);
        if (onHand.lessThan(threshold)) {
            await this.lowStockQueue.add(queues_constants_1.JOB_LOW_STOCK_NOTIFY, {
                productId: payload.productId,
                locationId: payload.locationId,
                quantityOnHand: payload.quantityOnHand,
                threshold: threshold.toString(),
            }, { removeOnComplete: 1000, removeOnFail: 5000 });
        }
        if (payload.movementType === client_1.StockMovementType.OUTBOUND) {
            await this.invoiceQueue.add(queues_constants_1.JOB_GENERATE_RECEIPT, { ledgerEntryId: payload.ledgerEntryId }, { removeOnComplete: 1000, removeOnFail: 5000 });
        }
    }
};
exports.StockMovementJobsService = StockMovementJobsService;
exports.StockMovementJobsService = StockMovementJobsService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, bullmq_1.InjectQueue)(queues_constants_1.QUEUE_LOW_STOCK)),
    __param(1, (0, bullmq_1.InjectQueue)(queues_constants_1.QUEUE_OUTBOUND_INVOICE)),
    __metadata("design:paramtypes", [bullmq_2.Queue,
        bullmq_2.Queue])
], StockMovementJobsService);
//# sourceMappingURL=stock-movement-jobs.service.js.map