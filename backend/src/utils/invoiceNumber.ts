import prisma from '../config/database';

/**
 * Invoice Number Generator
 *
 * Format: {PREFIX}-{ZERO_PADDED_COUNTER}
 * Example: INV-0001, INV-0042, SHOP-0001
 *
 * The counter is stored on the Business record and incremented atomically
 * inside a transaction to prevent duplicate invoice numbers under concurrent requests.
 *
 * Why atomic increment?
 * If two invoices are created simultaneously and both read the same counter value,
 * they would get the same invoice number — a critical data integrity bug.
 * Using $executeRaw with a SELECT ... FOR UPDATE or Prisma's atomic increment
 * ensures only one request gets each number.
 */
export async function generateInvoiceNumber(
  businessId: string,
  tx?: Parameters<Parameters<typeof prisma.$transaction>[0]>[0],
): Promise<string> {
  const client = tx ?? prisma;

  // Atomic increment: read counter + increment in one DB operation
  const updated = await (client as typeof prisma).business.update({
    where: { id: businessId },
    data: { invoiceCounter: { increment: 1 } },
    select: { invoiceCounter: true, invoicePrefix: true },
  });

  const paddedCounter = String(updated.invoiceCounter).padStart(4, '0');
  return `${updated.invoicePrefix}-${paddedCounter}`;
}
