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

## ✅ Tamamlanan (bu aşama)
- [x] GitHub public repo + push (MIT) — github.com/z-kahraman/-youtube-to-sheets
- [x] İki dilli README (EN birincil + TR)
- [x] Cross-browser: auth.js, manifest.firefox.json, build.sh, docs/firefox-setup.md
- [x] Firefox eklentisi lokalde ÇALIŞIYOR (Web OAuth client + redirect URI `/` dahil)
- [x] Bug fix: not yazarken space=duraklat (kart içi key olayları stopPropagation)

## 📌 Bugün nerede kaldık (2026-05-24) + YARIN

Bugün yapılanlar:
- i18n eklendi (TR/EN, strings.js, dil seçici, dile bağlı sheet adı/başlık) → **v0.2.0**.
- Firefox manifest: strict_min_version **115** (FF 136'da yüklensin diye 142→115),
  data_collection_permissions kaldırıldı.
- EN ekran görüntüleri üretildi; AMO listesi dolduruluyor (açıklama + EN görseller +
  caption'lar + Additional Details: Tags + Homepage=GitHub).
- Google OAuth: "In production" (drive.file sensitive, doğrulanmamış → 100 kullanıcı cap +
  "unverified" uyarısı; kişisel kullanım için yeterli, CASA gerekmez).

**YARIN yapılacaklar (öncelik sırası):**
1. Firefox'ta v0.2.0'ı yükle (`./build.sh` → about:debugging → Load Temporary Add-on
   `dist/yt2sheets-firefox.zip`) ve TEST ET: dil seçici TR/EN, EN'de yeni sheet başlıkları
   "Date, Title...", sağ tık menüsü dile göre, space yazımı.
2. Test tamamsa AMO listesini bitir / v0.2.0'ı yükle ve incelemeye gönder.
3. (Opsiyonel) Manage Listing'de Türkçe locale ekle: TR Summary/Description + TR ekran
   görüntüleri (screenshots/*-tr.png).
4. (Opsiyonel) Chrome'da v0.2.0'ı reload edip i18n'i orada da bir kez doğrula.

## ⏳ Kalan işler

### Senin yapacakların
- [ ] **Test doğrula:** Chrome lokal hâlâ çalışıyor mu (auth.js refactor sonrası);
      Firefox'ta space artık yazıyor mu; Firefox uçtan uca kaydetme.
- [x] **PRIVACY.md** → iletişim e-postası dolduruldu (zaferkahraman123@gmail.com).
- [x] **AMO yayını:** v0.1.0 gönderildi (2026-05-24, listed, MIT). İnceleme/yayın bekleniyor
      (~24s veya manuel inceleme). Validation geçti (0 hata).
- [ ] Beklerken "Manage Listing": ekran görüntüleri (screenshots/) + İngilizce çeviri ekle.
- [ ] (herkese açık istersen) Google consent screen → "In production" + doğrulama.
      İnceleme "Google'a bağlanamadım" derse: reviewer e-postasını Google test users'a ekle.
- [x] AMO/README için ekran görüntüleri (screenshots/note-card.png, options.png) — headless render. Mağaza için canlı YouTube üzerinde çekim daha iyi olur.
- [ ] (opsiyonel) Repo adındaki baştaki `-`'yi at: GitHub → Settings → Rename → `youtube-to-sheets`. Sonra remote güncellenecek.

## Statik test sonuçları (2026-05-24, modern Node v22)
- [x] JS sözdizimi (auth/background/content/options) — hepsi OK
- [x] manifest.json + manifest.firefox.json — geçerli JSON
- [x] build.sh → chrome zip (service_worker+oauth2+doğru scope) / firefox zip (scripts+gecko, oauth2 yok)
- Canlı tarayıcı E2E (OAuth + YouTube) ekran/etkileşim gerektirir → kullanıcı doğrular.

### Ertelenenler (şimdilik yapılmayacak)
- Picker ile mevcut sheet seçimi (Seçenek B) — KARAR: şimdilik kalsın. createdSheets
  tarayıcı başına ayrı; eski notlar Sheets'te doğrudan açılır.
- Firefox auth: PKCE auth-code flow (implicit yerine) → token yenileme; şu an token ~1s.
- Polish: koyu tema, sayfaya gömülü buton, etiket autocomplete, çoklu sheet hedefi.
