/**
 * Shared constants for the community API. Kept free of runtime imports so the
 * Vercel function bundles nothing from the web app or the engine. A unit test
 * checks SCAM_CATEGORIES against the engine's ScamCategory type.
 */

export const SCAM_CATEGORIES = [
  'digital_arrest',
  'kyc_update',
  'upi_collect',
  'qr_receive',
  'fake_refund',
  'job_task',
  'investment',
  'lottery_prize',
  'loan_app',
  'sextortion',
  'otp_theft',
  'fake_support',
  'courier_parcel',
  'utility_disconnect',
  'reward_points',
  'tax_refund',
  'govt_scheme',
  'malicious_app',
  'remote_access',
  'impersonation',
  'romance',
  'sim_swap',
  'phishing_link',
  'lookalike_domain',
  'other',
] as const;

export type Category = (typeof SCAM_CATEGORIES)[number];

export const IDENTIFIER_KINDS = ['upi', 'phone', 'url', 'domain', 'email'] as const;
export type Kind = (typeof IDENTIFIER_KINDS)[number];

/** Minimum proof-of-work the server accepts (leading zero bits). */
export const MIN_DIFFICULTY = 18;
/** Proofs older than this are rejected. */
export const POW_MAX_AGE_MS = 10 * 60 * 1000;
/** Small allowance for clocks that run ahead. */
export const POW_MAX_FUTURE_MS = 60 * 1000;
export const PREFIX_LENGTH = 5;

/** Per reporter (daily-salted IP hash) limits. */
export const RATE_LIMIT_PER_DAY = 30;
export const RATE_LIMIT_PER_MINUTE = 6;
