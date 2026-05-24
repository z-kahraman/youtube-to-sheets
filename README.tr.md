🇬🇧 [English](README.md) | 🇹🇷 **Türkçe**

# YouTube to Sheets

İzlediğin YouTube videolarını **not ve etiketlerle** tek tıkla kendi Google Sheets
dosyana kaydeden bir tarayıcı uzantısı. Manifest V3, framework yok (vanilla JS).
Chrome ve Firefox'ta çalışır.

Gizlilik öncelikli: verilerin doğrudan tarayıcından Google'a gider — üçüncü taraf sunucu,
analitik veya reklam **yok**. Uzantı yalnızca kendi oluşturduğu Sheets dosyalarına erişir
(`drive.file`).

## Ekran görüntüleri
![YouTube sayfasında not kartı](screenshots/note-card-tr.png)
![Kurulum / ayarlar sayfası](screenshots/options-tr.png)

## Özellikler
- YouTube watch sayfasında **sağ tık → "Sheet'e kaydet"**
- İmlecin olduğu yerde küçük not kartı (closed Shadow DOM ile izole)
- Otomatik bilgi: başlık, kanal, kanal linki, video URL'si, izlenen/toplam süre
- Not + çoklu **etiket** (virgül / Tab / Enter ile chip)
- Sheet oluştur veya daha önce (uygulamayla) oluşturduklarından seç
- 9 sütunlu satır: Tarih, Başlık, Kanal, Kanal Linki, URL, İzleme Süresi, Toplam Süre, Not, Etiketler

## Kurulum (lokal / geliştirici modu)

Paketleri üret: `./build.sh` → `dist/yt2sheets-chrome.zip`, `dist/yt2sheets-firefox.zip`

### Chrome / Chromium
1. `chrome://extensions` → "Geliştirici modu" aç
2. "Load unpacked" → bu klasörü seç
3. Açılan ayarlar sayfasından Google ile bağlan, bir sheet oluştur

### Firefox
1. `about:debugging` → "This Firefox" → "Load Temporary Add-on"
2. `dist/yt2sheets-firefox.zip` dosyasını seç
3. Auth için ayrı bir Google **Web** OAuth client gerekir — bkz. `docs/firefox-setup.md`

## Geliştiriciler için: kendi Google OAuth client'ını kur
Bu repo'daki client ID'ler proje sahibine aittir; kendi kopyanı çalıştırmak için kendi
client'larını oluşturman gerekir (gizli anahtar değildir ama sana çalışmaz):

1. [Google Cloud Console](https://console.cloud.google.com/)'da proje aç, **Google Sheets API**'yi enable et
2. OAuth consent screen (test mode + kendi Gmail'ini test user ekle), scope'lar: `drive.file`, `userinfo.email`
3. **Chrome:** OAuth client (type: Chrome Extension) → `manifest.json` `oauth2.client_id`
4. **Firefox:** OAuth client (type: Web application) → `auth.js` `FIREFOX_OAUTH.clientId` + redirect URI (`docs/firefox-setup.md`)

## Proje yapısı
- `manifest.json` / `manifest.firefox.json` — Chrome / Firefox yapılandırması
- `auth.js` — tarayıcı-bağımsız OAuth katmanı
- `background.js` — service worker / event page: context menu, Sheets append
- `content.js` — YouTube DOM scrape + not kartı (Shadow DOM)
- `options.html/css/js` — kurulum ekranı, sheet oluştur/seç
- `icons/` — logo (svg kaynağı + png'ler)
- `build.sh` — chrome/firefox zip üretimi
- `docs/` — yayın & Firefox kurulum rehberleri, güvenlik planı
- `PRIVACY.md` — gizlilik politikası

## Güvenlik & gizlilik
Güvenlik denetimi yapıldı; tüm bulgular kapatıldı (formül enjeksiyonu, scope daraltma,
Shadow DOM izolasyonu vb.). Detay: `docs/` ve `PRIVACY.md`.

## Katkı
Issue ve PR'lara açıktır. Küçük bir araç — okunabilirlik ve gizlilik önceliklidir.
Kod konvansiyonları için `CLAUDE.md`'ye bakın (yorumlar Türkçe, değişken adları İngilizce).

## Lisans
[MIT](LICENSE) © 2026 Zafer Kahraman
