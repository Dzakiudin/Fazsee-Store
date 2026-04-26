import { useState } from 'react';
import { useToast } from '../ToastProvider';

const API = import.meta.env.VITE_API_URL || 'http://localhost:3000/api';

export default function ProductModal({ product, categories, onClose, onSuccess, token }) {
  const [loading, setLoading] = useState(false);
  const toast = useToast();
  const [formData, setFormData] = useState({
    name: product?.name || '',
    categoryId: product?.categoryId || product?.category?.id || '',
    price: product?.price || '',
    description: product?.description || '',
  });
  const [imageFile, setImageFile] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.categoryId) return toast.error('Pilih kategori terlebih dahulu');
    setLoading(true);
    try {
      const data = new FormData();
      data.append('name', formData.name);
      data.append('categoryId', formData.categoryId);
      data.append('price', Number(formData.price));
      data.append('description', formData.description);
      if (imageFile) data.append('image', imageFile);

      const url = product
        ? `${API}/admin/products/${product.id}`
        : `${API}/admin/products`;
      const res = await fetch(url, {
        method: product ? 'PATCH' : 'POST',
        headers: { 'Authorization': `Bearer ${token}` },
        body: data
      });
      if (res.ok) {
        toast.success(product ? 'Produk diperbarui!' : 'Produk ditambahkan!');
        onSuccess();
      } else {
        const err = await res.json();
        toast.error(err.message || 'Gagal menyimpan produk');
      }
    } catch { toast.error('Kesalahan Jaringan'); }
    finally { setLoading(false); }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-stone-900/80 backdrop-blur-sm">
      <div className="bg-white dark:bg-stone-900 w-full max-w-lg rounded-2xl p-6 md:p-8 shadow-2xl border border-stone-200 dark:border-stone-800">
        <div className="flex justify-between items-center mb-6">
          <h2 className="font-headline font-black text-xl text-on-surface dark:text-stone-100 uppercase">
            {product ? 'Edit Produk' : 'Produk Baru'}
          </h2>
          <button type="button" onClick={onClose} className="text-stone-400 hover:text-red-500 transition-colors">
            <span className="material-symbols-outlined text-2xl">close</span>
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-stone-500 uppercase tracking-widest mb-1.5">Nama Produk *</label>
            <input required type="text" value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} className="w-full bg-stone-50 dark:bg-stone-800 border-2 border-stone-200 dark:border-stone-700 rounded-xl px-4 py-3 focus:outline-none focus:border-primary transition-colors text-on-surface dark:text-stone-100" placeholder="Contoh: 100 Diamonds" />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-stone-500 uppercase tracking-widest mb-1.5">Kategori *</label>
              <select
                required
                value={formData.categoryId}
                onChange={e => setFormData({...formData, categoryId: e.target.value})}
                className="w-full bg-stone-50 dark:bg-stone-800 border-2 border-stone-200 dark:border-stone-700 rounded-xl px-4 py-3 focus:outline-none focus:border-primary transition-colors text-on-surface dark:text-stone-100 appearance-none font-medium"
              >
                <option value="" disabled>Pilih Kategori</option>
                {categories.filter(c => c.isActive).map(c => (
                  <option key={c.id} value={c.id}>{c.name}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-xs font-bold text-stone-500 uppercase tracking-widest mb-1.5">Harga (Rp) *</label>
              <input required type="number" min="0" value={formData.price} onChange={e => setFormData({...formData, price: e.target.value})} className="w-full bg-stone-50 dark:bg-stone-800 border-2 border-stone-200 dark:border-stone-700 rounded-xl px-4 py-3 focus:outline-none focus:border-primary transition-colors text-on-surface dark:text-stone-100 font-headline" placeholder="15000" />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-stone-500 uppercase tracking-widest mb-1.5">Deskripsi</label>
            <textarea required rows="2" value={formData.description} onChange={e => setFormData({...formData, description: e.target.value})} className="w-full bg-stone-50 dark:bg-stone-800 border-2 border-stone-200 dark:border-stone-700 rounded-xl px-4 py-3 focus:outline-none focus:border-primary transition-colors text-on-surface dark:text-stone-100 resize-none" placeholder="Detail item..." />
          </div>

          <div>
            <label className="block text-xs font-bold text-stone-500 uppercase tracking-widest mb-1.5">Gambar {product && '(Opsional)'}</label>
            <input type="file" accept="image/*" onChange={e => setImageFile(e.target.files[0])} required={!product} className="block w-full text-sm text-stone-500 file:mr-4 file:py-2 file:px-4 file:rounded-xl file:border-0 file:text-xs file:font-bold file:uppercase file:bg-primary/10 file:text-primary hover:file:bg-primary hover:file:text-white file:transition-colors cursor-pointer" />
          </div>

          <div className="pt-4 flex justify-end gap-3 border-t border-stone-200 dark:border-stone-800 mt-6">
            <button type="button" onClick={onClose} className="px-6 py-2.5 rounded-xl font-label font-bold text-stone-500 hover:bg-stone-100 dark:hover:bg-stone-800 transition-colors text-sm">Batal</button>
            <button type="submit" disabled={loading} className="px-8 py-2.5 rounded-xl font-label font-bold bg-primary hover:bg-sky-500 text-white transition-colors text-sm disabled:opacity-50 flex items-center gap-2">
              {loading && <span className="material-symbols-outlined animate-spin text-sm">sync</span>}
              {product ? 'Simpan' : 'Upload Produk'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
