# YouTube to Sheets

İzlediğin YouTube videolarını **not ve etiketlerle** tek tıkla kendi Google Sheets
dosyana kaydeden bir tarayıcı uzantısı. Manifest V3, framework yok (vanilla JS).

Gizlilik öncelikli: verilerin doğrudan tarayıcından Google'a gider — üçüncü taraf sunucu,
analitik veya reklam **yok**. Uzantı yalnızca kendi oluşturduğu Sheets dosyalarına erişir
(`drive.file`).

## Özellikler
- YouTube watch sayfasında **sağ tık → "Sheet'e kaydet"**
- İmlecin olduğu yerde küçük not kartı (closed Shadow DOM ile izole)
- Otomatik bilgi: başlık, kanal, kanal linki, video URL'si, izlenen/toplam süre
- Not + çoklu **etiket** (virgül / Tab / Enter ile chip)
- Sheet oluştur veya daha önce oluşturduklarından seç
- 9 sütunlu satır: Tarih, Başlık, Kanal, Kanal Linki, URL, İzleme Süresi, Toplam Süre, Not, Etiketler

## Kurulum (lokal / geliştirici modu)

### Chrome / Chromium
1. `chrome://extensions` → "Geliştirici modu" aç
2. "Load unpacked" → bu klasörü seç
3. Açılan ayarlar sayfasından Google ile bağlan, bir sheet oluştur

### Firefox
> Firefox desteği geliştiriliyor (ayrı OAuth akışı — bkz. `docs/firefox-setup.md`).
1. `about:debugging` → "This Firefox" → "Load Temporary Add-on"
2. Firefox manifest'i ile paketlenmiş sürümü seç

## Geliştiriciler için: kendi Google OAuth client'ını kur
Bu repo'daki `client_id` proje sahibine aittir; kendi kopyanı çalıştırmak için kendi
OAuth client'ını oluşturman gerekir (gizli bir anahtar değildir, ama sana çalışmaz):

1. [Google Cloud Console](https://console.cloud.google.com/)'da yeni proje aç
2. **Google Sheets API**'yi enable et
3. OAuth consent screen'i yapılandır (test mode + kendi Gmail'ini test user ekle)
4. OAuth client oluştur (type: **Chrome Extension**), extension ID'ni gir
5. `manifest.json` → `oauth2.client_id` alanına kendi client ID'ni yaz
6. Scope'lar: `drive.file`, `userinfo.email`

Ayrıntılı sorun giderme `CLAUDE.md` içindeki "Bilinen sorunlar" bölümünde.

## Proje yapısı
- `manifest.json` — uzantı yapılandırması + OAuth scope'ları
- `background.js` — service worker: context menu, OAuth, Sheets append
- `content.js` — YouTube DOM scrape + not kartı (Shadow DOM)
- `options.html/css/js` — kurulum ekranı, sheet oluştur/seç
- `icons/` — logo (svg kaynağı + png'ler)
- `docs/` — yayın rehberleri, güvenlik planı
- `PRIVACY.md` — gizlilik politikası

## Güvenlik & gizlilik
Güvenlik denetimi yapıldı; tüm bulgular kapatıldı (formül enjeksiyonu, scope daraltma,
Shadow DOM izolasyonu vb.). Detay: `docs/` ve `PRIVACY.md`.

## Katkı
Issue ve PR'lara açıktır. Küçük bir araç — okunabilirlik ve gizlilik önceliklidir.
Kod konvansiyonları için `CLAUDE.md`'ye bakın (yorumlar Türkçe, değişken adları İngilizce).

## Lisans
[MIT](LICENSE) © 2026 Zafer Kahraman
