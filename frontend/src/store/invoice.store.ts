import { create } from 'zustand';

export interface InvoiceLineItem {
  id: string;
  name: string;
  quantity: number;
  unitPrice: number;
  taxRate: number;
  discountType: 'FLAT' | 'PERCENTAGE';
  discountValue: number;
  lineTotal: number;
}

export interface InvoiceRecord {
  id: string;
  invoiceNumber: string;
  createdAt: string;
  invoiceDate: string;
  dueDate: string;
  status: 'ISSUED' | 'PAID' | 'PARTIALLY_PAID';
  notes: string;

  // Customer / Billing
  customerName: string;
  customerPhone: string;
  customerTaxId: string;
  billingAddress: string;
  billingCity: string;
  billingState: string;
  billingPincode: string;

  // Shipping
  shippingRecipient: string;
  shippingPhone: string;
  shippingAddress: string;
  shippingCity: string;
  shippingState: string;
  shippingPincode: string;
  carrier: string;
  trackingNumber: string;
  shippingCharge: number;

  // Items & Totals
  items: InvoiceLineItem[];
  subtotal: number;
  lineDiscountAmount: number;
  invoiceDiscountType: 'FLAT' | 'PERCENTAGE';
  invoiceDiscountValue: number;
  invoiceDiscountAmount: number;
  taxAmount: number;
  totalAmount: number;
}

interface InvoiceStore {
  invoices: InvoiceRecord[];
  addInvoice: (invoice: Omit<InvoiceRecord, 'id' | 'invoiceNumber' | 'createdAt'>) => InvoiceRecord;
  getInvoice: (id: string) => InvoiceRecord | undefined;
  deleteInvoice: (id: string) => void;
  updateStatus: (id: string, status: InvoiceRecord['status']) => void;
}

const STORAGE_KEY = 'bizinvoice_invoices_data';

const initialInvoices: InvoiceRecord[] = [
  {
    id: 'inv-init-1',
    invoiceNumber: 'INV-0001',
    createdAt: new Date(Date.now() - 86400000 * 2).toISOString(),
    invoiceDate: new Date(Date.now() - 86400000 * 2).toISOString().split('T')[0],
    dueDate: new Date(Date.now() + 86400000 * 12).toISOString().split('T')[0],
    status: 'ISSUED',
    notes: 'Thank you for your business! Payment due within 15 days.',

    customerName: 'Acme Corporation',
    customerPhone: '+91 98765 43210',
    customerTaxId: '27AAPFU0939F1ZV',
    billingAddress: 'Suite 501, Horizon Towers',
    billingCity: 'Mumbai',
    billingState: 'Maharashtra',
    billingPincode: '400001',

    shippingRecipient: 'Acme Central Logistics Depot',
    shippingPhone: '+91 98765 43210',
    shippingAddress: 'Plot 42, Sector 18, Industrial Area',
    shippingCity: 'Navi Mumbai',
    shippingState: 'Maharashtra',
    shippingPincode: '400705',
    carrier: 'Blue Dart Express',
    trackingNumber: 'BD-88234-IN',
    shippingCharge: 150,

    items: [
      {
        id: '1',
        name: 'Wireless Bluetooth Headset',
        quantity: 2,
        unitPrice: 1200,
        taxRate: 18,
        discountType: 'FLAT',
        discountValue: 100,
        lineTotal: 2714,
      },
      {
        id: '2',
        name: 'USB-C Fast Charging Cable',
        quantity: 4,
        unitPrice: 350,
        taxRate: 18,
        discountType: 'PERCENTAGE',
        discountValue: 5,
        lineTotal: 1569.4,
      },
    ],
    subtotal: 3800,
    lineDiscountAmount: 170,
    invoiceDiscountType: 'FLAT',
    invoiceDiscountValue: 0,
    invoiceDiscountAmount: 0,
    taxAmount: 653.4,
    totalAmount: 4433.4,
  },
];

const loadFromStorage = (): InvoiceRecord[] => {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) return JSON.parse(raw);
  } catch (e) {
    console.error('Failed to parse invoices from localStorage', e);
  }
  return initialInvoices;
};

const saveToStorage = (invoices: InvoiceRecord[]) => {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(invoices));
  } catch (e) {
    console.error('Failed to save invoices to localStorage', e);
  }
};

export const useInvoiceStore = create<InvoiceStore>((set, get) => ({
  invoices: loadFromStorage(),

  addInvoice: (newInv) => {
    const current = get().invoices;
    const nextCount = current.length + 1;
    const invoiceNumber = `INV-${String(nextCount).padStart(4, '0')}`;
    const id = `inv-${Date.now()}`;

    const record: InvoiceRecord = {
      ...newInv,
      id,
      invoiceNumber,
      createdAt: new Date().toISOString(),
    };

    const updated = [record, ...current];
    saveToStorage(updated);
    set({ invoices: updated });
    return record;
  },

  getInvoice: (id: string) => {
    return get().invoices.find((inv) => inv.id === id);
  },

  deleteInvoice: (id: string) => {
    const updated = get().invoices.filter((inv) => inv.id !== id);
    saveToStorage(updated);
    set({ invoices: updated });
  },

  updateStatus: (id: string, status: InvoiceRecord['status']) => {
    const updated = get().invoices.map((inv) => (inv.id === id ? { ...inv, status } : inv));
    saveToStorage(updated);
    set({ invoices: updated });
  },
}));
