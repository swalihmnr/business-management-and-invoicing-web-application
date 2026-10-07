import React, { useState } from 'react';
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { CheckCircle2, Building2 } from 'lucide-react';
import { toast } from 'sonner';

export const SettingsPage: React.FC = () => {
  const [businessName, setBusinessName] = useState('My Commercial Business');
  const [taxNumber, setTaxNumber] = useState('22AAAAA0000A1Z5');
  const [invoicePrefix, setInvoicePrefix] = useState('INV');

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    toast.success('Business settings saved successfully!', {
      description: `Prefix: ${invoicePrefix} • Business: ${businessName}`,
      icon: <CheckCircle2 size={18} color="var(--success)" />,
    });
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem', maxWidth: '800px' }}>
      <div>
        <h1>Business & System Settings</h1>
        <p>Configure company legal details, tax number, currency, and invoice numbering</p>
      </div>

      <Card title="Business Profile">
        <form onSubmit={handleSave} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          <div>
            <label style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>Business Name</label>
            <input
              type="text"
              value={businessName}
              onChange={(e) => setBusinessName(e.target.value)}
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
              <label style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>GST / Tax Number</label>
              <input
                type="text"
                placeholder="22AAAAA0000A1Z5"
                value={taxNumber}
                onChange={(e) => setTaxNumber(e.target.value)}
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
              <label style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>Invoice Prefix</label>
              <input
                type="text"
                value={invoicePrefix}
                onChange={(e) => setInvoicePrefix(e.target.value)}
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
          </div>

          <div style={{ marginTop: '0.5rem' }}>
            <Button type="submit" variant="primary" icon={<Building2 size={16} />}>
              Save Changes
            </Button>
          </div>
        </form>
      </Card>
    </div>
  );
};
