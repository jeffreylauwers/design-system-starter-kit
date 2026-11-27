import { validateThemeConfig } from '@dsn-starter-kit/theme-engine';
import type { ColorMode, ThemeConfig } from '@dsn-starter-kit/theme-engine';
import { START_GROUP_NAMES } from './start';

/**
 * The last session, kept in localStorage so a reload continues where you
 * were. localStorage can be missing, full or blocked (private window,
 * disabled site data); every access is in a try/catch and the configurator
 * works the same without it, starting from Start.
 */

export const STORAGE_KEY = 'dsn-theme-configurator';

export interface Session {
  version: 1;
  config: ThemeConfig;
  mode: ColorMode;
  format: 'oklch' | 'hex';
  showInverse: boolean;
}

function storage(): Storage | null {
  try {
    return globalThis.localStorage ?? null;
  } catch {
    return null;
  }
}

function isSession(value: unknown): value is Session {
  const session = value as Partial<Session> | null;
  return (
    !!session &&
    session.version === 1 &&
    (session.mode === 'light' || session.mode === 'dark') &&
    (session.format === 'oklch' || session.format === 'hex') &&
    typeof session.showInverse === 'boolean' &&
    validateThemeConfig(session.config).length === 0 &&
    // Start's groups cannot be removed in the configurator; a session
    // without one of them is not ours.
    START_GROUP_NAMES.every(
      (name) => name in (session.config as ThemeConfig).colors.groups
    )
  );
}

/** The saved session, or null when there is none or it cannot be used. */
export function loadSession(store = storage()): Session | null {
  try {
    const raw = store?.getItem(STORAGE_KEY);
    if (!raw) return null;
    const session: unknown = JSON.parse(raw);
    return isSession(session) ? session : null;
  } catch {
    return null;
  }
}

/** Saves the session; does nothing when localStorage is not available. */
export function saveSession(session: Session, store = storage()): void {
  try {
    store?.setItem(STORAGE_KEY, JSON.stringify(session));
  } catch {
    // Full or blocked: the session is simply not kept.
  }
}

export function clearSession(store = storage()): void {
  try {
    store?.removeItem(STORAGE_KEY);
  } catch {
    // Nothing to clear.
  }
}
