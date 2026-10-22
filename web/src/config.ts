/**
 * Site configuration. Everything marked `placeholder: true` is NOT real yet:
 * replace the value, then set `placeholder: false`. Placeholder links are shown
 * in the UI as "Not set up yet" instead of sending people somewhere fake.
 */

export interface ConfigLink {
  label: string;
  url: string;
  placeholder: boolean;
}

const apiBase = (import.meta.env.VITE_RUKO_API ?? '').trim().replace(/\/+$/, '');

export const config = {
  /** Public origin, from VITE_SITE_URL or the Vercel production URL at build time. */
  siteUrl: typeof __SITE_URL__ === 'string' ? __SITE_URL__ : 'http://localhost:5181',

  /**
   * Community reports API base, e.g. "/api" or "https://ruko.example.org/api".
   * Empty means community reports and lookups are switched off.
   */
  apiBase: apiBase || null,

  /** Source code. */
  repo: { label: 'GitHub', url: 'https://github.com/rutvirupani1111/ruko', placeholder: false } satisfies ConfigLink,
  issues: { label: 'GitHub issues', url: 'https://github.com/rutvirupani1111/ruko/issues', placeholder: false } satisfies ConfigLink,

  /** Ruko Shield builds (Chrome, Edge, Firefox zips) are published on the GitHub releases page. */
  releases: { label: 'GitHub releases', url: 'https://github.com/rutvirupani1111/ruko/releases', placeholder: false } satisfies ConfigLink,

  /** Browser extension store listings (Ruko Shield). Not published yet. */
  extension: {
    chrome: { label: 'Chrome Web Store', url: 'https://chromewebstore.google.com/detail/YOUR-EXTENSION-ID', placeholder: true },
    edge: { label: 'Microsoft Edge Add-ons', url: 'https://microsoftedge.microsoft.com/addons/detail/YOUR-EXTENSION-ID', placeholder: true },
    firefox: { label: 'Firefox Add-ons', url: 'https://addons.mozilla.org/firefox/addon/YOUR-ADDON-SLUG/', placeholder: true },
  } satisfies Record<string, ConfigLink>,

  /** Ways to support the project. */
  support: {
    upi: { label: 'UPI', url: 'upi://pay?pa=YOUR-UPI-ID@okbank&pn=Ruko&cu=INR', vpa: 'YOUR-UPI-ID@okbank', placeholder: true },
    kofi: { label: 'Ko-fi', url: 'https://ko-fi.com/YOUR-HANDLE', placeholder: true },
    buyMeACoffee: { label: 'Buy Me a Coffee', url: 'https://www.buymeacoffee.com/YOUR-HANDLE', placeholder: true },
    githubSponsors: { label: 'GitHub Sponsors', url: 'https://github.com/sponsors/YOUR-HANDLE', placeholder: true },
  },

  contact: { label: 'Email', url: 'mailto:hello@example.org', placeholder: true } satisfies ConfigLink,

  /** Official help channels in India. These are real and must stay correct. */
  official: {
    helpline: '1930',
    helplineHref: 'tel:1930',
    cybercrime: 'https://cybercrime.gov.in',
    chakshu: 'https://sancharsaathi.gov.in/sfc/',
    sancharSaathi: 'https://sancharsaathi.gov.in',
    ceir: 'https://www.ceir.gov.in',
    rbiSachet: 'https://sachet.rbi.org.in',
  },
} as const;

export const apiEnabled = config.apiBase !== null;
