import type { ScamCategory } from '@ruko/engine';

/**
 * Display order of the scam encyclopedia: roughly by how often each scam hits
 * people in India. Plain data so build tooling (sitemap) can import it too.
 * 'other' is a catch-all bucket and has no Learn page.
 */
export const CATEGORY_ORDER: readonly Exclude<ScamCategory, 'other'>[] = [
  'digital_arrest',
  'upi_collect',
  'kyc_update',
  'job_task',
  'investment',
  'courier_parcel',
  'fake_refund',
  'qr_receive',
  'otp_theft',
  'fake_support',
  'remote_access',
  'utility_disconnect',
  'lottery_prize',
  'loan_app',
  'sextortion',
  'reward_points',
  'tax_refund',
  'govt_scheme',
  'malicious_app',
  'impersonation',
  'romance',
  'sim_swap',
  'phishing_link',
  'lookalike_domain',
];

export function isLearnCategory(id: string | undefined): id is Exclude<ScamCategory, 'other'> {
  return !!id && (CATEGORY_ORDER as readonly string[]).includes(id);
}
