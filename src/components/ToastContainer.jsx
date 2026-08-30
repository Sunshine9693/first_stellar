import React from 'react';
import { CheckCircle2, AlertTriangle, AlertCircle, Info, X } from 'lucide-react';
import { useWallet } from '../context/WalletContext';

export default function ToastContainer() {
  const { toasts, removeToast } = useWallet();

  if (toasts.length === 0) return null;

  return (
    <div className="fixed bottom-5 right-5 z-50 flex flex-col gap-2 max-w-md w-full pointer-events-none">
      {toasts.map((toast) => {
        let icon = <Info className="w-5 h-5 text-blue-400" />;
        let borderClass = 'border-blue-500/30';
        let bgClass = 'bg-slate-900/90';

        if (toast.type === 'success') {
          icon = <CheckCircle2 className="w-5 h-5 text-emerald-400" />;
          borderClass = 'border-emerald-500/30';
          bgClass = 'bg-emerald-950/80';
        } else if (toast.type === 'error') {
          icon = <AlertCircle className="w-5 h-5 text-rose-400" />;
          borderClass = 'border-rose-500/30';
          bgClass = 'bg-rose-950/80';
        } else if (toast.type === 'warning') {
          icon = <AlertTriangle className="w-5 h-5 text-amber-400" />;
          borderClass = 'border-amber-500/30';
          bgClass = 'bg-amber-950/80';
        }

        return (
          <div
            key={toast.id}
            className={`pointer-events-auto flex items-start gap-3 p-4 rounded-xl border ${borderClass} ${bgClass} backdrop-blur-xl shadow-2xl transition-all duration-300 transform translate-y-0 animate-in fade-in slide-in-from-bottom-5`}
          >
            <div className="mt-0.5 flex-shrink-0">{icon}</div>
            <div className="flex-1 min-w-0">
              <h4 className="text-sm font-semibold text-white tracking-wide">{toast.title}</h4>
              {toast.message && (
                <p className="text-xs text-slate-300 mt-0.5 leading-relaxed break-words">
                  {toast.message}
                </p>
              )}
            </div>
            <button
              onClick={() => removeToast(toast.id)}
              className="text-slate-400 hover:text-white transition-colors p-1 rounded-lg hover:bg-white/10"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        );
      })}
    </div>
  );
}
