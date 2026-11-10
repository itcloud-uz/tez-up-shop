import { useState } from 'react';
import { Download, TrendingUp, Package, Users, BarChart3, ShoppingBag, AlertTriangle, Warehouse } from 'lucide-react';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, LineChart, Line
} from 'recharts';
import { Button, Badge } from '../components/ui/Button';
import { Card, StatCard } from '../components/ui/StatCard';
import { Table } from '../components/ui/Table';
import { useStore } from '../store/useStore';
import { formatCurrency, exportToCSV, formatDateTime } from '../utils/format';
import { dailySalesData } from '../data/mockData';

const REPORT_TYPES = [
  { id: 'sales', label: 'Savdo hisoboti', icon: <TrendingUp size={15} /> },
  { id: 'products', label: "Mahsulotlar bo'yicha", icon: <Package size={15} /> },
  { id: 'profit', label: 'Foyda va marja', icon: <BarChart3 size={15} /> },
  { id: 'stock', label: "Ombor qoldig'i", icon: <ShoppingBag size={15} /> },
  { id: 'low_stock', label: 'Kam qolgan mahsulotlar', icon: <AlertTriangle size={15} /> },
  { id: 'cashiers', label: 'Kassirlar faoliyati', icon: <Users size={15} /> },
  { id: 'payments', label: "To'lov turlari", icon: <BarChart3 size={15} /> },
  { id: 'movements', label: 'Xaridlar va ombor harakati', icon: <Warehouse size={15} /> },
];

const PAYMENT_COLORS: Record<string, string> = {
  naqd: '#16a34a', karta: '#2563eb', payme: '#7c3aed', click: '#d97706', aralash: '#6366f1',
};
const PAYMENT_LABELS: Record<string, string> = {
  naqd: 'Naqd pul', karta: 'Karta', payme: 'Payme', click: 'Click', aralash: 'Aralash',
};

type PieEntry = { name: string; value: number; color: string };
type ProductStat = { name: string; qty: number; revenue: number; cost: number; profit: number };
type CashierStat = { name: string; count: number; total: number };

export function Reports() {
  const { sales, products, branches, employees, stockMovements, showToast } = useStore();
  const [activeReport, setActiveReport] = useState('sales');
  const [branchFilter, setBranchFilter] = useState('');
  const [cashierFilter, setCashierFilter] = useState('');
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');

  const completedSales = sales.filter(s => {
    if (s.status !== 'yakunlangan') return false;
    if (branchFilter && s.branchId !== branchFilter) return false;
    if (cashierFilter && s.cashierId !== cashierFilter) return false;
    if (dateFrom && s.date < dateFrom) return false;
    if (dateTo && s.date > dateTo + 'T23:59:59') return false;
    return true;
  });

  const totalRevenue = completedSales.reduce((s, sale) => s + sale.total, 0);
  const totalCost = completedSales.reduce((sum, sale) =>
    sum + sale.items.reduce((s, item) => {
      const p = products.find(p => p.id === item.productId);
      return s + (p ? p.purchasePrice * item.quantity : 0);
    }, 0), 0);
  const totalProfit = totalRevenue - totalCost;

  const productStats: Record<string, ProductStat> = {};
  completedSales.forEach(sale => {
    sale.items.forEach(item => {
      if (!productStats[item.productId]) {
        productStats[item.productId] = { name: item.productName, qty: 0, revenue: 0, cost: 0, profit: 0 };
      }
      const p = products.find(prod => prod.id === item.productId);
      const cost = (p?.purchasePrice || 0) * item.quantity;
      productStats[item.productId].qty += item.quantity;
      productStats[item.productId].revenue += item.total;
      productStats[item.productId].cost += cost;
      productStats[item.productId].profit += item.total - cost;
    });
  });
  const productList = Object.values(productStats).sort((a, b) => b.revenue - a.revenue);

  const cashierStats: Record<string, CashierStat> = {};
  completedSales.forEach(sale => {
    if (!cashierStats[sale.cashierId]) cashierStats[sale.cashierId] = { name: sale.cashierName, count: 0, total: 0 };
    cashierStats[sale.cashierId].count++;
    cashierStats[sale.cashierId].total += sale.total;
  });
  const cashierList = Object.values(cashierStats).sort((a, b) => b.total - a.total);

  const paymentStats: Record<string, number> = {};
  completedSales.forEach(sale => {
    paymentStats[sale.paymentMethod] = (paymentStats[sale.paymentMethod] || 0) + sale.total;
  });
  const paymentPie: PieEntry[] = Object.entries(paymentStats).map(([k, v]) => ({
    name: PAYMENT_LABELS[k] || k, value: v, color: PAYMENT_COLORS[k] || '#888',
  }));

  const lowStockProducts = products.filter(p => p.stock <= p.minStock);

  const tooltipFormatter = (value: unknown) => [formatCurrency(Number(value ?? 0))];

  const handleExportCSV = () => {
    if (activeReport === 'products' || activeReport === 'profit') {
      exportToCSV(
        'mahsulotlar_savdosi.csv',
        ['Mahsulot', 'Sotilgan miqdor', 'Savdo summasi', 'Tannarx', 'Sof foyda'],
        productList.map(p => [p.name, p.qty, p.revenue, p.cost, p.profit])
      );
    } else if (activeReport === 'stock' || activeReport === 'low_stock') {
      const list = activeReport === 'low_stock' ? lowStockProducts : products;
      exportToCSV(
        'ombor_qoldigi.csv',
        ['Mahsulot', 'SKU', 'Qoldiq', 'Minimal', 'Birlik', 'Xarid narxi', 'Sotuv narxi'],
        list.map(p => [p.name, p.sku, p.stock, p.minStock, p.unit, p.purchasePrice, p.salePrice])
      );
    } else {
      exportToCSV(
        'savdolar_hisoboti.csv',
        ['Chek raqami', 'Sana', 'Kassir', 'Filial', 'To\'lov turi', 'Jami summa'],
        completedSales.map(s => [s.receiptNumber, s.date, s.cashierName, s.branchName, s.paymentMethod, s.total])
      );
    }
    showToast('success', 'Hisobot CSV formatda yuklab olindi');
  };

  return (
    <div className="space-y-5">
      {/* Report Type Tabs */}
      <div className="flex flex-wrap gap-2">
        {REPORT_TYPES.map(r => (
          <button
            key={r.id}
            onClick={() => setActiveReport(r.id)}
            className={`flex items-center gap-2 px-3.5 py-2 rounded-lg text-sm font-medium border transition-colors cursor-pointer ${
              activeReport === r.id
                ? 'bg-indigo-600 text-white border-indigo-600 shadow-xs'
                : 'bg-white text-gray-600 border-gray-200 hover:bg-gray-50'
            }`}
          >
            {r.icon}
            {r.label}
          </button>
        ))}
      </div>

      {/* Filters Toolbar */}
      <div className="bg-white p-3.5 rounded-xl border border-gray-200 shadow-xs flex flex-wrap items-center gap-3">
        <select
          value={branchFilter}
          onChange={e => setBranchFilter(e.target.value)}
          className="h-9 px-3 border border-gray-200 rounded-lg text-sm bg-white"
        >
          <option value="">Barcha filiallar</option>
          {branches.map(b => <option key={b.id} value={b.id}>{b.name}</option>)}
        </select>

        <select
          value={cashierFilter}
          onChange={e => setCashierFilter(e.target.value)}
          className="h-9 px-3 border border-gray-200 rounded-lg text-sm bg-white"
        >
          <option value="">Barcha kassirlar</option>
          {employees.filter(e => e.role === 'kassir').map(e => <option key={e.id} value={e.id}>{e.name}</option>)}
        </select>

        <div className="flex items-center gap-2">
          <input type="date" value={dateFrom} onChange={e => setDateFrom(e.target.value)} className="h-9 px-3 border border-gray-200 rounded-lg text-sm" />
          <span className="text-gray-400 text-sm">—</span>
          <input type="date" value={dateTo} onChange={e => setDateTo(e.target.value)} className="h-9 px-3 border border-gray-200 rounded-lg text-sm" />
        </div>

        <div className="ml-auto">
          <Button variant="secondary" size="sm" icon={<Download size={14} />} onClick={handleExportCSV}>
            CSV Eksport
          </Button>
        </div>
      </div>

      {/* Summary KPI Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <StatCard title="Jami savdo" value={formatCurrency(totalRevenue)} icon={<TrendingUp size={20} />} color="blue" />
        <StatCard title="Jami cheklar" value={`${completedSales.length} ta`} icon={<Package size={20} />} color="green" />
        <StatCard title="Sof foyda" value={formatCurrency(totalProfit)} icon={<BarChart3 size={20} />} color="purple" />
        <StatCard title="Foyda marjasi" value={`${totalRevenue > 0 ? ((totalProfit / totalRevenue) * 100).toFixed(1) : 0}%`} icon={<Users size={20} />} color="amber" />
      </div>

      {activeReport === 'sales' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
          <Card title="Kunlik savdo dinamikasi">
            <ResponsiveContainer width="100%" height={260}>
              <LineChart data={dailySalesData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                <XAxis dataKey="date" tick={{ fontSize: 12 }} />
                <YAxis tick={{ fontSize: 12 }} tickFormatter={(v: number) => `${(v / 1000000).toFixed(1)}M`} />
                <Tooltip formatter={tooltipFormatter} />
                <Line type="monotone" dataKey="amount" stroke="#4f46e5" strokeWidth={2.5} dot={{ r: 4 }} />
              </LineChart>
            </ResponsiveContainer>
          </Card>
          <Card title="Tanlangan davrdagi savdolar" padding={false}>
            <Table
              columns={[
                { key: 'receiptNumber', header: 'Chek', render: (s: typeof completedSales[0]) => <span className="font-mono text-xs font-semibold">{s.receiptNumber}</span> },
                { key: 'cashierName', header: 'Kassir' },
                { key: 'branchName', header: 'Filial' },
                { key: 'total', header: 'Summa', render: (s: typeof completedSales[0]) => <span className="font-semibold">{formatCurrency(s.total)}</span> },
              ]}
              data={completedSales.slice(0, 8)}
              keyExtractor={(s: typeof completedSales[0]) => s.id}
              compact
            />
          </Card>
        </div>
      )}

      {activeReport === 'products' && (
        <div className="space-y-5">
          <Card title="Mahsulotlar bo'yicha savdo hajmi">
            <ResponsiveContainer width="100%" height={280}>
              <BarChart data={productList.slice(0, 8)} layout="vertical" margin={{ left: 100 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                <XAxis type="number" tick={{ fontSize: 11 }} tickFormatter={(v: number) => `${(v / 1000000).toFixed(1)}M`} />
                <YAxis type="category" dataKey="name" tick={{ fontSize: 11 }} width={120} />
                <Tooltip formatter={tooltipFormatter} />
                <Bar dataKey="revenue" fill="#4f46e5" radius={[0, 4, 4, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </Card>
          <Card padding={false}>
            <Table
              columns={[
                { key: 'name', header: 'Mahsulot', render: (p: ProductStat) => <span className="font-medium">{p.name}</span> },
                { key: 'qty', header: 'Sotilgan miqdor', render: (p: ProductStat) => <span>{p.qty} dona</span> },
                { key: 'revenue', header: 'Savdo summasi', render: (p: ProductStat) => <span className="font-semibold">{formatCurrency(p.revenue)}</span> },
                { key: 'cost', header: 'Tannarx', render: (p: ProductStat) => <span className="text-gray-500">{formatCurrency(p.cost)}</span> },
                { key: 'profit', header: 'Sof foyda', render: (p: ProductStat) => <span className="text-green-600 font-semibold">{formatCurrency(p.profit)}</span> },
              ]}
              data={productList}
              keyExtractor={(p: ProductStat) => p.name}
              compact
            />
          </Card>
        </div>
      )}

      {activeReport === 'profit' && (
        <Card title="Savdo tushumi va sof foyda qiyosi (mahsulotlar bo'yicha)">
          <ResponsiveContainer width="100%" height={280}>
            <BarChart data={productList.slice(0, 10)}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
              <XAxis dataKey="name" tick={{ fontSize: 10 }} />
              <YAxis tick={{ fontSize: 11 }} tickFormatter={(v: number) => `${(v / 1000000).toFixed(1)}M`} />
              <Tooltip formatter={tooltipFormatter} />
              <Bar dataKey="revenue" name="Savdo tushumi" fill="#4f46e5" radius={[4, 4, 0, 0]} />
              <Bar dataKey="profit" name="Sof foyda" fill="#16a34a" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </Card>
      )}

      {activeReport === 'stock' && (
        <Card padding={false} title="Ombor qoldig'i va moliyaviy qiymati">
          <Table
            columns={[
              { key: 'name', header: 'Mahsulot', render: (p: typeof products[0]) => <span className="font-medium">{p.name}</span> },
              { key: 'sku', header: 'SKU', render: (p: typeof products[0]) => <span className="font-mono text-xs text-gray-500">{p.sku}</span> },
              { key: 'stock', header: 'Joriy qoldiq', render: (p: typeof products[0]) => <span className={`font-bold ${p.stock === 0 ? 'text-red-500' : p.stock <= p.minStock ? 'text-amber-500' : 'text-green-600'}`}>{p.stock} {p.unit}</span> },
              { key: 'minStock', header: 'Minimal qoldiq', render: (p: typeof products[0]) => <span className="text-gray-500">{p.minStock} {p.unit}</span> },
              { key: 'salePrice', header: 'Sotuv narxi', render: (p: typeof products[0]) => formatCurrency(p.salePrice) },
              { key: 'value', header: 'Tannarx qiymati', render: (p: typeof products[0]) => <span className="font-semibold">{formatCurrency(p.stock * p.purchasePrice)}</span> },
            ]}
            data={products}
            keyExtractor={(p: typeof products[0]) => p.id}
            compact
          />
        </Card>
      )}

      {activeReport === 'low_stock' && (
        <Card padding={false} title="Kam qolgan va tugagan mahsulotlar ro'yxati">
          <Table
            columns={[
              { key: 'name', header: 'Mahsulot', render: (p: typeof products[0]) => <span className="font-medium">{p.name}</span> },
              { key: 'sku', header: 'SKU', render: (p: typeof products[0]) => <span className="font-mono text-xs text-gray-500">{p.sku}</span> },
              { key: 'stock', header: 'Qoldiq', render: (p: typeof products[0]) => <span className="font-bold text-red-600">{p.stock} {p.unit}</span> },
              { key: 'minStock', header: 'Minimal talab', render: (p: typeof products[0]) => <span>{p.minStock} {p.unit}</span> },
              {
                key: 'status', header: 'Holat',
                render: (p: typeof products[0]) => p.stock === 0 ? <Badge color="red" dot>Tugagan</Badge> : <Badge color="amber" dot>Kam qolgan</Badge>
              },
            ]}
            data={lowStockProducts}
            keyExtractor={(p: typeof products[0]) => p.id}
          />
        </Card>
      )}

      {activeReport === 'cashiers' && (
        <Card padding={false} title="Kassirlar samaradorligi">
          <Table
            columns={[
              { key: 'name', header: 'Kassir', render: (c: CashierStat) => <span className="font-medium">{c.name}</span> },
              { key: 'count', header: 'Cheklar soni', render: (c: CashierStat) => <span className="font-semibold">{c.count} ta</span> },
              { key: 'total', header: 'Jami savdo summasi', render: (c: CashierStat) => <span className="font-semibold text-indigo-600">{formatCurrency(c.total)}</span> },
              { key: 'avg', header: "O'rtacha chek", render: (c: CashierStat) => <span>{formatCurrency(c.count > 0 ? c.total / c.count : 0)}</span> },
            ]}
            data={cashierList}
            keyExtractor={(c: CashierStat) => c.name}
          />
        </Card>
      )}

      {activeReport === 'payments' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          <Card title="To'lov turlari taqsimoti">
            <ResponsiveContainer width="100%" height={260}>
              <PieChart>
                <Pie
                  data={paymentPie}
                  cx="50%"
                  cy="50%"
                  outerRadius={100}
                  dataKey="value"
                  label={({ name, percent }: { name?: string; percent?: number }) => `${name ?? ''} ${((percent ?? 0) * 100).toFixed(0)}%`}
                  labelLine={false}
                >
                  {paymentPie.map((entry, i) => (
                    <Cell key={i} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip formatter={tooltipFormatter} />
              </PieChart>
            </ResponsiveContainer>
          </Card>
          <Card padding={false}>
            <Table
              columns={[
                { key: 'name', header: "To'lov turi", render: (p: PieEntry) => <span className="font-medium">{p.name}</span> },
                { key: 'value', header: 'Summa', render: (p: PieEntry) => <span className="font-bold text-indigo-600">{formatCurrency(p.value)}</span> },
                { key: 'pct', header: 'Ulushi', render: (p: PieEntry) => <span>{totalRevenue > 0 ? `${((p.value / totalRevenue) * 100).toFixed(1)}%` : '—'}</span> },
              ]}
              data={paymentPie}
              keyExtractor={(p: PieEntry) => p.name}
            />
          </Card>
        </div>
      )}

      {activeReport === 'movements' && (
        <Card padding={false} title="So'nggi xaridlar va ombor harakatlari">
          <Table
            columns={[
              { key: 'date', header: 'Sana va vaqt', render: (m: typeof stockMovements[0]) => formatDateTime(m.date) },
              { key: 'type', header: 'Tur', render: (m: typeof stockMovements[0]) => <Badge color={m.quantity > 0 ? 'green' : 'red'}>{m.type.toUpperCase()}</Badge> },
              { key: 'productName', header: 'Mahsulot', render: (m: typeof stockMovements[0]) => <span className="font-medium">{m.productName}</span> },
              { key: 'quantity', header: 'Miqdor', render: (m: typeof stockMovements[0]) => <span className={`font-bold ${m.quantity > 0 ? 'text-green-600' : 'text-red-500'}`}>{m.quantity > 0 ? '+' : ''}{m.quantity}</span> },
              { key: 'userName', header: 'Xodim' },
              { key: 'note', header: 'Izoh', render: (m: typeof stockMovements[0]) => m.note || '—' },
            ]}
            data={stockMovements}
            keyExtractor={(m: typeof stockMovements[0]) => m.id}
            compact
          />
        </Card>
      )}
    </div>
  );
}
