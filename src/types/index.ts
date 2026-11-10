// ============================================================
// TYPES (Optimo.uz compatible)
// ============================================================
export type UserRole = 'kassir' | 'omborchi' | 'menejer' | 'admin';

export interface User {
  id: string;
  name: string;
  role: UserRole;
  branch: string;
  avatar?: string;
}

export interface Branch {
  id: string;
  name: string;
  address: string;
  phone: string;
  active: boolean;
}

export interface Category {
  id: string;
  name: string;
  color: string;
  productCount: number;
}

export interface Supplier {
  id: string;
  name: string;
  phone: string;
  email: string;
  address: string;
  balance: number;
  totalPurchases: number;
  createdAt: string;
}

export interface Customer {
  id: string;
  name: string;
  phone: string;
  email?: string;
  address?: string;
  totalPurchases: number;
  totalAmount: number;
  debt?: number;
  createdAt: string;
  lastPurchase?: string;
}

export type UnitType = 'dona' | 'metr' | 'kv.m' | 'kg' | 'litr' | 'quti' | 'tonna' | 'juft';

export interface Product {
  id: string;
  name: string;
  sku: string;
  barcode: string;
  categoryId: string;
  supplierId: string;
  unit: UnitType;
  currency?: 'UZS' | 'USD';
  usdPurchasePrice?: number;
  usdSalePrice?: number;
  purchasePrice: number; // in UZS
  salePrice: number;     // in UZS (Chakana)
  wholesalePrice?: number; // Ulgurji narx in UZS
  cuttingPrice?: number; // Kesib berish xizmat narxi (1 kesish uchun UZS)
  defaultLength?: number; // Standart bo'yi / uzunligi (m)
  defaultWidth?: number;  // Standart eni (m, kv.m list/setka uchun)
  stock: number;
  minStock: number;
  isFavorite?: boolean;  // "Asosiy" tab in POS
  image?: string;
  description?: string;
  taxRate: number;
  status: 'active' | 'inactive';
  createdAt: string;
}

export type PaymentMethod = 'naqd' | 'karta' | 'payme' | 'click' | 'aralash';

export interface CartItem {
  lineId?: string;       // Unique line identifier (allows same product as both return and new if needed)
  product: Product;
  quantity: number;      // Umumiy o'lchami (masalan: jami metr, jami kv.m yoki jami dona)
  discount: number;      // percentage
  unitPrice: number;
  isReturn?: boolean;    // true = Qaytgan mahsulot (Vozvrat / Almashtirish), false = Yangi olingan mahsulot
  pieceLength?: number;  // Har bir bo'lak uzunligi / bo'yi (m)
  pieceWidth?: number;   // Har bir bo'lak eni (m, kv.m uchun)
  pieceCount?: number;   // Nechta (dona / shtuk soni)
  pieceSize?: string;    // Formatlangan o'lcham ("11.7 m", "1.5x2.0 m (3 kv.m)")
  cutsCount?: number;    // Necha marta kesib berish
  cuttingPrice?: number; // 1 ta kesish xizmat narxi (UZS)
}

export type SaleStatus = 'yakunlangan' | 'bekor_qilingan' | 'qaytarilgan';

export interface Sale {
  id: string;
  receiptNumber: string;
  date: string;
  cashierId: string;
  cashierName: string;
  branchId: string;
  branchName: string;
  customerId?: string;
  customerName?: string;
  saleType?: 'chakana' | 'ulgurji';
  items: SaleItem[];
  subtotal: number;
  newItemsSubtotal?: number; // Yangi olingan mahsulotlar jami (+)
  returnedTotal?: number;    // Qaytgan mahsulotlar jami (-)
  cuttingServiceTotal?: number;
  discount: number;
  total: number;             // Yakuniy farq (Yangi - Qaytgan)
  paymentMethod: PaymentMethod;
  amountPaid: number;
  change: number;
  status: SaleStatus;
  note?: string;
}

export interface SaleItem {
  productId: string;
  productName: string;
  sku: string;
  unit?: UnitType;
  isReturn?: boolean;    // true = Qaytgan mahsulot (-), false = Yangi mahsulot (+)
  quantity: number;      // Umumiy o'lchami (jami m, kv.m, dona)
  pieceSize?: string;    // Qancha o'lchamda (masalan: "11.7 m" yoki "1.5 × 2 m (3 kv.m)")
  pieceCount?: number;   // Nechta (dona/shtuk soni)
  cutsCount?: number;    // Kesishlar soni
  cuttingPrice?: number; // 1 kesish narxi
  cuttingTotal?: number; // Jami kesib berish xizmat summasi
  unitPrice: number;
  discount: number;
  total: number;
}

export type StockMovementType = 'kirim' | 'chiqim' | 'transfer' | 'qaytarish' | 'inventarizatsiya';

export interface StockMovement {
  id: string;
  type: StockMovementType;
  date: string;
  productId: string;
  productName: string;
  quantity: number;
  fromBranchId?: string;
  fromBranchName?: string;
  toBranchId?: string;
  toBranchName?: string;
  userId: string;
  userName: string;
  note?: string;
  referenceId?: string;
}

export type PurchaseStatus = 'qoralama' | 'qabul_qilindi' | 'bekor_qilindi';

export interface PurchaseItem {
  productId: string;
  productName: string;
  quantity: number;
  purchasePrice: number;
  discount: number;
  total: number;
}

export interface Purchase {
  id: string;
  date: string;
  supplierId: string;
  supplierName: string;
  branchId: string;
  items: PurchaseItem[];
  subtotal: number;
  discount: number;
  total: number;
  status: PurchaseStatus;
  note?: string;
  createdAt: string;
}

export interface Employee {
  id: string;
  name: string;
  phone: string;
  email: string;
  role: UserRole;
  branchId: string;
  branchName: string;
  salary: number;
  startDate: string;
  status: 'faol' | 'nofaol';
}

export interface DailySalesData {
  date: string;
  amount: number;
  count: number;
}

export interface ToastMessage {
  id: string;
  type: 'success' | 'error' | 'warning' | 'info';
  message: string;
}
