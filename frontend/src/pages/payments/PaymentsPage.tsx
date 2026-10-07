import React, { useState } from 'react';
import { Card } from '../../components/ui/Card';
import { Badge } from '../../components/ui/Badge';
import { Button } from '../../components/ui/Button';
import { useInvoiceStore, type InvoiceRecord } from '../../store/invoice.store';
import { RecordPaymentModal } from '../../components/invoices/RecordPaymentModal';
import { toast } from 'sonner';
import {
  CreditCard,
  DollarSign,
  TrendingUp,
  Receipt,
  Calendar,
  Search,
  Plus,
} from 'lucide-react';

export const PaymentsPage: React.FC = () => {
  const { invoices, getAllPayments } = useInvoiceStore();
  const allPayments = getAllPayments();

  const [searchTerm, setSearchTerm] = useState('');
  const [selectedMethod, setSelectedMethod] = useState<string>('ALL');
  const [paymentModalInvoice, setPaymentModalInvoice] = useState<InvoiceRecord | null>(null);

  // Aggregated KPIs
  const totalCollected = allPayments.reduce((sum, p) => sum + p.amount, 0);
  const totalOutstanding = invoices.reduce((sum, inv) => sum + (inv.amountDue || 0), 0);
  const paidCount = invoices.filter((inv) => inv.status === 'PAID').length;
  const pendingInvoices = invoices.filter((inv) => (inv.amountDue || 0) > 0);
  const pendingCount = pendingInvoices.length;

  const filteredPayments = allPayments.filter((p) => {
    const matchesSearch =
      p.invoiceNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
      p.customerName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (p.referenceNumber && p.referenceNumber.toLowerCase().includes(searchTerm.toLowerCase()));

    const matchesMethod = selectedMethod === 'ALL' || p.paymentMethod === selectedMethod;

    return matchesSearch && matchesMethod;
  });

  const handleRecordPaymentClick = () => {
    if (pendingInvoices.length === 0) {
      toast.info('All invoices are fully paid! No outstanding balances.');
      return;
    }
    // Open payment modal for the first pending invoice
    setPaymentModalInvoice(pendingInvoices[0]);
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <h1>Payment Management & Tracking</h1>
          <p>Real-time cash flow, customer collections, payment receipts, and outstanding dues</p>
        </div>
        <Button
          variant="primary"
          icon={<Plus size={16} />}
          onClick={handleRecordPaymentClick}
        >
          Record Payment
        </Button>
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
            100% settled transactions
          </div>
        </Card>

        <Card>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
            <div>
              <span style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>Pending Settlement</span>
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

      {/* Pending Invoices Awaiting Settlement */}
      {pendingInvoices.length > 0 && (
        <Card title={`Pending Invoices Awaiting Settlement (${pendingInvoices.length})`}>
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', minWidth: '750px' }}>
              <thead>
                <tr style={{ borderBottom: '1px solid var(--border-subtle)', color: 'var(--text-secondary)', fontSize: '0.85rem' }}>
                  <th style={{ padding: '0.85rem 0.75rem' }}>Invoice #</th>
                  <th style={{ padding: '0.85rem 0.75rem' }}>Customer</th>
                  <th style={{ padding: '0.85rem 0.75rem' }}>Due Date</th>
                  <th style={{ padding: '0.85rem 0.75rem', textAlign: 'right' }}>Total (₹)</th>
                  <th style={{ padding: '0.85rem 0.75rem', textAlign: 'right' }}>Amount Due (₹)</th>
                  <th style={{ padding: '0.85rem 0.75rem' }}>Status</th>
                  <th style={{ padding: '0.85rem 0.75rem', textAlign: 'right' }}>Action</th>
                </tr>
              </thead>
              <tbody>
                {pendingInvoices.map((inv) => (
                  <tr key={inv.id} style={{ borderBottom: '1px solid var(--border-subtle)' }}>
                    <td style={{ padding: '0.85rem 0.75rem', fontWeight: 600, color: 'var(--primary-500)' }}>
                      {inv.invoiceNumber}
                    </td>
                    <td style={{ padding: '0.85rem 0.75rem', fontWeight: 500 }}>
                      {inv.customerName}
                    </td>
                    <td style={{ padding: '0.85rem 0.75rem', fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
                      {inv.dueDate}
                    </td>
                    <td style={{ padding: '0.85rem 0.75rem', textAlign: 'right', fontWeight: 500 }}>
                      ₹{inv.totalAmount.toFixed(2)}
                    </td>
                    <td style={{ padding: '0.85rem 0.75rem', textAlign: 'right', fontWeight: 700, color: 'var(--warning)' }}>
                      ₹{inv.amountDue.toFixed(2)}
                    </td>
                    <td style={{ padding: '0.85rem 0.75rem' }}>
                      <Badge variant={inv.status === 'PARTIALLY_PAID' ? 'warning' : 'danger'}>
                        {inv.status.replace('_', ' ')}
                      </Badge>
                    </td>
                    <td style={{ padding: '0.85rem 0.75rem', textAlign: 'right' }}>
                      <Button
                        size="sm"
                        variant="primary"
                        icon={<CreditCard size={14} />}
                        onClick={() => setPaymentModalInvoice(inv)}
                      >
                        Record Payment
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      )}

      {/* Payment Ledger Section */}
      <Card
        title="Recorded Payments Ledger"
        action={
          <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center', flexWrap: 'wrap' }}>
            {/* Search */}
            <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
              <Search
                size={14}
                color="var(--text-muted)"
                style={{ position: 'absolute', left: '0.6rem', pointerEvents: 'none' }}
              />
              <input
                type="text"
                placeholder="Search invoice or client..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                style={{
                  padding: '0.45rem 0.8rem 0.45rem 2rem',
                  fontSize: '0.85rem',
                  width: '210px',
                  background: 'var(--bg-app)',
                  border: '1px solid var(--border-medium)',
                  borderRadius: 'var(--radius-md)',
                  color: 'var(--text-primary)',
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
                background: 'var(--bg-app)',
                border: '1px solid var(--border-medium)',
                borderRadius: 'var(--radius-md)',
                color: 'var(--text-primary)',
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
              Record payments against invoices on this page or the Invoices page to view the ledger history here.
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

      {/* Record Payment Modal */}
      <RecordPaymentModal
        invoice={paymentModalInvoice}
        isOpen={!!paymentModalInvoice}
        onClose={() => setPaymentModalInvoice(null)}
      />
    </div>
  );
};
