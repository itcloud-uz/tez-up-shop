import { useState } from 'react';
import { Plus, Edit2, Trash2 } from 'lucide-react';
import { Table } from '../components/ui/Table';
import { Button, Badge } from '../components/ui/Button';
import { Input, Select } from '../components/ui/Input';
import { Modal, ConfirmModal } from '../components/ui/Modal';
import { Card } from '../components/ui/StatCard';
import { useStore, roleLabels } from '../store/useStore';
import { formatCurrency, formatDate } from '../utils/format';
import type { Employee, UserRole } from '../types';

const EMPTY_FORM = {
  name: '',
  phone: '',
  email: '',
  role: 'kassir' as UserRole,
  branchId: 'b1',
  salary: 3000000,
  startDate: new Date().toISOString().split('T')[0],
  status: 'faol' as 'faol' | 'nofaol',
};

export function Employees() {
  const { employees, branches, addEmployee, updateEmployee, deleteEmployee, showToast } = useStore();
  const [modalOpen, setModalOpen] = useState(false);
  const [editEmp, setEditEmp] = useState<Employee | null>(null);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [form, setForm] = useState(EMPTY_FORM);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const openAdd = () => {
    setForm({ ...EMPTY_FORM, branchId: branches[0]?.id || 'b1' });
    setErrors({});
    setEditEmp(null);
    setModalOpen(true);
  };

  const openEdit = (e: Employee) => {
    setEditEmp(e);
    setForm({
      name: e.name,
      phone: e.phone,
      email: e.email,
      role: e.role,
      branchId: e.branchId,
      salary: e.salary,
      startDate: e.startDate,
      status: e.status,
    });
    setErrors({});
    setModalOpen(true);
  };

  const validate = () => {
    const e: Record<string, string> = {};
    if (!form.name.trim()) e.name = 'Ism kiritilishi shart';
    if (!form.phone.trim()) e.phone = 'Telefon kiritilishi shart';
    if (!form.branchId) e.branchId = 'Filial tanlanishi shart';
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSave = () => {
    if (!validate()) return;
    const branchName = branches.find(b => b.id === form.branchId)?.name || '';
    if (editEmp) {
      updateEmployee(editEmp.id, { ...form, branchName });
      showToast('success', `${form.name} ma'lumotlari yangilandi`);
    } else {
      addEmployee({ ...form, branchName });
      showToast('success', `${form.name} xodimlarga qo'shildi`);
    }
    setModalOpen(false);
  };

  const roleColor: Record<UserRole, 'blue' | 'purple' | 'green' | 'amber'> = {
    admin: 'purple', menejer: 'blue', kassir: 'green', omborchi: 'amber',
  };

  return (
    <div className="space-y-5">
      <div className="flex justify-end">
        <Button variant="primary" icon={<Plus size={15} />} onClick={openAdd}>Yangi xodim</Button>
      </div>

      <Card padding={false}>
        <Table
          columns={[
            {
              key: 'name', header: 'Xodim',
              render: (e: Employee) => (
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 bg-indigo-100 rounded-full flex items-center justify-center text-indigo-600 font-semibold text-sm flex-shrink-0">
                    {e.name.charAt(0)}
                  </div>
                  <div>
                    <p className="font-medium text-gray-900">{e.name}</p>
                    <p className="text-xs text-gray-400">{e.email}</p>
                  </div>
                </div>
              )
            },
            { key: 'phone', header: 'Telefon', render: (e: Employee) => <span className="font-mono text-sm">{e.phone}</span> },
            { key: 'role', header: 'Rol va ruxsat', render: (e: Employee) => <Badge color={roleColor[e.role]}>{roleLabels[e.role]}</Badge> },
            { key: 'branchName', header: 'Biriktirilgan filial' },
            { key: 'salary', header: 'Oylik maosh', render: (e: Employee) => <span className="font-medium">{formatCurrency(e.salary)}</span> },
            { key: 'startDate', header: 'Ishga kirgan sana', render: (e: Employee) => formatDate(e.startDate) },
            { key: 'status', header: 'Holat', render: (e: Employee) => <Badge color={e.status === 'faol' ? 'green' : 'red'} dot>{e.status === 'faol' ? 'Faol' : 'Nofaol'}</Badge> },
            {
              key: 'actions', header: 'Amallar',
              render: (e: Employee) => (
                <div className="flex gap-1">
                  <Button variant="ghost" size="xs" icon={<Edit2 size={14} />} onClick={() => openEdit(e)} />
                  <Button variant="ghost" size="xs" icon={<Trash2 size={14} />} className="text-red-500 hover:bg-red-50" onClick={() => setDeleteId(e.id)} />
                </div>
              )
            },
          ]}
          data={employees}
          keyExtractor={(e: Employee) => e.id}
        />
      </Card>

      <Modal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        title={editEmp ? 'Xodimni tahrirlash' : 'Yangi xodim qo\'shish'}
        size="md"
        footer={
          <>
            <Button variant="secondary" onClick={() => setModalOpen(false)}>Bekor qilish</Button>
            <Button variant="primary" onClick={handleSave}>Saqlash</Button>
          </>
        }
      >
        <div className="grid grid-cols-2 gap-4">
          <Input label="Ism va familiya" value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} error={errors.name} required fullWidth />
          <Input label="Telefon" value={form.phone} onChange={e => setForm({ ...form, phone: e.target.value })} error={errors.phone} required fullWidth />
          <Input label="Email" type="email" value={form.email} onChange={e => setForm({ ...form, email: e.target.value })} fullWidth />
          <Select
            label="Foydalanuvchi roli"
            value={form.role}
            onChange={e => setForm({ ...form, role: e.target.value as UserRole })}
            options={Object.entries(roleLabels).map(([k, v]) => ({ value: k, label: v }))}
            fullWidth
          />
          <Select
            label="Filial"
            value={form.branchId}
            onChange={e => setForm({ ...form, branchId: e.target.value })}
            options={branches.map(b => ({ value: b.id, label: b.name }))}
            error={errors.branchId}
            required
            fullWidth
          />
          <Input label="Oylik maosh (so'm)" type="number" value={form.salary} onChange={e => setForm({ ...form, salary: parseFloat(e.target.value) || 0 })} fullWidth />
          <Input label="Ishga kirgan sana" type="date" value={form.startDate} onChange={e => setForm({ ...form, startDate: e.target.value })} fullWidth />
          <Select
            label="Holat"
            value={form.status}
            onChange={e => setForm({ ...form, status: e.target.value as 'faol' | 'nofaol' })}
            options={[{ value: 'faol', label: 'Faol' }, { value: 'nofaol', label: 'Nofaol' }]}
            fullWidth
          />
        </div>
      </Modal>

      <ConfirmModal
        open={!!deleteId}
        onClose={() => setDeleteId(null)}
        onConfirm={() => {
          if (deleteId) deleteEmployee(deleteId);
          showToast('success', "Xodim ro'yxatdan o'chirildi");
          setDeleteId(null);
        }}
        title="Xodimni o'chirish"
        message="Bu xodimni o'chirmoqchimisiz?"
        confirmText="O'chirish"
        variant="danger"
      />
    </div>
  );
}
