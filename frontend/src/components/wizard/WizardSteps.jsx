import { formatRupiah } from '../../utils/formatters';
import { PAYMENT_METHODS } from '../../constants';

export function StepCard({ title, subtitle, icon, children }) {
  return (
    <div className="bg-white dark:bg-stone-900 rounded-2xl border border-stone-200 dark:border-stone-800 p-6 shadow-sm">
      <div className="flex items-center gap-3 mb-6">
        <div className="w-10 h-10 bg-primary/10 dark:bg-primary/20 rounded-xl flex items-center justify-center">
          <span className="material-symbols-outlined text-primary text-xl">{icon}</span>
        </div>
        <div>
          <h2 className="font-headline font-bold text-base text-on-surface dark:text-stone-100">{title}</h2>
          <p className="text-[11px] text-stone-500">{subtitle}</p>
        </div>
      </div>
      {children}
    </div>
  );
}

export function ReviewRow({ icon, label, value }) {
  return (
    <div className="flex items-start gap-3 bg-stone-50 dark:bg-stone-800/50 p-4 rounded-xl border border-stone-200/50 dark:border-stone-700/50">
      <span className="material-symbols-outlined text-primary text-lg mt-0.5">{icon}</span>
      <div className="flex-1 min-w-0">
        <p className="text-[10px] font-label font-bold text-stone-400 uppercase tracking-widest">{label}</p>
        <p className="text-sm font-body font-semibold text-on-surface dark:text-stone-200 truncate">{value}</p>
      </div>
    </div>
  );
}

export function AccountStep({ accountFields, accountData, setAccountData }) {
  return (
    <StepCard title="Masukkan Data Akun" subtitle="Data ini dibutuhkan untuk proses top up" icon="person">
      <div className="space-y-5">
        {accountFields.map(field => (
          <div key={field.key} className="space-y-2">
            <label className="block text-xs font-label font-bold text-stone-500 dark:text-stone-400 uppercase tracking-widest ml-1">
              {field.name} {field.required && <span className="text-red-400">*</span>}
            </label>
            {field.type === 'select' ? (
              <div className="relative">
                <select
                  value={accountData[field.key] || ''}
                  onChange={e => setAccountData(prev => ({ ...prev, [field.key]: e.target.value }))}
                  className="w-full bg-stone-50 dark:bg-stone-800/50 border-2 border-stone-200 dark:border-stone-700/80 rounded-xl px-5 py-4 text-on-surface dark:text-stone-100 font-body font-semibold focus:bg-white dark:focus:bg-stone-800 focus:outline-none focus:border-primary focus:ring-4 focus:ring-primary/20 hover:border-stone-300 dark:hover:border-stone-600 transition-all duration-300 appearance-none shadow-sm cursor-pointer"
                >
                  <option value="">Pilih {field.name}</option>
                  {(field.options || []).map(o => <option key={o} value={o}>{o}</option>)}
                </select>
                <span className="material-symbols-outlined absolute right-4 top-1/2 -translate-y-1/2 text-stone-400 pointer-events-none">expand_more</span>
              </div>
            ) : (
              <input
                type={field.type || 'text'}
                placeholder={field.placeholder || `Masukkan ${field.name}`}
                value={accountData[field.key] || ''}
                onChange={e => setAccountData(prev => ({ ...prev, [field.key]: e.target.value }))}
                className="w-full bg-stone-50 dark:bg-stone-800/50 border-2 border-stone-200 dark:border-stone-700/80 rounded-xl px-5 py-4 text-on-surface dark:text-stone-100 font-body font-semibold focus:bg-white dark:focus:bg-stone-800 focus:outline-none focus:border-primary focus:ring-4 focus:ring-primary/20 hover:border-stone-300 dark:hover:border-stone-600 transition-all duration-300 placeholder:text-stone-400 shadow-sm"
              />
            )}
          </div>
        ))}
      </div>
    </StepCard>
  );
}

export function ProductStep({ products, selectedProduct, setSelectedProduct }) {
  return (
    <StepCard title="Pilih Item" subtitle={`${products.length} item tersedia`} icon="shopping_bag">
      {products.length === 0 ? (
        <div className="text-center py-12">
          <span className="material-symbols-outlined text-5xl text-stone-300 dark:text-stone-700">inventory_2</span>
          <p className="text-stone-500 mt-2 font-label font-bold">Belum ada item tersedia</p>
        </div>
      ) : (
        <div className="grid grid-cols-2 gap-3">
          {products.map(product => {
            const isSelected = selectedProduct?.id === product.id;
            return (
              <button
                key={product.id}
                onClick={() => setSelectedProduct(product)}
                className={`relative p-4 rounded-xl border-2 text-left transition-all duration-200 group ${
                  isSelected
                    ? 'border-primary bg-primary/10 dark:bg-primary/20 shadow-md shadow-primary/10 scale-[1.02] ring-2 ring-primary/20'
                    : 'border-stone-200 dark:border-stone-700/80 bg-white dark:bg-stone-800 hover:border-primary/50 hover:shadow-lg active:scale-95'
                }`}
              >
                {isSelected && (
                  <div className="absolute top-2 right-2 w-6 h-6 bg-primary rounded-full flex items-center justify-center">
                    <span className="material-symbols-outlined text-white text-[14px]" style={{ fontVariationSettings: "'FILL' 1" }}>check</span>
                  </div>
                )}
                {product.imageUrl && (
                  <img src={product.imageUrl} alt={product.name} loading="lazy" decoding="async" className="w-full aspect-[16/10] rounded-lg object-cover mb-3 border border-stone-100 dark:border-stone-700" />
                )}
                <h4 className={`font-headline font-bold text-sm leading-tight mb-1 transition-colors ${isSelected ? 'text-primary' : 'text-on-surface dark:text-stone-200'}`}>
                  {product.name}
                </h4>
                <p className="font-headline font-black text-base text-secondary-dim dark:text-orange-400">
                  Rp {formatRupiah(product.price)}
                </p>
                {product.description && (
                  <p className="text-[10px] text-stone-400 mt-1 line-clamp-2">{product.description}</p>
                )}
              </button>
            );
          })}
        </div>
      )}
    </StepCard>
  );
}

export function QuantityStep({ selectedProduct, quantity, setQuantity, totalPrice }) {
  return (
    <StepCard title="Tentukan Jumlah" subtitle="Atur jumlah pembelian" icon="add_circle">
      <div className="flex flex-col items-center gap-6">
        <div className="w-full bg-primary/5 dark:bg-primary/10 border border-primary/20 rounded-xl p-4 flex items-center gap-4">
          {selectedProduct?.imageUrl && (
            <img src={selectedProduct.imageUrl} alt="" loading="lazy" decoding="async" className="w-14 h-14 rounded-lg object-cover border border-primary/10" />
          )}
          <div className="flex-1 min-w-0">
            <h4 className="font-headline font-bold text-sm text-on-surface dark:text-stone-200 truncate">{selectedProduct?.name}</h4>
            <p className="text-xs text-stone-500">Rp {formatRupiah(selectedProduct?.price || 0)} / item</p>
          </div>
        </div>

        <div className="flex items-center gap-1 bg-stone-100 dark:bg-stone-800 p-2 rounded-2xl">
          <button
            onClick={() => setQuantity(q => Math.max(1, q - 1))}
            className="w-14 h-14 flex items-center justify-center rounded-xl bg-white dark:bg-stone-700 hover:bg-stone-50 dark:hover:bg-stone-600 transition-all active:scale-90 shadow-sm"
          >
            <span className="material-symbols-outlined text-stone-600 dark:text-stone-300">remove</span>
          </button>
          <input
            type="number"
            min="1"
            value={quantity}
            onChange={e => setQuantity(Math.max(1, parseInt(e.target.value) || 1))}
            className="w-20 h-14 text-center font-headline font-black text-2xl bg-transparent text-on-surface dark:text-stone-100 focus:outline-none [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
          />
          <button
            onClick={() => setQuantity(q => q + 1)}
            className="w-14 h-14 flex items-center justify-center rounded-xl bg-primary/10 dark:bg-primary/20 hover:bg-primary/20 dark:hover:bg-primary/30 transition-all active:scale-90 text-primary shadow-sm"
          >
            <span className="material-symbols-outlined">add</span>
          </button>
        </div>

        <div className="w-full bg-stone-50 dark:bg-stone-800/50 rounded-xl p-5 text-center border border-stone-200 dark:border-stone-700">
          <p className="text-xs text-stone-500 font-label font-bold uppercase tracking-widest mb-1">Total Harga</p>
          <p className="font-headline font-black text-3xl text-on-surface dark:text-stone-100">Rp {formatRupiah(totalPrice)}</p>
        </div>
      </div>
    </StepCard>
  );
}

export function PaymentStep({ paymentMethod, setPaymentMethod }) {
  return (
    <StepCard title="Metode Pembayaran" subtitle="Pilih cara bayar yang kamu mau" icon="credit_card">
      <div className="space-y-3">
        {PAYMENT_METHODS.map(m => {
          const isSelected = paymentMethod === m.id;
          return (
            <button
              key={m.id}
              onClick={() => setPaymentMethod(m.id)}
              className={`w-full flex items-center gap-4 p-5 rounded-xl border-2 transition-all duration-200 text-left ${
                isSelected
                  ? 'border-primary bg-primary/10 dark:bg-primary/20 shadow-md ring-2 ring-primary/20'
                  : 'border-stone-200 dark:border-stone-700/80 bg-white dark:bg-stone-800 hover:border-primary/50 hover:shadow-md active:scale-[0.98]'
              }`}
            >
              <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${m.gradient} flex items-center justify-center shadow-sm`}>
                <span className="material-symbols-outlined text-white text-2xl">{m.icon}</span>
              </div>
              <div className="flex-1">
                <p className={`font-headline font-bold text-sm ${isSelected ? 'text-primary' : 'text-on-surface dark:text-stone-200'}`}>{m.name}</p>
                <p className="text-xs text-stone-500">{m.desc}</p>
              </div>
              <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center transition-all ${
                isSelected ? 'border-primary bg-primary' : 'border-stone-300 dark:border-stone-600'
              }`}>
                {isSelected && <div className="w-2 h-2 bg-white rounded-full" />}
              </div>
            </button>
          );
        })}
      </div>
    </StepCard>
  );
}

export function ContactStep({ whatsapp, setWhatsapp }) {
  return (
    <StepCard title="Nomor WhatsApp" subtitle="Untuk notifikasi & bantuan transaksi" icon="call">
      <div className="space-y-5">
        <div className="space-y-2">
          <label className="block text-xs font-label font-bold text-stone-500 dark:text-stone-400 uppercase tracking-widest ml-1">
            Nomor WhatsApp <span className="text-red-400">*</span>
          </label>
          <div className="relative">
            <span className="absolute left-4 top-1/2 -translate-y-1/2 text-stone-400 font-body font-semibold text-sm">+62</span>
            <input
              type="tel"
              placeholder="83126165997"
              value={whatsapp}
              onChange={e => setWhatsapp(e.target.value.replace(/[^0-9]/g, ''))}
              className="w-full bg-stone-50 dark:bg-stone-800/50 border-2 border-stone-200 dark:border-stone-700/80 rounded-xl pl-14 pr-5 py-4 text-on-surface dark:text-stone-100 font-body font-semibold focus:bg-white dark:focus:bg-stone-800 focus:outline-none focus:border-primary focus:ring-4 focus:ring-primary/20 hover:border-stone-300 dark:hover:border-stone-600 transition-all duration-300 placeholder:text-stone-400 shadow-sm"
            />
          </div>
          <p className="text-[11px] text-stone-400 dark:text-stone-500 ml-1 flex items-center gap-1">
            <span className="material-symbols-outlined text-[14px]">info</span>
            Nomor ini akan dihubungi jika terjadi masalah pada transaksi
          </p>
        </div>
      </div>
    </StepCard>
  );
}

export function ReviewStep({ accountData, accountFields, selectedProduct, quantity, paymentMethod, whatsapp, totalPrice, submitting, handleCheckout }) {
  return (
    <div className="space-y-4">
      <div className="text-center mb-6">
        <span className="material-symbols-outlined text-5xl text-primary mb-2" style={{ fontVariationSettings: "'FILL' 1" }}>receipt_long</span>
        <h2 className="font-headline font-black text-2xl uppercase text-on-surface dark:text-stone-100">Ringkasan Pesanan</h2>
        <p className="text-xs text-stone-500 mt-1">Periksa kembali sebelum checkout</p>
      </div>

      <div className="space-y-3">
        <ReviewRow icon="person" label="Data Akun" value={
          Object.entries(accountData).map(([k, v]) => `${accountFields.find(f => f.key === k)?.name || k}: ${v}`).join(' • ')
        } />
        <ReviewRow icon="shopping_bag" label="Item" value={selectedProduct?.name} />
        <ReviewRow icon="tag" label="Harga Satuan" value={`Rp ${formatRupiah(selectedProduct?.price || 0)}`} />
        <ReviewRow icon="add_circle" label="Jumlah" value={`${quantity}x`} />
        <ReviewRow icon="credit_card" label="Pembayaran" value={PAYMENT_METHODS.find(m => m.id === paymentMethod)?.name || paymentMethod} />
        <ReviewRow icon="call" label="WhatsApp" value={`+62${whatsapp}`} />
      </div>

      <div className="bg-gradient-to-r from-primary to-sky-500 text-white p-6 rounded-2xl mt-6 relative overflow-hidden">
        <div className="absolute top-0 right-0 p-4 opacity-10">
          <span className="material-symbols-outlined text-[100px]">payments</span>
        </div>
        <div className="relative z-10">
          <p className="text-xs font-label font-bold uppercase tracking-widest opacity-80">Total Pembayaran</p>
          <p className="font-headline font-black text-4xl mt-1">Rp {formatRupiah(totalPrice)}</p>
        </div>
      </div>

      <button
        onClick={handleCheckout}
        disabled={submitting}
        className="w-full bg-gradient-to-r from-emerald-500 to-green-500 text-white py-5 rounded-xl font-headline font-black text-xl uppercase tracking-widest shadow-lg shadow-emerald-500/30 hover:shadow-emerald-500/50 hover:scale-[1.01] active:scale-[0.99] transition-all flex items-center justify-center gap-3 disabled:opacity-50 disabled:cursor-not-allowed mt-4"
      >
        {submitting ? (
          <span className="material-symbols-outlined animate-spin">sync</span>
        ) : (
          <>
            Bayar Sekarang
            <span className="material-symbols-outlined text-2xl">rocket_launch</span>
          </>
        )}
      </button>
    </div>
  );
}
