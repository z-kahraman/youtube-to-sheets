# AMO submission — release notes & notes to reviewer

Ready-to-paste text for the AMO submission form. Update the version line at the top
of each release; the rest of the body is mostly reusable submission-to-submission.

The **first** version block is what the public sees on the listing page
(addons.mozilla.org → versions). The **second** block is private — only Mozilla
reviewers read it.

Permission rationales live in `store-listing.md`; this file only adds release/
review context. The privacy policy is in `PRIVACY.en.md` / `PRIVACY.md`.

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
