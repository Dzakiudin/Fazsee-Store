import { useState, useEffect } from 'react';
import { formatRupiah } from '../../utils/formatters';
import AdminChatModal from './AdminChatModal';

const API = import.meta.env.VITE_API_URL || 'http://localhost:3000/api';

function generateWaMessage(order, status) {
  const items = order.items?.map(i => `${i.quantity}x ${i.product?.name}`).join(', ') || 'Item';
  const total = `Rp ${formatRupiah(order.totalPrice)}`;

  switch (status) {
    case 'PROCESSING':
      return `✅ Halo! Pembayaranmu untuk pesanan *#${order.id}* telah kami terima.\n\n📦 Item: ${items}\n💰 Total: ${total}\n\n⏳ Pesananmu sedang kami proses. Mohon tunggu ya!`;
    case 'COMPLETED':
      return `🎉 Selamat! Pesanan *#${order.id}* telah selesai!\n\n📦 Item: ${items}\n💰 Total: ${total}\n\n✨ Item sudah dikirim ke akunmu. Selamat menikmati! Terima kasih telah berbelanja di Fazsee Store 🙏`;
    case 'FAILED':
      return `❌ Maaf, pesanan *#${order.id}* dibatalkan.\n\n📦 Item: ${items}\n💰 Total: ${total}\n\nSilakan hubungi admin jika ada pertanyaan.`;
    default:
      return `📋 Update pesanan *#${order.id}*\nStatus: ${status}\nItem: ${items}\nTotal: ${total}`;
  }
}

export default function OrdersTab({ orders, verifyOrder }) {
  const [chatOrder, setChatOrder] = useState(null);
  const [waSettings, setWaSettings] = useState(null);

  useEffect(() => {
    // Fetch store settings for WA notify
    const token = localStorage.getItem('token');
    fetch(`${API}/settings`, { headers: { Authorization: `Bearer ${token}` } })
      .then(r => r.json())
      .then(res => { if (res.data) setWaSettings(res.data); })
      .catch(() => {});
  }, []);

  const badgeStyle = {
    'PENDING': 'bg-stone-200 text-stone-600 dark:bg-stone-800 dark:text-stone-300',
    'PROCESSING': 'bg-secondary-container text-on-secondary-container',
    'PAID': 'bg-primary/20 text-primary-dim',
    'COMPLETED': 'bg-tertiary-container text-on-tertiary-container',
    'FAILED': 'bg-error-container text-on-error-container'
  };

  const openWhatsApp = (order, status) => {
    const phone = order.whatsapp ? `62${order.whatsapp.replace(/^0/, '')}` : null;
    if (!phone) return;
    const msg = encodeURIComponent(generateWaMessage(order, status));
    window.open(`https://wa.me/${phone}?text=${msg}`, '_blank');
  };

  const handleVerifyWithWa = async (order, nextStatus) => {
    await verifyOrder(order.id, nextStatus);

    // Auto-open WhatsApp if enabled and user has WA number
    if (waSettings?.waNotifyOnOrder && order.whatsapp) {
      setTimeout(() => openWhatsApp(order, nextStatus), 500);
    }
  };

  if (orders.length === 0) {
    return <p className="text-center text-stone-500 py-10">Tidak ada order.</p>;
  }

  return (
    <div className="space-y-4">
      {orders.map(order => {
        let accountInfo = null;
        try { accountInfo = order.accountData ? JSON.parse(order.accountData) : null; } catch {}
        return (
          <div key={order.id} className="bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 rounded-xl p-5 flex flex-col lg:flex-row items-start lg:items-center gap-4 shadow-sm">
            <div className="flex-1 min-w-0 space-y-1">
              <div className="flex items-center gap-2 flex-wrap">
                <span className={`text-[10px] font-label font-extrabold px-3 py-1 rounded-full ${badgeStyle[order.status] || badgeStyle['PENDING']}`}>{order.status}</span>
                <span className="text-on-surface-variant text-[10px] font-bold uppercase tracking-tighter">#{order.id}</span>
              </div>
              <p className="text-xs text-stone-500 dark:text-stone-400">
                {order.items?.map(item => `${item.quantity}x ${item.product?.name}`).join(', ') || 'Unknown'}
              </p>
              {accountInfo && (
                <p className="text-[11px] text-sky-600 dark:text-sky-400 font-medium">
                  Akun: {Object.entries(accountInfo).map(([k,v]) => `${k}: ${v}`).join(' • ')}
                </p>
              )}
              {order.whatsapp && (
                <p className="text-[11px] text-green-600 dark:text-green-400 flex items-center gap-1">
                  <span className="material-symbols-outlined text-[12px]">call</span> +62{order.whatsapp}
                </p>
              )}
            </div>

            <div className="flex items-center gap-4 bg-stone-50 dark:bg-stone-800 p-3 rounded-lg border border-stone-200/50 dark:border-stone-700">
              <div className="w-10 h-14 bg-stone-100 dark:bg-stone-700 rounded border border-stone-300 dark:border-stone-600 overflow-hidden flex items-center justify-center">
                {order.payment?.qrUrl ? (
                  <a href={order.payment.qrUrl} target="_blank" rel="noreferrer">
                    <img alt="Proof" loading="lazy" decoding="async" className="w-full h-full object-cover opacity-80 hover:opacity-100" src={order.payment.qrUrl} />
                  </a>
                ) : (
                  <span className="material-symbols-outlined text-stone-300 text-xs">broken_image</span>
                )}
              </div>
              <div>
                <p className="text-sm font-headline font-black text-on-surface dark:text-stone-100">Rp {formatRupiah(order.totalPrice)}</p>
                <p className="text-[10px] text-stone-500">{order.paymentMethod || order.payment?.method || 'N/A'}</p>
              </div>
            </div>

            <div className="flex gap-2 w-full lg:w-auto flex-wrap">
              {['PROCESSING', 'PENDING', 'PAID'].includes(order.status) ? (
                <>
                  <button onClick={() => handleVerifyWithWa(order, 'COMPLETED')} className="flex-1 lg:flex-none px-4 py-2 bg-primary hover:bg-sky-600 text-white rounded-lg font-label font-bold text-[10px] uppercase flex items-center justify-center gap-1 active:translate-y-0.5 transition-all">
                    <span className="material-symbols-outlined text-sm">check_circle</span> TERIMA
                  </button>
                  <button onClick={() => handleVerifyWithWa(order, 'FAILED')} className="flex-1 lg:flex-none px-4 py-2 bg-red-500 hover:bg-red-600 text-white rounded-lg font-label font-bold text-[10px] uppercase flex items-center justify-center gap-1 active:translate-y-0.5 transition-all">
                    <span className="material-symbols-outlined text-sm">cancel</span> TOLAK
                  </button>
                </>
              ) : (
                <span className="text-stone-400 font-label font-bold text-[10px] tracking-widest px-3 py-2 bg-stone-100 dark:bg-stone-800 rounded-full flex items-center gap-1">
                  <span className="material-symbols-outlined text-sm">done_all</span> SELESAI
                </span>
              )}
              {/* WA Button */}
              {order.whatsapp && (
                <button onClick={() => openWhatsApp(order, order.status)} className="flex-1 lg:flex-none px-4 py-2 bg-green-500 hover:bg-green-600 text-white rounded-lg font-label font-bold text-[10px] uppercase flex items-center justify-center gap-1 active:translate-y-0.5 transition-all">
                  <span className="material-symbols-outlined text-sm">chat</span> WA
                </button>
              )}
              {/* Chat Button */}
              <button onClick={() => setChatOrder(order)} className="flex-1 lg:flex-none px-4 py-2 bg-sky-500 hover:bg-sky-600 text-white rounded-lg font-label font-bold text-[10px] uppercase flex items-center justify-center gap-1 active:translate-y-0.5 transition-all">
                <span className="material-symbols-outlined text-sm">forum</span> CHAT
              </button>
            </div>
          </div>
        );
      })}

      {chatOrder && (
        <AdminChatModal orderId={chatOrder.id} orderStatus={chatOrder.status} onClose={() => setChatOrder(null)} />
      )}
    </div>
  );
}
