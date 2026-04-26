export const STEPS = [
  { key: 'account', label: 'Data Akun', icon: 'person' },
  { key: 'product', label: 'Pilih Nominal', icon: 'diamond' },
  { key: 'payment', label: 'Pembayaran', icon: 'credit_card' },
  { key: 'contact', label: 'Kontak', icon: 'call' },
];

export const DEFAULT_ACCOUNT_FIELDS = [
  { name: 'User ID', key: 'userId', type: 'text', required: true, placeholder: 'Masukkan User ID' },
  { name: 'Server', key: 'server', type: 'select', required: true, options: ['Asia', 'Global', 'Europe', 'America'] },
];

export const PAYMENT_METHODS = [
  { id: 'QRIS', icon: 'qr_code_2', name: 'QRIS', desc: 'Semua E-Wallet / Bank', gradient: 'from-violet-500 to-purple-600' },
  { id: 'EWALLET', icon: 'account_balance_wallet', name: 'E-Wallet', desc: 'DANA, OVO, GoPay', gradient: 'from-sky-500 to-cyan-600' },
  { id: 'BANK', icon: 'account_balance', name: 'Bank Transfer', desc: 'BCA, Mandiri, BNI, BRI', gradient: 'from-emerald-500 to-green-600' },
];
