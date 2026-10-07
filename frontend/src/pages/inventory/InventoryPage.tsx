import React, { useState } from 'react';
import { Card } from '../../components/ui/Card';
import { Badge } from '../../components/ui/Badge';
import { Button } from '../../components/ui/Button';
import { useProductStore, type ProductItem } from '../../store/product.store';
import { toast } from 'sonner';
import {
  Boxes,
  AlertTriangle,
  TrendingDown,
  Package,
  PackagePlus,
  PackageMinus,
  BarChart3,
  Search,
  Filter,
  CheckCircle2,
  XCircle,
} from 'lucide-react';

/* ─── Helpers ────────────────────────────────────────────────── */
const getStockStatus = (product: ProductItem) => {
  if (product.stock === 0) return 'out';
  if (product.stock <= (product.lowStockThreshold ?? 10)) return 'low';
  return 'ok';
};

const StockBadge = ({ product }: { product: ProductItem }) => {
  const status = getStockStatus(product);
  if (status === 'out') return <Badge variant="danger">Out of Stock</Badge>;
  if (status === 'low') return <Badge variant="warning">Low Stock</Badge>;
  return <Badge variant="success">In Stock</Badge>;
};

/* Mini inline stock bar */
const StockBar = ({ product }: { product: ProductItem }) => {
  const threshold = product.lowStockThreshold ?? 10;
  const max = Math.max(product.stock, threshold * 2, 1);
  const pct = Math.min(100, (product.stock / max) * 100);
  const status = getStockStatus(product);
  const color =
    status === 'out' ? 'var(--danger)' : status === 'low' ? 'var(--warning)' : 'var(--success)';
  return (
    <div
      style={{
        height: '6px',
        background: 'var(--border-subtle)',
        borderRadius: '99px',
        overflow: 'hidden',
        width: '80px',
      }}
    >
      <div
        style={{
          height: '100%',
          width: `${pct}%`,
          background: color,
          borderRadius: '99px',
          transition: 'width 0.3s ease',
        }}
      />
    </div>
  );
};

/* Stock adjustment modal */
interface AdjustModalProps {
  product: ProductItem;
  onClose: () => void;
}
const AdjustModal: React.FC<AdjustModalProps> = ({ product, onClose }) => {
  const { updateProduct } = useProductStore();
  const [qty, setQty] = useState(0);
  const [reason, setReason] = useState('');
  const [mode, setMode] = useState<'add' | 'subtract'>('add');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (qty <= 0) {
      toast.error('Quantity must be greater than zero');
      return;
    }
    const newStock =
      mode === 'add'
        ? product.stock + qty
        : Math.max(0, product.stock - qty);

    updateProduct(product.id, { stock: newStock });
    toast.success(
      `${product.name}: stock ${mode === 'add' ? 'increased' : 'reduced'} by ${qty} → now ${newStock} ${product.unit}`,
      { description: reason || undefined }
    );
    onClose();
  };

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        background: 'rgba(0,0,0,0.55)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 1000,
        backdropFilter: 'blur(4px)',
      }}
      onClick={onClose}
    >
      <div
        style={{
          background: 'var(--bg-surface)',
          border: '1px solid var(--border-medium)',
          borderRadius: 'var(--radius-lg)',
          padding: '1.75rem',
          width: '100%',
          maxWidth: '440px',
          boxShadow: 'var(--shadow-xl)',
        }}
        onClick={(e) => e.stopPropagation()}
      >
        <h3 style={{ marginBottom: '0.25rem' }}>Adjust Stock</h3>
        <p style={{ color: 'var(--text-secondary)', fontSize: '0.875rem', marginBottom: '1.25rem' }}>
          {product.name} — current stock: <strong>{product.stock} {product.unit}</strong>
        </p>

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          {/* Mode toggle */}
          <div style={{ display: 'flex', gap: '0.75rem' }}>
            <button
              type="button"
              onClick={() => setMode('add')}
              style={{
                flex: 1,
                padding: '0.6rem',
                borderRadius: 'var(--radius-md)',
                border: `2px solid ${mode === 'add' ? 'var(--success)' : 'var(--border-medium)'}`,
                background: mode === 'add' ? 'var(--success-bg)' : 'var(--bg-card)',
                color: mode === 'add' ? 'var(--success)' : 'var(--text-secondary)',
                fontWeight: 600,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '0.35rem',
                cursor: 'pointer',
                transition: 'all 0.15s',
              }}
            >
              <PackagePlus size={16} /> Add Stock
            </button>
            <button
              type="button"
              onClick={() => setMode('subtract')}
              style={{
                flex: 1,
                padding: '0.6rem',
                borderRadius: 'var(--radius-md)',
                border: `2px solid ${mode === 'subtract' ? 'var(--danger)' : 'var(--border-medium)'}`,
                background: mode === 'subtract' ? 'var(--danger-bg)' : 'var(--bg-card)',
                color: mode === 'subtract' ? 'var(--danger)' : 'var(--text-secondary)',
                fontWeight: 600,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '0.35rem',
                cursor: 'pointer',
                transition: 'all 0.15s',
              }}
            >
              <PackageMinus size={16} /> Remove Stock
            </button>
          </div>

          <div>
            <label style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
              Quantity ({product.unit})
            </label>
            <input
              type="number"
              min={1}
              value={qty || ''}
              onChange={(e) => setQty(Number(e.target.value))}
              placeholder="0"
              required
              style={{
                width: '100%',
                marginTop: '0.35rem',
                padding: '0.6rem 0.8rem',
                background: 'var(--bg-app)',
                border: '1px solid var(--border-medium)',
                borderRadius: 'var(--radius-md)',
                color: 'var(--text-primary)',
                fontSize: '1rem',
              }}
            />
          </div>

          <div>
            <label style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
              Reason / Notes (optional)
            </label>
            <input
              type="text"
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              placeholder="e.g. Restock received, damaged goods, manual correction..."
              style={{
                width: '100%',
                marginTop: '0.35rem',
                padding: '0.6rem 0.8rem',
                background: 'var(--bg-app)',
                border: '1px solid var(--border-medium)',
                borderRadius: 'var(--radius-md)',
                color: 'var(--text-primary)',
              }}
            />
          </div>

          {qty > 0 && (
            <div
              style={{
                padding: '0.75rem 1rem',
                background: mode === 'add' ? 'var(--success-bg)' : 'var(--warning-bg)',
                border: `1px solid ${mode === 'add' ? 'var(--success)' : 'var(--warning)'}`,
                borderRadius: 'var(--radius-md)',
                fontSize: '0.875rem',
                color: mode === 'add' ? 'var(--success)' : 'var(--warning)',
                fontWeight: 500,
              }}
            >
              New stock will be:{' '}
              <strong>
                {mode === 'add' ? product.stock + qty : Math.max(0, product.stock - qty)} {product.unit}
              </strong>
            </div>
          )}

          <div style={{ display: 'flex', gap: '0.75rem', marginTop: '0.25rem' }}>
            <Button type="button" variant="secondary" onClick={onClose} style={{ flex: 1 }}>
              Cancel
            </Button>
            <Button type="submit" variant="primary" style={{ flex: 1 }}>
              Apply Adjustment
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};

/* ─── Main Page ────────────────────────────────────────────────── */
export const InventoryPage: React.FC = () => {
  const { products } = useProductStore();
  const [search, setSearch] = useState('');
  const [filterStatus, setFilterStatus] = useState<'all' | 'low' | 'out' | 'ok'>('all');
  const [filterCategory, setFilterCategory] = useState('all');
  const [adjustProduct, setAdjustProduct] = useState<ProductItem | null>(null);

  /* Derived stats */
  const totalProducts = products.length;
  const totalStockValue = products.reduce(
    (sum, p) => sum + p.stock * (p.purchasePrice ?? p.sellingPrice),
    0
  );
  const outOfStock = products.filter((p) => p.stock === 0);
  const lowStock = products.filter((p) => p.stock > 0 && p.stock <= (p.lowStockThreshold ?? 10));
  const healthyStock = products.filter((p) => p.stock > (p.lowStockThreshold ?? 10));

  /* Categories */
  const categories = ['all', ...Array.from(new Set(products.map((p) => p.category ?? 'Uncategorised')))];

  /* Filtered list */
  const filtered = products.filter((p) => {
    const matchSearch =
      p.name.toLowerCase().includes(search.toLowerCase()) ||
      p.sku.toLowerCase().includes(search.toLowerCase()) ||
      (p.category ?? '').toLowerCase().includes(search.toLowerCase());
    const status = getStockStatus(p);
    const matchStatus = filterStatus === 'all' || status === filterStatus;
    const matchCat = filterCategory === 'all' || (p.category ?? 'Uncategorised') === filterCategory;
    return matchSearch && matchStatus && matchCat;
  });

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <h1>Inventory Control</h1>
          <p>Real-time stock levels, low-stock alerts, and manual adjustment tools</p>
        </div>
      </div>

      {/* KPI Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '1.25rem' }}>
        <Card>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
            <div>
              <span style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>Total Products</span>
              <h2 style={{ fontSize: '1.75rem', marginTop: '0.35rem' }}>{totalProducts}</h2>
            </div>
            <div style={{ background: 'rgba(99,102,241,0.12)', color: 'var(--primary-500)', padding: '0.5rem', borderRadius: 'var(--radius-md)' }}>
              <Boxes size={22} />
            </div>
          </div>
          <div style={{ marginTop: '0.75rem', fontSize: '0.8rem', color: 'var(--text-muted)' }}>
            Across {categories.length - 1} categories
          </div>
        </Card>

        <Card>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
            <div>
              <span style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>Stock Value (Cost)</span>
              <h2 style={{ fontSize: '1.75rem', marginTop: '0.35rem', color: 'var(--success)' }}>
                ₹{totalStockValue.toLocaleString('en-IN', { maximumFractionDigits: 0 })}
              </h2>
            </div>
            <div style={{ background: 'var(--success-bg)', color: 'var(--success)', padding: '0.5rem', borderRadius: 'var(--radius-md)' }}>
              <BarChart3 size={22} />
            </div>
          </div>
          <div style={{ marginTop: '0.75rem', fontSize: '0.8rem', color: 'var(--text-muted)' }}>
            {healthyStock.length} products healthy
          </div>
        </Card>

        <Card>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
            <div>
              <span style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>Low Stock Alerts</span>
              <h2 style={{ fontSize: '1.75rem', marginTop: '0.35rem', color: 'var(--warning)' }}>
                {lowStock.length}
              </h2>
            </div>
            <div style={{ background: 'var(--warning-bg)', color: 'var(--warning)', padding: '0.5rem', borderRadius: 'var(--radius-md)' }}>
              <AlertTriangle size={22} />
            </div>
          </div>
          <div style={{ marginTop: '0.75rem', fontSize: '0.8rem', color: 'var(--text-muted)' }}>
            Below reorder threshold
          </div>
        </Card>

        <Card>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
            <div>
              <span style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>Out of Stock</span>
              <h2 style={{ fontSize: '1.75rem', marginTop: '0.35rem', color: 'var(--danger)' }}>
                {outOfStock.length}
              </h2>
            </div>
            <div style={{ background: 'var(--danger-bg)', color: 'var(--danger)', padding: '0.5rem', borderRadius: 'var(--radius-md)' }}>
              <TrendingDown size={22} />
            </div>
          </div>
          <div style={{ marginTop: '0.75rem', fontSize: '0.8rem', color: 'var(--text-muted)' }}>
            Requires immediate restock
          </div>
        </Card>
      </div>

      {/* Alert Banner — out of stock */}
      {outOfStock.length > 0 && (
        <div
          style={{
            padding: '1rem 1.25rem',
            background: 'var(--danger-bg)',
            border: '1px solid var(--danger)',
            borderRadius: 'var(--radius-lg)',
            display: 'flex',
            alignItems: 'center',
            gap: '0.75rem',
            color: 'var(--danger)',
            fontSize: '0.9rem',
            fontWeight: 500,
          }}
        >
          <XCircle size={20} />
          <div>
            <strong>Out of Stock Alert:</strong>{' '}
            {outOfStock.map((p) => p.name).join(', ')} — Restock immediately to avoid stockout.
          </div>
        </div>
      )}

      {/* Low stock banner */}
      {lowStock.length > 0 && (
        <div
          style={{
            padding: '1rem 1.25rem',
            background: 'var(--warning-bg)',
            border: '1px solid var(--warning)',
            borderRadius: 'var(--radius-lg)',
            display: 'flex',
            alignItems: 'center',
            gap: '0.75rem',
            color: 'var(--warning)',
            fontSize: '0.9rem',
            fontWeight: 500,
          }}
        >
          <AlertTriangle size={20} />
          <div>
            <strong>Low Stock Warning ({lowStock.length} items):</strong>{' '}
            {lowStock.map((p) => `${p.name} (${p.stock} left)`).join(' · ')}
          </div>
        </div>
      )}

      {/* Main Inventory Table */}
      <Card
        title="Stock Register"
        action={
          <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center', flexWrap: 'wrap' }}>
            {/* Search */}
            <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
              <Search size={14} color="var(--text-muted)" style={{ position: 'absolute', left: '0.6rem', pointerEvents: 'none' }} />
              <input
                type="text"
                placeholder="Search product or SKU…"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                style={{
                  padding: '0.45rem 0.8rem 0.45rem 2rem',
                  fontSize: '0.85rem',
                  width: '200px',
                  background: 'var(--bg-app)',
                  border: '1px solid var(--border-medium)',
                  borderRadius: 'var(--radius-md)',
                  color: 'var(--text-primary)',
                }}
              />
            </div>

            {/* Status filter */}
            <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
              <Filter size={14} color="var(--text-muted)" style={{ position: 'absolute', left: '0.6rem', pointerEvents: 'none' }} />
              <select
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value as typeof filterStatus)}
                style={{
                  padding: '0.45rem 0.75rem 0.45rem 2rem',
                  fontSize: '0.85rem',
                  background: 'var(--bg-app)',
                  border: '1px solid var(--border-medium)',
                  borderRadius: 'var(--radius-md)',
                  color: 'var(--text-primary)',
                }}
              >
                <option value="all">All Status</option>
                <option value="ok">In Stock</option>
                <option value="low">Low Stock</option>
                <option value="out">Out of Stock</option>
              </select>
            </div>

            {/* Category filter */}
            <select
              value={filterCategory}
              onChange={(e) => setFilterCategory(e.target.value)}
              style={{
                padding: '0.45rem 0.75rem',
                fontSize: '0.85rem',
                background: 'var(--bg-app)',
                border: '1px solid var(--border-medium)',
                borderRadius: 'var(--radius-md)',
                color: 'var(--text-primary)',
              }}
            >
              {categories.map((c) => (
                <option key={c} value={c}>
                  {c === 'all' ? 'All Categories' : c}
                </option>
              ))}
            </select>
          </div>
        }
      >
        {filtered.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '3rem 1rem' }}>
            <Package size={48} color="var(--text-muted)" style={{ marginBottom: '1rem' }} />
            <h3>No products match your filters</h3>
          </div>
        ) : (
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', minWidth: '900px' }}>
              <thead>
                <tr style={{ borderBottom: '1px solid var(--border-subtle)', color: 'var(--text-secondary)', fontSize: '0.85rem' }}>
                  <th style={{ padding: '0.85rem 0.75rem' }}>Product</th>
                  <th style={{ padding: '0.85rem 0.75rem' }}>SKU</th>
                  <th style={{ padding: '0.85rem 0.75rem' }}>Category</th>
                  <th style={{ padding: '0.85rem 0.75rem', textAlign: 'center' }}>Stock</th>
                  <th style={{ padding: '0.85rem 0.75rem', textAlign: 'center' }}>Level</th>
                  <th style={{ padding: '0.85rem 0.75rem', textAlign: 'center' }}>Threshold</th>
                  <th style={{ padding: '0.85rem 0.75rem', textAlign: 'center' }}>Status</th>
                  <th style={{ padding: '0.85rem 0.75rem', textAlign: 'right' }}>Cost Value (₹)</th>
                  <th style={{ padding: '0.85rem 0.75rem', textAlign: 'right' }}>Selling (₹)</th>
                  <th style={{ padding: '0.85rem 0.75rem', textAlign: 'center' }}>Action</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((p) => {
                  const status = getStockStatus(p);
                  const rowBg =
                    status === 'out'
                      ? 'rgba(239,68,68,0.04)'
                      : status === 'low'
                      ? 'rgba(234,179,8,0.04)'
                      : 'transparent';
                  return (
                    <tr
                      key={p.id}
                      style={{ borderBottom: '1px solid var(--border-subtle)', background: rowBg }}
                    >
                      <td style={{ padding: '0.85rem 0.75rem' }}>
                        <div style={{ fontWeight: 600, color: 'var(--text-primary)', fontSize: '0.875rem' }}>
                          {p.name}
                        </div>
                        {p.description && (
                          <div style={{ fontSize: '0.775rem', color: 'var(--text-muted)', marginTop: '0.15rem', maxWidth: '240px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                            {p.description}
                          </div>
                        )}
                      </td>
                      <td style={{ padding: '0.85rem 0.75rem', fontFamily: 'var(--font-mono)', fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                        {p.sku}
                      </td>
                      <td style={{ padding: '0.85rem 0.75rem' }}>
                        <Badge variant="info">{p.category ?? 'Uncategorised'}</Badge>
                      </td>
                      <td style={{ padding: '0.85rem 0.75rem', textAlign: 'center' }}>
                        <span
                          style={{
                            fontWeight: 700,
                            fontSize: '1rem',
                            color:
                              status === 'out'
                                ? 'var(--danger)'
                                : status === 'low'
                                ? 'var(--warning)'
                                : 'var(--success)',
                          }}
                        >
                          {p.stock}
                        </span>
                        <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginLeft: '0.25rem' }}>{p.unit}</span>
                      </td>
                      <td style={{ padding: '0.85rem 0.75rem', textAlign: 'center' }}>
                        <div style={{ display: 'flex', justifyContent: 'center' }}>
                          <StockBar product={p} />
                        </div>
                      </td>
                      <td style={{ padding: '0.85rem 0.75rem', textAlign: 'center', color: 'var(--text-muted)', fontSize: '0.85rem' }}>
                        {p.lowStockThreshold ?? 10}
                      </td>
                      <td style={{ padding: '0.85rem 0.75rem', textAlign: 'center' }}>
                        <StockBadge product={p} />
                      </td>
                      <td style={{ padding: '0.85rem 0.75rem', textAlign: 'right', fontFamily: 'var(--font-mono)', fontSize: '0.85rem' }}>
                        ₹{(p.stock * (p.purchasePrice ?? p.sellingPrice)).toLocaleString('en-IN', { maximumFractionDigits: 0 })}
                      </td>
                      <td style={{ padding: '0.85rem 0.75rem', textAlign: 'right', fontFamily: 'var(--font-mono)', fontSize: '0.85rem', color: 'var(--primary-500)' }}>
                        ₹{p.sellingPrice.toLocaleString('en-IN')}
                      </td>
                      <td style={{ padding: '0.85rem 0.75rem', textAlign: 'center' }}>
                        <Button
                          size="sm"
                          variant="secondary"
                          icon={<PackagePlus size={14} />}
                          onClick={() => setAdjustProduct(p)}
                        >
                          Adjust
                        </Button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
              {/* Footer totals row */}
              <tfoot>
                <tr style={{ borderTop: '2px solid var(--border-medium)', fontWeight: 700, background: 'var(--bg-card)' }}>
                  <td colSpan={3} style={{ padding: '0.85rem 0.75rem', fontSize: '0.875rem', color: 'var(--text-secondary)' }}>
                    {filtered.length} products shown
                  </td>
                  <td colSpan={4} />
                  <td style={{ padding: '0.85rem 0.75rem', textAlign: 'right', color: 'var(--success)', fontSize: '0.875rem' }}>
                    ₹{filtered.reduce((s, p) => s + p.stock * (p.purchasePrice ?? p.sellingPrice), 0).toLocaleString('en-IN', { maximumFractionDigits: 0 })}
                  </td>
                  <td colSpan={2} />
                </tr>
              </tfoot>
            </table>
          </div>
        )}
      </Card>

      {/* Healthy stock summary strip */}
      {healthyStock.length > 0 && (
        <Card title="Healthy Stock Products">
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.6rem' }}>
            {healthyStock.map((p) => (
              <div
                key={p.id}
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '0.4rem',
                  padding: '0.35rem 0.75rem',
                  background: 'var(--success-bg)',
                  border: '1px solid var(--success)',
                  borderRadius: 'var(--radius-full)',
                  fontSize: '0.8rem',
                  color: 'var(--success)',
                  fontWeight: 500,
                }}
              >
                <CheckCircle2 size={13} />
                {p.name} — {p.stock} {p.unit}
              </div>
            ))}
          </div>
        </Card>
      )}

      {/* Stock Adjust Modal */}
      {adjustProduct && (
        <AdjustModal
          product={adjustProduct}
          onClose={() => setAdjustProduct(null)}
        />
      )}
    </div>
  );
};
