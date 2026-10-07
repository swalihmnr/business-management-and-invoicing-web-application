import React from 'react';
import type { InvoiceRecord } from '../../store/invoice.store';
import { Printer, Truck, Building2, CheckCircle2, CreditCard } from 'lucide-react';
import { Button } from '../ui/Button';
import { Badge } from '../ui/Badge';

interface InvoiceDocumentProps {
  invoice: InvoiceRecord;
  onClose?: () => void;
  onRecordPayment?: () => void;
}

export const InvoiceDocument: React.FC<InvoiceDocumentProps> = ({
  invoice,
  onClose,
  onRecordPayment,
}) => {
  const handlePrint = () => {
    window.print();
  };

  const isPaid = invoice.status === 'PAID';
  const isPartial = invoice.status === 'PARTIALLY_PAID';

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      {/* Action Toolbar (Hidden during print) */}
      <div
        className="no-print"
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: '1rem',
          paddingBottom: '1rem',
          borderBottom: '1px solid var(--border-subtle)',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <Badge variant={isPaid ? 'success' : isPartial ? 'warning' : 'info'}>
            {invoice.status}
          </Badge>
          <span style={{ fontSize: '0.9rem', color: 'var(--text-secondary)' }}>
            Invoice ID: {invoice.id}
          </span>
        </div>

        <div style={{ display: 'flex', gap: '0.75rem' }}>
          {!isPaid && onRecordPayment && (
            <Button variant="primary" icon={<CreditCard size={16} />} onClick={onRecordPayment}>
              Record Payment
            </Button>
          )}
          <Button variant="secondary" icon={<Printer size={16} />} onClick={handlePrint}>
            Print / Save PDF
          </Button>
          {onClose && (
            <Button variant="secondary" onClick={onClose}>
              Close Preview
            </Button>
          )}
        </div>
      </div>

      {/* Printable Invoice Container */}
      <div
        id="printable-invoice"
        style={{
          backgroundColor: 'var(--bg-surface)',
          padding: '2.5rem',
          borderRadius: 'var(--radius-lg)',
          border: '1px solid var(--border-medium)',
          boxShadow: 'var(--shadow-sm)',
          display: 'flex',
          flexDirection: 'column',
          gap: '2rem',
        }}
      >
        {/* Document Header */}
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'flex-start',
            borderBottom: '2px solid var(--border-medium)',
            paddingBottom: '1.5rem',
          }}
        >
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.35rem' }}>
              <div
                style={{
                  width: '32px',
                  height: '32px',
                  borderRadius: 'var(--radius-md)',
                  background: 'linear-gradient(135deg, var(--primary-600), var(--primary-800))',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: '#fff',
                }}
              >
                <Building2 size={18} />
              </div>
              <h2 style={{ fontSize: '1.5rem', margin: 0, fontWeight: 700 }}>BizInvoice Commercial HQ</h2>
            </div>
            <p style={{ fontSize: '0.875rem', color: 'var(--text-secondary)', margin: 0 }}>
              Plot 102, Commercial Tech Park, Sector 44
            </p>
            <p style={{ fontSize: '0.875rem', color: 'var(--text-secondary)', margin: 0 }}>
              Bengaluru, Karnataka 560001 • support@bizinvoice.local
            </p>
            <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginTop: '0.25rem' }}>
              GSTIN / Tax ID: <strong>29AABCB2212M1Z8</strong>
            </p>
          </div>

          <div style={{ textAlign: 'right' }}>
            <span
              style={{
                fontSize: '0.8rem',
                letterSpacing: '0.08em',
                fontWeight: 700,
                color: 'var(--primary-500)',
                textTransform: 'uppercase',
              }}
            >
              Tax Invoice
            </span>
            <h1 style={{ fontSize: '2rem', color: 'var(--text-primary)', margin: '0.25rem 0' }}>
              {invoice.invoiceNumber}
            </h1>
            <div style={{ fontSize: '0.875rem', color: 'var(--text-secondary)', display: 'flex', flexDirection: 'column', gap: '0.15rem' }}>
              <div>Date: <strong>{invoice.invoiceDate}</strong></div>
              <div>Due: <strong>{invoice.dueDate}</strong></div>
            </div>
          </div>
        </div>

        {/* Addresses Grid: Bill To & Ship To */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '2rem' }}>
          {/* Bill To */}
          <div
            style={{
              padding: '1.25rem',
              backgroundColor: 'var(--bg-card)',
              borderRadius: 'var(--radius-md)',
              border: '1px solid var(--border-subtle)',
            }}
          >
            <span style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase' }}>
              Billed To
            </span>
            <h3 style={{ fontSize: '1.15rem', marginTop: '0.35rem', marginBottom: '0.25rem' }}>
              {invoice.customerName}
            </h3>
            {invoice.customerTaxId && (
              <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginBottom: '0.5rem' }}>
                GSTIN: <strong>{invoice.customerTaxId}</strong>
              </p>
            )}
            <p style={{ fontSize: '0.875rem', color: 'var(--text-secondary)', margin: 0 }}>
              {invoice.billingAddress || 'Billing Address Not Specified'}
            </p>
            {(invoice.billingCity || invoice.billingState) && (
              <p style={{ fontSize: '0.875rem', color: 'var(--text-secondary)', margin: 0 }}>
                {invoice.billingCity}, {invoice.billingState} {invoice.billingPincode}
              </p>
            )}
            {invoice.customerPhone && (
              <p style={{ fontSize: '0.875rem', color: 'var(--text-secondary)', marginTop: '0.35rem' }}>
                Phone: {invoice.customerPhone}
              </p>
            )}
          </div>

          {/* Ship To */}
          <div
            style={{
              padding: '1.25rem',
              backgroundColor: 'var(--bg-card)',
              borderRadius: 'var(--radius-md)',
              border: '1px solid var(--border-subtle)',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <span style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase' }}>
                Shipped To (Dispatch Destination)
              </span>
              <Truck size={16} color="var(--primary-500)" />
            </div>
            <h3 style={{ fontSize: '1.15rem', marginTop: '0.35rem', marginBottom: '0.25rem' }}>
              {invoice.shippingRecipient || invoice.customerName}
            </h3>
            <p style={{ fontSize: '0.875rem', color: 'var(--text-secondary)', margin: 0 }}>
              {invoice.shippingAddress || invoice.billingAddress || 'Same as billing address'}
            </p>
            {(invoice.shippingCity || invoice.shippingState) && (
              <p style={{ fontSize: '0.875rem', color: 'var(--text-secondary)', margin: 0 }}>
                {invoice.shippingCity}, {invoice.shippingState} {invoice.shippingPincode}
              </p>
            )}
            {invoice.shippingPhone && (
              <p style={{ fontSize: '0.875rem', color: 'var(--text-secondary)', marginTop: '0.25rem' }}>
                Contact: {invoice.shippingPhone}
              </p>
            )}
            {(invoice.carrier || invoice.trackingNumber) && (
              <div
                style={{
                  marginTop: '0.65rem',
                  paddingTop: '0.5rem',
                  borderTop: '1px dashed var(--border-subtle)',
                  fontSize: '0.8rem',
                  color: 'var(--text-muted)',
                }}
              >
                {invoice.carrier && <span>Carrier: <strong>{invoice.carrier}</strong> </span>}
                {invoice.trackingNumber && <span>• Docket: <strong>{invoice.trackingNumber}</strong></span>}
              </div>
            )}
          </div>
        </div>

        {/* Line Items Table */}
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
            <thead>
              <tr style={{ borderBottom: '2px solid var(--border-medium)', fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
                <th style={{ padding: '0.75rem 0.5rem' }}>#</th>
                <th style={{ padding: '0.75rem 0.5rem' }}>Item & Description</th>
                <th style={{ padding: '0.75rem 0.5rem', textAlign: 'center' }}>Qty</th>
                <th style={{ padding: '0.75rem 0.5rem', textAlign: 'right' }}>Unit Price (₹)</th>
                <th style={{ padding: '0.75rem 0.5rem', textAlign: 'right' }}>Tax (GST)</th>
                <th style={{ padding: '0.75rem 0.5rem', textAlign: 'right' }}>Total (₹)</th>
              </tr>
            </thead>
            <tbody>
              {invoice.items.map((item, idx) => (
                <tr key={item.id} style={{ borderBottom: '1px solid var(--border-subtle)', fontSize: '0.9rem' }}>
                  <td style={{ padding: '0.85rem 0.5rem', color: 'var(--text-muted)' }}>{idx + 1}</td>
                  <td style={{ padding: '0.85rem 0.5rem', fontWeight: 600 }}>{item.name}</td>
                  <td style={{ padding: '0.85rem 0.5rem', textAlign: 'center' }}>{item.quantity}</td>
                  <td style={{ padding: '0.85rem 0.5rem', textAlign: 'right' }}>₹{item.unitPrice.toFixed(2)}</td>
                  <td style={{ padding: '0.85rem 0.5rem', textAlign: 'right', color: 'var(--text-muted)' }}>
                    {item.taxRate}%
                  </td>
                  <td style={{ padding: '0.85rem 0.5rem', textAlign: 'right', fontWeight: 600 }}>
                    ₹{item.lineTotal.toFixed(2)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Calculations & Totals Block */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '2rem' }}>
          {/* Notes */}
          <div style={{ flex: 1, minWidth: '260px' }}>
            <span style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase' }}>
              Notes & Terms
            </span>
            <p
              style={{
                fontSize: '0.875rem',
                color: 'var(--text-secondary)',
                marginTop: '0.35rem',
                whiteSpace: 'pre-line',
              }}
            >
              {invoice.notes || 'Payment is requested to be deposited into the specified corporate account.'}
            </p>

            {/* Payment History Log on Document */}
            {invoice.payments && invoice.payments.length > 0 && (
              <div style={{ marginTop: '1.5rem' }}>
                <span style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase' }}>
                  Recorded Payment Receipts
                </span>
                <div style={{ marginTop: '0.5rem', display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
                  {invoice.payments.map((p) => (
                    <div
                      key={p.id}
                      style={{
                        padding: '0.5rem 0.75rem',
                        backgroundColor: 'var(--bg-card)',
                        borderRadius: 'var(--radius-sm)',
                        border: '1px solid var(--border-subtle)',
                        fontSize: '0.8rem',
                        display: 'flex',
                        justifyContent: 'space-between',
                      }}
                    >
                      <span>
                        {p.paymentDate} • <strong>{p.paymentMethod}</strong> {p.referenceNumber ? `(${p.referenceNumber})` : ''}
                      </span>
                      <span style={{ color: 'var(--success)', fontWeight: 600 }}>
                        +₹{p.amount.toFixed(2)}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Financial Breakdown */}
          <div
            style={{
              width: '100%',
              maxWidth: '340px',
              backgroundColor: 'var(--bg-card)',
              padding: '1.25rem',
              borderRadius: 'var(--radius-md)',
              border: '1px solid var(--border-subtle)',
              display: 'flex',
              flexDirection: 'column',
              gap: '0.6rem',
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.875rem' }}>
              <span style={{ color: 'var(--text-secondary)' }}>Subtotal:</span>
              <span style={{ fontWeight: 600 }}>₹{invoice.subtotal.toFixed(2)}</span>
            </div>

            {invoice.lineDiscountAmount > 0 && (
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.875rem', color: 'var(--danger)' }}>
                <span>Item Discounts:</span>
                <span>-₹{invoice.lineDiscountAmount.toFixed(2)}</span>
              </div>
            )}

            {invoice.invoiceDiscountAmount > 0 && (
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.875rem', color: 'var(--danger)' }}>
                <span>Invoice Discount:</span>
                <span>-₹{invoice.invoiceDiscountAmount.toFixed(2)}</span>
              </div>
            )}

            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.875rem' }}>
              <span style={{ color: 'var(--text-secondary)' }}>Estimated GST:</span>
              <span style={{ fontWeight: 600 }}>+₹{invoice.taxAmount.toFixed(2)}</span>
            </div>

            {invoice.shippingCharge > 0 && (
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.875rem' }}>
                <span style={{ color: 'var(--text-secondary)' }}>Shipping & Freight:</span>
                <span style={{ fontWeight: 600 }}>+₹{invoice.shippingCharge.toFixed(2)}</span>
              </div>
            )}

            <div
              style={{
                marginTop: '0.5rem',
                paddingTop: '0.75rem',
                borderTop: '2px solid var(--border-medium)',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'baseline',
              }}
            >
              <span style={{ fontSize: '1rem', fontWeight: 600 }}>Invoice Total:</span>
              <span style={{ fontSize: '1.25rem', fontWeight: 700 }}>
                ₹{invoice.totalAmount.toFixed(2)}
              </span>
            </div>

            {/* Payment Summary */}
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.875rem' }}>
              <span style={{ color: 'var(--text-secondary)' }}>Amount Paid:</span>
              <span style={{ fontWeight: 600, color: 'var(--success)' }}>
                ₹{(invoice.amountPaid || 0).toFixed(2)}
              </span>
            </div>

            <div
              style={{
                paddingTop: '0.5rem',
                borderTop: '1px dashed var(--border-subtle)',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'baseline',
              }}
            >
              <span style={{ fontSize: '1.05rem', fontWeight: 700 }}>Balance Due:</span>
              <span
                style={{
                  fontSize: '1.35rem',
                  fontWeight: 800,
                  color: invoice.amountDue <= 0 ? 'var(--success)' : 'var(--warning)',
                }}
              >
                ₹{(invoice.amountDue || 0).toFixed(2)}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
