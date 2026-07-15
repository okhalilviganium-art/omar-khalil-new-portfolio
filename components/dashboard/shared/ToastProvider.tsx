"use client";

import { createContext, useContext, useState, useCallback, useRef, useEffect } from "react";

interface ToastCtx {
  toast: (msg: string, type?: "success" | "error") => void;
}

const ToastContext = createContext<ToastCtx>({ toast: () => {} });

export function useToast() {
  return useContext(ToastContext);
}

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [msg, setMsg] = useState("");
  const [type, setType] = useState<"success" | "error">("success");
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    return () => { if (timerRef.current) clearTimeout(timerRef.current); };
  }, []);

  const toast = useCallback((m: string, t: "success" | "error" = "success") => {
    if (timerRef.current) clearTimeout(timerRef.current);
    setMsg(m);
    setType(t);
    timerRef.current = setTimeout(() => setMsg(""), 3000);
  }, []);

  return (
    <ToastContext.Provider value={{ toast }}>
      {children}
      <div className={`dash-toast${msg ? " show" : ""}`} style={{
        borderColor: type === "error" ? "var(--danger)" : undefined,
      }}>
        {msg}
      </div>
    </ToastContext.Provider>
  );
}
