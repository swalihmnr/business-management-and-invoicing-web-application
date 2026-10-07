import { ReportDateQuery, resolveDateRange } from './reports.schema';
import * as repo from './reports.repository';
import { parsePagination } from '../../utils/ApiResponse';

/**
 * Reports Service
 *
 * Thin orchestration layer between controller and repository.
 * Resolves date ranges, pagination, and calls the correct repository function.
 */

export async function getSalesReport(businessId: string, query: ReportDateQuery) {
  const range = resolveDateRange(query);
  return repo.getSalesSummary(businessId, range);
}

export async function getProfitReport(businessId: string, query: ReportDateQuery) {
  const range = resolveDateRange(query);
  return repo.getProfitSummary(businessId, range);
}

export async function getProductReport(businessId: string, query: ReportDateQuery) {
  const range = resolveDateRange(query);
  return repo.getProductReport(businessId, range);
}

export async function getCategoryReport(businessId: string, query: ReportDateQuery) {
  const range = resolveDateRange(query);
  return repo.getCategoryReport(businessId, range);
}

export async function getCustomerReport(businessId: string, query: ReportDateQuery) {
  const range = resolveDateRange(query);
  return repo.getCustomerReport(businessId, range);
}

export async function getReceivablesReport(businessId: string, query: ReportDateQuery) {
  const { skip, take, page, limit } = parsePagination(query.page, query.limit, 500);
  const result = await repo.getReceivablesReport(businessId, skip, take);
  return {
    ...result,
    pagination: {
      page,
      limit,
      total: result.total,
      totalPages: Math.ceil(result.total / limit),
    },
  };
}

export async function getPaymentReport(businessId: string, query: ReportDateQuery) {
  const range = resolveDateRange(query);
  return repo.getPaymentReport(businessId, range);
}

export async function getInventoryReport(businessId: string) {
  return repo.getInventoryReport(businessId);
}
