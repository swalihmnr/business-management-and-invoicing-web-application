import { Decimal } from '@prisma/client/runtime/library';

/**
 * Invoice Calculation Module — AUTHORITATIVE BACKEND MATH
 *
 * All monetary calculations happen here. The frontend may show
 * a preview but these numbers are what get persisted to the DB.
 *
 * Tax model: Flat % per line item (e.g., 18% GST)
 * Rounding: Round to 2 decimal places at the very end of each operation.
 *           Never round intermediate values — this accumulates rounding errors.
 */

export interface LineItemInput {
  unitPrice: number;      // Selling price at time of sale
  quantity: number;
  taxRate: number;        // Percentage e.g. 18 (not 0.18)
  discountType?: 'FLAT' | 'PERCENTAGE' | null;
  discountValue?: number;
}

export interface LineItemResult {
  unitPrice: number;
  quantity: number;
  taxRate: number;
  discountType: 'FLAT' | 'PERCENTAGE' | null;
  discountValue: number;
  discountAmount: number;  // Calculated discount in currency
  taxAmount: number;       // Calculated tax in currency
  lineTotal: number;       // (unitPrice * qty - discountAmount) + taxAmount
}

export interface InvoiceInput {
  items: LineItemInput[];
  discountType?: 'FLAT' | 'PERCENTAGE' | null;
  discountValue?: number;
}

export interface InvoiceTotals {
  subtotal: number;        // Sum of (unitPrice * qty) before any discounts
  lineDiscountAmount: number; // Sum of all line-level discounts
  discountAmount: number;  // Invoice-level discount applied after subtotal
  taxAmount: number;       // Sum of all line taxes
  totalAmount: number;     // FINAL AUTHORITATIVE TOTAL
}

/**
 * Calculate a single line item's amounts.
 * Discount is applied to the line (pre-tax base), then tax is calculated on the net.
 */
export function calculateLineItem(item: LineItemInput): LineItemResult {
  const { unitPrice, quantity, taxRate, discountType, discountValue = 0 } = item;

  const grossLineAmount = unitPrice * quantity;

  // 1. Calculate line-level discount
  let discountAmount = 0;
  if (discountType === 'FLAT') {
    discountAmount = Math.min(discountValue, grossLineAmount); // Can't discount more than the price
  } else if (discountType === 'PERCENTAGE') {
    discountAmount = (grossLineAmount * discountValue) / 100;
  }

  // 2. Net amount after discount (tax base)
  const netAmount = grossLineAmount - discountAmount;

  // 3. Calculate tax on net amount
  const taxAmount = (netAmount * taxRate) / 100;

  // 4. Line total = net + tax
  const lineTotal = netAmount + taxAmount;

  return {
    unitPrice,
    quantity,
    taxRate,
    discountType: discountType ?? null,
    discountValue,
    discountAmount: round(discountAmount),
    taxAmount: round(taxAmount),
    lineTotal: round(lineTotal),
  };
}

/**
 * Calculate all invoice-level totals from line items.
 */
export function calculateInvoiceTotals(
  calculatedItems: LineItemResult[],
  invoiceDiscountType?: 'FLAT' | 'PERCENTAGE' | null,
  invoiceDiscountValue = 0,
): InvoiceTotals {
  // Subtotal = sum of gross line amounts (before line discounts)
  const subtotal = calculatedItems.reduce(
    (sum, item) => sum + item.unitPrice * item.quantity,
    0,
  );

  const lineDiscountAmount = calculatedItems.reduce(
    (sum, item) => sum + item.discountAmount,
    0,
  );

  const taxAmount = calculatedItems.reduce((sum, item) => sum + item.taxAmount, 0);

  // Invoice-level discount is applied on (subtotal - line discounts)
  const netBeforeInvoiceDiscount = subtotal - lineDiscountAmount;

  let invoiceDiscountAmount = 0;
  if (invoiceDiscountType === 'FLAT') {
    invoiceDiscountAmount = Math.min(invoiceDiscountValue, netBeforeInvoiceDiscount);
  } else if (invoiceDiscountType === 'PERCENTAGE') {
    invoiceDiscountAmount = (netBeforeInvoiceDiscount * invoiceDiscountValue) / 100;
  }

  // Total = (subtotal - lineDiscounts - invoiceDiscount) + taxes
  const totalAmount = netBeforeInvoiceDiscount - invoiceDiscountAmount + taxAmount;

  return {
    subtotal: round(subtotal),
    lineDiscountAmount: round(lineDiscountAmount),
    discountAmount: round(invoiceDiscountAmount),
    taxAmount: round(taxAmount),
    totalAmount: round(totalAmount),
  };
}

/**
 * Convert Prisma Decimal to JavaScript number for calculations.
 * Always convert back to Decimal when storing to DB.
 */
export function toNumber(value: Decimal | number): number {
  return typeof value === 'number' ? value : value.toNumber();
}

/**
 * Round to 2 decimal places (monetary rounding).
 * Uses "round half away from zero" (standard accounting rounding).
 */
function round(value: number): number {
  return Math.round((value + Number.EPSILON) * 100) / 100;
}
