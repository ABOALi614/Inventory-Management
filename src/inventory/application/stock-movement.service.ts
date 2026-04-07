import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { LedgerReferenceKind, Prisma, StockMovementType } from '@prisma/client';
import { InsufficientStockException } from '../../common/exceptions/insufficient-stock.exception';
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

@Injectable()
export class StockMovementService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly ledgerPosting: LedgerPostingService,
    private readonly stockJobs: StockMovementJobsService,
  ) {}

  async addStock(params: StockMovementBase) {
    const qty = new Prisma.Decimal(params.quantity);
    const result = await this.applyStockChange({
      ...params,
      movementType: StockMovementType.INBOUND,
      quantityDelta: qty,
    });
    await this.stockJobs.scheduleAfterMovement({
      movementType: StockMovementType.INBOUND,
      productId: params.productId,
      locationId: params.locationId,
      quantityOnHand: result.quantityOnHand,
      ledgerEntryId: result.ledgerEntryId,
    });
    return result;
  }

  async removeStock(params: StockMovementBase) {
    const qty = new Prisma.Decimal(params.quantity);
    const result = await this.applyStockChange({
      ...params,
      movementType: StockMovementType.OUTBOUND,
      quantityDelta: qty.negated(),
    });
    await this.stockJobs.scheduleAfterMovement({
      movementType: StockMovementType.OUTBOUND,
      productId: params.productId,
      locationId: params.locationId,
      quantityOnHand: result.quantityOnHand,
      ledgerEntryId: result.ledgerEntryId,
    });
    return result;
  }

  private async applyStockChange(args: {
    productId: string;
    locationId: string;
    movementType: StockMovementType;
    quantityDelta: Prisma.Decimal;
    performedByUserId: string;
    referenceKind?: LedgerReferenceKind;
    referenceId?: string;
    idempotencyKey?: string;
  }) {
    return this.prisma.$transaction(async (tx) => {
      const location = await tx.location.findUnique({
        where: { id: args.locationId },
      });
      if (!location) {
        throw new NotFoundException(`Location "${args.locationId}" not found`);
      }

      const product = await tx.product.findUnique({
        where: { id: args.productId },
      });
      if (!product) {
        throw new NotFoundException(`Product "${args.productId}" not found`);
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
            quantityOnHand: new Prisma.Decimal(0),
            version: 0,
          },
        });
      }

      const current = new Prisma.Decimal(position.quantityOnHand);
      const newQty = current.plus(args.quantityDelta);

      if (newQty.lessThan(0)) {
        throw new InsufficientStockException(
          args.productId,
          args.locationId,
          args.quantityDelta.abs().toString(),
          current.toString(),
        );
      }

      const ledgerEntry = await this.ledgerPosting.appendEntry(tx, {
        productId: args.productId,
        locationId: args.locationId,
        warehouseId: location.warehouseId,
        movementType: args.movementType,
        quantityDelta: args.quantityDelta,
        referenceKind: args.referenceKind ?? LedgerReferenceKind.MANUAL,
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
        throw new ConflictException(
          'Stock position was modified by another request. Retry the operation.',
        );
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
}
