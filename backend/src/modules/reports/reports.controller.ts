import type { Request, Response, NextFunction } from 'express';
import * as reportsService from './reports.service';
import { ApiResponse } from '../../utils/ApiResponse';
import { ApiError } from '../../utils/ApiError';
import { ReportDateQuery } from './reports.schema';

function getBusinessId(req: Request): string {
  const businessId = req.user?.businessId;
  if (!businessId) {
    throw ApiError.forbidden('No active business associated with this account');
  }
  return businessId;
}

export async function getSalesReport(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const businessId = getBusinessId(req);
    const data = await reportsService.getSalesReport(businessId, req.query as unknown as ReportDateQuery);
    res.json(ApiResponse.success('Sales report fetched successfully', data));
  } catch (err) {
    next(err);
  }
}

export async function getProfitReport(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const businessId = getBusinessId(req);
    const data = await reportsService.getProfitReport(businessId, req.query as unknown as ReportDateQuery);
    res.json(ApiResponse.success('Profit report fetched successfully', data));
  } catch (err) {
    next(err);
  }
}

export async function getProductReport(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const businessId = getBusinessId(req);
    const data = await reportsService.getProductReport(businessId, req.query as unknown as ReportDateQuery);
    res.json(ApiResponse.success('Product sales report fetched successfully', data));
  } catch (err) {
    next(err);
  }
}

export async function getCategoryReport(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const businessId = getBusinessId(req);
    const data = await reportsService.getCategoryReport(businessId, req.query as unknown as ReportDateQuery);
    res.json(ApiResponse.success('Category sales report fetched successfully', data));
  } catch (err) {
    next(err);
  }
}

export async function getCustomerReport(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const businessId = getBusinessId(req);
    const data = await reportsService.getCustomerReport(businessId, req.query as unknown as ReportDateQuery);
    res.json(ApiResponse.success('Customer report fetched successfully', data));
  } catch (err) {
    next(err);
  }
}

export async function getReceivablesReport(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const businessId = getBusinessId(req);
    const result = await reportsService.getReceivablesReport(businessId, req.query as unknown as ReportDateQuery);
    res.json(
      ApiResponse.success(
        'Receivables report fetched successfully',
        { rows: result.rows, buckets: result.buckets },
        result.pagination
      )
    );
  } catch (err) {
    next(err);
  }
}

export async function getPaymentReport(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const businessId = getBusinessId(req);
    const data = await reportsService.getPaymentReport(businessId, req.query as unknown as ReportDateQuery);
    res.json(ApiResponse.success('Payment collection report fetched successfully', data));
  } catch (err) {
    next(err);
  }
}

export async function getInventoryReport(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const businessId = getBusinessId(req);
    const data = await reportsService.getInventoryReport(businessId);
    res.json(ApiResponse.success('Inventory health report fetched successfully', data));
  } catch (err) {
    next(err);
  }
}
