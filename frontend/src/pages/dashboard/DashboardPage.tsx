import React, { useEffect, useState } from 'react';
import {
  TrendingUp,
  Receipt,
  Users,
  AlertTriangle,
  Plus,
  ArrowUpRight,
  Server,
  CreditCard,
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Badge } from '../../components/ui/Badge';
import { apiClient } from '../../api/axios';
import { useInvoiceStore } from '../../store/invoice.store';
import { useProductStore } from '../../store/product.store';

export const DashboardPage: React.FC = () => {
  const navigate = useNavigate();
  const { invoices } = useInvoiceStore();
  const { products } = useProductStore();

  const [healthStatus, setHealthStatus] = useState<string>('Checking...');
  const [dbStatus] = useState<string>('PostgreSQL 17 (Port 5433)');

  // Dynamic Metrics
  const totalSales = invoices.reduce((sum, inv) => sum + inv.totalAmount, 0);
  const outstandingBalance = invoices.reduce((sum, inv) => sum + (inv.amountDue || 0), 0);
  const unpaidInvoices = invoices.filter((inv) => inv.status !== 'PAID').length;
  const lowStockCount = products.filter((p) => p.stock <= (p.lowStockThreshold || 10)).length;

  useEffect(() => {
    apiClient
      .get('/health')
      .then((res) => {
        if (res.data?.success) {
          setHealthStatus('Online • Healthy');
        }
      })
      .catch(() => {
        setHealthStatus('Offline (Backend starting...)');
      });
  }, []);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
      {/* Header bar */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: '1rem',
        }}
      >
        <div>
          <h1 style={{ marginBottom: '0.25rem' }}>Business Overview</h1>
          <p>Real-time operations, daily revenue, and invoice tracking</p>
        </div>

        <div style={{ display: 'flex', gap: '0.75rem' }}>
          <Button
            variant="secondary"
            icon={<Plus size={16} />}
            onClick={() => navigate('/customers')}
          >
            New Customer
          </Button>
          <Button
            variant="primary"
            icon={<Plus size={16} />}
            onClick={() => navigate('/invoices/new')}
          >
            Create Invoice
          </Button>
        </div>
      </div>

      {/* KPI Stats Grid */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))',
          gap: '1.25rem',
        }}
      >
        {/* Total Invoiced Sales */}
        <Card>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
            <div>
              <span style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>Total Invoiced Sales</span>
              <h2 style={{ fontSize: '1.75rem', marginTop: '0.35rem', color: 'var(--text-primary)' }}>
                ₹{totalSales.toFixed(2)}
              </h2>
            </div>
            <div
              style={{
                background: 'rgba(99, 102, 241, 0.12)',
                color: 'var(--primary-400)',
                padding: '0.5rem',
                borderRadius: 'var(--radius-md)',
              }}
            >
              <TrendingUp size={22} />
            </div>
          </div>
          <div style={{ marginTop: '0.75rem', display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.8rem' }}>
            <span style={{ color: 'var(--success)', display: 'flex', alignItems: 'center' }}>
              <ArrowUpRight size={14} /> Active
            </span>
            <span style={{ color: 'var(--text-muted)' }}>from {invoices.length} invoices</span>
          </div>
        </Card>

        {/* Outstanding Receivables */}
        <div style={{ cursor: 'pointer' }} onClick={() => navigate('/payments')}>
          <Card>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
              <div>
                <span style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>Outstanding Balance</span>
                <h2 style={{ fontSize: '1.75rem', marginTop: '0.35rem', color: 'var(--warning)' }}>
                  ₹{outstandingBalance.toFixed(2)}
                </h2>
              </div>
              <div
                style={{
                  background: 'rgba(245, 158, 11, 0.12)',
                  color: 'var(--warning)',
                  padding: '0.5rem',
                  borderRadius: 'var(--radius-md)',
                }}
              >
                <CreditCard size={22} />
              </div>
            </div>
            <div style={{ marginTop: '0.75rem', fontSize: '0.8rem', color: 'var(--primary-500)', fontWeight: 500 }}>
              {unpaidInvoices} unpaid / partial invoices • View Payments →
            </div>
          </Card>
        </div>

        {/* Active Products */}
        <div style={{ cursor: 'pointer' }} onClick={() => navigate('/products')}>
          <Card>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
              <div>
                <span style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>Catalog Items</span>
                <h2 style={{ fontSize: '1.75rem', marginTop: '0.35rem', color: 'var(--text-primary)' }}>
                  {products.length}
                </h2>
              </div>
              <div
                style={{
                  background: 'rgba(16, 185, 129, 0.12)',
                  color: 'var(--success)',
                  padding: '0.5rem',
                  borderRadius: 'var(--radius-md)',
                }}
              >
                <Users size={22} />
              </div>
            </div>
            <div style={{ marginTop: '0.75rem', fontSize: '0.8rem', color: 'var(--text-muted)' }}>
              Managed products & SKUs
            </div>
          </Card>
        </div>

        {/* Low Stock Warnings */}
        <div style={{ cursor: 'pointer' }} onClick={() => navigate('/products')}>
          <Card>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
              <div>
                <span style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>Low-Stock Warnings</span>
                <h2
                  style={{
                    fontSize: '1.75rem',
                    marginTop: '0.35rem',
                    color: lowStockCount > 0 ? 'var(--danger)' : 'var(--success)',
                  }}
                >
                  {lowStockCount}
                </h2>
              </div>
              <div
                style={{
                  background: lowStockCount > 0 ? 'rgba(239, 68, 68, 0.12)' : 'rgba(16, 185, 129, 0.12)',
                  color: lowStockCount > 0 ? 'var(--danger)' : 'var(--success)',
                  padding: '0.5rem',
                  borderRadius: 'var(--radius-md)',
                }}
              >
                <AlertTriangle size={22} />
              </div>
            </div>
            <div style={{ marginTop: '0.75rem', fontSize: '0.8rem', color: 'var(--text-muted)' }}>
              Items at or below reorder threshold
            </div>
          </Card>
        </div>
      </div>

      {/* System Infrastructure Status Banner */}
      <Card title="System Architecture & Database Status">
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
            gap: '1.5rem',
            paddingTop: '0.5rem',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
            <Server size={28} color="var(--primary-400)" />
            <div>
              <div style={{ fontWeight: 600 }}>Backend REST API</div>
              <div style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
                Express / Node 24 on Port 5000
              </div>
            </div>
            <Badge variant="success">{healthStatus}</Badge>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
            <Server size={28} color="var(--success)" />
            <div>
              <div style={{ fontWeight: 600 }}>PostgreSQL Database</div>
              <div style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
                {dbStatus}
              </div>
            </div>
            <Badge variant="info">Synced</Badge>
          </div>
        </div>
      </Card>
    </div>
  );
};
