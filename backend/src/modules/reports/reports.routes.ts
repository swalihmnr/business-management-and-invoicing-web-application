import { Router } from 'express';
import { authenticate } from '../../middleware/auth.middleware';
import { validate } from '../../middleware/validate.middleware';
import { reportDateSchema } from './reports.schema';
import * as controller from './reports.controller';

const router = Router();

// Enforce authentication on all report endpoints
router.use(authenticate);

// 1. Sales Summary & Trends
router.get('/sales', validate(reportDateSchema, 'query'), controller.getSalesReport);

// 2. Profit & Margins
router.get('/profit', validate(reportDateSchema, 'query'), controller.getProfitReport);

// 3. Product Sales & Performance
router.get('/products', validate(reportDateSchema, 'query'), controller.getProductReport);

// 4. Category Breakdown
router.get('/categories', validate(reportDateSchema, 'query'), controller.getCategoryReport);

// 5. Customer Revenue & Outstanding
router.get('/customers', validate(reportDateSchema, 'query'), controller.getCustomerReport);

// 6. Receivables & AR Aging
router.get('/receivables', validate(reportDateSchema, 'query'), controller.getReceivablesReport);

// 7. Payment Collections & Trends
router.get('/payments', validate(reportDateSchema, 'query'), controller.getPaymentReport);

// 8. Inventory Valuation & Fast/Slow Movers
router.get('/inventory', controller.getInventoryReport);

export default router;
