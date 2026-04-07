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
Object.defineProperty(exports, "__esModule", { value: true });
exports.StockMovementService = void 0;
const common_1 = require("@nestjs/common");
const client_1 = require("@prisma/client");
const insufficient_stock_exception_1 = require("../../common/exceptions/insufficient-stock.exception");
const stock_movement_jobs_service_1 = require("../../jobs/application/stock-movement-jobs.service");
const ledger_posting_service_1 = require("../../ledger/application/ledger-posting.service");
const prisma_service_1 = require("../../prisma/prisma.service");
let StockMovementService = class StockMovementService {
    constructor(prisma, ledgerPosting, stockJobs) {
        this.prisma = prisma;
        this.ledgerPosting = ledgerPosting;
        this.stockJobs = stockJobs;
    }
    async addStock(params) {
        const qty = new client_1.Prisma.Decimal(params.quantity);
        const result = await this.applyStockChange({
            ...params,
            movementType: client_1.StockMovementType.INBOUND,
            quantityDelta: qty,
        });
        await this.stockJobs.scheduleAfterMovement({
            movementType: client_1.StockMovementType.INBOUND,
            productId: params.productId,
            locationId: params.locationId,
            quantityOnHand: result.quantityOnHand,
            ledgerEntryId: result.ledgerEntryId,
        });
        return result;
    }
    async removeStock(params) {
        const qty = new client_1.Prisma.Decimal(params.quantity);
        const result = await this.applyStockChange({
            ...params,
            movementType: client_1.StockMovementType.OUTBOUND,
            quantityDelta: qty.negated(),
        });
        await this.stockJobs.scheduleAfterMovement({
            movementType: client_1.StockMovementType.OUTBOUND,
            productId: params.productId,
            locationId: params.locationId,
            quantityOnHand: result.quantityOnHand,
            ledgerEntryId: result.ledgerEntryId,
        });
        return result;
    }
    async applyStockChange(args) {
        return this.prisma.$transaction(async (tx) => {
            const location = await tx.location.findUnique({
                where: { id: args.locationId },
            });
            if (!location) {
                throw new common_1.NotFoundException(`Location "${args.locationId}" not found`);
            }
            const product = await tx.product.findUnique({
                where: { id: args.productId },
            });
            if (!product) {
                throw new common_1.NotFoundException(`Product "${args.productId}" not found`);
            }
            let position = await tx.stockPosition.findUnique({
                where: {
                    productId_locationId: {
                        productId: args.productId,
                        locationId: args.locationId,
                    },
                },
            });
            if (!position) {
                position = await tx.stockPosition.create({
                    data: {
                        productId: args.productId,
                        locationId: args.locationId,
                        quantityOnHand: new client_1.Prisma.Decimal(0),
                        version: 0,
                    },
                });
            }
            const current = new client_1.Prisma.Decimal(position.quantityOnHand);
            const newQty = current.plus(args.quantityDelta);
            if (newQty.lessThan(0)) {
                throw new insufficient_stock_exception_1.InsufficientStockException(args.productId, args.locationId, args.quantityDelta.abs().toString(), current.toString());
            }
            const ledgerEntry = await this.ledgerPosting.appendEntry(tx, {
                productId: args.productId,
                locationId: args.locationId,
                warehouseId: location.warehouseId,
                movementType: args.movementType,
                quantityDelta: args.quantityDelta,
                referenceKind: args.referenceKind ?? client_1.LedgerReferenceKind.MANUAL,
                performedByUserId: args.performedByUserId,
                referenceId: args.referenceId,
                idempotencyKey: args.idempotencyKey,
            });
            const updated = await tx.stockPosition.updateMany({
                where: { id: position.id, version: position.version },
                data: {
                    quantityOnHand: newQty,
                    version: { increment: 1 },
                },
            });
            if (updated.count === 0) {
                throw new common_1.ConflictException('Stock position was modified by another request. Retry the operation.');
            }
            const next = await tx.stockPosition.findUniqueOrThrow({
                where: { id: position.id },
            });
            return {
                stockPositionId: next.id,
                quantityOnHand: next.quantityOnHand.toString(),
                version: next.version,
                ledgerEntryId: ledgerEntry.id,
            };
        });
    }
};
exports.StockMovementService = StockMovementService;
exports.StockMovementService = StockMovementService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService,
        ledger_posting_service_1.LedgerPostingService,
        stock_movement_jobs_service_1.StockMovementJobsService])
], StockMovementService);
//# sourceMappingURL=stock-movement.service.js.map