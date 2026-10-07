import React from 'react';
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Plus, Receipt } from 'lucide-react';

export const InvoicesPage: React.FC = () => {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <h1>Invoices</h1>
          <p>Create and manage sales invoices, record customer payments</p>
        </div>
        <Button variant="primary" icon={<Plus size={16} />}>
          New Invoice
        </Button>
      </div>

      <Card>
        <div style={{ textAlign: 'center', padding: '3rem 1rem' }}>
          <Receipt size={48} color="var(--text-muted)" style={{ marginBottom: '1rem' }} />
          <h3>No invoices issued yet</h3>
          <p style={{ marginTop: '0.5rem', marginBottom: '1.5rem' }}>
            Invoices generated will appear here with instant PDF export and payment tracking.
          </p>
          <Button variant="secondary" icon={<Plus size={16} />}>
            Create your first invoice
          </Button>
        </div>
      </Card>
    </div>
  );
};
