# YouTube to Sheets

Guidance for contributors and AI coding assistants (Claude Code, etc.) working on this
repository. User-facing docs: [README](README.md) / [README.tr](README.tr.md).

## What it is
A Manifest V3 browser extension (Chrome + Firefox) that saves the YouTube video you're
watching — title, channel, link, watched/total time, plus your note and tags — as a row in
your own Google Sheet. Triggered by right-click → "Save to Sheet" on a watch page.

## Tech stack
- Manifest V3, vanilla JS (no framework, no build step — `build.sh` only zips files)
- Google Sheets API v4
- OAuth 2.0, scopes: `drive.file` + `userinfo.email`
  - Chrome: `chrome.identity.getAuthToken`
  - Firefox: `browser.identity.launchWebAuthFlow` (implicit flow, separate Web OAuth client)
- `chrome.storage.sync`: `selectedSheet`, `createdSheets`, `lang`

## Architecture
- **Cross-browser via shared modules.** `auth.js` and `strings.js` load in every context.
  `auth.js` exposes `getToken()`/`revokeToken()` and branches on `HAS_GET_AUTH_TOKEN`
  (Chrome → `getAuthToken`; Firefox → `launchWebAuthFlow`).
- **Two manifests.** `manifest.json` (Chrome: `service_worker`, `oauth2`) and
  `manifest.firefox.json` (Firefox: `background.scripts`, `browser_specific_settings.gecko`,
  no `oauth2`). `build.sh` swaps the manifest and emits `dist/yt2sheets-{chrome,firefox}.zip`.
- **i18n.** `strings.js` holds TR/EN dictionaries + `t()`/`loadLang()`/`setLang()`. Default
  language follows the browser; the user can switch it on the options page
  (`storage.sync.lang`). Language drives UI text, the context menu, and new sheets'
  name / header row / date locale.
- **Note card isolation.** The in-page card renders inside a closed Shadow DOM, isolated
  from YouTube's CSS and scripts; key events are stopped from reaching YouTube shortcuts
  while typing.
- **Sheet access model.** With `drive.file` the extension can only touch sheets it created,
  so it tracks them in `createdSheets` rather than listing all of the user's sheets.

## Files
- `manifest.json` / `manifest.firefox.json` — Chrome / Firefox config
- `auth.js` — browser-agnostic OAuth layer
- `strings.js` — i18n (TR/EN)
- `background.js` — service worker / event page: context menu, Sheets append
- `content.js` — YouTube scrape + note card (Shadow DOM) + tag chips
- `options.html` / `options.css` / `options.js` — setup page: connect, create/select sheet, language
- `icons/` — `icon.svg` source + PNGs
- `build.sh` — builds the per-browser zips
- `README.md` / `README.tr.md`, `LICENSE` (MIT), `PRIVACY.md` / `PRIVACY.en.md`
- `docs/` — release checklist, Firefox setup, publishing, store listing, OAuth-scope plan

## Conventions
- No inline scripts (CSP); all JS lives in external files.
- No inline event handlers (`onclick=`); use `addEventListener`.
- Code comments are in Turkish; identifiers are in English.
- User-facing strings go through `t()` in `strings.js` (add both TR and EN) — never hardcode.
- Surface errors to the user (toast on the options page; inline message in the note card).

## Dev / build
- Load unpacked — Chrome: `chrome://extensions` → Developer mode → Load unpacked (this folder).
  Firefox: `about:debugging` → Load Temporary Add-on → `dist/yt2sheets-firefox.zip`.
- `./build.sh` → `dist/yt2sheets-chrome.zip`, `dist/yt2sheets-firefox.zip`.
- Each contributor needs their own Google OAuth client(s) — see README and `docs/firefox-setup.md`.
- After loading/reloading the extension, reload the YouTube tab (the content script re-injects).

## Notes / gotchas
- Changing OAuth scopes invalidates cached tokens — revoke at
  https://myaccount.google.com/permissions and reconnect.
- The extension only accesses sheets it created (`drive.file`); a previously selected
  external sheet fails to append (HTTP 403).
- A saved row has 9 columns (A:I): Date, Title, Channel, Channel Link, URL, Watched Time,
  Total Time, Note, Tags — header/name localized to the selected language for new sheets.
- The context menu appears only on `youtube.com/watch` pages.
- Firefox `strict_min_version` is 115; `data_collection_permissions` (Firefox 140+) is
  intentionally omitted to keep broad compatibility.
