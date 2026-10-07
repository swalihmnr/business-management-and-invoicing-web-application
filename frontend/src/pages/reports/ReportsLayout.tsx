import React, { useState } from 'react';
import { NavLink, Outlet, useLocation } from 'react-router-dom';
import {
  TrendingUp,
  DollarSign,
  Package,
  Layers,
  Users,
  AlertCircle,
  CreditCard,
  Boxes,
  FileSpreadsheet,
} from 'lucide-react';
import { DateRangeFilter } from '../../components/reports/DateRangeFilter';
import type { ReportFilter } from '../../api/reports.api';

export interface ReportsContextType {
  filter: ReportFilter;
  setFilter: React.Dispatch<React.SetStateAction<ReportFilter>>;
}

const navTabs = [
  { path: '/reports/sales', label: 'Sales Summary', icon: TrendingUp },
  { path: '/reports/profit', label: 'Profit & Margins', icon: DollarSign },
  { path: '/reports/products', label: 'Product Sales', icon: Package },
  { path: '/reports/categories', label: 'Categories', icon: Layers },
  { path: '/reports/customers', label: 'Customer Revenue', icon: Users },
  { path: '/reports/receivables', label: 'Receivables & Aging', icon: AlertCircle },
  { path: '/reports/payments', label: 'Payment Collections', icon: CreditCard },
  { path: '/reports/inventory', label: 'Inventory Valuation', icon: Boxes },
];

export const ReportsLayout: React.FC = () => {
  const [filter, setFilter] = useState<ReportFilter>({
    preset: 'this_month',
  });

  const location = useLocation();
  const hideDateFilter = location.pathname.includes('/inventory') || location.pathname.includes('/receivables');

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      {/* Page Title & Intro */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', marginBottom: '0.25rem' }}>
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                width: '36px',
                height: '36px',
                borderRadius: 'var(--radius-md)',
                backgroundColor: 'rgba(99, 102, 241, 0.15)',
                color: 'var(--primary-500)',
              }}
            >
              <FileSpreadsheet size={20} />
            </div>
            <h1 style={{ fontSize: '1.75rem', fontWeight: 700, margin: 0 }}>Business Intelligence & Reports</h1>
          </div>
          <p style={{ margin: 0, fontSize: '0.9rem', color: 'var(--text-secondary)' }}>
            Real-time analytics, profit margins, sales velocity, accounts receivable aging, and inventory valuation
          </p>
        </div>
      </div>

      {/* Date Range Filter Strip (applicable to time-based reports) */}
      {!hideDateFilter && (
        <DateRangeFilter filter={filter} onChange={setFilter} />
      )}

      {/* Report Navigation Tabs */}
      <div
        style={{
          display: 'flex',
          gap: '0.5rem',
          overflowX: 'auto',
          paddingBottom: '0.25rem',
          borderBottom: '1px solid var(--border-subtle)',
        }}
      >
        {navTabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = location.pathname === tab.path;

          return (
            <NavLink
              key={tab.path}
              to={tab.path}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem',
                padding: '0.65rem 1rem',
                fontSize: '0.875rem',
                fontWeight: isActive ? 600 : 500,
                color: isActive ? 'var(--primary-500)' : 'var(--text-secondary)',
                backgroundColor: isActive ? 'rgba(99, 102, 241, 0.08)' : 'transparent',
                borderRadius: 'var(--radius-md)',
                borderBottom: isActive ? '2px solid var(--primary-500)' : '2px solid transparent',
                textDecoration: 'none',
                whiteSpace: 'nowrap',
                transition: 'all 0.15s ease',
              }}
            >
              <Icon size={16} />
              <span>{tab.label}</span>
            </NavLink>
          );
        })}
      </div>

      {/* Nested Report Content */}
      <div>
        <Outlet context={{ filter, setFilter }} />
      </div>
    </div>
  );
};
