import { useState } from 'react';
import { ClipboardList, CheckCircle, AlertTriangle } from 'lucide-react';
import { Button, Badge } from '../components/ui/Button';
import { Modal } from '../components/ui/Modal';
import { Card } from '../components/ui/StatCard';
import { useStore } from '../store/useStore';
import { formatCurrency } from '../utils/format';

interface InventoryCount {
  productId: string;
  productName: string;
  sku: string;
  unit: string;
  systemStock: number;
  countedStock: number | '';
  diff: number;
  salePrice: number;
}

export function Inventory() {
  const { products, applyInventoryCounts, showToast } = useStore();
  const [started, setStarted] = useState(false);
  const [counts, setCounts] = useState<InventoryCount[]>([]);
  const [confirmOpen, setConfirmOpen] = useState(false);

  const startInventory = () => {
    const c: InventoryCount[] = products.map(p => ({
      productId: p.id,
      productName: p.name,
      sku: p.sku,
      unit: p.unit,
      systemStock: p.stock,
      countedStock: '',
      diff: 0,
      salePrice: p.salePrice,
    }));
    setCounts(c);
    setStarted(true);
  };

  const updateCount = (productId: string, value: string) => {
    setCounts(prev =>
      prev.map(c => {
        if (c.productId !== productId) return c;
        const counted = value === '' ? '' : Math.max(0, parseFloat(value) || 0);
        return {
          ...c,
          countedStock: counted,
          diff: counted === '' ? 0 : counted - c.systemStock,
        };
      })
    );
  };

  const handleConfirm = () => {
    const changes = counts
      .filter(c => c.countedStock !== '')
      .map(c => ({ productId: c.productId, countedStock: Number(c.countedStock) }));

    applyInventoryCounts(changes);
    showToast('success', 'Inventarizatsiya muvaffaqiyatli tasdiqlandi va zaxira qoldiqlari yangilandi');
    setConfirmOpen(false);
    setStarted(false);
    setCounts([]);
  };

  const totalDiff = counts.reduce((s, c) => s + (c.countedStock === '' ? 0 : c.diff * c.salePrice), 0);
  const changedItems = counts.filter(c => c.countedStock !== '' && c.diff !== 0);

  if (!started) {
    return (
      <div className="flex flex-col items-center justify-center py-20 gap-6 bg-white rounded-2xl border border-gray-200 shadow-xs">
        <div className="w-20 h-20 bg-indigo-50 rounded-2xl flex items-center justify-center">
          <ClipboardList size={40} className="text-indigo-600" />
        </div>
        <div className="text-center px-4">
          <h2 className="text-xl font-bold text-gray-900">Ombor inventarizatsiyasi</h2>
          <p className="text-gray-500 mt-2 max-w-md text-sm">
            Inventarizatsiya jarayonida tizimdagi qoldiqlar va haqiqiy sanalgan qoldiqlar solishtirilib, farqlar hisoblanadi hamda tasdiqlangach ombor yangilanadi.
          </p>
        </div>
        <Button variant="primary" size="lg" icon={<ClipboardList size={18} />} onClick={startInventory}>
          Yangi inventarizatsiyani boshlash
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h2 className="font-bold text-gray-900 text-lg">Inventarizatsiya ro'yxati</h2>
          <p className="text-sm text-gray-500">Haqiqiy sanalgan miqdorni kiriting. Bo'sh qoldirilgan qatorlar o'zgarmaydi.</p>
        </div>
        <div className="flex gap-2">
          <Button variant="secondary" onClick={() => { setStarted(false); setCounts([]); }}>
            Bekor qilish
          </Button>
          <Button variant="primary" icon={<CheckCircle size={16} />} onClick={() => setConfirmOpen(true)}>
            Xulosa va tasdiqlash ({changedItems.length} ta farq)
          </Button>
        </div>
      </div>

      {/* Summary */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Card>
          <div className="text-center">
            <p className="text-sm text-gray-500">Tekshirilayotgan mahsulotlar</p>
            <p className="text-2xl font-bold text-gray-900 mt-1">{counts.length} ta</p>
          </div>
        </Card>
        <Card>
          <div className="text-center">
            <p className="text-sm text-gray-500">Farq aniqlangan mahsulotlar</p>
            <p className="text-2xl font-bold text-amber-500 mt-1">{changedItems.length} ta</p>
          </div>
        </Card>
        <Card>
          <div className="text-center">
            <p className="text-sm text-gray-500">Umumiy moliyaviy farq</p>
            <p className={`text-2xl font-bold mt-1 ${totalDiff >= 0 ? 'text-green-600' : 'text-red-500'}`}>
              {totalDiff >= 0 ? '+' : ''}{formatCurrency(totalDiff)}
            </p>
          </div>
        </Card>
      </div>

      <Card padding={false}>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-gray-50 border-b border-gray-200">
                <th className="text-left px-4 py-3 font-semibold text-gray-600">Mahsulot nomi</th>
                <th className="text-left px-4 py-3 font-semibold text-gray-600">SKU</th>
                <th className="text-right px-4 py-3 font-semibold text-gray-600">Tizimdagi qoldiq</th>
                <th className="text-center px-4 py-3 font-semibold text-gray-600">Sanalgan qoldiq</th>
                <th className="text-right px-4 py-3 font-semibold text-gray-600">Miqdor farqi</th>
                <th className="text-right px-4 py-3 font-semibold text-gray-600">Summa farqi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {counts.map(c => {
                const hasChange = c.countedStock !== '' && c.diff !== 0;
                return (
                  <tr key={c.productId} className={hasChange ? 'bg-amber-50/60' : 'hover:bg-gray-50'}>
                    <td className="px-4 py-3 font-medium text-gray-900">{c.productName}</td>
                    <td className="px-4 py-3 font-mono text-xs text-gray-500">{c.sku}</td>
                    <td className="px-4 py-3 text-right font-medium">{c.systemStock} {c.unit}</td>
                    <td className="px-4 py-3">
                      <input
                        type="number"
                        value={c.countedStock}
                        onChange={e => updateCount(c.productId, e.target.value)}
                        className="w-28 mx-auto block text-center border border-gray-300 rounded-lg px-2 py-1.5 text-sm font-semibold bg-white focus:outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20"
                        placeholder={c.systemStock.toString()}
                        min={0}
                      />
                    </td>
                    <td className="px-4 py-3 text-right">
                      {c.countedStock !== '' ? (
                        <span className={`font-bold ${c.diff > 0 ? 'text-green-600' : c.diff < 0 ? 'text-red-500' : 'text-gray-500'}`}>
                          {c.diff > 0 ? '+' : ''}{c.diff} {c.unit}
                        </span>
                      ) : <span className="text-gray-300">—</span>}
                    </td>
                    <td className="px-4 py-3 text-right">
                      {c.countedStock !== '' && c.diff !== 0 ? (
                        <span className={`text-sm font-semibold ${c.diff > 0 ? 'text-green-600' : 'text-red-500'}`}>
                          {c.diff > 0 ? '+' : ''}{formatCurrency(c.diff * c.salePrice)}
                        </span>
                      ) : <span className="text-gray-300">—</span>}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </Card>

      {/* Confirm modal */}
      <Modal
        open={confirmOpen}
        onClose={() => setConfirmOpen(false)}
        title="Inventarizatsiya o'zgarishlari xulosasi"
        size="md"
        footer={
          <>
            <Button variant="secondary" onClick={() => setConfirmOpen(false)}>Orqaga qaytish</Button>
            <Button variant="primary" onClick={handleConfirm}>Tasdiqlash va zaxirani yangilash</Button>
          </>
        }
      >
        <div className="space-y-4">
          <p className="text-sm text-gray-600">Tasdiqlashdan oldin quyidagi o'zgarishlar bilan tanishing:</p>
          {changedItems.length === 0 ? (
            <div className="flex items-center gap-3 p-4 bg-green-50 rounded-xl text-green-700">
              <CheckCircle size={20} />
              <span className="text-sm font-medium">Hech qanday farq kiritilmadi. Barcha qoldiqlar o'zgarishsiz qoladi.</span>
            </div>
          ) : (
            <div className="max-h-64 overflow-y-auto space-y-2">
              {changedItems.map(c => (
                <div key={c.productId} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg text-sm">
                  <span className="font-medium text-gray-900">{c.productName}</span>
                  <div className="flex items-center gap-3">
                    <span className="text-gray-500">{c.systemStock} → <strong>{c.countedStock}</strong> {c.unit}</span>
                    <Badge color={c.diff > 0 ? 'green' : 'red'}>{c.diff > 0 ? '+' : ''}{c.diff}</Badge>
                  </div>
                </div>
              ))}
            </div>
          )}
          <div className="flex items-center gap-2 p-3 bg-amber-50 rounded-xl text-amber-800 text-xs">
            <AlertTriangle size={16} className="shrink-0" />
            <span>Tasdiqlangandan so'ng ombor qoldiqlari yangilanadi va ombor harakati tarixiga yoziladi.</span>
          </div>
        </div>
      </Modal>
    </div>
  );
}
