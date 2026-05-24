# Chrome Web Store publishing guide

> The primary distribution channel is Firefox/AMO (see `firefox-setup.md`). Chrome Web Store
> publishing is optional (it has a one-time $5 fee) and is kept here for when/if you want it.

Steps for public Chrome publishing. The engineering part (scope reduction, etc.) is done in
code; the rest is mostly work in the Google Cloud / Web Store panels.

## 0. Prerequisites (done)
- ✅ Scopes reduced to `drive.file` + `userinfo.email` → no restricted scope, so the
  expensive CASA security assessment is not required.
- ✅ Security hardening completed.

## 1. Host the privacy policy
- Publish the contents of `PRIVACY.en.md` somewhere (GitHub Pages, your site, a Gist).
- The resulting **URL** is needed for OAuth verification and the store listing.

## 2. OAuth consent screen (Google Cloud Console)
- https://console.cloud.google.com/auth/branding (make sure the right project is selected)
- Fill in app name, support email, **developer contact**, **app logo** (icon128.png),
  **application home page**, **privacy policy URL**.
- The Scopes section should show only `drive.file` and `userinfo.email`.
- Publishing status: **"Testing" → "In production"**. Because a sensitive scope
  (`drive.file`) is used, **verification** will be requested:
  - Brand verification + scope justification.
  - They usually want a **demo video** showing the scope in use (install + save to sheet).

## 3. Extension ID / OAuth client (chicken-and-egg)
- The first Web Store upload assigns a permanent **ID** to the extension.
- To make the local "unpacked" ID match the published ID: after the store item exists, take
  the package's **public key** and add `"key": "<public_key>"` to `manifest.json`.
- OAuth client (type: Chrome Extension) → update **Application ID** to the published ID,
  otherwise `chrome.identity` can't get a token in the published version.
- Suggested order: upload a draft → learn the ID → update the OAuth client → (if needed) add
  `key` to the manifest and repackage.

## 4. Web Store developer account + listing
- https://chrome.google.com/webstore/devconsole — one-time **$5** registration.
- Use `docs/store-listing.md` (description, category, permission justifications).
- Add screenshots (1280x800 or 640x400) — at least one.
- Icon (128px) is ready.
- Upload the chrome zip (`./build.sh` → `dist/yt2sheets-chrome.zip`).

## 5. Packaging
Use the build script (it includes only runtime files, excludes docs/.git/etc.):
```
./build.sh   # → dist/yt2sheets-chrome.zip, dist/yt2sheets-firefox.zip
```

## 6. Review
- Web Store review (policy compliance) + OAuth verification proceed in parallel.
- Once approved it's public. Until then only test users can install/connect.

## Notes
- Bump `version` (manifest) on every new upload.
- Changing scopes invalidates existing tokens: while testing, revoke at
  https://myaccount.google.com/permissions and reconnect.
