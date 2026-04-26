import { formatRupiah } from '../../utils/formatters';

export default function ProductsTab({ products, onAdd, onEdit, onToggleStatus }) {
  return (
    <section>
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-lg font-headline font-black uppercase text-on-surface dark:text-stone-100">Daftar Produk</h2>
        <button onClick={onAdd} className="bg-primary text-white px-4 py-2 rounded-lg font-bold font-label flex items-center gap-2 hover:-translate-y-0.5 transition-all shadow-md text-sm">
          <span className="material-symbols-outlined text-sm">add</span> Tambah Produk
        </button>
      </div>

      <div className="overflow-x-auto bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 rounded-xl shadow-sm">
        <table className="w-full text-left font-body text-sm">
          <thead className="bg-stone-50 dark:bg-stone-800 border-b border-stone-200 dark:border-stone-700">
            <tr>
              <th className="p-4 font-bold uppercase tracking-widest text-xs text-stone-500">Produk</th>
              <th className="p-4 font-bold uppercase tracking-widest text-xs text-stone-500">Kategori</th>
              <th className="p-4 font-bold uppercase tracking-widest text-xs text-stone-500">Harga</th>
              <th className="p-4 font-bold uppercase tracking-widest text-xs text-stone-500 text-center">Aksi</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-stone-100 dark:divide-stone-800">
            {products.filter(p => p.isActive).map(p => (
              <tr key={p.id} className="hover:bg-stone-50 dark:hover:bg-stone-800/50 transition-colors">
                <td className="p-4 flex items-center gap-3">
                  <img src={p.imageUrl} alt={p.name} loading="lazy" decoding="async" className="w-10 h-10 rounded-lg object-cover border border-stone-200 dark:border-stone-700" />
                  <div>
                    <div className="font-bold text-on-surface dark:text-stone-100">{p.name}</div>
                    <div className="text-[10px] text-stone-400 truncate max-w-[200px]">{p.description}</div>
                  </div>
                </td>
                <td className="p-4">
                  <span className="bg-primary/10 text-primary px-3 py-1 rounded-full text-xs font-bold">
                    {p.category?.name || 'N/A'}
                  </span>
                </td>
                <td className="p-4 font-headline font-black">Rp {formatRupiah(p.price)}</td>
                <td className="p-4 text-center">
                  <div className="flex items-center justify-center gap-2">
                    <button onClick={() => onEdit(p)} className="w-8 h-8 rounded-full bg-stone-100 dark:bg-stone-800 text-stone-500 hover:text-primary hover:bg-primary/10 transition-all flex items-center justify-center" title="Edit">
                      <span className="material-symbols-outlined text-[16px]">edit</span>
                    </button>
                    <button onClick={() => onToggleStatus(p.id, p.isActive)} className="w-8 h-8 rounded-full bg-red-50 dark:bg-red-900/20 text-red-400 hover:text-red-600 hover:bg-red-100 transition-all flex items-center justify-center" title="Hapus">
                      <span className="material-symbols-outlined text-[16px]">delete</span>
                    </button>
                  </div>
                </td>
              </tr>
            ))}
            {products.filter(p => p.isActive).length === 0 && (
              <tr><td colSpan={4} className="p-8 text-center text-stone-500 font-medium">Belum ada produk aktif.</td></tr>
            )}
          </tbody>
        </table>
      </div>
    </section>
  );
}
