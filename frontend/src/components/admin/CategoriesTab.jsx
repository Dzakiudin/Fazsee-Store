export default function CategoriesTab({ categories, onAdd, onEdit, onDelete }) {
  return (
    <section>
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-lg font-headline font-black uppercase text-on-surface dark:text-stone-100">Daftar Kategori (Game)</h2>
        <button onClick={onAdd} className="bg-primary text-white px-4 py-2 rounded-lg font-bold font-label flex items-center gap-2 hover:-translate-y-0.5 transition-all shadow-md text-sm">
          <span className="material-symbols-outlined text-sm">add</span> Tambah Kategori
        </button>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {categories.map(cat => (
          <div key={cat.id} className={`bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 rounded-xl p-5 flex flex-col gap-3 shadow-sm transition-all hover:shadow-md ${!cat.isActive ? 'opacity-50' : ''}`}>
            <div className="flex items-center gap-3">
              {cat.iconUrl ? (
                <img src={cat.iconUrl} alt={cat.name} loading="lazy" decoding="async" className="w-12 h-12 rounded-lg object-cover border border-stone-200 dark:border-stone-700" />
              ) : (
                <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center">
                  <span className="material-symbols-outlined text-primary text-2xl" style={{ fontVariationSettings: "'FILL' 1" }}>sports_esports</span>
                </div>
              )}
              <div className="flex-1 min-w-0">
                <h3 className="font-headline font-bold text-sm text-on-surface dark:text-stone-100 truncate">{cat.name}</h3>
                <p className="text-[10px] text-stone-400 font-label font-bold">{cat._count?.products || 0} item • {cat.isActive ? 'Aktif' : 'Nonaktif'}</p>
              </div>
            </div>
            {cat.description && <p className="text-xs text-stone-500 line-clamp-2">{cat.description}</p>}
            <div className="flex items-center gap-2 pt-2 border-t border-stone-100 dark:border-stone-800">
              <button onClick={() => onEdit(cat)} className="flex-1 py-2 bg-stone-100 dark:bg-stone-800 text-stone-600 dark:text-stone-300 rounded-lg text-xs font-bold flex items-center justify-center gap-1 hover:bg-stone-200 dark:hover:bg-stone-700 transition-colors">
                <span className="material-symbols-outlined text-[14px]">edit</span> Edit
              </button>
              <button onClick={() => onDelete(cat.id)} className="flex-1 py-2 bg-red-50 dark:bg-red-900/20 text-red-500 rounded-lg text-xs font-bold flex items-center justify-center gap-1 hover:bg-red-100 dark:hover:bg-red-900/30 transition-colors">
                <span className="material-symbols-outlined text-[14px]">delete</span> Hapus
              </button>
            </div>
          </div>
        ))}
        {categories.length === 0 && (
          <div className="col-span-full text-center py-12 text-stone-500">
            <span className="material-symbols-outlined text-5xl text-stone-300 dark:text-stone-700">category</span>
            <p className="mt-2 font-label font-bold">Belum ada kategori. Tambahkan game pertamamu!</p>
          </div>
        )}
      </div>
    </section>
  );
}
