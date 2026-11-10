import { useState } from 'react';
import { Plus, Edit2, Trash2 } from 'lucide-react';
import { Table } from '../components/ui/Table';
import { Button, Badge } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { Modal, ConfirmModal } from '../components/ui/Modal';
import { Card } from '../components/ui/StatCard';
import { useStore } from '../store/useStore';
import type { Category } from '../types';

const COLORS = [
  '#16a34a', '#2563eb', '#7c3aed', '#d97706', '#dc2626',
  '#059669', '#ea580c', '#0891b2', '#6366f1', '#db2777',
];

export function Categories() {
  const { categories, products, addCategory, updateCategory, deleteCategory, showToast } = useStore();
  const [modalOpen, setModalOpen] = useState(false);
  const [editCat, setEditCat] = useState<Category | null>(null);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [form, setForm] = useState({ name: '', color: '#2563eb' });
  const [error, setError] = useState('');

  const openAdd = () => { setForm({ name: '', color: '#2563eb' }); setError(''); setEditCat(null); setModalOpen(true); };
  const openEdit = (c: Category) => { setEditCat(c); setForm({ name: c.name, color: c.color }); setError(''); setModalOpen(true); };

  const handleSave = () => {
    if (!form.name.trim()) return setError('Kategoriya nomi kiritilishi shart');
    if (editCat) {
      updateCategory(editCat.id, { name: form.name.trim(), color: form.color });
      showToast('success', `${form.name} tahrirlandi`);
    } else {
      addCategory({ name: form.name.trim(), color: form.color });
      showToast('success', `${form.name} qo'shildi`);
    }
    setModalOpen(false);
  };

  const handleDelete = () => {
    if (deleteId) {
      deleteCategory(deleteId);
      showToast('success', "Kategoriya o'chirildi");
      setDeleteId(null);
    }
  };

  return (
    <div className="space-y-5">
      <div className="flex justify-end">
        <Button variant="primary" icon={<Plus size={15} />} onClick={openAdd}>Yangi kategoriya</Button>
      </div>

      <Card padding={false}>
        <Table
          columns={[
            {
              key: 'color', header: 'Rang', headerClassName: 'w-16',
              render: (c: Category) => (
                <div className="w-8 h-8 rounded-lg flex-shrink-0 shadow-xs" style={{ backgroundColor: c.color }} />
              )
            },
            { key: 'name', header: 'Kategoriya nomi', render: (c: Category) => <span className="font-semibold text-gray-900">{c.name}</span> },
            {
              key: 'productCount', header: 'Mahsulotlar soni',
              render: (c: Category) => {
                const count = products.filter(p => p.categoryId === c.id).length;
                return <Badge color="blue">{count} ta mahsulot</Badge>;
              }
            },
            {
              key: 'actions', header: 'Amallar',
              render: (c: Category) => (
                <div className="flex gap-1">
                  <Button variant="ghost" size="xs" icon={<Edit2 size={14} />} onClick={() => openEdit(c)} />
                  <Button variant="ghost" size="xs" icon={<Trash2 size={14} />} className="text-red-500 hover:bg-red-50" onClick={() => setDeleteId(c.id)} />
                </div>
              )
            },
          ]}
          data={categories}
          keyExtractor={(c: Category) => c.id}
        />
      </Card>

      <Modal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        title={editCat ? 'Kategoriyani tahrirlash' : 'Yangi kategoriya'}
        size="sm"
        footer={
          <>
            <Button variant="secondary" onClick={() => setModalOpen(false)}>Bekor qilish</Button>
            <Button variant="primary" onClick={handleSave}>Saqlash</Button>
          </>
        }
      >
        <div className="space-y-4">
          <Input
            label="Kategoriya nomi"
            value={form.name}
            onChange={e => setForm({ ...form, name: e.target.value })}
            error={error}
            required
            fullWidth
          />
          <div>
            <label className="text-sm font-medium text-gray-700 block mb-2">Rang belgisi</label>
            <div className="flex flex-wrap gap-2">
              {COLORS.map(color => (
                <button
                  key={color}
                  onClick={() => setForm({ ...form, color })}
                  className={`w-8 h-8 rounded-full transition-transform hover:scale-110 cursor-pointer ${form.color === color ? 'ring-2 ring-offset-2 ring-gray-400 scale-110' : ''}`}
                  style={{ backgroundColor: color }}
                />
              ))}
            </div>
          </div>
        </div>
      </Modal>

      <ConfirmModal
        open={!!deleteId}
        onClose={() => setDeleteId(null)}
        onConfirm={handleDelete}
        title="Kategoriyani o'chirish"
        message="Bu kategoriyani o'chirmoqchimisiz? Kategoriyaga biriktirilgan mahsulotlar saqlanib qoladi."
        confirmText="O'chirish"
        variant="danger"
      />
    </div>
  );
}
