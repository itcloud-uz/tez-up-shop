import { useState } from 'react';
import { Search, Eye, Printer, XCircle } from 'lucide-react';
import { Table, Pagination } from '../components/ui/Table';
import { Button, Badge } from '../components/ui/Button';
import { Modal, ConfirmModal } from '../components/ui/Modal';
import { Card } from '../components/ui/StatCard';
import { useStore } from '../store/useStore';
import { formatCurrency, formatDateTime } from '../utils/format';
import type { Sale } from '../types';

const PAGE_SIZE = 10;

const paymentLabels: Record<string, string> = {
  naqd: 'Naqd pul', karta: 'Karta', payme: 'Payme', click: 'Click', aralash: 'Aralash',
};

export function Sales() {
  const { sales, cancelSale, currentUser, showToast } = useStore();
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [paymentFilter, setPaymentFilter] = useState('');
  const [page, setPage] = useState(1);
  const [viewSale, setViewSale] = useState<Sale | null>(null);
  const [cancelConfirm, setCancelConfirm] = useState<string | null>(null);

  const filtered = sales.filter(s => {
    const q = search.toLowerCase();
    const matchQ = !q || s.receiptNumber.toLowerCase().includes(q) || s.cashierName.toLowerCase().includes(q) || (s.customerName || '').toLowerCase().includes(q);
    const matchStatus = !statusFilter || s.status === statusFilter;
    const matchPay = !paymentFilter || s.paymentMethod === paymentFilter;
    return matchQ && matchStatus && matchPay;
  });

  const totalPages = Math.ceil(filtered.length / PAGE_SIZE);
  const paged = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  const handleCancel = (id: string) => {
    cancelSale(id);
    setCancelConfirm(null);
    showToast('success', 'Savdo bekor qilindi va zaxira tiklandi');
  };

  const statusBadge = (status: string) => {
    if (status === 'yakunlangan') return <Badge color="green" dot>Yakunlangan</Badge>;
    if (status === 'bekor_qilingan') return <Badge color="red" dot>Bekor qilingan</Badge>;
    return <Badge color="amber" dot>Qaytarilgan</Badge>;
  };

  const canCancel = currentUser.role === 'admin' || currentUser.role === 'menejer';

  return (
    <div className="space-y-5">
      <Card padding={false}>
        <div className="flex flex-wrap gap-3 p-4">
          <div className="relative flex-1 min-w-48">
            <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="Chek raqami, kassir, mijoz..."
              value={search}
              onChange={e => { setSearch(e.target.value); setPage(1); }}
              className="w-full pl-9 pr-3 h-10 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-500"
            />
          </div>
          <select value={statusFilter} onChange={e => { setStatusFilter(e.target.value); setPage(1); }} className="h-10 px-3 border border-gray-200 rounded-lg text-sm bg-white focus:outline-none">
            <option value="">Barcha holatlar</option>
            <option value="yakunlangan">Yakunlangan</option>
            <option value="bekor_qilingan">Bekor qilingan</option>
            <option value="qaytarilgan">Qaytarilgan</option>
          </select>
          <select value={paymentFilter} onChange={e => { setPaymentFilter(e.target.value); setPage(1); }} className="h-10 px-3 border border-gray-200 rounded-lg text-sm bg-white focus:outline-none">
            <option value="">Barcha to'lov turlari</option>
            {Object.entries(paymentLabels).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
          </select>
        </div>

        <Table
          columns={[
            { key: 'receiptNumber', header: 'Chek raqami', render: (s: Sale) => <span className="font-mono text-xs font-semibold">{s.receiptNumber}</span> },
            { key: 'date', header: 'Sana/Vaqt', render: (s: Sale) => <span className="text-sm text-gray-600">{formatDateTime(s.date)}</span> },
            {
              key: 'itemsSummary',
              header: "Mahsulot (Yangi va Qaytgan — Bitta chekda)",
              render: (s: Sale) => {
                const hasReturn = s.items.some(i => i.isReturn) || (s.returnedTotal ?? 0) > 0;
                return (
                  <div className="space-y-1">
                    {s.items.map((it, idx) => (
                      <div key={`${it.productId}-${it.isReturn ? 'ret' : 'new'}-${idx}`} className="text-xs flex flex-wrap items-center gap-1">
                        {hasReturn && (
                          <span
                            className={`px-1.5 py-0.5 rounded text-[10px] font-bold uppercase ${
                              it.isReturn
                                ? 'bg-rose-100 text-rose-700 border border-rose-200'
                                : 'bg-emerald-100 text-emerald-800 border border-emerald-200'
                            }`}
                          >
                            {it.isReturn ? '↩️ Qaytgan (-)' : '🛒 Yangi (+)'}
                          </span>
                        )}
                        <span className="font-semibold text-gray-900">{it.productName}</span>
                        <span className="px-1.5 py-0.5 rounded bg-indigo-50 text-indigo-800 font-medium">
                          {it.pieceSize || '1 m'} × {it.pieceCount || 1} ta = {it.quantity} {it.unit || 'm'}
                        </span>
                        {!it.isReturn && it.cutsCount && it.cutsCount > 0 ? (
                          <span className="px-1.5 py-0.5 rounded bg-amber-50 text-amber-800 font-medium">
                            ✂️ Kesish: {it.cutsCount} ta (+{formatCurrency(it.cuttingTotal || 0)})
                          </span>
                        ) : null}
                      </div>
                    ))}
                  </div>
                );
              },
            },
            { key: 'customerName', header: 'Mijoz', render: (s: Sale) => <span className="text-gray-600">{s.customerName || '—'}</span> },
            { key: 'paymentMethod', header: "To'lov turi", render: (s: Sale) => <span className="text-sm">{paymentLabels[s.paymentMethod]}</span> },
            { key: 'total', header: 'Jami', render: (s: Sale) => <span className="font-semibold">{formatCurrency(s.total)}</span> },
            { key: 'status', header: 'Holat', render: (s: Sale) => statusBadge(s.status) },
            {
              key: 'actions', header: 'Amallar',
              render: (s: Sale) => (
                <div className="flex gap-1">
                  <Button variant="ghost" size="xs" icon={<Eye size={14} />} onClick={() => setViewSale(s)} />
                  <Button variant="ghost" size="xs" icon={<Printer size={14} />} onClick={() => window.print()} />
                  {canCancel && s.status === 'yakunlangan' && (
                    <Button variant="ghost" size="xs" icon={<XCircle size={14} />} className="text-red-500 hover:bg-red-50" onClick={() => setCancelConfirm(s.id)} />
                  )}
                </div>
              )
            },
          ]}
          data={paged}
          keyExtractor={(s: Sale) => s.id}
          onRowClick={(s: Sale) => setViewSale(s)}
        />
        {filtered.length > PAGE_SIZE && (
          <Pagination page={page} totalPages={totalPages} onPage={setPage} total={filtered.length} pageSize={PAGE_SIZE} />
        )}
      </Card>

      {/* View Sale Modal */}
      <Modal open={!!viewSale} onClose={() => setViewSale(null)} title={`Chek: ${viewSale?.receiptNumber}`} size="md">
        {viewSale && (
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-3 text-sm">
              <div><span className="text-gray-500">Sana:</span> <span className="font-medium">{formatDateTime(viewSale.date)}</span></div>
              <div><span className="text-gray-500">Kassir:</span> <span className="font-medium">{viewSale.cashierName}</span></div>
              <div><span className="text-gray-500">Filial:</span> <span className="font-medium">{viewSale.branchName}</span></div>
              <div><span className="text-gray-500">Mijoz:</span> <span className="font-medium">{viewSale.customerName || '—'}</span></div>
              <div><span className="text-gray-500">To'lov:</span> <span className="font-medium">{paymentLabels[viewSale.paymentMethod]}</span></div>
              <div><span className="text-gray-500">Holat:</span> {statusBadge(viewSale.status)}</div>
            </div>
            <table className="w-full text-sm border border-gray-200 rounded-lg overflow-hidden">
              <thead className="bg-gray-50">
                <tr>
                  <th className="text-left px-3 py-2 font-semibold text-gray-600">Mahsulot</th>
                  <th className="text-center px-3 py-2 font-semibold text-gray-600">O'lchami × Soni</th>
                  <th className="text-right px-3 py-2 font-semibold text-gray-600">Umumiy o'lcham</th>
                  <th className="text-right px-3 py-2 font-semibold text-gray-600">Narx</th>
                  <th className="text-right px-3 py-2 font-semibold text-gray-600">Jami</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {viewSale.items.map((item, idx) => (
                  <tr key={`${item.productId}-${item.isReturn ? 'ret' : 'new'}-${idx}`} className={item.isReturn ? 'bg-rose-50/60' : ''}>
                    <td className="px-3 py-2">
                      <div className="flex items-center gap-1.5">
                        <span
                          className={`px-1.5 py-0.5 rounded text-[10px] font-bold uppercase ${
                            item.isReturn
                              ? 'bg-rose-600 text-white'
                              : 'bg-emerald-600 text-white'
                          }`}
                        >
                          {item.isReturn ? '↩️ Qaytgan (-)' : '🛒 Yangi (+)'}
                        </span>
                        <span className="font-semibold text-gray-900">{item.productName}</span>
                      </div>
                      {!item.isReturn && item.cutsCount && item.cutsCount > 0 ? (
                        <div className="text-xs text-amber-700 font-medium mt-0.5">
                          ✂️ Kesib berish: {item.cutsCount} ta × {formatCurrency(item.cuttingPrice || 0)} = +{formatCurrency(item.cuttingTotal || 0)}
                        </div>
                      ) : null}
                    </td>
                    <td className="px-3 py-2 text-center text-xs font-medium text-gray-700">
                      {item.pieceSize || '1 m'} × {item.pieceCount || 1} ta
                    </td>
                    <td className={`px-3 py-2 text-right font-bold ${item.isReturn ? 'text-rose-600' : 'text-indigo-700'}`}>
                      {item.isReturn ? '-' : ''}{item.quantity} {item.unit || 'm'}
                    </td>
                    <td className="px-3 py-2 text-right">{formatCurrency(item.unitPrice)}</td>
                    <td className={`px-3 py-2 text-right font-bold ${item.isReturn ? 'text-rose-600' : 'text-gray-900'}`}>
                      {item.isReturn ? '' : '+'}{formatCurrency(item.total)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            <div className="bg-gray-50 rounded-xl p-3 space-y-2">
              {(viewSale.returnedTotal ?? 0) > 0 ? (
                <>
                  <div className="flex justify-between text-sm text-emerald-800 font-semibold">
                    <span>🛒 Yangi olingan mahsulotlar jami</span>
                    <span>+{formatCurrency(viewSale.newItemsSubtotal || 0)}</span>
                  </div>
                  <div className="flex justify-between text-sm text-rose-600 font-semibold">
                    <span>↩️ Qaytgan mahsulotlar hisobi</span>
                    <span>-{formatCurrency(viewSale.returnedTotal || 0)}</span>
                  </div>
                </>
              ) : (
                <div className="flex justify-between text-sm"><span className="text-gray-600">Oraliq jami</span><span>{formatCurrency(viewSale.subtotal)}</span></div>
              )}
              {viewSale.cuttingServiceTotal && viewSale.cuttingServiceTotal > 0 ? (
                <div className="flex justify-between text-sm text-amber-800 font-medium">
                  <span>✂️ Jami kesib berish xizmati (yangi mahsulot ichida)</span>
                  <span>{formatCurrency(viewSale.cuttingServiceTotal)}</span>
                </div>
              ) : null}
              {viewSale.discount > 0 && <div className="flex justify-between text-sm"><span className="text-gray-600">Chegirma</span><span>{viewSale.discount}%</span></div>}
              <div className="flex justify-between font-bold border-t border-gray-200 pt-1.5">
                <span>{(viewSale.returnedTotal ?? 0) > 0 ? "Yakuniy farq (Jami to'lov)" : 'Jami'}</span>
                <span className="text-blue-600">{formatCurrency(viewSale.total)}</span>
              </div>
              <div className="flex justify-between text-sm"><span className="text-gray-600">To'landi</span><span>{formatCurrency(viewSale.amountPaid)}</span></div>
              {viewSale.change > 0 && <div className="flex justify-between text-sm text-green-600 font-semibold"><span>Qaytim</span><span>{formatCurrency(viewSale.change)}</span></div>}
            </div>
            <Button variant="secondary" icon={<Printer size={16} />} fullWidth onClick={() => window.print()}>Chop etish</Button>
          </div>
        )}
      </Modal>

      <ConfirmModal
        open={!!cancelConfirm}
        onClose={() => setCancelConfirm(null)}
        onConfirm={() => cancelConfirm && handleCancel(cancelConfirm)}
        title="Savdoni bekor qilish"
        message="Bu savdoni bekor qilmoqchimisiz? Mahsulot zaxiralari tiklanadi va savdo tarixda bekor qilingan sifatida saqlanadi."
        confirmText="Ha, bekor qilish"
        variant="danger"
      />
    </div>
  );
}
