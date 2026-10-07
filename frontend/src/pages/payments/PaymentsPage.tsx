import React, { useState } from 'react';
import { Card } from '../../components/ui/Card';
import { Badge } from '../../components/ui/Badge';
import { useInvoiceStore, type PaymentMethod } from '../../store/invoice.store';
import {
  CreditCard,
  DollarSign,
  TrendingUp,
  Receipt,
  Calendar,
  Search,
} from 'lucide-react';

export const PaymentsPage: React.FC = () => {
  const { invoices, getAllPayments } = useInvoiceStore();
  const allPayments = getAllPayments();

  const [searchTerm, setSearchTerm] = useState('');
  const [selectedMethod, setSelectedMethod] = useState<string>('ALL');

  // Aggregated KPIs
  const totalCollected = allPayments.reduce((sum, p) => sum + p.amount, 0);
  const totalOutstanding = invoices.reduce((sum, inv) => sum + (inv.amountDue || 0), 0);
  const paidCount = invoices.filter((inv) => inv.status === 'PAID').length;
  const pendingCount = invoices.filter((inv) => inv.status !== 'PAID').length;

  const filteredPayments = allPayments.filter((p) => {
    const matchesSearch =
      p.invoiceNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
      p.customerName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (p.referenceNumber && p.referenceNumber.toLowerCase().includes(searchTerm.toLowerCase()));

    const matchesMethod = selectedMethod === 'ALL' || p.paymentMethod === selectedMethod;

    return matchesSearch && matchesMethod;
  });

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
      {/* Header */}
      <div>
        <h1>Payment Management</h1>
        <p>Real-time cash flow, customer collections, payment receipts, and outstanding dues</p>
      </div>

      {/* Financial Health KPIs */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))',
          gap: '1.25rem',
        }}
      >
        <Card>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
            <div>
              <span style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>Total Collections Received</span>
              <h2 style={{ fontSize: '1.75rem', marginTop: '0.35rem', color: 'var(--success)' }}>
                ₹{totalCollected.toFixed(2)}
              </h2>
            </div>
            <div
              style={{
                background: 'var(--success-bg)',
                color: 'var(--success)',
                padding: '0.5rem',
                borderRadius: 'var(--radius-md)',
              }}
            >
              <TrendingUp size={22} />
            </div>
          </div>
          <div style={{ marginTop: '0.75rem', fontSize: '0.8rem', color: 'var(--text-muted)' }}>
            Across {allPayments.length} recorded payments
          </div>
        </Card>

        <Card>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
            <div>
              <span style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>Total Outstanding Receivables</span>
              <h2 style={{ fontSize: '1.75rem', marginTop: '0.35rem', color: 'var(--warning)' }}>
                ₹{totalOutstanding.toFixed(2)}
              </h2>
            </div>
            <div
              style={{
                background: 'var(--warning-bg)',
                color: 'var(--warning)',
                padding: '0.5rem',
                borderRadius: 'var(--radius-md)',
              }}
            >
              <DollarSign size={22} />
            </div>
          </div>
          <div style={{ marginTop: '0.75rem', fontSize: '0.8rem', color: 'var(--text-muted)' }}>
            Pending balance from {pendingCount} open invoices
          </div>
        </Card>

        <Card>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
            <div>
              <span style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>Fully Paid Invoices</span>
              <h2 style={{ fontSize: '1.75rem', marginTop: '0.35rem', color: 'var(--text-primary)' }}>
                {paidCount}
              </h2>
            </div>
            <div
              style={{
                background: 'rgba(99, 102, 241, 0.12)',
                color: 'var(--primary-500)',
                padding: '0.5rem',
                borderRadius: 'var(--radius-md)',
              }}
            >
              <Receipt size={22} />
            </div>
          </div>
          <div style={{ marginTop: '0.75rem', fontSize: '0.8rem', color: 'var(--text-muted)' }}>
            100% cleared transactions
          </div>
        </Card>

        <Card>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
            <div>
              <span style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>Pending Follow-ups</span>
              <h2 style={{ fontSize: '1.75rem', marginTop: '0.35rem', color: 'var(--danger)' }}>
                {pendingCount}
              </h2>
            </div>
            <div
              style={{
                background: 'var(--danger-bg)',
                color: 'var(--danger)',
                padding: '0.5rem',
                borderRadius: 'var(--radius-md)',
              }}
            >
              <CreditCard size={22} />
            </div>
          </div>
          <div style={{ marginTop: '0.75rem', fontSize: '0.8rem', color: 'var(--text-muted)' }}>
            Awaiting full settlement
          </div>
        </Card>
      </div>

      {/* Payment Ledger Section */}
      <Card
        title="Recorded Payments Ledger"
        action={
          <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center', flexWrap: 'wrap' }}>
            {/* Search */}
            <div style={{ position: 'relative' }}>
              <input
                type="text"
                placeholder="Search invoice or client..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                style={{
                  padding: '0.45rem 0.8rem',
                  fontSize: '0.85rem',
                  width: '200px',
                }}
              />
            </div>

            {/* Method filter */}
            <select
              value={selectedMethod}
              onChange={(e) => setSelectedMethod(e.target.value)}
              style={{
                padding: '0.45rem 0.75rem',
                fontSize: '0.85rem',
              }}
            >
              <option value="ALL">All Payment Methods</option>
              <option value="UPI">UPI</option>
              <option value="BANK_TRANSFER">Bank Transfer</option>
              <option value="CASH">Cash</option>
              <option value="CARD">Card</option>
              <option value="CHEQUE">Cheque</option>
            </select>
          </div>
        }
      >
        {filteredPayments.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '3rem 1rem' }}>
            <CreditCard size={48} color="var(--text-muted)" style={{ marginBottom: '1rem' }} />
            <h3>No payment records found</h3>
            <p style={{ marginTop: '0.5rem', color: 'var(--text-secondary)' }}>
              Record payments against invoices on the Invoices page to view the ledger history here.
            </p>
          </div>
        ) : (
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', minWidth: '750px' }}>
              <thead>
                <tr style={{ borderBottom: '1px solid var(--border-subtle)', color: 'var(--text-secondary)', fontSize: '0.85rem' }}>
                  <th style={{ padding: '0.85rem 0.75rem' }}>Date</th>
                  <th style={{ padding: '0.85rem 0.75rem' }}>Invoice #</th>
                  <th style={{ padding: '0.85rem 0.75rem' }}>Customer</th>
                  <th style={{ padding: '0.85rem 0.75rem' }}>Payment Method</th>
                  <th style={{ padding: '0.85rem 0.75rem' }}>Reference #</th>
                  <th style={{ padding: '0.85rem 0.75rem' }}>Notes</th>
                  <th style={{ padding: '0.85rem 0.75rem', textAlign: 'right' }}>Amount Paid (₹)</th>
                </tr>
              </thead>
              <tbody>
                {filteredPayments.map((p) => (
                  <tr key={p.id} style={{ borderBottom: '1px solid var(--border-subtle)' }}>
                    <td style={{ padding: '0.85rem 0.75rem', fontSize: '0.875rem' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                        <Calendar size={13} color="var(--text-muted)" />
                        {p.paymentDate}
                      </div>
                    </td>
                    <td style={{ padding: '0.85rem 0.75rem', fontWeight: 600, color: 'var(--primary-500)' }}>
                      {p.invoiceNumber}
                    </td>
                    <td style={{ padding: '0.85rem 0.75rem', fontWeight: 500 }}>
                      {p.customerName}
                    </td>
                    <td style={{ padding: '0.85rem 0.75rem' }}>
                      <Badge variant="info">{p.paymentMethod}</Badge>
                    </td>
                    <td style={{ padding: '0.85rem 0.75rem', color: 'var(--text-muted)', fontFamily: 'var(--font-mono)', fontSize: '0.8rem' }}>
                      {p.referenceNumber || '—'}
                    </td>
                    <td style={{ padding: '0.85rem 0.75rem', color: 'var(--text-secondary)', fontSize: '0.85rem' }}>
                      {p.notes || '—'}
                    </td>
                    <td style={{ padding: '0.85rem 0.75rem', textAlign: 'right', fontWeight: 700, color: 'var(--success)' }}>
                      +₹{p.amount.toFixed(2)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Card>
    </div>
  );
};
