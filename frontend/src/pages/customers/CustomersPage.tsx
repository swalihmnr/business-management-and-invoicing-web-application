import React from 'react';
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Plus, Users } from 'lucide-react';

export const CustomersPage: React.FC = () => {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <h1>Customers</h1>
          <p>Client directory, address records, tax IDs, and billing balances</p>
        </div>
        <Button variant="primary" icon={<Plus size={16} />}>
          Add Customer
        </Button>
      </div>

      <Card>
        <div style={{ textAlign: 'center', padding: '3rem 1rem' }}>
          <Users size={48} color="var(--text-muted)" style={{ marginBottom: '1rem' }} />
          <h3>No customers found</h3>
          <p style={{ marginTop: '0.5rem', marginBottom: '1.5rem' }}>
            Add your clients to issue invoices and track individual receivables.
          </p>
          <Button variant="secondary" icon={<Plus size={16} />}>
            Add First Customer
          </Button>
        </div>
      </Card>
    </div>
  );
};
