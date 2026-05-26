'use client';

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from 'react';
import { IconAlert, IconCheck, IconClose, IconInfo } from '@/components/ui/Icons';

type ToastTone = 'success' | 'error' | 'info' | 'warning';

interface Toast {
  id: number;
  title?: string;
  description?: string;
  tone: ToastTone;
  duration: number;
}

interface ToastContextValue {
  toast: (input: Omit<Toast, 'id' | 'tone' | 'duration'> & {
    tone?: ToastTone;
    duration?: number;
  }) => void;
  success: (title: string, description?: string) => void;
  error: (title: string, description?: string) => void;
  info: (title: string, description?: string) => void;
}

const ToastContext = createContext<ToastContextValue | null>(null);

export function useToast(): ToastContextValue {
  const ctx = useContext(ToastContext);
  if (!ctx) {
    throw new Error('useToast debe usarse dentro de <ToastProvider>');
  }
  return ctx;
}

export function ToastProvider({ children }: { children: ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([]);

  const dismiss = useCallback((id: number) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const push = useCallback(
    (input: Omit<Toast, 'id' | 'tone' | 'duration'> & { tone?: ToastTone; duration?: number }) => {
      const id = Date.now() + Math.random();
      const toast: Toast = {
        id,
        title: input.title,
        description: input.description,
        tone: input.tone || 'info',
        duration: input.duration ?? 4000,
      };
      setToasts((prev) => [...prev, toast]);
    },
    []
  );

  const value: ToastContextValue = {
    toast: push,
    success: (title, description) => push({ title, description, tone: 'success' }),
    error: (title, description) => push({ title, description, tone: 'error', duration: 6000 }),
    info: (title, description) => push({ title, description, tone: 'info' }),
  };

  return (
    <ToastContext.Provider value={value}>
      {children}
      <Viewport toasts={toasts} onDismiss={dismiss} />
    </ToastContext.Provider>
  );
}

function Viewport({ toasts, onDismiss }: { toasts: Toast[]; onDismiss: (id: number) => void }) {
  return (
    <div
      aria-live="polite"
      aria-atomic="true"
      className="pointer-events-none fixed inset-x-0 bottom-0 z-[100] flex flex-col items-end gap-2 p-4 sm:right-0 sm:max-w-sm"
    >
      {toasts.map((t) => (
        <ToastItem key={t.id} toast={t} onDismiss={() => onDismiss(t.id)} />
      ))}
    </div>
  );
}

const tones: Record<ToastTone, { ring: string; bg: string; icon: ReactNode }> = {
  success: {
    ring: 'ring-emerald-200',
    bg: 'bg-white',
    icon: (
      <span className="flex h-7 w-7 items-center justify-center rounded-full bg-emerald-100 text-emerald-700">
        <IconCheck size={16} />
      </span>
    ),
  },
  error: {
    ring: 'ring-red-200',
    bg: 'bg-white',
    icon: (
      <span className="flex h-7 w-7 items-center justify-center rounded-full bg-red-100 text-red-700">
        <IconAlert size={16} />
      </span>
    ),
  },
  info: {
    ring: 'ring-indigo-200',
    bg: 'bg-white',
    icon: (
      <span className="flex h-7 w-7 items-center justify-center rounded-full bg-indigo-100 text-indigo-700">
        <IconInfo size={16} />
      </span>
    ),
  },
  warning: {
    ring: 'ring-amber-200',
    bg: 'bg-white',
    icon: (
      <span className="flex h-7 w-7 items-center justify-center rounded-full bg-amber-100 text-amber-700">
        <IconAlert size={16} />
      </span>
    ),
  },
};

function ToastItem({ toast, onDismiss }: { toast: Toast; onDismiss: () => void }) {
  const [open, setOpen] = useState(false);
  const t = tones[toast.tone];

  useEffect(() => {
    requestAnimationFrame(() => setOpen(true));
    const timer = window.setTimeout(() => {
      setOpen(false);
      window.setTimeout(onDismiss, 180);
    }, toast.duration);
    return () => window.clearTimeout(timer);
  }, [toast.duration, onDismiss]);

  return (
    <div
      role="status"
      className={`pointer-events-auto w-full transition-all duration-200 ${
        open ? 'translate-y-0 opacity-100' : 'translate-y-2 opacity-0'
      }`}
    >
      <div
        className={`flex items-start gap-3 rounded-xl border border-slate-200 p-3.5 shadow-[var(--shadow-overlay)] ring-1 ring-inset ${t.ring} ${t.bg}`}
      >
        {t.icon}
        <div className="min-w-0 flex-1">
          {toast.title && (
            <p className="text-sm font-semibold text-slate-900">{toast.title}</p>
          )}
          {toast.description && (
            <p className={`${toast.title ? 'mt-0.5' : ''} text-sm text-slate-600`}>
              {toast.description}
            </p>
          )}
        </div>
        <button
          aria-label="Cerrar"
          onClick={() => {
            setOpen(false);
            window.setTimeout(onDismiss, 180);
          }}
          className="rounded-md p-1 text-slate-400 transition hover:bg-slate-100 hover:text-slate-700"
        >
          <IconClose size={14} />
        </button>
      </div>
    </div>
  );
}
