# Ruko Shield: permissions, and why each one is needed

Ruko Shield asks for as little as it can while still protecting people on the pages
where scams actually reach them. Everything below is processed on the device.

## Declared in the manifest

| Permission | Browsers | Why Ruko needs it | What Ruko never does with it |
| --- | --- | --- | --- |
| `storage` | all | Saves your settings (language, sensitivity, site switches), the optional history of the last 200 checks, sites you chose "Continue anyway" on, warnings you hid, and the per-tab warning count (in `storage.session`). | Never syncs or uploads any of it. Clearing history deletes it from the device. |
| `contextMenus` | all | Adds **Check with Ruko** to the right-click menu for selected text and links, which opens the side panel with the verdict. | Reads only the selection or link you right-clicked, only when you click the menu item. |
| `sidePanel` | Chrome, Edge | Shows the full verdict view and history in the browser's side panel. Added automatically for Chromium builds; Firefox uses the manifest `sidebar_action` key, which needs no permission. | Nothing else. |
| Host permissions `http://*/*`, `https://*/*` | all | 1. **Fake-website shield**: a small content script must run on every page, before you type anything, to check the page address against bank, shop and government websites it might be imitating, and to show the full-page warning. 2. **UPI link check**: confirms before any `upi://` link on any page opens a payment app. 3. **Link checks** (always on WhatsApp Web and Gmail, optional everywhere): a tooltip about a link's destination when you hover it. 4. The popup reads the address of the current tab to show "Protecting this site" and its on/off switch. 5. Only if you turn on community lookups: lets the extension call the community server address you entered. | Never reads, stores or sends page content on ordinary websites. The every-site script contains no detection engine and no framework; it only sends the page address to Ruko's own background script, inside the browser. |

### Content scripts

| Script | Runs on | Purpose |
| --- | --- | --- |
| `guard` | every `http`/`https` page, top frame, `document_start` | Fake-website warning, link tooltips, `upi://` confirmation. |
| `whatsapp` | `https://web.whatsapp.com/*` | Reads incoming messages (the `data-pre-plain-text` containers) and adds a badge under suspicious ones. Never edits a message. |
| `gmail` | `https://mail.google.com/*` | Reads the open email and shows a banner above suspicious ones. Never edits an email. |

## Requested at runtime

| Permission | When | Why |
| --- | --- | --- |
| Origin of your community API (e.g. `https://your-ruko-app.example/*`) | Only when you switch on **Community lookups** on the options page | Lets Ruko ask that one server for reports. Already covered by the host permissions above on most browsers, so the browser usually grants it without a prompt. Lookups are off by default. |

## Deliberately not requested

- `tabs`: not needed; host permissions already expose the active tab's address to the popup.
- `activeTab` alone: too late for the fake-website shield, which must act before you interact with the page.
- `scripting`, `webRequest`, `webNavigation`, `declarativeNetRequest`: Ruko does not inject code at runtime or watch network traffic.
- `history`, `bookmarks`, `cookies`, `downloads`, `clipboardRead`, `notifications`, `identity`: not used.
- No remote code: every script ships inside the package. No analytics, no telemetry.

## Network access, in full

1. **None by default.** The detection engine, the optional browser AI (Chrome's built-in Prompt API and Translator API) and all UI run locally.
2. **Optional community lookups** (off by default, user must enable and enter a server address): Ruko hashes a link's domain, a UPI ID, a phone number or an email address with SHA-256 on the device and sends only the **first 5 hexadecimal characters** of that hash (`GET /api/v1/range/{prefix}`), with cookies and referrer omitted. Thousands of unrelated identifiers share every prefix, so the server cannot tell what was checked.
3. Links you click yourself (1930 dialler, cybercrime.gov.in, Chakshu, Ko-fi, Buy Me a Coffee) open normally in a new tab.
