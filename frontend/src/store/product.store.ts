import { create } from 'zustand';

export interface ProductItem {
  id: string;
  name: string;
  sku: string;
  description?: string;
  sellingPrice: number;
  purchasePrice?: number;
  stock: number;
  lowStockThreshold?: number;
  taxRate: number;
  unit: string;
  category?: string;
}

interface ProductStore {
  products: ProductItem[];
  addProduct: (product: Omit<ProductItem, 'id'>) => ProductItem;
  updateProduct: (id: string, updates: Partial<ProductItem>) => void;
  deleteProduct: (id: string) => void;
}

const STORAGE_KEY = 'bizinvoice_products_data';

const initialProducts: ProductItem[] = [
  {
    id: 'prod-1',
    name: 'Wireless Bluetooth Headset Pro',
    sku: 'SKU-HEADSET-01',
    description: 'Over-ear noise-cancelling headset with 30hr battery, ideal for calls and music',
    sellingPrice: 1200,
    purchasePrice: 850,
    stock: 45,
    lowStockThreshold: 10,
    taxRate: 18,
    unit: 'pcs',
    category: 'Electronics',
  },
  {
    id: 'prod-2',
    name: 'USB-C Fast Charging Cable 2m',
    sku: 'SKU-CABLE-02',
    description: '100W braided USB-C to USB-C charging cable, 2 metre',
    sellingPrice: 350,
    purchasePrice: 180,
    stock: 8,            // ⚠️ LOW STOCK — below threshold of 15
    lowStockThreshold: 15,
    taxRate: 18,
    unit: 'pcs',
    category: 'Accessories',
  },
  {
    id: 'prod-3',
    name: 'Ergonomic Mesh Office Chair',
    sku: 'SKU-CHAIR-03',
    description: 'Lumbar-support mesh chair with adjustable armrests and height',
    sellingPrice: 7500,
    purchasePrice: 5200,
    stock: 14,
    lowStockThreshold: 5,
    taxRate: 18,
    unit: 'pcs',
    category: 'Furniture',
  },
  {
    id: 'prod-4',
    name: 'Mechanical Keyboard TKL',
    sku: 'SKU-KB-04',
    description: 'Tenkeyless mechanical keyboard with blue switches, RGB backlit',
    sellingPrice: 2800,
    purchasePrice: 1950,
    stock: 22,
    lowStockThreshold: 8,
    taxRate: 18,
    unit: 'pcs',
    category: 'Electronics',
  },
  {
    id: 'prod-5',
    name: 'A4 Copier Paper Ream 500 Sheets',
    sku: 'SKU-PAPER-05',
    description: '75 GSM A4 white copier paper — 500 sheets per ream',
    sellingPrice: 280,
    purchasePrice: 195,
    stock: 5,            // ⚠️ LOW STOCK — below threshold of 20
    lowStockThreshold: 20,
    taxRate: 12,
    unit: 'ream',
    category: 'Stationery',
  },
  {
    id: 'prod-6',
    name: '27" IPS 4K Monitor',
    sku: 'SKU-MON-06',
    description: '27-inch 4K UHD IPS panel with 144Hz refresh rate and USB-C hub',
    sellingPrice: 28500,
    purchasePrice: 21000,
    stock: 9,
    lowStockThreshold: 4,
    taxRate: 18,
    unit: 'pcs',
    category: 'Electronics',
  },
  {
    id: 'prod-7',
    name: 'Floor Standing Lamp LED',
    sku: 'SKU-LAMP-07',
    description: 'Dimmable 3000K–6500K LED floor lamp with touch control',
    sellingPrice: 1850,
    purchasePrice: 1200,
    stock: 3,            // ⚠️ LOW STOCK — below threshold of 6
    lowStockThreshold: 6,
    taxRate: 18,
    unit: 'pcs',
    category: 'Furniture',
  },
  {
    id: 'prod-8',
    name: 'Premium Ballpoint Pens Box (50 pcs)',
    sku: 'SKU-PEN-08',
    description: 'Medium 0.7mm blue ballpoint pens — box of 50',
    sellingPrice: 320,
    purchasePrice: 175,
    stock: 60,
    lowStockThreshold: 10,
    taxRate: 12,
    unit: 'box',
    category: 'Stationery',
  },
  {
    id: 'prod-9',
    name: 'Disinfectant Surface Spray 5L',
    sku: 'SKU-CLEAN-09',
    description: 'Hospital-grade surface disinfectant spray, 5 litre can',
    sellingPrice: 750,
    purchasePrice: 490,
    stock: 0,            // ⚠️ OUT OF STOCK
    lowStockThreshold: 12,
    taxRate: 5,
    unit: 'can',
    category: 'Cleaning & Hygiene',
  },
  {
    id: 'prod-10',
    name: 'Wireless Optical Mouse',
    sku: 'SKU-MOUSE-10',
    description: '2.4GHz USB nano-receiver wireless mouse, 1600 DPI, ambidextrous',
    sellingPrice: 850,
    purchasePrice: 570,
    stock: 33,
    lowStockThreshold: 10,
    taxRate: 18,
    unit: 'pcs',
    category: 'Electronics',
  },
];

const SEED_VERSION = 'v2-10products'; // bump to force-refresh localStorage
const SEED_VERSION_KEY = 'bizinvoice_products_seed_version';

const loadProducts = (): ProductItem[] => {
  try {
    const savedVersion = localStorage.getItem(SEED_VERSION_KEY);
    if (savedVersion !== SEED_VERSION) {
      // New seed version — wipe stale data and reload fresh defaults
      localStorage.setItem(SEED_VERSION_KEY, SEED_VERSION);
      localStorage.removeItem(STORAGE_KEY);
      return initialProducts;
    }
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) return JSON.parse(raw);
  } catch (e) {
    console.error('Failed to load products from storage', e);
  }
  return initialProducts;
};

const saveProducts = (products: ProductItem[]) => {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(products));
  } catch (e) {
    console.error('Failed to save products to storage', e);
  }
};

export const useProductStore = create<ProductStore>((set, get) => ({
  products: loadProducts(),

  addProduct: (newProduct) => {
    const id = `prod-${Date.now()}`;
    const record: ProductItem = { ...newProduct, id };
    const updated = [record, ...get().products];
    saveProducts(updated);
    set({ products: updated });
    return record;
  },

  updateProduct: (id, updates) => {
    const updated = get().products.map((p) => (p.id === id ? { ...p, ...updates } : p));
    saveProducts(updated);
    set({ products: updated });
  },

  deleteProduct: (id) => {
    const updated = get().products.filter((p) => p.id !== id);
    saveProducts(updated);
    set({ products: updated });
  },
}));
