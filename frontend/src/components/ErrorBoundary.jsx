import { Component } from 'react';
import { Link } from 'react-router-dom';

export default class ErrorBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error('ErrorBoundary caught:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen flex items-center justify-center bg-surface-container-lowest dark:bg-stone-950 px-4">
          <div className="text-center max-w-md">
            <span className="material-symbols-outlined text-7xl text-red-400 dark:text-red-500 mb-6 block animate-bounce">
              error
            </span>
            <h1 className="font-headline font-black text-3xl uppercase text-on-surface dark:text-stone-100 mb-3">
              Oops!
            </h1>
            <p className="font-body text-stone-500 dark:text-stone-400 mb-8">
              Terjadi kesalahan yang tidak terduga. Silakan muat ulang halaman atau kembali ke beranda.
            </p>
            <div className="flex gap-3 justify-center">
              <button
                onClick={() => window.location.reload()}
                className="bg-primary text-white px-6 py-3 rounded-full font-label font-bold text-sm uppercase tracking-wider hover:shadow-lg transition-all flex items-center gap-2"
              >
                <span className="material-symbols-outlined text-sm">refresh</span>
                Muat Ulang
              </button>
              <Link
                to="/"
                onClick={() => this.setState({ hasError: false, error: null })}
                className="bg-stone-100 dark:bg-stone-800 text-stone-700 dark:text-stone-300 px-6 py-3 rounded-full font-label font-bold text-sm uppercase tracking-wider hover:shadow-lg transition-all flex items-center gap-2"
              >
                <span className="material-symbols-outlined text-sm">home</span>
                Beranda
              </Link>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
