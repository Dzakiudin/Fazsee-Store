import { useSearchParams, Link } from 'react-router-dom';
import { useState, useEffect } from 'react';
import { Helmet } from 'react-helmet-async';
import useSWR from 'swr';
import { apiFetcher } from '../services/apiService';
import { formatRupiah } from '../utils/formatters';
import { useToast } from '../components/ToastProvider';

export default function PaymentPage() {
  const [searchParams] = useSearchParams();
  const toast = useToast();
  const orderId = searchParams.get('orderId') || '';

  // Fetch real order data
  const { data: order, isLoading, error } = useSWR(
    orderId ? `/orders/${orderId}` : null,
    apiFetcher
  );

  // Fetch store settings (QRIS, bank accounts)
  const { data: settings } = useSWR('/settings', apiFetcher);

  // Parse bank accounts from settings
  const bankAccounts = (() => {
    if (!settings?.bankAccounts) return [];
    try {
      const parsed = JSON.parse(settings.bankAccounts);
      return Array.isArray(parsed) ? parsed : [];
    } catch { return []; }
  })();

  const qrisImage = settings?.qrisImageUrl || '/qris.png';

  // Provider icon/color mapping
  const providerStyles = {
    DANA: { icon: 'account_balance', iconBg: 'bg-sky-100 dark:bg-sky-900/40', iconColor: 'text-sky-600 dark:text-sky-400', textColor: 'text-sky-600 dark:text-sky-400' },
    OVO: { icon: 'payments', iconBg: 'bg-purple-100 dark:bg-purple-900/40', iconColor: 'text-purple-600 dark:text-purple-400', textColor: 'text-purple-600 dark:text-purple-400' },
    GOPAY: { icon: 'wallet', iconBg: 'bg-green-100 dark:bg-green-900/40', iconColor: 'text-green-600 dark:text-green-400', textColor: 'text-green-600 dark:text-green-400' },
    BRI: { icon: 'account_balance', iconBg: 'bg-blue-100 dark:bg-blue-900/40', iconColor: 'text-blue-600 dark:text-blue-400', textColor: 'text-blue-600 dark:text-blue-400' },
    BCA: { icon: 'account_balance', iconBg: 'bg-indigo-100 dark:bg-indigo-900/40', iconColor: 'text-indigo-600 dark:text-indigo-400', textColor: 'text-indigo-600 dark:text-indigo-400' },
    DEFAULT: { icon: 'account_balance_wallet', iconBg: 'bg-amber-100 dark:bg-amber-900/40', iconColor: 'text-amber-600 dark:text-amber-400', textColor: 'text-amber-600 dark:text-amber-400' },
  };

  // Countdown timer (15 min default)
  const [timeLeft, setTimeLeft] = useState(15 * 60);
  useEffect(() => {
    if (timeLeft <= 0) return;
    const timer = setInterval(() => setTimeLeft(t => t - 1), 1000);
    return () => clearInterval(timer);
  }, [timeLeft]);

  const minutes = Math.floor(timeLeft / 60);
  const seconds = timeLeft % 60;

  const handleCopy = (text) => {
    navigator.clipboard.writeText(text);
    toast.success('Nomor disalin!');
  };

  const totalPrice = order?.totalPrice || 0;
  const itemSummary = order?.items?.map(i => `${i.quantity}x ${i.product?.name}`).join(', ') || 'Item';

  if (isLoading) return (
    <main className="min-h-screen flex items-center justify-center">
      <div className="flex flex-col items-center gap-4">
        <span className="material-symbols-outlined animate-spin text-5xl text-primary">sync</span>
        <p className="text-sm text-stone-500 font-label font-bold uppercase tracking-widest">Memuat data pembayaran...</p>
      </div>
    </main>
  );

  if (error || (!order && orderId)) return (
    <main className="min-h-screen flex flex-col items-center justify-center gap-4 px-6">
      <span className="material-symbols-outlined text-6xl text-red-400">error</span>
      <p className="font-headline font-bold text-lg text-on-surface dark:text-stone-200">Order tidak ditemukan</p>
      <p className="text-sm text-stone-500">Pastikan Order ID kamu benar.</p>
      <Link to="/orders" className="bg-primary text-white px-6 py-3 rounded-xl font-headline font-bold text-sm uppercase hover:scale-105 active:scale-95 transition-all">
        Kembali ke Pesanan
      </Link>
    </main>
  );

  return (
    <main className="mt-2 px-4 md:px-8 max-w-5xl mx-auto space-y-5 pb-32">
      <Helmet>
        <title>Pembayaran #{orderId} — Fazsee Store</title>
        <meta name="description" content="Selesaikan pembayaran pesananmu di Fazsee Store. Scan QRIS atau transfer manual." />
        <meta name="robots" content="noindex" />
      </Helmet>
      {/* Hero Header */}
      <section className="pt-2 text-center">
        <h2 className="text-2xl sm:text-4xl font-headline font-black text-on-background dark:text-stone-100 leading-tight tracking-tight">Complete Your <span className="text-primary dark:text-sky-400 italic">Quest!</span></h2>
        <p className="text-on-surface-variant dark:text-stone-400 font-label mt-2 font-medium">Scan QRIS atau transfer ke rekening di bawah</p>
      </section>

      {/* Order Summary Mini */}
      <div className="bg-primary/5 dark:bg-primary/10 border border-primary/20 dark:border-primary/30 rounded-xl p-4 flex items-center justify-between gap-3">
        <div className="min-w-0 flex-1">
          <p className="font-label text-[10px] font-bold uppercase tracking-widest text-primary dark:text-sky-400">Order #{orderId}</p>
          <p className="text-sm font-bold text-on-surface dark:text-stone-200 truncate">{itemSummary}</p>
        </div>
        <div className="shrink-0 text-right">
          <p className="font-headline text-xl font-black text-on-surface dark:text-stone-100">Rp {formatRupiah(totalPrice)}</p>
        </div>
      </div>

      {/* Dynamic Payment Display based on Selection */}
      {(order?.paymentMethod === 'QRIS' || !order?.paymentMethod) && (
        <section className="mt-8 relative group">
          <div className="bg-surface-container-lowest dark:bg-stone-900 p-5 sm:p-8 rounded-xl comic-panel-shadow border-2 border-outline-variant/20 dark:border-stone-800 flex flex-col items-center">
            <div className="absolute -top-4 left-6 bg-primary-container dark:bg-primary/20 text-on-primary-container dark:text-sky-300 px-6 py-1 rounded-full font-label text-sm font-bold uppercase tracking-wider z-10 shadow-sm border border-primary/20">QRIS Payment</div>
            <div className="relative bg-white p-4 rounded-lg border-4 border-primary/10 dark:border-stone-700 mb-6">
              <img
                alt="QRIS Payment Code"
                loading="lazy"
                className="w-48 h-48 md:w-64 md:h-64 rounded-md object-contain"
                src={qrisImage}
                onError={(e) => { e.target.src = 'https://api.qrserver.com/v1/create-qr-code/?size=256x256&data=FAZSEE-STORE-PAYMENT'; }}
              />
              <div className="absolute -bottom-2 -right-2 bg-secondary dark:bg-orange-600 text-on-secondary dark:text-white px-3 py-1 rounded-md font-black text-xs italic shadow-md">SCAN ME!</div>
            </div>
            <div className="text-center space-y-2">
              <div className="font-headline text-3xl font-black text-on-background dark:text-stone-100">Rp {formatRupiah(totalPrice)}</div>
              <div className="font-label text-xs font-bold text-on-surface-variant dark:text-stone-300 bg-surface-container dark:bg-stone-800 px-4 py-1 rounded-full inline-block border border-stone-200 dark:border-stone-700">Order ID: #{orderId}</div>
            </div>
          </div>
        </section>
      )}

      {/* Instruction Steps */}
      <section className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-6">
        {[
          { step: 1, text: 'Buka aplikasi e-wallet atau m-banking favoritmu' },
          { step: 2, text: order?.paymentMethod === 'QRIS' ? 'Scan kode QR di atas' : 'Transfer sesuai nominal' },
          { step: 3, text: 'Kirim bukti bayar & tunggu konfirmasi admin' },
        ].map(s => (
          <div key={s.step} className="bg-surface-container-low dark:bg-stone-800/50 p-6 rounded-lg flex items-center gap-4 border border-outline-variant/10 dark:border-stone-700/50">
            <div className="w-10 h-10 bg-tertiary-container dark:bg-purple-900/30 text-on-tertiary-container dark:text-purple-300 rounded-full flex items-center justify-center font-black text-lg shrink-0">{s.step}</div>
            <p className="font-body text-sm font-semibold text-on-surface dark:text-stone-300">{s.text}</p>
          </div>
        ))}
      </section>

      {/* Transfer Options (dynamic from settings) */}
      {(order?.paymentMethod === 'E-WALLET' || order?.paymentMethod === 'BANK') && bankAccounts.length > 0 && (
        <section className="space-y-4 mt-8">
          <h3 className="font-headline text-xl font-extrabold uppercase tracking-tight text-on-background dark:text-stone-100 px-2 flex items-center gap-2">
            <span className="material-symbols-outlined text-secondary dark:text-orange-400">account_balance_wallet</span> 
            {order?.paymentMethod === 'E-WALLET' ? 'Pilih E-Wallet' : 'Pilih Rekening Bank'}
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {bankAccounts.map((acc, i) => {
              const style = providerStyles[acc.provider?.toUpperCase()] || providerStyles.DEFAULT;
              return (
                <div key={i} className="bg-surface-container-lowest dark:bg-stone-900 p-5 rounded-lg border-2 border-outline-variant/10 dark:border-stone-800 hover:border-primary/30 dark:hover:border-sky-500/30 transition-all group">
                  <div className="flex justify-between items-start mb-4">
                    <div className={`w-12 h-12 ${style.iconBg} rounded-full flex items-center justify-center`}>
                      <span className={`material-symbols-outlined ${style.iconColor} font-bold`}>{style.icon}</span>
                    </div>
                    <div className="text-right">
                      <span className="font-label text-[10px] font-black uppercase text-on-surface-variant dark:text-stone-500 block">Provider</span>
                      <span className={`font-headline font-black ${style.textColor} italic`}>{acc.provider}</span>
                    </div>
                  </div>
                  <div className="space-y-1">
                    <span className="font-label text-xs text-on-surface-variant dark:text-stone-400">
                      {acc.holderName ? `${acc.holderName} — Nomor Akun` : 'Nomor Akun'}
                    </span>
                    <div className="flex justify-between items-center bg-surface-container dark:bg-stone-800 px-3 py-2 rounded-md border border-stone-200 dark:border-stone-700/50">
                      <span className="font-headline font-bold text-on-background dark:text-stone-200 tracking-widest">{acc.number}</span>
                      <button onClick={() => handleCopy(acc.number)} className="text-primary dark:text-sky-400 hover:bg-primary-container dark:hover:bg-primary/20 p-1 rounded transition-colors active:scale-90">
                        <span className="material-symbols-outlined text-sm">content_copy</span>
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </section>
      )}

      {/* Final Confirmation */}
      <section className="pb-10 pt-4 flex flex-col items-center gap-6">
        <div className={`flex items-center gap-2 font-label text-sm font-bold px-6 py-2 rounded-full border ${
          timeLeft > 0
            ? 'text-secondary-dim dark:text-orange-400 bg-secondary-container/20 dark:bg-orange-900/20 border-secondary/10 dark:border-orange-500/20'
            : 'text-red-500 bg-red-100 dark:bg-red-900/20 border-red-300 dark:border-red-500/20'
        }`}>
          <span className="material-symbols-outlined text-base">timer</span>
          {timeLeft > 0 ? `Batas waktu: ${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}` : 'Waktu habis!'}
        </div>
        <Link to={`/confirmation?orderId=${orderId}`} className="w-full max-w-sm bg-gradient-to-r from-emerald-500 to-green-500 text-white font-headline text-xl font-black py-5 rounded-xl shadow-lg border-b-4 border-green-600 hover:border-green-700 hover:translate-y-[2px] active:translate-y-1 transition-all duration-150 uppercase tracking-widest flex items-center justify-center gap-3 group">
          Sudah Bayar <span className="material-symbols-outlined group-hover:translate-x-1 transition-transform">check_circle</span>
        </Link>
      </section>
    </main>
  );
}
