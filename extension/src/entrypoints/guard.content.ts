/**
 * Runs on every http(s) page, as early as possible, and stays tiny: no engine and no
 * framework. Lookalike-domain interstitial, link tooltips and upi:// confirmation.
 * All analysis is delegated to the background.
 */
import { defineContentScript } from 'wxt/utils/define-content-script';
import { createCountReporter } from '../content/common';
import { LinkWatcher } from '../content/guard/links';
import { UpiGuard } from '../content/guard/upi';
import { showInterstitial, type InterstitialHandle } from '../content/ui/interstitial';
import { send } from '../shared/messages';
import { getSettings, isSiteAllowed, isSiteDisabled, watchSettings, type Settings } from '../shared/settings';
import { isGmailHost, isWhatsAppHost } from '../shared/url';

export default defineContentScript({
  matches: ['http://*/*', 'https://*/*'],
  runAt: 'document_start',
  noScriptStartedPostMessage: true,
  async main(ctx) {
    let settings = await getSettings();
    const hostname = location.hostname;
    const reportCount = createCountReporter('page', 0);
    let gate: InterstitialHandle | null = null;
    let links: LinkWatcher | null = null;
    let upi: UpiGuard | null = null;
    let pageChecked = false;

    const tooltipsWanted = (s: Settings) =>
      (isWhatsAppHost(hostname) && s.whatsapp) || (isGmailHost(hostname) && s.gmail) || s.linkTooltipsEverywhere;

    const checkPage = async () => {
      pageChecked = true;
      try {
        const check = await send<'check-page'>({
          type: 'check-page',
          url: location.href,
          locale: settings.locale,
          warnAt: settings.warnAt,
        });
        if (!check.warn || !ctx.isValid || gate) return;
        gate = showInterstitial({
          check,
          locale: settings.locale,
          theme: window.matchMedia?.('(prefers-color-scheme: dark)').matches ? 'dark' : 'light',
          onLeave: () => {
            void send<'leave-site'>({ type: 'leave-site', host: check.host || hostname, brand: check.brand }).catch(() => {
              history.length > 1 ? history.back() : location.replace('about:blank');
            });
          },
          onContinue: () => {
            gate = null;
            reportCount(0);
            void send<'allow-site'>({ type: 'allow-site', host: hostname }).catch(() => undefined);
          },
        });
        reportCount(1);
      } catch {
        // Background unreachable (extension updating). Fail open; never break the page.
      }
    };

    const sync = () => {
      if (!ctx.isValid) return;
      const disabled = isSiteDisabled(settings, hostname);

      if (!disabled && settings.lookalikeShield && !isSiteAllowed(settings, hostname)) {
        if (!pageChecked) void checkPage();
      } else if (gate) {
        gate.remove();
        gate = null;
        reportCount(0);
      }

      if (!disabled && tooltipsWanted(settings)) {
        if (!links) {
          links = new LinkWatcher(settings.locale, {
            checkLink: (url, locale) => send<'check-link'>({ type: 'check-link', url, locale }),
          });
          links.start();
        } else links.setLocale(settings.locale);
      } else if (links) {
        links.stop();
        links = null;
      }

      if (!disabled && settings.upiGuard) {
        if (!upi) {
          upi = new UpiGuard({
            checkUpi: (uri, locale) => send<'check-upi'>({ type: 'check-upi', uri, locale }),
            getLocale: () => settings.locale,
          });
          upi.start();
        }
      } else if (upi) {
        upi.stop();
        upi = null;
      }
    };

    sync();
    const unwatch = watchSettings((next) => {
      settings = next;
      sync();
    });
    ctx.onInvalidated(() => {
      unwatch();
      links?.stop();
      upi?.stop();
    });
  },
});
