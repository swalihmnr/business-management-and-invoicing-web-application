import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus, Trash2, ArrowLeft, Receipt, CheckCircle2 } from 'lucide-react';
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { toast } from 'sonner';

interface LineItem {
  id: string;
  name: string;
  quantity: number;
  unitPrice: number;
  taxRate: number;
  discountType: 'FLAT' | 'PERCENTAGE';
  discountValue: number;
}

export const InvoiceCreatePage: React.FC = () => {
  const navigate = useNavigate();

  const [customerName, setCustomerName] = useState('Acme Corporation');
  const [customerPhone, setCustomerPhone] = useState('+91 98765 43210');
  const [customerTaxId, setCustomerTaxId] = useState('27AAPFU0939F1ZV');
  const [invoiceDate, setInvoiceDate] = useState(
    new Date().toISOString().split('T')[0]
  );
  const [dueDate, setDueDate] = useState(
    new Date(Date.now() + 15 * 86400000).toISOString().split('T')[0]
  );
  const [notes, setNotes] = useState('Thank you for your business!');

  const [items, setItems] = useState<LineItem[]>([
    {
      id: '1',
      name: 'Wireless Bluetooth Headset',
      quantity: 2,
      unitPrice: 1200,
      taxRate: 18,
      discountType: 'FLAT',
      discountValue: 100,
    },
    {
      id: '2',
      name: 'USB-C Fast Charging Cable',
      quantity: 4,
      unitPrice: 350,
      taxRate: 18,
      discountType: 'PERCENTAGE',
      discountValue: 5,
    },
  ]);

  const [invoiceDiscountType, setInvoiceDiscountType] = useState<'FLAT' | 'PERCENTAGE'>('FLAT');
  const [invoiceDiscountValue, setInvoiceDiscountValue] = useState(0);

  // Line item math
  const calculateLineTotal = (item: LineItem) => {
    const gross = item.unitPrice * item.quantity;
    let disc = 0;
    if (item.discountType === 'FLAT') {
      disc = Math.min(item.discountValue, gross);
    } else {
      disc = (gross * item.discountValue) / 100;
    }
    const net = gross - disc;
    const tax = (net * item.taxRate) / 100;
    return net + tax;
  };

  // Overall totals
  const subtotal = items.reduce((sum, item) => sum + item.unitPrice * item.quantity, 0);
  const lineDiscounts = items.reduce((sum, item) => {
    const gross = item.unitPrice * item.quantity;
    return (
      sum +
      (item.discountType === 'FLAT'
        ? Math.min(item.discountValue, gross)
        : (gross * item.discountValue) / 100)
    );
  }, 0);

  const totalTax = items.reduce((sum, item) => {
    const gross = item.unitPrice * item.quantity;
    const disc =
      item.discountType === 'FLAT'
        ? Math.min(item.discountValue, gross)
        : (gross * item.discountValue) / 100;
    return sum + ((gross - disc) * item.taxRate) / 100;
  }, 0);

  const netBeforeInvDiscount = subtotal - lineDiscounts;
  const invDiscount =
    invoiceDiscountType === 'FLAT'
      ? Math.min(invoiceDiscountValue, netBeforeInvDiscount)
      : (netBeforeInvDiscount * invoiceDiscountValue) / 100;

  const grandTotal = netBeforeInvDiscount - invDiscount + totalTax;

  const handleAddItem = () => {
    setItems([
      ...items,
      {
        id: String(Date.now()),
        name: 'New Product / Service',
        quantity: 1,
        unitPrice: 500,
        taxRate: 18,
        discountType: 'FLAT',
        discountValue: 0,
      },
    ]);
    toast.success('Line item added');
  };

  const handleRemoveItem = (id: string) => {
    if (items.length <= 1) {
      toast.error('Invoice must contain at least one item');
      return;
    }
    setItems(items.filter((item) => item.id !== id));
  };

  const handleUpdateItem = (id: string, updates: Partial<LineItem>) => {
    setItems(items.map((it) => (it.id === id ? { ...it, ...updates } : it)));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    toast.success('Invoice created successfully! (Preview ready)', {
      description: `Invoice for ${customerName} totalling ₹${grandTotal.toFixed(2)}`,
      icon: <CheckCircle2 size={18} color="var(--success)" />,
    });
    setTimeout(() => {
      navigate('/invoices');
    }, 1200);
  };

  return (
    <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
      {/* Top action header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <button
            type="button"
            onClick={() => navigate('/invoices')}
            style={{
              padding: '0.5rem',
              borderRadius: 'var(--radius-md)',
              background: 'var(--bg-card)',
              color: 'var(--text-secondary)',
              border: '1px solid var(--border-subtle)',
              display: 'flex',
              alignItems: 'center',
            }}
          >
            <ArrowLeft size={18} />
          </button>
          <div>
            <h1 style={{ fontSize: '1.6rem' }}>Create New Invoice</h1>
            <p>Authoritative auto-calculated tax, item discounts, and stock connection</p>
          </div>
        </div>

        <div style={{ display: 'flex', gap: '0.75rem' }}>
          <Button type="button" variant="secondary" onClick={() => navigate('/invoices')}>
            Cancel
          </Button>
          <Button type="submit" variant="primary" icon={<Receipt size={16} />}>
            Save & Generate Invoice
          </Button>
        </div>
      </div>

      {/* Customer & Invoice Meta Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '1.5rem' }}>
        <Card title="Customer Details">
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            <div>
              <label style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>Customer / Business Name</label>
              <input
                type="text"
                value={customerName}
                onChange={(e) => setCustomerName(e.target.value)}
                required
                style={{
                  width: '100%',
                  marginTop: '0.35rem',
                  padding: '0.6rem 0.8rem',
                  background: 'var(--bg-app)',
                  border: '1px solid var(--border-medium)',
                  borderRadius: 'var(--radius-md)',
                }}
              />
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
              <div>
                <label style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>Phone Number</label>
                <input
                  type="text"
                  value={customerPhone}
                  onChange={(e) => setCustomerPhone(e.target.value)}
                  style={{
                    width: '100%',
                    marginTop: '0.35rem',
                    padding: '0.6rem 0.8rem',
                    background: 'var(--bg-app)',
                    border: '1px solid var(--border-medium)',
                    borderRadius: 'var(--radius-md)',
                  }}
                />
              </div>
              <div>
                <label style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>GST / Tax Number</label>
                <input
                  type="text"
                  value={customerTaxId}
                  onChange={(e) => setCustomerTaxId(e.target.value)}
                  style={{
                    width: '100%',
                    marginTop: '0.35rem',
                    padding: '0.6rem 0.8rem',
                    background: 'var(--bg-app)',
                    border: '1px solid var(--border-medium)',
                    borderRadius: 'var(--radius-md)',
                  }}
                />
              </div>
            </div>
          </div>
        </Card>

        <Card title="Invoice Information">
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
            <div>
              <label style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>Invoice Date</label>
              <input
                type="date"
                value={invoiceDate}
                onChange={(e) => setInvoiceDate(e.target.value)}
                required
                style={{
                  width: '100%',
                  marginTop: '0.35rem',
                  padding: '0.6rem 0.8rem',
                  background: 'var(--bg-app)',
                  border: '1px solid var(--border-medium)',
                  borderRadius: 'var(--radius-md)',
                }}
              />
            </div>

            <div>
              <label style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>Payment Due Date</label>
              <input
                type="date"
                value={dueDate}
                onChange={(e) => setDueDate(e.target.value)}
                style={{
                  width: '100%',
                  marginTop: '0.35rem',
                  padding: '0.6rem 0.8rem',
                  background: 'var(--bg-app)',
                  border: '1px solid var(--border-medium)',
                  borderRadius: 'var(--radius-md)',
                }}
              />
            </div>

            <div style={{ gridColumn: 'span 2' }}>
              <label style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>Notes & Terms</label>
              <input
                type="text"
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                style={{
                  width: '100%',
                  marginTop: '0.35rem',
                  padding: '0.6rem 0.8rem',
                  background: 'var(--bg-app)',
                  border: '1px solid var(--border-medium)',
                  borderRadius: 'var(--radius-md)',
                }}
              />
            </div>
          </div>
        </Card>
      </div>

      {/* Items Section */}
      <Card
        title="Line Items"
        action={
          <Button type="button" variant="secondary" onClick={handleAddItem} icon={<Plus size={16} />}>
            Add Item
          </Button>
        }
      >
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', minWidth: '700px' }}>
            <thead>
              <tr style={{ borderBottom: '1px solid var(--border-subtle)', color: 'var(--text-secondary)', fontSize: '0.85rem' }}>
                <th style={{ padding: '0.75rem 0.5rem' }}>Product / Description</th>
                <th style={{ padding: '0.75rem 0.5rem', width: '90px' }}>Qty</th>
                <th style={{ padding: '0.75rem 0.5rem', width: '130px' }}>Unit Price (₹)</th>
                <th style={{ padding: '0.75rem 0.5rem', width: '100px' }}>Tax (%)</th>
                <th style={{ padding: '0.75rem 0.5rem', width: '130px' }}>Discount</th>
                <th style={{ padding: '0.75rem 0.5rem', width: '130px', textAlign: 'right' }}>Total (₹)</th>
                <th style={{ padding: '0.75rem 0.5rem', width: '50px' }}></th>
              </tr>
            </thead>
            <tbody>
              {items.map((item) => (
                <tr key={item.id} style={{ borderBottom: '1px solid var(--border-subtle)' }}>
                  <td style={{ padding: '0.75rem 0.5rem' }}>
                    <input
                      type="text"
                      value={item.name}
                      onChange={(e) => handleUpdateItem(item.id, { name: e.target.value })}
                      required
                      style={{
                        width: '100%',
                        padding: '0.5rem 0.75rem',
                        background: 'var(--bg-app)',
                        border: '1px solid var(--border-medium)',
                        borderRadius: 'var(--radius-md)',
                      }}
                    />
                  </td>
                  <td style={{ padding: '0.75rem 0.5rem' }}>
                    <input
                      type="number"
                      min="1"
                      value={item.quantity}
                      onChange={(e) => handleUpdateItem(item.id, { quantity: Math.max(1, parseInt(e.target.value) || 1) })}
                      style={{
                        width: '100%',
                        padding: '0.5rem',
                        background: 'var(--bg-app)',
                        border: '1px solid var(--border-medium)',
                        borderRadius: 'var(--radius-md)',
                      }}
                    />
                  </td>
                  <td style={{ padding: '0.75rem 0.5rem' }}>
                    <input
                      type="number"
                      min="0"
                      step="0.01"
                      value={item.unitPrice}
                      onChange={(e) => handleUpdateItem(item.id, { unitPrice: parseFloat(e.target.value) || 0 })}
                      style={{
                        width: '100%',
                        padding: '0.5rem',
                        background: 'var(--bg-app)',
                        border: '1px solid var(--border-medium)',
                        borderRadius: 'var(--radius-md)',
                      }}
                    />
                  </td>
                  <td style={{ padding: '0.75rem 0.5rem' }}>
                    <select
                      value={item.taxRate}
                      onChange={(e) => handleUpdateItem(item.id, { taxRate: parseFloat(e.target.value) || 0 })}
                      style={{
                        width: '100%',
                        padding: '0.5rem',
                        background: 'var(--bg-app)',
                        border: '1px solid var(--border-medium)',
                        borderRadius: 'var(--radius-md)',
                      }}
                    >
                      <option value="0">0%</option>
                      <option value="5">5%</option>
                      <option value="12">12%</option>
                      <option value="18">18%</option>
                      <option value="28">28%</option>
                    </select>
                  </td>
                  <td style={{ padding: '0.75rem 0.5rem' }}>
                    <input
                      type="number"
                      min="0"
                      value={item.discountValue}
                      onChange={(e) => handleUpdateItem(item.id, { discountValue: parseFloat(e.target.value) || 0 })}
                      style={{
                        width: '100%',
                        padding: '0.5rem',
                        background: 'var(--bg-app)',
                        border: '1px solid var(--border-medium)',
                        borderRadius: 'var(--radius-md)',
                      }}
                    />
                  </td>
                  <td style={{ padding: '0.75rem 0.5rem', textAlign: 'right', fontWeight: 600 }}>
                    ₹{calculateLineTotal(item).toFixed(2)}
                  </td>
                  <td style={{ padding: '0.75rem 0.5rem', textAlign: 'center' }}>
                    <button
                      type="button"
                      onClick={() => handleRemoveItem(item.id)}
                      style={{ color: 'var(--danger)', padding: '0.4rem', borderRadius: 'var(--radius-sm)' }}
                      title="Remove row"
                    >
                      <Trash2 size={16} />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Calculation summary section */}
        <div style={{ marginTop: '2rem', display: 'flex', justifyContent: 'flex-end' }}>
          <div style={{ width: '100%', maxWidth: '380px', display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', color: 'var(--text-secondary)' }}>
              <span>Subtotal:</span>
              <span style={{ color: 'var(--text-primary)', fontWeight: 500 }}>₹{subtotal.toFixed(2)}</span>
            </div>

            {lineDiscounts > 0 && (
              <div style={{ display: 'flex', justifyContent: 'space-between', color: 'var(--text-secondary)' }}>
                <span>Item Discounts:</span>
                <span style={{ color: 'var(--danger)' }}>-₹{lineDiscounts.toFixed(2)}</span>
              </div>
            )}

            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={{ color: 'var(--text-secondary)' }}>Invoice Discount:</span>
              <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
                <input
                  type="number"
                  min="0"
                  value={invoiceDiscountValue}
                  onChange={(e) => setInvoiceDiscountValue(parseFloat(e.target.value) || 0)}
                  style={{
                    width: '90px',
                    padding: '0.35rem 0.5rem',
                    background: 'var(--bg-app)',
                    border: '1px solid var(--border-medium)',
                    borderRadius: 'var(--radius-md)',
                    textAlign: 'right',
                  }}
                />
                <select
                  value={invoiceDiscountType}
                  onChange={(e) => setInvoiceDiscountType(e.target.value as 'FLAT' | 'PERCENTAGE')}
                  style={{
                    padding: '0.35rem',
                    background: 'var(--bg-app)',
                    border: '1px solid var(--border-medium)',
                    borderRadius: 'var(--radius-md)',
                  }}
                >
                  <option value="FLAT">₹ Flat</option>
                  <option value="PERCENTAGE">%</option>
                </select>
              </div>
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between', color: 'var(--text-secondary)' }}>
              <span>Estimated Tax (GST):</span>
              <span style={{ color: 'var(--text-primary)', fontWeight: 500 }}>+₹{totalTax.toFixed(2)}</span>
            </div>

            <div
              style={{
                marginTop: '0.5rem',
                paddingTop: '0.75rem',
                borderTop: '1px solid var(--border-medium)',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'baseline',
              }}
            >
              <span style={{ fontSize: '1.15rem', fontWeight: 600 }}>Grand Total:</span>
              <span style={{ fontSize: '1.5rem', fontWeight: 700, color: 'var(--primary-400)' }}>
                ₹{grandTotal.toFixed(2)}
              </span>
            </div>

            <div style={{ marginTop: '1rem' }}>
              <Button type="submit" variant="primary" style={{ width: '100%', padding: '0.8rem' }} icon={<Receipt size={18} />}>
                Complete & Issue Invoice
              </Button>
            </div>
          </div>
        </div>
      </Card>
    </form>
  );
};
