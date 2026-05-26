// Chrome service worker'da ortak katmanları yükle.
// (Firefox'ta background.scripts bunları zaten ayrı yükler; orada importScripts yok.)
if (typeof importScripts === 'function') {
  importScripts('auth.js', 'strings.js');
}

// Sağ tık menüsünü güncel dille (yeniden) oluştur
async function ensureMenu() {
  await loadLang();
  chrome.contextMenus.removeAll(() => {
    chrome.contextMenus.create({
      id: 'save-to-sheet',
      title: t('saveToSheet'),
      contexts: ['page'],
      documentUrlPatterns: ['https://www.youtube.com/watch*']
    });
  });
}

// ============================================================
// Kurulum: options'ı aç + sağ tık menüsünü oluştur
// ============================================================
chrome.runtime.onInstalled.addListener(() => {
  chrome.runtime.openOptionsPage();
  ensureMenu();
});

// Dil değişince sağ tık menüsünü güncelle
chrome.storage.onChanged.addListener((changes, area) => {
  if (area === 'sync' && changes.lang) ensureMenu();
});

// Extension ikonuna tıklanınca options'ı aç
chrome.action.onClicked.addListener(() => {
  chrome.runtime.openOptionsPage();
});

// ============================================================
// Sağ tık menüsü tıklanınca → content script'e kartı aç de
// ============================================================
chrome.contextMenus.onClicked.addListener((info, tab) => {
  if (info.menuItemId === 'save-to-sheet' && tab?.id) {
    chrome.tabs.sendMessage(tab.id, { action: 'openSaveCard' });
  }
});

// ============================================================
// Content script'ten gelen kaydetme isteği
// ============================================================
chrome.runtime.onMessage.addListener((msg, sender) => {
  if (sender.id !== chrome.runtime.id) return; // sadece kendi uzantımızdan gelen mesajları işle
  if (msg.action === 'saveRow') {
    const tabId = sender.tab?.id;
    // İş bitince sonucu tab'a ayrı mesajla push et (yanıt kanalı MV3'te güvenilmez)
    handleSaveRow(msg.data).then(
      () => { if (tabId) chrome.tabs.sendMessage(tabId, { action: 'saveResult', ok: true }); },
      (err) => { if (tabId) chrome.tabs.sendMessage(tabId, { action: 'saveResult', ok: false, error: err.message }); }
    );
  }
});

// getToken() ortak auth katmanından gelir (auth.js)

async function getSelectedSheet() {
  const { selectedSheet } = await chrome.storage.sync.get('selectedSheet');
  return selectedSheet;
}

// Append için hedef sekme adı gerek; seçilen sheet'in ilk sekmesini kullan
// (yeni oluşturulanlarda "Notlar", mevcut sheet'lerde farklı olabilir)
async function getFirstSheetTitle(token, spreadsheetId) {
  const res = await fetch(
    `https://sheets.googleapis.com/v4/spreadsheets/${spreadsheetId}?fields=sheets.properties.title`,
    { headers: { Authorization: `Bearer ${token}` } }
  );
  if (!res.ok) throw new Error(`Sheet bilgisi alınamadı: ${res.status}`);
  const data = await res.json();
  return data.sheets?.[0]?.properties?.title || 'Sayfa1';
}

// Sheet'in sonuna yeni satır ekle
async function appendRow(token, spreadsheetId, sheetTitle, row) {
  const range = encodeURIComponent(`${sheetTitle}!A:J`);
  const url = `https://sheets.googleapis.com/v4/spreadsheets/${spreadsheetId}` +
              `/values/${range}:append` +
              `?valueInputOption=RAW&insertDataOption=INSERT_ROWS`;
  const res = await fetch(url, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({ values: [row] })
  });
  if (!res.ok) throw new Error(`Satır eklenemedi: ${res.status}`);
}

// Kaydetme akışı (upsert): video sheet'te varsa güncelle, yoksa yeni satır ekle
async function handleSaveRow(data) {
  await loadLang();
  const selected = await getSelectedSheet();
  if (!selected) throw new Error(t('noSheet'));

  const token = await getToken(false);
  const sheetTitle = await getFirstSheetTitle(token, selected.id);
  const now = new Date().toLocaleString(t('dateLocale'));
  const statusText = t(data.status || 'statusOpened');

  // Bu video sheet'te zaten var mı? (URL sütunu = E)
  const rowNumber = await findRowByUrl(token, selected.id, sheetTitle, data.url);

  if (rowNumber) {
    // VAR → mevcut satırı oku; notu altına ekle, etiketleri birleştir, güncelle
    const old = await getRow(token, selected.id, sheetTitle, rowNumber);
    const row = [
      old[0] || now,                     // tarih: ilk kayıt tarihi korunur
      data.title || old[1] || '',
      data.channel || old[2] || '',
      data.channelUrl || old[3] || '',
      data.url,
      data.watchedTime || old[5] || '',  // en güncel izleme süresi
      data.totalTime || old[6] || '',
      mergeNote(old[7], data.note),       // eski notun altına ekle
      mergeTags(old[8], data.tags),       // etiketleri birleştir (tekrarsız)
      statusText
    ];
    await updateRow(token, selected.id, sheetTitle, rowNumber, row);
  } else {
    // YOK → yeni satır
    // Sütunlar: Tarih, Başlık, Kanal, Kanal Linki, URL, İzleme Süresi, Toplam Süre, Not, Etiketler, Durum
    const row = [
      now,
      data.title || '',
      data.channel || '',
      data.channelUrl || '',
      data.url || '',
      data.watchedTime || '',
      data.totalTime || '',
      data.note || '',
      data.tags || '',
      statusText
    ];
    await appendRow(token, selected.id, sheetTitle, row);
  }
}

// URL sütununda (E) bu videoyu ara → 1 tabanlı satır no (yoksa null)
async function findRowByUrl(token, spreadsheetId, sheetTitle, url) {
  const range = encodeURIComponent(`${sheetTitle}!E:E`);
  const res = await fetch(
    `https://sheets.googleapis.com/v4/spreadsheets/${spreadsheetId}/values/${range}`,
    { headers: { Authorization: `Bearer ${token}` } }
  );
  if (!res.ok) throw new Error(`Sheet okunamadı: ${res.status}`);
  const data = await res.json();
  const rows = data.values || [];
  for (let i = 0; i < rows.length; i++) {
    if (rows[i]?.[0] === url) return i + 1; // değerler 1. satırdan başlar (başlık dahil)
  }
  return null;
}

// Tek bir satırı oku (A:J) → hücre dizisi (boşsa [])
async function getRow(token, spreadsheetId, sheetTitle, rowNumber) {
  const range = encodeURIComponent(`${sheetTitle}!A${rowNumber}:J${rowNumber}`);
  const res = await fetch(
    `https://sheets.googleapis.com/v4/spreadsheets/${spreadsheetId}/values/${range}`,
    { headers: { Authorization: `Bearer ${token}` } }
  );
  if (!res.ok) throw new Error(`Satır okunamadı: ${res.status}`);
  const data = await res.json();
  return (data.values && data.values[0]) || [];
}

// Var olan satırı güncelle (A:J)
async function updateRow(token, spreadsheetId, sheetTitle, rowNumber, row) {
  const range = encodeURIComponent(`${sheetTitle}!A${rowNumber}:J${rowNumber}`);
  const res = await fetch(
    `https://sheets.googleapis.com/v4/spreadsheets/${spreadsheetId}/values/${range}` +
    `?valueInputOption=RAW`,
    {
      method: 'PUT',
      headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({ values: [row] })
    }
  );
  if (!res.ok) throw new Error(`Satır güncellenemedi: ${res.status}`);
}

// Eski notun altına yeni notu ekle (boşları atla, aynısını tekrar ekleme)
function mergeNote(oldNote, addition) {
  const a = (oldNote || '').trim();
  const b = (addition || '').trim();
  if (!b) return a;
  if (!a) return b;
  if (a === b || a.endsWith(b)) return a;
  return `${a}\n${b}`;
}

// Etiketleri birleştir (virgülle ayrılmış, tekrarsız)
function mergeTags(oldTags, newTags) {
  const split = (s) => (s || '').split(',').map((x) => x.trim()).filter(Boolean);
  const merged = split(oldTags);
  for (const tag of split(newTags)) {
    if (!merged.includes(tag)) merged.push(tag);
  }
  return merged.join(', ');
}
