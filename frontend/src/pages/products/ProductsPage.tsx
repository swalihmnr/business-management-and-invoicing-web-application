import React from 'react';
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Plus, Package } from 'lucide-react';

export const ProductsPage: React.FC = () => {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <h1>Products & Services</h1>
          <p>Product catalog, SKUs, pricing tiers, and tax rates</p>
        </div>
        <Button variant="primary" icon={<Plus size={16} />}>
          Add Product
        </Button>
      </div>

      <Card>
        <div style={{ textAlign: 'center', padding: '3rem 1rem' }}>
          <Package size={48} color="var(--text-muted)" style={{ marginBottom: '1rem' }} />
          <h3>Catalog is empty</h3>
          <p style={{ marginTop: '0.5rem', marginBottom: '1.5rem' }}>
            Define products with SKUs and unit prices to add them to sales invoices.
          </p>
          <Button variant="secondary" icon={<Plus size={16} />}>
            Create Product
          </Button>
        </div>
      </Card>
    </div>
  );
};
