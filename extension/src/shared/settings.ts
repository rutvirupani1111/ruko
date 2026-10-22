import { browser } from 'wxt/browser';
import type { Locale } from '@ruko/engine';
import { DEFAULT_COMMUNITY_API_URL } from '../config';
import { WARN_AT_VALUES, type WarnAt } from './severity';
import { siteKey } from './url';

export interface Settings {
  /** Language of every Ruko string, including verdicts. */
  locale: Locale;
  /** Warn at this severity and above. */
  warnAt: WarnAt;
  /** Badges on WhatsApp Web messages (plus link tooltips there). */
  whatsapp: boolean;
  /** Banner on Gmail emails (plus link tooltips there). */
  gmail: boolean;
  /** Link safety tooltips on every website, not only WhatsApp Web and Gmail. */
  linkTooltipsEverywhere: boolean;
  /** Full-page warning on websites that pretend to be a bank, brand or government site. */
  lookalikeShield: boolean;
  /** Confirmation before a upi:// link opens a payment app. */
  upiGuard: boolean;
  /** Keep a history of checks and warnings on this device. */
  keepHistory: boolean;
  /** Optional k-anonymity community lookups. OFF by default. */
  community: boolean;
  /** Origin of the Ruko community API (ruko/web/server). */
  communityApiUrl: string;
  /** Sites (siteKey) where the user switched Ruko off from the popup. */
  disabledSites: string[];
  /** Sites (siteKey) the user chose "Continue anyway" for on the lookalike warning. */
  allowedSites: string[];
}

export const SETTINGS_KEY = 'settings';

export const DEFAULT_SETTINGS: Readonly<Settings> = Object.freeze({
  locale: 'en',
  warnAt: 'medium',
  whatsapp: true,
  gmail: true,
  linkTooltipsEverywhere: false,
  lookalikeShield: true,
  upiGuard: true,
  keepHistory: true,
  community: false,
  communityApiUrl: DEFAULT_COMMUNITY_API_URL,
  disabledSites: [],
  allowedSites: [],
} satisfies Settings);

const BOOLEAN_KEYS = [
  'whatsapp',
  'gmail',
  'linkTooltipsEverywhere',
  'lookalikeShield',
  'upiGuard',
  'keepHistory',
  'community',
] as const satisfies ReadonlyArray<keyof Settings>;

const MAX_SITE_LIST = 500;

function cleanSiteList(value: unknown): string[] {
  if (!Array.isArray(value)) return [];
  const out = new Set<string>();
  for (const item of value) {
    if (typeof item !== 'string') continue;
    const key = siteKey(item.trim());
    if (key && key.length <= 253) out.add(key);
  }
  return [...out].slice(-MAX_SITE_LIST);
}

export function normalizeApiUrl(value: string): string {
  const trimmed = value.trim().replace(/\/+$/, '');
  if (!trimmed) return '';
  try {
    const url = new URL(trimmed);
    if (url.protocol !== 'https:' && !(url.protocol === 'http:' && /^(localhost|127\.0\.0\.1|\[::1\])$/.test(url.hostname))) {
      return '';
    }
    return `${url.origin}${url.pathname.replace(/\/+$/, '')}`;
  } catch {
    return '';
  }
}

/** Accepts anything read from storage and returns a complete, valid Settings object. */
export function sanitizeSettings(raw: unknown): Settings {
  const input = (raw && typeof raw === 'object' ? raw : {}) as Record<string, unknown>;
  const settings: Settings = { ...DEFAULT_SETTINGS, disabledSites: [], allowedSites: [] };
  if (input.locale === 'en' || input.locale === 'hi') settings.locale = input.locale;
  if (typeof input.warnAt === 'string' && (WARN_AT_VALUES as readonly string[]).includes(input.warnAt)) {
    settings.warnAt = input.warnAt as WarnAt;
  }
  for (const key of BOOLEAN_KEYS) {
    if (typeof input[key] === 'boolean') settings[key] = input[key] as boolean;
  }
  if (typeof input.communityApiUrl === 'string') settings.communityApiUrl = normalizeApiUrl(input.communityApiUrl);
  settings.disabledSites = cleanSiteList(input.disabledSites);
  settings.allowedSites = cleanSiteList(input.allowedSites);
  return settings;
}

export async function getSettings(): Promise<Settings> {
  try {
    const stored = await browser.storage.local.get(SETTINGS_KEY);
    return sanitizeSettings(stored[SETTINGS_KEY]);
  } catch {
    return sanitizeSettings(undefined);
  }
}

export async function saveSettings(settings: Settings): Promise<Settings> {
  const clean = sanitizeSettings(settings);
  await browser.storage.local.set({ [SETTINGS_KEY]: clean });
  return clean;
}

export async function updateSettings(patch: Partial<Settings>): Promise<Settings> {
  const current = await getSettings();
  return saveSettings({ ...current, ...patch });
}

/** Calls `listener` with fresh settings whenever they change in any extension context. */
export function watchSettings(listener: (settings: Settings) => void): () => void {
  const onChanged = (changes: Record<string, { newValue?: unknown }>, area: string) => {
    if (area !== 'local' || !(SETTINGS_KEY in changes)) return;
    listener(sanitizeSettings(changes[SETTINGS_KEY]?.newValue));
  };
  browser.storage.onChanged.addListener(onChanged);
  return () => browser.storage.onChanged.removeListener(onChanged);
}

export function isSiteDisabled(settings: Settings, hostname: string): boolean {
  return settings.disabledSites.includes(siteKey(hostname));
}

export function isSiteAllowed(settings: Settings, hostname: string): boolean {
  const key = siteKey(hostname);
  return settings.allowedSites.some((site) => key === site || key.endsWith(`.${site}`));
}

export function withSiteDisabled(settings: Settings, hostname: string, disabled: boolean): Settings {
  const key = siteKey(hostname);
  const rest = settings.disabledSites.filter((site) => site !== key);
  return { ...settings, disabledSites: disabled ? [...rest, key] : rest };
}

export function withSiteAllowed(settings: Settings, hostname: string, allowed: boolean): Settings {
  const key = siteKey(hostname);
  const rest = settings.allowedSites.filter((site) => site !== key);
  return { ...settings, allowedSites: allowed ? [...rest, key] : rest };
}
