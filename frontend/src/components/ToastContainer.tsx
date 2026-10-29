import React from 'react';
import { useApp } from '../context/AppContext';

export const ToastContainer: React.FC = () => {
  const { toasts, removeToast } = useApp();

  if (toasts.length === 0) return null;

  return (
    <div className="fixed top-4 right-4 z-50 flex flex-col gap-2 max-w-[380px] pointer-events-none">
      {toasts.map((toast) => {
        let bgColor = 'bg-[#142C4B] border-[#1769D2] text-white';
        let icon = 'info';

        if (toast.type === 'success') {
          bgColor = 'bg-emerald-900/90 border-emerald-500 text-white';
          icon = 'check_circle';
        } else if (toast.type === 'warning') {
          bgColor = 'bg-amber-900/90 border-amber-500 text-white';
          icon = 'warning';
        } else if (toast.type === 'error') {
          bgColor = 'bg-rose-900/90 border-rose-500 text-white';
          icon = 'error';
        }

        return (
          <div
            key={toast.id}
            className={`pointer-events-auto flex items-start gap-3 p-3.5 rounded-lg border shadow-lg backdrop-blur-md transition-all duration-300 animate-slide-in ${bgColor}`}
          >
            <span className="material-symbols-outlined text-[20px] shrink-0 mt-0.5">
              {icon}
            </span>
            <div className="flex-1 text-[13px] font-medium leading-relaxed">
              {toast.message}
            </div>
            <button
              onClick={() => removeToast(toast.id)}
              className="text-white/60 hover:text-white transition-colors"
            >
              <span className="material-symbols-outlined text-[16px]">close</span>
            </button>
          </div>
        );
      })}
    </div>
  );
};
