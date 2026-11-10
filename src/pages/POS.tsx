import { useState, useEffect, useRef } from 'react';
import {
  ShoppingCart, Trash2, Printer, MoreHorizontal, ArrowUpDown,
  ChevronDown, ChevronLeft, Download, RefreshCw, Wifi, Menu,
  Image as ImageIcon, Check, Delete, CreditCard, Search, X, LayoutGrid, Grid3x3, UserPlus, Calculator, Scissors, Hammer, RotateCcw
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useStore } from '../store/useStore';
import { formatOptimoNumber, clsx } from '../utils/format';
import { Modal } from '../components/ui/Modal';
import { Input } from '../components/ui/Input';
import { Button } from '../components/ui/Button';
import type { Sale } from '../types';

type NumpadMode = 'quantity' | 'discount' | 'price' | 'customer';
type RightTab = 'asosiy' | 'kategoriyalar' | 'taminotchilar';

export function POS() {
  const navigate = useNavigate();
  const {
    products, categories, suppliers, customers,
    cartItems, selectedCustomer, saleType,
    setSaleType, addToCart, removeFromCart,
    updateCartQuantity, updateCartDimensions, updateCartUnitPrice, updateCartItemDiscount,
    toggleCartItemReturn, setSelectedCustomer, addCustomer, clearCart, completeSale,
    cartTotal, cartNewSubtotal, cartReturnTotal, currentUser, showToast,
  } = useStore();

  // Active selected line in cart (lineId or product.id)
  const [selectedProductId, setSelectedProductId] = useState<string | null>(null);
  const [returnAddMode, setReturnAddMode] = useState<boolean>(false);
  const [numpadMode, setNumpadMode] = useState<NumpadMode>('quantity');
  const [numpadBuffer, setNumpadBuffer] = useState<string>('');

  // Right catalog tabs & filters
  const [rightTab, setRightTab] = useState<RightTab>('asosiy');
  const [selectedCatId, setSelectedCatId] = useState<string>('');
  const [selectedSupId, setSelectedSupId] = useState<string>('');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [compactGrid, setCompactGrid] = useState<boolean>(false);

  // Held orders / Receipt number selector
  const [orderNumber, setOrderNumber] = useState<number>(3101);
  const [showOrderMenu, setShowOrderMenu] = useState<boolean>(false);
  const [showMoreActions, setShowMoreActions] = useState<boolean>(false);

  // Customer modal
  const [customerModalOpen, setCustomerModalOpen] = useState<boolean>(false);
  const [customerSearch, setCustomerSearch] = useState<string>('');
  const [newCustomerForm, setNewCustomerForm] = useState({ name: '', phone: '' });

  // Metal Calculator modal (Shtuk / Tonna -> Metr)
  const [metalCalcOpen, setMetalCalcOpen] = useState<boolean>(false);
  const [pieceCount, setPieceCount] = useState<string>('10');
  const [pieceLength, setPieceLength] = useState<number>(11.7);
  const [tonnageKg, setTonnageKg] = useState<string>('1000');
  const [rebarDiameter, setRebarDiameter] = useState<number>(16);

  const detectPieceLength = (name: string): number => {
    if (name.includes('11,70') || name.includes('11.7') || name.toLowerCase().includes('ар')) return 11.7;
    if (name.includes('12м')) return 12;
    if (name.includes('10м')) return 10;
    if (name.includes('9м')) return 9;
    if (name.includes('6м')) return 6;
    return 6;
  };

  // Payment Screen state (Optimo full-screen payment view — image 2)
  const [inPaymentScreen, setInPaymentScreen] = useState<boolean>(false);
  const [paymentMethod, setPaymentMethod] = useState<'naqd' | 'payme' | 'click' | 'karta' | 'aralash'>('naqd');
  const [payInputStr, setPayInputStr] = useState<string>('');
  const [printReceiptToggle, setPrintReceiptToggle] = useState<boolean>(true);
  const [splitPaymentMode, setSplitPaymentMode] = useState<boolean>(false);
  const [splitCardAmount, setSplitCardAmount] = useState<string>('0');
  const [completedSale, setCompletedSale] = useState<Sale | null>(null);

  const searchInputRef = useRef<HTMLInputElement>(null);

  const total = cartTotal();
  const newSub = cartNewSubtotal();
  const returnTotal = cartReturnTotal();

  // Auto-select latest item added to cart
  useEffect(() => {
    if (cartItems.length > 0 && (!selectedProductId || !cartItems.some(i => (i.lineId || i.product.id) === selectedProductId))) {
      const last = cartItems[cartItems.length - 1];
      setSelectedProductId(last.lineId || last.product.id);
      setNumpadBuffer('');
    } else if (cartItems.length === 0) {
      setSelectedProductId(null);
      setNumpadBuffer('');
    }
  }, [cartItems, selectedProductId]);

  // Handle Numpad key press on Main POS screen
  const handlePosNumpad = (key: string) => {
    if (numpadMode === 'customer') {
      setCustomerModalOpen(true);
      return;
    }
    if (!selectedProductId) {
      showToast('info', 'Avval savatdan mahsulotni tanlang');
      return;
    }

    let nextBuf = numpadBuffer;
    if (key === 'BACK') {
      nextBuf = nextBuf.slice(0, -1);
    } else if (key === '.') {
      if (!nextBuf.includes('.')) nextBuf = (nextBuf || '0') + '.';
    } else {
      nextBuf = nextBuf + key;
    }

    setNumpadBuffer(nextBuf);
    const numVal = parseFloat(nextBuf);

    if (!isNaN(numVal)) {
      if (numpadMode === 'quantity') {
        updateCartQuantity(selectedProductId, numVal);
      } else if (numpadMode === 'discount') {
        updateCartItemDiscount(selectedProductId, numVal);
      } else if (numpadMode === 'price') {
        updateCartUnitPrice(selectedProductId, numVal);
      }
    } else if (nextBuf === '') {
      if (numpadMode === 'discount') updateCartItemDiscount(selectedProductId, 0);
    }
  };

  // Switch Numpad Mode
  const selectNumpadMode = (mode: NumpadMode) => {
    setNumpadMode(mode);
    setNumpadBuffer('');
    if (mode === 'customer') {
      setCustomerModalOpen(true);
    }
  };

  // Open Optimo Payment Screen
  const openPaymentScreen = () => {
    if (cartItems.length === 0) {
      showToast('warning', "Buyurtma bo'sh! Avval mahsulot tanlang.");
      return;
    }
    setPaymentMethod('naqd');
    setPayInputStr(Math.max(0, total).toFixed(2));
    setSplitPaymentMode(false);
    setSplitCardAmount('0');
    setInPaymentScreen(true);
  };

  // Payment Numpad handler
  const handlePayNumpad = (key: string) => {
    if (key === 'C') {
      setPayInputStr('0');
      return;
    }
    if (key === 'BACK') {
      setPayInputStr(prev => (prev.length > 1 ? prev.slice(0, -1) : '0'));
      return;
    }
    if (key === '.') {
      if (!payInputStr.includes('.')) setPayInputStr(prev => prev + '.');
      return;
    }
    setPayInputStr(prev => {
      if (prev === '0' || prev === Math.max(0, total).toFixed(2)) return key;
      return prev + key;
    });
  };

  const addQuickNoteCash = (addAmount: number) => {
    const current = parseFloat(payInputStr) || 0;
    // If default exact amount is showing, replace or add
    const next = current === Math.max(0, total) ? addAmount : current + addAmount;
    setPayInputStr(next.toFixed(2));
    setPaymentMethod('naqd');
  };

  const confirmOptimoPayment = (overrideMethod?: 'naqd' | 'payme' | 'click' | 'karta' | 'aralash') => {
    const activeMethod = overrideMethod || paymentMethod;
    const cashVal = parseFloat(payInputStr) || 0;
    const cardVal = splitPaymentMode ? (parseFloat(splitCardAmount) || 0) : 0;
    const totalEntered = activeMethod === 'naqd' ? cashVal : splitPaymentMode ? cashVal + cardVal : Math.max(0, total);

    if (total > 0 && activeMethod === 'naqd' && !splitPaymentMode && totalEntered < total) {
      showToast('error', "To'lov summasi jami summadan kam!");
      return;
    }

    const sale = completeSale(activeMethod, totalEntered);
    setCompletedSale(sale);
    setReturnAddMode(false);
  };

  const finishAndReturn = () => {
    setCompletedSale(null);
    setInPaymentScreen(false);
    setOrderNumber(prev => prev + 1);
  };

  // Filter products for right grid
  const visibleProducts = products.filter(p => {
    if (p.status !== 'active') return false;
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      return p.name.toLowerCase().includes(q) || p.sku.toLowerCase().includes(q) || p.barcode.includes(q);
    }
    if (rightTab === 'asosiy') return p.isFavorite !== false;
    if (rightTab === 'kategoriyalar' && selectedCatId) return p.categoryId === selectedCatId;
    if (rightTab === 'taminotchilar' && selectedSupId) return p.supplierId === selectedSupId;
    return true;
  });

  // ============================================================================
  // RENDER 1: OPTIMO PAYMENT SCREEN (Exact match to Image 2)
  // ============================================================================
  if (inPaymentScreen) {
    const paidAmount = parseFloat(payInputStr) || 0;
    const changeAmount = total >= 0 ? Math.max(0, paidAmount - total) : Math.abs(total);

    return (
      <div className="fixed inset-0 z-50 bg-[#f4f5f7] flex flex-col select-none">
        {/* Top Header */}
        <header className="h-14 bg-white border-b border-gray-200 px-4 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3">
            <button
              onClick={() => setInPaymentScreen(false)}
              className="p-2 rounded-lg hover:bg-gray-100 text-gray-600 cursor-pointer flex items-center gap-1 text-sm font-medium"
            >
              <ChevronLeft size={20} />
              <span>Orqaga</span>
            </button>
          </div>

          {/* Center Temirchi Logo */}
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-slate-800 via-indigo-900 to-amber-700 flex items-center justify-center shadow-xs border border-amber-500/40">
              <Hammer size={17} className="text-amber-400 -rotate-12" />
            </div>
            <span className="font-extrabold text-sm tracking-wider text-[#1e1b4b]">TEMIRCHI</span>
          </div>

          {/* Right status icons */}
          <div className="flex items-center gap-4 text-gray-500">
            <Download size={18} className="cursor-pointer hover:text-gray-800" />
            <RefreshCw size={18} className="cursor-pointer hover:text-gray-800" />
            <Wifi size={18} className="text-green-600" />
            <div className="flex items-center gap-2 pl-2 border-l border-gray-200">
              <div className="w-8 h-8 rounded-full bg-[#7c2d12] text-white font-bold text-sm flex items-center justify-center">
                K
              </div>
              <span className="text-xs font-bold text-gray-800 tracking-wide">KACCA 1.</span>
            </div>
            <button
              onClick={() => navigate('/products')}
              className="w-9 h-9 rounded-full bg-[#4f46e5] text-white flex items-center justify-center hover:bg-[#4338ca] cursor-pointer"
              title="Boshqaruv paneliga o'tish"
            >
              <Menu size={18} />
            </button>
          </div>
        </header>

        {/* Top Summary Totals (including Yangi vs Qaytgan breakdown when present) */}
        <div className="bg-white border-b border-gray-200 py-4 px-8 flex flex-wrap items-center justify-center gap-12 lg:gap-20 shrink-0">
          {returnTotal > 0 && (
            <>
              <div className="text-center">
                <p className="text-xs font-medium text-emerald-700 mb-1">Yangi mahsulotlar (+)</p>
                <p className="text-2xl font-bold text-emerald-700">+{formatOptimoNumber(newSub)}</p>
              </div>
              <div className="text-center">
                <p className="text-xs font-medium text-rose-600 mb-1">↩️ Qaytgan mahsulotlar (-)</p>
                <p className="text-2xl font-bold text-rose-600">-{formatOptimoNumber(returnTotal)}</p>
              </div>
            </>
          )}
          <div className="text-center">
            <p className="text-xs font-medium text-gray-500 mb-1">
              {returnTotal > 0 ? "Yakuniy farq — To'lov (UZS)" : "Jami to'lov (UZS)"}
            </p>
            <p className="text-3xl font-extrabold text-[#7c2d12]">{formatOptimoNumber(total)}</p>
          </div>
          <div className="text-center">
            <p className="text-xs font-medium text-gray-500 mb-1">Qaytim (UZS)</p>
            <p className="text-3xl font-extrabold text-gray-700">{formatOptimoNumber(changeAmount)}</p>
          </div>
        </div>

        {/* Main Payment Body */}
        <div className="flex-1 max-w-6xl w-full mx-auto p-6 grid grid-cols-1 lg:grid-cols-12 gap-8 items-start overflow-y-auto">
          {/* Left Column: Cash & Non-cash options */}
          <div className="lg:col-span-5 space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-600 mb-2">Naqd pul to'lovi</label>
              <input
                type="text"
                value={formatOptimoNumber(parseFloat(payInputStr) || 0)}
                readOnly
                className="w-full h-14 px-4 bg-white border border-gray-300 rounded-lg text-xl font-bold text-gray-800 shadow-2xs focus:outline-none"
              />
              <button
                onClick={() => setPrintReceiptToggle(!printReceiptToggle)}
                className={clsx(
                  'mt-3 w-full h-12 px-4 rounded-lg border text-sm font-medium flex items-center justify-between transition-colors cursor-pointer',
                  printReceiptToggle
                    ? 'bg-indigo-50/70 border-indigo-300 text-indigo-900'
                    : 'bg-white border-gray-200 text-gray-500',
                )}
              >
                <span>Chekni chop etish</span>
                <div className={clsx('w-5 h-5 rounded flex items-center justify-center', printReceiptToggle ? 'bg-indigo-600 text-white' : 'border border-gray-300')}>
                  {printReceiptToggle && <Check size={14} />}
                </div>
              </button>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-600 mb-2">Naqd pulsiz to'lov</label>
              <div className="grid grid-cols-3 gap-3">
                <button
                  onClick={() => { setPaymentMethod('payme'); confirmOptimoPayment('payme'); }}
                  className={clsx(
                    'h-16 rounded-lg border bg-white hover:border-teal-500 flex items-center justify-center font-extrabold text-lg tracking-tight shadow-2xs transition-all cursor-pointer',
                    paymentMethod === 'payme' ? 'border-teal-500 ring-2 ring-teal-500/20' : 'border-gray-200',
                  )}
                >
                  <span className="text-gray-800">Pay</span>
                  <span className="text-teal-500 underline decoration-2">me</span>
                </button>

                <button
                  onClick={() => { setPaymentMethod('click'); confirmOptimoPayment('click'); }}
                  className={clsx(
                    'h-16 rounded-lg border bg-white hover:border-blue-500 flex items-center justify-center gap-1.5 font-bold text-lg text-gray-800 shadow-2xs transition-all cursor-pointer',
                    paymentMethod === 'click' ? 'border-blue-500 ring-2 ring-blue-500/20' : 'border-gray-200',
                  )}
                >
                  <span className="w-5 h-5 rounded-full border-4 border-sky-500 inline-block" />
                  <span>click</span>
                </button>

                <button
                  onClick={() => { setPaymentMethod('karta'); confirmOptimoPayment('karta'); }}
                  className={clsx(
                    'h-16 rounded-lg border bg-white hover:border-indigo-500 flex items-center justify-center text-gray-700 shadow-2xs transition-all cursor-pointer',
                    paymentMethod === 'karta' ? 'border-indigo-500 ring-2 ring-indigo-500/20' : 'border-gray-200',
                  )}
                  title="Terminal / Bank kartasi"
                >
                  <CreditCard size={28} />
                </button>
              </div>
            </div>

            <div className="pt-2">
              <button
                onClick={() => setSplitPaymentMode(!splitPaymentMode)}
                className="w-full h-12 rounded-lg border border-gray-200 bg-white hover:bg-gray-50 text-sm font-medium text-gray-700 shadow-2xs cursor-pointer"
              >
                Kvitansiyani bo'lish (Aralash to'lov)
              </button>
              {splitPaymentMode && (
                <div className="mt-3 p-3 bg-white rounded-lg border border-gray-200 space-y-2">
                  <div className="flex justify-between items-center text-xs text-gray-600">
                    <span>Karta orqali summa:</span>
                    <input
                      type="number"
                      value={splitCardAmount}
                      onChange={e => setSplitCardAmount(e.target.value)}
                      className="w-36 h-8 px-2 border border-gray-300 rounded text-right font-bold"
                    />
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Right Column: Numpad + Quick Cash Denominations */}
          <div className="lg:col-span-7">
            <div className="grid grid-cols-4 gap-2.5">
              {/* Row 1 */}
              {['1', '2', '3'].map(n => (
                <button
                  key={n}
                  onClick={() => handlePayNumpad(n)}
                  className="h-18 bg-white hover:bg-gray-50 active:bg-gray-100 border border-gray-200 rounded-lg text-2xl font-semibold text-gray-800 shadow-2xs cursor-pointer"
                >
                  {n}
                </button>
              ))}
              <button
                onClick={() => addQuickNoteCash(50000)}
                className="h-18 bg-[#312b4b] hover:bg-[#3d365c] text-white rounded-lg text-xl font-bold shadow-xs cursor-pointer"
              >
                +50,000
              </button>

              {/* Row 2 */}
              {['4', '5', '6'].map(n => (
                <button
                  key={n}
                  onClick={() => handlePayNumpad(n)}
                  className="h-18 bg-white hover:bg-gray-50 active:bg-gray-100 border border-gray-200 rounded-lg text-2xl font-semibold text-gray-800 shadow-2xs cursor-pointer"
                >
                  {n}
                </button>
              ))}
              <button
                onClick={() => addQuickNoteCash(100000)}
                className="h-18 bg-[#312b4b] hover:bg-[#3d365c] text-white rounded-lg text-xl font-bold shadow-xs cursor-pointer"
              >
                +100,000
              </button>

              {/* Row 3 */}
              {['7', '8', '9'].map(n => (
                <button
                  key={n}
                  onClick={() => handlePayNumpad(n)}
                  className="h-18 bg-white hover:bg-gray-50 active:bg-gray-100 border border-gray-200 rounded-lg text-2xl font-semibold text-gray-800 shadow-2xs cursor-pointer"
                >
                  {n}
                </button>
              ))}
              <button
                onClick={() => addQuickNoteCash(150000)}
                className="h-18 bg-[#312b4b] hover:bg-[#3d365c] text-white rounded-lg text-xl font-bold shadow-xs cursor-pointer"
              >
                +150,000
              </button>

              {/* Row 4 */}
              <button
                onClick={() => handlePayNumpad('BACK')}
                className="h-18 bg-white hover:bg-gray-50 border border-gray-200 rounded-lg flex items-center justify-center text-gray-700 shadow-2xs cursor-pointer"
              >
                <Delete size={24} />
              </button>
              <button
                onClick={() => handlePayNumpad('0')}
                className="h-18 bg-white hover:bg-gray-50 border border-gray-200 rounded-lg text-2xl font-semibold text-gray-800 shadow-2xs cursor-pointer"
              >
                0
              </button>
              <button
                onClick={() => handlePayNumpad('.')}
                className="h-18 bg-white hover:bg-gray-50 border border-gray-200 rounded-lg text-2xl font-bold text-gray-800 shadow-2xs cursor-pointer"
              >
                .
              </button>
              <button
                onClick={() => handlePayNumpad('C')}
                className="h-18 bg-white hover:bg-gray-50 border border-gray-200 rounded-lg text-xl font-semibold text-gray-700 shadow-2xs cursor-pointer"
              >
                C
              </button>
            </div>

            {/* Confirm Pay Button */}
            <button
              onClick={() => confirmOptimoPayment('naqd')}
              className="mt-4 w-full h-14 bg-[#2563eb] hover:bg-[#1d4ed8] text-white font-bold text-lg rounded-lg shadow-md transition-colors cursor-pointer"
            >
              To'lov ({formatOptimoNumber(total)} UZS)
            </button>
          </div>
        </div>

        {/* Success Modal Overlay (Exact match to Image 2 + Combined Yangi & Qaytgan Single Receipt) */}
        {completedSale && (
          <div className="fixed inset-0 z-50 bg-black/35 flex items-center justify-center p-4">
            <div className="bg-white rounded-xl shadow-2xl w-full max-w-lg p-6 text-center space-y-4 animate-in zoom-in-95 duration-150">
              <div className="w-16 h-16 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto">
                <Check size={34} strokeWidth={2.5} />
              </div>
              <div>
                <h3 className="text-lg font-bold text-gray-800">
                  To'lov muvaffaqiyatli amalga oshirildi
                </h3>
                <p className="text-xs text-gray-500 mt-0.5">
                  Yagona chek: <strong>{completedSale.receiptNumber}</strong> · Yakuniy jami: <strong>{formatOptimoNumber(completedSale.total)} UZS</strong>
                </p>
              </div>

              {/* Combined Single Receipt: Both New (+) and Returned (-) Products */}
              <div className="bg-gray-50 rounded-lg border border-gray-200 p-3 text-left max-h-64 overflow-y-auto divide-y divide-gray-200 text-xs">
                {completedSale.items.map((it, idx) => (
                  <div
                    key={`${it.productId}-${it.isReturn ? 'ret' : 'new'}-${idx}`}
                    className={clsx(
                      'py-2 flex items-start justify-between gap-2 px-1.5 rounded',
                      it.isReturn && 'bg-rose-50/80',
                    )}
                  >
                    <div>
                      <div className="flex items-center gap-1.5">
                        <span
                          className={clsx(
                            'px-1.5 py-0.5 rounded text-[10px] font-extrabold uppercase',
                            it.isReturn
                              ? 'bg-rose-600 text-white'
                              : 'bg-emerald-600 text-white',
                          )}
                        >
                          {it.isReturn ? '↩️ Qaytgan (-)' : '🛒 Yangi (+)'}
                        </span>
                        <p className="font-bold text-gray-900">{it.productName}</p>
                      </div>
                      <p className="text-[11px] text-indigo-700 font-semibold mt-0.5">
                        O'lchami: {it.pieceSize || '1'} × {it.pieceCount || 1} ta = Umumiy: {it.quantity} {it.unit || 'm'}
                      </p>
                      {!it.isReturn && it.cutsCount && it.cutsCount > 0 ? (
                        <p className="text-[11px] text-amber-800 font-medium">
                          ✂️ Kesib berish: {it.cutsCount} ta × {formatOptimoNumber(it.cuttingPrice || 0, 0)} = +{formatOptimoNumber(it.cuttingTotal || 0, 0)} UZS
                        </p>
                      ) : null}
                    </div>
                    <span
                      className={clsx(
                        'font-extrabold whitespace-nowrap',
                        it.isReturn ? 'text-rose-600' : 'text-gray-900',
                      )}
                    >
                      {it.isReturn ? '' : '+'}{formatOptimoNumber(it.total)} UZS
                    </span>
                  </div>
                ))}
              </div>

              {/* Combined Calculation Summary in the Single Receipt */}
              {(completedSale.returnedTotal ?? 0) > 0 && (
                <div className="bg-indigo-50/70 border border-indigo-200 rounded-lg p-3 text-xs space-y-1 text-left">
                  <div className="flex justify-between text-emerald-800 font-semibold">
                    <span>🛒 Yangi olingan mahsulotlar jami:</span>
                    <span>+{formatOptimoNumber(completedSale.newItemsSubtotal || 0)} UZS</span>
                  </div>
                  <div className="flex justify-between text-rose-600 font-semibold">
                    <span>↩️ Qaytgan mahsulotlar hisobi:</span>
                    <span>-{formatOptimoNumber(completedSale.returnedTotal || 0)} UZS</span>
                  </div>
                  <div className="flex justify-between text-gray-900 font-extrabold text-sm pt-1 border-t border-indigo-200">
                    <span>
                      {completedSale.total >= 0 ? "To'langan farq (Yakuniy):" : "Mijozga qaytarilgan farq:"}
                    </span>
                    <span>{formatOptimoNumber(completedSale.total)} UZS</span>
                  </div>
                </div>
              )}

              <div className="flex items-center justify-center gap-3 pt-1">
                <button
                  onClick={() => window.print()}
                  className="flex-1 h-12 px-4 rounded-lg border border-gray-200 bg-gray-50 hover:bg-gray-100 text-gray-700 font-medium text-sm flex items-center justify-center gap-2 cursor-pointer"
                >
                  <Printer size={17} />
                  <span>Qayta chop etish</span>
                </button>
                <button
                  onClick={finishAndReturn}
                  className="flex-1 h-12 px-4 rounded-lg bg-[#3b82f6] hover:bg-[#2563eb] text-white font-semibold text-sm cursor-pointer shadow-sm"
                >
                  Qaytarish
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    );
  }

  // ============================================================================
  // RENDER 2: MAIN OPTIMO POS TERMINAL (Exact match to Images 3 & 4)
  // ============================================================================
  return (
    <div className="fixed inset-0 z-40 bg-[#eef0f4] flex flex-col select-none overflow-hidden">
      {/* Top POS Bar */}
      <header className="h-13 bg-white border-b border-gray-200 px-4 flex items-center justify-between shrink-0">
        {/* Left: Chakana/Ulgurji, Order # & Return Mode Toggle */}
        <div className="flex items-center gap-4">
          <button
            onClick={() => {
              const next = saleType === 'chakana' ? 'ulgurji' : 'chakana';
              setSaleType(next);
              showToast('info', `Savdo rejimi: ${next === 'chakana' ? 'Chakana savdo' : 'Ulgurji savdo'}`);
            }}
            className="flex items-center gap-1.5 text-sm font-semibold text-gray-700 hover:text-indigo-600 cursor-pointer"
          >
            <ArrowUpDown size={15} className="text-gray-500" />
            <span>{saleType === 'chakana' ? 'Chakana' : 'Ulgurji'}</span>
          </button>

          <div className="relative">
            <button
              onClick={() => setShowOrderMenu(!showOrderMenu)}
              className="flex items-center gap-1 text-sm font-bold text-gray-800 hover:text-indigo-600 cursor-pointer"
            >
              <span>#{orderNumber}</span>
              <ChevronDown size={15} />
            </button>
            {showOrderMenu && (
              <div className="absolute left-0 top-full mt-1 w-48 bg-white border border-gray-200 rounded-lg shadow-lg py-1 z-50">
                {[3101, 3102, 3103].map(num => (
                  <button
                    key={num}
                    onClick={() => { setOrderNumber(num); setShowOrderMenu(false); }}
                    className={clsx(
                      'w-full text-left px-4 py-2 text-sm hover:bg-gray-50 flex justify-between',
                      orderNumber === num && 'font-bold text-indigo-600 bg-indigo-50/50',
                    )}
                  >
                    <span>Buyurtma #{num}</span>
                    {orderNumber === num && <span>✓</span>}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Toggle button to add returned products into the SAME receipt */}
          <button
            onClick={() => {
              const next = !returnAddMode;
              setReturnAddMode(next);
              showToast(
                next ? 'warning' : 'info',
                next
                  ? "↩️ Qaytgan mahsulot rejimi yoqildi: tanlangan mahsulot shu chekka 'Qaytgan (-)' bo'lib tushadi"
                  : "🛒 Yangi mahsulot sotish rejimi yoqildi",
              );
            }}
            className={clsx(
              'h-8 px-3 rounded-lg text-xs font-bold flex items-center gap-1.5 border transition-all cursor-pointer',
              returnAddMode
                ? 'bg-rose-600 text-white border-rose-700 shadow-xs animate-pulse'
                : 'bg-rose-50 text-rose-700 border-rose-200 hover:bg-rose-100',
            )}
            title="Qaytgan mahsulotni shu bitta chekka qo'shish"
          >
            <RotateCcw size={14} />
            <span>{returnAddMode ? "↩️ Qaytgan qo'shilmoqda (Faol)" : "↩️ Qaytgan mahsulot qo'shish"}</span>
          </button>

          {selectedCustomer && (
            <span className="text-xs bg-indigo-50 text-indigo-700 font-semibold px-2.5 py-1 rounded-full flex items-center gap-1">
              👤 {selectedCustomer.name}
              <X size={12} className="cursor-pointer" onClick={() => setSelectedCustomer(null)} />
            </span>
          )}
        </div>

        {/* Center: Temirchi Logo */}
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-slate-800 via-indigo-900 to-amber-700 flex items-center justify-center shadow-xs border border-amber-500/40">
            <Hammer size={17} className="text-amber-400 -rotate-12" />
          </div>
          <span className="font-extrabold text-sm tracking-wider text-[#1e1b4b]">TEMIRCHI</span>
        </div>

        {/* Right: Sync, Wifi, Cashier, Menu button to Back-office */}
        <div className="flex items-center gap-4 text-gray-500">
          <button
            onClick={() => showToast('success', "Ma'lumotlar bazasi yangilandi")}
            className="p-1.5 hover:text-gray-800 cursor-pointer"
            title="Sinxronizatsiya"
          >
            <Download size={18} />
          </button>
          <button
            onClick={() => showToast('info', 'Katalog sinxronlandi')}
            className="p-1.5 hover:text-gray-800 cursor-pointer"
            title="Yangilash"
          >
            <RefreshCw size={18} />
          </button>
          <Wifi size={18} className="text-gray-700" />
          <div className="flex items-center gap-2 pl-2 border-l border-gray-200">
            <div className="w-8 h-8 rounded-full bg-[#7c2d12] text-white font-bold text-xs flex items-center justify-center">
              K
            </div>
            <span className="text-xs font-bold text-gray-800 tracking-wide">
              {currentUser.role === 'kassir' ? currentUser.name : 'KACCA 1.'}
            </span>
          </div>
          <button
            onClick={() => navigate('/products')}
            className="w-9 h-9 rounded-full bg-[#4f46e5] text-white flex items-center justify-center hover:bg-[#4338ca] shadow-xs cursor-pointer"
            title="Boshqaruv paneliga (Dashboard) o'tish"
          >
            <Menu size={18} />
          </button>
        </div>
      </header>

      {/* Main Split Content */}
      <div className="flex-1 flex overflow-hidden">
        {/* ================================================================
            LEFT PANE: CART TABLE + TOTAL BAR + NUMPAD (42% width)
           ================================================================ */}
        <div className="w-[42%] min-w-[380px] max-w-[540px] bg-white border-r border-gray-300 flex flex-col">
          {/* Cart Table Header */}
          {cartItems.length > 0 && (
            <div className="grid grid-cols-12 px-3 py-2 bg-gray-50 border-b border-gray-200 text-[11px] font-semibold text-gray-500">
              <div className="col-span-5">Nom / Holat / O'lcham</div>
              <div className="col-span-2 text-right">Narx (UZS)</div>
              <div className="col-span-2 text-center">Soni / Jami</div>
              <div className="col-span-2 text-right">Summa (UZS)</div>
              <div className="col-span-1" />
            </div>
          )}

          {/* Cart Items or Empty State */}
          <div className="flex-1 overflow-y-auto">
            {cartItems.length === 0 ? (
              <div className="h-full flex flex-col items-center justify-center text-gray-500 gap-2">
                <ShoppingCart size={46} strokeWidth={1.6} className="text-[#653224]" />
                <p className="text-sm font-medium text-gray-600">Buyurtma bo'sh</p>
                {returnAddMode && (
                  <span className="mt-1 px-3 py-1 rounded-full bg-rose-100 text-rose-700 text-xs font-bold">
                    ↩️ Qaytgan mahsulot rejimi yoqilgan — o'ngdan mahsulot tanlang
                  </span>
                )}
              </div>
            ) : (
              <div className="divide-y divide-gray-200">
                {cartItems.map(item => {
                  const itemKey = item.lineId || item.product.id;
                  const isReturn = !!item.isReturn;
                  const isSelected = itemKey === selectedProductId;
                  const unitLabel = item.product.unit === 'metr' ? 'm' : item.product.unit;
                  const pLen = item.pieceLength ?? (item.product.defaultLength || detectPieceLength(item.product.name));
                  const pWid = item.pieceWidth ?? (item.product.defaultWidth || 1.5);
                  const pCount = item.pieceCount ?? 1;
                  const cuts = isReturn ? 0 : (item.cutsCount ?? 0);
                  const cutPrice = item.cuttingPrice ?? (item.product.cuttingPrice || 2000);
                  const cuttingSum = cuts * cutPrice;
                  const productSum = item.unitPrice * item.quantity * (1 - item.discount / 100);
                  const lineSum = isReturn ? -productSum : productSum + cuttingSum;

                  const applyDimChange = (nextLen: number, nextWid: number, nextCount: number, nextCuts: number, nextCutPrice: number) => {
                    const safeCount = Math.max(1, nextCount);
                    const safeLen = Math.max(0.01, nextLen);
                    const safeWid = Math.max(0.01, nextWid);
                    const perPiece =
                      item.product.unit === 'kv.m'
                        ? Number((safeLen * safeWid).toFixed(2))
                        : item.product.unit === 'metr'
                        ? safeLen
                        : 1;
                    const totalQty = Number((perPiece * safeCount).toFixed(2));
                    const sizeStr =
                      item.product.unit === 'kv.m'
                        ? `${safeWid}×${safeLen} m (${perPiece} kv.m)`
                        : item.product.unit === 'metr'
                        ? `${safeLen} m`
                        : `${safeLen} ${item.product.unit}`;
                    updateCartDimensions(itemKey, {
                      pieceLength: safeLen,
                      pieceWidth: safeWid,
                      pieceCount: safeCount,
                      pieceSize: sizeStr,
                      cutsCount: isReturn ? 0 : Math.max(0, nextCuts),
                      cuttingPrice: Math.max(0, nextCutPrice),
                      quantity: totalQty,
                    });
                  };

                  return (
                    <div
                      key={itemKey}
                      onClick={() => { setSelectedProductId(itemKey); setNumpadBuffer(''); }}
                      className={clsx(
                        'px-3 py-2.5 text-xs cursor-pointer transition-colors',
                        isReturn
                          ? isSelected
                            ? 'bg-rose-100/80 border-l-4 border-l-rose-600'
                            : 'bg-rose-50/50 hover:bg-rose-50 border-l-4 border-l-rose-500'
                          : isSelected
                          ? 'bg-[#e8eef7]'
                          : 'hover:bg-gray-50',
                      )}
                    >
                      <div className="grid grid-cols-12 items-center">
                        <div className="col-span-5 pr-2">
                          <div className="flex items-center gap-1.5 flex-wrap">
                            {/* 1-click toggle between Yangi (+) and Qaytgan (-) */}
                            <button
                              type="button"
                              onClick={e => {
                                e.stopPropagation();
                                toggleCartItemReturn(itemKey);
                              }}
                              className={clsx(
                                'px-1.5 py-0.5 rounded text-[10px] font-extrabold uppercase cursor-pointer transition-colors',
                                isReturn
                                  ? 'bg-rose-600 text-white hover:bg-rose-700'
                                  : 'bg-emerald-600 text-white hover:bg-emerald-700',
                              )}
                              title="Bosib 'Yangi (+)' yoki 'Qaytgan (-)' holatiga o'zgartiring"
                            >
                              {isReturn ? '↩️ Qaytgan (-)' : '🛒 Yangi (+)'}
                            </button>
                            <p className="font-bold text-gray-900 leading-snug">{item.product.name}</p>
                          </div>
                          <div className="flex flex-wrap items-center gap-1.5 text-[11px] text-gray-600 mt-1">
                            <span className="font-mono text-gray-500">#{item.product.sku}</span>
                            <span
                              className={clsx(
                                'px-1.5 py-0.5 rounded font-semibold',
                                isReturn ? 'bg-rose-100 text-rose-900' : 'bg-blue-100/80 text-blue-900',
                              )}
                            >
                              O'lcham: {item.pieceSize || `${pLen} ${unitLabel}`} × {pCount} ta = {item.quantity} {unitLabel}
                            </span>
                            {item.discount > 0 && <span className="text-amber-600 font-semibold">(-{item.discount}%)</span>}
                          </div>
                          {!isReturn && cuts > 0 && (
                            <p className="text-[11px] text-amber-800 font-semibold mt-0.5 flex items-center gap-1">
                              <Scissors size={11} />
                              <span>Kesish: {cuts} ta × {formatOptimoNumber(cutPrice, 0)} = +{formatOptimoNumber(cuttingSum, 0)} UZS</span>
                            </p>
                          )}
                        </div>

                        <div className="col-span-2 text-right font-semibold text-gray-800">
                          {formatOptimoNumber(item.unitPrice)}
                        </div>

                        <div className="col-span-2 text-center">
                          <div className={clsx('font-bold', isReturn ? 'text-rose-600' : 'text-indigo-700')}>
                            {isReturn ? '-' : ''}{item.quantity} {unitLabel}
                          </div>
                          <div className="text-[10px] text-gray-500 font-medium">
                            ({pCount} ta)
                          </div>
                        </div>

                        <div
                          className={clsx(
                            'col-span-2 text-right font-extrabold truncate',
                            isReturn ? 'text-rose-600' : 'text-gray-900',
                          )}
                        >
                          {formatOptimoNumber(lineSum)}
                        </div>

                        <div className="col-span-1 flex justify-end">
                          <button
                            onClick={e => { e.stopPropagation(); removeFromCart(itemKey); }}
                            className="p-1.5 text-slate-400 hover:text-red-600 cursor-pointer"
                          >
                            <Trash2 size={15} />
                          </button>
                        </div>
                      </div>

                      {/* Inline Dimensions (O'lcham, Kv.m, Soni, Umumiy o'lcham) & Cutting Service Controls when selected */}
                      {isSelected && (
                        <div
                          onClick={e => e.stopPropagation()}
                          className="mt-2 pt-2 border-t border-indigo-200/80 bg-white/90 rounded-lg p-2 space-y-2 shadow-2xs"
                        >
                          <div className="grid grid-cols-12 gap-2 items-end">
                            {/* O'lcham (Uzunligi / Bo'yi) */}
                            <div className={item.product.unit === 'kv.m' ? 'col-span-3' : 'col-span-4'}>
                              <label className="block text-[10px] font-bold text-gray-600 mb-0.5">
                                {item.product.unit === 'kv.m' ? "Bo'yi (m)" : "O'lchami (m)"}
                              </label>
                              <input
                                type="number"
                                step="0.1"
                                value={pLen}
                                onChange={e => applyDimChange(parseFloat(e.target.value) || 0, pWid, pCount, cuts, cutPrice)}
                                className="w-full h-7 px-2 rounded border border-gray-300 text-xs font-bold text-gray-900 bg-white"
                              />
                            </div>

                            {/* Eni (m) — faqat kv.m uchun */}
                            {item.product.unit === 'kv.m' && (
                              <div className="col-span-3">
                                <label className="block text-[10px] font-bold text-gray-600 mb-0.5">
                                  Eni (m)
                                </label>
                                <input
                                  type="number"
                                  step="0.05"
                                  value={pWid}
                                  onChange={e => applyDimChange(pLen, parseFloat(e.target.value) || 0, pCount, cuts, cutPrice)}
                                  className="w-full h-7 px-2 rounded border border-gray-300 text-xs font-bold text-gray-900 bg-white"
                                />
                              </div>
                            )}

                            {/* Nechta (Soni / Shtuk) */}
                            <div className={item.product.unit === 'kv.m' ? 'col-span-3' : 'col-span-4'}>
                              <label className="block text-[10px] font-bold text-gray-600 mb-0.5">
                                Nechta (Soni)
                              </label>
                              <div className="flex items-center">
                                <button
                                  type="button"
                                  onClick={() => applyDimChange(pLen, pWid, Math.max(1, pCount - 1), cuts, cutPrice)}
                                  className="w-6 h-7 bg-gray-100 hover:bg-gray-200 border border-gray-300 rounded-l font-bold text-gray-700 cursor-pointer"
                                >
                                  -
                                </button>
                                <input
                                  type="number"
                                  value={pCount}
                                  onChange={e => applyDimChange(pLen, pWid, parseInt(e.target.value, 10) || 1, cuts, cutPrice)}
                                  className="w-full h-7 px-1 border-y border-gray-300 text-center text-xs font-bold text-gray-900 bg-white"
                                />
                                <button
                                  type="button"
                                  onClick={() => applyDimChange(pLen, pWid, pCount + 1, cuts, cutPrice)}
                                  className="w-6 h-7 bg-gray-100 hover:bg-gray-200 border border-gray-300 rounded-r font-bold text-gray-700 cursor-pointer"
                                >
                                  +
                                </button>
                              </div>
                            </div>

                            {/* Umumiy o'lchami (Jami m / kv.m) */}
                            <div className={item.product.unit === 'kv.m' ? 'col-span-3' : 'col-span-4'}>
                              <label className="block text-[10px] font-bold text-indigo-700 mb-0.5">
                                Umumiy ({unitLabel})
                              </label>
                              <input
                                type="number"
                                step="0.01"
                                value={item.quantity}
                                onChange={e => updateCartQuantity(itemKey, parseFloat(e.target.value) || 0)}
                                className="w-full h-7 px-2 rounded border border-indigo-400 bg-indigo-50/60 text-xs font-extrabold text-indigo-900"
                              />
                            </div>
                          </div>

                          {/* Quick Size Preset Pills */}
                          <div className="flex flex-wrap items-center justify-between gap-1 pt-0.5">
                            <div className="flex flex-wrap items-center gap-1">
                              <span className="text-[10px] text-gray-500 font-medium">Tezkor o'lcham:</span>
                              {(item.product.unit === 'kv.m' ? [1.5, 2.0, 2.5, 6.0] : [1, 6, 9, 10, 11.7, 12]).map(lenVal => (
                                <button
                                  key={lenVal}
                                  type="button"
                                  onClick={() => applyDimChange(lenVal, pWid, pCount, cuts, cutPrice)}
                                  className={clsx(
                                    'px-1.5 py-0.5 rounded text-[10px] font-bold border cursor-pointer',
                                    pLen === lenVal
                                      ? 'bg-indigo-600 text-white border-indigo-600'
                                      : 'bg-gray-50 text-gray-700 border-gray-200 hover:bg-indigo-50',
                                  )}
                                >
                                  {lenVal}m
                                </button>
                              ))}
                            </div>

                            {/* Cutting Service Controls (Kesib berish xizmati) - only for new items */}
                            {!isReturn && (
                              <div className="flex items-center gap-1.5 bg-amber-50/90 border border-amber-200 rounded px-2 py-1">
                                <Scissors size={12} className="text-amber-700 shrink-0" />
                                <span className="text-[10px] font-bold text-amber-900">Kesish:</span>
                                <button
                                  type="button"
                                  onClick={() => applyDimChange(pLen, pWid, pCount, Math.max(0, cuts - 1), cutPrice)}
                                  className="w-5 h-5 rounded bg-white border border-amber-300 text-amber-900 font-bold flex items-center justify-center cursor-pointer"
                                >
                                  -
                                </button>
                                <input
                                  type="number"
                                  value={cuts}
                                  onChange={e => applyDimChange(pLen, pWid, pCount, parseInt(e.target.value, 10) || 0, cutPrice)}
                                  className="w-9 h-5 text-center text-[11px] font-bold bg-white border border-amber-300 rounded"
                                  title="Kesishlar soni"
                                />
                                <button
                                  type="button"
                                  onClick={() => applyDimChange(pLen, pWid, pCount, cuts + 1, cutPrice)}
                                  className="w-5 h-5 rounded bg-white border border-amber-300 text-amber-900 font-bold flex items-center justify-center cursor-pointer"
                                >
                                  +
                                </button>
                                <span className="text-[10px] text-amber-800">×</span>
                                <input
                                  type="number"
                                  step="500"
                                  value={cutPrice}
                                  onChange={e => applyDimChange(pLen, pWid, pCount, cuts, parseFloat(e.target.value) || 0)}
                                  className="w-16 h-5 px-1 text-right text-[11px] font-bold bg-white border border-amber-300 rounded"
                                  title="1 ta kesish narxi (UZS)"
                                />
                                <span className="text-[10px] font-bold text-amber-900">UZS</span>
                              </div>
                            )}
                          </div>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Combined Return + New Purchase Breakdown Strip (when cart has returned items) */}
          {returnTotal > 0 && (
            <div className="px-3 py-1.5 bg-amber-50 border-t border-amber-200 flex items-center justify-between text-[11px] font-bold shrink-0">
              <span className="text-emerald-800">
                🛒 Yangi: +{formatOptimoNumber(newSub)}
              </span>
              <span className="text-rose-600">
                ↩️ Qaytgan: -{formatOptimoNumber(returnTotal)}
              </span>
              <span className="text-indigo-950">
                Farq: {formatOptimoNumber(total)} UZS
              </span>
            </div>
          )}

          {/* Dark Purple Action & Total Bar (Exact match to Images 3 & 4) */}
          <div className="h-14 bg-[#312b4b] px-3 flex items-center justify-between text-white shrink-0 relative">
            <div className="flex items-center gap-2">
              <button
                onClick={() => setShowMoreActions(!showMoreActions)}
                className="w-10 h-9 rounded bg-white/90 hover:bg-white text-gray-800 flex items-center justify-center cursor-pointer"
                title="Qo'shimcha amallar"
              >
                <MoreHorizontal size={20} />
              </button>
              <button
                onClick={() => {
                  if (cartItems.length === 0) return showToast('info', "Avval mahsulot qo'shing");
                  window.print();
                }}
                className="w-10 h-9 rounded bg-white/90 hover:bg-white text-gray-800 flex items-center justify-center cursor-pointer"
                title="Oldindan chek chop etish"
              >
                <Printer size={18} />
              </button>
              <button
                onClick={() => {
                  const selItem = cartItems.find(i => (i.lineId || i.product.id) === selectedProductId);
                  if (selItem) setPieceLength(detectPieceLength(selItem.product.name));
                  setMetalCalcOpen(true);
                }}
                className="h-9 px-2 rounded bg-amber-400 hover:bg-amber-300 text-gray-900 font-bold text-xs flex items-center gap-1 cursor-pointer"
                title="Temir Kalkulyatori (Shtuk / Tonna -> Metr)"
              >
                <Calculator size={15} />
                <span className="hidden sm:inline">Shtuk/Metr</span>
              </button>
              <button
                onClick={() => setReturnAddMode(!returnAddMode)}
                className={clsx(
                  'h-9 px-2.5 rounded font-bold text-xs flex items-center gap-1 cursor-pointer transition-colors',
                  returnAddMode
                    ? 'bg-rose-500 text-white ring-2 ring-white'
                    : 'bg-white/15 hover:bg-white/25 text-rose-200',
                )}
                title="Qaytgan mahsulotni shu bitta chekka qo'shish"
              >
                <RotateCcw size={14} />
                <span>Qaytgan</span>
              </button>
            </div>

            {showMoreActions && (
              <div className="absolute left-3 bottom-15 bg-white text-gray-800 rounded-lg shadow-xl border border-gray-200 py-1 w-48 z-50 text-sm">
                <button
                  onClick={() => { clearCart(); setShowMoreActions(false); }}
                  className="w-full text-left px-4 py-2 hover:bg-red-50 text-red-600 font-medium"
                >
                  Buyurtmani tozalash
                </button>
                <button
                  onClick={() => { setCustomerModalOpen(true); setShowMoreActions(false); }}
                  className="w-full text-left px-4 py-2 hover:bg-gray-50"
                >
                  Xaridorni biriktirish
                </button>
              </div>
            )}

            <div className="flex items-center gap-2">
              <span className="text-xs text-gray-200 font-medium">
                {returnTotal > 0 ? 'Farq:' : 'Jami:'}
              </span>
              <span className="text-xl font-bold tracking-tight">{formatOptimoNumber(total)}</span>
              <ChevronDown size={16} className="text-gray-300" />
            </div>
          </div>

          {/* Bottom Numpad + Pay Button Grid (Exact match to Images 3 & 4) */}
          <div className="h-64 grid grid-cols-12 bg-gray-200 gap-[1px] border-t border-gray-300 shrink-0">
            {/* Left Mode Column (3 cols) */}
            <div className="col-span-3 grid grid-rows-4 gap-[1px] bg-gray-200">
              {([
                { id: 'quantity', label: 'Miqdor' },
                { id: 'discount', label: 'Chegirma' },
                { id: 'price', label: 'Narx' },
                { id: 'customer', label: 'Xaridor' },
              ] as const).map(m => (
                <button
                  key={m.id}
                  onClick={() => selectNumpadMode(m.id)}
                  className={clsx(
                    'text-xs font-semibold transition-colors cursor-pointer flex items-center justify-center',
                    numpadMode === m.id
                      ? 'bg-white text-indigo-700 font-bold shadow-inner'
                      : 'bg-[#e5e7eb] text-gray-600 hover:bg-gray-100',
                  )}
                >
                  {m.label}
                </button>
              ))}
            </div>

            {/* Middle Digits 3x4 (6 cols) */}
            <div className="col-span-5 grid grid-cols-3 grid-rows-4 gap-[1px] bg-gray-200">
              {['1', '2', '3', '4', '5', '6', '7', '8', '9'].map(digit => (
                <button
                  key={digit}
                  onClick={() => handlePosNumpad(digit)}
                  className="bg-white hover:bg-gray-50 active:bg-gray-100 text-lg font-semibold text-gray-800 flex items-center justify-center cursor-pointer"
                >
                  {digit}
                </button>
              ))}
              <button
                onClick={() => handlePosNumpad('BACK')}
                className="bg-white hover:bg-gray-50 active:bg-gray-100 text-gray-700 flex items-center justify-center cursor-pointer"
              >
                <Delete size={18} />
              </button>
              <button
                onClick={() => handlePosNumpad('0')}
                className="bg-white hover:bg-gray-50 active:bg-gray-100 text-lg font-semibold text-gray-800 flex items-center justify-center cursor-pointer"
              >
                0
              </button>
              <button
                onClick={() => handlePosNumpad('.')}
                className="bg-white hover:bg-gray-50 active:bg-gray-100 text-lg font-bold text-gray-800 flex items-center justify-center cursor-pointer"
              >
                .
              </button>
            </div>

            {/* Right Tall Blue Pay Button (4 cols) */}
            <button
              onClick={openPaymentScreen}
              className="col-span-4 bg-[#2563eb] hover:bg-[#1d4ed8] active:bg-[#1e40af] text-white flex flex-col items-center justify-center gap-2 transition-colors cursor-pointer"
            >
              <div className="w-11 h-11 rounded-full border-2 border-white/80 flex items-center justify-center text-lg font-bold">
                »»
              </div>
              <div className="text-center">
                <p className="text-base font-bold">To'lov</p>
                <p className="text-[11px] text-blue-100 mt-0.5">
                  ({saleType === 'chakana' ? 'Chakana savdo' : 'Ulgurji savdo'})
                </p>
              </div>
            </button>
          </div>
        </div>

        {/* ================================================================
            RIGHT PANE: PRODUCT CATALOG TABS & CARDS (58% width)
           ================================================================ */}
        <div className="flex-1 flex flex-col bg-[#eef0f4] overflow-hidden">
          {/* Top Tabs Bar: Asosiy | Kategoriyalar | Ta'minotchilar + Search + Grid Toggle */}
          <div className="px-3 pt-2 flex items-center justify-between gap-2 shrink-0">
            <div className="flex items-center gap-1.5">
              <button
                onClick={() => { setRightTab('asosiy'); setSelectedCatId(''); setSelectedSupId(''); }}
                className={clsx(
                  'px-6 py-2 rounded-t-lg text-xs font-bold transition-colors cursor-pointer',
                  rightTab === 'asosiy'
                    ? 'bg-[#653224] text-white shadow-xs'
                    : 'bg-white text-gray-700 hover:bg-gray-100',
                )}
              >
                Asosiy
              </button>
              <button
                onClick={() => setRightTab('kategoriyalar')}
                className={clsx(
                  'px-6 py-2 rounded-t-lg text-xs font-bold transition-colors cursor-pointer',
                  rightTab === 'kategoriyalar'
                    ? 'bg-[#653224] text-white shadow-xs'
                    : 'bg-white text-gray-700 hover:bg-gray-100',
                )}
              >
                Kategoriyalar
              </button>
              <button
                onClick={() => setRightTab('taminotchilar')}
                className={clsx(
                  'px-6 py-2 rounded-t-lg text-xs font-bold transition-colors cursor-pointer',
                  rightTab === 'taminotchilar'
                    ? 'bg-[#653224] text-white shadow-xs'
                    : 'bg-white text-gray-700 hover:bg-gray-100',
                )}
              >
                Ta'minotchilar
              </button>
            </div>

            {/* Search & Grid Density Controls */}
            <div className="flex items-center gap-2 pb-1">
              <div className="relative">
                <Search size={14} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-gray-400" />
                <input
                  ref={searchInputRef}
                  type="text"
                  value={searchQuery}
                  onChange={e => setSearchQuery(e.target.value)}
                  placeholder="Qidiruv (Nom / Shtrix)..."
                  className="pl-8 pr-7 h-8 w-44 sm:w-56 bg-white border border-gray-200 rounded-lg text-xs focus:outline-none focus:border-indigo-500"
                />
                {searchQuery && (
                  <button onClick={() => setSearchQuery('')} className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-400">
                    <X size={13} />
                  </button>
                )}
              </div>

              <button
                onClick={() => setCompactGrid(false)}
                className={clsx('p-1.5 rounded bg-white border cursor-pointer', !compactGrid ? 'text-indigo-600 border-indigo-300' : 'text-gray-400 border-gray-200')}
              >
                <LayoutGrid size={16} />
              </button>
              <button
                onClick={() => setCompactGrid(true)}
                className={clsx('p-1.5 rounded bg-white border cursor-pointer', compactGrid ? 'text-indigo-600 border-indigo-300' : 'text-gray-400 border-gray-200')}
              >
                <Grid3x3 size={16} />
              </button>
            </div>
          </div>

          {/* Sub-filter pills when Kategoriyalar or Ta'minotchilar tab is active */}
          {rightTab === 'kategoriyalar' && (
            <div className="px-3 py-2 flex gap-1.5 overflow-x-auto bg-white/60 border-b border-gray-200 shrink-0">
              <button
                onClick={() => setSelectedCatId('')}
                className={clsx('px-3 py-1 rounded text-xs font-semibold cursor-pointer', !selectedCatId ? 'bg-indigo-600 text-white' : 'bg-white text-gray-700 border border-gray-200')}
              >
                Barchasi
              </button>
              {categories.map(c => (
                <button
                  key={c.id}
                  onClick={() => setSelectedCatId(c.id)}
                  className={clsx('px-3 py-1 rounded text-xs font-semibold cursor-pointer whitespace-nowrap', selectedCatId === c.id ? 'bg-indigo-600 text-white' : 'bg-white text-gray-700 border border-gray-200')}
                >
                  {c.name}
                </button>
              ))}
            </div>
          )}

          {rightTab === 'taminotchilar' && (
            <div className="px-3 py-2 flex gap-1.5 overflow-x-auto bg-white/60 border-b border-gray-200 shrink-0">
              <button
                onClick={() => setSelectedSupId('')}
                className={clsx('px-3 py-1 rounded text-xs font-semibold cursor-pointer', !selectedSupId ? 'bg-indigo-600 text-white' : 'bg-white text-gray-700 border border-gray-200')}
              >
                Barchasi
              </button>
              {suppliers.map(s => (
                <button
                  key={s.id}
                  onClick={() => setSelectedSupId(s.id)}
                  className={clsx('px-3 py-1 rounded text-xs font-semibold cursor-pointer whitespace-nowrap', selectedSupId === s.id ? 'bg-indigo-600 text-white' : 'bg-white text-gray-700 border border-gray-200')}
                >
                  {s.name}
                </button>
              ))}
            </div>
          )}

          {/* Product Cards Grid (Exact match to Images 3 & 4) */}
          <div className="flex-1 overflow-y-auto p-3">
            <div className={clsx(
              'grid gap-3',
              compactGrid ? 'grid-cols-3 sm:grid-cols-4 xl:grid-cols-5' : 'grid-cols-2 sm:grid-cols-3 xl:grid-cols-4',
            )}>
              {visibleProducts.map(product => {
                const isLowOrZero = product.stock <= 0 || product.stock <= product.minStock;
                const displayPrice = saleType === 'ulgurji' && product.wholesalePrice ? product.wholesalePrice : product.salePrice;

                return (
                  <div
                    key={product.id}
                    onClick={() => addToCart(product, returnAddMode)}
                    className="group cursor-pointer select-none flex flex-col"
                  >
                    {/* Card Visual Box */}
                    <div
                      className={clsx(
                        'relative h-28 rounded-xl bg-gradient-to-b from-[#d8dce3] via-[#c5cbd6] to-[#373c47] border shadow-xs overflow-hidden flex items-center justify-center transition-all active:scale-95',
                        returnAddMode
                          ? 'border-rose-400 group-hover:ring-2 group-hover:ring-rose-500'
                          : 'border-gray-300 group-hover:ring-2 group-hover:ring-indigo-500',
                      )}
                    >
                      {returnAddMode && (
                        <span className="absolute top-2 left-2 px-1.5 py-0.5 rounded bg-rose-600 text-white text-[10px] font-bold shadow-2xs">
                          ↩️ Qaytgan
                        </span>
                      )}
                      {product.image ? (
                        <img src={product.image} alt={product.name} className="w-full h-full object-cover" />
                      ) : (
                        <ImageIcon size={34} className="text-gray-400/80 mb-3" />
                      )}

                      {/* Top-right Stock Pill Badge */}
                      <span
                        className={clsx(
                          'absolute top-2 right-2 px-2 py-0.5 rounded-full text-[11px] font-bold shadow-2xs',
                          isLowOrZero
                            ? 'bg-pink-200/95 text-red-900'
                            : 'bg-emerald-200/95 text-emerald-950',
                        )}
                      >
                        {formatOptimoNumber(product.stock, product.stock % 1 === 0 ? 0 : 2)}
                      </span>

                      {/* Bottom Price Overlay */}
                      <div className="absolute bottom-0 inset-x-0 px-2.5 py-1.5 bg-gradient-to-t from-black/75 via-black/40 to-transparent">
                        <p className="text-white font-bold text-sm tracking-tight">
                          {formatOptimoNumber(displayPrice)}
                        </p>
                      </div>
                    </div>

                    {/* Below-card Product Name & SKU */}
                    <div className="pt-1.5 px-0.5">
                      <p className="text-xs font-bold text-gray-800 leading-tight line-clamp-1">
                        {product.name}
                      </p>
                      <p className="text-[11px] text-gray-500 mt-0.5 font-medium">
                        {product.sku}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>

      {/* Customer Selector Modal */}
      <Modal
        open={customerModalOpen}
        onClose={() => setCustomerModalOpen(false)}
        title="Xaridorni tanlash yoki qo'shish"
        size="md"
      >
        <div className="space-y-4">
          <Input
            placeholder="Xaridor ismi yoki telefoni..."
            value={customerSearch}
            onChange={e => setCustomerSearch(e.target.value)}
            fullWidth
          />
          <div className="max-h-48 overflow-y-auto divide-y divide-gray-100 border border-gray-200 rounded-lg">
            {customers
              .filter(c => !customerSearch || c.name.toLowerCase().includes(customerSearch.toLowerCase()) || c.phone.includes(customerSearch))
              .map(c => (
                <button
                  key={c.id}
                  onClick={() => { setSelectedCustomer(c); setCustomerModalOpen(false); }}
                  className="w-full px-3.5 py-2.5 text-left hover:bg-indigo-50 flex justify-between items-center text-sm cursor-pointer"
                >
                  <div>
                    <p className="font-semibold text-gray-900">{c.name}</p>
                    <p className="text-xs text-gray-500">{c.phone}</p>
                  </div>
                  <span className="text-xs text-indigo-600 font-medium">Tanlash</span>
                </button>
              ))}
          </div>

          <div className="border-t border-gray-200 pt-3">
            <p className="text-xs font-semibold text-gray-500 uppercase mb-2">Yangi xaridor qo'shish</p>
            <div className="grid grid-cols-2 gap-2">
              <Input
                placeholder="Ism familiya"
                value={newCustomerForm.name}
                onChange={e => setNewCustomerForm({ ...newCustomerForm, name: e.target.value })}
              />
              <Input
                placeholder="+998 90 123 45 67"
                value={newCustomerForm.phone}
                onChange={e => setNewCustomerForm({ ...newCustomerForm, phone: e.target.value })}
              />
            </div>
            <Button
              variant="primary"
              size="sm"
              className="mt-2"
              icon={<UserPlus size={14} />}
              onClick={() => {
                if (!newCustomerForm.name.trim()) return;
                const created = addCustomer({ name: newCustomerForm.name, phone: newCustomerForm.phone || '+998' });
                setSelectedCustomer(created);
                setNewCustomerForm({ name: '', phone: '' });
                setCustomerModalOpen(false);
              }}
            >
              Qo'shish va tanlash
            </Button>
          </div>
        </div>
      </Modal>

      {/* Temir Kalkulyatori Modal (Shtuk / Tonna -> Metr) */}
      <Modal
        open={metalCalcOpen}
        onClose={() => setMetalCalcOpen(false)}
        title="Temir Kalkulyatori (Shtuk va Tonna → Metr)"
        size="md"
      >
        {(() => {
          const rebarWeights: Record<number, number> = {
            10: 0.617,
            12: 0.888,
            14: 1.21,
            16: 1.58,
            18: 2.0,
            20: 2.47,
            22: 2.98,
          };
          const shtukVal = parseFloat(pieceCount) || 0;
          const totalMetersFromPieces = +(shtukVal * pieceLength).toFixed(2);
          const kgVal = parseFloat(tonnageKg) || 0;
          const weightPerMeter = rebarWeights[rebarDiameter] || 1.58;
          const totalMetersFromWeight = +(kgVal / weightPerMeter).toFixed(2);
          const approxPiecesFromWeight = +(totalMetersFromWeight / 11.7).toFixed(1);

          return (
            <div className="space-y-5">
              {/* 1. Shtuk (Dona) -> Metr */}
              <div className="p-4 rounded-xl bg-indigo-50/60 border border-indigo-200 space-y-3">
                <p className="text-xs font-bold uppercase text-indigo-900">
                  1. Shtuk (Dona) bo'yicha metrajni hisoblash (Armatura, Profil, Ugolok, Truba)
                </p>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-semibold text-gray-600 mb-1">Shtuk (dona) soni</label>
                    <input
                      type="number"
                      value={pieceCount}
                      onChange={e => setPieceCount(e.target.value)}
                      className="w-full h-10 px-3 rounded-lg border border-gray-300 bg-white font-bold text-gray-900"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-gray-600 mb-1">1 shtuk uzunligi (m)</label>
                    <div className="flex gap-1">
                      {[6, 9, 10, 11.7, 12].map(len => (
                        <button
                          key={len}
                          type="button"
                          onClick={() => setPieceLength(len)}
                          className={clsx(
                            'flex-1 h-10 rounded-lg text-xs font-bold border cursor-pointer',
                            pieceLength === len
                              ? 'bg-indigo-600 text-white border-indigo-600'
                              : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50',
                          )}
                        >
                          {len}m
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
                <div className="flex items-center justify-between pt-2 border-t border-indigo-200/70">
                  <div>
                    <span className="text-xs text-gray-600">Jami metraj: </span>
                    <strong className="text-lg font-extrabold text-indigo-700">{totalMetersFromPieces} metr</strong>
                  </div>
                  <Button
                    variant="primary"
                    size="sm"
                    onClick={() => {
                      if (!selectedProductId) {
                        showToast('warning', 'Avval savatga mahsulot qo\'shib, uni tanlang');
                        return;
                      }
                      updateCartQuantity(selectedProductId, totalMetersFromPieces);
                      setMetalCalcOpen(false);
                      showToast('success', `${shtukVal} shtuk × ${pieceLength}m = ${totalMetersFromPieces} metr savatga qo'llandi`);
                    }}
                  >
                    Savatga qo'llash ({totalMetersFromPieces} m)
                  </Button>
                </div>
              </div>

              {/* 2. Tonna / Kg -> Metr (Armatura uchun GOST vazn jadvali) */}
              <div className="p-4 rounded-xl bg-amber-50/60 border border-amber-200 space-y-3">
                <p className="text-xs font-bold uppercase text-amber-900">
                  2. Tonna / Kg bo'yicha Armatura metrajini hisoblash
                </p>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-semibold text-gray-600 mb-1">Og'irligi (kg) — 1 tonna = 1000 kg</label>
                    <input
                      type="number"
                      value={tonnageKg}
                      onChange={e => setTonnageKg(e.target.value)}
                      className="w-full h-10 px-3 rounded-lg border border-gray-300 bg-white font-bold text-gray-900"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-gray-600 mb-1">Armatura diametri (Ø mm)</label>
                    <select
                      value={rebarDiameter}
                      onChange={e => setRebarDiameter(Number(e.target.value))}
                      className="w-full h-10 px-3 rounded-lg border border-gray-300 bg-white text-sm font-semibold"
                    >
                      <option value={10}>Ø 10 mm (1m = 0.617 kg)</option>
                      <option value={12}>Ø 12 mm (1m = 0.888 kg)</option>
                      <option value={14}>Ø 14 mm (1m = 1.210 kg)</option>
                      <option value={16}>Ø 16 mm (1m = 1.580 kg)</option>
                      <option value={18}>Ø 18 mm (1m = 2.000 kg)</option>
                      <option value={20}>Ø 20 mm (1m = 2.470 kg)</option>
                      <option value={22}>Ø 22 mm (1m = 2.980 kg)</option>
                    </select>
                  </div>
                </div>
                <div className="flex items-center justify-between pt-2 border-t border-amber-200/70">
                  <div>
                    <span className="text-xs text-gray-600">Natija: </span>
                    <strong className="text-base font-extrabold text-amber-900">{totalMetersFromWeight} metr</strong>
                    <span className="text-xs text-gray-500 ml-1.5">(≈ {approxPiecesFromWeight} shtuk × 11.7m)</span>
                  </div>
                  <Button
                    variant="primary"
                    size="sm"
                    onClick={() => {
                      if (!selectedProductId) {
                        showToast('warning', 'Avval savatga mahsulot qo\'shib, uni tanlang');
                        return;
                      }
                      updateCartQuantity(selectedProductId, totalMetersFromWeight);
                      setMetalCalcOpen(false);
                      showToast('success', `${kgVal} kg (Ø${rebarDiameter}) = ${totalMetersFromWeight} metr savatga qo'llandi`);
                    }}
                  >
                    Savatga qo'llash ({totalMetersFromWeight} m)
                  </Button>
                </div>
              </div>
            </div>
          );
        })()}
      </Modal>
    </div>
  );
}
