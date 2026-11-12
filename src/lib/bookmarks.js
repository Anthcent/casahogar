import { useSyncExternalStore } from 'react';

const STORAGE_KEY = 'casahogar_bookmarks_v1';
const EMPTY = [];
const listeners = new Set();
let snapshot = read();

function read() {
  try {
    const parsed = JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]');
    return Array.isArray(parsed) ? parsed.filter(id => typeof id === 'string') : EMPTY;
  } catch {
    return EMPTY;
  }
}

function emit() {
  listeners.forEach(listener => listener());
}

function write(next) {
  snapshot = next;
  try { localStorage.setItem(STORAGE_KEY, JSON.stringify(next)); } catch { /* storage unavailable: keep in memory */ }
  emit();
}

function subscribe(listener) {
  listeners.add(listener);
  // Keep several open tabs in sync.
  const onStorage = event => {
    if (event.key === STORAGE_KEY) {
      snapshot = read();
      emit();
    }
  };
  window.addEventListener('storage', onStorage);
  return () => {
    listeners.delete(listener);
    window.removeEventListener('storage', onStorage);
  };
}

export function toggleBookmark(id) {
  write(snapshot.includes(id) ? snapshot.filter(item => item !== id) : [...snapshot, id]);
}

/** Saved article ids, persisted in this browser. */
export function useBookmarks() {
  return useSyncExternalStore(subscribe, () => snapshot, () => EMPTY);
}
