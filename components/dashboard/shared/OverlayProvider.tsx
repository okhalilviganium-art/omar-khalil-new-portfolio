"use client";

import { createContext, useContext, useState, useEffect, useCallback, useRef } from "react";
import { useRouter } from "next/navigation";
import { useToast } from "./ToastProvider";
import { globalSearch, type SearchResult } from "@/lib/actions/search";

interface Command {
  id: string;
  label: string;
  icon: string;
  shortcut?: string;
  action: () => void;
}

interface OverlayCtx {
  openSearch: () => void;
  openCommandPalette: () => void;
  registerCommands: (cmds: Command[]) => void;
  unreadCount: number;
  setUnreadCount: React.Dispatch<React.SetStateAction<number>>;
}

const OverlayContext = createContext<OverlayCtx>({
  openSearch: () => {},
  openCommandPalette: () => {},
  registerCommands: () => {},
  unreadCount: 0,
  setUnreadCount: () => {},
});

export function useOverlay() {
  return useContext(OverlayContext);
}

export function OverlayProvider({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const { toast } = useToast();
  const [showSearch, setShowSearch] = useState(false);
  const [showCommands, setShowCommands] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState<SearchResult[]>([]);
  const [searchLoading, setSearchLoading] = useState(false);
  const [searchIndex, setSearchIndex] = useState(0);
  const [commands, setCommands] = useState<Command[]>([]);
  const [cmdIndex, setCmdIndex] = useState(0);
  const [unreadCount, setUnreadCount] = useState(0);
  const searchRef = useRef<HTMLInputElement>(null);
  const cmdRef = useRef<HTMLInputElement>(null);

  const defaultCommands: Command[] = [
    { id: "create-project", label: "Create Project", icon: "bi-folder-plus", shortcut: "", action: () => { router.push("/dashboard/portfolio"); closeAll(); } },
    { id: "upload-media", label: "Upload Media", icon: "bi-cloud-upload", shortcut: "", action: () => { router.push("/dashboard/media"); closeAll(); } },
    { id: "open-media", label: "Open Media Library", icon: "bi-collection", shortcut: "", action: () => { router.push("/dashboard/media"); closeAll(); } },
    { id: "open-hero", label: "Open Hero", icon: "bi-image", shortcut: "", action: () => { router.push("/dashboard/hero"); closeAll(); } },
    { id: "open-about", label: "Open About", icon: "bi-person", shortcut: "", action: () => { router.push("/dashboard/about"); closeAll(); } },
    { id: "open-services", label: "Open Services", icon: "bi-lightning", shortcut: "", action: () => { router.push("/dashboard/services"); closeAll(); } },
    { id: "open-messages", label: "Open Messages", icon: "bi-chat-dots", shortcut: "", action: () => { router.push("/dashboard/messages"); closeAll(); } },
    { id: "open-portfolio", label: "Open Portfolio", icon: "bi-folder", shortcut: "", action: () => { router.push("/dashboard/portfolio"); closeAll(); } },
    { id: "open-statistics", label: "Open Statistics", icon: "bi-bar-chart", shortcut: "", action: () => { router.push("/dashboard/statistics"); closeAll(); } },
    { id: "open-settings", label: "Open Settings", icon: "bi-gear", shortcut: "", action: () => { router.push("/dashboard/settings"); closeAll(); } },
    { id: "open-social", label: "Open Social Links", icon: "bi-share", shortcut: "", action: () => { router.push("/dashboard/social-links"); closeAll(); } },
    { id: "view-site", label: "View Site", icon: "bi-box-arrow-up-right", shortcut: "", action: () => { window.open("/", "_blank"); closeAll(); } },
    { id: "go-overview", label: "Go to Overview", icon: "bi-grid", shortcut: "", action: () => { router.push("/dashboard"); closeAll(); } },
  ];

  const allCommands = [...defaultCommands, ...commands];

  const closeAll = useCallback(() => {
    setShowSearch(false);
    setShowCommands(false);
    setSearchQuery("");
    setSearchResults([]);
    setSearchIndex(0);
    setCmdIndex(0);
  }, []);

  const openSearch = useCallback(() => { closeAll(); setShowSearch(true); }, [closeAll]);
  const openCommandPalette = useCallback(() => { closeAll(); setShowCommands(true); }, [closeAll]);

  const registerCommands = useCallback((cmds: Command[]) => {
    setCommands((prev) => {
      const ids = new Set(cmds.map((c) => c.id));
      const filtered = prev.filter((c) => !ids.has(c.id));
      return [...filtered, ...cmds];
    });
  }, []);

  useEffect(() => {
    if (showSearch) setTimeout(() => searchRef.current?.focus(), 50);
    if (showCommands) setTimeout(() => cmdRef.current?.focus(), 50);
  }, [showSearch, showCommands]);

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === "k") {
        e.preventDefault();
        if (showSearch || showCommands) closeAll();
        else openSearch();
      }
      if (e.key === "Escape") closeAll();
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [showSearch, showCommands, closeAll, openSearch]);

  useEffect(() => {
    if (!searchQuery || searchQuery.length < 2) { setSearchResults([]); return; }
    const timer = setTimeout(async () => {
      setSearchLoading(true);
      try {
        const results = await globalSearch(searchQuery);
        setSearchResults(results);
        setSearchIndex(0);
      } catch {}
      setSearchLoading(false);
    }, 200);
    return () => clearTimeout(timer);
  }, [searchQuery]);

  const handleSearchKey = (e: React.KeyboardEvent) => {
    if (e.key === "ArrowDown") { e.preventDefault(); setSearchIndex((i) => Math.min(i + 1, searchResults.length - 1)); }
    if (e.key === "ArrowUp") { e.preventDefault(); setSearchIndex((i) => Math.max(i - 1, 0)); }
    if (e.key === "Enter" && searchResults[searchIndex]) {
      router.push(searchResults[searchIndex].url);
      closeAll();
    }
    if (e.key === "Tab") {
      e.preventDefault();
      closeAll();
      setShowCommands(true);
    }
  };

  const handleCmdKey = (e: React.KeyboardEvent) => {
    if (e.key === "ArrowDown") { e.preventDefault(); setCmdIndex((i) => Math.min(i + 1, allCommands.length - 1)); }
    if (e.key === "ArrowUp") { e.preventDefault(); setCmdIndex((i) => Math.max(i - 1, 0)); }
    if (e.key === "Enter" && allCommands[cmdIndex]) { allCommands[cmdIndex].action(); }
    if (e.key === "Tab") {
      e.preventDefault();
      closeAll();
      setShowSearch(true);
    }
  };

  const cmdFilter = showCommands ? allCommands : [];

  return (
    <OverlayContext.Provider value={{ openSearch, openCommandPalette, registerCommands, unreadCount, setUnreadCount }}>
      {children}

      {showSearch && (
        <div style={{ position: "fixed", inset: 0, zIndex: 9999, background: "rgba(2,4,9,.8)", backdropFilter: "blur(8px)", display: "flex", alignItems: "flex-start", justifyContent: "center", paddingTop: "15vh" }}
          onClick={closeAll}>
          <div onClick={(e) => e.stopPropagation()} style={{ width: "100%", maxWidth: 560, background: "var(--bg-card)", border: "1px solid var(--border)", borderRadius: 12, overflow: "hidden", boxShadow: "0 24px 80px rgba(0,0,0,.5)" }}>
            <div style={{ display: "flex", alignItems: "center", padding: ".75rem 1rem", borderBottom: "1px solid var(--border)" }}>
              <i className="bi bi-search" style={{ color: "var(--accent)", fontSize: "1rem", marginRight: ".75rem" }} />
              <input ref={searchRef} value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)}
                onKeyDown={handleSearchKey} placeholder="Search projects, media, messages..." aria-label="Search dashboard"
                style={{ flex: 1, background: "none", border: "none", color: "var(--text)", fontFamily: "'Outfit',sans-serif", fontSize: ".95rem", outline: "none" }} />
              <span style={{ fontFamily: "'Space Mono',monospace", fontSize: ".55rem", color: "var(--text-muted)", padding: ".15rem .4rem", background: "var(--bg-input)", borderRadius: 4, border: "1px solid var(--border)" }}>ESC</span>
            </div>
            <div style={{ maxHeight: 360, overflow: "auto" }}>
              {searchLoading && <div style={{ padding: "1.5rem", textAlign: "center", color: "var(--text-muted)", fontFamily: "'Space Mono',monospace", fontSize: ".75rem" }}>Searching...</div>}
              {!searchLoading && searchQuery.length >= 2 && searchResults.length === 0 && (
                <div style={{ padding: "1.5rem", textAlign: "center", color: "var(--text-muted)", fontFamily: "'Space Mono',monospace", fontSize: ".75rem" }}>No results found</div>
              )}
              {searchResults.map((r, i) => (
                <div key={r.type + r.id} onClick={() => { router.push(r.url); closeAll(); }}
                  style={{ display: "flex", alignItems: "center", gap: ".75rem", padding: ".65rem 1rem", cursor: "pointer", background: i === searchIndex ? "rgba(108,99,255,.1)" : "transparent", transition: "background .1s" }}>
                  <i className={`bi ${r.icon}`} style={{ fontSize: ".85rem", color: "var(--accent)", width: 20, textAlign: "center" }} />
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontFamily: "'Outfit',sans-serif", fontSize: ".85rem", fontWeight: 500 }}>{r.title}</div>
                    <div style={{ fontFamily: "'Space Mono',monospace", fontSize: ".6rem", color: "var(--text-muted)" }}>{r.subtitle}</div>
                  </div>
                  <span style={{ fontFamily: "'Space Mono',monospace", fontSize: ".5rem", color: "var(--text-muted)", textTransform: "capitalize", padding: ".1rem .35rem", background: "var(--bg-input)", borderRadius: 4 }}>{r.type}</span>
                </div>
              ))}
              {!searchLoading && searchQuery.length < 2 && (
                <div style={{ padding: "1rem", textAlign: "center", color: "var(--text-muted)", fontFamily: "'Space Mono',monospace", fontSize: ".65rem" }}>
                  Type 2+ characters to search... Press <b>Tab</b> for commands
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {showCommands && (
        <div style={{ position: "fixed", inset: 0, zIndex: 9999, background: "rgba(2,4,9,.8)", backdropFilter: "blur(8px)", display: "flex", alignItems: "flex-start", justifyContent: "center", paddingTop: "15vh" }}
          onClick={closeAll}>
          <div onClick={(e) => e.stopPropagation()} style={{ width: "100%", maxWidth: 480, background: "var(--bg-card)", border: "1px solid var(--border)", borderRadius: 12, overflow: "hidden", boxShadow: "0 24px 80px rgba(0,0,0,.5)" }}>
            <div style={{ display: "flex", alignItems: "center", padding: ".75rem 1rem", borderBottom: "1px solid var(--border)" }}>
              <i className="bi bi-terminal" style={{ color: "var(--accent)", fontSize: "1rem", marginRight: ".75rem" }} />
              <input ref={cmdRef} value={""} onKeyDown={handleCmdKey}
                placeholder="Type a command..." aria-label="Command palette"
                style={{ flex: 1, background: "none", border: "none", color: "var(--text)", fontFamily: "'Outfit',sans-serif", fontSize: ".95rem", outline: "none" }} />
              <span style={{ fontFamily: "'Space Mono',monospace", fontSize: ".55rem", color: "var(--text-muted)", padding: ".15rem .4rem", background: "var(--bg-input)", borderRadius: 4, border: "1px solid var(--border)" }}>ESC</span>
            </div>
            <div style={{ maxHeight: 360, overflow: "auto" }}>
              {cmdFilter.map((c, i) => (
                <div key={c.id} onClick={c.action}
                  style={{ display: "flex", alignItems: "center", gap: ".75rem", padding: ".65rem 1rem", cursor: "pointer", background: i === cmdIndex ? "rgba(108,99,255,.1)" : "transparent", transition: "background .1s" }}>
                  <i className={`bi ${c.icon}`} style={{ fontSize: ".85rem", color: "var(--accent)", width: 20, textAlign: "center" }} />
                  <span style={{ fontFamily: "'Outfit',sans-serif", fontSize: ".85rem", fontWeight: 500, flex: 1 }}>{c.label}</span>
                  {c.shortcut && <span style={{ fontFamily: "'Space Mono',monospace", fontSize: ".55rem", color: "var(--text-muted)" }}>{c.shortcut}</span>}
                </div>
              ))}
              <div style={{ padding: ".75rem 1rem", borderTop: "1px solid var(--border)", color: "var(--text-muted)", fontFamily: "'Space Mono',monospace", fontSize: ".55rem", textAlign: "center" }}>
                Press <b>Tab</b> to switch to search &middot; <b>&uarr;&darr;</b> to navigate &middot; <b>Enter</b> to select
              </div>
            </div>
          </div>
        </div>
      )}
    </OverlayContext.Provider>
  );
}
