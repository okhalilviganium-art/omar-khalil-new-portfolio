"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { usePathname } from "next/navigation";

export function useUnsavedChanges(hasChanges: boolean) {
  const pathname = usePathname();
  const [showPrompt, setShowPrompt] = useState(false);
  const [pendingPath, setPendingPath] = useState<string | null>(null);
  const lastPath = useRef(pathname);

  useEffect(() => {
    const handler = (e: BeforeUnloadEvent) => {
      if (hasChanges) {
        e.preventDefault();
        e.returnValue = "";
      }
    };
    window.addEventListener("beforeunload", handler);
    return () => window.removeEventListener("beforeunload", handler);
  }, [hasChanges]);

  useEffect(() => {
    if (pathname !== lastPath.current) {
      lastPath.current = pathname;
    }
  }, [pathname]);

  const confirmNavigation = useCallback((path: string) => {
    if (hasChanges) {
      setPendingPath(path);
      setShowPrompt(true);
      return false;
    }
    return true;
  }, [hasChanges]);

  const handleConfirm = useCallback(() => {
    setShowPrompt(false);
    if (pendingPath) {
      window.location.href = pendingPath;
      setPendingPath(null);
    }
  }, [pendingPath]);

  const handleCancel = useCallback(() => {
    setShowPrompt(false);
    setPendingPath(null);
  }, []);

  return { showPrompt, confirmNavigation, handleConfirm, handleCancel };
}

export function UnsavedChangesPrompt({ show, onConfirm, onCancel }: { show: boolean; onConfirm: () => void; onCancel: () => void }) {
  if (!show) return null;

  return (
    <div style={{ position: "fixed", inset: 0, zIndex: 10000, background: "rgba(2,4,9,.7)", backdropFilter: "blur(4px)", display: "flex", alignItems: "center", justifyContent: "center" }}
      onClick={onCancel}>
      <div onClick={(e) => e.stopPropagation()} style={{ width: 400, background: "var(--bg-card)", border: "1px solid var(--border)", borderRadius: 12, padding: "1.5rem", boxShadow: "0 16px 48px rgba(0,0,0,.5)" }}>
        <div style={{ display: "flex", alignItems: "center", gap: ".75rem", marginBottom: "1rem" }}>
          <div style={{ width: 40, height: 40, borderRadius: "50%", background: "rgba(255,170,0,.1)", display: "flex", alignItems: "center", justifyContent: "center" }}>
            <i className="bi bi-exclamation-triangle" style={{ color: "#ffaa00", fontSize: "1.1rem" }} />
          </div>
          <div>
            <div style={{ fontFamily: "'Bebas Neue',sans-serif", fontSize: "1.1rem", letterSpacing: ".04em" }}>Unsaved Changes</div>
            <div style={{ fontFamily: "'Space Mono',monospace", fontSize: ".65rem", color: "var(--text-muted)" }}>You have unsaved changes that will be lost.</div>
          </div>
        </div>
        <div style={{ display: "flex", gap: ".5rem", justifyContent: "flex-end" }}>
          <button className="dash-btn" onClick={onCancel} style={{ fontSize: ".75rem" }}>Stay</button>
          <button className="dash-btn dash-btn-danger" onClick={onConfirm} style={{ fontSize: ".75rem" }}>Leave anyway</button>
        </div>
      </div>
    </div>
  );
}
