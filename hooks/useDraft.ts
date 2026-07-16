"use client";

import { useState, useEffect, useCallback, useRef } from "react";

const DRAFT_PREFIX = "draft:";

export function useDraft<T extends Record<string, unknown>>(
  key: string,
  defaults: T
) {
  const draftKey = DRAFT_PREFIX + key;

  const loadedRef = useRef(false);
  const [values, setValues] = useState<T>(defaults);
  const [hasDraft, setHasDraft] = useState(false);
  const [isStale, setIsStale] = useState(false);

  const storedHashRef = useRef(hashValues(defaults));
  const prevSerializedRef = useRef("");
  const lastSyncedHashRef = useRef(hashValues(defaults));
  const defaultsRef = useRef(defaults);

  useEffect(() => {
    defaultsRef.current = defaults;
  }, [defaults]);

  // --- Load draft from localStorage on mount (client-only) ---
  useEffect(() => {
    if (loadedRef.current) return;
    loadedRef.current = true;
    try {
      const stored = localStorage.getItem(draftKey);
      if (stored) {
        const parsed = JSON.parse(stored);
        const filtered: Record<string, unknown> = {};
        const defaultKeys = Object.keys(defaults);
        for (const k of defaultKeys) {
          if (k in parsed) {
            filtered[k] = parsed[k];
          }
        }
        const merged = { ...defaults, ...filtered } as T;
        const h = hashValues(merged);
        const s = JSON.stringify(merged);
        requestAnimationFrame(() => {
          setValues(merged);
          setHasDraft(true);
          prevSerializedRef.current = s;
          storedHashRef.current = h;
        });
      }
    } catch {
      // corrupt draft — ignore
    }
  }, [draftKey]); // eslint-disable-line react-hooks/exhaustive-deps

  // --- Persist to localStorage only when data actually changes ---
  useEffect(() => {
    if (!loadedRef.current) return;
    const serialized = JSON.stringify(values);
    if (serialized === prevSerializedRef.current) return;
    try {
      localStorage.setItem(draftKey, serialized);
      requestAnimationFrame(() => setHasDraft(true));
    } catch {
      // storage full — silently ignore
    }
    prevSerializedRef.current = serialized;
  }, [values, draftKey]);

  // --- Detect external DB changes while a draft is active ---
  const dh = defaultsHash(defaults);
  useEffect(() => {
    if (!hasDraft) {
      const doUpdate = () => {
        if (isStale) setIsStale(false);
        if (storedHashRef.current !== dh) {
          storedHashRef.current = dh;
        }
      };
      requestAnimationFrame(doUpdate);
      return;
    }
    if (dh !== storedHashRef.current) {
      requestAnimationFrame(() => setIsStale(true));
    }
    storedHashRef.current = dh;
  }, [dh, hasDraft]); // eslint-disable-line react-hooks/exhaustive-deps

  // --- After save (hasDraft=false), auto-sync editor state with fresh server data ---
  useEffect(() => {
    if (!loadedRef.current) return;
    if (hasDraft) return;
    if (dh === lastSyncedHashRef.current) return;
    const fresh = defaultsRef.current;
    requestAnimationFrame(() => {
      setValues(fresh);
      prevSerializedRef.current = "";
      lastSyncedHashRef.current = dh;
    });
  }, [dh, hasDraft]); // eslint-disable-line react-hooks/exhaustive-deps

  // --- Public API ---

  const clearDraft = useCallback(() => {
    try {
      localStorage.removeItem(draftKey);
    } catch {
      // ignore
    }
    prevSerializedRef.current = "";
    setHasDraft(false);
    setIsStale(false);
  }, [draftKey]);

  const setValue = useCallback(
    <K extends keyof T>(field: K, value: T[K]) => {
      setValues((prev) => ({ ...prev, [field]: value }));
    },
    []
  );

  const setAll = useCallback((patch: Partial<T>) => {
    setValues((prev) => ({ ...prev, ...patch }));
  }, []);

  const restoreSnapshot = useCallback((data: T) => {
    setValues((prev) => ({ ...prev, ...data }));
    setIsStale(false);
  }, []);

  const reset = useCallback((fresh: T) => {
    setValues(fresh);
    prevSerializedRef.current = "";
    setHasDraft(false);
    setIsStale(false);
  }, []);

  return {
    values,
    setValues,
    setValue,
    setAll,
    clearDraft,
    reset,
    hasDraft,
    isStale,
    restoreSnapshot,
  };
}

function hashValues(obj: Record<string, unknown>): string {
  const keys = Object.keys(obj).sort();
  let h = "";
  for (const k of keys) {
    h += k + ":" + JSON.stringify(obj[k]) + "|";
  }
  return h;
}

function defaultsHash(obj: Record<string, unknown>): string {
  return hashValues(obj);
}
