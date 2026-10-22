/**
 * Intercepts clicks on upi:// links anywhere on the page and explains, before any
 * payment app opens, that a UPI link can only ever take money out.
 */
import type { Locale, Severity, UpiPaymentRequest } from '@ruko/engine';
import { isUpiHref } from '../../shared/url';
import { detectTheme, isRukoNode } from '../ui/shadow';
import { showUpiDialog } from '../ui/upi-dialog';

export interface UpiGuardDeps {
  checkUpi(uri: string, locale: Locale): Promise<{ request: UpiPaymentRequest | null; severity: Severity }>;
  getLocale(): Locale;
  /** Opens the payment app. Defaults to navigating to the upi:// URI. */
  proceed?(uri: string): void;
  onShown?(): void;
}

export function upiLinkFromEvent(event: Event): HTMLAnchorElement | null {
  for (const node of event.composedPath()) {
    if (node instanceof HTMLAnchorElement && isUpiHref(node.getAttribute('href'))) return node;
  }
  return null;
}

export class UpiGuard {
  private open = false;
  private readonly listener = (event: MouseEvent) => this.onClick(event);

  constructor(private readonly deps: UpiGuardDeps) {}

  start(): void {
    window.addEventListener('click', this.listener, true);
    window.addEventListener('auxclick', this.listener, true);
  }

  stop(): void {
    window.removeEventListener('click', this.listener, true);
    window.removeEventListener('auxclick', this.listener, true);
  }

  private onClick(event: MouseEvent): void {
    const first = event.composedPath()[0];
    if (first instanceof Element && isRukoNode(first)) return;
    const anchor = upiLinkFromEvent(event);
    if (!anchor) return;
    const uri = (anchor.getAttribute('href') ?? '').trim();
    event.preventDefault();
    event.stopImmediatePropagation();
    if (this.open) return;
    this.open = true;
    const locale = this.deps.getLocale();
    // A modal over the whole page follows the page's theme, not the link's colour.
    const theme = detectTheme();
    const present = (request: UpiPaymentRequest | null, severity: Severity) => {
      this.deps.onShown?.();
      showUpiDialog({
        uri,
        request,
        severity,
        locale,
        theme,
        onCancel: () => {
          this.open = false;
          anchor.focus?.({ preventScroll: true });
        },
        onContinue: () => {
          this.open = false;
          // Navigating directly does not fire another click, so the guard is not re-triggered.
          (this.deps.proceed ?? ((u: string) => window.location.assign(u)))(uri);
        },
      });
    };
    this.deps.checkUpi(uri, locale).then(
      ({ request, severity }) => present(request, severity),
      () => present(null, 'high'),
    );
  }
}
