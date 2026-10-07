import React, { useEffect, useState } from 'react';
import { useOutletContext } from 'react-router-dom';
import {
  DollarSign,
  TrendingUp,
  Percent,
  Coins,
  Info,
} from 'lucide-react';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
} from 'recharts';
import type { ReportsContextType } from './ReportsLayout';
import { fetchProfitReport, type ProfitReportData } from '../../api/reports.api';
import { ReportKPICard } from '../../components/reports/ReportKPICard';
import { ReportTable, type Column } from '../../components/reports/ReportTable';
import { Card } from '../../components/ui/Card';

export const ProfitReport: React.FC = () => {
  const { filter } = useOutletContext<ReportsContextType>();
  const [data, setData] = useState<ProfitReportData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let mounted = true;
    setLoading(true);
    fetchProfitReport(filter)
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

  const columns: Column<any>[] = [
    { key: 'date', header: 'Date' },
    {
      key: 'revenue',
      header: 'Sales Revenue',
      render: (row) => formatCurrency(row.revenue || 0),
    },
    {
      key: 'cogs',
      header: 'COGS (Cost)',
      render: (row) => (
        <span style={{ color: 'var(--danger)' }}>
          {formatCurrency(row.cogs || 0)}
        </span>
      ),
    },
    {
      key: 'grossProfit',
      header: 'Gross Profit',
      render: (row) => (
        <span style={{ fontWeight: 600, color: (row.grossProfit || 0) >= 0 ? 'var(--success)' : 'var(--danger)' }}>
          {formatCurrency(row.grossProfit || 0)}
        </span>
      ),
    },
    {
      key: 'margin',
      header: 'Margin %',
      render: (row) => {
        const pct = row.revenue > 0 ? ((row.grossProfit / row.revenue) * 100).toFixed(1) : '0.0';
        return <span style={{ fontWeight: 600 }}>{pct}%</span>;
      },
    },
  ];

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      {/* Informational banner if cost snapshot data is estimated */}
      {data?.hasIncompleteCost && (
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '0.75rem',
            padding: '0.85rem 1.25rem',
            backgroundColor: 'rgba(245, 158, 11, 0.12)',
            borderRadius: 'var(--radius-md)',
            border: '1px solid rgba(245, 158, 11, 0.3)',
            color: 'var(--warning)',
            fontSize: '0.875rem',
          }}
        >
          <Info size={18} />
          <span>
            Some older sales lack a purchase cost snapshot. Current catalog purchase prices are used to provide honest margin estimates.
          </span>
        </div>
      )}

      {/* KPI Cards */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
          gap: '1rem',
        }}
      >
        <ReportKPICard
          title="Gross Revenue"
          value={formatCurrency(data?.revenue || 0)}
          subtitle="Total product turnover"
          icon={TrendingUp}
          variant="primary"
        />
        <ReportKPICard
          title="Cost of Goods (COGS)"
          value={formatCurrency(data?.cogs || 0)}
          subtitle="Inventory acquisition cost"
          icon={Coins}
          variant="danger"
        />
        <ReportKPICard
          title="Gross Profit"
          value={formatCurrency(data?.grossProfit || 0)}
          subtitle="Revenue less direct COGS"
          icon={DollarSign}
          variant="success"
        />
        <ReportKPICard
          title="Gross Margin"
          value={`${(data?.grossMarginPct || 0).toFixed(1)}%`}
          subtitle="Profit efficiency percentage"
          icon={Percent}
          variant="purple"
        />
      </div>

      {/* Chart: Revenue vs Cost Breakdown */}
      <Card style={{ padding: '1.5rem', background: 'var(--bg-card)', borderRadius: 'var(--radius-lg)' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
          <div>
            <h3 style={{ fontSize: '1.1rem', fontWeight: 600 }}>Profitability & Cost Comparison</h3>
            <p style={{ fontSize: '0.825rem', color: 'var(--text-muted)' }}>Revenue vs Cost of Goods Sold across dates</p>
          </div>
        </div>

        <div style={{ height: '320px', width: '100%' }}>
          {data?.byDate && data.byDate.length > 0 ? (
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={data.byDate} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--border-subtle)" vertical={false} />
                <XAxis dataKey="date" stroke="var(--text-muted)" fontSize={12} tickLine={false} />
                <YAxis
                  stroke="var(--text-muted)"
                  fontSize={12}
                  tickLine={false}
                  tickFormatter={(val) => `₹${val}`}
                />
                <Tooltip
                  formatter={(val: any, name: any) => [`₹${Number(val).toLocaleString()}`, name]}
                  contentStyle={{
                    backgroundColor: 'var(--bg-card)',
                    borderColor: 'var(--border-medium)',
                    borderRadius: '8px',
                    color: 'var(--text-primary)',
                  }}
                />
                <Legend />
                <Bar dataKey="revenue" name="Revenue" fill="#6366f1" radius={[4, 4, 0, 0]} />
                <Bar dataKey="cogs" name="COGS (Cost)" fill="#ef4444" radius={[4, 4, 0, 0]} />
                <Bar dataKey="grossProfit" name="Gross Profit" fill="#10b981" radius={[4, 4, 0, 0]} />
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
              No revenue or cost transactions found for this period
            </div>
          )}
        </div>
      </Card>

      {/* Profit by Date Breakdown Table */}
      <ReportTable
        title="Profit & Margins Breakdown"
        subtitle="Daily distribution of revenue, acquisition cost, and gross profit"
        columns={columns}
        data={data?.byDate || []}
        searchKey="date"
        searchPlaceholder="Filter by date..."
        csvFilename="profit-margin-report.csv"
        loading={loading}
      />
    </div>
  );
};
