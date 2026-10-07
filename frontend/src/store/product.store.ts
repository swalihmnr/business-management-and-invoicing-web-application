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
    name: 'Wireless Bluetooth Headset',
    sku: 'SKU-HEADSET-01',
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
    name: 'USB-C Fast Charging Cable',
    sku: 'SKU-CABLE-02',
    sellingPrice: 350,
    purchasePrice: 180,
    stock: 8,
    lowStockThreshold: 15,
    taxRate: 18,
    unit: 'pcs',
    category: 'Accessories',
  },
  {
    id: 'prod-3',
    name: 'Ergonomic Mesh Office Chair',
    sku: 'SKU-CHAIR-03',
    sellingPrice: 7500,
    purchasePrice: 5200,
    stock: 14,
    lowStockThreshold: 5,
    taxRate: 18,
    unit: 'pcs',
    category: 'Furniture',
  },
];

const loadProducts = (): ProductItem[] => {
  try {
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
