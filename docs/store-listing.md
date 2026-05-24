# Chrome Web Store listeleme metni (taslak)

## Kategori
Productivity (Verimlilik)

## Kısa açıklama (max ~132 karakter)
İzlediğin YouTube videolarını not ve etiketlerle tek tıkla kendi Google Sheets dosyana kaydet.

## Detaylı açıklama
YouTube to Sheets, izlediğin videoları düzenli tutmanın en hızlı yolu.

İzlerken bir videoyu kaydetmek istediğinde sayfaya sağ tıkla → "Sheet'e kaydet" de.
Açılan küçük kartta videonun başlığı, kanalı, süresi otomatik dolu gelir; sen sadece
notunu ve etiketlerini ekleyip kaydet. Satır anında kendi Google Sheets dosyana düşer.

Özellikler:
• Sağ tık ile hızlı kaydetme (YouTube watch sayfalarında)
• Başlık, kanal, kanal linki, video URL'si, izlenen/toplam süre otomatik
• Not + çoklu etiket (virgül/Tab ile)
• Kendi Google Sheets dosyanı oluştur veya daha önce oluşturduklarından seç

Gizlilik öncelikli: Verilerin doğrudan tarayıcından Google'a gider. Hiçbir üçüncü taraf
sunucu, analitik veya reklam yok. Uzantı yalnızca kendi oluşturduğu Sheets dosyalarına
erişir (drive.file).

## Tek amaç (single purpose) beyanı
Uzantının tek amacı: YouTube videolarının bilgilerini ve kullanıcının notlarını
kullanıcının kendi Google Sheets dosyasına kaydetmek.

## İzin gerekçeleri (permission justifications)
- **identity:** Kullanıcının Google hesabıyla OAuth üzerinden bağlanıp Sheets API'ye
  erişebilmesi için.
- **storage:** Seçili/oluşturulan sheet'in kimliğini ve adını saklamak için.
- **contextMenus:** YouTube sayfasında "Sheet'e kaydet" sağ tık menüsünü eklemek için.
- **host: googleapis.com:** Google Sheets'e satır eklemek ve hesap e-postasını okumak için
  Google API çağrıları.
- **content script (youtube.com/watch):** Video bilgisini okuyup not kartını göstermek için.
- **Scope drive.file:** Yalnızca uygulamanın oluşturduğu Sheets dosyalarına yazmak için.
- **Scope userinfo.email:** Bağlı hesabı ayarlar ekranında göstermek için.

## Görseller (hazırlanacak)
- İkon 128px ✓ (icons/icon128.png)
- En az 1 ekran görüntüsü (1280x800): not kartı açık YouTube sayfası + örnek sheet.
