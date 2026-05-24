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

## 🔁 Strateji (2026-05-24 güncellemesi)
- **Chrome:** YAYINLANMAYACAK — yalnızca lokal kullanım ($5 Web Store ücreti ertelendi).
  `docs/publishing.md` ve `docs/store-listing.md` ileride lazım olursa duruyor.
- **Hedef yayın:** Firefox (AMO, ücretsiz).
- **Açık kaynak:** GitHub (MIT).
- Chrome auth'una (getAuthToken) dokunulmayacak; Firefox için ayrı auth eklenecek.

## ⏳ Yapılacaklar — adım adım

### A. GitHub açık kaynak
- [x] LICENSE (MIT) + README
- [ ] GitHub'da public repo aç + push (gh yok → manuel komutlar verilecek)

### B. Firefox portu (kod — ben yapıyorum)
- [ ] Auth soyutlama: Chrome getAuthToken korunur, Firefox için launchWebAuthFlow eklenir
- [ ] `manifest.firefox.json` (background.scripts, gecko.id, oauth2 yok)
- [ ] Build script (chrome/firefox ayrı zip)
- [ ] `docs/firefox-setup.md`

### C. Firefox yayın (senin yapacakların — rehber: docs/firefox-setup.md)
- [ ] Google Cloud'da **Web application** OAuth client oluştur
- [ ] Firefox'ta uzantıyı yükle → `browser.identity.getRedirectURL()` değerini al →
      Google Cloud'da "Authorized redirect URI" olarak ekle
- [ ] AMO geliştirici hesabı (ücretsiz) → Firefox zip'ini yükle → incele

### D. Lokal test (Chrome — scope değişimi sonrası)
- [ ] myaccount.google.com/permissions → eski izni kaldır
- [ ] reload + F5 → yeniden bağlan → yeni sheet oluştur → kaydet
- [ ] Not `=1+1` düz metin mi? (formül değil)
- Not: eski HARİCİ sheet artık yazılamaz → yeni oluştur.

---

## Sonraki ürün fikirleri (opsiyonel)
- Picker ile harici sheet seçimi (güvenlik planı Seçenek B — MV3 CSP araştırması)
- Sayfaya gömülü kalıcı buton, koyu tema, etiket autocomplete, çoklu sheet hedefi
