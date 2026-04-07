import { ConflictException, NotFoundException } from '@nestjs/common';
import { LedgerReferenceKind, Prisma, StockMovementType } from '@prisma/client';
import { InsufficientStockException } from '../../common/exceptions/insufficient-stock.exception';
import { StockMovementJobsService } from '../../jobs/application/stock-movement-jobs.service';
import { LedgerPostingService } from '../../ledger/application/ledger-posting.service';
import { PrismaService } from '../../prisma/prisma.service';
import { StockMovementService } from './stock-movement.service';

type MockTx = {
  location: { findUnique: jest.Mock };
  product: { findUnique: jest.Mock };
  stockPosition: {
    findUnique: jest.Mock;
    create: jest.Mock;
    updateMany: jest.Mock;
    findUniqueOrThrow: jest.Mock;
  };
};

describe('StockMovementService', () => {
  let service: StockMovementService;
  let prisma: { $transaction: jest.Mock };
  let ledgerPosting: { appendEntry: jest.Mock };
  let stockJobs: { scheduleAfterMovement: jest.Mock };

  const mockTx: MockTx = {
    location: { findUnique: jest.fn() },
    product: { findUnique: jest.fn() },
    stockPosition: {
      findUnique: jest.fn(),
      create: jest.fn(),
      updateMany: jest.fn(),
      findUniqueOrThrow: jest.fn(),
    },
  };

  const baseParams = {
    productId: 'product-1',
    locationId: 'location-1',
    performedByUserId: 'user-1',
  };

  beforeEach(() => {
    jest.clearAllMocks();
    prisma = {
      $transaction: jest.fn((fn: (tx: MockTx) => Promise<unknown>) =>
        fn(mockTx),
      ),
    };
    ledgerPosting = { appendEntry: jest.fn() };
    stockJobs = { scheduleAfterMovement: jest.fn().mockResolvedValue(undefined) };

    service = new StockMovementService(
      prisma as unknown as PrismaService,
      ledgerPosting as unknown as LedgerPostingService,
      stockJobs as unknown as StockMovementJobsService,
    );
  });

  function arrangeHappyPathWarehouseAndProduct() {
    mockTx.location.findUnique.mockResolvedValue({ warehouseId: 'wh-1' });
    mockTx.product.findUnique.mockResolvedValue({ id: baseParams.productId });
  }

  it('addStock applies inbound delta, returns state, and schedules post-commit jobs', async () => {
    arrangeHappyPathWarehouseAndProduct();
    mockTx.stockPosition.findUnique.mockResolvedValue(null);
    mockTx.stockPosition.create.mockResolvedValue({
      id: 'pos-1',
      productId: baseParams.productId,
      locationId: baseParams.locationId,
      quantityOnHand: new Prisma.Decimal(0),
      version: 0,
    });
    ledgerPosting.appendEntry.mockResolvedValue({ id: 'ledger-1' });
    mockTx.stockPosition.updateMany.mockResolvedValue({ count: 1 });
    mockTx.stockPosition.findUniqueOrThrow.mockResolvedValue({
      id: 'pos-1',
      quantityOnHand: new Prisma.Decimal(25),
      version: 1,
    });

    const result = await service.addStock({ ...baseParams, quantity: 25 });

    expect(result).toEqual({
      stockPositionId: 'pos-1',
      quantityOnHand: '25',
      version: 1,
      ledgerEntryId: 'ledger-1',
    });
    expect(ledgerPosting.appendEntry).toHaveBeenCalledWith(
      expect.anything(),
      expect.objectContaining({
        movementType: StockMovementType.INBOUND,
        performedByUserId: baseParams.performedByUserId,
        productId: baseParams.productId,
      }),
    );
    expect(stockJobs.scheduleAfterMovement).toHaveBeenCalledWith({
      movementType: StockMovementType.INBOUND,
      productId: baseParams.productId,
      locationId: baseParams.locationId,
      quantityOnHand: '25',
      ledgerEntryId: 'ledger-1',
    });
  });

  it('removeStock applies outbound delta and schedules jobs', async () => {
    arrangeHappyPathWarehouseAndProduct();
    mockTx.stockPosition.findUnique.mockResolvedValue({
      id: 'pos-1',
      productId: baseParams.productId,
      locationId: baseParams.locationId,
      quantityOnHand: new Prisma.Decimal(30),
      version: 2,
    });
    ledgerPosting.appendEntry.mockResolvedValue({ id: 'ledger-out-1' });
    mockTx.stockPosition.updateMany.mockResolvedValue({ count: 1 });
    mockTx.stockPosition.findUniqueOrThrow.mockResolvedValue({
      id: 'pos-1',
      quantityOnHand: new Prisma.Decimal(22),
      version: 3,
    });

    const result = await service.removeStock({ ...baseParams, quantity: 8 });

    expect(result.quantityOnHand).toBe('22');
    expect(result.ledgerEntryId).toBe('ledger-out-1');
    expect(ledgerPosting.appendEntry).toHaveBeenCalledWith(
      expect.anything(),
      expect.objectContaining({
        movementType: StockMovementType.OUTBOUND,
        quantityDelta: new Prisma.Decimal(-8),
      }),
    );
    expect(stockJobs.scheduleAfterMovement).toHaveBeenCalledWith({
      movementType: StockMovementType.OUTBOUND,
      productId: baseParams.productId,
      locationId: baseParams.locationId,
      quantityOnHand: '22',
      ledgerEntryId: 'ledger-out-1',
    });
  });

  it('throws InsufficientStockException when remove exceeds on-hand', async () => {
    arrangeHappyPathWarehouseAndProduct();
    mockTx.stockPosition.findUnique.mockResolvedValue({
      id: 'pos-1',
      productId: baseParams.productId,
      locationId: baseParams.locationId,
      quantityOnHand: new Prisma.Decimal(4),
      version: 0,
    });

    await expect(
      service.removeStock({ ...baseParams, quantity: 10 }),
    ).rejects.toBeInstanceOf(InsufficientStockException);

    expect(ledgerPosting.appendEntry).not.toHaveBeenCalled();
    expect(stockJobs.scheduleAfterMovement).not.toHaveBeenCalled();
  });

  it('throws ConflictException when optimistic version does not match', async () => {
    arrangeHappyPathWarehouseAndProduct();
    mockTx.stockPosition.findUnique.mockResolvedValue({
      id: 'pos-1',
      productId: baseParams.productId,
      locationId: baseParams.locationId,
      quantityOnHand: new Prisma.Decimal(10),
      version: 5,
    });
    ledgerPosting.appendEntry.mockResolvedValue({ id: 'ledger-race' });
    mockTx.stockPosition.updateMany.mockResolvedValue({ count: 0 });

    await expect(
      service.addStock({
        ...baseParams,
        quantity: 1,
        referenceKind: LedgerReferenceKind.MANUAL,
      }),
    ).rejects.toBeInstanceOf(ConflictException);

    expect(ledgerPosting.appendEntry).toHaveBeenCalled();
    expect(stockJobs.scheduleAfterMovement).not.toHaveBeenCalled();
  });

  it('throws NotFoundException when location is missing', async () => {
    mockTx.location.findUnique.mockResolvedValue(null);

    await expect(
      service.addStock({ ...baseParams, quantity: 1 }),
    ).rejects.toBeInstanceOf(NotFoundException);

    expect(stockJobs.scheduleAfterMovement).not.toHaveBeenCalled();
  });
});
