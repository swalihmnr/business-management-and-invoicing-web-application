import React, { useState } from 'react';
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Modal } from '../../components/ui/Modal';
import { Badge } from '../../components/ui/Badge';
import { Plus, Package, CheckCircle2 } from 'lucide-react';
import { toast } from 'sonner';

interface ProductItem {
  id: string;
  name: string;
  sku: string;
  sellingPrice: number;
  stock: number;
  taxRate: number;
  unit: string;
}

export const ProductsPage: React.FC = () => {
  const [modalOpen, setModalOpen] = useState(false);
  const [products, setProducts] = useState<ProductItem[]>([
    {
      id: '1',
      name: 'Wireless Bluetooth Headset',
      sku: 'SKU-HEADSET-01',
      sellingPrice: 1200,
      stock: 45,
      taxRate: 18,
      unit: 'pcs',
    },
    {
      id: '2',
      name: 'USB-C Fast Charging Cable',
      sku: 'SKU-CABLE-02',
      sellingPrice: 350,
      stock: 8,
      taxRate: 18,
      unit: 'pcs',
    },
  ]);

  // Form states
  const [name, setName] = useState('');
  const [sku, setSku] = useState('');
  const [sellingPrice, setSellingPrice] = useState(0);
  const [stock, setStock] = useState(10);
  const [taxRate, setTaxRate] = useState(18);
  const [unit, setUnit] = useState('pcs');

  const handleCreateProduct = (e: React.FormEvent) => {
    e.preventDefault();
    const newProduct: ProductItem = {
      id: String(Date.now()),
      name,
      sku: sku || `SKU-${Date.now().toString().slice(-4)}`,
      sellingPrice,
      stock,
      taxRate,
      unit,
    };
    setProducts([...products, newProduct]);
    setModalOpen(false);
    setName('');
    setSku('');
    setSellingPrice(0);
    setStock(10);
    toast.success('Product created successfully!', {
      description: `${name} has been added to your catalog.`,
      icon: <CheckCircle2 size={18} color="var(--success)" />,
    });
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <h1>Products & Services</h1>
          <p>Product catalog, SKUs, pricing tiers, and tax rates</p>
        </div>
        <Button
          variant="primary"
          icon={<Plus size={16} />}
          onClick={() => setModalOpen(true)}
        >
          Add Product
        </Button>
      </div>

      {products.length === 0 ? (
        <Card>
          <div style={{ textAlign: 'center', padding: '3rem 1rem' }}>
            <Package size={48} color="var(--text-muted)" style={{ marginBottom: '1rem' }} />
            <h3>Catalog is empty</h3>
            <p style={{ marginTop: '0.5rem', marginBottom: '1.5rem' }}>
              Define products with SKUs and unit prices to add them to sales invoices.
            </p>
            <Button
              variant="secondary"
              icon={<Plus size={16} />}
              onClick={() => setModalOpen(true)}
            >
              Create Product
            </Button>
          </div>
        </Card>
      ) : (
        <Card>
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
              <thead>
                <tr style={{ borderBottom: '1px solid var(--border-subtle)', color: 'var(--text-secondary)', fontSize: '0.85rem' }}>
                  <th style={{ padding: '0.75rem 0.5rem' }}>Product Name</th>
                  <th style={{ padding: '0.75rem 0.5rem' }}>SKU</th>
                  <th style={{ padding: '0.75rem 0.5rem' }}>Price (₹)</th>
                  <th style={{ padding: '0.75rem 0.5rem' }}>Tax Rate</th>
                  <th style={{ padding: '0.75rem 0.5rem' }}>In Stock</th>
                  <th style={{ padding: '0.75rem 0.5rem', textAlign: 'right' }}>Status</th>
                </tr>
              </thead>
              <tbody>
                {products.map((p) => (
                  <tr key={p.id} style={{ borderBottom: '1px solid var(--border-subtle)' }}>
                    <td style={{ padding: '0.85rem 0.5rem', fontWeight: 600 }}>{p.name}</td>
                    <td style={{ padding: '0.85rem 0.5rem', color: 'var(--text-secondary)', fontFamily: 'var(--font-mono)', fontSize: '0.85rem' }}>
                      {p.sku}
                    </td>
                    <td style={{ padding: '0.85rem 0.5rem', fontWeight: 600 }}>₹{p.sellingPrice.toFixed(2)}</td>
                    <td style={{ padding: '0.85rem 0.5rem', color: 'var(--text-muted)' }}>{p.taxRate}% GST</td>
                    <td style={{ padding: '0.85rem 0.5rem' }}>
                      <span style={{ fontWeight: 600 }}>{p.stock}</span> {p.unit}
                    </td>
                    <td style={{ padding: '0.85rem 0.5rem', textAlign: 'right' }}>
                      {p.stock <= 10 ? (
                        <Badge variant="warning">Low Stock</Badge>
                      ) : (
                        <Badge variant="success">In Stock</Badge>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      )}

      {/* Add Product Modal */}
      <Modal isOpen={modalOpen} onClose={() => setModalOpen(false)} title="Create New Product">
        <form onSubmit={handleCreateProduct} style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
          <div>
            <label style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>Product Name *</label>
            <input
              type="text"
              required
              placeholder="e.g. Ergonomic Office Chair"
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
              <label style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>SKU Code</label>
              <input
                type="text"
                placeholder="SKU-CHAIR-01"
                value={sku}
                onChange={(e) => setSku(e.target.value)}
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
              <label style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>Selling Price (₹) *</label>
              <input
                type="number"
                min="0"
                step="0.01"
                required
                value={sellingPrice}
                onChange={(e) => setSellingPrice(parseFloat(e.target.value) || 0)}
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

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '1rem' }}>
            <div>
              <label style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>Initial Stock</label>
              <input
                type="number"
                min="0"
                value={stock}
                onChange={(e) => setStock(parseInt(e.target.value) || 0)}
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
              <label style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>Unit</label>
              <select
                value={unit}
                onChange={(e) => setUnit(e.target.value)}
                style={{
                  width: '100%',
                  marginTop: '0.35rem',
                  padding: '0.65rem 0.8rem',
                  background: 'var(--bg-app)',
                  border: '1px solid var(--border-medium)',
                  borderRadius: 'var(--radius-md)',
                }}
              >
                <option value="pcs">pcs</option>
                <option value="box">box</option>
                <option value="kg">kg</option>
                <option value="ltr">ltr</option>
              </select>
            </div>

            <div>
              <label style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>Tax Rate</label>
              <select
                value={taxRate}
                onChange={(e) => setTaxRate(parseFloat(e.target.value) || 0)}
                style={{
                  width: '100%',
                  marginTop: '0.35rem',
                  padding: '0.65rem 0.8rem',
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
            </div>
          </div>

          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem', marginTop: '0.5rem' }}>
            <Button type="button" variant="secondary" onClick={() => setModalOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" variant="primary">
              Save Product
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
};
