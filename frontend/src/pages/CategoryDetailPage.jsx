import { useParams, useNavigate } from 'react-router-dom';
import { useEffect, useState } from 'react';
import { Helmet } from 'react-helmet-async';
import useSWR from 'swr';
import { apiFetch, apiFetcher } from '../services/apiService';
import { useToast } from '../components/ToastProvider';
import { STEPS, DEFAULT_ACCOUNT_FIELDS } from '../constants';
import { AccountStep, ProductStep, QuantityStep, PaymentStep, ContactStep, ReviewStep } from '../components/wizard/WizardSteps';

export default function CategoryDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const toast = useToast();

  const [submitting, setSubmitting] = useState(false);

  // Wizard state
  const [currentStep, setCurrentStep] = useState(0);
  const [accountData, setAccountData] = useState({});
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [quantity, setQuantity] = useState(1);
  const [paymentMethod, setPaymentMethod] = useState('');
  const [whatsapp, setWhatsapp] = useState('');

  const { data: category, isLoading: loading } = useSWR(`/categories/${id}`, apiFetcher, {
    onSuccess: (data) => {
      const fields = parseAccountFields(data?.accountFields);
      setAccountData(prev => {
        const initial = { ...prev };
        let changed = false;
        fields.forEach(f => {
          if (initial[f.key] === undefined) {
            initial[f.key] = '';
            changed = true;
          }
        });
        return changed ? initial : prev;
      });
    },
    onError: () => toast.error('Kategori tidak ditemukan')
  });

  function parseAccountFields(raw) {
    if (!raw) return DEFAULT_ACCOUNT_FIELDS;
    try {
      const parsed = JSON.parse(raw);
      return Array.isArray(parsed) && parsed.length > 0 ? parsed : DEFAULT_ACCOUNT_FIELDS;
    } catch { return DEFAULT_ACCOUNT_FIELDS; }
  }

  const accountFields = parseAccountFields(category?.accountFields);

  // Validation per step
  function validateStep(step) {
    switch (step) {
      case 0: // Account
        for (const f of accountFields) {
          if (f.required && !accountData[f.key]?.trim()) {
            toast.warn(`${f.name} wajib diisi`);
            return false;
          }
        }
        return true;
      case 1: // Product
        if (!selectedProduct) {
          toast.warn('Pilih item terlebih dahulu');
          return false;
        }
        return true;
      case 2: // Quantity
        if (quantity < 1) {
          toast.warn('Jumlah minimal 1');
          return false;
        }
        return true;
      case 3: // Payment
        if (!paymentMethod) {
          toast.warn('Pilih metode pembayaran');
          return false;
        }
        return true;
      case 4: // Contact
        if (!whatsapp.trim() || whatsapp.length < 10) {
          toast.warn('Masukkan nomor WhatsApp yang valid');
          return false;
        }
        return true;
      default:
        return true;
    }
  }

  function goNext() {
    if (validateStep(currentStep)) {
      setCurrentStep(s => Math.min(s + 1, 5));
    }
  }

  function goBack() {
    setCurrentStep(s => Math.max(s - 1, 0));
  }

  async function handleCheckout() {
    if (submitting) return;
    setSubmitting(true);
    try {
      const res = await apiFetch('/orders', {
        method: 'POST',
        body: JSON.stringify({
          items: [{ productId: selectedProduct.id, quantity }],
          accountData: JSON.stringify(accountData),
          whatsapp,
          paymentMethod,
        }),
      });
      const orderId = res.data?.id;
      toast.success('Pesanan dibuat! Lanjutkan pembayaran.');
      navigate(`/payment?orderId=${orderId}`);
    } catch (err) {
      toast.error(err.message || 'Checkout gagal');
    } finally {
      setSubmitting(false);
    }
  }

  const totalPrice = selectedProduct ? selectedProduct.price * quantity : 0;

  // Loading state
  if (loading) return (
    <main className="min-h-screen flex items-center justify-center">
      <div className="flex flex-col items-center gap-4">
        <span className="material-symbols-outlined animate-spin text-5xl text-primary">sync</span>
        <p className="text-sm text-stone-500 font-label font-bold uppercase tracking-widest">Memuat...</p>
      </div>
    </main>
  );

  if (!category) return (
    <main className="min-h-screen flex items-center justify-center">
      <p className="font-headline text-2xl text-on-surface-variant">Kategori tidak ditemukan</p>
    </main>
  );

  const products = category.products || [];

  // ==========================================
  // RENDER
  // ==========================================
  return (
    <main className="max-w-5xl mx-auto px-4 md:px-8 pt-6 pb-32 min-h-screen">
      <Helmet>
        <title>{category?.name || 'Game'} — Top Up | Fazsee Store</title>
        <meta name="description" content={`Top up ${category?.name || 'game'} dengan harga murah dan proses cepat di Fazsee Store.`} />
      </Helmet>

      {/* Category Header */}
      <div className="flex items-center gap-4 mb-8">
        <button onClick={() => navigate(-1)} className="w-10 h-10 rounded-full bg-surface-container dark:bg-stone-800 flex items-center justify-center hover:bg-surface-dim dark:hover:bg-stone-700 transition-colors">
          <span className="material-symbols-outlined text-on-surface-variant">arrow_back</span>
        </button>
        <div className="flex items-center gap-3 flex-1 min-w-0">
          {category.iconUrl && (
            <img src={category.iconUrl} alt={category.name} loading="lazy" decoding="async" className="w-10 h-10 rounded-lg object-cover border-2 border-primary/20 shrink-0" />
          )}
          <div className="min-w-0 flex-1">
            <h1 className="font-headline font-black text-xl md:text-2xl text-on-surface dark:text-stone-100 uppercase tracking-tight truncate">{category.name}</h1>
            {category.description && <p className="text-xs text-stone-500 truncate">{category.description}</p>}
          </div>

          <button
            onClick={() => {
              const saved = localStorage.getItem('wishlist');
              let ids = saved ? JSON.parse(saved) : [];
              if (ids.includes(category.id)) {
                ids = ids.filter(i => i !== category.id);
                toast.success('Game dihapus dari favorit');
              } else {
                ids.push(category.id);
                toast.success('Game ditambahkan ke favorit');
              }
              localStorage.setItem('wishlist', JSON.stringify(ids));
              setCategory({...category});
            }}
            className={`w-10 h-10 shrink-0 flex items-center justify-center rounded-full border-2 transition-all active:scale-90 ${
              (() => { try { return JSON.parse(localStorage.getItem('wishlist') || '[]').includes(category.id); } catch { return false; } })()
                ? 'bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-800 text-red-500 shadow-md'
                : 'bg-white dark:bg-stone-900 border-stone-200 dark:border-stone-700 text-stone-400 hover:text-red-500 hover:border-red-200'
            }`}
          >
            <span className="material-symbols-outlined shrink-0" style={{ fontVariationSettings: (() => { try { return JSON.parse(localStorage.getItem('wishlist') || '[]').includes(category.id) ? "'FILL' 1" : "'FILL' 0"; } catch { return "'FILL' 0"; } })() }}>favorite</span>
          </button>
        </div>
      </div>

      {/* Stepper */}
      <div className="mb-8">
        <div className="flex items-center justify-between relative">
          {/* Progress Line */}
          <div className="absolute top-5 left-0 right-0 h-0.5 bg-stone-200 dark:bg-stone-800 mx-6 z-0" />
          <div
            className="absolute top-5 left-0 h-0.5 bg-gradient-to-r from-primary to-sky-400 mx-6 z-0 transition-all duration-500 ease-out"
            style={{ width: `calc(${(Math.min(currentStep, STEPS.length - 1) / (STEPS.length - 1)) * 100}% - 48px)` }}
          />
          {STEPS.map((step, idx) => {
            // Map 4 bubbles to the 6 physical steps
            let mappedIndex;
            if (idx === 0) mappedIndex = 0; // Account
            else if (idx === 1) mappedIndex = currentStep === 2 ? 2 : 1; // Product/Quantity
            else if (idx === 2) mappedIndex = 3; // Payment
            else if (idx === 3) mappedIndex = currentStep === 5 ? 5 : 4; // Contact/Review

            const isActive = mappedIndex === currentStep;
            const isDone = mappedIndex < currentStep;
            
            return (
              <div key={step.key} className="flex flex-col items-center z-10 relative">
                <div className={`w-10 h-10 rounded-full flex items-center justify-center text-sm font-bold transition-all duration-300 border-2 ${
                  isDone ? 'bg-primary border-primary text-white scale-90' :
                  isActive ? 'bg-primary border-primary text-white scale-110 shadow-lg shadow-primary/30 ring-4 ring-primary/10' :
                  'bg-white dark:bg-stone-900 border-stone-300 dark:border-stone-700 text-stone-400 dark:text-stone-500'
                }`}>
                  {isDone ? (
                    <span className="material-symbols-outlined text-[18px]" style={{ fontVariationSettings: "'FILL' 1" }}>check</span>
                  ) : (
                    <span className="material-symbols-outlined text-[18px]">{step.icon}</span>
                  )}
                </div>
                <span className={`mt-2 text-[9px] md:text-[10px] font-label font-bold uppercase tracking-tighter text-center transition-colors ${
                  isActive ? 'text-primary' : isDone ? 'text-primary/60' : 'text-stone-400 dark:text-stone-600'
                }`}>{step.label}</span>
              </div>
            );
          })}
        </div>
      </div>

      {/* Step Content */}
      <div className="relative overflow-hidden">
        <div className="transition-all duration-400 ease-in-out">

          {/* ===== STEP 0: Account Data ===== */}
          {currentStep === 0 && (
            <AccountStep accountFields={accountFields} accountData={accountData} setAccountData={setAccountData} />
          )}

          {/* ===== STEP 1: Select Product ===== */}
          {currentStep === 1 && (
            <ProductStep products={products} selectedProduct={selectedProduct} setSelectedProduct={setSelectedProduct} />
          )}

          {/* ===== STEP 2: Quantity ===== */}
          {currentStep === 2 && selectedProduct && (
            <QuantityStep selectedProduct={selectedProduct} quantity={quantity} setQuantity={setQuantity} totalPrice={totalPrice} />
          )}

          {/* ===== STEP 3: Payment Method ===== */}
          {currentStep === 3 && (
            <PaymentStep paymentMethod={paymentMethod} setPaymentMethod={setPaymentMethod} />
          )}

          {/* ===== STEP 4: WhatsApp Contact ===== */}
          {currentStep === 4 && (
            <ContactStep whatsapp={whatsapp} setWhatsapp={setWhatsapp} />
          )}

          {/* ===== STEP 5: Review & Checkout ===== */}
          {currentStep === 5 && selectedProduct && (
            <ReviewStep 
              accountData={accountData}
              accountFields={accountFields}
              selectedProduct={selectedProduct}
              quantity={quantity}
              paymentMethod={paymentMethod}
              whatsapp={whatsapp}
              totalPrice={totalPrice}
              submitting={submitting}
              handleCheckout={handleCheckout}
            />
          )}
        </div>
      </div>

      {/* Navigation Buttons */}
      {currentStep < 5 && (
        <div className="flex gap-3 mt-8">
          {currentStep > 0 && (
            <button
              onClick={goBack}
              className="flex-1 bg-stone-100 dark:bg-stone-800 text-stone-600 dark:text-stone-300 py-4 rounded-xl font-headline font-bold text-sm uppercase tracking-wider hover:bg-stone-200 dark:hover:bg-stone-700 transition-all active:scale-[0.98] flex items-center justify-center gap-2"
            >
              <span className="material-symbols-outlined text-lg">arrow_back</span>
              Kembali
            </button>
          )}
          <button
            onClick={goNext}
            className={`flex-1 bg-gradient-to-r from-primary to-sky-500 text-white py-4 rounded-xl font-headline font-bold text-sm uppercase tracking-wider shadow-lg shadow-primary/20 hover:shadow-primary/40 hover:scale-[1.01] active:scale-[0.99] transition-all flex items-center justify-center gap-2 ${currentStep === 0 ? 'w-full' : ''}`}
          >
            Lanjutkan
            <span className="material-symbols-outlined text-lg">arrow_forward</span>
          </button>
        </div>
      )}

      {currentStep === 5 && (
        <div className="mt-4">
          <button
            onClick={goBack}
            className="w-full bg-stone-100 dark:bg-stone-800 text-stone-600 dark:text-stone-300 py-4 rounded-xl font-headline font-bold text-sm uppercase tracking-wider hover:bg-stone-200 dark:hover:bg-stone-700 transition-all active:scale-[0.98] flex items-center justify-center gap-2"
          >
            <span className="material-symbols-outlined text-lg">arrow_back</span>
            Ubah Pesanan
          </button>
        </div>
      )}
    </main>
  );
}

