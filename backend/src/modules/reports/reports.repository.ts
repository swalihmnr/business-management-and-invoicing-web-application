import prisma from '../../config/database';

/**
 * Reports Repository
 *
 * ALL queries use parameterized $queryRaw tagged templates — never string
 * interpolation. Every query enforces business_id isolation.
 *
 * Pattern for every method:
 *   - Accept businessId + date range as parameters
 *   - Push all aggregation work to PostgreSQL
 *   - Return plain JS objects (Prisma converts Decimal → string in raw results)
 */

export interface DateRange {
  start: Date;
  end: Date;
}

/* ─────────────────────────────────────────────────────────────
   SALES REPORT
───────────────────────────────────────────────────────────── */
export async function getSalesSummary(businessId: string, range: DateRange) {
  const rows = await prisma.$queryRaw<any[]>`
    SELECT
      COUNT(*)::int                         AS invoice_count,
      COALESCE(SUM(total_amount), 0)::float AS total_sales,
      COALESCE(AVG(total_amount), 0)::float AS avg_invoice_value,
      COALESCE(SUM(discount_amount), 0)::float AS total_discount,
      COALESCE(SUM(tax_amount), 0)::float   AS total_tax,
      COALESCE(SUM(amount_paid), 0)::float  AS amount_paid,
      COALESCE(SUM(amount_due), 0)::float   AS outstanding
    FROM invoices
    WHERE business_id = ${businessId}
      AND status NOT IN ('DRAFT', 'CANCELLED')
      AND invoice_date >= ${range.start}
      AND invoice_date <= ${range.end}
  `;

  // Daily trend for line chart
  const trend = await prisma.$queryRaw<any[]>`
    SELECT
      DATE(invoice_date)::text              AS date,
      COUNT(*)::int                         AS invoice_count,
      COALESCE(SUM(total_amount), 0)::float AS revenue
    FROM invoices
    WHERE business_id = ${businessId}
      AND status NOT IN ('DRAFT', 'CANCELLED')
      AND invoice_date >= ${range.start}
      AND invoice_date <= ${range.end}
    GROUP BY DATE(invoice_date)
    ORDER BY DATE(invoice_date) ASC
  `;

  return { summary: rows[0] ?? {}, trend };
}

/* ─────────────────────────────────────────────────────────────
   PROFIT REPORT
───────────────────────────────────────────────────────────── */
export async function getProfitSummary(businessId: string, range: DateRange) {
  const rows = await prisma.$queryRaw<any[]>`
    SELECT
      COALESCE(SUM(ii.line_total), 0)::float                               AS revenue,
      COALESCE(SUM(ii.purchase_cost_snapshot * ii.quantity), 0)::float     AS cogs,
      COALESCE(
        SUM(ii.line_total) - SUM(ii.purchase_cost_snapshot * ii.quantity),
        0
      )::float                                                             AS gross_profit,
      CASE
        WHEN SUM(ii.line_total) > 0
        THEN ROUND(
          (SUM(ii.line_total) - SUM(ii.purchase_cost_snapshot * ii.quantity))
          / SUM(ii.line_total) * 100, 2
        )
        ELSE 0
      END::float                                                           AS gross_margin_pct,
      COUNT(DISTINCT i.id)::int                                            AS invoice_count,
      -- Flag records where cost is unknown (snapshot = 0)
      SUM(CASE WHEN ii.purchase_cost_snapshot = 0 THEN 1 ELSE 0 END)::int AS unknown_cost_lines
    FROM invoices i
    JOIN invoice_items ii ON ii.invoice_id = i.id
    WHERE i.business_id = ${businessId}
      AND i.status NOT IN ('DRAFT', 'CANCELLED')
      AND i.invoice_date >= ${range.start}
      AND i.invoice_date <= ${range.end}
  `;

  return rows[0] ?? {};
}

/* ─────────────────────────────────────────────────────────────
   PRODUCT REPORT
───────────────────────────────────────────────────────────── */
export async function getProductReport(businessId: string, range: DateRange) {
  const rows = await prisma.$queryRaw<any[]>`
    SELECT
      ii.product_id,
      ii.product_name,
      ii.product_sku,
      COUNT(DISTINCT i.id)::int                                            AS invoice_count,
      SUM(ii.quantity)::int                                                AS qty_sold,
      COALESCE(SUM(ii.line_total), 0)::float                               AS revenue,
      COALESCE(SUM(ii.purchase_cost_snapshot * ii.quantity), 0)::float     AS cogs,
      COALESCE(
        SUM(ii.line_total) - SUM(ii.purchase_cost_snapshot * ii.quantity),
        0
      )::float                                                             AS profit
    FROM invoices i
    JOIN invoice_items ii ON ii.invoice_id = i.id
    WHERE i.business_id = ${businessId}
      AND i.status NOT IN ('DRAFT', 'CANCELLED')
      AND i.invoice_date >= ${range.start}
      AND i.invoice_date <= ${range.end}
    GROUP BY ii.product_id, ii.product_name, ii.product_sku
    ORDER BY revenue DESC
  `;

  return rows;
}

/* ─────────────────────────────────────────────────────────────
   CATEGORY REPORT
───────────────────────────────────────────────────────────── */
export async function getCategoryReport(businessId: string, range: DateRange) {
  const rows = await prisma.$queryRaw<any[]>`
    SELECT
      COALESCE(c.name, 'Uncategorised')        AS category_name,
      SUM(ii.quantity)::int                    AS qty_sold,
      COALESCE(SUM(ii.line_total), 0)::float   AS revenue,
      COALESCE(SUM(ii.purchase_cost_snapshot * ii.quantity), 0)::float AS cogs,
      COALESCE(
        SUM(ii.line_total) - SUM(ii.purchase_cost_snapshot * ii.quantity),
        0
      )::float                                 AS profit
    FROM invoices i
    JOIN invoice_items ii ON ii.invoice_id = i.id
    LEFT JOIN products p  ON p.id = ii.product_id
    LEFT JOIN categories c ON c.id = p.category_id
    WHERE i.business_id = ${businessId}
      AND i.status NOT IN ('DRAFT', 'CANCELLED')
      AND i.invoice_date >= ${range.start}
      AND i.invoice_date <= ${range.end}
    GROUP BY COALESCE(c.name, 'Uncategorised')
    ORDER BY revenue DESC
  `;

  // Compute % of total revenue
  const totalRevenue = rows.reduce((sum: number, r: any) => sum + Number(r.revenue), 0);
  return rows.map((r: any) => ({
    ...r,
    pct_of_total: totalRevenue > 0 ? +((Number(r.revenue) / totalRevenue) * 100).toFixed(2) : 0,
  }));
}

/* ─────────────────────────────────────────────────────────────
   CUSTOMER REPORT
───────────────────────────────────────────────────────────── */
export async function getCustomerReport(businessId: string, range: DateRange) {
  const rows = await prisma.$queryRaw<any[]>`
    SELECT
      c.id                                           AS customer_id,
      c.name                                         AS customer_name,
      c.phone,
      c.email,
      COUNT(i.id)::int                               AS invoice_count,
      COALESCE(SUM(i.total_amount), 0)::float        AS total_purchases,
      COALESCE(SUM(i.amount_paid), 0)::float         AS amount_paid,
      COALESCE(SUM(i.amount_due), 0)::float          AS outstanding,
      COALESCE(AVG(i.total_amount), 0)::float        AS avg_invoice_value
    FROM customers c
    JOIN invoices i ON i.customer_id = c.id
    WHERE i.business_id = ${businessId}
      AND i.status NOT IN ('DRAFT', 'CANCELLED')
      AND i.invoice_date >= ${range.start}
      AND i.invoice_date <= ${range.end}
    GROUP BY c.id, c.name, c.phone, c.email
    ORDER BY total_purchases DESC
  `;

  return rows;
}

/* ─────────────────────────────────────────────────────────────
   RECEIVABLES / AR AGING REPORT
───────────────────────────────────────────────────────────── */
export async function getReceivablesReport(
  businessId: string,
  skip: number,
  take: number,
) {
  // No date filter — shows ALL open invoices regardless of date
  const rows = await prisma.$queryRaw<any[]>`
    SELECT
      i.id,
      i.invoice_number,
      i.invoice_date::text,
      i.due_date::text,
      i.status,
      c.name                                                   AS customer_name,
      COALESCE(i.total_amount, 0)::float                       AS total_amount,
      COALESCE(i.amount_paid, 0)::float                        AS amount_paid,
      COALESCE(i.amount_due, 0)::float                         AS amount_due,
      EXTRACT(DAY FROM NOW() - i.invoice_date)::int            AS age_days,
      CASE
        WHEN EXTRACT(DAY FROM NOW() - i.invoice_date) <= 30  THEN '0-30'
        WHEN EXTRACT(DAY FROM NOW() - i.invoice_date) <= 60  THEN '31-60'
        WHEN EXTRACT(DAY FROM NOW() - i.invoice_date) <= 90  THEN '61-90'
        ELSE '90+'
      END                                                      AS aging_bucket
    FROM invoices i
    JOIN customers c ON c.id = i.customer_id
    WHERE i.business_id = ${businessId}
      AND i.amount_due > 0
      AND i.status NOT IN ('PAID', 'CANCELLED', 'DRAFT')
    ORDER BY i.invoice_date ASC
    LIMIT ${take} OFFSET ${skip}
  `;

  const countResult = await prisma.$queryRaw<any[]>`
    SELECT COUNT(*)::int AS total
    FROM invoices i
    WHERE i.business_id = ${businessId}
      AND i.amount_due > 0
      AND i.status NOT IN ('PAID', 'CANCELLED', 'DRAFT')
  `;

  // Aging bucket summary
  const buckets = await prisma.$queryRaw<any[]>`
    SELECT
      CASE
        WHEN EXTRACT(DAY FROM NOW() - i.invoice_date) <= 30  THEN '0-30'
        WHEN EXTRACT(DAY FROM NOW() - i.invoice_date) <= 60  THEN '31-60'
        WHEN EXTRACT(DAY FROM NOW() - i.invoice_date) <= 90  THEN '61-90'
        ELSE '90+'
      END                                        AS bucket,
      COUNT(*)::int                              AS invoice_count,
      COALESCE(SUM(i.amount_due), 0)::float      AS total_due
    FROM invoices i
    WHERE i.business_id = ${businessId}
      AND i.amount_due > 0
      AND i.status NOT IN ('PAID', 'CANCELLED', 'DRAFT')
    GROUP BY bucket
    ORDER BY bucket ASC
  `;

  return { rows, total: countResult[0]?.total ?? 0, buckets };
}

/* ─────────────────────────────────────────────────────────────
   PAYMENT REPORT
───────────────────────────────────────────────────────────── */
export async function getPaymentReport(businessId: string, range: DateRange) {
  // Payment method breakdown
  const byMethod = await prisma.$queryRaw<any[]>`
    SELECT
      payment_method,
      COUNT(*)::int                            AS payment_count,
      COALESCE(SUM(amount), 0)::float          AS total_amount
    FROM payments
    WHERE business_id = ${businessId}
      AND payment_date >= ${range.start}
      AND payment_date <= ${range.end}
    GROUP BY payment_method
    ORDER BY total_amount DESC
  `;

  // Invoice status summary
  const statusSummary = await prisma.$queryRaw<any[]>`
    SELECT
      status,
      COUNT(*)::int AS count
    FROM invoices
    WHERE business_id = ${businessId}
      AND invoice_date >= ${range.start}
      AND invoice_date <= ${range.end}
      AND status NOT IN ('DRAFT', 'CANCELLED')
    GROUP BY status
  `;

  // Daily trend
  const trend = await prisma.$queryRaw<any[]>`
    SELECT
      DATE(payment_date)::text               AS date,
      COUNT(*)::int                          AS payment_count,
      COALESCE(SUM(amount), 0)::float        AS total_amount
    FROM payments
    WHERE business_id = ${businessId}
      AND payment_date >= ${range.start}
      AND payment_date <= ${range.end}
    GROUP BY DATE(payment_date)
    ORDER BY DATE(payment_date) ASC
  `;

  const totals = await prisma.$queryRaw<any[]>`
    SELECT
      COUNT(*)::int                           AS total_payments,
      COALESCE(SUM(amount), 0)::float         AS total_collected
    FROM payments
    WHERE business_id = ${businessId}
      AND payment_date >= ${range.start}
      AND payment_date <= ${range.end}
  `;

  return { summary: totals[0] ?? {}, byMethod, statusSummary, trend };
}

/* ─────────────────────────────────────────────────────────────
   INVENTORY REPORT
───────────────────────────────────────────────────────────── */
export async function getInventoryReport(businessId: string) {
  // Current stock levels + value
  const stock = await prisma.$queryRaw<any[]>`
    SELECT
      p.id,
      p.name,
      p.sku,
      COALESCE(c.name, 'Uncategorised')                     AS category_name,
      p.stock_quantity                                       AS stock,
      p.low_stock_threshold,
      p.unit,
      COALESCE(p.purchase_price, 0)::float                  AS purchase_price,
      p.selling_price::float                                AS selling_price,
      COALESCE(p.stock_quantity * p.purchase_price, 0)::float AS stock_value_cost,
      CASE
        WHEN p.stock_quantity = 0                              THEN 'OUT_OF_STOCK'
        WHEN p.stock_quantity <= p.low_stock_threshold         THEN 'LOW_STOCK'
        ELSE 'IN_STOCK'
      END                                                   AS stock_status
    FROM products p
    LEFT JOIN categories c ON c.id = p.category_id
    WHERE p.business_id = ${businessId}
      AND p.deleted_at IS NULL
    ORDER BY p.stock_quantity ASC
  `;

  // Fast movers (top sold by qty in last 90 days)
  const fastMovers = await prisma.$queryRaw<any[]>`
    SELECT
      ii.product_id,
      ii.product_name,
      SUM(ii.quantity)::int AS qty_sold
    FROM invoice_items ii
    JOIN invoices i ON i.id = ii.invoice_id
    WHERE i.business_id = ${businessId}
      AND i.status NOT IN ('DRAFT', 'CANCELLED')
      AND i.invoice_date >= NOW() - INTERVAL '90 days'
    GROUP BY ii.product_id, ii.product_name
    ORDER BY qty_sold DESC
    LIMIT 10
  `;

  const totalStockValue = stock.reduce(
    (sum: number, p: any) => sum + Number(p.stock_value_cost),
    0,
  );

  return { stock, fastMovers, totalStockValue: +totalStockValue.toFixed(2) };
}
