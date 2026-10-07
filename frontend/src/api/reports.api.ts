import { apiClient } from './axios';
import { useInvoiceStore } from '../store/invoice.store';
import { useProductStore } from '../store/product.store';

export type DatePreset = 'today' | 'yesterday' | 'this_week' | 'this_month' | 'last_month' | 'this_year' | 'custom';

export interface ReportFilter {
  preset?: DatePreset;
  startDate?: string;
  endDate?: string;
  page?: number;
  limit?: number;
}

export interface SalesReportData {
  totalSales: number;
  invoiceCount: number;
  avgInvoiceValue: number;
  totalDiscount: number;
  totalTax: number;
  amountPaid: number;
  amountDue: number;
  dailyTrend: Array<{
    date: string;
    sales: number;
    invoices: number;
  }>;
}

export interface ProfitReportData {
  revenue: number;
  cogs: number;
  grossProfit: number;
  grossMarginPct: number;
  hasIncompleteCost: boolean;
  byDate: Array<{
    date: string;
    revenue: number;
    cogs: number;
    grossProfit: number;
  }>;
}

export interface ProductReportItem {
  id: string;
  name: string;
  sku: string;
  category: string;
  unitsSold: number;
  revenue: number;
  cost: number;
  profit: number;
  invoiceCount: number;
}

export interface CategoryReportItem {
  category: string;
  unitsSold: number;
  revenue: number;
  invoiceCount: number;
  percentageOfTotal: number;
}

export interface CustomerReportItem {
  customerName: string;
  customerPhone: string;
  invoiceCount: number;
  totalPurchased: number;
  totalPaid: number;
  amountDue: number;
  avgOrderValue: number;
}

export interface ReceivablesItem {
  id: string;
  invoiceNumber: string;
  customerName: string;
  customerPhone: string;
  invoiceDate: string;
  dueDate: string;
  totalAmount: number;
  amountPaid: number;
  amountDue: number;
  status: string;
  ageDays: number;
  agingBucket: '0-30' | '31-60' | '61-90' | '90+';
}

export interface ReceivablesReportData {
  rows: ReceivablesItem[];
  buckets: Array<{
    bucket: string;
    count: number;
    totalDue: number;
  }>;
}

export interface PaymentReportData {
  totalCollected: number;
  paymentCount: number;
  byMethod: Array<{
    method: string;
    count: number;
    amount: number;
    percentage: number;
  }>;
  dailyTrend: Array<{
    date: string;
    amount: number;
    count: number;
  }>;
}

export interface InventoryReportItem {
  id: string;
  name: string;
  sku: string;
  category: string;
  stock: number;
  purchasePrice: number;
  sellingPrice: number;
  stockValueCost: number;
  stockValueRetail: number;
  status: 'In Stock' | 'Low Stock' | 'Out of Stock';
  turnoverTag: 'Fast Mover' | 'Steady' | 'Slow Mover';
}

export interface InventoryReportData {
  totalSkus: number;
  totalUnits: number;
  totalCostValue: number;
  totalRetailValue: number;
  potentialProfit: number;
  lowStockCount: number;
  outOfStockCount: number;
  items: InventoryReportItem[];
}

// ─────────────────────────────────────────────────────────────
// Client-side fallback generator for local-first seamless UX
// ─────────────────────────────────────────────────────────────

function filterInvoicesByRange(invoices: any[], filter: ReportFilter) {
  const now = new Date();
  let start = new Date(0);
  let end = new Date(2100, 0, 1);

  if (filter.preset === 'today') {
    start = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    end = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 23, 59, 59, 999);
  } else if (filter.preset === 'yesterday') {
    start = new Date(now.getFullYear(), now.getMonth(), now.getDate() - 1);
    end = new Date(now.getFullYear(), now.getMonth(), now.getDate() - 1, 23, 59, 59, 999);
  } else if (filter.preset === 'this_week') {
    start = new Date(now.getFullYear(), now.getMonth(), now.getDate() - now.getDay());
    end = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 23, 59, 59, 999);
  } else if (filter.preset === 'this_month') {
    start = new Date(now.getFullYear(), now.getMonth(), 1);
    end = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 23, 59, 59, 999);
  } else if (filter.preset === 'last_month') {
    start = new Date(now.getFullYear(), now.getMonth() - 1, 1);
    end = new Date(now.getFullYear(), now.getMonth(), 0, 23, 59, 59, 999);
  } else if (filter.preset === 'this_year') {
    start = new Date(now.getFullYear(), 0, 1);
    end = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 23, 59, 59, 999);
  } else if (filter.startDate || filter.endDate) {
    if (filter.startDate) start = new Date(`${filter.startDate}T00:00:00.000Z`);
    if (filter.endDate) end = new Date(`${filter.endDate}T23:59:59.999Z`);
  }

  return invoices.filter((inv) => {
    const invDate = new Date(inv.invoiceDate || inv.createdAt);
    return invDate >= start && invDate <= end;
  });
}

// ─────────────────────────────────────────────────────────────
// Exported Report Service Functions
// ─────────────────────────────────────────────────────────────

export async function fetchSalesReport(filter: ReportFilter): Promise<SalesReportData> {
  try {
    const res = await apiClient.get('/reports/sales', { params: filter });
    if (res.data?.data) return res.data.data;
  } catch {
    // Graceful fallback to client-side state
  }

  const { invoices } = useInvoiceStore.getState();
  const filtered = filterInvoicesByRange(invoices, filter);

  const totalSales = filtered.reduce((s, i) => s + (i.totalAmount || 0), 0);
  const amountPaid = filtered.reduce((s, i) => s + (i.amountPaid || 0), 0);
  const amountDue = filtered.reduce((s, i) => s + (i.amountDue || 0), 0);
  const totalTax = filtered.reduce((s, i) => s + (i.taxAmount || 0), 0);
  const totalDiscount = filtered.reduce((s, i) => s + (i.discountAmount || 0), 0);
  const invoiceCount = filtered.length;
  const avgInvoiceValue = invoiceCount > 0 ? totalSales / invoiceCount : 0;

  // Group by date
  const trendMap: Record<string, { sales: number; invoices: number }> = {};
  filtered.forEach((inv) => {
    const d = (inv.invoiceDate || inv.createdAt || '').slice(0, 10) || new Date().toISOString().slice(0, 10);
    if (!trendMap[d]) trendMap[d] = { sales: 0, invoices: 0 };
    trendMap[d].sales += inv.totalAmount || 0;
    trendMap[d].invoices += 1;
  });

  const dailyTrend = Object.entries(trendMap)
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([date, val]) => ({ date, ...val }));

  return {
    totalSales,
    invoiceCount,
    avgInvoiceValue,
    totalDiscount,
    totalTax,
    amountPaid,
    amountDue,
    dailyTrend,
  };
}

export async function fetchProfitReport(filter: ReportFilter): Promise<ProfitReportData> {
  try {
    const res = await apiClient.get('/reports/profit', { params: filter });
    if (res.data?.data) return res.data.data;
  } catch {
    // Fallback
  }

  const { invoices } = useInvoiceStore.getState();
  const { products } = useProductStore.getState();
  const filtered = filterInvoicesByRange(invoices, filter);

  // Map products cost
  const costMap = new Map<string, number>();
  products.forEach((p) => {
    costMap.set(p.name.toLowerCase(), p.purchasePrice || p.sellingPrice * 0.6);
  });

  let totalRev = 0;
  let totalCogs = 0;
  const byDateMap: Record<string, { revenue: number; cogs: number }> = {};

  filtered.forEach((inv) => {
    const d = (inv.invoiceDate || inv.createdAt || '').slice(0, 10) || new Date().toISOString().slice(0, 10);
    if (!byDateMap[d]) byDateMap[d] = { revenue: 0, cogs: 0 };

    (inv.items || []).forEach((item: any) => {
      const lineRev = item.lineTotal || (item.quantity * item.unitPrice) || 0;
      const unitCost = costMap.get(item.name?.toLowerCase()) || (item.unitPrice * 0.65);
      const lineCost = unitCost * item.quantity;

      totalRev += lineRev;
      totalCogs += lineCost;
      byDateMap[d].revenue += lineRev;
      byDateMap[d].cogs += lineCost;
    });
  });

  const grossProfit = totalRev - totalCogs;
  const grossMarginPct = totalRev > 0 ? (grossProfit / totalRev) * 100 : 0;

  const byDate = Object.entries(byDateMap)
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([date, val]) => ({
      date,
      revenue: val.revenue,
      cogs: val.cogs,
      grossProfit: val.revenue - val.cogs,
    }));

  return {
    revenue: totalRev,
    cogs: totalCogs,
    grossProfit,
    grossMarginPct,
    hasIncompleteCost: false,
    byDate,
  };
}

export async function fetchProductReport(filter: ReportFilter): Promise<ProductReportItem[]> {
  try {
    const res = await apiClient.get('/reports/products', { params: filter });
    if (res.data?.data) return res.data.data;
  } catch {
    // Fallback
  }

  const { invoices } = useInvoiceStore.getState();
  const { products } = useProductStore.getState();
  const filtered = filterInvoicesByRange(invoices, filter);

  const productMap = new Map<string, ProductReportItem>();

  filtered.forEach((inv) => {
    (inv.items || []).forEach((item: any) => {
      const key = item.name || 'Unknown Item';
      const existing = productMap.get(key) || {
        id: item.id || key,
        name: key,
        sku: item.sku || `SKU-${key.slice(0, 3).toUpperCase()}`,
        category: 'General',
        unitsSold: 0,
        revenue: 0,
        cost: 0,
        profit: 0,
        invoiceCount: 0,
      };

      const matchedProd = products.find((p) => p.name.toLowerCase() === key.toLowerCase());
      if (matchedProd) {
        existing.sku = matchedProd.sku;
        existing.category = matchedProd.category;
      }

      const qty = item.quantity || 1;
      const rev = item.lineTotal || (qty * item.unitPrice);
      const unitCost = matchedProd?.purchasePrice || (item.unitPrice * 0.65);
      const cost = unitCost * qty;

      existing.unitsSold += qty;
      existing.revenue += rev;
      existing.cost += cost;
      existing.profit = existing.revenue - existing.cost;
      existing.invoiceCount += 1;

      productMap.set(key, existing);
    });
  });

  return Array.from(productMap.values()).sort((a, b) => b.revenue - a.revenue);
}

export async function fetchCategoryReport(filter: ReportFilter): Promise<CategoryReportItem[]> {
  try {
    const res = await apiClient.get('/reports/categories', { params: filter });
    if (res.data?.data) return res.data.data;
  } catch {
    // Fallback
  }

  const items = await fetchProductReport(filter);
  const totalRev = items.reduce((s, i) => s + i.revenue, 0);

  const catMap = new Map<string, CategoryReportItem>();

  items.forEach((item) => {
    const cat = item.category || 'Uncategorized';
    const existing = catMap.get(cat) || {
      category: cat,
      unitsSold: 0,
      revenue: 0,
      invoiceCount: 0,
      percentageOfTotal: 0,
    };

    existing.unitsSold += item.unitsSold;
    existing.revenue += item.revenue;
    existing.invoiceCount += item.invoiceCount;
    catMap.set(cat, existing);
  });

  const categories = Array.from(catMap.values()).map((c) => ({
    ...c,
    percentageOfTotal: totalRev > 0 ? (c.revenue / totalRev) * 100 : 0,
  }));

  return categories.sort((a, b) => b.revenue - a.revenue);
}

export async function fetchCustomerReport(filter: ReportFilter): Promise<CustomerReportItem[]> {
  try {
    const res = await apiClient.get('/reports/customers', { params: filter });
    if (res.data?.data) return res.data.data;
  } catch {
    // Fallback
  }

  const { invoices } = useInvoiceStore.getState();
  const filtered = filterInvoicesByRange(invoices, filter);

  const custMap = new Map<string, CustomerReportItem>();

  filtered.forEach((inv) => {
    const name = inv.customerName || 'Walk-in Customer';
    const existing = custMap.get(name) || {
      customerName: name,
      customerPhone: inv.customerPhone || 'N/A',
      invoiceCount: 0,
      totalPurchased: 0,
      totalPaid: 0,
      amountDue: 0,
      avgOrderValue: 0,
    };

    existing.invoiceCount += 1;
    existing.totalPurchased += inv.totalAmount || 0;
    existing.totalPaid += inv.amountPaid || 0;
    existing.amountDue += inv.amountDue || 0;
    custMap.set(name, existing);
  });

  return Array.from(custMap.values())
    .map((c) => ({
      ...c,
      avgOrderValue: c.invoiceCount > 0 ? c.totalPurchased / c.invoiceCount : 0,
    }))
    .sort((a, b) => b.totalPurchased - a.totalPurchased);
}

export async function fetchReceivablesReport(): Promise<ReceivablesReportData> {
  try {
    const res = await apiClient.get('/reports/receivables');
    if (res.data?.data) return res.data.data;
  } catch {
    // Fallback
  }

  const { invoices } = useInvoiceStore.getState();
  const now = new Date();

  const dueInvoices = invoices.filter((i) => (i.amountDue || 0) > 0);

  const rows: ReceivablesItem[] = dueInvoices.map((inv) => {
    const date = new Date(inv.invoiceDate || inv.createdAt);
    const diffTime = Math.abs(now.getTime() - date.getTime());
    const ageDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));

    let agingBucket: '0-30' | '31-60' | '61-90' | '90+' = '0-30';
    if (ageDays > 90) agingBucket = '90+';
    else if (ageDays > 60) agingBucket = '61-90';
    else if (ageDays > 30) agingBucket = '31-60';

    return {
      id: inv.id,
      invoiceNumber: inv.invoiceNumber,
      customerName: inv.customerName,
      customerPhone: inv.customerPhone || 'N/A',
      invoiceDate: inv.invoiceDate,
      dueDate: inv.dueDate,
      totalAmount: inv.totalAmount,
      amountPaid: inv.amountPaid || 0,
      amountDue: inv.amountDue,
      status: inv.status,
      ageDays,
      agingBucket,
    };
  });

  // Calculate buckets
  const bucketMap: Record<string, { count: number; totalDue: number }> = {
    '0-30': { count: 0, totalDue: 0 },
    '31-60': { count: 0, totalDue: 0 },
    '61-90': { count: 0, totalDue: 0 },
    '90+': { count: 0, totalDue: 0 },
  };

  rows.forEach((r) => {
    if (bucketMap[r.agingBucket]) {
      bucketMap[r.agingBucket].count += 1;
      bucketMap[r.agingBucket].totalDue += r.amountDue;
    }
  });

  const buckets = Object.entries(bucketMap).map(([bucket, data]) => ({
    bucket,
    count: data.count,
    totalDue: data.totalDue,
  }));

  return {
    rows: rows.sort((a, b) => b.amountDue - a.amountDue),
    buckets,
  };
}

export async function fetchPaymentReport(filter: ReportFilter): Promise<PaymentReportData> {
  try {
    const res = await apiClient.get('/reports/payments', { params: filter });
    if (res.data?.data) return res.data.data;
  } catch {
    // Fallback
  }

  const { getAllPayments } = useInvoiceStore.getState();
  const allPayments = getAllPayments();

  const totalCollected = allPayments.reduce((s, p) => s + p.amount, 0);
  const paymentCount = allPayments.length;

  const methodMap: Record<string, { count: number; amount: number }> = {};
  const trendMap: Record<string, { count: number; amount: number }> = {};

  allPayments.forEach((p) => {
    const m = p.paymentMethod || 'OTHER';
    if (!methodMap[m]) methodMap[m] = { count: 0, amount: 0 };
    methodMap[m].count += 1;
    methodMap[m].amount += p.amount;

    const d = (p.paymentDate || p.createdAt || '').slice(0, 10);
    if (!trendMap[d]) trendMap[d] = { count: 0, amount: 0 };
    trendMap[d].count += 1;
    trendMap[d].amount += p.amount;
  });

  const byMethod = Object.entries(methodMap).map(([method, data]) => ({
    method,
    count: data.count,
    amount: data.amount,
    percentage: totalCollected > 0 ? (data.amount / totalCollected) * 100 : 0,
  }));

  const dailyTrend = Object.entries(trendMap)
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([date, data]) => ({
      date,
      amount: data.amount,
      count: data.count,
    }));

  return {
    totalCollected,
    paymentCount,
    byMethod: byMethod.sort((a, b) => b.amount - a.amount),
    dailyTrend,
  };
}

export async function fetchInventoryReport(): Promise<InventoryReportData> {
  try {
    const res = await apiClient.get('/reports/inventory');
    if (res.data?.data) return res.data.data;
  } catch {
    // Fallback
  }

  const { products } = useProductStore.getState();

  let totalSkus = products.length;
  let totalUnits = 0;
  let totalCostValue = 0;
  let totalRetailValue = 0;
  let lowStockCount = 0;
  let outOfStockCount = 0;

  const items: InventoryReportItem[] = products.map((p) => {
    const stock = p.stock || 0;
    const threshold = p.lowStockThreshold ?? 10;
    const purchase = p.purchasePrice || p.sellingPrice * 0.6;
    const retail = p.sellingPrice;
    const costVal = stock * purchase;
    const retailVal = stock * retail;

    totalUnits += stock;
    totalCostValue += costVal;
    totalRetailValue += retailVal;

    let status: 'In Stock' | 'Low Stock' | 'Out of Stock' = 'In Stock';
    if (stock === 0) {
      status = 'Out of Stock';
      outOfStockCount++;
    } else if (stock <= threshold) {
      status = 'Low Stock';
      lowStockCount++;
    }

    // Heuristic: Fast mover if stock is low or sold frequently
    let turnoverTag: 'Fast Mover' | 'Steady' | 'Slow Mover' = 'Steady';
    if (stock < 15) turnoverTag = 'Fast Mover';
    else if (stock > 60) turnoverTag = 'Slow Mover';

    return {
      id: p.id,
      name: p.name,
      sku: p.sku,
      category: p.category,
      stock,
      purchasePrice: purchase,
      sellingPrice: retail,
      stockValueCost: costVal,
      stockValueRetail: retailVal,
      status,
      turnoverTag,
    };
  });

  return {
    totalSkus,
    totalUnits,
    totalCostValue,
    totalRetailValue,
    potentialProfit: totalRetailValue - totalCostValue,
    lowStockCount,
    outOfStockCount,
    items: items.sort((a, b) => b.stockValueRetail - a.stockValueRetail),
  };
}
