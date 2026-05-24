# Chrome Web Store yayın rehberi

Herkese açık yayın için adımlar. Mühendislik kısmı (scope daraltma vb.) kodda yapıldı;
aşağıdakiler büyük ölçüde Google Cloud / Web Store panelinde senin yapacağın işlemler.

## 0. Ön koşul (tamamlandı)
- ✅ Scope'lar `drive.file` + `userinfo.email`'e indirildi → restricted scope yok,
  pahalı CASA güvenlik değerlendirmesi gerekmez.
- ✅ Güvenlik sertleştirmeleri (#1, #3–#7) yapıldı.

## 1. Gizlilik politikası host'la
- Repo'daki `PRIVACY.md` içeriğini bir yere yayınla (GitHub Pages, kişisel site, Gist).
- Ortaya çıkan **URL** OAuth doğrulamada ve mağaza listesinde gerekecek.

## 2. OAuth consent screen (Google Cloud Console)
- https://console.cloud.google.com/auth/branding (doğru proje seçili olsun)
- App name, support email, **developer contact**, **app logo** (icon128.png), 
  **application home page**, **privacy policy URL** doldur.
- Scopes bölümünde yalnızca `drive.file` ve `userinfo.email` görünmeli.
- Publishing status: **"Testing" → "In production"** yap. Sensitive scope (`drive.file`)
  kullanıldığı için **doğrulama (verification)** istenecek:
  - Marka doğrulama + scope gerekçesi.
  - Genellikle scope kullanımını gösteren **demo video** (uzantıyı kurup sheet'e
    kaydetmeyi gösteren ekran kaydı) isterler.

## 3. Extension ID / OAuth client (chicken-and-egg)
- Web Store'a ilk yüklemede uzantıya kalıcı bir **ID** atanır.
- Yerel "unpacked" ID ile yayınlanan ID'yi eşitlemek için: store item oluştuktan sonra
  paketin **public key**'ini al, `manifest.json`'a `"key": "<public_key>"` ekle.
- OAuth client (type: Chrome Extension) → **Application ID** alanını yayınlanan ID ile
  güncelle. Aksi halde yayınlanan sürümde `chrome.identity` token alamaz.
- Sıra önerisi: önce Web Store'a draft yükle → ID'yi öğren → OAuth client'ı güncelle →
  (gerekirse) `key`'i manifest'e ekleyip tekrar paketle.

## 4. Web Store geliştirici hesabı + listeleme
- https://chrome.google.com/webstore/devconsole — tek seferlik **$5** kayıt.
- `docs/store-listing.md` içeriğini kullan (açıklama, kategori, permission justification).
- Ekran görüntüleri (1280x800 veya 640x400) ekle — en az 1 tane.
- İkon (128px) hazır.
- `.zip` paketini yükle (bkz. `docs/publishing.md` → "Paketleme" ya da repo kökünde
  oluşturulan zip).

## 5. Paketleme
Yüklenecek zip yalnızca runtime dosyalarını içermeli (docs, .git, plan dosyaları HARİÇ):
```
zip -r ../yt2sheets.zip manifest.json background.js content.js \
  options.html options.css options.js icons/icon16.png icons/icon32.png \
  icons/icon48.png icons/icon128.png
```

## 6. İnceleme
- Web Store incelemesi (politika uyumu) + OAuth doğrulama paralel ilerler.
- Onaylanınca herkese açık olur. Onaya kadar yalnızca test user'lar kurabilir.

## Notlar
- `version` (manifest) her yeni yüklemede artırılmalı.
- Scope değiştiği için mevcut token'lar geçersiz: test ederken
  https://myaccount.google.com/permissions üzerinden eski izni kaldırıp yeniden bağlan.
