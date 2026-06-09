'use client';

import { CheckCircle2, AlertCircle, Info, XCircle, X } from 'lucide-react';
import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';

type ToastKind = 'success' | 'error' | 'info' | 'warning';

interface Toast {
  id: number;
  kind: ToastKind;
  title: string;
  description?: string;
  ttl: number;
}

interface Ctx {
  push: (kind: ToastKind, title: string, description?: string, ttl?: number) => void;
  success: (title: string, description?: string) => void;
  error:   (title: string, description?: string) => void;
  info:    (title: string, description?: string) => void;
  warning: (title: string, description?: string) => void;
}

const ToastCtx = createContext<Ctx | null>(null);

let counter = 0;

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([]);

  const remove = useCallback((id: number) => {
    setToasts((cur) => cur.filter((t) => t.id !== id));
  }, []);

  const push = useCallback((kind: ToastKind, title: string, description?: string, ttl = 5000) => {
    const id = ++counter;
    setToasts((cur) => [...cur, { id, kind, title, description, ttl }]);
    if (ttl > 0) setTimeout(() => remove(id), ttl);
  }, [remove]);

  const value = useMemo<Ctx>(() => ({
    push,
    success: (t, d) => push('success', t, d),
    error:   (t, d) => push('error', t, d, 8000),
    info:    (t, d) => push('info', t, d),
    warning: (t, d) => push('warning', t, d),
  }), [push]);

  return (
    <ToastCtx.Provider value={value}>
      {children}
      <div className="fixed top-4 right-4 z-[9999] flex flex-col gap-2 pointer-events-none max-w-sm w-[calc(100vw-2rem)]">
        {toasts.map((t) => <ToastItem key={t.id} t={t} onDismiss={() => remove(t.id)} />)}
      </div>
    </ToastCtx.Provider>
  );
}

const ICONS = {
  success: <CheckCircle2 size={18} className="text-aurora" />,
  error:   <XCircle      size={18} className="text-crimson" />,
  info:    <Info         size={18} className="text-cyan" />,
  warning: <AlertCircle  size={18} className="text-sunset" />,
};

const BORDER = {
  success: 'border-aurora/40',
  error:   'border-crimson/40',
  info:    'border-cyan/40',
  warning: 'border-sunset/40',
};

function ToastItem({ t, onDismiss }: { t: Toast; onDismiss: () => void }) {
  return (
    <div
      role="status"
      className={`pointer-events-auto glass rounded-lg border ${BORDER[t.kind]} px-4 py-3 flex items-start gap-3 shadow-lg animate-[slideIn_.2s_ease-out]`}
    >
      <span className="mt-0.5 flex-shrink-0">{ICONS[t.kind]}</span>
      <div className="flex-1 min-w-0">
        <p className="text-white text-sm font-medium">{t.title}</p>
        {t.description && <p className="text-soft-gray text-xs mt-0.5 break-words">{t.description}</p>}
      </div>
      <button onClick={onDismiss} aria-label="Dismiss" className="text-soft-gray hover:text-white transition-colors">
        <X size={14} />
      </button>
    </div>
  );
}

export function useToast(): Ctx {
  const ctx = useContext(ToastCtx);
  if (!ctx) {
    // graceful no-op outside provider
    return {
      push: () => {}, success: () => {}, error: () => {}, info: () => {}, warning: () => {},
    };
  }
  return ctx;
}

// Hook into legacy code that doesn't yet use the provider — call from anywhere.
let bridge: Ctx | null = null;
export function registerToastBridge(ctx: Ctx) { bridge = ctx; }
export const toast: Ctx = {
  push:    (...a) => bridge?.push(...a),
  success: (...a) => bridge?.success(...a),
  error:   (...a) => bridge?.error(...a),
  info:    (...a) => bridge?.info(...a),
  warning: (...a) => bridge?.warning(...a),
};
