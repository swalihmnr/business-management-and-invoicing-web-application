import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Badge } from '../../components/ui/Badge';
import { Modal } from '../../components/ui/Modal';
import { InvoiceDocument } from '../../components/invoices/InvoiceDocument';
import { RecordPaymentModal } from '../../components/invoices/RecordPaymentModal';
import { useInvoiceStore, type InvoiceRecord } from '../../store/invoice.store';
import {
  Plus,
  Receipt,
  Eye,
  Trash2,
  Calendar,
  Truck,
  CreditCard,
} from 'lucide-react';
import { toast } from 'sonner';

export const InvoicesPage: React.FC = () => {
  const navigate = useNavigate();
  const { invoices, deleteInvoice } = useInvoiceStore();

  const [selectedInvoice, setSelectedInvoice] = useState<InvoiceRecord | null>(null);
  const [paymentInvoice, setPaymentInvoice] = useState<InvoiceRecord | null>(null);

  const handleDelete = (id: string, invoiceNumber: string) => {
    if (confirm(`Are you sure you want to delete ${invoiceNumber}?`)) {
      deleteInvoice(id);
      toast.info(`Invoice ${invoiceNumber} deleted`);
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <h1>Invoices</h1>
          <p>Create and manage sales invoices, customer shipments, and payment tracking</p>
        </div>
        <Button
          variant="primary"
          icon={<Plus size={16} />}
          onClick={() => navigate('/invoices/new')}
        >
          New Invoice
        </Button>
      </div>

      {invoices.length === 0 ? (
        <Card>
          <div style={{ textAlign: 'center', padding: '3rem 1rem' }}>
            <Receipt size={48} color="var(--text-muted)" style={{ marginBottom: '1rem' }} />
            <h3>No invoices issued yet</h3>
            <p style={{ marginTop: '0.5rem', marginBottom: '1.5rem' }}>
              Invoices generated will appear here with instant PDF export and payment tracking.
            </p>
            <Button
              variant="secondary"
              icon={<Plus size={16} />}
              onClick={() => navigate('/invoices/new')}
            >
              Create your first invoice
            </Button>
          </div>
        </Card>
      ) : (
        <Card>
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', minWidth: '950px' }}>
              <thead>
                <tr style={{ borderBottom: '1px solid var(--border-subtle)', color: 'var(--text-secondary)', fontSize: '0.85rem' }}>
                  <th style={{ padding: '0.85rem 0.75rem' }}>Invoice #</th>
                  <th style={{ padding: '0.85rem 0.75rem' }}>Customer / Bill To</th>
                  <th style={{ padding: '0.85rem 0.75rem' }}>Dispatch / Ship To</th>
                  <th style={{ padding: '0.85rem 0.75rem' }}>Date</th>
                  <th style={{ padding: '0.85rem 0.75rem' }}>Status</th>
                  <th style={{ padding: '0.85rem 0.75rem', textAlign: 'right' }}>Total (₹)</th>
                  <th style={{ padding: '0.85rem 0.75rem', textAlign: 'right' }}>Balance Due (₹)</th>
                  <th style={{ padding: '0.85rem 0.75rem', textAlign: 'center' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {invoices.map((inv) => (
                  <tr key={inv.id} style={{ borderBottom: '1px solid var(--border-subtle)' }}>
                    <td style={{ padding: '0.85rem 0.75rem' }}>
                      <span
                        onClick={() => setSelectedInvoice(inv)}
                        style={{
                          fontWeight: 700,
                          color: 'var(--primary-500)',
                          cursor: 'pointer',
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: '0.35rem',
                        }}
                      >
                        <Receipt size={15} /> {inv.invoiceNumber}
                      </span>
                    </td>
                    <td style={{ padding: '0.85rem 0.75rem' }}>
                      <div style={{ fontWeight: 600 }}>{inv.customerName}</div>
                      {inv.customerPhone && (
                        <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>{inv.customerPhone}</div>
                      )}
                    </td>
                    <td style={{ padding: '0.85rem 0.75rem' }}>
                      <div style={{ fontSize: '0.875rem' }}>{inv.shippingRecipient || inv.customerName}</div>
                      {inv.carrier && (
                        <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                          <Truck size={12} color="var(--primary-500)" /> {inv.carrier}
                        </div>
                      )}
                    </td>
                    <td style={{ padding: '0.85rem 0.75rem', fontSize: '0.875rem', color: 'var(--text-secondary)' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                        <Calendar size={13} color="var(--text-muted)" /> {inv.invoiceDate}
                      </div>
                    </td>
                    <td style={{ padding: '0.85rem 0.75rem' }}>
                      <Badge
                        variant={
                          inv.status === 'PAID'
                            ? 'success'
                            : inv.status === 'PARTIALLY_PAID'
                            ? 'warning'
                            : 'info'
                        }
                      >
                        {inv.status}
                      </Badge>
                    </td>
                    <td style={{ padding: '0.85rem 0.75rem', textAlign: 'right', fontWeight: 600 }}>
                      ₹{inv.totalAmount.toFixed(2)}
                    </td>
                    <td style={{ padding: '0.85rem 0.75rem', textAlign: 'right', fontWeight: 700 }}>
                      <span style={{ color: (inv.amountDue || 0) <= 0 ? 'var(--success)' : 'var(--warning)' }}>
                        ₹{(inv.amountDue || 0).toFixed(2)}
                      </span>
                    </td>
                    <td style={{ padding: '0.85rem 0.75rem', textAlign: 'center' }}>
                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.4rem' }}>
                        {/* Record Payment Button */}
                        {inv.status !== 'PAID' && (
                          <button
                            onClick={() => setPaymentInvoice(inv)}
                            title="Record Payment"
                            style={{
                              padding: '0.45rem',
                              borderRadius: 'var(--radius-sm)',
                              backgroundColor: 'var(--bg-card)',
                              border: '1px solid var(--border-subtle)',
                              color: 'var(--success)',
                              display: 'flex',
                              alignItems: 'center',
                            }}
                          >
                            <CreditCard size={15} />
                          </button>
                        )}

                        {/* View / Print Button */}
                        <button
                          onClick={() => setSelectedInvoice(inv)}
                          title="View / Print Tax Invoice"
                          style={{
                            padding: '0.45rem',
                            borderRadius: 'var(--radius-sm)',
                            backgroundColor: 'var(--bg-card)',
                            border: '1px solid var(--border-subtle)',
                            color: 'var(--text-primary)',
                            display: 'flex',
                            alignItems: 'center',
                          }}
                        >
                          <Eye size={15} />
                        </button>

                        {/* Delete Button */}
                        <button
                          onClick={() => handleDelete(inv.id, inv.invoiceNumber)}
                          title="Delete Invoice"
                          style={{
                            padding: '0.45rem',
                            borderRadius: 'var(--radius-sm)',
                            backgroundColor: 'var(--bg-card)',
                            border: '1px solid var(--border-subtle)',
                            color: 'var(--danger)',
                            display: 'flex',
                            alignItems: 'center',
                          }}
                        >
                          <Trash2 size={15} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      )}

      {/* Invoice Detail / Print Modal */}
      {selectedInvoice && (
        <Modal
          isOpen={!!selectedInvoice}
          onClose={() => setSelectedInvoice(null)}
          title={`Tax Invoice — ${selectedInvoice.invoiceNumber}`}
          maxWidth="900px"
        >
          <InvoiceDocument
            invoice={selectedInvoice}
            onClose={() => setSelectedInvoice(null)}
            onRecordPayment={() => {
              const current = selectedInvoice;
              setSelectedInvoice(null);
              setPaymentInvoice(current);
            }}
          />
        </Modal>
      )}

      {/* Record Payment Modal */}
      {paymentInvoice && (
        <RecordPaymentModal
          invoice={paymentInvoice}
          isOpen={!!paymentInvoice}
          onClose={() => setPaymentInvoice(null)}
        />
      )}
    </div>
  );
};
