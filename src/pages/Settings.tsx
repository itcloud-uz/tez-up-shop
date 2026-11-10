import { useState } from 'react';
import { Save, Store, Bell, Shield, Database, Printer, Plus, RotateCcw } from 'lucide-react';
import { Button } from '../components/ui/Button';
import { Input, Select, Textarea } from '../components/ui/Input';
import { Modal } from '../components/ui/Modal';
import { Card } from '../components/ui/StatCard';
import { useStore } from '../store/useStore';

export function Settings() {
  const { branches, addBranch, toggleBranchActive, resetDemoData, showToast } = useStore();
  const [activeTab, setActiveTab] = useState('company');
  const [branchModalOpen, setBranchModalOpen] = useState(false);
  const [newBranch, setNewBranch] = useState({ name: '', address: '', phone: '+998 71 ' });

  const [form, setForm] = useState({
    companyName: 'OOO "TEMIRCHI" Metallobaza',
    phone: '+998 71 200 45 67',
    address: 'Toshkent sh., Chilonzor tumani, Promzona, Temir bozori 1-sektor',
    currency: 'UZS',
    language: 'uz',
    receiptHeader: 'OOO "TEMIRCHI" METALLOBAZA\nArmatura, Profil, Ugolok, Shveller, Truba, List va Setka savdosi',
    receiptFooter: 'Kesish va yetkazib berish xizmati: +998 71 200 45 67\nXaridingiz uchun rahmat!',
    lowStockAlert: true,
    emailNotifications: false,
    receiptPrint: true,
  });

  const tabs = [
    { id: 'company', label: 'Kompaniya', icon: <Store size={16} /> },
    { id: 'branches', label: 'Filiallar va kassalar', icon: <Database size={16} /> },
    { id: 'receipt', label: 'Chek shabloni', icon: <Printer size={16} /> },
    { id: 'notifications', label: 'Bildirishnomalar', icon: <Bell size={16} /> },
    { id: 'security', label: 'Xavfsizlik va tizim', icon: <Shield size={16} /> },
  ];

  const handleSave = () => {
    showToast('success', 'Sozlamalar muvaffaqiyatli saqlandi');
  };

  const handleAddBranch = () => {
    if (!newBranch.name.trim()) return showToast('error', 'Filial nomini kiriting');
    addBranch({
      name: newBranch.name.trim(),
      address: newBranch.address.trim() || 'Toshkent',
      phone: newBranch.phone.trim(),
      active: true,
    });
    setNewBranch({ name: '', address: '', phone: '+998 71 ' });
    setBranchModalOpen(false);
    showToast('success', 'Yangi filial qo\'shildi');
  };

  return (
    <div className="flex flex-col md:flex-row gap-6 max-w-5xl">
      {/* Tabs sidebar */}
      <div className="w-full md:w-52 flex-shrink-0">
        <div className="bg-white rounded-xl border border-gray-200 p-2 space-y-1">
          {tabs.map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`w-full flex items-center gap-2.5 px-3 py-2.5 text-sm font-medium rounded-lg transition-colors text-left cursor-pointer ${
                activeTab === tab.id
                  ? 'bg-indigo-50 text-indigo-700'
                  : 'text-gray-600 hover:bg-gray-50'
              }`}
            >
              {tab.icon}
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 space-y-5">
        {activeTab === 'company' && (
          <Card title="Kompaniya umumiy ma'lumotlari">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Input label="Do'kon / Tarmoq nomi" value={form.companyName} onChange={e => setForm({ ...form, companyName: e.target.value })} fullWidth />
              <Input label="Asosiy telefon raqami" value={form.phone} onChange={e => setForm({ ...form, phone: e.target.value })} fullWidth />
              <div className="sm:col-span-2">
                <Textarea label="Yuridik manzil" value={form.address} onChange={e => setForm({ ...form, address: e.target.value })} rows={2} fullWidth />
              </div>
              <Select
                label="Asosiy valyuta"
                value={form.currency}
                onChange={e => setForm({ ...form, currency: e.target.value })}
                options={[{ value: 'UZS', label: "O'zbek so'mi (UZS)" }, { value: 'USD', label: 'AQSH Dollari (USD)' }]}
                fullWidth
              />
              <Select
                label="Interfeys tili"
                value={form.language}
                onChange={e => setForm({ ...form, language: e.target.value })}
                options={[{ value: 'uz', label: "O'zbek lotin" }, { value: 'ru', label: 'Русский' }]}
                fullWidth
              />
            </div>
            <div className="mt-5">
              <Button variant="primary" icon={<Save size={16} />} onClick={handleSave}>O'zgarishlarni saqlash</Button>
            </div>
          </Card>
        )}

        {activeTab === 'branches' && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="font-semibold text-gray-900">Filiallar ro'yxati ({branches.length})</h3>
              <Button variant="primary" size="sm" icon={<Plus size={15} />} onClick={() => setBranchModalOpen(true)}>
                Yangi filial qo'shish
              </Button>
            </div>
            {branches.map(b => (
              <Card key={b.id}>
                <div className="flex items-center justify-between flex-wrap gap-3">
                  <div>
                    <p className="font-semibold text-gray-900">{b.name}</p>
                    <p className="text-sm text-gray-500">{b.address}</p>
                    <p className="text-xs text-gray-400 font-mono mt-0.5">{b.phone}</p>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className={`px-2.5 py-1 rounded-full text-xs font-medium ${b.active ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500'}`}>
                      {b.active ? 'Faol' : 'Vaqtincha yopiq'}
                    </span>
                    <Button
                      variant="secondary"
                      size="sm"
                      onClick={() => {
                        toggleBranchActive(b.id);
                        showToast('info', `${b.name} holati o'zgartirildi`);
                      }}
                    >
                      {b.active ? "Faolsizlantirish" : "Faollashtirish"}
                    </Button>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        )}

        {activeTab === 'receipt' && (
          <Card title="Kassa cheki sozlamalari">
            <div className="space-y-4">
              <Textarea label="Chek yuqori matni (Header)" value={form.receiptHeader} onChange={e => setForm({ ...form, receiptHeader: e.target.value })} rows={3} fullWidth />
              <Textarea label="Chek pastki matni (Footer)" value={form.receiptFooter} onChange={e => setForm({ ...form, receiptFooter: e.target.value })} rows={2} fullWidth />
              <div className="flex items-center gap-3">
                <input
                  type="checkbox"
                  id="receiptPrint"
                  checked={form.receiptPrint}
                  onChange={e => setForm({ ...form, receiptPrint: e.target.checked })}
                  className="w-4 h-4 rounded border-gray-300 text-indigo-600"
                />
                <label htmlFor="receiptPrint" className="text-sm font-medium text-gray-700">
                  To'lov yakunlangach chek oynasini avtomatik ko'rsatish
                </label>
              </div>
              <Button variant="primary" icon={<Save size={16} />} onClick={handleSave}>Saqlash</Button>
            </div>
          </Card>
        )}

        {activeTab === 'notifications' && (
          <Card title="Tizim bildirishnomalari">
            <div className="space-y-4">
              <div className="flex items-center justify-between p-4 bg-gray-50 rounded-xl">
                <div>
                  <p className="font-medium text-gray-900 text-sm">Kam qolgan mahsulot ogohlantirishi</p>
                  <p className="text-xs text-gray-500">Mahsulot minimal qoldiqqacha tushganda yuqori panelda xabar chiqadi</p>
                </div>
                <button
                  onClick={() => setForm({ ...form, lowStockAlert: !form.lowStockAlert })}
                  className={`w-12 h-6 rounded-full transition-colors relative cursor-pointer ${form.lowStockAlert ? 'bg-indigo-600' : 'bg-gray-300'}`}
                >
                  <span className={`absolute top-1 w-4 h-4 bg-white rounded-full shadow transition-transform ${form.lowStockAlert ? 'left-7' : 'left-1'}`} />
                </button>
              </div>
              <div className="flex items-center justify-between p-4 bg-gray-50 rounded-xl">
                <div>
                  <p className="font-medium text-gray-900 text-sm">Kunlik moliyaviy xulosa</p>
                  <p className="text-xs text-gray-500">Smena yopilganda rahbarga hisobot yuborish</p>
                </div>
                <button
                  onClick={() => setForm({ ...form, emailNotifications: !form.emailNotifications })}
                  className={`w-12 h-6 rounded-full transition-colors relative cursor-pointer ${form.emailNotifications ? 'bg-indigo-600' : 'bg-gray-300'}`}
                >
                  <span className={`absolute top-1 w-4 h-4 bg-white rounded-full shadow transition-transform ${form.emailNotifications ? 'left-7' : 'left-1'}`} />
                </button>
              </div>
              <Button variant="primary" icon={<Save size={16} />} onClick={handleSave}>Saqlash</Button>
            </div>
          </Card>
        )}

        {activeTab === 'security' && (
          <div className="space-y-5">
            <Card title="Parolni yangilash">
              <div className="space-y-4">
                <Input label="Joriy parol" type="password" placeholder="••••••••" fullWidth />
                <Input label="Yangi parol" type="password" placeholder="••••••••" fullWidth />
                <Input label="Yangi parolni tasdiqlang" type="password" placeholder="••••••••" fullWidth />
                <Button variant="primary" onClick={() => showToast('success', 'Parol muvaffaqiyatli yangilandi')}>Parolni yangilash</Button>
              </div>
            </Card>
            <Card title="Demo ma'lumotlarni boshqarish">
              <p className="text-sm text-gray-600 mb-3">
                Barcha kiritilgan o'zgarishlarni tozalab, dastlabki demo ma'lumotlarni tiklash:
              </p>
              <Button
                variant="warning"
                icon={<RotateCcw size={15} />}
                onClick={() => {
                  resetDemoData();
                  showToast('success', "Demo ma'lumotlar boshlang'ich holatga tiklandi");
                }}
              >
                Demo ma'lumotlarni tiklash
              </Button>
            </Card>
          </div>
        )}
      </div>

      <Modal
        open={branchModalOpen}
        onClose={() => setBranchModalOpen(false)}
        title="Yangi filial qo'shish"
        size="sm"
        footer={
          <>
            <Button variant="secondary" onClick={() => setBranchModalOpen(false)}>Bekor qilish</Button>
            <Button variant="primary" onClick={handleAddBranch}>Qo'shish</Button>
          </>
        }
      >
        <div className="space-y-4">
          <Input label="Filial nomi" value={newBranch.name} onChange={e => setNewBranch({ ...newBranch, name: e.target.value })} placeholder="Masalan: Sergeli filiali" required fullWidth />
          <Input label="Telefon raqami" value={newBranch.phone} onChange={e => setNewBranch({ ...newBranch, phone: e.target.value })} fullWidth />
          <Textarea label="Manzil" value={newBranch.address} onChange={e => setNewBranch({ ...newBranch, address: e.target.value })} rows={2} fullWidth />
        </div>
      </Modal>
    </div>
  );
}
