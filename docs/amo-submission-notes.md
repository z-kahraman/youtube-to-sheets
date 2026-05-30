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

> Single block, English. Reviewers read English; one block keeps the trail clean.

```
Thanks for reviewing. This is an open-source MV3 extension that saves YouTube
videos to the user's own Google Sheet.

SOURCE CODE
- https://github.com/z-kahraman/youtube-to-sheets
- The submitted zip is built by ./build.sh and contains the unminified source
  exactly as it appears in the repo (vanilla JS, no framework, no bundler, no
  build step — build.sh only copies files and zips them).
- The repo also ships a yt2sheets-firefox-dev.zip variant whose only difference
  is strict_min_version=115 (for local about:debugging install on older Firefox
  builds); the AMO-submitted zip uses strict_min_version=140 / Android 142 so
  data_collection_permissions is enforced.

SINGLE PURPOSE
Save the YouTube video the user is currently watching — its public metadata
(title, channel, URL, watched/total time) plus the user's own note, tags, and a
status field — as a row in a Google Sheet that the user owns.

OAUTH SCOPES
- drive.file        — the extension can only touch Sheets it created. It cannot
                      list, read, or modify any other file in the user's Drive.
- userinfo.email    — displays the connected account's email on the options page
                      so the user can confirm "which Google account is connected".
No restricted scopes; no CASA assessment required.

PERMISSION RATIONALES
- storage         storage.sync keys: selectedSheet, createdSheets, lang, theme.
- identity        Firefox uses browser.identity.launchWebAuthFlow (Web OAuth
                  implicit flow). The chrome.identity.getAuthToken /
                  removeCachedAuthToken references in auth.js are gated behind
                  a runtime feature check (HAS_GET_AUTH_TOKEN) and only execute
                  on Chrome; they're written via bracket notation
                  (chrome.identity['getAuthToken']) so AMO's static analyzer no
                  longer flags them as Firefox-incompatible.
- contextMenus    Right-click "Save to Sheet" menu, restricted via
                  documentUrlPatterns to https://www.youtube.com/watch* only.
- host sheets.googleapis.com   write/read rows in the user's sheet.
- host www.googleapis.com      drive.file endpoint + userinfo.email.
- host oauth2.googleapis.com   token revocation on disconnect.
- content script (youtube.com/watch)   reads visible page metadata (title,
                                       channel, timestamps) and renders the
                                       note card inside a closed Shadow DOM
                                       so YouTube's CSS / scripts cannot
                                       reach it.

DATA FLOW & PRIVACY
- All data goes browser → Google APIs directly. No third-party servers, no
  analytics, no telemetry, no ads.
- data_collection_permissions declares: personallyIdentifyingInfo (user email,
  shown on options page) and websiteContent (the YouTube page metadata the user
  asks to be written into their own sheet).
- Notes/tags typed by the user are user-generated content sent only to the
  user's own sheet at the user's explicit save action.
- No content is shared across users.

HOW TO TEST
You will need a Google account (any).
1. Install the zip via about:debugging → Load Temporary Add-on. The options page
   opens in a new tab.
2. Click "Connect with Google" and complete the OAuth flow. Scope screen will
   show drive.file + userinfo.email only.
3. Click "Create new sheet". A spreadsheet is created in the tester's Drive.
4. Open any YouTube video (https://www.youtube.com/watch?v=...). Either:
     - accept the on-open "Save this video?" prompt, OR
     - right-click → "Save to Sheet".
   The note card opens. Type a note + a tag, press "Save".
5. Open the sheet (button on the options page). A new row appears with the video
   metadata, your note, and the auto-derived status.
6. Save the same video again with a different note → the existing row updates
   (note appended, tags merged) instead of creating a duplicate row.

NETWORK ENDPOINTS CONTACTED
- accounts.google.com           OAuth authorize
- oauth2.googleapis.com         OAuth revoke
- www.googleapis.com            userinfo.email
- sheets.googleapis.com         spreadsheet create/append/get/update

Happy to clarify anything — contact via the email on the listing.
```

---

## Türkçe — incelemecilere not (özel)

> AMO incelemecileri İngilizce okur; bu blok yerel arşiv için.

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
