import { useState } from 'react';
import { useToast } from '../ToastProvider';

const API = import.meta.env.VITE_API_URL || 'http://localhost:3000/api';

export default function CategoryModal({ category, onClose, onSuccess, token }) {
  const [loading, setLoading] = useState(false);
  const toast = useToast();
  
  const initialFields = (() => {
    try {
      if (category?.accountFields) return JSON.parse(category.accountFields);
    } catch {}
    return [];
  })();

  const [formData, setFormData] = useState({
    name: category?.name || '',
    description: category?.description || '',
  });
  
  const [iconFile, setIconFile] = useState(null);
  
  const [useCustomFields, setUseCustomFields] = useState(initialFields.length > 0);
  const [fields, setFields] = useState(initialFields);

  const handleAddField = () => {
    setFields([...fields, { name: '', key: '', type: 'text', required: true }]);
  };

  const handleRemoveField = (index) => {
    const newFields = [...fields];
    newFields.splice(index, 1);
    setFields(newFields);
  };

  const handleChangeField = (index, property, value) => {
    const newFields = [...fields];
    
    newFields[index][property] = value;
    
    // Auto-generate key if name changes and key is currently empty or matches old name's key
    if (property === 'name') {
        const generatedKey = value.toLowerCase().replace(/[^a-z0-9]/g, '');
        newFields[index].key = generatedKey;
    }
    
    setFields(newFields);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.name.trim()) return toast.error('Nama kategori wajib diisi');
    
    // Validate custom fields
    if (useCustomFields) {
      if (fields.length === 0) {
        return toast.error('Setidaknya tambah 1 field jika menyalakan Kustomisasi Field');
      }
      for (let i = 0; i < fields.length; i++) {
        if (!fields[i].name) return toast.error(`Nama label untuk field ke-${i+1} wajib diisi`);
        if (!fields[i].key) return toast.error(`Key untuk field ke-${i+1} tidak valid`);
      }
    }

    setLoading(true);
    try {
      const data = new FormData();
      data.append('name', formData.name.trim());
      data.append('description', formData.description);
      
      if (useCustomFields && fields.length > 0) {
        data.append('accountFields', JSON.stringify(fields));
      } else {
        data.append('accountFields', '');
      }
      
      if (iconFile) data.append('icon', iconFile);

      const url = category
        ? `${API}/admin/categories/${category.id}`
        : `${API}/admin/categories`;
      const res = await fetch(url, {
        method: category ? 'PATCH' : 'POST',
        headers: { 'Authorization': `Bearer ${token}` },
        body: data
      });
      if (res.ok) {
        toast.success(category ? 'Kategori diperbarui!' : 'Kategori ditambahkan!');
        onSuccess();
      } else {
        const err = await res.json();
        toast.error(err.message || 'Gagal menyimpan');
      }
    } catch { toast.error('Kesalahan Jaringan'); }
    finally { setLoading(false); }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-stone-900/80 backdrop-blur-sm">
      <div className="bg-white dark:bg-stone-900 w-full max-w-lg rounded-2xl p-6 md:p-8 shadow-2xl border border-stone-200 dark:border-stone-800 max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center mb-6">
          <h2 className="font-headline font-black text-xl text-on-surface dark:text-stone-100 uppercase">
            {category ? 'Edit Kategori' : 'Kategori Baru'}
          </h2>
          <button type="button" onClick={onClose} className="text-stone-400 hover:text-red-500 transition-colors">
            <span className="material-symbols-outlined text-2xl">close</span>
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-stone-500 uppercase tracking-widest mb-1.5">Nama Game / Kategori *</label>
            <input required type="text" value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} className="w-full bg-stone-50 dark:bg-stone-800 border-2 border-stone-200 dark:border-stone-700 rounded-xl px-4 py-3 focus:outline-none focus:border-primary transition-colors text-on-surface dark:text-stone-100" placeholder="Contoh: Mobile Legends" />
          </div>

          <div>
            <label className="block text-xs font-bold text-stone-500 uppercase tracking-widest mb-1.5">Deskripsi Singkat</label>
            <textarea rows="2" value={formData.description} onChange={e => setFormData({...formData, description: e.target.value})} className="w-full bg-stone-50 dark:bg-stone-800 border-2 border-stone-200 dark:border-stone-700 rounded-xl px-4 py-3 focus:outline-none focus:border-primary transition-colors text-on-surface dark:text-stone-100 resize-none" placeholder="Top up diamond, starlight, dll" />
          </div>

          <div>
            <label className="block text-xs font-bold text-stone-500 uppercase tracking-widest mb-1.5">Icon / Logo Game</label>
            <input type="file" accept="image/*" onChange={e => setIconFile(e.target.files[0])} className="block w-full text-sm text-stone-500 file:mr-4 file:py-2 file:px-4 file:rounded-xl file:border-0 file:text-xs file:font-bold file:uppercase file:bg-primary/10 file:text-primary hover:file:bg-primary hover:file:text-white file:transition-colors cursor-pointer" />
          </div>

          <div className="pt-2">
            <div className="flex justify-between items-center mb-1.5">
              <label className="block text-xs font-bold text-stone-500 uppercase tracking-widest">Kustomisasi Field Akun</label>
            </div>
            
            {!useCustomFields ? (
              <div className="bg-stone-50 dark:bg-stone-800 border-2 border-stone-200 dark:border-stone-700 rounded-xl p-4 text-center">
                <p className="text-sm text-stone-500 dark:text-stone-400 mb-3">Menggunakan field bawaan (User ID & Server ID)</p>
                <button
                  type="button"
                  onClick={() => {
                    setUseCustomFields(true);
                    if (fields.length === 0) handleAddField();
                  }}
                  className="px-4 py-2 bg-stone-200 dark:bg-stone-700 hover:bg-stone-300 dark:hover:bg-stone-600 text-stone-700 dark:text-stone-200 rounded-lg text-xs font-bold transition-colors inline-flex items-center gap-2"
                >
                  <span className="material-symbols-outlined text-sm">edit_note</span>
                  Kustomisasi Field
                </button>
              </div>
            ) : (
              <div className="bg-stone-50 dark:bg-stone-800 border-2 border-stone-200 dark:border-stone-700 rounded-xl p-4 space-y-3">
                {fields.map((field, idx) => (
                  <div key={idx} className="flex gap-2 items-start relative bg-white dark:bg-stone-900 p-2.5 rounded-lg border border-stone-200 dark:border-stone-700">
                    <div className="flex-1 space-y-2">
                      <input 
                        type="text" 
                        placeholder="Label (cnth: User ID)" 
                        value={field.name}
                        onChange={(e) => handleChangeField(idx, 'name', e.target.value)}
                        className="w-full bg-stone-50 dark:bg-stone-800 border-2 border-stone-100 dark:border-stone-700 rounded px-2 py-1.5 text-sm focus:outline-none focus:border-primary"
                      />
                      <div className="flex gap-2">
                        <select 
                          value={field.type}
                          onChange={(e) => handleChangeField(idx, 'type', e.target.value)}
                          className="bg-stone-50 dark:bg-stone-800 border-2 border-stone-100 dark:border-stone-700 rounded px-2 py-1.5 text-xs text-stone-600 dark:text-stone-300 focus:outline-none focus:border-primary"
                        >
                          <option value="text">Teks Bebas</option>
                          <option value="number">Angka</option>
                        </select>
                        <label className="flex items-center gap-1.5 text-xs text-stone-500 cursor-pointer">
                          <input 
                            type="checkbox" 
                            checked={field.required}
                            onChange={(e) => handleChangeField(idx, 'required', e.target.checked)}
                            className="rounded border-stone-300 text-primary focus:ring-primary h-3.5 w-3.5"
                          />
                          Wajib Diisi
                        </label>
                      </div>
                    </div>
                    <button type="button" onClick={() => handleRemoveField(idx)} className="text-stone-400 hover:text-red-500 transition-colors p-1" title="Hapus">
                      <span className="material-symbols-outlined text-lg">delete</span>
                    </button>
                  </div>
                ))}
                
                <div className="flex items-center justify-between pt-2">
                  <button type="button" onClick={handleAddField} className="text-primary hover:text-sky-600 font-bold text-xs flex items-center gap-1 transition-colors">
                    <span className="material-symbols-outlined text-sm">add_circle</span> Tambah Field
                  </button>
                  <button type="button" onClick={() => { setUseCustomFields(false); setFields([]); }} className="text-red-500 hover:text-red-600 font-bold text-xs transition-colors">
                    Batalkan Kustomisasi
                  </button>
                </div>
              </div>
            )}
          </div>

          <div className="pt-4 flex justify-end gap-3 border-t border-stone-200 dark:border-stone-800 mt-6">
            <button type="button" onClick={onClose} className="px-6 py-2.5 rounded-xl font-label font-bold text-stone-500 hover:bg-stone-100 dark:hover:bg-stone-800 transition-colors text-sm">Batal</button>
            <button type="submit" disabled={loading} className="px-8 py-2.5 rounded-xl font-label font-bold bg-primary hover:bg-sky-500 text-white transition-colors text-sm disabled:opacity-50 flex items-center gap-2">
              {loading && <span className="material-symbols-outlined animate-spin text-sm">sync</span>}
              {category ? 'Simpan' : 'Tambah Kategori'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
