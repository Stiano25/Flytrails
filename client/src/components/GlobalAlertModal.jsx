import { useEffect, useState } from 'react';
import { Info } from 'lucide-react';

export default function GlobalAlertModal() {
  const [message, setMessage] = useState('');

  useEffect(() => {
    const nativeAlert = window.alert;

    window.alert = (text) => {
      setMessage(String(text || ''));
    };

    return () => {
      window.alert = nativeAlert;
    };
  }, []);

  if (!message) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-end justify-center bg-black/50 p-4 pb-[max(1rem,env(safe-area-inset-bottom))] sm:items-center sm:pb-4">
      <div className="max-h-[min(85vh,32rem)] w-full max-w-md overflow-y-auto rounded-2xl bg-white p-5 shadow-2xl sm:p-6">
        <div className="mb-3 flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10 text-primary">
            <Info className="h-5 w-5" />
          </div>
          <h3 className="font-display text-lg font-bold text-slate-800">Notice</h3>
        </div>
        <p className="text-sm leading-relaxed text-slate-600">{message}</p>
        <button
          onClick={() => setMessage('')}
          className="mt-5 w-full rounded-xl bg-primary py-2.5 text-sm font-semibold text-white hover:bg-primary/90"
        >
          Okay
        </button>
      </div>
    </div>
  );
}
