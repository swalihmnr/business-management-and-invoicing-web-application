import React, { useState } from 'react';
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Modal } from '../../components/ui/Modal';
import { Badge } from '../../components/ui/Badge';
import { useProductStore, type ProductItem } from '../../store/product.store';
import { Plus, Package, CheckCircle2, Edit2, Trash2 } from 'lucide-react';
import { toast } from 'sonner';

export const ProductsPage: React.FC = () => {
  const { products, addProduct, updateProduct, deleteProduct } = useProductStore();

  const [modalOpen, setModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<ProductItem | null>(null);

  // Form states
  const [name, setName] = useState('');
  const [sku, setSku] = useState('');
  const [sellingPrice, setSellingPrice] = useState<number>(0);
  const [purchasePrice, setPurchasePrice] = useState<number>(0);
  const [stock, setStock] = useState<number>(10);
  const [taxRate, setTaxRate] = useState<number>(18);
  const [unit, setUnit] = useState<string>('pcs');
  const [category, setCategory] = useState<string>('General');

  // Open modal for creating a new product
  const handleOpenCreateModal = () => {
    setEditingProduct(null);
    setName('');
    setSku(`SKU-${Date.now().toString().slice(-4)}`);
    setSellingPrice(0);
    setPurchasePrice(0);
    setStock(10);
    setTaxRate(18);
    setUnit('pcs');
    setCategory('General');
    setModalOpen(true);
  };

  // Open modal for editing an existing product
  const handleOpenEditModal = (p: ProductItem) => {
    setEditingProduct(p);
    setName(p.name);
    setSku(p.sku);
    setSellingPrice(p.sellingPrice);
    setPurchasePrice(p.purchasePrice || 0);
    setStock(p.stock);
    setTaxRate(p.taxRate);
    setUnit(p.unit);
    setCategory(p.category || 'General');
    setModalOpen(true);
  };

  const handleSaveProduct = (e: React.FormEvent) => {
    e.preventDefault();

    if (editingProduct) {
      // Update existing product
      updateProduct(editingProduct.id, {
        name,
        sku,
        sellingPrice,
        purchasePrice,
        stock,
        taxRate,
        unit,
        category,
      });

      toast.success('Product updated successfully!', {
        description: `${name} has been updated.`,
        icon: <CheckCircle2 size={18} color="var(--success)" />,
      });
    } else {
      // Create new product
      addProduct({
        name,
        sku: sku || `SKU-${Date.now().toString().slice(-4)}`,
        sellingPrice,
        purchasePrice,
        stock,
        taxRate,
        unit,
        category,
      });

      toast.success('Product created successfully!', {
        description: `${name} has been added to your catalog.`,
        icon: <CheckCircle2 size={18} color="var(--success)" />,
      });
    }

    setModalOpen(false);
  };

  const handleDeleteProduct = (p: ProductItem) => {
    if (confirm(`Are you sure you want to delete "${p.name}"?`)) {
      deleteProduct(p.id);
      toast.info(`Product "${p.name}" removed`);
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <h1>Products & Services</h1>
          <p>Product catalog, SKUs, pricing tiers, and stock management</p>
        </div>
        <Button
          variant="primary"
          icon={<Plus size={16} />}
          onClick={handleOpenCreateModal}
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
              onClick={handleOpenCreateModal}
            >
              Create Product
            </Button>
          </div>
        </Card>
      ) : (
        <Card>
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', minWidth: '800px' }}>
              <thead>
                <tr style={{ borderBottom: '1px solid var(--border-subtle)', color: 'var(--text-secondary)', fontSize: '0.85rem' }}>
                  <th style={{ padding: '0.85rem 0.5rem' }}>Product Name</th>
                  <th style={{ padding: '0.85rem 0.5rem' }}>SKU</th>
                  <th style={{ padding: '0.85rem 0.5rem' }}>Category</th>
                  <th style={{ padding: '0.85rem 0.5rem', textAlign: 'right' }}>Price (₹)</th>
                  <th style={{ padding: '0.85rem 0.5rem', textAlign: 'right' }}>GST</th>
                  <th style={{ padding: '0.85rem 0.5rem' }}>Stock</th>
                  <th style={{ padding: '0.85rem 0.5rem' }}>Status</th>
                  <th style={{ padding: '0.85rem 0.5rem', textAlign: 'center' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {products.map((p) => (
                  <tr key={p.id} style={{ borderBottom: '1px solid var(--border-subtle)' }}>
                    <td style={{ padding: '0.85rem 0.5rem', fontWeight: 600 }}>{p.name}</td>
                    <td style={{ padding: '0.85rem 0.5rem', color: 'var(--text-secondary)', fontFamily: 'var(--font-mono)', fontSize: '0.85rem' }}>
                      {p.sku}
                    </td>
                    <td style={{ padding: '0.85rem 0.5rem', color: 'var(--text-muted)', fontSize: '0.85rem' }}>
                      {p.category || 'General'}
                    </td>
                    <td style={{ padding: '0.85rem 0.5rem', fontWeight: 600, textAlign: 'right' }}>
                      ₹{p.sellingPrice.toFixed(2)}
                    </td>
                    <td style={{ padding: '0.85rem 0.5rem', color: 'var(--text-muted)', textAlign: 'right' }}>
                      {p.taxRate}%
                    </td>
                    <td style={{ padding: '0.85rem 0.5rem' }}>
                      <span style={{ fontWeight: 600 }}>{p.stock}</span> {p.unit}
                    </td>
                    <td style={{ padding: '0.85rem 0.5rem' }}>
                      {p.stock <= (p.lowStockThreshold || 10) ? (
                        <Badge variant="warning">Low Stock</Badge>
                      ) : (
                        <Badge variant="success">In Stock</Badge>
                      )}
                    </td>
                    <td style={{ padding: '0.85rem 0.5rem', textAlign: 'center' }}>
                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem' }}>
                        {/* Edit Button */}
                        <button
                          onClick={() => handleOpenEditModal(p)}
                          title="Edit Product"
                          style={{
                            padding: '0.45rem',
                            borderRadius: 'var(--radius-sm)',
                            backgroundColor: 'var(--bg-card)',
                            border: '1px solid var(--border-subtle)',
                            color: 'var(--primary-500)',
                            display: 'flex',
                            alignItems: 'center',
                          }}
                        >
                          <Edit2 size={15} />
                        </button>

                        {/* Delete Button */}
                        <button
                          onClick={() => handleDeleteProduct(p)}
                          title="Delete Product"
                          style={{
                            padding: '0.45rem',
                            borderRadius: 'var(--radius-sm)',
                            backgroundColor: 'var(--bg-card)',
                            border: '1px solid var(--border-subtle)',
                            color: 'var(--danger)',
                            display: 'flex',
                            alignItems: 'center',
                          }}
                        >
                          <Trash2 size={15} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      )}

      {/* Add / Edit Product Modal */}
      <Modal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        title={editingProduct ? `Edit Product — ${editingProduct.name}` : 'Create New Product'}
      >
        <form onSubmit={handleSaveProduct} style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
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
              }}
            />
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
            <div>
              <label style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>SKU Code *</label>
              <input
                type="text"
                required
                placeholder="SKU-CHAIR-01"
                value={sku}
                onChange={(e) => setSku(e.target.value)}
                style={{
                  width: '100%',
                  marginTop: '0.35rem',
                  padding: '0.65rem 0.8rem',
                }}
              />
            </div>

            <div>
              <label style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>Category</label>
              <input
                type="text"
                placeholder="e.g. Electronics, Furniture"
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                style={{
                  width: '100%',
                  marginTop: '0.35rem',
                  padding: '0.65rem 0.8rem',
                }}
              />
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
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
                }}
              />
            </div>

            <div>
              <label style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>Purchase / Cost Price (₹)</label>
              <input
                type="number"
                min="0"
                step="0.01"
                value={purchasePrice}
                onChange={(e) => setPurchasePrice(parseFloat(e.target.value) || 0)}
                style={{
                  width: '100%',
                  marginTop: '0.35rem',
                  padding: '0.65rem 0.8rem',
                }}
              />
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '1rem' }}>
            <div>
              <label style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>Stock Quantity</label>
              <input
                type="number"
                min="0"
                value={stock}
                onChange={(e) => setStock(parseInt(e.target.value) || 0)}
                style={{
                  width: '100%',
                  marginTop: '0.35rem',
                  padding: '0.65rem 0.8rem',
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
                }}
              >
                <option value="pcs">pcs</option>
                <option value="box">box</option>
                <option value="kg">kg</option>
                <option value="ltr">ltr</option>
                <option value="meter">meter</option>
                <option value="set">set</option>
              </select>
            </div>

            <div>
              <label style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>GST Tax Rate</label>
              <select
                value={taxRate}
                onChange={(e) => setTaxRate(parseFloat(e.target.value) || 0)}
                style={{
                  width: '100%',
                  marginTop: '0.35rem',
                  padding: '0.65rem 0.8rem',
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
              {editingProduct ? 'Save Changes' : 'Create Product'}
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
};
