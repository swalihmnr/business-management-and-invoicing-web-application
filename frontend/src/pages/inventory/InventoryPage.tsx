import React from 'react';
import { Card } from '../../components/ui/Card';
import { Boxes } from 'lucide-react';

export const InventoryPage: React.FC = () => {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      <div>
        <h1>Inventory Control</h1>
        <p>Real-time stock quantities, low-stock thresholds, and transaction audit trails</p>
      </div>

      <Card>
        <div style={{ textAlign: 'center', padding: '3rem 1rem' }}>
          <Boxes size={48} color="var(--text-muted)" style={{ marginBottom: '1rem' }} />
          <h3>No inventory tracked yet</h3>
          <p style={{ marginTop: '0.5rem' }}>
            Products created in the catalog will appear here with automated stock deductions upon sales.
          </p>
        </div>
      </Card>
    </div>
  );
};
