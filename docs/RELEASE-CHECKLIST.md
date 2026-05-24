# YouTube to Sheets — Sürüm / Yayın Kontrol Listesi

Tek bakışta "nerede kaldık, ne yapılacak". Detaylı yayın adımları: `publishing.md`.
Son güncelleme: 2026-05-24.

---

## ✅ Tamamlananlar (kod tarafı)

### Çekirdek özellikler
- [x] OAuth bağlantı (chrome.identity) + ayarlar sayfası
- [x] Sheet oluştur / seç (artık uygulama-sahipli liste)
- [x] Sağ tık → overlay not kartı (imleç konumunda, closed Shadow DOM içinde)
- [x] Otomatik scrape: başlık, kanal, kanal linki, URL, izlenen/toplam süre
- [x] Not + çoklu etiket chip girişi (virgül / Tab / Enter)
- [x] Sheets'e satır ekleme (9 sütun, A:I)
- [x] "✓ Kaydedildi" kartın yerinde + 15 sn güvenlik ağı
- [x] Logo / ikon (spreadsheet + hücre içi play) — 16/32/48/128

### Güvenlik (denetim 2026-05-24 — TÜM bulgular kapalı)
- [x] #1 Sheets formül enjeksiyonu → `RAW` (commit 692efa9)
- [x] #3 innerHTML → textContent (commit 692efa9)
- [x] #4 mesaj sender doğrulama (commit dd51e02)
- [x] #5 host_permissions daraltma (commit dd51e02)
- [x] #6 https-only matches (commit dd51e02)
- [x] #7 not kartı closed Shadow DOM (commit 0fa731d)
- [x] #2 OAuth scope → drive.file + userinfo.email (commit 56c0f68)

### Yayın hazırlığı (artefaktlar)
- [x] PRIVACY.md (gizlilik politikası taslağı)
- [x] docs/publishing.md (adım adım yayın rehberi)
- [x] docs/store-listing.md (mağaza metni + izin gerekçeleri)
- [x] dist/yt2sheets-v0.1.0.zip (yüklemeye hazır paket)

### Commit geçmişi
`b0bdebd` scaffold · `692efa9` formula+innerHTML · `dd51e02` hardening ·
`ca6343e` icon · `0fa731d` shadow DOM · `8ba006a` scope plan ·
`56c0f68` scope reduction + publishing docs

---

## ⏳ Yapılacaklar (yayın süreci) — adım adım

> Çoğu Google Cloud / Web Store panelinde SENİN yapacağın işlem. Detay: `publishing.md`.

### 1. Yerel test (scope değişimi sonrası) — ÖNCE BU
- [ ] https://myaccount.google.com/permissions → eski izni kaldır
- [ ] `chrome://extensions` → reload, YouTube watch → F5
- [ ] Ayarlardan yeniden bağlan (consent'te yalnız Drive-dosya + email görünmeli)
- [ ] **Yeni sheet oluştur** → bir video kaydet → satır düşüyor mu?
- [ ] Not (`=1+1`) düz metin olarak yazılıyor mu? (formül değil)
- Not: eski seçili HARİCİ sheet artık yazılamaz → yeni oluşturmak gerekir.

### 2. Gizlilik politikası
- [ ] PRIVACY.md içinde `<destek-email>` (ve varsa ana sayfa) doldur
- [ ] Bir yere host et (GitHub Pages / Gist / kişisel site) → URL'yi not et

### 3. OAuth consent screen (Google Cloud Console)
- [ ] auth/branding: app adı, logo (icon128), destek + developer email, privacy URL
- [ ] Scope listesi yalnız `drive.file` + `userinfo.email` olmalı
- [ ] Publishing status: "Testing" → **"In production"**
- [ ] Doğrulama başvurusu (demo video hazırla: kurulum + sheet'e kaydetme)

### 4. Chrome Web Store
- [ ] Geliştirici hesabı aç ($5 tek seferlik)
- [ ] dist/*.zip yükle (draft) → atanan **extension ID**'yi not et
- [ ] OAuth client (Chrome Extension) → Application ID'yi bu ID ile güncelle
- [ ] (Gerekirse) store public key'i manifest'e `"key"` olarak ekle, yeniden paketle

### 5. Mağaza listesi + inceleme
- [ ] docs/store-listing.md'den açıklama/kategori/izin gerekçelerini gir
- [ ] En az 1 ekran görüntüsü ekle (1280x800)
- [ ] İncelemeye gönder (Web Store incelemesi + OAuth doğrulama paralel ilerler)

### Her yeni yüklemede
- [ ] manifest `version` artır
- [ ] dist zip'i yeniden oluştur (bkz. publishing.md → Paketleme)

---

## Sonraki ürün fikirleri (opsiyonel)
- Picker ile harici sheet seçimi (güvenlik planı Seçenek B — MV3 CSP araştırması)
- Sayfaya gömülü kalıcı buton, koyu tema, etiket autocomplete, çoklu sheet hedefi
