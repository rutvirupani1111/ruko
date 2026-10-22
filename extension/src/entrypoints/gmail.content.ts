import { defineContentScript } from 'wxt/utils/define-content-script';
import {
  analyzeInBackground,
  communityForVerdict,
  createCountReporter,
  loadDismissed,
  openPanelFromPage,
  recordInBackground,
} from '../content/common';
import { GmailShield } from '../content/gmail/shield';
import { getSettings, isSiteDisabled, watchSettings, type Settings } from '../shared/settings';

export default defineContentScript({
  matches: ['https://mail.google.com/*'],
  runAt: 'document_idle',
  noScriptStartedPostMessage: true,
  async main(ctx) {
    let settings = await getSettings();
    const dismissed = await loadDismissed();
    const reportCount = createCountReporter('gmail');
    let shield: GmailShield | null = null;

    const enabled = (s: Settings) => s.gmail && !isSiteDisabled(s, location.hostname);

    const sync = () => {
      if (!ctx.isValid) return;
      if (enabled(settings)) {
        if (shield) {
          shield.updateSettings(settings);
          return;
        }
        shield = new GmailShield(settings, {
          analyze: analyzeInBackground,
          record: (entry) => {
            if (settings.keepHistory) recordInBackground(entry);
          },
          reportCount,
          openPanel: openPanelFromPage,
          community: communityForVerdict,
          dismiss: dismissed.add,
          isDismissed: dismissed.has,
        });
        shield.start();
      } else if (shield) {
        shield.stop();
        shield = null;
      }
    };

    sync();
    const unwatch = watchSettings((next) => {
      settings = next;
      sync();
    });
    ctx.onInvalidated(() => {
      unwatch();
      shield?.stop();
      shield = null;
    });
  },
});
