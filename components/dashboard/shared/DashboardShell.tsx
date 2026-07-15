"use client";

import Sidebar from "./Sidebar";
import { ToastProvider } from "./ToastProvider";
import { OverlayProvider } from "./OverlayProvider";
import { KeyboardShortcutsProvider } from "./KeyboardShortcuts";

export default function DashboardShell({ children }: { children: React.ReactNode }) {
  return (
    <ToastProvider>
      <OverlayProvider>
        <KeyboardShortcutsProvider>
          <div className="dash-layout">
            <Sidebar />
            <main className="dash-main">
              {children}
            </main>
          </div>
        </KeyboardShortcutsProvider>
      </OverlayProvider>
    </ToastProvider>
  );
}
