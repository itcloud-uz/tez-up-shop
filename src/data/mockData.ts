import type { Branch, Category, Customer, DailySalesData, Employee, Product, Purchase, Sale, StockMovement, Supplier } from '../types';

// ============================================================
// BRANCHES (OOO "TEMIRCHI" Metallobaza filiallari)
// ============================================================
export const branches: Branch[] = [
  { id: 'b1', name: 'Asosiy (OOO "TEMIRCHI")', address: 'Toshkent sh., Chilonzor Promzona, Temir bozori 1-sektor', phone: '+998 71 200 45 67', active: true },
  { id: 'b2', name: 'Jomi Metallobaza filiali', address: 'Toshkent sh., Olmazor tumani, Jomi qurilish bozori', phone: '+998 71 234 56 78', active: true },
  { id: 'b3', name: 'Sergeli Metall Ombori', address: 'Toshkent sh., Sergeli tumani, Temir va profil ombori', phone: '+998 71 345 67 89', active: true },
];

// ============================================================
// CATEGORIES (Temir va Metall prokat turlari)
// ============================================================
export const categories: Category[] = [
  { id: 'c1', name: 'Темир (Сетка ва Сим)', color: '#4f46e5', productCount: 10 },
  { id: 'c2', name: 'Арматура', color: '#2563eb', productCount: 7 },
  { id: 'c3', name: 'Профиль', color: '#059669', productCount: 9 },
  { id: 'c7', name: 'Уголок', color: '#dc2626', productCount: 7 },
  { id: 'c4', name: 'Труба', color: '#7c3aed', productCount: 6 },
  { id: 'c6', name: 'Лист металл', color: '#0891b2', productCount: 5 },
  { id: 'c5', name: 'Швеллер ва Двутавр', color: '#d97706', productCount: 5 },
  { id: 'c8', name: 'Квадрат ва Полоса', color: '#4b5563', productCount: 4 },
];

// ============================================================
// SUPPLIERS / DISTRIBYUTORLAR (Metall zavodlar va dilerlar)
// ============================================================
export const suppliers: Supplier[] = [
  { id: 's1', name: 'Озим усд', phone: '+998 90 123 45 67', email: 'ozimusd@temirchi.uz', address: 'Toshkent, Asosiy sex va ombor', balance: 0, totalPurchases: 685000000, createdAt: '2024-01-10' },
  { id: 's2', name: 'Бекабод Металл (Узметкомбинат)', phone: '+998 71 234 56 78', email: 'sales@uzmetals.uz', address: 'Toshkent vil., Bekobod sh.', balance: 28000000, totalPurchases: 1420000000, createdAt: '2024-02-15' },
  { id: 's3', name: 'ТТЗ Металл Профиль', phone: '+998 71 345 67 89', email: 'info@ttzmetall.uz', address: 'Toshkent, Mirzo Ulug\'bek tumani (TTZ)', balance: 12500000, totalPurchases: 590000000, createdAt: '2024-03-01' },
  { id: 's4', name: 'Тошкент Металлургия Заводи (ТМЗ)', phone: '+998 71 207 00 11', email: 'info@toshkentmetal.uz', address: 'Toshkent, Yangihayot sanoat zonasi', balance: 0, totalPurchases: 410000000, createdAt: '2024-03-20' },
  { id: 's5', name: 'Қарағанда Сталь Импорт', phone: '+998 97 456 78 90', email: 'import@steel.kz', address: 'Toshkent, Sergeli bojxona ombori', balance: 35000000, totalPurchases: 895000000, createdAt: '2024-04-12' },
];

// ============================================================
// PRODUCTS (Optimo.uz skrinshotlaridagi aniq mahsulotlar + to'liq temir prokat katalogi)
// ============================================================
export const products: Product[] = [
  // --- OPTIMO SKRINSHOTDAGI ASOSIY (FAVORITE) VITRINA ELEMENTLARI (1-12) ---
  {
    id: 'p1', name: '10ар ттз а500', sku: '218', barcode: '218',
    categoryId: 'c2', supplierId: 's3', unit: 'metr',
    currency: 'UZS', purchasePrice: 4950, salePrice: 5612, wholesalePrice: 5400,
    cuttingPrice: 1500, defaultLength: 11.7,
    stock: 0, minStock: 50, isFavorite: true, taxRate: 12, status: 'active',
    description: 'Armatura Ø10mm TTZ A500, shtuk uzunligi 11.7m', createdAt: '2024-01-10',
  },
  {
    id: 'p2', name: '10лист 1,5/6', sku: '40', barcode: '40',
    categoryId: 'c6', supplierId: 's4', unit: 'kv.m',
    currency: 'UZS', purchasePrice: 780000, salePrice: 854000, wholesalePrice: 830000,
    cuttingPrice: 15000, defaultLength: 6.0, defaultWidth: 1.5,
    stock: 7.47, minStock: 2, isFavorite: true, taxRate: 12, status: 'active',
    description: 'Qalin temir list 10mm, o\'lchami 1.5m x 6.0m (9 kv.m)', createdAt: '2024-01-10',
  },
  {
    id: 'p3', name: '15/15пр 1,1ст 6м', sku: '189', barcode: '189',
    categoryId: 'c3', supplierId: 's3', unit: 'metr',
    currency: 'UZS', purchasePrice: 6800, salePrice: 7625, wholesalePrice: 7300,
    cuttingPrice: 2000, defaultLength: 6.0,
    stock: 1120, minStock: 100, isFavorite: true, taxRate: 12, status: 'active',
    description: 'Kvadrat profil 15x15mm, stenka 1.1mm, 1 shtuk = 6m', createdAt: '2024-01-10',
  },
  {
    id: 'p4', name: '159труба 2,5ст 12м', sku: '194', barcode: '194',
    categoryId: 'c4', supplierId: 's5', unit: 'metr',
    currency: 'UZS', purchasePrice: 96000, salePrice: 107238, wholesalePrice: 103000,
    cuttingPrice: 10000, defaultLength: 12.0,
    stock: 140.8, minStock: 20, isFavorite: true, taxRate: 12, status: 'active',
    description: 'Po\'lat quvur Ø159mm, stenka 2.5mm, uzunligi 12m', createdAt: '2024-01-12',
  },
  {
    id: 'p5', name: '159труба 2,7ст 12м', sku: '194-2', barcode: '1942',
    categoryId: 'c4', supplierId: 's5', unit: 'metr',
    currency: 'UZS', purchasePrice: 104000, salePrice: 115412, wholesalePrice: 111000,
    cuttingPrice: 10000, defaultLength: 12.0,
    stock: 8.8, minStock: 15, isFavorite: true, taxRate: 12, status: 'active',
    description: 'Po\'lat quvur Ø159mm, stenka 2.7mm, uzunligi 12m', createdAt: '2024-01-12',
  },
  {
    id: 'p6', name: '16Ар бек А400 11,70', sku: '13', barcode: '13',
    categoryId: 'c2', supplierId: 's2', unit: 'metr',
    currency: 'UZS', purchasePrice: 12800, salePrice: 14199.58, wholesalePrice: 13800,
    cuttingPrice: 2000, defaultLength: 11.7,
    stock: 3712.61, minStock: 200, isFavorite: true, taxRate: 12, status: 'active',
    description: 'Bekobod armatura Ø16mm A400, 1 shtuk = 11.70 metr', createdAt: '2024-01-15',
  },
  {
    id: 'p7', name: '2,8лист катта', sku: '33', barcode: '33',
    categoryId: 'c6', supplierId: 's4', unit: 'kv.m',
    currency: 'UZS', purchasePrice: 218000, salePrice: 244000, wholesalePrice: 235000,
    cuttingPrice: 8000, defaultLength: 2.5, defaultWidth: 1.25,
    stock: 187.5, minStock: 20, isFavorite: true, taxRate: 12, status: 'active',
    description: 'Issiq prokat list 2.8mm (1.25x2.50m = 3.125 kv.m)', createdAt: '2024-01-15',
  },
  {
    id: 'p8', name: '40/20пр 1,3ст 10м', sku: '91', barcode: '91',
    categoryId: 'c3', supplierId: 's3', unit: 'metr',
    currency: 'UZS', purchasePrice: 13500, salePrice: 15128, wholesalePrice: 14600,
    cuttingPrice: 2500, defaultLength: 10.0,
    stock: 1115, minStock: 100, isFavorite: true, taxRate: 12, status: 'active',
    description: 'Profil truba 40x20mm, stenka 1.3mm, 1 shtuk = 10m', createdAt: '2024-01-18',
  },
  {
    id: 'p9', name: '40/40пр 1,2ст 10м', sku: '92', barcode: '92',
    categoryId: 'c3', supplierId: 's3', unit: 'metr',
    currency: 'UZS', purchasePrice: 16100, salePrice: 17934, wholesalePrice: 17200,
    cuttingPrice: 3000, defaultLength: 10.0,
    stock: 668.5, minStock: 80, isFavorite: true, taxRate: 12, status: 'active',
    description: 'Profil truba 40x40mm, stenka 1.2mm, 1 shtuk = 10m', createdAt: '2024-01-18',
  },
  {
    id: 'p10', name: '40/40пр 1,5/1,55ст', sku: '93', barcode: '93',
    categoryId: 'c3', supplierId: 's3', unit: 'metr',
    currency: 'UZS', purchasePrice: 18800, salePrice: 20862, wholesalePrice: 20100,
    cuttingPrice: 3000, defaultLength: 10.0,
    stock: 2515.5, minStock: 150, isFavorite: true, taxRate: 12, status: 'active',
    description: 'Profil truba 40x40mm qalin stenka 1.55mm, 1 shtuk = 10m', createdAt: '2024-01-20',
  },
  {
    id: 'p11', name: '40уголок кичик', sku: '104', barcode: '104',
    categoryId: 'c7', supplierId: 's2', unit: 'metr',
    currency: 'UZS', purchasePrice: 14100, salePrice: 15860, wholesalePrice: 15200,
    cuttingPrice: 3000, defaultLength: 6.0,
    stock: 3296.5, minStock: 100, isFavorite: true, taxRate: 12, status: 'active',
    description: 'Ugolnik 40x40mm (3.0mm), 1 shtuk = 6m', createdAt: '2024-01-20',
  },
  {
    id: 'p12', name: '40уголок катта 4мм', sku: '105', barcode: '105',
    categoryId: 'c7', supplierId: 's2', unit: 'metr',
    currency: 'UZS', purchasePrice: 18500, salePrice: 20862, wholesalePrice: 19900,
    cuttingPrice: 3500, defaultLength: 9.0,
    stock: 1134.1, minStock: 100, isFavorite: true, taxRate: 12, status: 'active',
    description: 'Ugolnik 40x40x4mm GOST, 1 shtuk = 9m', createdAt: '2024-01-22',
  },

  // --- СЕТКА ВА СИМ (Optimo 5-skrinshotdagi USD narxli mahsulotlar) ---
  {
    id: 'p13', name: 'Сетка 2.4сим 15\\15', sku: '172', barcode: '172',
    categoryId: 'c1', supplierId: 's1', unit: 'dona',
    currency: 'USD', usdPurchasePrice: 1.25, usdSalePrice: 1.40,
    purchasePrice: 15250, salePrice: 17080, wholesalePrice: 16470,
    stock: 241, minStock: 20, isFavorite: true, taxRate: 12, status: 'active',
    description: 'Kladka setkasi 2.4mm sim, katak 15x15sm', createdAt: '2024-02-01',
  },
  {
    id: 'p14', name: 'Сетка 2.4сим 20\\20', sku: '172-2', barcode: '1722',
    categoryId: 'c1', supplierId: 's1', unit: 'dona',
    currency: 'USD', usdPurchasePrice: 0.92, usdSalePrice: 1.10,
    purchasePrice: 11224, salePrice: 13420, wholesalePrice: 12800,
    stock: 387, minStock: 30, isFavorite: false, taxRate: 12, status: 'active',
    description: 'Kladka setkasi 2.4mm sim, katak 20x20sm', createdAt: '2024-02-01',
  },
  {
    id: 'p15', name: 'Сетка 2,80сим 20/20', sku: '172-3', barcode: '1723',
    categoryId: 'c1', supplierId: 's1', unit: 'dona',
    currency: 'USD', usdPurchasePrice: 1.00, usdSalePrice: 1.20,
    purchasePrice: 12200, salePrice: 14640, wholesalePrice: 14000,
    stock: 0, minStock: 20, isFavorite: false, taxRate: 12, status: 'active',
    description: 'Kladka setkasi 2.8mm sim, katak 20x20sm', createdAt: '2024-02-05',
  },
  {
    id: 'p16', name: 'Сетка 3сим 15\\15', sku: '172-4', barcode: '1724',
    categoryId: 'c1', supplierId: 's1', unit: 'dona',
    currency: 'USD', usdPurchasePrice: 1.73, usdSalePrice: 1.90,
    purchasePrice: 21106, salePrice: 23180, wholesalePrice: 22500,
    stock: 2, minStock: 15, isFavorite: false, taxRate: 12, status: 'active',
    description: 'Kladka setkasi 3.0mm sim, katak 15x15sm', createdAt: '2024-02-05',
  },
  {
    id: 'p17', name: 'Евро сетка 3.8ст 2\\2.5', sku: '172-5', barcode: '1725',
    categoryId: 'c1', supplierId: 's1', unit: 'dona',
    currency: 'USD', usdPurchasePrice: 13.33, usdSalePrice: 14.17,
    purchasePrice: 162626, salePrice: 172874, wholesalePrice: 168000,
    stock: 50, minStock: 10, isFavorite: true, taxRate: 12, status: 'active',
    description: 'Yevro panjara setka 3.8mm, 2.0x2.5m panel', createdAt: '2024-02-10',
  },
  {
    id: 'p18', name: 'Сетка 3.4сим 15\\15', sku: '172-6', barcode: '1726',
    categoryId: 'c1', supplierId: 's1', unit: 'dona',
    currency: 'USD', usdPurchasePrice: 2.36, usdSalePrice: 2.60,
    purchasePrice: 28792, salePrice: 31720, wholesalePrice: 30500,
    stock: 0, minStock: 15, isFavorite: false, taxRate: 12, status: 'active',
    description: 'Kladka setkasi 3.4mm sim, katak 15x15sm', createdAt: '2024-02-10',
  },
  {
    id: 'p19', name: 'Сетка 2.1сим 10\\10', sku: '172-7', barcode: '1727',
    categoryId: 'c1', supplierId: 's1', unit: 'dona',
    currency: 'USD', usdPurchasePrice: 1.53, usdSalePrice: 1.74,
    purchasePrice: 18666, salePrice: 21228, wholesalePrice: 20400,
    stock: 99, minStock: 20, isFavorite: false, taxRate: 12, status: 'active',
    description: 'Styajka setkasi 2.1mm, katak 10x10sm', createdAt: '2024-02-12',
  },
  {
    id: 'p20', name: 'Сетка 3.4сим 20/20', sku: '172-8', barcode: '1728',
    categoryId: 'c1', supplierId: 's1', unit: 'dona',
    currency: 'USD', usdPurchasePrice: 1.80, usdSalePrice: 2.09,
    purchasePrice: 21960, salePrice: 25498, wholesalePrice: 24400,
    stock: 198, minStock: 25, isFavorite: false, taxRate: 12, status: 'active',
    description: 'Kladka setkasi 3.4mm, katak 20x20sm', createdAt: '2024-02-14',
  },
  {
    id: 'p21', name: 'Сетка 2.4сим 10\\10', sku: '172-9', barcode: '1729',
    categoryId: 'c1', supplierId: 's1', unit: 'dona',
    currency: 'USD', usdPurchasePrice: 1.88, usdSalePrice: 2.08,
    purchasePrice: 22936, salePrice: 25376, wholesalePrice: 24500,
    stock: 74, minStock: 20, isFavorite: false, taxRate: 12, status: 'active',
    description: 'Styajka setkasi 2.4mm, katak 10x10sm', createdAt: '2024-02-14',
  },
  {
    id: 'p22', name: 'Сетка 4сим 15\\15', sku: '172-10', barcode: '1730',
    categoryId: 'c1', supplierId: 's1', unit: 'dona',
    currency: 'USD', usdPurchasePrice: 3.27, usdSalePrice: 3.65,
    purchasePrice: 39894, salePrice: 44530, wholesalePrice: 43000,
    stock: 134, minStock: 25, isFavorite: false, taxRate: 12, status: 'active',
    description: 'Kuchaytirilgan setka 4.0mm, katak 15x15sm', createdAt: '2024-02-15',
  },
  {
    id: 'p23', name: 'Сетка 4сим 20/20', sku: '172-11', barcode: '1731',
    categoryId: 'c1', supplierId: 's1', unit: 'dona',
    currency: 'USD', usdPurchasePrice: 2.60, usdSalePrice: 2.92,
    purchasePrice: 31720, salePrice: 35624, wholesalePrice: 34400,
    stock: 202, minStock: 25, isFavorite: false, taxRate: 12, status: 'active',
    description: 'Kuchaytirilgan setka 4.0mm, katak 20x20sm', createdAt: '2024-02-15',
  },

  // --- ҚЎШИМЧА АРМАТУРАЛАР (Bekobod & TTZ) ---
  {
    id: 'p24', name: '12Ар бек А500С 11,70', sku: '11', barcode: '11',
    categoryId: 'c2', supplierId: 's2', unit: 'metr',
    currency: 'UZS', purchasePrice: 7400, salePrice: 8250, wholesalePrice: 7950,
    stock: 4680, minStock: 300, isFavorite: true, taxRate: 12, status: 'active',
    description: 'Bekobod armatura Ø12mm A500C, 1 shtuk = 11.70m', createdAt: '2024-02-18',
  },
  {
    id: 'p25', name: '14Ар бек А500С 11,70', sku: '12', barcode: '12',
    categoryId: 'c2', supplierId: 's2', unit: 'metr',
    currency: 'UZS', purchasePrice: 9900, salePrice: 11100, wholesalePrice: 10700,
    stock: 2925, minStock: 250, isFavorite: true, taxRate: 12, status: 'active',
    description: 'Bekobod armatura Ø14mm A500C, 1 shtuk = 11.70m', createdAt: '2024-02-18',
  },
  {
    id: 'p26', name: '18Ар бек А500С 11,70', sku: '14', barcode: '14',
    categoryId: 'c2', supplierId: 's2', unit: 'metr',
    currency: 'UZS', purchasePrice: 16400, salePrice: 18300, wholesalePrice: 17700,
    stock: 1755, minStock: 150, isFavorite: false, taxRate: 12, status: 'active',
    description: 'Bekobod armatura Ø18mm A500C, 1 shtuk = 11.70m', createdAt: '2024-02-19',
  },
  {
    id: 'p27', name: '20Ар бек А500С 11,70', sku: '15', barcode: '15',
    categoryId: 'c2', supplierId: 's2', unit: 'metr',
    currency: 'UZS', purchasePrice: 20300, salePrice: 22600, wholesalePrice: 21900,
    stock: 1170, minStock: 120, isFavorite: false, taxRate: 12, status: 'active',
    description: 'Bekobod armatura Ø20mm A500C, 1 shtuk = 11.70m', createdAt: '2024-02-19',
  },
  {
    id: 'p28', name: '22Ар бек А500С 11,70', sku: '16', barcode: '16',
    categoryId: 'c2', supplierId: 's2', unit: 'metr',
    currency: 'UZS', purchasePrice: 24500, salePrice: 27400, wholesalePrice: 26500,
    stock: 936, minStock: 100, isFavorite: false, taxRate: 12, status: 'active',
    description: 'Bekobod armatura Ø22mm A500C, 1 shtuk = 11.70m', createdAt: '2024-02-20',
  },

  // --- ҚЎШИМЧА ПРОФИЛЛАР ---
  {
    id: 'p29', name: '20/20пр 1,2ст 6м', sku: '88', barcode: '88',
    categoryId: 'c3', supplierId: 's3', unit: 'metr',
    currency: 'UZS', purchasePrice: 8400, salePrice: 9450, wholesalePrice: 9100,
    stock: 1860, minStock: 120, isFavorite: true, taxRate: 12, status: 'active',
    description: 'Profil truba 20x20mm, stenka 1.2mm, 1 shtuk = 6m', createdAt: '2024-02-21',
  },
  {
    id: 'p30', name: '25/25пр 1,3ст 6м', sku: '89', barcode: '89',
    categoryId: 'c3', supplierId: 's3', unit: 'metr',
    currency: 'UZS', purchasePrice: 10800, salePrice: 12150, wholesalePrice: 11700,
    stock: 1440, minStock: 100, isFavorite: false, taxRate: 12, status: 'active',
    description: 'Profil truba 25x25mm, stenka 1.3mm, 1 shtuk = 6m', createdAt: '2024-02-21',
  },
  {
    id: 'p31', name: '60/40пр 1,8ст 10м', sku: '95', barcode: '95',
    categoryId: 'c3', supplierId: 's3', unit: 'metr',
    currency: 'UZS', purchasePrice: 27200, salePrice: 30500, wholesalePrice: 29400,
    stock: 890, minStock: 80, isFavorite: true, taxRate: 12, status: 'active',
    description: 'Profil truba 60x40mm, stenka 1.8mm, 1 shtuk = 10m', createdAt: '2024-02-22',
  },
  {
    id: 'p32', name: '60/60пр 2,0ст 10м', sku: '96', barcode: '96',
    categoryId: 'c3', supplierId: 's3', unit: 'metr',
    currency: 'UZS', purchasePrice: 36500, salePrice: 40800, wholesalePrice: 39300,
    stock: 640, minStock: 60, isFavorite: false, taxRate: 12, status: 'active',
    description: 'Kvadrat profil 60x60mm, stenka 2.0mm, 1 shtuk = 10m', createdAt: '2024-02-22',
  },
  {
    id: 'p33', name: '80/80пр 2,5ст 12м', sku: '98', barcode: '98',
    categoryId: 'c3', supplierId: 's3', unit: 'metr',
    currency: 'UZS', purchasePrice: 61000, salePrice: 68200, wholesalePrice: 65800,
    stock: 360, minStock: 48, isFavorite: false, taxRate: 12, status: 'active',
    description: 'Ustunbop profil 80x80mm, stenka 2.5mm, 1 shtuk = 12m', createdAt: '2024-02-23',
  },

  // --- УГОЛОК (БУРЧАКЛИКЛАР) ---
  {
    id: 'p34', name: '25уголок 3мм 6м', sku: '101', barcode: '101',
    categoryId: 'c7', supplierId: 's2', unit: 'metr',
    currency: 'UZS', purchasePrice: 9200, salePrice: 10400, wholesalePrice: 9950,
    stock: 1560, minStock: 120, isFavorite: false, taxRate: 12, status: 'active',
    description: 'Ugolnik 25x25x3mm, 1 shtuk = 6m', createdAt: '2024-02-24',
  },
  {
    id: 'p35', name: '32уголок 3,5мм 6м', sku: '102', barcode: '102',
    categoryId: 'c7', supplierId: 's2', unit: 'metr',
    currency: 'UZS', purchasePrice: 12400, salePrice: 13900, wholesalePrice: 13400,
    stock: 1240, minStock: 100, isFavorite: false, taxRate: 12, status: 'active',
    description: 'Ugolnik 32x32x3.5mm, 1 shtuk = 6m', createdAt: '2024-02-24',
  },
  {
    id: 'p36', name: '50уголок 4,5мм 9м', sku: '106', barcode: '106',
    categoryId: 'c7', supplierId: 's2', unit: 'metr',
    currency: 'UZS', purchasePrice: 25800, salePrice: 28900, wholesalePrice: 27800,
    stock: 990, minStock: 90, isFavorite: true, taxRate: 12, status: 'active',
    description: 'Ugolnik 50x50x4.5mm, 1 shtuk = 9m', createdAt: '2024-02-25',
  },
  {
    id: 'p37', name: '63уголок 5мм 12м', sku: '107', barcode: '107',
    categoryId: 'c7', supplierId: 's2', unit: 'metr',
    currency: 'UZS', purchasePrice: 39200, salePrice: 43800, wholesalePrice: 42200,
    stock: 720, minStock: 72, isFavorite: false, taxRate: 12, status: 'active',
    description: 'Ugolnik 63x63x5mm, 1 shtuk = 12m', createdAt: '2024-02-25',
  },
  {
    id: 'p38', name: '75уголок 6мм 12м', sku: '108', barcode: '108',
    categoryId: 'c7', supplierId: 's5', unit: 'metr',
    currency: 'UZS', purchasePrice: 54000, salePrice: 60500, wholesalePrice: 58500,
    stock: 480, minStock: 60, isFavorite: false, taxRate: 12, status: 'active',
    description: 'Ugolnik 75x75x6mm, 1 shtuk = 12m', createdAt: '2024-02-25',
  },

  // --- ШВЕЛЛЕР ВА ДВУТАВР (БАЛКА) ---
  {
    id: 'p39', name: 'Швеллер №8П 12м', sku: '301', barcode: '301',
    categoryId: 'c5', supplierId: 's5', unit: 'metr',
    currency: 'UZS', purchasePrice: 64000, salePrice: 71500, wholesalePrice: 69000,
    stock: 360, minStock: 48, isFavorite: false, taxRate: 12, status: 'active',
    description: 'Po\'lat shveller №8, 1 shtuk = 12m', createdAt: '2024-02-26',
  },
  {
    id: 'p40', name: 'Швеллер №10П 12м', sku: '302', barcode: '302',
    categoryId: 'c5', supplierId: 's5', unit: 'metr',
    currency: 'UZS', purchasePrice: 78500, salePrice: 87800, wholesalePrice: 84500,
    stock: 540, minStock: 60, isFavorite: true, taxRate: 12, status: 'active',
    description: 'Po\'lat shveller №10, 1 shtuk = 12m', createdAt: '2024-02-26',
  },
  {
    id: 'p41', name: 'Швеллер №12П 12м', sku: '303', barcode: '303',
    categoryId: 'c5', supplierId: 's5', unit: 'metr',
    currency: 'UZS', purchasePrice: 95000, salePrice: 106400, wholesalePrice: 102500,
    stock: 420, minStock: 48, isFavorite: false, taxRate: 12, status: 'active',
    description: 'Po\'lat shveller №12, 1 shtuk = 12m', createdAt: '2024-02-26',
  },
  {
    id: 'p42', name: 'Двутавр (Балка) №14 12м', sku: '310', barcode: '310',
    categoryId: 'c5', supplierId: 's5', unit: 'metr',
    currency: 'UZS', purchasePrice: 138000, salePrice: 154000, wholesalePrice: 149000,
    stock: 240, minStock: 36, isFavorite: false, taxRate: 12, status: 'active',
    description: 'Ikki tavrli balka №14, 1 shtuk = 12m', createdAt: '2024-02-27',
  },

  // --- КВАДРАТ ПРУТ ВА ПОЛОСА ---
  {
    id: 'p43', name: 'Квадрат 12х12мм 6м', sku: '502', barcode: '502',
    categoryId: 'c8', supplierId: 's2', unit: 'metr',
    currency: 'UZS', purchasePrice: 11200, salePrice: 12600, wholesalePrice: 12100,
    stock: 1320, minStock: 120, isFavorite: false, taxRate: 12, status: 'active',
    description: 'Panjarabop to\'rtburchak prut 12x12mm, 1 shtuk = 6m', createdAt: '2024-02-28',
  },
  {
    id: 'p44', name: 'Полоса 40х4мм 6м', sku: '506', barcode: '506',
    categoryId: 'c8', supplierId: 's2', unit: 'metr',
    currency: 'UZS', purchasePrice: 12900, salePrice: 14500, wholesalePrice: 13900,
    stock: 960, minStock: 100, isFavorite: false, taxRate: 12, status: 'active',
    description: 'Yassi temir polosa 40x4mm, 1 shtuk = 6m', createdAt: '2024-02-28',
  },
];

// ============================================================
// CUSTOMERS (Ustalar, Prorablar, Qurilish firmalari, Sexlar)
// ============================================================
export const customers: Customer[] = [
  { id: 'cu1', name: 'Alisher Karimov (Svarchik / Darvozachi)', phone: '+998 90 123 45 67', email: 'alisher.usta@mail.com', address: 'Toshkent, Chilonzor 19-kv', totalPurchases: 48, totalAmount: 42500000, createdAt: '2024-01-15', lastPurchase: '2026-11-07' },
  { id: 'cu2', name: 'Stroy Invest Qurilish MChJ', phone: '+998 91 234 56 78', email: 'snab@stroyinvest.uz', address: 'Toshkent, Yunusobod 4-mavze', totalPurchases: 35, totalAmount: 164960000, createdAt: '2024-02-10', lastPurchase: '2026-11-06' },
  { id: 'cu3', name: 'Jasur Mirzayev (Prorab - Monolit)', phone: '+998 97 567 89 01', email: 'jasur.prorab@gmail.com', address: 'Toshkent, Sergeli Yangi hayot', totalPurchases: 62, totalAmount: 215400000, createdAt: '2024-01-05', lastPurchase: '2026-11-06' },
  { id: 'cu4', name: 'Bobur Toshmatov (Naves va Panjara sexi)', phone: '+998 93 345 67 89', address: 'Toshkent vil., Zangiota tumani', totalPurchases: 31, totalAmount: 38900000, createdAt: '2024-02-20', lastPurchase: '2026-11-05' },
  { id: 'cu5', name: 'Baraka Beton Zavodi', phone: '+998 90 789 01 23', email: 'info@barakabeton.uz', address: 'Toshkent, Bektemir sanoat zonasi', totalPurchases: 19, totalAmount: 118200000, createdAt: '2024-05-15', lastPurchase: '2026-11-04' },
];

// ============================================================
// EMPLOYEES
// ============================================================
export const employees: Employee[] = [
  { id: 'e1', name: 'OOO "TEMIRCHI"', phone: '+998 90 111 22 33', email: 'admin@temirchi.uz', role: 'admin', branchId: 'b1', branchName: 'Asosiy (OOO "TEMIRCHI")', salary: 10000000, startDate: '2023-01-01', status: 'faol' },
  { id: 'e2', name: 'Zulfiya Botirova (Bosh hisobchi)', phone: '+998 91 222 33 44', email: 'zulfiya@temirchi.uz', role: 'menejer', branchId: 'b1', branchName: 'Asosiy (OOO "TEMIRCHI")', salary: 7500000, startDate: '2023-02-15', status: 'faol' },
  { id: 'e3', name: 'KACCA 1.', phone: '+998 93 333 44 55', email: 'kassa1@temirchi.uz', role: 'kassir', branchId: 'b1', branchName: 'Asosiy (OOO "TEMIRCHI")', salary: 5500000, startDate: '2023-03-01', status: 'faol' },
  { id: 'e4', name: 'KACCA 2. (Jomi)', phone: '+998 94 444 55 66', email: 'kassa2@temirchi.uz', role: 'kassir', branchId: 'b2', branchName: 'Jomi Metallobaza filiali', salary: 5500000, startDate: '2023-04-01', status: 'faol' },
  { id: 'e5', name: 'Sherzod Qodirov (Metall ombor mudiri)', phone: '+998 97 555 66 77', email: 'sherzod@temirchi.uz', role: 'omborchi', branchId: 'b1', branchName: 'Asosiy (OOO "TEMIRCHI")', salary: 6500000, startDate: '2023-03-15', status: 'faol' },
];

// ============================================================
// SALES
// ============================================================
export const sales: Sale[] = [
  {
    id: 'sa0', receiptNumber: '#3102', date: '2026-11-07T11:20:00', cashierId: 'e3', cashierName: 'KACCA 1.', branchId: 'b1', branchName: 'Asosiy (OOO "TEMIRCHI")', customerId: 'cu4', customerName: 'Bobur Toshmatov (Naves va Panjara sexi)',
    saleType: 'chakana',
    items: [
      {
        productId: 'p10', productName: '40/40пр 1,5/1,55ст', sku: '93', unit: 'metr',
        isReturn: false,
        pieceSize: '10 m', pieceCount: 6, quantity: 60,
        cutsCount: 6, cuttingPrice: 2500, cuttingTotal: 15000,
        unitPrice: 20862, discount: 0, total: 1266720,
      },
      {
        productId: 'p8', productName: '40/20пр 1,3ст 10м', sku: '91', unit: 'metr',
        isReturn: true,
        pieceSize: '10 m', pieceCount: 3, quantity: 30,
        cutsCount: 0, cuttingPrice: 0, cuttingTotal: 0,
        unitPrice: 15128, discount: 0, total: -453840,
      },
    ],
    newItemsSubtotal: 1266720, returnedTotal: 453840, subtotal: 812880, cuttingServiceTotal: 15000, discount: 0, total: 812880, paymentMethod: 'naqd', amountPaid: 815000, change: 2120, status: 'yakunlangan'
  },
  {
    id: 'sa1', receiptNumber: '#3101', date: '2026-11-07T09:15:00', cashierId: 'e3', cashierName: 'KACCA 1.', branchId: 'b1', branchName: 'Asosiy (OOO "TEMIRCHI")', customerId: 'cu1', customerName: 'Alisher Karimov (Svarchik / Darvozachi)',
    saleType: 'chakana',
    items: [
      {
        productId: 'p6', productName: '16Ар бек А400 11,70', sku: '13', unit: 'metr',
        pieceSize: '10 m', pieceCount: 10, quantity: 100,
        cutsCount: 10, cuttingPrice: 2000, cuttingTotal: 20000,
        unitPrice: 14199.58, discount: 0, total: 1439958,
      },
    ],
    subtotal: 1439958, cuttingServiceTotal: 20000, discount: 0, total: 1439958, paymentMethod: 'naqd', amountPaid: 1440000, change: 42, status: 'yakunlangan'
  },
  {
    id: 'sa2', receiptNumber: '#3100', date: '2026-11-07T10:30:00', cashierId: 'e3', cashierName: 'KACCA 1.', branchId: 'b1', branchName: 'Asosiy (OOO "TEMIRCHI")',
    saleType: 'chakana',
    items: [
      {
        productId: 'p13', productName: 'Сетка 2.4сим 15\\15', sku: '172', unit: 'dona',
        pieceSize: '1×2 m (2 kv.m)', pieceCount: 10, quantity: 10,
        cutsCount: 0, cuttingPrice: 2000, cuttingTotal: 0,
        unitPrice: 16524, discount: 0, total: 165240,
      },
    ],
    subtotal: 165240, cuttingServiceTotal: 0, discount: 0, total: 165240, paymentMethod: 'naqd', amountPaid: 165240, change: 0, status: 'yakunlangan'
  },
  {
    id: 'sa3', receiptNumber: '#3099', date: '2026-11-06T14:45:00', cashierId: 'e3', cashierName: 'KACCA 1.', branchId: 'b1', branchName: 'Asosiy (OOO "TEMIRCHI")', customerId: 'cu2', customerName: 'Stroy Invest Qurilish MChJ',
    saleType: 'ulgurji',
    items: [
      {
        productId: 'p2', productName: '10лист 1,5/6', sku: '40', unit: 'kv.m',
        pieceSize: '1.5×6 m (9 kv.m)', pieceCount: 2, quantity: 18,
        cutsCount: 4, cuttingPrice: 15000, cuttingTotal: 60000,
        unitPrice: 94888.89, discount: 0, total: 1768000,
      },
      {
        productId: 'p8', productName: '40/20пр 1,3ст 10м', sku: '91', unit: 'metr',
        pieceSize: '10 m', pieceCount: 5, quantity: 50,
        cutsCount: 5, cuttingPrice: 2500, cuttingTotal: 12500,
        unitPrice: 15128, discount: 0, total: 768900,
      },
      {
        productId: 'p11', productName: '40уголок кичик', sku: '104', unit: 'metr',
        pieceSize: '6 m', pieceCount: 10, quantity: 60,
        cutsCount: 0, cuttingPrice: 3000, cuttingTotal: 0,
        unitPrice: 15860, discount: 0, total: 951600,
      },
    ],
    subtotal: 3488500, cuttingServiceTotal: 72500, discount: 0, total: 3488500, paymentMethod: 'karta', amountPaid: 3488500, change: 0, status: 'yakunlangan'
  },
  {
    id: 'sa4', receiptNumber: '#3098', date: '2026-11-06T16:20:00', cashierId: 'e4', cashierName: 'KACCA 2. (Jomi)', branchId: 'b2', branchName: 'Jomi Metallobaza filiali', customerId: 'cu3', customerName: 'Jasur Mirzayev (Prorab - Monolit)',
    saleType: 'ulgurji',
    items: [
      {
        productId: 'p24', productName: '12Ар бек А500С 11,70', sku: '11', unit: 'metr',
        pieceSize: '11.7 m', pieceCount: 20, quantity: 234,
        cutsCount: 20, cuttingPrice: 1500, cuttingTotal: 30000,
        unitPrice: 8250, discount: 0, total: 1960500,
      },
      {
        productId: 'p40', productName: 'Швеллер №10П 12м', sku: '302', unit: 'metr',
        pieceSize: '12 m', pieceCount: 2, quantity: 24,
        cutsCount: 2, cuttingPrice: 8000, cuttingTotal: 16000,
        unitPrice: 87800, discount: 0, total: 2123200,
      },
    ],
    subtotal: 4083700, cuttingServiceTotal: 46000, discount: 0, total: 4083700, paymentMethod: 'payme', amountPaid: 4083700, change: 0, status: 'yakunlangan'
  },
];

// ============================================================
// STOCK MOVEMENTS
// ============================================================
export const stockMovements: StockMovement[] = [
  { id: 'sm1', type: 'kirim', date: '2026-11-05T09:00:00', productId: 'p13', productName: 'Сетка 2.4сим 15\\15', quantity: 250, toBranchId: 'b1', toBranchName: 'Asosiy (OOO "TEMIRCHI")', userId: 'e5', userName: 'Sherzod Qodirov', note: 'Озим усд sexidan yangi partiya' },
  { id: 'sm2', type: 'kirim', date: '2026-11-05T09:30:00', productId: 'p6', productName: '16Ар бек А400 11,70', quantity: 1170, toBranchId: 'b1', toBranchName: 'Asosiy (OOO "TEMIRCHI")', userId: 'e5', userName: 'Sherzod Qodirov', note: 'Бекабод Металл (100 shtuk x 11.7m)' },
  { id: 'sm3', type: 'kirim', date: '2026-11-06T11:00:00', productId: 'p10', productName: '40/40пр 1,5/1,55ст', quantity: 500, toBranchId: 'b1', toBranchName: 'Asosiy (OOO "TEMIRCHI")', userId: 'e5', userName: 'Sherzod Qodirov', note: 'ТТЗ Металл Профиль (50 shtuk x 10m)' },
  { id: 'sm4', type: 'chiqim', date: '2026-11-07T09:15:00', productId: 'p6', productName: '16Ар бек А400 11,70', quantity: -100, fromBranchId: 'b1', fromBranchName: 'Asosiy (OOO "TEMIRCHI")', userId: 'e3', userName: 'KACCA 1.', note: 'Savdo #3101', referenceId: 'sa1' },
];

// ============================================================
// PURCHASES
// ============================================================
export const purchases: Purchase[] = [
  {
    id: 'pu1', date: '2026-11-05', supplierId: 's1', supplierName: 'Озим усд', branchId: 'b1',
    items: [
      { productId: 'p13', productName: 'Сетка 2.4сим 15\\15', quantity: 250, purchasePrice: 15250, discount: 0, total: 3812500 },
      { productId: 'p14', productName: 'Сетка 2.4сим 20\\20', quantity: 200, purchasePrice: 11224, discount: 0, total: 2244800 },
    ],
    subtotal: 6057300, discount: 0, total: 6057300, status: 'qabul_qilindi', createdAt: '2026-11-05T09:00:00'
  },
  {
    id: 'pu2', date: '2026-11-06', supplierId: 's2', supplierName: 'Бекабод Металл (Узметкомбинат)', branchId: 'b1',
    items: [
      { productId: 'p6', productName: '16Ар бек А400 11,70', quantity: 1170, purchasePrice: 12800, discount: 0, total: 14976000 },
      { productId: 'p11', productName: '40уголок кичик', quantity: 600, purchasePrice: 14100, discount: 0, total: 8460000 },
    ],
    subtotal: 23436000, discount: 0, total: 23436000, status: 'qabul_qilindi', createdAt: '2026-11-06T10:00:00'
  },
];

// ============================================================
// DAILY SALES CHART DATA
// ============================================================
export const dailySalesData: DailySalesData[] = [
  { date: '02-Noy', amount: 18850000, count: 18 },
  { date: '03-Noy', amount: 24120000, count: 24 },
  { date: '04-Noy', amount: 19650000, count: 19 },
  { date: '05-Noy', amount: 31480000, count: 31 },
  { date: '06-Noy', amount: 26940000, count: 22 },
  { date: '07-Noy', amount: 29250000, count: 27 },
];
