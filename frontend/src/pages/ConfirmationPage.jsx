import { useSearchParams } from 'react-router-dom';
import { useState } from 'react';
import { useToast } from '../components/ToastProvider';

export default function ConfirmationPage() {
  const [searchParams] = useSearchParams();
  const toast = useToast();
  const orderId = searchParams.get('orderId') || '';
  const [orderNumber, setOrderNumber] = useState(orderId);
  const [fullName, setFullName] = useState('');
  const [file, setFile] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!orderNumber) {
      toast.warn('Masukkan Order Number!');
      return;
    }
    if (!file) {
      toast.warn('Upload bukti pembayaran dulu!');
      return;
    }
    setSubmitting(true);
    try {
      const formData = new FormData();
      formData.append('image', file);
      formData.append('orderId', orderNumber);
      const res = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:3000/api'}/payments/upload-proof`, {
        method: 'POST',
        body: formData,
      });
      if (res.ok) {
        setSuccess(true);
        toast.success('Bukti pembayaran berhasil dikirim!');
      } else {
        const data = await res.json();
        toast.error(data.message || 'Upload gagal. Coba lagi.');
      }
    } catch (err) {
      toast.error('Koneksi gagal. Pastikan internet stabil.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <main className="flex-grow container mx-auto px-4 pt-4 pb-32 max-w-4xl">
      <section className="relative mb-8 text-center">
        <div className="absolute -top-12 -left-4 w-32 h-32 bg-tertiary-container dark:bg-purple-900/30 rounded-full opacity-20 blur-3xl"></div>
        <div className="absolute -bottom-8 -right-4 w-40 h-40 bg-primary-container dark:bg-sky-900/30 rounded-full opacity-20 blur-3xl"></div>
        <h2 className="font-headline text-3xl sm:text-5xl md:text-7xl font-black text-on-background dark:text-stone-100 mb-4 tracking-tighter uppercase italic leading-tight">
          {success ? 'Quest Complete!' : 'Final Step!'}
        </h2>
        <div className={`${success ? 'bg-primary-container dark:bg-primary/20 text-on-primary-container dark:text-sky-300' : 'bg-secondary-container dark:bg-orange-900/40 text-on-secondary-container dark:text-orange-300'} inline-block px-6 py-2 rounded-full font-label text-sm font-bold uppercase tracking-widest mb-4 border border-stone-200 dark:border-stone-700/50`}>
          {success ? 'Payment Proof Submitted ✓' : 'Verify Your Quest Payment'}
        </div>
      </section>

      {!success ? (
        <div className="grid grid-cols-1 md:grid-cols-12 gap-8 items-start">
          <div className="md:col-span-7 space-y-8">
            <div className="bg-surface-container-low dark:bg-stone-900 p-8 rounded-lg border-2 border-outline-variant/10 dark:border-stone-800">
              <form className="space-y-6" onSubmit={handleSubmit}>
                <div className="space-y-2">
                  <label className="font-label text-xs font-black uppercase text-on-surface-variant dark:text-stone-400 ml-2">Order Number</label>
                  <div className="relative group">
                    <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-outline dark:text-stone-500 group-focus-within:text-primary transition-colors">tag</span>
                    <input value={orderNumber} onChange={e => setOrderNumber(e.target.value)} className="w-full pl-12 pr-4 py-4 bg-surface-container-lowest dark:bg-stone-800 dark:text-stone-200 border-2 border-outline-variant/20 dark:border-stone-700 rounded-md focus:border-primary focus:ring-0 font-headline text-xl transition-all outline-none" placeholder="QS-XXXXX" type="text" />
                  </div>
                </div>
                <div className="space-y-2">
                  <label className="font-label text-xs font-black uppercase text-on-surface-variant dark:text-stone-400 ml-2">Full Name</label>
                  <div className="relative group">
                    <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-outline dark:text-stone-500 group-focus-within:text-primary transition-colors">person</span>
                    <input value={fullName} onChange={e => setFullName(e.target.value)} className="w-full pl-12 pr-4 py-4 bg-surface-container-lowest dark:bg-stone-800 dark:text-stone-200 border-2 border-outline-variant/20 dark:border-stone-700 rounded-md focus:border-primary focus:ring-0 font-headline text-xl transition-all outline-none" placeholder="Nama Lengkap" type="text" />
                  </div>
                </div>
                <div className="space-y-2">
                  <label className="font-label text-xs font-black uppercase text-on-surface-variant dark:text-stone-400 ml-2">Proof of Payment</label>
                  <div className="bg-stone-50 dark:bg-stone-800/50 border-2 border-dashed border-stone-300 dark:border-stone-600 p-10 flex flex-col items-center justify-center gap-4 cursor-pointer hover:bg-stone-100 dark:hover:bg-stone-800 transition-all rounded-lg group" onClick={() => document.getElementById('proof-input').click()}>
                    <div className="w-16 h-16 bg-primary/10 dark:bg-sky-500/20 rounded-full flex items-center justify-center text-primary group-hover:scale-110 transition-transform">
                      <span className="material-symbols-outlined text-4xl" style={{ fontVariationSettings: "'FILL' 1" }}>cloud_upload</span>
                    </div>
                    <div className="text-center text-on-surface dark:text-stone-200">
                      <p className="font-headline text-lg font-bold">{file ? file.name : 'Summon Receipt'}</p>
                      <p className="text-sm text-stone-500 dark:text-stone-400">PNG, JPG, or PDF (Max 5MB)</p>
                    </div>
                    <input id="proof-input" className="hidden" type="file" accept="image/*,.pdf" onChange={e => setFile(e.target.files[0])} />
                  </div>
                </div>
                <button disabled={submitting} className="w-full bg-gradient-to-r from-primary to-sky-500 text-white py-6 rounded-xl font-headline text-2xl font-black uppercase italic tracking-widest shadow-lg shadow-sky-500/30 border-b-4 border-sky-600 hover:border-sky-700 hover:translate-y-[2px] active:translate-y-1 active:border-b-0 transition-all mt-4 flex items-center justify-center gap-3 disabled:opacity-50" type="submit">
                  {submitting ? <span className="material-symbols-outlined animate-spin">sync</span> : <>Kirim Konfirmasi <span className="material-symbols-outlined font-black">send</span></>}
                </button>
              </form>
            </div>
          </div>

          <div className="md:col-span-5 space-y-6">
            <div className="bg-tertiary-container dark:bg-purple-900/20 text-on-tertiary-container dark:text-purple-300 p-8 rounded-lg relative overflow-hidden border border-purple-200/50 dark:border-purple-800/50">
              <div className="absolute -right-4 -top-4 opacity-10">
                <span className="material-symbols-outlined text-9xl">receipt_long</span>
              </div>
              <h3 className="font-headline text-2xl font-black mb-4 uppercase">Quest Rules</h3>
              <ul className="space-y-4 font-body text-sm font-medium">
                {['Pastikan Order Number sesuai dengan transaksi.', 'Bukti harus mencantumkan Nominal dan Tanggal.', 'Verifikasi biasanya memakan waktu 1-2 jam.'].map((rule, i) => (
                  <li key={i} className="flex gap-3">
                    <span className="material-symbols-outlined text-primary-dim dark:text-sky-400">check_circle</span>
                    {rule}
                  </li>
                ))}
              </ul>
            </div>
            <div className="bg-surface-container-highest dark:bg-stone-800 p-6 rounded-full flex items-center gap-4 border border-stone-200 dark:border-stone-700">
              <div className="w-12 h-12 bg-on-background dark:bg-sky-500 rounded-full flex items-center justify-center text-background dark:text-white">
                <span className="material-symbols-outlined">help</span>
              </div>
              <div>
                <p className="font-label text-xs font-black uppercase text-on-surface-variant dark:text-stone-400">Butuh bantuan?</p>
                <a href="https://wa.me/6283126165997" target="_blank" rel="noopener noreferrer" className="font-body text-sm font-bold text-primary dark:text-sky-400 hover:underline">Chat via WhatsApp</a>
              </div>
            </div>
          </div>
        </div>
      ) : (
        <div className="text-center py-12">
          <span className="material-symbols-outlined text-8xl text-primary dark:text-sky-400 mb-6 block" style={{ fontVariationSettings: "'FILL' 1" }}>check_circle</span>
          <p className="font-headline text-2xl font-black mb-4 dark:text-stone-100">Bukti pembayaran telah dikirim!</p>
          <p className="text-on-surface-variant dark:text-stone-400 mb-8">Admin akan memverifikasi dalam 1-2 jam. Kamu bisa cek status order-mu kapan saja.</p>
          <a href={`/orders?id=${orderNumber}`} className="bg-primary text-white dark:text-white px-8 py-4 rounded-lg font-headline font-black uppercase inline-flex items-center gap-2 hover:scale-105 transition-transform shadow-lg shadow-primary/30">
            Cek Status Order <span className="material-symbols-outlined">arrow_forward</span>
          </a>
        </div>
      )}
    </main>
  );
}
