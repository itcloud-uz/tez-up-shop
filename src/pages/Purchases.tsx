import { useState } from 'react';
import { Plus, Eye, CheckCircle, XCircle } from 'lucide-react';
import { Table, Pagination } from '../components/ui/Table';
import { Button, Badge } from '../components/ui/Button';
import { Input, Select, Textarea } from '../components/ui/Input';
import { Modal, ConfirmModal } from '../components/ui/Modal';
import { Card } from '../components/ui/StatCard';
import { useStore } from '../store/useStore';
import { formatCurrency, formatDate } from '../utils/format';
import type { Purchase, PurchaseItem } from '../types';

const PAGE_SIZE = 10;

const statusBadge = (status: string) => {
  if (status === 'qabul_qilindi') return <Badge color="green" dot>Qabul qilindi</Badge>;
  if (status === 'bekor_qilindi') return <Badge color="red" dot>Bekor qilindi</Badge>;
  return <Badge color="amber" dot>Qoralama</Badge>;
};

export function Purchases() {
  const { purchases, suppliers, products, addPurchase, confirmPurchase, cancelPurchase, currentUser, showToast } = useStore();
  const [page, setPage] = useState(1);
  const [viewPurchase, setViewPurchase] = useState<Purchase | null>(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [confirmId, setConfirmId] = useState<string | null>(null);
  const [cancelId, setCancelId] = useState<string | null>(null);
  const [form, setForm] = useState({ supplierId: '', date: new Date().toISOString().split('T')[0], discount: 0, note: '' });
  const [items, setItems] = useState<Omit<PurchaseItem, 'total'>[]>([]);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const totalPages = Math.ceil(purchases.length / PAGE_SIZE) || 1;
  const paged = purchases.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  const addItem = () => {
    const firstProd = products[0];
    setItems([
      ...items,
      {
        productId: firstProd?.id || '',
        productName: firstProd?.name || '',
        quantity: 10,
        purchasePrice: firstProd?.purchasePrice || 0,
        discount: 0,
      },
    ]);
  };

  const updateItem = (i: number, key: string, value: string | number) => {
    setItems(prev => {
      const updated = [...prev];
      if (key === 'productId') {
        const p = products.find(p => p.id === value);
        updated[i] = { ...updated[i], productId: value as string, productName: p?.name || '', purchasePrice: p?.purchasePrice || 0 };
      } else {
        updated[i] = { ...updated[i], [key]: value };
      }
      return updated;
    });
  };
  const removeItem = (i: number) => setItems(items.filter((_, idx) => idx !== i));

  const subtotal = items.reduce((s, it) => s + it.quantity * it.purchasePrice * (1 - it.discount / 100), 0);
  const total = Math.round(subtotal * (1 - form.discount / 100));

  const handleSave = (autoConfirm = false) => {
    const e: Record<string, string> = {};
    if (!form.supplierId) e.supplierId = 'Yetkazib beruvchi tanlanishi shart';
    if (items.length === 0) e.items = "Kamida bitta mahsulot qo'shilishi shart";
    setErrors(e);
    if (Object.keys(e).length > 0) return;

    addPurchase({
      date: form.date,
      supplierId: form.supplierId,
      supplierName: suppliers.find(s => s.id === form.supplierId)?.name || '',
      branchId: 'b1',
      items: items.map(it => ({ ...it, total: Math.round(it.quantity * it.purchasePrice * (1 - it.discount / 100)) })),
      subtotal,
      discount: form.discount,
      total,
      status: 'qoralama',
      note: form.note,
    });

    if (autoConfirm) {
      const latest = useStore.getState().purchases[0];
      if (latest) useStore.getState().confirmPurchase(latest.id);
      showToast('success', 'Xarid hujjati qabul qilindi va zaxiralar yangilandi');
    } else {
      showToast('success', 'Xarid hujjati qoralama sifatida saqlandi');
    }

    setModalOpen(false);
    setForm({ supplierId: '', date: new Date().toISOString().split('T')[0], discount: 0, note: '' });
    setItems([]);
  };

  const handleConfirm = (id: string) => {
    confirmPurchase(id);
    setConfirmId(null);
    showToast('success', 'Xarid tasdiqlandi va ombor qoldig\'i oshirildi');
  };

  const handleCancel = (id: string) => {
    cancelPurchase(id);
    setCancelId(null);
    showToast('info', 'Xarid hujjati bekor qilindi');
  };

  const canConfirm = currentUser.role === 'admin' || currentUser.role === 'menejer' || currentUser.role === 'omborchi';

  return (
    <div className="space-y-5">
      <div className="flex justify-end">
        <Button
          variant="primary"
          icon={<Plus size={15} />}
          onClick={() => {
            setItems([]);
            setForm({ supplierId: suppliers[0]?.id || '', date: new Date().toISOString().split('T')[0], discount: 0, note: '' });
            setErrors({});
            setModalOpen(true);
          }}
        >
          Yangi xarid hujjati
        </Button>
      </div>

      <Card padding={false}>
        <Table
          columns={[
            { key: 'id', header: 'Hujjat #', render: (p: Purchase) => <span className="font-mono text-xs font-semibold">{p.id.toUpperCase()}</span> },
            { key: 'date', header: 'Sana', render: (p: Purchase) => formatDate(p.date) },
            { key: 'supplierName', header: 'Yetkazib beruvchi', render: (p: Purchase) => <span className="font-medium text-gray-900">{p.supplierName}</span> },
            { key: 'itemCount', header: 'Mahsulot turlari', render: (p: Purchase) => <span>{p.items.length} xil</span> },
            { key: 'total', header: 'Jami summa', render: (p: Purchase) => <span className="font-semibold text-indigo-600">{formatCurrency(p.total)}</span> },
            { key: 'status', header: 'Holat', render: (p: Purchase) => statusBadge(p.status) },
            {
              key: 'actions', header: 'Amallar',
              render: (p: Purchase) => (
                <div className="flex gap-1">
                  <Button variant="ghost" size="xs" icon={<Eye size={14} />} onClick={() => setViewPurchase(p)} />
                  {canConfirm && p.status === 'qoralama' && (
                    <>
                      <Button
                        variant="ghost"
                        size="xs"
                        icon={<CheckCircle size={14} />}
                        className="text-green-600 hover:bg-green-50"
                        onClick={() => setConfirmId(p.id)}
                      >
                        Qabul qilish
                      </Button>
                      <Button
                        variant="ghost"
                        size="xs"
                        icon={<XCircle size={14} />}
                        className="text-red-500 hover:bg-red-50"
                        onClick={() => setCancelId(p.id)}
                      />
                    </>
                  )}
                </div>
              )
            },
          ]}
          data={paged}
          keyExtractor={(p: Purchase) => p.id}
        />
        {purchases.length > PAGE_SIZE && (
          <Pagination page={page} totalPages={totalPages} onPage={setPage} total={purchases.length} pageSize={PAGE_SIZE} />
        )}
      </Card>

      {/* View modal */}
      <Modal open={!!viewPurchase} onClose={() => setViewPurchase(null)} title={`Xarid hujjati: ${viewPurchase?.id.toUpperCase()}`} size="lg">
        {viewPurchase && (
          <div className="space-y-4">
            <div className="grid grid-cols-3 gap-3 text-sm bg-gray-50 p-3 rounded-xl">
              <div><span className="text-gray-500">Sana:</span> <span className="font-medium">{formatDate(viewPurchase.date)}</span></div>
              <div><span className="text-gray-500">Yetkazib beruvchi:</span> <span className="font-medium">{viewPurchase.supplierName}</span></div>
              <div><span className="text-gray-500">Holat:</span> {statusBadge(viewPurchase.status)}</div>
            </div>
            <table className="w-full text-sm border border-gray-200 rounded-lg overflow-hidden">
              <thead className="bg-gray-50">
                <tr>
                  <th className="text-left px-3 py-2 font-semibold text-gray-600">Mahsulot</th>
                  <th className="text-right px-3 py-2 font-semibold text-gray-600">Miqdor</th>
                  <th className="text-right px-3 py-2 font-semibold text-gray-600">Xarid narxi</th>
                  <th className="text-right px-3 py-2 font-semibold text-gray-600">Chegirma</th>
                  <th className="text-right px-3 py-2 font-semibold text-gray-600">Jami</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {viewPurchase.items.map(item => (
                  <tr key={item.productId}>
                    <td className="px-3 py-2 font-medium">{item.productName}</td>
                    <td className="px-3 py-2 text-right">{item.quantity}</td>
                    <td className="px-3 py-2 text-right">{formatCurrency(item.purchasePrice)}</td>
                    <td className="px-3 py-2 text-right">{item.discount}%</td>
                    <td className="px-3 py-2 text-right font-semibold">{formatCurrency(item.total)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
            <div className="bg-gray-50 rounded-xl p-3 text-right space-y-1 text-sm">
              <div className="flex justify-between"><span className="text-gray-500">Oraliq jami</span><span>{formatCurrency(viewPurchase.subtotal)}</span></div>
              {viewPurchase.discount > 0 && <div className="flex justify-between"><span className="text-gray-500">Chegirma</span><span>{viewPurchase.discount}%</span></div>}
              <div className="flex justify-between font-bold text-base"><span>Jami summa</span><span className="text-indigo-600">{formatCurrency(viewPurchase.total)}</span></div>
            </div>
          </div>
        )}
      </Modal>

      {/* Add purchase modal */}
      <Modal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        title="Yangi xarid hujjati"
        size="xl"
        footer={
          <>
            <Button variant="secondary" onClick={() => setModalOpen(false)}>Bekor qilish</Button>
            <Button variant="secondary" onClick={() => handleSave(false)}>Qoralama saqlash</Button>
            <Button variant="primary" onClick={() => handleSave(true)}>Qabul qilish va zaxirani yangilash</Button>
          </>
        }
      >
        <div className="space-y-5">
          <div className="grid grid-cols-2 gap-4">
            <Select
              label="Yetkazib beruvchi"
              value={form.supplierId}
              onChange={e => setForm({ ...form, supplierId: e.target.value })}
              options={suppliers.map(s => ({ value: s.id, label: s.name }))}
              placeholder="Tanlang..."
              error={errors.supplierId}
              required
              fullWidth
            />
            <Input label="Hujjat sanasi" type="date" value={form.date} onChange={e => setForm({ ...form, date: e.target.value })} fullWidth />
          </div>

          <div>
            <div className="flex items-center justify-between mb-3">
              <p className="text-sm font-semibold text-gray-700">Kirim qilinayotgan mahsulotlar</p>
              <Button variant="secondary" size="sm" icon={<Plus size={14} />} onClick={addItem}>Qator qo'shish</Button>
            </div>
            {errors.items && <p className="text-xs text-red-500 mb-2">{errors.items}</p>}
            {items.length === 0 ? (
              <div className="text-center py-8 border-2 border-dashed border-gray-200 rounded-xl text-gray-400 text-sm">
                Mahsulot qo'shish uchun "Qator qo'shish" tugmasini bosing
              </div>
            ) : (
              <div className="space-y-2">
                {items.map((item, i) => (
                  <div key={i} className="flex gap-2 items-end bg-gray-50 rounded-xl p-3">
                    <Select
                      label={i === 0 ? 'Mahsulot' : ''}
                      value={item.productId}
                      onChange={e => updateItem(i, 'productId', e.target.value)}
                      options={products.map(p => ({ value: p.id, label: p.name }))}
                      required
                      fullWidth
                    />
                    <Input label={i === 0 ? 'Miqdor' : ''} type="number" value={item.quantity} onChange={e => updateItem(i, 'quantity', parseFloat(e.target.value) || 0)} className="w-24" />
                    <Input label={i === 0 ? 'Xarid narxi' : ''} type="number" value={item.purchasePrice} onChange={e => updateItem(i, 'purchasePrice', parseFloat(e.target.value) || 0)} className="w-32" />
                    <Input label={i === 0 ? 'Chegirma %' : ''} type="number" value={item.discount} onChange={e => updateItem(i, 'discount', parseFloat(e.target.value) || 0)} className="w-20" />
                    <div className={`text-sm font-semibold text-gray-800 w-32 text-right flex-shrink-0 ${i === 0 ? 'mb-2' : 'mb-2'}`}>
                      {formatCurrency(item.quantity * item.purchasePrice * (1 - item.discount / 100))}
                    </div>
                    <button onClick={() => removeItem(i)} className="text-red-400 hover:text-red-600 p-1.5 mb-1 cursor-pointer">✕</button>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="flex gap-4 items-end">
            <Input label="Umumiy chegirma %" type="number" value={form.discount} onChange={e => setForm({ ...form, discount: parseFloat(e.target.value) || 0 })} className="w-36" />
            <Textarea label="Izoh" value={form.note} onChange={e => setForm({ ...form, note: e.target.value })} rows={2} fullWidth />
            <div className="text-right flex-shrink-0 min-w-36">
              <p className="text-xs text-gray-500">Jami summa:</p>
              <p className="text-2xl font-bold text-indigo-600">{formatCurrency(total)}</p>
            </div>
          </div>
        </div>
      </Modal>

      <ConfirmModal
        open={!!confirmId}
        onClose={() => setConfirmId(null)}
        onConfirm={() => confirmId && handleConfirm(confirmId)}
        title="Xaridni qabul qilish"
        message="Ushbu xarid hujjatini tasdiqlaysizmi? Mahsulotlarning ombor qoldig'i avtomatik ravishda oshiriladi."
        confirmText="Ha, qabul qilish"
        variant="warning"
      />

      <ConfirmModal
        open={!!cancelId}
        onClose={() => setCancelId(null)}
        onConfirm={() => cancelId && handleCancel(cancelId)}
        title="Xarid hujjatini bekor qilish"
        message="Ushbu qoralama xarid hujjatini bekor qilmoqchimisiz?"
        confirmText="Bekor qilish"
        variant="danger"
      />
    </div>
  );
}
