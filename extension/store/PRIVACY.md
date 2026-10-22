# Ruko Shield privacy policy

Effective date: 23 October 2026. Applies to the Ruko Shield browser extension for
Chrome, Microsoft Edge and Firefox.

**Short version: Ruko Shield checks messages, emails, links, UPI IDs and phone numbers
on your own device. It does not collect, sell or share your data. It has no analytics
and no tracking.**

## What Ruko Shield looks at, and where

| Data | When | Where it goes |
| --- | --- | --- |
| Text of incoming WhatsApp Web messages, and the sender name or number shown with them | While WhatsApp Web is open and its protection is on | Analysed inside your browser by Ruko's built-in engine. Never sent anywhere. |
| Text, subject and sender of the Gmail email you open | While Gmail is open and its protection is on | Analysed inside your browser. Never sent anywhere. |
| The address of the page you visit | On every website, while the fake-website shield is on | Compared inside your browser with a built-in list of bank, shopping and government websites. Never sent anywhere. |
| The address of a link you hover, or a `upi://` link you click | When link checks or the UPI check are on | Checked inside your browser. Never sent anywhere. |
| Text you paste into the popup or side panel, or right-click with "Check with Ruko" | When you ask for a check | Analysed inside your browser. Never sent anywhere. |

## What Ruko Shield stores on your device

Stored with the browser's extension storage, on this device only:

- **Settings**: language, sensitivity, which protections are on, sites you switched off,
  sites you chose "Continue anyway" on, and an optional community server address.
- **History** (optional, on by default, can be turned off): the last 200 warnings and
  checks, including the analysed text, so you can review them in the side panel. You can
  delete single items or clear everything at any time; uninstalling the extension deletes
  it too.
- **Hidden warnings**: a fingerprint (a short hash, not the text) of messages you marked
  "Not a scam", so they stay hidden.
- **Warning counts** for the toolbar badge, kept only until the browser closes.

None of this is synced to other devices or uploaded.

## Optional community lookups (off by default)

If you switch on community lookups and enter the address of a Ruko community server,
Ruko checks whether other people reported a link's domain, UPI ID, phone number or email
address found in a warning. To do this privately:

1. Ruko computes a SHA-256 hash of the identifier on your device.
2. Only the **first 5 characters** of that hash are sent to the server you chose,
   without cookies or referrer.
3. The server replies with every report that shares those 5 characters (thousands of
   unrelated identifiers share each prefix), and Ruko finds the match on your device.

The server never receives the identifier, the full hash, the message or your browsing.
The server you choose may see your IP address, like any website you visit. Switching the
option off stops all lookups immediately.

## Optional built-in browser AI

Where your browser provides on-device AI (Chrome's Prompt API and Translator API), Ruko
can offer "Explain in simple words" and Hindi translation. These run inside your browser
on your device. Ruko does not send the text to any AI service. The browser may download
its model once; that download is between you and your browser vendor.

## What Ruko Shield never does

- No analytics, telemetry, crash reporting or advertising.
- No selling, renting or sharing of data, and no data is used for creditworthiness or
  lending.
- No remote code: all code ships inside the extension package.
- No reading of pages beyond what is described above, and no changes to the text of your
  messages or emails. Ruko only adds its own warning badges, banners and dialogs.

## Children

Ruko Shield is a safety tool suitable for all ages and collects no personal information
from anyone, including children.

## Changes

If this policy changes, the new version will ship with the extension update and the
effective date above will change. Ruko will never start collecting data without asking
you first.

## Contact

Questions about privacy: **PLACEHOLDER: add a support email address before publishing.**
