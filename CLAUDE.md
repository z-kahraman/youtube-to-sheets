# YouTube to Sheets Extension

## Ne yapıyor
Chrome extension. YouTube watch sayfasında sağ tıkla → 
seçili Google Sheet'e satır olarak kaydet (tarih, başlık, kanal, URL, 
izleme süresi, not, etiket).

## Stack
- Manifest V3, vanilla JS (framework yok), cross-browser (Chrome + Firefox)
- Google Sheets API v4 (Drive listeleme KALDIRILDI — bkz. scope daraltma)
- OAuth 2.0 — scope: drive.file + userinfo.email
  - Chrome: chrome.identity.getAuthToken
  - Firefox: browser.identity.launchWebAuthFlow (implicit flow, ayrı Web client)
- chrome.storage.sync: selectedSheet + createdSheets (uygulama-sahipli liste)

## Cross-browser
- auth.js: tarayıcıya göre dallanan ortak OAuth katmanı (Chrome dalı = eski davranış).
  background.js (Chrome'da importScripts, Firefox'ta background.scripts) ve options.html
  bunu yükler.
- manifest.json = Chrome (service_worker + oauth2). manifest.firefox.json = Firefox
  (background.scripts + gecko.id, oauth2 YOK).
- ./build.sh → dist/yt2sheets-chrome.zip + dist/yt2sheets-firefox.zip
- Firefox auth kurulumu: docs/firefox-setup.md (Web client + redirect URL).

## Dosya yapısı
- manifest.json / manifest.firefox.json — Chrome / Firefox config
- auth.js — ortak OAuth katmanı (getToken/revokeToken, tarayıcı-bağımsız)
- background.js — service worker/event page: context menu, Sheets append
- content.js — YouTube DOM scrape + overlay not kartı (Shadow DOM) + etiket chip'leri
- options.html/css/js — setup ekranı, sheet oluştur/seç (uygulama-sahipli)
- icons/ — icon.svg (kaynak) + icon16/32/48/128.png
- build.sh — chrome/firefox zip üretimi
- README.md, LICENSE (MIT), PRIVACY.md
- docs/ — RELEASE-CHECKLIST, firefox-setup, publishing, store-listing, security-2-oauth-scope-plan

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

## Scope daraltma (2026-05-24, public yayın için)
- Scope artık sadece drive.file + userinfo.email (spreadsheets +
  drive.metadata.readonly KALDIRILDI) → restricted scope yok, CASA gerekmez.
- Sonuç: uygulama YALNIZCA kendi oluşturduğu sheet'lere erişir. "Dışarıdan
  herhangi bir sheet seç" özelliği kaldırıldı; kullanıcı yeni oluşturur veya
  createdSheets listesinden seçer.
- Migration: eski selectedSheet harici bir sheet'i gösteriyorsa append 403
  alır → kullanıcı yeni sheet oluşturmalı.

## Bilinen sorunlar / gotcha'lar
- Scope değişince eski OAuth token'lar geçersiz → myaccount.google.com/permissions'tan
  izni kaldırıp yeniden bağlan (test ederken).
- Sheets API Cloud projede enable olmalı (Drive API artık gerekmez).
- Extension ID: Web Store'a yükleyince ID değişir → OAuth client Application ID
  güncellenmeli veya manifest'e store key eklenmeli (bkz. docs/publishing.md).
- Sağ tık menüsü sadece youtube.com/watch sayfalarında çıkar.
- Satır 9 sütun: Tarih, Başlık, Kanal, Kanal Linki, URL, İzleme Süresi,
  Toplam Süre, Not, Etiketler (A:I).