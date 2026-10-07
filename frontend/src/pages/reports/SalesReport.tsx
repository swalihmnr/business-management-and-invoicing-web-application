import React, { useEffect, useState } from 'react';
import { useOutletContext } from 'react-router-dom';
import {
  TrendingUp,
  Receipt,
  DollarSign,
  CreditCard,
  AlertCircle,
  Percent,
} from 'lucide-react';
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
} from 'recharts';
import type { ReportsContextType } from './ReportsLayout';
import { fetchSalesReport, type SalesReportData } from '../../api/reports.api';
import { ReportKPICard } from '../../components/reports/ReportKPICard';
import { ReportTable, type Column } from '../../components/reports/ReportTable';
import { Card } from '../../components/ui/Card';
import { Badge } from '../../components/ui/Badge';
import { useInvoiceStore } from '../../store/invoice.store';

export const SalesReport: React.FC = () => {
  const { filter } = useOutletContext<ReportsContextType>();
  const [data, setData] = useState<SalesReportData | null>(null);
  const [loading, setLoading] = useState(true);
  const { invoices } = useInvoiceStore();

  useEffect(() => {
    let mounted = true;
    setLoading(true);
    fetchSalesReport(filter)
      .then((res) => {
        if (mounted) setData(res);
      })
      .finally(() => {
        if (mounted) setLoading(false);
      });

    return () => {
      mounted = false;
    };
  }, [filter, invoices]);

  const formatCurrency = (val: number) => `₹${val.toLocaleString('en-IN', { maximumFractionDigits: 2 })}`;

  const columns: Column<any>[] = [
    { key: 'invoiceNumber', header: 'Invoice #' },
    { key: 'invoiceDate', header: 'Date' },
    { key: 'customerName', header: 'Customer' },
    {
      key: 'taxAmount',
      header: 'Tax (GST)',
      render: (row) => formatCurrency(row.taxAmount || 0),
    },
    {
      key: 'discountAmount',
      header: 'Discount',
      render: (row) => formatCurrency(row.discountAmount || 0),
    },
    {
      key: 'totalAmount',
      header: 'Total Amount',
      render: (row) => (
        <span style={{ fontWeight: 600, color: 'var(--text-primary)' }}>
          {formatCurrency(row.totalAmount || 0)}
        </span>
      ),
    },
    {
      key: 'status',
      header: 'Status',
      render: (row) => {
        if (row.status === 'PAID') return <Badge variant="success">Paid</Badge>;
        if (row.status === 'PARTIALLY_PAID') return <Badge variant="warning">Partial</Badge>;
        return <Badge variant="danger">Unpaid</Badge>;
      },
    },
  ];

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      {/* Metric Cards Row */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
          gap: '1rem',
        }}
      >
        <ReportKPICard
          title="Total Gross Sales"
          value={formatCurrency(data?.totalSales || 0)}
          subtitle="Net invoiced volume"
          icon={TrendingUp}
          variant="primary"
        />
        <ReportKPICard
          title="Invoices Issued"
          value={data?.invoiceCount || 0}
          subtitle="Total transactions"
          icon={Receipt}
          variant="purple"
        />
        <ReportKPICard
          title="Avg. Invoice Value"
          value={formatCurrency(data?.avgInvoiceValue || 0)}
          subtitle="Revenue per transaction"
          icon={DollarSign}
          variant="cyan"
        />
        <ReportKPICard
          title="Collections Received"
          value={formatCurrency(data?.amountPaid || 0)}
          subtitle="Realized cash flow"
          icon={CreditCard}
          variant="success"
        />
        <ReportKPICard
          title="Outstanding Balance"
          value={formatCurrency(data?.amountDue || 0)}
          subtitle="Uncollected receivables"
          icon={AlertCircle}
          variant="danger"
        />
      </div>

      {/* Sales Trend Chart */}
      <Card style={{ padding: '1.5rem', background: 'var(--bg-card)', borderRadius: 'var(--radius-lg)' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
          <div>
            <h3 style={{ fontSize: '1.1rem', fontWeight: 600 }}>Daily Sales Trend</h3>
            <p style={{ fontSize: '0.825rem', color: 'var(--text-muted)' }}>Revenue volume and sales velocity over time</p>
          </div>
          <div style={{ display: 'flex', gap: '1rem', fontSize: '0.825rem', color: 'var(--text-muted)' }}>
            <span style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
              <span style={{ width: '10px', height: '10px', borderRadius: '50%', backgroundColor: '#6366f1' }} />
              Revenue
            </span>
          </div>
        </div>

        <div style={{ height: '300px', width: '100%' }}>
          {data?.dailyTrend && data.dailyTrend.length > 0 ? (
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={data.dailyTrend} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                <defs>
                  <linearGradient id="salesGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#6366f1" stopOpacity={0.4} />
                    <stop offset="95%" stopColor="#6366f1" stopOpacity={0.0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--border-subtle)" vertical={false} />
                <XAxis dataKey="date" stroke="var(--text-muted)" fontSize={12} tickLine={false} />
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
                <Area
                  type="monotone"
                  dataKey="sales"
                  stroke="#6366f1"
                  strokeWidth={2.5}
                  fillOpacity={1}
                  fill="url(#salesGrad)"
                />
              </AreaChart>
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
              No trend data available for this date period
            </div>
          )}
        </div>
      </Card>

      {/* Tax & Discount Summary Strip */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '1rem' }}>
        <Card style={{ padding: '1.25rem', display: 'flex', alignItems: 'center', gap: '1rem', background: 'var(--bg-card)' }}>
          <div
            style={{
              padding: '0.75rem',
              borderRadius: 'var(--radius-md)',
              backgroundColor: 'rgba(245, 158, 11, 0.12)',
              color: 'var(--warning)',
            }}
          >
            <Percent size={22} />
          </div>
          <div>
            <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)', fontWeight: 600 }}>TOTAL DISCOUNTS GRANTED</span>
            <h4 style={{ fontSize: '1.25rem', marginTop: '0.15rem' }}>{formatCurrency(data?.totalDiscount || 0)}</h4>
          </div>
        </Card>

        <Card style={{ padding: '1.25rem', display: 'flex', alignItems: 'center', gap: '1rem', background: 'var(--bg-card)' }}>
          <div
            style={{
              padding: '0.75rem',
              borderRadius: 'var(--radius-md)',
              backgroundColor: 'rgba(99, 102, 241, 0.12)',
              color: 'var(--primary-500)',
            }}
          >
            <Receipt size={22} />
          </div>
          <div>
            <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)', fontWeight: 600 }}>TOTAL GST / TAXES BILLED</span>
            <h4 style={{ fontSize: '1.25rem', marginTop: '0.15rem' }}>{formatCurrency(data?.totalTax || 0)}</h4>
          </div>
        </Card>
      </div>

      {/* Detailed Invoices Table */}
      <ReportTable
        title="Invoices Breakdown"
        subtitle="Individual sales records matching current filter"
        columns={columns}
        data={invoices}
        searchKey="invoiceNumber"
        searchPlaceholder="Search by invoice # or customer..."
        csvFilename="sales-report.csv"
        loading={loading}
      />
    </div>
  );
};
