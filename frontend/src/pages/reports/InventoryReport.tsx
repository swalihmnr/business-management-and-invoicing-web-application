import React, { useEffect, useState } from 'react';
import {
  Boxes,
  DollarSign,
  TrendingUp,
  PackageCheck,
  ShieldAlert,
} from 'lucide-react';
import { fetchInventoryReport, type InventoryReportData, type InventoryReportItem } from '../../api/reports.api';
import { ReportKPICard } from '../../components/reports/ReportKPICard';
import { ReportTable, type Column } from '../../components/reports/ReportTable';
import { Badge } from '../../components/ui/Badge';
import { useProductStore } from '../../store/product.store';

export const InventoryReport: React.FC = () => {
  const [data, setData] = useState<InventoryReportData | null>(null);
  const [loading, setLoading] = useState(true);
  const { products } = useProductStore();

  useEffect(() => {
    let mounted = true;
    setLoading(true);
    fetchInventoryReport()
      .then((res) => {
        if (mounted) setData(res);
      })
      .finally(() => {
        if (mounted) setLoading(false);
      });

    return () => {
      mounted = false;
    };
  }, [products]);

  const formatCurrency = (val: number) => `₹${val.toLocaleString('en-IN', { maximumFractionDigits: 2 })}`;

  const columns: Column<InventoryReportItem>[] = [
    {
      key: 'name',
      header: 'Product / SKU',
      render: (row) => (
        <div>
          <div style={{ fontWeight: 600, color: 'var(--text-primary)' }}>{row.name}</div>
          <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{row.sku}</div>
        </div>
      ),
    },
    {
      key: 'category',
      header: 'Category',
      render: (row) => <Badge variant="neutral">{row.category || 'General'}</Badge>,
    },
    {
      key: 'stock',
      header: 'Current Stock',
      align: 'right',
      render: (row) => (
        <span style={{ fontWeight: 600, color: row.stock === 0 ? 'var(--danger)' : 'var(--text-primary)' }}>
          {row.stock} units
        </span>
      ),
    },
    {
      key: 'purchasePrice',
      header: 'Unit Cost',
      align: 'right',
      render: (row) => formatCurrency(row.purchasePrice),
    },
    {
      key: 'sellingPrice',
      header: 'Unit Retail',
      align: 'right',
      render: (row) => formatCurrency(row.sellingPrice),
    },
    {
      key: 'stockValueCost',
      header: 'Cost Valuation',
      align: 'right',
      render: (row) => (
        <span style={{ color: 'var(--text-secondary)' }}>
          {formatCurrency(row.stockValueCost)}
        </span>
      ),
    },
    {
      key: 'stockValueRetail',
      header: 'Retail Valuation',
      align: 'right',
      render: (row) => (
        <span style={{ fontWeight: 600, color: 'var(--primary-500)' }}>
          {formatCurrency(row.stockValueRetail)}
        </span>
      ),
    },
    {
      key: 'status',
      header: 'Stock Health',
      align: 'center',
      render: (row) => {
        if (row.status === 'Out of Stock') return <Badge variant="danger">Out of Stock</Badge>;
        if (row.status === 'Low Stock') return <Badge variant="warning">Low Stock</Badge>;
        return <Badge variant="success">In Stock</Badge>;
      },
    },
    {
      key: 'turnoverTag',
      header: 'Velocity',
      align: 'center',
      render: (row) => {
        if (row.turnoverTag === 'Fast Mover') return <Badge variant="primary">Fast Mover</Badge>;
        if (row.turnoverTag === 'Slow Mover') return <Badge variant="neutral">Slow Mover</Badge>;
        return <Badge variant="success">Steady</Badge>;
      },
    },
  ];

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      {/* Metric Cards */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
          gap: '1rem',
        }}
      >
        <ReportKPICard
          title="Stock Cost Valuation"
          value={formatCurrency(data?.totalCostValue || 0)}
          subtitle="Tied up working capital"
          icon={DollarSign}
          variant="primary"
        />
        <ReportKPICard
          title="Stock Retail Valuation"
          value={formatCurrency(data?.totalRetailValue || 0)}
          subtitle="Potential sales revenue"
          icon={TrendingUp}
          variant="success"
        />
        <ReportKPICard
          title="Unrealized Profit"
          value={formatCurrency(data?.potentialProfit || 0)}
          subtitle="Projected gross profit"
          icon={PackageCheck}
          variant="purple"
        />
        <ReportKPICard
          title="Physical Inventory"
          value={`${data?.totalUnits || 0} units`}
          subtitle={`Across ${data?.totalSkus || 0} catalog SKUs`}
          icon={Boxes}
          variant="cyan"
        />
        <ReportKPICard
          title="Low Stock Risk"
          value={`${(data?.lowStockCount || 0) + (data?.outOfStockCount || 0)} items`}
          subtitle={`${data?.outOfStockCount || 0} zero-stock items`}
          icon={ShieldAlert}
          variant="danger"
        />
      </div>

      {/* Inventory Valuation Details Table */}
      <ReportTable
        title="Inventory Valuation & Stock Health Ledger"
        subtitle="Catalog stock balance, unit purchase cost, retail value, and velocity metrics"
        columns={columns}
        data={data?.items || []}
        searchKey="name"
        searchPlaceholder="Search product name or SKU..."
        csvFilename="inventory-valuation-report.csv"
        loading={loading}
      />
    </div>
  );
};
