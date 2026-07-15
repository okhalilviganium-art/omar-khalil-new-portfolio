"use client";

import { useEffect, useCallback } from "react";
import { useOverlay } from "./OverlayProvider";

export function KeyboardShortcutsProvider({ children }: { children: React.ReactNode }) {
  const { openSearch } = useOverlay();

  const handleKeyDown = useCallback((e: KeyboardEvent) => {
    const ctrl = e.ctrlKey || e.metaKey;
    const isInput = (e.target as HTMLElement)?.tagName === "INPUT" || (e.target as HTMLElement)?.tagName === "TEXTAREA" || (e.target as HTMLElement)?.tagName === "SELECT";

    if (ctrl && e.key === "k") {
      e.preventDefault();
      openSearch();
      return;
    }

    if (ctrl && e.key === "s") {
      e.preventDefault();
      const saveBtn = document.querySelector("[data-shortcut='save']") as HTMLButtonElement;
      if (saveBtn) saveBtn.click();
      return;
    }

    if (isInput) return;

    if (e.key === "Escape") {
      const modal = document.querySelector("[data-modal-close]") as HTMLButtonElement;
      if (modal) modal.click();
      return;
    }

    if (e.key === "Delete" || e.key === "Backspace") {
      const deleteBtn = document.querySelector("[data-shortcut='delete']") as HTMLButtonElement;
      if (deleteBtn) deleteBtn.click();
      return;
    }

    if (e.key === "ArrowDown" || e.key === "ArrowUp") {
      const items = document.querySelectorAll("[data-nav-item]");
      if (items.length === 0) return;
      const arr = Array.from(items);
      const current = arr.findIndex((el) => el === document.activeElement || el.contains(document.activeElement));
      let next: number;
      if (e.key === "ArrowDown") {
        next = current < arr.length - 1 ? current + 1 : 0;
      } else {
        next = current > 0 ? current - 1 : arr.length - 1;
      }
      (arr[next] as HTMLElement).focus();
      e.preventDefault();
    }

    if (e.key === "Enter") {
      const focused = document.activeElement as HTMLElement;
      if (focused?.getAttribute("data-nav-item")) {
        focused.click();
      }
    }
  }, [openSearch]);

  useEffect(() => {
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [handleKeyDown]);

  return <>{children}</>;
}
