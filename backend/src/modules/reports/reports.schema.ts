import { z } from 'zod';

/**
 * Shared query schema for all report endpoints.
 * Date range can be specified as a preset or explicit startDate/endDate.
 */
export const reportDateSchema = z.object({
  preset: z
    .enum(['today', 'yesterday', 'this_week', 'this_month', 'last_month', 'this_year', 'custom'])
    .optional(),
  startDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'startDate must be YYYY-MM-DD').optional(),
  endDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'endDate must be YYYY-MM-DD').optional(),
  page: z.coerce.number().int().positive().default(1),
  limit: z.coerce.number().int().positive().max(500).default(100),
});

export type ReportDateQuery = z.infer<typeof reportDateSchema>;

/**
 * Resolve a preset or explicit date pair into concrete Date objects.
 * All date ranges are inclusive of the full day (00:00:00 → 23:59:59 UTC).
 */
export function resolveDateRange(query: ReportDateQuery): { start: Date; end: Date } {
  const now = new Date();
  const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const todayEnd = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 23, 59, 59, 999);

  const { preset, startDate, endDate } = query;

  if (preset === 'today') {
    return { start: todayStart, end: todayEnd };
  }

  if (preset === 'yesterday') {
    const start = new Date(todayStart);
    start.setDate(start.getDate() - 1);
    const end = new Date(todayEnd);
    end.setDate(end.getDate() - 1);
    return { start, end };
  }

  if (preset === 'this_week') {
    const start = new Date(todayStart);
    start.setDate(start.getDate() - start.getDay()); // Sunday
    return { start, end: todayEnd };
  }

  if (preset === 'this_month') {
    const start = new Date(now.getFullYear(), now.getMonth(), 1);
    return { start, end: todayEnd };
  }

  if (preset === 'last_month') {
    const start = new Date(now.getFullYear(), now.getMonth() - 1, 1);
    const end = new Date(now.getFullYear(), now.getMonth(), 0, 23, 59, 59, 999);
    return { start, end };
  }

  if (preset === 'this_year') {
    const start = new Date(now.getFullYear(), 0, 1);
    return { start, end: todayEnd };
  }

  // Explicit custom range or default (last 30 days)
  const start = startDate
    ? new Date(`${startDate}T00:00:00.000Z`)
    : new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);

  const end = endDate
    ? new Date(`${endDate}T23:59:59.999Z`)
    : todayEnd;

  return { start, end };
}
