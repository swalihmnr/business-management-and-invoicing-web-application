import React, { useEffect, useState } from 'react';
import { useOutletContext } from 'react-router-dom';
import { Package, TrendingUp, DollarSign, Award } from 'lucide-react';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
} from 'recharts';
import type { ReportsContextType } from './ReportsLayout';
import { fetchProductReport, type ProductReportItem } from '../../api/reports.api';
import { ReportKPICard } from '../../components/reports/ReportKPICard';
import { ReportTable, type Column } from '../../components/reports/ReportTable';
import { Card } from '../../components/ui/Card';
import { Badge } from '../../components/ui/Badge';

export const ProductsReport: React.FC = () => {
  const { filter } = useOutletContext<ReportsContextType>();
  const [data, setData] = useState<ProductReportItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let mounted = true;
    setLoading(true);
    fetchProductReport(filter)
      .then((res) => {
        if (mounted) setData(res);
      })
      .finally(() => {
        if (mounted) setLoading(false);
      });

    return () => {
      mounted = false;
    };
  }, [filter]);

  const formatCurrency = (val: number) => `₹${val.toLocaleString('en-IN', { maximumFractionDigits: 2 })}`;

  const totalRevenue = data.reduce((s, i) => s + i.revenue, 0);
  const totalUnits = data.reduce((s, i) => s + i.unitsSold, 0);
  const totalProfit = data.reduce((s, i) => s + i.profit, 0);
  const topProduct = data[0];

  // Top 8 products for chart
  const topProductsChart = data.slice(0, 8).map((p) => ({
    name: p.name.length > 18 ? p.name.slice(0, 16) + '...' : p.name,
    revenue: p.revenue,
    units: p.unitsSold,
  }));

  const columns: Column<ProductReportItem>[] = [
    {
      key: 'name',
      header: 'Product Name',
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
      key: 'unitsSold',
      header: 'Units Sold',
      align: 'right',
      render: (row) => <span style={{ fontWeight: 600 }}>{row.unitsSold}</span>,
    },
    {
      key: 'revenue',
      header: 'Revenue',
      align: 'right',
      render: (row) => (
        <span style={{ fontWeight: 600, color: 'var(--primary-500)' }}>
          {formatCurrency(row.revenue)}
        </span>
      ),
    },
    {
      key: 'cost',
      header: 'Cost (COGS)',
      align: 'right',
      render: (row) => formatCurrency(row.cost),
    },
    {
      key: 'profit',
      header: 'Gross Profit',
      align: 'right',
      render: (row) => (
        <span style={{ fontWeight: 600, color: row.profit >= 0 ? 'var(--success)' : 'var(--danger)' }}>
          {formatCurrency(row.profit)}
        </span>
      ),
    },
    {
      key: 'invoiceCount',
      header: 'Invoices',
      align: 'right',
      render: (row) => row.invoiceCount,
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
          title="Product Sales Revenue"
          value={formatCurrency(totalRevenue)}
          subtitle="Cumulative items turnover"
          icon={TrendingUp}
          variant="primary"
        />
        <ReportKPICard
          title="Total Units Sold"
          value={totalUnits}
          subtitle="Units moved from inventory"
          icon={Package}
          variant="purple"
        />
        <ReportKPICard
          title="Product Gross Profit"
          value={formatCurrency(totalProfit)}
          subtitle="Revenue less inventory costs"
          icon={DollarSign}
          variant="success"
        />
        <ReportKPICard
          title="Top Product"
          value={topProduct ? topProduct.name.slice(0, 15) : 'None'}
          subtitle={topProduct ? `${formatCurrency(topProduct.revenue)} sales` : 'No sales'}
          icon={Award}
          variant="cyan"
        />
      </div>

      {/* Top Products Bar Chart */}
      <Card style={{ padding: '1.5rem', background: 'var(--bg-card)', borderRadius: 'var(--radius-lg)' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
          <div>
            <h3 style={{ fontSize: '1.1rem', fontWeight: 600 }}>Top Products by Revenue</h3>
            <p style={{ fontSize: '0.825rem', color: 'var(--text-muted)' }}>Highest yielding catalog items during selected period</p>
          </div>
        </div>

        <div style={{ height: '300px', width: '100%' }}>
          {topProductsChart.length > 0 ? (
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={topProductsChart} margin={{ top: 10, right: 10, left: 0, bottom: 20 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--border-subtle)" vertical={false} />
                <XAxis dataKey="name" stroke="var(--text-muted)" fontSize={11} interval={0} angle={-15} textAnchor="end" />
                <YAxis
                  stroke="var(--text-muted)"
                  fontSize={12}
                  tickLine={false}
                  tickFormatter={(val) => `₹${val}`}
                />
                <Tooltip
                  formatter={(val: any) => [`₹${Number(val).toLocaleString()}`, 'Revenue']}
                  contentStyle={{
                    backgroundColor: 'var(--bg-card)',
                    borderColor: 'var(--border-medium)',
                    borderRadius: '8px',
                    color: 'var(--text-primary)',
                  }}
                />
                <Bar dataKey="revenue" fill="#6366f1" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <div
              style={{
                height: '100%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: 'var(--text-muted)',
              }}
            >
              No product sales in this period
            </div>
          )}
        </div>
      </Card>

      {/* Product Performance Table */}
      <ReportTable
        title="Product Performance Details"
        subtitle="Full item breakdown by volume, revenue, acquisition cost, and profitability"
        columns={columns}
        data={data}
        searchKey="name"
        searchPlaceholder="Search product by name or SKU..."
        csvFilename="product-sales-report.csv"
        loading={loading}
      />
    </div>
  );
};
