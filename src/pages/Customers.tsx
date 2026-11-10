import { useState } from 'react';
import { Plus, Edit2, Trash2, Eye, Search } from 'lucide-react';
import { Table, Pagination } from '../components/ui/Table';
import { Button, Badge } from '../components/ui/Button';
import { Input, Textarea } from '../components/ui/Input';
import { Modal, ConfirmModal } from '../components/ui/Modal';
import { Card } from '../components/ui/StatCard';
import { useStore } from '../store/useStore';
import { formatCurrency, formatDate } from '../utils/format';
import type { Customer } from '../types';

const PAGE_SIZE = 10;
const EMPTY_FORM = { name: '', phone: '', email: '', address: '' };

export function Customers() {
  const { customers, sales, addCustomer, updateCustomer, deleteCustomer, showToast } = useStore();
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [modalOpen, setModalOpen] = useState(false);
  const [viewCustomer, setViewCustomer] = useState<Customer | null>(null);
  const [editCustomer, setEditCustomer] = useState<Customer | null>(null);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [form, setForm] = useState(EMPTY_FORM);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const filtered = customers.filter(c => {
    const q = search.toLowerCase();
    return !q || c.name.toLowerCase().includes(q) || c.phone.includes(q);
  });
  const totalPages = Math.ceil(filtered.length / PAGE_SIZE) || 1;
  const paged = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  const openAdd = () => { setForm(EMPTY_FORM); setErrors({}); setEditCustomer(null); setModalOpen(true); };
  const openEdit = (c: Customer) => {
    setEditCustomer(c);
    setForm({ name: c.name, phone: c.phone, email: c.email || '', address: c.address || '' });
    setErrors({});
    setModalOpen(true);
  };

  const validate = () => {
    const e: Record<string, string> = {};
    if (!form.name.trim()) e.name = 'Ism kiritilishi shart';
    if (!form.phone.trim()) e.phone = 'Telefon kiritilishi shart';
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSave = () => {
    if (!validate()) return;
    if (editCustomer) {
      updateCustomer(editCustomer.id, form);
      showToast('success', `${form.name} ma'lumotlari yangilandi`);
    } else {
      addCustomer(form);
      showToast('success', `${form.name} mijozlar ro'yxatiga qo'shildi`);
    }
    setModalOpen(false);
  };

  const customerSales = (customerId: string) => sales.filter(s => s.customerId === customerId && s.status === 'yakunlangan');

  return (
    <div className="space-y-5">
      <div className="flex gap-3 items-center">
        <div className="relative flex-1 max-w-80">
          <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            placeholder="Mijoz ismi yoki telefon raqami..."
            value={search}
            onChange={e => { setSearch(e.target.value); setPage(1); }}
            className="w-full pl-9 pr-3 h-10 bg-white border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/30"
          />
        </div>
        <div className="ml-auto">
          <Button variant="primary" icon={<Plus size={15} />} onClick={openAdd}>Yangi mijoz</Button>
        </div>
      </div>

      <Card padding={false}>
        <Table
          columns={[
            {
              key: 'name', header: 'Mijoz',
              render: (c: Customer) => (
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 bg-purple-100 rounded-full flex items-center justify-center text-purple-600 font-semibold text-sm flex-shrink-0">
                    {c.name.charAt(0)}
                  </div>
                  <span className="font-medium text-gray-900">{c.name}</span>
                </div>
              )
            },
            { key: 'phone', header: 'Telefon raqami', render: (c: Customer) => <span className="font-mono text-sm">{c.phone}</span> },
            { key: 'totalPurchases', header: 'Xaridlar soni', render: (c: Customer) => <Badge color="blue">{c.totalPurchases} marta</Badge> },
            { key: 'totalAmount', header: 'Umumiy xarid summasi', render: (c: Customer) => <span className="font-semibold text-indigo-600">{formatCurrency(c.totalAmount)}</span> },
            { key: 'lastPurchase', header: 'Oxirgi xarid', render: (c: Customer) => <span className="text-gray-500 text-sm">{c.lastPurchase ? formatDate(c.lastPurchase) : '—'}</span> },
            {
              key: 'actions', header: 'Amallar',
              render: (c: Customer) => (
                <div className="flex gap-1">
                  <Button variant="ghost" size="xs" icon={<Eye size={14} />} onClick={() => setViewCustomer(c)} />
                  <Button variant="ghost" size="xs" icon={<Edit2 size={14} />} onClick={() => openEdit(c)} />
                  <Button variant="ghost" size="xs" icon={<Trash2 size={14} />} className="text-red-500 hover:bg-red-50" onClick={() => setDeleteId(c.id)} />
                </div>
              )
            },
          ]}
          data={paged}
          keyExtractor={(c: Customer) => c.id}
        />
        {filtered.length > PAGE_SIZE && (
          <Pagination page={page} totalPages={totalPages} onPage={setPage} total={filtered.length} pageSize={PAGE_SIZE} />
        )}
      </Card>

      <Modal open={!!viewCustomer} onClose={() => setViewCustomer(null)} title={viewCustomer?.name || ''} size="md">
        {viewCustomer && (
          <div className="space-y-4">
            <div className="flex items-center gap-4 p-4 bg-purple-50 rounded-xl">
              <div className="w-14 h-14 bg-purple-200 rounded-xl flex items-center justify-center text-2xl font-bold text-purple-700">
                {viewCustomer.name.charAt(0)}
              </div>
              <div>
                <p className="font-bold text-gray-900">{viewCustomer.name}</p>
                <p className="text-sm text-gray-500">{viewCustomer.phone}</p>
                {viewCustomer.email && <p className="text-sm text-gray-400">{viewCustomer.email}</p>}
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="bg-blue-50 rounded-xl p-3 text-center">
                <p className="text-xs text-blue-600">Xaridlar soni</p>
                <p className="text-xl font-bold text-blue-700">{viewCustomer.totalPurchases} ta</p>
              </div>
              <div className="bg-green-50 rounded-xl p-3 text-center">
                <p className="text-xs text-green-600">Umumiy xarid summasi</p>
                <p className="text-xl font-bold text-green-700">{formatCurrency(viewCustomer.totalAmount)}</p>
              </div>
            </div>
            <div>
              <p className="text-sm font-semibold text-gray-700 mb-2">Xaridlar tarixi</p>
              <div className="space-y-2 max-h-56 overflow-y-auto">
                {customerSales(viewCustomer.id).map(sale => (
                  <div key={sale.id} className="flex justify-between items-center py-2 px-3 bg-gray-50 rounded-lg text-sm">
                    <div>
                      <p className="font-mono font-semibold text-xs">{sale.receiptNumber}</p>
                      <p className="text-xs text-gray-400">{formatDate(sale.date)} · {sale.items.length} xil mahsulot</p>
                    </div>
                    <span className="font-semibold text-gray-900">{formatCurrency(sale.total)}</span>
                  </div>
                ))}
                {customerSales(viewCustomer.id).length === 0 && (
                  <p className="text-sm text-gray-400 text-center py-4">Xaridlar tarixi topilmadi</p>
                )}
              </div>
            </div>
          </div>
        )}
      </Modal>

      <Modal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        title={editCustomer ? 'Mijozni tahrirlash' : 'Yangi mijoz'}
        size="sm"
        footer={
          <>
            <Button variant="secondary" onClick={() => setModalOpen(false)}>Bekor qilish</Button>
            <Button variant="primary" onClick={handleSave}>Saqlash</Button>
          </>
        }
      >
        <div className="space-y-4">
          <Input label="Ism va familiya" value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} error={errors.name} required fullWidth />
          <Input label="Telefon raqami" value={form.phone} onChange={e => setForm({ ...form, phone: e.target.value })} error={errors.phone} required fullWidth placeholder="+998 90 123 45 67" />
          <Input label="Email (ixtiyoriy)" type="email" value={form.email} onChange={e => setForm({ ...form, email: e.target.value })} fullWidth />
          <Textarea label="Manzil" value={form.address} onChange={e => setForm({ ...form, address: e.target.value })} rows={2} fullWidth />
        </div>
      </Modal>

      <ConfirmModal
        open={!!deleteId}
        onClose={() => setDeleteId(null)}
        onConfirm={() => {
          if (deleteId) deleteCustomer(deleteId);
          showToast('success', "Mijoz o'chirildi");
          setDeleteId(null);
        }}
        title="Mijozni o'chirish"
        message="Bu mijozni o'chirmoqchimisiz? Xaridlar tarixi saqlanib qoladi."
        confirmText="O'chirish"
        variant="danger"
      />
    </div>
  );
}
