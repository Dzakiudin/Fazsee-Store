import { useState, useEffect } from 'react';

const API = import.meta.env.VITE_API_URL || 'http://localhost:3000/api';

export default function SettingsTab({ token }) {
  const [settings, setSettings] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [toast, setToast] = useState('');

  // Form state
  const [storeName, setStoreName] = useState('');
  const [waNumber, setWaNumber] = useState('');
  const [waNotify, setWaNotify] = useState(true);
  const [qrisPreview, setQrisPreview] = useState('');
  const [qrisFile, setQrisFile] = useState(null);
  const [accounts, setAccounts] = useState([
    { provider: 'DANA', number: '', holderName: '' },
    { provider: 'OVO', number: '', holderName: '' },
  ]);

  useEffect(() => {
    fetchSettings();
  }, []);

  const fetchSettings = async () => {
    try {
      const res = await fetch(`${API}/settings`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const result = await res.json();
      if (res.ok && result.data) {
        const s = result.data;
        setSettings(s);
        setStoreName(s.storeName || '');
        setWaNumber(s.waNumber || '');
        setWaNotify(s.waNotifyOnOrder ?? true);
        setQrisPreview(s.qrisImageUrl || '');
        if (s.bankAccounts) {
          try {
            const parsed = JSON.parse(s.bankAccounts);
            if (Array.isArray(parsed) && parsed.length > 0) setAccounts(parsed);
          } catch {}
        }
      }
    } catch {} finally {
      setLoading(false);
    }
  };

  const handleQrisSelect = (e) => {
    const file = e.target.files[0];
    if (file) {
      setQrisFile(file);
      setQrisPreview(URL.createObjectURL(file));
    }
  };

  const updateAccount = (idx, field, value) => {
    setAccounts(prev => prev.map((a, i) => i === idx ? { ...a, [field]: value } : a));
  };

  const addAccount = () => {
    setAccounts(prev => [...prev, { provider: '', number: '', holderName: '' }]);
  };

  const removeAccount = (idx) => {
    setAccounts(prev => prev.filter((_, i) => i !== idx));
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      const fd = new FormData();
      fd.append('storeName', storeName);
      fd.append('waNumber', waNumber);
      fd.append('waNotifyOnOrder', String(waNotify));
      fd.append('bankAccounts', JSON.stringify(accounts.filter(a => a.provider && a.number)));
      if (qrisFile) fd.append('qrisImage', qrisFile);

      const res = await fetch(`${API}/settings`, {
        method: 'PATCH',
        headers: { Authorization: `Bearer ${token}` },
        body: fd,
      });
      if (res.ok) {
        setToast('Pengaturan berhasil disimpan!');
        setQrisFile(null);
        fetchSettings();
      } else {
        setToast('Gagal menyimpan pengaturan');
      }
    } catch {
      setToast('Koneksi gagal');
    } finally {
      setSaving(false);
      setTimeout(() => setToast(''), 3000);
    }
  };

  if (loading) return (
    <div className="flex justify-center py-16">
      <span className="material-symbols-outlined animate-spin text-4xl text-primary">sync</span>
    </div>
  );

  return (
    <div className="space-y-8 w-full">
      {/* Toast */}
      {toast && (
        <div className="fixed top-4 right-4 bg-primary text-white px-6 py-3 rounded-xl font-label font-bold text-sm shadow-lg z-50 animate-slide-in">
          {toast}
        </div>
      )}

      {/* QRIS Section */}
      <section className="bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 rounded-2xl p-6 space-y-4">
        <h3 className="font-headline font-black text-lg uppercase tracking-tight text-on-surface dark:text-stone-100 flex items-center gap-2">
          <span className="material-symbols-outlined text-primary">qr_code_2</span>
          QRIS Payment
        </h3>
        <p className="text-xs text-stone-500">Upload gambar QRIS toko kamu. Gambar ini akan ditampilkan di halaman pembayaran.</p>

        <div className="flex items-start gap-6">
          <div className="w-40 h-40 bg-stone-100 dark:bg-stone-800 rounded-xl border-2 border-dashed border-stone-300 dark:border-stone-700 flex items-center justify-center overflow-hidden cursor-pointer hover:border-primary transition-colors"
            onClick={() => document.getElementById('qris-upload').click()}>
            {qrisPreview ? (
              <img src={qrisPreview} alt="QRIS" className="w-full h-full object-contain p-2" />
            ) : (
              <div className="text-center text-stone-400">
                <span className="material-symbols-outlined text-3xl">add_photo_alternate</span>
                <p className="text-[10px] mt-1 font-bold uppercase">Upload QRIS</p>
              </div>
            )}
          </div>
          <input id="qris-upload" type="file" accept="image/*" className="hidden" onChange={handleQrisSelect} />
          <div className="flex-1 space-y-2">
            <p className="text-xs text-stone-500">Format: PNG, JPG (Max 5MB)</p>
            <p className="text-xs text-stone-500">Disarankan: Gambar QRIS dari aplikasi DANA, OVO, GoPay, atau bank kamu.</p>
            {qrisFile && (
              <p className="text-xs text-emerald-500 font-bold flex items-center gap-1">
                <span className="material-symbols-outlined text-sm">check_circle</span>
                File baru dipilih: {qrisFile.name}
              </p>
            )}
          </div>
        </div>
      </section>

      {/* Bank Accounts Section */}
      <section className="bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 rounded-2xl p-6 space-y-4">
        <h3 className="font-headline font-black text-lg uppercase tracking-tight text-on-surface dark:text-stone-100 flex items-center gap-2">
          <span className="material-symbols-outlined text-secondary dark:text-orange-400">account_balance_wallet</span>
          Rekening & E-Wallet
        </h3>
        <p className="text-xs text-stone-500">Nomor rekening ini ditampilkan sebagai opsi transfer manual di halaman pembayaran.</p>

        <div className="space-y-3">
          {accounts.map((acc, i) => (
            <div key={i} className="bg-stone-50 dark:bg-stone-800/50 p-3 rounded-xl border border-stone-200/50 dark:border-stone-700/50">
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                <div className="space-y-1">
                  <label className="font-label text-[10px] font-bold uppercase text-stone-400">Provider</label>
                  <input value={acc.provider} onChange={e => updateAccount(i, 'provider', e.target.value)}
                    className="w-full bg-white dark:bg-stone-800 border border-stone-200 dark:border-stone-700 rounded-lg px-3 py-2 text-sm font-bold focus:border-primary outline-none dark:text-stone-200"
                    placeholder="DANA / OVO / BRI" />
                </div>
                <div className="space-y-1">
                  <label className="font-label text-[10px] font-bold uppercase text-stone-400">Nomor</label>
                  <input value={acc.number} onChange={e => updateAccount(i, 'number', e.target.value)}
                    className="w-full bg-white dark:bg-stone-800 border border-stone-200 dark:border-stone-700 rounded-lg px-3 py-2 text-sm font-bold focus:border-primary outline-none dark:text-stone-200"
                    placeholder="08xxxxxxxxxx" />
                </div>
                <div className="space-y-1">
                  <label className="font-label text-[10px] font-bold uppercase text-stone-400">Atas Nama</label>
                  <input value={acc.holderName || ''} onChange={e => updateAccount(i, 'holderName', e.target.value)}
                    className="w-full bg-white dark:bg-stone-800 border border-stone-200 dark:border-stone-700 rounded-lg px-3 py-2 text-sm font-bold focus:border-primary outline-none dark:text-stone-200"
                    placeholder="Nama pemilik" />
                </div>
              </div>
              <div className="flex justify-end mt-2">
                <button onClick={() => removeAccount(i)} className="text-red-400 hover:text-red-500 p-1.5 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors text-xs font-label font-bold uppercase flex items-center gap-1">
                  <span className="material-symbols-outlined text-sm">delete</span> Hapus
                </button>
              </div>
            </div>
          ))}
        </div>

        <button onClick={addAccount} className="flex items-center gap-1 text-primary font-label text-xs font-bold uppercase hover:bg-primary/10 px-4 py-2 rounded-lg transition-colors">
          <span className="material-symbols-outlined text-sm">add</span> Tambah Rekening
        </button>
      </section>

      {/* WhatsApp Notification */}
      <section className="bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 rounded-2xl p-6 space-y-4">
        <h3 className="font-headline font-black text-lg uppercase tracking-tight text-on-surface dark:text-stone-100 flex items-center gap-2">
          <span className="material-symbols-outlined text-green-500">chat</span>
          WhatsApp Notifikasi
        </h3>
        <p className="text-xs text-stone-500">Nomor WA admin yang menerima notifikasi pesanan baru dan ditampilkan di halaman kontak.</p>

        <div className="space-y-3">
          <div className="space-y-1">
            <label className="font-label text-[10px] font-bold uppercase text-stone-400">Nomor WhatsApp Admin</label>
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-stone-400 text-sm font-bold">+62</span>
              <input value={waNumber} onChange={e => setWaNumber(e.target.value)}
                className="w-full pl-12 pr-4 py-3 bg-white dark:bg-stone-800 border border-stone-200 dark:border-stone-700 rounded-xl text-sm font-bold focus:border-primary outline-none dark:text-stone-200"
                placeholder="85707091624" />
            </div>
          </div>

          <label className="flex items-center gap-3 cursor-pointer select-none bg-stone-50 dark:bg-stone-800/50 p-4 rounded-xl border border-stone-200/50 dark:border-stone-700/50 hover:bg-stone-100 dark:hover:bg-stone-800 transition-colors"
          >
            <div className={`w-12 h-7 rounded-full relative transition-colors ${waNotify ? 'bg-green-500' : 'bg-stone-300 dark:bg-stone-700'}`}
              onClick={() => setWaNotify(!waNotify)}>
              <div className={`absolute top-0.5 w-6 h-6 bg-white rounded-full shadow transition-transform ${waNotify ? 'translate-x-5' : 'translate-x-0.5'}`} />
            </div>
            <div>
              <p className="font-label text-sm font-bold text-on-surface dark:text-stone-200">Notifikasi Otomatis</p>
              <p className="text-[10px] text-stone-500">Buka WhatsApp otomatis ketika ada pesanan baru atau status berubah</p>
            </div>
          </label>
        </div>
      </section>

      {/* Store Name */}
      <section className="bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 rounded-2xl p-6 space-y-4">
        <h3 className="font-headline font-black text-lg uppercase tracking-tight text-on-surface dark:text-stone-100 flex items-center gap-2">
          <span className="material-symbols-outlined text-primary">storefront</span>
          Identitas Toko
        </h3>
        <div className="space-y-1">
          <label className="font-label text-[10px] font-bold uppercase text-stone-400">Nama Toko</label>
          <input value={storeName} onChange={e => setStoreName(e.target.value)}
            className="w-full bg-white dark:bg-stone-800 border border-stone-200 dark:border-stone-700 rounded-xl px-4 py-3 text-sm font-bold focus:border-primary outline-none dark:text-stone-200"
            placeholder="Fazsee Store" />
        </div>
      </section>

      {/* Save Button */}
      <button onClick={handleSave} disabled={saving}
        className="w-full bg-gradient-to-r from-primary to-sky-500 text-white py-4 rounded-xl font-headline font-bold text-lg uppercase flex items-center justify-center gap-2 hover:scale-[1.01] active:scale-[0.99] transition-all shadow-lg shadow-primary/30 disabled:opacity-50">
        {saving ? (
          <><span className="material-symbols-outlined animate-spin">sync</span> Menyimpan...</>
        ) : (
          <><span className="material-symbols-outlined">save</span> Simpan Pengaturan</>
        )}
      </button>
    </div>
  );
}
