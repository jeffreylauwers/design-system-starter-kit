import { describe, it, expect } from 'vitest';
import { clearSession, loadSession, saveSession, STORAGE_KEY } from './storage';
import type { Session } from './storage';
import { defaultConfig } from './theme';

function memoryStore(initial: Record<string, string> = {}): Storage {
  const data = new Map(Object.entries(initial));
  return {
    get length() {
      return data.size;
    },
    clear: () => data.clear(),
    getItem: (key) => data.get(key) ?? null,
    key: (index) => [...data.keys()][index] ?? null,
    removeItem: (key) => void data.delete(key),
    setItem: (key, value) => void data.set(key, value),
  };
}

function throwingStore(): Storage {
  const fail = () => {
    throw new Error('blocked');
  };
  return { ...memoryStore(), getItem: fail, setItem: fail, removeItem: fail };
}

const SESSION: Session = {
  version: 1,
  config: defaultConfig(),
  mode: 'dark',
  format: 'oklch',
  showInverse: true,
};

describe('sessie in localStorage', () => {
  it('bewaart en leest de sessie terug', () => {
    const store = memoryStore();
    saveSession(SESSION, store);
    expect(loadSession(store)).toEqual(SESSION);
    clearSession(store);
    expect(loadSession(store)).toBeNull();
  });

  it('negeert een sessie die niet te gebruiken is', () => {
    const withoutAccent = defaultConfig();
    delete withoutAccent.colors.groups['accent-1'];
    for (const raw of [
      'geen json',
      JSON.stringify({ ...SESSION, version: 2 }),
      JSON.stringify({ ...SESSION, mode: 'sepia' }),
      JSON.stringify({ ...SESSION, config: { colors: {} } }),
      JSON.stringify({ ...SESSION, config: withoutAccent }),
    ]) {
      expect(loadSession(memoryStore({ [STORAGE_KEY]: raw })), raw).toBeNull();
    }
  });

  it('werkt zonder localStorage of als die alles weigert', () => {
    expect(loadSession(null)).toBeNull();
    expect(() => saveSession(SESSION, null)).not.toThrow();
    const store = throwingStore();
    expect(loadSession(store)).toBeNull();
    expect(() => saveSession(SESSION, store)).not.toThrow();
    expect(() => clearSession(store)).not.toThrow();
  });
});
