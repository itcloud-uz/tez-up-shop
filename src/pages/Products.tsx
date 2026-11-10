import { useState, useEffect } from 'react';
import {
  Plus, Search, Edit2, Trash2, Download, Upload, Barcode,
  Star, Image as ImageIcon, X, Keyboard, ChevronDown, SlidersHorizontal, Scissors
} from 'lucide-react';
import { Pagination } from '../components/ui/Table';
import { Button } from '../components/ui/Button';
import { Modal, ConfirmModal } from '../components/ui/Modal';
import { useStore } from '../store/useStore';
import { formatOptimoNumber, USD_RATE, exportToCSV, clsx } from '../utils/format';
import type { Product, UnitType } from '../types';

const PAGE_SIZE = 20;
const UNITS: { value: UnitType; label: string }[] = [
  { value: 'dona', label: 'Dona (sht)' },
  { value: 'metr', label: 'Metr (m)' },
  { value: 'kv.m', label: 'Kvadrat metr (kv.m / m²)' },
  { value: 'kg', label: 'Kilogram (kg)' },
  { value: 'tonna', label: 'Tonna (t)' },
  { value: 'quti', label: 'Quti / Pachka' },
  { value: 'juft', label: 'Juft' },
];

interface FormData {
  name: string;
  sku: string;
  barcode: string;
  categoryId: string;
  supplierId: string;
  unit: UnitType;
  currency: 'USD' | 'UZS';
  inputPurchasePrice: string;
  inputSalePrice: string;
  inputWholesalePrice: string;
  cuttingPrice: string;
  defaultLength: string;
  defaultWidth: string;
  stock: string;
  minStock: string;
  taxRate: number;
  description: string;
  hasDescription: boolean;
  status: 'active' | 'inactive';
  image: string;
}

const EMPTY_FORM: FormData = {
  name: '',
  sku: '',
  barcode: '',
  categoryId: '',
  supplierId: '',
  unit: 'metr',
  currency: 'USD',
  inputPurchasePrice: '1.00',
  inputSalePrice: '1.20',
  inputWholesalePrice: '1.15',
  cuttingPrice: '2000',
  defaultLength: '11.7',
  defaultWidth: '1.5',
  stock: '0',
  minStock: '10',
  taxRate: 0,
  description: '',
  hasDescription: false,
  status: 'active',
  image: '',
};

const TOUCH_KEYBOARD_ROWS = [
  ['1', '2', '3', '4', '5', '6', '7', '8', '9', '0', '-', '\\'],
  ['й', 'ц', 'у', 'к', 'е', 'н', 'г', 'ш', 'щ', 'з', 'х', 'ъ'],
  ['ф', 'ы', 'в', 'а', 'п', 'р', 'о', 'л', 'д', 'ж', 'э', '/'],
  ['я', 'ч', 'с', 'м', 'и', 'т', 'ь', 'б', 'ю', 'ё', ',', '.'],
];

export function Products() {
  const {
    products,
    categories,
    suppliers,
    addProduct,
    updateProduct,
    deleteProduct,
    deleteProductsBulk,
    toggleProductFavorite,
    showToast,
  } = useStore();

  // Inline Column Filters (matching Optimo Screenshot 5)
  const [nameFilter, setNameFilter] = useState('');
  const [supplierFilter, setSupplierFilter] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('');
  const [stockFilter, setStockFilter] = useState('');
  const [onlyFavorites, setOnlyFavorites] = useState(false);
  const [marginMode, setMarginMode] = useState<'amount' | 'percent'>('amount');
  const [page, setPage] = useState(1);

  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [bulkDeleteOpen, setBulkDeleteOpen] = useState(false);

  // Full-screen Optimo Editor state (Screenshot 1)
  const [editorOpen, setEditorOpen] = useState(false);
  const [editProduct, setEditProduct] = useState<Product | null>(null);
  const [form, setForm] = useState<FormData>(EMPTY_FORM);
  const [errors, setErrors] = useState<Partial<Record<keyof FormData, string>>>({});
  const [activeField, setActiveField] = useState<'name' | 'sku' | 'inputPurchasePrice' | 'inputSalePrice' | 'stock'>('name');
  const [showVirtualKeyboard, setShowVirtualKeyboard] = useState(true);

  const [importModalOpen, setImportModalOpen] = useState(false);
  const [deleteId, setDeleteId] = useState<string | null>(null);

  // Escape key closes full-screen editor
  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && editorOpen) {
        setEditorOpen(false);
      }
    };
    window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
  }, [editorOpen]);

  const filtered = products.filter(p => {
    const q = nameFilter.trim().toLowerCase();
    const matchName =
      !q ||
      p.name.toLowerCase().includes(q) ||
      p.sku.toLowerCase().includes(q) ||
      p.barcode.toLowerCase().includes(q);

    const supName = (suppliers.find(s => s.id === p.supplierId)?.name || '').toLowerCase();
    const matchSup = !supplierFilter.trim() || supName.includes(supplierFilter.trim().toLowerCase());

    const catName = (categories.find(c => c.id === p.categoryId)?.name || '').toLowerCase();
    const matchCat = !categoryFilter.trim() || catName.includes(categoryFilter.trim().toLowerCase()) || p.categoryId === categoryFilter;

    const matchFav = !onlyFavorites || !!p.isFavorite;

    const matchStock =
      !stockFilter ||
      (stockFilter === 'low'
        ? p.stock > 0 && p.stock <= p.minStock
        : stockFilter === 'out'
        ? p.stock === 0
        : p.stock > p.minStock);

    return matchName && matchSup && matchCat && matchFav && matchStock;
  });

  const totalPages = Math.ceil(filtered.length / PAGE_SIZE) || 1;
  const paged = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  const toggleSelectAll = () => {
    const pageIds = paged.map(p => p.id);
    const allSelected = pageIds.every(id => selectedIds.includes(id));
    if (allSelected) {
      setSelectedIds(selectedIds.filter(id => !pageIds.includes(id)));
    } else {
      setSelectedIds(Array.from(new Set([...selectedIds, ...pageIds])));
    }
  };

  const toggleSelectOne = (id: string) => {
    setSelectedIds(prev => (prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]));
  };

  const openAdd = () => {
    setEditProduct(null);
    setForm({
      ...EMPTY_FORM,
      sku: String(170 + products.length + 1),
      barcode: `478000000${String(products.length + 101)}`,
      categoryId: categories[0]?.id || '',
      supplierId: suppliers[0]?.id || '',
      currency: 'USD',
      inputPurchasePrice: '1.25',
      inputSalePrice: '1.40',
      inputWholesalePrice: '1.35',
      stock: '100',
      minStock: '10',
    });
    setErrors({});
    setEditorOpen(true);
  };

  const openEdit = (p: Product) => {
    setEditProduct(p);
    const cur = p.currency || 'UZS';
    const buyVal = cur === 'USD' && p.usdPurchasePrice ? p.usdPurchasePrice : p.purchasePrice;
    const sellVal = cur === 'USD' && p.usdSalePrice ? p.usdSalePrice : p.salePrice;
    const wholeVal = cur === 'USD' && p.usdSalePrice ? +(p.usdSalePrice * 0.97).toFixed(2) : (p.wholesalePrice || p.salePrice);

    setForm({
      name: p.name,
      sku: p.sku,
      barcode: p.barcode,
      categoryId: p.categoryId,
      supplierId: p.supplierId,
      unit: p.unit,
      currency: cur,
      inputPurchasePrice: String(buyVal),
      inputSalePrice: String(sellVal),
      inputWholesalePrice: String(wholeVal),
      cuttingPrice: String(p.cuttingPrice ?? 2000),
      defaultLength: String(p.defaultLength ?? (p.unit === 'metr' ? 11.7 : 2.5)),
      defaultWidth: String(p.defaultWidth ?? 1.5),
      stock: String(p.stock),
      minStock: String(p.minStock),
      taxRate: p.taxRate,
      description: p.description || '',
      hasDescription: Boolean(p.description),
      status: p.status,
      image: p.image || '',
    });
    setErrors({});
    setEditorOpen(true);
  };

  const handleEditSelectedToolbar = () => {
    if (selectedIds.length === 1) {
      const target = products.find(p => p.id === selectedIds[0]);
      if (target) openEdit(target);
    } else if (paged.length > 0) {
      openEdit(paged[0]);
    }
  };

  const validate = (): boolean => {
    const e: Partial<Record<keyof FormData, string>> = {};
    if (!form.name.trim()) e.name = 'Ism kiritilishi shart';
    if (!form.sku.trim()) e.sku = 'Shtrix-kod/SKU kiritilishi shart';
    if (!form.categoryId) e.categoryId = 'Kategoriya tanlanishi shart';
    const buy = parseFloat(form.inputPurchasePrice);
    const sell = parseFloat(form.inputSalePrice);
    if (isNaN(buy) || buy < 0) e.inputPurchasePrice = "Noto'g'ri narx";
    if (isNaN(sell) || sell <= 0) e.inputSalePrice = "Sotish narxi 0 dan katta bo'lishi shart";
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSave = () => {
    if (!validate()) return;
    const rawBuy = parseFloat(form.inputPurchasePrice) || 0;
    const rawSell = parseFloat(form.inputSalePrice) || 0;
    const rawWhole = parseFloat(form.inputWholesalePrice) || rawSell;

    const isUSD = form.currency === 'USD';
    const purchasePriceUZS = isUSD ? Math.round(rawBuy * USD_RATE) : rawBuy;
    const salePriceUZS = isUSD ? Math.round(rawSell * USD_RATE) : rawSell;
    const wholesalePriceUZS = isUSD ? Math.round(rawWhole * USD_RATE) : rawWhole;

    const payload: Omit<Product, 'id' | 'createdAt'> = {
      name: form.name.trim(),
      sku: form.sku.trim(),
      barcode: form.barcode.trim() || form.sku.trim(),
      categoryId: form.categoryId,
      supplierId: form.supplierId,
      unit: form.unit,
      currency: form.currency,
      usdPurchasePrice: isUSD ? rawBuy : undefined,
      usdSalePrice: isUSD ? rawSell : undefined,
      purchasePrice: purchasePriceUZS,
      salePrice: salePriceUZS,
      wholesalePrice: wholesalePriceUZS,
      cuttingPrice: parseFloat(form.cuttingPrice) || 0,
      defaultLength: parseFloat(form.defaultLength) || undefined,
      defaultWidth: form.unit === 'kv.m' ? (parseFloat(form.defaultWidth) || undefined) : undefined,
      stock: parseFloat(form.stock) || 0,
      minStock: parseFloat(form.minStock) || 0,
      taxRate: form.taxRate,
      description: form.hasDescription ? form.description : '',
      status: form.status,
      image: form.image,
      isFavorite: editProduct?.isFavorite ?? false,
    };

    if (editProduct) {
      updateProduct(editProduct.id, payload);
      showToast('success', `"${form.name}" muvaffaqiyatli saqlandi`);
    } else {
      addProduct(payload);
      showToast('success', `"${form.name}" katalogga qo'shildi`);
    }
    setEditorOpen(false);
  };

  const handleBulkDelete = () => {
    deleteProductsBulk(selectedIds);
    showToast('success', `${selectedIds.length} ta mahsulot o'chirildi`);
    setSelectedIds([]);
    setBulkDeleteOpen(false);
  };

  const handleExportCSV = () => {
    exportToCSV(
      'temirchi_mahsulotlar.csv',
      ['Nom', 'Shtrix-kod/SKU', 'Distribyutor', 'Kategoriya', 'Miqdori', 'Birlik', 'Valyuta', 'Sotib olish narxi', 'Sotish narxi'],
      filtered.map(p => [
        p.name,
        p.sku,
        suppliers.find(s => s.id === p.supplierId)?.name || '',
        categories.find(c => c.id === p.categoryId)?.name || '',
        p.stock,
        p.unit,
        p.currency || 'UZS',
        p.currency === 'USD' && p.usdPurchasePrice ? p.usdPurchasePrice : p.purchasePrice,
        p.currency === 'USD' && p.usdSalePrice ? p.usdSalePrice : p.salePrice,
      ]),
    );
    showToast('success', 'CSV fayl yuklab olindi');
  };

  const handleVirtualKey = (key: string) => {
    if (key === 'BACKSPACE') {
      setForm(prev => ({
        ...prev,
        [activeField]: String(prev[activeField]).slice(0, -1),
      }));
      return;
    }
    if (key === 'SPACE') {
      setForm(prev => ({
        ...prev,
        [activeField]: String(prev[activeField]) + ' ',
      }));
      return;
    }
    setForm(prev => ({
      ...prev,
      [activeField]: String(prev[activeField]) + key,
    }));
  };

  // Full-Screen Product Edit / Create View (Screenshot 1: dashboard.optimo.uz/inventory/edit/6139)
  if (editorOpen) {
    const rawBuy = parseFloat(form.inputPurchasePrice) || 0;
    const rawSell = parseFloat(form.inputSalePrice) || 0;
    const markupPercent = rawBuy > 0 ? (((rawSell - rawBuy) / rawBuy) * 100).toFixed(1) : '0.0';

    return (
      <div className="fixed inset-0 z-50 bg-[#f5f6fa] flex flex-col overflow-y-auto select-none">
        {/* Top Bar matching Screenshot 1 */}
        <div className="h-14 bg-white border-b border-gray-200 px-6 flex items-center justify-between shrink-0 sticky top-0 z-20">
          <button
            onClick={() => setEditorOpen(false)}
            className="flex items-center gap-1.5 text-gray-600 hover:text-gray-900 font-medium text-sm cursor-pointer px-2 py-1 rounded hover:bg-gray-100"
          >
            <X size={20} />
            <span className="text-xs text-gray-400">(Esc)</span>
          </button>

          <h2 className="font-bold text-gray-800 text-base">
            {editProduct ? 'Mahsulotni tahrirlash' : "Yangi mahsulot qo'shish"}
          </h2>

          <button
            onClick={handleSave}
            className="bg-[#3f51b5] hover:bg-[#303f9f] text-white font-semibold text-sm px-7 py-2 rounded-md shadow-xs transition-colors cursor-pointer"
          >
            Saqlash
          </button>
        </div>

        {/* Main Form Content */}
        <div className="max-w-5xl w-full mx-auto px-6 py-6 flex-1 space-y-6">
          <div className="bg-white rounded-xl border border-gray-200/90 p-6 shadow-2xs">
            <div className="flex items-center justify-between mb-5">
              <h3 className="font-bold text-gray-800 text-base">Umumiy ma'lumot</h3>
              <button
                type="button"
                onClick={() => setShowVirtualKeyboard(!showVirtualKeyboard)}
                className={clsx(
                  'inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium border transition-colors cursor-pointer',
                  showVirtualKeyboard
                    ? 'bg-indigo-50 border-indigo-200 text-indigo-700'
                    : 'bg-gray-50 border-gray-200 text-gray-600 hover:bg-gray-100',
                )}
              >
                <Keyboard size={15} />
                <span>Ekran klaviaturasi</span>
              </button>
            </div>

            {/* 3-Column Layout exactly like Screenshot 1 */}
            <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-start">
              {/* Column 1: Ism*, Shtrix-kod/SKU*, Birlik o'lchovi*, Tavsif qo'shing */}
              <div className="md:col-span-4 space-y-4">
                <div>
                  <label className="block text-xs font-semibold text-gray-600 mb-1.5">
                    Ism<span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={form.name}
                    onFocus={() => setActiveField('name')}
                    onChange={e => setForm({ ...form, name: e.target.value })}
                    placeholder="Masalan: Сетка 2.4сим 15\15"
                    className={clsx(
                      'w-full h-10 px-3 rounded-md border text-sm bg-white focus:outline-none transition-colors',
                      activeField === 'name' ? 'border-[#3f51b5] ring-2 ring-[#3f51b5]/15' : 'border-gray-300',
                      errors.name && 'border-red-500',
                    )}
                  />
                  {errors.name && <p className="text-xs text-red-500 mt-1">{errors.name}</p>}
                </div>

                <div>
                  <label className="block text-xs font-semibold text-gray-600 mb-1.5">
                    Shtrix-kod/SKU<span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <input
                      type="text"
                      value={form.sku}
                      onFocus={() => setActiveField('sku')}
                      onChange={e => setForm({ ...form, sku: e.target.value })}
                      placeholder="172"
                      className={clsx(
                        'w-full h-10 pl-3 pr-9 rounded-md border text-sm bg-white focus:outline-none transition-colors',
                        activeField === 'sku' ? 'border-[#3f51b5] ring-2 ring-[#3f51b5]/15' : 'border-gray-300',
                        errors.sku && 'border-red-500',
                      )}
                    />
                    <button
                      type="button"
                      onClick={() => setForm({ ...form, sku: String(Math.floor(100 + Math.random() * 900)) })}
                      title="Avtomatik kod generatsiya qilish"
                      className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-700 cursor-pointer"
                    >
                      <Barcode size={16} />
                    </button>
                  </div>
                  {errors.sku && <p className="text-xs text-red-500 mt-1">{errors.sku}</p>}
                </div>

                <div>
                  <label className="block text-xs font-semibold text-gray-600 mb-1.5">
                    Birlik o'lchovi<span className="text-red-500">*</span>
                  </label>
                  <select
                    value={form.unit}
                    onChange={e => setForm({ ...form, unit: e.target.value as UnitType })}
                    className="w-full h-10 px-3 rounded-md border border-gray-300 text-sm bg-white focus:outline-none focus:border-[#3f51b5]"
                  >
                    {UNITS.map(u => (
                      <option key={u.value} value={u.value}>{u.label}</option>
                    ))}
                  </select>
                </div>

                <div className="pt-1">
                  <label className="inline-flex items-center gap-2 text-xs text-gray-600 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={form.hasDescription}
                      onChange={e => setForm({ ...form, hasDescription: e.target.checked })}
                      className="w-4 h-4 rounded border-gray-300 text-[#3f51b5]"
                    />
                    <span>Tavsif qo'shing</span>
                  </label>
                  {form.hasDescription && (
                    <textarea
                      rows={2}
                      value={form.description}
                      onChange={e => setForm({ ...form, description: e.target.value })}
                      placeholder="Mahsulot haqida qo'shimcha izoh..."
                      className="mt-2 w-full p-2.5 rounded-md border border-gray-300 text-sm bg-white focus:outline-none focus:border-[#3f51b5]"
                    />
                  )}
                </div>
              </div>

              {/* Column 2: Kategoriya*, Distribyutor*, Valyuta* (1 USD = 12,200.00 UZS) */}
              <div className="md:col-span-4 space-y-4">
                <div>
                  <label className="block text-xs font-semibold text-gray-600 mb-1.5">
                    Kategoriya<span className="text-red-500">*</span>
                  </label>
                  <select
                    value={form.categoryId}
                    onChange={e => setForm({ ...form, categoryId: e.target.value })}
                    className="w-full h-10 px-3 rounded-md border border-gray-300 text-sm bg-white focus:outline-none focus:border-[#3f51b5]"
                  >
                    {categories.map(c => (
                      <option key={c.id} value={c.id}>{c.name}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-gray-600 mb-1.5">
                    Distribyutor<span className="text-red-500">*</span>
                  </label>
                  <select
                    value={form.supplierId}
                    onChange={e => setForm({ ...form, supplierId: e.target.value })}
                    className="w-full h-10 px-3 rounded-md border border-gray-300 text-sm bg-white focus:outline-none focus:border-[#3f51b5]"
                  >
                    {suppliers.map(s => (
                      <option key={s.id} value={s.id}>{s.name}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-gray-600 mb-1.5">
                    Valyuta<span className="text-red-500">*</span>
                  </label>
                  <select
                    value={form.currency}
                    onChange={e => setForm({ ...form, currency: e.target.value as 'USD' | 'UZS' })}
                    className="w-full h-10 px-3 rounded-md border border-gray-300 text-sm bg-white focus:outline-none focus:border-[#3f51b5]"
                  >
                    <option value="USD">USD</option>
                    <option value="UZS">UZS</option>
                  </select>
                  <p className="text-xs font-semibold text-gray-600 mt-1.5">
                    1 USD = {formatOptimoNumber(USD_RATE, 2)} UZS
                  </p>
                </div>
              </div>

              {/* Column 3: Dashed Rasm yuklash box */}
              <div className="md:col-span-4 flex flex-col items-start">
                <label className="w-56 h-44 border-2 border-dashed border-gray-300 hover:border-[#3f51b5] rounded-lg bg-[#f9fafc] flex flex-col items-center justify-center cursor-pointer transition-colors group">
                  <div className="w-12 h-10 rounded bg-gray-700 text-white flex items-center justify-center mb-2 group-hover:bg-[#3f51b5] transition-colors">
                    <ImageIcon size={22} />
                  </div>
                  <span className="text-sm font-semibold text-gray-700">Rasm yuklash</span>
                  <input
                    type="file"
                    accept=".jpg,.jpeg,.png"
                    className="hidden"
                    onChange={() => showToast('info', 'Rasm tanlandi')}
                  />
                </label>
                <p className="text-[11px] text-gray-500 mt-2 max-w-56 leading-relaxed">
                  Minimal ruxsat etilgan o'lchamlar 290x244px (.jpg, .jpeg, .png)
                </p>
              </div>
            </div>

            {/* Price & Stock Section */}
            <div className="mt-6 pt-5 border-t border-gray-200 grid grid-cols-2 sm:grid-cols-5 gap-4">
              <div>
                <label className="block text-xs font-semibold text-gray-600 mb-1.5">
                  Sotib olish narxi ({form.currency})*
                </label>
                <input
                  type="number"
                  step="0.01"
                  value={form.inputPurchasePrice}
                  onFocus={() => setActiveField('inputPurchasePrice')}
                  onChange={e => setForm({ ...form, inputPurchasePrice: e.target.value })}
                  className="w-full h-10 px-3 rounded-md border border-gray-300 text-sm bg-white focus:outline-none focus:border-[#3f51b5]"
                />
                {form.currency === 'USD' && (
                  <p className="text-[11px] text-gray-400 mt-1">
                    ≈ {formatOptimoNumber(rawBuy * USD_RATE, 2)} UZS
                  </p>
                )}
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-600 mb-1.5">
                  Ustama (%)
                </label>
                <input
                  type="text"
                  readOnly
                  value={`${markupPercent}%`}
                  className="w-full h-10 px-3 rounded-md border border-gray-200 text-sm bg-gray-50 text-gray-600 font-semibold"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-600 mb-1.5">
                  Sotish narxi ({form.currency})*
                </label>
                <input
                  type="number"
                  step="0.01"
                  value={form.inputSalePrice}
                  onFocus={() => setActiveField('inputSalePrice')}
                  onChange={e => setForm({ ...form, inputSalePrice: e.target.value })}
                  className="w-full h-10 px-3 rounded-md border border-gray-300 text-sm bg-white font-semibold text-[#3f51b5] focus:outline-none focus:border-[#3f51b5]"
                />
                {form.currency === 'USD' && (
                  <p className="text-[11px] text-indigo-600 font-medium mt-1">
                    Kassada: {formatOptimoNumber(rawSell * USD_RATE, 2)} UZS
                  </p>
                )}
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-600 mb-1.5">
                  Miqdori ({form.unit})
                </label>
                <input
                  type="number"
                  step="0.01"
                  value={form.stock}
                  onFocus={() => setActiveField('stock')}
                  onChange={e => setForm({ ...form, stock: e.target.value })}
                  className="w-full h-10 px-3 rounded-md border border-gray-300 text-sm bg-white focus:outline-none focus:border-[#3f51b5]"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-600 mb-1.5">
                  Minimal qoldiq
                </label>
                <input
                  type="number"
                  value={form.minStock}
                  onChange={e => setForm({ ...form, minStock: e.target.value })}
                  className="w-full h-10 px-3 rounded-md border border-gray-300 text-sm bg-white focus:outline-none focus:border-[#3f51b5]"
                />
              </div>
            </div>

            {/* Cutting Service Price & Metal Dimensions (Bo'yi, Eni, kv.m) */}
            <div className="mt-5 pt-5 border-t border-gray-200 bg-indigo-50/40 -mx-6 -mb-6 p-6 rounded-b-xl">
              <h4 className="text-xs font-bold uppercase text-indigo-900 mb-3 flex items-center gap-1.5">
                <Scissors size={15} className="text-indigo-600" />
                <span>Temir o'lchamlari (Metr / Kvadrat m²) va Kesib berish xizmati</span>
              </h4>
              <div className="grid grid-cols-1 sm:grid-cols-4 gap-4 items-start">
                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1.5">
                    Kesib berish xizmat narxi (1 kesish, UZS)*
                  </label>
                  <input
                    type="number"
                    step="500"
                    value={form.cuttingPrice}
                    onChange={e => setForm({ ...form, cuttingPrice: e.target.value })}
                    placeholder="Masalan: 2000"
                    className="w-full h-10 px-3 rounded-md border border-indigo-300 text-sm bg-white font-bold text-gray-900 focus:outline-none focus:border-[#3f51b5]"
                  />
                  <div className="flex gap-1 mt-1.5">
                    {[1500, 2000, 3000, 5000, 10000].map(val => (
                      <button
                        key={val}
                        type="button"
                        onClick={() => setForm({ ...form, cuttingPrice: String(val) })}
                        className="px-1.5 py-0.5 text-[10px] font-semibold bg-white border border-gray-200 rounded hover:border-indigo-400 cursor-pointer"
                      >
                        {val / 1000}k
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1.5">
                    Standart uzunligi / Bo'yi (metr)
                  </label>
                  <input
                    type="number"
                    step="0.1"
                    value={form.defaultLength}
                    onChange={e => setForm({ ...form, defaultLength: e.target.value })}
                    placeholder="Masalan: 11.7 yoki 6"
                    className="w-full h-10 px-3 rounded-md border border-gray-300 text-sm bg-white focus:outline-none focus:border-[#3f51b5]"
                  />
                  <div className="flex gap-1 mt-1.5">
                    {[6, 9, 10, 11.7, 12].map(len => (
                      <button
                        key={len}
                        type="button"
                        onClick={() => setForm({ ...form, defaultLength: String(len) })}
                        className="px-1.5 py-0.5 text-[10px] font-semibold bg-white border border-gray-200 rounded hover:border-indigo-400 cursor-pointer"
                      >
                        {len}m
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1.5">
                    Standart eni (metr — List/Setka kv.m uchun)
                  </label>
                  <input
                    type="number"
                    step="0.05"
                    value={form.defaultWidth}
                    onChange={e => setForm({ ...form, defaultWidth: e.target.value })}
                    placeholder="Masalan: 1.5 yoki 1.25"
                    className="w-full h-10 px-3 rounded-md border border-gray-300 text-sm bg-white focus:outline-none focus:border-[#3f51b5]"
                  />
                  <div className="flex gap-1 mt-1.5">
                    {[1.0, 1.25, 1.5, 2.0].map(w => (
                      <button
                        key={w}
                        type="button"
                        onClick={() => setForm({ ...form, defaultWidth: String(w) })}
                        className="px-1.5 py-0.5 text-[10px] font-semibold bg-white border border-gray-200 rounded hover:border-indigo-400 cursor-pointer"
                      >
                        {w}m
                      </button>
                    ))}
                  </div>
                </div>

                <div className="bg-white rounded-lg border border-indigo-200 p-3">
                  <p className="text-[11px] text-gray-500 font-medium">1 dona (list/shtuk) o'lchami:</p>
                  {form.unit === 'kv.m' ? (
                    <>
                      <p className="text-sm font-extrabold text-indigo-700 mt-0.5">
                        {form.defaultWidth || 1} m × {form.defaultLength || 1} m ={' '}
                        {((parseFloat(form.defaultWidth) || 1) * (parseFloat(form.defaultLength) || 1)).toFixed(2)} kv.m
                      </p>
                      <p className="text-[11px] text-gray-500 mt-0.5">
                        Kesish xizmati: {formatOptimoNumber(parseFloat(form.cuttingPrice) || 0, 0)} UZS
                      </p>
                    </>
                  ) : (
                    <>
                      <p className="text-sm font-extrabold text-indigo-700 mt-0.5">
                        1 shtuk = {form.defaultLength || 1} {form.unit}
                      </p>
                      <p className="text-[11px] text-gray-500 mt-0.5">
                        Kesish xizmati: {formatOptimoNumber(parseFloat(form.cuttingPrice) || 0, 0)} UZS / kesish
                      </p>
                    </>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* On-Screen Touch Keyboard matching Screenshot 1 */}
          {showVirtualKeyboard && (
            <div className="bg-[#e5e7eb] border border-gray-300 rounded-xl p-3 shadow-inner max-w-4xl mx-auto">
              <div className="flex items-center justify-between px-2 pb-2 text-xs text-gray-500">
                <span className="font-medium">
                  Faol maydon: <strong className="text-gray-800">{activeField === 'name' ? 'Ism' : activeField === 'sku' ? 'Shtrix-kod/SKU' : 'Qiymat'}</strong>
                </span>
                <button
                  type="button"
                  onClick={() => setShowVirtualKeyboard(false)}
                  className="text-gray-500 hover:text-gray-800 cursor-pointer"
                >
                  <X size={16} />
                </button>
              </div>
              <div className="space-y-1.5">
                <div className="flex flex-wrap gap-1.5 pb-1">
                  {['Ар бек ', 'пр ', 'уголок ', 'лист ', 'труба ', 'Сетка ', 'Швеллер ', '11,70', '6м', '10м', '12м', '15\\15'].map(tag => (
                    <button
                      key={tag}
                      type="button"
                      onClick={() => handleVirtualKey(tag)}
                      className="px-2.5 py-1.5 bg-indigo-50 hover:bg-indigo-100 text-indigo-800 rounded text-xs font-bold cursor-pointer border border-indigo-200/70"
                    >
                      +{tag.trim()}
                    </button>
                  ))}
                </div>
                {TOUCH_KEYBOARD_ROWS.map((row, rIdx) => (
                  <div key={rIdx} className="grid grid-cols-12 gap-1.5">
                    {row.map(ch => (
                      <button
                        key={ch}
                        type="button"
                        onClick={() => handleVirtualKey(ch)}
                        className="h-11 bg-white hover:bg-gray-50 active:bg-gray-200 rounded shadow-2xs text-sm font-medium text-gray-800 flex items-center justify-center cursor-pointer transition-colors"
                      >
                        {ch}
                      </button>
                    ))}
                  </div>
                ))}
                <div className="grid grid-cols-12 gap-1.5 pt-0.5">
                  <button
                    type="button"
                    onClick={() => handleVirtualKey('15\\15')}
                    className="col-span-2 h-11 bg-gray-100 hover:bg-white rounded text-xs font-semibold text-gray-700 cursor-pointer"
                  >
                    15\15
                  </button>
                  <button
                    type="button"
                    onClick={() => handleVirtualKey('20\\20')}
                    className="col-span-2 h-11 bg-gray-100 hover:bg-white rounded text-xs font-semibold text-gray-700 cursor-pointer"
                  >
                    20\20
                  </button>
                  <button
                    type="button"
                    onClick={() => handleVirtualKey('SPACE')}
                    className="col-span-5 h-11 bg-white hover:bg-gray-50 rounded text-xs font-medium text-gray-600 cursor-pointer"
                  >
                    Probel (Bo'sh joy)
                  </button>
                  <button
                    type="button"
                    onClick={() => handleVirtualKey('BACKSPACE')}
                    className="col-span-3 h-11 bg-amber-50 hover:bg-amber-100 text-amber-900 rounded text-xs font-semibold cursor-pointer"
                  >
                    ⌫ O'chirish
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {/* Top Action Icon Buttons Row (Screenshot 5: Edit, Delete, Barcode, Import, Add Product) */}
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <button
            onClick={handleEditSelectedToolbar}
            title="Tanlangan mahsulotni tahrirlash"
            className="w-12 h-9 rounded-md bg-[#e2e6ef] hover:bg-[#d3d9e6] text-gray-700 flex items-center justify-center transition-colors cursor-pointer"
          >
            <Edit2 size={16} />
          </button>
          <button
            onClick={() => {
              if (selectedIds.length > 0) setBulkDeleteOpen(true);
              else showToast('warning', "O'chirish uchun avval jadvaldan mahsulot belgilang");
            }}
            title="Tanlangan mahsulotlarni o'chirish"
            className="w-12 h-9 rounded-md bg-[#e2e6ef] hover:bg-red-100 hover:text-red-600 text-gray-700 flex items-center justify-center transition-colors cursor-pointer"
          >
            <Trash2 size={16} />
          </button>
          <button
            onClick={() => showToast('info', 'Shtrix-kod yorliqlari chop etishga tayyorlandi')}
            title="Shtrix-kod chop etish"
            className="w-12 h-9 rounded-md bg-[#e2e6ef] hover:bg-[#d3d9e6] text-gray-700 flex items-center justify-center transition-colors cursor-pointer"
          >
            <Barcode size={17} />
          </button>
          <button
            onClick={() => setImportModalOpen(true)}
            title="CSV Import"
            className="relative w-12 h-9 rounded-md bg-[#e2e6ef] hover:bg-[#d3d9e6] text-gray-700 flex items-center justify-center transition-colors cursor-pointer"
          >
            <Upload size={16} />
            <span className="absolute -top-1 -right-1 w-2.5 h-2.5 rounded-full bg-red-500 border border-white" />
          </button>
          <button
            onClick={openAdd}
            title="Yangi mahsulot qo'shish"
            className="h-9 px-3.5 rounded-md bg-[#e2e6ef] hover:bg-[#3f51b5] hover:text-white text-gray-800 font-semibold text-xs flex items-center gap-1.5 transition-colors cursor-pointer"
          >
            <Plus size={16} />
            <span>Yangi mahsulot</span>
          </button>
        </div>

        <div className="flex items-center gap-2 text-xs text-gray-500">
          <span>Jami: <strong className="text-gray-800">{filtered.length}</strong> ta mahsulot</span>
          <button
            onClick={handleExportCSV}
            className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded bg-white border border-gray-200 hover:bg-gray-50 text-gray-700 font-medium cursor-pointer"
          >
            <Download size={13} /> CSV Eksport
          </button>
        </div>
      </div>

      {/* Dense Optimo Inventory Table (Screenshot 5) */}
      <div className="bg-white border border-gray-200 rounded-lg shadow-2xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-[13px] border-collapse">
            <thead>
              {/* Row 1: Column Headers */}
              <tr className="bg-[#f8f9fc] border-b border-gray-200 text-gray-700 font-bold">
                <th className="py-2.5 px-3 w-9 text-center">
                  <input
                    type="checkbox"
                    checked={paged.length > 0 && paged.every(p => selectedIds.includes(p.id))}
                    onChange={toggleSelectAll}
                    className="w-4 h-4 rounded border-gray-300 text-[#3f51b5] cursor-pointer"
                  />
                </th>
                <th className="py-2.5 px-2 w-8 text-center">
                  <button
                    onClick={() => setOnlyFavorites(!onlyFavorites)}
                    title="Sevimli (Asosiy) mahsulotlar"
                    className="cursor-pointer text-gray-400 hover:text-amber-500"
                  >
                    <Star size={15} className={onlyFavorites ? 'fill-amber-400 text-amber-400' : ''} />
                  </button>
                </th>
                <th className="py-2.5 px-2 w-10 text-center text-gray-400">
                  <ImageIcon size={15} className="mx-auto" />
                </th>
                <th className="text-left py-2.5 px-3 min-w-52">Nom/Shtrix-kod</th>
                <th className="text-left py-2.5 px-3 min-w-32">Distribyutor</th>
                <th className="text-left py-2.5 px-3 min-w-28">Kategoriya</th>
                <th className="text-right py-2.5 px-3 min-w-28">Miqdori</th>
                <th className="text-right py-2.5 px-3 min-w-28">Sotib olis...</th>
                <th className="text-right py-2.5 px-3 min-w-28">Sotish na...</th>
                <th className="text-right py-2.5 px-3 min-w-28">
                  <div className="inline-flex items-center gap-1 justify-end">
                    <span>M...</span>
                    <button
                      onClick={() => setMarginMode(marginMode === 'amount' ? 'percent' : 'amount')}
                      className="inline-flex items-center border border-gray-300 rounded overflow-hidden text-[10px] font-bold cursor-pointer"
                    >
                      <span className={clsx('px-1 py-0.5', marginMode === 'amount' ? 'bg-[#3f51b5] text-white' : 'bg-white text-gray-600')}>$</span>
                      <span className={clsx('px-1 py-0.5', marginMode === 'percent' ? 'bg-[#3f51b5] text-white' : 'bg-white text-gray-600')}>%</span>
                    </button>
                  </div>
                </th>
                <th className="text-left py-2.5 px-3 min-w-24">
                  <div className="flex items-center justify-between">
                    <span>Q.</span>
                    <SlidersHorizontal size={13} className="text-gray-400" />
                  </div>
                </th>
              </tr>

              {/* Row 2: Inline Column Filter Inputs (Screenshot 5) */}
              <tr className="bg-[#f8f9fc] border-b border-gray-200 text-xs font-normal">
                <th className="py-1.5 px-3" />
                <th className="py-1.5 px-2" />
                <th className="py-1.5 px-2" />
                <th className="py-1.5 px-3">
                  <div className="relative flex items-center">
                    <input
                      type="text"
                      value={nameFilter}
                      onChange={e => { setNameFilter(e.target.value); setPage(1); }}
                      placeholder="Kiritish"
                      className="w-full pr-6 pb-1 border-b border-gray-300 focus:border-[#3f51b5] bg-transparent text-xs text-gray-800 focus:outline-none"
                    />
                    <Search size={13} className="absolute right-1 bottom-1.5 text-gray-400" />
                  </div>
                </th>
                <th className="py-1.5 px-3">
                  <div className="relative flex items-center">
                    <input
                      type="text"
                      value={supplierFilter}
                      onChange={e => { setSupplierFilter(e.target.value); setPage(1); }}
                      placeholder="Kiritish"
                      className="w-full pr-6 pb-1 border-b border-gray-300 focus:border-[#3f51b5] bg-transparent text-xs text-gray-800 focus:outline-none"
                    />
                    <Search size={13} className="absolute right-1 bottom-1.5 text-gray-400" />
                  </div>
                </th>
                <th className="py-1.5 px-3">
                  <div className="relative flex items-center">
                    <input
                      type="text"
                      value={categoryFilter}
                      onChange={e => { setCategoryFilter(e.target.value); setPage(1); }}
                      placeholder="Kiri..."
                      className="w-full pr-6 pb-1 border-b border-gray-300 focus:border-[#3f51b5] bg-transparent text-xs text-gray-800 focus:outline-none"
                    />
                    <Search size={13} className="absolute right-1 bottom-1.5 text-gray-400" />
                  </div>
                </th>
                <th className="py-1.5 px-3">
                  <select
                    value={stockFilter}
                    onChange={e => { setStockFilter(e.target.value); setPage(1); }}
                    className="w-full pb-1 border-b border-gray-300 bg-transparent text-xs text-gray-500 focus:outline-none text-right"
                  >
                    <option value="">Tan...</option>
                    <option value="normal">Yetarli</option>
                    <option value="low">Kam qolgan</option>
                    <option value="out">Tugagan (0)</option>
                  </select>
                </th>
                <th className="py-1.5 px-3 text-right text-gray-400">
                  <span className="inline-flex items-center gap-1 border-b border-gray-300 pb-1 w-full justify-end">
                    Tan... <ChevronDown size={12} />
                  </span>
                </th>
                <th className="py-1.5 px-3 text-right text-gray-400">
                  <span className="inline-flex items-center gap-1 border-b border-gray-300 pb-1 w-full justify-end">
                    Tan... <ChevronDown size={12} />
                  </span>
                </th>
                <th className="py-1.5 px-3 text-right text-gray-400">
                  <span className="inline-flex items-center gap-1 border-b border-gray-300 pb-1 w-full justify-end">
                    Tan... <ChevronDown size={12} />
                  </span>
                </th>
                <th className="py-1.5 px-3 text-left text-gray-400">
                  <span className="inline-flex items-center gap-1 border-b border-gray-300 pb-1 w-full">
                    Tan... <ChevronDown size={12} />
                  </span>
                </th>
              </tr>
            </thead>

            <tbody className="divide-y divide-gray-100">
              {paged.length === 0 ? (
                <tr>
                  <td colSpan={11} className="text-center py-12 text-gray-400">
                    Mahsulotlar topilmadi
                  </td>
                </tr>
              ) : (
                paged.map(p => {
                  const cat = categories.find(c => c.id === p.categoryId);
                  const sup = suppliers.find(s => s.id === p.supplierId);
                  const isLow = p.stock > 0 && p.stock <= p.minStock;

                  // Display USD values when product is USD-priced (like 1.25 / 1.40 / 0.15 in Screenshot 5)
                  const isUSD = p.currency === 'USD' && p.usdPurchasePrice !== undefined && p.usdSalePrice !== undefined;
                  const buyDisplay = isUSD ? p.usdPurchasePrice! : p.purchasePrice;
                  const sellDisplay = isUSD ? p.usdSalePrice! : p.salePrice;
                  const diffDisplay = sellDisplay - buyDisplay;
                  const marginPct = buyDisplay > 0 ? ((diffDisplay / buyDisplay) * 100).toFixed(1) + '%' : '0%';

                  return (
                    <tr
                      key={p.id}
                      onDoubleClick={() => openEdit(p)}
                      className={clsx(
                        'hover:bg-[#f1f4f9] transition-colors cursor-pointer',
                        selectedIds.includes(p.id) && 'bg-indigo-50/60',
                      )}
                    >
                      <td className="py-2 px-3 text-center" onClick={e => e.stopPropagation()}>
                        <input
                          type="checkbox"
                          checked={selectedIds.includes(p.id)}
                          onChange={() => toggleSelectOne(p.id)}
                          className="w-4 h-4 rounded border-gray-300 text-[#3f51b5] cursor-pointer"
                        />
                      </td>
                      <td className="py-2 px-2 text-center" onClick={e => e.stopPropagation()}>
                        <button
                          onClick={() => toggleProductFavorite(p.id)}
                          className="text-gray-300 hover:text-amber-400 cursor-pointer"
                          title="Asosiy (sevimli) ro'yxatga qo'shish"
                        >
                          <Star
                            size={15}
                            className={p.isFavorite ? 'fill-amber-400 text-amber-400' : ''}
                          />
                        </button>
                      </td>
                      <td className="py-2 px-2 text-center" onClick={() => openEdit(p)}>
                        <div className="w-7 h-7 rounded bg-gray-100 border border-gray-200 flex items-center justify-center mx-auto text-gray-400">
                          <ImageIcon size={14} />
                        </div>
                      </td>
                      <td className="py-2 px-3" onClick={() => openEdit(p)}>
                        <div className="font-semibold text-gray-900 leading-tight">{p.name}</div>
                        <div className="flex flex-wrap items-center gap-2 text-[11px] text-gray-500 mt-0.5">
                          <span>SKU: {p.sku}</span>
                          {p.unit === 'kv.m' && p.defaultWidth && p.defaultLength && (
                            <span className="px-1.5 py-0.2 rounded bg-blue-50 text-blue-700 font-medium">
                              {p.defaultWidth}×{p.defaultLength}m ({+(p.defaultWidth * p.defaultLength).toFixed(2)} kv.m)
                            </span>
                          )}
                          {p.cuttingPrice && p.cuttingPrice > 0 ? (
                            <span className="px-1.5 py-0.2 rounded bg-amber-50 text-amber-800 font-medium inline-flex items-center gap-0.5">
                              ✂️ Kesish: {formatOptimoNumber(p.cuttingPrice, 0)} UZS
                            </span>
                          ) : null}
                        </div>
                      </td>
                      <td className="py-2 px-3 text-gray-700" onClick={() => openEdit(p)}>
                        {sup?.name || 'Озим усд'}
                      </td>
                      <td className="py-2 px-3 text-gray-700" onClick={() => openEdit(p)}>
                        {cat?.name || 'Темир'}
                      </td>
                      <td className="py-2 px-3 text-right" onClick={() => openEdit(p)}>
                        {isLow ? (
                          <span className="inline-block bg-[#f4a261] text-white font-semibold px-2 py-0.5 rounded text-xs">
                            {formatOptimoNumber(p.stock, 2)} {p.unit}
                          </span>
                        ) : (
                          <span className="text-gray-800 font-medium">
                            {formatOptimoNumber(p.stock, 2)} {p.unit}
                          </span>
                        )}
                      </td>
                      <td className="py-2 px-3 text-right text-gray-800 font-medium" onClick={() => openEdit(p)}>
                        {formatOptimoNumber(buyDisplay, 2)}
                      </td>
                      <td className="py-2 px-3 text-right text-gray-900 font-semibold" onClick={() => openEdit(p)}>
                        {formatOptimoNumber(sellDisplay, 2)}
                      </td>
                      <td className="py-2 px-3 text-right text-gray-700" onClick={() => openEdit(p)}>
                        {marginMode === 'amount' ? formatOptimoNumber(diffDisplay, 2) : marginPct}
                      </td>
                      <td className="py-2 px-3 text-gray-500 text-xs" onClick={e => e.stopPropagation()}>
                        <div className="flex items-center justify-between">
                          <span>Soliql...</span>
                          <div className="flex items-center gap-1">
                            <button
                              onClick={() => openEdit(p)}
                              className="p-1 text-gray-400 hover:text-indigo-600 rounded cursor-pointer"
                              title="Tahrirlash"
                            >
                              <Edit2 size={13} />
                            </button>
                            <button
                              onClick={() => setDeleteId(p.id)}
                              className="p-1 text-gray-400 hover:text-red-600 rounded cursor-pointer"
                              title="O'chirish"
                            >
                              <Trash2 size={13} />
                            </button>
                          </div>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {filtered.length > PAGE_SIZE && (
          <Pagination page={page} totalPages={totalPages} onPage={setPage} total={filtered.length} pageSize={PAGE_SIZE} />
        )}
      </div>

      {/* CSV Import Modal */}
      <Modal
        open={importModalOpen}
        onClose={() => setImportModalOpen(false)}
        title="Mahsulotlarni CSV orqali import qilish"
        size="sm"
        footer={
          <>
            <Button variant="secondary" onClick={() => setImportModalOpen(false)}>Yopish</Button>
            <Button
              variant="primary"
              onClick={() => {
                setImportModalOpen(false);
                showToast('success', 'CSV fayl muvaffaqiyatli yuklandi');
              }}
            >
              Yuklash
            </Button>
          </>
        }
      >
        <div className="space-y-4">
          <div className="border-2 border-dashed border-gray-300 rounded-xl p-6 text-center hover:border-indigo-400 transition-colors">
            <Upload size={32} className="mx-auto text-gray-400 mb-2" />
            <p className="text-sm font-medium text-gray-700">CSV yoki Excel faylni tanlang</p>
            <p className="text-xs text-gray-400 mt-1">Ustunlar: Ism, Shtrix-kod/SKU, Kategoriya, Distribyutor, Miqdori, Sotib olish narxi, Sotish narxi</p>
            <input type="file" accept=".csv" className="mt-3 text-xs text-gray-500" />
          </div>
        </div>
      </Modal>

      <ConfirmModal
        open={!!deleteId}
        onClose={() => setDeleteId(null)}
        onConfirm={() => {
          if (deleteId) {
            deleteProduct(deleteId);
            setSelectedIds(prev => prev.filter(x => x !== deleteId));
            setDeleteId(null);
            showToast('success', "Mahsulot o'chirildi");
          }
        }}
        title="Mahsulotni o'chirish"
        message="Haqiqatan ham ushbu mahsulotni katalogdan o'chirmoqchimisiz?"
        confirmText="Ha, o'chirish"
        variant="danger"
      />

      <ConfirmModal
        open={bulkDeleteOpen}
        onClose={() => setBulkDeleteOpen(false)}
        onConfirm={handleBulkDelete}
        title="Tanlangan mahsulotlarni o'chirish"
        message={`Siz tanlagan ${selectedIds.length} ta mahsulotni o'chirishni tasdiqlaysizmi?`}
        confirmText="Barchasini o'chirish"
        variant="danger"
      />
    </div>
  );
}
