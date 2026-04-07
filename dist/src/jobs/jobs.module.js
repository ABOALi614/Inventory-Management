"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.JobsModule = void 0;
const bullmq_1 = require("@nestjs/bullmq");
const common_1 = require("@nestjs/common");
const prisma_module_1 = require("../prisma/prisma.module");
const stock_movement_jobs_service_1 = require("./application/stock-movement-jobs.service");
const low_stock_processor_1 = require("./processors/low-stock.processor");
const outbound_invoice_processor_1 = require("./processors/outbound-invoice.processor");
const queues_constants_1 = require("./queues.constants");
let JobsModule = class JobsModule {
};
exports.JobsModule = JobsModule;
exports.JobsModule = JobsModule = __decorate([
    (0, common_1.Module)({
        imports: [
            prisma_module_1.PrismaModule,
            bullmq_1.BullModule.forRoot({
                connection: {
                    host: process.env.REDIS_HOST ?? '127.0.0.1',
                    port: parseInt(process.env.REDIS_PORT ?? '6379', 10),
                },
            }),
            bullmq_1.BullModule.registerQueue({ name: queues_constants_1.QUEUE_LOW_STOCK }),
            bullmq_1.BullModule.registerQueue({ name: queues_constants_1.QUEUE_OUTBOUND_INVOICE }),
        ],
        providers: [
            stock_movement_jobs_service_1.StockMovementJobsService,
            low_stock_processor_1.LowStockProcessor,
            outbound_invoice_processor_1.OutboundInvoiceProcessor,
        ],
        exports: [bullmq_1.BullModule, stock_movement_jobs_service_1.StockMovementJobsService],
    })
], JobsModule);
//# sourceMappingURL=jobs.module.js.map