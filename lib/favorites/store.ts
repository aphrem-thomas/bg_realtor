"use client";

import { useSyncExternalStore } from "react";

/**
 * Saved (favourite) listings, stored in localStorage on the visitor's device.
 * No account needed. Can later be synced to a user profile or captured as a
 * lead signal ("saved 5 homes in Kanata").
 */
const KEY = "saved-listings:v1";
const EVENT = "saved-listings-change";
const EMPTY: string[] = [];

let cache: { raw: string | null; keys: string[] } = { raw: null, keys: EMPTY };

function read(): string[] {
  let raw: string | null = null;
  try {
    raw = window.localStorage.getItem(KEY);
  } catch {
    return cache.keys;
  }
  if (raw === cache.raw) return cache.keys;
  let keys: string[] = EMPTY;
  try {
    const parsed = raw ? JSON.parse(raw) : [];
    keys = Array.isArray(parsed) ? parsed.filter((k): k is string => typeof k === "string").slice(0, 100) : EMPTY;
  } catch {
    keys = EMPTY;
  }
  cache = { raw, keys };
  return keys;
}

function write(keys: string[]) {
  try {
    window.localStorage.setItem(KEY, JSON.stringify(keys));
  } catch {
    // Storage unavailable (private mode / blocked) — keep in-memory state only.
    cache = { raw: cache.raw, keys };
  }
  window.dispatchEvent(new Event(EVENT));
}

function subscribe(callback: () => void) {
  const onStorage = (event: StorageEvent) => event.key === KEY && callback();
  window.addEventListener(EVENT, callback);
  window.addEventListener("storage", onStorage);
  return () => {
    window.removeEventListener(EVENT, callback);
    window.removeEventListener("storage", onStorage);
  };
}

export function useSavedListings(): string[] {
  return useSyncExternalStore(subscribe, read, () => EMPTY);
}

export function toggleSavedListing(key: string): boolean {
  const current = read();
  const saved = !current.includes(key);
  write(saved ? [key, ...current] : current.filter((k) => k !== key));
  return saved;
}
