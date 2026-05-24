# Firefox kurulum ve yayın rehberi

Firefox, Chrome'un `chrome.identity.getAuthToken`'ını **desteklemez**. Bu yüzden Firefox'ta
auth, `browser.identity.launchWebAuthFlow` (implicit flow) ile yapılır ve **ayrı bir Google
OAuth client** (Web application tipi) gerekir. Kod tarafı hazır (`auth.js` tarayıcıya göre
otomatik dallanır); aşağıdakiler Google Cloud + Firefox tarafında senin yapacakların.

> Chrome auth'una dokunulmadı — Chrome hâlâ `getAuthToken` ile çalışır.

## 1. Google Cloud: Web OAuth client
- Mevcut projede (Sheets API enable olmalı) **yeni bir OAuth client** oluştur:
  type = **Web application**. (Chrome'unki "Chrome Extension" tipiydi; bu ayrı.)
- OAuth consent screen → scope'lar: `drive.file` + `userinfo.email`; kendi Gmail'ini
  **test user** olarak ekle (test mode'da).
- Client ID'yi not et (redirect URI'yi 3. adımda ekleyeceğiz).

## 2. Redirect URL'i öğren (sabit)
`manifest.firefox.json`'da `gecko.id` tanımlı olduğu için `getRedirectURL()` **add-on
ID'sinden türetilen sabit bir URL** döndürür — yani tek URI tüm kullanıcılarda geçerli
(MDN). Değerini almak için:

1. `./build.sh` çalıştır → `dist/yt2sheets-firefox.zip`
2. Firefox → `about:debugging` → "This Firefox" → **Load Temporary Add-on** →
   `dist/yt2sheets-firefox.zip` (veya açılmış klasördeki `manifest.json`)
3. Aynı satırda **Inspect** → açılan konsola yaz:
   ```js
   browser.identity.getRedirectURL()
   ```
   Çıktı `https://<hash>.extensions.allizom.org/` biçiminde olur. Bunu kopyala.

## 3. Redirect URI'yi Google'a ekle
- Google Cloud → 1. adımdaki Web client → **Authorized redirect URIs** →
  2. adımdaki URL'i ekle → Save.

## 4. Client ID'yi koda gir
- `auth.js` → `FIREFOX_OAUTH.clientId` alanına Web client ID'sini yaz.
- `./build.sh` ile yeniden paketle, add-on'u tekrar yükle.

## 5. Test
- Uzantı ayarları → "Google ile bağlan" → Google consent → token döner.
- Bir YouTube videosu kaydet → satır sheet'e düşmeli.

## Bilinen sınırlar / notlar
- **Implicit flow:** access token ~1 saat geçerli, refresh token yok. Süresi dolunca
  yeniden bağlanmak (interactive) gerekir. Token `chrome.storage.local`'da expiry ile
  tutulur. İleride **PKCE auth-code flow** ile yenileme eklenebilir (iyileştirme).
- **Loopback alternatifi (Firefox 86+):** İstenirse redirect olarak
  `http://127.0.0.1/mozoauth2/<getRedirectURL alt-domaini>` da kullanılabilir.
- Implicit flow Google tarafında kısıtlanırsa PKCE'ye geçilir.

## 6. AMO yayını (addons.mozilla.org) — ücretsiz

Paket hazır: `web-ext lint` = 0 hata. (`data_collection_permissions: none` eklendi,
`strict_min_version: 142` → bu anahtar Firefox 140+/Android 142+ ister.)

Adımlar:
1. [addons.mozilla.org](https://addons.mozilla.org) → giriş (Mozilla hesabı) → **Developer Hub**
   → **Submit a New Add-on**.
2. Dağıtım türü:
   - **"On this site" (listed)** → AMO'da herkese açık listelenir. ← genel kullanım için.
   - "On your own" → kendin dağıttığın imzalı `.xpi` (listelenmez).
3. `dist/yt2sheets-firefox.zip` yükle → otomatik doğrulama (aynı web-ext lint).
4. **Kaynak kodu:** build/minify yok (sadece zip) → kaynak gönderimi gerekmez.
   Sorarlarsa GitHub linki: https://github.com/z-kahraman/youtube-to-sheets
5. Listeleme: ad, özet, açıklama (`docs/store-listing.md`), kategori, ekran görüntüleri
   (`screenshots/`), **gizlilik politikası** (PRIVACY.md içeriği veya host URL'si).
6. Gönder → inceleme.
7. Her yeni sürümde `manifest.firefox.json` `version` artır + `./build.sh`.

### ⚠️ AMO ≠ herkes bağlanabilir
AMO listesi herkesin **kurmasını** sağlar; ama **Google'a bağlanmak** için Google
tarafındaki Web OAuth client'ın "Testing" modundaysa yalnızca **test user'lar**
bağlanabilir. Tam herkese açık kullanım için Google consent screen'i **"In production"**
yapıp doğrulatman gerekir (drive.file "sensitive" scope → marka + scope doğrulaması;
pahalı CASA gerekmez). Kendin + birkaç test kullanıcı için test mode yeterli.

## Kaynaklar
- [identity.launchWebAuthFlow — MDN](https://developer.mozilla.org/en-US/docs/Mozilla/Add-ons/WebExtensions/API/identity/launchWebAuthFlow)
- [identity API — MDN](https://developer.mozilla.org/en-US/docs/Mozilla/Add-ons/WebExtensions/API/identity)
- [Firefox WebExtension and OAuth with Google — Mozilla Discourse](https://discourse.mozilla.org/t/firefox-webextension-and-oauth-browser-identity-getredirecturl-with-google-resolved/42362)
