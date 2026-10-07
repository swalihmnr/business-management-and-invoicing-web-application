import React, { useEffect, useState } from 'react';
import { useOutletContext } from 'react-router-dom';
import { Layers, TrendingUp, PieChart as PieIcon, PackageCheck } from 'lucide-react';
import {
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Tooltip,
  Legend,
} from 'recharts';
import type { ReportsContextType } from './ReportsLayout';
import { fetchCategoryReport, type CategoryReportItem } from '../../api/reports.api';
import { ReportKPICard } from '../../components/reports/ReportKPICard';
import { ReportTable, type Column } from '../../components/reports/ReportTable';
import { Card } from '../../components/ui/Card';

const COLORS = ['#6366f1', '#10b981', '#f59e0b', '#ec4899', '#8b5cf6', '#06b6d4', '#3b82f6'];

export const CategoriesReport: React.FC = () => {
  const { filter } = useOutletContext<ReportsContextType>();
  const [data, setData] = useState<CategoryReportItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let mounted = true;
    setLoading(true);
    fetchCategoryReport(filter)
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
  const topCategory = data[0];

  const pieData = data.map((c) => ({
    name: c.category,
    value: c.revenue,
  }));

  const columns: Column<CategoryReportItem>[] = [
    {
      key: 'category',
      header: 'Category',
      render: (row) => (
        <span style={{ fontWeight: 600, color: 'var(--text-primary)' }}>
          {row.category}
        </span>
      ),
    },
    {
      key: 'unitsSold',
      header: 'Units Sold',
      align: 'right',
      render: (row) => row.unitsSold,
    },
    {
      key: 'revenue',
      header: 'Sales Revenue',
      align: 'right',
      render: (row) => (
        <span style={{ fontWeight: 600, color: 'var(--primary-500)' }}>
          {formatCurrency(row.revenue)}
        </span>
      ),
    },
    {
      key: 'percentageOfTotal',
      header: 'Share of Sales',
      align: 'right',
      render: (row) => (
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: '0.5rem' }}>
          <div
            style={{
              width: '50px',
              height: '6px',
              backgroundColor: 'var(--border-subtle)',
              borderRadius: '99px',
              overflow: 'hidden',
            }}
          >
            <div
              style={{
                width: `${row.percentageOfTotal}%`,
                height: '100%',
                backgroundColor: 'var(--primary-500)',
                borderRadius: '99px',
              }}
            />
          </div>
          <span style={{ fontWeight: 600 }}>{row.percentageOfTotal.toFixed(1)}%</span>
        </div>
      ),
    },
    {
      key: 'invoiceCount',
      header: 'Invoices Count',
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
          title="Total Category Revenue"
          value={formatCurrency(totalRevenue)}
          subtitle="All catalog segments"
          icon={TrendingUp}
          variant="primary"
        />
        <ReportKPICard
          title="Active Categories"
          value={data.length}
          subtitle="Segments with sales activity"
          icon={Layers}
          variant="purple"
        />
        <ReportKPICard
          title="Units Dispatched"
          value={totalUnits}
          subtitle="Total product items sold"
          icon={PackageCheck}
          variant="success"
        />
        <ReportKPICard
          title="Leading Category"
          value={topCategory ? topCategory.category : 'None'}
          subtitle={topCategory ? `${topCategory.percentageOfTotal.toFixed(1)}% market share` : 'No sales'}
          icon={PieIcon}
          variant="cyan"
        />
      </div>

      {/* Category Revenue Distribution Chart */}
      <Card style={{ padding: '1.5rem', background: 'var(--bg-card)', borderRadius: 'var(--radius-lg)' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
          <div>
            <h3 style={{ fontSize: '1.1rem', fontWeight: 600 }}>Revenue Share by Category</h3>
            <p style={{ fontSize: '0.825rem', color: 'var(--text-muted)' }}>Contribution of product lines to gross revenue</p>
          </div>
        </div>

        <div style={{ height: '320px', width: '100%' }}>
          {pieData.length > 0 ? (
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={pieData}
                  cx="50%"
                  cy="50%"
                  innerRadius={70}
                  outerRadius={110}
                  paddingAngle={4}
                  dataKey="value"
                >
                  {pieData.map((_, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip
                  formatter={(val: any) => [`₹${Number(val).toLocaleString()}`, 'Revenue']}
                  contentStyle={{
                    backgroundColor: 'var(--bg-card)',
                    borderColor: 'var(--border-medium)',
                    borderRadius: '8px',
                    color: 'var(--text-primary)',
                  }}
                />
                <Legend />
              </PieChart>
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
              No category sales data for this period
            </div>
          )}
        </div>
      </Card>

      {/* Category Breakdown Table */}
      <ReportTable
        title="Category Contribution Breakdown"
        subtitle="Catalog classification by revenue and invoice frequency"
        columns={columns}
        data={data}
        searchKey="category"
        searchPlaceholder="Filter category name..."
        csvFilename="category-sales-report.csv"
        loading={loading}
      />
    </div>
  );
};
