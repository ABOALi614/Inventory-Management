-- CreateEnum
CREATE TYPE "InvoiceStatus" AS ENUM ('PENDING', 'COMPLETED', 'FAILED');

-- CreateTable
CREATE TABLE "Invoice" (
    "id" TEXT NOT NULL,
    "ledger_entry_id" TEXT NOT NULL,
    "status" "InvoiceStatus" NOT NULL DEFAULT 'PENDING',
    "receipt_path" TEXT,
    "receipt_text" TEXT,
    "error_message" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Invoice_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Invoice_ledger_entry_id_key" ON "Invoice"("ledger_entry_id");

-- CreateIndex
CREATE INDEX "Invoice_status_idx" ON "Invoice"("status");

-- AddForeignKey
ALTER TABLE "Invoice" ADD CONSTRAINT "Invoice_ledger_entry_id_fkey" FOREIGN KEY ("ledger_entry_id") REFERENCES "StockLedgerEntry"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
