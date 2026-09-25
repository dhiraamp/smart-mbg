import React from "react";
import { AlertTriangle, RefreshCw, Trash2, Home } from "lucide-react";

export class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null, errorInfo: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    this.setState({ errorInfo });
    console.error("[ErrorBoundary caught error]:", error, errorInfo);
  }

  handleReload = () => {
    window.location.reload();
  };

  handleResetStorage = () => {
    try {
      localStorage.clear();
      sessionStorage.clear();
    } catch (e) {
      console.warn("Gagal membersihkan storage:", e);
    }
    window.location.href = "/";
  };

  render() {
    if (this.state.hasError) {
      const errorMessage = this.state.error?.message || String(this.state.error);
      const stack = this.state.errorInfo?.componentStack || this.state.error?.stack;

      return (
        <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
          <div className="max-w-lg w-full bg-white rounded-2xl border border-red-200 shadow-xl p-6 sm:p-8 text-center">
            <div className="w-14 h-14 mx-auto rounded-2xl bg-red-50 text-red-600 flex items-center justify-center mb-4">
              <AlertTriangle className="w-7 h-7" />
            </div>

            <h2 className="text-xl sm:text-2xl font-bold text-gray-900">
              Terjadi Kesalahan Tampilan
            </h2>
            <p className="text-sm text-gray-600 mt-2 leading-relaxed">
              Aplikasi mengalami kendala saat memuat komponen ini. Anda dapat memuat ulang atau mereset cache browser.
            </p>

            <div className="mt-6 flex flex-wrap gap-2.5 justify-center">
              <button
                onClick={this.handleReload}
                className="inline-flex items-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white text-xs sm:text-sm font-semibold px-4 py-2.5 rounded-xl transition-colors shadow-sm"
              >
                <RefreshCw className="w-4 h-4" /> Muat Ulang Halaman
              </button>

              <button
                onClick={this.handleResetStorage}
                className="inline-flex items-center gap-2 bg-white hover:bg-gray-50 border border-gray-300 text-gray-700 text-xs sm:text-sm font-semibold px-4 py-2.5 rounded-xl transition-colors"
              >
                <Trash2 className="w-4 h-4 text-red-500" /> Reset Cache & Masuk
              </button>

              <a
                href="/"
                className="inline-flex items-center gap-2 bg-gray-100 hover:bg-gray-200 text-gray-700 text-xs sm:text-sm font-semibold px-4 py-2.5 rounded-xl transition-colors"
              >
                <Home className="w-4 h-4" /> Ke Beranda
              </a>
            </div>

            {errorMessage && (
              <details className="mt-6 text-left bg-slate-100 p-3 rounded-xl border border-slate-200 text-xs text-gray-700 overflow-x-auto">
                <summary className="cursor-pointer font-semibold text-gray-600 select-none">
                  Detail Teknis Error
                </summary>
                <p className="mt-2 text-red-600 font-mono text-[11px]">{errorMessage}</p>
                {stack && (
                  <pre className="mt-1 font-mono text-[10px] text-gray-500 max-h-40 overflow-y-auto whitespace-pre-wrap">
                    {stack}
                  </pre>
                )}
              </details>
            )}
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
