/**
 * Ruko Shield build-time configuration.
 *
 * Everything marked PLACEHOLDER must be replaced before publishing to a store.
 * The options page shows a visible "Placeholder" tag next to any value that
 * still matches the placeholder, so nothing fake can ship unnoticed.
 */

export interface SupportConfig {
  /** UPI ID for donations, e.g. "ruko@okicici". */
  upiId: string;
  /** Name shown next to the UPI ID. */
  upiName: string;
  /** https://ko-fi.com/<handle> */
  kofiUrl: string;
  /** https://buymeacoffee.com/<handle> */
  buyMeACoffeeUrl: string;
}

/** PLACEHOLDER values. Kept separate so the UI can detect them. */
export const SUPPORT_PLACEHOLDERS: SupportConfig = {
  upiId: 'your-upi-id@bank',
  upiName: 'Your name',
  kofiUrl: 'https://ko-fi.com/your-handle',
  buyMeACoffeeUrl: 'https://buymeacoffee.com/your-handle',
};

/** Support / donation details shown on the options page. */
export const SUPPORT: SupportConfig = {
  upiId: SUPPORT_PLACEHOLDERS.upiId, // PLACEHOLDER: set your real UPI ID
  upiName: SUPPORT_PLACEHOLDERS.upiName, // PLACEHOLDER: set the account holder name
  kofiUrl: SUPPORT_PLACEHOLDERS.kofiUrl, // PLACEHOLDER: set your Ko-fi page
  buyMeACoffeeUrl: SUPPORT_PLACEHOLDERS.buyMeACoffeeUrl, // PLACEHOLDER: set your Buy Me a Coffee page
};

export function isPlaceholder<K extends keyof SupportConfig>(key: K): boolean {
  return SUPPORT[key] === SUPPORT_PLACEHOLDERS[key];
}

/**
 * Default origin of the optional Ruko community API (ruko/web/server), e.g.
 * "https://ruko.example.app". PLACEHOLDER: empty means "not configured"; users
 * can still type their own URL on the options page. Community lookups are OFF
 * by default either way.
 */
export const DEFAULT_COMMUNITY_API_URL = '';

/** Public links used across the UI. These are real, official resources. */
export const LINKS = {
  helpline: 'tel:1930',
  cybercrime: 'https://cybercrime.gov.in',
  chakshu: 'https://sancharsaathi.gov.in/sfc/',
  /** PLACEHOLDER: where the Ruko web app is deployed (used for "Learn more"). Empty hides the link. */
  webApp: '',
  /** PLACEHOLDER: public URL of store/PRIVACY.md once hosted. Empty hides the link. */
  privacyPolicy: '',
} as const;

/** Number of history entries kept on this device (newest first). */
export const HISTORY_LIMIT = 200;

/** Hover delay before a link safety tooltip appears. */
export const LINK_HOVER_DELAY_MS = 600;

/** Minimum community reports before Ruko shows a "reported by N people" note. */
export const COMMUNITY_MIN_REPORTS = 3;
