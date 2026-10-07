import React, { useState } from 'react';
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Modal } from '../../components/ui/Modal';
import { Plus, Users, CheckCircle2 } from 'lucide-react';
import { toast } from 'sonner';

interface CustomerItem {
  id: string;
  name: string;
  phone: string;
  email: string;
  taxNumber: string;
}

export const CustomersPage: React.FC = () => {
  const [modalOpen, setModalOpen] = useState(false);
  const [customers, setCustomers] = useState<CustomerItem[]>([]);

  // Form states
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [taxNumber, setTaxNumber] = useState('');

  const handleCreateCustomer = (e: React.FormEvent) => {
    e.preventDefault();
    const newCustomer: CustomerItem = {
      id: String(Date.now()),
      name,
      phone,
      email,
      taxNumber,
    };
    setCustomers([...customers, newCustomer]);
    setModalOpen(false);
    setName('');
    setPhone('');
    setEmail('');
    setTaxNumber('');
    toast.success('Customer added successfully!', {
      description: `${name} has been added to your client list.`,
      icon: <CheckCircle2 size={18} color="var(--success)" />,
    });
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <h1>Customers</h1>
          <p>Client directory, address records, tax IDs, and billing balances</p>
        </div>
        <Button
          variant="primary"
          icon={<Plus size={16} />}
          onClick={() => setModalOpen(true)}
        >
          Add Customer
        </Button>
      </div>

      {customers.length === 0 ? (
        <Card>
          <div style={{ textAlign: 'center', padding: '3rem 1rem' }}>
            <Users size={48} color="var(--text-muted)" style={{ marginBottom: '1rem' }} />
            <h3>No customers found</h3>
            <p style={{ marginTop: '0.5rem', marginBottom: '1.5rem' }}>
              Add your clients to issue invoices and track individual receivables.
            </p>
            <Button
              variant="secondary"
              icon={<Plus size={16} />}
              onClick={() => setModalOpen(true)}
            >
              Add First Customer
            </Button>
          </div>
        </Card>
      ) : (
        <Card>
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
              <thead>
                <tr style={{ borderBottom: '1px solid var(--border-subtle)', color: 'var(--text-secondary)', fontSize: '0.85rem' }}>
                  <th style={{ padding: '0.75rem 0.5rem' }}>Customer Name</th>
                  <th style={{ padding: '0.75rem 0.5rem' }}>Phone</th>
                  <th style={{ padding: '0.75rem 0.5rem' }}>Email</th>
                  <th style={{ padding: '0.75rem 0.5rem' }}>GST / Tax ID</th>
                  <th style={{ padding: '0.75rem 0.5rem', textAlign: 'right' }}>Outstanding</th>
                </tr>
              </thead>
              <tbody>
                {customers.map((c) => (
                  <tr key={c.id} style={{ borderBottom: '1px solid var(--border-subtle)' }}>
                    <td style={{ padding: '0.85rem 0.5rem', fontWeight: 600 }}>{c.name}</td>
                    <td style={{ padding: '0.85rem 0.5rem', color: 'var(--text-secondary)' }}>{c.phone || '—'}</td>
                    <td style={{ padding: '0.85rem 0.5rem', color: 'var(--text-secondary)' }}>{c.email || '—'}</td>
                    <td style={{ padding: '0.85rem 0.5rem', color: 'var(--text-muted)' }}>{c.taxNumber || '—'}</td>
                    <td style={{ padding: '0.85rem 0.5rem', textAlign: 'right', color: 'var(--success)', fontWeight: 600 }}>₹0.00</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      )}

      {/* Add Customer Modal */}
      <Modal isOpen={modalOpen} onClose={() => setModalOpen(false)} title="Add New Customer">
        <form onSubmit={handleCreateCustomer} style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
          <div>
            <label style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>Customer / Company Name *</label>
            <input
              type="text"
              required
              placeholder="e.g. Acme Tech Solutions"
              value={name}
              onChange={(e) => setName(e.target.value)}
              style={{
                width: '100%',
                marginTop: '0.35rem',
                padding: '0.65rem 0.8rem',
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
                placeholder="+91 98765 00000"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                style={{
                  width: '100%',
                  marginTop: '0.35rem',
                  padding: '0.65rem 0.8rem',
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
                placeholder="27AAAAA0000A1Z5"
                value={taxNumber}
                onChange={(e) => setTaxNumber(e.target.value)}
                style={{
                  width: '100%',
                  marginTop: '0.35rem',
                  padding: '0.65rem 0.8rem',
                  background: 'var(--bg-app)',
                  border: '1px solid var(--border-medium)',
                  borderRadius: 'var(--radius-md)',
                }}
              />
            </div>
          </div>

          <div>
            <label style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>Email Address</label>
            <input
              type="email"
              placeholder="billing@acme.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              style={{
                width: '100%',
                marginTop: '0.35rem',
                padding: '0.65rem 0.8rem',
                background: 'var(--bg-app)',
                border: '1px solid var(--border-medium)',
                borderRadius: 'var(--radius-md)',
              }}
            />
          </div>

          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem', marginTop: '0.5rem' }}>
            <Button type="button" variant="secondary" onClick={() => setModalOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" variant="primary">
              Save Customer
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
};
