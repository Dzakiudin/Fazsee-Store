import { useState, useEffect } from 'react';
import { formatRupiah } from '../../utils/formatters';

const API = import.meta.env.VITE_API_URL || 'http://localhost:3000/api';

export default function AnalyticsTab({ token }) {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch(`${API}/admin/analytics`, {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then(r => r.json())
      .then(res => { if (res.data) setData(res.data); })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  if (loading) return (
    <div className="flex justify-center py-16">
      <span className="material-symbols-outlined animate-spin text-4xl text-primary">sync</span>
    </div>
  );

  if (!data) return (
    <p className="text-center text-stone-500 py-10">Gagal memuat analytics.</p>
  );

  const maxRevenue = Math.max(...data.dailyRevenue.map(d => d.revenue), 1);

  const statCards = [
    { label: 'Total Revenue', value: `Rp ${formatRupiah(data.totalRevenue)}`, icon: 'payments', color: 'from-emerald-500 to-green-600', iconBg: 'bg-emerald-100 dark:bg-emerald-900/40', iconColor: 'text-emerald-600' },
    { label: 'Total Pesanan', value: data.totalOrders, icon: 'receipt_long', color: 'from-primary to-sky-500', iconBg: 'bg-sky-100 dark:bg-sky-900/40', iconColor: 'text-sky-600' },
    { label: 'Selesai', value: data.completedOrders, icon: 'check_circle', color: 'from-violet-500 to-purple-600', iconBg: 'bg-violet-100 dark:bg-violet-900/40', iconColor: 'text-violet-600' },
    { label: 'Total User', value: data.totalUsers, icon: 'group', color: 'from-amber-500 to-orange-600', iconBg: 'bg-amber-100 dark:bg-amber-900/40', iconColor: 'text-amber-600' },
    { label: 'Produk Aktif', value: data.totalProducts, icon: 'inventory_2', color: 'from-rose-500 to-pink-600', iconBg: 'bg-rose-100 dark:bg-rose-900/40', iconColor: 'text-rose-600' },
    { label: 'Kategori', value: data.totalCategories, icon: 'category', color: 'from-cyan-500 to-teal-600', iconBg: 'bg-cyan-100 dark:bg-cyan-900/40', iconColor: 'text-cyan-600' },
  ];

  const statusMap = {
    PENDING: { label: 'Menunggu', color: 'bg-amber-500' },
    PAID: { label: 'Dibayar', color: 'bg-sky-500' },
    PROCESSING: { label: 'Diproses', color: 'bg-violet-500' },
    COMPLETED: { label: 'Selesai', color: 'bg-emerald-500' },
    FAILED: { label: 'Gagal', color: 'bg-red-500' },
  };

  return (
    <div className="space-y-8">

      {/* Stat Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
        {statCards.map((stat, i) => (
          <div key={i} className="bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 rounded-2xl p-4 relative overflow-hidden group hover:border-primary/30 transition-all">
            <div className="absolute -top-6 -right-6 w-20 h-20 bg-gradient-to-br opacity-10 rounded-full blur-xl" style={{}} />
            <div className={`w-10 h-10 ${stat.iconBg} rounded-xl flex items-center justify-center mb-3`}>
              <span className={`material-symbols-outlined ${stat.iconColor} text-lg`} style={{ fontVariationSettings: "'FILL' 1" }}>{stat.icon}</span>
            </div>
            <p className="font-headline font-black text-xl text-on-surface dark:text-stone-100 leading-none">{stat.value}</p>
            <p className="font-label text-[10px] font-bold uppercase tracking-widest text-stone-400 mt-1">{stat.label}</p>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

        {/* Revenue Chart */}
        <div className="lg:col-span-2 bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 rounded-2xl p-6">
          <h3 className="font-headline font-black text-base uppercase tracking-tight text-on-surface dark:text-stone-100 mb-6 flex items-center gap-2">
            <span className="material-symbols-outlined text-primary text-lg">bar_chart</span>
            Revenue 7 Hari Terakhir
          </h3>
          <div className="flex items-end gap-2 h-48">
            {data.dailyRevenue.map((day, i) => {
              const height = maxRevenue > 0 ? (day.revenue / maxRevenue) * 100 : 0;
              const dayName = new Date(day.date).toLocaleDateString('id-ID', { weekday: 'short' });
              return (
                <div key={i} className="flex-1 flex flex-col items-center gap-1 group/bar">
                  {/* Tooltip */}
                  <div className="opacity-0 group-hover/bar:opacity-100 transition-opacity bg-stone-800 dark:bg-stone-700 text-white text-[9px] font-bold px-2 py-1 rounded whitespace-nowrap">
                    Rp {formatRupiah(day.revenue)}
                  </div>
                  {/* Bar */}
                  <div className="w-full flex-1 flex items-end">
                    <div
                      className="w-full bg-gradient-to-t from-primary to-sky-400 rounded-t-lg transition-all duration-500 hover:from-primary hover:to-sky-300 cursor-pointer relative"
                      style={{ height: `${Math.max(height, 4)}%` }}
                    >
                      {day.count > 0 && (
                        <span className="absolute -top-5 left-1/2 -translate-x-1/2 text-[9px] font-black text-primary">{day.count}</span>
                      )}
                    </div>
                  </div>
                  {/* Label */}
                  <span className="text-[10px] font-label font-bold text-stone-400 uppercase">{dayName}</span>
                </div>
              );
            })}
          </div>
        </div>

        {/* Order Status Distribution */}
        <div className="bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 rounded-2xl p-6">
          <h3 className="font-headline font-black text-base uppercase tracking-tight text-on-surface dark:text-stone-100 mb-6 flex items-center gap-2">
            <span className="material-symbols-outlined text-secondary dark:text-orange-400 text-lg">donut_small</span>
            Status Pesanan
          </h3>
          <div className="space-y-3">
            {Object.entries(statusMap).map(([key, config]) => {
              const count = data.statusCounts[key] || 0;
              const pct = data.totalOrders > 0 ? (count / data.totalOrders) * 100 : 0;
              return (
                <div key={key} className="space-y-1">
                  <div className="flex justify-between items-center">
                    <span className="font-label text-xs font-bold text-stone-500 dark:text-stone-400">{config.label}</span>
                    <span className="font-headline text-xs font-black text-on-surface dark:text-stone-200">{count} <span className="text-stone-400 font-normal">({pct.toFixed(0)}%)</span></span>
                  </div>
                  <div className="h-2 bg-stone-100 dark:bg-stone-800 rounded-full overflow-hidden">
                    <div className={`h-full ${config.color} rounded-full transition-all duration-700`} style={{ width: `${pct}%` }} />
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

        {/* Top Products */}
        <div className="bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 rounded-2xl p-6">
          <h3 className="font-headline font-black text-base uppercase tracking-tight text-on-surface dark:text-stone-100 mb-4 flex items-center gap-2">
            <span className="material-symbols-outlined text-amber-500 text-lg" style={{ fontVariationSettings: "'FILL' 1" }}>star</span>
            Produk Terlaris
          </h3>
          {data.topProducts.length === 0 ? (
            <p className="text-sm text-stone-400 text-center py-8">Belum ada data penjualan.</p>
          ) : (
            <div className="space-y-3">
              {data.topProducts.map((p, i) => (
                <div key={p.id} className="flex items-center gap-3 bg-stone-50 dark:bg-stone-800/50 p-3 rounded-xl border border-stone-200/50 dark:border-stone-700/50">
                  <span className={`w-7 h-7 rounded-lg flex items-center justify-center font-black text-xs text-white ${i === 0 ? 'bg-amber-500' : i === 1 ? 'bg-stone-400' : i === 2 ? 'bg-amber-700' : 'bg-stone-300 dark:bg-stone-700 text-stone-500'}`}>
                    #{i + 1}
                  </span>
                  {p.imageUrl && <img src={p.imageUrl} alt="" className="w-10 h-10 rounded-lg object-cover" />}
                  <div className="flex-1 min-w-0">
                    <p className="font-headline text-sm font-bold text-on-surface dark:text-stone-200 truncate">{p.name}</p>
                    <p className="text-[10px] text-stone-500">{p.totalQty} terjual</p>
                  </div>
                  <p className="font-headline text-sm font-black text-primary shrink-0">Rp {formatRupiah(p.totalRevenue)}</p>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Recent Orders */}
        <div className="bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 rounded-2xl p-6">
          <h3 className="font-headline font-black text-base uppercase tracking-tight text-on-surface dark:text-stone-100 mb-4 flex items-center gap-2">
            <span className="material-symbols-outlined text-primary text-lg">schedule</span>
            Pesanan Terbaru
          </h3>
          {data.recentOrders.length === 0 ? (
            <p className="text-sm text-stone-400 text-center py-8">Belum ada pesanan.</p>
          ) : (
            <div className="space-y-2">
              {data.recentOrders.map(order => {
                const statusStyle = statusMap[order.status] || statusMap.PENDING;
                return (
                  <div key={order.id} className="flex items-center gap-3 p-3 bg-stone-50 dark:bg-stone-800/50 rounded-xl border border-stone-200/50 dark:border-stone-700/50">
                    <div className={`w-2 h-8 rounded-full ${statusStyle.color}`} />
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="font-label text-[10px] font-bold text-stone-400">#{order.id}</span>
                        <span className={`text-[9px] font-bold px-2 py-0.5 rounded-full text-white ${statusStyle.color}`}>{statusStyle.label}</span>
                      </div>
                      <p className="text-xs text-on-surface dark:text-stone-300 truncate">
                        {order.items?.map(i => `${i.quantity}x ${i.product?.name}`).join(', ')}
                      </p>
                    </div>
                    <p className="font-headline text-sm font-black text-on-surface dark:text-stone-200 shrink-0">Rp {formatRupiah(order.totalPrice)}</p>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
