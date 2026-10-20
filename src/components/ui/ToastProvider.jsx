import { useToastStore } from '../../store/useToastStore';
import { CheckCircle2, AlertCircle } from 'lucide-react';

export function ToastProvider() {
  const { toasts } = useToastStore();

  return (
    <div className="fixed bottom-6 right-6 z-[100] flex flex-col gap-3 pointer-events-none">
      {toasts.map((toast) => (
        <div 
          key={toast.id} 
          className={`flex items-center gap-3 px-4 py-3 rounded-lg shadow-lg text-sm font-semibold pointer-events-auto animate-in slide-in-from-bottom-5 fade-in duration-300
            ${toast.type === 'success' ? 'bg-brand-primary text-white' : 'bg-red-500 text-white'}`}
        >
          {toast.type === 'success' ? <CheckCircle2 size={18} /> : <AlertCircle size={18} />}
          {toast.message}
        </div>
      ))}
    </div>
  );
}
