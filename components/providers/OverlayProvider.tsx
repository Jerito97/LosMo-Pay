"use client";

import {
  createContext,
  useCallback,
  useContext,
  useRef,
  useState,
  type ReactNode,
} from "react";

interface ToastContextValue {
  showToast: (message: string) => void;
}

interface SheetContextValue {
  openSheet: (content: ReactNode) => void;
  closeSheet: () => void;
}

const ToastContext = createContext<ToastContextValue | null>(null);
const SheetContext = createContext<SheetContextValue | null>(null);

export function useToast() {
  const ctx = useContext(ToastContext);
  if (!ctx) throw new Error("useToast debe usarse dentro de OverlayProvider");
  return ctx;
}

export function useSheet() {
  const ctx = useContext(SheetContext);
  if (!ctx) throw new Error("useSheet debe usarse dentro de OverlayProvider");
  return ctx;
}

export function OverlayProvider({ children }: { children: ReactNode }) {
  const [toast, setToast] = useState<string | null>(null);
  const [sheet, setSheet] = useState<ReactNode | null>(null);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const showToast = useCallback((message: string) => {
    if (timerRef.current) clearTimeout(timerRef.current);
    setToast(message);
    timerRef.current = setTimeout(() => setToast(null), 2300);
  }, []);

  const openSheet = useCallback((content: ReactNode) => setSheet(content), []);
  const closeSheet = useCallback(() => setSheet(null), []);

  return (
    <ToastContext.Provider value={{ showToast }}>
      <SheetContext.Provider value={{ openSheet, closeSheet }}>
        {children}

        {sheet && (
          <div
            className="fixed inset-0 z-40 flex items-end justify-center bg-[rgba(43,16,21,0.5)] [animation:fIn_.18s_ease-out]"
            onClick={closeSheet}
          >
            <div
              className="flex max-h-[calc(100%-76px)] w-full max-w-[430px] flex-col rounded-t-[22px] bg-paper px-[22px] pt-3 shadow-[0_-18px_44px_rgba(43,16,21,0.24)] [animation:upIn_.26s_cubic-bezier(.2,.8,.3,1)]"
              style={{ paddingBottom: "calc(30px + env(safe-area-inset-bottom))" }}
              onClick={(event) => event.stopPropagation()}
            >
              <div className="mx-auto mb-4 h-1 w-10 rounded-full bg-line2" />
              {sheet}
            </div>
          </div>
        )}

        {toast && (
          <div className="pointer-events-none fixed inset-x-0 bottom-[98px] z-50 flex justify-center">
            <div className="mx-5 w-full max-w-[390px] rounded-xl bg-wine px-4 py-3.5 text-[13px] font-medium text-onwine shadow-[0_14px_30px_rgba(43,16,21,0.3)] [animation:upIn_.22s_ease-out]">
              {toast}
            </div>
          </div>
        )}
      </SheetContext.Provider>
    </ToastContext.Provider>
  );
}
