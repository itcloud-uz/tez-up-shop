import { useState } from 'react';
import { TrendingUp, ShoppingBag, Receipt, AlertTriangle, Package, DollarSign, MonitorCheck, ArrowRight } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { StatCard, Card } from '../components/ui/StatCard';
import { useStore } from '../store/useStore';
import { formatCurrency, formatDateTime, getStockStatus } from '../utils/format';
import { dailySalesData } from '../data/mockData';
import { Badge, Button } from '../components/ui/Button';
import { Link, useNavigate } from 'react-router-dom';

export function Dashboard() {
  const { sales, products, branches, currentUser } = useStore();
  const navigate = useNavigate();
  const [dateRange, setDateRange] = useState<'today' | 'week' | 'month' | 'all'>('all');
  const [branchFilter, setBranchFilter] = useState<string>('all');

  const completedSales = sales.filter(s => {
    if (s.status !== 'yakunlangan') return false;
    if (branchFilter !== 'all' && s.branchId !== branchFilter) return false;
    const saleDate = new Date(s.date);
    const now = new Date();
    if (dateRange === 'today') {
      return saleDate.toDateString() === now.toDateString();
    }
    if (dateRange === 'week') {
      const diff = (now.getTime() - saleDate.getTime()) / (1000 * 3600 * 24);
      return diff <= 7;
    }
    if (dateRange === 'month') {
      const diff = (now.getTime() - saleDate.getTime()) / (1000 * 3600 * 24);
      return diff <= 30;
    }
    return true;
  });

  const totalRevenue = completedSales.reduce((s, sale) => s + sale.total, 0);
  const checkCount = completedSales.length;
  const avgCheck = checkCount > 0 ? totalRevenue / checkCount : 0;

  const totalCost = completedSales.reduce(
    (sum, sale) =>
      sum +
      sale.items.reduce((s, item) => {
        const prod = products.find(p => p.id === item.productId);
        return s + (prod ? prod.purchasePrice * item.quantity : item.unitPrice * 0.72 * item.quantity);
      }, 0),
    0
  );
  const netProfit = totalRevenue - totalCost;

  const lowStock = products.filter(p => getStockStatus(p.stock, p.minStock) === 'low');
  const outOfStock = products.filter(p => p.stock === 0);

  // Top products
  const productSaleMap: Record<string, { name: string; qty: number; amount: number }> = {};
  completedSales.forEach(sale => {
    sale.items.forEach(item => {
      if (!productSaleMap[item.productId]) {
        productSaleMap[item.productId] = { name: item.productName, qty: 0, amount: 0 };
      }
      productSaleMap[item.productId].qty += item.quantity;
      productSaleMap[item.productId].amount += item.total;
    });
  });
  const topProducts = Object.values(productSaleMap).sort((a, b) => b.amount - a.amount).slice(0, 5);

  const chartData = dailySalesData.map(d => ({
    ...d,
    amount: branchFilter === 'all' ? d.amount : Math.round(d.amount * 0.45),
  }));

  return (
    <div className="space-y-6">
      {/* Top Toolbar: Date range & Branch filter + Quick action */}
      <div className="flex items-center justify-between gap-3 flex-wrap bg-white p-3.5 rounded-xl border border-gray-200 shadow-xs">
        <div className="flex items-center gap-2 flex-wrap">
          {([
            { id: 'today', label: 'Bugun' },
            { id: 'week', label: '7 kun' },
            { id: 'month', label: 'Bu oy' },
            { id: 'all', label: 'Barcha davr' },
          ] as const).map(range => (
            <button
              key={range.id}
              onClick={() => setDateRange(range.id)}
              className={`px-3.5 py-1.5 rounded-lg text-sm font-medium transition-colors cursor-pointer ${
                dateRange === range.id
                  ? 'bg-indigo-600 text-white shadow-xs'
                  : 'bg-gray-50 text-gray-600 hover:bg-gray-100'
              }`}
            >
              {range.label}
            </button>
          ))}
        </div>

        <div className="flex items-center gap-3 ml-auto">
          <select
            value={branchFilter}
            onChange={e => setBranchFilter(e.target.value)}
            className="h-9 px-3 border border-gray-200 rounded-lg text-sm bg-white text-gray-700 focus:outline-none focus:ring-2 focus:ring-indigo-500/30"
          >
            <option value="all">Barcha filiallar</option>
            {branches.map(b => (
              <option key={b.id} value={b.id}>{b.name}</option>
            ))}
          </select>

          {currentUser.role !== 'omborchi' && (
            <Button variant="primary" size="sm" onClick={() => navigate('/pos')} iconRight={<ArrowRight size={15} />}>
              Kassaga o'tish
            </Button>
          )}
        </div>
      </div>

      {/* KPI Cards (6 cards) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
        <StatCard
          title="Savdo summasi"
          value={formatCurrency(totalRevenue)}
          subtitle={`${checkCount} ta chek asosida`}
          icon={<TrendingUp size={20} />}
          trend={{ value: 14, label: "o'tgan davrdan" }}
          color="blue"
        />
        <StatCard
          title="Cheklar soni"
          value={`${checkCount} ta`}
          subtitle="Yakunlangan savdolar"
          icon={<Receipt size={20} />}
          trend={{ value: 8, label: "o'sish" }}
          color="green"
        />
        <StatCard
          title="O'rtacha chek"
          value={formatCurrency(avgCheck)}
          subtitle="Har bir xarid uchun"
          icon={<ShoppingBag size={20} />}
          color="purple"
        />
        <StatCard
          title="Sof foyda"
          value={formatCurrency(netProfit)}
          subtitle={`Tannarx: ${formatCurrency(totalCost)}`}
          icon={<DollarSign size={20} />}
          color="indigo"
        />
        <StatCard
          title="Kam qolgan zaxira"
          value={`${lowStock.length + outOfStock.length} ta`}
          subtitle={`${outOfStock.length} ta tugagan`}
          icon={<AlertTriangle size={20} />}
          color={outOfStock.length > 0 ? 'red' : 'amber'}
          onClick={() => navigate('/products')}
        />
        <StatCard
          title="Ochiq smena / Kassa"
          value="3 / 3 faol"
          subtitle="Smena: 08:00 dan ochiq"
          icon={<MonitorCheck size={20} />}
          color="green"
        />
      </div>

      {/* Charts & Top Products */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card title="Kunlik savdo dinamikasi" className="lg:col-span-2">
          <ResponsiveContainer width="100%" height={250}>
            <BarChart data={chartData} margin={{ top: 5, right: 10, left: 0, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
              <XAxis dataKey="date" tick={{ fontSize: 12 }} />
              <YAxis tick={{ fontSize: 12 }} tickFormatter={(v: number) => `${(v / 1000000).toFixed(1)}M`} />
              <Tooltip formatter={(v) => [formatCurrency(Number(v ?? 0)), 'Savdo summasi']} />
              <Bar dataKey="amount" fill="#4f46e5" radius={[6, 6, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </Card>

        <Card title="Eng ko'p sotilgan mahsulotlar" action={<Link to="/reports" className="text-xs font-medium text-indigo-600 hover:underline">Hisobot →</Link>}>
          {topProducts.length === 0 ? (
            <p className="text-sm text-gray-400 text-center py-10">Tanlangan davrda savdolar yo'q</p>
          ) : (
            <div className="space-y-3.5">
              {topProducts.map((p, i) => (
                <div key={p.name} className="flex items-center gap-3">
                  <span className="w-6 h-6 rounded-full bg-indigo-50 text-indigo-600 text-xs font-bold flex items-center justify-center flex-shrink-0">
                    {i + 1}
                  </span>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-900 truncate">{p.name}</p>
                    <p className="text-xs text-gray-400">{p.qty} metr/dona sotildi</p>
                  </div>
                  <span className="text-sm font-semibold text-gray-800">{formatCurrency(p.amount)}</span>
                </div>
              ))}
            </div>
          )}
        </Card>
      </div>

      {/* Bottom Lists: Recent Sales & Low Stock */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card title="Oxirgi savdolar" action={<Link to="/sales" className="text-xs font-medium text-indigo-600 hover:underline">Barchasi →</Link>}>
          <div className="divide-y divide-gray-100">
            {sales.slice(0, 5).map(sale => (
              <div key={sale.id} className="flex items-center justify-between py-2.5">
                <div>
                  <p className="text-sm font-semibold text-gray-900 font-mono">{sale.receiptNumber}</p>
                  <p className="text-xs text-gray-400">{formatDateTime(sale.date)} · {sale.cashierName} ({sale.branchName})</p>
                </div>
                <div className="text-right">
                  <p className="text-sm font-bold text-gray-900">{formatCurrency(sale.total)}</p>
                  <Badge color={sale.status === 'yakunlangan' ? 'green' : sale.status === 'bekor_qilingan' ? 'red' : 'amber'}>
                    {sale.status === 'yakunlangan' ? 'Yakunlangan' : sale.status === 'bekor_qilingan' ? 'Bekor qilingan' : 'Qaytarilgan'}
                  </Badge>
                </div>
              </div>
            ))}
          </div>
        </Card>

        <Card title="Kam qolgan va tugagan mahsulotlar" action={<Link to="/products" className="text-xs font-medium text-indigo-600 hover:underline">Ombor →</Link>}>
          {lowStock.length + outOfStock.length === 0 ? (
            <div className="flex flex-col items-center py-8 text-gray-400 gap-2">
              <Package size={36} className="text-gray-200" />
              <p className="text-sm">Barcha mahsulotlar yetarli miqdorda</p>
            </div>
          ) : (
            <div className="divide-y divide-gray-100">
              {[...outOfStock, ...lowStock].slice(0, 6).map(p => (
                <div key={p.id} className="flex items-center justify-between py-2.5">
                  <div>
                    <p className="text-sm font-medium text-gray-900 truncate max-w-56">{p.name}</p>
                    <p className="text-xs text-gray-400">SKU: {p.sku} · Minimal: {p.minStock} {p.unit}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-bold text-gray-900">{p.stock} {p.unit}</p>
                    <Badge color={p.stock === 0 ? 'red' : 'amber'} dot>
                      {p.stock === 0 ? 'Tugagan' : 'Kam qoldi'}
                    </Badge>
                  </div>
                </div>
              ))}
            </div>
          )}
        </Card>
      </div>
    </div>
  );
}
