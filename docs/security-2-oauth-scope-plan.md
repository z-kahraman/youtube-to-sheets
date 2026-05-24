# Güvenlik #2 — OAuth scope daraltma planı (yayın öncesi)

> Durum: PLANLANDI, uygulanmadı. Yayın (publish) hazırlığında ele alınacak.
> İlgili: güvenlik denetimi takibi (memory: project-youtube-to-sheets-security).

## Sorun
`manifest.json` şu an `https://www.googleapis.com/auth/spreadsheets` scope'unu istiyor —
bu, kullanıcının **tüm** Google Sheets dosyalarına tam okuma/yazma yetkisi demek (aşırı geniş,
least-privilege ihlali). Ayrıca `drive.metadata.readonly` ile tüm sheet'ler listeleniyor.

Hedef: `spreadsheets` (ve `drive.metadata.readonly`) scope'larını kaldırıp yalnızca
**`drive.file`** (uygulamanın oluşturduğu veya kullanıcının Picker ile açıkça seçtiği
dosyalarla sınırlı) + `userinfo.email` ile çalışmak.

## Neden tek satırlık fix değil
- `drive.file`, sadece **uygulamanın oluşturduğu** ya da **Google Picker ile kullanıcının
  seçtiği** dosyalara erişim verir.
- "Yeni sheet oluştur" akışı (`options.js` `createSheet`) zaten uygulama oluşturduğu için
  `drive.file` ile **sorunsuz** çalışır.
- "Dışarıdan mevcut sheet seç" akışı (`listSheets` dropdown + `spreadsheets` ile yazma)
  geniş scope'a bağımlı. Bunu `drive.file`'a indirmek için sheet seçimini **Google Picker**'a
  taşımak gerekir.

## İki yaklaşım

### Seçenek A — ÖNERİLEN: sadece uygulama-sahipli sheet'ler (Picker YOK)
- Scope'ları `drive.file` + `userinfo.email`'e indir.
- "Dışarıdan herhangi bir sheet'i tara/seç" özelliğini kaldır.
- Akış: kullanıcı ya yeni sheet oluşturur ya da uygulamanın daha önce oluşturduğu
  sheet'ler arasından seçer (oluşturulan sheet id'leri `chrome.storage.sync`'te tutulur).
- **Artı:** En basit, en iyi gizlilik, MV3 CSP derdi yok, Picker/API key/app ID gerekmez,
  Google "restricted scope" güvenlik denetiminden büyük ihtimalle muaf (`drive.file` en az
  hassas Drive scope'u).
- **Eksi:** Kullanıcı, uygulama dışında oluşturulmuş hazır bir sheet'i hedef seçemez.
  (Kişisel not aracı için genelde kabul edilebilir.)

### Seçenek B — tam özellik: Google Picker ile mevcut sheet seçimi
- Scope: `drive.file` + `userinfo.email`. Kullanıcı Picker'da bir sheet seçince o **tek
  dosyaya** erişim `drive.file` altında verilir.
- Gerekenler: Picker API JS yükleme, **API key**, **app ID (proje numarası)**, OAuth token.
- **Ana risk / açık soru — MV3 CSP:** Uzantı sayfalarında varsayılan `script-src 'self'`
  uzak script yüklemeyi (Picker'ın `apis.google.com/js/api.js`) engeller. Çözüm araştırması
  gerekir: Picker'ı uzantı sayfası yerine ayrı bir web sayfasında/popup'ta barındırmak,
  veya desteklenen bir gömme yöntemi bulmak. Bu, eforun ve riskin büyük kısmı.
- **Artı:** "Herhangi bir mevcut sheet" özelliği korunur.
- **Eksi:** Yüksek karmaşıklık, ek altyapı (API key, hosted page), CSP çözümü belirsiz.

## Önerilen karar
Kişisel/gizlilik öncelikli bir araç için **Seçenek A**. Picker (B) yalnızca kullanıcılar
uygulama-dışı hazır sheet'leri hedeflemek isterse tekrar değerlendirilsin.

## Uygulama adımları (Seçenek A)
1. `manifest.json` `oauth2.scopes`: `spreadsheets` ve `drive.metadata.readonly` sil;
   `drive.file` + `userinfo.email` kalsın.
2. `options.js`: `listSheets` (Drive list) kaldır; dropdown'ı "uygulamanın oluşturduğu
   sheet'ler" listesiyle değiştir (storage'da tutulan id/isim listesi). `createSheet`
   sonrası bu listeye ekle.
3. `options.html`: "Mevcut bir sheet seç" Drive-list arayüzünü güncelle.
4. `chrome.storage.sync` şeması: `selectedSheet` yanına `createdSheets: [{id,name}]` ekle.
5. Host izinleri: `drive/v3/files` list çağrısı kalkacağı için ilgili host gözden geçir
   (yine de `www.googleapis.com` userinfo için gerekli).

## Migration (kritik)
Mevcut kullanıcıların `selectedSheet`'i uygulama-dışı bir sheet'i gösteriyor olabilir →
yeni scope ile uygulama o dosyaya **yazamaz**. Sürüm yükseltmede:
- Seçili sheet'e ilk yazma 403 alırsa kullanıcıyı uyar: "Bu sheet'e erişim için yeniden
  seç/oluştur." Eski seçimi temizle.

## Doğrulama (uygulanınca)
1. Eski token'ı revoke + `removeCachedAuthToken`, yeniden bağlan.
2. Consent ekranı yalnızca Drive (dosya-bazlı) + email göstermeli; "tüm sheet'ler" yetkisi
   görünmemeli.
3. Yeni sheet oluştur → append çalışmalı.
4. "Tüm sheet'leri listele" özelliğinin kalktığını doğrula.
5. Migration: eski harici sheet seçiliyken davranışı test et.
