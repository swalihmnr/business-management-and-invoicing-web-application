import React, { useEffect, useState } from 'react';
import { useOutletContext } from 'react-router-dom';
import { Users, TrendingUp, AlertCircle, CreditCard } from 'lucide-react';
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
import { fetchCustomerReport, type CustomerReportItem } from '../../api/reports.api';
import { ReportKPICard } from '../../components/reports/ReportKPICard';
import { ReportTable, type Column } from '../../components/reports/ReportTable';
import { Card } from '../../components/ui/Card';

export const CustomerReport: React.FC = () => {
  const { filter } = useOutletContext<ReportsContextType>();
  const [data, setData] = useState<CustomerReportItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let mounted = true;
    setLoading(true);
    fetchCustomerReport(filter)
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

  const totalBilled = data.reduce((s, c) => s + c.totalPurchased, 0);
  const totalPaid = data.reduce((s, c) => s + c.totalPaid, 0);
  const totalDue = data.reduce((s, c) => s + c.amountDue, 0);
  const activeCustomers = data.length;

  // Chart data: top 7 customers by spend
  const chartData = data.slice(0, 7).map((c) => ({
    name: c.customerName.length > 15 ? c.customerName.slice(0, 13) + '...' : c.customerName,
    billed: c.totalPurchased,
    paid: c.totalPaid,
  }));

  const columns: Column<CustomerReportItem>[] = [
    {
      key: 'customerName',
      header: 'Customer',
      render: (row) => (
        <div>
          <div style={{ fontWeight: 600, color: 'var(--text-primary)' }}>{row.customerName}</div>
          <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{row.customerPhone}</div>
        </div>
      ),
    },
    {
      key: 'invoiceCount',
      header: 'Invoices',
      align: 'right',
      render: (row) => row.invoiceCount,
    },
    {
      key: 'totalPurchased',
      header: 'Total Billed',
      align: 'right',
      render: (row) => (
        <span style={{ fontWeight: 600, color: 'var(--primary-500)' }}>
          {formatCurrency(row.totalPurchased)}
        </span>
      ),
    },
    {
      key: 'totalPaid',
      header: 'Total Paid',
      align: 'right',
      render: (row) => (
        <span style={{ color: 'var(--success)' }}>
          {formatCurrency(row.totalPaid)}
        </span>
      ),
    },
    {
      key: 'amountDue',
      header: 'Outstanding Due',
      align: 'right',
      render: (row) => (
        <span style={{ fontWeight: 600, color: row.amountDue > 0 ? 'var(--danger)' : 'var(--text-muted)' }}>
          {formatCurrency(row.amountDue)}
        </span>
      ),
    },
    {
      key: 'avgOrderValue',
      header: 'Avg. Order',
      align: 'right',
      render: (row) => formatCurrency(row.avgOrderValue),
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
          title="Total Billed Revenue"
          value={formatCurrency(totalBilled)}
          subtitle="Cumulative customer spend"
          icon={TrendingUp}
          variant="primary"
        />
        <ReportKPICard
          title="Active Accounts"
          value={activeCustomers}
          subtitle="Customers invoiced in period"
          icon={Users}
          variant="purple"
        />
        <ReportKPICard
          title="Collections Realized"
          value={formatCurrency(totalPaid)}
          subtitle="Total payments collected"
          icon={CreditCard}
          variant="success"
        />
        <ReportKPICard
          title="Receivables Pending"
          value={formatCurrency(totalDue)}
          subtitle="Uncollected customer balances"
          icon={AlertCircle}
          variant="danger"
        />
      </div>

      {/* Top Customers Comparison Chart */}
      <Card style={{ padding: '1.5rem', background: 'var(--bg-card)', borderRadius: 'var(--radius-lg)' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
          <div>
            <h3 style={{ fontSize: '1.1rem', fontWeight: 600 }}>Top Customers by Revenue</h3>
            <p style={{ fontSize: '0.825rem', color: 'var(--text-muted)' }}>Comparison of total invoiced volume versus collections realized</p>
          </div>
        </div>

        <div style={{ height: '300px', width: '100%' }}>
          {chartData.length > 0 ? (
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartData} margin={{ top: 10, right: 10, left: 0, bottom: 20 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--border-subtle)" vertical={false} />
                <XAxis dataKey="name" stroke="var(--text-muted)" fontSize={11} interval={0} angle={-15} textAnchor="end" />
                <YAxis
                  stroke="var(--text-muted)"
                  fontSize={12}
                  tickLine={false}
                  tickFormatter={(val) => `₹${val}`}
                />
                <Tooltip
                  formatter={(val: any, name: any) => [`₹${Number(val).toLocaleString()}`, name === 'billed' ? 'Billed' : 'Paid']}
                  contentStyle={{
                    backgroundColor: 'var(--bg-card)',
                    borderColor: 'var(--border-medium)',
                    borderRadius: '8px',
                    color: 'var(--text-primary)',
                  }}
                />
                <Bar dataKey="billed" name="Billed" fill="#6366f1" radius={[4, 4, 0, 0]} />
                <Bar dataKey="paid" name="Paid" fill="#10b981" radius={[4, 4, 0, 0]} />
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
              No customer invoices in this period
            </div>
          )}
        </div>
      </Card>

      {/* Detailed Customer Table */}
      <ReportTable
        title="Customer Revenue & Accounts Breakdown"
        subtitle="Individual customer financial history, billing records, and outstanding balance"
        columns={columns}
        data={data}
        searchKey="customerName"
        searchPlaceholder="Search customer name or phone..."
        csvFilename="customer-revenue-report.csv"
        loading={loading}
      />
    </div>
  );
};
