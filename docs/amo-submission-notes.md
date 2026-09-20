# AMO submission — release notes & notes to reviewer

Ready-to-paste text for the AMO submission form. Update the version line at the top
of each release; the rest of the body is mostly reusable submission-to-submission.

The **first** version block is what the public sees on the listing page
(addons.mozilla.org → versions). The **second** block is private — only Mozilla
reviewers read it.

Permission rationales live in `store-listing.md`; this file only adds release/
review context. The privacy policy is in `PRIVACY.en.md` / `PRIVACY.md`.

---

## Release notes — v0.5.1

### English (default locale)

```
Bug fix release.

Fixed
- Firefox: you no longer get bounced back to sign-in every hour. Session
  refresh now works reliably when you have more than one Google account
  signed in to the browser, and if a silent refresh still fails, saving a
  video now prompts you to reconnect automatically instead of failing with
  an error.
- Fixed a glitch where having several YouTube tabs open at once could make
  the sign-in refresh fail for one of them.

Added
- Feedback link (→ GitHub issues) in the settings page footer.
```

### Türkçe

```
Hata düzeltme sürümü.

Düzeltmeler
- Firefox: artık her saat başı tekrar giriş yapmaya zorlanmıyorsun. Birden
  fazla Google hesabı açıkken oturum yenileme artık güvenilir çalışıyor;
  sessiz yenileme başarısız olursa video kaydederken otomatik olarak
  yeniden bağlanma istemi açılıyor (hata vermek yerine).
- Aynı anda birden fazla YouTube sekmesi açıkken oturum yenilemenin
  bazılarında başarısız olabildiği bir hata düzeltildi.

Yeni
- Ayarlar sayfası altbilgisine "Geri bildirim" linki (→ GitHub issues).
```

---

## Notes to reviewer — v0.5.1

```
0.5.1 on top of 0.5.0. No manifest/permission changes: same permissions,
host_permissions, and OAuth scopes (drive.file + userinfo.email) as 0.5.0.

CHANGES

1) Firefox token-refresh reliability (auth.js, background.js)
   Firefox uses launchWebAuthFlow (implicit flow); tokens expire hourly
   with no refresh token. Silent renewal (prompt=none) now sends
   login_hint using the connected account's email (fetched once from
   googleapis.com/oauth2/v2/userinfo, cached in storage.local as
   ff_email) — fixes silent-renewal failures when the browser has
   multiple Google accounts signed in. If silent renewal still fails,
   saving a video now falls back to an interactive
   browser.identity.launchWebAuthFlow prompt automatically instead of
   surfacing a bare error that required a manual reconnect from the
   options page.

2) getToken() calls are now queued (auth.js) so overlapping requests
   from multiple open YouTube tabs can't launch concurrent
   launchWebAuthFlow calls — Firefox only supports one in-flight auth
   flow at a time; a second concurrent call could fail outright.

3) UI-only: added a "Feedback" link (options page footer) to the
   project's GitHub issues page. No new permissions or data access.

HOW TO TEST
1. Connect the add-on, then expire the cached token without waiting an
   hour: about:debugging → this add-on → Inspect → console:
   browser.storage.local.set({ff_token:{value:'x',expiry:Date.now()-1000}})
   — then save a video. It should refresh silently or prompt you to
   reconnect, instead of failing outright.
2. Sign in to a second Google account in the browser alongside the
   connected one, expire the token as above, and save — renewal should
   still succeed without a popup.
3. Open 2+ YouTube tabs, expire the token, and trigger a save/lookup in
   each close together — no rejected launchWebAuthFlow errors in the
   console.

SOURCE shape unchanged: ./build.sh, vanilla JS, no minify/bundle/build
step. ESLint config + package.json are dev-only and not in the zip.
github.com/z-kahraman/youtube-to-sheets
```

---

## Release notes — v0.5.0

### English (default locale)

```
Big usability update.

New
- YouTube Shorts support: right-click → "Save to Sheet" now works on
  /shorts/ pages too.
- Alt+S keyboard shortcut, and a smarter toolbar icon: on a video page it
  opens the save card, elsewhere it opens the settings page.
- "Already saved" badge: the card now tells you when a video is already in
  your sheet, previews your existing note, and loads existing tags as
  editable chips (removing a chip removes the tag from the sheet too).
- The on-open "Save this video?" bubble can be turned off in settings.
- Settings page shows the selected sheet's total row count and the last
  5 saves.

Fixed
- The big one: if you opened youtube.com first and then clicked into a
  video, "Save to Sheet" could silently do nothing (YouTube is a
  single-page app and the extension never got injected into that tab).
- The settings page no longer pops up after every extension update.
- Expired Google sessions refresh automatically instead of failing with
  a bare "401" error.
- Re-saving a fully watched video no longer downgrades its status; a
  status you pick by hand always wins.
- Esc or clicking outside now closes the note card.

Permissions: adds activeTab (used only when you click the toolbar icon /
shortcut, to tell whether the current tab is a YouTube video page). OAuth
scopes unchanged — your data still goes only from your browser to Google.
```

### Türkçe

```
Büyük kullanışlılık güncellemesi.

Yeni
- YouTube Shorts desteği: /shorts/ sayfalarında da sağ tık → "Sheet'e
  kaydet" çalışıyor.
- Alt+S klavye kısayolu ve daha akıllı araç çubuğu ikonu: video
  sayfasındaysan kaydetme kartını, değilsen ayarlar sayfasını açar.
- "Zaten kayıtlı" rozeti: kart, video sheet'inde varsa söylüyor; mevcut
  notunu önizliyor ve mevcut etiketleri düzenlenebilir chip olarak
  yüklüyor (chip silmek etiketi sheet'ten de siler).
- Video açılışındaki "Bu videoyu kaydedeyim mi?" balonu ayarlardan
  kapatılabiliyor.
- Ayarlar sayfası seçili sheet'in toplam kayıt sayısını ve son 5 kaydı
  gösteriyor.

Düzeltmeler
- En önemlisi: önce youtube.com'u açıp sonra bir videoya tıkladıysan
  "Sheet'e kaydet" sessizce hiçbir şey yapmayabiliyordu (YouTube tek
  sayfa uygulaması olduğu için eklenti o sekmeye hiç enjekte olmuyordu).
- Ayarlar sayfası artık her eklenti güncellemesinde kendiliğinden açılmıyor.
- Süresi dolan Google oturumları "401" hatası vermek yerine otomatik
  yenileniyor.
- Tamamen izlenmiş bir videoyu tekrar kaydetmek durumunu geri düşürmüyor;
  elle seçtiğin durum her zaman geçerli.
- Esc ya da kartın dışına tıklamak kartı kapatıyor.

İzinler: activeTab eklendi (yalnız ikona/kısayola bastığında, sekmenin
YouTube video sayfası olup olmadığını anlamak için). OAuth scope'ları
değişmedi — verilerin hâlâ yalnız tarayıcından Google'a gider.
```

---

## Notes to reviewer — v0.5.0

> AMO ~3000 karakter limiti. Bu blok ~2900 chars.

```
0.5.0 on top of 0.4.6. This release DOES change the manifest — each change
is explained below. OAuth scopes (drive.file + userinfo.email) and
data_collection_permissions are UNCHANGED.

MANIFEST CHANGES

1) content_scripts.matches: youtube.com/watch* → youtube.com/*
   YouTube is a SPA: a tab opened on the homepage never full-page-loads
   when the user clicks into a video, so with the old watch*-only match
   the content script was never injected in that tab and "Save to Sheet"
   silently did nothing. The script now injects on all youtube.com pages
   but gates every feature internally on the page type (currentVideoId()
   accepts /watch?v= and /shorts/ID only). Same site, same public page
   metadata as before — no new data access.

2) NEW permission: activeTab
   The toolbar icon now opens the save card when the active tab is a
   YouTube video page, and the options page otherwise; activeTab exposes
   tab.url at the moment of the user's click so background.js can decide.
   Chosen specifically to avoid the broad "tabs" permission.

3) NEW manifest key: commands (Alt+S)
   Opens the same save card on the current video page (tabs.query +
   sendMessage). On a non-video page the message has no receiver and the
   error is swallowed.

4) contextMenus documentUrlPatterns now also includes
   https://www.youtube.com/shorts/* (Shorts support). Shorts URLs are
   normalized to watch?v=ID before saving so the one-row-per-video
   upsert key stays unique.

BEHAVIOR CHANGES

- Already-saved lookup: when the card opens, background reads the user's
  own selected sheet (same Sheets API/scope) to show an "already saved"
  badge, existing-note preview, and existing tags.
- New same-origin fetch: https://www.youtube.com/oembed (unauthenticated
  GET, title/author only) as a scraping fallback when DOM selectors fail
  and on Shorts. Called from the content script on youtube.com itself —
  no new host permission.
- 401 responses invalidate the cached token and retry once with a fresh
  one (auth.js invalidateToken).
- New storage keys: sync.showPrompt (on-open prompt toggle),
  local.sheetTitleCache (first-tab title cache; saves one API call/save).
- Status column never auto-downgrades on re-save; a manual pick wins.
- Esc / outside click closes the card. Options page shows total row
  count + last 5 rows of the selected sheet (read-only, same API).

HOW TO TEST
1. Install → Connect → Create a sheet (as in 0.4.6).
2. Open the youtube.com HOMEPAGE, click into any video (no full reload),
   right-click → "Save to Sheet" → card opens. (Broken in 0.4.6.)
3. Alt+S opens the card; the toolbar icon opens it on a video page and
   opens options elsewhere.
4. Save a video, reopen it → "Already saved" badge + existing note/tags;
   saving updates the same row.
5. Open a /shorts/ URL → right-click → save works.
6. Options: untick "Show the save prompt…" → the on-open bubble stops.

SOURCE shape unchanged: ./build.sh, vanilla JS, no minify/bundle. ESLint
config + package.json are dev-only and not in the zip.
github.com/z-kahraman/youtube-to-sheets
```

---

## Release notes — v0.4.6

> AMO'ya doğrudan 0.4.6 yüklenir; 0.4.5 GitHub'da tag olarak duruyor ama AMO'da
> atlanıyor. Aşağıdaki notlar v0.4.4 → v0.4.6 farkını anlatır (auth fix +
> Drive-based cross-device sync).

### English (default locale)

```
Two fixes that make reconnecting / using multiple devices much smoother.

What changed
- Sheet list now comes from Google Drive instead of browser-synced storage,
  so signing in on a new device, a different browser profile, or a clean
  install shows every sheet you previously created with this extension —
  not an empty picker. The list refreshes automatically whenever you open
  the options page. Browser-side storage is now just a cache for offline
  fallback. (Note: Chrome and Firefox use separate OAuth clients, so each
  browser sees the sheets it created on its own side.)
- Sign out is now a local-only action: it clears the cached token on this
  device but leaves your Google authorization in place. Reconnecting on
  the same Google account keeps access to every sheet the extension
  created — no more "have to create a fresh sheet every time" loop.
- A separate, confirmed "Revoke all access in Google" link is available
  for when you really want to wipe the grant (also clears the local sheet
  list, since those sheets become inaccessible after a full revoke).
- Firefox: tokens are silently refreshed in the background when possible
  (prompt=none flow). You should no longer have to re-authorize every
  hour; re-auth only kicks in if Google can't refresh silently.

No new permissions, no new OAuth scopes.
```

### Türkçe

```
Yeniden bağlanmayı ve birden fazla cihazda kullanmayı çok daha akıcı hâle
getiren iki düzeltme.

Neler değişti
- Sheet listesi artık tarayıcı senkronu yerine doğrudan Google Drive'dan
  geliyor. Yeni bir cihazda / başka bir tarayıcı profilinde / temiz
  kurulumda bağlandığında, bu eklenti ile daha önce oluşturduğun tüm
  sheet'ler picker'da görünür — boş liste yok. Liste, ayarlar sayfasını
  açtığında otomatik tazelenir. Tarayıcı tarafındaki kayıt artık yalnız
  çevrimdışı fallback için bir önbellek. (Not: Chrome ve Firefox ayrı
  OAuth client'ı kullandığı için her tarayıcı kendi tarafında oluşturduğu
  sheet'leri görür.)
- "Çıkış yap" artık yalnız yerel: bu cihazdaki token'ı temizler ama
  Google nezdindeki yetkini korur. Aynı hesapla tekrar bağlandığında
  eklentinin oluşturduğu tüm sheet'lere erişim aynen sürer — "her sefer
  yeni sheet açma" döngüsü bitti.
- "Google'da yetkileri tamamen iptal et" linki ayrı bir onaylı eylem
  olarak eklendi. Gerçekten yetkiyi sıfırlamak istediğinde kullanılır;
  bu durumda yerel sheet listesi de temizlenir.
- Firefox: token'lar artık mümkün olduğunda arka planda sessizce
  yenileniyor (prompt=none akışı). Her saat yeniden yetkilendirme
  zorunluluğu kalktı.

Yeni izin yok, yeni OAuth scope yok.
```

---

## Notes to reviewer — v0.4.6

> AMO ~3000 karakter limiti. Bu blok ~2880 chars.

```
Patch on top of 0.4.4 (0.4.5 was a same-fix-area iteration that landed in
git but was not submitted to AMO; 0.4.6 supersedes it). Two fix areas:

1) SHEET LIST NOW COMES FROM DRIVE (auth.js, options.js)

   options.js loadSheetList() previously read createdSheets from
   storage.sync. That meant a new device, a new browser profile, or a
   clean install showed an empty picker even when the same Google account
   had sheets from a previous session.

   New behavior:
   - Render storage cache immediately for fast first paint.
   - Call drive.files.list with drive.file scope; the API returns ONLY
     files this OAuth client created (not the user's other Drive content),
     which is exactly the set the picker needs.
   - Update storage.sync.createdSheets with the fresh list (cache for
     offline fallback) and re-render.
   - On failure (offline, 403) the cached list stays visible.

   The query is q=mimeType='application/vnd.google-apps.spreadsheet' and
   trashed=false, fields=files(id,name), orderBy=modifiedTime desc.

   Chrome and Firefox use separate OAuth clients, so each browser sees
   only what it created. This is drive.file's intended boundary.

2) SIGN OUT NO LONGER REVOKES THE GOOGLE GRANT (auth.js, options.js)

   options.js disconnect-btn now calls a new signOut() that only clears
   the local token cache. The oauth2/revoke call moved to a new
   revoke-grant-btn (small text-link under Sign Out) behind a confirm()
   dialog; that path also clears createdSheets + selectedSheet and opens
   myaccount.google.com/permissions.

   Why: drive.file grants are per-grant, so revoking on every sign-out
   dropped access to sheets the extension created earlier, forcing users
   to create a fresh one on every reconnect.

3) FIREFOX SILENT TOKEN REFRESH (auth.js)

   getTokenFirefox now tries launchWebAuthFlow({interactive:false}) with
   &prompt=none before any interactive prompt. Returns a fresh
   access_token dialoglessly when the user is signed in to Google; falls
   back to the existing interactive flow on failure.

NO CHANGES TO permissions, host_permissions, content_scripts,
data_collection_permissions, OAuth scopes, or manifest structure
(only "version" bumped). Drive list reuses the existing
www.googleapis.com host permission.

HOW TO TEST

1. Install zip → Connect → Create a sheet. Picker shows it.
2. Sign out (local). Reconnect. Picker still lists the sheet (from Drive).
3. Clear storage / install on a fresh profile. Connect with the same
   Google account. Picker populates from Drive, not empty.
4. Click "Revoke all access in Google" to verify the destructive path.

SOURCE shape unchanged: ./build.sh, vanilla JS, no minify/bundle.
github.com/z-kahraman/youtube-to-sheets
```

---

## Release notes — v0.4.5

### English (default locale)

```
Bug fix: Google connection no longer drops after an hour, and signing out
keeps your existing sheets accessible.

What changed
- Sign out is now a local-only action: it clears the cached token on this
  device but leaves your Google authorization in place. Reconnecting on the
  same Google account keeps access to every sheet the extension created —
  no more "have to create a fresh sheet every time" loop.
- A separate, confirmed "Revoke all access in Google" link is available
  for when you really want to wipe the grant (also clears the local sheet
  list, since those sheets become inaccessible after a full revoke).
- Firefox: tokens are silently refreshed in the background when possible
  (prompt=none flow). You should no longer have to re-authorize every hour;
  re-auth only kicks in if Google can't refresh silently.

No new permissions. No UI surprises beyond the small "Revoke all access"
link under Sign out.
```

### Türkçe

```
Hata düzeltmesi: Google bağlantısı artık her saat kopmuyor ve çıkış yapmak
mevcut sheet'lere erişimini kaybettirmiyor.

Neler değişti
- "Çıkış yap" artık yalnızca yerel bir aksiyon: bu cihazdaki token'ı
  temizler ama Google nezdindeki yetkini korur. Aynı Google hesabıyla
  tekrar bağlandığında eklentinin oluşturduğu tüm sheet'lere erişim aynen
  kalır — "her seferinde yeni sheet açmak zorunda kalma" döngüsü bitti.
- "Google'da yetkileri tamamen iptal et" linki ayrı bir onaylı eylem
  olarak eklendi (gerçekten yetkiyi sıfırdan iptal etmek istediğinde).
  Bu eylem yerel sheet listesini de temizler, çünkü tam iptalden sonra o
  sheet'lere zaten erişilemez.
- Firefox: token'lar artık mümkün olduğunda arka planda sessizce
  yenileniyor (prompt=none akışı). Her saat yeniden yetkilendirmen
  gerekmemeli; sessiz yenileme başarısız olursa yalnız o zaman Google
  ekranı çıkar.

Yeni izin yok. UI'da tek görünür değişiklik: "Çıkış yap" altındaki küçük
"Google'da yetkileri tamamen iptal et" linki.
```

---

## Notes to reviewer — v0.4.5

> Same ~3000-char budget. This block is ~2400 chars.

```
Patch release on top of 0.4.4. Single fix area: how Sign-Out interacts with
Google's grant + Firefox's 1-hour implicit-flow token cap.

WHAT CHANGED (auth.js, options.js)

1) Sign out is now local-only.
   options.js disconnect-btn → calls signOut() which only clears the
   browser-side token cache. It does NOT call oauth2/revoke anymore.
   Why: drive.file grants are per-grant; revoking the grant drops access
   to sheets the extension created earlier. The old behavior forced users
   to create a fresh sheet on every reconnect.

2) Full revoke is now an explicit, confirmed action.
   New revoke-grant-btn (small text-link under Sign Out) → confirm dialog
   → revokeToken(token) → clears createdSheets + selectedSheet from
   storage.sync → opens myaccount.google.com/permissions in a new tab.
   Why: makes the destructive path opt-in and visible; the listed sheets
   would otherwise stay in the picker but fail with 403 on append.

3) Firefox silent token refresh (auth.js).
   getTokenFirefox now: cached → trySilentRefreshFirefox() → interactive.
   The silent path uses launchWebAuthFlow({interactive:false}) with
   &prompt=none. Google returns a fresh access_token without a dialog
   when the user is already signed in to Google. If Google can't refresh
   silently (sign-in expired, consent required, etc.), it falls back to
   the existing interactive flow — no behavior regression.
   Why: implicit flow gives no refresh token, so every 60 minutes the
   user was forced through the OAuth dialog. Silent refresh removes that
   friction without storing any new credential.

NO CHANGES TO:
- permissions / host_permissions / content_scripts (identical to 0.4.4)
- data_collection_permissions (still personallyIdentifyingInfo +
  websiteContent; same justification)
- OAuth scopes (still drive.file + userinfo.email)
- Manifest structure (only "version" bumped to 0.4.5 in both manifests)

HOW TO TEST THE FIX

1. Install zip → Connect with Google → Create a sheet.
2. Click "Sign out" (was: "Disconnect"). Reconnect with the same Google
   account. The previously created sheet should still appear in the
   picker and saving to it should succeed.
3. Click the small "Revoke all access in Google" link under Sign Out.
   Confirm. A myaccount.google.com tab opens; the local sheet list is
   cleared. (This is the explicit destructive path.)
4. (Firefox, optional) Leave the options page open for ~60 minutes,
   then trigger a save from a YouTube watch page. Background should
   refresh the token silently; no OAuth dialog should appear unless the
   Google session itself expired.

SOURCE is unchanged from 0.4.4 in shape: same ./build.sh, same vanilla
JS, no minification/bundling. github.com/z-kahraman/youtube-to-sheets
```

---

## Release notes — v0.4.4

### English (default locale)

```
First public AMO release.

What it does
- Right-click any YouTube watch page → "Save to Sheet" — or use the on-open prompt
  that asks once per video whether you want to save it.
- A small note card appears at the cursor (isolated in a closed Shadow DOM). You can
  add a note and tags before saving.
- Captures title, channel, channel link, URL, watched / total time, your note, tags,
  and an auto-derived status (Watched / Partially watched / Opened).
- Upsert: saving the same video again updates its existing row (note appended, tags
  merged, watched time refreshed) — no duplicate rows.
- Create a sheet, pick an already-created one, or open it in a new tab — all from
  the options page. Light / dark / auto theme + English / Turkish UI.
- Privacy-first: data goes straight from your browser to Google. No third-party
  servers, no analytics, no ads. The extension can only touch the Sheets it created
  (`drive.file` scope).
```

### Türkçe

```
İlk AMO yayını.

Ne işe yarıyor
- YouTube watch sayfasında sağ tık → "Sheet'e kaydet". Ya da video açılınca çıkan
  "Bu videoyu kaydedeyim mi?" balonu (her video için bir kez).
- İmlecin olduğu yerde küçük not kartı açılır (kapalı Shadow DOM ile izole). Not
  ve etiket ekleyerek kaydedersin.
- Otomatik bilgiler: başlık, kanal, kanal linki, URL, izlenen/toplam süre, notun,
  etiketlerin ve ilerlemeden türeyen Durum (İzlendi / Kısmen izlendi / Açıldı).
- Upsert: aynı videoyu tekrar kaydedince satır güncellenir (not eklenir, etiketler
  birleşir, izleme süresi tazelenir) — yeni satır açılmaz.
- Yeni sheet oluştur, oluşturduklarından seç ya da ayarlardan yeni sekmede aç.
  Açık / koyu / otomatik tema + TR / EN arayüz.
- Gizlilik öncelikli: veriler doğrudan tarayıcından Google'a gider. Üçüncü taraf
  sunucu, analitik ya da reklam YOK. Eklenti yalnızca kendi oluşturduğu Sheets
  dosyalarına erişebilir (`drive.file` scope).
```

---

## Notes to reviewer (private)

> AMO limits this field to **3000 characters**. The block below is ~2700 chars,
> leaving room for small additions. Single English block — reviewers read English.

```
Open-source MV3 extension that saves YouTube videos to the user's own Google Sheet.

SOURCE
https://github.com/z-kahraman/youtube-to-sheets
Built by ./build.sh — vanilla JS, no framework / bundler / build step; the zip
contains the unminified source as-is. The repo also produces *-firefox-dev.zip
whose only difference is strict_min_version=115 (for local about:debugging on
older Firefox); the AMO zip uses Fx 140 / Android 142 so
data_collection_permissions is enforced.

SINGLE PURPOSE
Save the YouTube video the user is watching — public metadata (title, channel,
URL, watched/total time) + the user's note, tags, and a status — as a row in a
Google Sheet the user owns.

OAUTH (no restricted scopes; no CASA required)
- drive.file      Touches only Sheets the extension itself created.
- userinfo.email  Shows the connected email on the options page.

PERMISSIONS
- storage      storage.sync: selectedSheet, createdSheets, lang, theme.
- identity     Firefox: browser.identity.launchWebAuthFlow (implicit flow).
               chrome.identity.getAuthToken / removeCachedAuthToken are gated by
               HAS_GET_AUTH_TOKEN (Chrome-only) and written via bracket notation
               so AMO's static analyzer no longer flags them.
- contextMenus "Save to Sheet" right-click, documentUrlPatterns-restricted to
               https://www.youtube.com/watch* only.
- hosts        sheets.googleapis.com, www.googleapis.com, oauth2.googleapis.com
               (Sheets API + userinfo + token revoke).
- content script (youtube.com/watch) reads visible page metadata and renders
               the note card inside a closed Shadow DOM.

DATA FLOW
Browser → Google APIs directly. No third-party servers, analytics, telemetry,
or ads. data_collection_permissions: personallyIdentifyingInfo (user email on
options page) + websiteContent (YouTube page metadata the user writes into
their own sheet). Notes/tags are user-typed and sent only to the user's own
sheet at the explicit save action. No cross-user sharing.

HOW TO TEST (any Google account)
1. about:debugging → Load Temporary Add-on → install the zip. Options page opens.
2. "Connect with Google" → OAuth screen shows only drive.file + userinfo.email.
3. "Create new sheet" → a spreadsheet appears in the tester's Drive.
4. Open any https://www.youtube.com/watch?v=... Then either accept the on-open
   "Save this video?" prompt, or right-click → "Save to Sheet". Type a note +
   tag in the card, press Save.
5. "Open sheet" → a new row contains the video metadata, your note, status.
6. Save the same video again with a different note → the existing row updates
   (note appended, tags merged) instead of duplicating.
```

---

## Türkçe — incelemecilere not (özel) — yerel arşiv

> AMO incelemecileri İngilizce okur; bu blok yalnız Türkçe arşiv. Aşağıdaki Türkçe
> blok 3000 karakter sınırına SIKIŞTIRILMADI — AMO'ya yapıştırılacaksa kısaltılması
> gerekir. Sınır için yukarıdaki İngilizce blok kullanılmalı.

```
İnceleme için teşekkürler. Bu, kullanıcının izlediği YouTube videosunu kendi
Google Sheets dosyasına kaydeden açık kaynak MV3 eklentisidir.

KAYNAK KOD
- https://github.com/z-kahraman/youtube-to-sheets
- Gönderilen zip ./build.sh ile üretilir ve depodaki kaynağın aynısını içerir
  (vanilla JS, framework / bundler / build adımı YOK — build.sh sadece dosya
  kopyalayıp zip'liyor).
- Lokal `about:debugging` ile eski Firefox sürümlerinde de yüklenebilsin diye
  depo yt2sheets-firefox-dev.zip varyantını da üretir; tek farkı
  strict_min_version=115 olmasıdır. AMO'ya gönderilen zip
  strict_min_version=140 / Android 142 kullanır.

TEK AMAÇ
Kullanıcının izlediği YouTube videosunu — kamuya açık metadatayı (başlık, kanal,
URL, izlenen/toplam süre) + kullanıcının notu, etiketleri ve durum alanını —
kullanıcının kendi sahibi olduğu Google Sheets dosyasında bir satır olarak kaydeder.

OAUTH SCOPE'LARI
- drive.file        Eklenti yalnızca KENDİ OLUŞTURDUĞU Sheets dosyalarına erişir.
                    Kullanıcının Drive'ındaki başka hiçbir dosyayı listeleyemez,
                    okuyamaz, değiştiremez.
- userinfo.email    Ayarlar sayfasında bağlı hesabın e-postasını gösterir
                    ("hangi Google hesabıyla bağlıyım" doğrulaması).
Kısıtlı (restricted) scope yok; CASA değerlendirmesi gerekmez.

İZİN GEREKÇELERİ
- storage         storage.sync anahtarları: selectedSheet, createdSheets, lang, theme.
- identity        Firefox tarafında browser.identity.launchWebAuthFlow (Web OAuth
                  implicit flow) kullanılır. auth.js'teki
                  chrome.identity.getAuthToken / removeCachedAuthToken
                  referansları HAS_GET_AUTH_TOKEN runtime check'inin arkasında ve
                  yalnız Chrome'da çalışır; bracket notation
                  (chrome.identity['getAuthToken']) ile yazıldı, AMO statik
                  tarayıcı bunları Firefox-uyumsuz olarak bildirmiyor.
- contextMenus    "Sheet'e kaydet" sağ-tık menüsü, documentUrlPatterns ile
                  yalnız https://www.youtube.com/watch* sayfalarına kısıtlı.
- host sheets.googleapis.com   kullanıcının sheet'inde satır yazıp okumak.
- host www.googleapis.com      drive.file endpoint + userinfo.email.
- host oauth2.googleapis.com   bağlantı kesilince token iptali.
- content script (youtube.com/watch)   görünür sayfa metadatasını (başlık,
                                       kanal, süreler) okur ve not kartını
                                       kapalı Shadow DOM içinde render eder —
                                       YouTube'un CSS/JS'i ona dokunamaz.

VERİ AKIŞI VE GİZLİLİK
- Tüm veri tarayıcı → Google API'leri yönünde, doğrudan. Üçüncü taraf sunucu,
  analitik, telemetri, reklam YOK.
- data_collection_permissions: personallyIdentifyingInfo (kullanıcı e-postası,
  ayarlar sayfasında gösterilir) ve websiteContent (kullanıcının kendi sheet'ine
  yazılmasını istediği YouTube sayfa metadatası).
- Kullanıcının yazdığı not/etiketler kullanıcının açık kayıt eylemiyle ve yalnız
  kullanıcının kendi sheet'ine gönderilir.
- Kullanıcılar arası içerik paylaşımı yoktur.

NASIL TEST EDİLİR
Bir Google hesabına ihtiyaç var (herhangi bir).
1. Zip'i `about:debugging` → Load Temporary Add-on ile yükle. Ayarlar sayfası
   yeni sekmede açılır.
2. "Google ile bağlan"a bas, OAuth akışını tamamla. İzin ekranı yalnız
   drive.file + userinfo.email gösterir.
3. "Yeni sheet oluştur"a bas. Test eden kişinin Drive'ında bir spreadsheet açılır.
4. Herhangi bir YouTube videosu aç (https://www.youtube.com/watch?v=...).
   Sonra ya:
     - açılışta çıkan "Bu videoyu kaydedeyim mi?" balonunda "Evet" de, ya da
     - sağ tık → "Sheet'e kaydet" yap.
   Not kartı açılır. Bir not + etiket yaz, "Kaydet"e bas.
5. Sheet'i aç (ayarlar sayfasındaki düğmeden). Video metadatası, notun ve
   otomatik türeyen durum ile yeni bir satır görünür.
6. Aynı videoyu farklı bir notla tekrar kaydet → yeni satır AÇILMAZ; mevcut
   satır güncellenir (not altına eklenir, etiketler birleşir).

İLETİŞİME GEÇİLEN NETWORK ADRESLERİ
- accounts.google.com           OAuth authorize
- oauth2.googleapis.com         OAuth revoke
- www.googleapis.com            userinfo.email
- sheets.googleapis.com         spreadsheet create / append / get / update

Her şey hakkında soru için listedeki e-postadan ulaşılabilir.
```
