-- AlterTable
ALTER TABLE "invoice_items" ADD COLUMN     "purchase_cost_snapshot" DECIMAL(12,2) NOT NULL DEFAULT 0;
