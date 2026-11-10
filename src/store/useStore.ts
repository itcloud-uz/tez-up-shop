import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type {
  Branch,
  CartItem,
  Category,
  Customer,
  Employee,
  Product,
  Purchase,
  Sale,
  SaleItem,
  StockMovement,
  Supplier,
  ToastMessage,
  User,
  UserRole,
} from '../types';
import {
  branches as mockBranches,
  categories as mockCategories,
  customers as mockCustomers,
  employees as mockEmployees,
  products as mockProducts,
  purchases as mockPurchases,
  sales as mockSales,
  stockMovements as mockMovements,
  suppliers as mockSuppliers,
} from '../data/mockData';
import { format } from 'date-fns';

interface AppState {
  currentUser: User;
  setCurrentUser: (user: User) => void;

  products: Product[];
  sales: Sale[];
  stockMovements: StockMovement[];
  purchases: Purchase[];
  customers: Customer[];
  suppliers: Supplier[];
  employees: Employee[];
  branches: Branch[];
  categories: Category[];

  cartItems: CartItem[];
  selectedCustomer: Customer | null;
  cartDiscount: number;
  saleType: 'chakana' | 'ulgurji';

  toasts: ToastMessage[];

  // Cart Actions
  setSaleType: (type: 'chakana' | 'ulgurji') => void;
  addToCart: (product: Product, isReturn?: boolean) => void;
  toggleCartItemReturn: (key: string) => void;
  removeFromCart: (key: string) => void;
  updateCartQuantity: (key: string, quantity: number) => void;
  updateCartDimensions: (
    key: string,
    updates: {
      pieceLength?: number;
      pieceWidth?: number;
      pieceCount?: number;
      pieceSize?: string;
      cutsCount?: number;
      cuttingPrice?: number;
      quantity?: number;
      isReturn?: boolean;
    }
  ) => void;
  updateCartUnitPrice: (key: string, unitPrice: number) => void;
  updateCartItemDiscount: (key: string, discount: number) => void;
  setCartDiscount: (discount: number) => void;
  setSelectedCustomer: (customer: Customer | null) => void;
  clearCart: () => void;
  completeSale: (paymentMethod: string, amountPaid: number, note?: string) => Sale;

  // Product Actions
  addProduct: (product: Omit<Product, 'id' | 'createdAt'>) => void;
  updateProduct: (id: string, updates: Partial<Product>) => void;
  toggleProductFavorite: (id: string) => void;
  deleteProduct: (id: string) => void;
  deleteProductsBulk: (ids: string[]) => void;

  // Category Actions
  addCategory: (category: Omit<Category, 'id' | 'productCount'>) => void;
  updateCategory: (id: string, updates: Partial<Category>) => void;
  deleteCategory: (id: string) => void;

  // Customer Actions
  addCustomer: (customer: Omit<Customer, 'id' | 'createdAt' | 'totalPurchases' | 'totalAmount'>) => Customer;
  updateCustomer: (id: string, updates: Partial<Customer>) => void;
  deleteCustomer: (id: string) => void;

  // Supplier Actions
  addSupplier: (supplier: Omit<Supplier, 'id' | 'createdAt' | 'balance' | 'totalPurchases'>) => void;
  updateSupplier: (id: string, updates: Partial<Supplier>) => void;
  deleteSupplier: (id: string) => void;

  // Employee Actions
  addEmployee: (employee: Omit<Employee, 'id'>) => void;
  updateEmployee: (id: string, updates: Partial<Employee>) => void;
  deleteEmployee: (id: string) => void;

  // Warehouse & Inventory Actions
  addStockMovement: (movement: Omit<StockMovement, 'id' | 'date' | 'userId' | 'userName'>) => void;
  applyInventoryCounts: (changes: { productId: string; countedStock: number }[]) => void;

  // Purchase Actions
  addPurchase: (purchase: Omit<Purchase, 'id' | 'createdAt'>) => void;
  confirmPurchase: (id: string) => void;
  cancelPurchase: (id: string) => void;

  // Sale Actions
  cancelSale: (id: string) => void;

  // Branch Actions
  addBranch: (branch: Omit<Branch, 'id'>) => void;
  toggleBranchActive: (id: string) => void;

  // Reset Demo Data
  resetDemoData: () => void;

  // Toast
  showToast: (type: ToastMessage['type'], message: string) => void;
  removeToast: (id: string) => void;

  // Computed
  cartNewSubtotal: () => number;
  cartReturnTotal: () => number;
  cartSubtotal: () => number;
  cartTotal: () => number;
}

export const useStore = create<AppState>()(
  persist(
    (set, get) => ({
      currentUser: {
        id: 'e1',
        name: 'OOO "TEMIRCHI"',
        role: 'admin',
        branch: 'Asosiy',
      },
      setCurrentUser: (user) => set({ currentUser: user }),

      products: mockProducts,
      sales: mockSales,
      stockMovements: mockMovements,
      purchases: mockPurchases,
      customers: mockCustomers,
      suppliers: mockSuppliers,
      employees: mockEmployees,
      branches: mockBranches,
      categories: mockCategories,

      cartItems: [],
      selectedCustomer: null,
      cartDiscount: 0,
      saleType: 'chakana',
      toasts: [],

      setSaleType: (type) => {
        const items = get().cartItems.map(item => ({
          ...item,
          unitPrice: type === 'ulgurji' && item.product.wholesalePrice
            ? item.product.wholesalePrice
            : item.product.salePrice,
        }));
        set({ saleType: type, cartItems: items });
      },

      addToCart: (product, isReturn = false) => {
        const state = get();
        const items = state.cartItems;
        const targetLineId = `${product.id}-${isReturn ? 'ret' : 'new'}`;
        const existing = items.find(i => (i.lineId || `${i.product.id}-${i.isReturn ? 'ret' : 'new'}`) === targetLineId);
        const price =
          state.saleType === 'ulgurji' && product.wholesalePrice
            ? product.wholesalePrice
            : product.salePrice;

        // Detect default piece length/width for metal products
        const detectLen = (p: Product): number => {
          if (p.defaultLength && p.defaultLength > 0) return p.defaultLength;
          const n = p.name;
          if (n.includes('11,70') || n.includes('11.7') || n.toLowerCase().includes('ар')) return 11.7;
          if (n.includes('12м')) return 12;
          if (n.includes('10м')) return 10;
          if (n.includes('9м')) return 9;
          if (n.includes('6м')) return 6;
          if (n.includes('2\\2.5') || n.includes('1,25/2,50')) return 2.5;
          if (n.includes('1,5/6')) return 6;
          return 1;
        };
        const detectWid = (p: Product): number => {
          if (p.defaultWidth && p.defaultWidth > 0) return p.defaultWidth;
          const n = p.name;
          if (n.includes('2\\2.5')) return 2.0;
          if (n.includes('1,25/2,50')) return 1.25;
          if (n.includes('1,5/6')) return 1.5;
          return 1;
        };

        const defaultLen = detectLen(product);
        const defaultWid = detectWid(product);
        const defaultCutPrice = product.cuttingPrice ?? (product.unit === 'metr' ? 2000 : product.unit === 'kv.m' ? 5000 : 3000);

        if (existing) {
          const nextCount = (existing.pieceCount || 1) + 1;
          const pLen = existing.pieceLength || defaultLen;
          const pWid = existing.pieceWidth || defaultWid;
          const perPieceQty =
            product.unit === 'kv.m'
              ? Number((pLen * pWid).toFixed(2))
              : product.unit === 'metr'
              ? pLen
              : 1;
          const nextQty = Number((perPieceQty * nextCount).toFixed(2));
          set({
            cartItems: items.map(i =>
              (i.lineId || `${i.product.id}-${i.isReturn ? 'ret' : 'new'}`) === targetLineId
                ? {
                    ...i,
                    lineId: targetLineId,
                    pieceCount: nextCount,
                    quantity: nextQty,
                  }
                : i
            ),
          });
        } else {
          const initialPerPiece =
            product.unit === 'kv.m'
              ? Number((defaultLen * defaultWid).toFixed(2))
              : 1;
          const initialSizeLabel =
            product.unit === 'kv.m'
              ? `${defaultWid}×${defaultLen} m (${initialPerPiece} kv.m)`
              : product.unit === 'metr'
              ? `${defaultLen} m`
              : `1 ${product.unit}`;
          set({
            cartItems: [
              ...items,
              {
                lineId: targetLineId,
                product,
                quantity: initialPerPiece,
                discount: 0,
                unitPrice: price,
                isReturn,
                pieceLength: product.unit === 'metr' ? 1 : defaultLen,
                pieceWidth: defaultWid,
                pieceCount: 1,
                pieceSize: product.unit === 'metr' ? '1 m' : initialSizeLabel,
                cutsCount: 0,
                cuttingPrice: isReturn ? 0 : defaultCutPrice,
              },
            ],
          });
        }
      },

      toggleCartItemReturn: (key) => {
        set({
          cartItems: get().cartItems.map(i => {
            const match = i.lineId === key || i.product.id === key;
            if (!match) return i;
            const nextReturn = !i.isReturn;
            return {
              ...i,
              isReturn: nextReturn,
              lineId: `${i.product.id}-${nextReturn ? 'ret' : 'new'}`,
              cutsCount: nextReturn ? 0 : i.cutsCount,
            };
          }),
        });
      },

      removeFromCart: (key) => {
        set({
          cartItems: get().cartItems.filter(i => i.lineId !== key && i.product.id !== key),
        });
      },

      updateCartQuantity: (key, quantity) => {
        if (quantity <= 0) {
          get().removeFromCart(key);
          return;
        }
        set({
          cartItems: get().cartItems.map(i => {
            if (i.lineId !== key && i.product.id !== key) return i;
            return {
              ...i,
              quantity: Number(quantity.toFixed(2)),
            };
          }),
        });
      },

      updateCartDimensions: (key, updates) => {
        set({
          cartItems: get().cartItems.map(i => {
            if (i.lineId !== key && i.product.id !== key) return i;
            return { ...i, ...updates };
          }),
        });
      },

      updateCartUnitPrice: (key, unitPrice) => {
        if (unitPrice < 0) return;
        set({
          cartItems: get().cartItems.map(i =>
            (i.lineId === key || i.product.id === key) ? { ...i, unitPrice } : i
          ),
        });
      },

      updateCartItemDiscount: (key, discount) => {
        const clamped = Math.max(0, Math.min(100, discount));
        set({
          cartItems: get().cartItems.map(i =>
            (i.lineId === key || i.product.id === key) ? { ...i, discount: clamped } : i
          ),
        });
      },

      setCartDiscount: (discount) => set({ cartDiscount: Math.max(0, Math.min(100, discount)) }),
      setSelectedCustomer: (customer) => set({ selectedCustomer: customer }),
      clearCart: () => set({ cartItems: [], selectedCustomer: null, cartDiscount: 0 }),

      cartNewSubtotal: () => {
        return get().cartItems.reduce((sum, item) => {
          if (item.isReturn) return sum;
          const productSum = item.unitPrice * item.quantity * (1 - item.discount / 100);
          const cuttingSum = (item.cutsCount || 0) * (item.cuttingPrice || 0);
          return sum + productSum + cuttingSum;
        }, 0);
      },

      cartReturnTotal: () => {
        return get().cartItems.reduce((sum, item) => {
          if (!item.isReturn) return sum;
          const productSum = item.unitPrice * item.quantity * (1 - item.discount / 100);
          return sum + productSum;
        }, 0);
      },

      cartSubtotal: () => {
        return Number((get().cartNewSubtotal() - get().cartReturnTotal()).toFixed(2));
      },

      cartTotal: () => {
        const newSub = get().cartNewSubtotal();
        const retSub = get().cartReturnTotal();
        const disc = get().cartDiscount;
        const discountedNew = newSub * (1 - disc / 100);
        return Number((discountedNew - retSub).toFixed(2));
      },

      completeSale: (paymentMethod, amountPaid, note) => {
        const state = get();
        const newItemsSubtotal = Number(state.cartNewSubtotal().toFixed(2));
        const returnedTotal = Number(state.cartReturnTotal().toFixed(2));
        const total = state.cartTotal();
        const subtotal = state.cartSubtotal();
        const nextNum = 3101 + state.sales.length;

        let cuttingServiceTotal = 0;

        const items: SaleItem[] = state.cartItems.map(ci => {
          const isRet = !!ci.isReturn;
          const cutTotal = isRet ? 0 : (ci.cutsCount || 0) * (ci.cuttingPrice || 0);
          cuttingServiceTotal += cutTotal;
          const rawLine = ci.unitPrice * ci.quantity * (1 - ci.discount / 100) + cutTotal;
          const lineTotal = Number((isRet ? -rawLine : rawLine).toFixed(2));
          return {
            productId: ci.product.id,
            productName: ci.product.name,
            sku: ci.product.sku,
            unit: ci.product.unit,
            isReturn: isRet,
            quantity: ci.quantity,
            pieceSize: ci.pieceSize,
            pieceCount: ci.pieceCount,
            cutsCount: isRet ? 0 : ci.cutsCount,
            cuttingPrice: ci.cuttingPrice,
            cuttingTotal: cutTotal,
            unitPrice: ci.unitPrice,
            discount: ci.discount,
            total: lineTotal,
          };
        });

        const branchObj = state.branches.find(b => b.name.includes(state.currentUser.branch)) || state.branches[0];

        const sale: Sale = {
          id: `sa-${Date.now()}`,
          receiptNumber: `#${nextNum}`,
          date: new Date().toISOString(),
          cashierId: state.currentUser.id,
          cashierName: state.currentUser.role === 'kassir' ? state.currentUser.name : 'KACCA 1.',
          branchId: branchObj?.id || 'b1',
          branchName: branchObj?.name || state.currentUser.branch,
          customerId: state.selectedCustomer?.id,
          customerName: state.selectedCustomer?.name,
          saleType: state.saleType,
          items,
          subtotal,
          newItemsSubtotal,
          returnedTotal,
          cuttingServiceTotal,
          discount: state.cartDiscount,
          total,
          paymentMethod: paymentMethod as Sale['paymentMethod'],
          amountPaid,
          change: total >= 0 ? Math.max(0, Number((amountPaid - total).toFixed(2))) : Math.abs(total),
          status: 'yakunlangan',
          note,
        };

        const updatedProducts = state.products.map(p => {
          const matchingItems = state.cartItems.filter(ci => ci.product.id === p.id);
          if (matchingItems.length === 0) return p;
          let nextStock = p.stock;
          matchingItems.forEach(ci => {
            if (ci.isReturn) {
              nextStock += ci.quantity; // Qaytgan mahsulot omborga qaytib qo'shiladi (+)
            } else {
              nextStock -= ci.quantity; // Yangi sotilgan mahsulot ombordan ayiriladi (-)
            }
          });
          return { ...p, stock: Math.max(0, Number(nextStock.toFixed(2))) };
        });

        const newMovements: StockMovement[] = state.cartItems.map((ci, idx) => ({
          id: `sm-${Date.now()}-${idx}`,
          type: ci.isReturn ? 'qaytarish' : 'chiqim',
          date: sale.date,
          productId: ci.product.id,
          productName: ci.product.name,
          quantity: ci.isReturn ? ci.quantity : -ci.quantity,
          fromBranchId: ci.isReturn ? undefined : (branchObj?.id || 'b1'),
          fromBranchName: ci.isReturn ? undefined : (branchObj?.name || state.currentUser.branch),
          toBranchId: ci.isReturn ? (branchObj?.id || 'b1') : undefined,
          toBranchName: ci.isReturn ? (branchObj?.name || state.currentUser.branch) : undefined,
          userId: state.currentUser.id,
          userName: sale.cashierName,
          note: ci.isReturn
            ? `Qaytgan mahsulot — Bitta chekda (${sale.receiptNumber})`
            : `Yangi savdo (${sale.receiptNumber})`,
          referenceId: sale.id,
        }));

        const updatedCustomers = state.selectedCustomer
          ? state.customers.map(c =>
              c.id === state.selectedCustomer!.id
                ? {
                    ...c,
                    totalPurchases: c.totalPurchases + 1,
                    totalAmount: c.totalAmount + total,
                    lastPurchase: format(new Date(), 'yyyy-MM-dd'),
                  }
                : c
            )
          : state.customers;

        set({
          sales: [sale, ...state.sales],
          products: updatedProducts,
          stockMovements: [...newMovements, ...state.stockMovements],
          customers: updatedCustomers,
        });
        state.clearCart();
        return sale;
      },

      addProduct: (product) => {
        const newProduct: Product = {
          ...product,
          id: `p-${Date.now()}`,
          createdAt: format(new Date(), 'yyyy-MM-dd'),
        };
        set({ products: [newProduct, ...get().products] });
      },

      updateProduct: (id, updates) => {
        set({ products: get().products.map(p => p.id === id ? { ...p, ...updates } : p) });
      },

      toggleProductFavorite: (id) => {
        set({
          products: get().products.map(p => p.id === id ? { ...p, isFavorite: !p.isFavorite } : p),
        });
      },

      deleteProduct: (id) => {
        set({ products: get().products.filter(p => p.id !== id) });
      },

      deleteProductsBulk: (ids) => {
        set({ products: get().products.filter(p => !ids.includes(p.id)) });
      },

      addCategory: (category) => {
        const newCat: Category = { ...category, id: `c-${Date.now()}`, productCount: 0 };
        set({ categories: [...get().categories, newCat] });
      },

      updateCategory: (id, updates) => {
        set({ categories: get().categories.map(c => c.id === id ? { ...c, ...updates } : c) });
      },

      deleteCategory: (id) => {
        set({ categories: get().categories.filter(c => c.id !== id) });
      },

      addCustomer: (customer) => {
        const newCustomer: Customer = {
          ...customer,
          id: `cu-${Date.now()}`,
          createdAt: format(new Date(), 'yyyy-MM-dd'),
          totalPurchases: 0,
          totalAmount: 0,
        };
        set({ customers: [newCustomer, ...get().customers] });
        return newCustomer;
      },

      updateCustomer: (id, updates) => {
        set({ customers: get().customers.map(c => c.id === id ? { ...c, ...updates } : c) });
      },

      deleteCustomer: (id) => {
        set({ customers: get().customers.filter(c => c.id !== id) });
      },

      addSupplier: (supplier) => {
        const newSupplier: Supplier = {
          ...supplier,
          id: `s-${Date.now()}`,
          createdAt: format(new Date(), 'yyyy-MM-dd'),
          balance: 0,
          totalPurchases: 0,
        };
        set({ suppliers: [newSupplier, ...get().suppliers] });
      },

      updateSupplier: (id, updates) => {
        set({ suppliers: get().suppliers.map(s => s.id === id ? { ...s, ...updates } : s) });
      },

      deleteSupplier: (id) => {
        set({ suppliers: get().suppliers.filter(s => s.id !== id) });
      },

      addEmployee: (employee) => {
        const newEmp: Employee = { ...employee, id: `e-${Date.now()}` };
        set({ employees: [...get().employees, newEmp] });
      },

      updateEmployee: (id, updates) => {
        set({ employees: get().employees.map(e => e.id === id ? { ...e, ...updates } : e) });
      },

      deleteEmployee: (id) => {
        set({ employees: get().employees.filter(e => e.id !== id) });
      },

      addStockMovement: (movement) => {
        const state = get();
        const delta =
          movement.type === 'kirim' || movement.type === 'qaytarish'
            ? Math.abs(movement.quantity)
            : movement.type === 'chiqim'
            ? -Math.abs(movement.quantity)
            : movement.quantity;

        const newMovement: StockMovement = {
          ...movement,
          quantity: delta,
          id: `sm-${Date.now()}`,
          date: new Date().toISOString(),
          userId: state.currentUser.id,
          userName: state.currentUser.name,
        };

        const updatedProducts = state.products.map(p => {
          if (p.id !== movement.productId) return p;
          if (movement.type === 'transfer') return p;
          return { ...p, stock: Math.max(0, Number((p.stock + delta).toFixed(2))) };
        });

        set({
          stockMovements: [newMovement, ...state.stockMovements],
          products: updatedProducts,
        });
      },

      applyInventoryCounts: (changes) => {
        const state = get();
        const now = new Date().toISOString();
        const newMovements: StockMovement[] = [];

        const updatedProducts = state.products.map(p => {
          const found = changes.find(c => c.productId === p.id);
          if (!found) return p;
          const diff = Number((found.countedStock - p.stock).toFixed(2));
          if (diff !== 0) {
            newMovements.push({
              id: `sm-inv-${Date.now()}-${p.id}`,
              type: 'inventarizatsiya',
              date: now,
              productId: p.id,
              productName: p.name,
              quantity: diff,
              fromBranchName: state.currentUser.branch,
              userId: state.currentUser.id,
              userName: state.currentUser.name,
              note: `Inventarizatsiya: tizimda ${p.stock} → sanaldi ${found.countedStock}`,
            });
          }
          return { ...p, stock: found.countedStock };
        });

        set({
          products: updatedProducts,
          stockMovements: [...newMovements, ...state.stockMovements],
        });
      },

      addPurchase: (purchase) => {
        const newPurchase: Purchase = {
          ...purchase,
          id: `pu-${Date.now().toString().slice(-4)}`,
          createdAt: new Date().toISOString(),
        };
        set({ purchases: [newPurchase, ...get().purchases] });
      },

      confirmPurchase: (id) => {
        const state = get();
        const purchase = state.purchases.find(p => p.id === id);
        if (!purchase || purchase.status !== 'qoralama') return;

        const updatedProducts = state.products.map(p => {
          const item = purchase.items.find(i => i.productId === p.id);
          if (item) return { ...p, stock: Number((p.stock + item.quantity).toFixed(2)), purchasePrice: item.purchasePrice };
          return p;
        });

        const newMovements: StockMovement[] = purchase.items.map((item, idx) => ({
          id: `sm-pu-${Date.now()}-${idx}`,
          type: 'kirim',
          date: new Date().toISOString(),
          productId: item.productId,
          productName: item.productName,
          quantity: item.quantity,
          toBranchName: state.currentUser.branch,
          userId: state.currentUser.id,
          userName: state.currentUser.name,
          note: `Xarid hujjati #${purchase.id.toUpperCase()} (${purchase.supplierName})`,
        }));

        const updatedSuppliers = state.suppliers.map(s =>
          s.id === purchase.supplierId
            ? { ...s, totalPurchases: s.totalPurchases + purchase.total }
            : s
        );

        set({
          purchases: state.purchases.map(p => p.id === id ? { ...p, status: 'qabul_qilindi' as const } : p),
          products: updatedProducts,
          stockMovements: [...newMovements, ...state.stockMovements],
          suppliers: updatedSuppliers,
        });
      },

      cancelPurchase: (id) => {
        set({
          purchases: get().purchases.map(p => p.id === id ? { ...p, status: 'bekor_qilindi' as const } : p),
        });
      },

      cancelSale: (id) => {
        const state = get();
        const sale = state.sales.find(s => s.id === id);
        if (!sale || sale.status === 'bekor_qilingan') return;

        const updatedProducts = state.products.map(p => {
          const item = sale.items.find(i => i.productId === p.id);
          if (item) return { ...p, stock: Number((p.stock + item.quantity).toFixed(2)) };
          return p;
        });

        const returnMovements: StockMovement[] = sale.items.map((item, idx) => ({
          id: `sm-cancel-${Date.now()}-${idx}`,
          type: 'qaytarish',
          date: new Date().toISOString(),
          productId: item.productId,
          productName: item.productName,
          quantity: item.quantity,
          toBranchName: sale.branchName,
          userId: state.currentUser.id,
          userName: state.currentUser.name,
          note: `Bekor qilingan savdo: ${sale.receiptNumber}`,
          referenceId: sale.id,
        }));

        set({
          sales: state.sales.map(s => s.id === id ? { ...s, status: 'bekor_qilingan' as const } : s),
          products: updatedProducts,
          stockMovements: [...returnMovements, ...state.stockMovements],
        });
      },

      addBranch: (branch) => {
        set({ branches: [...get().branches, { ...branch, id: `b-${Date.now()}` }] });
      },

      toggleBranchActive: (id) => {
        set({
          branches: get().branches.map(b => b.id === id ? { ...b, active: !b.active } : b),
        });
      },

      resetDemoData: () => {
        set({
          products: mockProducts,
          sales: mockSales,
          stockMovements: mockMovements,
          purchases: mockPurchases,
          customers: mockCustomers,
          suppliers: mockSuppliers,
          employees: mockEmployees,
          branches: mockBranches,
          categories: mockCategories,
          cartItems: [],
          selectedCustomer: null,
          cartDiscount: 0,
        });
      },

      showToast: (type, message) => {
        const id = `toast-${Date.now()}-${Math.random()}`;
        set({ toasts: [...get().toasts, { id, type, message }] });
        setTimeout(() => get().removeToast(id), 4000);
      },

      removeToast: (id) => {
        set({ toasts: get().toasts.filter(t => t.id !== id) });
      },
    }),
    {
      name: 'optimo-temirchi-v5-storage',
      partialize: (state) => ({
        currentUser: state.currentUser,
        products: state.products,
        sales: state.sales,
        stockMovements: state.stockMovements,
        purchases: state.purchases,
        customers: state.customers,
        suppliers: state.suppliers,
        employees: state.employees,
        branches: state.branches,
        categories: state.categories,
      }),
    }
  )
);

export const roleLabels: Record<UserRole, string> = {
  kassir: 'Kassir',
  omborchi: 'Omborchi',
  menejer: 'Menejer',
  admin: 'Administrator',
};

export const demoUsers: User[] = [
  { id: 'e1', name: 'OOO "TEMIRCHI"', role: 'admin', branch: 'Asosiy' },
  { id: 'e2', name: 'Zulfiya Botirova', role: 'menejer', branch: 'Asosiy' },
  { id: 'e3', name: 'KACCA 1.', role: 'kassir', branch: 'Asosiy' },
  { id: 'e5', name: 'Sherzod Qodirov', role: 'omborchi', branch: 'Asosiy' },
];
