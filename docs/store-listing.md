# Store listing copy (AMO / Chrome Web Store)

Ready-to-paste listing text. English is the default locale; the Turkish block is for the
Turkish locale (AMO Manage Listing → add locale).

## Category
- AMO: there's no "Productivity"; closest fits are **Photos, Music & Videos** and **Bookmarks**.
- Chrome Web Store: **Productivity**.

## Single-purpose statement
The extension's single purpose: save a YouTube video's metadata and the user's notes to the
user's own Google Sheet.

## Permission justifications
- **identity:** to connect the user's Google account via OAuth and call the Sheets API.
- **storage:** to store the selected/created sheet's id and name (and language preference).
- **contextMenus:** to add the "Save to Sheet" right-click menu on YouTube pages.
- **host googleapis.com:** Google API calls to append rows to Sheets and read the account email.
- **content script (youtube.com/watch):** to read video info and show the note card.
- **scope drive.file:** to write only to Sheets files the extension created.
- **scope userinfo.email:** to show the connected account on the settings page.

## Images
- Icon 128px ✓ (`icons/icon128.png`)
- Screenshots: `screenshots/*-en.png` (English locale), `screenshots/*-tr.png` (Turkish locale).

---

## English (default locale)

**Short summary (≤132 chars):**
```
Save the YouTube videos you watch — with notes and tags — to your own Google Sheet in one click.
```

**Description:**
```
YouTube to Sheets is the fastest way to keep the videos you watch organized.

While watching, right-click the page → "Save to Sheet". A small card opens with the video's title, channel and duration pre-filled — just add your note and tags and save. The row is appended to your own Google Sheet instantly.

Features:
• Quick save via right-click (on YouTube watch pages)
• Auto-filled: title, channel, channel link, video URL, watched/total time
• Note + multiple tags (comma or Tab)
• Create your own Google Sheet or pick one you created before

Privacy-first: your data goes straight from your browser to Google. No third-party servers, analytics, or ads. The extension only accesses Sheets it created.

Open source (MIT): https://github.com/z-kahraman/youtube-to-sheets
```

---

## Türkçe (Turkish locale)

**Kısa açıklama (≤132 karakter):**
```
İzlediğin YouTube videolarını not ve etiketlerle tek tıkla kendi Google Sheets dosyana kaydet.
```

**Açıklama:**
```
YouTube to Sheets, izlediğin videoları düzenli tutmanın en hızlı yolu.

İzlerken bir videoyu kaydetmek istediğinde sayfaya sağ tıkla → "Sheet'e kaydet" de. Açılan küçük kartta videonun başlığı, kanalı ve süresi otomatik dolu gelir; sen sadece notunu ve etiketlerini ekleyip kaydet. Satır anında kendi Google Sheets dosyana düşer.

Özellikler:
• Sağ tık ile hızlı kaydetme (YouTube izleme sayfalarında)
• Başlık, kanal, kanal linki, video URL'si, izlenen/toplam süre otomatik
• Not + çoklu etiket (virgül veya Tab)
• Kendi Google Sheets dosyanı oluştur veya daha önce oluşturduklarından seç

Gizlilik öncelikli: Verilerin doğrudan tarayıcından Google'a gider. Üçüncü taraf sunucu, analitik veya reklam yok. Uzantı yalnızca kendi oluşturduğu Sheets dosyalarına erişir.

Açık kaynak (MIT): https://github.com/z-kahraman/youtube-to-sheets
```
