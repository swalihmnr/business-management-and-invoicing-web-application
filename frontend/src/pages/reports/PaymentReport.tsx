import React, { useEffect, useState } from 'react';
import { useOutletContext } from 'react-router-dom';
import { CreditCard, TrendingUp, CheckCircle, Wallet } from 'lucide-react';
import {
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
} from 'recharts';
import type { ReportsContextType } from './ReportsLayout';
import { fetchPaymentReport, type PaymentReportData } from '../../api/reports.api';
import { ReportKPICard } from '../../components/reports/ReportKPICard';
import { ReportTable, type Column } from '../../components/reports/ReportTable';
import { Card } from '../../components/ui/Card';
import { Badge } from '../../components/ui/Badge';
import { useInvoiceStore } from '../../store/invoice.store';

const METHOD_COLORS = ['#10b981', '#6366f1', '#3b82f6', '#f59e0b', '#8b5cf6', '#ec4899'];

export const PaymentReport: React.FC = () => {
  const { filter } = useOutletContext<ReportsContextType>();
  const [data, setData] = useState<PaymentReportData | null>(null);
  const [loading, setLoading] = useState(true);
  const { getAllPayments } = useInvoiceStore();
  const allPayments = getAllPayments();

  useEffect(() => {
    let mounted = true;
    setLoading(true);
    fetchPaymentReport(filter)
      .then((res) => {
        if (mounted) setData(res);
      })
      .finally(() => {
        if (mounted) setLoading(false);
      });

    return () => {
      mounted = false;
    };
  }, [filter, allPayments.length]);

  const formatCurrency = (val: number) => `₹${val.toLocaleString('en-IN', { maximumFractionDigits: 2 })}`;

  const totalCollected = data?.totalCollected || 0;
  const paymentCount = data?.paymentCount || 0;
  const topMethod = data?.byMethod[0];

  const pieData = (data?.byMethod || []).map((m) => ({
    name: m.method,
    value: m.amount,
  }));

  const columns: Column<any>[] = [
    {
      key: 'invoiceNumber',
      header: 'Invoice #',
      render: (row) => (
        <span style={{ fontWeight: 600, color: 'var(--primary-500)' }}>
          {row.invoiceNumber}
        </span>
      ),
    },
    { key: 'customerName', header: 'Customer' },
    { key: 'paymentDate', header: 'Date' },
    {
      key: 'paymentMethod',
      header: 'Method',
      render: (row) => <Badge variant="neutral">{row.paymentMethod}</Badge>,
    },
    {
      key: 'referenceNumber',
      header: 'Reference #',
      render: (row) => row.referenceNumber || '—',
    },
    {
      key: 'amount',
      header: 'Amount Collected',
      align: 'right',
      render: (row) => (
        <span style={{ fontWeight: 600, color: 'var(--success)' }}>
          {formatCurrency(row.amount)}
        </span>
      ),
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
          title="Total Cash Collected"
          value={formatCurrency(totalCollected)}
          subtitle="Realized revenue"
          icon={TrendingUp}
          variant="success"
        />
        <ReportKPICard
          title="Transactions Cleared"
          value={paymentCount}
          subtitle="Customer receipts processed"
          icon={CheckCircle}
          variant="primary"
        />
        <ReportKPICard
          title="Primary Channel"
          value={topMethod ? topMethod.method : 'None'}
          subtitle={topMethod ? `${formatCurrency(topMethod.amount)} (${topMethod.percentage.toFixed(0)}%)` : 'No transactions'}
          icon={Wallet}
          variant="cyan"
        />
        <ReportKPICard
          title="Avg. Payment Size"
          value={formatCurrency(paymentCount > 0 ? totalCollected / paymentCount : 0)}
          subtitle="Mean receipt amount"
          icon={CreditCard}
          variant="purple"
        />
      </div>

      {/* Dual Charts Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(360px, 1fr))', gap: '1.5rem' }}>
        {/* Method Breakdown */}
        <Card style={{ padding: '1.5rem', background: 'var(--bg-card)', borderRadius: 'var(--radius-lg)' }}>
          <h3 style={{ fontSize: '1.1rem', fontWeight: 600, marginBottom: '0.25rem' }}>
            Payment Method Split
          </h3>
          <p style={{ fontSize: '0.825rem', color: 'var(--text-muted)', marginBottom: '1rem' }}>
            Volume breakdown across payment channels
          </p>

          <div style={{ height: '260px', width: '100%' }}>
            {pieData.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={pieData}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={95}
                    paddingAngle={4}
                    dataKey="value"
                  >
                    {pieData.map((_, index) => (
                      <Cell key={`cell-${index}`} fill={METHOD_COLORS[index % METHOD_COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip
                    formatter={(val: any) => [`₹${Number(val).toLocaleString()}`, 'Collected']}
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
                No payments collected in this period
              </div>
            )}
          </div>
        </Card>

        {/* Collection Trend */}
        <Card style={{ padding: '1.5rem', background: 'var(--bg-card)', borderRadius: 'var(--radius-lg)' }}>
          <h3 style={{ fontSize: '1.1rem', fontWeight: 600, marginBottom: '0.25rem' }}>
            Collection Velocity Trend
          </h3>
          <p style={{ fontSize: '0.825rem', color: 'var(--text-muted)', marginBottom: '1rem' }}>
            Daily cash receipts inflows
          </p>

          <div style={{ height: '260px', width: '100%' }}>
            {data?.dailyTrend && data.dailyTrend.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={data.dailyTrend} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                  <defs>
                    <linearGradient id="payGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#10b981" stopOpacity={0.4} />
                      <stop offset="95%" stopColor="#10b981" stopOpacity={0.0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="var(--border-subtle)" vertical={false} />
                  <XAxis dataKey="date" stroke="var(--text-muted)" fontSize={11} tickLine={false} />
                  <YAxis
                    stroke="var(--text-muted)"
                    fontSize={11}
                    tickLine={false}
                    tickFormatter={(val) => `₹${val}`}
                  />
                  <Tooltip
                    formatter={(val: any) => [`₹${Number(val).toLocaleString()}`, 'Inflow']}
                    contentStyle={{
                      backgroundColor: 'var(--bg-card)',
                      borderColor: 'var(--border-medium)',
                      borderRadius: '8px',
                      color: 'var(--text-primary)',
                    }}
                  />
                  <Area
                    type="monotone"
                    dataKey="amount"
                    stroke="#10b981"
                    strokeWidth={2}
                    fillOpacity={1}
                    fill="url(#payGrad)"
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
                No collection records found
              </div>
            )}
          </div>
        </Card>
      </div>

      {/* Payment Records Table */}
      <ReportTable
        title="Payment Receipts Log"
        subtitle="Individual customer payment entries with transaction details"
        columns={columns}
        data={allPayments}
        searchKey="invoiceNumber"
        searchPlaceholder="Search invoice #, customer or reference..."
        csvFilename="payment-collections-report.csv"
        loading={loading}
      />
    </div>
  );
};
