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

export type PaymentMethod = 'UPI' | 'CASH' | 'CARD' | 'BANK_TRANSFER' | 'CHEQUE' | 'OTHER';

export interface PaymentEntry {
  id: string;
  invoiceId: string;
  invoiceNumber: string;
  customerName: string;
  amount: number;
  paymentDate: string;
  paymentMethod: PaymentMethod;
  referenceNumber?: string;
  notes?: string;
  createdAt: string;
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

  // Payment Tracking
  amountPaid: number;
  amountDue: number;
  payments: PaymentEntry[];
}

interface InvoiceStore {
  invoices: InvoiceRecord[];
  addInvoice: (invoice: Omit<InvoiceRecord, 'id' | 'invoiceNumber' | 'createdAt' | 'amountPaid' | 'amountDue' | 'payments'>) => InvoiceRecord;
  getInvoice: (id: string) => InvoiceRecord | undefined;
  deleteInvoice: (id: string) => void;
  updateStatus: (id: string, status: InvoiceRecord['status']) => void;
  recordPayment: (
    invoiceId: string,
    payment: {
      amount: number;
      paymentDate: string;
      paymentMethod: PaymentMethod;
      referenceNumber?: string;
      notes?: string;
    }
  ) => PaymentEntry | null;
  getAllPayments: () => PaymentEntry[];
}

const STORAGE_KEY = 'bizinvoice_invoices_data';

const initialInvoices: InvoiceRecord[] = [
  {
    id: 'inv-init-1',
    invoiceNumber: 'INV-0001',
    createdAt: new Date(Date.now() - 86400000 * 2).toISOString(),
    invoiceDate: new Date(Date.now() - 86400000 * 2).toISOString().split('T')[0],
    dueDate: new Date(Date.now() + 86400000 * 12).toISOString().split('T')[0],
    status: 'PARTIALLY_PAID',
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

    amountPaid: 2000,
    amountDue: 2433.4,
    payments: [
      {
        id: 'pay-sample-1',
        invoiceId: 'inv-init-1',
        invoiceNumber: 'INV-0001',
        customerName: 'Acme Corporation',
        amount: 2000,
        paymentDate: new Date(Date.now() - 86400000).toISOString().split('T')[0],
        paymentMethod: 'UPI',
        referenceNumber: 'UPI/492019482910',
        notes: 'Advance installment received',
        createdAt: new Date(Date.now() - 86400000).toISOString(),
      },
    ],
  },
];

const loadFromStorage = (): InvoiceRecord[] => {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      // Migrate existing records that might miss payment properties
      return parsed.map((inv: any) => ({
        ...inv,
        amountPaid: inv.amountPaid ?? 0,
        amountDue: inv.amountDue ?? inv.totalAmount,
        payments: inv.payments ?? [],
      }));
    }
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
      amountPaid: 0,
      amountDue: newInv.totalAmount,
      payments: [],
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

  recordPayment: (invoiceId, paymentInput) => {
    const invoices = get().invoices;
    const inv = invoices.find((i) => i.id === invoiceId);
    if (!inv) return null;

    const newPayment: PaymentEntry = {
      id: `pay-${Date.now()}`,
      invoiceId: inv.id,
      invoiceNumber: inv.invoiceNumber,
      customerName: inv.customerName,
      amount: paymentInput.amount,
      paymentDate: paymentInput.paymentDate,
      paymentMethod: paymentInput.paymentMethod,
      referenceNumber: paymentInput.referenceNumber,
      notes: paymentInput.notes,
      createdAt: new Date().toISOString(),
    };

    const newAmountPaid = (inv.amountPaid || 0) + paymentInput.amount;
    const newAmountDue = Math.max(0, inv.totalAmount - newAmountPaid);

    let newStatus: InvoiceRecord['status'] = 'ISSUED';
    if (newAmountDue === 0) {
      newStatus = 'PAID';
    } else if (newAmountPaid > 0) {
      newStatus = 'PARTIALLY_PAID';
    }

    const updated = invoices.map((item) =>
      item.id === invoiceId
        ? {
            ...item,
            amountPaid: newAmountPaid,
            amountDue: newAmountDue,
            status: newStatus,
            payments: [newPayment, ...(item.payments || [])],
          }
        : item
    );

    saveToStorage(updated);
    set({ invoices: updated });
    return newPayment;
  },

  getAllPayments: () => {
    const all: PaymentEntry[] = [];
    get().invoices.forEach((inv) => {
      if (inv.payments && Array.isArray(inv.payments)) {
        all.push(...inv.payments);
      }
    });
    return all.sort((a, b) => new Date(b.paymentDate).getTime() - new Date(a.paymentDate).getTime());
  },
}));
