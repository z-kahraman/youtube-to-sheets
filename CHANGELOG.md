# Changelog

All notable changes to this project are documented here.
Format: [Keep a Changelog](https://keepachangelog.com/) · Versioning: [SemVer](https://semver.org/) (0.x).

## [Unreleased]

## [0.5.1] — 2026-09-20

### Added
- Feedback link (→ GitHub issues) in the options-page footer.
- Docs: AMO Technical Details copy, Chrome Web Store listing copy, launch-post drafts.

### Fixed
- **Firefox re-login loop:** implicit-flow tokens expire hourly with no refresh token;
  silent renewal now sends `login_hint` (fixes failures when multiple Google accounts
  are signed in), and saving falls back to an interactive prompt automatically instead
  of surfacing an error. `getToken()` calls are also queued so overlapping requests from
  multiple YouTube tabs don't launch concurrent Firefox auth flows.

## [0.5.0] — 2026-08-09

### Added
- **Already-saved lookup:** opening the save card checks the sheet; if the video was
  saved before, a badge appears with a preview of the existing note, and existing tags
  load as removable chips (removing a chip now removes the tag from the sheet too).
- **Keyboard shortcut:** Alt+S opens the save card on any watch/Shorts page.
- **Smart toolbar icon:** on a video page it opens the save card; elsewhere it opens
  the options page (new `activeTab` permission).
- **YouTube Shorts support:** right-click menu and save card work on `/shorts/` pages;
  Shorts URLs are normalized to `watch?v=ID` so the one-row-per-video upsert key stays unique.
- **oEmbed fallback:** title/channel are completed from YouTube's unauthenticated
  same-origin oEmbed endpoint when DOM selectors fail (primary title source on Shorts).
- **Prompt toggle:** the on-open "Save this video?" bubble can be disabled on the
  options page; it no longer appears in the Shorts feed.
- **Recent-saves summary:** the options page shows the selected sheet's total row count
  and the last 5 saves.
- **Lint setup:** `package.json` + ESLint flat config; `npm run lint` passes clean.

### Changed
- **Status column never silently downgrades:** re-opening a fully watched video and
  saving a note keeps "Watched" (old cell text is recognized in both languages);
  a status picked manually in the card always wins.
- **Card UX:** Esc and clicking outside now close the save card.
- **Fewer API calls per save:** the target tab title is cached in `storage.local`
  and auto-refreshed (with one retry) if the tab was renamed.
- `createdSheets` sync cache is capped at 50 entries to stay under the
  `storage.sync` 8 KB per-item quota (the dropdown still lists everything from Drive).

### Fixed
- **SPA injection bug:** the content script matched only `youtube.com/watch*`, so a tab
  opened on the YouTube homepage never got the script after navigating to a video —
  right-click → "Save to Sheet" silently did nothing. It now matches `youtube.com/*`
  and gates on the page type internally.
- **Options page opened on every update:** `onInstalled` now checks
  `details.reason === 'install'`; the context menu is also re-ensured on browser startup.
- **Expired/revoked token recovery:** API calls hitting 401 invalidate the cached token
  and retry once with a fresh one instead of failing with a bare "401".
- **i18n violations:** background error messages, the card's Save button label after an
  error, and the "not connected" auth error were hardcoded Turkish; all now go through
  the TR/EN string layer.

### Removed
- Nothing — no user-facing feature was removed in this release.

## [0.4.6] and earlier
See git history (`git log --oneline`): Drive-based sheet listing for cross-device sync,
sign-out that preserves the Google grant + silent refresh, AMO packaging and reviewer
notes, theming, i18n, upsert saving, security review fixes.
