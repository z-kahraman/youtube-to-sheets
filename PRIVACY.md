🇬🇧 [English](PRIVACY.en.md) | 🇹🇷 **Türkçe**

# Gizlilik Politikası — YouTube to Sheets

**Son güncelleme:** 2026-05-24

## Özet
YouTube to Sheets, izlediğin YouTube videolarını notlarınla birlikte **kendi** Google
Sheets dosyana kaydetmeni sağlayan bir tarayıcı uzantısıdır. Verilerin doğrudan
tarayıcından Google'a gider; **bizim hiçbir sunucumuza gönderilmez, saklanmaz veya
üçüncü taraflarla paylaşılmaz.**

## Toplanan / işlenen veriler
- **Google hesap e-postan:** Yalnızca ayarlar ekranında "bağlı hesap" olarak göstermek için
  okunur. Hiçbir yere kaydedilmez.
- **Video bilgileri:** Kaydet dediğinde o anki videonun başlığı, kanalı, kanal linki,
  video URL'si, izlenen/toplam süresi.
- **Senin girdiğin içerik:** Not ve etiketler.

Bu veriler yalnızca **senin seçtiğin Google Sheets dosyana** satır olarak yazılır.

## Veriler nereye gider
- Tüm istekler doğrudan tarayıcından Google API'lerine (`googleapis.com`) gider.
- Geliştiriciye ait veya üçüncü taraf bir sunucu **yoktur**. Analitik, izleme, reklam
  **yoktur**.

## Yerel depolama
- `storage.sync`: yalnızca seçili/oluşturulan sheet'lerin kimlik ve adları tutulur.
- OAuth erişim jetonu: Chrome'da `identity` servisi yönetir; Firefox'ta kısa ömürlü
  jeton yerel depoda (`storage.local`) süresiyle tutulur. Hiçbir sunucuya gönderilmez.

## Kullanılan izinler (Google OAuth scope'ları)
- `drive.file`: **Yalnızca** bu uygulamanın oluşturduğu Google Sheets dosyalarına erişir.
  Diğer dosyalarına erişemez.
- `userinfo.email`: Bağlı hesabın e-postasını göstermek için.

## Veri saklama ve silme
- Uzantı veri saklamadığı için silinecek sunucu verisi yoktur.
- Bağlantıyı kesmek: ayarlardan "Bağlantıyı kes" → jeton iptal edilir ve yerel seçim
  temizlenir. İzni tümüyle kaldırmak için: https://myaccount.google.com/permissions

## İletişim
Sorular için: zaferkahraman123@gmail.com
