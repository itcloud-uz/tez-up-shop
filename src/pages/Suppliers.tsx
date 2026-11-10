import { useState } from 'react';
import { Plus, Edit2, Trash2, Eye, Mail, MapPin, Phone, Search } from 'lucide-react';
import { Table, Pagination } from '../components/ui/Table';
import { Button, Badge } from '../components/ui/Button';
import { Input, Textarea } from '../components/ui/Input';
import { Modal, ConfirmModal } from '../components/ui/Modal';
import { Card } from '../components/ui/StatCard';
import { useStore } from '../store/useStore';
import { formatCurrency, formatDate } from '../utils/format';
import type { Supplier } from '../types';

const PAGE_SIZE = 10;
const EMPTY_FORM = { name: '', phone: '', email: '', address: '' };

export function Suppliers() {
  const { suppliers, addSupplier, updateSupplier, deleteSupplier, showToast } = useStore();
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [modalOpen, setModalOpen] = useState(false);
  const [viewSupplier, setViewSupplier] = useState<Supplier | null>(null);
  const [editSupplier, setEditSupplier] = useState<Supplier | null>(null);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [form, setForm] = useState(EMPTY_FORM);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const filtered = suppliers.filter(s => {
    const q = search.toLowerCase();
    return !q || s.name.toLowerCase().includes(q) || s.phone.includes(q);
  });
  const totalPages = Math.ceil(filtered.length / PAGE_SIZE) || 1;
  const paged = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  const openAdd = () => { setForm(EMPTY_FORM); setErrors({}); setEditSupplier(null); setModalOpen(true); };
  const openEdit = (s: Supplier) => {
    setEditSupplier(s);
    setForm({ name: s.name, phone: s.phone, email: s.email, address: s.address });
    setErrors({});
    setModalOpen(true);
  };

  const validate = () => {
    const e: Record<string, string> = {};
    if (!form.name.trim()) e.name = 'Nomi kiritilishi shart';
    if (!form.phone.trim()) e.phone = 'Telefon kiritilishi shart';
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSave = () => {
    if (!validate()) return;
    if (editSupplier) {
      updateSupplier(editSupplier.id, form);
      showToast('success', `${form.name} ma'lumotlari yangilandi`);
    } else {
      addSupplier(form);
      showToast('success', `${form.name} yetkazib beruvchilarga qo'shildi`);
    }
    setModalOpen(false);
  };

  return (
    <div className="space-y-5">
      <div className="flex gap-3 items-center">
        <div className="relative flex-1 max-w-80">
          <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            placeholder="Yetkazib beruvchi qidirish..."
            value={search}
            onChange={e => { setSearch(e.target.value); setPage(1); }}
            className="w-full pl-9 pr-3 h-10 bg-white border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/30"
          />
        </div>
        <div className="ml-auto">
          <Button variant="primary" icon={<Plus size={15} />} onClick={openAdd}>Yangi yetkazib beruvchi</Button>
        </div>
      </div>

      <Card padding={false}>
        <Table
          columns={[
            { key: 'name', header: 'Korxona nomi', render: (s: Supplier) => <span className="font-semibold text-gray-900">{s.name}</span> },
            { key: 'phone', header: 'Telefon', render: (s: Supplier) => <span className="font-mono text-sm">{s.phone}</span> },
            { key: 'email', header: 'Email', render: (s: Supplier) => <span className="text-gray-600">{s.email || '—'}</span> },
            { key: 'totalPurchases', header: 'Jami xaridlar', render: (s: Supplier) => <span className="font-medium">{formatCurrency(s.totalPurchases)}</span> },
            {
              key: 'balance', header: 'Hisob-kitob holati',
              render: (s: Supplier) => s.balance > 0
                ? <Badge color="red">Qarz: {formatCurrency(s.balance)}</Badge>
                : <Badge color="green">Qarzdorlik yo'q</Badge>
            },
            { key: 'createdAt', header: "Qo'shilgan sana", render: (s: Supplier) => formatDate(s.createdAt) },
            {
              key: 'actions', header: 'Amallar',
              render: (s: Supplier) => (
                <div className="flex gap-1">
                  <Button variant="ghost" size="xs" icon={<Eye size={14} />} onClick={() => setViewSupplier(s)} />
                  <Button variant="ghost" size="xs" icon={<Edit2 size={14} />} onClick={() => openEdit(s)} />
                  <Button variant="ghost" size="xs" icon={<Trash2 size={14} />} className="text-red-500 hover:bg-red-50" onClick={() => setDeleteId(s.id)} />
                </div>
              )
            },
          ]}
          data={paged}
          keyExtractor={(s: Supplier) => s.id}
        />
        {filtered.length > PAGE_SIZE && (
          <Pagination page={page} totalPages={totalPages} onPage={setPage} total={filtered.length} pageSize={PAGE_SIZE} />
        )}
      </Card>

      <Modal open={!!viewSupplier} onClose={() => setViewSupplier(null)} title={viewSupplier?.name || ''} size="sm">
        {viewSupplier && (
          <div className="space-y-4">
            <div className="flex items-center gap-3 p-4 bg-gray-50 rounded-xl">
              <div className="w-14 h-14 bg-indigo-100 rounded-xl flex items-center justify-center text-2xl font-bold text-indigo-600">
                {viewSupplier.name.charAt(0)}
              </div>
              <div>
                <p className="font-bold text-gray-900">{viewSupplier.name}</p>
                <p className="text-sm text-gray-500">Hamkorlik: {formatDate(viewSupplier.createdAt)}</p>
              </div>
            </div>
            <div className="space-y-3 text-sm">
              <div className="flex items-center gap-3"><Phone size={16} className="text-gray-400" /><span>{viewSupplier.phone}</span></div>
              {viewSupplier.email && <div className="flex items-center gap-3"><Mail size={16} className="text-gray-400" /><span>{viewSupplier.email}</span></div>}
              {viewSupplier.address && <div className="flex items-center gap-3"><MapPin size={16} className="text-gray-400" /><span>{viewSupplier.address}</span></div>}
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="bg-indigo-50 rounded-xl p-3 text-center">
                <p className="text-xs text-indigo-600">Jami xaridlar</p>
                <p className="font-bold text-indigo-700">{formatCurrency(viewSupplier.totalPurchases)}</p>
              </div>
              <div className={`rounded-xl p-3 text-center ${viewSupplier.balance > 0 ? 'bg-red-50' : 'bg-green-50'}`}>
                <p className={`text-xs ${viewSupplier.balance > 0 ? 'text-red-600' : 'text-green-600'}`}>Qarz holati</p>
                <p className={`font-bold ${viewSupplier.balance > 0 ? 'text-red-700' : 'text-green-700'}`}>
                  {viewSupplier.balance > 0 ? formatCurrency(viewSupplier.balance) : 'Toza'}
                </p>
              </div>
            </div>
          </div>
        )}
      </Modal>

      <Modal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        title={editSupplier ? 'Yetkazib beruvchini tahrirlash' : 'Yangi yetkazib beruvchi'}
        size="sm"
        footer={
          <>
            <Button variant="secondary" onClick={() => setModalOpen(false)}>Bekor qilish</Button>
            <Button variant="primary" onClick={handleSave}>Saqlash</Button>
          </>
        }
      >
        <div className="space-y-4">
          <Input label="Korxona / Yetkazib beruvchi nomi" value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} error={errors.name} required fullWidth />
          <Input label="Telefon raqami" value={form.phone} onChange={e => setForm({ ...form, phone: e.target.value })} error={errors.phone} required fullWidth placeholder="+998 71 234 56 78" />
          <Input label="Email manzili" type="email" value={form.email} onChange={e => setForm({ ...form, email: e.target.value })} fullWidth />
          <Textarea label="Manzil" value={form.address} onChange={e => setForm({ ...form, address: e.target.value })} rows={2} fullWidth />
        </div>
      </Modal>

      <ConfirmModal
        open={!!deleteId}
        onClose={() => setDeleteId(null)}
        onConfirm={() => {
          if (deleteId) deleteSupplier(deleteId);
          showToast('success', "Yetkazib beruvchi o'chirildi");
          setDeleteId(null);
        }}
        title="Yetkazib beruvchini o'chirish"
        message="Bu yetkazib beruvchini ro'yxatdan o'chirmoqchimisiz?"
        confirmText="O'chirish"
        variant="danger"
      />
    </div>
  );
}
