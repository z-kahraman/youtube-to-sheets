# Firefox setup & publishing

Firefox does **not** support Chrome's `chrome.identity.getAuthToken`. On Firefox, auth uses
`browser.identity.launchWebAuthFlow` (implicit flow) and needs a **separate Google OAuth
client** (Web application type). The code is ready (`auth.js` branches per browser
automatically); the steps below are what you do in Google Cloud + Firefox.

> The Chrome auth path is untouched — Chrome still uses `getAuthToken`.

## 1. Google Cloud: Web OAuth client
- In your project (Sheets API must be enabled), create a **new OAuth client**:
  type = **Web application**. (The Chrome one was "Chrome Extension" — this is separate.)
- OAuth consent screen → scopes: `drive.file` + `userinfo.email`; add your own Gmail as a
  **test user** (while in testing mode).
- Note the Client ID (you'll add the redirect URI in step 3).

## 2. Get the redirect URL (stable)
Because `gecko.id` is set in `manifest.firefox.json`, `getRedirectURL()` returns a **stable
URL derived from the add-on ID** — so a single URI works for all users (per MDN). To read it:

1. Run `./build.sh` → `dist/yt2sheets-firefox.zip`
2. Firefox → `about:debugging` → "This Firefox" → **Load Temporary Add-on** →
   `dist/yt2sheets-firefox.zip`
3. On that row click **Inspect** → in the console run:
   ```js
   browser.identity.getRedirectURL()
   ```
   The output looks like `https://<hash>.extensions.allizom.org/`. Copy it.

## 3. Add the redirect URI in Google
- Google Cloud → the Web client from step 1 → **Authorized redirect URIs** →
  add the URL from step 2 → Save.

## 4. Put the Client ID in the code
- `auth.js` → set `FIREFOX_OAUTH.clientId` to the Web client ID.
- Rebuild with `./build.sh` and reload the add-on.

## 5. Test
- Extension settings → "Connect with Google" → consent → a token is returned.
- Save a YouTube video → a row should land in the sheet.

## Known limits / notes
- **Implicit flow:** the access token is valid ~1 hour, no refresh token. When it expires
  you reconnect (interactive). The token is stored in `chrome.storage.local` with its expiry.
  A **PKCE auth-code flow** could be added later for silent refresh (improvement).
- **Loopback alternative (Firefox 86+):** `http://127.0.0.1/mozoauth2/<getRedirectURL
  subdomain>` can also be used as the redirect.
- If Google restricts the implicit flow, switch to PKCE.

## 6. Publishing on AMO (addons.mozilla.org) — free

The package is ready: `web-ext lint` reports 0 errors. (`strict_min_version` is 115 for
broad compatibility; `data_collection_permissions` requires Firefox 140+ and is omitted.)

Steps:
1. [addons.mozilla.org](https://addons.mozilla.org) → sign in (Mozilla account) →
   **Developer Hub** → **Submit a New Add-on**.
2. Distribution:
   - **"On this site" (listed)** → publicly listed on AMO. ← for general use.
   - "On your own" → a signed `.xpi` you distribute yourself (not listed).
3. Upload `dist/yt2sheets-firefox.zip` → automatic validation (same as web-ext lint).
4. **Source code:** no build/minification (just a zip) → source submission is not required.
   If asked, link the repo: https://github.com/z-kahraman/youtube-to-sheets
5. Listing: name, summary, description (`docs/store-listing.md`), category, screenshots
   (`screenshots/`), **privacy policy** (PRIVACY content or a hosted URL).
6. Submit → review.
7. For each new version bump `version` in `manifest.firefox.json` + run `./build.sh`.

### ⚠️ Listed on AMO ≠ everyone can connect
An AMO listing lets anyone **install** the add-on, but to **connect to Google** the Web
OAuth client must allow the user. While it's in "Testing" mode only **test users** can
connect. For fully public use, set the consent screen to **"In production"** and complete
verification (`drive.file` is a sensitive scope → brand + scope verification; the expensive
CASA assessment is not required). For yourself + a few test users, testing mode is enough.

## Sources
- [identity.launchWebAuthFlow — MDN](https://developer.mozilla.org/en-US/docs/Mozilla/Add-ons/WebExtensions/API/identity/launchWebAuthFlow)
- [identity API — MDN](https://developer.mozilla.org/en-US/docs/Mozilla/Add-ons/WebExtensions/API/identity)
- [Firefox WebExtension and OAuth with Google — Mozilla Discourse](https://discourse.mozilla.org/t/firefox-webextension-and-oauth-browser-identity-getredirecturl-with-google-resolved/42362)
