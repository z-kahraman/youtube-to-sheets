# YouTube to Sheets

Guidance for contributors and AI coding assistants (Claude Code, etc.) working on this
repository. User-facing docs: [README](README.md) / [README.tr](README.tr.md).

## What it is
A Manifest V3 browser extension (Chrome + Firefox) that saves the YouTube video you're
watching — title, channel, link, watched/total time, plus your note and tags — as a row in
your own Google Sheet. Triggered by right-click → "Save to Sheet" on a watch or shorts
page, the Alt+S keyboard shortcut, or the toolbar icon (which opens the save card on a
video page and the options page elsewhere).

## Tech stack
- Manifest V3, vanilla JS (no framework, no build step — `build.sh` only zips files)
- Google Sheets API v4
- OAuth 2.0, scopes: `drive.file` + `userinfo.email`
  - Chrome: `chrome.identity.getAuthToken`
  - Firefox: `browser.identity.launchWebAuthFlow` (implicit flow, separate Web OAuth client)
- `chrome.storage.sync`: `selectedSheet`, `createdSheets` (capped at 50 — 8KB/item quota),
  `lang`, `theme`, `showPrompt`
- `chrome.storage.local`: `ff_token` (Firefox token cache), `ff_email` (connected
  account's email — `login_hint` for Firefox silent refresh), `sheetTitleCache`
  (spreadsheetId → first tab title; refreshed on 400)

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
- **Theming.** The options page supports auto / light / dark via `storage.sync.theme`,
  driven by CSS variables + `[data-theme]` on `<html>` (auto follows `prefers-color-scheme`,
  no FOUC since the default is hardcoded in HTML). Accent stays blue; red is reserved for
  the brand mark and destructive actions. The in-page card/prompt follow YouTube's own
  theme (`html[dark]`) for visual cohesion.
- **Content script injection.** Matches `https://www.youtube.com/*` (NOT just `watch*`):
  YouTube is a SPA, so a tab opened on the homepage never reloads when navigating to a
  video — a narrower match would leave the tab without the script. Video-page gating
  happens inside `content.js` (`currentVideoId()` handles both `/watch?v=` and
  `/shorts/ID`; URLs are normalized to `watch?v=ID` so the upsert key stays unique).
- **Note card isolation.** The in-page card renders inside a closed Shadow DOM, isolated
  from YouTube's CSS and scripts. A `window`-capture key shield stops keystrokes — including
  other extensions' shortcuts (e.g. Video Speed Controller's z/x seek) — from reaching the
  page while typing in the card; Enter/Tab/Backspace/comma pass through for the tag input;
  Escape and clicking outside close the card. An on-open "save this video?" prompt is shown
  once per video on watch pages only (SPA-aware via `yt-navigate-finish`) and can be
  disabled on the options page (`storage.sync.showPrompt`).
- **Already-saved lookup.** When the card opens, `content.js` asks the background for the
  video's existing row (`lookupRow` → `lookupResult` push message). If found: a badge +
  existing-note preview are shown, existing tags load as removable chips (save then
  *replaces* tags instead of merging, so chip removal deletes from the sheet), and the
  status select is bumped to the sheet's status if it is further along.
- **Scrape resilience.** DOM selectors are the primary source; the unauthenticated
  same-origin oEmbed endpoint (`youtube.com/oembed`) fills in title/channel when selectors
  fail and is preferred for the title on shorts.
- **Auth robustness.** All Sheets/Drive calls go through `apiFetch` in `background.js`:
  on 401 the cached token is invalidated (`invalidateToken` in `auth.js`) and the request
  is retried once with a fresh token. `getToken()` calls are serialized through a queue
  (`auth.js`) so overlapping requests from multiple YouTube tabs don't launch concurrent
  Firefox `launchWebAuthFlow` calls, which only supports one in-flight flow at a time.
- **Status column.** Watched > Partially watched > Opened. On auto-derived saves the
  status never downgrades an existing row (old cell text is recognized in both languages);
  a manually chosen status in the card (`statusManual`) always wins.
- **Sheet access model.** With `drive.file` the extension can only touch sheets it created,
  so it tracks them in `createdSheets` rather than listing all of the user's sheets.

## Files
- `manifest.json` / `manifest.firefox.json` — Chrome / Firefox config
- `auth.js` — browser-agnostic OAuth layer (getToken / invalidateToken / signOut / revoke)
- `strings.js` — i18n (TR/EN)
- `background.js` — service worker / event page: context menu, shortcut/icon handling,
  Sheets upsert with 401 retry + sheet-title cache, row lookup
- `content.js` — YouTube scrape (+ oEmbed fallback, shorts) + on-open prompt + note card
  (Shadow DOM) + tag chips + status + already-saved badge
- `options.html` / `options.css` / `options.js` — setup page: connect, create/select/open
  sheet, language, theme, prompt toggle, recent-saves summary
- `eslint.config.js` / `package.json` — lint setup (`npm run lint`); no runtime deps
- `icons/` — `icon.svg` source + PNGs
- `build.sh` — builds three zips: `chrome`, `firefox` (AMO-ready, Fx 140 / Android 142),
  and `firefox-dev` (patched to `strict_min_version: 115` for local `about:debugging`)
- `README.md` / `README.tr.md`, `LICENSE` (MIT), `PRIVACY.md` / `PRIVACY.en.md`
- `docs/` — Firefox setup, publishing, and store-listing guides

## Conventions
- No inline scripts (CSP); all JS lives in external files.
- No inline event handlers (`onclick=`); use `addEventListener`.
- Code comments are in Turkish; identifiers are in English.
- User-facing strings go through `t()` in `strings.js` (add both TR and EN) — never hardcode.
- Surface errors to the user (toast on the options page; inline message in the note card).

## Dev / build
- Load unpacked — Chrome: `chrome://extensions` → Developer mode → Load unpacked (this folder).
  Firefox: `about:debugging` → Load Temporary Add-on → `dist/yt2sheets-firefox-dev.zip`
  (the `*-dev` zip drops `strict_min_version` to 115 so older local Firefox installs
  accept it; the regular `*-firefox.zip` is reserved for AMO upload).
- `./build.sh` → `dist/yt2sheets-chrome.zip`, `yt2sheets-firefox.zip` (AMO),
  `yt2sheets-firefox-dev.zip` (local).
- Each contributor needs their own Google OAuth client(s) — see README and `docs/firefox-setup.md`.
- After loading/reloading the extension, reload the YouTube tab (the content script re-injects).

## Notes / gotchas
- Changing OAuth scopes invalidates cached tokens — revoke at
  https://myaccount.google.com/permissions and reconnect.
- The extension only accesses sheets it created (`drive.file`); a previously selected
  external sheet fails to append (HTTP 403).
- A saved row has 10 columns (A:J): Date, Title, Channel, Channel Link, URL, Watched Time,
  Total Time, Note, Tags, Status — header/name localized to the selected language for new sheets.
- Saving is an upsert keyed by the video URL (column E): an existing row is updated
  (note appended, tags merged, watched time refreshed) instead of adding a duplicate row.
  Status (Watched / Partially watched / Opened) is auto-derived from watch progress and
  editable in the card. Sheets created before this column only differ by a missing J header.
- The context menu appears only on `youtube.com/watch` and `youtube.com/shorts/` pages;
  the content script itself is injected on all of `youtube.com` (see Architecture).
- `onInstalled` fires on every update too — the options page is only opened when
  `details.reason === 'install'`.
- Run `npm run lint` (ESLint, no build step) before packaging; `node --check *.js` is a
  quick syntax gate.
- The AMO-uploaded `manifest.firefox.json` declares `gecko.strict_min_version: 140.0`
  and `gecko_android.strict_min_version: 142.0` to match the Firefox versions that
  introduced `data_collection_permissions` (clears all AMO warnings). For local
  development on older Firefox builds, `build.sh` emits a second
  `yt2sheets-firefox-dev.zip` with `strict_min_version` rewritten to `115.0` and
  `gecko_android` stripped — load that one via `about:debugging`. Declared data
  categories: `personallyIdentifyingInfo` (user email via `userinfo.email`) and
  `websiteContent` (YouTube page title/URL/timestamps written to the sheet).
