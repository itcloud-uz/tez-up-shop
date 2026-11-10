import { useState } from 'react';
import { Plus, ArrowDownToLine, ArrowUpFromLine, ArrowLeftRight, RotateCcw, ClipboardCheck } from 'lucide-react';
import { Table, Pagination } from '../components/ui/Table';
import { Button, Badge } from '../components/ui/Button';
import { Select, Textarea, Input } from '../components/ui/Input';
import { Modal } from '../components/ui/Modal';
import { Card } from '../components/ui/StatCard';
import { useStore } from '../store/useStore';
import { formatDateTime } from '../utils/format';
import type { StockMovementType } from '../types';

const PAGE_SIZE = 12;

const movementTypes: { value: StockMovementType; label: string; color: 'green' | 'red' | 'blue' | 'amber' | 'purple'; icon: React.ReactNode }[] = [
  { value: 'kirim', label: 'Kirim', color: 'green', icon: <ArrowDownToLine size={16} /> },
  { value: 'chiqim', label: 'Chiqim', color: 'red', icon: <ArrowUpFromLine size={16} /> },
  { value: 'transfer', label: "Filialga ko'chirish", color: 'blue', icon: <ArrowLeftRight size={16} /> },
  { value: 'qaytarish', label: 'Qaytarilgan mahsulot', color: 'amber', icon: <RotateCcw size={16} /> },
  { value: 'inventarizatsiya', label: 'Inventarizatsiya', color: 'purple', icon: <ClipboardCheck size={16} /> },
];

const EMPTY_FORM = {
  type: 'kirim' as StockMovementType,
  productId: '',
  quantity: 1,
  fromBranchId: 'b1',
  toBranchId: 'b1',
  note: '',
};

export function Warehouse() {
  const { stockMovements, products, branches, addStockMovement, showToast } = useStore();
  const [typeFilter, setTypeFilter] = useState<StockMovementType | ''>('');
  const [page, setPage] = useState(1);
  const [modalOpen, setModalOpen] = useState(false);
  const [form, setForm] = useState(EMPTY_FORM);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const filtered = stockMovements.filter(m => !typeFilter || m.type === typeFilter);
  const totalPages = Math.ceil(filtered.length / PAGE_SIZE) || 1;
  const paged = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  const validate = () => {
    const e: Record<string, string> = {};
    if (!form.productId) e.productId = 'Mahsulot tanlanishi shart';
    if (!form.quantity || form.quantity <= 0) e.quantity = "Miqdor musbat son bo'lishi shart";
    if (form.type === 'transfer' && form.fromBranchId === form.toBranchId) {
      e.toBranchId = 'Manba va qabul qiluvchi ombor bir xil bo\'lmasin';
    }
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSave = () => {
    if (!validate()) return;
    const prod = products.find(p => p.id === form.productId);
    if (!prod) return;

    const fromBranch = branches.find(b => b.id === form.fromBranchId);
    const toBranch = branches.find(b => b.id === form.toBranchId);

    addStockMovement({
      type: form.type,
      productId: prod.id,
      productName: prod.name,
      quantity: form.quantity,
      fromBranchId: form.type !== 'kirim' ? fromBranch?.id : undefined,
      fromBranchName: form.type !== 'kirim' ? fromBranch?.name : undefined,
      toBranchId: form.type !== 'chiqim' ? toBranch?.id : undefined,
      toBranchName: form.type !== 'chiqim' ? toBranch?.name : undefined,
      note: form.note || undefined,
    });

    showToast('success', 'Ombor harakati saqlandi va zaxira yangilandi');
    setModalOpen(false);
    setForm(EMPTY_FORM);
  };

  const typeBadge = (type: StockMovementType) => {
    const t = movementTypes.find(x => x.value === type)!;
    return <Badge color={t.color}>{t.label}</Badge>;
  };

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap gap-2 items-center">
        <button
          onClick={() => { setTypeFilter(''); setPage(1); }}
          className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium border transition-colors cursor-pointer ${
            !typeFilter ? 'bg-indigo-600 text-white border-indigo-600' : 'bg-white text-gray-600 border-gray-200 hover:bg-gray-50'
          }`}
        >
          Barchasi ({stockMovements.length})
        </button>
        {movementTypes.map(t => (
          <button
            key={t.value}
            onClick={() => { setTypeFilter(typeFilter === t.value ? '' : t.value); setPage(1); }}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium border transition-colors cursor-pointer ${
              typeFilter === t.value ? 'bg-indigo-600 text-white border-indigo-600' : 'bg-white text-gray-600 border-gray-200 hover:bg-gray-50'
            }`}
          >
            {t.icon}
            {t.label}
          </button>
        ))}
        <div className="ml-auto">
          <Button
            variant="primary"
            icon={<Plus size={15} />}
            onClick={() => {
              setForm({ ...EMPTY_FORM, productId: products[0]?.id || '' });
              setErrors({});
              setModalOpen(true);
            }}
          >
            Yangi harakat
          </Button>
        </div>
      </div>

      <Card padding={false}>
        <Table
          columns={[
            { key: 'type', header: 'Harakat turi', render: (m: typeof paged[0]) => typeBadge(m.type) },
            { key: 'date', header: 'Sana va vaqt', render: (m: typeof paged[0]) => <span className="text-sm text-gray-600">{formatDateTime(m.date)}</span> },
            { key: 'productName', header: 'Mahsulot', render: (m: typeof paged[0]) => <span className="font-medium text-gray-900">{m.productName}</span> },
            {
              key: 'quantity', header: 'Miqdor',
              render: (m: typeof paged[0]) => (
                <span className={`font-bold ${m.quantity > 0 ? 'text-green-600' : 'text-red-500'}`}>
                  {m.quantity > 0 ? '+' : ''}{m.quantity}
                </span>
              )
            },
            {
              key: 'direction', header: 'Manba / Qabul qiluvchi ombor',
              render: (m: typeof paged[0]) => (
                <span className="text-sm text-gray-600">
                  {m.fromBranchName && m.toBranchName
                    ? `${m.fromBranchName} → ${m.toBranchName}`
                    : m.fromBranchName || m.toBranchName || 'Asosiy ombor'}
                </span>
              )
            },
            { key: 'userName', header: "Mas'ul xodim", render: (m: typeof paged[0]) => <span className="text-sm">{m.userName}</span> },
            { key: 'note', header: 'Izoh', render: (m: typeof paged[0]) => <span className="text-sm text-gray-500">{m.note || '—'}</span> },
          ]}
          data={paged}
          keyExtractor={(m) => m.id}
        />
        {filtered.length > PAGE_SIZE && (
          <Pagination page={page} totalPages={totalPages} onPage={setPage} total={filtered.length} pageSize={PAGE_SIZE} />
        )}
      </Card>

      <Modal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        title="Yangi ombor harakati"
        size="md"
        footer={
          <>
            <Button variant="secondary" onClick={() => setModalOpen(false)}>Bekor qilish</Button>
            <Button variant="primary" onClick={handleSave}>Saqlash va zaxirani yangilash</Button>
          </>
        }
      >
        <div className="space-y-4">
          <div>
            <p className="text-sm font-medium text-gray-700 mb-2">Harakat turini tanlang</p>
            <div className="flex flex-wrap gap-2">
              {movementTypes.filter(t => t.value !== 'inventarizatsiya').map(t => (
                <button
                  key={t.value}
                  onClick={() => setForm({ ...form, type: t.value })}
                  className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium border transition-colors cursor-pointer ${
                    form.type === t.value ? 'bg-indigo-600 text-white border-indigo-600' : 'bg-white text-gray-600 border-gray-200 hover:bg-gray-50'
                  }`}
                >
                  {t.icon}
                  {t.label}
                </button>
              ))}
            </div>
          </div>

          <Select
            label="Mahsulot"
            value={form.productId}
            onChange={e => setForm({ ...form, productId: e.target.value })}
            options={products.map(p => ({ value: p.id, label: `${p.name} (Joriy qoldiq: ${p.stock} ${p.unit})` }))}
            placeholder="Tanlang..."
            error={errors.productId}
            required
            fullWidth
          />
          <Input
            label="Miqdor"
            type="number"
            value={form.quantity}
            onChange={e => setForm({ ...form, quantity: parseFloat(e.target.value) || 0 })}
            error={errors.quantity}
            required
            fullWidth
          />
          {(form.type === 'kirim' || form.type === 'qaytarish') && (
            <Select
              label="Qabul qiluvchi ombor / filial"
              value={form.toBranchId}
              onChange={e => setForm({ ...form, toBranchId: e.target.value })}
              options={branches.map(b => ({ value: b.id, label: b.name }))}
              fullWidth
            />
          )}
          {form.type === 'chiqim' && (
            <Select
              label="Chiqim qilinayotgan ombor / filial"
              value={form.fromBranchId}
              onChange={e => setForm({ ...form, fromBranchId: e.target.value })}
              options={branches.map(b => ({ value: b.id, label: b.name }))}
              fullWidth
            />
          )}
          {form.type === 'transfer' && (
            <div className="grid grid-cols-2 gap-3">
              <Select
                label="Qaysi ombordan"
                value={form.fromBranchId}
                onChange={e => setForm({ ...form, fromBranchId: e.target.value })}
                options={branches.map(b => ({ value: b.id, label: b.name }))}
                fullWidth
              />
              <Select
                label="Qaysi omborga"
                value={form.toBranchId}
                onChange={e => setForm({ ...form, toBranchId: e.target.value })}
                options={branches.map(b => ({ value: b.id, label: b.name }))}
                error={errors.toBranchId}
                required
                fullWidth
              />
            </div>
          )}
          <Textarea
            label="Sabab yoki izoh"
            value={form.note}
            onChange={e => setForm({ ...form, note: e.target.value })}
            rows={2}
            fullWidth
            placeholder="Masalan: Yetkazib beruvchidan qo'shimcha partiya..."
          />
        </div>
      </Modal>
    </div>
  );
}
