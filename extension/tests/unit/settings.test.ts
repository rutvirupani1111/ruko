import { beforeEach, describe, expect, it, vi } from 'vitest';
import { fakeBrowser } from 'wxt/testing/fake-browser';
import {
  DEFAULT_SETTINGS,
  getSettings,
  isSiteAllowed,
  isSiteDisabled,
  normalizeApiUrl,
  sanitizeSettings,
  saveSettings,
  updateSettings,
  watchSettings,
  withSiteAllowed,
  withSiteDisabled,
} from '../../src/shared/settings';
import { interstitialMinRisk, severityRank, shouldWarn } from '../../src/shared/severity';

describe('settings', () => {
  beforeEach(() => fakeBrowser.reset());

  it('defaults: protection on, community lookups OFF, medium sensitivity', async () => {
    const settings = await getSettings();
    expect(settings).toEqual(DEFAULT_SETTINGS);
    expect(settings.community).toBe(false);
    expect(settings.warnAt).toBe('medium');
    expect(settings.whatsapp && settings.gmail && settings.lookalikeShield && settings.upiGuard).toBe(true);
    expect(settings.linkTooltipsEverywhere).toBe(false);
  });

  it('repairs anything malformed read from storage', () => {
    const clean = sanitizeSettings({
      locale: 'fr',
      warnAt: 'extreme',
      whatsapp: 'yes',
      gmail: false,
      disabledSites: ['WWW.Example.com', 42, '', 'example.com'],
      allowedSites: 'nope',
      communityApiUrl: 'javascript:alert(1)',
    });
    expect(clean.locale).toBe('en');
    expect(clean.warnAt).toBe('medium');
    expect(clean.whatsapp).toBe(true);
    expect(clean.gmail).toBe(false);
    expect(clean.disabledSites).toEqual(['example.com']);
    expect(clean.allowedSites).toEqual([]);
    expect(clean.communityApiUrl).toBe('');
  });

  it('accepts only https (or local http) API URLs', () => {
    expect(normalizeApiUrl(' https://ruko.example.app/ ')).toBe('https://ruko.example.app');
    expect(normalizeApiUrl('https://ruko.example.app/base/')).toBe('https://ruko.example.app/base');
    expect(normalizeApiUrl('http://localhost:5182')).toBe('http://localhost:5182');
    expect(normalizeApiUrl('http://evil.example')).toBe('');
    expect(normalizeApiUrl('not a url')).toBe('');
  });

  it('saves, updates and notifies other contexts', async () => {
    const listener = vi.fn();
    const stop = watchSettings(listener);
    await saveSettings({ ...DEFAULT_SETTINGS, locale: 'hi' });
    const updated = await updateSettings({ warnAt: 'low' });
    expect(updated.locale).toBe('hi');
    expect(updated.warnAt).toBe('low');
    expect((await getSettings()).warnAt).toBe('low');
    expect(listener).toHaveBeenCalled();
    expect(listener.mock.lastCall?.[0].warnAt).toBe('low');
    stop();
  });

  it('per-site switches are keyed by site, ignoring www.', () => {
    let s = withSiteDisabled({ ...DEFAULT_SETTINGS }, 'www.example.com', true);
    expect(isSiteDisabled(s, 'example.com')).toBe(true);
    s = withSiteDisabled(s, 'example.com', false);
    expect(isSiteDisabled(s, 'www.example.com')).toBe(false);
    s = withSiteAllowed(s, 'sbi-kyc-update.top', true);
    expect(isSiteAllowed(s, 'sbi-kyc-update.top')).toBe(true);
    expect(isSiteAllowed(s, 'login.sbi-kyc-update.top')).toBe(true);
    expect(isSiteAllowed(s, 'other-kyc-update.top')).toBe(false);
  });
});

describe('sensitivity', () => {
  it('ranks severities in order', () => {
    expect(['safe', 'low', 'medium', 'high', 'critical'].map((s) => severityRank(s as never))).toEqual([0, 1, 2, 3, 4]);
  });

  it('warns at and above the chosen level', () => {
    expect(shouldWarn('medium', 'medium')).toBe(true);
    expect(shouldWarn('low', 'medium')).toBe(false);
    expect(shouldWarn('low', 'low')).toBe(true);
    expect(shouldWarn('high', 'high')).toBe(true);
    expect(shouldWarn('medium', 'high')).toBe(false);
    expect(shouldWarn('critical', 'high')).toBe(true);
    expect(shouldWarn('safe', 'low')).toBe(false);
  });

  it('never blocks a page below medium risk', () => {
    expect(interstitialMinRisk('low')).toBeGreaterThanOrEqual(35);
    expect(interstitialMinRisk('medium')).toBeGreaterThan(interstitialMinRisk('low'));
    expect(interstitialMinRisk('high')).toBeGreaterThan(interstitialMinRisk('medium'));
  });
});
