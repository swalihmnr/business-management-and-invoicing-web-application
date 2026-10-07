import React, { useState } from 'react';
import { Modal } from '../ui/Modal';
import { Button } from '../ui/Button';
import { useInvoiceStore, type InvoiceRecord, type PaymentMethod } from '../../store/invoice.store';
import { CreditCard, CheckCircle2 } from 'lucide-react';
import { toast } from 'sonner';

interface RecordPaymentModalProps {
  invoice: InvoiceRecord | null;
  isOpen: boolean;
  onClose: () => void;
}

export const RecordPaymentModal: React.FC<RecordPaymentModalProps> = ({
  invoice,
  isOpen,
  onClose,
}) => {
  const recordPayment = useInvoiceStore((s) => s.recordPayment);

  const [amount, setAmount] = useState<number>(invoice?.amountDue ?? 0);
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('UPI');
  const [paymentDate, setPaymentDate] = useState<string>(
    new Date().toISOString().split('T')[0]
  );
  const [referenceNumber, setReferenceNumber] = useState<string>('');
  const [notes, setNotes] = useState<string>('');

  // Synchronize amount when invoice changes
  React.useEffect(() => {
    if (invoice) {
      setAmount(invoice.amountDue > 0 ? invoice.amountDue : invoice.totalAmount);
    }
  }, [invoice]);

  if (!invoice) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (amount <= 0) {
      toast.error('Payment amount must be greater than zero');
      return;
    }

    if (amount > invoice.amountDue + 0.01) {
      toast.error(`Payment cannot exceed remaining balance of ₹${invoice.amountDue.toFixed(2)}`);
      return;
    }

    const recorded = recordPayment(invoice.id, {
      amount,
      paymentDate,
      paymentMethod,
      referenceNumber: referenceNumber || undefined,
      notes: notes || undefined,
    });

    if (recorded) {
      toast.success(`Payment of ₹${amount.toFixed(2)} recorded!`, {
        description: `Invoice ${invoice.invoiceNumber} updated.`,
        icon: <CheckCircle2 size={18} color="var(--success)" />,
      });
      onClose();
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={`Record Payment — ${invoice.invoiceNumber}`}
      maxWidth="520px"
    >
      <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
        {/* Invoice Summary Box */}
        <div
          style={{
            backgroundColor: 'var(--bg-card)',
            padding: '1rem',
            borderRadius: 'var(--radius-md)',
            border: '1px solid var(--border-subtle)',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
          }}
        >
          <div>
            <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Customer</div>
            <div style={{ fontWeight: 600 }}>{invoice.customerName}</div>
          </div>
          <div style={{ textAlign: 'right' }}>
            <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Balance Due</div>
            <div style={{ fontSize: '1.2rem', fontWeight: 700, color: 'var(--warning)' }}>
              ₹{invoice.amountDue.toFixed(2)}
            </div>
          </div>
        </div>

        <div>
          <label style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>Payment Amount (₹) *</label>
          <input
            type="number"
            min="0.01"
            step="0.01"
            max={invoice.amountDue}
            required
            value={amount}
            onChange={(e) => setAmount(parseFloat(e.target.value) || 0)}
            style={{
              width: '100%',
              marginTop: '0.35rem',
              padding: '0.65rem 0.8rem',
              fontSize: '1.1rem',
              fontWeight: 600,
            }}
          />
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
          <div>
            <label style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>Payment Method</label>
            <select
              value={paymentMethod}
              onChange={(e) => setPaymentMethod(e.target.value as PaymentMethod)}
              style={{ width: '100%', marginTop: '0.35rem', padding: '0.65rem 0.8rem' }}
            >
              <option value="UPI">UPI / GPay / PhonePe</option>
              <option value="BANK_TRANSFER">Bank NEFT / RTGS / IMPS</option>
              <option value="CASH">Cash</option>
              <option value="CARD">Credit / Debit Card</option>
              <option value="CHEQUE">Cheque</option>
              <option value="OTHER">Other</option>
            </select>
          </div>

          <div>
            <label style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>Payment Date</label>
            <input
              type="date"
              required
              value={paymentDate}
              onChange={(e) => setPaymentDate(e.target.value)}
              style={{ width: '100%', marginTop: '0.35rem', padding: '0.65rem 0.8rem' }}
            />
          </div>
        </div>

        <div>
          <label style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
            Reference / Transaction Number (Optional)
          </label>
          <input
            type="text"
            placeholder="e.g. UPI/390192839210 or Cheque #10294"
            value={referenceNumber}
            onChange={(e) => setReferenceNumber(e.target.value)}
            style={{ width: '100%', marginTop: '0.35rem', padding: '0.65rem 0.8rem' }}
          />
        </div>

        <div>
          <label style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>Notes</label>
          <input
            type="text"
            placeholder="e.g. Received via GPay from client"
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            style={{ width: '100%', marginTop: '0.35rem', padding: '0.65rem 0.8rem' }}
          />
        </div>

        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem', marginTop: '0.5rem' }}>
          <Button type="button" variant="secondary" onClick={onClose}>
            Cancel
          </Button>
          <Button type="submit" variant="primary" icon={<CreditCard size={16} />}>
            Confirm Payment
          </Button>
        </div>
      </form>
    </Modal>
  );
};
