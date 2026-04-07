import { Processor, WorkerHost } from '@nestjs/bullmq';
import { Logger } from '@nestjs/common';
import { InvoiceStatus, Prisma } from '@prisma/client';
import { Job } from 'bullmq';
import { mkdir, writeFile } from 'fs/promises';
import * as path from 'path';
import { PrismaService } from '../../prisma/prisma.service';
import {
  JOB_GENERATE_RECEIPT,
  QUEUE_OUTBOUND_INVOICE,
} from '../queues.constants';

export type OutboundInvoiceJobData = {
  ledgerEntryId: string;
};

@Processor(QUEUE_OUTBOUND_INVOICE)
export class OutboundInvoiceProcessor extends WorkerHost {
  private readonly logger = new Logger(OutboundInvoiceProcessor.name);

  constructor(private readonly prisma: PrismaService) {
    super();
  }

  async process(
    job: Job<OutboundInvoiceJobData, unknown, string>,
  ): Promise<void> {
    if (job.name !== JOB_GENERATE_RECEIPT) {
      return;
    }
    const { ledgerEntryId } = job.data;

    const existing = await this.prisma.invoice.findUnique({
      where: { ledgerEntryId },
    });
    if (existing?.status === InvoiceStatus.COMPLETED) {
      return;
    }

    if (!existing) {
      await this.prisma.invoice.create({
        data: { ledgerEntryId, status: InvoiceStatus.PENDING },
      });
    } else if (existing.status === InvoiceStatus.FAILED) {
      await this.prisma.invoice.update({
        where: { ledgerEntryId },
        data: { status: InvoiceStatus.PENDING, errorMessage: null },
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
      await mkdir(dir, { recursive: true });
      const receiptPath = path.join(dir, `${ledgerEntryId}.txt`);
      await writeFile(receiptPath, receiptText, 'utf8');

      await this.prisma.invoice.update({
        where: { ledgerEntryId },
        data: {
          status: InvoiceStatus.COMPLETED,
          receiptPath,
          receiptText,
          errorMessage: null,
        },
      });
      this.logger.log(`Digital receipt saved: ${receiptPath}`);
    } catch (err) {
      const message = err instanceof Error ? err.message : String(err);
      await this.prisma.invoice.update({
        where: { ledgerEntryId },
        data: {
          status: InvoiceStatus.FAILED,
          errorMessage: message,
        },
      });
      this.logger.error(`Invoice job failed for ${ledgerEntryId}: ${message}`);
      throw err;
    }
  }

  private buildDigitalReceipt(entry: {
    id: string;
    occurredAt: Date;
    quantityDelta: Prisma.Decimal;
    product: { sku: string; name: string };
    location: { code: string; name: string | null };
    warehouse: { code: string; name: string };
  }): string {
    const qtyOut = new Prisma.Decimal(entry.quantityDelta).abs().toString();
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
}
