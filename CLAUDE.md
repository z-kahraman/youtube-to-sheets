# YouTube to Sheets Extension

## Ne yapıyor
Chrome extension. YouTube watch sayfasında sağ tıkla → 
seçili Google Sheet'e satır olarak kaydet (tarih, başlık, kanal, URL, 
izleme süresi, not, etiket).

## Stack
- Manifest V3, vanilla JS (framework yok)
- Google Sheets API v4 + Drive API v3
- OAuth 2.0 via chrome.identity
- chrome.storage.sync for selected sheet

## Dosya yapısı
- manifest.json — extension config + OAuth scopes
- background.js — service worker, context menu, OAuth, Sheets append
- content.js — YouTube DOM scrape + overlay not kartı UI + etiket chip'leri
- options.html/css/js — setup ekranı, sheet seç/oluştur
- icons/ — icon.svg (kaynak) + icon16/32/48/128.png (manifest icons + action)

## Konvansiyonlar
- Inline script YOK (CSP), tüm JS dış dosyada
- Inline event handler YOK (onclick=...)
- Yorumlar Türkçe, koddaki değişken adları İngilizce
- Hata yönetimi: toast() ile kullanıcıya göster

## Mevcut durum
- ✅ Options sayfası açılıyor
- ✅ OAuth çalışıyor (test user + Drive/Sheets API enable gerekli)
- ✅ Sheet listeleme + oluşturma çalışıyor
- ✅ Context menu yazıldı (sağ tık → "Sheet'e kaydet")
- ✅ Content script yazıldı (DOM scrape + overlay not kartı)
- ⏳ Uçtan uca kaydetme test ediliyor

## Bilinen sorunlar / gotcha'lar
- Google Cloud OAuth consent screen test mode'da → kullanılacak 
  Gmail test users listesine eklenmiş olmalı (auth/audience sayfası)
- Drive API + Sheets API Cloud projede ayrı ayrı enable edilmeli
- Extension ID klasör konumuna bağlı; taşırsan Cloud Console'da 
  Application ID güncellenmeli
- Sağ tık menüsü sadece youtube.com/watch sayfalarında çıkar
- Mevcut (dışarıdan seçilen) sheet'lerde header satırı garanti değil;
  ilk sekmeye append edilir — gerekirse header'ı elle eklemek gerekebilir
- Satır 9 sütun: Tarih, Başlık, Kanal, Kanal Linki, URL, İzleme Süresi,
  Toplam Süre, Not, Etiketler (A:I). Eski 8 sütunlu sheet'lerde Kanal
  Linki araya girdiği için başlıklar kayar — header'ı güncelle