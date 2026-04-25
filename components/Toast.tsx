import { createContext, useCallback, useContext, useEffect, useRef, useState } from "react";
import classNames from "@lib/classnames";

type ToastType = "success" | "error";

interface Toast {
  id: number;
  message: React.ReactNode;
  type: ToastType;
}

interface ToastContextProps {
  showSuccessToast: (message: React.ReactNode) => void;
  showErrorToast: (message: React.ReactNode) => void;
}

const ToastContext = createContext<ToastContextProps | undefined>(undefined);

export const useToast = () => {
  const context = useContext(ToastContext);
  if (!context) throw new Error("useToast must be used within a ToastProvider");
  return context;
};

let nextId = 0;

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([]);
  const [exiting, setExiting] = useState<Set<number>>(new Set());
  const timers = useRef<Map<number, ReturnType<typeof setTimeout>>>(new Map());

  const dismiss = useCallback((id: number) => {
    setExiting((prev) => new Set(prev).add(id));
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
      setExiting((prev) => {
        const next = new Set(prev);
        next.delete(id);
        return next;
      });
    }, 200); // match the CSS leave animation
  }, []);

  const add = useCallback(
    (message: React.ReactNode, type: ToastType) => {
      const id = ++nextId;
      setToasts((prev) => [...prev, { id, message, type }]);
      const timer = setTimeout(() => dismiss(id), 3000);
      timers.current.set(id, timer);
    },
    [dismiss],
  );

  useEffect(() => {
    const t = timers.current;
    return () => t.forEach(clearTimeout);
  }, []);

  const showSuccessToast = useCallback((m: React.ReactNode) => add(m, "success"), [add]);
  const showErrorToast = useCallback((m: React.ReactNode) => add(m, "error"), [add]);

  return (
    <ToastContext.Provider value={{ showSuccessToast, showErrorToast }}>
      {children}
      {toasts.length > 0 && (
        <div className="pointer-events-none fixed inset-x-0 bottom-0 z-50 flex flex-col items-center gap-2 p-4">
          {toasts.map((t) => (
            <button
              key={t.id}
              type="button"
              onClick={() => dismiss(t.id)}
              className={classNames(
                "pointer-events-auto flex max-w-sm items-center gap-2 rounded-lg px-4 py-2.5 text-sm font-medium shadow-lg backdrop-blur transition-all duration-200",
                {
                  "animate-toast-in": !exiting.has(t.id),
                  "animate-toast-out": exiting.has(t.id),
                  "border border-green-500/30 bg-green-50/95 text-green-800 dark:bg-green-900/90 dark:text-green-100":
                    t.type === "success",
                  "border border-red-500/30 bg-red-50/95 text-red-800 dark:bg-red-900/90 dark:text-red-100":
                    t.type === "error",
                },
              )}
            >
              <span className="shrink-0 text-base" aria-hidden>
                {t.type === "success" ? "✓" : "✕"}
              </span>
              <span>{t.message}</span>
            </button>
          ))}
        </div>
      )}
    </ToastContext.Provider>
  );
}
