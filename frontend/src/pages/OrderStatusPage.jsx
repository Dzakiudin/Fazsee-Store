import { useSearchParams, useNavigate } from 'react-router-dom';
import { useState, useEffect, useRef } from 'react';
import { Helmet } from 'react-helmet-async';
import { apiFetch, apiFetcher } from '../services/apiService';
import { formatRupiah } from '../utils/formatters';
import useSWR from 'swr';

const STATUS_TABS = [
  { key: 'ALL', label: 'Semua', icon: 'list' },
  { key: 'PENDING', label: 'Menunggu', icon: 'schedule' },
  { key: 'PAID', label: 'Dibayar', icon: 'paid' },
  { key: 'PROCESSING', label: 'Dikemas', icon: 'inventory_2' },
  { key: 'COMPLETED', label: 'Selesai', icon: 'check_circle' },
  { key: 'FAILED', label: 'Gagal', icon: 'cancel' },
];

const STATUS_BADGE = {
  PENDING: { bg: 'bg-amber-100 dark:bg-amber-900/30', text: 'text-amber-600 dark:text-amber-400', label: 'Menunggu Pembayaran' },
  PAID: { bg: 'bg-sky-100 dark:bg-sky-900/30', text: 'text-sky-600 dark:text-sky-400', label: 'Dibayar' },
  PROCESSING: { bg: 'bg-violet-100 dark:bg-violet-900/30', text: 'text-violet-600 dark:text-violet-400', label: 'Sedang Dikemas' },
  COMPLETED: { bg: 'bg-emerald-100 dark:bg-emerald-900/30', text: 'text-emerald-600 dark:text-emerald-400', label: 'Selesai' },
  FAILED: { bg: 'bg-red-100 dark:bg-red-900/30', text: 'text-red-500', label: 'Gagal' },
};

const TIMELINE_STEPS = [
  { key: 'PENDING', icon: 'shopping_basket', title: 'Pesanan Diterima', desc: 'Pesanan sudah masuk ke sistem kami.' },
  { key: 'PAID', icon: 'paid', title: 'Pembayaran Berhasil', desc: 'Pembayaran telah diverifikasi.' },
  { key: 'PROCESSING', icon: 'inventory_2', title: 'Sedang Dikemas', desc: 'Admin sedang memproses pesanan kamu.' },
  { key: 'COMPLETED', icon: 'package_2', title: 'Pesanan Selesai!', desc: 'Item sudah berhasil dikirim ke akun kamu.' },
];

// ===============================================================
// ORDER CARD (compact, for the list)
// ===============================================================
function OrderCard({ order, onSelect, isSelected, navigate }) {
  const badge = STATUS_BADGE[order.status] || STATUS_BADGE.PENDING;
  let accountInfo = null;
  try { accountInfo = order.accountData ? JSON.parse(order.accountData) : null; } catch {}

  return (
    <button
      onClick={() => {
        if (order.status === 'PENDING') {
          navigate(`/payment?orderId=${order.id}`);
        } else {
          onSelect(order);
        }
      }}
      className={`w-full text-left bg-white dark:bg-stone-900 rounded-2xl border-2 p-4 md:p-5 transition-all duration-200 group relative overflow-hidden ${
        isSelected
          ? 'border-primary shadow-lg shadow-primary/10 scale-[1.01]'
          : 'border-stone-200 dark:border-stone-800 hover:border-primary/40 hover:shadow-md'
      }`}
    >
      {isSelected && <div className="absolute top-0 left-0 w-1 h-full bg-primary rounded-r" />}
      <div className="flex justify-between items-start gap-3 mb-3">
        <div className="min-w-0 flex-1">
          <span className="font-label text-[10px] font-bold uppercase tracking-widest text-stone-400">#{order.id}</span>
          <h3 className="font-headline font-bold text-sm text-on-surface dark:text-stone-100 truncate mt-0.5">
            {order.items?.map(i => i.product?.name).join(', ') || 'Item'}
          </h3>
        </div>
        <span className={`shrink-0 px-3 py-1 rounded-full font-label text-[9px] font-extrabold uppercase ${badge.bg} ${badge.text}`}>
          {badge.label}
        </span>
      </div>

      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2 text-xs text-stone-500">
          <span className="material-symbols-outlined text-[14px]">shopping_bag</span>
          {order.items?.map(i => `${i.quantity}x`).join(', ')}
        </div>
        <p className="font-headline font-black text-sm text-on-surface dark:text-stone-100">
          Rp {formatRupiah(order.totalPrice)}
        </p>
      </div>

      {accountInfo && (
        <p className="text-[10px] text-sky-500 mt-2 truncate">
          {Object.entries(accountInfo).map(([k, v]) => `${k}: ${v}`).join(' · ')}
        </p>
      )}

      <p className="text-[10px] text-stone-400 mt-1">
        {new Date(order.createdAt).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' })}
      </p>
    </button>
  );
}

// ===============================================================
// ORDER DETAIL VIEW (timeline + chat)
// ===============================================================
function OrderDetail({ order, onBack, navigate }) {
  const badge = STATUS_BADGE[order.status] || STATUS_BADGE.PENDING;
  const chatEndRef = useRef(null);
  const [chatMessage, setChatMessage] = useState('');

  const isChatActive = !['COMPLETED', 'FAILED'].includes(order.status);
  const statusIndex = TIMELINE_STEPS.findIndex(s => s.key === order.status);

  // Fetch messages (poll only if chat is active)
  const { data: messages = [], mutate: mutateMessages } = useSWR(
    order?.id ? `/orders/${order.id}/chat` : null,
    apiFetcher,
    { refreshInterval: isChatActive ? 3000 : 0 }
  );

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  let accountInfo = null;
  try { accountInfo = order.accountData ? JSON.parse(order.accountData) : null; } catch {}

  const handleSendChat = async (e) => {
    e.preventDefault();
    if (!chatMessage.trim() || !isChatActive) return;
    try {
      await apiFetch(`/orders/${order.id}/chat`, {
        method: 'POST',
        body: JSON.stringify({ content: chatMessage, sender: 'user' })
      });
      setChatMessage('');
      mutateMessages();
    } catch {}
  };

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Back Button */}
      <button onClick={onBack} className="flex items-center gap-2 text-sm text-stone-500 hover:text-primary transition-colors font-label font-bold uppercase">
        <span className="material-symbols-outlined text-lg">arrow_back</span> Kembali ke Daftar
      </button>

      {/* Order Summary Card */}
      <div className="bg-white dark:bg-stone-900 rounded-2xl p-5 md:p-6 border border-stone-200 dark:border-stone-800 shadow-sm relative overflow-hidden">
        <div className="absolute -top-10 -right-10 w-40 h-40 bg-primary/5 rounded-full blur-3xl" />
        <div className="relative z-10">
          <div className="flex justify-between items-start mb-5 flex-wrap gap-3">
            <div>
              <span className="font-label text-[10px] font-bold uppercase tracking-widest text-stone-400">Order #{order.id}</span>
              <h2 className="font-headline text-xl font-black text-on-surface dark:text-stone-100 mt-1 uppercase">
                {order.items?.map(i => i.product?.name).join(', ') || 'Item'}
              </h2>
            </div>
            <span className={`px-4 py-1.5 rounded-full font-label text-xs font-extrabold uppercase ${badge.bg} ${badge.text}`}>
              {badge.label}
            </span>
          </div>

          <div className="space-y-3">
            {accountInfo && (
              <div className="flex items-start gap-3 bg-sky-50 dark:bg-sky-900/10 p-3 rounded-xl border border-sky-200/50 dark:border-sky-800/30">
                <span className="material-symbols-outlined text-sky-500 text-lg mt-0.5">person</span>
                <div>
                  <p className="text-[10px] font-label font-bold text-stone-400 uppercase tracking-widest">Data Akun</p>
                  <p className="text-sm font-medium text-on-surface dark:text-stone-200">
                    {Object.entries(accountInfo).map(([k, v]) => `${k}: ${v}`).join(' • ')}
                  </p>
                </div>
              </div>
            )}

            <div className="flex items-start gap-3 bg-stone-50 dark:bg-stone-800/50 p-3 rounded-xl border border-stone-200/50 dark:border-stone-700/50">
              <span className="material-symbols-outlined text-primary text-lg mt-0.5">shopping_bag</span>
              <div>
                <p className="text-[10px] font-label font-bold text-stone-400 uppercase tracking-widest">Item</p>
                <p className="text-sm font-medium text-on-surface dark:text-stone-200">
                  {order.items?.map(i => `${i.quantity}x ${i.product?.name}`).join(', ')}
                </p>
              </div>
            </div>

            <div className="bg-gradient-to-r from-primary to-sky-500 text-white p-5 rounded-xl">
              <p className="text-[10px] font-label font-bold uppercase tracking-widest opacity-70">Total</p>
              <p className="font-headline text-3xl font-black">Rp {formatRupiah(order.totalPrice)}</p>
            </div>

            {order.whatsapp && (
              <div className="flex items-center gap-2 text-xs text-green-600 dark:text-green-400">
                <span className="material-symbols-outlined text-[14px]">call</span>
                WhatsApp: +62{order.whatsapp}
              </div>
            )}
          </div>

          {/* Action buttons for PENDING orders */}
          {order.status === 'PENDING' && (
            <div className="flex flex-col sm:flex-row gap-3 pt-2">
              <button
                onClick={() => navigate(`/payment?orderId=${order.id}`)}
                className="flex-1 bg-gradient-to-r from-primary to-sky-500 text-white py-3.5 rounded-xl font-headline font-bold text-sm uppercase flex items-center justify-center gap-2 hover:scale-[1.02] active:scale-[0.98] transition-all shadow-lg shadow-primary/30"
              >
                <span className="material-symbols-outlined text-lg">payment</span>
                Lanjutkan Pembayaran
              </button>
              <button
                onClick={() => navigate(`/confirmation?orderId=${order.id}`)}
                className="flex-1 bg-emerald-500 text-white py-3.5 rounded-xl font-headline font-bold text-sm uppercase flex items-center justify-center gap-2 hover:scale-[1.02] active:scale-[0.98] transition-all shadow-lg shadow-emerald-500/30"
              >
                <span className="material-symbols-outlined text-lg">receipt_long</span>
                Kirim Bukti Bayar
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Timeline */}
      <div className="bg-white dark:bg-stone-900 rounded-2xl p-5 md:p-6 border border-stone-200 dark:border-stone-800 shadow-sm">
        <h3 className="font-headline text-base font-black mb-6 uppercase tracking-tight text-primary flex items-center gap-2">
          <span className="material-symbols-outlined text-lg">timeline</span> Status Pesanan
        </h3>
        <div className="space-y-0 relative">
          <div className="absolute left-5 top-0 bottom-0 w-0.5 bg-stone-200 dark:bg-stone-800 rounded-full" />
          {TIMELINE_STEPS.map((step, i) => {
            const isComplete = i <= statusIndex;
            const isCurrent = i === statusIndex;
            const isFailed = order.status === 'FAILED' && i === statusIndex;
            return (
              <div key={step.key} className={`relative pl-14 pb-8 last:pb-0 ${!isComplete && !isCurrent ? 'opacity-30' : ''}`}>
                {isCurrent && <div className="absolute left-0.5 top-[-4px] w-10 h-10 rounded-full border-2 border-primary/30 animate-pulse opacity-50" />}
                <div className={`absolute left-2 top-0 w-7 h-7 rounded-full flex items-center justify-center z-10 transition-all ${
                  isFailed ? 'bg-red-500' : isCurrent ? 'bg-primary shadow-lg shadow-primary/30' : isComplete ? 'bg-emerald-500' : 'bg-white dark:bg-stone-900 border-2 border-stone-300 dark:border-stone-700'
                }`}>
                  <span className={`material-symbols-outlined text-[14px] ${isFailed || isCurrent || isComplete ? 'text-white' : 'text-stone-400'}`} style={isComplete ? { fontVariationSettings: "'FILL' 1" } : {}}>
                    {isFailed ? 'cancel' : isComplete && !isCurrent ? 'check' : step.icon}
                  </span>
                </div>
                <div>
                  <h4 className={`font-headline text-sm font-bold ${isCurrent ? 'text-primary' : 'text-on-surface dark:text-stone-200'}`}>{isFailed ? 'Pesanan Gagal' : step.title}</h4>
                  <p className="text-[11px] text-stone-500">{step.desc}</p>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Live Chat */}
      <div className="bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 rounded-2xl overflow-hidden shadow-sm flex flex-col h-80">
        <div className={`px-4 py-3 text-white flex items-center justify-between ${isChatActive ? 'bg-primary' : 'bg-stone-500'}`}>
          <div className="flex items-center gap-2">
            <span className="material-symbols-outlined text-[18px]">forum</span>
            <h3 className="font-headline font-bold text-sm uppercase relative">
              Live Chat
              {isChatActive && (
                <span className="absolute -top-1 -right-3 flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
                </span>
              )}
            </h3>
          </div>
          {!isChatActive && (
            <span className="text-[10px] bg-white/20 px-2 py-0.5 rounded uppercase font-bold">Sesi Berakhir</span>
          )}
        </div>

        <div className="flex-1 p-4 overflow-y-auto space-y-3 bg-stone-50/50 dark:bg-stone-900/50">
          {messages.length === 0 ? (
            <p className="text-center text-xs text-stone-400 italic mt-8">
              {isChatActive ? 'Belum ada pesan. Silakan hubungi admin jika ada kendala.' : 'Tidak ada pesan pada pesanan ini.'}
            </p>
          ) : (
            messages.map(msg => {
              const isUser = msg.sender === 'user';
              return (
                <div key={msg.id} className={`flex ${isUser ? 'justify-end' : 'justify-start'}`}>
                  <div className={`max-w-[75%] px-4 py-2 rounded-2xl text-sm ${isUser ? 'bg-primary text-white rounded-br-none' : 'bg-stone-200 dark:bg-stone-800 text-stone-700 dark:text-stone-200 rounded-bl-none'}`}>
                    <p>{msg.content}</p>
                    <p className={`text-[9px] mt-1 text-right ${isUser ? 'text-white/50' : 'text-stone-400'}`}>
                      {new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </p>
                  </div>
                </div>
              );
            })
          )}
          <div ref={chatEndRef} />
        </div>

        {isChatActive ? (
          <form onSubmit={handleSendChat} className="p-3 border-t border-stone-200 dark:border-stone-800 bg-white dark:bg-stone-900 flex gap-2">
            <input
              type="text"
              placeholder="Ketik pesan..."
              value={chatMessage}
              onChange={e => setChatMessage(e.target.value)}
              className="flex-1 bg-stone-100 dark:bg-stone-800 border border-stone-200 dark:border-stone-700 rounded-full px-4 py-2 focus:outline-none focus:border-primary text-sm font-body text-stone-700 dark:text-stone-200"
            />
            <button type="submit" disabled={!chatMessage.trim()} className="bg-primary text-white w-10 h-10 rounded-full flex items-center justify-center hover:scale-105 active:scale-95 disabled:opacity-50 transition-transform">
              <span className="material-symbols-outlined text-[18px]">send</span>
            </button>
          </form>
        ) : (
          <div className="p-3 border-t border-stone-200 dark:border-stone-800 bg-stone-100 dark:bg-stone-800 text-center">
            <p className="text-xs text-stone-500 font-label font-bold uppercase">Chat telah berakhir — pesanan {order.status === 'COMPLETED' ? 'selesai' : 'gagal'}</p>
          </div>
        )}
      </div>
    </div>
  );
}

// ===============================================================
// MAIN PAGE
// ===============================================================
export default function OrderStatusPage() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const isLoggedIn = !!localStorage.getItem('token');

  const [activeTab, setActiveTab] = useState('ALL');
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [lookupId, setLookupId] = useState(searchParams.get('id') || '');
  const [lookupResult, setLookupResult] = useState(null);
  const [lookupLoading, setLookupLoading] = useState(false);
  const [lookupError, setLookupError] = useState('');

  // Fetch user order history (only if logged in)
  const { data: myOrders = [], isLoading: historyLoading } = useSWR(
    isLoggedIn ? '/orders/history/me' : null,
    apiFetcher,
    { refreshInterval: 10000 }
  );

  // Auto-lookup from URL param
  useEffect(() => {
    const idParam = searchParams.get('id');
    if (idParam) {
      handleLookup(idParam);
    }
  }, []);

  const handleLookup = async (id) => {
    const target = id || lookupId;
    if (!target.trim()) return;
    setLookupLoading(true);
    setLookupError('');
    try {
      const res = await apiFetch(`/orders/${target}`);
      setLookupResult(res.data);
      setSelectedOrder(res.data);
    } catch (err) {
      setLookupError(err.message || 'Order tidak ditemukan');
      setLookupResult(null);
    } finally {
      setLookupLoading(false);
    }
  };

  // Filter orders by active tab
  const filteredOrders = activeTab === 'ALL'
    ? myOrders
    : myOrders.filter(o => o.status === activeTab);

  // Count per status (for badges on tabs)
  const countByStatus = (status) => myOrders.filter(o => o.status === status).length;

  return (
    <main className="pt-4 pb-32 px-4 lg:px-8 max-w-7xl mx-auto min-h-screen">
      <Helmet>
        <title>Pesanan Saya — Fazsee Store</title>
        <meta name="description" content="Pantau status pesanan, riwayat transaksi, dan chat langsung dengan admin Fazsee Store." />
      </Helmet>

      {/* If viewing detail */}
      {selectedOrder ? (
        <OrderDetail order={selectedOrder} onBack={() => setSelectedOrder(null)} navigate={navigate} />
      ) : (
        <>
          {/* Page Title */}
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 bg-primary/10 dark:bg-primary/20 rounded-xl flex items-center justify-center">
              <span className="material-symbols-outlined text-primary text-xl" style={{ fontVariationSettings: "'FILL' 1" }}>receipt_long</span>
            </div>
            <div>
              <h1 className="font-headline font-black text-2xl text-on-surface dark:text-stone-100 uppercase tracking-tight">Pesanan Saya</h1>
              <p className="text-[11px] text-stone-500 font-label">Lacak status dan riwayat transaksi</p>
            </div>
          </div>

          {/* Invoice Lookup (for guest or quick search) */}
          <section className="mb-6">
            <div className="flex gap-2">
              <div className="relative flex-1 group">
                <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-stone-400 group-focus-within:text-primary transition-colors text-lg">tag</span>
                <input
                  value={lookupId}
                  onChange={e => setLookupId(e.target.value)}
                  onKeyDown={e => e.key === 'Enter' && handleLookup()}
                  className="w-full pl-10 pr-4 py-3 bg-white dark:bg-stone-900 border-2 border-stone-200 dark:border-stone-800 rounded-xl focus:border-primary focus:ring-2 focus:ring-primary/20 font-headline text-sm transition-all outline-none text-on-surface dark:text-stone-100 placeholder:text-stone-400"
                  placeholder="Cari Invoice (GV-XXXX)"
                  type="text"
                />
              </div>
              <button onClick={() => handleLookup()} disabled={lookupLoading} className="bg-primary text-white px-5 py-3 rounded-xl font-headline font-black text-sm uppercase hover:scale-105 active:scale-95 transition-all disabled:opacity-50 shadow-lg shadow-primary/20">
                {lookupLoading ? <span className="material-symbols-outlined animate-spin text-lg">sync</span> : <span className="material-symbols-outlined text-lg">search</span>}
              </button>
            </div>
            {lookupError && <p className="text-red-500 font-bold mt-2 text-center text-xs">{lookupError}</p>}
          </section>

          {/* Tabs (Shopee style) */}
          {isLoggedIn && (
            <>
              <div className="flex gap-1 overflow-x-auto pb-1 mb-6 scrollbar-none -mx-4 px-4">
                {STATUS_TABS.map(tab => {
                  const count = tab.key === 'ALL' ? myOrders.length : countByStatus(tab.key);
                  const isActive = activeTab === tab.key;
                  return (
                    <button
                      key={tab.key}
                      onClick={() => setActiveTab(tab.key)}
                      className={`shrink-0 flex items-center gap-1.5 px-4 py-2.5 rounded-full font-label text-[11px] font-bold uppercase tracking-tight transition-all ${
                        isActive
                          ? 'bg-primary text-white shadow-md shadow-primary/20'
                          : 'bg-stone-100 dark:bg-stone-800 text-stone-500 dark:text-stone-400 hover:bg-stone-200 dark:hover:bg-stone-700'
                      }`}
                    >
                      <span className="material-symbols-outlined text-[16px]" style={isActive ? { fontVariationSettings: "'FILL' 1" } : {}}>{tab.icon}</span>
                      {tab.label}
                      {count > 0 && (
                        <span className={`ml-0.5 min-w-[18px] h-[18px] flex items-center justify-center rounded-full text-[9px] font-black ${
                          isActive ? 'bg-white/25 text-white' : 'bg-stone-300 dark:bg-stone-600 text-stone-600 dark:text-stone-300'
                        }`}>{count}</span>
                      )}
                    </button>
                  );
                })}
              </div>

              {/* Order List */}
              {historyLoading ? (
                <div className="flex flex-col items-center justify-center py-16 gap-3">
                  <span className="material-symbols-outlined animate-spin text-4xl text-primary">sync</span>
                  <p className="text-xs text-stone-500 font-label font-bold uppercase">Memuat pesanan...</p>
                </div>
              ) : filteredOrders.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-16 gap-3">
                  <span className="material-symbols-outlined text-5xl text-stone-300 dark:text-stone-700">inbox</span>
                  <p className="text-stone-500 font-label font-bold text-sm">
                    {activeTab === 'ALL' ? 'Belum ada pesanan' : `Tidak ada pesanan ${STATUS_TABS.find(t => t.key === activeTab)?.label}`}
                  </p>
                  <button onClick={() => navigate('/catalog')} className="mt-2 bg-primary text-white px-6 py-2.5 rounded-xl font-label font-bold text-xs uppercase hover:scale-105 active:scale-95 transition-all shadow-md">
                    <span className="material-symbols-outlined text-sm align-middle mr-1">storefront</span> Belanja Sekarang
                  </button>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {filteredOrders.map(order => (
                    <OrderCard
                      key={order.id}
                      order={order}
                      onSelect={setSelectedOrder}
                      isSelected={false}
                      navigate={navigate}
                    />
                  ))}
                </div>
              )}
            </>
          )}

          {/* Not logged in prompt */}
          {!isLoggedIn && (
            <div className="flex flex-col items-center justify-center py-16 gap-4 bg-white dark:bg-stone-900 rounded-2xl border border-stone-200 dark:border-stone-800">
              <span className="material-symbols-outlined text-5xl text-stone-300 dark:text-stone-700">lock</span>
              <div className="text-center">
                <p className="font-headline font-bold text-base text-on-surface dark:text-stone-200">Login untuk melihat riwayat</p>
                <p className="text-xs text-stone-500 mt-1">Atau gunakan pencarian invoice di atas</p>
              </div>
              <button onClick={() => navigate('/login')} className="bg-primary text-white px-8 py-3 rounded-xl font-headline font-bold uppercase text-sm hover:scale-105 active:scale-95 transition-all shadow-lg shadow-primary/20">
                Login
              </button>
            </div>
          )}
        </>
      )}
    </main>
  );
}
