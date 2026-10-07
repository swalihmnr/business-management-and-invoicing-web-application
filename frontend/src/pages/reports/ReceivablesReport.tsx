import React, { useEffect, useState } from 'react';
import {
  AlertCircle,
  Clock,
  AlertTriangle,
  Flame,
} from 'lucide-react';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Cell,
} from 'recharts';
import { fetchReceivablesReport, type ReceivablesReportData, type ReceivablesItem } from '../../api/reports.api';
import { ReportKPICard } from '../../components/reports/ReportKPICard';
import { ReportTable, type Column } from '../../components/reports/ReportTable';
import { Card } from '../../components/ui/Card';
import { Badge } from '../../components/ui/Badge';
import { useInvoiceStore } from '../../store/invoice.store';

const BUCKET_COLORS: Record<string, string> = {
  '0-30': '#10b981', // green
  '31-60': '#f59e0b', // amber
  '61-90': '#f97316', // orange
  '90+': '#ef4444', // crimson red
};

export const ReceivablesReport: React.FC = () => {
  const [data, setData] = useState<ReceivablesReportData | null>(null);
  const [loading, setLoading] = useState(true);
  const { invoices } = useInvoiceStore();

  useEffect(() => {
    let mounted = true;
    setLoading(true);
    fetchReceivablesReport()
      .then((res) => {
        if (mounted) setData(res);
      })
      .finally(() => {
        if (mounted) setLoading(false);
      });

    return () => {
      mounted = false;
    };
  }, [invoices]);

  const formatCurrency = (val: number) => `₹${val.toLocaleString('en-IN', { maximumFractionDigits: 2 })}`;

  const totalOutstanding = data?.rows.reduce((s, r) => s + r.amountDue, 0) || 0;
  const overdueCount = data?.rows.length || 0;

  const bucket30 = data?.buckets.find((b) => b.bucket === '0-30')?.totalDue || 0;
  const bucket60 = data?.buckets.find((b) => b.bucket === '31-60')?.totalDue || 0;
  const bucket90 = data?.buckets.find((b) => b.bucket === '61-90')?.totalDue || 0;
  const bucket90Plus = data?.buckets.find((b) => b.bucket === '90+')?.totalDue || 0;

  const columns: Column<ReceivablesItem>[] = [
    {
      key: 'invoiceNumber',
      header: 'Invoice #',
      render: (row) => (
        <span style={{ fontWeight: 600, color: 'var(--primary-500)' }}>
          {row.invoiceNumber}
        </span>
      ),
    },
    {
      key: 'customerName',
      header: 'Customer',
      render: (row) => (
        <div>
          <div style={{ fontWeight: 500 }}>{row.customerName}</div>
          <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{row.customerPhone}</div>
        </div>
      ),
    },
    { key: 'invoiceDate', header: 'Invoice Date' },
    { key: 'dueDate', header: 'Due Date' },
    {
      key: 'totalAmount',
      header: 'Billed',
      align: 'right',
      render: (row) => formatCurrency(row.totalAmount),
    },
    {
      key: 'amountPaid',
      header: 'Paid',
      align: 'right',
      render: (row) => <span style={{ color: 'var(--success)' }}>{formatCurrency(row.amountPaid)}</span>,
    },
    {
      key: 'amountDue',
      header: 'Amount Due',
      align: 'right',
      render: (row) => (
        <span style={{ fontWeight: 700, color: 'var(--danger)' }}>
          {formatCurrency(row.amountDue)}
        </span>
      ),
    },
    {
      key: 'ageDays',
      header: 'Age',
      align: 'center',
      render: (row) => <span>{row.ageDays}d</span>,
    },
    {
      key: 'agingBucket',
      header: 'Aging Category',
      align: 'center',
      render: (row) => {
        if (row.agingBucket === '0-30') return <Badge variant="success">0-30 Days (Current)</Badge>;
        if (row.agingBucket === '31-60') return <Badge variant="warning">31-60 Days</Badge>;
        if (row.agingBucket === '61-90') return <Badge variant="warning">61-90 Days</Badge>;
        return <Badge variant="danger">90+ Days (Critical)</Badge>;
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
          title="Total AR Balance"
          value={formatCurrency(totalOutstanding)}
          subtitle={`${overdueCount} unpaid customer dues`}
          icon={AlertCircle}
          variant="danger"
        />
        <ReportKPICard
          title="0 - 30 Days Due"
          value={formatCurrency(bucket30)}
          subtitle="Fresh / Current invoices"
          icon={Clock}
          variant="success"
        />
        <ReportKPICard
          title="31 - 60 Days Due"
          value={formatCurrency(bucket60)}
          subtitle="Mild overdue status"
          icon={AlertTriangle}
          variant="warning"
        />
        <ReportKPICard
          title="61 - 90 Days Due"
          value={formatCurrency(bucket90)}
          subtitle="Elevated collection risk"
          icon={AlertTriangle}
          variant="warning"
        />
        <ReportKPICard
          title="90+ Days Delinquent"
          value={formatCurrency(bucket90Plus)}
          subtitle="Critical overdue balance"
          icon={Flame}
          variant="danger"
        />
      </div>

      {/* Aging Distribution Chart */}
      <Card style={{ padding: '1.5rem', background: 'var(--bg-card)', borderRadius: 'var(--radius-lg)' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
          <div>
            <h3 style={{ fontSize: '1.1rem', fontWeight: 600 }}>Accounts Receivable Aging Schedule</h3>
            <p style={{ fontSize: '0.825rem', color: 'var(--text-muted)' }}>Distribution of uncollected debt categorized by days outstanding</p>
          </div>
        </div>

        <div style={{ height: '280px', width: '100%' }}>
          {data?.buckets && data.buckets.length > 0 ? (
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={data.buckets} margin={{ top: 10, right: 10, left: 0, bottom: 10 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--border-subtle)" vertical={false} />
                <XAxis dataKey="bucket" stroke="var(--text-muted)" fontSize={12} tickFormatter={(val) => `${val} Days`} />
                <YAxis
                  stroke="var(--text-muted)"
                  fontSize={12}
                  tickLine={false}
                  tickFormatter={(val) => `₹${val}`}
                />
                <Tooltip
                  formatter={(val: any) => [`₹${Number(val).toLocaleString()}`, 'Total Due']}
                  contentStyle={{
                    backgroundColor: 'var(--bg-card)',
                    borderColor: 'var(--border-medium)',
                    borderRadius: '8px',
                    color: 'var(--text-primary)',
                  }}
                />
                <Bar dataKey="totalDue" radius={[6, 6, 0, 0]}>
                  {data.buckets.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={BUCKET_COLORS[entry.bucket] || '#6366f1'} />
                  ))}
                </Bar>
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
              No outstanding receivables! All invoices are fully settled.
            </div>
          )}
        </div>
      </Card>

      {/* Receivables Table */}
      <ReportTable
        title="Pending Receivables Invoices"
        subtitle="Unsettled customer invoices ordered by collection priority"
        columns={columns}
        data={data?.rows || []}
        searchKey="invoiceNumber"
        searchPlaceholder="Filter invoice # or customer..."
        csvFilename="receivables-aging-report.csv"
        loading={loading}
      />
    </div>
  );
};
