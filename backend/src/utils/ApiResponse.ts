/**
 * ApiResponse — Standardized HTTP response wrapper.
 *
 * Every API response — success or error — uses the same shape.
 * This makes frontend parsing predictable and eliminates per-route response decisions.
 *
 * Success shape:
 * {
 *   "success": true,
 *   "message": "Customer created",
 *   "data": { ... }
 * }
 *
 * Paginated success shape:
 * {
 *   "success": true,
 *   "message": "Customers fetched",
 *   "data": [...],
 *   "pagination": { "page": 1, "limit": 20, "total": 145, "totalPages": 8 }
 * }
 */
export interface PaginationMeta {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

export class ApiResponse<T> {
  public readonly success: boolean;
  public readonly message: string;
  public readonly data: T;
  public readonly pagination?: PaginationMeta;

  constructor(message: string, data: T, pagination?: PaginationMeta) {
    this.success = true;
    this.message = message;
    this.data = data;
    this.pagination = pagination;
  }

  static success<T>(message: string, data: T, pagination?: PaginationMeta): ApiResponse<T> {
    return new ApiResponse(message, data, pagination);
  }
}

/**
 * Pagination helper — converts page/limit query params to Prisma skip/take.
 */
export function parsePagination(
  page: unknown,
  limit: unknown,
  maxLimit = 100,
): { skip: number; take: number; page: number; limit: number } {
  const parsedPage = Math.max(1, parseInt(String(page ?? '1'), 10) || 1);
  const parsedLimit = Math.min(
    maxLimit,
    Math.max(1, parseInt(String(limit ?? '20'), 10) || 20),
  );
  return {
    skip: (parsedPage - 1) * parsedLimit,
    take: parsedLimit,
    page: parsedPage,
    limit: parsedLimit,
  };
}
